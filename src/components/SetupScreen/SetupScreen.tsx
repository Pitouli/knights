import { useAppStore } from '../../store';
import ArmyBuilder from './ArmyBuilder';
import PieceLibrary from './PieceLibrary';

export default function SetupScreen() {
  const { army, setScreen } = useAppStore();

  const canStart = army.length > 0;

  return (
    <div className="min-h-screen flex flex-col bg-[#0f1117] text-slate-200">
      {/* Header */}
      <header className="border-b border-slate-800 px-4 sm:px-8 py-4 flex items-center gap-3">
        <span className="text-3xl">♞</span>
        <div>
          <h1 className="text-xl font-bold tracking-tight">Knights</h1>
          <p className="text-xs text-slate-500">Spiral placement simulator</p>
        </div>
      </header>

      {/* Body */}
      <main className="flex-1 flex flex-col lg:flex-row gap-0 overflow-hidden">
        {/* Left: Piece library */}
        <aside className="lg:w-72 border-b lg:border-b-0 lg:border-r border-slate-800 p-4 sm:p-6 overflow-y-auto">
          <PieceLibrary />
        </aside>

        {/* Right: Army builder */}
        <section className="flex-1 p-4 sm:p-6 flex flex-col gap-6 overflow-y-auto">
          <ArmyBuilder />

          <div className="mt-auto pt-4 border-t border-slate-800">
            <button
              type="button"
              disabled={!canStart}
              onClick={() => setScreen('viz')}
              className="w-full sm:w-auto px-8 py-3 rounded-lg font-semibold text-base
                bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed
                transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-400"
            >
              ▶ Lancer la simulation
            </button>
            {!canStart && (
              <p className="mt-2 text-xs text-slate-500">
                Ajoutez au moins une pièce pour commencer.
              </p>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
