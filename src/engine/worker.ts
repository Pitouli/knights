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

function step(): { x: number; y: number; color: string } | null {
  if (army.length === 0) return null;
  const armyIdx = turnIndex % army.length;
  const piece = army[armyIdx];
  let i = searchStart[armyIdx] ?? 0;

  while (i < 10_000_000) {
    const [x, y] = gen.get(i);
    const key = `${x},${y}`;
    if (!occupied.has(key) && !isAttackedByEnemy(key, piece.color)) {
      placeAt(x, y, piece);
      searchStart[armyIdx] = i;
      turnIndex++;
      return { x, y, color: piece.color };
    }
    i++;
  }

  // Safety escape – should never happen in practice
  turnIndex++;
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
    for (let i = 0; i < count; i++) {
      const r = step();
      if (r) cells.push(r);
    }
    self.postMessage({ type: 'BATCH', cells, turnIndex } satisfies WorkerResponse);
    return;
  }

  if (msg.type === 'STEP') {
    const r = step();
    self.postMessage({ type: 'BATCH', cells: r ? [r] : [], turnIndex } satisfies WorkerResponse);
    return;
  }

  if (msg.type === 'RESET') {
    resetState(army);
    self.postMessage({ type: 'RESET_DONE' } satisfies WorkerResponse);
  }
};
