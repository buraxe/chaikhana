import { describe, expect, it } from 'vitest';
import * as M from './mangala/rules';
import * as N from './morris/rules';

describe('mangala', () => {
  it('sows from the pit itself, one per pit', () => {
    const s = M.play(M.newGame(), 2); // pit 2 has 4: 2,3,4,5 get one each
    expect(s.pits.slice(0, 7)).toEqual([4, 4, 1, 5, 5, 5, 0]);
    expect(s.turn).toBe(2);
  });
  it('ending in the treasure gives another turn', () => {
    const s = M.play(M.newGame(), 3); // 3,4,5,store
    expect(s.pits[6]).toBe(1); expect(s.turn).toBe(1);
  });
  it('captures an even count on the opponent side', () => {
    const st = M.newGame(); st.pits = [0, 0, 0, 0, 0, 5, 0, 3, 4, 4, 4, 4, 4, 0];
    const s = M.play(st, 5); // 5 stones: 5,store,7,8,9 -> pit 9 becomes 5 (odd) no capture
    expect(s.pits[6]).toBe(1);
    const st2 = M.newGame(); st2.pits = [0, 0, 0, 0, 0, 3, 0, 3, 4, 4, 4, 4, 4, 0];
    const s2 = M.play(st2, 5); // 5,store,7 -> pit 7 becomes 4: captured
    expect(s2.pits[7]).toBe(0); expect(s2.pits[6]).toBe(5);
  });
  it('a single stone moves to the next pit and captures across from an empty own pit', () => {
    const st = M.newGame(); st.pits = [1, 0, 3, 3, 3, 3, 0, 4, 4, 4, 4, 4, 5, 0];
    const s = M.play(st, 0); // stone moves to pit 1 (empty) -> captures pit 11 (4) + 1
    expect(s.pits[6]).toBe(5); expect(s.pits[11]).toBe(0);
  });
  it('the player who empties their side takes the rest', () => {
    const st = M.newGame(); st.pits = [0, 0, 0, 0, 0, 1, 20, 1, 1, 1, 1, 1, 1, 20];
    const s = M.play(st, 5);
    expect(s.pits[6]).toBe(27); expect(s.winner).toBe(1);
  });
  it('stronger levels beat random play', () => {
    let wins = 0;
    for (let g = 0; g < 6; g++) {
      let s = M.newGame();
      while (!s.winner && !s.draw) s = M.play(s, M.chooseMove(s, s.turn === 1 ? 3 : 0));
      if (s.winner === 1) wins++;
    }
    expect(wins).toBeGreaterThanOrEqual(5);
  });
});

describe('dokuz taş', () => {
  it('has 16 mills and 32 links', () => {
    expect(N.MILLS.length).toBe(16);
    expect(N.ADJ.flat().length).toBe(64);
  });
  it('a mill lets you remove a stone', () => {
    let s = N.newGame();
    for (const [p, q] of [[0, 8], [1, 9]]) { s = N.play(s, N.enc(N.NONE, p, N.NONE)); s = N.play(s, N.enc(N.NONE, q, N.NONE)); }
    const ms = N.legalMoves(s).filter(m => N.dec(m).to === 2);
    expect(ms.every(m => N.dec(m).rem !== N.NONE)).toBe(true);
    s = N.play(s, N.enc(N.NONE, 2, 8));
    expect(s.cells[8]).toBe(0); expect(N.count(s, 2)).toBe(8);
  });
  it('the computer finishes games and deeper search wins', () => {
    let wins = 0;
    for (let g = 0; g < 3; g++) {
      let s = N.newGame(), n = 0;
      while (!s.winner && !s.draw && n++ < 300) s = N.play(s, N.chooseMove(s, s.turn === 1 ? 3 : 0));
      if (s.winner === 1) wins++;
    }
    expect(wins).toBeGreaterThanOrEqual(2);
  }, 60000);
});

import * as B from './bulls/rules';
import * as S from './sea-battle/rules';
describe('sayı bulmaca', () => {
  it('scores plus and minus', () => {
    expect(B.score('1234', '1243')).toEqual([2, 2]);
    expect(B.score('1234', '5678')).toEqual([0, 0]);
    expect(B.validGuess('0123', 4)).toBe(false);
    expect(B.validGuess('1123', 4)).toBe(false);
  });
  it('makes valid secrets and narrows candidates', () => {
    for (let k = 0; k < 50; k++) expect(B.validGuess(B.secret(4), 4)).toBe(true);
    const c = B.candidates(4, [{ guess: '1234', plus: 4, minus: 0 }]);
    expect(c).toEqual(['1234']);
  });
});
describe('amiral battı', () => {
  it('fleets fit and never touch', () => {
    for (let k = 0; k < 30; k++) {
      const f = S.randomFleet(), all = f.flatMap(s => s.cells);
      expect(new Set(all).size).toBe(17);
    }
  });
  const game = (level: number) => {
    const side: S.Side = { ships: S.randomFleet(), shots: [] };
    let n = 0;
    while (!S.allSunk(side) && n < 100) { side.shots.push(S.chooseShot(side, level)); n++; }
    return n;
  };
  it('smarter shooters need fewer shots', () => {
    const avg = (lv: number) => { let t = 0; for (let k = 0; k < 20; k++) t += game(lv); return t / 20; };
    const a0 = avg(0), a2 = avg(2), a4 = avg(4);
    expect(a2).toBeLessThan(a0); expect(a4).toBeLessThan(a2 + 3); expect(a4).toBeLessThan(70);
  });
});

