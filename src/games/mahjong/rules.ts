/**
 * Chinese Mahjong, the plain mainland table game: 136 tiles (no flowers), chow, pung and kong,
 * a hand of four sets and a pair (or seven pairs), and a short list of fan for scoring.
 *
 * Tiles: kinds 0–8 characters (万), 9–17 dots (筒), 18–26 bamboo (条), 27–30 the winds
 * east, south, west, north, 31–33 the dragons red (中), green (发) and white (白).
 * There are four of each kind; tile id = kind * 4 + copy.
 */
export const KINDS = 34;
export const kindOf = (id: number) => id >> 2;
export const suitOf = (k: number) => (k < 27 ? Math.floor(k / 9) : 3); // 0 m, 1 p, 2 s, 3 honour
export const rankOf = (k: number) => (k < 27 ? (k % 9) + 1 : 0);
export const isHonour = (k: number) => k >= 27;
export const isTerminal = (k: number) => k < 27 && (k % 9 === 0 || k % 9 === 8);

export type MeldType = 'chow' | 'pung' | 'kong' | 'ckong';
/** An exposed set (or a concealed kong). kinds is sorted; from is who discarded the claimed tile. */
export interface Meld { type: MeldType; kinds: number[]; tiles: number[]; from?: number }
export type Phase = 'draw' | 'discard' | 'claim' | 'end';

export interface Fan { id: string; pts: number }
export interface End {
  winner: number; // −1: the wall ran out
  from: number; // the discarder, or −1 for a self-drawn win
  tile?: number;
  fans: Fan[];
  points: number;
  /** what each seat gains or loses this hand */
  delta: number[];
}
export interface MJ {
  wall: number[]; // draw from the front; kong replacements come from the back
  hands: number[][]; // concealed tiles
  melds: Meld[][];
  river: number[][]; // each seat's discards, in order; claimed tiles stay, marked in `taken`
  taken: number[]; // discarded tile ids that someone claimed
  dealer: number;
  round: number; // prevailing wind, 0 east
  turn: number;
  phase: Phase;
  drawn: number | null; // the tile the player on turn just drew
  last: { seat: number; tile: number } | null; // the discard waiting for claims
  kongDraw: boolean; // the tile in hand came from behind a kong
  end?: End;
}

export function shuffle(rng: () => number): number[] {
  const a = Array.from({ length: 136 }, (_, i) => i);
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}
export const byKind = (a: number, b: number) => a - b; // ids sort by kind already

export function newHand(dealer: number, rng: () => number, round = 0): MJ {
  const wall = shuffle(rng), hands: number[][] = [[], [], [], []];
  for (let r = 0; r < 13; r++) for (let k = 0; k < 4; k++) hands[(dealer + k) % 4].push(wall.shift()!);
  const st: MJ = { wall, hands, melds: [[], [], [], []], river: [[], [], [], []], taken: [], dealer, round, turn: dealer, phase: 'draw', drawn: null, last: null, kongDraw: false };
  hands.forEach(h => h.sort(byKind));
  return draw(st);
}

export function counts(ids: number[]): number[] {
  const c = new Array(KINDS).fill(0);
  for (const id of ids) c[kindOf(id)]++;
  return c;
}

// ---------- Shanten: how many tiles away from ready (0 = ready, −1 = complete) ----------

