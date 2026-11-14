import './reversi.css';
import { useT } from '../../core/i18n';
import { MatchPanel, useMatch } from '../../ui/useMatch';
import { chooseMove, count, legal, LEVELS, newGame, play, replay, type RState } from './rules';

export default function Reversi() {
  const t = useT();
  const m = useMatch<RState>({ game: 'reversi', key: 'gp.reversi', levels: LEVELS, defaults: { opponent: 'ai', level: 2, human: 1, p2: 'guest' },
    newGame, replay, play, choose: (s, lv) => chooseMove(s, lv), aiDelay: 400 });
  const { st } = m;
  const moves = !m.over && !m.aiTurn ? new Set(legal(st.cells, st.turn)) : new Set<number>();
  const last = st.moves[st.moves.length - 1];
  const side = (c: number) => (c === 1 ? t('Black', '黑方', 'Siyah') : t('White', '白方', 'Beyaz'));
  const b = count(st.cells, 1), w = count(st.cells, 2);
  const status = st.winner ? t(`${m.nameOf(st.winner)} wins ${Math.max(b, w)}–${Math.min(b, w)}`, `${m.nameOf(st.winner)}以${Math.max(b, w)}比${Math.min(b, w)}获胜`, `${m.nameOf(st.winner)} ${Math.max(b, w)}–${Math.min(b, w)} kazandı`)
    : st.draw ? t('Draw, 32–32.', '和棋，32比32。', 'Berabere, 32–32.')
    : (st.passed ? t(`${m.nameOf(3 - st.turn)} has no move and passes. `, `${m.nameOf(3 - st.turn)}无棋可下，跳过。`, `${m.nameOf(3 - st.turn)} hamle yapamıyor ve pas geçiyor. `) : '')
      + (m.thinking ? t(`${m.nameOf(st.turn)} is thinking…`, `${m.nameOf(st.turn)}思考中…`, `${m.nameOf(st.turn)} düşünüyor…`) : t(`${m.nameOf(st.turn)} to move (${side(st.turn)})`, `轮到${m.nameOf(st.turn)}（${side(st.turn)}）`, `Sıra ${m.nameOf(st.turn)} oyuncusunda (${side(st.turn)})`));
  return (
    <div className="play">
      <div className="play-main">
        <div className="statline"><span role="status" aria-live="polite">{status}</span><span className="num">⚫ {b} · ⚪ {w}</span></div>
        <svg className="rv-board" viewBox="0 0 8 8" role="grid" aria-label={t('Reversi board', '黑白棋棋盘', 'Reversi tahtası')}>
          <rect width="8" height="8" className="rv-felt" />
          {Array.from({ length: 9 }, (_, k) => <g key={k} className="rv-line"><line x1={k} y1={0} x2={k} y2={8} /><line x1={0} y1={k} x2={8} y2={k} /></g>)}
          {[[2, 2], [6, 2], [2, 6], [6, 6]].map(([x, y]) => <circle key={x + '' + y} cx={x} cy={y} r={0.06} className="rv-dot" />)}
          {st.cells.map((v, i) => {
            const x = (i % 8) + 0.5, y = Math.floor(i / 8) + 0.5;
            if (v) return <circle key={i + '-' + v} cx={x} cy={y} r={0.4} className={'rv-disc p' + v + (i === last ? ' last' : '')} />;
            if (moves.has(i)) return <circle key={'m' + i} cx={x} cy={y} r={0.12} className="rv-hint" />;
            return null;
          })}
          {Array.from({ length: 64 }, (_, i) => (
            <rect key={'h' + i} x={i % 8} y={Math.floor(i / 8)} width={1} height={1} fill="transparent" className={moves.has(i) ? 'pt' : ''}
              role="gridcell" aria-label={`${'ABCDEFGH'[i % 8]}${Math.floor(i / 8) + 1}`} onClick={() => moves.has(i) && m.apply(i)} />
          ))}
        </svg>
        <p className="muted small">{t('Place a disc so that it traps a line of your opponent\'s discs between it and another of yours; the trapped discs flip. Dots show your legal moves.', '落子时要把对方的一排棋子夹在你的两枚棋子之间，被夹住的棋子会翻面。圆点表示可以落子的位置。', 'Bir pulu, rakibinin bir sıra pulunu kendi başka bir pulunla arasında sıkıştıracak şekilde koy; sıkışan pullar döner. Noktalar geçerli hamlelerini gösterir.')}</p>
      </div>
      <aside className="play-side"><MatchPanel id="rv" m={m} sides={[t('Black (first)', '黑（先手）', 'Siyah (ilk)'), t('White', '白', 'Beyaz')]} /></aside>
    </div>
  );
}
