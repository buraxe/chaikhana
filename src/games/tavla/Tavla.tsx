import './tavla.css';
import { useEffect, useMemo, useRef, useState } from 'react';
import { sfx } from '../../core/sound';
import { RivalPick, useRival } from '../../ui/Cast';
import { pname, trLabel, useLang, useT, aiLabel } from '../../core/i18n';
import { recordMatch, type MatchConfig } from '../../core/match';
import { loadJSON, saveJSON } from '../../core/storage';
import { activeOf, noteStarted, useData } from '../../core/store';
import { Pick, Seg } from '../../ui/bits';
import { useNarrow } from '../../ui/useNarrow';
import { applyStep, BAR, chooseSequence, gameValue, initialBoard, LEVELS, OFF, pips, sequences, winChance, winner, type Board, type Step } from './rules';

type Phase = 'opening' | 'roll' | 'move' | 'offer' | 'gameover' | 'matchover';
interface Cfg { opponent: 'ai' | 'local'; level: number; human: 0 | 1; p2: string; matchTo: number; cube: boolean }
interface Saved {
  cfg: Cfg; board: Board; turn: 0 | 1; phase: Phase; roll: number[]; steps: Step[]; start: Board;
  score: [number, number]; cube: { value: number; owner: -1 | 0 | 1 }; opening: number[]; last: string; recorded: boolean; started: boolean;
}
const DEFAULT: Cfg = { opponent: 'ai', level: 2, human: 0, p2: 'guest', matchTo: 5, cube: false };
const newGame = (cfg: Cfg, score: [number, number] = [0, 0]): Saved => ({
  cfg, board: initialBoard(), turn: 0, phase: 'opening', roll: [], steps: [], start: initialBoard(),
  score, cube: { value: 1, owner: -1 }, opening: [], last: '', recorded: false, started: false,
});
const die = () => 1 + Math.floor(Math.random() * 6);
/** x centre of a point in player 0's numbering, and whether it sits on the top edge. */
function pointGeom(i: number): { x: number; top: boolean } {
  if (i <= 6) return { x: 26 - (i - 1) * 2, top: false };
  if (i <= 12) return { x: 12 - (i - 7) * 2, top: false };
  if (i <= 18) return { x: 2 + (i - 13) * 2, top: true };
  return { x: 16 + (i - 19) * 2, top: true };
}
const PIPS: Record<number, number[][]> = { 1: [[0, 0]], 2: [[-1, -1], [1, 1]], 3: [[-1, -1], [0, 0], [1, 1]], 4: [[-1, -1], [1, -1], [-1, 1], [1, 1]], 5: [[-1, -1], [1, -1], [0, 0], [-1, 1], [1, 1]], 6: [[-1, -1], [1, -1], [-1, 0], [1, 0], [-1, 1], [1, 1]] };

const DieIcon = () => (
  <svg viewBox="0 0 20 20" aria-hidden="true" className="die-ico"><rect x="2" y="2" width="16" height="16" rx="3.5" /><circle cx="6.5" cy="6.5" r="1.6" /><circle cx="10" cy="10" r="1.6" /><circle cx="13.5" cy="13.5" r="1.6" /></svg>
);

