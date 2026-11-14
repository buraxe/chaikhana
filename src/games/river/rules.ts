/**
 * River crossings (过河问题): get everyone across in a small boat without breaking the
 * scenario's rule. Scenarios are data; a search finds the fewest crossings (or the least
 * time, for the bridge) and the hint.
 */
export interface Who { id: string; icon: string; name: [string, string, string]; rows?: boolean; time?: number; kind?: string }
export interface Scenario {
  id: string; title: [string, string, string]; rule: [string, string, string];
  who: Who[]; cap: number;
  /** Bridge puzzles: crossing costs the slowest walker's time, and the total has a limit. */
  limit?: number;
  /** Is a bank (the set of people on it, without the boat) safe? `boat` is true for the bank where the boat is. */
  safe: (bank: Who[], boat: boolean) => boolean;
  lift: [string, string, string]; // the vehicle: boat / torch
}
const count = (b: Who[], k: string) => b.filter(w => w.kind === k).length;

export const SCENARIOS: Scenario[] = [
  {
    id: 'farmer', title: ['Wolf, goat and cabbage', '农夫过河', 'Kurt, keçi ve lahana'],
    rule: ['The boat holds the farmer and one more. Left alone, the wolf eats the goat and the goat eats the cabbage.', '船上只能坐农夫和另外一样东西。农夫不在时，狼会吃羊，羊会吃白菜。', 'Kayığa çiftçi ve bir şey daha sığar. Yalnız kalınca kurt keçiyi, keçi lahanayı yer.'],
    who: [
      { id: 'f', icon: '👨‍🌾', name: ['Farmer', '农夫', 'Çiftçi'], rows: true, kind: 'f' },
      { id: 'w', icon: '🐺', name: ['Wolf', '狼', 'Kurt'], kind: 'w' },
      { id: 'g', icon: '🐐', name: ['Goat', '羊', 'Keçi'], kind: 'g' },
      { id: 'c', icon: '🥬', name: ['Cabbage', '白菜', 'Lahana'], kind: 'c' },
    ],
    cap: 2, lift: ['boat', '船', 'kayık'],
    safe: b => count(b, 'f') > 0 || !((count(b, 'w') && count(b, 'g')) || (count(b, 'g') && count(b, 'c'))),
  },
  {
    id: 'monks', title: ['Monks and demons', '和尚与妖怪', 'Keşişler ve cinler'],
    rule: ['Three monks and three demons, a boat for two, and anyone can row. If demons ever outnumber monks on a bank (with monks there), the monks are eaten.', '三个和尚和三个妖怪，船最多坐两人，谁都会划船。任何一岸如果有和尚，妖怪就不能比和尚多，否则和尚会被吃掉。', 'Üç keşiş, üç cin, iki kişilik kayık; herkes kürek çekebilir. Bir kıyıda keşiş varken cinler onlardan fazla olursa keşişler yenir.'],
    who: [0, 1, 2].map(i => ({ id: 'm' + i, icon: '🧘', name: ['Monk', '和尚', 'Keşiş'] as [string, string, string], rows: true, kind: 'm' }))
      .concat([0, 1, 2].map(i => ({ id: 'd' + i, icon: '👹', name: ['Demon', '妖怪', 'Cin'] as [string, string, string], rows: true, kind: 'd' }))),
    cap: 2, lift: ['boat', '船', 'kayık'],
    safe: b => !(count(b, 'm') > 0 && count(b, 'd') > count(b, 'm')),
  },
  {
    id: 'bridge', title: ['The night bridge', '夜过独木桥', 'Gece köprüsü'],
    rule: ['Four people, one torch, a bridge for two at a time, 17 minutes. Two walk at the slower one’s pace, and someone must bring the torch back.', '四个人，一支手电筒，桥上一次最多两人，限时17分钟。两人同行按慢的人计时，而且总得有人把手电筒送回来。', 'Dört kişi, bir fener, aynı anda iki kişilik köprü, 17 dakika. İki kişi yavaş olanın hızında yürür ve biri feneri geri getirmeli.'],
    who: [1, 2, 5, 10].map(t => ({ id: 't' + t, icon: t === 1 ? '🏃' : t === 2 ? '🚶' : t === 5 ? '🧓' : '👵', name: [`${t} min`, `${t}分钟`, `${t} dk`] as [string, string, string], rows: true, time: t })),
    cap: 2, limit: 17, lift: ['torch', '手电筒', 'fener'],
    safe: () => true,
  },
  {
    id: 'bridge5', title: ['The long night bridge', '五人过桥', 'Uzun gece köprüsü'],
    rule: ['Five people this time, 1, 3, 6, 8 and 12 minutes, and 30 minutes before the torch dies.', '这次是五个人：1、3、6、8、12分钟，手电筒只能亮30分钟。', 'Bu kez beş kişi: 1, 3, 6, 8 ve 12 dakika; fenerin 30 dakikası var.'],
    who: [1, 3, 6, 8, 12].map(t => ({ id: 't' + t, icon: t === 1 ? '🏃' : t === 3 ? '🚶' : t === 6 ? '🧑‍🦯' : t === 8 ? '🧓' : '👵', name: [`${t} min`, `${t}分钟`, `${t} dk`] as [string, string, string], rows: true, time: t })),
    cap: 2, limit: 30, lift: ['torch', '手电筒', 'fener'],
    safe: () => true,
  },
];

