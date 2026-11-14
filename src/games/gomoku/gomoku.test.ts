import { describe, expect, it } from 'vitest';
import { mulberry32 } from '../../core/rng';
import { chooseMove, Engine } from './ai';
import { gomokuRules, isForbidden, isLegal, N, newGame, play, replay, type Mode } from './rules';

const P = (x: number, y: number) => y * N + x;
/** Build a position directly: black and white stone lists, black to move unless stated. */
function setup(mode: Mode, black: number[], white: number[], turn: 1 | 2 = 1) {
  const st = newGame(mode);
  black.forEach(i => { st.cells[i] = 1; });
  white.forEach(i => { st.cells[i] = 2; });
  st.turn = turn;
  // Interleave so engines that replay the move list see the right colours.
  const n = Math.max(black.length, white.length);
  for (let k = 0; k < n; k++) { st.moves.push(black[k] ?? -1, white[k] ?? -1); }
  return st;
}
const board = (black: number[], white: number[] = []) => {
  const b = new Array<number>(N * N).fill(0);
  black.forEach(i => { b[i] = 1; }); white.forEach(i => { b[i] = 2; });
  return b;
};

describe('gomoku rules', () => {
  it('detects five in each of the four directions', () => {
    for (const [dx, dy] of [[1, 0], [0, 1], [1, 1], [1, -1]]) {
      const black = [0, 1, 2, 3].map(k => P(5 + dx * k, 7 + dy * k));
      const st = play(setup('freestyle', black, []), P(5 + dx * 4, 7 + dy * 4));
      expect(st.winner).toBe(1);
      expect(st.line).toHaveLength(5);
    }
  });
  it('alternates turns and rejects occupied points', () => {
    let st = newGame('freestyle');
    st = play(st, P(7, 7));
    expect(st.turn).toBe(2);
    expect(isLegal(st, P(7, 7))).toBe(false);
    expect(play(st, P(7, 7))).toBe(st);
  });
  it('overline wins in freestyle but not in standard', () => {
    const black = [3, 4, 5, 7, 8].map(x => P(x, 7));
    expect(play(setup('freestyle', black, []), P(6, 7)).winner).toBe(1);
    expect(play(setup('standard', black, []), P(6, 7)).winner).toBe(0);
  });
  it('no moves after the game ends; undo restores the position', () => {
    const st = play(setup('freestyle', [0, 1, 2, 3].map(x => P(x, 0)), []), P(4, 0));
    expect(isLegal(st, P(9, 9))).toBe(false);
    const g = replay('freestyle', [P(7, 7), P(8, 8), P(7, 8)]);
    expect(gomokuRules.undoMove!(g).moves).toEqual([P(7, 7), P(8, 8)]);
    expect(gomokuRules.deserializeState(gomokuRules.serializeState(g))).toEqual(g);
  });
});

describe('renju forbidden moves', () => {
  it('double-three is forbidden', () => {
    expect(isForbidden(board([P(6, 7), P(8, 7), P(7, 6), P(7, 8)]), P(7, 7))).toBe(true);
  });
  it('a three blocked on one side is not open, so the move is allowed', () => {
    expect(isForbidden(board([P(6, 7), P(8, 7), P(7, 6), P(7, 8)], [P(5, 7), P(9, 7)]), P(7, 7))).toBe(false);
  });
  it('double-four is forbidden, across two lines and within one line', () => {
    expect(isForbidden(board([P(4, 7), P(5, 7), P(6, 7), P(7, 4), P(7, 5), P(7, 6)]), P(7, 7))).toBe(true);
    // X _ X [X] X _ X : the middle stone makes two fours on one line
    expect(isForbidden(board([P(4, 7), P(6, 7), P(8, 7), P(10, 7)]), P(7, 7))).toBe(true);
  });
  it('a single open four is fine', () => {
    expect(isForbidden(board([P(5, 7), P(6, 7), P(8, 7)]), P(7, 7))).toBe(false);
  });
  it('overline is forbidden; exactly five overrides other restrictions', () => {
    expect(isForbidden(board([3, 4, 5, 7, 8].map(x => P(x, 7))), P(6, 7))).toBe(true);
    const five = [P(3, 7), P(4, 7), P(5, 7), P(6, 7), P(7, 5), P(7, 6), P(7, 8), P(6, 8), P(8, 6)];
    expect(isForbidden(board(five), P(7, 7))).toBe(false);
  });
  it('applies to Black only and leaves the board untouched', () => {
    const b = board([P(6, 7), P(8, 7), P(7, 6), P(7, 8)]), copy = b.slice();
    isForbidden(b, P(7, 7));
    expect(b).toEqual(copy);
    const st = setup('renju', [P(6, 7), P(8, 7), P(7, 6), P(7, 8)], []);
    expect(isLegal(st, P(7, 7))).toBe(false);
    expect(isLegal({ ...st, turn: 2 }, P(7, 7))).toBe(true);
    expect(isLegal({ ...st, mode: 'freestyle' }, P(7, 7))).toBe(true);
  });
  it('white wins with an overline in renju', () => {
    const st = play(setup('renju', [], [3, 4, 5, 7, 8].map(x => P(x, 7)), 2), P(6, 7));
    expect(st.winner).toBe(2);
  });
});

