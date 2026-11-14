import './uttt.css';
import { useT } from '../../core/i18n';
import { MatchPanel, useMatch } from '../../ui/useMatch';
import { chooseMove, legal, LEVELS, newGame, play, replay, type UState } from './rules';

export default function Uttt() {
  const t = useT();
  const m = useMatch<UState>({ game: 'ultimate-ttt', key: 'gp.uttt', levels: LEVELS, defaults: { opponent: 'ai', level: 2, human: 1, p2: 'guest' },
    newGame, replay, play, choose: (s, lv) => chooseMove(s, lv), legal, aiDelay: 250 });
  const { st } = m;
  const canAct = !m.over && !m.aiTurn, ok = new Set(legal(st)), last = st.moves[st.moves.length - 1];
  const mark = (v: number) => (v === 1 ? '✕' : v === 2 ? '◯' : '');
  const status = st.winner ? t(`${m.nameOf(st.winner)} wins with ${mark(st.winner)}`, `${m.nameOf(st.winner)}（${mark(st.winner)}）获胜`, `${m.nameOf(st.winner)} ${mark(st.winner)} ile kazandı`)
    : st.draw ? t('Draw.', '和棋。', 'Berabere.')
    : m.thinking ? t(`${m.nameOf(st.turn)} is thinking…`, `${m.nameOf(st.turn)}思考中…`, `${m.nameOf(st.turn)} düşünüyor…`)
    : t(`${m.nameOf(st.turn)} to move (${mark(st.turn)})`, `轮到${m.nameOf(st.turn)}（${mark(st.turn)}）`, `Sıra ${m.nameOf(st.turn)} oyuncusunda (${mark(st.turn)})`) + (st.next >= 0 ? t(' · in the lit board', ' · 在亮起的小棋盘里', ' · parlayan küçük tahtada') : t(' · anywhere', ' · 任意位置', ' · istediğin yere'));
  return (
    <div className="play">
      <div className="play-main">
        <div className="statline"><span role="status" aria-live="polite">{status}</span><span className="muted num">{st.moves.length}</span></div>
        <div className={'ut-big' + (st.line.length ? ' won' : '')} role="grid" aria-label={t('Ultimate tic-tac-toe', '终极井字棋', 'Süper XOX')}>
          {Array.from({ length: 9 }, (_, b) => {
            const open = canAct && Array.from({ length: 9 }, (_, s) => ok.has(b * 9 + s)).some(Boolean);
            return (
              <div key={b} className={'ut-small' + (open ? ' open' : '') + (st.boards[b] === 1 ? ' w1' : st.boards[b] === 2 ? ' w2' : st.boards[b] === 3 ? ' full' : '') + (st.line.includes(b) ? ' line' : '')}>
                {Array.from({ length: 9 }, (_, s) => {
                  const i = b * 9 + s, v = st.cells[i];
                  return <button key={s} type="button" role="gridcell" className={'ut-cell p' + v + (i === last ? ' last' : '')} disabled={!canAct || !ok.has(i)} onClick={() => m.apply(i)} aria-label={`${b + 1}-${s + 1}: ${mark(v) || '·'}`}>{mark(v)}</button>;
                })}
                {(st.boards[b] === 1 || st.boards[b] === 2) && <span className={'ut-claim p' + st.boards[b]} aria-hidden="true">{mark(st.boards[b])}</span>}
              </div>
            );
          })}
        </div>
        <p className="muted small">{t('The square you pick in a small board sends your opponent to that board of the big one. Win three small boards in a row.', '你在小棋盘里下的位置，决定对手下一步要去大棋盘的哪个小棋盘。连成三个小棋盘获胜。', 'Küçük tahtada seçtiğin kare, rakibini büyük tahtanın o konumdaki küçük tahtasına gönderir. Üç küçük tahtayı sıraya diz.')}</p>
      </div>
      <aside className="play-side"><MatchPanel id="ut" m={m} sides={[t('✕ (first)', '✕（先手）', '✕ (ilk)'), '◯']} /></aside>
    </div>
  );
}