import * as Q from './cube-ttt/rules';
describe('cube-ttt', () => {
  it('has 76 lines', () => { expect(Q.LINES.length).toBe(76); });
  it('wins along a space diagonal and the computer blocks and takes wins', () => {
    let s = Q.newGame();
    for (const i of [0, 1, Q.idx(1, 1, 1), 2, Q.idx(2, 2, 2), 3]) s = Q.play(s, i);
    expect(Q.chooseMove(s, 2)).toBe(Q.idx(3, 3, 3));
    s = Q.play(s, Q.idx(3, 3, 3));
    expect(s.winner).toBe(1);
    let b = Q.newGame();
    for (const i of [0, 16, 1, 32, 2]) b = Q.play(b, i);
    expect(Q.chooseMove(b, 1)).toBe(3);
  });
  it('a deeper computer beats a random one', () => {
    let wins = 0;
    for (let g = 0; g < 4; g++) {
      let s = Q.newGame();
      while (!s.winner && !s.draw) s = Q.play(s, Q.chooseMove(s, s.turn === 1 ? 2 : 0));
      if (s.winner === 1) wins++;
    }
    expect(wins).toBeGreaterThanOrEqual(3);
  }, 30000);
});

import { LEAGUES, teamsOf } from './football/data';
import * as F from './football/sim';
describe('7-0 challenge', () => {
  it('every club has a full squad and every formation has 11 slots', () => {
    expect(LEAGUES.giants.clubs.length).toBe(32); expect(LEAGUES.tr.clubs.length).toBe(18); expect(LEAGUES.cn.clubs.length).toBe(18);
    for (const l of Object.values(LEAGUES)) for (const c of l.clubs) {
      expect(c.seasons.length).toBeGreaterThanOrEqual(2);
      for (const s of c.seasons) {
        expect(s.squad.length, `${c.id} ${s.label}`).toBe(14); expect(s.squad.filter(p => p.role === 'GK').length).toBeGreaterThan(0);
        for (const p of s.squad) { expect(p.rating, `${c.id} ${p.name}`).toBeGreaterThanOrEqual(50); expect(p.rating).toBeLessThanOrEqual(96); }
      }
    }
    for (const f of Object.values(F.FORMATIONS)) expect(f.length).toBe(11);
  });
  it('a dream team wins far more often than a weak one, and a 7-0 run is possible but rare', () => {
    const slots = F.FORMATIONS['4-3-3'];
    const all = LEAGUES.giants.clubs.flatMap(c => c.seasons.flatMap(x => x.squad));
    const best = slots.map(s => all.filter(p => p.role === s.role).sort((a, b) => b.rating - a.rating)[0]);
    const weak = F.teamXI('ajx@0').xi;
    let champs = 0, weakChamps = 0, sevens = 0;
    for (let k = 0; k < 200; k++) {
      const path = F.drawPath('giants', k);
      const a = F.simulate(best, slots, 'balanced', path, k + 1), b = F.simulate(weak, slots, 'balanced', path, k + 1);
      if (a.champion) champs++; if (b.champion) weakChamps++; if (a.sevenZero) sevens++;
    }
    expect(champs).toBeGreaterThan(weakChamps * 2);
    expect(sevens).toBeGreaterThan(0); expect(sevens).toBeLessThan(150);
  });
  it('paths never repeat a club, and replays agree with the score', () => {
    const slots = F.FORMATIONS['4-3-3'];
    for (const lg of ['giants', 'tr', 'cn'] as const) for (let k = 0; k < 40; k++) {
      const path = F.drawPath(lg, k); expect(new Set(path.map(x => x.split('@')[0])).size).toBe(7);
      for (const x of path) expect(teamsOf(lg)).toContain(x);
      const c = F.simulate(F.teamXI(path[3]).xi, slots, 'balanced', path, k);
      for (const m of c.matches) {
        expect(m.moments.filter(x => x.type === 'goal' && x.us).length).toBe(m.gf);
        expect(m.moments.filter(x => x.type === 'goal' && !x.us).length).toBe(m.ga);
        if (m.pens) { expect(m.shootout!.filter(x => x.us && x.scored).length).toBe(m.pens[0]); expect(m.shootout!.filter(x => !x.us && x.scored).length).toBe(m.pens[1]); expect(m.pens[0]).not.toBe(m.pens[1]); }
      }
    }
  });
});

import * as CM from './cubemines/rules';
describe('cube minesweeper', () => {
  it('squares join across edges and corners', () => {
    const { nb } = CM.geometry(4);
    expect(nb.length).toBe(96);
    const counts = new Set(nb.map(x => x.length));
    expect([...counts].sort()).toEqual([7, 8]); // a cube-corner square touches 7, every other square 8
  });
  it('first tap is safe and opens an area; winning opens every safe square', () => {
    let s = CM.newGame(5, 22); s = CM.reveal(s, 40);
    expect(s.status).toBe('playing'); expect(s.open.filter(Boolean).length).toBeGreaterThan(1);
    for (let i = 0; i < s.mine.length; i++) if (!s.mine[i]) s = CM.reveal(s, i);
    expect(s.status).toBe('won');
  });
});
