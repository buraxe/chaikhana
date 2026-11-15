import { describe, expect, it } from 'vitest';
import { answers, distance, generate, isTrue, neighbours, parse, show } from './matchstick/rules';
import * as AH from './air-hockey/physics';
import * as TT from './table-tennis/physics';

const seeded = (s: number) => () => (s = (s * 16807) % 2147483647) / 2147483647;

describe('matchstick', () => {
  it('reads and checks sums', () => {
    expect(isTrue(parse('3+4=7'))).toBe(true);
    expect(isTrue(parse('3+4=8'))).toBe(false);
    expect(isTrue(parse('12-5=7'))).toBe(true);
    expect(show(parse('9-5=4'))).toBe('9-5=4');
  });
  it('one match turns 6 into 0, 9 or 5-and-back but not into 1', () => {
    const from6 = neighbours(parse('6+0=6')).map(show);
    expect(from6).toContain('9+0=6');
    expect(from6).not.toContain('1+0=6');
  });
  it('every puzzle needs exactly its number of moves and has an answer', () => {
    for (const k of [1, 2] as const) for (const lv of ['easy', 'hard'] as const) for (let i = 0; i < 5; i++) {
      const p = generate(k, lv, seeded(1 + i + k * 10));
      expect(isTrue(parse(p.start))).toBe(false);
      expect(distance(parse(p.start), k)).toBe(k);
      expect(answers(parse(p.start), k).length).toBeGreaterThan(0);
    }
  });
});

describe('air hockey', () => {
  /** Two computer players against each other for a while. */
  function play(l1: number, l2: number, seed: number) {
    const rnd = seeded(seed), t = AH.newTable(1), dt = 1 / 60;
    const mirror = (v: AH.V2): AH.V2 => ({ x: AH.W - v.x, y: AH.H - v.y });
    let goals = 0, out = 0; const clock = [0, 0]; let targets: AH.V2[] = [t.m[0], t.m[1]];
    for (let i = 0; i < 60 * 600 && !t.winner; i++) {
      // Player 1 plays as a mirrored computer.
      const flipped: AH.Table = { ...t, puck: mirror(t.puck), pv: { x: -t.pv.x, y: -t.pv.y }, m: [mirror(t.m[1]), mirror(t.m[0])], mv: [t.mv[1], t.mv[0]] };
      // Each side looks again only after its reaction time, as in the game.
      for (const k of [0, 1] as const) { clock[k] -= dt; if (clock[k] <= 0) { clock[k] = AH.LEVELS[k === 0 ? l1 : l2].react; targets[k] = k === 0 ? mirror(AH.aiTarget(flipped, l1, rnd)) : AH.aiTarget(t, l2, rnd); } }
      targets = targets.slice();
      for (const k of [0, 1] as const) {
        const lv = k === 0 ? l1 : l2, sp = k === 0 ? AH.aiSpeed(flipped, l1) : AH.aiSpeed(t, l2), m = t.m[k], c = AH.clampMallet(targets[k], k), dx = c.x - m.x, dy = c.y - m.y, d = Math.hypot(dx, dy), s = Math.min(d, sp * dt); void lv;
        const n = d ? { x: m.x + dx / d * s, y: m.y + dy / d * s } : m; t.mv[k] = { x: (n.x - m.x) / dt, y: (n.y - m.y) / dt }; t.m[k] = n;
      }
      const before = t.score[0] + t.score[1];
      AH.step(t, dt);
      if (t.score[0] + t.score[1] !== before) goals++;
      if (t.puck.x < 0 || t.puck.x > AH.W) out++;
    }
    return { t, goals, out };
  }
  it('goals are scored and the puck never leaves the table sideways', () => {
    const r = play(2, 2, 3);
    expect(r.goals).toBeGreaterThan(2);
    expect(r.out).toBe(0);
  });
  it('the computer gets a resting puck out of its corners and off its end wall', () => {
    for (const lv of [0, 2, 4]) for (const spot of [{ x: AH.PR, y: AH.PR }, { x: AH.W - AH.PR, y: AH.PR }, { x: AH.W / 2 + 0.25, y: AH.PR }, { x: AH.PR, y: 0.4 }]) {
      const rnd = seeded(lv * 13 + Math.round(spot.x * 100)), t = AH.newTable(2); t.pause = 0; t.puck = { ...spot }; t.pv = { x: 0, y: 0 };
      t.m[0] = { x: AH.W / 2, y: AH.H - 0.1 };
      let target = t.m[1], clock = 0, stuck = 0, back = 0, freed = false;
      for (let i = 0; i < 60 * 6 && !freed; i++) {
        const dt = 1 / 60; clock -= dt;
        stuck = AH.aiStuck(t, stuck, dt); if (stuck > 1.1) { back = 0.6; stuck = 0; }
        if (back > 0) { back -= dt; target = { x: AH.W / 2, y: 0.1 }; } else if (clock <= 0) { clock = AH.LEVELS[lv].react; target = AH.aiTarget(t, lv, rnd); }
        const m = t.m[1], c = AH.clampMallet(target, 1), dx = c.x - m.x, dy = c.y - m.y, d = Math.hypot(dx, dy), st = Math.min(d, AH.aiSpeed(t, lv) * dt);
        const n = d ? { x: m.x + dx / d * st, y: m.y + dy / d * st } : m; t.mv[1] = { x: (n.x - m.x) / dt, y: (n.y - m.y) / dt }; t.m[1] = n;
        AH.step(t, dt);
        if (t.puck.y > AH.H / 2 || t.score[0] + t.score[1] > 0) freed = true;
      }
      expect(freed, `level ${lv} at ${spot.x.toFixed(2)},${spot.y.toFixed(2)}`).toBe(true);
    }
  });
  it('the expert beats the beginner', () => {
    let wins = 0;
    for (let s = 1; s <= 3; s++) { const r = play(0, 4, s * 7); if (r.t.winner === 2 || r.t.score[1] > r.t.score[0]) wins++; }
    expect(wins).toBeGreaterThanOrEqual(2);
  });
});

