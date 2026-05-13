Voici une **spécification complète et structurée** pour transformer ton jeu en **application React interactive**, en prenant en compte à la fois **l’UX**, **l’architecture technique** et les **règles métier** du moteur.

---

# 🧩 1. Vision produit

### Objectif

Créer une application web permettant :

1.  De **configurer une "armée"** (types de pièces, couleurs, ordre)
2.  De **lancer la génération déterministe**
3.  De **visualiser dynamiquement le plateau** sous forme de canvas (1 pixel = 1 case)

Le système repose sur un **algorithme déterministe de placement en spirale** [\[Game Rules \| Txt\]](https://digiplace-my.sharepoint.com/personal/jb_degiovanni_wavestone_com/Documents/Fichiers%20de%20conversation%20Microsoft%20Copilot/Game%20Rules.txt)

---

# 🧠 2. Modèle fonctionnel

## 2.1 Entités principales

### 🔹 PieceType

Définit les mouvements (attaque géométrique)

```ts
type PieceType = {
  id: string;
  name: string;
  moves: Array<[dx: number, dy: number]>;
};
```

👉 Catalogue autorisé (sans déplacement infini) :

- Knight (±2, ±1) [\[Game Rules \| Txt\]](https://digiplace-my.sharepoint.com/personal/jb_degiovanni_wavestone_com/Documents/Fichiers%20de%20conversation%20Microsoft%20Copilot/Game%20Rules.txt)
- Zebra (±3, ±2) [\[Game Rules \| Txt\]](https://digiplace-my.sharepoint.com/personal/jb_degiovanni_wavestone_com/Documents/Fichiers%20de%20conversation%20Microsoft%20Copilot/Game%20Rules.txt)
- Antelope (±4, ±3) [\[Game Rules \| Txt\]](https://digiplace-my.sharepoint.com/personal/jb_degiovanni_wavestone_com/Documents/Fichiers%20de%20conversation%20Microsoft%20Copilot/Game%20Rules.txt)
- Alfil (±2, ±2) [\[Game Rules \| Txt\]](https://digiplace-my.sharepoint.com/personal/jb_degiovanni_wavestone_com/Documents/Fichiers%20de%20conversation%20Microsoft%20Copilot/Game%20Rules.txt)
- Dabbaba (±2, 0 / 0, ±2) [\[Game Rules \| Txt\]](https://digiplace-my.sharepoint.com/personal/jb_degiovanni_wavestone_com/Documents/Fichiers%20de%20conversation%20Microsoft%20Copilot/Game%20Rules.txt)
- Leaper orthogonal 3 (±3, 0 / 0, ±3) [\[Game Rules \| Txt\]](https://digiplace-my.sharepoint.com/personal/jb_degiovanni_wavestone_com/Documents/Fichiers%20de%20conversation%20Microsoft%20Copilot/Game%20Rules.txt)
- Vizir (±1, 0 / 0, ±1) [\[Game Rules \| Txt\]](https://digiplace-my.sharepoint.com/personal/jb_degiovanni_wavestone_com/Documents/Fichiers%20de%20conversation%20Microsoft%20Copilot/Game%20Rules.txt)
- Ferz (±1, ±1) [\[Game Rules \| Txt\]](https://digiplace-my.sharepoint.com/personal/jb_degiovanni_wavestone_com/Documents/Fichiers%20de%20conversation%20Microsoft%20Copilot/Game%20Rules.txt)

❌ Exclure : Queen, Rook, Bishop

---

### 🔹 PieceInstance

```ts
type PieceInstance = {
  id: string;
  type: PieceType;
  color: string;
};
```

---

### 🔹 Army

```ts
type Army = {
  pieces: PieceInstance[];
};
```

👉 L’ordre est **crucial** (tour par tour)

---

### 🔹 BoardState

```ts
type Cell = {
  x: number;
  y: number;
  piece?: PieceInstance;
};

type BoardState = Map<string /* x,y */, Cell>;
```

---

### 🔹 GameState

```ts
type GameState = {
  board: BoardState;
  turnIndex: number;
  spiralIndex: number;
};
```

---

# ⚙️ 3. Moteur de jeu

## 3.1 Spirale

Fonction clé :

```ts
function spiral(n: number): { x: number; y: number };
```

- Case 0 = (0,0)
- Parcours en spirale carrée [\[Game Rules \| Txt\]](https://digiplace-my.sharepoint.com/personal/jb_degiovanni_wavestone_com/Documents/Fichiers%20de%20conversation%20Microsoft%20Copilot/Game%20Rules.txt)

---

## 3.2 Règle de placement

À chaque tour :

1.  Sélectionner la pièce suivante (modulo la liste)
2.  Parcourir les cases dans l’ordre de la spirale
3.  Trouver la **première case valide**
4.  Placer la pièce

---

## 3.3 Validité d’une case

```ts
function isValid(cell, piece, board): boolean;
```

✅ Condition :

- case vide
- PAS attaquée par une autre couleur [\[Game Rules \| Txt\]](https://digiplace-my.sharepoint.com/personal/jb_degiovanni_wavestone_com/Documents/Fichiers%20de%20conversation%20Microsoft%20Copilot/Game%20Rules.txt)

❗ Autorisé :

- attaquée par même couleur [\[Game Rules \| Txt\]](https://digiplace-my.sharepoint.com/personal/jb_degiovanni_wavestone_com/Documents/Fichiers%20de%20conversation%20Microsoft%20Copilot/Game%20Rules.txt)

---

## 3.4 Système d'attaque

```ts
function attacks(from, to, pieceType): boolean;
```

👉 basé sur les deltas de mouvements  
👉 indépendant du tour [\[Game Rules \| Txt\]](https://digiplace-my.sharepoint.com/personal/jb_degiovanni_wavestone_com/Documents/Fichiers%20de%20conversation%20Microsoft%20Copilot/Game%20Rules.txt)

---

## 3.5 Boucle principale

```ts
while (true) {
  step();
}
```

```ts
function step() {
  const piece = army[turnIndex];

  for (let i = 0; i < spiralCursor; i++) {
    let cell = spiral(i);

    if (isValid(cell)) {
      place(piece);
      break;
    }
  }

  turnIndex++;
}
```

---

# 🧱 4. Architecture React

## 4.1 Stack recommandée

- React + TypeScript
- Zustand ou Redux Toolkit (state global)
- react-dnd (drag & drop)
- Canvas API (rendering)
- Web Worker (simulation)

---

## 4.2 Structure des composants

    App
     ├── SetupScreen
     │    ├── PieceLibrary
     │    ├── ArmyBuilder
     │    │     ├── PieceItem (draggable)
     │    │     └── ColorPicker
     │    └── StartButton
     │
     └── VisualizationScreen
          ├── CanvasBoard
          ├── ControlsPanel
          │     ├── ZoomControls
          │     ├── SizeControl
          │     └── ModeSwitch
          └── StatsPanel

---

# 🎮 5. UX : Mode Setup

## 5.1 Army Builder

### Fonctionnalités

- Ajouter une pièce
- Choisir son type
- Choisir une couleur
- Drag & drop pour réordonner
- Supprimer une pièce

### Contraintes

- liste ordonnée
- couleurs libres (hex)

---

# 🎨 6. UX : Mode Visualisation

## 6.1 Canvas

### Rendu

- 1 pixel = 1 case logique
- Couleur = couleur de la pièce

---

## 6.2 Modes d’affichage

### 🔹 Mode 1: 1:1

- 1 case = 1 pixel écran
- pas de scaling

---

### 🔹 Mode 2: Fit to screen

- agrandissement :

  ```css
  image-rendering: pixelated;
  ```

- réduction :
  → canvas offscreen + downscale avec smoothing

---

## 6.3 Taille du plateau

Contrôle utilisateur :

```ts
width: number;
```

### ✅ Comportement clé

- Si on réduit :
  → ne PAS supprimer les données
- Si on ré-augmente :
  → restaurer instantanément

👉 solution :

```ts
computedCells: Map<string, Cell>;
visibleWidth: number;
```

---

# 🚀 7. Performance

## 7.1 Web Worker

Simulation :

- exécutée en parallèle
- envoie des batches au main thread

---

## 7.2 Lazy computation

- calculer les cases à la demande
- cache permanent des résultats

---

## 7.3 Spatial indexing

Amélioration possible :

- hashmap pour attaques
- ou grille partielle

---

# 🧪 8. Extensibilité

- Multi-couleurs (déjà supporté ) [\[Game Rules \| Txt\]](https://digiplace-my.sharepoint.com/personal/jb_degiovanni_wavestone_com/Documents/Fichiers%20de%20conversation%20Microsoft%20Copilot/Game%20Rules.txt)
- Export image
- Animation progressive
- Seed (reproductibilité)
- Shader WebGL futur

---

# 🧾 9. API interne (suggestion)

```ts
generateNext(board, army): BoardState
```

```ts
getVisibleBoard(board, width): Cell[]
```

```ts
setArmy(army);
startSimulation();
pauseSimulation();
```

---

# ✅ 10. Critères d’acceptation

### Setup

- [ ] drag & drop fonctionnel
- [ ] choix type + couleur
- [ ] ordre respecté

### Engine

- [ ] spiral correcte
- [ ] règles de validité respectées
- [ ] déterminisme garanti

### Visualisation

- [ ] canvas fluide
- [ ] zoom pixel perfect
- [ ] fit screen sans blur
- [ ] resize sans perte de données

---

# 💡 Bonus (reco forte)

👉 Ajouter :

- "vitesse simulation"
- "pause / step"
- "affichage des attaques"
- mini-map

---

Si tu veux, je peux maintenant :
✅ te générer le **squelette React + Zustand**
✅ ou coder **le moteur de spiral + placement complet**
✅ ou faire une **maquette UI détaillée (Figma-like)**
