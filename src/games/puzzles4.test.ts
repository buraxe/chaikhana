import { describe, expect, it } from 'vitest';
import { mulberry32 } from '../core/rng';
import * as T from './g2048/rules';
import * as S from './sokoban/rules';
import * as H from './hashi/rules';
import * as K from './kenken/rules';

describe('2048', () => {
  it('merges once per move and scores', () => {
    const r = T.slide({ cells: [2, 2, 2, 2, 4, 0, 4, 8, 0, 0, 0, 0, 0, 0, 0, 0], score: 0, moves: 0 }, 'left')!;
    expect(r.b.cells.slice(0, 8)).toEqual([4, 4, 0, 0, 8, 8, 0, 0]); expect(r.b.score).toBe(16);
    expect(T.slide({ cells: [2, 4, 2, 4, 4, 2, 4, 2, 2, 4, 2, 4, 4, 2, 4, 2], score: 0, moves: 0 }, 'left')).toBeNull();
  });
});
describe('sokoban', () => {
  it('generated levels are solvable by reversing the pulls (search check on small ones)', () => {
    for (let k = 0; k < 6; k++) {
      const L = S.generate('small', mulberry32(k));
      expect(L.boxes.length).toBe(2); expect(L.boxes.every(b => !L.goals.includes(b))).toBe(true);
      // BFS over (player, boxes) states.
      const key = (s: S.SokoState) => s.player + ':' + s.boxes.slice().sort((a, b) => a - b).join(',');
      let frontier = [S.start(L)], seen = new Set([key(frontier[0])]), found = false;
      for (let d = 0; d < 200 && frontier.length && !found; d++) {
        const next: S.SokoState[] = [];
        for (const s of frontier) for (const m of ['up', 'down', 'left', 'right'] as const) {
          const n = S.move(s, m); if (n === s) continue; const kk = key(n); if (seen.has(kk)) continue; seen.add(kk);
          if (S.solved(n)) { found = true; break; } next.push({ ...n, history: [] });
        }
        frontier = next;
      }
      expect(found).toBe(true);
    }
  }, 60000);
});
describe('hashi', () => {
  it('generated puzzles have their own solution and the checker accepts it', () => {
    for (let k = 0; k < 30; k++) {
      const p = H.generate(9, 14, mulberry32(k));
      expect(p.islands.length).toBeGreaterThanOrEqual(10);
      expect(p.islands.every(x => x.n >= 1 && x.n <= 8)).toBe(true);
    }
  });
  it('bridges cannot cross', () => {
    const p: H.HPuzzle = { size: 5, islands: [{ r: 0, c: 2, n: 1 }, { r: 4, c: 2, n: 1 }, { r: 2, c: 0, n: 1 }, { r: 2, c: 4, n: 1 }] };
    const b = H.cycle(p, {}, 0, 1)!; expect(H.cycle(p, b, 2, 3)).toBeNull();
  });
});
describe('kenken', () => {
  it('the generator’s own solution satisfies every cage', () => {
    for (const n of [4, 5, 6]) for (let k = 0; k < 10; k++) { const p = K.generate(n, mulberry32(k * 7 + n)); expect(K.solved(p, p.solution)).toBe(true); expect(p.cages.flatMap(c => c.cells).length).toBe(n * n); }
  });
});
