/**
 * Air hockey on a table 1 wide and 1.6 long (y down). Player 1 defends the bottom goal, player 2
 * the top. Mallets are as heavy as a hand, so the puck bounces off them; walls lose a little speed.
 */
import type { Level } from '../../core/match';

export const W = 1, H = 1.6, GOAL = 0.34, PR = 0.034, MR = 0.062, MAX = 3.2, TARGET = 7;
export type V2 = { x: number; y: number };
export interface Table { puck: V2; pv: V2; m: [V2, V2]; mv: [V2, V2]; score: [number, number]; serve: 1 | 2; pause: number; winner: 0 | 1 | 2; lastGoal: 0 | 1 | 2 }

export const newTable = (serve: 1 | 2 = 1): Table => ({
  puck: { x: W / 2, y: serve === 1 ? H * 0.72 : H * 0.28 }, pv: { x: 0, y: 0 },
  m: [{ x: W / 2, y: H - 0.15 }, { x: W / 2, y: 0.15 }], mv: [{ x: 0, y: 0 }, { x: 0, y: 0 }],
  score: [0, 0], serve, pause: 0.6, winner: 0, lastGoal: 0,
});

/** Keep a mallet on its own half and on the table. */
export function clampMallet(p: V2, side: 0 | 1): V2 {
  const x = Math.min(W - MR, Math.max(MR, p.x));
  const y = side === 0 ? Math.min(H - MR, Math.max(H / 2 + MR, p.y)) : Math.min(H / 2 - MR, Math.max(MR, p.y));
  return { x, y };
}

const len = (v: V2) => Math.hypot(v.x, v.y);
function capSpeed(v: V2) { const s = len(v); if (s > MAX) { v.x *= MAX / s; v.y *= MAX / s; } }

/** Advance the table by dt seconds (mallet positions already set for this step, with their velocities). */
export function step(t: Table, dt: number): Table {
  if (t.winner) return t;
  if (t.pause > 0) { t.pause = Math.max(0, t.pause - dt); return t; }
  const sub = 6, h = dt / sub;
  for (let s = 0; s < sub; s++) {
    t.puck.x += t.pv.x * h; t.puck.y += t.pv.y * h;
    // Side walls.
    if (t.puck.x < PR) { t.puck.x = PR; t.pv.x = Math.abs(t.pv.x) * 0.9; }
    if (t.puck.x > W - PR) { t.puck.x = W - PR; t.pv.x = -Math.abs(t.pv.x) * 0.9; }
    // End walls, except the goal mouths.
    const inMouth = Math.abs(t.puck.x - W / 2) < GOAL / 2;
    if (t.puck.y < PR && !inMouth) { t.puck.y = PR; t.pv.y = Math.abs(t.pv.y) * 0.9; }
    if (t.puck.y > H - PR && !inMouth) { t.puck.y = H - PR; t.pv.y = -Math.abs(t.pv.y) * 0.9; }
    // Goal mouth posts: keep the puck from slipping through the corner.
    if (t.puck.y < -PR) return goal(t, 1);
    if (t.puck.y > H + PR) return goal(t, 2);
    // Mallets.
    for (const k of [0, 1] as const) {
      const m = t.m[k], mv = t.mv[k], dx = t.puck.x - m.x, dy = t.puck.y - m.y, d = Math.hypot(dx, dy);
      if (d < PR + MR && d > 1e-6) {
        const nx = dx / d, ny = dy / d;
        t.puck.x = m.x + nx * (PR + MR); t.puck.y = m.y + ny * (PR + MR);
        const rel = (t.pv.x - mv.x) * nx + (t.pv.y - mv.y) * ny;
        if (rel < 0) { t.pv.x -= 1.9 * rel * nx; t.pv.y -= 1.9 * rel * ny; }
        capSpeed(t.pv);
      }
    }
    // A mallet can push the puck into a wall but never through it.
    if (t.puck.x < PR) { t.puck.x = PR; t.pv.x = Math.abs(t.pv.x) * 0.9; }
    if (t.puck.x > W - PR) { t.puck.x = W - PR; t.pv.x = -Math.abs(t.pv.x) * 0.9; }
    const mouth = Math.abs(t.puck.x - W / 2) < GOAL / 2;
    if (!mouth && t.puck.y < PR) { t.puck.y = PR; t.pv.y = Math.abs(t.pv.y) * 0.9; }
    if (!mouth && t.puck.y > H - PR) { t.puck.y = H - PR; t.pv.y = -Math.abs(t.pv.y) * 0.9; }
  }
  // Air cushion: very little friction.
  const f = Math.exp(-0.35 * dt); t.pv.x *= f; t.pv.y *= f;
  // The air also lifts a puck that has come to rest against a wall a little way off it, so it is never stuck there.
  if (Math.hypot(t.pv.x, t.pv.y) < 0.12) {
    const near = 0.012;
    if (t.puck.x < PR + near) t.pv.x += 0.5 * dt; else if (t.puck.x > W - PR - near) t.pv.x -= 0.5 * dt;
    if (t.puck.y < PR + near) t.pv.y += 0.5 * dt; else if (t.puck.y > H - PR - near) t.pv.y -= 0.5 * dt;
  }
  return t;
}

