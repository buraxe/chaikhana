import './draughts.css';
import { useMemo, useState } from 'react';
import { useT } from '../../core/i18n';
import { MatchPanel, useMatch } from '../../ui/useMatch';
import { chooseMove, legalMoves, LEVELS, N, newGame, outcome, play, sameMove, type XState } from './rules';

/** The match loop works with move numbers: a move is its index in the legal move list. */
interface W { d: XState; moves: number[]; turn: 1 | 2; winner: 0 | 1 | 2; draw: boolean }
const wrap = (d: XState, moves: number[]): W => { const o = outcome(d); return { d, moves, turn: d.turn === 1 ? 1 : 2, winner: o === 1 ? 1 : o === -1 ? 2 : 0, draw: o === 0 }; };
const fresh = () => wrap(newGame(), []);
const step = (w: W, k: number): W => { const ms = legalMoves(w.d); return w.winner || w.draw || !ms[k] ? w : wrap(play(w.d, ms[k]), [...w.moves, k]); };
const replay = (moves: number[]) => moves.reduce(step, fresh());
const choose = (w: W, lv: number) => { const m = chooseMove(w.d, lv); return legalMoves(w.d).findIndex(x => sameMove(x, m)); };
const legal = (w: W) => legalMoves(w.d).map((_, k) => k);

export default function Draughts() {
  const t = useT();
  const m = useMatch<W>({ game: 'checkers', key: 'gp.draughts', levels: LEVELS, defaults: { opponent: 'ai', level: 2, human: 1, p2: 'guest' },
    newGame: fresh, replay, play: step, choose, legal, aiDelay: 350 });
  const { st } = m, d = st.d;
  const [path, setPath] = useState<number[]>([]);
  const moves = useMemo(() => legalMoves(d), [d]);
  const canAct = !m.over && !m.aiTurn;
  const cands = moves.map((mv, k) => ({ mv, k })).filter(({ mv }) => path.every((p, i) => mv.path[i] === p));
  const next = new Set(path.length ? cands.map(c => c.mv.path[path.length]).filter(x => x !== undefined) : []);
  const finals = new Set(path.length ? cands.map(c => c.mv.path[c.mv.path.length - 1]) : []);
  const movable = new Set(moves.map(mv => mv.path[0]));
  const lastMove = d.history[d.history.length - 1];
  const click = (i: number) => {
    if (!canAct) return;
    if (!path.length || (movable.has(i) && i !== path[0] && !next.has(i))) { setPath(movable.has(i) ? [i] : []); return; }
    const byFinal = cands.filter(c => c.mv.path[c.mv.path.length - 1] === i);
    if (byFinal.length === 1) { m.apply(byFinal[0].k); setPath([]); return; }
    if (next.has(i)) {
      const np = [...path, i], left = cands.filter(c => np.every((p, j) => c.mv.path[j] === p));
      if (left.length === 1 && left[0].mv.path.length === np.length) { m.apply(left[0].k); setPath([]); } else setPath(np);
      return;
    }
    setPath([]);
  };
  const side = (c: number) => (c === 1 ? t('White', '白方', 'Beyaz') : t('Black', '黑方', 'Siyah'));
  const must = moves[0]?.captured.length ?? 0;
  const status = st.winner ? t(`${m.nameOf(st.winner)} wins with ${side(st.winner)}`, `${m.nameOf(st.winner)}（${side(st.winner)}）获胜`, `${m.nameOf(st.winner)} ${side(st.winner)} ile kazandı`)
    : st.draw ? t('Draw.', '和棋。', 'Berabere.')
    : m.thinking ? t(`${m.nameOf(st.turn)} is thinking…`, `${m.nameOf(st.turn)}思考中…`, `${m.nameOf(st.turn)} düşünüyor…`)
    : t(`${m.nameOf(st.turn)} to move (${side(st.turn)})`, `轮到${m.nameOf(st.turn)}（${side(st.turn)}）`, `Sıra ${m.nameOf(st.turn)} oyuncusunda (${side(st.turn)})`) + (must ? t(` · must take ${must}`, ` · 必须吃${must}子`, ` · ${must} taş almak zorunlu`) : '');
  const count = (s: number) => d.cells.filter(v => Math.sign(v) === s).length;
  return (
    <div className="play">
      <div className="play-main">
        <div className="statline"><span role="status" aria-live="polite">{status}</span>
          <span className="muted">{t(`White ${count(1)} · Black ${count(-1)}`, `白${count(1)} · 黑${count(-1)}`, `Beyaz ${count(1)} · Siyah ${count(-1)}`)}</span></div>
        <svg className="xd-board" viewBox={`0 0 ${N} ${N}`} role="application" aria-label={t('Draughts board, 10 by 10. Click a piece, then where it should go.', '10×10国际跳棋棋盘。先点棋子，再点目标格。', '10×10 dama tahtası. Bir taşa, sonra gideceği yere tıkla.')}>
          {Array.from({ length: N * N }, (_, i) => {
            const r = Math.floor(i / N), c = i % N, dk = (r + c) % 2 === 1;
            const cls = ['xd-sq', dk ? 'dk' : 'lt', path[0] === i ? 'sel' : '', next.has(i) || finals.has(i) ? 'target' : '', lastMove && (lastMove.path[0] === i || lastMove.path[lastMove.path.length - 1] === i) ? 'last' : ''].join(' ');
            return <rect key={i} x={c} y={r} width={1} height={1} className={cls} />;
          })}
          {lastMove && lastMove.captured.map(i => <circle key={'x' + i} cx={(i % N) + 0.5} cy={Math.floor(i / N) + 0.5} r={0.12} className="xd-ghost" />)}
          {d.cells.map((v, i) => {
            if (!v) return null;
            const cx = (i % N) + 0.5, cy = Math.floor(i / N) + 0.5;
            return (
              <g key={i} className={'xd-piece ' + (v > 0 ? 'w' : 'b') + (canAct && movable.has(i) ? ' movable' : '')}>
                <circle cx={cx} cy={cy + 0.05} r={0.4} className="xd-shadow" />
                <circle cx={cx} cy={cy} r={0.4} />
                <circle cx={cx} cy={cy} r={0.27} className="xd-inner" />
                {Math.abs(v) === 2 && <path d={`M${cx - 0.19} ${cy + 0.09}l.06-.21.13.13.13-.13.06.21z`} className="xd-crown" />}
              </g>
            );
          })}
          {Array.from({ length: N * N }, (_, i) => <rect key={'h' + i} x={i % N} y={Math.floor(i / N)} width={1} height={1} fill="transparent" onClick={() => click(i)} className={canAct ? 'pt' : ''} />)}
        </svg>
        <p className="muted small">{t('Men move diagonally forward but capture in every direction; kings fly along whole diagonals. Taking is compulsory and you must take the most pieces you can. For a multiple capture, click each landing square in turn, or just the last one if there is only one way.',
          '兵斜着向前走，但可以向四个方向吃子；王可以沿整条斜线飞行。有吃必吃，并且必须吃最多的子。连吃时依次点击每个落点；只有一种路线时直接点最后的落点。', 'Taşlar çapraz ileri gider ama her yöne alır; damalar bütün çapraz boyunca uçar. Almak zorunludur ve alabileceğin en çok taşı almalısın. Çoklu alışta her iniş karesine sırayla, tek yol varsa yalnızca sonuncusuna tıkla.')}</p>
      </div>
      <aside className="play-side"><MatchPanel id="xd" m={m} sides={[t('White (first)', '白（先手）', 'Beyaz (ilk)'), t('Black', '黑', 'Siyah')]} /></aside>
    </div>
  );
}
