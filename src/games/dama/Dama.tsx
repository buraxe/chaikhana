import './dama.css';
import { useMemo, useState } from 'react';
import { useT } from '../../core/i18n';
import { MatchPanel, useMatch } from '../../ui/useMatch';
import { chooseMove, legalMoves, LEVELS, newGame, outcome, play, sameMove, type DState } from './rules';

/** The shared match loop works with move numbers: a move is its index in the legal move list. */
interface W { d: DState; moves: number[]; turn: 1 | 2; winner: 0 | 1 | 2; draw: boolean }
const wrap = (d: DState, moves: number[]): W => { const o = outcome(d); return { d, moves, turn: d.turn === 1 ? 1 : 2, winner: o === 1 ? 1 : o === -1 ? 2 : 0, draw: o === 0 }; };
const fresh = () => wrap(newGame(), []);
const step = (w: W, k: number): W => { const ms = legalMoves(w.d); return w.winner || w.draw || !ms[k] ? w : wrap(play(w.d, ms[k]), [...w.moves, k]); };
const replay = (moves: number[]) => moves.reduce(step, fresh());
const choose = (w: W, lv: number) => { const m = chooseMove(w.d, lv); return legalMoves(w.d).findIndex(x => sameMove(x, m)); };

export default function Dama() {
  const t = useT();
  const m = useMatch<W>({ game: 'dama', key: 'gp.dama', levels: LEVELS, defaults: { opponent: 'ai', level: 2, human: 1, p2: 'guest' },
    newGame: fresh, replay, play: step, choose, aiDelay: 350 });
  const { st } = m, d = st.d;
  const [path, setPath] = useState<number[]>([]);
  const legal = useMemo(() => legalMoves(d), [d]);
  const canAct = !m.over && !m.aiTurn;
  const cands = legal.map((mv, k) => ({ mv, k })).filter(({ mv }) => path.every((p, i) => mv.path[i] === p));
  const next = new Set(path.length ? cands.map(c => c.mv.path[path.length]).filter(x => x !== undefined) : []);
  const finals = new Set(path.length ? cands.map(c => c.mv.path[c.mv.path.length - 1]) : []);
  const movable = new Set(legal.map(mv => mv.path[0]));
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
  const status = st.winner ? t(`${m.nameOf(st.winner)} wins with ${side(st.winner)}`, `${m.nameOf(st.winner)}（${side(st.winner)}）获胜`, `${m.nameOf(st.winner)} ${side(st.winner)} ile kazandı`)
    : st.draw ? t('Draw.', '和棋。', 'Berabere.')
    : m.thinking ? t(`${m.nameOf(st.turn)} is thinking…`, `${m.nameOf(st.turn)}思考中…`, `${m.nameOf(st.turn)} düşünüyor…`)
    : t(`${m.nameOf(st.turn)} to move (${side(st.turn)})`, `轮到${m.nameOf(st.turn)}（${side(st.turn)}）`, `Sıra ${m.nameOf(st.turn)} oyuncusunda (${side(st.turn)})`) + (legal[0]?.captured.length ? t(` · must capture ${legal[0].captured.length}`, ` · 必须吃${legal[0].captured.length}子`, ` · ${legal[0].captured.length} taş almak zorunlu`) : '');
  return (
    <div className="play">
      <div className="play-main">
        <div className="statline"><span role="status" aria-live="polite">{status}</span>
          <span className="muted">{t(`White ${d.cells.filter(v => v > 0).length} · Black ${d.cells.filter(v => v < 0).length}`, `白${d.cells.filter(v => v > 0).length} · 黑${d.cells.filter(v => v < 0).length}`, `Beyaz ${d.cells.filter(v => v > 0).length} · Siyah ${d.cells.filter(v => v < 0).length}`)}</span></div>
        <svg className="dm-board" viewBox="0 0 8 8" role="application" aria-label={t('Dama board. Click a piece, then where it should go.', '土耳其跳棋棋盘。先点棋子，再点目标格。', 'Dama tahtası. Bir taşa, sonra gideceği yere tıkla.')}>
          <rect width="8" height="8" className="dm-wood" />
          {Array.from({ length: 64 }, (_, i) => {
            const r = Math.floor(i / 8), c = i % 8;
            const cls = ['dm-sq', path[0] === i ? 'sel' : '', next.has(i) || finals.has(i) ? 'target' : '', lastMove && (lastMove.path[0] === i || lastMove.path[lastMove.path.length - 1] === i) ? 'last' : ''].join(' ');
            return <rect key={i} x={c} y={r} width={1} height={1} className={cls} />;
          })}
          {Array.from({ length: 9 }, (_, k) => <g key={'l' + k} className="dm-line"><line x1={k} y1={0} x2={k} y2={8} /><line x1={0} y1={k} x2={8} y2={k} /></g>)}
          {d.cells.map((v, i) => {
            if (!v) return null;
            const cx = (i % 8) + 0.5, cy = Math.floor(i / 8) + 0.5;
            return (
              <g key={i} className={'dm-piece ' + (v > 0 ? 'w' : 'b') + (canAct && movable.has(i) ? ' movable' : '')}>
                <circle cx={cx} cy={cy + 0.04} r={0.38} className="dm-shadow" />
                <circle cx={cx} cy={cy} r={0.38} />
                <circle cx={cx} cy={cy} r={0.26} className="dm-inner" />
                {Math.abs(v) === 2 && <path d={`M${cx - 0.18} ${cy + 0.08}l.06-.2.12.12.12-.12.06.2z`} className="dm-crown" />}
              </g>
            );
          })}
          {Array.from({ length: 64 }, (_, i) => <rect key={'h' + i} x={i % 8} y={Math.floor(i / 8)} width={1} height={1} fill="transparent" onClick={() => click(i)} className={canAct ? 'pt' : ''} />)}
        </svg>
        <p className="muted small">{t('Pieces move forward or sideways. Capturing is compulsory, and you must take the most pieces possible. For a multiple capture, click each landing square in turn, or just the final one if there is only one way there.',
          '棋子只能向前或横走。有吃必吃，并且必须吃最多的子。连吃时依次点击每个落点；如果只有一种路线，直接点最终落点即可。', 'Taşlar ileri ya da yana gider. Taş almak zorunludur ve alınabilecek en çok taşı almalısın. Çoklu alışta her iniş karesine sırayla tıkla; oraya tek yol varsa yalnızca son kareye tıklaman yeter.')}</p>
      </div>
      <aside className="play-side"><MatchPanel id="dm" m={m} sides={[t('White (first)', '白（先手）', 'Beyaz (ilk)'), t('Black', '黑', 'Siyah')]} /></aside>
    </div>
  );
}
