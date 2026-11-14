import './nim.css';
import { useState } from 'react';
import { useT } from '../../core/i18n';
import { MatchPanel, useMatch } from '../../ui/useMatch';
import { chooseMove, encode, legal, LEVELS, newGame, nimSum, play, replay, START, type NState } from './rules';

export default function Nim() {
  const t = useT();
  const m = useMatch<NState>({ game: 'nim', key: 'gp.nim', levels: LEVELS, defaults: { opponent: 'ai', level: 2, human: 1, p2: 'guest' },
    newGame, replay, play, choose: (s, lv) => chooseMove(s, lv), legal, aiDelay: 600 });
  const { st } = m;
  const [hover, setHover] = useState<[number, number] | null>(null);
  const [showSum, setShowSum] = useState(false);
  const canAct = !m.over && !m.aiTurn;
  const lastM = st.moves[st.moves.length - 1];
  const status = st.winner ? t(`${m.nameOf(st.winner)} takes the last match and wins.`, `${m.nameOf(st.winner)}拿走最后一根，获胜。`, `${m.nameOf(st.winner)} son kibriti aldı ve kazandı.`)
    : m.thinking ? t(`${m.nameOf(st.turn)} is thinking…`, `${m.nameOf(st.turn)}思考中…`, `${m.nameOf(st.turn)} düşünüyor…`)
    : t(`${m.nameOf(st.turn)}: take as many as you like from one row.`, `${m.nameOf(st.turn)}：从一行里拿任意根。`, `${m.nameOf(st.turn)}: bir sıradan istediğin kadar al.`);
  const W = 7 * 26 + 20;
  return (
    <div className="play">
      <div className="play-main">
        <div className="statline"><span role="status" aria-live="polite">{status}</span><span className="muted num">{st.heaps.reduce((a, b) => a + b, 0)}</span></div>
        <svg className="ni-table" viewBox={`0 0 ${W} ${START.length * 60 + 20}`} role="group" aria-label={t('Rows of matches', '火柴', 'Kibrit sıraları')} onMouseLeave={() => setHover(null)}>
          {START.map((n, r) => {
            const left = st.heaps[r], x0 = (W - n * 26) / 2;
            return (
              <g key={r}>
                {Array.from({ length: n }, (_, k) => {
                  const gone = k >= left, x = x0 + k * 26 + 13, y = 20 + r * 60;
                  const hot = !gone && hover && hover[0] === r && k >= hover[1];
                  const justGone = gone && lastM !== undefined && (lastM >> 4) === r && k < left + (lastM & 15);
                  return (
                    <g key={k} className={'ni-match' + (gone ? ' gone' : '') + (hot ? ' hot' : '') + (justGone ? ' just' : '')}
                      onMouseEnter={() => !gone && setHover([r, k])} onClick={() => { if (canAct && !gone) { m.apply(encode(r, left - k)); setHover(null); } }}>
                      <rect x={x - 3} y={y} width={6} height={40} rx={2} className="ni-stick" />
                      <ellipse cx={x} cy={y + 2} rx={4.5} ry={5.5} className="ni-head" />
                      <rect x={x - 12} y={y - 6} width={24} height={52} fill="transparent" className={canAct && !gone ? 'pt' : ''} />
                    </g>
                  );
                })}
              </g>
            );
          })}
        </svg>
        <p className="muted small">{t('Tap a match to take it and every match to its right in that row. Whoever takes the last match wins.', '点一根火柴，就拿走它以及同一行右边的所有火柴。拿走最后一根的人获胜。', 'Bir kibrite dokununca o ve aynı sıradaki sağındakilerin hepsi alınır. Son kibriti alan kazanır.')}</p>
        <label className="check" htmlFor="ni-sum"><input id="ni-sum" type="checkbox" checked={showSum} onChange={e => setShowSum(e.target.checked)} /> {t('Show the rows in binary (the secret of Nim)', '用二进制显示每行（Nim的秘密）', 'Sıraları ikili sayıyla göster (Nim’in sırrı)')}</label>
        {showSum && (
          <table className="table ni-bin"><tbody>
            {st.heaps.map((h, r) => <tr key={r}><th>{h}</th>{[4, 2, 1].map(b => <td key={b}>{h & b ? 1 : 0}</td>)}</tr>)}
            <tr className="sum"><th>⊕</th>{[4, 2, 1].map(b => <td key={b}>{nimSum(st.heaps) & b ? 1 : 0}</td>)}</tr>
          </tbody></table>
        )}
      </div>
      <aside className="play-side"><MatchPanel id="ni" m={m} sides={[t('First', '先手', 'İlk'), t('Second', '后手', 'İkinci')]} /></aside>
    </div>
  );
}
