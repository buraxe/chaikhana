/**
 * Table tennis seen from the side, in metres (y up, table top at y = 0, x from 0 to 2.74).
 * Player 1 stands at the left end, player 2 at the right. A rally follows the real rules: the
 * ball must bounce once on the far side after each hit; a serve bounces first on the server's
 * own side. Games go to 11, win by two; the serve changes every two points (every point at 10–10).
 * Time runs a little slower than real life so people can play it. Across the table (z, 0 in the
 * middle) the ball also moves sideways; the side view ignores it, the first-person view plays it.
 */
import type { Level } from '../../core/match';

export const TW = 1.525, T = 2.74, NET = 0.1525, BR = 0.03, G = 9.8, E = 0.86, PADDLE = 0.13, FLOOR = -0.76, SLOW = 0.62;
export type V2 = { x: number; y: number };
export type Phase = 'serve' | 'rally' | 'dead' | 'over';
export interface Game {
  ball: V2; v: V2; p: [V2, V2]; pv: [V2, V2]; score: [number, number]; server: 1 | 2; first: 1 | 2;
  phase: Phase; hitter: 0 | 1 | 2; serving: boolean; bounces: [number, number]; wait: number; winner: 0 | 1 | 2;
  /** Across the table: the ball's position and speed, and each paddle's position. */
  bz: number; vz: number; pz: [number, number];
  last: { scorer: 1 | 2; why: Why } | null;
}
export type Why = 'net' | 'long' | 'miss' | 'double' | 'own';

export const side = (x: number): 1 | 2 => (x < T / 2 ? 1 : 2);
export const homePaddle = (k: 0 | 1): V2 => (k === 0 ? { x: -0.25, y: 0.3 } : { x: T + 0.25, y: 0.3 });

export function newGame(first: 1 | 2 = 1): Game {
  const g: Game = { ball: { x: 0, y: 0 }, v: { x: 0, y: 0 }, p: [homePaddle(0), homePaddle(1)], pv: [{ x: 0, y: 0 }, { x: 0, y: 0 }], score: [0, 0], server: first, first, phase: 'serve', hitter: 0, serving: false, bounces: [0, 0], wait: 0, winner: 0, last: null, bz: 0, vz: 0, pz: [0, 0] };
  placeForServe(g);
  return g;
}
export function placeForServe(g: Game) {
  const k = g.server - 1, p = g.p[k];
  g.ball = { x: p.x + (k === 0 ? 0.06 : -0.06), y: Math.max(0.12, p.y + 0.08) }; g.v = { x: 0, y: 0 };
  g.bz = g.pz[k]; g.vz = 0;
  g.phase = 'serve'; g.hitter = 0; g.serving = false; g.bounces = [0, 0];
}
/** Who serves after `points` points have been played. */
export function serverAfter(first: 1 | 2, score: [number, number]): 1 | 2 {
  const n = score[0] + score[1], deuce = score[0] >= 10 && score[1] >= 10;
  const turns = deuce ? 10 + (n - 20) : Math.floor(n / 2);
  return (turns % 2 === 0 ? first : first === 1 ? 2 : 1);
}

/** The vertical speed that makes a ball from (x0, y0) with horizontal speed vx come down on the table at x1. */
function vyToLand(x0: number, y0: number, x1: number, vx: number): number {
  const tf = (x1 - x0) / vx;
  return (0.5 * G * tf * tf - (y0 - BR)) / tf;
}
/** Height of a ball on its flight at horizontal position x. */
function heightAt(b: V2, v: V2, x: number) { const tt = (x - b.x) / v.x; return b.y + v.y * tt - 0.5 * G * tt * tt; }

/**
 * Strike the ball for player k. `pace` 0..1 is how hard (paddle speed), `lift` −1..1 whether the
 * paddle moves down or up (up sends it deeper), `err` the spread of the aim in metres.
 */
