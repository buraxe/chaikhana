import { describe, expect, it } from 'vitest';
import { mulberry32 } from '../../core/rng';
import { chooseShot, candidates } from './ai';
import { cloneBalls, H, newEvents, POCKETS, R, simulate, step, W, type Ball } from './physics';
import { judge, legalTargets, newTable, rack, type Table } from './rules';

const ball = (id: number, x: number, y: number): Ball => ({ id, x, y, vx: 0, vy: 0, on: true });
const energy = (bs: Ball[]) => bs.reduce((a, b) => a + b.vx * b.vx + b.vy * b.vy, 0);

describe('billiards physics', () => {
  it('a rolling ball slows down and stops', () => {
    const { balls, ev } = simulate([ball(0, 0.5, H / 2)], 0, 0.15, { follow: 0, side: 0 });
    expect(balls[0].vx).toBe(0);
    expect(balls[0].x).toBeGreaterThan(0.6);
    expect(ev.time).toBeGreaterThan(1);
  });
  it('a straight full hit stops the cue ball and sends the object ball on', () => {
    const bs = [ball(0, 0.6, H / 2), ball(1, 1.0, H / 2)];
    bs[0].vx = 2;
    const ev = newEvents();
    for (let k = 0; k < 30 && bs[1].vx === 0; k++) step(bs, 0.01, ev, { follow: 0, side: 0 });
    expect(ev.firstHit).toBe(1);
    expect(bs[1].vx).toBeGreaterThan(1.7);
    expect(Math.abs(bs[0].vx)).toBeLessThan(0.15);
  });
  it('collisions never add energy', () => {
    const bs = rack('8ball', mulberry32(1));
    bs[0].vx = 6;
    const ev = newEvents();
    let e = energy(bs);
    for (let k = 0; k < 200; k++) { step(bs, 0.01, ev, { follow: 0, side: 0 }); const e2 = energy(bs); expect(e2).toBeLessThanOrEqual(e + 1e-9); e = e2; }
  });
  it('a ball rebounds from a cushion at about the mirror angle', () => {
    const { balls } = simulate([ball(0, 1.0, 0.4)], -Math.PI / 4, 0.08, { follow: 0, side: 0 });
    expect(balls[0].on).toBe(true);
    expect(balls[0].y).toBeGreaterThan(R);
  });
  it('a ball rolled at a pocket drops, and stays inside the table otherwise', () => {
    const p = POCKETS[0], start = ball(0, 0.4, 0.4);
    const ang = Math.atan2(p.y - start.y, p.x - start.x);
    const { ev } = simulate([start], ang, 0.2, { follow: 0, side: 0 });
    expect(ev.pocketed).toEqual([0]);
    const { balls } = simulate([ball(0, W / 2, H / 2)], 0.3, 1, { follow: 0, side: 0 });
    const b = balls[0];
    if (b.on) { expect(b.x).toBeGreaterThanOrEqual(R - 1e-6); expect(b.x).toBeLessThanOrEqual(W - R + 1e-6); }
  });
  it('follow sends the cue ball on after a full hit, draw brings it back', () => {
    const mk = () => [ball(0, 0.6, H / 2), ball(1, 0.9, H / 2)];
    const f = simulate(mk(), 0, 0.12, { follow: 0.8, side: 0 }).balls[0].x;
    const d = simulate(mk(), 0, 0.12, { follow: -0.8, side: 0 }).balls[0].x;
    expect(f).toBeGreaterThan(0.95);
    expect(d).toBeLessThan(0.6);
  });
});

