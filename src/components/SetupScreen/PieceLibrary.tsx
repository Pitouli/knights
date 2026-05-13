import { PIECE_CATALOG } from '../../engine/catalog';
import { useAppStore } from '../../store';
import { nanoid } from '../../utils';

const COLORS = [
  '#6366f1',
  '#ec4899',
  '#22c55e',
  '#f59e0b',
  '#38bdf8',
  '#f97316',
  '#a78bfa',
  '#fb7185',
];

export default function PieceLibrary() {
  const addPiece = useAppStore((s) => s.addPiece);
  const army = useAppStore((s) => s.army);

  return (
    <div>
      <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">
        Catalogue de pièces
      </h2>
      <ul className="space-y-2">
        {PIECE_CATALOG.map((pt, i) => (
          <li key={pt.id}>
            <button
              type="button"
              onClick={() =>
                addPiece({
                  id: nanoid(),
                  typeId: pt.id,
                  color: COLORS[army.length % COLORS.length],
                })
              }
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg
                bg-slate-800 hover:bg-slate-700 transition-colors text-left group"
            >
              <span
                className="w-8 h-8 rounded flex items-center justify-center text-lg font-bold shrink-0"
                style={{
                  background: `${COLORS[i % COLORS.length]}33`,
                  color: COLORS[i % COLORS.length],
                }}
              >
                {pt.symbol}
              </span>
              <div className="min-w-0">
                <div className="font-medium text-sm text-slate-200">{pt.name}</div>
                <div className="text-xs text-slate-500 truncate">
                  {pt.moves
                    .slice(0, 4)
                    .map(([dx, dy]) => `(${dx},${dy})`)
                    .join(' ')}
                  {pt.moves.length > 4 ? ' …' : ''}
                </div>
              </div>
              <span className="ml-auto text-slate-600 group-hover:text-indigo-400 text-lg">+</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
