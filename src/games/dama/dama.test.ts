import { describe, expect, it } from 'vitest';
import { mulberry32 } from '../../core/rng';
import { chooseMove, legalMoves, newGame, outcome, play, type DState } from './rules';

const at = (r: number, c: number) => r * 8 + c;
const custom = (pieces: [number, number, number][], turn: 1 | -1 = 1): DState => {
  const cells = new Array(64).fill(0);
  for (const [r, c, v] of pieces) cells[at(r, c)] = v;
  return { cells, turn, quiet: 0, history: [] };
};

describe('dama rules', () => {
  it('starts with 16 men each and white moves forward or sideways only', () => {
    const st = newGame();
    expect(st.cells.filter(v => v === 1)).toHaveLength(16);
    const ms = legalMoves(st);
    expect(ms.every(m => Math.floor(m.path[1] / 8) === 4)).toBe(true); // only front row can move: up into row 4
    expect(ms).toHaveLength(8);
  });
  it('men never move backward', () => {
    const st = custom([[4, 4, 1], [0, 0, -1]]);
    const dests = legalMoves(st).filter(m => m.path[0] === at(4, 4)).map(m => m.path[1]).sort((a, b) => a - b);
    expect(dests).toEqual([at(3, 4), at(4, 3), at(4, 5)]);
  });
  it('capture is compulsory and the longest capture must be chosen', () => {
    // White man at (5,4). Black at (4,4) and (2,4): up-up takes two. Black at (5,5) sideways takes one.
    const st = custom([[5, 4, 1], [4, 4, -1], [2, 4, -1], [5, 5, -1], [0, 0, -2]]);
    const ms = legalMoves(st);
    expect(ms.every(m => m.captured.length === 2)).toBe(true);
    expect(ms[0].path).toEqual([at(5, 4), at(3, 4), at(1, 4)]);
  });
  it('kings fly, capture at a distance and choose any landing square', () => {
    const st = custom([[7, 0, 2], [3, 0, -1], [0, 7, -1]]);
    const ms = legalMoves(st);
    expect(ms.length).toBe(3); // land on (2,0), (1,0) or (0,0)
    expect(ms.every(m => m.captured[0] === at(3, 0))).toBe(true);
  });
  it('a king cannot turn back 180° between captures', () => {
    // King at (4,0) captures (4,2) landing (4,3..); a piece at (4,1)... use: after capturing right, the only further capture would be back left.
    const st = custom([[4, 3, 2], [4, 5, -1], [4, 1, -1], [0, 7, -1]]);
    for (const m of legalMoves(st)) expect(m.captured.length).toBe(1);
  });
  it('captured pieces are removed at once, opening new lines', () => {
    // King at (7,7): takes (7,4) landing (7,3) or further; then up the column... and a piece crossed twice is impossible.
    const st = custom([[6, 6, 2], [6, 3, -1], [3, 2, -1], [0, 0, -1]]);
    const best = legalMoves(st);
    expect(best[0].captured.length).toBe(2);
  });
  it('a man reaching the far row is crowned', () => {
    const st = play(custom([[1, 3, 1], [7, 7, -1]]), { path: [at(1, 3), at(0, 3)], captured: [] });
    expect(st.cells[at(0, 3)]).toBe(2);
  });
  it('wins when the opponent has no pieces or no moves; lone king vs lone man is a draw', () => {
    expect(outcome(custom([[4, 4, 1]], -1))).toBe(1);
    expect(outcome(custom([[4, 4, 2], [0, 0, -1]], 1))).toBe(0);
    // Black man at (7,3) cannot move down, and sideways is blocked by white men: blocked = loss.
    expect(outcome(custom([[7, 3, -1], [7, 2, 1], [7, 1, 1], [7, 4, 1], [7, 5, 1]], -1))).toBe(1);
  });
});

describe('dama AI', () => {
  it('returns legal moves and deeper search beats random', () => {
    let wins = 0;
    for (let g = 0; g < 4; g++) {
      const rng = mulberry32(g), strong = g % 2 ? -1 : 1;
      let st = newGame();
      for (let k = 0; k < 300 && outcome(st) === null; k++) {
        const m = chooseMove(st, st.turn === strong ? 2 : 0, { rng, depth: st.turn === strong ? 3 : undefined });
        expect(legalMoves(st)).toContainEqual(m);
        st = play(st, m);
      }
      if (outcome(st) === strong) wins++;
    }
    expect(wins).toBeGreaterThanOrEqual(3);
  });
});
