import type { Level } from '../core/match';
import { apply, canSee, clone, inputKey, legal, type GameDef, type GState, type Input } from './engine';

/**
 * A computer player for any workshop game. It knows nothing about the rules except what the
 * engine tells it: which inputs are legal and who won. Each search pass first reshuffles
 * every card it cannot see (so it does not peek at hands or the deck) and gives the dice a
 * fresh seed, then runs a Monte Carlo tree search over that guess.
 */
export const LEVELS: (Level & { iters: number })[] = [
  { name: 'Beginner', rating: 700, iters: 0 },
  { name: 'Easy', rating: 900, iters: 60 },
  { name: 'Intermediate', rating: 1150, iters: 300 },
  { name: 'Advanced', rating: 1400, iters: 1200 },
  { name: 'Expert', rating: 1650, iters: 4000 },
];

/** Hidden cards are pooled and dealt back at random, keeping every zone's size. */
export function determinize(def: GameDef, st: GState, viewer: number, rng: () => number): GState {
  const s = clone(st), pool: number[] = [], slots: [string, number][] = [];
  for (const [key, cards] of Object.entries(s.zones)) {
    const vis = canSee(def, key, viewer);
    if (vis === 'all') continue;
    const hidden = vis === 'top' ? cards.length - 1 : cards.length;
    for (let i = 0; i < hidden; i++) { pool.push(cards[i]); slots.push([key, i]); }
  }
  for (let i = pool.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [pool[i], pool[j]] = [pool[j], pool[i]]; }
  slots.forEach(([key, i], k) => { s.zones[key][i] = pool[k]; });
  s.seed = Math.floor(rng() * 2 ** 31);
  return s;
}

interface Node { visits: number; score: number; mover: number; kids: Map<string, Node> }
const newNode = (mover: number): Node => ({ visits: 0, score: 0, mover, kids: new Map() });

function rollout(def: GameDef, st: GState, rng: () => number, cap = 160): GState {
  let s = st;
  for (let k = 0; k < cap && !s.over; k++) {
    const ms = legal(def, s);
    if (!ms.length) break;
    s = apply(def, s, ms[Math.floor(rng() * ms.length)]);
  }
  return s;
}
const reward = (s: GState, p: number) => (!s.over ? 0.5 : s.over.winner === p ? 1 : s.over.winner < 0 ? 0.5 : 0);

export function chooseInput(def: GameDef, st: GState, level: number, opts: { rng?: () => number; ms?: number } = {}): Input | null {
  const rng = opts.rng ?? Math.random, moves = legal(def, st);
  if (!moves.length) return null;
  const iters = LEVELS[Math.max(0, Math.min(4, level))].iters;
  if (moves.length === 1 || iters === 0) return moves[Math.floor(rng() * moves.length)];
  const me = st.turn, root = newNode(me), stopAt = Date.now() + (opts.ms ?? 1800);
  for (let it = 0; it < iters && Date.now() < stopAt; it++) {
    let s = determinize(def, st, me, rng), node = root;
    const path: Node[] = [];
    while (!s.over) {
      const ms = legal(def, s);
      if (!ms.length) break;
      const untried = ms.filter(m => !node.kids.has(inputKey(m)));
      if (untried.length) {
        const m = untried[Math.floor(rng() * untried.length)], kid = newNode(s.turn);
        node.kids.set(inputKey(m), kid);
        s = apply(def, s, m);
        path.push(kid);
        break;
      }
      let best: Node | null = null, bm: Input | null = null, bv = -Infinity;
      for (const m of ms) {
        const k = node.kids.get(inputKey(m))!;
        const v = k.score / k.visits + 1.2 * Math.sqrt(Math.log(node.visits + 1) / k.visits);
        if (v > bv) { bv = v; best = k; bm = m; }
      }
      s = apply(def, s, bm!);
      node = best!;
      path.push(node);
    }
    const end = rollout(def, s, rng);
    root.visits++;
    for (const n of path) { n.visits++; n.score += reward(end, n.mover); }
  }
  let pick = moves[0], most = -1;
  for (const m of moves) { const k = root.kids.get(inputKey(m)); if (k && k.visits > most) { most = k.visits; pick = m; } }
  return pick;
}
