import { apply, legal, type GameDef, type GState, type Input } from './engine';

/**
 * A breadth-first search over a one-player puzzle: tries every legal move from the current
 * position until the puzzle is solved. Finds the shortest solution, so its first move is
 * a fair hint. Large puzzles stop at a budget and say so rather than guess.
 */
export type Solved = { status: 'solved'; path: Input[]; states: number } | { status: 'none'; states: number } | { status: 'unknown'; states: number };
const keyOf = (st: GState) => JSON.stringify([st.board, st.zones, st.vars, st.words?.guesses, st.turn, st.rolled]);

export function solve(def: GameDef, start: GState, opts: { maxStates?: number; ms?: number } = {}): Solved {
  const max = opts.maxStates ?? 40_000, stop = Date.now() + (opts.ms ?? 2500);
  if (start.over) return start.over.winner === 0 ? { status: 'solved', path: [], states: 1 } : { status: 'none', states: 1 };
  const seen = new Map<string, { parent: string | null; input: Input | null }>(), k0 = keyOf(start);
  seen.set(k0, { parent: null, input: null });
  let layer: [string, GState][] = [[k0, start]];
  const pathTo = (k: string) => { const out: Input[] = []; for (let cur: string | null = k; cur; ) { const n: { parent: string | null; input: Input | null } = seen.get(cur)!; if (n.input) out.unshift(n.input); cur = n.parent; } return out; };
  while (layer.length) {
    const next: [string, GState][] = [];
    for (const [k, st] of layer) {
      for (const m of legal(def, st)) {
        const s2 = apply(def, st, m);
        if (s2.error) continue;
        const k2 = keyOf(s2);
        if (seen.has(k2)) continue;
        seen.set(k2, { parent: k, input: m });
        if (s2.over?.winner === 0) return { status: 'solved', path: pathTo(k2), states: seen.size };
        if (!s2.over) next.push([k2, s2]);
        if (seen.size >= max || Date.now() > stop) return { status: 'unknown', states: seen.size };
      }
    }
    layer = next;
  }
  return { status: 'none', states: seen.size };
}
