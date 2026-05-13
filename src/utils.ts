/** Tiny ID generator (no external dep) */
export function nanoid(size = 10): string {
  return crypto.randomUUID().replace(/-/g, '').slice(0, size);
}
