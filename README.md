# Knights - Spiral Placement

React + TypeScript web application that simulates an infinite placement of pieces on a discrete chessboard using a spiral traversal.

## Concept

This application is designed based on ideas presented in Numberphile videos:

- Red & Black Knights (extraordinary result) - Numberphile: <https://www.youtube.com/watch?v=UiX4CFIiegM>
- Amazing Chessboard Patterns (extra) - Numberphile: <https://www.youtube.com/watch?v=VgmDuBCayPw&pp=0gcJCR0AztywvtLA>

The principle:

- build an ordered army of pieces (type + color),
- the engine scans the squares following a spiral path,
- at each step, the current piece is placed on the first valid square,
- the visualization displays the evolution of the pattern in real time.

## Features

- Setup screen to assemble the army.
- Deterministic placement simulation.
- Canvas visualization with speed and display controls.
- PNG export from the visualization screen.

## Run locally

Requirements: Node.js 20+ recommended.

```bash
npm install
npm run dev
```

## Useful scripts

- `npm run dev`: Vite local server
- `npm run build`: production build
- `npm run preview`: preview the build
- `npm run deploy`: publish to GitHub Pages
