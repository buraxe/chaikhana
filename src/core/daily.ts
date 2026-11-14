import { hashString, mulberry32 } from './rng';
import { byLevel } from './cast';

/**
 * Today's issue of the Gazette: four small jobs, the same for everyone on the same date.
 * Kept free of the store so the store can ask it which jobs a result completes.
 */
export type TaskKind = 'sudoku' | 'f70' | 'rival' | 'puzzle' | 'board';
export interface Task { id: TaskKind; game: string; level?: number; who?: number; league?: 'giants' | 'tr' | 'cn' }
export const BOARD_PUZZLES = ['chess', 'xiangqi', 'shogi', 'weiqi'];
const RIVAL_GAMES = ['chess', 'xiangqi', 'shogi', 'weiqi', 'pisti', 'batak', 'king', 'tavla', 'dama', 'reversi', 'four-in-a-row', 'gomoku', 'mancala', 'morris', 'dots-boxes', 'okey', 'sea-battle', 'billiards', 'cube-ttt'];
const PUZZLES = ['kongming', 'burr', 'packing-3d', 'assembly-3d', 'luban', 'seven-cube', 'snake-cube', 'number-path', 'link-numbers', 'n-queens', 'river-crossing', 'futoshiki', 'binary', 'kakuro', 'loop-line', 'nine-rings', 'calcudoku', 'hashi', 'box-pusher', 'minesweeper', 'nonogram', 'lights-off', 'hanoi', 'code-breaker', 'bulls-cows', 'huarong', 'tangram', 'minesweeper-3d', 'magic-cube'];
export function tasksFor(day: string): Task[] {
  const r = mulberry32(hashString('issue:' + day)), pick = <T,>(a: T[]) => a[Math.floor(r() * a.length)];
  const leagues = ['giants', 'tr', 'cn'] as const;
  return [
    { id: 'sudoku', game: 'sudoku' },
    (() => { const level = 1 + Math.floor(r() * 2), game = pick(RIVAL_GAMES), who = pick(byLevel(level)); return { id: 'rival' as const, game, level, who }; })(),
    { id: 'puzzle', game: pick(PUZZLES) },
    { id: 'board', game: BOARD_PUZZLES[hashString('board:' + day) % 4] },
    { id: 'f70', game: 'football-70', league: leagues[hashString(day) % 3] },
  ];
}
/** Which of today's jobs a finished game completes. */
export function tasksDone(day: string, game: string, won: boolean, level: number | null, label: string): TaskKind[] {
  const out: TaskKind[] = [];
  for (const t of tasksFor(day)) {
    if (t.game !== game) continue;
    if (t.id === 'sudoku' && won && label.includes('daily')) out.push('sudoku');
    if (t.id === 'rival' && won && level != null && level >= (t.level ?? 0)) out.push('rival');
    if (t.id === 'puzzle' && won) out.push('puzzle');
    if (t.id === 'f70' && label.includes('daily')) out.push('f70');
    if (t.id === 'board' && won && label.includes('daily puzzle')) out.push('board');
  }
  return out;
}