describe('8-ball and 9-ball rules', () => {
  const t8 = (): Table => ({ ...newTable('8ball', mulberry32(2)), isBreak: false, ballInHand: false });
  it('racks 15 balls for 8-ball with the 8 in the middle, and 9 for 9-ball', () => {
    const r8 = rack('8ball', mulberry32(3));
    expect(r8).toHaveLength(16);
    const eight = r8.find(b => b.id === 8)!;
    expect(eight.x).toBeCloseTo(W * 0.75 + 2 * (Math.sqrt(3) * R + 0.0004), 5);
    expect(rack('9ball')).toHaveLength(10);
  });
  it('scratching is a foul and gives ball in hand', () => {
    const t = t8(), after = cloneBalls(t.balls);
    after[0].on = false;
    const r = judge(t, after, { ...newEvents(), firstHit: 1, pocketed: [0], railAfterHit: true });
    expect(r.foul).toBe('scratch');
    expect(r.ballInHand).toBe(true);
    expect(r.turn).toBe(1);
  });
  it('the first ball pocketed on an open table sets the groups, and the shooter continues', () => {
    const t = t8(), after = cloneBalls(t.balls);
    after.find(b => b.id === 11)!.on = false;
    const r = judge(t, after, { ...newEvents(), firstHit: 11, pocketed: [11], railAfterHit: true });
    expect(r.groups).toEqual(['stripes', 'solids']);
    expect(r.turn).toBe(0);
  });
  it('hitting the other group first is a foul; no rail after contact is a foul', () => {
    const t: Table = { ...t8(), groups: ['solids', 'stripes'] };
    expect(judge(t, cloneBalls(t.balls), { ...newEvents(), firstHit: 12, railAfterHit: true }).foul).toBe('wrongball');
    expect(judge(t, cloneBalls(t.balls), { ...newEvents(), firstHit: 2, railAfterHit: false }).foul).toBe('norail');
    expect(legalTargets(t).every(id => id < 8)).toBe(true);
  });
  it('the 8 wins only after clearing your group; early it loses', () => {
    const t: Table = { ...t8(), groups: ['solids', 'stripes'] };
    const early = cloneBalls(t.balls); early.find(b => b.id === 8)!.on = false;
    expect(judge(t, early, { ...newEvents(), firstHit: 8, pocketed: [8], railAfterHit: true }).winner).toBe(1);
    const cleared: Table = { ...t, balls: t.balls.map(b => (b.id >= 1 && b.id <= 7 ? { ...b, on: false } : b)) };
    expect(legalTargets(cleared)).toEqual([8]);
    const after = cloneBalls(cleared.balls); after.find(b => b.id === 8)!.on = false;
    expect(judge(cleared, after, { ...newEvents(), firstHit: 8, pocketed: [8], railAfterHit: true }).winner).toBe(0);
  });
  it('9-ball: hit the lowest ball first; the 9 wins on a legal shot and is respotted on a foul', () => {
    const t: Table = { ...newTable('9ball', mulberry32(4)), isBreak: false, ballInHand: false };
    expect(legalTargets(t)).toEqual([1]);
    const after = cloneBalls(t.balls); after.find(b => b.id === 9)!.on = false;
    expect(judge(t, after, { ...newEvents(), firstHit: 1, pocketed: [9], railAfterHit: true }).winner).toBe(0);
    const foul = judge(t, cloneBalls(after), { ...newEvents(), firstHit: 4, pocketed: [9], railAfterHit: true });
    expect(foul.winner).toBe(-1);
    expect(foul.balls.find(b => b.id === 9)!.on).toBe(true);
    expect(foul.ballInHand).toBe(true);
  });
});

describe('billiards AI', () => {
  it('finds straight pots and the expert sinks an easy one', () => {
    const balls = [ball(0, 1.0, 0.5), ball(1, 1.6, 0.5), ...[2, 3, 4, 5, 6, 7, 8, 9].map((id, k) => ball(id, 0.3 + k * 0.05, 1.15))];
    const t: Table = { ...newTable('9ball'), balls, isBreak: false, ballInHand: false };
    expect(candidates(t).length).toBeGreaterThan(0);
    let pots = 0;
    for (let s = 0; s < 5; s++) {
      const shot = chooseShot(t, 4, mulberry32(s));
      const { ev } = simulate(t.balls, shot.angle, shot.power, shot.spin);
      if (ev.pocketed.includes(1) && !ev.pocketed.includes(0)) pots++;
    }
    expect(pots).toBeGreaterThanOrEqual(4);
  });
});
