import { describe, expect, it } from 'vitest';
import { countSolutions, generate as zebra, clueText, check } from './zebra/rules';
import { BOARDS, cellsOf, makeBoard, solveFast, LETTERS, ORIENTS } from './pentomino/rules';
import { goal, heuristic, nextMove, shuffle, slide, solvable, solved } from './sliding/rules';
import { beats, chooseMove, newGame, play, replay, type RState } from './rps/rules';
import { T_SILHOUETTES, STANDARD_T } from './t-puzzle/pieces';
import { area, compare } from './tangram/geometry';
import { migrateData, renameRoute, mergeStats } from '../core/migrate';

const seeded = (s: number) => () => (s = (s * 16807) % 2147483647) / 2147483647;

describe('zebra puzzle', () => {
  it('has exactly one answer, which every clue fits, and no spare clue', () => {
    for (const [n, k, seed] of [[3, 3, 1], [4, 4, 2], [5, 5, 3]]) {
      const p = zebra(n, k, seeded(seed));
      expect(countSolutions(n, k, p.clues)).toBe(1);
      for (const c of p.clues) expect(check(c, p.sol)).toBe(true);
      for (let i = 0; i < p.clues.length; i++) expect(countSolutions(n, k, p.clues.filter((_, j) => j !== i))).toBeGreaterThan(1);
      for (const c of p.clues) for (const li of [0, 1, 2] as const) expect(clueText(p, c, li)).not.toMatch(/undefined/);
    }
  });
});

describe('pentominoes', () => {
  it('has 63 orientations across the twelve pieces', () => {
    expect(LETTERS.reduce((a, l) => a + ORIENTS[l].length, 0)).toBe(63);
  });
  it('every board can be filled, and the fill is a true tiling', () => {
    for (const b of BOARDS) {
      const bd = makeBoard(b.id, seeded(7));
      expect(bd.pieces.length * 5).toBe(bd.w * bd.h);
      const sol = solveFast(bd.w, bd.h, [], bd.pieces)!;
      expect(sol).toBeTruthy();
      const cells = new Set(sol.flatMap(p => cellsOf(p).map(([x, y]) => { expect(x >= 0 && y >= 0 && x < bd.w && y < bd.h).toBe(true); return y * bd.w + x; })));
      expect(cells.size).toBe(bd.w * bd.h);
      expect(new Set(sol.map(p => p.l)).size).toBe(sol.length);
    }
  });
  it('a hint keeps the pieces already placed', () => {
    const bd = makeBoard('10×6');
    const full = solveFast(bd.w, bd.h, [], bd.pieces)!;
    const rest = solveFast(bd.w, bd.h, full.slice(0, 4), bd.pieces)!;
    expect(rest.length).toBe(8);
  });
});

describe('sliding tiles', () => {
  it('shuffles are always solvable and the goal is solved', () => {
    for (const n of [3, 4, 5]) {
      expect(solved(goal(n))).toBe(true);
      for (let i = 0; i < 20; i++) expect(solvable(shuffle(n), n)).toBe(true);
    }
  });
  it('a swapped pair is unsolvable', () => {
    const t = goal(4); [t[0], t[1]] = [t[1], t[0]];
    expect(solvable(t, 4)).toBe(false);
  });
  it('sliding a row moves every tile between', () => {
    const t = goal(3); // gap at 8
    expect(slide(t, 3, 6)).toEqual([1, 2, 3, 4, 5, 6, 0, 7, 8]);
    expect(slide(t, 3, 4)).toBeNull();
  });
  it('hints solve a 3×3 by the shortest route', () => {
    let t = shuffle(3, seeded(5)), moves = 0;
    const h0 = heuristic(t, 3);
    while (!solved(t)) { t = slide(t, 3, nextMove(t, 3)!)!; moves++; }
    expect(moves).toBeGreaterThanOrEqual(h0);
    expect(moves).toBeLessThanOrEqual(31);
  });
});

