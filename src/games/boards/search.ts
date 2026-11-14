/**
 * A small negamax with alpha-beta, iterative deepening and a time limit, shared by Xiangqi
 * and Shogi. The game supplies move generation, the child position, an evaluation from the
 * side to move, and how a position with no moves scores.
 */
export interface Engine<N> {
  moves(n: N): number[];
  child(n: N, m: number): N;
  evaluate(n: N): number;
  /** score for the side to move when it has no legal move (usually a loss) */
  noMoves(n: N): number;
  /** cheap ordering hint: higher first (captures, promotions) */
  hint(n: N, m: number): number;
  /** moves worth extending in quiescence (captures); empty to skip */
  noisy?(n: N, ms: number[]): number[];
}
class Timeout extends Error {}
export function think<N>(E: Engine<N>, root: N, maxDepth: number, ms: number, rootMoves?: number[]): { move: number; score: number } {
  const t0 = Date.now(); let nodes = 0;
  const order = (n: N, ms: number[]) => ms.map(m => ({ m, v: E.hint(n, m) })).sort((a, b) => b.v - a.v).map(x => x.m);
  const qs = (n: N, a: number, b: number, d: number): number => {
    const stand = E.evaluate(n);
    if (!E.noisy || d > 4) return stand;
    if (stand >= b) return stand; if (stand > a) a = stand;
    const all = E.moves(n);
    if (!all.length) return E.noMoves(n);
    for (const m of order(n, E.noisy(n, all))) { const v = -qs(E.child(n, m), -b, -a, d + 1); if (v >= b) return v; if (v > a) a = v; }
    return a;
  };
  const nega = (n: N, depth: number, a: number, b: number, ply: number): number => {
    if (++nodes % 1024 === 0 && Date.now() - t0 > ms) throw new Timeout();
    const list = E.moves(n);
    if (!list.length) return E.noMoves(n) + (E.noMoves(n) < 0 ? ply : 0);
    if (depth <= 0) return qs(n, a, b, 0);
    let best = -Infinity;
    for (const m of order(n, list)) { const v = -nega(E.child(n, m), depth - 1, -b, -a, ply + 1); if (v > best) best = v; if (v > a) a = v; if (a >= b) break; }
    return best;
  };
  let list = order(root, rootMoves ?? E.moves(root)), bestMove = list[0], bestScore = 0;
  for (let d = 1; d <= maxDepth; d++) {
    try {
      let a = -Infinity, bm = list[0]; const scored: { m: number; v: number }[] = [];
      for (const m of list) { const v = -nega(E.child(root, m), d - 1, -Infinity, -a, 1); scored.push({ m, v }); if (v > a) { a = v; bm = m; } }
      bestMove = bm; bestScore = a; list = scored.sort((x, y) => y.v - x.v).map(x => x.m);
      if (Math.abs(a) > 90000) break;
    } catch (e) { if (e instanceof Timeout) break; throw e; }
  }
  return { move: bestMove, score: bestScore };
}