export function strike(g: Game, k: 0 | 1, pace: number, lift: number, err: number, rnd: () => number, safe = false, zt = 0) {
  const dir = k === 0 ? 1 : -1;
  const vx = (3.4 + 3.6 * pace) * dir;
  const depth = 0.3 + 0.55 * Math.max(0, Math.min(1, (lift + 1) / 2));
  let target = k === 0 ? T / 2 + depth * (T / 2) : T / 2 - depth * (T / 2);
  // A careful player (the computer) aims deeper until the ball clears the net, then may still miss.
  if (safe) for (let i = 0; i < 8; i++) {
    const vy = vyToLand(g.ball.x, g.ball.y, target, vx);
    if (heightAt(g.ball, { x: vx, y: vy }, T / 2) > NET + BR + 0.05) break;
    target += 0.08 * dir;
  }
  // Harder strokes stray more: a long or short ball is the price of pace.
  target += (rnd() + rnd() + rnd() - 1.5) * 2 * err * (0.4 + pace);
  g.v = { x: vx, y: vyToLand(g.ball.x, g.ball.y, target, vx) };
  // Sideways: aim at zt across the table, with a little of the same spread.
  const tf = (target - g.ball.x) / vx;
  g.vz = (zt + (rnd() - 0.5) * err * 0.35 * (0.4 + pace) - g.bz) / tf;
  // A ball struck from below the net line with a flat stroke may clip the net: that is the game.
  g.hitter = (k + 1) as 1 | 2; g.bounces = [0, 0]; g.serving = false;
}

/** Serve for the current server: first bounce on their own side, then it carries over the net. */
export function serve(g: Game, rnd: () => number, zt = 0) {
  const k = g.server - 1, dir = k === 0 ? 1 : -1;
  const own = k === 0 ? 0.45 + rnd() * 0.25 : T - 0.45 - rnd() * 0.25;
  // Find a pace whose second bounce lands well inside the far half and clears the net.
  for (let vx = 2.6; vx < 6; vx += 0.1) {
    const vy0 = vyToLand(g.ball.x, g.ball.y, own, vx * dir);
    const t1 = (own - g.ball.x) / (vx * dir), vy1 = -(vy0 - G * t1) * E;
    const t2 = (2 * vy1) / G, x2 = own + vx * dir * t2;
    const tNet = (T / 2 - own) / (vx * dir), yNet = BR + vy1 * tNet - 0.5 * G * tNet * tNet;
    const inFar = k === 0 ? x2 > T / 2 + 0.35 && x2 < T - 0.15 : x2 < T / 2 - 0.35 && x2 > 0.15;
    if (inFar && yNet > NET + BR + 0.02) { g.v = { x: vx * dir, y: vy0 }; g.vz = (zt - g.bz) / (t1 + t2); break; }
  }
  g.phase = 'rally'; g.hitter = g.server; g.serving = true; g.bounces = [0, 0];
}

function point(g: Game, scorer: 1 | 2, why: Why) {
  g.score[scorer - 1]++;
  g.last = { scorer, why };
  const [a, b] = g.score;
  if ((a >= 11 || b >= 11) && Math.abs(a - b) >= 2) { g.winner = a > b ? 1 : 2; g.phase = 'over'; return; }
  g.phase = 'dead'; g.wait = 1.1;
}

/** Advance the ball by dt seconds of game time. */
export function step(g: Game, dt: number) {
  if (g.phase === 'over') return;
  if (g.phase === 'dead') {
    g.wait -= dt;
    g.v.y -= G * dt; g.ball.x += g.v.x * dt; g.ball.y += g.v.y * dt; g.bz += g.vz * dt;
    if (g.ball.y < FLOOR + BR) { g.ball.y = FLOOR + BR; g.v.y = Math.abs(g.v.y) * 0.5; g.v.x *= 0.7; }
    if (g.wait <= 0) { g.server = serverAfter(g.first, g.score); placeForServe(g); }
    return;
  }
  if (g.phase === 'serve') { const k = g.server - 1, p = g.p[k]; g.ball = { x: p.x + (k === 0 ? 0.06 : -0.06), y: Math.max(0.12, p.y + 0.08) }; g.bz = g.pz[k]; return; }
  const sub = 4, h = dt / sub;
  for (let s = 0; s < sub && g.phase === 'rally'; s++) {
    const prev = { ...g.ball };
    g.v.y -= G * h; g.ball.x += g.v.x * h; g.ball.y += g.v.y * h; g.bz += g.vz * h;
    const onTable = Math.abs(g.bz) <= TW / 2;
    // The net: a thin wall at mid-table (its posts stand a little outside the table).
    if ((prev.x - T / 2) * (g.ball.x - T / 2) <= 0 && g.ball.y < NET + BR && g.ball.y > -0.02 && Math.abs(g.bz) < TW / 2 + 0.15) {
      g.ball.x = T / 2 - Math.sign(g.v.x) * BR; g.v.x *= -0.15; g.v.y = Math.min(g.v.y, 0);
    }
    // The table.
    if (g.ball.y < BR && prev.y >= BR && g.ball.x >= 0 && g.ball.x <= T && onTable && g.v.y < 0) {
      g.ball.y = BR; g.v.y = -g.v.y * E;
      const sd = side(g.ball.x), hitter = g.hitter as 1 | 2, other = hitter === 1 ? 2 : 1;
      g.bounces[sd - 1]++;
      if (g.serving) {
        // Serve: own side once, then the far side once.
        if (sd === hitter && g.bounces[hitter - 1] > 1) { point(g, other, 'double'); break; }
        if (sd === other && g.bounces[hitter - 1] === 0) { point(g, other, 'own'); break; }
        if (sd === other) g.serving = false, g.bounces = [0, 0], g.bounces[other - 1] = 1;
      } else {
        if (sd === hitter) { point(g, other, g.bounces[other - 1] ? 'double' : 'net'); break; }
        if (g.bounces[other - 1] > 1) { point(g, hitter, 'double'); break; }
      }
    }
    // The floor: whoever was meant to play it has missed, or the shot was long.
    if (g.ball.y < FLOOR + 0.2 || g.ball.x < -1.6 || g.ball.x > T + 1.6) {
      const hitter = g.hitter as 1 | 2, other = hitter === 1 ? 2 : 1;
      if (g.serving || g.bounces[other - 1] === 0) point(g, other, 'long');
      else point(g, hitter, 'miss');
    }
  }
}

