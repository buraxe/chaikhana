import { describe, expect, it } from 'vitest';
import { mulberry32 } from '../../core/rng';
import { applyStep, BAR, chooseSequence, endPositions, gameValue, initialBoard, OFF, pips, sequences, singleMoves, winner, type Board } from './rules';

const empty = (): Board => [new Array(26).fill(0), new Array(26).fill(0)];

describe('tavla rules', () => {
  it('starts with 15 checkers each and a pip count of 167', () => {
    const b = initialBoard();
    expect(b[0].reduce((a, n) => a + n, 0)).toBe(15);
    expect(pips(b, 0)).toBe(167);
    expect(pips(b, 1)).toBe(167);
  });
  it('cannot land on a point the opponent holds with two or more', () => {
    const b = initialBoard();
    // From my 24 with a 5 I would land on my 19 = opponent's 6, which holds five.
    expect(singleMoves(b, 0, 5).some(s => s.from === 24)).toBe(false);
  });
  it('hits a blot and sends it to the bar; a checker on the bar must enter first', () => {
    const b = empty();
    b[0][10] = 1; b[0][6] = 14; b[1][25 - 7] = 1; b[1][1] = 14;
    const after = applyStep(b, 0, { from: 10, to: 7, die: 3, hit: true });
    expect(after[1][BAR]).toBe(1);
    expect(after[1][18]).toBe(0);
    const entering = singleMoves(after, 1, 2);
    expect(entering.every(s => s.from === BAR)).toBe(true);
  });
  it('doubles give four moves', () => {
    const seqs = sequences(initialBoard(), 0, [3, 3]);
    expect(seqs.every(q => q.length === 4)).toBe(true);
  });
  it('must use both dice when possible, otherwise the larger one', () => {
    // Opponent's spare checkers sit on their own 1-point (my 24), out of the way.
    const b = empty();
    b[0][8] = 1; b[0][6] = 14;
    b[1][25 - 2] = 2; b[1][25 - 4] = 2; b[1][1] = 11;
    // Roll 6-1: 8→2 is blocked, but 8→7→1 uses both dice, so every legal play uses both.
    expect(sequences(b, 0, [6, 1]).every(q => q.length === 2)).toBe(true);
    const b2 = empty();
    b2[0][7] = 1; b2[0][6] = 14;
    b2[1][25 - 3] = 2; b2[1][25 - 2] = 2; b2[1][1] = 11;
    // Roll 5-4: 7→2 and 7→3 are blocked, 6→2 and 6→1 need… 6→1 with 5 is open: check that only legal plays come back.
    for (const q of sequences(b2, 0, [5, 4])) for (const st of q) expect([2, 3]).not.toContain(st.to);
    const b3 = empty();
    b3[0][10] = 1; b3[0][6] = 14;
    b3[1][25 - 5] = 2; b3[1][25 - 1] = 2; b3[1][1] = 11;
    // Roll 6-5: 10→5 is blocked; 10→4 works, and then no 5 can be played (6→1 blocked, 4 cannot bear off past the 6s).
    const s3 = sequences(b3, 0, [6, 5]);
    expect(s3.length).toBeGreaterThan(0);
    expect(s3.every(q => q.length === 1 && q[0].die === 6)).toBe(true);
  });
  it('bears off only when every checker is home, and a larger die only from the highest point', () => {
    const b = empty();
    b[0][3] = 2; b[0][2] = 13; b[1][24] = 15;
    const moves = singleMoves(b, 0, 6);
    expect(moves).toEqual([{ from: 3, to: OFF, die: 6, hit: false }]);
    b[0][8] = 1; b[0][2] = 12;
    expect(singleMoves(b, 0, 6).some(s => s.to === OFF)).toBe(false);
  });
  it('scores mars when the loser has borne off nothing', () => {
    const b = empty();
    b[0][OFF] = 15; b[1][10] = 15;
    expect(winner(b)).toBe(0);
    expect(gameValue(b, 0)).toBe(2);
    b[1][OFF] = 1; b[1][10] = 14;
    expect(gameValue(b, 0)).toBe(1);
  });
});

describe('tavla AI', () => {
  it('always returns one of the legal sequences', () => {
    const rng = mulberry32(3);
    let b = initialBoard(), p = 0;
    for (let turn = 0; turn < 60 && winner(b) < 0; turn++) {
      const roll = [1 + Math.floor(rng() * 6), 1 + Math.floor(rng() * 6)];
      const seq = chooseSequence(b, p, roll, turn % 5, rng);
      const legal = endPositions(b, p, roll).map(e => JSON.stringify(e.board));
      const end = seq.reduce((bd, s) => applyStep(bd, p, s), b);
      expect(legal).toContain(JSON.stringify(end));
      b = end; p = 1 - p;
    }
  });
  it('stronger levels beat weaker ones over several games', () => {
    const play = (lvA: number, lvB: number, seed: number) => {
      const rng = mulberry32(seed);
      let b = initialBoard(), p = seed % 2;
      while (winner(b) < 0) {
        const roll = [1 + Math.floor(rng() * 6), 1 + Math.floor(rng() * 6)];
        const seq = chooseSequence(b, p, roll, p === 0 ? lvA : lvB, rng);
        b = seq.reduce((bd, s) => applyStep(bd, p, s), b); p = 1 - p;
      }
      return winner(b);
    };
    let wins = 0;
    for (let g = 0; g < 20; g++) if (play(2, 0, g) === 0) wins++;
    expect(wins).toBeGreaterThanOrEqual(15);
  });
});
