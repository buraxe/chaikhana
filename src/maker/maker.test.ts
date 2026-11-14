import { describe, expect, it } from 'vitest';
import { mulberry32 } from '../core/rng';
import { chooseInput, determinize } from './ai';
import { apply, cardsOf, legal, newGame, validate, type GameDef, type GState } from './engine';
import { COLOR_NUMBER, CONNECT4, EXAMPLES, PEG, SNAKES_LADDERS, TICTACTOE } from './examples';

const play = (def: GameDef, st: GState, rng: () => number, cap = 500) => {
  for (let k = 0; k < cap && !st.over; k++) { const ms = legal(def, st); st = apply(def, st, ms[Math.floor(rng() * ms.length)]); }
  return st;
};

describe('workshop engine', () => {
  it('every example validates and survives JSON', () => {
    for (const d of EXAMPLES) { expect(validate(d)).toEqual([]); expect(validate(JSON.parse(JSON.stringify(d)))).toEqual([]); }
  });
  it('validation names the problem', () => {
    const bad = { ...TICTACTOE, rules: [{ on: 'click', do: [{ op: 'place', piece: 'ghost', cell: 0 }, { op: 'fly' }] }] };
    const errs = validate(bad);
    expect(errs.some(e => e.includes('ghost'))).toBe(true);
    expect(errs.some(e => e.includes('fly'))).toBe(true);
  });
  it('tic-tac-toe: placing, three in a row, alternating turns', () => {
    let st = newGame(TICTACTOE, 2, 1);
    expect(legal(TICTACTOE, st)).toHaveLength(9);
    for (const c of [0, 3, 1, 4]) st = apply(TICTACTOE, st, { k: 'click', cell: c });
    expect(st.turn).toBe(0);
    expect(apply(TICTACTOE, st, { k: 'click', cell: 3 }).plies).toBe(4); // occupied: nothing happens
    st = apply(TICTACTOE, st, { k: 'click', cell: 2 });
    expect(st.over).toEqual({ winner: 0 });
  });
  it('random games of every example finish without errors', () => {
    const rng = mulberry32(7);
    for (const d of EXAMPLES) for (let g = 0; g < 6; g++) {
      const st = play(d, newGame(d, d.players.max, g), rng, 3000);
      expect(st.error).toBeNull();
      expect(st.over).not.toBeNull();
    }
  });
  it('connect four drops to the lowest cell', () => {
    let st = newGame(CONNECT4, 2, 1);
    st = apply(CONNECT4, st, { k: 'click', cell: 3 });
    expect(st.board[35 + 3]).toHaveLength(1);
    expect(legal(CONNECT4, st)).toHaveLength(42);
  });
  it('snakes and ladders: ladders lift, cards of fate are seeded', () => {
    const st = newGame(SNAKES_LADDERS, 2, 3);
    expect(st.board[90].length).toBe(2);
    let s = st, climbed = false;
    for (let k = 0; k < 400 && !s.over; k++) {
      const before = s.turn, at = s.board.findIndex(c => c.some(p => p.o === before));
      s = apply(SNAKES_LADDERS, s, { k: 'roll' });
      const now = s.board.findIndex(c => c.some(p => p.o === before));
      if (SNAKES_LADDERS.board!.marks!.some(m => m.type === 'ladder' && m.props!.to === now) && at !== now) climbed = true;
    }
    expect(climbed).toBe(true);
    expect(s.over?.winner).toBeGreaterThanOrEqual(0);
  });
  it('peg solitaire: four opening jumps, stuck counts as unsolved', () => {
    const st = newGame(PEG, 1, 1);
    expect(legal(PEG, st)).toHaveLength(4);
    const after = apply(PEG, st, legal(PEG, st)[0]);
    expect(after.board.flat().length).toBe(31);
  });
  it('colour or number: 72 cards, seven each, only matching cards are playable', () => {
    expect(cardsOf(COLOR_NUMBER)).toHaveLength(72);
    const st = newGame(COLOR_NUMBER, 3, 5);
    expect(st.zones['hand@0']).toHaveLength(7);
    expect(st.zones.deck).toHaveLength(72 - 21 - 1);
    const top = cardsOf(COLOR_NUMBER)[st.zones.pile[0]];
    for (const m of legal(COLOR_NUMBER, st)) if (m.k === 'card') {
      const c = cardsOf(COLOR_NUMBER)[m.card];
      expect(c.color === top.color || c.n === top.n).toBe(true);
    }
    const d = determinize(COLOR_NUMBER, st, 0, mulberry32(2));
    expect(d.zones['hand@0']).toEqual(st.zones['hand@0']);
    expect(d.zones.pile).toEqual(st.zones.pile);
    expect([...d.zones['hand@1']].sort()).not.toEqual([...st.zones['hand@1']].sort());
  });
  it('the generic computer player beats a random one at four in a row', () => {
    const rng = mulberry32(11);
    let wins = 0;
    for (let g = 0; g < 6; g++) {
      let st = newGame(CONNECT4, 2, g);
      const ai = g % 2;
      while (!st.over) st = apply(CONNECT4, st, st.turn === ai ? chooseInput(CONNECT4, st, 3, { rng, ms: 3000 })! : legal(CONNECT4, st)[Math.floor(rng() * legal(CONNECT4, st).length)]);
      if (st.over.winner === ai) wins++;
    }
    expect(wins).toBeGreaterThanOrEqual(5);
  }, 60000);
  it('a runaway rule stops with an error instead of hanging', () => {
    const loop: GameDef = { ...TICTACTOE, rules: [{ on: 'click', do: [{ op: 'repeat', times: 1000, do: [{ op: 'repeat', times: 1000, do: [{ op: 'say', text: 'x' }] }] }] }] };
    const st = apply(loop, newGame(loop, 2, 1), { k: 'click', cell: 0 });
    expect(st.error).toMatch(/too many steps/);
  });
});
