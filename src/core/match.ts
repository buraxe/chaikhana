import { recordResult, statsOf, type Outcome, type Profile } from './store';

export interface Level { name: string; rating: number }
export interface MatchConfig { opponent: 'ai' | 'local'; level: number; human: 1 | 2; p2: string }

/** Records a finished two-player game for one or both local profiles, each in its own game rating. */
export function recordMatch(game: string, cfg: MatchConfig, me: Profile, p2: Profile | undefined,
  mine: Outcome, detail: string, levels: Level[], unrated: boolean) {
  const tag = (detail ? ' · ' + detail : '') + (unrated ? ' · unrated (undo used)' : '');
  if (cfg.opponent === 'ai') {
    recordResult(me.id, game, { result: mine, label: `vs ${levels[cfg.level].name} AI${tag}`,
      oppRating: unrated ? undefined : levels[cfg.level].rating });
    return;
  }
  const theirs: Outcome = mine === 'win' ? 'loss' : mine === 'loss' ? 'win' : 'draw';
  const myR = statsOf(me, game).rating, theirR = p2 ? statsOf(p2, game).rating : undefined;
  recordResult(me.id, game, { result: mine, label: `vs ${p2?.name ?? 'Guest'} · same device${tag}`, oppRating: unrated ? undefined : theirR });
  if (p2) recordResult(p2.id, game, { result: theirs, label: `vs ${me.name} · same device${tag}`, oppRating: unrated ? undefined : myR });
}
