import { useEffect, useState } from 'react';
import { pname, useLang, useT, aiLabel } from '../../core/i18n';
import { loadJSON, saveJSON } from '../../core/storage';
import { activeOf, getData, noteStarted, recordResult, useData } from '../../core/store';
import { Seg } from '../../ui/bits';
import { RivalPick, useRival } from '../../ui/Cast';
import { freshRng, SUITS, SUIT_NAMES, type Card } from '../cards/deck';
import { LEVELS } from '../cards/levels';
import { PassCover, TrickTable } from '../cards/TrickTable';
import { playSound, useComputer, useTrickFlash } from '../cards/useTable';
import { aiBid, aiPlay, bestTrump, bid, chooseTrump, dealHand, MIN_BID, play, playable, score, type BHand } from './rules';

interface Saved { humans: number; pnames: string[]; level: number; length: number; handNo: number; scores: number[]; h: BHand; viewer: number; started: boolean; settled: boolean; over: boolean; recorded: boolean; history: number[][] }
const fresh = (humans: number, pnames: string[], level: number, length: number): Saved =>
  ({ humans, pnames, level, length, handNo: 0, scores: [0, 0, 0, 0], h: dealHand(3, freshRng()), viewer: 0, started: false, settled: false, over: false, recorded: false, history: [] });

