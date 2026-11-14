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
  'connect-four': lazy(() => import('../games/connect-four/ConnectFour')),
  tictactoe: lazy(() => import('../games/tictactoe/TicTacToe')),
  hanoi: lazy(() => import('../games/hanoi/Hanoi')),
  'lights-out': lazy(() => import('../games/lights-out/LightsOut')),
  huarong: lazy(() => import('../games/huarong/Huarong')),
  tangram: lazy(() => import('../games/tangram/Tangram')),
  tavla: lazy(() => import('../games/tavla/Tavla')),
  dama: lazy(() => import('../games/dama/Dama')),
  okey: lazy(() => import('../games/okey/Okey')),
  billiards: lazy(() => import('../games/billiards/Billiards')),
  'okey-101': lazy(() => import('../games/okey101/Okey101')),
  rubik: lazy(() => import('../games/rubik/Rubik')),
  reversi: lazy(() => import('../games/reversi/Reversi')),
  nonogram: lazy(() => import('../games/nonogram/Nonogram')),
  mastermind: lazy(() => import('../games/mastermind/Mastermind')),
  'dots-boxes': lazy(() => import('../games/dots/Dots')),
  mancala: lazy(() => import('../games/mangala/Mangala')),
  morris: lazy(() => import('../games/morris/Morris')),
  'bulls-cows': lazy(() => import('../games/bulls/Bulls')),
  battleship: lazy(() => import('../games/battleship/Battleship')),
  qubic: lazy(() => import('../games/qubic/Qubic')),
  'football-70': lazy(() => import('../games/football/Football')),
  'minesweeper-3d': lazy(() => import('../games/cubemines/CubeMines')),
  pisti: lazy(() => import('../games/pisti/Pisti')),
  kenken: lazy(() => import('../games/kenken/KenKen')),
  futoshiki: lazy(() => import('../games/futoshiki/Futoshiki')),
  hidato: lazy(() => import('../games/hidato/Hidato')),
  luban: lazy(() => import('../games/luban/Luban')),
  kongming: lazy(() => import('../games/kongming/Kongming')),
  burr: lazy(() => import('../games/burr/Burr')),
  'packing-3d': lazy(() => import('../games/packing/Packing')),
  'assembly-3d': lazy(() => import('../games/assembly/Assembly')),
  soma: lazy(() => import('../games/soma/Soma')),
  'snake-cube': lazy(() => import('../games/snake/SnakeCube')),
  numberlink: lazy(() => import('../games/numberlink/Numberlink')),
  'n-queens': lazy(() => import('../games/queens/Queens')),
  'river-crossing': lazy(() => import('../games/river/River')),
  binary: lazy(() => import('../games/binary/Binary')),
  kakuro: lazy(() => import('../games/kakuro/Kakuro')),
  slitherlink: lazy(() => import('../games/slitherlink/Slitherlink')),
  'nine-rings': lazy(() => import('../games/ninerings/NineRings')),
  sifeng: lazy(() => import('../games/sifeng/Sifeng')),
  hashi: lazy(() => import('../games/hashi/Hashi')),
  sokoban: lazy(() => import('../games/sokoban/Sokoban')),
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
