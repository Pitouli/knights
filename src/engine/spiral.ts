/**
 * Lazy-cached square spiral generator.
 * Visits cells from (0,0) outward: right → up → left → down → …
 *
 *   n=0 → (0, 0)
 *   n=1 → (1, 0)
 *   n=2 → (1, -1)
 *   n=3 → (0, -1)
 *   n=4 → (-1, -1)
 *   …
 */
export class SpiralGen {
  private cache: [number, number][] = [[0, 0]];
  private x = 0;
  private y = 0;
  private dx = 1;
  private dy = 0;
  private steps = 1;
  private sc = 0; // step count in current segment
  private turns = 0;

  get(n: number): [number, number] {
    while (this.cache.length <= n) {
      this.x += this.dx;
      this.y += this.dy;
      this.sc++;
      if (this.sc === this.steps) {
        this.sc = 0;
        // Turn right in Cartesian space so screen-space progression is
        // right → up → left → down.
        const ndx = this.dy;
        this.dy = -this.dx;
        this.dx = ndx;
        this.turns++;
        if (this.turns % 2 === 0) this.steps++;
      }
      this.cache.push([this.x, this.y]);
    }
    return this.cache[n];
  }
}

// Shared instance for main thread
export const spiralGen = new SpiralGen();

export function spiral(n: number): [number, number] {
  return spiralGen.get(n);
}
