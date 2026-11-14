/**
 * Builds the daily-puzzle pools by letting the engines play each other and keeping positions
 * with a unique solution: mate in 1 or 2 (chess, xiangqi), mate in 1 with drops (shogi), and
 * the single move that captures the most stones (go). Run: npx vite-node scripts/puzzles.ts
 */
import { readFileSync, writeFileSync } from 'node:fs';
const ONLY = process.env.ONLY;
import { mulberry32 } from '../src/core/rng';
import * as C from '../src/games/chess/rules';
import * as X from '../src/games/xiangqi/rules';
import * as S from '../src/games/shogi/rules';
import * as G from '../src/games/weiqi/rules';

type P = { pos: string; kind: 'm1' | 'm2' | 'cap'; sol: number; n?: number };
const rng = mulberry32(20261112);
const pick = <T,>(a: T[]) => a[Math.floor(rng() * a.length)];
const out: Record<string, P[]> = ONLY ? Object.fromEntries(['chess', 'xiangqi', 'shogi', 'weiqi'].map(g => [g, g === ONLY ? [] : JSON.parse(readFileSync(`src/games/boards/pools/${g}.json`, 'utf8'))])) : { chess: [], xiangqi: [], shogi: [], weiqi: [] };
const skip = (g: string) => !!ONLY && ONLY !== g;
const seen = new Set<string>();
const T0 = Date.now(), budget = (ms: number) => Date.now() - T0 < ms;

// Chess
for (let game = 0; !skip('chess') && out.chess.length < 70 && budget(240000); game++) {
  let st = C.newGame();
  for (let ply = 0; ply < 160 && !st.winner && !st.draw; ply++) {
    if (ply >= 16 && ply % 2 === game % 2) {
      const fen = C.toFen(st);
      if (!seen.has(fen)) {
        const m1 = C.mateIn(st, 1);
        if (m1.length === 1 && out.chess.filter(p => p.kind === 'm1').length < 35) { out.chess.push({ pos: fen, kind: 'm1', sol: m1[0] }); seen.add(fen); }
        else if (!m1.length && out.chess.filter(p => p.kind === 'm2').length < 35 && C.search(st, 3, 400, false).score > 90000) {
          const m2 = C.mateIn(st, 2); if (m2.length === 1) { out.chess.push({ pos: fen, kind: 'm2', sol: m2[0] }); seen.add(fen); }
        }
      }
    }
    const ms = C.legal(st);
    st = C.play(st, rng() < 0.35 ? pick(ms) : C.search(st, 2, 80, false).move);
  }
}
console.log('chess', out.chess.length, Date.now() - T0);
// Xiangqi
const T1 = Date.now();
for (let game = 0; !skip('xiangqi') && out.xiangqi.length < 60 && Date.now() - T1 < 240000; game++) {
  let st = X.newGame();
  for (let ply = 0; ply < 160 && !st.winner && !st.draw; ply++) {
    if (ply >= 12) {
      const fen = X.toFen(st);
      if (!seen.has(fen)) {
        const m1 = X.mateIn(st, 1);
        if (m1.length === 1 && out.xiangqi.filter(p => p.kind === 'm1').length < 30) { out.xiangqi.push({ pos: fen, kind: 'm1', sol: m1[0] }); seen.add(fen); }
        else if (!m1.length && out.xiangqi.filter(p => p.kind === 'm2').length < 30 && ply % 2 === 0) {
          const m2 = X.mateIn(st, 2); if (m2.length === 1) { out.xiangqi.push({ pos: fen, kind: 'm2', sol: m2[0] }); seen.add(fen); }
        }
      }
    }
    const ms = X.legal(st);
    st = X.play(st, rng() < 0.35 ? pick(ms) : X.chooseMove(st, 1));
  }
}
console.log('xiangqi', out.xiangqi.length, Date.now() - T1);
// Shogi
const T2 = Date.now();
for (let game = 0; !skip('shogi') && out.shogi.length < 50 && Date.now() - T2 < 400000; game++) {
  let st = S.newGame();
  for (let ply = 0; ply < 200 && !st.winner && !st.draw; ply++) {
    if (ply >= 20) {
      const sf = S.toSfen(st);
      if (!seen.has(sf)) { const m1 = S.mateIn1(st); if (m1.length === 1) { out.shogi.push({ pos: sf, kind: 'm1', sol: m1[0] }); seen.add(sf); } }
    }
    const ms = S.legal(st);
    st = S.play(st, rng() < 0.45 ? pick(ms) : S.chooseMove(st, 0));
  }
}
console.log('shogi', out.shogi.length, Date.now() - T2);
// Go
const T3 = Date.now();
for (let game = 0; !skip('weiqi') && out.weiqi.length < 60 && Date.now() - T3 < 200000; game++) {
  let st = G.newGame(9);
  for (let ply = 0; ply < 90 && !st.winner; ply++) {
    if (ply >= 14) {
      const b = G.bestCapture(st), key = st.cells.join('') + st.turn;
      if (b.moves.length === 1 && b.stones >= 3 && !seen.has(key)) { out.weiqi.push({ pos: st.cells.join('') + (st.turn === 1 ? 'b' : 'w') + (st.ko >= 0 ? ':' + st.ko : ''), kind: 'cap', sol: b.moves[0], n: b.stones }); seen.add(key); }
    }
    const ms = G.legal(st).filter(m => m < 81);
    const m = rng() < 0.45 ? pick(ms) : G.chooseMove(st, 0, Math.floor(rng() * 1e9));
    st = G.play(st, m === 81 && ms.length ? pick(ms) : m);
  }
}
console.log('weiqi', out.weiqi.length, Date.now() - T3);
for (const [g, pool] of Object.entries(out)) writeFileSync(`src/games/boards/pools/${g}.json`, JSON.stringify(pool));
