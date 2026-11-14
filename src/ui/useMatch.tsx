import { SLIP } from '../core/game';
import { sfx, type Sfx } from '../core/sound';
const MOVE_SOUND: Record<string, Sfx> = { dama: 'checker', 'dots-boxes': 'peg', tictactoe: 'peg', mancala: 'stone', 'connect-four': 'stone', reversi: 'stone', morris: 'stone', qubic: 'peg', checkers: 'checker', 'chinese-checkers': 'stone', 'ultimate-ttt': 'peg', nim: 'peg' };
import { RivalPick, useRival } from './Cast';
import { useEffect, useRef, useState } from 'react';
import { pname, trLabel, useLang, useT, aiLabel, guestName } from '../core/i18n';
import { recordMatch, type Level, type MatchConfig } from '../core/match';
import { loadJSON, saveJSON } from '../core/storage';
import { activeOf, noteStarted, useData, type Outcome, type Profile } from '../core/store';
import { Pick, Seg } from './bits';

export interface MatchState { moves: number[]; turn: 1 | 2; winner: 0 | 1 | 2; draw: boolean }
interface Saved { cfg: MatchConfig; moves: number[]; undone: boolean; recorded: boolean; tally: number[] }

export interface MatchApi {
  me: Profile; others: Profile[]; cfg: MatchConfig; draft: MatchConfig; setDraft: (c: MatchConfig) => void;
  over: boolean; inProgress: boolean; confirmNew: boolean; setConfirmNew: (b: boolean) => void;
  startNew: (c: MatchConfig) => void; tally: number[]; nameOf: (color: number) => string; levels: Level[];
  thinking: boolean; aiTurn: boolean; undo: () => void; canUndo: boolean; undone: boolean; game: string;
}

/**
 * The shared turn loop for small two-player games: computer or same-device opponent,
 * undo, saving the game in progress, and recording results. The game supplies only its
 * rules (newGame / play / replay) and its AI (choose).
 */
export function useMatch<S extends MatchState>(o: {
  game: string; key: string; levels: Level[]; defaults: MatchConfig;
  newGame: () => S; replay: (moves: number[]) => S; play: (s: S, m: number) => S;
  choose: (s: S, level: number) => number; aiDelay?: number; legal?: (s: S) => number[];
}): MatchApi & { st: S; apply: (m: number) => void } {
  const data = useData(), me = activeOf(data), lang = useLang();
  const saved = useRef(loadJSON<Saved | null>(o.key, null)).current;
  const [cfg, setCfg] = useState<MatchConfig>(saved?.cfg ?? o.defaults);
  const [draft, setDraft] = useState<MatchConfig>(saved?.cfg ?? o.defaults);
  const [st, setSt] = useState<S>(() => (saved ? o.replay(saved.moves) : o.newGame()));
  const [undone, setUndone] = useState(saved?.undone ?? false);
  const [tally, setTally] = useState<number[]>(saved?.tally ?? [0, 0, 0]);
  const recorded = useRef(saved?.recorded ?? false);
  const [thinking, setThinking] = useState(false);
  const [confirmNew, setConfirmNew] = useState(false);

  const over = st.winner !== 0 || st.draw;
  useRival(o.game, cfg.opponent === 'ai' ? cfg.level : null);
  const aiTurn = cfg.opponent === 'ai' && !over && st.turn !== cfg.human;
  const p2 = data.profiles.find(p => p.id === cfg.p2 && p.id !== me.id);
  const others = data.profiles.filter(p => p.id !== me.id);
  const aiName = aiLabel(o.levels[cfg.level].name, lang);
  const nameOf = (c: number) => (cfg.opponent === 'ai'
    ? (c === cfg.human ? pname(me, lang) : aiName)
    : c === cfg.human ? pname(me, lang) : p2 ? pname(p2, lang) : guestName(lang));

  useEffect(() => {
    saveJSON(o.key, { cfg, moves: st.moves, undone, recorded: recorded.current, tally } satisfies Saved);
  }, [cfg, st, undone, tally, o.key]);

  const finish = (next: S) => {
    if (recorded.current || !(next.winner || next.draw)) return;
    recorded.current = true;
    const mine: Outcome = next.draw ? 'draw' : next.winner === cfg.human ? 'win' : 'loss';
    setTally(t => { const n = t.slice(); n[mine === 'win' ? 0 : mine === 'loss' ? 1 : 2]++; return n; });
    recordMatch(o.game, cfg, me, p2, mine, '', o.levels, undone);
  };
  const apply = (m: number) => {
    const next = o.play(st, m);
    if (next === st) return;
    if (!st.moves.length) noteStarted(o.game);
    sfx(MOVE_SOUND[o.game] ?? 'stone');
    setSt(next); finish(next);
  };

  useEffect(() => {
    if (!aiTurn) return;
    setThinking(true);
    const t = setTimeout(() => {
      let m = o.choose(st, cfg.level);
      // Now and then the computer plays a casual legal move instead of its best one.
      if (Math.random() < SLIP[cfg.level]) {
        const legal: number[] = o.legal ? o.legal(st) : [];
        if (!o.legal) for (let k = 0; k < 200; k++) { try { if (o.play(st, k) !== st) legal.push(k); } catch { /* not a move */ } }
        if (legal.length) m = legal[Math.floor(Math.random() * legal.length)];
      }
      apply(m); setThinking(false);
    }, o.aiDelay ?? 250);
    return () => { clearTimeout(t); setThinking(false); };
  }, [aiTurn, st]); // eslint-disable-line

  // In computer games, undo goes back to the human's previous turn.
  const undoTarget = () => {
    let L = st.moves.length - 1;
    if (cfg.opponent === 'ai') while (L >= 0 && (L % 2 === 0 ? 1 : 2) !== cfg.human) L--;
    return L;
  };
  const canUndo = !thinking && st.moves.length > 0 && undoTarget() >= 0;
  const undo = () => {
    if (!canUndo) return;
    setSt(o.replay(st.moves.slice(0, undoTarget()))); setUndone(true);
  };
  const startNew = (c: MatchConfig) => {
    if (c.opponent !== cfg.opponent || c.level !== cfg.level || c.p2 !== cfg.p2) setTally([0, 0, 0]);
    setCfg(c); setSt(o.newGame()); setUndone(false); recorded.current = false; setConfirmNew(false);
  };

  return { me, others, cfg, draft, setDraft, over, inProgress: st.moves.length > 0 && !over, confirmNew, setConfirmNew,
    startNew, tally, nameOf, levels: o.levels, thinking, aiTurn, undo, canUndo, undone, st, apply, game: o.game };
}

