import './boards.css';
import { useEffect, useState, type ReactNode } from 'react';
import { useT } from '../../core/i18n';
import { dayKey } from '../../core/rng';
import { sfx } from '../../core/sound';
import { loadJSON, saveJSON } from '../../core/storage';
import { getData, recordResult } from '../../core/store';
import { useTodaysPuzzle, type BoardGame, type PuzzleData } from './pools';
export type { PuzzleData };

export const solvedToday = (game: string) => loadJSON<string>('gp.puz.' + game, '') === dayKey();

/**
 * The daily puzzle shell. The game supplies the starting position, a board, how to tell a
 * solved position, and for two-move mates the defender's reply.
 */
export function Puzzle<S>(props: Props<S>) {
  const today = useTodaysPuzzle(props.game);
  return today ? <Shell {...props} p={today.p} no={today.no} /> : <p className="empty">…</p>;
}
type Props<S> = {
  game: BoardGame; title: string;
  start: (p: PuzzleData) => S;
  board: (st: S, onMove: (m: number) => void, opts: { enabled: boolean; hint: number | null; p: PuzzleData }) => ReactNode;
  /** after the solver's move: 'solved', 'wrong', or 'continue' (two-move mates) */
  check: (before: S, after: S, m: number, p: PuzzleData, step: number) => 'solved' | 'wrong' | 'continue';
  reply?: (st: S) => number; play: (st: S, m: number) => S; sideName: (p: PuzzleData) => string; describe: (p: PuzzleData) => string;
};
function Shell<S>({ game, title, start, board, check, reply, play: playFn, sideName, describe, p, no }: Props<S> & { p: PuzzleData; no: number }) {
  const t = useT();
  const [st, setSt] = useState<S>(() => start(p));
  const [step, setStep] = useState(0);
  const [state, setState] = useState<'play' | 'wrong' | 'solved' | 'wait'>(() => (solvedToday(game) ? 'solved' : 'play'));
  const [hint, setHint] = useState<number | null>(null);
  const [tries, setTries] = useState(0);
  const reset = () => { setSt(start(p)); setStep(0); setState('play'); setHint(null); };
  useEffect(() => { if (solvedToday(game)) setState('solved'); }, [game]);
  const onMove = (m: number) => {
    if (state !== 'play') return;
    const after = playFn(st, m), res = check(st, after, m, p, step);
    setSt(after); sfx('stone');
    if (res === 'solved') {
      setState('solved'); setTimeout(() => sfx('win'), 250);
      if (!solvedToday(game)) { saveJSON('gp.puz.' + game, dayKey()); recordResult(getData().activeId, game, { result: 'win', label: `daily puzzle #${no}${tries || hint !== null ? ' · with hints' : ''}` }); }
    } else if (res === 'wrong') { setState('wrong'); setTries(x => x + 1); setTimeout(() => sfx('error'), 200); }
    else if (reply) { setState('wait'); setTimeout(() => { setSt(s => playFn(s, reply(s))); sfx('stone'); setStep(x => x + 1); setState('play'); }, 700); }
  };
  return (
    <div className="play puzzle">
      <div className="play-main">
        <div className="statline"><span role="status" aria-live="polite">
          {state === 'solved' ? t('Solved! A new puzzle arrives at midnight.', '解出来了！新题将在零点更新。', 'Çözüldü! Yeni bulmaca gece yarısı geliyor.')
            : state === 'wrong' ? t('Not quite. Try again.', '不对，再试一次。', 'Olmadı. Bir daha dene.')
            : state === 'wait' ? t('The opponent replies…', '对手应着…', 'Rakip cevap veriyor…')
            : step > 0 ? t('Now finish it.', '现在一步终结。', 'Şimdi bitir.') : `${sideName(p)} · ${describe(p)}`}
        </span><span className="muted num">{title} #{no}</span></div>
        {board(st, onMove, { enabled: state === 'play', hint, p })}
      </div>
      <aside className="play-side">
        <div className="puz-card">
          <p className="eyebrow">{t('Daily puzzle', '每日谜题', 'Günün bulmacası')}</p>
          <h3>{describe(p)}</h3>
          <p className="muted small">{t('The same position for everyone today. Solving it ticks the job off in today’s issue when this game is the day’s board puzzle.', '今天每个人的题目都一样。如果它是今天报纸上的棋类谜题，解出后任务会打勾。', 'Bugün herkese aynı pozisyon. Bu oyun günün tahta bulmacasıysa, çözünce günün sayısındaki iş tamamlanır.')}</p>
        </div>
        <div className="tools">
          <button type="button" id="puz-reset" className="btn" onClick={reset}>{t('Start over', '重来', 'Baştan')}</button>
          <button type="button" id="puz-hint" className="btn" disabled={state === 'solved'} onClick={() => setHint(p.sol)}>{t('Show the first move', '显示第一步', 'İlk hamleyi göster')}</button>
        </div>
        <p className="muted small"><a href={'#' + game}>{t('Play a full game instead', '改为下一盘完整对局', 'Bunun yerine tam oyun oyna')} →</a></p>
      </aside>
    </div>
  );
}
