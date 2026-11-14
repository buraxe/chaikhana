/**
 * The workshop engine: plays any game written as a definition (materials, zones and
 * "when this happens, if that holds, do these" rules). Definitions are plain JSON, so they
 * can be shared safely: nothing in them runs as code, every block is interpreted here.
 *
 * The block tables (EXPRS, ACTS) list every block with its inputs. They drive validation
 * now and the visual block editor later.
 */

// ───────────────────────────── Definition ─────────────────────────────

export type Text = string | { en: string; zh?: string; tr?: string };
export type Val = number | string | boolean;
export type Expr = Val | { op: string; [k: string]: unknown };
export interface Act { op: string; [k: string]: unknown }

export type EventName = 'start' | 'turn' | 'click' | 'move' | 'roll' | 'card' | 'zone' | 'button' | 'enter' | 'after' | 'blocked';
export interface Rule {
  on: EventName;
  name?: Text;
  /** click / enter: only cells of this type. */
  cellType?: string;
  /** card / zone: only this zone. */
  zone?: string;
  /** button: which button. */
  button?: string;
  /** card: the card is played onto a cell, chosen after the card ("get cell"). */
  target?: 'cell';
  /** move: how far a piece can go at most (cells), so the computer need not try the whole board. */
  reach?: number;
  /** move: any piece may be moved, not only the player's own. */
  anyPiece?: boolean;
  when?: Expr;
  do: Act[];
}

export interface CellType { name: Text; color: string; label?: string }
export interface Mark { cell: number; type?: string; props?: Record<string, number> }
export interface BoardDef {
  w: number; h: number;
  /** square cells, or hexagons laid out as a rhombus (each row shifted half a cell to the right). */
  grid?: 'square' | 'hex';
  /** Squares alternate light and dark. */
  checker?: boolean;
  types?: Record<string, CellType>;
  /** Cells with a type or numbers attached. Type '#' makes a hole that is not part of the board. */
  marks?: Mark[];
  /** The order of a race track: 'rows' (reading order), 'snake' (from the bottom left, turning at each end) or explicit cells. */
  path?: 'rows' | 'snake' | number[];
  showPath?: boolean;
  /** Draw an arrow from each cell that has a "to" number to that cell (ladders, snakes, slides). */
  links?: boolean;
}
export interface PieceDef { name: Text; shape: 'disc' | 'square' | 'pawn' | 'star' | 'ring' | 'text'; label?: string; color?: string }
export interface CardsDef {
  /** Each field and its values; the deck is every combination, `copies` times over. */
  fields: Record<string, (string | number)[]>;
  copies?: number;
  /** Which field colours the card, and the colour of each value. */
  color?: { field: string; map: Record<string, string> };
  /** What the card shows, e.g. "{n}" or "{rank}{suit}". */
  label: string;
}
export interface ZoneDef { name: Text; owner: 'each' | 'shared'; show: 'all' | 'owner' | 'count' | 'top' }
export interface VarDef { name: Text; per: 'player' | 'game'; init: number; show?: boolean }

export interface GameDef {
  format: 'chaikhana-game';
  version: 1;
  id: string;
  name: Text;
  about?: Text;
  kind: 'puzzle' | 'game';
  players: { min: number; max: number; colors?: string[]; names?: Text[] };
  /** auto: the turn passes after each action unless a rule says "again"; manual: only on "end turn". */
  turns?: 'auto' | 'manual';
  board?: BoardDef;
  pieces?: Record<string, PieceDef>;
  cards?: CardsDef;
  zones?: Record<string, ZoneDef>;
  dice?: { count: number; faces: number };
  vars?: Record<string, VarDef>;
  buttons?: Record<string, { name: Text }>;
  rules: Rule[];
}

// ───────────────────────────── Block tables ─────────────────────────────

/** Input kinds: e expression, a list of actions, and names of things the definition declares. */
export type Arg = 'e' | 'a' | 'piece' | 'zone' | 'var' | 'name' | 'text';
export interface Spec { args: Record<string, Arg>; opt?: string[]; out?: 'n' | 'b' | 's' | 'c' }

