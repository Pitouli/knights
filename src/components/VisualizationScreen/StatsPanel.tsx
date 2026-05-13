import { useAppStore } from '../../store';

export default function StatsPanel() {
  const totalPlaced = useAppStore((s) => s.totalPlaced);
  const turnIndex = useAppStore((s) => s.turnIndex);
  const army = useAppStore((s) => s.army);

  return (
    <div className="flex items-center gap-4 text-xs text-slate-400">
      <span>
        <span className="text-slate-200 font-semibold">{totalPlaced.toLocaleString()}</span> pieces
      </span>
      <span className="hidden sm:inline">
        Turn{' '}
        <span className="text-slate-200 font-semibold">
          {army.length > 0 ? Math.floor(turnIndex / army.length) : 0}
        </span>
      </span>
      <span className="hidden sm:inline">
        Army <span className="text-slate-200 font-semibold">{army.length}</span> piece
        {army.length !== 1 ? 's' : ''}
      </span>
    </div>
  );
}