/** Score for the current pairing, undo, and the new-game form. */
export function MatchPanel({ id, m, sides }: { id: string; m: MatchApi; sides: [string, string] }) {
  const { draft, setDraft } = m, t = useT(), lang = useLang();
  const opp = m.nameOf(m.cfg.human === 1 ? 2 : 1), me = pname(m.me, lang);
  return (
    <>
      <dl className="facts tally">
        <div><dt>{me}</dt><dd className="num">{m.tally[0]}</dd></div>
        <div><dt>{opp}</dt><dd className="num">{m.tally[1]}</dd></div>
        <div><dt>{t('Draws', '和棋', 'Beraberlik')}</dt><dd className="num">{m.tally[2]}</dd></div>
      </dl>
      <div className="tools">
        <button type="button" id={id + '-undo'} className="btn" disabled={!m.canUndo} onClick={m.undo}>{t('Undo', '悔棋', 'Geri al')}</button>
        {m.over && <button type="button" id={id + '-again'} className="btn primary" onClick={() => m.startNew(m.cfg)}>{t('Play again', '再来一局', 'Tekrar oyna')}</button>}
      </div>
      <div className="setup">
        <h3>{t('New game', '新对局', 'Yeni oyun')}</h3>
        <Seg id={id + '-opp'} label={t('Opponent', '对手', 'Rakip')} value={draft.opponent} onChange={v => setDraft({ ...draft, opponent: v })}
          options={[{ value: 'ai', label: t('Computer', '电脑', 'Bilgisayar') }, { value: 'local', label: t('Second player', '第二位玩家', 'İkinci oyuncu') }]} />
        {draft.opponent === 'ai' ? (
          <RivalPick id={id + '-level'} game={m.game} value={draft.level} onChange={v => setDraft({ ...draft, level: v })} levels={m.levels} />
        ) : (
          <Pick id={id + '-p2'} label={t('Second player', '第二位玩家', 'İkinci oyuncu')} value={draft.p2} onChange={v => setDraft({ ...draft, p2: v })}
            options={[{ value: 'guest', label: t('Guest', '游客', 'Misafir') }, ...m.others.map(p => ({ value: p.id, label: pname(p, lang) }))]} />
        )}
        <Seg id={id + '-side'} label={t(`${me} plays`, `${me}执`, `${me} oynuyor`)} value={draft.human} onChange={v => setDraft({ ...draft, human: v })}
          options={[{ value: 1, label: sides[0] }, { value: 2, label: sides[1] }]} />
        {m.confirmNew ? (
          <div className="row">
            <button type="button" id={id + '-discard'} className="btn primary" onClick={() => m.startNew(draft)}>{t('Abandon and start', '放弃当前对局', 'Bırak ve başla')}</button>
            <button type="button" id={id + '-keep'} className="btn" onClick={() => m.setConfirmNew(false)}>{t('Keep playing', '继续下', 'Oynamaya devam')}</button>
          </div>
        ) : <button type="button" id={id + '-new'} className="btn primary" onClick={() => (m.inProgress ? m.setConfirmNew(true) : m.startNew(draft))}>{t('Start', '开始', 'Başla')}</button>}
      </div>
    </>
  );
}
