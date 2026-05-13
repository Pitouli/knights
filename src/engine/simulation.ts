/**
 * Simulation manager.
 * Owns the Web Worker and mutable board arrays consumed directly
 * by the canvas RAF loop — no React re-renders per cell.
 */

import { PIECE_CATALOG } from './catalog';
import { useAppStore } from '../store';
import type { PlacedCell, WorkerMessage, WorkerResponse } from '../types';

// ─── Mutable board data (outside React) ────────────────────

/** Every cell ever placed, in insertion order */
export const boardCells: PlacedCell[] = [];
/** Cells not yet flushed to the canvas */
export const pendingCells: PlacedCell[] = [];

// ─── Worker lifecycle ───────────────────────────────────────

let worker: Worker | null = null;

function getWorker(): Worker {
  if (!worker) {
    worker = new Worker(new URL('./worker.ts', import.meta.url), { type: 'module' });
    worker.onmessage = handleMessage;
  }
  return worker;
}

function send(msg: WorkerMessage) {
  getWorker().postMessage(msg);
}

// ─── Message handler ────────────────────────────────────────

function handleMessage(e: MessageEvent<WorkerResponse>) {
  const msg = e.data;

  if (msg.type === 'BATCH' && msg.cells.length > 0) {
    boardCells.push(...msg.cells);
    pendingCells.push(...msg.cells);
    useAppStore.setState({ totalPlaced: boardCells.length, turnIndex: msg.turnIndex });
  }

  if (msg.type === 'HALTED') {
    useAppStore.setState({ isRunning: false, turnIndex: msg.turnIndex });
    return;
  }

  // Auto-continue if still running (only after a batch, not on READY)
  if (msg.type === 'BATCH') {
    const { isRunning, speed, visibleWidth } = useAppStore.getState();
    if (isRunning && msg.cells.length > 0) {
      send({ type: 'RUN', payload: { count: speed, boardLimit: visibleWidth } });
    } else if (isRunning && msg.cells.length === 0) {
      useAppStore.setState({ isRunning: false });
    }
  }
}

// ─── Public API ─────────────────────────────────────────────

export function initAndStart(): void {
  const { army, speed, visibleWidth } = useAppStore.getState();
  if (army.length === 0) return;

  const workerArmy = army.map((p) => {
    const type = PIECE_CATALOG.find((t) => t.id === p.typeId);
    if (!type) return { color: p.color, moves: [] };
    return { color: p.color, moves: type.moves };
  });

  boardCells.length = 0;
  pendingCells.length = 0;
  useAppStore.setState({ totalPlaced: 0, turnIndex: 0, isRunning: true });

  send({ type: 'INIT', payload: { army: workerArmy } });
  send({ type: 'RUN', payload: { count: speed, boardLimit: visibleWidth } });
}

export function startSimulation(): void {
  useAppStore.setState({ isRunning: true });
  const { speed, visibleWidth } = useAppStore.getState();
  send({ type: 'RUN', payload: { count: speed, boardLimit: visibleWidth } });
}

export function pauseSimulation(): void {
  useAppStore.setState({ isRunning: false });
}

export function stepOnce(): void {
  const { visibleWidth } = useAppStore.getState();
  send({ type: 'STEP', payload: { boardLimit: visibleWidth } });
}

export function resetSimulation(): void {
  useAppStore.setState((s) => ({
    isRunning: false,
    totalPlaced: 0,
    turnIndex: 0,
    canvasResetKey: s.canvasResetKey + 1,
  }));
  boardCells.length = 0;
  pendingCells.length = 0;
  send({ type: 'RESET' });
}
