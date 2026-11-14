/**
 * The Nine Linked Rings (九连环). Rings sit on a bar, numbered from the end of the bar: ring 1
 * is outermost. Ring 1 can always go on or off; any other ring can go on or off only when the
 * ring just outside it is on and every ring beyond that is off. Take every ring off the bar.
 * The shortest solution for n rings follows the Gray code: (2^(n+1) − 1)/3 moves when n is odd.
 */
export interface NState { n: number; on: boolean[] } // on[0] is ring 1
export const start = (n: number): NState => ({ n, on: new Array(n).fill(true) });
/** Can ring k (0-based) be moved now? */
export function canMove(s: NState, k: number): boolean {
  if (k === 0) return true;
  if (!s.on[k - 1]) return false;
  for (let j = 0; j < k - 1; j++) if (s.on[j]) return false;
  return true;
}
export const move = (s: NState, k: number): NState => (canMove(s, k) ? { ...s, on: s.on.map((v, j) => (j === k ? !v : v)) } : s);
export const done = (s: NState) => s.on.every(v => !v);
/** Fewest moves to take all rings off from this position. */
export function remaining(s: NState): number {
  // Moves to clear: the Gray-code rank of the position read from the innermost ring.
  let bit = 0, rank = 0;
  for (let k = s.n - 1; k >= 0; k--) { bit ^= s.on[k] ? 1 : 0; rank = rank * 2 + bit; }
  return rank;
}
export const optimal = (n: number) => remaining(start(n));
/** The best next ring to move. */
export function bestMove(s: NState): number {
  for (let k = 0; k < s.n; k++) if (canMove(s, k) && remaining(move(s, k)) < remaining(s)) return k;
  return 0;
}