const AB = { a: 'e', b: 'e' } as const;
export const EXPRS: Record<string, Spec> = {
  get: { args: { name: 'name' } },
  step: { args: { cell: 'e', dir: 'e', n: 'e' }, opt: ['n'], out: 'c' }, dirs: { args: {}, out: 'n' }, adjacent: { args: AB, out: 'b' },
  value: { args: { cell: 'e' }, out: 'n' },
  flank: { args: { cell: 'e', dir: 'e' }, out: 'n' },
  run: { args: { cell: 'e', dir: 'e', owner: 'e' }, opt: ['owner'], out: 'n' },
  around: { args: { cell: 'e', piece: 'piece', owner: 'e' }, opt: ['piece', 'owner'], out: 'n' },
  connects: { args: { owner: 'e', a: 'name', b: 'name' }, out: 'b' },
  anyDir: { args: { test: 'e', orth: 'e' }, opt: ['orth'], out: 'b' },
  sumDirs: { args: { value: 'e', orth: 'e' }, opt: ['orth'], out: 'n' },
  round: { args: {}, out: 'n' }, plies: { args: {}, out: 'n' },
  me: { args: {}, out: 'n' }, next: { args: { player: 'e' }, opt: ['player'], out: 'n' }, players: { args: {}, out: 'n' },
  add: { args: AB, out: 'n' }, sub: { args: AB, out: 'n' }, mul: { args: AB, out: 'n' }, div: { args: AB, out: 'n' }, mod: { args: AB, out: 'n' },
  min: { args: AB, out: 'n' }, max: { args: AB, out: 'n' }, abs: { args: { a: 'e' }, out: 'n' },
  eq: { args: AB, out: 'b' }, ne: { args: AB, out: 'b' }, lt: { args: AB, out: 'b' }, le: { args: AB, out: 'b' }, gt: { args: AB, out: 'b' }, ge: { args: AB, out: 'b' },
  and: { args: AB, out: 'b' }, or: { args: AB, out: 'b' }, not: { args: { a: 'e' }, out: 'b' },
  if: { args: { test: 'e', then: 'e', else: 'e' } },
  var: { args: { var: 'var', player: 'e' }, opt: ['player'], out: 'n' },
  empty: { args: { cell: 'e' }, out: 'b' }, piece: { args: { cell: 'e' }, out: 's' }, owner: { args: { cell: 'e' }, out: 'n' }, height: { args: { cell: 'e' }, out: 'n' },
  type: { args: { cell: 'e' }, out: 's' }, prop: { args: { cell: 'e', name: 'name' }, out: 'n' },
  row: { args: { cell: 'e' }, out: 'n' }, col: { args: { cell: 'e' }, out: 'n' }, cellAt: { args: { row: 'e', col: 'e' }, out: 'c' },
  offset: { args: { cell: 'e', dr: 'e', dc: 'e' }, out: 'c' },
  dist: { args: AB, out: 'n' }, dr: { args: AB, out: 'n' }, dc: { args: AB, out: 'n' }, between: { args: AB, out: 'c' },
  line: { args: { cell: 'e', n: 'e' }, out: 'b' },
  count: { args: { piece: 'piece', owner: 'e' }, opt: ['piece', 'owner'], out: 'n' },
  full: { args: {}, out: 'b' },
  find: { args: { piece: 'piece', owner: 'e' }, opt: ['owner'], out: 'c' },
  pathPos: { args: { cell: 'e' }, out: 'n' }, pathCell: { args: { pos: 'e' }, out: 'c' }, pathLen: { args: {}, out: 'n' },
  lowest: { args: { col: 'e' }, out: 'c' },
  die: { args: { i: 'e' }, out: 'n' }, sum: { args: {}, out: 'n' }, rolled: { args: {}, out: 'b' },
  field: { args: { card: 'e', name: 'name' } },
  top: { args: { zone: 'zone', player: 'e' }, opt: ['player'], out: 'n' },
  size: { args: { zone: 'zone', player: 'e' }, opt: ['player'], out: 'n' },
};
export const ACTS: Record<string, Spec> = {
  place: { args: { piece: 'piece', cell: 'e', owner: 'e', value: 'e' }, opt: ['owner', 'value'] },
  forDirs: { args: { do: 'a', orth: 'e' }, opt: ['orth'] },
  while: { args: { test: 'e', do: 'a' } },
  winBest: { args: { score: 'e', low: 'e' }, opt: ['low'] },
  remove: { args: { cell: 'e' } },
  move: { args: { from: 'e', to: 'e', owner: 'e' }, opt: ['owner'] },
  setOwner: { args: { cell: 'e', owner: 'e' } },
  set: { args: { var: 'var', player: 'e', value: 'e' }, opt: ['player'] },
  change: { args: { var: 'var', player: 'e', value: 'e' }, opt: ['player'] },
  roll: { args: {} },
  win: { args: { player: 'e' }, opt: ['player'] }, lose: { args: { player: 'e' }, opt: ['player'] }, draw: { args: {} },
  end: { args: {} }, again: { args: {} },
  if: { args: { test: 'e', then: 'a', else: 'a' }, opt: ['else'] },
  repeat: { args: { times: 'e', do: 'a' } },
  forCells: { args: { where: 'e', do: 'a' }, opt: ['where'] },
  forPlayers: { args: { do: 'a' } },
  let: { args: { name: 'name', value: 'e' } },
  fill: { args: { zone: 'zone', player: 'e' }, opt: ['player'] },
  shuffle: { args: { zone: 'zone', player: 'e' }, opt: ['player'] },
  deal: { args: { from: 'zone', to: 'zone', count: 'e', fromPlayer: 'e', toPlayer: 'e', each: 'e' }, opt: ['count', 'fromPlayer', 'toPlayer', 'each'] },
  moveCard: { args: { card: 'e', to: 'zone', player: 'e' }, opt: ['player'] },
  say: { args: { text: 'text' } },
};
const EVENTS: EventName[] = ['start', 'turn', 'click', 'move', 'roll', 'card', 'zone', 'button', 'enter', 'after', 'blocked'];
/** What each event makes available to its rule through "get". */
export const BINDINGS: Record<EventName, string[]> = {
  start: [], turn: [], click: ['cell'], move: ['from', 'to'], roll: [], card: ['card', 'zone', 'cell'], zone: ['zone'], button: ['button'], enter: ['cell', 'from', 'who'], after: [], blocked: [],
};

// ───────────────────────────── State ─────────────────────────────

export interface Piece { t: string; o: number; v?: number }
export interface GState {
  players: number;
  turn: number;
  seed: number;
  /** Each cell holds a stack of pieces; the last is on top. */
  board: Piece[][];
  /** Card ids in each zone, last on top. Shared zones by name, own zones as "name@player". */
  zones: Record<string, number[]>;
  vars: Record<string, number[]>;
  dice: number[];
  rolled: boolean;
  again: boolean;
  endNow: boolean;
  over: null | { winner: number; stuck?: boolean };
  msg: Text | null;
  error: string | null;
  plies: number;
  /** Completed rounds: goes up each time play comes back to the first player. */
  round: number;
  last: number[];
}
export type Input =
  | { k: 'click'; cell: number }
  | { k: 'move'; from: number; to: number }
  | { k: 'roll' }
  | { k: 'card'; card: number; zone: string; cell?: number }
  | { k: 'zone'; zone: string }
  | { k: 'button'; id: string };

export const inputKey = (i: Input): string =>
  i.k === 'click' ? 'c' + i.cell : i.k === 'move' ? `m${i.from}-${i.to}` : i.k === 'roll' ? 'r' : i.k === 'card' ? `k${i.card}` + (i.cell === undefined ? '' : '@' + i.cell) : i.k === 'zone' ? 'z' + i.zone : 'b' + i.id;

// ───────────────────────────── Compiled definition ─────────────────────────────

interface Compiled {
  cells: number; w: number; h: number; hex: boolean;
  type: string[]; props: Record<string, number>[]; hole: boolean[];
  path: number[]; pathPos: Int32Array;
  cards: Record<string, string | number>[];
  byEvent: Record<EventName, Rule[]>;
}
const CACHE = new WeakMap<GameDef, Compiled>();
export function compile(def: GameDef): Compiled {
  const hit = CACHE.get(def);
  if (hit) return hit;
  const w = def.board?.w ?? 0, h = def.board?.h ?? 0, cells = w * h;
  const type = Array<string>(cells).fill(''), props: Record<string, number>[] = Array.from({ length: cells }, () => ({})), hole = Array<boolean>(cells).fill(false);
  for (const m of def.board?.marks ?? []) {
    if (m.cell < 0 || m.cell >= cells) continue;
    if (m.type) { type[m.cell] = m.type; if (m.type === '#') hole[m.cell] = true; }
    if (m.props) Object.assign(props[m.cell], m.props);
  }
  let path: number[] = [];
  const p = def.board?.path;
  if (Array.isArray(p)) path = p.filter(i => i >= 0 && i < cells);
  else if (p === 'snake') for (let r = h - 1, k = 0; r >= 0; r--, k++) for (let c = 0; c < w; c++) path.push(r * w + (k % 2 ? w - 1 - c : c));
  else for (let i = 0; i < cells; i++) path.push(i);
  path = path.filter(i => !hole[i]);
  const pathPos = new Int32Array(cells).fill(-1);
  path.forEach((c, i) => { pathPos[c] = i; });
  const cards: Record<string, string | number>[] = [];
  if (def.cards) {
    let combos: Record<string, string | number>[] = [{}];
    for (const [f, vals] of Object.entries(def.cards.fields)) combos = combos.flatMap(c => vals.map(v => ({ ...c, [f]: v })));
    for (let k = 0; k < (def.cards.copies ?? 1); k++) cards.push(...combos.map(c => ({ ...c })));
  }
  const byEvent = Object.fromEntries(EVENTS.map(e => [e, def.rules.filter(r => r.on === e)])) as Record<EventName, Rule[]>;
  const out = { cells, w, h, hex: def.board?.grid === 'hex', type, props, hole, path, pathPos, cards, byEvent };
  CACHE.set(def, out);
  return out;
}
export const cardsOf = (def: GameDef) => compile(def).cards;
export const pathOf = (def: GameDef) => compile(def).path;
export const cellTypeOf = (def: GameDef, i: number) => compile(def).type[i];
export const cellPropsOf = (def: GameDef, i: number) => compile(def).props[i];
export const isHole = (def: GameDef, i: number) => compile(def).hole[i];

