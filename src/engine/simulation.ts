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
let runTimer: number | null = null;
let workerBusy = false;
let pieceBudget = 0;
let lastLoopTs = 0;

const RUN_LOOP_MS = 50;
const FASTEST_SPEED = 10000;
const FASTEST_MIN_BATCH = 500;
const FASTEST_MAX_BATCH = 50000;
const FASTEST_TARGET_MS = 16;

let fastestBatchSize = 5000;
let fastestDispatchTs = 0;

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

function stopRunLoop() {
  if (runTimer !== null) {
    window.clearTimeout(runTimer);
    runTimer = null;
  }
}

function scheduleRunLoop(delayMs = RUN_LOOP_MS) {
  stopRunLoop();
  runTimer = window.setTimeout(runLoop, delayMs);
}

function resetRunPacing() {
  pieceBudget = 0;
  lastLoopTs = 0;
  fastestBatchSize = 5000;
  fastestDispatchTs = 0;
}

function runLoop() {
  const { isRunning, speed, visibleWidth } = useAppStore.getState();
  if (!isRunning) {
    stopRunLoop();
    return;
  }

  if (speed === FASTEST_SPEED) {
    if (!workerBusy) {
      workerBusy = true;
      fastestDispatchTs = performance.now();
      send({ type: 'RUN', payload: { count: fastestBatchSize, boardLimit: visibleWidth } });
    }
    // Keep the loop hot in fastest mode without direct recursive chaining.
    scheduleRunLoop(0);
    return;
  }

  const now = performance.now();
  if (lastLoopTs === 0) {
    lastLoopTs = now;
  }
  const dtMs = now - lastLoopTs;
  lastLoopTs = now;
  pieceBudget += (speed * dtMs) / 1000;

  const count = Math.floor(pieceBudget);
  if (count > 0 && !workerBusy) {
    pieceBudget -= count;
    workerBusy = true;
    send({ type: 'RUN', payload: { count, boardLimit: visibleWidth } });
  }

  scheduleRunLoop();
}

// ─── Message handler ────────────────────────────────────────

function handleMessage(e: MessageEvent<WorkerResponse>) {
  const msg = e.data;

  if (msg.type === 'BATCH' || msg.type === 'HALTED') {
    workerBusy = false;
  }

  if (msg.type === 'BATCH' && msg.cells.length > 0) {
    boardCells.push(...msg.cells);
    pendingCells.push(...msg.cells);
    useAppStore.setState({ totalPlaced: boardCells.length, turnIndex: msg.turnIndex });

    const { speed } = useAppStore.getState();
    if (speed === FASTEST_SPEED && fastestDispatchTs > 0) {
      const dt = performance.now() - fastestDispatchTs;
      if (dt < FASTEST_TARGET_MS * 0.8) {
        fastestBatchSize = Math.min(
          FASTEST_MAX_BATCH,
          Math.ceil(fastestBatchSize * 1.25),
        );
      } else if (dt > FASTEST_TARGET_MS * 1.4) {
        fastestBatchSize = Math.max(
          FASTEST_MIN_BATCH,
          Math.floor(fastestBatchSize * 0.75),
        );
      }
    }
  }

  if (msg.type === 'HALTED') {
    stopRunLoop();
    useAppStore.setState({ isRunning: false, turnIndex: msg.turnIndex });
    return;
  }

  if (msg.type === 'BATCH' && msg.cells.length === 0) {
    stopRunLoop();
    useAppStore.setState({ isRunning: false });
    return;
  }

  if (msg.type === 'BATCH') {
    const { isRunning, speed } = useAppStore.getState();
    if (!isRunning) return;

    if (runTimer === null) {
      scheduleRunLoop(speed === FASTEST_SPEED ? 0 : RUN_LOOP_MS);
    }
  }
}

// ─── Public API ─────────────────────────────────────────────

export function initAndStart(): void {
  const { army, speed } = useAppStore.getState();
  if (army.length === 0) return;

  const workerArmy = army.map((p) => {
    const type = PIECE_CATALOG.find((t) => t.id === p.typeId);
    if (!type) return { color: p.color, moves: [] };
    return { color: p.color, moves: type.moves };
  });

  boardCells.length = 0;
  pendingCells.length = 0;
  stopRunLoop();
  workerBusy = false;
  resetRunPacing();
  useAppStore.setState({ totalPlaced: 0, turnIndex: 0, isRunning: true });

  send({ type: 'INIT', payload: { army: workerArmy } });
  scheduleRunLoop(speed === FASTEST_SPEED ? 0 : RUN_LOOP_MS);
}

export function startSimulation(): void {
  const { isRunning, speed } = useAppStore.getState();
  if (isRunning) return;
  useAppStore.setState({ isRunning: true });
  resetRunPacing();
  scheduleRunLoop(speed === FASTEST_SPEED ? 0 : RUN_LOOP_MS);
}

export function pauseSimulation(): void {
  stopRunLoop();
  useAppStore.setState({ isRunning: false });
}

export function stepOnce(): void {
  if (workerBusy) return;
  workerBusy = true;
  const { visibleWidth } = useAppStore.getState();
  send({ type: 'STEP', payload: { boardLimit: visibleWidth } });
}

export function resetSimulation(): void {
  stopRunLoop();
  workerBusy = false;
  resetRunPacing();
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
