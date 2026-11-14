import { describe, expect, it } from 'vitest';
import { mulberry32 } from '../core/rng';
import * as R from './reversi/rules';
import * as N from './nonogram/rules';
import * as M from './mastermind/rules';
import * as D from './dots/rules';

describe('reversi', () => {
  it('starts with four discs and four legal moves for black, flipping one disc', () => {
    const st = R.newGame();
    expect(R.legal(st.cells, 1).sort((a, b) => a - b)).toEqual([19, 26, 37, 44]);
    const s2 = R.play(st, 19);
    expect(R.count(s2.cells, 1)).toBe(4);
    expect(R.count(s2.cells, 2)).toBe(1);
    expect(s2.turn).toBe(2);
    expect(R.play(s2, 0)).toBe(s2);
  });
  it('flips in several directions at once', () => {
    const cells = new Array(64).fill(0);
    cells[19] = 2; cells[20] = 1; cells[26] = 2; cells[34] = 1;
    expect(R.flips(cells, 18, 1).sort((a, b) => a - b)).toEqual([19, 26]);
    const c2 = new Array(64).fill(0); c2[0] = 1; c2[1] = 2; c2[2] = 2;
    expect(R.flips(c2, 3, 1)).toEqual([2, 1]);
  });
  it('the deeper engine beats random play', () => {
    let wins = 0;
    for (let g = 0; g < 4; g++) {
      const rng = mulberry32(g), strong = g % 2 ? 2 : 1;
      let st = R.newGame();
      while (!st.winner && !st.draw) st = R.play(st, R.chooseMove(st, st.turn === strong ? 2 : 0, { rng, depth: st.turn === strong ? 3 : undefined }));
      if (st.winner === strong) wins++;
    }
    expect(wins).toBeGreaterThanOrEqual(3);
  });
});

describe('nonograms', () => {
  it('clues count runs of filled cells', () => {
    expect(N.clueOf([1, 1, 0, 1, 0, 0, 1, 1, 1])).toEqual([2, 1, 3]);
    expect(N.clueOf([0, 0, 0])).toEqual([]);
  });
  it('line solving finds cells common to every arrangement', () => {
    expect(N.solveLine([4], [-1, -1, -1, -1, -1])).toEqual([-1, 1, 1, 1, -1]);
    expect(N.solveLine([2, 2], [-1, -1, -1, -1, -1])).toEqual([1, 1, 0, 1, 1]);
    expect(N.solveLine([3], [0, 0, -1, -1, -1])).toEqual([0, 0, 1, 1, 1]);
    expect(N.solveLine([3], [1, 0, -1, -1, -1])).toBeNull();
  });
  it('generated puzzles are solved by logic alone and match their own clues', () => {
    for (const [w, h] of [[5, 5], [10, 10], [15, 15]]) {
      const p = N.generate(w, h, mulberry32(w));
      expect(N.logicSolve(p)).toEqual(p.solution);
      expect(N.matches(p, p.solution)).toBe(true);
    }
  });
});

describe('mastermind', () => {
  it('scores black and white pegs, counting repeats correctly', () => {
    expect(M.score([0, 1, 2, 3], [0, 1, 2, 3])).toEqual([4, 0]);
    expect(M.score([0, 1, 2, 3], [3, 2, 1, 0])).toEqual([0, 4]);
    expect(M.score([0, 0, 1, 1], [0, 1, 0, 0])).toEqual([1, 2]);
    expect(M.score([1, 2, 3, 4], [5, 5, 5, 5])).toEqual([0, 0]);
  });
  it("Knuth's strategy cracks every 4-peg, 6-colour code it is tested on within five guesses", () => {
    const v = M.VARIANTS.classic, rng = mulberry32(1), codes = M.allCodes(v);
    for (let k = 0; k < 25; k++) {
      const secret = codes[Math.floor(rng() * codes.length)], history: { guess: number[]; result: [number, number] }[] = [];
      let solvedIn = 0;
      for (let t = 1; t <= 6; t++) {
        const g = M.nextGuess(v, history, 'knuth', rng), r = M.score(secret, g);
        history.push({ guess: g, result: r });
        if (r[0] === 4) { solvedIn = t; break; }
      }
      expect(solvedIn).toBeGreaterThan(0);
      expect(solvedIn).toBeLessThanOrEqual(5);
    }
  });
});

describe('dots and boxes', () => {
  it('completing a box scores it and gives another turn', () => {
    let st = D.newGame(2, 2);
    const [t, b, l, r] = D.boxEdges(2, 2, 0);
    st = D.play(st, t); st = D.play(st, b); st = D.play(st, l);
    expect(st.turn).toBe(2);
    st = D.play(st, r);
    expect(st.owner[0]).toBe(2);
    expect(st.turn).toBe(2);
  });
  it('the game ends when all boxes are taken', () => {
    let st = D.newGame(2, 2);
    for (let e = 0; e < D.edgeCount(2, 2); e++) st = D.play(st, e);
    expect(st.owner.every(o => o)).toBe(true);
    expect(st.winner || st.draw).toBeTruthy();
  });
  it('the AI takes free boxes and avoids giving them away', () => {
    let st = D.newGame(3, 3);
    const [t, b, l] = D.boxEdges(3, 3, 4);
    st = D.play(D.play(D.play(st, t), b), l);
    expect(D.boxEdges(3, 3, 4)).toContain(D.chooseMove(st, 2, mulberry32(1)));
  });
  it('stronger levels beat weaker ones', () => {
    let wins = 0;
    for (let g = 0; g < 6; g++) {
      const rng = mulberry32(g), strong = g % 2 ? 2 : 1;
      let st = D.newGame(3, 3);
      while (!st.winner && !st.draw) st = D.play(st, D.chooseMove(st, st.turn === strong ? 4 : 1, rng));
      if (st.winner === strong) wins++;
    }
    expect(wins).toBeGreaterThanOrEqual(5);
  });
});
