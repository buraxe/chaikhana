/**
 * Shogi on 9×9; index = row·9 + col, row 0 is Gote's back rank. Sente (moves first, turn 1)
 * is upper case. Pieces: K R B G S N L P, promoted "+R" etc. Captured pieces go to the hand
 * and can be dropped. A move is (from·81 + to)·2 + promote, where a from of 81–87 is a drop
 * of R B G S N L P. Covers forced promotion, nifu, no dead drops and no pawn-drop mate.
 */
import type { Level } from '../../core/match';
import { think, type Engine } from '../boards/search';

export const HAND = ['R', 'B', 'G', 'S', 'N', 'L', 'P'];
export interface SState { board: string[]; hands: [number[], number[]]; turn: 1 | 2; moves: number[]; winner: 0 | 1 | 2; draw: boolean; reason: '' | 'mate' | 'repetition' | 'long'; check: boolean; seen: Record<string, number> }
export const START = 'lnsgkgsnl/1r5b1/ppppppppp/9/9/9/PPPPPPPPP/1B5R1/LNSGKGSNL b -';
const col = (i: number) => i % 9, row = (i: number) => Math.floor(i / 9);
export const isSente = (p: string) => p !== '' && p.replace('+', '') === p.replace('+', '').toUpperCase();
const own = (p: string, s: boolean) => p !== '' && isSente(p) === s;
const base = (p: string) => p.replace('+', '').toUpperCase();
export const enc = (from: number, to: number, pro: boolean) => (from * 81 + to) * 2 + (pro ? 1 : 0);
export const dec = (m: number) => ({ from: Math.floor(m / 2 / 81), to: Math.floor(m / 2) % 81, pro: m % 2 === 1 });

