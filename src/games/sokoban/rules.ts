/**
 * Sokoban: push every box onto a target. Levels are generated backwards: boxes start on the
 * targets and the keeper pulls them away at random, so every level can be solved.
 */
import type { Rng } from '../../core/rng';

export interface Level { w: number; h: number; walls: boolean[]; goals: number[]; boxes: number[]; player: number }
export interface SokoState { lvl: Level; boxes: number[]; player: number; moves: number; pushes: number; history: { boxes: number[]; player: number; pushed: boolean }[] }
const DIRS = (w: number) => [-w, w, -1, 1];
export function generate(size: 'small' | 'medium' | 'large', rng: Rng): Level {
  const [w, h, nb] = size === 'small' ? [7, 7, 2] : size === 'medium' ? [9, 8, 3] : [10, 9, 4];
  let best: Level | null = null, bestScore = -1;
  for (let attempt = 0; attempt < 40; attempt++) {
    // Carve a room out of a few overlapping rectangles.
    const walls = new Array(w * h).fill(true);
    for (let k = 0; k < 4 + Math.floor(rng() * 3); k++) {
      const rw = 2 + Math.floor(rng() * (w - 3)), rh = 2 + Math.floor(rng() * (h - 3)), x0 = 1 + Math.floor(rng() * (w - 1 - rw)), y0 = 1 + Math.floor(rng() * (h - 1 - rh));
      for (let y = y0; y < y0 + rh; y++) for (let x = x0; x < x0 + rw; x++) walls[y * w + x] = false;
    }
    // A pillar or two keeps it interesting.
    for (let k = 0; k < 2; k++) { const i = (2 + Math.floor(rng() * (h - 4))) * w + 2 + Math.floor(rng() * (w - 4)); if (rng() < 0.6) walls[i] = true; }
    const floor = walls.map((x, i) => (x ? -1 : i)).filter(i => i >= 0);
    if (floor.length < nb * 4 + 6) continue;
    // Keep the largest connected region only.
    const seen = new Set<number>(), stack = [floor[0]]; seen.add(floor[0]);
    while (stack.length) { const c = stack.pop()!; for (const d of DIRS(w)) { const n = c + d; if (!walls[n] && !seen.has(n)) { seen.add(n); stack.push(n); } } }
    if (seen.size < floor.length * 0.9) continue;
    for (const i of floor) if (!seen.has(i)) walls[i] = true;
    const cells = [...seen];
    const goals: number[] = [];
    while (goals.length < nb) { const c = cells[Math.floor(rng() * cells.length)]; if (!goals.includes(c)) goals.push(c); }
    let boxes = goals.slice(), player = cells.find(c => !goals.includes(c))!;
    // Random walk with pulls.
    for (let step = 0; step < 400; step++) {
      const d = DIRS(w)[Math.floor(rng() * 4)], to = player + d;
      if (walls[to] || boxes.includes(to)) continue;
      const behind = player - d, bi = boxes.indexOf(behind);
      if (bi >= 0 && rng() < 0.7) boxes = boxes.map((b, k) => (k === bi ? player : b));
      player = to;
    }
    const off = boxes.filter(b => !goals.includes(b)).length;
    if (off < nb) continue;
    // Prefer boxes far from targets, not stuck against walls.
    const dist = boxes.reduce((a, b) => a + Math.min(...goals.map(g => Math.abs((g % w) - (b % w)) + Math.abs(Math.floor(g / w) - Math.floor(b / w)))), 0);
    if (dist > bestScore) { bestScore = dist; best = { w, h, walls, goals, boxes, player }; }
  }
  return best ?? generate(size, rng);
}
export const start = (lvl: Level): SokoState => ({ lvl, boxes: lvl.boxes.slice(), player: lvl.player, moves: 0, pushes: 0, history: [] });
export function move(s: SokoState, d: 'up' | 'down' | 'left' | 'right'): SokoState {
  const w = s.lvl.w, step = { up: -w, down: w, left: -1, right: 1 }[d], to = s.player + step;
  if (s.lvl.walls[to]) return s;
  const bi = s.boxes.indexOf(to);
  if (bi >= 0) {
    const beyond = to + step;
    if (s.lvl.walls[beyond] || s.boxes.includes(beyond)) return s;
    return { ...s, boxes: s.boxes.map((b, k) => (k === bi ? beyond : b)), player: to, moves: s.moves + 1, pushes: s.pushes + 1, history: [...s.history, { boxes: s.boxes, player: s.player, pushed: true }] };
  }
  return { ...s, player: to, moves: s.moves + 1, history: [...s.history, { boxes: s.boxes, player: s.player, pushed: false }] };
}
export function undo(s: SokoState): SokoState {
  const h = s.history[s.history.length - 1]; if (!h) return s;
  return { ...s, boxes: h.boxes, player: h.player, moves: s.moves - 1, pushes: s.pushes - (h.pushed ? 1 : 0), history: s.history.slice(0, -1) };
}
export const solved = (s: SokoState) => s.boxes.every(b => s.lvl.goals.includes(b));
/** Walk to a tapped floor cell along a shortest path that pushes nothing. */
export function pathTo(s: SokoState, target: number): ('up' | 'down' | 'left' | 'right')[] | null {
  const w = s.lvl.w, prev = new Map<number, number>([[s.player, -1]]), q = [s.player];
  while (q.length) {
    const c = q.shift()!; if (c === target) break;
    for (const d of [-w, w, -1, 1]) { const n = c + d; if (!s.lvl.walls[n] && !s.boxes.includes(n) && !prev.has(n)) { prev.set(n, c); q.push(n); } }
  }
  if (!prev.has(target)) return null;
  const out: ('up' | 'down' | 'left' | 'right')[] = []; let c = target;
  while (c !== s.player) { const p = prev.get(c)!; out.unshift(c - p === -w ? 'up' : c - p === w ? 'down' : c - p === -1 ? 'left' : 'right'); c = p; }
  return out;
}
