import './chinese-checkers.css';
import { useMemo, useState } from 'react';
import { useT } from '../../core/i18n';
import { MatchPanel, useMatch } from '../../ui/useMatch';
import { chooseMove, GOAL, HOLES, legalMoves, LEVELS, MAX_PLY, movesFrom, newGame, play, winner, xy, type CState } from './rules';

interface W { c: CState; moves: number[]; turn: 1 | 2; winner: 0 | 1 | 2; draw: boolean }
const wrap = (c: CState, moves: number[]): W => { const w = winner(c); return { c, moves, turn: c.turn, winner: w, draw: !w && c.ply >= MAX_PLY }; };
const fresh = () => wrap(newGame(), []);
const step = (w: W, k: number): W => { const ms = legalMoves(w.c); return w.winner || w.draw || !ms[k] ? w : wrap(play(w.c, ms[k]), [...w.moves, k]); };
const replay = (moves: number[]) => moves.reduce(step, fresh());
const choose = (w: W, lv: number) => { const m = chooseMove(w.c, lv), ms = legalMoves(w.c); return ms.findIndex(x => x.path[0] === m.path[0] && x.path[x.path.length - 1] === m.path[m.path.length - 1]); };
const legal = (w: W) => legalMoves(w.c).map((_, k) => k);
const R = 0.36;
const P = HOLES.map((_, i) => xy(i));
const minX = Math.min(...P.map(p => p[0])) - 0.8, minY = Math.min(...P.map(p => p[1])) - 0.8;
const W_ = Math.max(...P.map(p => p[0])) - minX + 0.8, H_ = Math.max(...P.map(p => p[1])) - minY + 0.8;

export default function ChineseCheckers() {
  const t = useT();
  const m = useMatch<W>({ game: 'chinese-checkers', key: 'gp.cchk', levels: LEVELS, defaults: { opponent: 'ai', level: 2, human: 1, p2: 'guest' },
    newGame: fresh, replay, play: step, choose, legal, aiDelay: 300 });
  const { st } = m, c = st.c;
  const [sel, setSel] = useState(-1);
  const canAct = !m.over && !m.aiTurn;
  const moves = useMemo(() => legalMoves(c), [c]);
  const dests = useMemo(() => (sel >= 0 ? movesFrom(c.cells, sel) : []), [c, sel]);
  const last = c.history[c.history.length - 1];
  const click = (i: number) => {
    if (!canAct) return;
    if (c.cells[i] === st.turn) { setSel(i === sel ? -1 : i); return; }
    const d = dests.find(x => x.path[x.path.length - 1] === i);
    if (sel >= 0 && d) {
      const k = moves.findIndex(x => x.path[0] === sel && x.path[x.path.length - 1] === i);
      if (k >= 0) { m.apply(k); setSel(-1); }
    } else setSel(-1);
  };
  const colour = (p: number) => (p === 1 ? t('Red', '红方', 'Kırmızı') : t('Green', '绿方', 'Yeşil'));
  const home = (p: 1 | 2) => GOAL[p].filter(i => c.cells[i] === p).length;
  const status = st.winner ? t(`${m.nameOf(st.winner)} wins with ${colour(st.winner)}`, `${m.nameOf(st.winner)}（${colour(st.winner)}）获胜`, `${m.nameOf(st.winner)} ${colour(st.winner)} ile kazandı`)
    : st.draw ? t('Draw: the move limit is reached.', '和棋：已达步数上限。', 'Berabere: hamle sınırı doldu.')
    : m.thinking ? t(`${m.nameOf(st.turn)} is thinking…`, `${m.nameOf(st.turn)}思考中…`, `${m.nameOf(st.turn)} düşünüyor…`)
    : t(`${m.nameOf(st.turn)} to move (${colour(st.turn)})`, `轮到${m.nameOf(st.turn)}（${colour(st.turn)}）`, `Sıra ${m.nameOf(st.turn)} oyuncusunda (${colour(st.turn)})`);
  const trail = last ? last.path.map(i => P[i]) : [];
  return (
    <div className="play">
      <div className="play-main">
        <div className="statline"><span role="status" aria-live="polite">{status}</span>
          <span className="muted num">{t(`Home: red ${home(1)}/10 · green ${home(2)}/10`, `到达：红${home(1)}/10 · 绿${home(2)}/10`, `Varan: kırmızı ${home(1)}/10 · yeşil ${home(2)}/10`)}</span></div>
        <svg className="cc-board" viewBox={`${minX} ${minY} ${W_} ${H_}`} role="application" aria-label={t('Chinese checkers star. Click a marble, then a highlighted hole.', '跳棋星盘。先点弹珠，再点亮起的孔。', 'Çin daması yıldızı. Bir bilyeye, sonra parlayan deliğe tıkla.')}>
          {/* The star is two big triangles; their corners in cube coordinates, pushed out a little. */}
          {[[[8, -4, -4], [-4, 8, -4], [-4, -4, 8]], [[-8, 4, 4], [4, -8, 4], [4, 4, -8]]].map((tri, k) => (
            <polygon key={k} className="cc-star" points={tri.map(([x, , z]) => `${(x + z / 2) * 1.13},${z * 0.866 * 1.13}`).join(' ')} />
          ))}
          {GOAL[1].map(i => <circle key={'g1' + i} cx={P[i][0]} cy={P[i][1]} r={R + 0.1} className="cc-zone z1" />)}
          {GOAL[2].map(i => <circle key={'g2' + i} cx={P[i][0]} cy={P[i][1]} r={R + 0.1} className="cc-zone z2" />)}
          {trail.length > 1 && <polyline points={trail.map(p => p.join(',')).join(' ')} className="cc-trail" />}
          {HOLES.map((_, i) => {
            const v = c.cells[i], isDest = dests.some(d => d.path[d.path.length - 1] === i);
            return (
              <g key={i} onClick={() => click(i)} className={canAct ? 'pt' : ''}>
                <circle cx={P[i][0]} cy={P[i][1]} r={R * 0.55} className="cc-hole" />
                {isDest && <circle cx={P[i][0]} cy={P[i][1]} r={R * 0.7} className="cc-dest" />}
                {v > 0 && <circle cx={P[i][0]} cy={P[i][1]} r={R} className={'cc-m p' + v + (i === sel ? ' sel' : '') + (canAct && v === st.turn ? ' mine' : '')} />}
                <circle cx={P[i][0]} cy={P[i][1]} r={0.5} fill="transparent" />
              </g>
            );
          })}
        </svg>
        <p className="muted small">{t('Step to a neighbouring hole, or hop over one marble of either colour to the empty hole beyond, as many hops as you like. Fill the opposite point with all ten.', '可以走到相邻的空孔，或者跳过相邻的一颗弹珠（任何颜色）落到后面的空孔，可以连跳。把十颗弹珠全部送到对面的角里。', 'Komşu deliğe bir adım at ya da herhangi renkte bir bilyenin üstünden arkadaki boş deliğe atla; istediğin kadar art arda atlayabilirsin. On bilyenin hepsiyle karşı köşeyi doldur.')}</p>
      </div>
      <aside className="play-side"><MatchPanel id="cc" m={m} sides={[t('Red (first)', '红（先手）', 'Kırmızı (ilk)'), t('Green', '绿', 'Yeşil')]} /></aside>
    </div>
  );
}