function stdShanten(c: number[], melds: number): number {
  let best = 8;
  const go = (i: number, m: number, t: number, p: number) => {
    while (i < KINDS && !c[i]) i++;
    if (i >= KINDS) {
      const tt = Math.min(t, 4 - m);
      const s = 8 - 2 * m - tt - p;
      if (s < best) best = s;
      return;
    }
    if (m < 4 && c[i] >= 3) { c[i] -= 3; go(i, m + 1, t, p); c[i] += 3; }
    const seq = i < 27 && i % 9 <= 6;
    if (m < 4 && seq && c[i + 1] && c[i + 2]) { c[i]--; c[i + 1]--; c[i + 2]--; go(i, m + 1, t, p); c[i]++; c[i + 1]++; c[i + 2]++; }
    if (!p && c[i] >= 2) { c[i] -= 2; go(i, m, t, 1); c[i] += 2; }
    if (m + t < 4) {
      if (c[i] >= 2) { c[i] -= 2; go(i, m, t + 1, p); c[i] += 2; }
      if (i < 27 && i % 9 <= 7 && c[i + 1]) { c[i]--; c[i + 1]--; go(i, m, t + 1, p); c[i]++; c[i + 1]++; }
      if (seq && c[i + 2]) { c[i]--; c[i + 2]--; go(i, m, t + 1, p); c[i]++; c[i + 2]++; }
    }
    c[i]--; go(i, m, t, p); c[i]++;
  };
  go(0, melds, 0, 0);
  return best;
}
function pairsShanten(c: number[]): number {
  let pairs = 0, kinds = 0;
  for (const n of c) { if (n) kinds++; if (n >= 2) pairs++; }
  return 6 - pairs + Math.max(0, 7 - kinds);
}
/** Shanten of concealed counts with `melds` sets already exposed. */
export function shanten(c: number[], melds: number): number {
  const s = stdShanten(c.slice(), melds);
  return melds ? s : Math.min(s, pairsShanten(c));
}
export const isComplete = (c: number[], melds: number) => shanten(c, melds) === -1;

/** Kinds that would complete a 13-tile (3n+1) hand. */
export function waits(hand: number[], melds: number): number[] {
  const c = counts(hand), out: number[] = [];
  for (let k = 0; k < KINDS; k++) {
    if (c[k] >= 4) continue;
    c[k]++; if (isComplete(c, melds)) out.push(k); c[k]--;
  }
  return out;
}

// ---------- Scoring ----------

const allPungs = (c: number[]) => { let pair = 0; for (const n of c) { if (n === 2) pair++; else if (n && n !== 3) return false; } return pair === 1; };
const isPairs = (c: number[]) => c.every((n): boolean => n === 0 || n === 2 || n === 4) && c.reduce((a: number, b: number) => a + b, 0) === 14;

/** The fan a complete hand scores. `win` is the full concealed hand including the winning tile. */
export function fansFor(st: MJ, seat: number, win: number[], self: boolean): Fan[] {
  const c = counts(win), melds = st.melds[seat], fans: Fan[] = [];
  const all = c.slice(); for (const m of melds) for (const k of m.kinds) all[k]++;
  const exposed = melds.some(m => m.type !== 'ckong');
  const kinds = all.map((n, k) => (n ? k : -1)).filter(k => k >= 0);
  const suits = new Set(kinds.filter(k => !isHonour(k)).map(suitOf)), honours = kinds.some(isHonour);
  const pairsHand = !melds.length && isPairs(c);
  fans.push({ id: 'win', pts: 1 });
  if (self) fans.push({ id: 'self', pts: 1 });
  if (!exposed) fans.push({ id: 'concealed', pts: 1 });
  if (pairsHand) fans.push({ id: 'pairs', pts: 3 });
  else if (allPungs(c) && melds.every(m => m.type !== 'chow')) fans.push({ id: 'pungs', pts: 2 });
  if (!honours && suits.size === 1) fans.push({ id: 'flush', pts: 5 });
  else if (honours && suits.size === 1) fans.push({ id: 'half', pts: 2 });
  else if (honours && suits.size === 0) fans.push({ id: 'honours', pts: 8 });
  if (kinds.every(k => !isHonour(k) && !isTerminal(k))) fans.push({ id: 'simples', pts: 1 });
  // Pungs (or kongs) of dragons, the seat wind and the prevailing wind.
  const pungOf = (k: number) => all[k] >= 3 && (c[k] >= 3 || melds.some(m => m.type !== 'chow' && m.kinds[0] === k));
  for (const k of [31, 32, 33]) if (pungOf(k)) fans.push({ id: 'dragon', pts: 1 });
  const seatWind = 27 + ((seat - st.dealer + 4) % 4), roundWind = 27 + st.round;
  if (pungOf(seatWind)) fans.push({ id: 'seatwind', pts: 1 });
  if (pungOf(roundWind)) fans.push({ id: 'roundwind', pts: 1 });
  if (self && st.kongDraw) fans.push({ id: 'kongbloom', pts: 1 });
  if (self && !st.wall.length) fans.push({ id: 'lastdraw', pts: 1 });
  if (!self && !st.wall.length) fans.push({ id: 'lastdiscard', pts: 1 });
  return fans;
}
/** Self-drawn: each other player pays the points. On a discard, the discarder pays double. */
export function payments(winner: number, from: number, points: number): number[] {
  const d = [0, 0, 0, 0];
  if (from < 0) { for (let k = 0; k < 4; k++) if (k !== winner) { d[k] -= points; d[winner] += points; } }
  else { d[from] -= points * 2; d[winner] += points * 2; }
  return d;
}