export const zoneKey = (def: GameDef, zone: string, player: number) => (def.zones?.[zone]?.owner === 'each' ? `${zone}@${player}` : zone);
/** The zone name and its owner (-1 shared) from a key. */
export function zoneOfKey(key: string): [string, number] {
  const at = key.lastIndexOf('@');
  return at < 0 ? [key, -1] : [key.slice(0, at), Number(key.slice(at + 1))];
}

// ───────────────────────────── Interpreter ─────────────────────────────

const MAX_STEPS = 200_000, MAX_DEPTH = 24;
class GameError extends Error {}
interface Ctx { def: GameDef; c: Compiled; st: GState; b: Record<string, Val>; steps: { n: number }; depth: number; rule?: number }

/** What happened while an input was played: each rule looked at, and each action run, by its place in the rule. */
export type Trace =
  | { kind: 'rule'; rule: number; event: EventName; ran: boolean; why?: 'cellType' | 'zone' | 'button' | 'target' | 'when' | 'error' }
  | { kind: 'act'; rule: number; path: string; op: string };
let TRACE: Trace[] | null = null;
const MAX_TRACE = 400;
const note = (t: Trace) => { if (TRACE && TRACE.length < MAX_TRACE) TRACE.push(t); };

function rand(st: GState): number {
  st.seed = (st.seed + 0x6d2b79f5) >>> 0;
  let t = st.seed;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}
const num = (v: Val): number => (typeof v === 'number' ? v : typeof v === 'boolean' ? (v ? 1 : 0) : Number(v) || 0);
const truthy = (v: Val): boolean => (typeof v === 'string' ? v !== '' : !!v);
const valid = (x: Ctx, cell: number) => Number.isInteger(cell) && cell >= 0 && cell < x.c.cells && !x.c.hole[cell];

/** Directions: eight on squares (N, NE, E, SE, S, SW, W, NW; even ones are orthogonal), six on hexagons (E, SE, SW, W, NW, NE). */
export const SQ_DIRS = [[-1, 0], [-1, 1], [0, 1], [1, 1], [1, 0], [1, -1], [0, -1], [-1, -1]];
export const HEX_DIRS = [[0, 1], [1, 0], [1, -1], [0, -1], [-1, 0], [-1, 1]];
const dirsOf = (c: Compiled, orth = false) => (c.hex ? HEX_DIRS : orth ? SQ_DIRS.filter((_, i) => i % 2 === 0) : SQ_DIRS);
function stepCell(c: Compiled, cell: number, dir: number, n = 1): number {
  const ds = c.hex ? HEX_DIRS : SQ_DIRS, d = ds[((dir % ds.length) + ds.length) % ds.length];
  const r = Math.floor(cell / c.w) + d[0] * n, cc = (cell % c.w) + d[1] * n;
  return r >= 0 && cc >= 0 && r < c.h && cc < c.w && !c.hole[r * c.w + cc] ? r * c.w + cc : -1;
}
export function gridDist(c: Compiled, a: number, b: number): number {
  const dr = Math.floor(b / c.w) - Math.floor(a / c.w), dc = (b % c.w) - (a % c.w);
  return c.hex ? (Math.abs(dr) + Math.abs(dc) + Math.abs(dr + dc)) / 2 : Math.max(Math.abs(dr), Math.abs(dc));
}
const topOf = (st: GState, cell: number): Piece | undefined => st.board[cell]?.[st.board[cell].length - 1];

function playerArg(x: Ctx, node: Record<string, unknown>, key = 'player'): number {
  return node[key] === undefined ? x.st.turn : ((num(ev(x, node[key] as Expr)) % x.st.players) + x.st.players) % x.st.players;
}
function lineThrough(x: Ctx, cell: number, n: number): boolean {
  if (!valid(x, cell) || !x.st.board[cell].length) return false;
  const who = x.st.board[cell][x.st.board[cell].length - 1].o, w = x.c.w, r0 = Math.floor(cell / w), c0 = cell % w;
  const mine = (r: number, c: number) => {
    if (r < 0 || c < 0 || r >= x.c.h || c >= w) return false;
    const s = x.st.board[r * w + c];
    return !x.c.hole[r * w + c] && s.length > 0 && s[s.length - 1].o === who;
  };
  for (const [dr, dc] of x.c.hex ? [[0, 1], [1, 0], [1, -1]] : [[0, 1], [1, 0], [1, 1], [1, -1]]) {
    let k = 1;
    for (let s = 1; mine(r0 + dr * s, c0 + dc * s); s++) k++;
    for (let s = 1; mine(r0 - dr * s, c0 - dc * s); s++) k++;
    if (k >= n) return true;
  }
  return false;
}

