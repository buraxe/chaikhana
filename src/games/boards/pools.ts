import { useEffect, useState } from 'react';
import { dayKey } from '../../core/rng';

export type BoardGame = 'chess' | 'xiangqi' | 'shogi' | 'weiqi';
export interface PuzzleData { pos: string; kind: 'm1' | 'm2' | 'cap'; sol: number; n?: number }

/** One file of generated puzzles per game (scripts/puzzles.ts), loaded when first needed. */
const FILES: Record<BoardGame, () => Promise<{ default: unknown }>> = {
  chess: () => import('./pools/chess.json'),
  xiangqi: () => import('./pools/xiangqi.json'),
  shogi: () => import('./pools/shogi.json'),
  weiqi: () => import('./pools/weiqi.json'),
};
const cache: Partial<Record<BoardGame, PuzzleData[]>> = {};
export async function loadPool(game: BoardGame) { return (cache[game] ??= (await FILES[game]()).default as PuzzleData[]); }

const EPOCH = Date.UTC(2026, 0, 1);
/** Today's puzzle from a pool: the same for everyone on the same date. */
export function pickPuzzle(pool: PuzzleData[], day = dayKey()): { p: PuzzleData; no: number } {
  const [y, m, d] = day.split('-').map(Number), no = Math.floor((Date.UTC(y, m - 1, d) - EPOCH) / 864e5);
  return { p: pool[((no * 7) % pool.length + pool.length) % pool.length], no: no + 1 };
}
/** Today's puzzle for a game, once its pool has loaded. */
export function useTodaysPuzzle(game: BoardGame) {
  const [, bump] = useState(0);
  useEffect(() => { if (!cache[game]) loadPool(game).then(() => bump(x => x + 1)); }, [game]);
  const pool = cache[game];
  return pool ? pickPuzzle(pool) : undefined;
}
