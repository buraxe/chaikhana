/**
 * 8-ball and 9-ball rules, simplified from the WPA rules: no called pockets, no push-out,
 * no three-foul rule. A foul gives the opponent ball in hand anywhere on the table.
 */
import { free, H, R, W, type Ball, type ShotEvents } from './physics';

export type Mode = '8ball' | '9ball' | 'practice';
export type Group = 'solids' | 'stripes' | null;
export interface Table {
  mode: Mode; balls: Ball[]; turn: 0 | 1; groups: [Group, Group]; ballInHand: boolean; behindLine: boolean;
  isBreak: boolean; winner: -1 | 0 | 1; message: string; foul: string; shots: number;
}
export const FOOT = { x: W * 0.75, y: H / 2 }, HEAD_X = W * 0.25;
export const groupOf = (id: number): Group => (id >= 1 && id <= 7 ? 'solids' : id >= 9 && id <= 15 ? 'stripes' : null);

export function rack(mode: Mode, rng: () => number = Math.random): Ball[] {
  const balls: Ball[] = [{ id: 0, x: HEAD_X, y: H / 2, vx: 0, vy: 0, on: true }];
  const dx = Math.sqrt(3) * R + 0.0004, dy = R + 0.0002;
  const spot = (row: number, col: number) => ({ x: FOOT.x + row * dx, y: FOOT.y + (col - row / 2) * 2 * dy });
  if (mode === '9ball') {
    const shape = [[0, 0], [1, 0], [1, 1], [2, 0], [2, 1], [2, 2], [3, 0], [3, 1], [4, 0]];
    const order = [2, 3, 4, 5, 6, 7, 8].sort(() => rng() - 0.5);
    shape.forEach(([r, c], k) => {
      const id = k === 0 ? 1 : k === 4 ? 9 : order.pop()!;
      const p = spot(r, r === 3 ? c + 0.5 : r === 4 ? c + 1 : c);
      balls.push({ id, ...p, vx: 0, vy: 0, on: true });
    });
    return balls;
  }
  // 8-ball: the 8 in the middle of the third row, a solid and a stripe in the back corners.
  const others = [1, 2, 3, 4, 5, 6, 7, 9, 10, 11, 12, 13, 14, 15].sort(() => rng() - 0.5);
  const solid = others.splice(others.findIndex(i => i < 8), 1)[0], stripe = others.splice(others.findIndex(i => i > 8), 1)[0];
  for (let r = 0; r < 5; r++) for (let c = 0; c <= r; c++) {
    const id = r === 2 && c === 1 ? 8 : r === 4 && c === 0 ? solid : r === 4 && c === 4 ? stripe : others.pop()!;
    balls.push({ id, ...spot(r, c), vx: 0, vy: 0, on: true });
  }
  return balls;
}
export function newTable(mode: Mode, rng?: () => number): Table {
  return { mode, balls: rack(mode, rng), turn: 0, groups: [null, null], ballInHand: true, behindLine: true, isBreak: mode !== 'practice', winner: -1, message: '', foul: '', shots: 0 };
}
const onTable = (t: Table, id: number) => t.balls.some(b => b.id === id && b.on);
const groupCleared = (t: Table, g: Group) => !!g && !t.balls.some(b => b.on && groupOf(b.id) === g);
/** Which balls the shooter may hit first. */
export function legalTargets(t: Table): number[] {
  const live = t.balls.filter(b => b.on && b.id !== 0).map(b => b.id);
  if (t.mode === '9ball') return [Math.min(...live)];
  if (t.mode === 'practice') return live;
  const g = t.groups[t.turn];
  if (!g) return live.filter(id => id !== 8);
  return groupCleared(t, g) ? [8] : live.filter(id => groupOf(id) === g);
}
/** Puts a ball back on the foot spot, or the nearest free point behind it. */
export function respot(balls: Ball[], id: number) {
  const b = balls.find(x => x.id === id)!;
  for (let k = 0; k < 200; k++) {
    const x = FOOT.x + k * 0.005;
    if (free(balls, x, FOOT.y, id)) { Object.assign(b, { x, y: FOOT.y, vx: 0, vy: 0, on: true }); return; }
  }
}

/** Applies the rules to a finished shot. `after` is the ball state when everything stopped. */
export function judge(t: Table, after: Ball[], ev: ShotEvents): Table {
  const n: Table = { ...t, balls: after, ballInHand: false, behindLine: false, isBreak: false, foul: '', message: '', shots: t.shots + 1 };
  const me = t.turn, other = (1 - me) as 0 | 1;
  const potted = ev.pocketed.filter(id => id !== 0), scratch = ev.pocketed.includes(0);
  if (t.mode === 'practice') {
    if (scratch) { n.ballInHand = true; n.message = 'scratch'; }
    return n;
  }
  const targets = legalTargets(t);
  let foul = '';
  if (scratch) foul = 'scratch';
  else if (ev.firstHit < 0) foul = 'nohit';
  else if (!t.isBreak && !targets.includes(ev.firstHit)) foul = 'wrongball';
  else if (!t.isBreak && !potted.length && !ev.railAfterHit) foul = 'norail';
  if (scratch) { const cue = n.balls.find(b => b.id === 0)!; cue.on = true; cue.x = HEAD_X; cue.y = H / 2; }

  if (t.mode === '9ball') {
    if (potted.includes(9)) {
      if (!foul) { n.winner = me; n.message = 'nine'; return n; }
      respot(n.balls, 9);
    }
    n.foul = foul;
    if (foul) { n.turn = other; n.ballInHand = true; return n; }
    if (!potted.length) n.turn = other;
    return n;
  }

  // 8-ball
  const myGroup = t.groups[me];
  if (potted.includes(8)) {
    if (t.isBreak) { respot(n.balls, 8); n.message = 'eightspot'; }
    else {
      const legal = !foul && myGroup && groupCleared({ ...t, balls: t.balls }, myGroup) && targets.includes(8);
      n.winner = legal ? me : other;
      n.message = legal ? 'eightwin' : 'eightlose';
      return n;
    }
  }
  if (!myGroup && !t.isBreak && !foul) {
    const kinds = potted.map(groupOf).filter(Boolean) as ('solids' | 'stripes')[];
    if (kinds.length) {
      const g = kinds[0];
      n.groups = me === 0 ? [g, g === 'solids' ? 'stripes' : 'solids'] : [g === 'solids' ? 'stripes' : 'solids', g];
      n.message = 'assigned';
    }
  }
  n.foul = foul;
  if (foul) { n.turn = other; n.ballInHand = true; return n; }
  const g = n.groups[me];
  const scored = g ? potted.some(id => groupOf(id) === g) : potted.some(id => id !== 8);
  if (!scored) n.turn = other;
  return n;
}
export { onTable };
