/**
 * Rules ⇄ blocks. Every block is generated from the engine's block tables, so a block added
 * to the engine shows up in the editor by itself. The functions here are pure: they build and
 * read Blockly's JSON save format and never touch the page, so they are tested directly.
 */
import { ACT_TEXT, CATEGORY_TEXT, EVENT_TEXT, EXPR_TEXT, LIT_TEXT, RULE_TEXT, tx } from './blockText';
import { ACTS, EXPRS, txt, type Act, type Arg, type EventName, type Expr, type GameDef, type Rule, type Spec, type Text } from './engine';

type Lang = 'en' | 'zh' | 'tr';
export interface BlockState { type: string; id?: string; x?: number; y?: number; fields?: Record<string, unknown>; inputs?: Record<string, { block?: BlockState; shadow?: BlockState }>; next?: { block?: BlockState }; data?: string }
export interface WorkspaceState { blocks?: { languageVersion: number; blocks: BlockState[] } }

const EVENTS = Object.keys(EVENT_TEXT) as EventName[];
const ANY = '*';

// ───────────────────────────── Categories and colours ─────────────────────────────

export const COLOURS: Record<string, string> = {
  rules: '#c27c1e', values: '#7a6a58', logic: '#4f78a8', math: '#4c9a52', board: '#2e8a84', dirs: '#2b7499',
  cards: '#8657b3', players: '#a0663f', words: '#3f7f5f', pieces: '#b8433a', flow: '#b58a12', deal: '#7a49a8', game: '#c4512b',
};
const EXPR_CAT: Record<string, string> = {};
const ACT_CAT: Record<string, string> = {};
const put = (m: Record<string, string>, cat: string, ops: string) => ops.split(' ').forEach(o => { m[o] = cat; });
put(EXPR_CAT, 'values', 'get');
put(EXPR_CAT, 'logic', 'eq ne lt le gt ge and or not if');
put(EXPR_CAT, 'math', 'add sub mul div mod min max abs round plies');
put(EXPR_CAT, 'board', 'empty piece owner height value type prop row col cellAt offset dist dr dc between line count full find pathPos pathCell pathLen lowest connects');
put(EXPR_CAT, 'dirs', 'step dirs adjacent flank run around anyDir sumDirs');
put(EXPR_CAT, 'cards', 'die sum rolled field top size');
put(EXPR_CAT, 'players', 'me next players var');
put(EXPR_CAT, 'words', 'len secret inList guesses hits wordLen placed found total crossDone reveals');
put(ACT_CAT, 'words', 'pickWord addGuess buildPuzzle markFound');
put(ACT_CAT, 'pieces', 'place remove move setOwner');
put(ACT_CAT, 'flow', 'if repeat while forCells forDirs forPlayers let');
put(ACT_CAT, 'deal', 'fill shuffle deal moveCard roll');
put(ACT_CAT, 'game', 'win lose draw winBest end again set change say');

// ───────────────────────────── Block definitions ─────────────────────────────

/** Options for a dropdown of names the game declares. */
function names(def: GameDef, kind: Arg | 'cellType' | 'button' | 'side', lang: Lang, optional: boolean): [string, string][] {
  const from = (o: Record<string, { name: Text }> | undefined) => Object.entries(o ?? {}).map(([k, v]) => [txt(v.name, lang) || k, k] as [string, string]);
  let out: [string, string][] =
    kind === 'piece' ? from(def.pieces) : kind === 'zone' ? from(def.zones) : kind === 'var' ? from(def.vars)
    : kind === 'cellType' ? from(def.board?.types) : kind === 'button' ? from(def.buttons)
    : kind === 'side' ? [...(['top', 'bottom', 'left', 'right'] as const).map(s => [tx(SIDES[s], lang), s] as [string, string]), ...from(def.board?.types)]
    : [];
  if (optional) out = [[tx(RULE_TEXT.any, lang), ANY], ...out];
  return out.length ? out : [['—', ANY]];
}
const SIDES = { top: ['top edge', '上边', 'üst kenar'], bottom: ['bottom edge', '下边', 'alt kenar'], left: ['left edge', '左边', 'sol kenar'], right: ['right edge', '右边', 'sağ kenar'] } as Record<string, [string, string, string]>;

function argJson(def: GameDef, op: string, key: string, kind: Arg, optional: boolean, lang: Lang): Record<string, unknown> {
  if (kind === 'e') return { type: 'input_value', name: key };
  if (kind === 'a') return { type: 'input_statement', name: key };
  if (op === 'connects' && (key === 'a' || key === 'b')) return { type: 'field_dropdown', name: key, options: names(def, 'side', lang, false) };
  if (kind === 'piece' || kind === 'zone' || kind === 'var') return { type: 'field_dropdown', name: key, options: names(def, kind, lang, optional) };
  return { type: 'field_input', name: key, text: '' };
}