export function ev(x: Ctx, e: Expr): Val {
  if (++x.steps.n > MAX_STEPS) throw new GameError('too many steps (a rule may loop forever)');
  if (typeof e !== 'object' || e === null) return e;
  const n = e as Record<string, unknown>, g = (k: string) => ev(x, n[k] as Expr), gn = (k: string) => num(g(k));
  const st = x.st, w = x.c.w;
  switch (n.op) {
    case 'get': { const v = x.b[String(n.name)]; return v === undefined ? -1 : v; }
    case 'me': return st.turn;
    case 'next': return ((n.player === undefined ? st.turn : gn('player')) + 1) % st.players;
    case 'players': return st.players;
    case 'add': return gn('a') + gn('b');
    case 'sub': return gn('a') - gn('b');
    case 'mul': return gn('a') * gn('b');
    case 'div': { const b = gn('b'); return b ? Math.floor(gn('a') / b) : 0; }
    case 'mod': { const b = gn('b'); return b ? ((gn('a') % b) + b) % b : 0; }
    case 'min': return Math.min(gn('a'), gn('b'));
    case 'max': return Math.max(gn('a'), gn('b'));
    case 'abs': return Math.abs(gn('a'));
    case 'eq': return g('a') == g('b'); // eslint-disable-line eqeqeq
    case 'ne': return g('a') != g('b'); // eslint-disable-line eqeqeq
    case 'lt': return gn('a') < gn('b');
    case 'le': return gn('a') <= gn('b');
    case 'gt': return gn('a') > gn('b');
    case 'ge': return gn('a') >= gn('b');
    case 'and': return truthy(g('a')) && truthy(g('b'));
    case 'or': return truthy(g('a')) || truthy(g('b'));
    case 'not': return !truthy(g('a'));
    case 'if': return truthy(g('test')) ? g('then') : g('else');
    case 'var': {
      const v = st.vars[String(n.var)];
      if (!v) return 0;
      return v.length === 1 ? v[0] : v[playerArg(x, n)];
    }
    case 'empty': { const c = gn('cell'); return valid(x, c) && st.board[c].length === 0; }
    case 'piece': { const c = gn('cell'); return valid(x, c) && st.board[c].length ? st.board[c][st.board[c].length - 1].t : ''; }
    case 'owner': { const c = gn('cell'); return valid(x, c) && st.board[c].length ? st.board[c][st.board[c].length - 1].o : -1; }
    case 'height': { const c = gn('cell'); return valid(x, c) ? st.board[c].length : 0; }
    case 'type': { const c = gn('cell'); return valid(x, c) ? x.c.type[c] : ''; }
    case 'prop': { const c = gn('cell'); return valid(x, c) ? x.c.props[c][String(n.name)] ?? 0 : 0; }
    case 'row': { const c = gn('cell'); return valid(x, c) ? Math.floor(c / w) : -1; }
    case 'col': { const c = gn('cell'); return valid(x, c) ? c % w : -1; }
    case 'cellAt': { const r = gn('row'), c = gn('col'); return r >= 0 && c >= 0 && r < x.c.h && c < w && !x.c.hole[r * w + c] ? r * w + c : -1; }
    case 'offset': {
      const c = gn('cell');
      if (!valid(x, c)) return -1;
      const r = Math.floor(c / w) + gn('dr'), cc = (c % w) + gn('dc');
      return r >= 0 && cc >= 0 && r < x.c.h && cc < w && !x.c.hole[r * w + cc] ? r * w + cc : -1;
    }
    case 'dist': case 'dr': case 'dc': {
      const a = gn('a'), b = gn('b');
      if (!valid(x, a) || !valid(x, b)) return n.op === 'dist' ? 999 : 0;
      const dr = Math.floor(b / w) - Math.floor(a / w), dc = (b % w) - (a % w);
      return n.op === 'dr' ? dr : n.op === 'dc' ? dc : gridDist(x.c, a, b);
    }
    case 'between': {
      const a = gn('a'), b = gn('b');
      if (!valid(x, a) || !valid(x, b)) return -1;
      const dr = Math.floor(b / w) - Math.floor(a / w), dc = (b % w) - (a % w);
      if ((dr === 0 && dc === 0) || dr % 2 || dc % 2 || !dirsOf(x.c).some(([p, q]) => p * 2 === dr && q * 2 === dc)) return -1;
      const m = a + (dr / 2) * w + dc / 2;
      return valid(x, m) ? m : -1;
    }
    case 'line': return lineThrough(x, gn('cell'), gn('n'));
    case 'step': { const c = gn('cell'); return valid(x, c) ? stepCell(x.c, c, gn('dir'), n.n === undefined ? 1 : gn('n')) : -1; }
    case 'dirs': return x.c.hex ? 6 : 8;
    case 'adjacent': { const a = gn('a'), b = gn('b'); return valid(x, a) && valid(x, b) && a !== b && dirsOf(x.c).some((_, d) => stepCell(x.c, a, x.c.hex ? d : d, 1) === b); }
    case 'value': { const c = gn('cell'); return valid(x, c) ? topOf(st, c)?.v ?? 0 : 0; }
    case 'flank': {
      const c = gn('cell'), d = gn('dir');
      if (!valid(x, c)) return 0;
      let k = 0, at = stepCell(x.c, c, d);
      while (at >= 0 && topOf(st, at) && topOf(st, at)!.o !== st.turn) { k++; at = stepCell(x.c, at, d); }
      return k > 0 && at >= 0 && topOf(st, at)?.o === st.turn ? k : 0;
    }
    case 'run': {
      const c = gn('cell'), d = gn('dir');
      if (!valid(x, c)) return 0;
      const who = n.owner === undefined ? topOf(st, c)?.o ?? st.turn : gn('owner');
      let k = 0;
      for (let at = stepCell(x.c, c, d); at >= 0 && topOf(st, at)?.o === who; at = stepCell(x.c, at, d)) k++;
      return k;
    }
    case 'around': {
      const c = gn('cell');
      if (!valid(x, c)) return 0;
      const t = n.piece === undefined ? null : String(n.piece), o = n.owner === undefined ? null : gn('owner');
      let k = 0;
      dirsOf(x.c).forEach((_, i) => {
        const at = stepCell(x.c, c, i), p = at >= 0 ? topOf(st, at) : undefined;
        if (p && (t === null || p.t === t) && (o === null || p.o === o)) k++;
      });
      return k;
    }
    case 'connects': {
      const who = gn('owner'), on = (side: string, i: number) => {
        const r = Math.floor(i / w), cc = i % w;
        return side === 'top' ? r === 0 : side === 'bottom' ? r === x.c.h - 1 : side === 'left' ? cc === 0 : side === 'right' ? cc === w - 1 : x.c.type[i] === side;
      };
      const mine = (i: number) => topOf(st, i)?.o === who, seen = new Uint8Array(x.c.cells), q: number[] = [];
      for (let i = 0; i < x.c.cells; i++) if (!x.c.hole[i] && mine(i) && on(String(n.a), i)) { seen[i] = 1; q.push(i); }
      const nd = x.c.hex ? 6 : 8;
      while (q.length) {
        const i = q.pop()!;
        if (on(String(n.b), i)) return true;
        for (let d = 0; d < nd; d += x.c.hex ? 1 : 2) { const j = stepCell(x.c, i, d); if (j >= 0 && !seen[j] && mine(j)) { seen[j] = 1; q.push(j); } }
      }
      return false;
    }
    case 'anyDir': case 'sumDirs': {
      const ds = dirsOf(x.c, n.orth !== undefined && truthy(g('orth'))), all = x.c.hex ? HEX_DIRS : SQ_DIRS;
      let acc = 0;
      for (const d of ds) {
        const v = ev({ ...x, b: { ...x.b, dir: all.indexOf(d) } }, (n.op === 'anyDir' ? n.test : n.value) as Expr);
        if (n.op === 'anyDir') { if (truthy(v)) return true; } else acc += num(v);
      }
      return n.op === 'anyDir' ? false : acc;
    }
    case 'round': return st.round;
    case 'plies': return st.plies;
    case 'count': {
      const t = n.piece === undefined ? null : String(n.piece), o = n.owner === undefined ? null : gn('owner');
      let k = 0;
      for (const s of st.board) for (const p of s) if ((t === null || p.t === t) && (o === null || p.o === o)) k++;
      return k;
    }
    case 'full': return st.board.every((s, i) => x.c.hole[i] || s.length > 0);
    case 'find': {
      const t = String(n.piece), o = n.owner === undefined ? st.turn : gn('owner');
      return st.board.findIndex(s => s.some(p => p.t === t && p.o === o));
    }
    case 'pathPos': { const c = gn('cell'); return valid(x, c) ? x.c.pathPos[c] : -1; }
    case 'pathCell': { const i = gn('pos'); return i >= 0 && i < x.c.path.length ? x.c.path[i] : -1; }
    case 'pathLen': return x.c.path.length;
    case 'lowest': {
      const c = gn('col');
      if (c < 0 || c >= w) return -1;
      for (let r = x.c.h - 1; r >= 0; r--) { const i = r * w + c; if (!x.c.hole[i] && st.board[i].length === 0) return i; }
      return -1;
    }
    case 'die': return st.dice[gn('i')] ?? 0;
    case 'sum': return st.dice.reduce((a, b) => a + b, 0);
    case 'rolled': return st.rolled;
    case 'field': { const k = gn('card'); return x.c.cards[k]?.[String(n.name)] ?? ''; }
    case 'top': { const z = st.zones[zoneKey(x.def, String(n.zone), playerArg(x, n))] ?? []; return z.length ? z[z.length - 1] : -1; }
    case 'size': return (st.zones[zoneKey(x.def, String(n.zone), playerArg(x, n))] ?? []).length;
    default: throw new GameError(`unknown block "${String(n.op)}"`);
  }
}

