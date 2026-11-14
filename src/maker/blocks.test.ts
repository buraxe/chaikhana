import { describe, expect, it } from 'vitest';
import { blockDefinitions, rulesToWorkspace, toolbox, workspaceToRules } from './blocks';
import { ACT_TEXT, EXPR_TEXT } from './blockText';
import { ACTS, EXPRS, validate } from './engine';
import { EXAMPLES, SNAKES_LADDERS } from './examples';

describe('rules ⇄ blocks', () => {
  it('every example survives the round trip unchanged, in every language', () => {
    for (const lang of ['en', 'zh', 'tr'] as const) for (const d of EXAMPLES) {
      const json = JSON.parse(JSON.stringify(d.rules));
      const ws = JSON.parse(JSON.stringify(rulesToWorkspace(json, lang)));
      const back = workspaceToRules(ws, lang);
      expect(back.loose).toBe(0);
      expect(back.rules).toEqual(json);
    }
  });
  it('an edited label in one language replaces the text; untouched ones keep all three', () => {
    const ws = rulesToWorkspace(SNAKES_LADDERS.rules, 'tr');
    ws.blocks!.blocks[1].fields!.name = 'Zar at, yürü';
    const back = workspaceToRules(ws, 'tr').rules;
    expect(back[1].name).toBe('Zar at, yürü');
    expect(back[2].name).toEqual(SNAKES_LADDERS.rules[2].name);
  });
  it('rules are read top to bottom, loose blocks are counted and skipped', () => {
    const ws = rulesToWorkspace(SNAKES_LADDERS.rules, 'en');
    ws.blocks!.blocks[0].y = 9999;
    ws.blocks!.blocks.push({ type: 'a_roll', x: 0, y: 5 });
    const back = workspaceToRules(ws, 'en');
    expect(back.loose).toBe(1);
    expect(back.rules[back.rules.length - 1].on).toBe('start');
  });
  it('an empty required input becomes a validation error, not a crash', () => {
    const ws = rulesToWorkspace([{ on: 'click', do: [{ op: 'place', piece: 'stone', cell: { op: 'get', name: 'cell' } }] }], 'en');
    delete ws.blocks!.blocks[0].inputs!.do!.block!.inputs;
    const rules = workspaceToRules(ws, 'en').rules;
    expect(validate({ ...EXAMPLES[0], rules }).some(e => e.includes('needs "cell"'))).toBe(true);
  });
  it('every block has text in three languages with each input exactly once', () => {
    for (const [table, text] of [[EXPRS, EXPR_TEXT], [ACTS, ACT_TEXT]] as const) for (const [op, spec] of Object.entries(table)) {
      const n = Object.keys(spec.args).length;
      expect(text[op], op).toBeDefined();
      for (const msg of text[op]) for (let i = 1; i <= 9; i++) expect((msg.match(new RegExp(`%${i}(?!\\d)`, 'g')) ?? []).length, `${op} %${i} in "${msg}"`).toBe(i <= n ? 1 : 0);
    }
  });
  it('definitions and toolbox only name blocks that exist', () => {
    for (const d of EXAMPLES) {
      const types = new Set(blockDefinitions(d, 'tr').map(b => b.type));
      const tb = toolbox(d, 'tr') as { contents: { contents: { type: string }[] }[] };
      for (const c of tb.contents) for (const b of c.contents) expect(types.has(b.type), b.type).toBe(true);
    }
  });
});
