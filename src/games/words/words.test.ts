import { describe, expect, it } from 'vitest';
import { mulberry32 } from '../../core/rng';
import { apply, newGame, validate } from '../../maker/engine';
import { buildCrossword, buildSearch } from '../../maker/wordgen';
import { anagramDef, crosswordDef, searchDef, wordleDef } from './defs';

describe('word puzzle generators', () => {
  it('crosswords: words cross where letters agree, never touch side by side, every word has a clue', () => {
    for (const lang of ['tr', 'en'] as const) for (let seed = 1; seed <= 12; seed++) {
      const st = newGame(crosswordDef(lang), 1, seed), w = st.words!;
      expect(w.placed!.length).toBeGreaterThanOrEqual(10);
      for (const p of w.placed!) {
        expect(p.clue).toBeTruthy();
        expect(p.cells.map(c => w.grid![c]).join('')).toBe(p.word);
      }
      // Each open cell belongs to one across and/or one down word; two words in the same direction never share a cell.
      const owner = new Map<string, number>();
      w.placed!.forEach((p, i) => p.cells.forEach(c => { const k = p.dir + c; expect(owner.has(k)).toBe(false); owner.set(k, i); }));
      // Every run of open cells of length > 1 is a placed word (no accidental words).
      const runs: string[] = [];
      for (let r = 0; r < w.gh!; r++) for (let c = 0; c < w.gw!; c++) {
        const i = r * w.gw! + c;
        if (w.grid![i] && (c === 0 || !w.grid![i - 1]) && c + 1 < w.gw! && w.grid![i + 1]) { let s = ''; for (let k = c; k < w.gw! && w.grid![r * w.gw! + k]; k++) s += w.grid![r * w.gw! + k]; runs.push(s); }
        if (w.grid![i] && (r === 0 || !w.grid![i - w.gw!]) && r + 1 < w.gh! && w.grid![i + w.gw!]) { let s = ''; for (let k = r; k < w.gh! && w.grid![k * w.gw! + c]; k++) s += w.grid![k * w.gw! + c]; runs.push(s); }
      }
      expect(runs.sort()).toEqual(w.placed!.map(p => p.word).sort());
    }
  });
  it('two seeds give two different crosswords', () => {
    const a = newGame(crosswordDef('tr'), 1, 1).words!, b = newGame(crosswordDef('tr'), 1, 2).words!;
    expect(a.placed!.map(p => p.word)).not.toEqual(b.placed!.map(p => p.word));
  });
  it('a crossword is solved by writing every letter, and reveals are counted', () => {
    const def = crosswordDef('en');
    let st = newGame(def, 1, 5);
    const g = st.words!.grid!;
    const open = g.flatMap((ch, i) => (ch ? [i] : []));
    for (const i of open.slice(1)) st = apply(def, st, { k: 'letter', cell: i, ch: g[i].toLowerCase() });
    expect(st.over).toBeNull();
    st = apply(def, st, { k: 'reveal', cell: open[0] });
    expect(st.over).toEqual({ winner: 0 });
    expect(st.words!.reveals).toBe(1);
  });
  it('word search: every hidden word is on a straight line, found forwards or backwards, and solving it wins', () => {
    for (const lang of ['tr', 'en', 'zh'] as const) for (let seed = 1; seed <= 6; seed++) {
      const def = searchDef(lang);
      let st = newGame(def, 1, seed);
      const w = st.words!;
      expect(w.placed!.length).toBeGreaterThanOrEqual(6);
      expect(w.theme).toBeTruthy();
      w.placed!.forEach((p, i) => {
        expect(p.cells.map(c => w.grid![c]).join('')).toBe(p.word);
        const text = i % 2 ? [...p.word].reverse().join('') : p.word;
        st = apply(def, st, { k: 'word', text });
      });
      expect(st.over).toEqual({ winner: 0 });
    }
  });
  it('word search ignores letters that are not a hidden word', () => {
    const def = searchDef('en'), st = newGame(def, 1, 3);
    expect(apply(def, st, { k: 'word', text: 'QQQ' }).words!.found).toEqual([]);
  });
  it('anagrams: the scramble uses the secret letters, ten words end the game', () => {
    const def = anagramDef('tr');
    let st = newGame(def, 1, 7);
    for (let k = 0; k < 10; k++) {
      const { secret, scramble } = st.words!;
      expect([...scramble!].sort()).toEqual([...secret].sort());
      st = k === 4 ? apply(def, st, { k: 'button', id: 'skip' }) : apply(def, st, { k: 'word', text: secret });
    }
    expect(st.over).toEqual({ winner: 0 });
    expect(st.vars.score[0]).toBe(8);
  });
  it('all site definitions validate', () => {
    for (const d of [crosswordDef('tr'), crosswordDef('en'), searchDef('tr'), searchDef('en'), searchDef('zh'), wordleDef('tr'), wordleDef('en'), anagramDef('tr'), anagramDef('en')]) expect(validate(d), d.id).toEqual([]);
  });
  it('the generators are deterministic for a seed', () => {
    const e = [{ word: 'KALEM' }, { word: 'ELMA' }, { word: 'MASA' }, { word: 'LAMBA' }, { word: 'AMCA' }];
    expect(buildCrossword(e, mulberry32(3), { count: 5 })).toEqual(buildCrossword(e, mulberry32(3), { count: 5 }));
    expect(buildSearch(['ELMA', 'MASA'], mulberry32(3), { size: 6, count: 2 })).toEqual(buildSearch(['ELMA', 'MASA'], mulberry32(3), { size: 6, count: 2 }));
  });
});
