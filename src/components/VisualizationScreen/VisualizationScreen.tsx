import { useEffect, useMemo, useRef } from 'react';
import { useAppStore } from '../../store';
import {
  initAndStart,
  pauseSimulation,
  startSimulation,
  stepOnce,
  resetSimulation,
} from '../../engine/simulation';
import { PIECE_CATALOG } from '../../engine/catalog';
import CanvasBoard from './CanvasBoard';
import type { CanvasBoardHandle } from './CanvasBoard';
import ControlsPanel from './ControlsPanel';
import StatsPanel from './StatsPanel';

function slugify(value: string): string {
  const slug = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return slug || 'piece';
}

export default function VisualizationScreen() {
  const setScreen = useAppStore((s) => s.setScreen);
  const army = useAppStore((s) => s.army);
  const customTypes = useAppStore((s) => s.customTypes);
  const visibleWidth = useAppStore((s) => s.visibleWidth);
  const canvasRef = useRef<CanvasBoardHandle>(null);

  const downloadFileName = useMemo(() => {
    if (army.length === 0) return 'knights-board.png';

    const allTypes = [...PIECE_CATALOG, ...customTypes];
    const colorTokens = new Map<string, string>();
    let colorIndex = 1;

    const parts = army.map((piece) => {
      const typeName = allTypes.find((t) => t.id === piece.typeId)?.name ?? piece.typeId;
      let colorToken = colorTokens.get(piece.color);
      if (!colorToken) {
        colorToken = `c${colorIndex}`;
        colorTokens.set(piece.color, colorToken);
        colorIndex++;
      }
      return `${slugify(typeName)}_${colorToken}`;
    });

    // Ajoute la taille du board (radius) dans le nom
    return `${parts.join('_')}_s${visibleWidth}.png`;
  }, [army, customTypes, visibleWidth]);

  useEffect(() => {
    initAndStart();
    return () => {
      pauseSimulation();
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-[#0f1117] text-slate-200 overflow-hidden">
      {/* Header */}
      <header className="border-b border-slate-800 px-4 sm:px-6 py-3 flex items-center gap-3 shrink-0">
        <button
          type="button"
          onClick={() => {
            resetSimulation();
            canvasRef.current?.resetCanvas();
            setScreen('setup');
          }}
          className="text-slate-400 hover:text-slate-200 transition-colors text-sm flex items-center gap-1"
        >
          ← Back
        </button>
        <span className="text-slate-700">|</span>
        <span className="text-xl">♞</span>
        <span className="font-bold tracking-tight">Knights</span>
        <span className="ml-auto">
          <StatsPanel />
        </span>
      </header>

      {/* Main layout: canvas + controls */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Canvas area */}
        <div className="flex-1 flex items-center justify-center overflow-hidden bg-[#080a10] p-2">
          <CanvasBoard ref={canvasRef} />
        </div>

        {/* Controls sidebar */}
        <aside className="lg:w-64 border-t lg:border-t-0 lg:border-l border-slate-800 p-4 flex flex-col gap-4 overflow-y-auto shrink-0">
          <ControlsPanel
            onStart={startSimulation}
            onPause={pauseSimulation}
            onStep={stepOnce}
            onReset={() => {
              resetSimulation();
              canvasRef.current?.resetCanvas();
            }}
            onDownloadPng={() => canvasRef.current?.downloadPng(downloadFileName)}
          />
        </aside>
      </div>
    </div>
  );
}
