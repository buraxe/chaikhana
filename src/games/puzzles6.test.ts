import { describe, expect, it } from 'vitest';
import { mulberry32 } from '../core/rng';
import * as F from './futoshiki/rules';
import * as B from './binary/rules';
import * as K from './kakuro/rules';
import * as S from './loop-line/rules';
import * as N from './ninerings/rules';

const time = <T,>(f: () => T): [T, number] => { const t = performance.now(); const r = f(); return [r, performance.now() - t]; };

describe('futoshiki', () => {
  it('generates unique puzzles whose solution passes', () => {
    for (const n of [4, 5, 6]) for (let s = 0; s < 4; s++) {
      const [p, ms] = time(() => F.generate(n, mulberry32(s * 7 + n)));
      expect(F.countSolutions(n, p.givens, p.signs)).toBe(1);
      expect(F.solved(p, p.solution)).toBe(true);
      expect(ms).toBeLessThan(4000);
    }
  });
});
describe('binary', () => {
  it('generates unique puzzles whose solution passes', () => {
    for (const n of [6, 8, 10]) for (let s = 0; s < 3; s++) {
      const [p, ms] = time(() => B.generate(n, mulberry32(s + n)));
      expect(B.countSolutions(n, p.givens)).toBe(1);
      expect(B.solved(n, p.solution)).toBe(true);
      expect(p.givens.every((v, i) => v < 0 || v === p.solution[i])).toBe(true);
      expect(ms).toBeLessThan(4000);
    }
  });
  it('spots three in a row and repeated lines', () => {
    const g = [0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 1, 0, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1];
    expect(B.mistakes(6, g).has(0)).toBe(true);
  });
});
describe('kakuro', () => {
  it('generates unique puzzles whose solution passes', () => {
    for (const size of [5, 6, 7]) for (let s = 0; s < 3; s++) {
      const [p, ms] = time(() => K.generate(size, mulberry32(s * 3 + size)));
      expect(K.solved(p, p.solution)).toBe(true);
      expect(p.runs.every(r => r.cells.length >= 2)).toBe(true);
      expect(ms).toBeLessThan(6000);
    }
  });
});
describe('loop-line', () => {
  it('generates unique single loops', () => {
    for (const [w, h] of [[5, 5], [7, 7], [10, 10]]) for (let s = 0; s < 3; s++) {
      const [p, ms] = time(() => S.generate(w, h, mulberry32(s * 11 + w)));
      expect(S.isLoop(w, h, p.solution)).toBe(true);
      expect(S.solved(p, p.solution)).toBe(true);
      expect(S.countSolutions(w, h, p.clues)).toBe(1);
      expect(ms).toBeLessThan(6000);
    }
  });
});
describe('nine rings', () => {
  it('knows the shortest solution', () => {
    expect(N.optimal(9)).toBe(341);
    expect(N.optimal(5)).toBe(21);
    // Following bestMove from the start takes exactly the optimal number of moves.
    for (const n of [3, 5, 7, 9]) {
      let s = N.start(n), k = 0;
      while (!N.done(s)) { s = N.move(s, N.bestMove(s)); k++; }
      expect(k).toBe(N.optimal(n));
    }
  });
  it('matches a breadth-first search', () => {
    const n = 6, key = (s: N.NState) => s.on.map(Number).join('');
    const dist = new Map([[key({ n, on: new Array(n).fill(false) }), 0]]); let q = [{ n, on: new Array(n).fill(false) }];
    while (q.length) { const nx: N.NState[] = []; for (const s of q) for (let k = 0; k < n; k++) { const t = N.move(s, k); if (t === s || dist.has(key(t))) continue; dist.set(key(t), dist.get(key(s))! + 1); nx.push(t); } q = nx; }
    for (const [k, d] of dist) expect(N.remaining({ n, on: k.split('').map(c => c === '1') })).toBe(d);
  });
});
