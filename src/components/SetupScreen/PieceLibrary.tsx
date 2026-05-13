import { PIECE_CATALOG } from '../../engine/catalog';
import { useAppStore } from '../../store';
import { nanoid } from '../../utils';
import { PIECE_COLORS } from '../../constants/palette';
import MoveGrid from './MoveGrid';

export default function PieceLibrary() {
  const addPiece = useAppStore((s) => s.addPiece);
  const army = useAppStore((s) => s.army);

  return (
    <div>
      <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">
        Piece library
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
                  color: PIECE_COLORS[army.length % PIECE_COLORS.length],
                })
              }
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg
                bg-slate-800 hover:bg-slate-700 transition-colors text-left group"
            >
              <MoveGrid piece={pt} accent={PIECE_COLORS[i % PIECE_COLORS.length]} />
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