export default function Tavla() {
  const t = useT(), lang = useLang(), data = useData(), me = activeOf(data);
  const [g, setG] = useState<Saved>(() => loadJSON<Saved | null>('gp.tavla', null) ?? newGame(DEFAULT));
  const [draft, setDraft] = useState<Cfg>(g.cfg);
  const [sel, setSel] = useState(-1);
  const [confirmNew, setConfirmNew] = useState(false);
  const busy = useRef(false);
  const tall = useNarrow();
  /** On an upright phone the board is turned 90°; text is turned back so it stays readable. */
  const upright = (x: number, y: number) => (tall ? `rotate(-90 ${x} ${y})` : undefined);
  const { cfg } = g;
  const p2 = data.profiles.find(p => p.id === cfg.p2 && p.id !== me.id);
  const isHuman = (p: number) => cfg.opponent === 'local' || p === cfg.human;
  const aiName = aiLabel(LEVELS[cfg.level].name, lang);
  useRival('tavla', cfg.opponent === 'ai' ? cfg.level : null);
  const nameOf = (p: number) => (cfg.opponent === 'ai' ? (p === cfg.human ? pname(me, lang) : aiName) : p === cfg.human ? pname(me, lang) : p2 ? pname(p2, lang) : t('Guest', '游客', 'Misafir'));
  const colour = (p: number) => (p === 0 ? t('White', '白方', 'Beyaz') : t('Red', '红方', 'Kırmızı'));

  useEffect(() => { saveJSON('gp.tavla', g); }, [g]);

  const seqs = useMemo(() => (g.phase === 'move' ? sequences(g.start, g.turn, g.roll) : []), [g.phase, g.start, g.turn, g.roll]);
  const nextSteps = useMemo(() => {
    const n = g.steps.length, out: Step[] = [];
    for (const q of seqs) if (q.length > n && g.steps.every((s, k) => q[k].from === s.from && q[k].to === s.to && q[k].die === s.die)) out.push(q[n]);
    return out;
  }, [seqs, g.steps]);
  const usedDice = g.steps.map(s => s.die);
  const diceShown = g.roll.length ? (g.roll[0] === g.roll[1] ? [g.roll[0], g.roll[0], g.roll[0], g.roll[0]] : g.roll) : [];

  const finishTurn = (s: Saved): Saved => {
    const wr = winner(s.board);
    if (wr < 0) return { ...s, turn: (1 - s.turn) as 0 | 1, phase: 'roll', roll: [], steps: [], start: s.board };
    const w = wr as 0 | 1;
    const pts = gameValue(s.board, w) * s.cube.value, score: [number, number] = [s.score[0], s.score[1]];
    score[w] += pts;
    const last = t(`${nameOf(w)} wins ${pts} ${pts === 1 ? 'point' : 'points'}${gameValue(s.board, w) === 2 ? ' with mars' : ''}.`, `${nameOf(w)}赢得${pts}分${gameValue(s.board, w) === 2 ? '（马尔斯）' : ''}。`, `${nameOf(w)} ${pts} puan kazandı${gameValue(s.board, w) === 2 ? ' (mars)' : ''}.`);
    const over = score[w] >= s.cfg.matchTo;
    const next: Saved = { ...s, score, phase: over ? 'matchover' : 'gameover', last, roll: [], steps: [] };
    if (over && !s.recorded) { next.recorded = true; recordFor(next, w); }
    return next;
  };
  const recordFor = (s: Saved, w: number) => {
    const mine = w === s.cfg.human ? 'win' : 'loss';
    const mc: MatchConfig = { opponent: s.cfg.opponent, level: s.cfg.level, human: 1, p2: s.cfg.p2 };
    recordMatch('tavla', mc, me, p2, mine, `${s.score[s.cfg.human]}–${s.score[1 - s.cfg.human]}`, LEVELS, false);
  };
  const resign = (s: Saved, loser: number, pts: number): Saved => {
    const w = (1 - loser) as 0 | 1, score: [number, number] = [s.score[0], s.score[1]];
    score[w] += pts;
    const over = score[w] >= s.cfg.matchTo;
    const next: Saved = { ...s, score, phase: over ? 'matchover' : 'gameover', roll: [], steps: [],
      last: t(`${nameOf(loser)} declines the double. ${nameOf(w)} wins ${pts} ${pts === 1 ? 'point' : 'points'}.`, `${nameOf(loser)}拒绝加倍，${nameOf(w)}赢得${pts}分。`, `${nameOf(loser)} katlamayı reddetti. ${nameOf(w)} ${pts} puan kazandı.`) };
    if (over && !s.recorded) { next.recorded = true; recordFor(next, w); }
    return next;
  };

  const rollOpening = () => {
    let a = die(), b = die();
    while (a === b) { a = die(); b = die(); }
    sfx('dice');
    const first = (a > b ? 0 : 1) as 0 | 1;
    if (!g.started) noteStarted('tavla');
    setG({ ...g, opening: [a, b], turn: first, phase: 'roll', started: true,
      last: t(`${nameOf(first)} rolled higher and starts with a new roll.`, `${nameOf(first)}点数大，先行并重新掷骰。`, `${nameOf(first)} daha yüksek attı ve yeni bir atışla başlıyor.`) });
  };
  const roll = (s: Saved = g) => {
    const r = [die(), die()];
    sfx('dice');
    const next: Saved = { ...s, roll: r, phase: 'move', steps: [], start: s.board };
    const legal = sequences(s.board, s.turn, r);
    if (legal.length === 1 && legal[0].length === 0) next.last = t(`${nameOf(s.turn)} rolled ${r.join('-')} and cannot move.`, `${nameOf(s.turn)}掷出${r.join('-')}，无路可走。`, `${nameOf(s.turn)} ${r.join('-')} attı ve oynayamıyor.`);
    else next.last = '';
    setG(next); setSel(-1);
  };
  const canDouble = (s: Saved) => s.cfg.cube && s.phase === 'roll' && (s.cube.owner === -1 || s.cube.owner === s.turn) && s.score[s.turn] + s.cube.value < s.cfg.matchTo + s.cube.value && s.cube.value < 64;
  const offerDouble = () => {
    if (!canDouble(g)) return;
    const taker = 1 - g.turn;
    if (!isHuman(taker)) {
      const accept = winChance(g.board, taker) > 0.25;
      setG(accept ? { ...g, cube: { value: g.cube.value * 2, owner: taker as 0 | 1 }, last: t(`${nameOf(taker)} accepts. The cube is now ${g.cube.value * 2}.`, `${nameOf(taker)}接受加倍，现在是${g.cube.value * 2}倍。`, `${nameOf(taker)} kabul etti. Küp artık ${g.cube.value * 2}.`) } : resign(g, taker, g.cube.value));
    } else setG({ ...g, phase: 'offer' });
  };
  const answerDouble = (accept: boolean) => {
    const taker = 1 - g.turn;
    setG(accept ? { ...g, phase: 'roll', cube: { value: g.cube.value * 2, owner: taker as 0 | 1 }, last: t(`Double accepted. The cube is now ${g.cube.value * 2}.`, `接受加倍，现在是${g.cube.value * 2}倍。`, `Katlama kabul edildi. Küp artık ${g.cube.value * 2}.`) } : resign(g, taker, g.cube.value));
  };

  const doStep = (s: Step) => {
    sfx('checker');
    setG(prev => ({ ...prev, board: applyStep(prev.board, prev.turn, s), steps: [...prev.steps, s] }));
    setSel(-1);
  };
  const undo = () => {
    if (!g.steps.length) return;
    const steps = g.steps.slice(0, -1);
    setG({ ...g, steps, board: steps.reduce((b, s) => applyStep(b, g.turn, s), g.start) }); setSel(-1);
  };
  const done = () => setG(s => finishTurn(s));

  // Computer turns: decide on the cube, roll, then play the chosen steps one by one.
  useEffect(() => {
    if (isHuman(g.turn) || busy.current) return;
    if (g.phase === 'roll') {
      busy.current = true;
      const id = setTimeout(() => {
        busy.current = false;
        if (canDouble(g) && winChance(g.board, g.turn) > 0.7) {
          setG({ ...g, phase: 'offer', last: t(`${nameOf(g.turn)} offers to double.`, `${nameOf(g.turn)}提出加倍。`, `${nameOf(g.turn)} katlamayı teklif ediyor.`) });
          return;
        }
        roll();
      }, 500);
      return () => { clearTimeout(id); busy.current = false; };
    }
    if (g.phase === 'move') {
      // Play the whole chosen sequence; steps are shown one at a time. Starting from the
      // turn's start position also covers a page reload in the middle of a turn.
      busy.current = true;
      const seq = chooseSequence(g.start, g.turn, g.roll, cfg.level);
      setG(prev => ({ ...prev, board: prev.start, steps: [] }));
      let k = 0;
      const tick = () => {
        if (k < seq.length) { const s = seq[k++]; sfx('checker'); setG(prev => ({ ...prev, board: applyStep(prev.board, prev.turn, s), steps: [...prev.steps, s] })); timer = setTimeout(tick, 480); }
        else { busy.current = false; setG(prev => finishTurn(prev)); }
      };
      let timer = setTimeout(tick, 700);
      return () => { clearTimeout(timer); busy.current = false; };
    }
  }, [g.phase, g.turn]); // eslint-disable-line

  const humanMoving = g.phase === 'move' && isHuman(g.turn);
  const sources = new Set(humanMoving ? nextSteps.map(s => s.from) : []);
  const targets = humanMoving && sel >= 0 ? nextSteps.filter(s => s.from === sel) : [];
  // Clicks are in player 0's numbering; convert for player 1.
  const toOwn = (p0: number) => (g.turn === 0 ? p0 : p0 === BAR || p0 === OFF ? p0 : 25 - p0);
  const clickPoint = (p0point: number) => {
    if (!humanMoving) return;
    const own = toOwn(p0point);
    const tgt = targets.find(s => s.to === own);
    if (tgt) { doStep(tgt); return; }
    if (sources.has(own)) {
      const options = nextSteps.filter(s => s.from === own);
      const tos = new Set(options.map(s => s.to));
      if (tos.size === 1) doStep(options.sort((a, b) => b.die - a.die)[0]); else setSel(own);
    } else setSel(-1);
  };
  const clickOff = () => { const tgt = targets.find(s => s.to === OFF); if (tgt) doStep(tgt); };
  const targetP0 = new Set(targets.map(s => (s.to === OFF ? -1 : g.turn === 0 ? s.to : 25 - s.to)));
  const sourceP0 = new Set([...sources].map(s => (s === BAR ? BAR : g.turn === 0 ? s : 25 - s)));
  const selP0 = sel < 0 ? -1 : sel === BAR ? BAR : g.turn === 0 ? sel : 25 - sel;

  const checkers: JSX.Element[] = [];
  for (let i = 1; i <= 24; i++) {
    const { x, top } = pointGeom(i);
    const own = g.board[0][i] ? 0 : g.board[1][25 - i] ? 1 : -1;
    const n = own === 0 ? g.board[0][i] : own === 1 ? g.board[1][25 - i] : 0;
    const shown = Math.min(n, 5), gap = n > 5 ? 7.2 / n : 1.8;
    for (let k = 0; k < (n > 5 ? n : shown); k++) {
      const cy = top ? 0.95 + k * Math.min(1.8, gap) : 19.05 - k * Math.min(1.8, gap);
      checkers.push(<circle key={`${i}-${k}`} cx={x} cy={cy} r={0.88} className={'pul p' + own + (selP0 === i && k === n - 1 ? ' sel' : '')} />);
    }
  }
  for (const p of [0, 1]) for (let k = 0; k < g.board[p][BAR]; k++) {
    checkers.push(<circle key={`bar${p}-${k}`} cx={14} cy={p === 0 ? 11.5 + k * 1.2 : 8.5 - k * 1.2} r={0.88} className={'pul p' + p + (selP0 === BAR && g.turn === p && k === g.board[p][BAR] - 1 ? ' sel' : '')} />);
  }
  const status = g.phase === 'opening' ? t('Each player rolls one die. The higher roll starts.', '双方各掷一颗骰子，点数大的先行。', 'Her oyuncu bir zar atar. Yüksek atan başlar.')
    : g.phase === 'matchover' ? t(`${nameOf(g.score[0] > g.score[1] ? 0 : 1)} wins the match ${Math.max(...g.score)}–${Math.min(...g.score)}.`, `${nameOf(g.score[0] > g.score[1] ? 0 : 1)}以${Math.max(...g.score)}比${Math.min(...g.score)}赢得比赛。`, `${nameOf(g.score[0] > g.score[1] ? 0 : 1)} maçı ${Math.max(...g.score)}–${Math.min(...g.score)} kazandı.`)
    : g.phase === 'gameover' ? g.last
    : g.phase === 'offer' ? t(`${nameOf(g.turn)} offers to double to ${g.cube.value * 2}.`, `${nameOf(g.turn)}提出加倍到${g.cube.value * 2}。`, `${nameOf(g.turn)} ${g.cube.value * 2}’ye katlamayı teklif ediyor.`)
    : g.last || (g.phase === 'roll' ? t(`${nameOf(g.turn)} (${colour(g.turn)}) to roll.`, `轮到${nameOf(g.turn)}（${colour(g.turn)}）掷骰。`, `Zar sırası: ${nameOf(g.turn)} (${colour(g.turn)}).`)
      : nextSteps.length ? t(`${nameOf(g.turn)} (${colour(g.turn)}) to move.`, `轮到${nameOf(g.turn)}（${colour(g.turn)}）走棋。`, `Hamle sırası: ${nameOf(g.turn)} (${colour(g.turn)}).`) : t('Turn complete.', '本回合结束。', 'Sıra tamamlandı.'));
  const inProgress = g.started && g.phase !== 'matchover';

  return (
    <div className="play tavla">
      <div className="play-main">
        <div className="statline">
          <span role="status" aria-live="polite">{status}</span>
          <span className="num">{t(`Pips ${pips(g.board, 0)} · ${pips(g.board, 1)}`, `点数 ${pips(g.board, 0)} · ${pips(g.board, 1)}`, `Kalan ${pips(g.board, 0)} · ${pips(g.board, 1)}`)}</span>
        </div>
        <div className={'tv-wrap' + (tall ? ' tall' : '')}>
        <svg className={'tv-board' + (tall ? ' tall' : '')} onClick={() => { if (g.phase === 'roll' && isHuman(g.turn)) roll(); else if (g.phase === 'opening') rollOpening(); }} viewBox={tall ? '0 0 20 30' : '0 0 30 20'} role="application" aria-label={t('Tavla board. Click a checker, then a highlighted point.', '双陆棋棋盘。先点棋子，再点高亮的位置。', 'Tavla tahtası. Bir pula, sonra işaretli haneye tıkla.')}>
          <g transform={tall ? 'translate(20 0) rotate(90)' : undefined}>
          <rect x="0" y="0" width="28" height="20" className="tv-frame" />
          <rect x="1" y="0.3" width="12" height="19.4" className="tv-felt" /><rect x="15" y="0.3" width="12" height="19.4" className="tv-felt" />
          <rect x="13" y="0" width="2" height="20" className="tv-bar" />
          {Array.from({ length: 24 }, (_, k) => {
            const i = k + 1, { x, top } = pointGeom(i);
            const d = top ? `M${x - 1} 0.3L${x + 1} 0.3L${x} 8.4Z` : `M${x - 1} 19.7L${x + 1} 19.7L${x} 11.6Z`;
            return <path key={i} d={d} className={'tv-pt ' + (i % 2 ? 'a' : 'b') + (targetP0.has(i) ? ' target' : '') + (sourceP0.has(i) ? ' source' : '')} />;
          })}
          {Array.from({ length: 24 }, (_, k) => {
            const i = k + 1, { x, top } = pointGeom(i);
            return <text key={'n' + i} x={x} y={top ? 9.3 : 11.2} className="tv-num" textAnchor="middle" transform={upright(x, top ? 9.1 : 11)}>{g.turn === 1 && cfg.opponent === 'local' ? 25 - i : i}</text>;
          })}
          {checkers}
          {[0, 1].map(p => g.board[p][BAR] > 1 && <text key={'bc' + p} x={14} y={p === 0 ? 10.4 : 10.3} className="tv-count" textAnchor="middle" transform={upright(14, 10.2)}>{g.board[p][BAR]}</text>)}
          {/* stacks taller than five show a count */}
          {Array.from({ length: 24 }, (_, k) => {
            const i = k + 1, { x, top } = pointGeom(i), n = g.board[0][i] || g.board[1][25 - i];
            return n > 5 ? <text key={'c' + i} x={x} y={top ? 9.9 : 10.7} className="tv-count" textAnchor="middle" transform={upright(x, top ? 9.7 : 10.5)}>{n}</text> : null;
          })}
          <rect x="28.2" y="0.3" width="1.6" height="9.4" className={'tv-off' + (targetP0.has(-1) && g.turn === 1 ? ' target' : '')} onClick={clickOff} />
          <rect x="28.2" y="10.3" width="1.6" height="9.4" className={'tv-off' + (targetP0.has(-1) && g.turn === 0 ? ' target' : '')} onClick={clickOff} />
          {Array.from({ length: g.board[1][OFF] }, (_, k) => <rect key={'o1' + k} x="28.35" y={0.5 + k * 0.6} width="1.3" height="0.5" className="pul-off p1" />)}
          {Array.from({ length: g.board[0][OFF] }, (_, k) => <rect key={'o0' + k} x="28.35" y={19 - k * 0.6} width="1.3" height="0.5" className="pul-off p0" />)}
          {cfg.cube && <g transform={`translate(14 ${g.cube.owner === 0 ? 17.6 : g.cube.owner === 1 ? 2.4 : 10})`}><rect x="-0.8" y="-0.8" width="1.6" height="1.6" rx="0.2" className="tv-cube" /><text y="0.35" textAnchor="middle" className="tv-cube-n" transform={upright(0, 0)}>{g.cube.value === 1 ? 64 : g.cube.value}</text></g>}
          {diceShown.map((d, k) => {
            const used = (() => { const u = usedDice.slice(); let c = 0; for (let j = 0; j <= k; j++) { const i = u.indexOf(diceShown[j]); if (i >= 0) { u.splice(i, 1); if (j === k) c = 1; } } return c; })();
            const cx = 19 + k * 2.2 - (diceShown.length - 2) * 1.1, cy = 10;
            return (
              <g key={'d' + k} opacity={used ? 0.35 : 1} transform={`translate(${cx} ${cy})`}>
                <rect x="-0.85" y="-0.85" width="1.7" height="1.7" rx="0.28" className={'tv-die p' + g.turn} />
                {PIPS[d].map(([px, py], j) => <circle key={j} cx={px * 0.45} cy={py * 0.45} r={0.17} className={'tv-dot p' + g.turn} />)}
              </g>
            );
          })}
          {Array.from({ length: 24 }, (_, k) => {
            const i = k + 1, { x, top } = pointGeom(i);
            return <rect key={'hit' + i} x={x - 1} y={top ? 0 : 10} width={2} height={10} fill="transparent" onClick={() => clickPoint(i)} className={humanMoving ? 'pt' : ''} />;
          })}
          <rect x="13" y={g.turn === 0 ? 10 : 0} width="2" height="10" fill="transparent" onClick={() => clickPoint(BAR)}
            className={sourceP0.has(BAR) ? 'tv-barsrc' + (selP0 === BAR ? ' sel' : '') : ''} />
          </g>
        </svg>
        {/* Controls live on the board itself: a column of round buttons in the free half, and a card in the centre for the moments between turns. */}
        <div className="tv-actions" onClick={e => e.stopPropagation()}>
          {g.phase === 'roll' && isHuman(g.turn) && <button type="button" id="tv-roll" className="tv-act go" onClick={() => roll()} aria-label={t('Roll dice', '掷骰子', 'Zar at')} title={t('Roll dice', '掷骰子', 'Zar at')}><DieIcon /><span>{t('Roll', '掷骰', 'Zar at')}</span></button>}
          {g.phase === 'roll' && isHuman(g.turn) && canDouble(g) && <button type="button" id="tv-double" className="tv-act" onClick={offerDouble} aria-label={t(`Double to ${g.cube.value * 2}`, `加倍到${g.cube.value * 2}`, `${g.cube.value * 2}’ye katla`)}><b>×2</b><span>{t('Double', '加倍', 'Katla')}</span></button>}
          {humanMoving && <button type="button" id="tv-undo" className="tv-act" disabled={!g.steps.length} onClick={undo} aria-label={t('Undo move', '撤回这步', 'Hamleyi geri al')}><b>↶</b><span>{t('Undo', '撤回', 'Geri al')}</span></button>}
          {humanMoving && <button type="button" id="tv-done" className={'tv-act' + (nextSteps.length ? '' : ' go')} disabled={nextSteps.length > 0} onClick={done} aria-label={t('End turn', '结束回合', 'Sırayı bitir')}><b>✓</b><span>{t('Done', '完成', 'Bitti')}</span></button>}
        </div>
        {(g.phase === 'opening' || (g.phase === 'offer' && isHuman(1 - g.turn)) || g.phase === 'gameover' || g.phase === 'matchover') && (
          <div className="tv-card" role="status" onClick={e => e.stopPropagation()}>
            {g.phase === 'opening' && <><p>{t('Each player rolls one die. The higher roll starts.', '双方各掷一颗骰子，点数大的先行。', 'Her oyuncu bir zar atar. Yüksek atan başlar.')}</p>
              <button type="button" id="tv-open" className="btn primary" onClick={rollOpening}>{t('Roll for first move', '掷骰定先手', 'Başlamak için zar at')}</button></>}
            {g.phase === 'offer' && <><p>{t(`${nameOf(g.turn)} offers to double to ${g.cube.value * 2}.`, `${nameOf(g.turn)}提出加倍到${g.cube.value * 2}。`, `${nameOf(g.turn)} ${g.cube.value * 2}’ye katlamayı teklif ediyor.`)}</p>
              <div className="row"><button type="button" id="tv-take" className="btn primary" onClick={() => answerDouble(true)}>{t('Accept', '接受', 'Kabul et')}</button>
              <button type="button" id="tv-drop" className="btn" onClick={() => answerDouble(false)}>{t(`Decline (lose ${g.cube.value})`, `拒绝（输${g.cube.value}分）`, `Reddet (${g.cube.value} kaybet)`)}</button></div></>}
            {g.phase === 'gameover' && <><p>{g.last}</p><button type="button" id="tv-next" className="btn primary" onClick={() => setG(newGame(cfg, g.score))}>{t('Next game', '下一局', 'Sonraki oyun')}</button></>}
            {g.phase === 'matchover' && <><h3>{t('Match over', '比赛结束', 'Maç bitti')}</h3><p className="num big">{g.score[0]} – {g.score[1]}</p><p>{g.last}</p>
              <button type="button" id="tv-again" className="btn primary" onClick={() => setG(newGame(cfg))}>{t('New match', '新比赛', 'Yeni maç')}</button></>}
          </div>
        )}
        </div>
      </div>
      <aside className="play-side">
        <dl className="facts tally">
          <div><dt>{nameOf(0)} · {colour(0)}</dt><dd className="num">{g.score[0]}</dd></div>
          <div><dt>{nameOf(1)} · {colour(1)}</dt><dd className="num">{g.score[1]}</dd></div>
          <div><dt>{t('Match to', '比赛分数', 'Maç')}</dt><dd className="num">{cfg.matchTo}</dd></div>
        </dl>
        <p className="muted small">{t('Click a checker to see where it can go, then click a highlighted point. If only one move is possible, it is played at once. You must use both dice when you can.', '点击棋子查看可走位置，再点击高亮处。如果只有一种走法会直接走。能用两颗骰子时必须都用上。', 'Bir pula tıklayınca gidebileceği yerler görünür; sonra işaretli haneye tıkla. Tek bir hamle mümkünse hemen oynanır. Mümkünse iki zarı da kullanmak zorundasın.')}</p>
        <div className="setup">
          <h3>{t('New match', '新比赛', 'Yeni maç')}</h3>
          <Seg id="tv-opp" label={t('Opponent', '对手', 'Rakip')} value={draft.opponent} onChange={v => setDraft({ ...draft, opponent: v })}
            options={[{ value: 'ai', label: t('Computer', '电脑', 'Bilgisayar') }, { value: 'local', label: t('Second player', '第二位玩家', 'İkinci oyuncu') }]} />
          {draft.opponent === 'ai' ? (
            <RivalPick id="tv-level" game={'tavla'} value={draft.level} onChange={v => setDraft({ ...draft, level: v })} levels={LEVELS} />
          ) : (
            <Pick id="tv-p2" label={t('Second player', '第二位玩家', 'İkinci oyuncu')} value={draft.p2} onChange={v => setDraft({ ...draft, p2: v })}
              options={[{ value: 'guest', label: t('Guest', '游客', 'Misafir') }, ...data.profiles.filter(p => p.id !== me.id).map(p => ({ value: p.id, label: pname(p, lang) }))]} />
          )}
          <Seg id="tv-side" label={t(`${pname(me, lang)} plays`, `${pname(me, lang)}执`, `${pname(me, lang)} oynuyor`)} value={draft.human} onChange={v => setDraft({ ...draft, human: v as 0 | 1 })}
            options={[{ value: 0, label: t('White', '白', 'Beyaz') }, { value: 1, label: t('Red', '红', 'Kırmızı') }]} />
          <Seg id="tv-to" label={t('Match length', '比赛长度', 'Maç uzunluğu')} value={draft.matchTo} onChange={v => setDraft({ ...draft, matchTo: v })}
            options={[1, 3, 5, 7].map(n => ({ value: n, label: t(`${n} pt`, `${n}分`, `${n} sayı`) }))} />
          <label className="check" htmlFor="tv-cube"><input id="tv-cube" type="checkbox" checked={draft.cube} onChange={e => setDraft({ ...draft, cube: e.target.checked })} /> {t('Use the doubling cube (not part of traditional Tavla)', '使用加倍骰（传统双陆棋不用）', 'Katlama küpünü kullan (geleneksel tavlada yoktur)')}</label>
          {confirmNew ? (
            <div className="row">
              <button type="button" id="tv-discard" className="btn primary" onClick={() => { setG(newGame(draft)); setConfirmNew(false); }}>{t('Abandon and start', '放弃当前比赛', 'Bırak ve başla')}</button>
              <button type="button" id="tv-keep" className="btn" onClick={() => setConfirmNew(false)}>{t('Keep playing', '继续', 'Oynamaya devam')}</button>
            </div>
          ) : <button type="button" id="tv-new" className="btn primary" onClick={() => (inProgress ? setConfirmNew(true) : setG(newGame(draft)))}>{t('Start', '开始', 'Başla')}</button>}
        </div>
      </aside>
    </div>
  );
}
