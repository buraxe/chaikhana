import { describe, expect, it } from 'vitest';
import { mulberry32 } from '../../core/rng';
import { DIFFICULTIES, fullGrid, generate, SIZES } from './generator';
import { conflicts, findSingle, logicSolve, SHAPES, solveCount, sudokuRules, units } from './rules';

const validFull = (size: number, g: number[]) => {
  const s = SHAPES[size];
  return g.every(v => v >= 1 && v <= size) && conflicts(s, g).size === 0
    && units(s).all.every(u => new Set(u.map(i => g[i])).size === size);
};

describe('sudoku rules', () => {
  it('builds valid full grids for every size', () => {
    for (const size of SIZES) for (let k = 0; k < 5; k++) {
      expect(validFull(size, fullGrid(SHAPES[size], mulberry32(size * 100 + k)))).toBe(true);
    }
  });
  it('6×6 boxes are 2 rows by 3 columns', () => {
    expect(units(SHAPES[6]).all[0]).toEqual([0, 1, 2, 6, 7, 8]);
  });
  it('detects conflicts in row, column and box', () => {
    const g = new Array(81).fill(0);
    g[0] = 5; g[8] = 5; g[10] = 3; g[20] = 3; g[40] = 7; g[76] = 7;
    expect([...conflicts(SHAPES[9], g)].sort((a, b) => a - b)).toEqual([0, 8, 10, 20, 40, 76]);
  });
  it('counts multiple solutions and rejects contradictions', () => {
    const s = SHAPES[4];
    expect(solveCount(s, new Array(16).fill(0), 2)).toBe(2);
    const bad = new Array(16).fill(0); bad[0] = 1; bad[1] = 1;
    expect(solveCount(s, bad, 2)).toBe(0);
  });
  it('solves a known 9×9 puzzle to its known solution', () => {
    const p = '530070000600195000098000060800060003400803001700020006060000280000419005000080079';
    const a = '534678912672195348198342567859761423426853791713924856961537284287419635345286179';
    const out: number[] = [];
    expect(solveCount(SHAPES[9], [...p].map(Number), 2, { out })).toBe(1);
    expect(out.join('')).toBe(a);
  });
  it('finds a hidden single', () => {
    // Row 0 holds 1 2 3 in the first box's other rows' columns, forcing 4 in the box.
    const g = [0, 0, 1, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    const single = findSingle(SHAPES[4], [1, 2, 0, 0, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
    expect(single).toMatchObject({ cell: 5, value: 4 });
    expect(findSingle(SHAPES[4], g.map(() => 0))).toBeNull();
  });
});

describe('sudoku generator', () => {
  for (const size of [4, 6, 9]) for (const d of DIFFICULTIES) {
    it(`${size}×${size} ${d}: unique solution that matches`, () => {
      const p = generate(size, d, mulberry32(size * 7 + d.length));
      const out: number[] = [];
      expect(solveCount(SHAPES[size], p.givens, 2, { out })).toBe(1);
      expect(out).toEqual(p.solution);
      expect(p.givens.every((v, i) => v === 0 || v === p.solution[i])).toBe(true);
      if (d === 'easy' || d === 'medium') expect(logicSolve(SHAPES[size], p.givens)).toBe(true);
    });
  }
  it('9×9 hard needs more than singles', () => {
    const p = generate(9, 'hard', mulberry32(42));
    expect(p.technique).toBe('search');
    expect(p.clues).toBeLessThanOrEqual(30);
  });
  it('16×16 easy and hard are valid and unique', () => {
    for (const d of ['easy', 'hard'] as const) {
      const p = generate(16, d, mulberry32(16), 8000);
      expect(validFull(16, p.solution)).toBe(true);
      expect(solveCount(SHAPES[16], p.givens, 2)).toBe(1);
    }
  });
  it('the same seed gives the same puzzle', () => {
    const a = generate(9, 'medium', mulberry32(20261110), 15000);
    const b = generate(9, 'medium', mulberry32(20261110), 15000);
    expect(a.givens).toEqual(b.givens);
  });
});

describe('sudoku module', () => {
  it('refuses to overwrite givens and reports completion', () => {
    const p = generate(4, 'easy', mulberry32(1));
    let st = sudokuRules.initializeGame(p);
    const given = p.givens.findIndex(v => v);
    expect(sudokuRules.validateMove(st, { cell: given, value: 1 })).toBe(false);
    expect(sudokuRules.checkGameOver(st)).toBe(false);
    p.solution.forEach((v, cell) => { if (!p.givens[cell]) st = sudokuRules.applyMove(st, { cell, value: v }); });
    expect(sudokuRules.checkGameOver(st)).toBe(true);
    expect(sudokuRules.deserializeState(sudokuRules.serializeState(st))).toEqual(st);
  });
});