export function fromSfen(sfen: string): SState {
  const [pos, side, hand] = sfen.split(' '), board: string[] = [];
  let plus = false;
  for (const ch of pos.replace(/\//g, '')) {
    if (ch === '+') { plus = true; continue; }
    if (/\d/.test(ch)) for (let k = 0; k < +ch; k++) board.push(''); else { board.push((plus ? '+' : '') + ch); plus = false; }
  }
  const hands: [number[], number[]] = [[0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0]];
  if (hand && hand !== '-') { let n = 0; for (const ch of hand) { if (/\d/.test(ch)) { n = n * 10 + +ch; continue; } const s = ch === ch.toUpperCase() ? 0 : 1; hands[s][HAND.indexOf(ch.toUpperCase())] += n || 1; n = 0; } }
  const st: SState = { board, hands, turn: side === 'w' ? 2 : 1, moves: [], winner: 0, draw: false, reason: '', check: false, seen: {} };
  st.check = inCheck(st, st.turn === 1); st.seen[key(st)] = 1;
  return finish(st);
}
export function toSfen(st: SState) {
  let s = '';
  for (let r = 0; r < 9; r++) { let e = 0; for (let c = 0; c < 9; c++) { const p = st.board[r * 9 + c]; if (!p) e++; else { if (e) s += e; e = 0; s += p; } } if (e) s += e; if (r < 8) s += '/'; }
  let h = '';
  for (const side of [0, 1]) HAND.forEach((t, k) => { const n = st.hands[side][k]; if (n) h += (n > 1 ? n : '') + (side ? t.toLowerCase() : t); });
  return `${s} ${st.turn === 1 ? 'b' : 'w'} ${h || '-'}`;
}
const key = (st: { board: string[]; hands: number[][]; turn: number }) => st.board.map(p => p || '.').join(',') + st.hands.join('|') + st.turn;
export const newGame = () => fromSfen(START);

const GOLD: [number, number][] = [[-1, 0], [-1, -1], [-1, 1], [0, -1], [0, 1], [1, 0]];
const STEPS: Record<string, [number, number][]> = {
  K: [[-1, 0], [-1, -1], [-1, 1], [0, -1], [0, 1], [1, 0], [1, -1], [1, 1]], G: GOLD, S: [[-1, 0], [-1, -1], [-1, 1], [1, -1], [1, 1]],
  N: [[-2, -1], [-2, 1]], P: [[-1, 0]], '+P': GOLD, '+L': GOLD, '+N': GOLD, '+S': GOLD, '+R': [[-1, -1], [-1, 1], [1, -1], [1, 1]], '+B': [[-1, 0], [1, 0], [0, -1], [0, 1]],
};
const SLIDES: Record<string, [number, number][]> = { R: [[-1, 0], [1, 0], [0, -1], [0, 1]], B: [[-1, -1], [-1, 1], [1, -1], [1, 1]], L: [[-1, 0]] };
SLIDES['+R'] = SLIDES.R; SLIDES['+B'] = SLIDES.B;
const zone = (r: number, s: boolean) => (s ? r <= 2 : r >= 6);
const mustPromote = (t: string, r: number, s: boolean) => { const fr = s ? r : 8 - r; return ((t === 'P' || t === 'L') && fr === 0) || (t === 'N' && fr <= 1); };

/** Board moves only (no drops), ignoring checks. */
function boardMoves(b: string[], s: boolean, out: number[]) {
  const f = s ? 1 : -1;
  for (let i = 0; i < 81; i++) {
    const p = b[i]; if (!own(p, s)) continue;
    const t = p.startsWith('+') ? '+' + base(p) : base(p), r = row(i), c = col(i);
    const push = (to: number) => {
      const canPro = !t.startsWith('+') && t !== 'K' && t !== 'G' && (zone(r, s) || zone(row(to), s));
      if (!mustPromote(t, row(to), s)) out.push(enc(i, to, false));
      if (canPro) out.push(enc(i, to, true));
    };
    for (const [dr, dc] of STEPS[t] ?? []) { const rr = r + dr * f, cc = c + dc * f; if (rr < 0 || rr > 8 || cc < 0 || cc > 8) continue; const to = rr * 9 + cc; if (!own(b[to], s)) push(to); }
    for (const [dr, dc] of SLIDES[t] ?? []) { let rr = r, cc = c; for (;;) { rr += dr * f; cc += dc * f; if (rr < 0 || rr > 8 || cc < 0 || cc > 8) break; const to = rr * 9 + cc; if (own(b[to], s)) break; push(to); if (b[to]) break; } }
  }
}
function attackedKing(b: string[], s: boolean): boolean {
  const k = b.indexOf(s ? 'K' : 'k'); if (k < 0) return true;
  const ms: number[] = []; boardMoves(b, !s, ms);
  return ms.some(m => dec(m).to === k);
}
export const inCheck = (st: { board: string[] }, s: boolean) => attackedKing(st.board, s);
type Pos = { board: string[]; hands: [number[], number[]]; turn: 1 | 2 };
export function applyMove(p: Pos, m: number): Pos {
  const { from, to, pro } = dec(m), s = p.turn === 1, side = s ? 0 : 1;
  const b = p.board.slice(), hands: [number[], number[]] = [p.hands[0].slice(), p.hands[1].slice()];
  if (from >= 81) { const t = HAND[from - 81]; b[to] = s ? t : t.toLowerCase(); hands[side][from - 81]--; }
  else {
    if (b[to]) hands[side][HAND.indexOf(base(b[to]))]++;
    const pc = b[from]; b[to] = pro ? '+' + pc : pc; b[from] = '';
  }
  return { board: b, hands, turn: s ? 2 : 1 };
}
function pseudo(p: Pos, noPawnMateCheck = false): number[] {
  const s = p.turn === 1, side = s ? 0 : 1, out: number[] = [];
  boardMoves(p.board, s, out);
  for (let k = 0; k < 7; k++) {
    if (!p.hands[side][k]) continue;
    const t = HAND[k];
    for (let to = 0; to < 81; to++) {
      if (p.board[to]) continue;
      if (mustPromote(t, row(to), s)) continue;
      if (t === 'P') {
        let nifu = false; for (let r = 0; r < 9; r++) if (p.board[r * 9 + col(to)] === (s ? 'P' : 'p')) { nifu = true; break; }
        if (nifu) continue;
        // A pawn drop may not give immediate checkmate.
        if (!noPawnMateCheck) {
          const m = enc(81 + k, to, false), n = applyMove(p, m);
          if (attackedKing(n.board, !s) && !legalOf(n).length) continue;
        }
      }
      out.push(enc(81 + k, to, false));
    }
  }
  return out;
}
function legalOf(p: Pos): number[] { const s = p.turn === 1; return pseudo(p, true).filter(m => !attackedKing(applyMove(p, m).board, s)); }
export function legal(st: SState): number[] {
  if (st.winner || st.draw) return [];
  const s = st.turn === 1;
  return pseudo(st).filter(m => !attackedKing(applyMove(st, m).board, s));
}
function finish(st: SState): SState {
  if (!legal(st).length) { st.winner = st.turn === 1 ? 2 : 1; st.reason = 'mate'; }
  else if ((st.seen[key(st)] ?? 0) >= 4) { st.draw = true; st.reason = 'repetition'; }
  else if (st.moves.length >= 400) { st.draw = true; st.reason = 'long'; }
  return st;
}
export function play(st: SState, m: number): SState {
  if (!legal(st).includes(m)) return st;
  const p = applyMove(st, m);
  const next: SState = { ...st, ...p, moves: [...st.moves, m], winner: 0, draw: false, reason: '', check: false, seen: { ...st.seen } };
  next.check = attackedKing(next.board, next.turn === 1); next.seen[key(next)] = (next.seen[key(next)] ?? 0) + 1;
  return finish(next);
}
export const replay = (moves: number[], start = START) => moves.reduce(play, fromSfen(start));

// ---- Computer ----
const VAL: Record<string, number> = { P: 100, L: 300, N: 350, S: 500, G: 550, B: 800, R: 1000, K: 0, '+P': 550, '+L': 550, '+N': 550, '+S': 560, '+B': 1050, '+R': 1250 };
function evaluate(p: Pos): number {
  let s = 0;
  for (let i = 0; i < 81; i++) {
    const pc = p.board[i]; if (!pc) continue;
    const t = pc.startsWith('+') ? '+' + base(pc) : base(pc), se = isSente(pc);
    let v = VAL[t];
    if (t === 'P' || t === 'S' || t === 'G') v += (se ? 8 - row(i) : row(i)) * 4;
    s += se ? v : -v;
  }
  for (let k = 0; k < 7; k++) { const v = VAL[HAND[k]] * 1.1; s += (p.hands[0][k] - p.hands[1][k]) * v; }
  return p.turn === 1 ? s : -s;
}
const ENGINE: Engine<Pos> = {
  moves: legalOf,
  child: applyMove,
  evaluate,
  noMoves: () => -100000,
  hint: (n, m) => { const { from, to, pro } = dec(m); const t = n.board[to]; return (t ? VAL[t.startsWith('+') ? '+' + base(t) : base(t)] * 10 : 0) + (pro ? 400 : 0) - (from >= 81 ? 50 : 0); },
  noisy: (n, ms) => ms.filter(m => n.board[dec(m).to]),
};
export const LEVELS: (Level & { depth: number; ms: number })[] = [
  { name: 'Beginner', rating: 700, depth: 1, ms: 250 }, { name: 'Easy', rating: 950, depth: 2, ms: 400 },
  { name: 'Intermediate', rating: 1200, depth: 2, ms: 800 }, { name: 'Advanced', rating: 1450, depth: 3, ms: 1300 }, { name: 'Expert', rating: 1700, depth: 3, ms: 2000 },
];
export function chooseMove(st: SState, level: number): number {
  const L = LEVELS[level], E = level < 2 ? { ...ENGINE, noisy: undefined } : ENGINE;
  return think(E, { board: st.board, hands: st.hands, turn: st.turn }, L.depth, L.ms, legal(st)).move;
}
export function mateIn1(st: SState): number[] {
  const s = st.turn === 1;
  return legal(st).filter(m => { const p = applyMove(st, m); return attackedKing(p.board, !s) && !legalOf(p).length; });
}
