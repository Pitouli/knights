import { useEffect, useRef } from 'react';
import { useAppStore } from '../../store';
import {
  initAndStart,
  pauseSimulation,
  startSimulation,
  stepOnce,
  resetSimulation,
} from '../../engine/simulation';
import CanvasBoard from './CanvasBoard';
import ControlsPanel from './ControlsPanel';
import StatsPanel from './StatsPanel';

export default function VisualizationScreen() {
  const setScreen = useAppStore((s) => s.setScreen);
  const started = useRef(false);

  useEffect(() => {
    if (!started.current) {
      started.current = true;
      initAndStart();
    }
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
            started.current = false;
            setScreen('setup');
          }}
          className="text-slate-400 hover:text-slate-200 transition-colors text-sm flex items-center gap-1"
        >
          ← Retour
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
          <CanvasBoard />
        </div>

        {/* Controls sidebar */}
        <aside className="lg:w-64 border-t lg:border-t-0 lg:border-l border-slate-800 p-4 flex flex-col gap-4 overflow-y-auto shrink-0">
          <ControlsPanel
            onStart={startSimulation}
            onPause={pauseSimulation}
            onStep={stepOnce}
            onReset={() => {
              resetSimulation();
              started.current = true;
              initAndStart();
            }}
          />
        </aside>
      </div>
    </div>
  );
}