/** A real game position reached by legal alternating moves. */
const line = (mode: Mode, moves: [number, number][]) => replay(mode, moves.map(([x, y]) => P(x, y)));

describe('gomoku AI', () => {
  it('every level takes an immediate win', () => {
    const st = line('freestyle', [[5, 7], [5, 8], [6, 7], [6, 8], [7, 7], [7, 8], [8, 7], [1, 1]]);
    for (let lv = 0; lv < 5; lv++) expect([P(4, 7), P(9, 7)]).toContain(chooseMove(st, lv, { rng: mulberry32(lv) }));
  });
  it('every level blocks an immediate five', () => {
    const st = line('freestyle', [[5, 7], [5, 8], [6, 7], [1, 1], [7, 7], [4, 7], [8, 7]]);
    for (let lv = 0; lv < 5; lv++) expect(chooseMove(st, lv, { rng: mulberry32(lv) })).toBe(P(9, 7));
  });
  it('search levels stop an open three before it becomes an open four', () => {
    const st = line('freestyle', [[7, 7], [1, 1], [8, 7], [13, 13], [9, 7]]);
    for (let lv = 1; lv < 5; lv++) expect([P(5, 7), P(6, 7), P(10, 7), P(11, 7)]).toContain(chooseMove(st, lv, { rng: mulberry32(lv) }));
  });
  it('threat search finds a forced win by fours', () => {
    // Black: three on row 7 and three on column 9 sharing no stone; a four on the row
    // forces a block and sets up a second four.
    const e = new Engine('freestyle');
    [P(6, 7), P(7, 7), P(8, 7), P(9, 4), P(9, 5), P(9, 6)].forEach(i => e.place(i, 1));
    [P(5, 7), P(9, 3)].forEach(i => e.place(i, 2));
    const m = e.vcf(1, 6);
    expect(m).toBe(P(9, 7));
  });
  it('never returns an occupied or forbidden point', () => {
    let st = newGame('renju');
    for (let k = 0; k < 40 && !st.winner && !st.draw; k++) {
      const m = chooseMove(st, k % 2 ? 2 : 0, { rng: mulberry32(k), timeScale: 0.2 });
      expect(isLegal(st, m)).toBe(true);
      st = play(st, m);
    }
  });
  it('stronger levels beat weaker ones', () => {
    let wins = 0;
    for (let game = 0; game < 4; game++) {
      const strongIsBlack = game % 2 === 0, rng = mulberry32(100 + game);
      let st = newGame('freestyle');
      while (!st.winner && !st.draw) {
        const strong = (st.turn === 1) === strongIsBlack;
        st = play(st, chooseMove(st, strong ? 3 : 0, { rng, timeScale: 0.25 }));
      }
      if ((st.winner === 1) === strongIsBlack) wins++;
    }
    expect(wins).toBe(4);
  });
});