function enter(x: Ctx, cell: number, from: number, who: number) {
  if (x.depth >= MAX_DEPTH) return;
  const rules = x.c.byEvent.enter;
  if (!rules.length) return;
  const sub: Ctx = { ...x, b: { cell, from, who }, depth: x.depth + 1 };
  fire(sub, rules, cell);
}
function takeCard(st: GState, card: number) {
  for (const z of Object.values(st.zones)) { const i = z.indexOf(card); if (i >= 0) { z.splice(i, 1); return; } }
}

function run(x: Ctx, acts: unknown, path = 'do'): void {
  if (!Array.isArray(acts)) return;
  for (let ai = 0; ai < acts.length; ai++) {
    const a = acts[ai] as Act, here = `${path}.${ai}`;
    if (x.rule !== undefined) note({ kind: 'act', rule: x.rule, path: here, op: a.op });
    if (x.st.over) return;
    if (++x.steps.n > MAX_STEPS) throw new GameError('too many steps (a rule may loop forever)');
    const n = a as Record<string, unknown>, g = (k: string) => ev(x, n[k] as Expr), gn = (k: string) => num(g(k)), st = x.st;
    switch (a.op) {
      case 'place': {
        const c = gn('cell'), o = n.owner === undefined ? st.turn : gn('owner');
        if (!valid(x, c) || !x.def.pieces?.[String(n.piece)]) break;
        st.board[c].push(n.value === undefined ? { t: String(n.piece), o } : { t: String(n.piece), o, v: gn('value') });
        st.last.push(c);
        enter(x, c, -1, o);
        break;
      }
      case 'remove': { const c = gn('cell'); if (valid(x, c)) st.board[c].pop(); break; }
      case 'move': {
        const f = gn('from'), t = gn('to');
        if (!valid(x, f) || !valid(x, t) || f === t) break;
        const s = st.board[f];
        let i = s.length - 1;
        if (n.owner !== undefined) { const o = gn('owner'); while (i >= 0 && s[i].o !== o) i--; }
        if (i < 0) break;
        const [p] = s.splice(i, 1);
        st.board[t].push(p);
        st.last.push(f, t);
        enter(x, t, f, p.o);
        break;
      }
      case 'setOwner': { const c = gn('cell'); if (valid(x, c) && st.board[c].length) st.board[c][st.board[c].length - 1].o = gn('owner'); break; }
      case 'set': case 'change': {
        const v = st.vars[String(n.var)];
        if (!v) break;
        const i = v.length === 1 ? 0 : playerArg(x, n), val = gn('value');
        v[i] = a.op === 'set' ? val : v[i] + val;
        break;
      }
      case 'roll': {
        const d = x.def.dice ?? { count: 1, faces: 6 };
        st.dice = Array.from({ length: d.count }, () => 1 + Math.floor(rand(st) * d.faces));
        st.rolled = true;
        break;
      }
      case 'win': st.over = { winner: playerArg(x, n) }; break;
      case 'lose': { const p = playerArg(x, n); st.over = { winner: st.players === 1 ? -1 : (p + 1) % st.players }; break; }
      case 'draw': st.over = { winner: -1 }; break;
      case 'end': st.endNow = true; break;
      case 'again': st.again = true; break;
      case 'if': { const yes = truthy(g('test')); run(x, yes ? n.then : n.else, here + (yes ? '.then' : '.else')); break; }
      case 'repeat': { const k = Math.min(1000, gn('times')), was = x.b.i; for (let i = 1; i <= k && !st.over; i++) { x.b.i = i; run(x, n.do, here + '.do'); } x.b.i = was; break; }
      case 'while': { for (let k = 0; k < 1000 && !st.over && truthy(g('test')); k++) run(x, n.do, here + '.do'); break; }
      case 'forDirs': {
        const all = x.c.hex ? HEX_DIRS : SQ_DIRS, was = x.b.dir;
        for (const d of dirsOf(x.c, n.orth !== undefined && truthy(g('orth')))) { if (st.over) break; x.b.dir = all.indexOf(d); run(x, n.do, here + '.do'); }
        x.b.dir = was;
        break;
      }
      case 'winBest': {
        const scores = Array.from({ length: st.players }, (_, p) => num(ev({ ...x, b: { ...x.b, p } }, n.score as Expr)));
        const low = n.low !== undefined && truthy(g('low')), best = low ? Math.min(...scores) : Math.max(...scores);
        const top = scores.flatMap((v, p) => (v === best ? [p] : []));
        st.over = { winner: top.length === 1 ? top[0] : -1 };
        break;
      }
      case 'forCells':
        for (let c = 0; c < x.c.cells; c++) {
          if (x.c.hole[c]) continue;
          const inner: Ctx = { ...x, b: { ...x.b, it: c } };
          if (n.where === undefined || truthy(ev(inner, n.where as Expr))) run(inner, n.do, here + '.do');
          if (st.over) return;
        }
        break;
      case 'forPlayers':
        for (let p = 0; p < st.players && !st.over; p++) run({ ...x, b: { ...x.b, p } }, n.do, here + '.do');
        break;
      case 'let': x.b[String(n.name)] = g('value'); break;
      case 'fill': {
        const key = zoneKey(x.def, String(n.zone), playerArg(x, n));
        for (const z of Object.values(st.zones)) z.length = 0;
        const all = x.c.cards.map((_, i) => i);
        for (let i = all.length - 1; i > 0; i--) { const j = Math.floor(rand(st) * (i + 1)); [all[i], all[j]] = [all[j], all[i]]; }
        st.zones[key] = all;
        break;
      }
      case 'shuffle': {
        const z = st.zones[zoneKey(x.def, String(n.zone), playerArg(x, n))];
        if (z) for (let i = z.length - 1; i > 0; i--) { const j = Math.floor(rand(st) * (i + 1)); [z[i], z[j]] = [z[j], z[i]]; }
        break;
      }
      case 'deal': {
        const count = n.count === undefined ? 1 : gn('count');
        const targets = n.each !== undefined && truthy(g('each')) ? Array.from({ length: st.players }, (_, p) => p) : [n.toPlayer === undefined ? st.turn : playerArg(x, n, 'toPlayer')];
        const src = st.zones[zoneKey(x.def, String(n.from), n.fromPlayer === undefined ? st.turn : playerArg(x, n, 'fromPlayer'))];
        for (let k = 0; k < count; k++) for (const p of targets) {
          if (!src?.length) break;
          const key = zoneKey(x.def, String(n.to), p);
          (st.zones[key] ??= []).push(src.pop()!);
        }
        break;
      }
      case 'moveCard': {
        const card = gn('card');
        if (card < 0 || card >= x.c.cards.length) break;
        takeCard(st, card);
        (st.zones[zoneKey(x.def, String(n.to), playerArg(x, n))] ??= []).push(card);
        break;
      }
      case 'say': st.msg = n.text as Text; break;
      default: throw new GameError(`unknown block "${a.op}"`);
    }
  }
}

