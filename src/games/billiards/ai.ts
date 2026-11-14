/**
 * Computer player. It lists direct pots (target ball, pocket, ghost-ball aim), rejects
 * blocked or very thin cuts, then simulates the best candidates at a few speeds and spins
 * and keeps the one that pots a ball legally and leaves the best next shot. Levels differ
 * in how many candidates and speeds they try, whether they plan position, and how
 * precisely the cue is delivered (a small angle error, as with a human player).
 */
import { free, POCKETS, R, simulate, W, H, type Ball, type Spin } from './physics';
import { judge, legalTargets, type Table } from './rules';

export const LEVELS = [
  { name: 'Beginner', rating: 700, cands: 2, powers: [0.45], spins: [0], position: false, error: 2.8 },
  { name: 'Easy', rating: 900, cands: 4, powers: [0.35, 0.55], spins: [0], position: false, error: 1.6 },
  { name: 'Intermediate', rating: 1150, cands: 6, powers: [0.3, 0.45, 0.65], spins: [0], position: false, error: 0.9 },
  { name: 'Advanced', rating: 1400, cands: 8, powers: [0.28, 0.42, 0.6], spins: [0, 0.6, -0.6], position: true, error: 0.45 },
  { name: 'Expert', rating: 1650, cands: 10, powers: [0.25, 0.38, 0.52, 0.7], spins: [0, 0.7, -0.7], position: true, error: 0.2 },
];
export interface Shot { angle: number; power: number; spin: Spin }

const clearPath = (balls: Ball[], x1: number, y1: number, x2: number, y2: number, skip: number[]) => {
  const dx = x2 - x1, dy = y2 - y1, len2 = dx * dx + dy * dy;
  return balls.every(b => {
    if (!b.on || skip.includes(b.id)) return true;
    const t = Math.max(0, Math.min(1, ((b.x - x1) * dx + (b.y - y1) * dy) / len2));
    return Math.hypot(b.x - (x1 + dx * t), b.y - (y1 + dy * t)) > 2 * R - 0.002;
  });
};
/** Straight pots available from the cue ball's position, best first. */
export function candidates(t: Table, balls = t.balls) {
  const cue = balls.find(b => b.id === 0)!, out: { angle: number; score: number; target: number }[] = [];
  for (const id of legalTargets(t)) {
    const b = balls.find(x => x.id === id && x.on);
    if (!b) continue;
    for (const p of POCKETS) {
      const px = p.x - b.x, py = p.y - b.y, pd = Math.hypot(px, py);
      const gx = b.x - (px / pd) * 2 * R, gy = b.y - (py / pd) * 2 * R;
      const ax = gx - cue.x, ay = gy - cue.y, ad = Math.hypot(ax, ay);
      const cos = (ax * px + ay * py) / (ad * pd);
      if (cos < 0.3) continue; // thinner than about 72°
      if (!clearPath(balls, cue.x, cue.y, gx, gy, [0, id]) || !clearPath(balls, b.x, b.y, p.x, p.y, [id])) continue;
      out.push({ angle: Math.atan2(ay, ax), score: cos * cos / (0.6 + ad + pd), target: id });
    }
  }
  return out.sort((a, c) => c.score - a.score);
}
function bestCandidateScore(t: Table, balls: Ball[]) { const c = candidates(t, balls); return c.length ? c[0].score : 0; }

export function chooseShot(t: Table, level: number, rng: () => number = Math.random): Shot {
  const L = LEVELS[level], cands = candidates(t).slice(0, L.cands);
  let best: { shot: Shot; value: number } | null = null;
  for (const c of cands) for (const power of L.powers) for (const follow of L.spins) {
    const spin = { follow, side: 0 }, { balls, ev } = simulate(t.balls, c.angle, power, spin);
    const res = judge(t, balls, ev);
    let value = 0;
    if (res.winner === t.turn) value = 1000;
    else if (res.winner >= 0) value = -1000;
    else if (res.foul) value = -50;
    else if (res.turn === t.turn) value = 100 + (L.position ? bestCandidateScore(res, res.balls) * 120 : 0);
    else value = -10;
    value += c.score * 5 - power * 2;
    if (!best || value > best.value) best = { shot: { angle: c.angle, power, spin }, value };
  }
  if (!best || best.value < 0) {
    // No safe pot: hit a legal ball full and softly so it reaches a cushion.
    const cue = t.balls.find(b => b.id === 0)!;
    const targets = legalTargets(t).map(id => t.balls.find(b => b.id === id && b.on)!).filter(Boolean);
    const open = targets.find(b => clearPath(t.balls, cue.x, cue.y, b.x, b.y, [0, b.id])) ?? targets[0];
    if (!best && open) best = { shot: { angle: Math.atan2(open.y - cue.y, open.x - cue.x), power: 0.42, spin: { follow: 0, side: 0 } }, value: 0 };
  }
  const shot = best?.shot ?? { angle: rng() * Math.PI * 2, power: 0.4, spin: { follow: 0, side: 0 } };
  const err = ((rng() + rng() + rng() - 1.5) / 1.5) * (L.error * Math.PI / 180);
  return { ...shot, angle: shot.angle + err };
}
/** Where to put the cue ball with ball in hand: the spot with the easiest pot. */
export function placeCueBall(t: Table, behindLine: boolean): { x: number; y: number } {
  let best = { x: W * 0.25, y: H / 2 }, bestV = -1;
  const cue = t.balls.find(b => b.id === 0)!;
  for (let x = R * 2; x < (behindLine ? W * 0.25 : W - R * 2); x += 0.09) for (let y = R * 2; y < H - R * 2; y += 0.09) {
    if (!free(t.balls, x, y, 0)) continue;
    const balls = t.balls.map(b => (b.id === 0 ? { ...cue, x, y, on: true } : b));
    const v = bestCandidateScore(t, balls);
    if (v > bestV) { bestV = v; best = { x, y }; }
  }
  return best;
}
