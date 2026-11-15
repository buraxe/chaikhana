import { useSyncExternalStore } from 'react';
import { loadJSON, removeKey, saveJSON } from './storage';

/**
 * Turn-taking race for one-player puzzles on one device. Every player gets the same puzzle:
 * when the race starts, the game's saved state is snapshotted, and before each turn it is
 * put back and the game is remounted. While a race runs, results go to the race instead of
 * the active profile's record.
 */
export const RACE_KEYS: Record<string, string[]> = {
  sudoku: ['gp.sudoku.free'], minesweeper: ['gp.mines'], nonogram: ['gp.nonogram'], hanoi: ['gp.hanoi'],
  'lights-off': ['gp.lights'], huarong: ['gp.huarong'], tangram: ['gp.tangram'], 'magic-cube': ['gp.rubik'], 'code-breaker': ['gp.mastermind'], 'minesweeper-3d': ['gp.cubemines'], 'calcudoku': ['gp.kenken'], hashi: ['gp.hashi'], zebra: ['gp.zebra'], 'sliding-block': ['gp.sliding'], pentomino: ['gp.pentomino'], 't-puzzle': ['gp.tpuzzle'], matchstick: ['gp.matchstick'], 'peg-solitaire': ['gp.peg'], untangle: ['gp.untangle'], rope: ['gp.knot'], 'box-pusher': ['gp.sokoban'],
  futoshiki: ['gp.futoshiki'], 'number-path': ['gp.hidato'], luban: ['gp.luban'], kongming: ['gp.kongming'], burr: ['gp.burr'], 'packing-3d': ['gp.packing'], 'assembly-3d': ['gp.assembly'], 'seven-cube': ['gp.soma'], 'snake-cube': ['gp.snake'], 'link-numbers': ['gp.numberlink'], 'n-queens': ['gp.queens'], 'river-crossing': ['gp.river'], binary: ['gp.binary'], kakuro: ['gp.kakuro'], 'loop-line': ['gp.slither'], 'nine-rings': ['gp.ninerings'],
};
export interface RaceResult { ok: boolean; ms?: number; label?: string }
export interface Race { game: string; players: string[]; turn: number; results: (RaceResult | null)[]; snap: Record<string, unknown>; epoch: number; waiting: boolean }

let race: Race | null = loadJSON<Race | null>('gp.race', null);
const subs = new Set<() => void>();
const set = (r: Race | null) => { race = r; if (r) saveJSON('gp.race', r); else removeKey('gp.race'); subs.forEach(f => f()); };
export const useRace = () => useSyncExternalStore(f => { subs.add(f); return () => subs.delete(f); }, () => race);
export const raceFor = (game: string) => (race && race.game === game ? race : null);

function restore(r: Race) { for (const k of RACE_KEYS[r.game]) { if (r.snap[k] === undefined) removeKey(k); else saveJSON(k, r.snap[k]); } }
export function startRace(game: string, players: string[]) {
  const snap: Record<string, unknown> = {};
  for (const k of RACE_KEYS[game]) snap[k] = loadJSON<unknown>(k, undefined);
  const r: Race = { game, players, turn: 0, results: players.map(() => null), snap, epoch: (race?.epoch ?? 0) + 1, waiting: true };
  restore(r); set(r);
}
/** The next player is at the screen: put the puzzle back as it was and remount the game. */
export function beginTurn() { if (!race) return; restore(race); set({ ...race, waiting: false, epoch: race.epoch + 1 }); }
/** Called from recordResult. Returns true when the result belonged to the race. */
export function raceResult(game: string, res: RaceResult): boolean {
  if (!race || race.game !== game || race.waiting) return false;
  const results = race.results.slice(); results[race.turn] = res;
  set({ ...race, results, turn: race.turn + 1, waiting: true });
  return true;
}
export function giveUpTurn() { if (race && !race.waiting) raceResult(race.game, { ok: false }); }
export function endRace() { if (race) restore(race); set(null); }
