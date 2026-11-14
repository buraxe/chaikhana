import './morris.css';
import { useMemo, useState } from 'react';
import { useT } from '../../core/i18n';
import { MatchPanel, useMatch } from '../../ui/useMatch';
import { ADJ, chooseMove, count, dec, enc, flying, legalMoves, LEVELS, MILLS, newGame, NONE, play, replay, XY, type NState } from './rules';

export default function Morris() {
  const t = useT();
  const m = useMatch<NState>({ game: 'morris', key: 'gp.morris', levels: LEVELS, defaults: { opponent: 'ai', level: 2, human: 1, p2: 'guest' },
    newGame, replay, play, choose: (s, lv) => chooseMove(s, lv), legal: legalMoves, aiDelay: 450 });
  const { st } = m;
  const [from, setFrom] = useState(-1);
  const [pending, setPending] = useState<{ from: number; to: number } | null>(null);
  const legal = useMemo(() => legalMoves(st).map(dec), [st]);
  const canPlay = !m.over && !m.aiTurn;
  const placing = st.hand[st.turn] > 0;
  const colour = (p: number) => (p === 1 ? t('White', '白方', 'Beyaz') : t('Black', '黑方', 'Siyah'));

  // What a tap can do right now.
  const removable = pending ? new Set(legal.filter(x => x.from === pending.from && x.to === pending.to).map(x => x.rem)) : new Set<number>();
  const sources = new Set(canPlay && !placing && !pending ? legal.map(x => x.from) : []);
  const targets = new Set(canPlay && !pending ? legal.filter(x => (placing ? x.from === NONE : x.from === from)).map(x => x.to) : []);
  const tap = (i: number) => {
    if (!canPlay) return;
    if (pending) {
      if (removable.has(i)) { m.apply(enc(pending.from, pending.to, i)); setPending(null); setFrom(-1); }
      return;
    }
    if (!placing && st.cells[i] === st.turn) { setFrom(sources.has(i) ? i : -1); return; }
    if (!targets.has(i)) return;
    const f = placing ? NONE : from;
    const opts = legal.filter(x => x.from === f && x.to === i);
    if (opts.length === 1 && opts[0].rem === NONE) { m.apply(enc(f, i, NONE)); setFrom(-1); }
    else setPending({ from: f, to: i });
  };
  // Show the board as it will be while a removal is chosen.
  const cells = st.cells.slice();
  if (pending) { if (pending.from !== NONE) cells[pending.from] = 0; cells[pending.to] = st.turn; }
  const lastMove = st.moves.length ? dec(st.moves[st.moves.length - 1]) : null;

  const status = st.winner ? t(`${m.nameOf(st.winner)} wins`, `${m.nameOf(st.winner)}获胜`, `${m.nameOf(st.winner)} kazandı`)
    : st.draw ? t('Draw: fifty moves without a mill.', '和棋：五十步没有成三。', 'Berabere: elli hamle boyunca kare yapılmadı.')
    : m.thinking ? t(`${m.nameOf(st.turn)} is thinking…`, `${m.nameOf(st.turn)}思考中…`, `${m.nameOf(st.turn)} düşünüyor…`)
    : pending ? t('Mill! Take one of the opponent’s stones.', '成三！吃掉对方一颗棋子。', 'Kare! Rakibin bir taşını al.')
    : `${m.nameOf(st.turn)} (${colour(st.turn)}): ` + (placing ? t('place a stone.', '放一颗棋子。', 'bir taş koy.') : flying(st, st.turn) ? t('three left, so stones may jump anywhere.', '只剩三子，可以飞到任意空位。', 'üç taş kaldı, taşlar istediği yere uçabilir.') : t('move a stone along a line.', '沿线移动一颗棋子。', 'bir taşı çizgi boyunca oynat.'));
  const lines: [number, number][] = [];
  for (let a = 0; a < 24; a++) for (const b of ADJ[a]) if (a < b) lines.push([a, b]);
  const millHi = new Set(MILLS.filter(ml => ml.every(k => cells[k] && cells[k] === cells[ml[0]])).flat());
  return (
    <div className="play">
      <div className="play-main">
        <div className="statline"><span role="status" aria-live="polite">{status}</span>
          <span className="num">{t(`In hand ${st.hand[1]} · ${st.hand[2]}`, `手中 ${st.hand[1]} · ${st.hand[2]}`, `Elde ${st.hand[1]} · ${st.hand[2]}`)}</span></div>
        <svg className="nm-board" viewBox="-0.6 -0.6 7.2 7.2" role="application" aria-label={t('Nine Men’s Morris board.', '九子棋棋盘。', 'Dokuz Taş tahtası.')}>
          <rect x="-0.5" y="-0.5" width="7" height="7" rx="0.3" className="nm-wood" />
          {lines.map(([a, b]) => <line key={a + '-' + b} x1={XY[a][0]} y1={XY[a][1]} x2={XY[b][0]} y2={XY[b][1]} className="nm-line" />)}
          {XY.map(([x, y], i) => {
            const v = cells[i], tgt = targets.has(i), src = sources.has(i), rm = removable.has(i);
            return (
              <g key={i} onClick={() => tap(i)} className={tgt || src || rm ? 'pt' : ''}>
                <circle cx={x} cy={y} r={0.46} fill="transparent" />
                <circle cx={x} cy={y} r={0.09} className="nm-dot" />
                {tgt && <circle cx={x} cy={y} r={0.16} className="nm-target" />}
                {v > 0 && <circle cx={x} cy={y} r={0.3} className={'nm-stone p' + v + (from === i ? ' sel' : '') + (rm ? ' rm' : '') + (millHi.has(i) ? ' mill' : '') + (lastMove && lastMove.to === i ? ' last' : '')} />}
              </g>
            );
          })}
        </svg>
        <div className="nm-hands">
          {[1, 2].map(p => <span key={p} className="nm-hand"><i className={'nm-chip p' + p} />{m.nameOf(p)}: {count(st, p)}</span>)}
          {pending && <button type="button" id="nm-cancel" className="btn sm" onClick={() => setPending(null)}>{t('Cancel', '取消', 'Vazgeç')}</button>}
        </div>
      </div>
      <aside className="play-side">
        <MatchPanel id="nm" m={m} sides={[t('White (first)', '白（先手）', 'Beyaz (ilk)'), t('Black', '黑', 'Siyah')]} />
        <p className="muted small">{t('Place your nine stones, then move them along the lines. Three in a row (a mill) takes an opponent stone; stones in a mill are safe unless there is nothing else. With three stones left you may jump anywhere. Fewer than three, or no move, loses.', '先轮流放下九颗棋子，再沿线移动。连成三子（成三）可吃掉对方一颗棋子，成三中的棋子受保护，除非别无选择。只剩三子时可以飞子。少于三子或无路可走即输。', 'Dokuz taşını sırayla koy, sonra çizgiler boyunca oynat. Üçünü bir sıraya dizersen (kare) rakibin bir taşını alırsın; karedeki taşlar, başka taş yoksa alınamaz. Üç taşın kalınca istediğin yere uçabilirsin. Üçten az taşı kalan ya da oynayamayan kaybeder.')}</p>
      </aside>
    </div>
  );
}
