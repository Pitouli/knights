import { useAppStore } from '../../store';

export default function StatsPanel() {
  const totalPlaced = useAppStore((s) => s.totalPlaced);
  const turnIndex = useAppStore((s) => s.turnIndex);
  const army = useAppStore((s) => s.army);

  return (
    <div className="flex items-center gap-4 text-xs text-slate-400">
      <span>
        <span className="text-slate-200 font-semibold">{totalPlaced.toLocaleString()}</span> pièces
      </span>
      <span className="hidden sm:inline">
        Tour{' '}
        <span className="text-slate-200 font-semibold">
          {army.length > 0 ? Math.floor(turnIndex / army.length) : 0}
        </span>
      </span>
      <span className="hidden sm:inline">
        Armée <span className="text-slate-200 font-semibold">{army.length}</span> pièce
        {army.length !== 1 ? 's' : ''}
      </span>
    </div>
  );
}