/** Runs every rule in the list whose filters and condition hold. Returns how many ran. */
function fire(x: Ctx, rules: Rule[], cell = -1, zone = '', button = '', tgt: boolean | null = null): number {
  let k = 0;
  for (const r of rules) {
    if (x.st.over) break;
    const why = whyNot(x, r, cell, zone, button, tgt), idx = x.def.rules.indexOf(r);
    note({ kind: 'rule', rule: idx, event: r.on, ran: why === null, ...(why ? { why } : {}) });
    if (why) continue;
    k++;
    run({ ...x, b: { ...x.b }, rule: idx }, r.do);
  }
  return k;
}
/** Why a rule does not apply right now (null when it does). tgt: for cards, whether the input names a cell. */
function whyNot(x: Ctx, r: Rule, cell: number, zone: string, button: string, tgt: boolean | null = null): 'cellType' | 'zone' | 'button' | 'target' | 'when' | null {
  if (tgt !== null && (r.target === 'cell') !== tgt) return 'target';
  if (r.cellType !== undefined && (cell < 0 || x.c.type[cell] !== r.cellType)) return 'cellType';
  if (r.zone !== undefined && r.zone !== zone) return 'zone';
  if (r.button !== undefined && r.button !== button) return 'button';
  return r.when === undefined || truthy(ev(x, r.when)) ? null : 'when';
}
const matches = (x: Ctx, r: Rule, cell: number, zone: string, button: string, tgt: boolean | null = null) => whyNot(x, r, cell, zone, button, tgt) === null;

// ───────────────────────────── Game flow ─────────────────────────────

function ctx(def: GameDef, st: GState, b: Record<string, Val> = {}): Ctx {
  return { def, c: compile(def), st, b, steps: { n: 0 }, depth: 0 };
}
export function clone(st: GState): GState {
  const zones: Record<string, number[]> = {}, vars: Record<string, number[]> = {};
  for (const k in st.zones) zones[k] = st.zones[k].slice();
  for (const k in st.vars) vars[k] = st.vars[k].slice();
  return { ...st, board: st.board.map(s => s.map(p => ({ ...p }))), zones, vars, dice: st.dice.slice(), last: st.last.slice(), over: st.over && { ...st.over } };
}

function guard(st: GState, f: () => void) {
  try { f(); } catch (e) {
    st.error = e instanceof Error ? e.message : String(e);
    st.over ??= { winner: -1 };
  }
}

function startTurn(def: GameDef, st: GState) {
  st.rolled = false; st.again = false; st.endNow = false;
  fire(ctx(def, st), compile(def).byEvent.turn);
}
function passTurn(def: GameDef, st: GState) {
  st.turn = (st.turn + 1) % st.players;
  if (st.turn === 0) st.round++;
  startTurn(def, st);
}

export function newGame(def: GameDef, players: number, seed = Math.floor(Math.random() * 2 ** 31)): GState {
  const c = compile(def), n = Math.max(def.players.min, Math.min(def.players.max, players));
  const st: GState = {
    players: n, turn: 0, seed: seed >>> 0, board: Array.from({ length: c.cells }, () => []), zones: {}, vars: {}, dice: [], rolled: false, again: false, endNow: false,
    over: null, msg: null, error: null, plies: 0, round: 0, last: [],
  };
  for (const [k, z] of Object.entries(def.zones ?? {})) {
    if (z.owner === 'each') for (let p = 0; p < n; p++) st.zones[`${k}@${p}`] = [];
    else st.zones[k] = [];
  }
  for (const [k, v] of Object.entries(def.vars ?? {})) st.vars[k] = Array(v.per === 'player' ? n : 1).fill(v.init);
  guard(st, () => {
    fire(ctx(def, st), c.byEvent.start);
    if (!st.over) startTurn(def, st);
    settle(def, st);
  });
  st.last = [];
  return st;
}

