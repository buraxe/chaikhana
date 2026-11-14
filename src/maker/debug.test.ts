import { describe, expect, it } from 'vitest';
import { rulesToWorkspace } from './blocks';
import { applyTraced, explainInput, newGame } from './engine';
import { EXAMPLES, REVERSI, SNAKES_LADDERS, TICTACTOE } from './examples';
import { decodeGame, encodeGame, shareLink } from './share';

describe('watching rules', () => {
  it('a click reports the rule that ran, its actions, and the after-rule that did not', () => {
    const { state, trace } = applyTraced(TICTACTOE, newGame(TICTACTOE, 2, 1), { k: 'click', cell: 4 });
    expect(state.board[4]).toHaveLength(1);
    expect(trace).toContainEqual({ kind: 'rule', rule: 0, event: 'click', ran: true });
    expect(trace).toContainEqual({ kind: 'act', rule: 0, path: 'do.0', op: 'place' });
    expect(trace).toContainEqual({ kind: 'act', rule: 0, path: 'do.1', op: 'if' });
    expect(trace).toContainEqual({ kind: 'rule', rule: 1, event: 'after', ran: false, why: 'when' });
  });
  it('a ladder shows up as a nested rule', () => {
    let st = newGame(SNAKES_LADDERS, 2, 3), seen = false;
    for (let k = 0; k < 300 && !st.over && !seen; k++) {
      const r = applyTraced(SNAKES_LADDERS, st, { k: 'roll' });
      seen = r.trace.some(t => t.kind === 'rule' && t.event === 'enter' && t.ran);
      st = r.state;
    }
    expect(seen).toBe(true);
  });
  it('explains why an occupied cell cannot be clicked, down to the false part', () => {
    const st = newGame(REVERSI, 2, 1);
    const ex = explainInput(REVERSI, st, { k: 'click', cell: 27 });
    expect(ex).toHaveLength(1);
    expect(ex[0].why).toBe('when');
    const tree = ex[0].cond as { op: string; value: boolean; args: Record<string, { op: string; value: boolean }> };
    expect(tree.op).toBe('and');
    expect(tree.args.a).toMatchObject({ op: 'empty', value: false });
    const ok = explainInput(REVERSI, st, { k: 'click', cell: 19 });
    expect(ok[0].why).toBeNull();
  });
  it('trace paths match the ids the block editor gives action blocks', () => {
    const ws = rulesToWorkspace(TICTACTOE.rules, 'en');
    const ids: string[] = [];
    const walk = (b?: { id?: string; inputs?: Record<string, { block?: unknown }>; next?: { block?: unknown } }) => {
      if (!b) return;
      if (b.id) ids.push(b.id);
      for (const i of Object.values(b.inputs ?? {})) walk(i.block as typeof b);
      walk(b.next?.block as typeof b);
    };
    ws.blocks!.blocks.forEach(b => walk(b));
    expect(ids).toEqual(expect.arrayContaining(['r0', 'r0.do.0', 'r0.do.1', 'r0.do.1.then.0', 'r1', 'r1.do.0']));
  });
});

describe('sharing', () => {
  it('every example survives a code round trip, also from inside a link', async () => {
    for (const d of EXAMPLES) {
      const code = await encodeGame(d);
      expect(code).toMatch(/^[A-Za-z0-9_-]+$/);
      expect(await decodeGame(code)).toEqual(d);
      expect(await decodeGame(shareLink(code))).toEqual(d);
    }
  });
  it('rejects garbage with a readable message', async () => {
    await expect(decodeGame('hello')).rejects.toThrow('not a game code');
    await expect(decodeGame('AAAAAAAAAAAAAAAA')).rejects.toThrow();
  });
});
