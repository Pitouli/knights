import { useMemo, useState } from 'react';
import { PIECE_CATALOG } from '../../engine/catalog';
import { useAppStore } from '../../store';
import { nanoid } from '../../utils';
import { PIECE_COLORS } from '../../constants/palette';
import MoveGrid from './MoveGrid';

const CUSTOM_MIN_SIZE = 3;
const CUSTOM_MAX_SIZE = 150;

function moveKey(dx: number, dy: number): string {
  return `${dx},${dy}`;
}

function parseMoveKey(value: string): [number, number] {
  const [dx, dy] = value.split(',').map(Number);
  return [dx, dy];
}

export default function PieceLibrary() {
  const addPiece = useAppStore((s) => s.addPiece);
  const customTypes = useAppStore((s) => s.customTypes);
  const addCustomType = useAppStore((s) => s.addCustomType);
  const army = useAppStore((s) => s.army);

  const [isCustomOpen, setCustomOpen] = useState(false);
  const [customName, setCustomName] = useState('');
  const [gridSize, setGridSize] = useState(5);
  const [selectedMoves, setSelectedMoves] = useState<string[]>([]);
  const [customError, setCustomError] = useState('');

  const allTypes = useMemo(() => [...PIECE_CATALOG, ...customTypes], [customTypes]);

  const customPreview = useMemo(
    () => ({
      id: 'custom-preview',
      moves: selectedMoves.map(parseMoveKey),
    }),
    [selectedMoves],
  );

  function toggleMove(dx: number, dy: number) {
    if (dx === 0 && dy === 0) return;
    const key = moveKey(dx, dy);
    setSelectedMoves((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key],
    );
  }

  function createCustomPiece() {
    const name = customName.trim();
    const radius = Math.floor(gridSize / 2);
    const moves = selectedMoves
      .map(parseMoveKey)
      .filter(([dx, dy]) => Math.abs(dx) <= radius && Math.abs(dy) <= radius);

    if (!name) {
      setCustomError('Please enter a name.');
      return;
    }
    if (moves.length === 0) {
      setCustomError('Select at least one reachable cell.');
      return;
    }

    addCustomType({
      id: nanoid(),
      name,
      symbol: 'C',
      moves,
    });
    setCustomOpen(false);
    setCustomName('');
    setGridSize(5);
    setSelectedMoves([]);
    setCustomError('');
  }

  return (
    <div>
      <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">
        Piece library
      </h2>

      <button
        type="button"
        onClick={() => setCustomOpen(true)}
        className="w-full mb-3 flex items-center gap-3 px-3 py-2 rounded-lg border border-indigo-500/40
          bg-indigo-500/10 hover:bg-indigo-500/20 transition-colors text-left"
      >
        <span className="w-8 h-8 rounded flex items-center justify-center text-lg font-bold shrink-0 bg-indigo-500/20 text-indigo-300">
          ✳
        </span>
        <div>
          <div className="font-medium text-sm text-indigo-200">Custom</div>
          <div className="text-xs text-slate-400">Create your own movement pattern</div>
        </div>
      </button>

      <ul className="space-y-2">
        {allTypes.map((pt, i) => (
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
                <div className="font-medium text-sm text-slate-200">
                  {pt.name}
                  {pt.id.startsWith('custom:') && (
                    <>
                      {' '}
                      <span className="ml-2 text-[10px] uppercase text-indigo-300">Custom</span>
                    </>
                  )}
                </div>
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

      {isCustomOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-xl border border-slate-700 bg-[#111827] p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-slate-200">Create Custom Piece</h3>
              <button
                type="button"
                onClick={() => {
                  setCustomOpen(false);
                  setCustomError('');
                }}
                className="text-slate-400 hover:text-slate-200"
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            <label className="block text-xs text-slate-400 mb-2" htmlFor="custom-piece-name">
              Piece name
            </label>
            <input
              id="custom-piece-name"
              type="text"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              className="w-full mb-3 bg-slate-800 border border-slate-600 rounded px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              placeholder="My Piece"
              maxLength={32}
            />

            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-400">Grid size</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setGridSize((s) => Math.max(CUSTOM_MIN_SIZE, s - 2))}
                  disabled={gridSize <= CUSTOM_MIN_SIZE}
                  className="w-7 h-7 rounded bg-slate-700 hover:bg-slate-600 disabled:opacity-40"
                >
                  -
                </button>
                <span className="text-sm text-slate-200 w-12 text-center">
                  {gridSize}x{gridSize}
                </span>
                <button
                  type="button"
                  onClick={() => setGridSize((s) => Math.min(CUSTOM_MAX_SIZE, s + 2))}
                  disabled={gridSize >= CUSTOM_MAX_SIZE}
                  className="w-7 h-7 rounded bg-slate-700 hover:bg-slate-600 disabled:opacity-40"
                >
                  +
                </button>
              </div>
            </div>

            <div className="border border-slate-700 rounded p-2 mb-3">
              <div
                className="grid gap-1"
                style={{ gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))` }}
              >
                {Array.from({ length: gridSize * gridSize }).map((_, idx) => {
                  const x = idx % gridSize;
                  const y = Math.floor(idx / gridSize);
                  const center = Math.floor(gridSize / 2);
                  const dx = x - center;
                  const dy = center - y;
                  const isCenter = dx === 0 && dy === 0;
                  const active = selectedMoves.includes(moveKey(dx, dy));

                  return (
                    <button
                      key={`${x}-${y}`}
                      type="button"
                      disabled={isCenter}
                      onClick={() => toggleMove(dx, dy)}
                      className={`aspect-square rounded border transition-colors
                        ${isCenter ? 'bg-slate-600 border-slate-500 cursor-not-allowed' : active ? 'bg-indigo-500/60 border-indigo-300' : 'bg-slate-900 border-slate-700 hover:bg-slate-800'}`}
                      aria-label={isCenter ? 'Center' : `Toggle ${dx},${dy}`}
                    />
                  );
                })}
              </div>
            </div>

            <div className="mb-3">
              <div className="text-xs text-slate-400 mb-1">Preview</div>
              <MoveGrid piece={customPreview} accent="#818cf8" className="mx-auto" />
            </div>

            {customError && <p className="text-xs text-rose-400 mb-2">{customError}</p>}

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setCustomOpen(false);
                  setCustomError('');
                }}
                className="px-3 py-1.5 rounded text-sm bg-slate-700 hover:bg-slate-600"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={createCustomPiece}
                className="px-3 py-1.5 rounded text-sm bg-indigo-600 hover:bg-indigo-500"
              >
                Add to library
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
