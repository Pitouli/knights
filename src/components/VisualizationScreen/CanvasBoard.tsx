import { forwardRef, useEffect, useRef, useCallback, useImperativeHandle } from 'react';
import { useAppStore } from '../../store';
import { boardCells, pendingCells } from '../../engine/simulation';
import type { PlacedCell } from '../../types';

export interface CanvasBoardHandle {
  resetCanvas: () => void;
  downloadPng: () => void;
}

/**
 * CanvasBoard renders cells placed by the simulation engine.
 *
 * Strategy:
 *  - An offscreen canvas holds the full "infinite" board at 1px = 1 cell.
 *  - A visible canvas either shows it 1:1 (+ zoom scale) or scaled to fit.
 *  - A RAF loop flushes `pendingCells` to the offscreen canvas, then blits.
 */
const CanvasBoard = forwardRef<CanvasBoardHandle>(function CanvasBoard(_, ref) {
  const containerRef = useRef<HTMLDivElement>(null);
  const visibleCanvasRef = useRef<HTMLCanvasElement>(null);
  const offscreenRef = useRef<HTMLCanvasElement | null>(null);

  const visibleWidth = useAppStore((s) => s.visibleWidth);
  const displayMode = useAppStore((s) => s.displayMode);
  const zoom = useAppStore((s) => s.zoom);

  // The offscreen canvas is 2*visibleWidth+1 square to have plenty of room
  const offSize = visibleWidth * 2 + 1;
  // The logical origin on the offscreen canvas
  const originX = visibleWidth;
  const originY = visibleWidth;

  // Initialize or resize offscreen canvas, repaint all cells
  const initOffscreen = useCallback(() => {
    const off = document.createElement('canvas');
    off.width = offSize;
    off.height = offSize;
    const ctx = off.getContext('2d');
    if (!ctx) return;
    ctx.fillStyle = '#080a10';
    ctx.fillRect(0, 0, offSize, offSize);
    // Repaint all known cells
    for (const cell of boardCells) {
      const px = cell.x + originX;
      const py = cell.y + originY;
      if (px >= 0 && py >= 0 && px < offSize && py < offSize) {
        ctx.fillStyle = cell.color;
        ctx.fillRect(px, py, 1, 1);
      }
    }
    offscreenRef.current = off;
  }, [offSize, originX, originY]);

  // Paint a batch of cells to offscreen
  const paintCells = useCallback(
    (cells: PlacedCell[]) => {
      const off = offscreenRef.current;
      if (!off) return;
      const ctx = off.getContext('2d');
      if (!ctx) return;
      for (const cell of cells) {
        const px = cell.x + originX;
        const py = cell.y + originY;
        if (px >= 0 && py >= 0 && px < offSize && py < offSize) {
          ctx.fillStyle = cell.color;
          ctx.fillRect(px, py, 1, 1);
        }
      }
    },
    [offSize, originX, originY],
  );

  // Blit offscreen → visible canvas
  const blit = useCallback(() => {
    const visible = visibleCanvasRef.current;
    const off = offscreenRef.current;
    if (!visible || !off) return;
    const ctx = visible.getContext('2d');
    if (!ctx) return;

    if (displayMode === '1:1') {
      // Draw centered region of the offscreen at zoom
      const halfW = Math.floor(visible.width / 2 / zoom);
      const halfH = Math.floor(visible.height / 2 / zoom);
      const sx = originX - halfW;
      const sy = originY - halfH;
      const sw = visible.width / zoom;
      const sh = visible.height / zoom;
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(off, sx, sy, sw, sh, 0, 0, visible.width, visible.height);
    } else {
      // Fit to screen: draw full offSize area scaled to visible
      const size = Math.min(visible.width, visible.height);
      const destX = (visible.width - size) / 2;
      const destY = (visible.height - size) / 2;

      if (size >= offSize) {
        // Upscale: pixelated
        ctx.imageSmoothingEnabled = false;
        ctx.fillStyle = '#080a10';
        ctx.fillRect(0, 0, visible.width, visible.height);
        ctx.drawImage(off, 0, 0, offSize, offSize, destX, destY, size, size);
      } else {
        // Downscale: use smoothing for quality
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.fillStyle = '#080a10';
        ctx.fillRect(0, 0, visible.width, visible.height);
        ctx.drawImage(off, 0, 0, offSize, offSize, destX, destY, size, size);
      }
    }
  }, [displayMode, zoom, offSize, originX, originY]);

  useImperativeHandle(
    ref,
    () => ({
      resetCanvas: () => {
        initOffscreen();
        blit();
      },
      downloadPng: () => {
        const canvas = visibleCanvasRef.current;
        if (!canvas) return;
        const link = document.createElement('a');
        link.download = `knights-board-${Date.now()}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
      },
    }),
    [initOffscreen, blit],
  );

  // Resize visible canvas to its container
  const resizeVisible = useCallback(() => {
    const container = containerRef.current;
    const canvas = visibleCanvasRef.current;
    if (!container || !canvas) return;
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;
  }, []);

  // Initial setup
  useEffect(() => {
    resizeVisible();
    initOffscreen();

    const handleResize = () => {
      resizeVisible();
      blit();
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [resizeVisible, initOffscreen, blit]);

  // Re-init when board geometry changes or when a reset is requested
  useEffect(() => {
    initOffscreen();
    blit();
  }, [initOffscreen, blit]);

  // RAF loop
  useEffect(() => {
    let rafId: number;

    function tick() {
      if (pendingCells.length > 0) {
        const batch = pendingCells.splice(0, pendingCells.length);
        paintCells(batch);
        blit();
      }
      rafId = requestAnimationFrame(tick);
    }

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [paintCells, blit]);

  return (
    <div ref={containerRef} className="w-full h-full">
      <canvas ref={visibleCanvasRef} className="w-full h-full" />
    </div>
  );
});

export default CanvasBoard;