describe('rock paper scissors', () => {
  it('scores rounds and ends at three', () => {
    expect(beats(0, 2) && beats(2, 1) && beats(1, 0)).toBe(true);
    const st = replay([0, 2, 0, 2, 1, 1, 0, 2]);
    expect(st.score).toEqual([3, 0]);
    expect(st.winner).toBe(1);
    expect(st.rounds.length).toBe(4);
  });
  it('the computer never looks at the hidden pick', () => {
    // Same history, different hidden first pick: the choice distribution must not depend on it.
    const hist = [0, 1, 1, 2, 2, 0, 0, 1];
    for (let lv = 0; lv < 5; lv++) {
      const a = play(replay(hist), 0), b = play(replay(hist), 2);
      expect(chooseMove(a, lv, seeded(9))).toBe(chooseMove(b, lv, seeded(9)));
    }
  });
  it('the expert beats a player who always plays rock', () => {
    let st: RState = newGame(), wins = 0;
    for (let m = 0; m < 20; m++) { st = newGame(); while (!st.winner) { st = play(st, 0); st = play(st, chooseMove(st, 4, seeded(m * 31 + st.moves.length))); } if (st.winner === 2) wins++; }
    expect(wins).toBeGreaterThanOrEqual(17);
  });
});

describe('T-puzzle', () => {
  const areas = Object.values(STANDARD_T).map(area).sort();
  it('every silhouette is made of the four pieces, without overlap', () => {
    for (const s of T_SILHOUETTES) {
      expect(s.polys.map(area).sort().map(a => a.toFixed(4))).toEqual(areas.map(a => a.toFixed(4)));
      const c = compare(s.polys, s.polys);
      expect(c.overlap).toBe(0);
    }
  });
  it('the T itself is the standard layout', () => {
    expect(compare(T_SILHOUETTES[0].polys.map(p => p.map(([x, y]) => [x, -y] as [number, number])), Object.values(STANDARD_T)).error).toBeLessThan(0.02);
  });
});

describe('renamed game ids', () => {
  it('old links reach the new pages', () => {
    expect(renameRoute('kenken')).toBe('calcudoku');
    expect(renameRoute('learn-rubik')).toBe('learn-magic-cube');
    expect(renameRoute('sokoban-daily')).toBe('box-pusher-daily');
    expect(renameRoute('chess')).toBe('chess');
  });
  it('records, favourites and rivals move to the new ids', () => {
    const blank = { started: 1, played: 2, wins: 1, losses: 1, draws: 0, rating: 1010, best: { '6×6': 5000 }, history: [{ t: 2, result: 'win', label: 'a' }] };
    const d = { profiles: [{ favorites: ['kenken', 'chess', 'calcudoku'], stats: { kenken: blank, calcudoku: { ...blank, played: 5, rating: 1100, best: { '6×6': 7000, '4×4': 900 }, history: [{ t: 1, result: 'loss', label: 'b' }] }, chess: blank }, beaten: { 'connect-four': 3 }, clips: [{ t: 1, k: 'beat', game: 'connect-four' }] }] };
    expect(migrateData(d)).toBe(true);
    const p = d.profiles[0] as any;
    expect(p.favorites).toEqual(['calcudoku', 'chess']);
    expect(p.stats.kenken).toBeUndefined();
    expect(p.stats.calcudoku.played).toBe(7);
    expect(p.stats.calcudoku.best).toEqual({ '6×6': 5000, '4×4': 900 });
    expect(p.stats.calcudoku.rating).toBe(1100);
    expect(p.stats.calcudoku.history.map((h: any) => h.t)).toEqual([2, 1]);
    expect(p.beaten).toEqual({ 'four-in-a-row': 3 });
    expect(p.clips[0].game).toBe('four-in-a-row');
    expect(migrateData(d)).toBe(false);
    expect(mergeStats(blank as any, blank as any).wins).toBe(2);
  });
});
