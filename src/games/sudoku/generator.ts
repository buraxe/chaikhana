/**
 * Puzzle generation: build a full valid grid, then remove clues one at a time,
 * keeping a removal only if the puzzle still has exactly one solution.
 *
 * Easy and Medium are also required to stay solvable by singles alone, so they
 * never need guessing. Hard and Expert are dug further and (on 9×9) are retried
 * until singles are not enough.
 */
import { shuffle, type Rng } from '../../core/rng';
import { SHAPES, logicSolve, solveCount, type Shape } from './rules';

export type Difficulty = 'easy' | 'medium' | 'hard' | 'expert';
export const DIFFICULTIES: Difficulty[] = ['easy', 'medium', 'hard', 'expert'];
export const SIZES = [4, 6, 9, 16];

/** Clue counts the digger aims for. It stops earlier if no further clue can go. */
const TARGET: Record<number, Record<Difficulty, number>> = {
  4: { easy: 8, medium: 6, hard: 5, expert: 4 },
  6: { easy: 20, medium: 16, hard: 13, expert: 10 },
  9: { easy: 40, medium: 32, hard: 27, expert: 23 },
  16: { easy: 150, medium: 128, hard: 112, expert: 100 },
};

export interface Puzzle {
  size: number; difficulty: Difficulty; givens: number[]; solution: number[];
  clues: number; technique: 'singles' | 'search';
}

/** A random complete grid. Small sizes use a randomised solve; 16×16 shuffles a base pattern. */
export function fullGrid(s: Shape, rng: Rng): number[] {
  const n = s.n;
  if (n <= 9) {
    const out = new Array<number>(n * n).fill(0);
    solveCount(s, out.slice(), 1, { rng, out });
    return out;
  }
  const order = (groups: number, per: number) => {
    const g = shuffle([...Array(groups).keys()], rng);
    return g.flatMap(k => shuffle([...Array(per).keys()], rng).map(i => k * per + i));
  };
  const rows = order(n / s.br, s.br), cols = order(n / s.bc, s.bc);
  const digits = shuffle([...Array(n).keys()], rng);
  const out: number[] = [];
  for (const r of rows) for (const c of cols) out.push(digits[(s.bc * (r % s.br) + Math.floor(r / s.br) + c) % n] + 1);
  return out;
}

export function generate(size: number, difficulty: Difficulty, rng: Rng = Math.random, budgetMs = 3000): Puzzle {
  const s = SHAPES[size], target = TARGET[size][difficulty];
  const needLogic = difficulty === 'easy' || difficulty === 'medium';
  const deadline = Date.now() + budgetMs;
  let best: Puzzle | null = null;
  for (let attempt = 0; attempt < 6; attempt++) {
    const solution = fullGrid(s, rng), givens = solution.slice();
    let clues = givens.length;
    for (const cell of shuffle([...givens.keys()], rng)) {
      if (clues <= target || Date.now() > deadline) break;
      const v = givens[cell];
      givens[cell] = 0;
      let ok = logicSolve(s, givens);
      if (!ok && !needLogic) ok = solveCount(s, givens, 2, { deadline }) === 1;
      if (ok) clues--; else givens[cell] = v;
    }
    const technique = logicSolve(s, givens) ? 'singles' : 'search';
    best = { size, difficulty, givens, solution, clues, technique };
    if (needLogic || size !== 9 || technique === 'search' || Date.now() > deadline) break;
  }
  return best!;
}