function goal(t: Table, scorer: 1 | 2): Table {
  t.score[scorer - 1]++;
  t.lastGoal = scorer;
  if (t.score[scorer - 1] >= TARGET) { t.winner = scorer; return t; }
  // The side that conceded gets the puck.
  const conceded = scorer === 1 ? 2 : 1;
  t.puck = { x: W / 2, y: conceded === 1 ? H * 0.72 : H * 0.28 }; t.pv = { x: 0, y: 0 }; t.pause = 0.9;
  return t;
}

/** speed: mallet speed when defending; shot: when it strikes; react: seconds between looks; aim: how well it places its own shots; miss: how far off it may meet a shot. */
export const LEVELS: (Level & { speed: number; react: number; aim: number; miss: number; shot: number })[] = [
  { name: 'Beginner', rating: 700, speed: 0.6, react: 0.34, aim: 0, miss: 0.4, shot: 1.5 },
  { name: 'Easy', rating: 900, speed: 0.8, react: 0.27, aim: 0.2, miss: 0.32, shot: 1.9 },
  { name: 'Intermediate', rating: 1100, speed: 0.95, react: 0.21, aim: 0.5, miss: 0.25, shot: 2.3 },
  { name: 'Advanced', rating: 1350, speed: 1.2, react: 0.16, aim: 0.8, miss: 0.2, shot: 2.7 },
  { name: 'Expert', rating: 1600, speed: 1.45, react: 0.12, aim: 1, miss: 0.16, shot: 3.1 },
];

/**
 * Where the computer (top side) wants its mallet. It defends in front of its goal while the puck
 * is in the other half or coming at it fast; when the puck is slow on its side it steps behind it
 * and strikes towards the far goal, aiming off a wall when it is good enough.
 */
export function aiTarget(t: Table, level: number, rnd: () => number = Math.random): V2 {
  const L = LEVELS[level], p = t.puck, v = t.pv;
  // Weaker players guard the goal less exactly.
  const home: V2 = { x: W / 2 + (p.x - W / 2) * 0.55 + (rnd() - 0.5) * L.miss, y: 0.12 };
  if (p.y > H / 2 + 0.05) return home;
  if (v.y < -0.9 && p.y > 0.3) {
    // Coming at us: meet it on the line between it and our goal.
    const tt = Math.max(0, (p.y - 0.2) / -v.y);
    let x = p.x + v.x * tt;
    while (x < 0 || x > W) x = x < 0 ? -x : 2 * W - x; // bank off the walls
    return { x: x + (rnd() - 0.5) * 2 * L.miss, y: 0.2 };
  }
  // Slow or moving away on our side: go behind it and push through towards the target.
  const aimX = L.aim > 0.6 && rnd() < 0.4 ? (p.x < W / 2 ? W * 0.9 : W * 0.1) : W / 2;
  let tx = aimX - p.x, ty = H + 0.2 - p.y, tl = Math.hypot(tx, ty);
  const reach = MR + PR + 0.02;
  let behind: V2 = { x: p.x - (tx / tl) * reach, y: p.y - (ty / tl) * reach };
  // Against a wall there is no room behind the puck, and pushing it into the wall only pins it.
  // Come at it along the wall instead: up the table off a side wall, towards the middle off our end.
  const c = clampMallet(behind, 1);
  if (Math.hypot(c.x - behind.x, c.y - behind.y) > 0.015) {
    const nearEnd = p.y < MR + PR + 0.03, nearSide = p.x < MR + PR + 0.03 || p.x > W - MR - PR - 0.03;
    tx = nearEnd ? Math.sign(W / 2 - p.x) || 1 : 0; ty = nearEnd && !nearSide ? 0.25 : 1;
    if (nearEnd && nearSide) { tx = Math.sign(W / 2 - p.x); ty = 1; }
    tl = Math.hypot(tx, ty);
    behind = { x: p.x - (tx / tl) * reach, y: p.y - (ty / tl) * reach };
  }
  const m = t.m[1], d = Math.hypot(m.x - behind.x, m.y - behind.y);
  return d < 0.03 ? { x: p.x + (tx / tl) * 0.12, y: p.y + (ty / tl) * 0.12 } : behind;
}

/** How fast the computer's mallet may move now: quick when it strikes a puck on its side, slower when it guards. */
export function aiSpeed(t: Table, level: number): number {
  const L = LEVELS[level], m = t.m[1], near = Math.hypot(t.puck.x - m.x, t.puck.y - m.y) < 0.22;
  return near && t.puck.y < H / 2 && Math.hypot(t.pv.x, t.pv.y) < 1.2 ? L.shot : L.speed;
}

/**
 * Has the computer been leaning on a slow puck for a while? Then it should step back and come
 * again: `since` is how long the puck has been slow and close to its mallet.
 */
export function aiStuck(t: Table, since: number, dt: number): number {
  const close = Math.hypot(t.puck.x - t.m[1].x, t.puck.y - t.m[1].y) < MR + PR + 0.04;
  return close && Math.hypot(t.pv.x, t.pv.y) < 0.4 && t.puck.y < H / 2 ? since + dt : 0;
}
