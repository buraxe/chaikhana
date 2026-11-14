import './gomoku.css';
import { useEffect, useMemo, useRef, useState } from 'react';
import { sfx } from '../../core/sound';
import { RivalPick, useRival } from '../../ui/Cast';
import { loadJSON, saveJSON } from '../../core/storage';
import { activeOf, noteStarted, recordResult, statsOf, useData } from '../../core/store';
import { Pick, Seg } from '../../ui/bits';
import { pname, trLabel, useLang, useT, aiLabel } from '../../core/i18n';
import { chooseMove, LEVELS } from './ai';
import { coord, isForbidden, isLegal, N, newGame, play, replay, type GomokuState, type Mode } from './rules';

interface Config { mode: Mode; opponent: 'ai' | 'local'; level: number; human: 1 | 2; p2: string }
interface Saved { cfg: Config; moves: number[]; undone: boolean; recorded: boolean }
const DEFAULT: Config = { mode: 'freestyle', opponent: 'ai', level: 2, human: 1, p2: 'guest' };
const MODE_LABEL: Record<Mode, string> = { freestyle: 'Freestyle', standard: 'Standard', renju: 'Renju' };
const MODE_ZH: Record<Mode, string> = { freestyle: '自由规则', standard: '标准规则', renju: '连珠规则' };
const STARS = [[3, 3], [11, 3], [7, 7], [3, 11], [11, 11]];
const LETTERS = 'ABCDEFGHIJKLMNO';

