import type { PieceType } from '../../types';

type MoveGridProps = {
  piece: Pick<PieceType, 'id' | 'moves'>;
  accent: string;
  className?: string;
};

function gridSizeForPiece(piece: Pick<PieceType, 'id' | 'moves'>): number {
  const maxDelta = piece.moves.reduce((m, [dx, dy]) => {
    const localMax = Math.max(Math.abs(dx), Math.abs(dy));
    return Math.max(m, localMax);
  }, 1);
  return maxDelta * 2 + 1;
}

export default function MoveGrid({ piece, accent, className = '' }: MoveGridProps) {
  const size = gridSizeForPiece(piece);
  const center = Math.floor(size / 2);
  const moveSet = new Set(piece.moves.map(([dx, dy]) => `${center + dx},${center - dy}`));
  const cells: JSX.Element[] = [];

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const key = `${x},${y}`;
      const isCenter = x === center && y === center;
      const isMove = moveSet.has(key);
      const background = isCenter ? '#1e293b' : isMove ? `${accent}66` : '#0f172a';
      const border = isCenter ? '#334155' : isMove ? `${accent}aa` : '#1e293b';

      cells.push(
        <span
          key={key}
          className="block rounded-[2px]"
          style={{
            background,
            border: `1px solid ${border}`,
          }}
        />,
      );
    }
  }

  return (
    <span
      className={`grid shrink-0 ${className}`.trim()}
      style={{
        gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))`,
        width: size >= 9 ? '2.25rem' : '2rem',
        height: size >= 9 ? '2.25rem' : '2rem',
      }}
      aria-hidden="true"
    >
      {cells}
    </span>
  );
}
