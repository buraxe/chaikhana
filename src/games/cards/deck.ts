/**
 * A standard 52-card deck. A card is a number 0–51: suit = ⌊c/13⌋ (0 ♠, 1 ♥, 2 ♦, 3 ♣),
 * rank = c mod 13 (0 is a two … 8 a ten, 9 J, 10 Q, 11 K, 12 A).
 */
import { mulberry32, shuffle, type Rng } from '../../core/rng';

export type Card = number;
export const suitOf = (c: Card) => Math.floor(c / 13);
export const rankOf = (c: Card) => c % 13;
export const card = (suit: number, rank: number) => suit * 13 + rank;
export const SUITS = ['♠', '♥', '♦', '♣'];
export const RANKS = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
export const RANKS_TR = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'V', 'K', 'P', 'A'];
export const isRed = (c: Card) => suitOf(c) === 1 || suitOf(c) === 2;
export const J = 9, Q = 10, K = 11, A = 12;
export const HEARTS = 1;
export const SUIT_NAMES: [string, string, string][] = [['spades', '黑桃', 'maça'], ['hearts', '红心', 'kupa'], ['diamonds', '方块', 'karo'], ['clubs', '梅花', 'sinek']];
export const RANK_NAMES: [string, string, string][] = [
  ['2', '2', '2'], ['3', '3', '3'], ['4', '4', '4'], ['5', '5', '5'], ['6', '6', '6'], ['7', '7', '7'], ['8', '8', '8'], ['9', '9', '9'], ['10', '10', '10'],
  ['jack', 'J', 'vale'], ['queen', 'Q', 'kız'], ['king', 'K', 'papaz'], ['ace', 'A', 'as'],
];
export const newDeck = (rng: Rng = Math.random): Card[] => shuffle(Array.from({ length: 52 }, (_, i) => i), rng);
export const freshRng = () => mulberry32((Date.now() ^ Math.floor(Math.random() * 1e9)) >>> 0);
/** Hand order: suits alternating colour (♠ ♥ ♣ ♦), low to high inside each. */
const SUIT_ORDER = [0, 1, 3, 2];
export const sortHand = (h: Card[], trump: number | null = null) => h.slice().sort((a, b) => {
  const sa = suitOf(a) === trump ? -1 : SUIT_ORDER.indexOf(suitOf(a)), sb = suitOf(b) === trump ? -1 : SUIT_ORDER.indexOf(suitOf(b));
  return sa - sb || rankOf(a) - rankOf(b);
});
export function cardName(c: Card, lang: 'en' | 'zh' | 'tr') {
  const k = lang === 'zh' ? 1 : lang === 'tr' ? 2 : 0, s = SUIT_NAMES[suitOf(c)][k], r = RANK_NAMES[rankOf(c)][k];
  return lang === 'zh' ? `${s}${r}` : lang === 'tr' ? `${s} ${r}` : `${r} of ${s}`;
}
