import { describe, expect, it } from 'vitest';
import * as C from './chess/rules';
import * as X from './xiangqi/rules';
import * as S from './shogi/rules';
import * as G from './weiqi/rules';

const perft = <T,>(legal: (s: T) => number[], play: (s: T, m: number) => T, s: T, d: number): number => (d === 0 ? 1 : legal(s).reduce((a, m) => a + perft(legal, play, play(s, m), d - 1), 0));
describe('move generation (perft)', () => {
  it('chess', () => {
    expect(perft(C.legal, C.play, C.newGame(), 3)).toBe(8902);
    expect(perft(C.legal, C.play, C.fromFen('r3k2r/p1ppqpb1/bn2pnp1/3PN3/1p2P3/2N2Q1p/PPPBBPPP/R3K2R w KQkq - 0 1'), 2)).toBe(2039);
  });
  it('xiangqi', () => {
    expect(perft(X.legal, X.play, X.newGame(), 1)).toBe(44);
    expect(perft(X.legal, X.play, X.newGame(), 2)).toBe(1920);
    expect(perft(X.legal, X.play, X.newGame(), 3)).toBe(79666);
  }, 60000);
  it('shogi', () => {
    expect(perft(S.legal, S.play, S.newGame(), 1)).toBe(30);
    expect(perft(S.legal, S.play, S.newGame(), 2)).toBe(900);
    expect(perft(S.legal, S.play, S.newGame(), 3)).toBe(25470);
  }, 60000);
});
describe('rules', () => {
  it('chess: fool’s mate ends the game', () => {
    const sq = (s: string) => (8 - +s[1]) * 8 + s.charCodeAt(0) - 97, mv = (a: string, b: string) => sq(a) * 64 + sq(b);
    const st = C.replay([mv('f2', 'f3'), mv('e7', 'e5'), mv('g2', 'g4'), mv('d8', 'h4')]);
    expect(st.winner).toBe(2); expect(st.reason).toBe('mate');
  });
  it('xiangqi: the generals may not face each other', () => {
    const st = X.fromFen('4k4/9/9/9/9/9/9/9/9/3K5 w');
    expect(X.legal(st).some(m => m % 90 === 9 * 9 + 4)).toBe(false);
  });
  it('shogi: no second pawn on a file, and pieces in hand can be dropped', () => {
    const st = S.fromSfen('4k4/9/9/9/9/9/4P4/9/4K4 b P');
    const drops = S.legal(st).filter(m => S.dec(m).from === 81 + 6);
    expect(drops.every(m => S.dec(m).to % 9 !== 4)).toBe(true);
    expect(drops.length).toBeGreaterThan(40);
  });
  it('go: capture, ko and counting', () => {
    let st = G.newGame(9);
    // Black surrounds a white stone at the centre.
    for (const m of [31, 40, 39, 81, 41, 81, 49]) st = G.play(st, m);
    expect(st.cells[40]).toBe(0); expect(st.caps[0]).toBe(1);
    const end = G.play(G.play(st, 81), 81);
    expect(end.winner).toBe(1); expect(end.score!.black).toBeGreaterThan(end.score!.white);
  });
  it('engines answer in reasonable time', () => {
    for (const [name, f] of [['chess', () => C.chooseMove(C.newGame(), 3)], ['xiangqi', () => X.chooseMove(X.newGame(), 3)], ['shogi', () => S.chooseMove(S.newGame(), 3)], ['go', () => G.chooseMove(G.newGame(9), 4)]] as const) {
      const t0 = Date.now(); const m = f(); const ms = Date.now() - t0;
      expect(m).toBeGreaterThanOrEqual(0); expect(ms, name).toBeLessThan(4000);
    }
  }, 30000);
});
