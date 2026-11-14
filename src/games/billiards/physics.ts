/**
 * Top-down pool physics on a 9-foot table (2.54 × 1.27 m playing area, 57.15 mm balls).
 * Balls slow under rolling resistance, collide elastically with slight energy loss, and
 * rebound from cushions. Pockets are capture circles at the corners and side midpoints;
 * cushions stop short of each pocket, and their ends (the jaws) are collision points.
 *
 * Spin is simplified: follow or draw adds speed along the shot line after the cue ball's
 * first contact, and side spin changes the angle and speed off the next cushions.
 */
export const W = 2.54, H = 1.27, R = 0.028575;
export const POCKETS: { x: number; y: number; r: number }[] = [
  { x: -0.012, y: -0.012, r: 0.062 }, { x: W / 2, y: -0.022, r: 0.058 }, { x: W + 0.012, y: -0.012, r: 0.062 },
  { x: -0.012, y: H + 0.012, r: 0.062 }, { x: W / 2, y: H + 0.022, r: 0.058 }, { x: W + 0.012, y: H + 0.012, r: 0.062 },
];
const CORNER_GAP = 0.085, SIDE_GAP = 0.062;
/** Cushion segments as [x1, y1, x2, y2]; their end points are the pocket jaws. */
export const CUSHIONS: number[][] = [
  [CORNER_GAP, 0, W / 2 - SIDE_GAP, 0], [W / 2 + SIDE_GAP, 0, W - CORNER_GAP, 0],
  [CORNER_GAP, H, W / 2 - SIDE_GAP, H], [W / 2 + SIDE_GAP, H, W - CORNER_GAP, H],
  [0, CORNER_GAP, 0, H - CORNER_GAP], [W, CORNER_GAP, W, H - CORNER_GAP],
];
export interface Ball { id: number; x: number; y: number; vx: number; vy: number; on: boolean }
export interface Spin { follow: number; side: number }
export interface ShotEvents { firstHit: number; pocketed: number[]; pockets: number[]; railAfterHit: boolean; cushionHits: number; time: number;
  /** Collisions since the last frame, for sound: kind and closing speed. */
  sounds?: ['ball' | 'cushion' | 'pocket', number][] }

const DECEL = 0.17;          // rolling resistance, m/s²
const BALL_E = 0.94;         // ball-ball restitution
const CUSHION_E = 0.78;      // cushion restitution
const DT = 1 / 900;
export const MAX_SPEED = 6.4;

export function cloneBalls(b: Ball[]): Ball[] { return b.map(x => ({ ...x })); }
export const moving = (b: Ball[]) => b.some(x => x.on && (x.vx || x.vy));

