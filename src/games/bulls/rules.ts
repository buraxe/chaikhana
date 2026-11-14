/** Sayı Bulmaca (Bulls and Cows): a secret number with distinct digits, the first not 0. */
export function secret(len: number, rng: () => number = Math.random): string {
  const d = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
  for (let i = d.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [d[i], d[j]] = [d[j], d[i]]; }
  if (d[0] === '0') { const k = d.findIndex((x, i) => i > 0 && i < len); [d[0], d[k]] = [d[k], d[0]]; }
  return d.slice(0, len).join('');
}
/** + is a right digit in the right place, − a right digit in the wrong place. */
export function score(secretS: string, guess: string): [plus: number, minus: number] {
  let plus = 0, minus = 0;
  for (let i = 0; i < guess.length; i++) { if (guess[i] === secretS[i]) plus++; else if (secretS.includes(guess[i])) minus++; }
  return [plus, minus];
}
export const validGuess = (g: string, len: number) => g.length === len && /^\d+$/.test(g) && g[0] !== '0' && new Set(g).size === len;
/** Every number still consistent with the clues so far. */
export function candidates(len: number, rows: { guess: string; plus: number; minus: number }[]): string[] {
  const out: string[] = [];
  const rec = (pre: string) => {
    if (pre.length === len) { if (rows.every(r => { const [p, m] = score(pre, r.guess); return p === r.plus && m === r.minus; })) out.push(pre); return; }
    for (let d = pre.length ? 0 : 1; d <= 9; d++) if (!pre.includes(String(d))) rec(pre + d);
  };
  rec('');
  return out;
}
