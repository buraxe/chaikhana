import './pisti.css';
import { useEffect, useRef, useState } from 'react';
import { pname, useLang, useT, aiLabel } from '../../core/i18n';
import { sfx } from '../../core/sound';
import { loadJSON, saveJSON } from '../../core/storage';
import { activeOf, getData, noteStarted, recordResult, useData } from '../../core/store';
import { Seg } from '../../ui/bits';
import { RivalPick, useRival } from '../../ui/Cast';
import { Hand, PlayingCard } from '../cards/Card';
import { freshRng, type Card } from '../cards/deck';
import { LEVELS } from '../cards/levels';
import { PassCover } from '../cards/TrickTable';
import { cardPoints, choose, deal, play, score, type PDeal } from './rules';

interface Saved { mode: 'ai' | 'local'; level: number; p2: string; target: number; scores: [number, number]; dealNo: number; d: PDeal; over: boolean; recorded: boolean; started: boolean; viewer: 0 | 1; cover: boolean; settled: boolean }
const fresh = (mode: Saved['mode'], level: number, p2: string, target: number): Saved =>
  ({ mode, level, p2, target, scores: [0, 0], dealNo: 0, d: deal(1, freshRng()), over: false, recorded: false, started: false, viewer: 0, cover: mode === 'local', settled: false });

