/**
 * Chess. Squares 0–63 from a8 (0) to h1 (63). White pieces are upper case. A move is encoded
 * as from·64 + to + promotion·4096 (promotion 1 Q, 2 R, 3 B, 4 N). Includes castling, en passant,
 * promotion, and draws by stalemate, fifty moves, threefold repetition and bare kings.
 */
import type { Level } from '../../core/match';

export interface CState {
  board: string[]; turn: 1 | 2; castle: string; ep: number; half: number; moves: number[];
  winner: 0 | 1 | 2; draw: boolean; reason: '' | 'mate' | 'stalemate' | 'fifty' | 'repetition' | 'material';
  seen: Record<string, number>; check: boolean;
}
export const START = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
const N = -8, S = 8, E = 1, W = -1;
const KNIGHT = [-17, -15, -10, -6, 6, 10, 15, 17], KING = [-9, -8, -7, -1, 1, 7, 8, 9];
const col = (i: number) => i & 7, row = (i: number) => i >> 3;
export const isWhite = (p: string) => p !== '' && p === p.toUpperCase();
const own = (p: string, w: boolean) => p !== '' && isWhite(p) === w;

export function fromFen(fen: string): CState {
  const [pos, side, castle, ep] = fen.split(' ');
  const board: string[] = [];
  for (const ch of pos.replace(/\//g, '')) { if (/\d/.test(ch)) for (let k = 0; k < +ch; k++) board.push(''); else board.push(ch); }
  const epSq = ep && ep !== '-' ? (8 - +ep[1]) * 8 + ep.charCodeAt(0) - 97 : -1;
  const st: CState = { board, turn: side === 'b' ? 2 : 1, castle: castle === '-' ? '' : castle, ep: epSq, half: 0, moves: [], winner: 0, draw: false, reason: '', seen: {}, check: false };
  st.check = inCheck(st.board, st.turn === 1);
  st.seen[key(st)] = 1;
  return finish(st);
}
export function toFen(st: CState): string {
  let s = '';
  for (let r = 0; r < 8; r++) { let e = 0; for (let c = 0; c < 8; c++) { const p = st.board[r * 8 + c]; if (!p) e++; else { if (e) s += e; e = 0; s += p; } } if (e) s += e; if (r < 7) s += '/'; }
  return `${s} ${st.turn === 1 ? 'w' : 'b'} ${st.castle || '-'} ${st.ep >= 0 ? sqName(st.ep) : '-'} ${st.half} 1`;
}
export const sqName = (i: number) => 'abcdefgh'[col(i)] + (8 - row(i));
const key = (st: CState) => st.board.map(p => p || '.').join('') + st.turn + st.castle + st.ep;
export const newGame = () => fromFen(START);

function attacked(b: string[], sq: number, byWhite: boolean): boolean {
  // Pawns
  const pr = byWhite ? 1 : -1;
  for (const dc of [-1, 1]) { const r = row(sq) + pr, c = col(sq) + dc; if (r >= 0 && r < 8 && c >= 0 && c < 8 && b[r * 8 + c] === (byWhite ? 'P' : 'p')) return true; }
  for (const d of KNIGHT) { const t = sq + d; if (t < 0 || t > 63 || Math.abs(col(t) - col(sq)) > 2) continue; if (b[t] === (byWhite ? 'N' : 'n')) return true; }
  for (const d of KING) { const t = sq + d; if (t < 0 || t > 63 || Math.abs(col(t) - col(sq)) > 1) continue; if (b[t] === (byWhite ? 'K' : 'k')) return true; }
  const slide = (dirs: number[], pcs: string) => {
    for (const d of dirs) {
      let t = sq;
      for (;;) {
        const pc = col(t); t += d;
        if (t < 0 || t > 63 || Math.abs(col(t) - pc) > 1) break;
        if (b[t]) { if (own(b[t], byWhite) && pcs.includes(b[t].toUpperCase())) return true; break; }
      }
    }
    return false;
  };
  return slide([N, S, E, W], 'RQ') || slide([N + E, N + W, S + E, S + W], 'BQ');
}
export function inCheck(b: string[], white: boolean): boolean {
  const k = b.indexOf(white ? 'K' : 'k'); return k >= 0 && attacked(b, k, !white);
}
/** Moves that obey piece movement, before checking whether they leave the king in check. */
function pseudo(st: CState): number[] {
  const b = st.board, w = st.turn === 1, out: number[] = [];
  for (let i = 0; i < 64; i++) {
    const p = b[i]; if (!own(p, w)) continue;
    const t = p.toUpperCase();
    if (t === 'P') {
      const d = w ? N : S, r = row(i), one = i + d, last = w ? 0 : 7;
      const push = (to: number) => { if (row(to) === last) for (const pr of [1, 2, 3, 4]) out.push(i * 64 + to + pr * 4096); else out.push(i * 64 + to); };
      if (one >= 0 && one < 64 && !b[one]) { push(one); if ((w ? r === 6 : r === 1) && !b[one + d]) out.push(i * 64 + one + d); }
      for (const dc of [-1, 1]) { const c = col(i) + dc; if (c < 0 || c > 7) continue; const to = one + dc; if (to < 0 || to > 63) continue; if ((b[to] && !own(b[to], w)) || to === st.ep) push(to); }
    } else if (t === 'N' || t === 'K') {
      for (const d of t === 'N' ? KNIGHT : KING) { const to = i + d; if (to < 0 || to > 63 || Math.abs(col(to) - col(i)) > (t === 'N' ? 2 : 1)) continue; if (!own(b[to], w)) out.push(i * 64 + to); }
      if (t === 'K') {
        const home = w ? 60 : 4;
        if (i === home && !attacked(b, i, !w)) {
          if (st.castle.includes(w ? 'K' : 'k') && !b[i + 1] && !b[i + 2] && b[i + 3] === (w ? 'R' : 'r') && !attacked(b, i + 1, !w)) out.push(i * 64 + i + 2);
          if (st.castle.includes(w ? 'Q' : 'q') && !b[i - 1] && !b[i - 2] && !b[i - 3] && b[i - 4] === (w ? 'R' : 'r') && !attacked(b, i - 1, !w)) out.push(i * 64 + i - 2);
        }
      }
    } else {
      const dirs = t === 'R' ? [N, S, E, W] : t === 'B' ? [N + E, N + W, S + E, S + W] : [N, S, E, W, N + E, N + W, S + E, S + W];
      for (const d of dirs) { let to = i; for (;;) { const pc = col(to); to += d; if (to < 0 || to > 63 || Math.abs(col(to) - pc) > 1) break; if (own(b[to], w)) break; out.push(i * 64 + to); if (b[to]) break; } }
    }
  }
  return out;
}
/** Board after a move, without bookkeeping: used for check tests and search. */
export function applyRaw(st: CState, m: number): { board: string[]; castle: string; ep: number; capture: boolean } {
  const from = Math.floor((m % 4096) / 64), to = m % 64, pr = Math.floor(m / 4096), b = st.board.slice(), p = b[from], w = isWhite(p);
  let capture = !!b[to], ep = -1, castle = st.castle;
  if (p.toUpperCase() === 'P') {
    if (to === st.ep) { b[to + (w ? 8 : -8)] = ''; capture = true; }
    if (Math.abs(to - from) === 16) ep = (to + from) / 2;
  }
  b[to] = pr ? (w ? 'QRBN' : 'qrbn')[pr - 1] : p; b[from] = '';
  if (p.toUpperCase() === 'K' && Math.abs(to - from) === 2) { if (to > from) { b[to - 1] = b[to + 1]; b[to + 1] = ''; } else { b[to + 1] = b[to - 2]; b[to - 2] = ''; } }
  for (const [sq, f] of [[60, 'KQ'], [4, 'kq'], [63, 'K'], [56, 'Q'], [7, 'k'], [0, 'q']] as [number, string][]) if (from === sq || to === sq) castle = castle.replace(new RegExp(`[${f}]`, 'g'), '');
  return { board: b, castle, ep, capture };
}
export function legal(st: CState): number[] {
  if (st.winner || st.draw) return [];
  const w = st.turn === 1;
  return pseudo(st).filter(m => !inCheck(applyRaw(st, m).board, w));
}
function finish(st: CState): CState {
  const ms = legal({ ...st, winner: 0, draw: false });
  if (!ms.length) { if (st.check) { st.winner = st.turn === 1 ? 2 : 1; st.reason = 'mate'; } else { st.draw = true; st.reason = 'stalemate'; } }
  else if (st.half >= 100) { st.draw = true; st.reason = 'fifty'; }
  else if ((st.seen[key(st)] ?? 0) >= 3) { st.draw = true; st.reason = 'repetition'; }
  else { const pcs = st.board.filter(p => p && p.toUpperCase() !== 'K'); if (!pcs.length || (pcs.length === 1 && 'NBnb'.includes(pcs[0]))) { st.draw = true; st.reason = 'material'; } }
  return st;
}
export function play(st: CState, m: number): CState {
  if (!legal(st).includes(m)) return st;
  const from = Math.floor((m % 4096) / 64), r = applyRaw(st, m), pawn = st.board[from].toUpperCase() === 'P';
  const next: CState = { ...st, board: r.board, castle: r.castle, ep: r.ep, turn: st.turn === 1 ? 2 : 1, half: pawn || r.capture ? 0 : st.half + 1, moves: [...st.moves, m], seen: { ...st.seen }, winner: 0, draw: false, reason: '', check: false };
  next.check = inCheck(next.board, next.turn === 1);
  next.seen[key(next)] = (next.seen[key(next)] ?? 0) + 1;
  return finish(next);
}
export const replay = (moves: number[], start = START) => moves.reduce(play, fromFen(start));
export function san(st: CState, m: number): string {
  const from = Math.floor((m % 4096) / 64), to = m % 64, pr = Math.floor(m / 4096), p = st.board[from].toUpperCase();
  if (p === 'K' && Math.abs(to - from) === 2) return to > from ? 'O-O' : 'O-O-O';
  const cap = !!st.board[to] || (p === 'P' && to === st.ep);
  let s = p === 'P' ? (cap ? sqName(from)[0] + 'x' : '') : p + (cap ? 'x' : '');
  s += sqName(to) + (pr ? '=' + 'QRBN'[pr - 1] : '');
  const n = play(st, m); if (n.winner) s += '#'; else if (n.check) s += '+';
  return s;
}

// ---- Computer ----
const VAL: Record<string, number> = { P: 100, N: 320, B: 330, R: 500, Q: 900, K: 0 };
// Piece-square tables from White's side, a8 first.
const PST: Record<string, number[]> = {
  P: [0, 0, 0, 0, 0, 0, 0, 0, 50, 50, 50, 50, 50, 50, 50, 50, 10, 10, 20, 30, 30, 20, 10, 10, 5, 5, 10, 25, 25, 10, 5, 5, 0, 0, 0, 20, 20, 0, 0, 0, 5, -5, -10, 0, 0, -10, -5, 5, 5, 10, 10, -20, -20, 10, 10, 5, 0, 0, 0, 0, 0, 0, 0, 0],
  N: [-50, -40, -30, -30, -30, -30, -40, -50, -40, -20, 0, 0, 0, 0, -20, -40, -30, 0, 10, 15, 15, 10, 0, -30, -30, 5, 15, 20, 20, 15, 5, -30, -30, 0, 15, 20, 20, 15, 0, -30, -30, 5, 10, 15, 15, 10, 5, -30, -40, -20, 0, 5, 5, 0, -20, -40, -50, -40, -30, -30, -30, -30, -40, -50],
  B: [-20, -10, -10, -10, -10, -10, -10, -20, -10, 0, 0, 0, 0, 0, 0, -10, -10, 0, 5, 10, 10, 5, 0, -10, -10, 5, 5, 10, 10, 5, 5, -10, -10, 0, 10, 10, 10, 10, 0, -10, -10, 10, 10, 10, 10, 10, 10, -10, -10, 5, 0, 0, 0, 0, 5, -10, -20, -10, -10, -10, -10, -10, -10, -20],
  R: [0, 0, 0, 0, 0, 0, 0, 0, 5, 10, 10, 10, 10, 10, 10, 5, -5, 0, 0, 0, 0, 0, 0, -5, -5, 0, 0, 0, 0, 0, 0, -5, -5, 0, 0, 0, 0, 0, 0, -5, -5, 0, 0, 0, 0, 0, 0, -5, -5, 0, 0, 0, 0, 0, 0, -5, 0, 0, 0, 5, 5, 0, 0, 0],
  Q: [-20, -10, -10, -5, -5, -10, -10, -20, -10, 0, 0, 0, 0, 0, 0, -10, -10, 0, 5, 5, 5, 5, 0, -10, -5, 0, 5, 5, 5, 5, 0, -5, 0, 0, 5, 5, 5, 5, 0, -5, -10, 5, 5, 5, 5, 5, 0, -10, -10, 0, 5, 0, 0, 0, 0, -10, -20, -10, -10, -5, -5, -10, -10, -20],
  K: [-30, -40, -40, -50, -50, -40, -40, -30, -30, -40, -40, -50, -50, -40, -40, -30, -30, -40, -40, -50, -50, -40, -40, -30, -30, -40, -40, -50, -50, -40, -40, -30, -20, -30, -30, -40, -40, -30, -30, -20, -10, -20, -20, -20, -20, -20, -20, -10, 20, 20, 0, 0, 0, 0, 20, 20, 20, 30, 10, 0, 0, 10, 30, 20],
};
function evaluate(b: string[], white: boolean): number {
  let s = 0;
  for (let i = 0; i < 64; i++) { const p = b[i]; if (!p) continue; const u = p.toUpperCase(), w = p === u, v = VAL[u] + PST[u][w ? i : (7 - row(i)) * 8 + col(i)]; s += w ? v : -v; }
  return white ? s : -s;
}
type Node = { board: string[]; turn: 1 | 2; castle: string; ep: number };
const asState = (n: Node): CState => ({ ...n, half: 0, moves: [], winner: 0, draw: false, reason: '', seen: {}, check: false });
function order(n: Node, ms: number[]) {
  return ms.map(m => { const to = m % 64, v = n.board[to] ? VAL[n.board[to].toUpperCase()] * 10 - VAL[n.board[Math.floor((m % 4096) / 64)].toUpperCase()] : 0; return { m, v: v + (m >= 4096 ? 800 : 0) }; }).sort((a, b) => b.v - a.v).map(x => x.m);
}
const child = (n: Node, m: number): Node => { const r = applyRaw(asState(n), m); return { board: r.board, castle: r.castle, ep: r.ep, turn: n.turn === 1 ? 2 : 1 }; };
const legalOf = (n: Node) => { const s = asState(n), w = n.turn === 1; return pseudo(s).filter(m => !inCheck(applyRaw(s, m).board, w)); };
class Timeout extends Error {}
export function search(st: CState, maxDepth: number, ms: number, quiesce: boolean): { move: number; score: number } {
  const t0 = Date.now(); let nodes = 0;
  const qs = (n: Node, a: number, b: number, d: number): number => {
    const stand = evaluate(n.board, n.turn === 1);
    if (!quiesce || d > 6) return stand;
    if (stand >= b) return stand; if (stand > a) a = stand;
    const s = asState(n), w = n.turn === 1;
    for (const m of order(n, pseudo(s).filter(m => n.board[m % 64] || m >= 4096))) {
      const c = child(n, m); if (inCheck(c.board, w)) continue;
      const v = -qs(c, -b, -a, d + 1); if (v >= b) return v; if (v > a) a = v;
    }
    return a;
  };
  const nega = (n: Node, depth: number, a: number, b: number, ply: number): number => {
    if (++nodes % 2048 === 0 && Date.now() - t0 > ms) throw new Timeout();
    const ms2 = legalOf(n);
    if (!ms2.length) return inCheck(n.board, n.turn === 1) ? -100000 + ply : 0;
    if (depth <= 0) return qs(n, a, b, 0);
    let best = -Infinity;
    for (const m of order(n, ms2)) { const v = -nega(child(n, m), depth - 1, -b, -a, ply + 1); if (v > best) best = v; if (v > a) a = v; if (a >= b) break; }
    return best;
  };
  const root: Node = { board: st.board, turn: st.turn, castle: st.castle, ep: st.ep };
  let rootMoves = order(root, legal(st)), bestMove = rootMoves[0], bestScore = 0;
  for (let d = 1; d <= maxDepth; d++) {
    try {
      let a = -Infinity, bm = rootMoves[0];
      const scored: { m: number; v: number }[] = [];
      for (const m of rootMoves) {
        const c = child(root, m);
        // Avoid walking into a threefold repetition when ahead.
        const v = -nega(c, d - 1, -Infinity, -a, 1);
        scored.push({ m, v });
        if (v > a) { a = v; bm = m; }
      }
      bestMove = bm; bestScore = a;
      rootMoves = scored.sort((x, y) => y.v - x.v).map(x => x.m);
      if (Math.abs(a) > 90000) break;
    } catch (e) { if (e instanceof Timeout) break; throw e; }
  }
  return { move: bestMove, score: bestScore };
}
export const LEVELS: (Level & { depth: number; ms: number; q: boolean })[] = [
  { name: 'Beginner', rating: 700, depth: 1, ms: 200, q: false }, { name: 'Easy', rating: 950, depth: 2, ms: 300, q: false },
  { name: 'Intermediate', rating: 1200, depth: 2, ms: 600, q: true }, { name: 'Advanced', rating: 1450, depth: 3, ms: 1000, q: true }, { name: 'Expert', rating: 1700, depth: 4, ms: 1600, q: true },
];
export const chooseMove = (st: CState, level: number) => search(st, LEVELS[level].depth, LEVELS[level].ms, LEVELS[level].q).move;
/** Does the side to move have a forced mate in `n` (1 or 2)? Returns the winning first moves. */
export function mateIn(st: CState, n: 1 | 2): number[] {
  return legal(st).filter(m => {
    const a = play(st, m);
    if (a.winner) return n >= 1;
    if (n === 1 || a.draw) return false;
    const replies = legal(a);
    return replies.length > 0 && replies.every(r => { const b = play(a, r); return legal(b).some(x => play(b, x).winner); });
  });
}