// ---------- Moves ----------

const clone = (st: MJ): MJ => ({ ...st, wall: st.wall.slice(), hands: st.hands.map(h => h.slice()), melds: st.melds.map(m => m.slice()), river: st.river.map(r => r.slice()), taken: st.taken.slice() });
const exhausted = (st: MJ): MJ => ({ ...st, phase: 'end', drawn: null, last: null, end: { winner: -1, from: -1, fans: [], points: 0, delta: [0, 0, 0, 0] } });

/** The player on turn draws from the wall (or from the back, after a kong). */
export function draw(st0: MJ, back = false): MJ {
  if (!st0.wall.length) return exhausted(st0);
  const st = clone(st0), id = back ? st.wall.pop()! : st.wall.shift()!;
  st.hands[st.turn].push(id); st.hands[st.turn].sort(byKind);
  return { ...st, phase: 'discard', drawn: id, last: null, kongDraw: back };
}

export interface SelfOptions { win: boolean; kongs: { kind: number; added: boolean }[] }
export function selfOptions(st: MJ): SelfOptions {
  if (st.phase !== 'discard') return { win: false, kongs: [] };
  const h = st.hands[st.turn], c = counts(h), melds = st.melds[st.turn];
  const kongs: SelfOptions['kongs'] = [];
  if (st.wall.length) {
    for (let k = 0; k < KINDS; k++) if (c[k] === 4) kongs.push({ kind: k, added: false });
    for (const m of melds) if (m.type === 'pung' && c[m.kinds[0]]) kongs.push({ kind: m.kinds[0], added: true });
  }
  return { win: isComplete(c, melds.length), kongs };
}

export function discard(st0: MJ, id: number): MJ {
  const st = clone(st0), h = st.hands[st.turn], i = h.indexOf(id);
  if (st.phase !== 'discard' || i < 0) return st0;
  h.splice(i, 1); st.river[st.turn].push(id);
  return { ...st, phase: 'claim', drawn: null, last: { seat: st.turn, tile: id }, kongDraw: false };
}

export interface ClaimOptions { win: boolean; pung: boolean; kong: boolean; chows: number[][] }
/** What a seat may do with the waiting discard. */
export function claimOptions(st: MJ, seat: number): ClaimOptions {
  const none = { win: false, pung: false, kong: false, chows: [] };
  if (st.phase !== 'claim' || !st.last || seat === st.last.seat) return none;
  const k = kindOf(st.last.tile), c = counts(st.hands[seat]), melds = st.melds[seat].length;
  c[k]++; const win = isComplete(c, melds); c[k]--;
  const chows: number[][] = [];
  if (seat === (st.last.seat + 1) % 4 && k < 27) {
    const r = k % 9;
    for (const s of [k - 2, k - 1, k]) {
      if (s < k - r || s + 2 > k - r + 8) continue;
      const need = [s, s + 1, s + 2].filter(x => x !== k);
      if (need.every(x => c[x] > 0)) chows.push([s, s + 1, s + 2]);
    }
  }
  return { win, pung: c[k] >= 2, kong: c[k] >= 3 && st.wall.length > 0, chows };
}

export type Claim = { type: 'win' } | { type: 'pung' } | { type: 'kong' } | { type: 'chow'; kinds: number[] } | { type: 'pass' };

