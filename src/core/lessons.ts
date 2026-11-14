import { useEffect, useState } from 'react';
import type { Lesson } from './learn';
import DIGEST from './digest.json';

/**
 * Each game's lesson lives in its own file and loads only when a page needs it (the lesson
 * page, the game page's notes, the tutorial). The home page and the lesson index use the
 * digest instead: names and summaries, written by scripts/digest.mjs before each build.
 */
export const LESSON_FILES: Record<string, () => Promise<{ lesson: Lesson }>> = {
  sudoku: () => import('../games/sudoku/learn'),
  gomoku: () => import('../games/gomoku/learn'),
  minesweeper: () => import('../games/minesweeper/learn'),
  "connect-four": () => import('../games/connect-four/learn'),
  tictactoe: () => import('../games/tictactoe/learn'),
  hanoi: () => import('../games/hanoi/learn'),
  "lights-out": () => import('../games/lights-out/learn'),
  huarong: () => import('../games/huarong/learn'),
  tangram: () => import('../games/tangram/learn'),
  tavla: () => import('../games/tavla/learn'),
  dama: () => import('../games/dama/learn'),
  okey: () => import('../games/okey/learn'),
  billiards: () => import('../games/billiards/learn'),
  "okey-101": () => import('../games/okey101/learn'),
  rubik: () => import('../games/rubik/learn'),
  reversi: () => import('../games/reversi/learn'),
  nonogram: () => import('../games/nonogram/learn'),
  mastermind: () => import('../games/mastermind/learn'),
  "dots-boxes": () => import('../games/dots/learn'),
  mancala: () => import('../games/mangala/learn'),
  morris: () => import('../games/morris/learn'),
  "bulls-cows": () => import('../games/bulls/learn'),
  battleship: () => import('../games/battleship/learn'),
  qubic: () => import('../games/qubic/learn'),
  "football-70": () => import('../games/football/learn'),
  "minesweeper-3d": () => import('../games/cubemines/learn'),
  sifeng: () => import('../games/sifeng/learn'),
  mahjong: () => import('../games/mahjong/learn'),
  checkers: () => import('../games/draughts/learn'),
  'chinese-checkers': () => import('../games/chinese-checkers/learn'),
  dominoes: () => import('../games/dominoes/learn'),
  'ultimate-ttt': () => import('../games/uttt/learn'),
  nim: () => import('../games/nim/learn'),
  futoshiki: () => import('../games/futoshiki/learn'),
  hidato: () => import('../games/hidato/learn'),
  luban: () => import('../games/luban/learn'),
  kongming: () => import('../games/kongming/learn'),
  burr: () => import('../games/burr/learn'),
  "packing-3d": () => import('../games/packing/learn'),
  "assembly-3d": () => import('../games/assembly/learn'),
  soma: () => import('../games/soma/learn'),
  "snake-cube": () => import('../games/snake/learn'),
  numberlink: () => import('../games/numberlink/learn'),
  "n-queens": () => import('../games/queens/learn'),
  "river-crossing": () => import('../games/river/learn'),
  binary: () => import('../games/binary/learn'),
  kakuro: () => import('../games/kakuro/learn'),
  slitherlink: () => import('../games/slitherlink/learn'),
  "nine-rings": () => import('../games/ninerings/learn'),
  kenken: () => import('../games/kenken/learn'),
  hashi: () => import('../games/hashi/learn'),
  sokoban: () => import('../games/sokoban/learn'),
  g2048: () => import('../games/g2048/learn'),
  chess: () => import('../games/chess/learn'),
  xiangqi: () => import('../games/xiangqi/learn'),
  shogi: () => import('../games/shogi/learn'),
  weiqi: () => import('../games/weiqi/learn'),
  pisti: () => import('../games/pisti/learn'),
  batak: () => import('../games/batak/learn'),
  king: () => import('../games/king/learn'),
  poker: () => import('../games/poker/learn'),
};

/** s: the summary; h: the first sentence of the history. */
type Brief = { s: string; h: string };
export type LessonDigest = { names: Lesson['names']; en: Brief; zh: Brief; tr?: Brief };
export const LESSON_DIGEST = DIGEST.lessons as Record<string, LessonDigest>;
export const NAME_DIGEST = DIGEST as unknown as Record<'tangram' | 'huarong', Record<string, { en: string; zh: string; tr: string }>>;

const cache: Record<string, Lesson> = {};
export async function loadLesson(id: string): Promise<Lesson | undefined> {
  if (cache[id]) return cache[id];
  const f = LESSON_FILES[id]; if (!f) return undefined;
  return (cache[id] = (await f()).lesson);
}
/** The lesson for a game, once its file has loaded (undefined until then, or if there is none). */
export function useLesson(id: string): Lesson | undefined {
  const [, bump] = useState(0);
  useEffect(() => { if (!cache[id] && LESSON_FILES[id]) loadLesson(id).then(() => bump(x => x + 1)); }, [id]);
  return cache[id];
}