function opJson(def: GameDef, table: Record<string, Spec>, text: Record<string, [string, string, string]>, prefix: 'e_' | 'a_', op: string, lang: Lang) {
  const spec = table[op], keys = Object.keys(spec.args), cat = (prefix === 'e_' ? EXPR_CAT : ACT_CAT)[op] ?? 'values';
  const statements = keys.some(k => spec.args[k] === 'a');
  return {
    type: prefix + op,
    message0: tx(text[op] ?? [op, op, op], lang),
    args0: keys.map(k => argJson(def, op, k, spec.args[k], !!spec.opt?.includes(k), lang)),
    inputsInline: !statements,
    colour: COLOURS[cat],
    ...(prefix === 'e_' ? { output: null } : { previousStatement: null, nextStatement: null }),
  };
}

function ruleJson(def: GameDef, ev: EventName, lang: Lang) {
  const filters: { msg: string; args: Record<string, unknown>[] } =
    ev === 'click' || ev === 'enter' ? { msg: ` · ${tx(RULE_TEXT.type, lang)} %1`, args: [{ type: 'field_dropdown', name: 'cellType', options: names(def, 'cellType', lang, true) }] }
    : ev === 'move' ? { msg: ` · ${tx(RULE_TEXT.reach, lang)} %1 · ${tx(RULE_TEXT.anyPiece, lang)} %2`, args: [{ type: 'field_number', name: 'reach', value: 0, min: 0, precision: 1 }, { type: 'field_checkbox', name: 'anyPiece', checked: false }] }
    : ev === 'card' ? { msg: ` · ${tx(RULE_TEXT.zone, lang)} %1 · ${tx(RULE_TEXT.target, lang)} %2`, args: [{ type: 'field_dropdown', name: 'zone', options: names(def, 'zone', lang, true) }, { type: 'field_checkbox', name: 'target', checked: false }] }
    : ev === 'zone' ? { msg: ' · %1', args: [{ type: 'field_dropdown', name: 'zone', options: names(def, 'zone', lang, true) }] }
    : ev === 'button' ? { msg: ` · ${tx(RULE_TEXT.button, lang)} %1`, args: [{ type: 'field_dropdown', name: 'button', options: names(def, 'button', lang, true) }] }
    : { msg: '', args: [] };
  return {
    type: 'rule_' + ev,
    message0: tx(EVENT_TEXT[ev], lang) + filters.msg, args0: filters.args,
    message1: tx(RULE_TEXT.name, lang) + ' %1', args1: [{ type: 'field_input', name: 'name', text: '' }],
    message2: tx(RULE_TEXT.when, lang) + ' %1', args2: [{ type: 'input_value', name: 'when' }],
    message3: tx(RULE_TEXT.do, lang) + ' %1', args3: [{ type: 'input_statement', name: 'do' }],
    colour: COLOURS.rules,
  };
}

/** Every block definition (Blockly JSON), with dropdowns filled from this game's materials. */
export function blockDefinitions(def: GameDef, lang: Lang): Record<string, unknown>[] {
  return [
    ...EVENTS.map(ev => ruleJson(def, ev, lang)),
    ...Object.keys(EXPRS).map(op => opJson(def, EXPRS, EXPR_TEXT, 'e_', op, lang)),
    ...Object.keys(ACTS).map(op => opJson(def, ACTS, ACT_TEXT, 'a_', op, lang)),
    { type: 'lit_num', message0: '%1', args0: [{ type: 'field_number', name: 'NUM', value: 0 }], output: null, colour: COLOURS.math },
    { type: 'lit_text', message0: tx(LIT_TEXT.text, lang), args0: [{ type: 'field_input', name: 'TEXT', text: '' }], output: null, colour: COLOURS.values },
    { type: 'lit_bool', message0: '%1', args0: [{ type: 'field_dropdown', name: 'BOOL', options: [[tx(LIT_TEXT.yes, lang), 'TRUE'], [tx(LIT_TEXT.no, lang), 'FALSE']] }], output: null, colour: COLOURS.logic },
  ];
}

