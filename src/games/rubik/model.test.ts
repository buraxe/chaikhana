import { describe, expect, it } from 'vitest';
import { createRequire } from 'node:module';
import { mulberry32 } from '../../core/rng';
import { apply, applyAll, faceMove, facelets2as3, facelets3, inverse, isSolved, parse, scramble, solved } from './model';

const require = createRequire(import.meta.url);
const Cube = require('cubejs');

describe('cube model', () => {
  it('has 6·N² stickers and starts solved', () => {
    for (const n of [2, 3, 4, 5]) { const c = solved(n); expect(c.stickers).toHaveLength(6 * n * n); expect(isSolved(c)).toBe(true); }
  });
  it('four quarter turns of any layer return to the start; inverse undoes', () => {
    for (const n of [2, 3, 4, 5]) for (let axis = 0 as 0 | 1 | 2; axis < 3; axis++) for (let layer = 0; layer < n; layer++) {
      const m = { axis, layer, dir: 1 as const };
      const once = apply(solved(n), m);
      expect(isSolved(once)).toBe(false);
      expect(isSolved(applyAll(solved(n), [m, m, m, m]))).toBe(true);
      expect(isSolved(apply(once, inverse(m)))).toBe(true);
    }
  });
  it('(R U R\' U\') six times is the identity', () => {
    expect(isSolved(applyAll(solved(3), Array(6).fill(parse(3, "R U R' U'")).flat()))).toBe(true);
  });
  it('whole-cube rotations keep a solved cube solved', () => {
    expect(isSolved(applyAll(solved(3), parse(3, 'x y z y')))).toBe(true);
  });
  it('facelet strings match cubejs for single moves and a scramble', () => {
    expect(facelets3(solved(3))).toBe('UUUUUUUUURRRRRRRRRFFFFFFFFFDDDDDDDDDLLLLLLLLLBBBBBBBBB');
    for (const mv of ['U', 'R', 'F', 'D', 'L', 'B', "R'", 'U2']) {
      const ref = new Cube(); ref.move(mv);
      expect(facelets3(applyAll(solved(3), parse(3, mv)))).toBe(ref.asString());
    }
    const seq = "R U F' L2 D B' R2 U' F D2 L B2";
    const ref = new Cube(); ref.move(seq);
    expect(facelets3(applyAll(solved(3), parse(3, seq)))).toBe(ref.asString());
  });
  it('the facelet string does not depend on whole-cube orientation', () => {
    // Rotating the whole cube relabels faces by their centres, so the solver sees the same position.
    const c = applyAll(solved(3), parse(3, "R U F'"));
    const turned = applyAll(c, parse(3, 'x y'));
    const sol = Cube.fromString(facelets3(turned)).solve();
    expect(isSolved(applyAll(turned, parse(3, sol)))).toBe(true);
  });
});

describe('solving', () => {
  Cube.initSolver();
  it('Kociemba solves scrambled 3×3 cubes in this model', () => {
    for (let s = 0; s < 5; s++) {
      const c = applyAll(solved(3), scramble(3, 25, mulberry32(s)).filter(m => m.layer !== 1));
      const sol = Cube.fromString(facelets3(c)).solve();
      expect(isSolved(applyAll(c, parse(3, sol)))).toBe(true);
    }
  }, 60000);
  it('solves after whole-cube rotations too', () => {
    const c = applyAll(solved(3), [...parse(3, "R U2 F' L D'"), faceMove(3, 'x'), faceMove(3, 'y')]);
    const sol = Cube.fromString(facelets3(c)).solve();
    expect(isSolved(applyAll(c, parse(3, sol)))).toBe(true);
  });
  it('2×2 positions solve through the 3×3 solver, odd and even corner parity', () => {
    for (let s = 0; s < 8; s++) {
      const c = applyAll(solved(2), scramble(2, 12, mulberry32(100 + s)));
      const sol = Cube.fromString(facelets2as3(c)).solve();
      expect(isSolved(applyAll(c, parse(2, sol)))).toBe(true);
    }
  }, 60000);
});