function takeKinds(hand: number[], kinds: number[]): number[] {
  const out: number[] = [];
  for (const k of kinds) { const i = hand.findIndex(id => kindOf(id) === k); out.push(hand.splice(i, 1)[0]); }
  return out;
}
function finishWin(st: MJ, seat: number, from: number, tile: number): MJ {
  const self = from < 0, win = self ? st.hands[seat] : [...st.hands[seat], tile];
  const fans = fansFor(st, seat, win, self), points = fans.reduce((a, f) => a + f.pts, 0);
  const hands = st.hands.slice(); hands[seat] = win.slice().sort(byKind);
  return { ...st, hands, phase: 'end', drawn: null, last: null, end: { winner: seat, from, tile, fans, points, delta: payments(seat, from, points) } };
}

/** Settles the claims on a discard. A win beats pung and kong, which beat chow; ties go to the next seat in turn. */
export function resolve(st0: MJ, claims: Claim[]): MJ {
  const last = st0.last!;
  const order = [1, 2, 3].map(d => (last.seat + d) % 4);
  const winner = order.find(s => claims[s]?.type === 'win' && claimOptions(st0, s).win);
  if (winner !== undefined) { const st = clone(st0); st.taken.push(last.tile); return finishWin(st, winner, last.seat, last.tile); }
  const pk = order.find(s => (claims[s]?.type === 'pung' && claimOptions(st0, s).pung) || (claims[s]?.type === 'kong' && claimOptions(st0, s).kong));
  const ch = order.find(s => claims[s]?.type === 'chow');
  const seat = pk ?? ch;
  if (seat === undefined) return draw({ ...st0, turn: (last.seat + 1) % 4, phase: 'draw', last: null });
  const st = clone(st0), cl = claims[seat]!, k = kindOf(last.tile), h = st.hands[seat];
  st.taken.push(last.tile);
  let meld: Meld;
  if (cl.type === 'chow') {
    const need = cl.kinds.filter(x => x !== k);
    meld = { type: 'chow', kinds: cl.kinds.slice(), tiles: [...takeKinds(h, need), last.tile].sort(byKind), from: last.seat };
  } else if (cl.type === 'kong') meld = { type: 'kong', kinds: [k, k, k, k], tiles: [...takeKinds(h, [k, k, k]), last.tile], from: last.seat };
  else meld = { type: 'pung', kinds: [k, k, k], tiles: [...takeKinds(h, [k, k]), last.tile], from: last.seat };
  st.melds[seat].push(meld);
  const next: MJ = { ...st, turn: seat, last: null, drawn: null, phase: 'discard', kongDraw: false };
  return cl.type === 'kong' ? draw({ ...next, phase: 'draw' }, true) : next;
}

/** Declares a self-drawn win. */
export const winSelf = (st: MJ): MJ => (selfOptions(st).win ? finishWin(clone(st), st.turn, -1, st.drawn ?? st.hands[st.turn][st.hands[st.turn].length - 1]) : st);

/** A concealed kong (four in hand) or an added kong (the fourth tile onto an exposed pung). */
export function selfKong(st0: MJ, kind: number): MJ {
  const st = clone(st0), seat = st.turn, h = st.hands[seat];
  const pi = st.melds[seat].findIndex(m => m.type === 'pung' && m.kinds[0] === kind);
  if (pi >= 0) {
    const m = st.melds[seat][pi];
    st.melds[seat][pi] = { ...m, type: 'kong', kinds: [kind, kind, kind, kind], tiles: [...m.tiles, ...takeKinds(h, [kind])] };
  } else st.melds[seat].push({ type: 'ckong', kinds: [kind, kind, kind, kind], tiles: takeKinds(h, [kind, kind, kind, kind]) });
  return draw({ ...st, phase: 'draw', drawn: null }, true);
}

/** Every tile a seat can see: its own hand, all rivers and all exposed melds. */
export function seen(st: MJ, seat: number): number[] {
  const c = counts(st.hands[seat]);
  st.river.forEach(r => r.forEach(id => { if (!st.taken.includes(id)) c[kindOf(id)]++; }));
  st.melds.forEach((ms, s) => ms.forEach(m => { if (m.type === 'ckong' && s !== seat) return; m.kinds.forEach(k => c[k]++); }));
  return c;
}
