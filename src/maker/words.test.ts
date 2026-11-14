import { describe, expect, it } from 'vitest';
import { apply, markGuess, newGame, upper, validate } from './engine';
import { LIGHTS, PEG, WORD_EN, WORD_TR } from './examples';
import { solve } from './solver';

describe('word puzzles', () => {
  it('marks like Wordle, counting repeated letters', () => {
    expect(markGuess('KALEM', 'KALEM')).toBe('ggggg');
    expect(markGuess('ELMAS', 'KALEM')).toBe('yyyy.');
    expect(markGuess('AABBB', 'XAXAX')).toBe('yg...');
    expect(markGuess('LLAMA', 'HELLO')).toBe('yy...');
  });
  it('Turkish upper case keeps the dots', () => {
    expect(upper(WORD_TR, 'insan')).toBe('İNSAN');
    expect(upper(WORD_TR, 'ılık')).toBe('ILIK');
  });
  it('both word lists are valid', () => { expect(validate(WORD_TR)).toEqual([]); expect(validate(WORD_EN)).toEqual([]); });
  it('a game: wrong length ignored, six misses lose, the secret wins', () => {
    let st = newGame(WORD_TR, 1, 3);
    const secret = st.words!.secret;
    expect(secret).toHaveLength(5);
    expect(apply(WORD_TR, st, { k: 'word', text: 'abc' }).words!.guesses).toHaveLength(0);
    const wrong = ['kalem', 'kitap', 'araba', 'deniz', 'güneş', 'bulut', 'çiçek'].filter(w => upper(WORD_TR, w) !== secret).slice(0, 6);
    let lost = st;
    for (const w of wrong) lost = apply(WORD_TR, lost, { k: 'word', text: w });
    expect(lost.over).toEqual({ winner: -1 });
    st = apply(WORD_TR, st, { k: 'word', text: secret.toLocaleLowerCase('tr') });
    expect(st.over).toEqual({ winner: 0 });
    expect(st.words!.guesses[0].marks).toBe('ggggg');
  });
  it('English needs a listed word', () => {
    const st = newGame(WORD_EN, 1, 1);
    expect(apply(WORD_EN, st, { k: 'word', text: 'zzzzz' }).words!.guesses).toHaveLength(0);
    expect(apply(WORD_EN, st, { k: 'word', text: 'apple' }).words!.guesses).toHaveLength(1);
  });
});

describe('solver', () => {
  it('finds the shortest way to switch every light off, and its moves really work', () => {
    const st = newGame(LIGHTS, 1, 1), r = solve(LIGHTS, st);
    expect(r.status).toBe('solved');
    if (r.status !== 'solved') return;
    let s = st;
    for (const m of r.path) s = apply(LIGHTS, s, m);
    expect(s.over).toEqual({ winner: 0 });
    expect(r.path.length).toBeLessThanOrEqual(9);
  });
  it('says "unknown" for a puzzle too big for its budget', () => {
    expect(solve(PEG, newGame(PEG, 1, 1), { maxStates: 2000 }).status).toBe('unknown');
  });
});
