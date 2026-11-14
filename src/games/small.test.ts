import { describe, expect, it } from 'vitest';
import { mulberry32 } from '../core/rng';
import * as T from './tictactoe/rules';
import * as C from './four-in-a-row/rules';
import * as M from './minesweeper/rules';
import * as H from './hanoi/rules';
import * as L from './lights-off/rules';

describe('tic-tac-toe', () => {
  it('detects rows, columns and diagonals; ends in a draw when full', () => {
    expect(T.replay([0, 3, 1, 4, 2]).winner).toBe(1);
    expect(T.replay([1, 0, 2, 4, 3, 8]).winner).toBe(2);
    const d = T.replay([0, 1, 2, 4, 3, 5, 7, 6, 8]);
    expect(d.draw && !d.winner).toBe(true);
    expect(T.isLegal(T.replay([0]), 0)).toBe(false);
  });
  it('Easy and up block an immediate win', () => {
    const st = T.replay([0, 4, 1]);
    for (let lv = 1; lv < 5; lv++) expect(T.chooseMove(st, lv, mulberry32(lv))).toBe(2);
  });
  it('Expert never loses, against any level, from either side', () => {
    const rng = mulberry32(5);
    for (let lv = 0; lv < 5; lv++) for (let g = 0; g < 40; g++) {
      const expertSide = g % 2 ? 1 : 2;
      let st = T.newGame();
      while (!st.winner && !st.draw) st = T.play(st, T.chooseMove(st, st.turn === expertSide ? 4 : lv, rng));
      expect(st.winner === 0 || st.winner === expertSide).toBe(true);
    }
  });
  it('Expert finds the fork block that Intermediate misses', () => {
    // X in opposite corners, O centre: O must play an edge, not a corner.
    const st = T.replay([0, 4, 8]);
    for (let s = 0; s < 10; s++) expect([1, 3, 5, 7]).toContain(T.chooseMove(st, 4, mulberry32(s)));
  });
});

describe('connect four', () => {
  it('stacks discs and rejects a full column', () => {
    let st = C.newGame();
    for (let k = 0; k < 6; k++) st = C.play(st, 0);
    expect(st.heights[0]).toBe(6);
    expect(C.isLegal(st, 0)).toBe(false);
    expect(C.landing(st.moves, 5)).toBe(0);
  });
  it('detects horizontal, vertical and both diagonals', () => {
    expect(C.replay([0, 0, 1, 1, 2, 2, 3]).winner).toBe(1);
    expect(C.replay([0, 1, 0, 1, 0, 1, 0]).winner).toBe(1);
    expect(C.replay([0, 1, 1, 2, 2, 3, 2, 3, 3, 6, 3]).winner).toBe(1);
    expect(C.replay([6, 5, 5, 4, 4, 3, 4, 3, 3, 0, 3]).winner).toBe(1);
  });
  it('every level takes a win; Easy and up block one', () => {
    const win = C.replay([0, 6, 1, 6, 2, 5]);
    for (let lv = 0; lv < 5; lv++) expect(C.chooseMove(win, lv, { rng: mulberry32(lv), timeScale: 0.2 })).toBe(3);
    const block = C.replay([0, 6, 1, 6, 2]);
    for (let lv = 1; lv < 5; lv++) expect(C.chooseMove(block, lv, { rng: mulberry32(lv), timeScale: 0.2 })).toBe(3);
  });
  it('deeper search beats shallower search', () => {
    // Fixed depths stand in for the timed levels so the result does not depend on machine speed.
    for (const [strong, weak, depth] of [[2, 0, 5], [4, 1, 7]]) {
      let wins = 0;
      for (let g = 0; g < 4; g++) {
        const sSide = g % 2 ? 2 : 1, rng = mulberry32(50 + g);
        let st = C.newGame();
        while (!st.winner && !st.draw) st = C.play(st, C.chooseMove(st, st.turn === sSide ? strong : weak, { rng, depth: st.turn === sSide ? depth : undefined }));
        expect(st.winner === 3 - sSide).toBe(false);
        if (st.winner === sSide) wins++;
      }
      expect(wins).toBeGreaterThanOrEqual(2);
    }
  });
});

