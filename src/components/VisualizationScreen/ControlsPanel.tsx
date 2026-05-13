import { useAppStore } from '../../store';

interface Props {
  onStart: () => void;
  onPause: () => void;
  onStep: () => void;
  onReset: () => void;
}

const SPEEDS = [
  { label: '×1', value: 1 },
  { label: '×10', value: 10 },
  { label: '×50', value: 50 },
  { label: '×200', value: 200 },
  { label: '×1000', value: 1000 },
];

export default function ControlsPanel({ onStart, onPause, onStep, onReset }: Props) {
  const {
    isRunning,
    speed,
    setSpeed,
    visibleWidth,
    setVisibleWidth,
    displayMode,
    setDisplayMode,
    zoom,
    setZoom,
  } = useAppStore();

  return (
    <div className="flex flex-col gap-5">
      {/* Play / Pause / Step / Reset */}
      <section>
        <label
          htmlFor="sim-controls"
          className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2"
        >
          Simulation
        </label>
        <div id="sim-controls" className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={isRunning ? onPause : onStart}
            className="col-span-2 py-2 rounded-lg font-semibold text-sm
              bg-indigo-600 hover:bg-indigo-500 transition-colors"
          >
            {isRunning ? '⏸ Pause' : '▶ Play'}
          </button>
          <button
            type="button"
            onClick={onStep}
            disabled={isRunning}
            className="py-2 rounded-lg text-sm bg-slate-700 hover:bg-slate-600
              disabled:opacity-40 transition-colors"
          >
            ⏭ Step
          </button>
          <button
            type="button"
            onClick={onReset}
            className="py-2 rounded-lg text-sm bg-slate-700 hover:bg-red-900 transition-colors"
          >
            ↺ Reset
          </button>
        </div>
      </section>

      {/* Speed */}
      <section>
        <label
          htmlFor="speed-controls"
          className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2"
        >
          Vitesse (pièces/tick)
        </label>
        <div id="speed-controls" className="flex flex-wrap gap-1">
          {SPEEDS.map((s) => (
            <button
              key={s.value}
              type="button"
              onClick={() => setSpeed(s.value)}
              className={`px-3 py-1 rounded text-xs font-medium transition-colors
                ${speed === s.value ? 'bg-indigo-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </section>

      {/* Board size */}
      <section>
        <label
          htmlFor="board-range"
          className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2"
        >
          Rayon du plateau: <span className="text-slate-200 font-bold">{visibleWidth}</span>
        </label>
        <input
          id="board-range"
          type="range"
          min={50}
          max={1000}
          step={50}
          value={visibleWidth}
          onChange={(e) => setVisibleWidth(Number(e.target.value))}
          className="w-full accent-indigo-500"
        />
        <div className="flex justify-between text-xs text-slate-600 mt-1">
          <span>50</span>
          <span>1000</span>
        </div>
      </section>

      {/* Display mode */}
      <fieldset>
        <legend className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">
          Mode d'affichage
        </legend>
        <div className="flex gap-2">
          {(['fit', '1:1'] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setDisplayMode(m)}
              className={`flex-1 py-1.5 rounded text-xs font-medium transition-colors
                ${displayMode === m ? 'bg-indigo-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}
            >
              {m === 'fit' ? '⊡ Fit screen' : '1:1 Pixel'}
            </button>
          ))}
        </div>
      </fieldset>

      {/* Zoom (only for 1:1 mode) */}
      {displayMode === '1:1' && (
        <section>
          <label
            htmlFor="zoom-range"
            className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2"
          >
            Zoom: <span className="text-slate-200 font-bold">×{zoom}</span>
          </label>
          <input
            id="zoom-range"
            type="range"
            min={1}
            max={16}
            step={1}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            className="w-full accent-indigo-500"
          />
        </section>
      )}
    </div>
  );
}
