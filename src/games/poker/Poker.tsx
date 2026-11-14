import './poker.css';
import { useEffect, useMemo, useState } from 'react';
import { CAST, castName, levelOf } from '../../core/cast';
import { pname, useLang, useT } from '../../core/i18n';
import { sfx } from '../../core/sound';
import { loadJSON, saveJSON } from '../../core/storage';
import { activeOf, getData, noteStarted, recordResult, useData } from '../../core/store';
import { Seg } from '../../ui/bits';
import { Face } from '../../ui/Cast';
import { PlayingCard } from '../cards/Card';
import { freshRng } from '../cards/deck';
import { PassCover } from '../cards/TrickTable';
import { useComputer } from '../cards/useTable';
import { decide } from './ai';
import { CATEGORY, categoryOf } from './eval';
import { act, legalActions, newTable, pot, START_CHIPS, startHand, type Action, type PState } from './rules';

interface Saved { st: PState; humans: number; viewer: number; started: boolean; recorded: boolean; busted: number[] }
const make = (humans: string[], bots: number[], lang: 'en' | 'zh' | 'tr'): Saved => {
  const players = [...humans.map(n => ({ name: n, human: true, level: 2 })), ...bots.map(w => ({ name: castName(w, lang), human: false, level: levelOf(w), who: w }))];
  return { st: startHand(newTable(players), freshRng()), humans: humans.length, viewer: 0, started: false, recorded: false, busted: [] };
};