describe('minesweeper', () => {
  it('first reveal is safe, opens an area, and places the right number of mines', () => {
    for (let s = 0; s < 30; s++) {
      const st = M.reveal(M.newBoard(16, 16, 40), 100, mulberry32(s));
      expect(st.status).toBe('playing');
      expect(st.mine.reduce((a, v) => a + v, 0)).toBe(40);
      expect(st.adj[100]).toBe(0);
      expect(st.opened).toBeGreaterThan(1);
    }
  });
  it('flood fill stops at numbers; numbers count neighbouring mines', () => {
    const st = M.reveal(M.newBoard(9, 9, 10), 40, mulberry32(3));
    for (let i = 0; i < 81; i++) {
      expect(st.adj[i]).toBe(M.neighbors(9, 9, i).filter(p => st.mine[p]).length);
      if (st.cell[i] === 1 && st.adj[i] === 0) for (const p of M.neighbors(9, 9, i)) expect(st.cell[p]).toBe(1);
    }
  });
  it('revealing a mine loses; opening every safe cell wins', () => {
    const st = M.reveal(M.newBoard(9, 9, 10), 0, mulberry32(9));
    expect(M.reveal(st, st.mine.indexOf(1)).status).toBe('lost');
    let w = st;
    for (let i = 0; i < 81; i++) if (!w.mine[i]) w = M.reveal(w, i);
    expect(w.status).toBe('won');
    expect(w.flags).toBe(10);
  });
  it('flags block reveals; chord opens neighbours once flags match', () => {
    let st = M.reveal(M.newBoard(9, 9, 10), 40, mulberry32(4));
    const num = st.cell.findIndex((c, i) => c === 1 && st.adj[i] > 0 && M.neighbors(9, 9, i).some(p => st.cell[p] === 0 && !st.mine[p]));
    expect(num).toBeGreaterThanOrEqual(0);
    expect(M.chord(st, num)).toBe(st);
    for (const p of M.neighbors(9, 9, num)) if (st.mine[p]) st = M.toggleFlag(st, p);
    const flagged = st.cell.indexOf(2);
    expect(M.reveal(st, flagged)).toBe(st);
    const after = M.chord(st, num);
    expect(after.status).not.toBe('lost');
    for (const p of M.neighbors(9, 9, num)) if (!after.mine[p]) expect(after.cell[p]).toBe(1);
  });
});

describe('tower of hanoi', () => {
  it('blocks a larger disk on a smaller one', () => {
    const st = H.move(H.newGame(3), [0, 1]);
    expect(H.canMove(st, [0, 1])).toBe(false);
    expect(H.canMove(st, [1, 2])).toBe(true);
  });
  it('the hint path solves in exactly 2^n − 1 moves', () => {
    for (let n = 1; n <= 8; n++) {
      let st = H.newGame(n), m;
      while ((m = H.nextMove(st))) st = H.move(st, m);
      expect(H.solved(st)).toBe(true);
      expect(st.moves).toBe(H.minimum(n));
    }
  });
  it('the hint path finishes from scrambled positions', () => {
    const rng = mulberry32(1);
    for (let t = 0; t < 30; t++) {
      let st = H.newGame(6);
      for (let k = 0; k < 40; k++) {
        const opts = H.hanoiRules.getLegalMoves!(st);
        st = H.move(st, opts[Math.floor(rng() * opts.length)]);
      }
      let m, guard = 0;
      while ((m = H.nextMove(st)) && guard++ < 100) st = H.move(st, m);
      expect(H.solved(st)).toBe(true);
    }
  });
});

describe('lights out', () => {
  it('a press toggles the cell and its neighbours', () => {
    expect(L.press(new Array(9).fill(0), 3, 0)).toEqual([1, 1, 0, 1, 0, 0, 0, 0, 0]);
    expect(L.press(new Array(9).fill(0), 3, 4)).toEqual([0, 1, 0, 1, 1, 1, 0, 1, 0]);
  });
  it('scrambles are solvable and the solver clears them', () => {
    for (const n of [3, 4, 5, 6, 7]) for (let s = 0; s < 6; s++) {
      const cells = L.scramble(n, mulberry32(n * 10 + s));
      const sol = L.solve(n, cells)!;
      let c = cells;
      sol.forEach((v, i) => { if (v) c = L.press(c, n, i); });
      expect(c.every(v => v === 0)).toBe(true);
    }
  });
  it('a single lit corner on 5×5 cannot be solved', () => {
    const c = new Array(25).fill(0); c[0] = 1;
    expect(L.solve(5, c)).toBeNull();
  });
  it('picks the shortest of several solutions', () => {
    // On 5×5 every solvable position has 4 solutions; pressing one cell must solve in 1.
    const c = L.press(new Array(25).fill(0), 5, 12);
    expect(L.solve(5, c)!.reduce((a, v) => a + v, 0)).toBe(1);
  });
});
