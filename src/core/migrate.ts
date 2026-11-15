/**
 * Game ids that were renamed (November 2026). Records saved under an old id move to the new
 * one the first time the site loads, and old links (#kenken, #learn-kenken, #kenken-daily)
 * still open the right page. Saved games were never keyed by id, so they need nothing.
 * Imported first in main.tsx, before the store reads anything.
 */
export const RENAMED: Record<string, string> = {
  kenken: 'calcudoku', hidato: 'number-path', mastermind: 'code-breaker', battleship: 'sea-battle',
  'connect-four': 'four-in-a-row', rubik: 'magic-cube', sokoban: 'box-pusher', 'lights-out': 'lights-off',
  slitherlink: 'loop-line', numberlink: 'link-numbers', soma: 'seven-cube', qubic: 'cube-ttt', wordle: 'word-guess',
};

/** The current route for an old one, or the route itself. */
export function renameRoute(route: string): string {
  const m = /^(learn-)?(.+?)(-daily)?$/.exec(route);
  if (!m) return route;
  const now = RENAMED[m[2]];
  return now ? (m[1] ?? '') + now + (m[3] ?? '') : route;
}

const ren = (id: string) => RENAMED[id] ?? id;

/** Renames the keys of a record; when both names hold data, the one with more play wins. */
function renameKeys<T>(rec: Record<string, T> | undefined, merge: (a: T, b: T) => T): boolean {
  if (!rec) return false;
  let changed = false;
  for (const old of Object.keys(rec)) {
    const now = RENAMED[old];
    if (!now) continue;
    rec[now] = rec[now] === undefined ? rec[old] : merge(rec[now], rec[old]);
    delete rec[old];
    changed = true;
  }
  return changed;
}

interface Stats { started: number; played: number; wins: number; losses: number; draws: number; rating: number; best: Record<string, number>; history: { t: number }[] }
/** Two stat blocks for the same game: counts add up, bests keep the better time, histories interleave. */
export function mergeStats(a: Stats, b: Stats): Stats {
  const best = { ...a.best };
  for (const [k, v] of Object.entries(b.best ?? {})) best[k] = best[k] === undefined ? v : Math.min(best[k], v);
  return {
    started: (a.started ?? 0) + (b.started ?? 0), played: (a.played ?? 0) + (b.played ?? 0), wins: (a.wins ?? 0) + (b.wins ?? 0),
    losses: (a.losses ?? 0) + (b.losses ?? 0), draws: (a.draws ?? 0) + (b.draws ?? 0),
    rating: (b.played ?? 0) > (a.played ?? 0) ? b.rating : a.rating, best,
    history: [...(a.history ?? []), ...(b.history ?? [])].sort((x, y) => y.t - x.t).slice(0, Math.max(a.history?.length ?? 0, b.history?.length ?? 0, 50)),
  };
}

/** Moves one saved profile set to the new ids. Returns true if anything changed. Exported for tests. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function migrateData(d: any): boolean {
  let changed = false;
  for (const p of d?.profiles ?? []) {
    if (Array.isArray(p.favorites)) {
      const fav = [...new Set(p.favorites.map(ren))] as string[];
      if (fav.join() !== p.favorites.join()) { p.favorites = fav; changed = true; }
    }
    if (renameKeys<Stats>(p.stats, mergeStats)) changed = true;
    if (renameKeys<number>(p.beaten, Math.max)) changed = true;
    for (const c of p.clips ?? []) if (c.game && RENAMED[c.game]) { c.game = RENAMED[c.game]; changed = true; }
  }
  return changed;
}

function read(key: string): unknown { try { const s = localStorage.getItem(key); return s ? JSON.parse(s) : null; } catch { return null; } }
function write(key: string, v: unknown) { try { localStorage.setItem(key, JSON.stringify(v)); } catch { /* storage may be off */ } }

export function runMigration() {
  try {
    if (localStorage.getItem('gp.migrated') === '2026-11') return;
  } catch { return; }
  const d = read('gp.v1');
  if (d && migrateData(d)) write('gp.v1', d);
  // Rivals picked per game and level: "game:level" → who.
  const rivals = read('gp.rivals') as Record<string, number> | null;
  if (rivals) {
    const out: Record<string, number> = {};
    for (const [k, v] of Object.entries(rivals)) { const [g, ...rest] = k.split(':'); out[[ren(g), ...rest].join(':')] = v; }
    write('gp.rivals', out);
  }
  // A tournament in progress names its games.
  const tour = read('gp.tournament') as { games?: string[]; fixtures?: { game: string }[] } | null;
  if (tour && Array.isArray(tour.games)) {
    tour.games = tour.games.map(ren);
    for (const f of tour.fixtures ?? []) f.game = ren(f.game);
    write('gp.tournament', tour);
  }
  // A same-device race in progress names its game.
  const race = read('gp.race') as { game?: string } | null;
  if (race?.game && RENAMED[race.game]) { race.game = RENAMED[race.game]; write('gp.race', race); }
  // Daily board-puzzle marks and per-game settings keyed by id.
  for (const [old, now] of Object.entries(RENAMED)) {
    for (const [a, b] of [[`gp.puz.${old}`, `gp.puz.${now}`], [`gp.${old}.lang`, `gp.${now}.lang`]]) {
      try { const v = localStorage.getItem(a); if (v !== null && localStorage.getItem(b) === null) localStorage.setItem(b, v); localStorage.removeItem(a); } catch { /* ignore */ }
    }
  }
  try { localStorage.setItem('gp.migrated', '2026-11'); } catch { /* ignore */ }
}

runMigration();
