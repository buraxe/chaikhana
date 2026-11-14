import type { Act, Expr, GameDef, Rule, Text } from '../../maker/engine';
import { EN_WORDS, TR_WORDS, wordRules } from '../../maker/examples';
import { CLUES_EN, SEARCH_EN } from './bank-en';
import { CLUES_TR, SEARCH_TR } from './bank-tr';
import { SEARCH_ZH } from './bank-zh';

/**
 * The site's word puzzles are workshop games: the same engine, the same blocks. Each new game
 * builds a new puzzle from these banks.
 */
export type WLang = 'tr' | 'en' | 'zh';
const o = (op: string, args: Record<string, unknown> = {}) => ({ op, ...args });
const get = (name: string) => o('get', { name }), eq = (a: Expr, b: Expr) => o('eq', { a, b });
const iff = (test: Expr, then: Act[], els?: Act[]): Act => o('if', els ? { test, then, else: els } : { test, then });
const guess = get('guess');

function parseClues(src: string): { list: string[]; clues: Record<string, string> } {
  const clues: Record<string, string> = {};
  for (const line of src.split('\n')) { const i = line.indexOf(':'); if (i > 0) clues[line.slice(0, i).trim()] = line.slice(i + 1).trim(); }
  return { list: Object.keys(clues), clues };
}
const BANK = { tr: parseClues(CLUES_TR), en: parseClues(CLUES_EN) };
const KEYS = { tr: 'ERTYUIOPĞÜ ASDFGHJKLŞİ ZCVBNMÖÇ', en: 'QWERTYUIOP ASDFGHJKL ZXCVBNM' };
const base = (id: string, name: Text, about: Text): Pick<GameDef, 'format' | 'version' | 'id' | 'name' | 'about' | 'kind' | 'players'> =>
  ({ format: 'chaikhana-game', version: 1, id, name, about, kind: 'puzzle', players: { min: 1, max: 1 } });

export function crosswordDef(lang: 'tr' | 'en'): GameDef {
  return {
    ...base('crossword-' + lang, { en: 'Crossword', zh: '填字游戏', tr: 'Bulmaca' }, { en: 'Fill the grid from the clues.', zh: '根据提示填满格子。', tr: 'Tanımlardan yola çıkarak kareleri doldur.' }),
    words: { mode: 'cross', list: BANK[lang].list, clues: BANK[lang].clues, length: 9, size: 13, count: 14, locale: lang, alphabet: KEYS[lang] },
    rules: [
      { on: 'start', do: [o('buildPuzzle')] },
      { on: 'after', name: { en: 'Every letter right: solved', zh: '全部正确：完成', tr: 'Bütün harfler doğru: çözüldü' }, when: o('crossDone'), do: [o('win')] },
    ],
  };
}

export function searchDef(lang: WLang): GameDef {
  const groups = lang === 'tr' ? SEARCH_TR : lang === 'en' ? SEARCH_EN : SEARCH_ZH;
  return {
    ...base('word-search-' + lang, { en: 'Word search', zh: '找词游戏', tr: 'Kelime Avı' }, { en: 'Find the hidden words: drag across them in a straight line.', zh: '找出隐藏的词语：沿直线拖过它们。', tr: 'Gizli kelimeleri bul: üzerlerinden düz bir çizgide sürükle.' }),
    words: { mode: 'search', list: groups.flatMap(g => g.words), groups, length: 10, size: lang === 'zh' ? 8 : 11, count: lang === 'zh' ? 8 : 10, diagonal: true, backwards: lang !== 'zh', locale: lang === 'zh' ? 'zh' : lang },
    rules: [
      { on: 'start', do: [o('buildPuzzle')] },
      { on: 'word', name: { en: 'Found a word', zh: '找到一个词', tr: 'Bir kelime bulundu' }, when: o('placed', { text: guess }), do: [o('markFound', { text: guess })] },
      { on: 'after', name: { en: 'All found: solved', zh: '全部找到：完成', tr: 'Hepsi bulundu: çözüldü' }, when: eq(o('found'), o('total')), do: [o('win')] },
    ],
  };
}

export function wordleDef(lang: 'tr' | 'en'): GameDef {
  return {
    ...base('wordle-' + lang, { en: 'Word guess', zh: '猜词', tr: 'Kelime Tahmini' }, { en: 'Guess the five-letter word in six tries.', zh: '六次之内猜出五个字母的单词。', tr: 'Beş harfli kelimeyi altı tahminde bul.' }),
    words: { mode: 'guess', list: lang === 'tr' ? TR_WORDS : EN_WORDS, length: 5, rows: 6, locale: lang, alphabet: KEYS[lang] },
    rules: wordRules(6, lang === 'en') as Rule[],
  };
}

export const ANAGRAM_ROUNDS = 10;
export function anagramDef(lang: 'tr' | 'en'): GameDef {
  const list = BANK[lang].list.filter(w => [...w].length >= 4 && [...w].length <= 7);
  const next: Act[] = [iff(o('ge', { a: o('var', { var: 'round' }), b: ANAGRAM_ROUNDS }), [o('win')], [o('pickWord')])];
  return {
    ...base('anagram-' + lang, { en: 'Anagrams', zh: '字母重组', tr: 'Anagram' }, { en: `Unscramble ${ANAGRAM_ROUNDS} words; the clue helps. Skipping costs a point.`, zh: `把 ${ANAGRAM_ROUNDS} 个打乱的单词复原，提示会帮你。跳过要扣一分。`, tr: `${ANAGRAM_ROUNDS} karışık kelimeyi çöz; tanım yardım eder. Pas geçmek bir puan götürür.` }),
    words: { mode: 'anagram', list, clues: BANK[lang].clues, length: 0, locale: lang, alphabet: KEYS[lang] },
    vars: {
      score: { name: { en: 'Score', zh: '得分', tr: 'Puan' }, per: 'game', init: 0, show: true },
      round: { name: { en: 'Words done', zh: '已完成', tr: 'Biten kelime' }, per: 'game', init: 0, show: true },
    },
    buttons: { skip: { name: { en: 'Skip', zh: '跳过', tr: 'Pas' } } },
    rules: [
      { on: 'start', do: [o('pickWord')] },
      { on: 'word', name: { en: 'Solved one', zh: '解出一个', tr: 'Birini çözdü' }, when: eq(guess, o('secret')), do: [o('change', { var: 'score', value: 1 }), o('change', { var: 'round', value: 1 }), ...next] },
      { on: 'button', button: 'skip', name: { en: 'Skip', zh: '跳过', tr: 'Pas' }, do: [o('change', { var: 'score', value: -1 }), o('change', { var: 'round', value: 1 }), o('say', { text: { en: 'Skipped.', zh: '已跳过。', tr: 'Pas geçildi.' } }), ...next] },
    ],
  };
}