/** The block palette, by category. Handy ready-made "get" blocks come first under Values. */
export function toolbox(def: GameDef, lang: Lang) {
  const blk = (type: string, fields?: Record<string, unknown>) => ({ kind: 'block', type, ...(fields ? { fields } : {}) });
  const cat = (key: string, contents: unknown[]) => ({ kind: 'category', name: tx(CATEGORY_TEXT[key], lang), colour: COLOURS[key], contents });
  const of = (m: Record<string, string>, c: string, prefix: string) => Object.keys(m).filter(o => m[o] === c).map(o => blk(prefix + o));
  const binds = ['cell', 'from', 'to', 'card', 'who', 'it', 'p', 'dir', 'i', ...(def.words ? ['guess'] : [])];
  const want = (ev: EventName) => (ev !== 'card' || !!def.cards || !!def.zones) && (ev !== 'word' || !!def.words);
  return {
    kind: 'categoryToolbox',
    contents: [
      cat('rules', EVENTS.filter(want).map(ev => blk('rule_' + ev))),
      cat('values', [blk('lit_num'), blk('lit_text'), blk('lit_bool'), ...binds.map(name => blk('e_get', { name }))]),
      cat('logic', of(EXPR_CAT, 'logic', 'e_')),
      cat('math', of(EXPR_CAT, 'math', 'e_')),
      ...(def.board ? [cat('board', of(EXPR_CAT, 'board', 'e_')), cat('dirs', of(EXPR_CAT, 'dirs', 'e_'))] : []),
      cat('cards', of(EXPR_CAT, 'cards', 'e_')),
      cat('players', of(EXPR_CAT, 'players', 'e_')),
      ...(def.board ? [cat('pieces', of(ACT_CAT, 'pieces', 'a_'))] : []),
      cat('flow', of(ACT_CAT, 'flow', 'a_')),
      cat('deal', of(ACT_CAT, 'deal', 'a_')),
      cat('game', of(ACT_CAT, 'game', 'a_')),
      ...(def.words ? [cat('words', [...of(EXPR_CAT, 'words', 'e_'), ...of(ACT_CAT, 'words', 'a_')])] : []),
    ],
  };
}

// ───────────────────────────── Rules → blocks ─────────────────────────────

/** Texts written in several languages ride along in the block's data, so editing in one language keeps the others. */
function withData(b: BlockState, keep: Record<string, unknown>): BlockState {
  return Object.keys(keep).length ? { ...b, data: JSON.stringify(keep) } : b;
}

export function exprBlock(e: Expr, lang: Lang): BlockState {
  if (typeof e === 'number') return { type: 'lit_num', fields: { NUM: e } };
  if (typeof e === 'string') return { type: 'lit_text', fields: { TEXT: e } };
  if (typeof e === 'boolean') return { type: 'lit_bool', fields: { BOOL: e ? 'TRUE' : 'FALSE' } };
  return opBlock(e as Record<string, unknown>, EXPRS, 'e_', lang);
}
function opBlock(n: Record<string, unknown>, table: Record<string, Spec>, prefix: string, lang: Lang, id?: string): BlockState {
  const spec = table[String(n.op)];
  if (!spec) return { type: 'lit_text', fields: { TEXT: `?${String(n.op)}` } };
  const fields: Record<string, unknown> = {}, inputs: Record<string, { block: BlockState }> = {}, keep: Record<string, unknown> = {};
  for (const [k, kind] of Object.entries(spec.args)) {
    const v = n[k];
    if (kind === 'e') { if (v !== undefined) inputs[k] = { block: exprBlock(v as Expr, lang) }; }
    else if (kind === 'a') { const chain = actsChain(v as Act[], lang, id && `${id}.${k}`); if (chain) inputs[k] = { block: chain }; }
    else if (kind === 'text') { fields[k] = txt(v as Text, lang); if (typeof v === 'object' && v) keep[k] = v; }
    else fields[k] = v === undefined ? ANY : String(v);
  }
  const b: BlockState = { type: prefix + String(n.op), ...(id ? { id } : {}) };
  if (Object.keys(fields).length) b.fields = fields;
  if (Object.keys(inputs).length) b.inputs = inputs;
  return withData(b, keep);
}
/** idBase: action blocks get ids like "r0.do.1.then.0", the same paths the engine reports when watching rules. */
export function actsChain(list: Act[] | undefined, lang: Lang, idBase?: string): BlockState | undefined {
  if (!Array.isArray(list) || !list.length) return undefined;
  let head: BlockState | undefined;
  for (let i = list.length - 1; i >= 0; i--) {
    const b = opBlock(list[i] as unknown as Record<string, unknown>, ACTS, 'a_', lang, idBase && `${idBase}.${i}`);
    if (head) b.next = { block: head };
    head = b;
  }
  return head;
}
export function ruleBlock(r: Rule, lang: Lang, index?: number): BlockState {
  const fields: Record<string, unknown> = { name: txt(r.name, lang) };
  if (r.on === 'click' || r.on === 'enter') fields.cellType = r.cellType ?? ANY;
  if (r.on === 'move') { fields.reach = r.reach ?? 0; fields.anyPiece = !!r.anyPiece; }
  if (r.on === 'card') { fields.zone = r.zone ?? ANY; fields.target = r.target === 'cell'; }
  if (r.on === 'zone') fields.zone = r.zone ?? ANY;
  if (r.on === 'button') fields.button = r.button ?? ANY;
  const inputs: Record<string, { block: BlockState }> = {};
  if (r.when !== undefined) inputs.when = { block: exprBlock(r.when, lang) };
  const chain = actsChain(r.do, lang, index === undefined ? undefined : `r${index}.do`);
  if (chain) inputs.do = { block: chain };
  return withData({ type: 'rule_' + r.on, ...(index === undefined ? {} : { id: 'r' + index }), fields, inputs }, typeof r.name === 'object' ? { name: r.name } : {});
}
export function rulesToWorkspace(rules: Rule[], lang: Lang): WorkspaceState {
  return { blocks: { languageVersion: 0, blocks: rules.map((r, i) => ({ ...ruleBlock(r, lang, i), x: 16, y: 16 + i * 160 })) } };
}