export default function Poker() {
  const t = useT(), lang = useLang(), me = activeOf(useData());
  const [s, setS] = useState<Saved>(() => loadJSON<Saved | null>('gp.poker', null) ?? make([pname(me, lang)], [5, 9, 14], lang));
  const [draft, setDraft] = useState({ humans: s.humans, names: ['', t('Player 2', '玩家2', 'Oyuncu 2'), t('Player 3', '玩家3', 'Oyuncu 3'), t('Player 4', '玩家4', 'Oyuncu 4'), t('Player 5', '玩家5', 'Oyuncu 5'), t('Player 6', '玩家6', 'Oyuncu 6')], bots: [5, 9, 14] });
  const [raiseTo, setRaiseTo] = useState(0);
  const [ask, setAsk] = useState(false);
  useEffect(() => { saveJSON('gp.poker', s); }, [s]);
  const st = s.st, n = st.seats.length;
  const actor = st.phase === 'betting' ? st.turn : -1, seat = actor >= 0 ? st.seats[actor] : null;
  const cover = s.humans > 1 && seat?.human && actor !== s.viewer;
  const mine = !!seat?.human && actor === s.viewer && !cover;
  const L = mine ? legalActions(st, actor) : null;
  useEffect(() => { if (L) setRaiseTo(Math.min(L.maxTo, L.minTo)); }, [actor, st.street, st.currentBet]); // eslint-disable-line

  const doAct = (i: number, a: Action) => {
    const next = act(st, i, a);
    if (next === st) return;
    if (!s.started) noteStarted('poker');
    sfx(a.kind === 'fold' ? 'slide' : a.kind === 'check' ? 'click' : 'peg');
    if (next.board.length > st.board.length) setTimeout(() => sfx('card'), 250);
    setS(x => ({ ...x, st: next, started: true }));
  };
  useComputer(actor >= 0 && !!seat && !seat.human, () => doAct(actor, decide(st, actor, seat!.level)), 800, [st]);
  // Hand over: note who went bust; at the end of the game, record the result.
  useEffect(() => {
    if (st.phase === 'betting') return;
    const out = st.seats.map((x, i) => i).filter(i => st.seats[i].chips <= 0 && !s.busted.includes(i));
    if (st.result?.pots.some(p => p.winners.some(w => st.seats[w].human)) && st.result.pots.length) sfx(st.seats[s.viewer].chips > 0 && st.result.pots.some(p => p.winners.includes(s.viewer)) ? 'win' : 'card');
    let busted = s.busted;
    if (out.length) busted = [...busted, ...out];
    const humanOut = s.humans === 1 && st.seats[0].chips <= 0;
    if ((st.phase === 'over' || humanOut) && !s.recorded && s.humans === 1) {
      const place = st.seats[0].chips > 0 ? 1 : n - busted.indexOf(0);
      recordResult(getData().activeId, 'poker', { result: place === 1 ? 'win' : 'loss', label: `${n} players · place ${place}` });
      setS(x => ({ ...x, busted, recorded: true }));
    } else if (busted !== s.busted) setS(x => ({ ...x, busted }));
  }, [st.phase, st.hand]); // eslint-disable-line
  const nextHand = () => { sfx('card'); setS(x => ({ ...x, st: startHand(x.st, freshRng()), viewer: x.humans > 1 ? x.viewer : 0 })); };
  const start = () => {
    const names = [pname(me, lang), ...draft.names.slice(1, draft.humans).map((x, i) => x.trim() || t(`Player ${i + 2}`, `玩家${i + 2}`, `Oyuncu ${i + 2}`))];
    setS(make(names, draft.bots.slice(0, 6 - draft.humans), lang)); setAsk(false);
  };
  const humanOut = s.humans === 1 && st.seats[0].chips <= 0 && st.phase !== 'betting';
  const over = st.phase === 'over' || humanOut;

  const lastEvent = (i: number) => { for (let k = st.events.length - 1; k >= 0; k--) if (st.events[k].seat === i && st.events[k].kind !== 'win') return st.events[k]; return null; };
  const evText = (e: ReturnType<typeof lastEvent>) => !e ? '' : ({
    fold: t('fold', '弃牌', 'pas geçti'), check: t('check', '过牌', 'kontrol'), call: t(`call ${e.amount}`, `跟注${e.amount}`, `gördü ${e.amount}`),
    raise: t(`raise to ${e.amount}`, `加注到${e.amount}`, `${e.amount}’e çıktı`), allin: t('all in!', '全下！', 'all-in!'), blind: t(`blind ${e.amount}`, `盲注${e.amount}`, `kör ${e.amount}`), win: '',
  } as Record<string, string>)[e.kind];
  const winners = useMemo(() => new Set(st.result?.pots.flatMap(p => p.winners) ?? []), [st.result]);
  const visible = (i: number) => (st.seats[i].human && i === s.viewer && !cover) || (st.phase !== 'betting' && (st.result?.shown.includes(i) ?? false));
  const pos = (i: number) => {
    const a = Math.PI / 2 + ((i - s.viewer + n) % n) / n * Math.PI * 2;
    return { left: `${50 + Math.cos(a) * 44}%`, top: `${50 + Math.sin(a) * 40}%` };
  };
  const status = over ? (st.seats[0].chips > 0 && s.humans === 1 ? t('You won the table!', '你赢下了整张桌子！', 'Masayı kazandın!') : s.humans === 1 ? t('You are out of chips.', '你的筹码输光了。', 'Fişlerin bitti.') : t(`${st.seats.find(x => x.chips > 0)?.name} wins the table!`, `${st.seats.find(x => x.chips > 0)?.name}赢下整张桌子！`, `Masayı ${st.seats.find(x => x.chips > 0)?.name} kazandı!`))
    : st.phase === 'showdown' ? t('Hand over.', '本手结束。', 'El bitti.')
    : mine ? (L!.toCall ? t(`Your turn: ${L!.toCall} to call.`, `轮到你：跟注需要${L!.toCall}。`, `Sıra sende: görmek için ${L!.toCall}.`) : t('Your turn: check or bet.', '轮到你：过牌或下注。', 'Sıra sende: kontrol et ya da bahis yap.'))
    : t(`${seat?.name} is thinking…`, `${seat?.name}思考中…`, `${seat?.name} düşünüyor…`);
  const p = pot(st);
  return (
    <div className="play poker">
      <div className="play-main">
        <div className="statline"><span role="status" aria-live="polite">{status}</span><span className="muted num">{t(`Hand ${st.hand + 1} · blinds ${st.sb}/${st.bb}`, `第${st.hand + 1}手 · 盲注${st.sb}/${st.bb}`, `El ${st.hand + 1} · körler ${st.sb}/${st.bb}`)}</span></div>
        <div className="pk-table">
          <div className="pk-felt">
            <div className="pk-board">
              {[0, 1, 2, 3, 4].map(k => (st.board[k] !== undefined ? <PlayingCard key={k} c={st.board[k]} /> : <span key={k} className="pk-slot" />))}
            </div>
            <div className="pk-pot num">{t('Pot', '底池', 'Pot')} {p || st.result?.pots.reduce((a, x) => a + x.amount, 0) || 0}</div>
          </div>
          {st.seats.map((x, i) => {
            const e = lastEvent(i), win = st.phase !== 'betting' && winners.has(i);
            return (
              <div key={i} className={'pk-seat' + (x.out ? ' out' : '') + (x.folded && !x.out ? ' folded' : '') + (actor === i ? ' turn' : '') + (win ? ' win' : '')} style={pos(i)}>
                <div className="pk-cards">{x.cards.map((c, k) => <PlayingCard key={k} c={c} back={!visible(i)} small />)}</div>
                <div className="pk-plate">
                  {!x.human && <Face level={x.who ?? x.level} size={26} />}
                  <span className="pk-name"><b>{x.name}</b><span className="num">{x.out ? t('out', '出局', 'elendi') : x.chips}</span></span>
                  {st.dealer === i && <span className="pk-dealer" title={t('Dealer', '庄家', 'Krupiye')}>D</span>}
                </div>
                {st.phase === 'betting' && x.bet > 0 && <span className="pk-bet num">{x.bet}</span>}
                <span className="pk-ev">{win ? t('wins!', '赢了！', 'kazandı!') : st.phase === 'betting' ? evText(e) : st.result?.scores[i] != null ? t(...CATEGORY[categoryOf(st.result.scores[i])]) : ''}</span>
              </div>
            );
          })}
        </div>
        {cover && seat ? <PassCover name={seat.name} id="pk-ready" onReady={() => setS({ ...s, viewer: actor })} />
          : mine && L ? (
            <div className="pk-actions">
              <button type="button" id="pk-fold" className="btn" onClick={() => doAct(actor, { kind: 'fold' })}>{t('Fold', '弃牌', 'Pas')}</button>
              {L.canCheck ? <button type="button" id="pk-check" className="btn" onClick={() => doAct(actor, { kind: 'check' })}>{t('Check', '过牌', 'Kontrol')}</button>
                : <button type="button" id="pk-call" className="btn primary" onClick={() => doAct(actor, { kind: 'call' })}>{t(`Call ${Math.min(L.toCall, st.seats[actor].chips)}`, `跟注 ${Math.min(L.toCall, st.seats[actor].chips)}`, `Gör ${Math.min(L.toCall, st.seats[actor].chips)}`)}</button>}
              {L.canRaise && <div className="pk-raise">
                <input type="range" id="pk-amount" min={L.minTo} max={L.maxTo} step={st.bb} value={raiseTo} onChange={e => setRaiseTo(+e.target.value)} aria-label={t('Raise to', '加注到', 'Yükselt')} />
                <div className="row">
                  {[[t('½ pot', '半池', '½ pot'), 0.5], [t('Pot', '一池', 'Pot'), 1]].map(([lab, f]) => <button key={String(lab)} type="button" className="btn sm" onClick={() => setRaiseTo(Math.max(L.minTo, Math.min(L.maxTo, st.currentBet + Math.round(p * (f as number)))))}>{lab}</button>)}
                  <button type="button" className="btn sm" onClick={() => setRaiseTo(L.maxTo)}>{t('All in', '全下', 'All-in')}</button>
                  <button type="button" id="pk-raise" className="btn primary" onClick={() => doAct(actor, { kind: 'raise', to: raiseTo })}>{raiseTo >= L.maxTo ? t(`All in ${raiseTo}`, `全下 ${raiseTo}`, `All-in ${raiseTo}`) : st.currentBet ? t(`Raise to ${raiseTo}`, `加注到 ${raiseTo}`, `${raiseTo}’e yükselt`) : t(`Bet ${raiseTo}`, `下注 ${raiseTo}`, `${raiseTo} bahis`)}</button>
                </div>
              </div>}
            </div>
          ) : st.phase === 'showdown' && !over ? (
            <div className="pk-actions"><button type="button" id="pk-next" className="btn primary" onClick={nextHand}>{t('Next hand', '下一手', 'Sonraki el')}</button></div>
          ) : over ? (
            <div className="pk-actions"><button type="button" id="pk-again" className="btn primary" onClick={start}>{t('New table', '新的一桌', 'Yeni masa')}</button></div>
          ) : null}
      </div>
      <aside className="play-side">
        <p className="muted small">{t(`Texas Hold’em, no limit. Everyone starts with ${START_CHIPS} chips; the blinds double every eight hands; the last player with chips wins the table.`, `无限注德州扑克。每人起始${START_CHIPS}筹码，每八手盲注翻倍，最后剩下筹码的人赢下整桌。`, `Limitsiz Texas Hold’em. Herkes ${START_CHIPS} fişle başlar; körler her sekiz elde ikiye katlanır; fişi kalan son oyuncu masayı kazanır.`)}</p>
        <div className="setup">
          <h3>{t('New table', '新的一桌', 'Yeni masa')}</h3>
          <Seg id="pk-humans" label={t('People at the table', '桌上真人', 'Masadaki kişi sayısı')} value={draft.humans} onChange={v => setDraft({ ...draft, humans: v })} options={[1, 2, 3, 4].map(k => ({ value: k, label: String(k) }))} />
          {draft.humans > 1 && draft.names.slice(1, draft.humans).map((x, i) => <label key={i} className="field"><span className="field-label">{t(`Player ${i + 2}`, `玩家${i + 2}`, `Oyuncu ${i + 2}`)}</span><input id={'pk-n' + (i + 1)} className="input" value={x} maxLength={18} onChange={e => setDraft({ ...draft, names: draft.names.map((y, k) => (k === i + 1 ? e.target.value : y)) })} /></label>)}
          <div className="field"><span className="field-label">{t('Regulars at the table', '同桌常客', 'Masadaki müdavimler')}</span>
            <div className="rivals">{CAST.map((_, l) => { const on = draft.bots.includes(l), full = !on && draft.humans + draft.bots.length >= 6; return (
              <button key={l} type="button" id={'pk-bot-' + l} className={'rival' + (on ? ' on' : '')} aria-pressed={on} disabled={full} title={castName(l, lang)}
                onClick={() => setDraft({ ...draft, bots: on ? draft.bots.filter(b => b !== l) : [...draft.bots, l].sort((a, b) => a - b) })}><Face level={l} size={36} /><span className="rival-flag" aria-hidden="true">{CAST[l].from}</span></button>); })}</div>
            <span className="muted small">{draft.bots.map(b => castName(b, lang)).join(', ') || '—'}</span>
          </div>
          {ask ? <div className="row"><button type="button" id="pk-discard" className="btn primary" onClick={start}>{t('Leave and start', '离开并开始', 'Kalk ve başla')}</button><button type="button" className="btn" onClick={() => setAsk(false)}>{t('Keep playing', '继续', 'Oynamaya devam')}</button></div>
            : <button type="button" id="pk-new" className="btn primary" disabled={draft.humans + draft.bots.length < 2} onClick={() => (s.started && !over ? setAsk(true) : start())}>{t('Sit down', '入座', 'Masaya otur')}</button>}
        </div>
      </aside>
    </div>
  );
}