/** Is the ball where a careful player strikes it: at or past the end of the table on their side? */
export const atStrikingPoint = (g: Game, k: 0 | 1) => (k === 0 ? g.ball.x < 0.12 : g.ball.x > T - 0.12);
/** Can player k hit the ball now? It must be coming their way, past its bounce on their side. */
export function canHit(g: Game, k: 0 | 1): boolean {
  if (g.phase !== 'rally' || g.serving) return false;
  const me = (k + 1) as 1 | 2;
  if (g.hitter === me) return false;
  if (g.bounces[k] !== 1) return false;
  const p = g.p[k];
  return Math.hypot(g.ball.x - p.x, g.ball.y - p.y, g.bz - g.pz[k]) < PADDLE + BR;
}

/** reach: how far off the ball's path the computer may stand (a miss when it is more than the paddle). */
export const LEVELS: (Level & { speed: number; err: number; pace: number; react: number; reach: number })[] = [
  { name: 'Beginner', rating: 700, speed: 1.7, err: 0.4, pace: 0.1, react: 0.35, reach: 0.24 },
  { name: 'Easy', rating: 900, speed: 2.1, err: 0.32, pace: 0.25, react: 0.25, reach: 0.19 },
  { name: 'Intermediate', rating: 1100, speed: 2.4, err: 0.26, pace: 0.45, react: 0.17, reach: 0.17 },
  { name: 'Advanced', rating: 1350, speed: 3.1, err: 0.2, pace: 0.65, react: 0.1, reach: 0.11 },
  { name: 'Expert', rating: 1600, speed: 4, err: 0.15, pace: 0.85, react: 0.05, reach: 0.06 },
];

/**
 * Where player k should hold the paddle: on the ball's path just after it bounces on their side,
 * at a comfortable height; back at home otherwise.
 */
export function aiTarget(g: Game, k: 0 | 1): V2 & { z: number } {
  const home = { ...homePaddle(k), z: 0 }, me = (k + 1) as 1 | 2;
  if (g.phase !== 'rally' || g.hitter === me) return home;
  // Simulate the ball forward on a copy.
  let b = { ...g.ball }, v = { ...g.v }, z = g.bz, bounced = g.bounces[k] === 1 && !g.serving;
  const h = 1 / 120;
  for (let i = 0; i < 360; i++) {
    v.y -= G * h; b.x += v.x * h; b.y += v.y * h; z += g.vz * h;
    if (b.y < BR && b.x >= 0 && b.x <= T && Math.abs(z) <= TW / 2 && v.y < 0) { b.y = BR; v.y = -v.y * E; if (side(b.x) === me) bounced = true; }
    if (bounced && v.y < 0.6 && (k === 0 ? b.x < 0.15 : b.x > T - 0.15)) return { x: b.x, y: b.y, z };
    if (b.y < FLOOR) break;
  }
  return home;
}
/** Keep a paddle within reach across the table. */
export const clampZ = (z: number) => Math.max(-1.1, Math.min(1.1, z));
export const clampPaddle = (p: V2, k: 0 | 1): V2 => ({ x: k === 0 ? Math.min(0.45, Math.max(-0.85, p.x)) : Math.max(T - 0.45, Math.min(T + 0.85, p.x)), y: Math.min(1.0, Math.max(-0.35, p.y)) });
// Keep `heightAt` for tests that check the net clearance of a stroke.
export { heightAt };