describe('table tennis', () => {
  function match(l1: number, l2: number, seed: number) {
    const rnd = seeded(seed), g = TT.newGame(1), dt = 1 / 60, off = [0, 0];
    let lastHitter = -1, hits = 0, wait = 0;
    for (let i = 0; i < 60 * 60 * 20 && !g.winner; i++) {
      if (g.phase === 'serve') { wait += dt; if (wait > 0.5) { TT.serve(g, rnd); wait = 0; } }
      if (g.hitter !== lastHitter) { lastHitter = g.hitter; for (const k of [0, 1]) off[k] = (rnd() * 2 - 1) * TT.LEVELS[k === 0 ? l1 : l2].reach; }
      for (const k of [0, 1] as const) {
        const L = TT.LEVELS[k === 0 ? l1 : l2], a = TT.aiTarget(g, k), tg = TT.clampPaddle({ x: a.x, y: a.y + off[k] }, k), p = g.p[k];
        const dx = tg.x - p.x, dy = tg.y - p.y, d = Math.hypot(dx, dy), m = Math.min(d, L.speed * dt * TT.SLOW);
        if (d) g.p[k] = { x: p.x + dx / d * m, y: p.y + dy / d * m };
        g.pz[k] = TT.clampZ(a.z);
        if (TT.canHit(g, k) && TT.atStrikingPoint(g, k)) { TT.strike(g, k, L.pace, rnd() * 0.4, L.err, rnd, true, (rnd() - 0.5) * 0.8); hits++; }
      }
      TT.step(g, dt * TT.SLOW);
    }
    return { g, hits };
  }
  it('a legal serve bounces on each side once', () => {
    for (const server of [1, 2] as const) {
      const g = TT.newGame(server); TT.serve(g, seeded(4));
      const sides: number[] = [];
      for (let i = 0; i < 400 && sides.length < 2; i++) { const b = g.bounces.slice(); TT.step(g, 1 / 240); if (g.bounces[0] !== b[0] || g.bounces[1] !== b[1] || (!g.serving && sides.length === 1)) { if (g.bounces[0] > b[0]) sides.push(1); if (g.bounces[1] > b[1]) sides.push(2); } }
      expect(sides[0]).toBe(server);
      expect(g.phase).toBe('rally');
    }
  });
  it('games finish by the rules, and the serve rotates every two points', () => {
    const { g, hits } = match(2, 2, 11);
    expect(g.winner).not.toBe(0);
    const [a, b] = g.score;
    expect(Math.max(a, b)).toBeGreaterThanOrEqual(11);
    expect(Math.abs(a - b)).toBeGreaterThanOrEqual(2);
    expect(hits).toBeGreaterThan(20);
    expect(TT.serverAfter(1, [1, 0])).toBe(1);
    expect(TT.serverAfter(1, [1, 1])).toBe(2);
    expect(TT.serverAfter(1, [10, 10])).toBe(1);
    expect(TT.serverAfter(1, [11, 10])).toBe(2);
  });
  it('the expert beats the beginner', () => {
    expect(match(0, 4, 5).g.winner).toBe(2);
  });
  it('balls aimed across the table land on it', () => {
    const lateral = TT.newGame(1); lateral.phase = 'rally'; lateral.ball = { x: 0.05, y: 0.25 };
    TT.strike(lateral, 0, 0.5, 0, 0, () => 0.5, true, 0.6);
    for (let i = 0; i < 400 && lateral.bounces[1] === 0 && lateral.phase === 'rally'; i++) TT.step(lateral, 1 / 240);
    expect(lateral.bounces[1]).toBe(1);
    expect(Math.abs(lateral.bz - 0.6)).toBeLessThan(0.05);
  });
});
