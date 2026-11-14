import { describe, expect, it } from 'vitest';
import { mulberry32 } from '../core/rng';
import * as L from './luban/rules';
import LOCKS from './luban/locks.json';
import * as S from './seven-cube/rules';
import * as N from './snake/rules';

describe('lu ban lock', () => {
  it('every lock comes apart in the stated number of moves and is not loose', () => {
    for (const lock of LOCKS as L.Lock[]) {
      const path = L.solve(lock.pieces, L.startPos(6), 3, 80000)!;
      expect(path).not.toBeNull();
      expect(path.length).toBe(lock.moves);
      expect(L.level(path)).toBe(lock.level);
      // No two pieces overlap at the start.
      const all = lock.pieces.flat().map(c => c.join(','));
      expect(new Set(all).size).toBe(all.length);
    }
  });
});
describe('seven-cube', () => {
  it('has the seven pieces, 27 cubes in all', () => {
    expect(S.PIECES.reduce((a, p) => a + p.cells.length, 0)).toBe(27);
    expect(S.orientations(S.PIECES[6].cells).length).toBe(8);
    expect(S.orientations(S.PIECES[4].cells).length).toBe(12);
  });
  it('every figure can be built', () => {
    for (const f of S.FIGURES) {
      expect(f.cells.length).toBe(27);
      expect(new Set(f.cells.map(S.cellKey)).size).toBe(27);
      expect(S.solve(f.cells).length, f.id).toBe(1);
    }
  });
});
describe('snake cube', () => {
  it('folds the classic snake', () => {
    const s = N.SNAKES[0];
    expect(N.cubes(s.runs)).toBe(27);
    const tw = N.solve(s.runs)!;
    expect(tw).not.toBeNull();
    expect(N.solved(s.runs, tw)).toBe(true);
  });
  it('random snakes always fold', () => {
    for (let k = 0; k < 6; k++) { const r = N.randomSnake(mulberry32(k)); expect(N.cubes(r)).toBe(27); expect(N.solve(r)).not.toBeNull(); }
  });
});

import BURRS from './burr/locks.json';
import PACK from './packing/sets.json';
import ASM from './assembly/sets.json';
describe('more 3D puzzles', () => {
  it('burrs come apart in the stated moves', () => {
    for (const lock of BURRS as L.Lock[]) { const path = L.solve(lock.pieces, L.startPos(6), 3, 150000)!; expect(path.length).toBe(lock.moves); expect(L.level(path)).toBe(lock.level); }
  });
  it('kongming locks have a way in that the hint can follow', () => {
    for (const lock of (LOCKS as L.Lock[]).filter(l => l.level <= 4)) {
      const { at } = L.trail(lock.pieces);
      expect(at[at.length - 1].every(o => !o)).toBe(true);
      expect(L.isHome(at[0])).toBe(true);
    }
  });
  it('every box and figure can be filled with its pieces', () => {
    for (const f of [...PACK, ...ASM] as S.Figure[]) {
      expect(f.pieces!.reduce((a, p) => a + p.cells.length, 0)).toBe(f.cells.length);
      expect(S.solve(f.cells, new Map(), 1, f.pieces).length, f.id).toBe(1);
    }
  });
});