export default function Gomoku() {
  const data = useData(), me = activeOf(data), t = useT(), lang = useLang();
  const modeName = (m: Mode) => (lang === 'zh' ? MODE_ZH[m] : trLabel(MODE_LABEL[m], lang));
  const colorName = (c: number) => (c === 1 ? t('Black', '黑方', 'Siyah') : t('White', '白方', 'Beyaz'));
  const saved = useRef(loadJSON<Saved | null>('gp.gomoku', null)).current;
  const [cfg, setCfg] = useState<Config>(saved?.cfg ?? DEFAULT);
  const [draft, setDraft] = useState<Config>(saved?.cfg ?? DEFAULT);
  const [st, setSt] = useState<GomokuState>(() => (saved ? replay(saved.cfg.mode, saved.moves) : newGame(DEFAULT.mode)));
  const [undone, setUndone] = useState(saved?.undone ?? false);
  const recorded = useRef(saved?.recorded ?? false);
  const [thinking, setThinking] = useState(false);
  const [cursor, setCursor] = useState(-1);
  const [confirmTap, setConfirmTap] = useState(() => loadJSON('gp.gomoku.confirm',
    typeof matchMedia !== 'undefined' && matchMedia('(pointer: coarse)').matches));
  const [confirmNew, setConfirmNew] = useState(false);

  const over = st.winner !== 0 || st.draw;
  const aiTurn = cfg.opponent === 'ai' && !over && st.turn !== cfg.human;
  const p2 = data.profiles.find(p => p.id === cfg.p2 && p.id !== me.id);
  const aiName = aiLabel(LEVELS[cfg.level].name, lang);
  useRival('gomoku', cfg.opponent === 'ai' ? cfg.level : null);
  const nameOf = (color: number) => (cfg.opponent === 'ai'
    ? (color === cfg.human ? pname(me, lang) : aiName)
    : color === cfg.human ? pname(me, lang) : p2 ? pname(p2, lang) : t('Guest', '游客', 'Misafir'));

  useEffect(() => {
    saveJSON('gp.gomoku', { cfg, moves: st.moves, undone, recorded: recorded.current } satisfies Saved);
  }, [cfg, st, undone]);
  useEffect(() => { saveJSON('gp.gomoku.confirm', confirmTap); }, [confirmTap]);

  const finish = (next: GomokuState) => {
    if (recorded.current || !(next.winner || next.draw)) return;
    recorded.current = true;
    const mine = next.draw ? 'draw' : next.winner === cfg.human ? 'win' : 'loss';
    const mode = MODE_LABEL[cfg.mode];
    if (cfg.opponent === 'ai') {
      recordResult(me.id, 'gomoku', { result: mine, label: `vs ${LEVELS[cfg.level].name} AI · ${mode}${undone ? ' · unrated (undo used)' : ''}`,
        oppRating: undone ? undefined : LEVELS[cfg.level].rating });
    } else {
      const theirs = mine === 'win' ? 'loss' : mine === 'loss' ? 'win' : 'draw';
      const myR = statsOf(me, 'gomoku').rating, theirR = p2 ? statsOf(p2, 'gomoku').rating : undefined;
      recordResult(me.id, 'gomoku', { result: mine, label: `vs ${p2?.name ?? 'Guest'} · ${mode} · same device`, oppRating: undone ? undefined : theirR });
      if (p2) recordResult(p2.id, 'gomoku', { result: theirs, label: `vs ${me.name} · ${mode} · same device`, oppRating: undone ? undefined : myR });
    }
  };
  const apply = (idx: number) => {
    sfx('stone');
    const next = play(st, idx);
    if (next === st) return;
    if (!st.moves.length) noteStarted('gomoku');
    setSt(next); setCursor(-1); finish(next);
  };

  useEffect(() => {
    if (!aiTurn) return;
    setThinking(true);
    const t = setTimeout(() => { apply(chooseMove(st, cfg.level)); setThinking(false); }, 60);
    return () => { clearTimeout(t); setThinking(false); };
  }, [aiTurn, st]); // eslint-disable-line

  const forbidden = useMemo(() => {
    const out = new Set<number>();
    if (cfg.mode !== 'renju' || st.turn !== 1 || over || st.moves.length < 6) return out;
    const b = st.cells.slice();
    for (let i = 0; i < N * N; i++) if (b[i] === 0 && isForbidden(b, i)) out.add(i);
    return out;
  }, [st, cfg.mode, over]);

  const tap = (idx: number) => {
    if (over || aiTurn || thinking || !isLegal(st, idx)) return;
    if (confirmTap && cursor !== idx) { setCursor(idx); return; }
    apply(idx);
  };
  const onKey = (e: React.KeyboardEvent) => {
    const d = ({ ArrowUp: -N, ArrowDown: N, ArrowLeft: -1, ArrowRight: 1 } as Record<string, number>)[e.key];
    if (d) {
      e.preventDefault();
      const cur = cursor < 0 ? 112 : cursor, x = cur % N;
      if ((d === -1 && x === 0) || (d === 1 && x === N - 1)) return;
      const next = cur + d;
      if (next >= 0 && next < N * N) setCursor(next);
    } else if ((e.key === 'Enter' || e.key === ' ') && cursor >= 0) {
      e.preventDefault();
      if (!over && !aiTurn && isLegal(st, cursor)) apply(cursor);
    }
  };
  const undo = () => {
    if (!st.moves.length || thinking) return;
    let k = 1;
    if (cfg.opponent === 'ai' && !over && st.moves.length >= 2) k = 2;
    else if (cfg.opponent === 'ai' && over && st.winner !== cfg.human && st.moves.length >= 2) k = 2;
    if (cfg.opponent === 'ai' && st.moves.length - k === 0 && cfg.human === 2) return;
    setSt(replay(cfg.mode, st.moves.slice(0, -k)));
    setUndone(true); setCursor(-1);
  };
  const startNew = (c: Config) => {
    setCfg(c); setSt(newGame(c.mode)); setUndone(false); recorded.current = false; setCursor(-1); setConfirmNew(false);
  };
  const inProgress = st.moves.length > 0 && !over;
  const others = data.profiles.filter(p => p.id !== me.id);

  const status = st.winner ? t(`${nameOf(st.winner)} wins with ${colorName(st.winner)}`, `${nameOf(st.winner)}（${colorName(st.winner)}）获胜`, `${nameOf(st.winner)} ${colorName(st.winner)} ile kazandı`)
    : st.draw ? t('Draw. The board is full.', '和棋，棋盘已满。', 'Berabere. Tahta doldu.')
    : thinking ? t(`${nameOf(st.turn)} is thinking…`, `${nameOf(st.turn)}思考中…`, `${nameOf(st.turn)} düşünüyor…`)
    : t(`${nameOf(st.turn)} to move (${colorName(st.turn)})`, `轮到${nameOf(st.turn)}（${colorName(st.turn)}）`, `Sıra ${nameOf(st.turn)} oyuncusunda (${colorName(st.turn)})`);
  const last = st.moves[st.moves.length - 1];
  const winSet = new Set(st.line);

  return (
    <div className="play gmk">
      <div className="play-main">
        <div className="statline">
          <span role="status" aria-live="polite"><i className={'dot ' + (st.winner ? (st.winner === 1 ? 'b' : 'w') : st.turn === 1 ? 'b' : 'w')} />{status}</span>
          <span className="muted">{modeName(cfg.mode)} · {t(`move ${st.moves.length + (over ? 0 : 1)}`, `第${st.moves.length + (over ? 0 : 1)}手`, `hamle ${st.moves.length + (over ? 0 : 1)}`)}</span>
        </div>
        <div className="board-frame">
          <svg className="goban" viewBox="0 0 16 16" role="application" tabIndex={0} onKeyDown={onKey}
            aria-label={t('Gomoku board, 15 by 15. Arrow keys move the cursor, Enter places a stone.', '五子棋棋盘，15×15。方向键移动光标，回车落子。', 'Gomoku tahtası, 15×15. Ok tuşları imleci taşır, Enter taş koyar.')}>
            <defs>
              <radialGradient id="gb" cx="35%" cy="30%" r="75%"><stop offset="0" stopColor="var(--stone-b-hi)" /><stop offset="1" stopColor="var(--stone-b)" /></radialGradient>
              <radialGradient id="gw" cx="35%" cy="30%" r="80%"><stop offset="0" stopColor="var(--stone-w-hi)" /><stop offset="1" stopColor="var(--stone-w)" /></radialGradient>
              <linearGradient id="wood" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="var(--wood-1)" /><stop offset="1" stopColor="var(--wood-2)" /></linearGradient>
              <pattern id="grain" width="16" height="0.37" patternUnits="userSpaceOnUse"><path d="M0 .18 Q4 .05 8 .2 T16 .16" fill="none" stroke="var(--wood-line)" strokeOpacity=".09" strokeWidth=".03" /></pattern>
            </defs>
            <rect width="16" height="16" fill="url(#wood)" />
            <rect width="16" height="16" fill="url(#grain)" />
            {Array.from({ length: N }, (_, k) => (
              <g key={k} stroke="var(--wood-line)" strokeWidth={k === 0 || k === N - 1 ? 0.06 : 0.035} strokeLinecap="square">
                <line x1={1} y1={k + 1} x2={N} y2={k + 1} /><line x1={k + 1} y1={1} x2={k + 1} y2={N} />
              </g>
            ))}
            {STARS.map(([x, y]) => <circle key={x + '-' + y} cx={x + 1} cy={y + 1} r={0.1} fill="var(--wood-line)" />)}
            <g className="goban-label" fill="var(--wood-line)" fontSize={0.34} textAnchor="middle" aria-hidden="true">
              {Array.from({ length: N }, (_, k) => <text key={'x' + k} x={k + 1} y={15.78}>{LETTERS[k]}</text>)}
              {Array.from({ length: N }, (_, k) => <text key={'y' + k} x={0.36} y={k + 1.12}>{N - k}</text>)}
            </g>
            {st.cells.map((c, i) => {
              if (!c) return null;
              const x = (i % N) + 1, y = Math.floor(i / N) + 1;
              return (
                <g key={i}>
                  <circle cx={x + 0.04} cy={y + 0.06} r={0.44} fill="var(--stone-shadow)" />
                  <circle cx={x} cy={y} r={0.44} fill={c === 1 ? 'url(#gb)' : 'url(#gw)'} className={i === last ? 'drop' : ''} />
                  {winSet.has(i) && <circle cx={x} cy={y} r={0.5} fill="none" stroke="var(--red)" strokeWidth={0.09} />}
                  {i === last && !winSet.has(i) && <circle cx={x} cy={y} r={0.12} fill="var(--red)" />}
                </g>
              );
            })}
            {[...forbidden].map(i => {
              const x = (i % N) + 1, y = Math.floor(i / N) + 1;
              return <path key={'f' + i} d={`M${x - 0.16} ${y - 0.16}l.32 .32m0-.32l-.32 .32`} stroke="var(--red)" strokeWidth={0.07} strokeLinecap="round" />;
            })}
            {cursor >= 0 && !st.cells[cursor] && !over && (
              <circle cx={(cursor % N) + 1} cy={Math.floor(cursor / N) + 1} r={0.44} fill={st.turn === 1 ? 'url(#gb)' : 'url(#gw)'} opacity={0.5}
                stroke="var(--red)" strokeWidth={0.05} />
            )}
            {!over && !aiTurn && st.cells.map((c, i) => (c ? null : (
              <rect key={'t' + i} x={(i % N) + 0.5} y={Math.floor(i / N) + 0.5} width={1} height={1} fill="transparent"
                className={forbidden.has(i) ? 'no' : 'pt'} onClick={() => tap(i)} />
            )))}
          </svg>
        </div>
        {confirmTap && cursor >= 0 && !over && <p className="hint">{t(`Tap ${coord(cursor)} again to place the stone.`, `再点一次 ${coord(cursor)} 落子。`, `Taşı koymak için ${coord(cursor)} noktasına yeniden dokun.`)}</p>}
        {forbidden.size > 0 && <p className="muted small">{t('Red crosses mark points Black may not play under Renju rules.', '红叉表示连珠规则下黑方的禁手点。', 'Kırmızı çarpılar Renju kurallarına göre Siyah’ın oynayamayacağı noktaları gösterir.')}</p>}
      </div>

      <aside className="play-side">
        {over && (
          <div className="result" role="status">
            <h3>{st.draw ? t('Draw', '和棋', 'Berabere') : t(`${nameOf(st.winner)} wins`, `${nameOf(st.winner)}获胜`, `${nameOf(st.winner)} kazandı`)}</h3>
            <p className="muted">{t(`${st.moves.length} moves`, `共${st.moves.length}手`, `${st.moves.length} hamle`)} · {modeName(cfg.mode)}{cfg.opponent === 'ai' && undone ? t(' · unrated because undo was used', ' · 用了悔棋，不计分', ' · geri alma kullanıldığı için puana sayılmadı') : ''}</p>
            <button type="button" id="gmk-again" className="btn primary" onClick={() => startNew(cfg)}>{t('Play again', '再来一局', 'Tekrar oyna')}</button>
          </div>
        )}
        <div className="tools">
          <button type="button" id="gmk-undo" className="btn" disabled={!st.moves.length || thinking} onClick={undo}>{t('Undo', '悔棋', 'Geri al')}</button>
          <label className="check" htmlFor="gmk-confirm">
            <input id="gmk-confirm" type="checkbox" checked={confirmTap} onChange={e => { setConfirmTap(e.target.checked); setCursor(-1); }} />
            {t('Tap twice to place', '点两次落子', 'Koymak için iki kez dokun')}
          </label>
        </div>

        <div className="moves">
          <h3>{t('Moves', '棋谱', 'Hamleler')}</h3>
          {st.moves.length ? (
            <ol className="move-list num">
              {st.moves.map((m, k) => <li key={k} className={k % 2 ? 'w' : 'b'}><span>{k + 1}.</span> {coord(m)}</li>)}
            </ol>
          ) : <p className="muted small">{t('Black moves first. The centre point is H8.', '黑方先行，天元是 H8。', 'Siyah başlar. Orta nokta H8’dir.')}</p>}
        </div>

        <div className="setup">
          <h3>{t('New game', '新对局', 'Yeni oyun')}</h3>
          <Seg id="gmk-opp" label={t('Opponent', '对手', 'Rakip')} value={draft.opponent} onChange={v => setDraft({ ...draft, opponent: v })}
            options={[{ value: 'ai', label: t('Computer', '电脑', 'Bilgisayar') }, { value: 'local', label: t('Second player', '第二位玩家', 'İkinci oyuncu') }]} />
          {draft.opponent === 'ai' ? (
            <RivalPick id="gmk-level" game={'gomoku'} value={draft.level} onChange={v => setDraft({ ...draft, level: v })} levels={LEVELS} />
          ) : (
            <Pick id="gmk-p2" label={t('Second player', '第二位玩家', 'İkinci oyuncu')} value={draft.p2} onChange={v => setDraft({ ...draft, p2: v })}
              options={[{ value: 'guest', label: t('Guest', '游客', 'Misafir') }, ...others.map(p => ({ value: p.id, label: pname(p, lang) }))]} />
          )}
          <Seg id="gmk-color" label={t(`${pname(me, lang)} plays`, `${pname(me, lang)}执`, `${pname(me, lang)} oynuyor`)} value={draft.human} onChange={v => setDraft({ ...draft, human: v })}
            options={[{ value: 1, label: t('Black (first)', '黑（先手）', 'Siyah (ilk)') }, { value: 2, label: t('White', '白', 'Beyaz') }]} />
          <Seg id="gmk-mode" label={t('Rules', '规则', 'Kurallar')} value={draft.mode} onChange={v => setDraft({ ...draft, mode: v })}
            options={(['freestyle', 'standard', 'renju'] as Mode[]).map(m => ({ value: m, label: modeName(m) }))} />
          <p className="muted small">{draft.mode === 'freestyle' ? t('Five or more in a row wins.', '连成五子或更多即获胜。', 'Beş ya da daha fazla taş dizen kazanır.')
            : draft.mode === 'standard' ? t('Exactly five wins. Six in a row does not count.', '恰好五子获胜，六子不算。', 'Tam beş kazandırır. Altılı dizi sayılmaz.')
            : t('Black may not play a double-three, double-four or overline. White is unrestricted.', '黑方禁止双三、双四和长连，白方不受限制。', 'Siyah çift üçlü, çift dörtlü ya da beşten uzun dizi yapamaz. Beyaz serbesttir.')}</p>
          {confirmNew ? (
            <div className="row">
              <button type="button" id="gmk-discard" className="btn primary" onClick={() => startNew(draft)}>{t('Abandon and start', '放弃当前对局', 'Bırak ve başla')}</button>
              <button type="button" id="gmk-keep" className="btn" onClick={() => setConfirmNew(false)}>{t('Keep playing', '继续下', 'Oynamaya devam')}</button>
            </div>
          ) : <button type="button" id="gmk-new" className="btn primary" onClick={() => (inProgress ? setConfirmNew(true) : startNew(draft))}>{t('Start', '开始', 'Başla')}</button>}
        </div>
      </aside>
    </div>
  );
}
