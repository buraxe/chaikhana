/**
 * Matchstick equations: digits drawn with seven matches each (a seven-segment display), a plus
 * or minus sign, and a fixed equals sign. The equation shown is false; move one match (or two)
 * so that it is true. Puzzles are made by walking back from a true equation and checking that
 * no true equation is fewer moves away, so the stated number of moves is really needed.
 */
// Segments: 0 top, 1 top-right, 2 bottom-right, 3 bottom, 4 bottom-left, 5 top-left, 6 middle.
export const DIGIT_SEGS: number[] = [0b0111111, 0b0000110, 0b1011011, 0b1001111, 0b1100110, 0b1101101, 0b1111101, 0b0000111, 0b1111111, 0b1101111];
const DIGIT_OF = new Map(DIGIT_SEGS.map((m, d) => [m, d]));
export const segCount = (m: number) => { let n = 0; for (let k = 0; k < 7; k++) if (m & (1 << k)) n++; return n; };

/** A slot is a digit (7 positions) or the sign (bit 0 the bar, bit 1 the upright: bar alone is minus, both plus). */
export type Slot = { k: 'd'; m: number } | { k: 'op'; m: number } | { k: 'eq' };
export type Eq = Slot[];

export function parse(s: string): Eq {
  return [...s].map((ch): Slot => (ch === '=' ? { k: 'eq' } : ch === '+' ? { k: 'op', m: 3 } : ch === '-' ? { k: 'op', m: 1 } : { k: 'd', m: DIGIT_SEGS[Number(ch)] }));
}
/** The equation as text, or null if some slot is not a real symbol. */
export function show(e: Eq): string | null {
  let out = '';
  for (const s of e) {
    if (s.k === 'eq') out += '=';
    else if (s.k === 'op') { if (s.m === 3) out += '+'; else if (s.m === 1) out += '-'; else return null; }
    else { const d = DIGIT_OF.get(s.m); if (d === undefined) return null; out += d; }
  }
  return out;
}
/** True when it reads as a ± b = c with no leading zeros and the sum holds. */
export function isTrue(e: Eq): boolean {
  const s = show(e); if (!s) return false;
  const m = /^(\d+)([+-])(\d+)=(\d+)$/.exec(s); if (!m) return false;
  if ([m[1], m[3], m[4]].some(x => x.length > 1 && x[0] === '0')) return false;
  const a = +m[1], b = +m[3], c = +m[4];
  return (m[2] === '+' ? a + b : a - b) === c;
}
const valid = (e: Eq) => show(e) !== null;
const key = (e: Eq) => e.map(s => (s.k === 'eq' ? '=' : s.k + s.m)).join(',');

/** A match position: slot index and bit. */
export type Pos = [slot: number, bit: number];
export function positions(e: Eq): { on: Pos[]; off: Pos[] } {
  const on: Pos[] = [], off: Pos[] = [];
  e.forEach((s, i) => { if (s.k === 'eq') return; const n = s.k === 'd' ? 7 : 2; for (let b = 0; b < n; b++) ((s.m >> b) & 1 ? on : off).push([i, b]); });
  return { on, off };
}
export function moveMatch(e: Eq, from: Pos, to: Pos): Eq {
  const out = e.map(s => ({ ...s })) as Eq;
  (out[from[0]] as { m: number }).m &= ~(1 << from[1]);
  (out[to[0]] as { m: number }).m |= 1 << to[1];
  return out;
}
/** Every valid equation one match move away. */
export function neighbours(e: Eq): Eq[] {
  const { on, off } = positions(e), out: Eq[] = [];
  for (const f of on) for (const t of off) { const n = moveMatch(e, f, t); if (valid(n)) out.push(n); }
  return out;
}
/** Smallest number of moves (up to `max`) from e to a true equation, or Infinity. */
export function distance(e: Eq, max: number): number {
  let frontier = [e]; const seen = new Set([key(e)]);
  for (let d = 0; d <= max; d++) {
    if (frontier.some(isTrue)) return d;
    if (d === max) break;
    const next: Eq[] = [];
    for (const x of frontier) for (const n of neighbours(x)) { const k = key(n); if (!seen.has(k)) { seen.add(k); next.push(n); } }
    frontier = next;
  }
  return Infinity;
}
/** The true equations reachable in exactly `k` moves (for showing an answer). */
export function answers(e: Eq, k: number): string[] {
  let frontier = [e];
  for (let d = 0; d < k; d++) frontier = frontier.flatMap(neighbours);
  return [...new Set(frontier.filter(isTrue).map(x => show(x)!))];
}

export type Level = 'easy' | 'hard';
function randomTrue(level: Level, rnd: () => number): string {
  const big = level === 'hard';
  for (;;) {
    const a = Math.floor(rnd() * (big ? 30 : 10)), b = Math.floor(rnd() * (big ? 20 : 10)), plus = rnd() < 0.5;
    const c = plus ? a + b : a - b;
    if (c < 0 || (!big && c > 9)) continue;
    return `${a}${plus ? '+' : '-'}${b}=${c}`;
  }
}
export interface MPuzzle { start: string; moves: number; level: Level }
/** Walk `moves` steps away from a true equation to a false one that truly needs that many moves. */
export function generate(moves: 1 | 2, level: Level, rnd: () => number = Math.random): MPuzzle {
  for (;;) {
    let e = parse(randomTrue(level, rnd));
    for (let s = 0; s < moves; s++) { const ns = neighbours(e); if (!ns.length) break; e = ns[Math.floor(rnd() * ns.length)]; }
    const str = show(e)!;
    if (!/^\d+[+-]\d+=\d+$/.test(str) || /(^|[+=-])0\d/.test(str)) continue;
    if (distance(e, moves) === moves) return { start: str, moves, level };
  }
}
