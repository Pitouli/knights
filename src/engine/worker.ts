/// <reference lib="webworker" />

import type { WorkerMessage, WorkerResponse, WorkerArmy } from '../types';
import { SpiralGen } from './spiral';

// ─── Spiral ─────────────────────────────────────────────────

const gen = new SpiralGen();

// ─── Worker state ────────────────────────────────────────────

let army: WorkerArmy = [];
let occupied = new Set<string>();
/** Per-color set of cells that color attacks */
let attackedBy = new Map<string, Set<string>>();
let turnIndex = 0;
/** Per-army-slot: last spiral index where we found a valid cell.
 *  Since occupied / attack sets only grow, we can safely start
 *  the search from this index instead of 0 on subsequent calls. */
let searchStart: number[] = [];

// ─── Helpers ─────────────────────────────────────────────────

function isAttackedByEnemy(key: string, myColor: string): boolean {
  for (const [color, cells] of attackedBy) {
    if (color !== myColor && cells.has(key)) return true;
  }
  return false;
}

function placeAt(x: number, y: number, piece: WorkerArmy[number]): void {
  occupied.add(`${x},${y}`);
  if (!attackedBy.has(piece.color)) attackedBy.set(piece.color, new Set());
  const set = attackedBy.get(piece.color);
  if (!set) return;
  for (const [dx, dy] of piece.moves) {
    set.add(`${x + dx},${y + dy}`);
  }
}

// ─── Core step ───────────────────────────────────────────────

function step(boardLimit: number): { x: number; y: number; color: string } | null {
  if (army.length === 0) return null;
  const armyIdx = turnIndex % army.length;
  const piece = army[armyIdx];
  let i = searchStart[armyIdx] ?? 0;
  const side = boardLimit * 2 + 1;
  const maxSpiralIndex = side * side - 1;

  while (i <= maxSpiralIndex) {
    const [x, y] = gen.get(i);
    // Spiral points are monotonic by radius; once outside board bounds,
    // all subsequent points will stay outside the finite board.
    if (Math.abs(x) > boardLimit || Math.abs(y) > boardLimit) {
      return null;
    }
    const key = `${x},${y}`;
    if (!occupied.has(key) && !isAttackedByEnemy(key, piece.color)) {
      placeAt(x, y, piece);
      searchStart[armyIdx] = i;
      turnIndex++;
      return { x, y, color: piece.color };
    }
    i++;
  }

  return null;
}

// ─── Reset ───────────────────────────────────────────────────

function resetState(newArmy: WorkerArmy): void {
  army = newArmy;
  occupied = new Set();
  attackedBy = new Map();
  turnIndex = 0;
  searchStart = new Array(newArmy.length).fill(0);
}

// ─── Message handler ─────────────────────────────────────────

self.onmessage = (e: MessageEvent<WorkerMessage>) => {
  const msg = e.data;

  if (msg.type === 'INIT') {
    resetState(msg.payload.army);
    self.postMessage({ type: 'READY' } satisfies WorkerResponse);
    return;
  }

  if (msg.type === 'RUN') {
    const count = msg.payload.count;
    const cells: { x: number; y: number; color: string }[] = [];
    let halted = false;
    for (let i = 0; i < count; i++) {
      const r = step(msg.payload.boardLimit);
      if (!r) {
        halted = true;
        break;
      }
      cells.push(r);
    }
    self.postMessage({ type: 'BATCH', cells, turnIndex } satisfies WorkerResponse);
    if (halted) {
      self.postMessage({
        type: 'HALTED',
        reason: 'BOARD_LIMIT_REACHED',
        turnIndex,
      } satisfies WorkerResponse);
    }
    return;
  }

  if (msg.type === 'STEP') {
    const r = step(msg.payload.boardLimit);
    self.postMessage({ type: 'BATCH', cells: r ? [r] : [], turnIndex } satisfies WorkerResponse);
    if (!r) {
      self.postMessage({
        type: 'HALTED',
        reason: 'BOARD_LIMIT_REACHED',
        turnIndex,
      } satisfies WorkerResponse);
    }
    return;
  }

  if (msg.type === 'RESET') {
    resetState(army);
    self.postMessage({ type: 'RESET_DONE' } satisfies WorkerResponse);
  }
};
