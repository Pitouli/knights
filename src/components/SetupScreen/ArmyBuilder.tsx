import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useAppStore } from '../../store';
import { PIECE_CATALOG } from '../../engine/catalog';
import type { PieceInstance } from '../../types';
import { PIECE_COLORS } from '../../constants/palette';
import MoveGrid from './MoveGrid';

// ─── Sortable item ──────────────────────────────────────────

function SortablePiece({ piece, index }: { piece: PieceInstance; index: number }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: piece.id,
  });
  const { removePiece, updatePiece } = useAppStore();
  const customTypes = useAppStore((s) => s.customTypes);
  const allTypes = [...PIECE_CATALOG, ...customTypes];
  const pt = allTypes.find((t) => t.id === piece.typeId);
  if (!pt) return null;

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <li
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-3 px-3 py-2 rounded-lg bg-slate-800 border border-slate-700"
    >
      {/* Drag handle */}
      <button
        type="button"
        {...attributes}
        {...listeners}
        className="text-slate-500 hover:text-slate-300 cursor-grab active:cursor-grabbing px-1 touch-none"
        aria-label="Reorder"
      >
        ⠿
      </button>

      {/* Index badge */}
      <span className="text-xs text-slate-500 w-5 text-center shrink-0">{index + 1}</span>

      {/* Symbol */}
      <MoveGrid piece={pt} accent={piece.color} />

      {/* Name + type select */}
      <div className="flex-1 min-w-0">
        <select
          value={piece.typeId}
          onChange={(e) => updatePiece(piece.id, { typeId: e.target.value })}
          className="bg-slate-700 text-slate-200 text-sm rounded px-2 py-1 w-full focus:outline-none
            focus:ring-1 focus:ring-indigo-500 border border-slate-600"
        >
          {allTypes.map((pt) => (
            <option key={pt.id} value={pt.id}>
              {pt.name}
            </option>
          ))}
        </select>
      </div>

      {/* Palette color select (finite set to allow shared-color alliances) */}
      <label className="shrink-0" title="Color">
        <select
          value={piece.color}
          onChange={(e) => updatePiece(piece.id, { color: e.target.value })}
          className="bg-slate-700 text-slate-200 text-xs rounded px-2 py-1 w-20 focus:outline-none
            focus:ring-1 focus:ring-indigo-500 border border-slate-600"
        >
          {PIECE_COLORS.map((color, idx) => (
            <option key={color} value={color}>{`C${idx + 1}`}</option>
          ))}
        </select>
        <span
          className="mt-1 w-full h-2 rounded block border border-slate-600"
          style={{ background: piece.color }}
          aria-hidden="true"
        />
      </label>

      {/* Remove */}
      <button
        type="button"
        onClick={() => removePiece(piece.id)}
        className="text-slate-500 hover:text-red-400 transition-colors shrink-0 px-1"
        aria-label="Remove"
      >
        ✕
      </button>
    </li>
  );
}

// ─── Army Builder ───────────────────────────────────────────

export default function ArmyBuilder() {
  const { army, setArmy } = useAppStore();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const from = army.findIndex((p) => p.id === active.id);
    const to = army.findIndex((p) => p.id === over.id);
    setArmy(arrayMove(army, from, to));
  }

  return (
    <div>
      <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">
        Army ({army.length} piece{army.length !== 1 ? 's' : ''})
      </h2>
      <p className="text-xs text-slate-500 mb-3">
        Pieces with the same color are allies and can share reachable squares.
      </p>

      {army.length === 0 ? (
        <p className="text-slate-500 text-sm py-8 text-center border border-dashed border-slate-700 rounded-lg">
          Click a piece in the library to add it
        </p>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={army.map((p) => p.id)} strategy={verticalListSortingStrategy}>
            <ul className="space-y-2">
              {army.map((p, i) => (
                <SortablePiece key={p.id} piece={p} index={i} />
              ))}
            </ul>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
}