/** How many rules this input would trigger right now (without changing anything). */
function triggered(def: GameDef, st: GState, inp: Input): number {
  const c = compile(def), x = ctx(def, st);
  switch (inp.k) {
    case 'click': x.b = { cell: inp.cell }; return c.byEvent.click.filter(r => matches(x, r, inp.cell, '', '')).length;
    case 'move': x.b = { from: inp.from, to: inp.to }; return c.byEvent.move.filter(r => matches(x, r, inp.from, '', '')).length;
    case 'roll': return c.byEvent.roll.filter(r => matches(x, r, -1, '', '')).length;
    case 'card': {
      const z = zoneOfKey(inp.zone)[0], cell = inp.cell ?? -1;
      x.b = { card: inp.card, zone: z, cell };
      if (inp.cell !== undefined && !valid(x, cell)) return 0;
      return c.byEvent.card.filter(r => matches(x, r, cell, z, '', inp.cell !== undefined)).length;
    }
    case 'zone': x.b = { zone: zoneOfKey(inp.zone)[0] }; return c.byEvent.zone.filter(r => matches(x, r, -1, zoneOfKey(inp.zone)[0], '')).length;
    case 'button': x.b = { button: inp.id }; return c.byEvent.button.filter(r => matches(x, r, -1, '', inp.id)).length;
  }
}

/**
 * Everything the player on turn may do: each input that would trigger at least one rule.
 * With `first`, stops at the first one found (enough to know whether anyone can move).
 */
export function legal(def: GameDef, st: GState, first = false): Input[] {
  if (st.over) return [];
  const c = compile(def), out: Input[] = [];
  const ok = (i: Input) => { try { return triggered(def, st, i) > 0; } catch { return false; } };
  const add = (i: Input) => { if (ok(i)) out.push(i); return first && out.length > 0; };
  if (c.byEvent.click.length) for (let i = 0; i < c.cells; i++) if (!c.hole[i] && add({ k: 'click', cell: i })) return out;
  if (c.byEvent.move.length) {
    const rules = c.byEvent.move, anyPiece = rules.some(r => r.anyPiece);
    const reach = rules.every(r => r.reach !== undefined) ? Math.max(...rules.map(r => r.reach!)) : Infinity;
    for (let f = 0; f < c.cells; f++) {
      if (c.hole[f] || !st.board[f].length) continue;
      if (!anyPiece && !st.board[f].some(p => p.o === st.turn)) continue;
      for (let t = 0; t < c.cells; t++) {
        if (t === f || c.hole[t] || (reach < Infinity && gridDist(c, f, t) > reach)) continue;
        if (add({ k: 'move', from: f, to: t })) return out;
      }
    }
  }
  if (c.byEvent.roll.length && add({ k: 'roll' })) return out;
  if (c.byEvent.card.length || c.byEvent.zone.length) {
    const plain = c.byEvent.card.some(r => r.target !== 'cell'), aimed = c.byEvent.card.some(r => r.target === 'cell');
    for (const [key, cards] of Object.entries(st.zones)) {
      const [, owner] = zoneOfKey(key);
      if (owner >= 0 && owner !== st.turn) continue;
      for (const card of cards) {
        if (plain && add({ k: 'card', card, zone: key })) return out;
        if (aimed) for (let i = 0; i < c.cells; i++) if (!c.hole[i] && add({ k: 'card', card, zone: key, cell: i })) return out;
      }
      if (c.byEvent.zone.length && add({ k: 'zone', zone: key })) return out;
    }
  }
  for (const id of Object.keys(def.buttons ?? {})) if (add({ k: 'button', id })) return out;
  return out;
}

/**
 * After an action: pass over players who have nothing to do. When nobody can move, the
 * "blocked" rules decide (a score count, say); if they do not end the game it is a draw.
 */
function settle(def: GameDef, st: GState) {
  for (let skipped = 0; !st.over && skipped <= st.players; skipped++) {
    if (legal(def, st, true).length) return;
    if (st.players === 1 || skipped === st.players) {
      fire(ctx(def, st), compile(def).byEvent.blocked);
      if (!st.over) st.over = { winner: -1, stuck: true };
      return;
    }
    passTurn(def, st);
  }
}

/** Plays one input and returns the new state; the old one is left untouched. */
export function apply(def: GameDef, st0: GState, inp: Input): GState {
  const st = clone(st0), c = compile(def);
  if (st.over) return st;
  st.last = []; st.msg = null; st.again = false; st.endNow = false;
  guard(st, () => {
    const x = ctx(def, st);
    let ran = 0;
    switch (inp.k) {
      case 'click': x.b = { cell: inp.cell }; ran = fire(x, c.byEvent.click, inp.cell); st.last.push(inp.cell); break;
      case 'move': x.b = { from: inp.from, to: inp.to }; ran = fire(x, c.byEvent.move, inp.from); break;
      case 'roll': ran = fire(x, c.byEvent.roll); break;
      case 'card': {
        const z = zoneOfKey(inp.zone)[0], cell = inp.cell ?? -1;
        if (inp.cell !== undefined && !valid(x, cell)) break;
        x.b = { card: inp.card, zone: z, cell };
        ran = fire(x, c.byEvent.card, cell, z, '', inp.cell !== undefined);
        if (inp.cell !== undefined) st.last.push(cell);
        break;
      }
      case 'zone': { const z = zoneOfKey(inp.zone)[0]; x.b = { zone: z }; ran = fire(x, c.byEvent.zone, -1, z); break; }
      case 'button': x.b = { button: inp.id }; ran = fire(x, c.byEvent.button, -1, '', inp.id); break;
    }
    if (!ran) return;
    st.plies++;
    if (!st.over) fire(ctx(def, st), c.byEvent.after);
    if (!st.over && (st.endNow || ((def.turns ?? 'auto') === 'auto' && !st.again))) passTurn(def, st);
    settle(def, st);
  });
  return st;
}

/** Plays one input and also reports which rules were looked at and which actions ran. */
export function applyTraced(def: GameDef, st: GState, inp: Input): { state: GState; trace: Trace[] } {
  TRACE = [];
  try { const state = apply(def, st, inp); return { state, trace: TRACE }; } finally { TRACE = null; }
}

