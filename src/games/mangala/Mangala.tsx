import './mangala.css';
import { useT } from '../../core/i18n';
import { MatchPanel, useMatch } from '../../ui/useMatch';
import { chooseMove, isLegal, legal, LEVELS, newGame, pitsOf, play, replay, STORE, type MState } from './rules';

/** Stones laid out in a loose cluster; past 12 the count does the talking. */
function Stones({ n, cx, cy, r }: { n: number; cx: number; cy: number; r: number }) {
  const shown = Math.min(n, 12), out = [];
  for (let k = 0; k < shown; k++) {
    const a = k * 2.399, d = Math.sqrt(k + 0.5) * r * 0.26;
    out.push(<circle key={k} cx={cx + Math.cos(a) * d} cy={cy + Math.sin(a) * d} r={r * 0.17} className={'mg-stone s' + (k % 4)} />);
  }
  return <>{out}</>;
}

export default function Mangala() {
  const t = useT();
  const m = useMatch<MState>({ game: 'mancala', key: 'gp.mangala', levels: LEVELS, defaults: { opponent: 'ai', level: 2, human: 1, p2: 'guest' },
    newGame, replay, play, choose: (s, lv) => chooseMove(s, lv), legal, aiDelay: 650 });
  const { st } = m;
  const canPlay = !m.over && !m.aiTurn;
  const side = (p: number) => (p === 1 ? t('South', '南方', 'Güney') : t('North', '北方', 'Kuzey'));
  const status = st.winner ? t(`${m.nameOf(st.winner)} wins ${Math.max(st.pits[6], st.pits[13])}–${Math.min(st.pits[6], st.pits[13])}`, `${m.nameOf(st.winner)}以${Math.max(st.pits[6], st.pits[13])}比${Math.min(st.pits[6], st.pits[13])}获胜`, `${m.nameOf(st.winner)} ${Math.max(st.pits[6], st.pits[13])}–${Math.min(st.pits[6], st.pits[13])} kazandı`)
    : st.draw ? t('Draw, 24–24.', '平局，24比24。', 'Berabere, 24–24.')
    : (st.moves.length && st.turn === (st.moves.length > 0 ? replay(st.moves.slice(0, -1)).turn : 0) ? t('Last stone in the treasure: another turn. ', '最后一颗落入宝库：再走一次。', 'Son taş hazineye düştü: bir hamle daha. ') : '')
      + (m.thinking ? t(`${m.nameOf(st.turn)} is thinking…`, `${m.nameOf(st.turn)}思考中…`, `${m.nameOf(st.turn)} düşünüyor…`) : t(`${m.nameOf(st.turn)} to move (${side(st.turn)})`, `轮到${m.nameOf(st.turn)}（${side(st.turn)}）`, `Sıra ${m.nameOf(st.turn)} oyuncusunda (${side(st.turn)})`));
  // Layout: 8 columns. North pits 12…7 left to right on top, south pits 0…5 below; north's treasure on the left, south's on the right.
  // Playing North against the computer turns the board round so your pits are still at the bottom.
  const flip = m.cfg.opponent === 'ai' && m.cfg.human === 2;
  const pitXY = (i: number): [number, number] => { const p: [number, number] = i <= 5 ? [1.5 + i, 2.6] : [1.5 + (12 - i), 1.0]; return flip ? [8 - p[0], 3.6 - p[1]] : p; };
  const below = (i: number) => (i <= 5) !== flip;
  const click = (i: number) => {
    if (!canPlay) return;
    const own = pitsOf(st.turn).indexOf(i);
    if (own >= 0 && isLegal(st, own)) m.apply(own);
  };
  const capt = new Set(st.captured);
  return (
    <div className="play">
      <div className="play-main">
        <div className="statline"><span role="status" aria-live="polite">{status}</span></div>
        <svg className="mg-board" viewBox="0 0 8 3.6" role="application" aria-label={t('Mangala board. Your pits are on the bottom row; tap one to sow its stones.', '播棋棋盘。你的坑在下排，点一个坑来播种。', 'Mangala tahtası. Senin kuyuların alt sırada; taşlarını dağıtmak için birine dokun.')}>
          <rect x="0.05" y="0.05" width="7.9" height="3.5" rx="0.5" className="mg-wood" />
          {[13, 6].map(s => {
            const x = (s === 13) !== flip ? 0.55 : 7.45, top = (s === 13) !== flip;
            return (
              <g key={s}>
                <rect x={x - 0.38} y="0.45" width="0.76" height="2.7" rx="0.38" className={'mg-store' + (st.last === s ? ' last' : '')} />
                <Stones n={st.pits[s]} cx={x} cy={1.8} r={0.9} />
                <text x={x} y={top ? 0.36 : 3.42} className="mg-count big" textAnchor="middle">{st.pits[s]}</text>
              </g>
            );
          })}
          {Array.from({ length: 12 }, (_, k) => {
            const i = k < 6 ? k : k + 1, [x, y] = pitXY(i), own = pitsOf(st.turn).indexOf(i), live = canPlay && own >= 0 && isLegal(st, own);
            return (
              <g key={i} className={live ? 'pt' : ''} onClick={() => click(i)}>
                <circle cx={x} cy={y} r={0.42} className={'mg-pit' + (live ? ' live' : '') + (st.last === i ? ' last' : '') + (capt.has(i) ? ' capt' : '')} />
                <Stones n={st.pits[i]} cx={x} cy={y} r={0.42} />
                <text x={x} y={below(i) ? y + 0.66 : y - 0.5} className="mg-count" textAnchor="middle">{st.pits[i]}</text>
              </g>
            );
          })}
        </svg>
      </div>
      <aside className="play-side">
        <MatchPanel id="mg" m={m} sides={[t('South (first)', '南方（先手）', 'Güney (ilk)'), t('North', '北方', 'Kuzey')]} />
        <p className="muted small">{t('Pick up a pit and sow counter-clockwise, one stone per pit, starting with the pit itself. Land in your treasure for another turn; make an opponent pit even to take it; land in an empty pit of your own to take the stones opposite.', '拿起一个坑里的石子，从该坑本身开始逆时针每坑放一颗。最后一颗落入自己的宝库可再走一次；让对方的坑变成双数即可吃掉；落在自己的空坑则吃掉对面的石子。', 'Bir kuyuyu al ve taşları, kuyunun kendisinden başlayarak saat yönünün tersine birer birer dağıt. Son taş hazinene düşerse bir hamle daha; rakibin bir kuyusunu çift yaparsan onu alırsın; kendi boş kuyuna düşersen karşısındaki taşları alırsın.')}</p>
      </aside>
    </div>
  );
}
