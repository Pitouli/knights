// ─── Piece types ────────────────────────────────────────────

export type PieceType = {
  id: string;
  name: string;
  symbol: string;
  moves: Array<[number, number]>;
};

export type PieceInstance = {
  id: string;
  typeId: string;
  color: string;
};

// ─── Board ──────────────────────────────────────────────────

export type PlacedCell = {
  x: number;
  y: number;
  color: string;
};

// ─── Worker messages ────────────────────────────────────────

export type WorkerArmy = Array<{ color: string; moves: Array<[number, number]> }>;

export type WorkerMessage =
  | { type: 'INIT'; payload: { army: WorkerArmy } }
  | { type: 'RUN'; payload: { count: number } }
  | { type: 'STEP' }
  | { type: 'RESET' };

export type WorkerResponse =
  | { type: 'READY' }
  | { type: 'BATCH'; cells: PlacedCell[]; turnIndex: number }
  | { type: 'RESET_DONE' };

// ─── Display ────────────────────────────────────────────────

export type DisplayMode = '1:1' | 'fit';