// ───────────────────────────── Blocks → rules ─────────────────────────────

const dataOf = (b: BlockState): Record<string, unknown> => { try { return b.data ? JSON.parse(b.data) : {}; } catch { return {}; } };
/** A text field: keep the multi-language original if this language's text was not changed. */
function textBack(b: BlockState, key: string, lang: Lang): Text {
  const now = String(b.fields?.[key] ?? ''), orig = dataOf(b)[key] as Text | undefined;
  return orig !== undefined && txt(orig, lang) === now ? orig : now;
}

export function exprFrom(b: BlockState | undefined, lang: Lang): Expr | undefined {
  if (!b) return undefined;
  if (b.type === 'lit_num') return Number(b.fields?.NUM ?? 0);
  if (b.type === 'lit_text') return String(b.fields?.TEXT ?? '');
  if (b.type === 'lit_bool') return b.fields?.BOOL === 'TRUE';
  if (!b.type.startsWith('e_')) return undefined;
  return opFrom(b, EXPRS, b.type.slice(2), lang) as Expr;
}
function opFrom(b: BlockState, table: Record<string, Spec>, op: string, lang: Lang): Record<string, unknown> {
  const spec = table[op], out: Record<string, unknown> = { op };
  if (!spec) return out;
  for (const [k, kind] of Object.entries(spec.args)) {
    if (kind === 'e') { const v = exprFrom(b.inputs?.[k]?.block, lang); if (v !== undefined) out[k] = v; }
    else if (kind === 'a') out[k] = actsFrom(b.inputs?.[k]?.block, lang);
    else if (kind === 'text') out[k] = textBack(b, k, lang);
    else { const v = b.fields?.[k]; if (v !== undefined && v !== ANY) out[k] = String(v); }
  }
  // An optional list of actions left empty is simply left out.
  for (const k of spec.opt ?? []) if (spec.args[k] === 'a' && Array.isArray(out[k]) && !(out[k] as unknown[]).length) delete out[k];
  return out;
}
export function actsFrom(b: BlockState | undefined, lang: Lang): Act[] {
  const out: Act[] = [];
  for (let cur = b; cur; cur = cur.next?.block) if (cur.type.startsWith('a_')) out.push(opFrom(cur, ACTS, cur.type.slice(2), lang) as Act);
  return out;
}
export function ruleFrom(b: BlockState, lang: Lang): Rule | null {
  if (!b.type.startsWith('rule_')) return null;
  const on = b.type.slice(5) as EventName, f = b.fields ?? {}, r: Rule = { on, do: actsFrom(b.inputs?.do?.block, lang) };
  const name = textBack(b, 'name', lang);
  if (name !== '') r.name = name;
  if ((on === 'click' || on === 'enter') && f.cellType && f.cellType !== ANY) r.cellType = String(f.cellType);
  if (on === 'move') { if (Number(f.reach) > 0) r.reach = Number(f.reach); if (f.anyPiece === true || f.anyPiece === 'TRUE') r.anyPiece = true; }
  if ((on === 'card' || on === 'zone') && f.zone && f.zone !== ANY) r.zone = String(f.zone);
  if (on === 'card' && (f.target === true || f.target === 'TRUE')) r.target = 'cell';
  if (on === 'button' && f.button && f.button !== ANY) r.button = String(f.button);
  const when = exprFrom(b.inputs?.when?.block, lang);
  if (when !== undefined) r.when = when;
  return r;
}
/** Rules in reading order (top to bottom), and how many loose blocks sit outside any rule. */
export function workspaceToRules(ws: WorkspaceState, lang: Lang): { rules: Rule[]; loose: number } {
  const tops = [...(ws.blocks?.blocks ?? [])].sort((a, b) => (a.y ?? 0) - (b.y ?? 0) || (a.x ?? 0) - (b.x ?? 0));
  const rules: Rule[] = [];
  let loose = 0;
  for (const b of tops) { const r = ruleFrom(b, lang); if (r) rules.push(r); else loose++; }
  return { rules, loose };
}
