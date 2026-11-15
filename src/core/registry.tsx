import { lazy, type ComponentType, type LazyExoticComponent } from 'react';
import { NAME_DIGEST } from './lessons';
import { trLabel, pick as tri } from './i18n';
import type { Lang } from './store';

/**
 * Adding a game: put its module in src/games/<id>/, mark it playable in catalogue.ts,
 * and register its screen and lesson here. Nothing else in the platform changes.
 * Screens are lazy so a game's code (and later, a 3D engine) loads only on its own page.
 */
export const SCREENS: Record<string, LazyExoticComponent<ComponentType<{ daily?: boolean }>>> = {
  sudoku: lazy(() => import('../games/sudoku/Sudoku')),
  gomoku: lazy(() => import('../games/gomoku/Gomoku')),
  minesweeper: lazy(() => import('../games/minesweeper/Minesweeper')),
  'four-in-a-row': lazy(() => import('../games/four-in-a-row/FourInARow')),
  tictactoe: lazy(() => import('../games/tictactoe/TicTacToe')),
  hanoi: lazy(() => import('../games/hanoi/Hanoi')),
  'lights-off': lazy(() => import('../games/lights-off/LightsOff')),
  huarong: lazy(() => import('../games/huarong/Huarong')),
  tangram: lazy(() => import('../games/tangram/Tangram')),
  tavla: lazy(() => import('../games/tavla/Tavla')),
  dama: lazy(() => import('../games/dama/Dama')),
  okey: lazy(() => import('../games/okey/Okey')),
  billiards: lazy(() => import('../games/billiards/Billiards')),
  'okey-101': lazy(() => import('../games/okey101/Okey101')),
  'magic-cube': lazy(() => import('../games/magic-cube/MagicCube')),
  reversi: lazy(() => import('../games/reversi/Reversi')),
  nonogram: lazy(() => import('../games/nonogram/Nonogram')),
  'code-breaker': lazy(() => import('../games/code-breaker/CodeBreaker')),
  'dots-boxes': lazy(() => import('../games/dots/Dots')),
  mancala: lazy(() => import('../games/mangala/Mangala')),
  morris: lazy(() => import('../games/morris/Morris')),
  'bulls-cows': lazy(() => import('../games/bulls/Bulls')),
  'sea-battle': lazy(() => import('../games/sea-battle/SeaBattle')),
  'cube-ttt': lazy(() => import('../games/cube-ttt/Cube3T')),
  'football-70': lazy(() => import('../games/football/Football')),
  'minesweeper-3d': lazy(() => import('../games/cubemines/CubeMines')),
  pisti: lazy(() => import('../games/pisti/Pisti')),
  'calcudoku': lazy(() => import('../games/calcudoku/Calcudoku')),
  futoshiki: lazy(() => import('../games/futoshiki/Futoshiki')),
  'number-path': lazy(() => import('../games/number-path/NumberPath')),
  luban: lazy(() => import('../games/luban/Luban')),
  kongming: lazy(() => import('../games/kongming/Kongming')),
  burr: lazy(() => import('../games/burr/Burr')),
  'packing-3d': lazy(() => import('../games/packing/Packing')),
  'assembly-3d': lazy(() => import('../games/assembly/Assembly')),
  'seven-cube': lazy(() => import('../games/seven-cube/SevenCube')),
  'snake-cube': lazy(() => import('../games/snake/SnakeCube')),
  'link-numbers': lazy(() => import('../games/link-numbers/LinkNumbers')),
  'n-queens': lazy(() => import('../games/queens/Queens')),
  'river-crossing': lazy(() => import('../games/river/River')),
  binary: lazy(() => import('../games/binary/Binary')),
  kakuro: lazy(() => import('../games/kakuro/Kakuro')),
  'loop-line': lazy(() => import('../games/loop-line/LoopLine')),
  'nine-rings': lazy(() => import('../games/ninerings/NineRings')),
  sifeng: lazy(() => import('../games/sifeng/Sifeng')),
  hashi: lazy(() => import('../games/hashi/Hashi')),
  'box-pusher': lazy(() => import('../games/box-pusher/BoxPusher')),
  g2048: lazy(() => import('../games/g2048/G2048')),
  chess: lazy(() => import('../games/chess/Chess')),
  xiangqi: lazy(() => import('../games/xiangqi/Xiangqi')),
  shogi: lazy(() => import('../games/shogi/Shogi')),
  weiqi: lazy(() => import('../games/weiqi/Weiqi')),
  batak: lazy(() => import('../games/batak/Batak')),
  king: lazy(() => import('../games/king/King')),
  poker: lazy(() => import('../games/poker/Poker')),
  mahjong: lazy(() => import('../games/mahjong/Mahjong')),
  checkers: lazy(() => import('../games/draughts/Draughts')),
  'chinese-checkers': lazy(() => import('../games/chinese-checkers/ChineseCheckers')),
  dominoes: lazy(() => import('../games/dominoes/Dominoes')),
  'ultimate-ttt': lazy(() => import('../games/uttt/Uttt')),
  nim: lazy(() => import('../games/nim/Nim')),
  crossword: lazy(() => import('../games/words/Crossword')),
  'word-search': lazy(() => import('../games/words/WordSearch')),
  'word-guess': lazy(() => import('../games/words/WordGuess')),
  anagram: lazy(() => import('../games/words/Anagram')),
  zebra: lazy(() => import('../games/zebra/Zebra')),
  'sliding-block': lazy(() => import('../games/sliding/Sliding')),
  pentomino: lazy(() => import('../games/pentomino/Pentomino')),
  't-puzzle': lazy(() => import('../games/t-puzzle/TPuzzle')),
  rps: lazy(() => import('../games/rps/Rps')),
};

/** How a best-time key reads on screen. Most keys are already labels; some games store an id. */
export function bestLabel(game: string, key: string, lang: Lang): string {
  if (game === 'huarong' || game === 'tangram') { const n = NAME_DIGEST[game][key]; if (n) return tri(n, lang); }
  return trLabel(key.replace(/^(\d+)-(\w+)$/, (_, n, d: string) => `${n}×${n} ${d[0].toUpperCase()}${d.slice(1)}`), lang);
}

/** Match-history labels: the layout or silhouette id becomes its name. */
export function historyLabel(game: string, label: string, lang: Lang): string {
  if (game === 'huarong' || game === 'tangram') {
    const [head, ...rest] = label.split(' · ');
    return [bestLabel(game, head, lang), ...rest.map(r => trLabel(r, lang))].join(' · ');
  }
  return trLabel(label, lang);
}
