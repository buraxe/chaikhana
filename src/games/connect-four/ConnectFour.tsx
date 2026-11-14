import './connect-four.css';
import { useState } from 'react';
import { useT } from '../../core/i18n';
import { MatchPanel, useMatch } from '../../ui/useMatch';
import { chooseMove, COLS, isLegal, landing, LEVELS, newGame, play, replay, ROWS, type C4State } from './rules';

export default function ConnectFour() {
  const m = useMatch<C4State>({ game: 'connect-four', key: 'gp.c4', levels: LEVELS,
    defaults: { opponent: 'ai', level: 2, human: 1, p2: 'guest' },
    newGame, replay, play, choose: (s, lv) => chooseMove(s, lv), aiDelay: 300 });
  const { st } = m, t = useT();
  const [hover, setHover] = useState(-1);
  const [cursor, setCursor] = useState(3);
  const canPlay = !m.over && !m.aiTurn;
  const drop = (c: number) => { if (canPlay && isLegal(st, c)) m.apply(c); };
  const color = (c: number) => (c === 1 ? t('Red', '红方', 'Kırmızı') : t('Gold', '金方', 'Altın'));
  const win = new Set(st.line);
  const status = st.winner ? t(`${m.nameOf(st.winner)} wins with ${color(st.winner)}`, `${m.nameOf(st.winner)}（${color(st.winner)}）获胜`, `${m.nameOf(st.winner)} ${color(st.winner)} ile kazandı`)
    : st.draw ? t('Draw. The board is full.', '和棋，棋盘已满。', 'Berabere. Tahta doldu.')
    : m.thinking ? t(`${m.nameOf(st.turn)} is thinking…`, `${m.nameOf(st.turn)}思考中…`, `${m.nameOf(st.turn)} düşünüyor…`) : t(`${m.nameOf(st.turn)} to move (${color(st.turn)})`, `轮到${m.nameOf(st.turn)}（${color(st.turn)}）`, `Sıra ${m.nameOf(st.turn)} oyuncusunda (${color(st.turn)})`);
  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') { e.preventDefault(); setCursor(c => Math.max(0, c - 1)); }
    else if (e.key === 'ArrowRight') { e.preventDefault(); setCursor(c => Math.min(COLS - 1, c + 1)); }
    else if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') { e.preventDefault(); drop(cursor); }
    else if (/^[1-7]$/.test(e.key)) { setCursor(+e.key - 1); drop(+e.key - 1); }
  };
  const preview = hover >= 0 ? hover : cursor;
  const lastK = st.moves.length - 1;
  return (
    <div className="play">
      <div className="play-main">
        <div className="statline">
          <span role="status" aria-live="polite"><i className={'disc-dot p' + (st.winner || st.turn)} />{status}</span>
          <span className="muted">{t(`Move ${st.moves.length + (m.over ? 0 : 1)} of ${COLS * ROWS}`, `第${st.moves.length + (m.over ? 0 : 1)}步 / 共${COLS * ROWS}步`, `Hamle ${st.moves.length + (m.over ? 0 : 1)} / ${COLS * ROWS}`)}</span>
        </div>
        <svg className="c4" viewBox="0 0 7 7" role="application" tabIndex={0} onKeyDown={onKey} onMouseLeave={() => setHover(-1)}
          aria-label={t('Connect Four board, 7 columns. Left and right arrows choose a column, Enter drops a disc, or press 1 to 7.', '四子棋棋盘，共7列。左右方向键选列，回车落子，也可以按1到7。', 'Dört Bağla tahtası, 7 sütun. Sol ve sağ oklar sütun seçer, Enter pul bırakır; ya da 1–7 tuşlarına bas.')}>
          <defs>
            <mask id="c4-holes">
              <rect x="0" y="1" width="7" height="6" fill="#fff" />
              {Array.from({ length: COLS * ROWS }, (_, i) => <circle key={i} cx={(i % COLS) + 0.5} cy={Math.floor(i / COLS) + 1.5} r={0.39} fill="#000" />)}
            </mask>
          </defs>
          {canPlay && isLegal(st, preview) && <circle cx={preview + 0.5} cy={0.5} r={0.39} className={'disc p' + st.turn} opacity={0.75} />}
          {st.moves.map((col, k) => {
            const idx = landing(st.moves, k), r = Math.floor(idx / COLS);
            return <circle key={k} cx={col + 0.5} cy={r + 1.5} r={0.4} className={'disc p' + (k % 2 ? 2 : 1) + (k === lastK ? ' fall' : '')}
              style={k === lastK ? { ['--fy' as string]: `${-(r + 1)}px` } : undefined} />;
          })}
          <rect x="0" y="1" width="7" height="6" rx="0.18" className="c4-board" mask="url(#c4-holes)" />
          {st.line.length > 0 && [...win].map(i => <circle key={'w' + i} cx={(i % COLS) + 0.5} cy={Math.floor(i / COLS) + 1.5} r={0.18} className="c4-win" />)}
          {Array.from({ length: COLS }, (_, c) => (
            <rect key={'h' + c} x={c} y={0} width={1} height={7} fill="transparent" className={canPlay && isLegal(st, c) ? 'pt' : ''}
              onMouseEnter={() => setHover(c)} onClick={() => { setCursor(c); drop(c); }} />
          ))}
        </svg>
      </div>
      <aside className="play-side"><MatchPanel id="c4" m={m} sides={[t('Red (first)', '红（先手）', 'Kırmızı (ilk)'), t('Gold', '金', 'Altın')]} /></aside>
    </div>
  );
}
