import type { PieceType } from '../types';

export const PIECE_CATALOG: PieceType[] = [
  {
    id: 'knight',
    name: 'Knight',
    symbol: '♞',
    moves: [
      [2, 1],
      [2, -1],
      [-2, 1],
      [-2, -1],
      [1, 2],
      [1, -2],
      [-1, 2],
      [-1, -2],
    ],
  },
  {
    id: 'zebra',
    name: 'Zebra',
    symbol: 'Z',
    moves: [
      [3, 2],
      [3, -2],
      [-3, 2],
      [-3, -2],
      [2, 3],
      [2, -3],
      [-2, 3],
      [-2, -3],
    ],
  },
  {
    id: 'antelope',
    name: 'Antelope',
    symbol: 'A',
    moves: [
      [4, 3],
      [4, -3],
      [-4, 3],
      [-4, -3],
      [3, 4],
      [3, -4],
      [-3, 4],
      [-3, -4],
    ],
  },
  {
    id: 'alfil',
    name: 'Alfil',
    symbol: '◆',
    moves: [
      [2, 2],
      [2, -2],
      [-2, 2],
      [-2, -2],
    ],
  },
  {
    id: 'dabbaba',
    name: 'Dabbaba',
    symbol: '□',
    moves: [
      [2, 0],
      [-2, 0],
      [0, 2],
      [0, -2],
    ],
  },
  {
    id: 'leaper3',
    name: 'Leaper-3',
    symbol: '△',
    moves: [
      [3, 0],
      [-3, 0],
      [0, 3],
      [0, -3],
    ],
  },
  {
    id: 'vizir',
    name: 'Vizir',
    symbol: '+',
    moves: [
      [1, 0],
      [-1, 0],
      [0, 1],
      [0, -1],
    ],
  },
  {
    id: 'ferz',
    name: 'Ferz',
    symbol: '×',
    moves: [
      [1, 1],
      [1, -1],
      [-1, 1],
      [-1, -1],
    ],
  },
];
