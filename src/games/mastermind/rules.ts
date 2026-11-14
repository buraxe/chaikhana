/**
 * Mastermind. A secret code of pegs; each guess is answered with black pegs (right colour,
 * right place) and white pegs (right colour, wrong place). The computer can also be the
 * guesser, using Knuth's minimax strategy (4 pegs, 6 colours: never more than 5 guesses).
 */
export interface Variant { pegs: number; colors: number; repeats: boolean; tries: number }
export const VARIANTS: Record<string, Variant> = {
  easy: { pegs: 4, colors: 6, repeats: false, tries: 10 },
  classic: { pegs: 4, colors: 6, repeats: true, tries: 10 },
  hard: { pegs: 5, colors: 8, repeats: true, tries: 12 },
};
export function score(secret: number[], guess: number[]): [number, number] {
  let black = 0;
  const a: number[] = [], b: number[] = [];
  secret.forEach((s, i) => { if (s === guess[i]) black++; else { a.push(s); b.push(guess[i]); } });
  let white = 0;
  for (const g of b) { const k = a.indexOf(g); if (k >= 0) { white++; a.splice(k, 1); } }
  return [black, white];
}
export function allCodes(v: Variant): number[][] {
  const out: number[][] = [];
  const rec = (cur: number[]) => {
    if (cur.length === v.pegs) { out.push(cur.slice()); return; }
    for (let c = 0; c < v.colors; c++) if (v.repeats || !cur.includes(c)) { cur.push(c); rec(cur); cur.pop(); }
  };
  rec([]);
  return out;
}
export const randomCode = (v: Variant, rng: () => number) => { const pool = allCodes(v); return pool[Math.floor(rng() * pool.length)]; };

/**
 * The computer's next guess. 'consistent' plays any code that fits every answer so far;
 * 'knuth' picks the guess whose worst-case answer leaves the fewest codes possible.
 */
export function nextGuess(v: Variant, history: { guess: number[]; result: [number, number] }[], strategy: 'consistent' | 'knuth', rng: () => number = Math.random): number[] {
  const all = allCodes(v);
  const possible = all.filter(c => history.every(h => { const s = score(c, h.guess); return s[0] === h.result[0] && s[1] === h.result[1]; }));
  if (!history.length && strategy === 'knuth' && v.pegs === 4 && v.colors === 6 && v.repeats) return [0, 0, 1, 1];
  if (strategy === 'consistent' || possible.length <= 2) return possible[Math.floor(rng() * possible.length)] ?? all[0];
  const candidates = all.length > 2000 ? possible : all;
  let best = possible[0], bestWorst = Infinity, bestIsPossible = true;
  for (const g of candidates) {
    const buckets = new Map<string, number>();
    for (const c of possible) { const k = score(c, g).join(); buckets.set(k, (buckets.get(k) ?? 0) + 1); }
    const worst = Math.max(...buckets.values());
    const isPossible = possible.some(c => c.every((x, i) => x === g[i]));
    if (worst < bestWorst || (worst === bestWorst && isPossible && !bestIsPossible)) { best = g; bestWorst = worst; bestIsPossible = isPossible; }
  }
  return best;
}
