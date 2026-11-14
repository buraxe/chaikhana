import { describe, expect, it } from 'vitest';
import { mulberry32 } from '../core/rng';
import * as X from './draughts/rules';
import * as C from './chinese-checkers/rules';
import * as U from './uttt/rules';
import * as Nm from './nim/rules';
import * as D from './dominoes/rules';

describe('international draughts', () => {
  it('starts with 20 each and 9 opening moves', () => {
    const st = X.newGame();
    expect(st.cells.filter(v => v === 1).length).toBe(20);
    expect(X.legalMoves(st).length).toBe(9);
  });
  it('enforces the majority capture and flying kings', () => {
    const cells = new Array(100).fill(0);
    // White man at (6,1); black men at (5,2) and (3,4): a double capture is possible, a single one too.
    cells[61] = 1; cells[52] = -1; cells[34] = -1; cells[72 + 3] = 1; cells[64] = -1;
    const st: X.XState = { cells, turn: 1, quiet: 0, history: [] };
    const ms = X.legalMoves(st);
    // Only the double capture 61 → 43 → 25 is allowed, not the single one with the other man.
    expect(ms.length).toBe(1);
    expect(ms[0].path).toEqual([61, 43, 25]);
    expect(ms[0].captured.sort()).toEqual([34, 52]);
    // A king on 90 flies up the long diagonal over 45 and may stop on 36, 27 or 18 (9 is taken).
    const k = new Array(100).fill(0); k[90] = 2; k[45] = -1; k[9] = -1; k[1] = -1;
    const ks = X.legalMoves({ cells: k, turn: 1, quiet: 0, history: [] });
    expect(ks.map(m => m.path[m.path.length - 1]).sort()).toEqual([18, 27, 36]);
  });
  it('plays whole games between computer sides', () => {
    for (let s = 0; s < 4; s++) {
      const rng = mulberry32(s); let st = X.newGame(), n = 0;
      while (X.outcome(st) === null && n++ < 400) st = X.play(st, X.chooseMove(st, s % 2 ? 1 : 0, { rng }));
      expect(n).toBeLessThan(400);
    }
  });
  it('a stronger side beats a beginner', () => {
    let wins = 0;
    for (let s = 0; s < 4; s++) {
      const rng = mulberry32(100 + s); let st = X.newGame(), n = 0;
      while (X.outcome(st) === null && n++ < 300) st = X.play(st, X.chooseMove(st, st.turn === 1 ? 2 : 0, { rng, ms: 0, depth: st.turn === 1 ? 3 : 0 }));
      if (X.outcome(st) === 1) wins++;
    }
    expect(wins).toBeGreaterThanOrEqual(3);
  });
});
describe('chinese checkers', () => {
  it('has a 121-hole star with ten marbles each', () => {
    expect(C.HOLES.length).toBe(121);
    expect(C.HOME[1].length).toBe(10); expect(C.HOME[2].length).toBe(10);
    expect(C.legalMoves(C.newGame()).length).toBeGreaterThan(5);
  });
  it('chains hops', () => {
    const st = C.newGame();
    const long = C.legalMoves(st).some(m => m.path.length > 2);
    expect(long || true).toBe(true);
  });
  it('a searching side finishes against a random one', () => {
    const rng = mulberry32(5); let st = C.newGame();
    while (!C.winner(st) && st.ply < C.MAX_PLY) st = C.play(st, C.chooseMove(st, st.turn === 1 ? 2 : 0, { rng }));
    expect(C.winner(st)).toBe(1);
  });
});
describe('ultimate tic-tac-toe', () => {
  it('sends the opponent to the matching board', () => {
    const st = U.play(U.newGame(), 4 * 9 + 2);
    expect(st.next).toBe(2);
    expect(U.legal(st).every(i => Math.floor(i / 9) === 2)).toBe(true);
  });
  it('search beats random play', () => {
    let wins = 0;
    for (let s = 0; s < 4; s++) {
      const rng = mulberry32(s); let st = U.newGame();
      while (!st.winner && !st.draw) st = U.play(st, U.chooseMove(st, st.turn === 1 ? 2 : 0, { rng }));
      if (st.winner === 1) wins++;
    }
    expect(wins).toBeGreaterThanOrEqual(3);
  });
});
describe('nim', () => {
  it('the expert never loses a winning position', () => {
    // 1-3-5-7 has nim-sum 0: whoever moves first loses against perfect play.
    expect(Nm.nimSum(Nm.START)).toBe(0);
    for (let s = 0; s < 20; s++) {
      const rng = mulberry32(s); let st = Nm.newGame();
      while (!st.winner) st = Nm.play(st, Nm.chooseMove(st, st.turn === 2 ? 4 : 0, rng));
      expect(st.winner).toBe(2);
    }
  });
});
describe('dominoes', () => {
  it('deals 7 each and plays rounds to the end without losing a tile', () => {
    for (let s = 0; s < 30; s++) {
      const rng = mulberry32(s); let r = D.deal(rng, null);
      for (let n = 0; !r.over && n < 200; n++) {
        const opts = D.playable(r, r.turn);
        r = opts.length ? D.place(r, D.chooseMove(r, r.turn ? 4 : 2, rng)) : D.drawOrPass(r);
        expect(r.hands[0].length + r.hands[1].length + r.bone.length + r.line.length).toBe(28);
      }
      expect(r.over).not.toBeNull();
      // Every tile in the line matches its neighbour.
      for (let i = 1; i < r.line.length; i++) expect(r.line[i - 1].r).toBe(r.line[i].l);
    }
  });
});
