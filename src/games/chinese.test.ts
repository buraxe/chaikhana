import { describe, expect, it } from 'vitest';
import { LAYOUTS } from './huarong/layouts';
import { applyMove, canStep, destinations, key, parse, solve, solved } from './huarong/rules';
import { area, compare, IDS, polygon, snap, STANDARD, SOLVED_ERROR, centroid, type Place } from './tangram/geometry';
import { SILHOUETTES } from './tangram/silhouettes';

describe('huarong dao', () => {
  it('parses layouts with the right pieces', () => {
    for (const l of LAYOUTS) {
      const ps = parse(l.rows);
      expect(ps.filter(p => p.t === 'C')).toHaveLength(1);
      expect(ps.filter(p => p.t === 'S')).toHaveLength(4);
      expect(ps.filter(p => p.t === 'V' || p.t === 'H')).toHaveLength(5);
      expect(key(ps).split('.').length - 1).toBe(2);
    }
  });
  it('the classic layout needs 81 moves, and every stored minimum is correct', () => {
    for (const l of LAYOUTS) {
      const path = solve(parse(l.rows))!;
      expect(path, l.id).not.toBeNull();
      expect(path.length, l.id).toBe(l.min);
      let ps = parse(l.rows);
      for (const m of path) { const next = applyMove(ps, m); expect(next).not.toBe(ps); ps = next; }
      expect(solved(ps)).toBe(true);
    }
  }, 120000);
  it('blocks moves into occupied cells and off the board', () => {
    const ps = parse('^CC^ vCCv ^<>^ vssv s..s');
    expect(canStep(ps, 0, 1, 0)).toBe(false);
    expect(canStep(ps, 0, -1, 0)).toBe(false);
    const soldier = ps.findIndex(p => p.t === 'S' && p.r === 4 && p.c === 0);
    expect(destinations(ps, soldier)).toEqual([{ r: 4, c: 1 }, { r: 4, c: 2 }]);
    expect(applyMove(ps, { r0: 4, c0: 0, r1: 2, c1: 2 })).toBe(ps);
  });
  it('one move can turn a corner', () => {
    // A soldier with an L-shaped path of empty cells reaches the end in one move.
    const ps = parse('CC.s CC.s ^^<> vv^^ ssvv');
    const s = ps.findIndex(p => p.t === 'S' && p.r === 0 && p.c === 3);
    expect(destinations(ps, s)).toContainEqual({ r: 1, c: 2 });
  });
});

describe('tangram', () => {
  it('the seven pieces have the right areas and tile the 4×4 square', () => {
    const areas = IDS.map(id => area(STANDARD[id]));
    expect(areas.reduce((a, v) => a + v, 0)).toBe(16);
    expect(areas.sort()).toEqual([1, 1, 2, 2, 2, 4, 4]);
    const square = [[[0, 0], [4, 0], [4, 4], [0, 4]]] as [number, number][][];
    expect(compare(square, IDS.map(id => STANDARD[id])).error).toBeLessThan(0.001);
  });
  it('placements rotate in 45° steps and mirror; area is preserved', () => {
    for (const id of IDS) for (let rot = 0; rot < 8; rot++) for (const flip of [false, true]) {
      expect(area(polygon({ id, x: 3, y: -2, rot, flip }))).toBeCloseTo(area(STANDARD[id]), 9);
    }
  });
  it('every silhouette is a valid solution: right pieces, no overlaps, area 16', () => {
    const want = IDS.map(id => area(STANDARD[id])).sort();
    for (const s of SILHOUETTES) {
      expect(s.polys, s.id).toHaveLength(7);
      expect(s.polys.map(area).sort(), s.id).toEqual(want);
      expect(compare(s.polys, s.polys).overlap, s.id).toBe(0);
    }
  });
  it('accepts a correct arrangement and rejects a shifted one', () => {
    const target = SILHOUETTES[0].polys;
    const placed: Place[] = IDS.map(id => { const [x, y] = centroid(STANDARD[id]); return { id, x, y, rot: 0, flip: false }; });
    expect(compare(target, placed.map(polygon)).error).toBeLessThan(SOLVED_ERROR);
    const off = placed.map((p, i) => (i === 0 ? { ...p, x: p.x + 0.5 } : p));
    expect(compare(target, off.map(polygon)).error).toBeGreaterThan(SOLVED_ERROR);
  });
  it('snaps a nearby vertex onto an anchor', () => {
    const [x, y] = centroid(STANDARD.L1);
    const p = snap({ id: 'L1', x: x + 0.2, y: y - 0.15, rot: 0, flip: false }, [[0, 0]]);
    expect(p.x).toBeCloseTo(x); expect(p.y).toBeCloseTo(y);
    const far = snap({ id: 'L1', x: x + 2, y, rot: 0, flip: false }, [[0, 0]], 0.45);
    expect(far.x).toBeCloseTo(x + 2);
  });
});
