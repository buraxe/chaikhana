/**
 * Xiangqi (Chinese chess) on 9×10 points; index = row·9 + col, row 0 is Black's back rank.
 * Red pieces are upper case: R chariot, H horse, E elephant, A advisor, K general, C cannon,
 * P soldier. A move is from·90 + to. A side with no legal move loses, as in the real game.
 */
import type { Level } from '../../core/match';
import { think, type Engine } from '../boards/search';

export interface XState { board: string[]; turn: 1 | 2; moves: number[]; winner: 0 | 1 | 2; draw: boolean; reason: '' | 'mate' | 'stalemate' | 'repetition' | 'quiet'; check: boolean; quiet: number; seen: Record<string, number> }
export const START = 'rheakaehr/9/1c5c1/p1p1p1p1p/9/9/P1P1P1P1P/1C5C1/9/RHEAKAEHR w';
const col = (i: number) => i % 9, row = (i: number) => Math.floor(i / 9);
export const isRed = (p: string) => p !== '' && p === p.toUpperCase();
const own = (p: string, red: boolean) => p !== '' && isRed(p) === red;
const inPalace = (i: number, red: boolean) => col(i) >= 3 && col(i) <= 5 && (red ? row(i) >= 7 : row(i) <= 2);
const ownSide = (i: number, red: boolean) => (red ? row(i) >= 5 : row(i) <= 4);

