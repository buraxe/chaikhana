import './tictactoe.css';
import { useT } from '../../core/i18n';
import { MatchPanel, useMatch } from '../../ui/useMatch';
import { chooseMove, LEVELS, newGame, play, replay, type TState } from './rules';

const Mark = ({ c }: { c: number }) => (
  <svg viewBox="0 0 10 10" className={'ttt-mark ' + (c === 1 ? 'x' : 'o')} aria-hidden="true">
    {c === 1 ? <path d="M2 2 8 8M8 2 2 8" /> : <circle cx="5" cy="5" r="3.1" />}
  </svg>
);

export default function TicTacToe() {
  const m = useMatch<TState>({ game: 'tictactoe', key: 'gp.ttt', levels: LEVELS,
    defaults: { opponent: 'ai', level: 2, human: 1, p2: 'guest' },
    newGame, replay, play, choose: (s, lv) => chooseMove(s, lv), aiDelay: 350 });
  const { st } = m, t = useT();
  const win = new Set(st.line);
  const side = (c: number) => (c === 1 ? 'X' : 'O');
  const status = st.winner ? t(`${m.nameOf(st.winner)} wins with ${side(st.winner)}`, `${m.nameOf(st.winner)}（${side(st.winner)}）获胜`, `${m.nameOf(st.winner)} ${side(st.winner)} ile kazandı`)
    : st.draw ? t('Draw. No line is left to complete.', '和棋，已经没有能连成的线了。', 'Berabere. Tamamlanacak sıra kalmadı.')
    : m.thinking ? t(`${m.nameOf(st.turn)} is thinking…`, `${m.nameOf(st.turn)}思考中…`, `${m.nameOf(st.turn)} düşünüyor…`) : t(`${m.nameOf(st.turn)} to move (${side(st.turn)})`, `轮到${m.nameOf(st.turn)}（${side(st.turn)}）`, `Sıra ${m.nameOf(st.turn)} oyuncusunda (${side(st.turn)})`);
  return (
    <div className="play">
      <div className="play-main">
        <div className="statline"><span role="status" aria-live="polite">{status}</span><span className="muted">{t(`Move ${Math.min(9, st.moves.length + (m.over ? 0 : 1))}`, `第${Math.min(9, st.moves.length + (m.over ? 0 : 1))}步`, `Hamle ${Math.min(9, st.moves.length + (m.over ? 0 : 1))}`)}</span></div>
        <div className="ttt" role="grid" aria-label={t('Tic-tac-toe board', '井字棋棋盘', 'XOX tahtası')}>
          {st.cells.map((c, i) => (
            <button key={i} type="button" role="gridcell" id={'ttt-' + i} className={'ttt-cell' + (win.has(i) ? ' win' : '')}
              disabled={!!c || m.over || m.aiTurn} onClick={() => m.apply(i)}
              aria-label={t(`Row ${Math.floor(i / 3) + 1}, column ${(i % 3) + 1}, ${c ? side(c) : 'empty'}`, `第${Math.floor(i / 3) + 1}行第${(i % 3) + 1}列，${c ? side(c) : '空'}`, `Satır ${Math.floor(i / 3) + 1}, sütun ${(i % 3) + 1}, ${c ? side(c) : 'boş'}`)}>
              {c ? <Mark c={c} /> : null}
            </button>
          ))}
        </div>
      </div>
      <aside className="play-side"><MatchPanel id="ttt" m={m} sides={[t('X (first)', 'X（先手）', 'X (ilk)'), 'O']} /></aside>
    </div>
  );
}
