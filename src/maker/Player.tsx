import { useEffect, useRef, useState, type ReactNode } from 'react';
import { useLang, useT } from '../core/i18n';
import { sfx } from '../core/sound';
import { loadJSON, saveJSON } from '../core/storage';
import { Pick, Seg } from '../ui/bits';
import { chooseInput, LEVELS } from './ai';
import { applyTraced, explainInput, newGame, txt, type GameDef, type GState, type Input } from './engine';
import { GameView, playerColor, playerName } from './GameView';
import { solve, type Solved } from './solver';
import { WatchLog, WhyPanel, type LogEntry, type Why } from './Watch';

type Seat = 'h' | number;
const LEVEL_NAMES: Record<string, [string, string]> = { Beginner: ['新手', 'Acemi'], Easy: ['简单', 'Kolay'], Intermediate: ['中等', 'Orta'], Advanced: ['高级', 'İleri'], Expert: ['专家', 'Uzman'] };

/**
 * Plays any workshop game: seats for people or the computer, undo, a pass-the-device screen
 * for hidden hands, hints for puzzles. With `testing`, also the rule log and "why not" panel.
 */
export function Player({ def, testing = false, onOpenRule, side, onFinish }: {
  def: GameDef; testing?: boolean; onOpenRule?: (rule: number, paths: string[]) => void; side?: ReactNode; onFinish?: (st: GState) => void;
}) {
  const t = useT(), lang = useLang();
  const [count, setCount] = useState(def.players.max);
  const [seats, setSeats] = useState<Seat[]>(['h', 2, 2, 2, 2, 2]);
  // The state is kept with the definition it belongs to, so a switch never pairs a board with the wrong game.
  const [game, setGame] = useState<{ def: GameDef; st: GState; hist: GState[] } | null>(null);
  const st = game && game.def === def ? game.st : null;
  const [seenBy, setSeenBy] = useState<number | null>(null);
  const [watch, setWatch] = useState(() => loadJSON<boolean>('gp.workshop.watch', false));
  const [hold, setHold] = useState(false);
  const [log, setLog] = useState<LogEntry[]>([]);
  const [why, setWhy] = useState<Why | null>(null);
  const [hint, setHint] = useState<Input | null>(null);
  const [check, setCheck] = useState<Solved | null>(null);
  const logId = useRef(0);
  const watching = testing && watch;
  useEffect(() => { saveJSON('gp.workshop.watch', watch); }, [watch]);

  useEffect(() => {
    setCount(def.players.max);
    setGame({ def, st: newGame(def, def.players.max), hist: [] });
    setLog([]); setWhy(null); setHint(null); setCheck(null); setSeenBy(null);
  }, [def]);

  const seatOf = (p: number): Seat => (def.players.max === 1 ? 'h' : seats[p]);
  const humans = st ? Array.from({ length: st.players }, (_, p) => p).filter(p => seatOf(p) === 'h') : [];
  const aiTurn = !!st && !st.over && seatOf(st.turn) !== 'h';
  const viewer: number | 'all' = !st ? 'all' : seatOf(st.turn) === 'h' ? st.turn : humans.length ? humans[0] : 'all';
  const secret = Object.values(def.zones ?? {}).some(z => z.show === 'owner') && humans.length > 1;
  const passing = !!st && secret && !st.over && seatOf(st.turn) === 'h' && seenBy !== st.turn;
  const puzzle = def.kind === 'puzzle' || def.players.max === 1;

  const play = (i: Input) => {
    if (!game || game.def !== def) return;
    const s = game.st, { state: n, trace } = applyTraced(def, s, i);
    if (n.over && !s.over) { sfx(n.over.winner >= 0 && seatOf(n.over.winner) === 'h' ? 'win' : n.over.winner < 0 ? 'draw' : 'lose'); onFinish?.(n); }
    else sfx(i.k === 'roll' ? 'dice' : i.k === 'card' || i.k === 'zone' ? 'card' : i.k === 'word' ? 'tile' : 'stone', 0.6);
    setGame({ def, st: n, hist: [...game.hist.slice(-200), s] });
    setWhy(null); setHint(null);
    if (watching) setLog(l => [...l.slice(-29), { id: ++logId.current, who: s.turn, input: i, trace }]);
  };
  const undo = () => {
    if (!game || !game.hist.length) return;
    const hist = game.hist.slice();
    let back = hist.pop()!;
    while (hist.length && seatOf(back.turn) !== 'h') back = hist.pop()!;
    if (seatOf(back.turn) !== 'h') return;
    setSeenBy(back.turn); setHint(null);
    setGame({ def, st: back, hist });
  };
  const canUndo = !!game && game.def === def && game.hist.some(h => seatOf(h.turn) === 'h') && !aiTurn;
  const computerMove = () => { if (!st) return; const m = chooseInput(def, st, seatOf(st.turn) as number, { ms: 1200 }); if (m) play(m); };
  useEffect(() => {
    if (!aiTurn || !st || (testing && hold)) return;
    const id = setTimeout(computerMove, 450);
    return () => clearTimeout(id);
  }, [st, aiTurn, hold]); // eslint-disable-line

  const restart = () => { setSeenBy(null); setHint(null); setCheck(null); setLog([]); setGame({ def, st: newGame(def, count), hist: [] }); };
  const explain = (i: Input) => { if (watching && st) setWhy({ input: i, items: explainInput(def, st, i) }); };
  const askHint = () => {
    if (!st) return;
    const r = solve(def, st);
    setCheck(r);
    setHint(r.status === 'solved' && r.path.length ? r.path[0] : null);
  };
  const levelName = (i: number) => { const n = LEVELS[i].name; return lang === 'zh' ? LEVEL_NAMES[n][0] : lang === 'tr' ? LEVEL_NAMES[n][1] : n; };

  if (!st) return null;
  const status = st.error ? t('The game stopped: ', '游戏中止：', 'Oyun durdu: ') + st.error
    : st.over ? (puzzle
      ? (st.over.winner === 0 ? t('Solved!', '完成！', 'Çözüldü!') : st.over.stuck ? t('No moves left.', '无路可走了。', 'Hamle kalmadı.') : t('Not solved.', '未完成。', 'Çözülemedi.'))
      : st.over.winner >= 0 ? t(`${playerName(def, st.over.winner, 'en')} wins!`, `${playerName(def, st.over.winner, 'zh')}获胜！`, `${playerName(def, st.over.winner, 'tr')} kazandı!`) : t('Draw.', '和棋。', 'Berabere.'))
    : st.players === 1 ? (def.words ? t(`Guess ${(st.words?.guesses.length ?? 0) + 1} of ${def.words.rows ?? 6}`, `第 ${(st.words?.guesses.length ?? 0) + 1} 次猜测，共 ${def.words.rows ?? 6} 次`, `${def.words.rows ?? 6} tahminden ${(st.words?.guesses.length ?? 0) + 1}.`) : t('Your move.', '请走。', 'Sıra sende.'))
    : aiTurn ? t(`${playerName(def, st.turn, 'en')} (computer) is thinking…`, `${playerName(def, st.turn, 'zh')}（电脑）思考中…`, `${playerName(def, st.turn, 'tr')} (bilgisayar) düşünüyor…`)
    : t(`${playerName(def, st.turn, 'en')} to move`, `轮到${playerName(def, st.turn, 'zh')}`, `Sıra: ${playerName(def, st.turn, 'tr')}`);
  const checkText = !check ? '' : check.status === 'solved'
    ? (check.path.length ? t(`Solvable from here in ${check.path.length} moves.`, `从这里起 ${check.path.length} 步可解。`, `Buradan ${check.path.length} hamlede çözülebilir.`) : t('Already solved.', '已经完成。', 'Zaten çözüldü.'))
    : check.status === 'none' ? t('No solution from this position: undo or restart.', '从这个局面无解：请悔棋或重来。', 'Bu konumdan çözüm yok: geri al ya da yeniden başla.')
    : t(`Too big to work out here (${check.states.toLocaleString()} positions tried).`, `太大，这里算不完（已尝试 ${check.states.toLocaleString()} 个局面）。`, `Burada hesaplamak için fazla büyük (${check.states.toLocaleString()} konum denendi).`);
  const solverFits = puzzle && !def.words && !def.dice && !def.cards;

  return (
    <div className="play">
      <div className="play-main">
        <div className="statline"><span role="status" aria-live="polite">{st.players > 1 && !st.over && <i className="wk-dot" style={{ background: playerColor(def, st.turn) }} />}{status}</span>
          {st.msg && <span className="wk-msg">{txt(st.msg, lang)}</span>}</div>
        <GameView def={def} st={st} viewer={passing ? -1 : viewer} canAct={!aiTurn && !passing} onInput={play} onExplain={watching ? explain : undefined} hint={hint} />
        {why && <WhyPanel def={def} why={why} onClose={() => setWhy(null)} onOpen={r => onOpenRule?.(r, [])} />}
        {passing && (
          <div className="wk-pass" role="dialog" aria-modal="true" aria-labelledby="wk-pass-h">
            <div>
              <h2 id="wk-pass-h">{t(`Pass to ${playerName(def, st.turn, 'en')}`, `请交给${playerName(def, st.turn, 'zh')}`, `Cihazı ${playerName(def, st.turn, 'tr')} oyuncusuna ver`)}</h2>
              <p>{t('The other players should look away: your hand is about to be shown.', '其他玩家请回避：马上要显示你的手牌。', 'Diğer oyuncular başka yöne baksın: elin gösterilecek.')}</p>
              <button type="button" className="btn primary" id="wk-ready" onClick={() => setSeenBy(st.turn)}>{t('I’m ready', '我准备好了', 'Hazırım')}</button>
            </div>
          </div>
        )}
      </div>
      <aside className="play-side">
        {def.about && <p className="muted small">{txt(def.about, lang)}</p>}
        {Object.entries(def.vars ?? {}).some(([, v]) => v.show) && (
          <dl className="facts">{Object.entries(def.vars ?? {}).filter(([, v]) => v.show).flatMap(([k, v]) => (st.vars[k].length === 1
            ? [<div key={k}><dt>{txt(v.name, lang)}</dt><dd className="num">{st.vars[k][0]}</dd></div>]
            : st.vars[k].map((x, p) => <div key={k + p}><dt>{txt(v.name, lang)} · {playerName(def, p, lang)}</dt><dd className="num">{x}</dd></div>)))}</dl>
        )}
        <div className="setup">
          {def.players.max > 1 && def.players.min !== def.players.max && (
            <Seg id="wk-count" label={t('Players', '人数', 'Oyuncu sayısı')} value={count} onChange={setCount}
              options={Array.from({ length: def.players.max - def.players.min + 1 }, (_, i) => ({ value: def.players.min + i, label: String(def.players.min + i) }))} />
          )}
          {def.players.max > 1 && Array.from({ length: count }, (_, p) => (
            <Pick key={p} id={'wk-seat-' + p} label={playerName(def, p, lang)} value={String(seats[p])}
              onChange={v => setSeats(s => s.map((x, i) => (i === p ? (v === 'h' ? 'h' : Number(v)) : x)))}
              options={[{ value: 'h', label: t('Person', '真人', 'Kişi') }, ...LEVELS.map((_, i) => ({ value: String(i), label: t('Computer', '电脑', 'Bilgisayar') + ' · ' + levelName(i) }))]} />
          ))}
          {solverFits && !st.over && <button type="button" className="btn" id="wk-hint" onClick={askHint}>💡 {t('Hint', '提示', 'İpucu')}</button>}
          {solverFits && testing && <button type="button" className="btn" id="wk-solvable" onClick={() => { setCheck(solve(def, st)); setHint(null); }}>{t('Can it be solved?', '能解吗？', 'Çözülebilir mi?')}</button>}
          {checkText && <p className="muted small" role="status">{checkText}</p>}
          <button type="button" className="btn" id="wk-undo" disabled={!canUndo} onClick={undo}>↶ {t('Undo', '悔棋', 'Geri al')}</button>
          <button type="button" className="btn primary" id="wk-restart" onClick={restart}>{st.over ? t('Play again', '再来一局', 'Tekrar oyna') : t('Restart', '重新开始', 'Yeniden başla')}</button>
        </div>
        {testing && (
          <div className="setup">
            <h3>{t('Test', '测试', 'Test')}</h3>
            <label className="check"><input type="checkbox" id="wk-watch" checked={watch} onChange={e => { setWatch(e.target.checked); setWhy(null); }} /> {t('Watch the rules', '观察规则', 'Kuralları izle')}</label>
            {seats.slice(0, count).some(x => x !== 'h') && def.players.max > 1 && <>
              <label className="check"><input type="checkbox" id="wk-hold" checked={hold} onChange={e => setHold(e.target.checked)} /> {t('Computer waits for me', '电脑等我', 'Bilgisayar beklesin')}</label>
              {hold && aiTurn && <button type="button" className="btn" id="wk-step" onClick={computerMove}>▶ {t('Computer’s move', '电脑走一步', 'Bilgisayar oynasın')}</button>}
            </>}
            {watching && <WatchLog def={def} log={log} onOpen={(r, p) => onOpenRule?.(r, p)} onClear={() => setLog([])} />}
          </div>
        )}
        {side}
      </aside>
    </div>
  );
}
