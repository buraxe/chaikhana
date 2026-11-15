import { describe, expect, it } from 'vitest';
import { BOARDS, count, jump, legal, solve, startPegs, wonCentre } from './peg/rules';
import { cross, crossings, generate as tangle } from './untangle/rules';
import { closed, generate as knot, rot, N, E, S, Wb } from './knot/rules';

const seeded = (s: number) => () => (s = (s * 16807) % 2147483647) / 2147483647;

describe('peg solitaire', () => {
  it('the cross has 33 holes and 4 opening jumps; the triangle 15 and 2', () => {
    expect(BOARDS.english.holes.length).toBe(33);
    expect(legal(BOARDS.english, startPegs(BOARDS.english)).length).toBe(4);
    expect(BOARDS.triangle.holes.length).toBe(15);
    expect(legal(BOARDS.triangle, startPegs(BOARDS.triangle)).length).toBe(2);
  });
  it('the solver finds a finish with one peg, in the centre on the cross', () => {
    for (const id of ['english', 'triangle'] as const) {
      const b = BOARDS[id]; let p = startPegs(b);
      const sol = solve(b, p)!;
      expect(sol).toBeTruthy();
      for (const m of sol) { expect(legal(b, p).some(x => x.join() === m.join())).toBe(true); p = jump(p, m); }
      expect(count(p)).toBe(1);
      expect(wonCentre(b, p)).toBe(true);
    }
  });
});

describe('untangle', () => {
  it('every puzzle starts tangled and its source drawing has no crossings', () => {
    for (const n of [4, 5, 6, 7, 8]) {
      const p = tangle(n, seeded(n * 3));
      expect(p.pts.length).toBe((n * (n - 1)) / 2);
      expect(crossings(p.pts, p.edges).size).toBeGreaterThan(0);
      expect(crossings(p.answer, p.edges).size).toBe(0);
    }
  });
  it('segments that share an end do not count as crossing', () => {
    expect(cross({ x: 0, y: 0 }, { x: 1, y: 1 }, { x: 0, y: 1 }, { x: 1, y: 0 })).toBe(true);
    expect(cross({ x: 0, y: 0 }, { x: 1, y: 1 }, { x: 2, y: 2 }, { x: 3, y: 0 })).toBe(false);
  });
});

describe('chinese knot', () => {
  it('turning is a quarter turn', () => {
    expect(rot(N)).toBe(E); expect(rot(Wb)).toBe(N); expect(rot(N | E)).toBe(E | S); expect(rot(15)).toBe(15);
  });
  it('each puzzle is closed when solved, open when dealt, and has a crossing', () => {
    for (const n of [5, 6, 8, 10]) {
      const p = knot(n, n, seeded(n));
      expect(closed(n, n, p.goal)).toBe(true);
      expect(closed(n, n, p.start)).toBe(false);
      expect(p.goal.some(m => m === 15)).toBe(true);
      // Turning never changes how many cord ends a tile has.
      p.goal.forEach((m, i) => { const bits = (x: number) => [1, 2, 4, 8].filter(b => x & b).length; expect(bits(p.start[i])).toBe(bits(m)); });
    }
  });
});