/** Advances the simulation by `seconds`; returns false once everything has stopped. */
export function step(balls: Ball[], seconds: number, ev: ShotEvents, spin: Spin): boolean {
  const n = Math.round(seconds / DT);
  for (let k = 0; k < n; k++) {
    if (!moving(balls)) return false;
    ev.time += DT;
    for (const b of balls) {
      if (!b.on || (!b.vx && !b.vy)) continue;
      const sp = Math.hypot(b.vx, b.vy), ns = sp - DECEL * DT;
      if (ns <= 0.002) { b.vx = 0; b.vy = 0; continue; }
      b.vx *= ns / sp; b.vy *= ns / sp;
      b.x += b.vx * DT; b.y += b.vy * DT;
    }
    // Ball-ball collisions.
    for (let i = 0; i < balls.length; i++) {
      const a = balls[i];
      if (!a.on) continue;
      for (let j = i + 1; j < balls.length; j++) {
        const c = balls[j];
        if (!c.on) continue;
        const dx = c.x - a.x, dy = c.y - a.y, d2 = dx * dx + dy * dy;
        if (d2 >= 4 * R * R || d2 === 0) continue;
        const d = Math.sqrt(d2), nx = dx / d, ny = dy / d;
        const rel = (a.vx - c.vx) * nx + (a.vy - c.vy) * ny;
        const overlap = 2 * R - d;
        a.x -= nx * overlap / 2; a.y -= ny * overlap / 2; c.x += nx * overlap / 2; c.y += ny * overlap / 2;
        if (rel <= 0) continue;
        const cueInvolved = a.id === 0 || c.id === 0;
        const firstContact = cueInvolved && ev.firstHit < 0;
        if (cueInvolved && ev.firstHit < 0) ev.firstHit = a.id === 0 ? c.id : a.id;
        const cue = a.id === 0 ? a : c.id === 0 ? c : null;
        const before = cue ? { vx: cue.vx, vy: cue.vy, sp: Math.hypot(cue.vx, cue.vy) } : null;
        const imp = (1 + BALL_E) / 2 * rel;
        ev.sounds?.push(['ball', rel]);
        a.vx -= imp * nx; a.vy -= imp * ny; c.vx += imp * nx; c.vy += imp * ny;
        if (cue && firstContact && before && before.sp > 0 && spin.follow) {
          // Follow keeps the cue ball rolling forward; draw pulls it back.
          const k = 0.55 * spin.follow * before.sp * Math.abs(rel) / before.sp;
          cue.vx += (before.vx / before.sp) * k; cue.vy += (before.vy / before.sp) * k;
        }
      }
    }
    // Cushions and jaws.
    for (const b of balls) {
      if (!b.on) continue;
      for (const [x1, y1, x2, y2] of CUSHIONS) {
        const sx = x2 - x1, sy = y2 - y1, len2 = sx * sx + sy * sy;
        const tt = Math.max(0, Math.min(1, ((b.x - x1) * sx + (b.y - y1) * sy) / len2));
        const px = x1 + sx * tt, py = y1 + sy * tt, dx = b.x - px, dy = b.y - py, d2 = dx * dx + dy * dy;
        // A ball beyond the cushion line (inside a pocket mouth) is handled by the jaws only.
        if (d2 >= R * R || d2 === 0) continue;
        const d = Math.sqrt(d2), nx = dx / d, ny = dy / d, vn = b.vx * nx + b.vy * ny;
        b.x = px + nx * R; b.y = py + ny * R;
        if (vn >= 0) continue;
        const tx = -ny, ty = nx, vt = b.vx * tx + b.vy * ty;
        const english = b.id === 0 ? spin.side * Math.abs(vn) * 0.45 : 0;
        b.vx = (vt * 0.97 + english) * tx - vn * CUSHION_E * nx;
        b.vy = (vt * 0.97 + english) * ty - vn * CUSHION_E * ny;
        if (b.id === 0) spin.side *= 0.5;
        ev.cushionHits++;
        ev.sounds?.push(['cushion', -vn]);
        if (ev.firstHit >= 0) ev.railAfterHit = true;
      }
    }
    // Pockets.
    for (const b of balls) {
      if (!b.on) continue;
      for (let p = 0; p < POCKETS.length; p++) {
        const pk = POCKETS[p];
        if (Math.hypot(b.x - pk.x, b.y - pk.y) < pk.r) {
          ev.sounds?.push(['pocket', Math.hypot(b.vx, b.vy)]);
          b.on = false; b.vx = 0; b.vy = 0; ev.pocketed.push(b.id); ev.pockets.push(p);
          break;
        }
      }
      // Safety: a ball pushed off the table counts as pocketed in the nearest pocket.
      if (b.on && (b.x < -0.05 || b.x > W + 0.05 || b.y < -0.05 || b.y > H + 0.05)) { b.on = false; ev.pocketed.push(b.id); ev.pockets.push(-1); }
    }
  }
  return moving(balls);
}
export const newEvents = (): ShotEvents => ({ firstHit: -1, pocketed: [], pockets: [], railAfterHit: false, cushionHits: 0, time: 0 });

export function strike(balls: Ball[], angle: number, power: number) {
  const cue = balls.find(b => b.id === 0)!, sp = 0.25 + power * (MAX_SPEED - 0.25);
  cue.vx = Math.cos(angle) * sp; cue.vy = Math.sin(angle) * sp;
}
/** Runs a shot to the end (used by the computer player and the tests). */
export function simulate(balls: Ball[], angle: number, power: number, spin: Spin, maxTime = 20) {
  const b = cloneBalls(balls), ev = newEvents(), s = { ...spin };
  strike(b, angle, power);
  while (step(b, 0.05, ev, s) && ev.time < maxTime) { /* run */ }
  return { balls: b, ev };
}
export const free = (balls: Ball[], x: number, y: number, ignore = -1) =>
  x >= R && x <= W - R && y >= R && y <= H - R && balls.every(b => !b.on || b.id === ignore || Math.hypot(b.x - x, b.y - y) >= 2 * R + 0.001);
