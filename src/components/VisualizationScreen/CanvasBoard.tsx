import { forwardRef, useEffect, useRef, useCallback, useImperativeHandle } from 'react';
import { useAppStore } from '../../store';
import { boardCells, pendingCells } from '../../engine/simulation';
import type { PlacedCell } from '../../types';

export interface CanvasBoardHandle {
  resetCanvas: () => void;
  downloadPng: (fileName?: string) => void;
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

  const panXRef = useRef(0);
  const panYRef = useRef(0);
  const dragRef = useRef<{ active: boolean; x: number; y: number }>({
    active: false,
    x: 0,
    y: 0,
  });

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
      const maxPan = visibleWidth;
      const panX = Math.max(-maxPan, Math.min(maxPan, panXRef.current));
      const panY = Math.max(-maxPan, Math.min(maxPan, panYRef.current));
      const rawSx = originX + panX - halfW;
      const rawSy = originY + panY - halfH;
      const rawSw = visible.width / zoom;
      const rawSh = visible.height / zoom;

      const sx = Math.max(0, rawSx);
      const sy = Math.max(0, rawSy);
      const sw = Math.max(0, Math.min(rawSw - (sx - rawSx), offSize - sx));
      const sh = Math.max(0, Math.min(rawSh - (sy - rawSy), offSize - sy));
      const dx = Math.max(0, (sx - rawSx) * zoom);
      const dy = Math.max(0, (sy - rawSy) * zoom);
      const dw = sw * zoom;
      const dh = sh * zoom;

      ctx.imageSmoothingEnabled = false;
      ctx.fillStyle = '#080a10';
      ctx.fillRect(0, 0, visible.width, visible.height);
      if (sw > 0 && sh > 0) {
        ctx.drawImage(off, sx, sy, sw, sh, dx, dy, dw, dh);
      }
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
  }, [displayMode, zoom, offSize, originX, originY, visibleWidth]);

  useImperativeHandle(
    ref,
    () => ({
      resetCanvas: () => {
        initOffscreen();
        blit();
      },
      downloadPng: (fileName) => {
        const canvas = offscreenRef.current;
        if (!canvas) return;
        const link = document.createElement('a');
        link.download = fileName || `knights-board-${Date.now()}.png`;
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

  // Re-init when board geometry changes
  useEffect(() => {
    panXRef.current = 0;
    panYRef.current = 0;
    initOffscreen();
    blit();
  }, [initOffscreen, blit]);

  // Drag-to-pan in 1:1 mode
  useEffect(() => {
    const canvas = visibleCanvasRef.current;
    if (!canvas || displayMode !== '1:1') return;

    const onPointerDown = (e: PointerEvent) => {
      dragRef.current = { active: true, x: e.clientX, y: e.clientY };
      canvas.setPointerCapture(e.pointerId);
      canvas.style.cursor = 'grabbing';
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!dragRef.current.active) return;
      const dx = e.clientX - dragRef.current.x;
      const dy = e.clientY - dragRef.current.y;
      dragRef.current.x = e.clientX;
      dragRef.current.y = e.clientY;

      panXRef.current -= dx / zoom;
      panYRef.current -= dy / zoom;
      blit();
    };

    const stopDrag = (pointerId?: number) => {
      if (dragRef.current.active) {
        dragRef.current.active = false;
        if (typeof pointerId === 'number' && canvas.hasPointerCapture(pointerId)) {
          canvas.releasePointerCapture(pointerId);
        }
      }
      canvas.style.cursor = 'grab';
    };

    const onPointerUp = (e: PointerEvent) => stopDrag(e.pointerId);
    const onPointerCancel = (e: PointerEvent) => stopDrag(e.pointerId);

    canvas.style.cursor = 'grab';
    canvas.addEventListener('pointerdown', onPointerDown);
    canvas.addEventListener('pointermove', onPointerMove);
    canvas.addEventListener('pointerup', onPointerUp);
    canvas.addEventListener('pointercancel', onPointerCancel);

    return () => {
      stopDrag();
      canvas.style.cursor = 'default';
      canvas.removeEventListener('pointerdown', onPointerDown);
      canvas.removeEventListener('pointermove', onPointerMove);
      canvas.removeEventListener('pointerup', onPointerUp);
      canvas.removeEventListener('pointercancel', onPointerCancel);
    };
  }, [displayMode, zoom, blit]);

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
