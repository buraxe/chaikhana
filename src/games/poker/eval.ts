/** Texas Hold'em hand strength: the best five of up to seven cards, as one comparable number. */
import { rankOf, suitOf, type Card } from '../cards/deck';

const B = 13, CAT = B ** 5;
export const CATEGORY: [string, string, string][] = [
  ['High card', '高牌', 'Yüksek kart'], ['One pair', '一对', 'Bir per'], ['Two pair', '两对', 'Döper'], ['Three of a kind', '三条', 'Üçlü'],
  ['Straight', '顺子', 'Kent'], ['Flush', '同花', 'Floş'], ['Full house', '葫芦', 'Ful'], ['Four of a kind', '四条', 'Kare'], ['Straight flush', '同花顺', 'Floş rağ'],
];
const enc = (cat: number, ks: number[]) => cat * CAT + ks.slice(0, 5).reduce((a, k, i) => a + k * B ** (4 - i), 0);
function straightHigh(mask: number): number {
  for (let h = 12; h >= 4; h--) if (((mask >> (h - 4)) & 31) === 31) return h;
  if ((mask & 0b1000000001111) === 0b1000000001111) return 3; // A-2-3-4-5
  return -1;
}
export function evaluate(cards: Card[]): number {
  const rc = new Array(13).fill(0), suits: number[][] = [[], [], [], []];
  let mask = 0;
  for (const c of cards) { const r = rankOf(c); rc[r]++; suits[suitOf(c)].push(r); mask |= 1 << r; }
  const fl = suits.find(s => s.length >= 5);
  if (fl) { const m = fl.reduce((a, r) => a | (1 << r), 0), sf = straightHigh(m); if (sf >= 0) return enc(8, [sf]); }
  const quads: number[] = [], trips: number[] = [], pairs: number[] = [], singles: number[] = [];
  for (let r = 12; r >= 0; r--) (rc[r] === 4 ? quads : rc[r] === 3 ? trips : rc[r] === 2 ? pairs : rc[r] === 1 ? singles : []).push(r);
  const rest = (skip: number[]) => { const o: number[] = []; for (let r = 12; r >= 0; r--) if (rc[r] && !skip.includes(r)) o.push(r); return o; };
  if (quads.length) return enc(7, [quads[0], rest([quads[0]])[0]]);
  if (trips.length && (trips.length > 1 || pairs.length)) return enc(6, [trips[0], trips.length > 1 ? Math.max(trips[1], pairs[0] ?? -1) : pairs[0]]);
  if (fl) return enc(5, fl.slice().sort((a, b) => b - a));
  const st = straightHigh(mask);
  if (st >= 0) return enc(4, [st]);
  if (trips.length) return enc(3, [trips[0], ...rest([trips[0]])]);
  if (pairs.length > 1) return enc(2, [pairs[0], pairs[1], rest([pairs[0], pairs[1]])[0]]);
  if (pairs.length) return enc(1, [pairs[0], ...rest([pairs[0]])]);
  return enc(0, rest([]));
}
export const categoryOf = (score: number) => Math.floor(score / CAT);