export function fromFen(fen: string): XState {
  const [pos, side] = fen.split(' '), board: string[] = [];
  for (const ch of pos.replace(/\//g, '')) { if (/\d/.test(ch)) for (let k = 0; k < +ch; k++) board.push(''); else board.push(ch); }
  const st: XState = { board, turn: side === 'b' ? 2 : 1, moves: [], winner: 0, draw: false, reason: '', check: false, quiet: 0, seen: {} };
  st.check = inCheck(board, st.turn === 1); st.seen[key(st)] = 1;
  return finish(st);
}
export function toFen(st: XState) {
  let s = '';
  for (let r = 0; r < 10; r++) { let e = 0; for (let c = 0; c < 9; c++) { const p = st.board[r * 9 + c]; if (!p) e++; else { if (e) s += e; e = 0; s += p; } } if (e) s += e; if (r < 9) s += '/'; }
  return `${s} ${st.turn === 1 ? 'w' : 'b'}`;
}
const key = (st: { board: string[]; turn: number }) => st.board.map(p => p || '.').join('') + st.turn;
export const newGame = () => fromFen(START);

function gen(b: string[], red: boolean): number[] {
  const out: number[] = [];
  const add = (i: number, t: number) => { if (t >= 0 && t < 90 && !own(b[t], red)) out.push(i * 90 + t); };
  for (let i = 0; i < 90; i++) {
    const p = b[i]; if (!own(p, red)) continue;
    const u = p.toUpperCase(), r = row(i), c = col(i);
    const step = (dr: number, dc: number) => { const rr = r + dr, cc = c + dc; return rr >= 0 && rr < 10 && cc >= 0 && cc < 9 ? rr * 9 + cc : -1; };
    if (u === 'K') for (const [dr, dc] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const t = step(dr, dc); if (t >= 0 && inPalace(t, red)) add(i, t); }
    else if (u === 'A') for (const [dr, dc] of [[1, 1], [1, -1], [-1, 1], [-1, -1]]) { const t = step(dr, dc); if (t >= 0 && inPalace(t, red)) add(i, t); }
    else if (u === 'E') for (const [dr, dc] of [[2, 2], [2, -2], [-2, 2], [-2, -2]]) { const t = step(dr, dc), eye = step(dr / 2, dc / 2); if (t >= 0 && !b[eye] && ownSide(t, red)) add(i, t); }
    else if (u === 'H') for (const [dr, dc, lr, lc] of [[2, 1, 1, 0], [2, -1, 1, 0], [-2, 1, -1, 0], [-2, -1, -1, 0], [1, 2, 0, 1], [-1, 2, 0, 1], [1, -2, 0, -1], [-1, -2, 0, -1]]) { const t = step(dr, dc), leg = step(lr, lc); if (t >= 0 && !b[leg]) add(i, t); }
    else if (u === 'R' || u === 'C') {
      for (const [dr, dc] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        let k = 1, screen = false;
        for (;;) {
          const t = step(dr * k, dc * k); if (t < 0) break; k++;
          if (u === 'R') { if (b[t]) { if (!own(b[t], red)) out.push(i * 90 + t); break; } out.push(i * 90 + t); continue; }
          if (!screen) { if (b[t]) screen = true; else out.push(i * 90 + t); }
          else if (b[t]) { if (!own(b[t], red)) out.push(i * 90 + t); break; }
        }
      }
    } else if (u === 'P') {
      add(i, step(red ? -1 : 1, 0));
      if (!ownSide(i, red)) { add(i, step(0, 1)); add(i, step(0, -1)); }
    }
  }
  return out;
}
/** Is `red`'s general attacked, or facing the other general on an open file? */
export function inCheck(b: string[], red: boolean): boolean {
  const k = b.indexOf(red ? 'K' : 'k'), ok = b.indexOf(red ? 'k' : 'K');
  if (k < 0) return true;
  if (ok >= 0 && col(k) === col(ok)) { let open = true; for (let r = Math.min(row(k), row(ok)) + 1; r < Math.max(row(k), row(ok)); r++) if (b[r * 9 + col(k)]) { open = false; break; } if (open) return true; }
  return gen(b, !red).some(m => m % 90 === k);
}
const apply = (b: string[], m: number) => { const n = b.slice(), f = Math.floor(m / 90), t = m % 90; n[t] = n[f]; n[f] = ''; return n; };
export function legal(st: XState): number[] {
  if (st.winner || st.draw) return [];
  const red = st.turn === 1;
  return gen(st.board, red).filter(m => !inCheck(apply(st.board, m), red));
}
function finish(st: XState): XState {
  if (!legal(st).length) { st.winner = st.turn === 1 ? 2 : 1; st.reason = st.check ? 'mate' : 'stalemate'; }
  else if ((st.seen[key(st)] ?? 0) >= 3) { st.draw = true; st.reason = 'repetition'; }
  else if (st.quiet >= 120) { st.draw = true; st.reason = 'quiet'; }
  return st;
}
export function play(st: XState, m: number): XState {
  if (!legal(st).includes(m)) return st;
  const cap = !!st.board[m % 90], board = apply(st.board, m);
  const next: XState = { ...st, board, turn: st.turn === 1 ? 2 : 1, moves: [...st.moves, m], winner: 0, draw: false, reason: '', check: false, quiet: cap ? 0 : st.quiet + 1, seen: { ...st.seen } };
  next.check = inCheck(board, next.turn === 1); next.seen[key(next)] = (next.seen[key(next)] ?? 0) + 1;
  return finish(next);
}
export const replay = (moves: number[], start = START) => moves.reduce(play, fromFen(start));

// ---- Computer ----
const VAL: Record<string, number> = { R: 900, H: 400, C: 450, E: 200, A: 200, P: 100, K: 0 };
function evaluate(b: string[], red: boolean): number {
  let s = 0;
  for (let i = 0; i < 90; i++) {
    const p = b[i]; if (!p) continue;
    const u = p.toUpperCase(), r = isRed(p);
    let v = VAL[u];
    if (u === 'P') { const adv = r ? 9 - row(i) : row(i); if (!ownSide(i, r)) v += 70 + (col(i) >= 2 && col(i) <= 6 ? 30 : 0) + (adv >= 7 && adv <= 8 ? 20 : 0); }
    if (u === 'H' || u === 'C') v += 12 - Math.abs(col(i) - 4) * 3;
    s += r ? v : -v;
  }
  return red ? s : -s;
}
type XN = { board: string[]; turn: 1 | 2 };
const ENGINE: Engine<XN> = {
  moves: n => gen(n.board, n.turn === 1).filter(m => !inCheck(apply(n.board, m), n.turn === 1)),
  child: (n, m) => ({ board: apply(n.board, m), turn: n.turn === 1 ? 2 : 1 }),
  evaluate: n => evaluate(n.board, n.turn === 1),
  noMoves: () => -100000,
  hint: (n, m) => { const t = n.board[m % 90]; return t ? VAL[t.toUpperCase()] * 10 - VAL[n.board[Math.floor(m / 90)].toUpperCase()] + 1 : 0; },
  noisy: (n, ms) => ms.filter(m => n.board[m % 90]),
};
export const LEVELS: (Level & { depth: number; ms: number })[] = [
  { name: 'Beginner', rating: 700, depth: 1, ms: 200 }, { name: 'Easy', rating: 950, depth: 2, ms: 300 },
  { name: 'Intermediate', rating: 1200, depth: 2, ms: 700 }, { name: 'Advanced', rating: 1450, depth: 3, ms: 1100 }, { name: 'Expert', rating: 1700, depth: 4, ms: 1700 },
];
export function chooseMove(st: XState, level: number): number {
  const L = LEVELS[level], E = level < 2 ? { ...ENGINE, noisy: undefined } : ENGINE;
  return think(E, { board: st.board, turn: st.turn }, L.depth, L.ms, legal(st)).move;
}
export function mateIn(st: XState, n: 1 | 2): number[] {
  return legal(st).filter(m => {
    const a = play(st, m);
    if (a.winner) return true;
    if (n === 1 || a.draw) return false;
    const replies = legal(a);
    return replies.length > 0 && replies.every(r => legal(play(a, r)).some(x => play(play(a, r), x).winner));
  });
}