/** A position: bit k set when person k is on the far bank; `far` when the boat is there. */
export interface RState { far: boolean; mask: number; used: number; moves: number }
export const start = (): RState => ({ far: false, mask: 0, used: 0, moves: 0 });
export const allAcross = (s: Scenario, st: RState) => st.mask === (1 << s.who.length) - 1 && (!s.limit || st.used <= s.limit);
const banks = (s: Scenario, mask: number) => [s.who.filter((_, k) => !(mask & (1 << k))), s.who.filter((_, k) => mask & (1 << k))];

/** Why a crossing is not allowed, or null if it is. */
export function check(s: Scenario, st: RState, pick: number[]): 'empty' | 'full' | 'side' | 'rower' | 'unsafe' | null {
  if (!pick.length) return 'empty';
  if (pick.length > s.cap) return 'full';
  if (pick.some(k => !!(st.mask & (1 << k)) !== st.far)) return 'side';
  if (!pick.some(k => s.who[k].rows)) return 'rower';
  let mask = st.mask; for (const k of pick) mask ^= 1 << k;
  const [near, far] = banks(s, mask);
  if (!s.safe(near, !st.far) || !s.safe(far, !st.far)) return 'unsafe';
  return null;
}
export function cross(s: Scenario, st: RState, pick: number[]): RState {
  let mask = st.mask; for (const k of pick) mask ^= 1 << k;
  const cost = s.limit ? Math.max(...pick.map(k => s.who[k].time ?? 1)) : 1;
  return { far: !st.far, mask, used: st.used + cost, moves: st.moves + 1 };
}
function subsets(ids: number[], cap: number): number[][] {
  const out: number[][] = [];
  const go = (i: number, cur: number[]) => { if (cur.length) out.push(cur.slice()); if (cur.length === cap) return; for (let j = i; j < ids.length; j++) { cur.push(ids[j]); go(j + 1, cur); cur.pop(); } };
  go(0, []); return out;
}
/** The best way from here: fewest crossings, or least time on a bridge. Returns the moves, or null. */
export function solve(s: Scenario, st: RState): number[][] | null {
  const key = (far: boolean, mask: number) => mask * 2 + (far ? 1 : 0);
  const goal = (1 << s.who.length) - 1;
  const dist = new Map<number, number>(), prev = new Map<number, [number, number[]]>();
  const k0 = key(st.far, st.mask); dist.set(k0, 0);
  const queue: [number, number][] = [[0, k0]];
  while (queue.length) {
    queue.sort((a, b) => a[0] - b[0]);
    const [d, k] = queue.shift()!;
    if (d > (dist.get(k) ?? Infinity)) continue;
    const far = !!(k & 1), mask = k >> 1;
    if (mask === goal) {
      if (s.limit && st.used + d > s.limit) return null;
      const path: number[][] = []; let c = k;
      while (c !== k0) { const [p, pick] = prev.get(c)!; path.unshift(pick); c = p; }
      return path;
    }
    const here = s.who.map((_, i) => i).filter(i => !!(mask & (1 << i)) === far);
    for (const pick of subsets(here, s.cap)) {
      const cur: RState = { far, mask, used: 0, moves: 0 };
      if (check(s, cur, pick)) continue;
      const nx = cross(s, cur, pick), nk = key(nx.far, nx.mask), nd = d + (s.limit ? nx.used : 1);
      if (nd < (dist.get(nk) ?? Infinity)) { dist.set(nk, nd); prev.set(nk, [k, pick]); queue.push([nd, nk]); }
    }
  }
  return null;
}
/** The shortest whole solution's length (crossings, or minutes). */
export function best(s: Scenario): number {
  const p = solve(s, start())!;
  let st = start(); for (const m of p) st = cross(s, st, m);
  return s.limit ? st.used : p.length;
}