export default function Pisti() {
  const t = useT(), lang = useLang(), me = activeOf(useData());
  const [g, setG] = useState<Saved>(() => loadJSON<Saved | null>('gp.pisti', null) ?? fresh('ai', 2, '', 101));
  const [draft, setDraft] = useState({ mode: g.mode, level: g.level, p2: g.p2 || t('Player 2', '玩家2', 'Oyuncu 2'), target: g.target });
  const [flash, setFlash] = useState<{ card: Card; pisti: number; seat: number } | null>(null);
  const [ask, setAsk] = useState(false);
  const busy = useRef(false);
  useEffect(() => { saveJSON('gp.pisti', g); }, [g]);
  useRival('pisti', g.mode === 'ai' ? g.level : null);
  const d = g.d, local = g.mode === 'local', viewer = local ? g.viewer : 0, opp = (1 - viewer) as 0 | 1;
  const names = [pname(me, lang), local ? g.p2 || t('Player 2', '玩家2', 'Oyuncu 2') : aiLabel(LEVELS[g.level].name, lang)];
  const myTurn = !d.done && d.turn === viewer && !g.cover && !flash;

  const apply = (seat: 0 | 1, c: Card) => {
    const next = play(d, seat, c);
    if (next === d) return;
    if (!g.started) noteStarted('pisti');
    const lg = next.log[next.log.length - 1];
    sfx('card');
    if (lg.took) { setFlash({ card: c, pisti: lg.pisti, seat }); setTimeout(() => sfx(lg.pisti ? 'goal' : 'tileDraw'), 200); setTimeout(() => setFlash(null), lg.pisti ? 1500 : 800); }
    setG(s => ({ ...s, d: next, started: true, cover: s.mode === 'local' && !next.done ? true : s.cover }));
  };
  // Computer's turn.
  useEffect(() => {
    if (local || d.done || d.turn !== 1 || flash || busy.current) return;
    busy.current = true;
    const id = setTimeout(() => { busy.current = false; apply(1, choose(d, 1, g.level)); }, 850);
    return () => { clearTimeout(id); busy.current = false; };
  }); // eslint-disable-line
  // Book the deal once it ends.
  useEffect(() => {
    if (!d.done || g.settled) return;
    const sc = score(d).total, scores = [g.scores[0] + sc[0], g.scores[1] + sc[1]] as [number, number];
    const over = Math.max(...scores) >= g.target && scores[0] !== scores[1];
    if (over && !g.recorded) {
      const mine = scores[0] > scores[1] ? 'win' : 'loss';
      recordResult(getData().activeId, 'pisti', { result: mine, label: local ? `same device · ${scores.join('-')}` : `vs ${LEVELS[g.level].name} AI · ${scores.join('-')}`, oppRating: local ? undefined : LEVELS[g.level].rating });
    }
    setG(s => ({ ...s, scores, over, recorded: s.recorded || over, settled: true }));
  }, [d.done]); // eslint-disable-line
  const nextDeal = () => setG(s => ({ ...s, dealNo: s.dealNo + 1, d: deal(((s.dealNo + 2) % 2) as 0 | 1, freshRng()), settled: false, cover: s.mode === 'local', viewer: 0 }));
  const start = () => { setG(fresh(draft.mode, draft.level, draft.p2, draft.target)); setAsk(false); };

  const top = d.table[d.table.length - 1];
  const status = d.done ? t('The deal is over.', '本局结束。', 'El bitti.')
    : flash ? (flash.pisti ? t(`PİŞTİ! ${names[flash.seat]} +${flash.pisti}`, `PİŞTİ！${names[flash.seat]} +${flash.pisti}`, `PİŞTİ! ${names[flash.seat]} +${flash.pisti}`) : t(`${names[flash.seat]} takes the pile.`, `${names[flash.seat]}收走了牌堆。`, `${names[flash.seat]} yerdeki kartları aldı.`))
    : myTurn ? (top === undefined ? t('Your turn. The table is empty: play any card.', '轮到你。桌上没牌，随便出一张。', 'Sıra sende. Yer boş, istediğin kartı at.') : t('Your turn: match the top card or play a jack to take the pile.', '轮到你：出同点数的牌或J就能收走牌堆。', 'Sıra sende: üstteki kartla aynı kartı ya da vale atarsan yerdekileri alırsın.'))
    : t(`${names[d.turn]} is playing…`, `${names[d.turn]}出牌中…`, `${names[d.turn]} oynuyor…`);
  const sc = score(d);
  const takenPts = (i: number) => d.taken[i].reduce((a, c) => a + cardPoints(c), 0);
  return (
    <div className="play pisti">
      <div className="play-main">
        <div className="statline"><span role="status" aria-live="polite">{status}</span></div>
        <div className="ps-table">
          <div className="ps-opp">
            <b>{names[opp]}</b>
            <span className="muted small">{t(`${d.taken[opp].length} cards · pişti ${d.pisti[opp]}`, `${d.taken[opp].length}张 · pişti ${d.pisti[opp]}`, `${d.taken[opp].length} kart · pişti ${d.pisti[opp]}`)}</span>
            <div className="ps-backs">{d.hands[opp].map((_, i) => <PlayingCard key={i} back small />)}</div>
          </div>
          <div className="ps-mid">
            <div className="ps-deck" aria-label={t(`${d.deck.length} cards left in the deck`, `牌堆剩${d.deck.length}张`, `Destede ${d.deck.length} kart kaldı`)}>
              {d.deck.length > 0 && <PlayingCard back />}<span className="num">{d.deck.length}</span>
            </div>
            <div className={'ps-pile' + (flash ? ' took' : '')} aria-label={t(`${d.table.length} cards on the table`, `桌上${d.table.length}张`, `Yerde ${d.table.length} kart`)}>
              {flash ? <PlayingCard c={flash.card} /> : d.table.slice(-4).map((c, i, arr) => (
                <span key={c} className="ps-stack" style={{ ['--i' as string]: i - arr.length + 1 }}><PlayingCard c={c} back={d.log.length === 0 && i < arr.length - 1} /></span>
              ))}
              {!flash && !d.table.length && <span className="ps-empty">{t('empty', '空', 'boş')}</span>}
              {flash?.pisti ? <span className="ps-boom">PİŞTİ!</span> : null}
              <span className="ps-count num">{flash ? '' : d.table.length}</span>
            </div>
          </div>
          {g.cover && local && !d.done ? <PassCover name={names[d.turn]} id="ps-ready" onReady={() => setG({ ...g, cover: false, viewer: d.turn })} /> : (
            <div className="ps-me">
              <Hand cards={d.hands[viewer]} playable={myTurn ? d.hands[viewer] : []} onPlay={c => myTurn && apply(viewer, c)} label={t('Your hand', '你的手牌', 'Elin')} id="ps" />
              <span className="muted small">{names[viewer]} · {t(`${d.taken[viewer].length} cards · pişti ${d.pisti[viewer]}`, `${d.taken[viewer].length}张 · pişti ${d.pisti[viewer]}`, `${d.taken[viewer].length} kart · pişti ${d.pisti[viewer]}`)}</span>
            </div>
          )}
        </div>
        {d.done && (
          <div className="result ps-result">
            <table className="table">
              <thead><tr><th /><th>{names[0]}</th><th>{names[1]}</th></tr></thead>
              <tbody>
                <tr><th>{t('Cards', '牌数', 'Kart')}</th><td className="num">{sc.cards[0]}{sc.most === 0 ? ' (+3)' : ''}</td><td className="num">{sc.cards[1]}{sc.most === 1 ? ' (+3)' : ''}</td></tr>
                <tr><th>{t('Aces, jacks, 2♣, 10♦', 'A、J、♣2、♦10', 'As, vale, ♣2, ♦10')}</th><td className="num">{takenPts(0)}</td><td className="num">{takenPts(1)}</td></tr>
                <tr><th>Pişti</th><td className="num">{d.pisti[0]}</td><td className="num">{d.pisti[1]}</td></tr>
                <tr><th>{t('This deal', '本局', 'Bu el')}</th><td className="num"><b>{sc.total[0]}</b></td><td className="num"><b>{sc.total[1]}</b></td></tr>
                <tr><th>{t('Total', '总分', 'Toplam')}</th><td className="num"><b>{g.scores[0]}</b></td><td className="num"><b>{g.scores[1]}</b></td></tr>
              </tbody>
            </table>
            {g.over ? <>
              <p className="big-note">{g.scores[0] > g.scores[1] ? t(`${names[0]} wins the game!`, `${names[0]}赢得比赛！`, `${names[0]} oyunu kazandı!`) : t(`${names[1]} wins the game.`, `${names[1]}赢得比赛。`, `${names[1]} oyunu kazandı.`)}</p>
              <button type="button" id="ps-again" className="btn primary" onClick={() => setG(fresh(g.mode, g.level, g.p2, g.target))}>{t('Play again', '再来一局', 'Tekrar oyna')}</button>
            </> : <button type="button" id="ps-next" className="btn primary" onClick={nextDeal}>{t('Next deal', '下一局', 'Sonraki el')}</button>}
          </div>
        )}
      </div>
      <aside className="play-side">
        <dl className="facts tally">
          <div><dt>{names[0]}</dt><dd className="num">{g.scores[0]}</dd></div>
          <div><dt>{names[1]}</dt><dd className="num">{g.scores[1]}</dd></div>
          <div><dt>{t('Playing to', '目标', 'Hedef')}</dt><dd className="num">{g.target}</dd></div>
        </dl>
        <p className="muted small">{t('Match the top card, or play a jack, to take the pile. A lone card taken by its twin is a pişti: 10 points, 20 with jacks.', '出同点数的牌或J收走牌堆。桌上只有一张时用同点数收走就是pişti：10分，J收J得20分。', 'Üstteki kartla aynı kartı ya da vale atıp yerdekileri al. Yerde tek kart varken aynısıyla almak piştidir: 10 puan, vale ile 20.')}</p>
        <div className="setup">
          <h3>{t('New game', '新游戏', 'Yeni oyun')}</h3>
          <Seg id="ps-mode" label={t('Opponent', '对手', 'Rakip')} value={draft.mode} onChange={v => setDraft({ ...draft, mode: v })}
            options={[{ value: 'ai', label: t('Computer', '电脑', 'Bilgisayar') }, { value: 'local', label: t('Second player', '第二位玩家', 'İkinci oyuncu') }]} />
          {draft.mode === 'ai' ? <RivalPick id="ps-level" game="pisti" value={draft.level} onChange={v => setDraft({ ...draft, level: v })} levels={LEVELS} />
            : <label className="field"><span className="field-label">{t('Second player', '第二位玩家', 'İkinci oyuncu')}</span><input id="ps-p2" className="input" value={draft.p2} maxLength={18} onChange={e => setDraft({ ...draft, p2: e.target.value })} /></label>}
          <Seg id="ps-target" label={t('Play to', '目标分', 'Kaça')} value={draft.target} onChange={v => setDraft({ ...draft, target: v })} options={[51, 101, 151].map(n => ({ value: n, label: String(n) }))} />
          {ask ? <div className="row"><button type="button" id="ps-discard" className="btn primary" onClick={start}>{t('Abandon and start', '放弃当前游戏', 'Bırak ve başla')}</button><button type="button" className="btn" onClick={() => setAsk(false)}>{t('Keep playing', '继续', 'Oynamaya devam')}</button></div>
            : <button type="button" id="ps-new" className="btn primary" onClick={() => (g.started && !g.over ? setAsk(true) : start())}>{t('Start', '开始', 'Başla')}</button>}
        </div>
      </aside>
    </div>
  );
}