/** A condition taken apart: each block's inputs and the value it came to. */
export interface ExprTree { op: string; value: Val; args: Record<string, ExprTree | Val>; text?: Record<string, string> }
function treeOf(x: Ctx, e: Expr, depth: number): ExprTree | Val {
  let value: Val;
  try { value = ev(x, e); } catch { value = '?'; }
  if (typeof e !== 'object' || e === null) return value;
  const n = e as Record<string, unknown>, spec = EXPRS[String(n.op)], args: Record<string, ExprTree | Val> = {}, text: Record<string, string> = {};
  // Inside "any direction" the parts depend on a direction that only exists while it loops; show just the result.
  const loops = n.op === 'anyDir' || n.op === 'sumDirs';
  if (spec) for (const [k, kind] of Object.entries(spec.args)) {
    if (n[k] === undefined || (loops && (k === 'test' || k === 'value'))) continue;
    if (kind === 'e') args[k] = depth > 0 ? treeOf(x, n[k] as Expr, depth - 1) : (() => { try { return ev(x, n[k] as Expr); } catch { return '?'; } })();
    else text[k] = String(n[k]);
  }
  return { op: String(n.op), value, args, text };
}
export interface Explained { rule: number; why: 'cellType' | 'zone' | 'button' | 'target' | 'when' | null; cond?: ExprTree | Val }
/** For an input that did nothing (or might): each rule it could trigger and why it does or does not. */
export function explainInput(def: GameDef, st: GState, inp: Input): Explained[] {
  const c = compile(def), x = ctx(def, st);
  let ev2: EventName, cell = -1, zone = '', button = '', tgt: boolean | null = null;
  switch (inp.k) {
    case 'click': ev2 = 'click'; cell = inp.cell; x.b = { cell }; break;
    case 'move': ev2 = 'move'; cell = inp.from; x.b = { from: inp.from, to: inp.to }; break;
    case 'roll': ev2 = 'roll'; break;
    case 'card': ev2 = 'card'; zone = zoneOfKey(inp.zone)[0]; cell = inp.cell ?? -1; tgt = inp.cell !== undefined; x.b = { card: inp.card, zone, cell }; break;
    case 'zone': ev2 = 'zone'; zone = zoneOfKey(inp.zone)[0]; x.b = { zone }; break;
    case 'button': ev2 = 'button'; button = inp.id; x.b = { button }; break;
  }
  return c.byEvent[ev2].map(r => {
    let why: Explained['why'];
    try { why = whyNot(x, r, cell, zone, button, tgt); } catch { why = 'when'; }
    return { rule: def.rules.indexOf(r), why, ...(r.when !== undefined ? { cond: treeOf(x, r.when, 4) } : {}) };
  });
}

/** Each human-facing seat: does the player see this zone's cards? */
export function canSee(def: GameDef, key: string, viewer: number | 'all'): 'all' | 'top' | 'none' {
  const [z, owner] = zoneOfKey(key), d = def.zones?.[z];
  if (!d) return 'none';
  if (d.show === 'all') return 'all';
  if (d.show === 'top') return 'top';
  if (d.show === 'owner') return viewer === 'all' || viewer === owner ? 'all' : 'none';
  return 'none';
}

// ───────────────────────────── Validation ─────────────────────────────

/** Problems in a definition, in words a person can fix. Empty when the game can be played. */
export function validate(raw: unknown): string[] {
  const out: string[] = [];
  if (!raw || typeof raw !== 'object') return ['The game must be a JSON object.'];
  const def = raw as GameDef;
  if (def.format !== 'chaikhana-game') out.push('"format" must be "chaikhana-game".');
  if (!def.name) out.push('The game needs a "name".');
  if (def.board?.grid !== undefined && !['square', 'hex'].includes(def.board.grid)) out.push('"grid" must be "square" or "hex".');
  if (!def.players || !(def.players.min >= 1) || !(def.players.max >= def.players.min) || def.players.max > 6) out.push('"players" needs min and max between 1 and 6.');
  if (def.board && (!(def.board.w >= 1 && def.board.w <= 20) || !(def.board.h >= 1 && def.board.h <= 20))) out.push('The board can be 1 to 20 cells wide and high.');
  if (!Array.isArray(def.rules)) { out.push('"rules" must be a list.'); return out; }
  const has = (kind: Arg, name: unknown) =>
    kind === 'piece' ? !!def.pieces?.[String(name)] : kind === 'zone' ? !!def.zones?.[String(name)] : kind === 'var' ? !!def.vars?.[String(name)] : true;
  const what: Record<string, string> = { piece: 'piece', zone: 'zone', var: 'variable' };
  const walk = (node: unknown, table: Record<string, Spec>, where: string) => {
    if (table === EXPRS && (typeof node !== 'object' || node === null)) return;
    const n = node as Record<string, unknown>;
    if (!n || typeof n.op !== 'string' || !table[n.op]) { out.push(`${where}: unknown block ${JSON.stringify(n?.op ?? n)}.`); return; }
    const spec = table[n.op];
    for (const [k, kind] of Object.entries(spec.args)) {
      if (n[k] === undefined) { if (!spec.opt?.includes(k)) out.push(`${where}: "${n.op}" needs "${k}".`); continue; }
      if (kind === 'e') walk(n[k], EXPRS, `${where} › ${n.op}.${k}`);
      else if (kind === 'a') walkList(n[k], `${where} › ${n.op}.${k}`);
      else if (!has(kind, n[k])) out.push(`${where}: there is no ${what[kind]} called "${String(n[k])}".`);
    }
  };
  const walkList = (list: unknown, where: string) => {
    if (!Array.isArray(list)) { out.push(`${where}: expected a list of actions.`); return; }
    list.forEach((a, i) => walk(a, ACTS, `${where}[${i + 1}]`));
  };
  def.rules.forEach((r, i) => {
    const where = `Rule ${i + 1}`;
    if (!EVENTS.includes(r?.on)) { out.push(`${where}: "on" must be one of ${EVENTS.join(', ')}.`); return; }
    if (r.zone !== undefined && !def.zones?.[r.zone]) out.push(`${where}: there is no zone called "${r.zone}".`);
    if (r.button !== undefined && !def.buttons?.[r.button]) out.push(`${where}: there is no button called "${r.button}".`);
    if (r.cellType !== undefined && !def.board?.types?.[r.cellType]) out.push(`${where}: there is no cell type called "${r.cellType}".`);
    if (r.target !== undefined && (r.on !== 'card' || r.target !== 'cell')) out.push(`${where}: only card rules can have target "cell".`);
    if (r.target === 'cell' && !def.board) out.push(`${where}: a card played onto a cell needs a board.`);
    if (r.when !== undefined) walk(r.when, EXPRS, `${where} › when`);
    walkList(r.do, where);
  });
  return out;
}

/** JSON with keys in a fixed order, so two equal definitions compare equal however they were built. */
export const canon = (v: unknown): string => JSON.stringify(v, (_, x) => (x && typeof x === 'object' && !Array.isArray(x) ? Object.fromEntries(Object.entries(x).filter(([, y]) => y !== undefined).sort(([a], [b]) => a.localeCompare(b))) : x));

export function txt(t: Text | undefined, lang: 'en' | 'zh' | 'tr'): string {
  if (t === undefined) return '';
  if (typeof t === 'string') return t;
  return t[lang] ?? t.en;
}
