import { create } from 'zustand';
import type { PieceInstance, DisplayMode } from '../types';

export type AppScreen = 'setup' | 'viz';

interface AppState {
  // Navigation
  screen: AppScreen;
  setScreen: (s: AppScreen) => void;

  // Army
  army: PieceInstance[];
  setArmy: (army: PieceInstance[]) => void;
  addPiece: (p: PieceInstance) => void;
  removePiece: (id: string) => void;
  updatePiece: (id: string, patch: Partial<PieceInstance>) => void;
  reorderPieces: (from: number, to: number) => void;

  // Simulation controls
  isRunning: boolean;
  setIsRunning: (v: boolean) => void;
  speed: number;
  setSpeed: (v: number) => void;

  // Stats
  totalPlaced: number;
  turnIndex: number;

  // Visualization
  visibleWidth: number;
  setVisibleWidth: (v: number) => void;
  displayMode: DisplayMode;
  setDisplayMode: (m: DisplayMode) => void;
  zoom: number;
  setZoom: (v: number) => void;

  // Show attacks overlay
  showAttacks: boolean;
  setShowAttacks: (v: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
  screen: 'setup',
  setScreen: (screen) => set({ screen }),

  army: [],
  setArmy: (army) => set({ army }),
  addPiece: (p) => set((s) => ({ army: [...s.army, p] })),
  removePiece: (id) => set((s) => ({ army: s.army.filter((p) => p.id !== id) })),
  updatePiece: (id, patch) =>
    set((s) => ({ army: s.army.map((p) => (p.id === id ? { ...p, ...patch } : p)) })),
  reorderPieces: (from, to) =>
    set((s) => {
      const arr = [...s.army];
      const [item] = arr.splice(from, 1);
      arr.splice(to, 0, item);
      return { army: arr };
    }),

  isRunning: false,
  setIsRunning: (isRunning) => set({ isRunning }),
  speed: 50,
  setSpeed: (speed) => set({ speed }),

  totalPlaced: 0,
  turnIndex: 0,

  visibleWidth: 200,
  setVisibleWidth: (visibleWidth) => set({ visibleWidth }),
  displayMode: 'fit',
  setDisplayMode: (displayMode) => set({ displayMode }),
  zoom: 4,
  setZoom: (zoom) => set({ zoom }),

  showAttacks: false,
  setShowAttacks: (showAttacks) => set({ showAttacks }),
}));