export default function Batak() {
  const t = useT(), lang = useLang(), me = activeOf(useData());
  const [g, setG] = useState<Saved>(() => loadJSON<Saved | null>('gp.batak', null) ?? fresh(1, [], 2, 6));
  const [draft, setDraft] = useState({ humans: g.humans, level: g.level, length: g.length, names: g.pnames.length ? g.pnames : ['', t('Player 2', '玩家2', 'Oyuncu 2'), t('Player 3', '玩家3', 'Oyuncu 3'), t('Player 4', '玩家4', 'Oyuncu 4')] });
  const [ask, setAsk] = useState(false);
  useEffect(() => { saveJSON('gp.batak', g); }, [g]);
  useRival('batak', g.humans < 4 ? g.level : null);
  const h = g.h, human = (s: number) => s < g.humans;
  const names = [0, 1, 2, 3].map(s => (s === 0 ? pname(me, lang) : human(s) ? g.pnames[s] || t(`Player ${s + 1}`, `玩家${s + 1}`, `Oyuncu ${s + 1}`) : `${aiLabel(LEVELS[g.level].name, lang)} ${s + 1}`));
  const { flash, shown } = useTrickFlash(h.st);
  const actor = h.phase === 'bid' ? h.bidTurn : h.phase === 'trump' ? h.high!.seat : h.phase === 'play' ? h.st.turn : -1;
  const cover = g.humans > 1 && actor >= 0 && human(actor) && actor !== g.viewer && !flash;
  const mine = actor === g.viewer && human(actor) && !cover && !flash;
  const set = (nh: BHand) => { if (nh === h) return; if (!g.started) noteStarted('batak'); setG(s => ({ ...s, h: nh, started: true })); };

  useComputer(actor >= 0 && !human(actor) && !flash && h.phase !== 'done', () => {
    if (h.phase === 'bid') set(bid(h, actor, aiBid(h, actor, g.level)));
    else if (h.phase === 'trump') set(chooseTrump(h, actor, bestTrump(h.st.hands[actor])));
    else { playSound(); set(play(h, actor, aiPlay(h, actor, g.level))); }
  }, h.phase === 'play' ? 650 : 800, [h]);
  useEffect(() => {
    if (h.phase !== 'done' || g.settled) return;
    const pts = score(h), scores = g.scores.map((x, i) => x + pts[i]), over = g.handNo + 1 >= g.length;
    if (over && !g.recorded && g.humans < 4) {
      const best = Math.max(...scores), top = scores.filter(x => x === best).length;
      const result = scores[0] === best ? (top > 1 ? 'draw' : 'win') : 'loss';
      recordResult(getData().activeId, 'batak', { result, label: g.humans > 1 ? `same device · ${scores.join('/')}` : `vs ${LEVELS[g.level].name} AI · ${scores.join('/')}`, oppRating: g.humans > 1 ? undefined : LEVELS[g.level].rating });
    }
    setG(s => ({ ...s, scores, over, recorded: s.recorded || over, settled: true, history: [...s.history, pts] }));
  }, [h.phase]); // eslint-disable-line
  const next = () => setG(s => ({ ...s, handNo: s.handNo + 1, h: dealHand((s.handNo + 4) % 4, freshRng()), settled: false }));
  const start = () => { setG(fresh(draft.humans, draft.names, draft.level, draft.length)); setAsk(false); };

  const onPlay = (c: Card) => { if (!mine || h.phase !== 'play') return; playSound(); set(play(h, g.viewer, c)); };
  const minBid = h.high ? h.high.bid + 1 : MIN_BID;
  const suitName = (s: number) => t(SUIT_NAMES[s][0], SUIT_NAMES[s][1], SUIT_NAMES[s][2]);
  const status = h.phase === 'bid' ? (mine ? t(`Your bid: at least ${minBid} tricks, or pass.`, `你叫牌：至少${minBid}墩，或者不叫。`, `İhalen: en az ${minBid} el, ya da pas.`) : t(`${names[actor]} is bidding…`, `${names[actor]}叫牌中…`, `${names[actor]} ihale veriyor…`))
    : h.phase === 'trump' ? (mine ? t(`You won the bid at ${h.high!.bid}. Choose trump.`, `你以${h.high!.bid}墩叫到，请选将牌。`, `İhaleyi ${h.high!.bid} ile aldın. Kozu seç.`) : t(`${names[actor]} is choosing trump…`, `${names[actor]}选将牌中…`, `${names[actor]} kozu seçiyor…`))
    : h.phase === 'play' ? (mine ? t('Your turn: play a highlighted card.', '轮到你：出一张高亮的牌。', 'Sıra sende: parlayan kartlardan birini at.') : t(`${names[actor]} is playing…`, `${names[actor]}出牌中…`, `${names[actor]} oynuyor…`))
    : t('The hand is over.', '本局结束。', 'El bitti.');
  const bidLabel = (s: number) => { const b = h.bids[s]; return b === null ? '' : b === 'pass' ? t('pass', '不叫', 'pas') : String(b); };
  return (
    <div className="play batak">
      <div className="play-main">
        <div className="statline"><span role="status" aria-live="polite">{status}</span>
          {h.high && h.phase !== 'bid' && <span className="muted">{t(`Bid: ${names[h.high.seat]} ${h.high.bid}`, `叫牌：${names[h.high.seat]} ${h.high.bid}`, `İhale: ${names[h.high.seat]} ${h.high.bid}`)}{h.forced ? t(' (forced)', '（强制）', ' (zorunlu)') : ''}</span>}</div>
        {cover ? <PassCover name={names[actor]} id="bt-ready" onReady={() => setG({ ...g, viewer: actor })} /> : (
          <TrickTable st={h.st} names={names} viewer={g.viewer} playable={playable(h, g.viewer)} onPlay={onPlay} trump={h.trump} shown={shown}
            badge={s => (h.high?.seat === s && h.phase !== 'bid' ? <span className="tt-badge">{h.high.bid}</span> : null)}
            info={s => (h.phase === 'bid' ? <span className="num">{bidLabel(s)}</span> : <span className="num">{t(`${h.st.tricks[s]} tricks`, `${h.st.tricks[s]}墩`, `${h.st.tricks[s]} el`)} · {g.scores[s]}</span>)}
            centre={mine && h.phase === 'bid' ? (
              <div className="bt-bids">
                <button type="button" id="bt-pass" className="btn sm" onClick={() => set(bid(h, g.viewer, 'pass'))}>{t('Pass', '不叫', 'Pas')}</button>
                {Array.from({ length: 13 - minBid + 1 }, (_, k) => minBid + k).slice(0, 6).map(n => <button key={n} type="button" id={'bt-bid-' + n} className="btn sm primary" onClick={() => set(bid(h, g.viewer, n))}>{n}</button>)}
              </div>
            ) : mine && h.phase === 'trump' ? (
              <div className="bt-bids">{[0, 1, 2, 3].map(s => <button key={s} type="button" id={'bt-trump-' + s} className={'btn suit' + (s === 1 || s === 2 ? ' red' : '')} aria-label={suitName(s)} onClick={() => set(chooseTrump(h, g.viewer, s))}>{SUITS[s]}</button>)}</div>
            ) : null} />
        )}
        {h.phase === 'done' && (
          <div className="result">
            <table className="table">
              <thead><tr><th /><th>{t('Tricks', '墩数', 'El')}</th><th>{t('This hand', '本局', 'Bu el')}</th><th>{t('Total', '总分', 'Toplam')}</th></tr></thead>
              <tbody>{[0, 1, 2, 3].map(s => <tr key={s}><th>{names[s]}{h.high?.seat === s ? ` (${h.high.bid})` : ''}</th><td className="num">{h.st.tricks[s]}</td><td className="num">{score(h)[s]}</td><td className="num"><b>{g.scores[s]}</b></td></tr>)}</tbody>
            </table>
            {g.over ? <>
              <p className="big-note">{t(`${names[g.scores.indexOf(Math.max(...g.scores))]} wins the game!`, `${names[g.scores.indexOf(Math.max(...g.scores))]}获胜！`, `Oyunu ${names[g.scores.indexOf(Math.max(...g.scores))]} kazandı!`)}</p>
              <button type="button" id="bt-again" className="btn primary" onClick={() => setG(fresh(g.humans, g.pnames, g.level, g.length))}>{t('Play again', '再来一局', 'Tekrar oyna')}</button>
            </> : <button type="button" id="bt-next" className="btn primary" onClick={next}>{t(`Next hand (${g.handNo + 2}/${g.length})`, `下一局（${g.handNo + 2}/${g.length}）`, `Sonraki el (${g.handNo + 2}/${g.length})`)}</button>}
          </div>
        )}
      </div>
      <aside className="play-side">
        <dl className="facts tally">{[0, 1, 2, 3].map(s => <div key={s}><dt>{names[s]}</dt><dd className="num">{g.scores[s]}</dd></div>)}</dl>
        <p className="muted small">{t(`Hand ${g.handNo + 1} of ${g.length}. Follow suit and beat the best card if you can; out of a suit you must trump. Make your bid and score your tricks; fall short and lose the bid.`, `第${g.handNo + 1}/${g.length}局。必须跟花色，能大就要压；没有该花色必须出将牌。完成叫牌按墩数得分，没完成扣掉叫牌数。`, `El ${g.handNo + 1} / ${g.length}. Rengi takip et, büyüğün varsa büyük at; o renk yoksa koz çakmak zorunlu. İhaleni tutturursan aldığın eller kadar puan, tutturamazsan ihale kadar eksi.`)}</p>
        <div className="setup">
          <h3>{t('New game', '新游戏', 'Yeni oyun')}</h3>
          <Seg id="bt-humans" label={t('People at the table', '桌上真人', 'Masadaki kişi sayısı')} value={draft.humans} onChange={v => setDraft({ ...draft, humans: v })} options={[1, 2, 3, 4].map(n => ({ value: n, label: String(n) }))} />
          {draft.humans > 1 && draft.names.slice(1, draft.humans).map((n, i) => <label key={i} className="field"><span className="field-label">{t(`Player ${i + 2}`, `玩家${i + 2}`, `Oyuncu ${i + 2}`)}</span><input id={'bt-n' + (i + 1)} className="input" value={n} maxLength={18} onChange={e => setDraft({ ...draft, names: draft.names.map((x, k) => (k === i + 1 ? e.target.value : x)) })} /></label>)}
          {draft.humans < 4 && <RivalPick id="bt-level" game="batak" value={draft.level} onChange={v => setDraft({ ...draft, level: v })} levels={LEVELS} label={t('Computer players', '电脑玩家', 'Bilgisayar oyuncular')} />}
          <Seg id="bt-len" label={t('Hands', '局数', 'El sayısı')} value={draft.length} onChange={v => setDraft({ ...draft, length: v })} options={[4, 6, 8, 12].map(n => ({ value: n, label: String(n) }))} />
          {ask ? <div className="row"><button type="button" id="bt-discard" className="btn primary" onClick={start}>{t('Abandon and start', '放弃当前游戏', 'Bırak ve başla')}</button><button type="button" className="btn" onClick={() => setAsk(false)}>{t('Keep playing', '继续', 'Oynamaya devam')}</button></div>
            : <button type="button" id="bt-new" className="btn primary" onClick={() => (g.started && !g.over ? setAsk(true) : start())}>{t('Start', '开始', 'Başla')}</button>}
        </div>
      </aside>
    </div>
  );
}
