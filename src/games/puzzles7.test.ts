import { describe, expect, it } from 'vitest';
import { mulberry32 } from '../core/rng';
import * as H from './number-path/rules';
import * as N from './link-numbers/rules';
import * as Q from './queens/rules';
import * as R from './river/rules';

const time = <T,>(f: () => T): [T, number] => { const t = performance.now(); const r = f(); return [r, performance.now() - t]; };

describe('number-path', () => {
  it('generates unique snakes', () => {
    for (const n of [5, 6, 7]) for (let s = 0; s < 3; s++) {
      const [p, ms] = time(() => H.generate(n, n, mulberry32(s * 5 + n)));
      expect(H.solved(p, p.solution)).toBe(true);
      expect(H.countSolutions(n, n, p.givens)).toBe(1);
      expect(p.givens.filter(Boolean).length).toBeLessThan(n * n * 0.6);
      expect(ms).toBeLessThan(5000);
    }
  });
});
describe('link-numbers', () => {
  it('generates boards whose paths fill the grid', () => {
    for (const n of [5, 6, 7, 8]) for (let s = 0; s < 4; s++) {
      const [p, ms] = time(() => N.generate(n, mulberry32(s * 3 + n)));
      const pairs = Math.max(...p.ends);
      const lines: N.Lines = p.paths;
      expect(N.solved(p, lines)).toBe(true);
      expect(p.ends.filter(Boolean).length).toBe(pairs * 2);
      expect(ms).toBeLessThan(2000);
    }
  });
});
describe('queens', () => {
  it('generates region puzzles with one solution', () => {
    for (const n of [6, 7, 8, 9]) for (let s = 0; s < 3; s++) {
      const [p, ms] = time(() => Q.generate(n, mulberry32(s * 13 + n)));
      expect(Q.countRegion(n, p.region)).toBe(1);
      expect(new Set(p.region).size).toBe(n);
      expect(Q.complete(n, p.solution.map((c, r) => r * n + c), p.region)).toBe(true);
      expect(ms).toBeLessThan(5000);
    }
  });
  it('checks classic queens', () => {
    expect(Q.complete(4, [1, 7, 8, 14], null)).toBe(true);
    expect(Q.complete(4, [0, 5, 10, 15], null)).toBe(false);
  });
});
describe('river crossings', () => {
  it('knows the classic answers', () => {
    const by = (id: string) => R.SCENARIOS.find(s => s.id === id)!;
    expect(R.best(by('farmer'))).toBe(7);
    expect(R.best(by('monks'))).toBe(11);
    expect(R.best(by('bridge'))).toBe(17);
    expect(R.best(by('bridge5'))).toBeLessThanOrEqual(30);
  });
  it('refuses unsafe crossings', () => {
    const f = R.SCENARIOS[0];
    expect(R.check(f, R.start(), [0, 1])).toBe('unsafe'); // farmer takes the wolf: goat eats cabbage
    expect(R.check(f, R.start(), [2])).toBe('rower');
    expect(R.check(f, R.start(), [0, 2])).toBeNull();
  });
});
