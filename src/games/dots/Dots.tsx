import './dots.css';
import { useState } from 'react';
import { useT } from '../../core/i18n';
import { loadJSON, saveJSON } from '../../core/storage';
import { Seg } from '../../ui/bits';
import { MatchPanel, useMatch } from '../../ui/useMatch';
import { chooseMove, edgeCount, LEVELS, newGame, play, replay, type DState } from './rules';

function Board({ size }: { size: number }) {
  const t = useT();
  const m = useMatch<DState>({ game: 'dots-boxes', key: 'gp.dots.' + size, levels: LEVELS, defaults: { opponent: 'ai', level: 2, human: 1, p2: 'guest' },
    newGame: () => newGame(size, size), replay: mv => replay(size, size, mv), play, choose: (s, lv) => chooseMove(s, lv), aiDelay: 450 });
  const { st } = m, r = st.r, c = st.c;
  // Who drew each line, by replaying turns.
  const drawer = new Map<number, number>();
  { let s = newGame(r, c); for (const e of st.moves) { drawer.set(e, s.turn); s = play(s, e); } }
  const can = !m.over && !m.aiTurn, last = st.moves[st.moves.length - 1];
  const a = st.owner.filter(o => o === 1).length, z = st.owner.filter(o => o === 2).length;
  const line = (e: number) => {
    const H = (r + 1) * c;
    if (e < H) { const row = Math.floor(e / c), col = e % c; return { x1: col, y1: row, x2: col + 1, y2: row }; }
    const k = e - H, row = Math.floor(k / (c + 1)), col = k % (c + 1);
    return { x1: col, y1: row, x2: col, y2: row + 1 };
  };
  const status = st.winner ? t(`${m.nameOf(st.winner)} wins ${Math.max(a, z)}–${Math.min(a, z)}`, `${m.nameOf(st.winner)}以${Math.max(a, z)}比${Math.min(a, z)}获胜`, `${m.nameOf(st.winner)} ${Math.max(a, z)}–${Math.min(a, z)} kazandı`)
    : st.draw ? t('Draw.', '平局。', 'Berabere.') : m.thinking ? t(`${m.nameOf(st.turn)} is thinking…`, `${m.nameOf(st.turn)}思考中…`, `${m.nameOf(st.turn)} düşünüyor…`) : t(`${m.nameOf(st.turn)} to draw a line`, `轮到${m.nameOf(st.turn)}画线`, `Çizgi sırası: ${m.nameOf(st.turn)}`);
  const pad = 0.35;
  return (
    <div className="play">
      <div className="play-main">
        <div className="statline"><span role="status" aria-live="polite"><i className={'disc-dot p' + (st.winner || st.turn)} />{status}</span><span className="num">{a} · {z}</span></div>
        <svg className="db-board" viewBox={`${-pad} ${-pad} ${c + 2 * pad} ${r + 2 * pad}`} role="application" aria-label={t('Dots and boxes. Tap between two dots to draw a line.', '点格棋。点击两点之间画线。', 'Noktalar ve kutular. Çizgi çizmek için iki noktanın arasına dokun.')}>
          {st.owner.map((o, b) => o ? <rect key={'b' + b} x={(b % c) + 0.06} y={Math.floor(b / c) + 0.06} width={0.88} height={0.88} rx={0.06} className={'db-box p' + o} /> : null)}
          {Array.from({ length: edgeCount(r, c) }, (_, e) => {
            const L = line(e), on = !!st.edges[e];
            return (
              <g key={e}>
                <line {...L} className={on ? 'db-edge p' + drawer.get(e) + (e === last ? ' last' : '') : 'db-edge empty'} />
                {!on && can && <line {...L} className="db-hit" onClick={() => m.apply(e)} />}
              </g>
            );
          })}
          {Array.from({ length: (r + 1) * (c + 1) }, (_, k) => <circle key={'d' + k} cx={k % (c + 1)} cy={Math.floor(k / (c + 1))} r={0.07} className="db-dot" />)}
        </svg>
        <p className="muted small">{t('Completing the fourth side of a box claims it and gives you another line. Late in the game, every line gives boxes away, so plan which chains to hand over.', '画上一个格子的第四条边就占领它，并且可以再画一条。到后期每条线都会送出格子，要想好送出哪一串。', 'Bir kutunun dördüncü kenarını çizen kutuyu alır ve bir çizgi daha çizer. Oyunun sonlarında her çizgi kutu verdirir; hangi zincirleri bırakacağını planla.')}</p>
      </div>
      <aside className="play-side"><MatchPanel id="db" m={m} sides={[t('Red (first)', '红（先手）', 'Kırmızı (ilk)'), t('Gold', '金', 'Altın')]} /></aside>
    </div>
  );
}
export default function Dots() {
  const t = useT();
  const [size, setSize] = useState(() => loadJSON('gp.dots.size', 3));
  return (
    <div className="stack">
      <Seg id="db-size" label={t('Board', '棋盘', 'Tahta')} value={size} onChange={v => { setSize(v); saveJSON('gp.dots.size', v); }}
        options={[3, 4, 5].map(n => ({ value: n, label: t(`${n}×${n} boxes`, `${n}×${n}格`, `${n}×${n} kutu`) }))} />
      <Board key={size} size={size} />
    </div>
  );
}
