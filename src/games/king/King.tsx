import './king.css';
import { useEffect, useState } from 'react';
import { pname, useLang, useT, aiLabel } from '../../core/i18n';
import { loadJSON, saveJSON } from '../../core/storage';
import { activeOf, getData, noteStarted, recordResult, useData } from '../../core/store';
import { Seg } from '../../ui/bits';
import { RivalPick, useRival } from '../../ui/Cast';
import { freshRng, HEARTS, rankOf, suitOf, SUITS, SUIT_NAMES, J, K, Q, type Card } from '../cards/deck';
import { LEVELS } from '../cards/levels';
import { PassCover, TrickTable } from '../cards/TrickTable';
import { playSound, useComputer, useTrickFlash } from '../cards/useTable';
import { aiChoose, aiPlay, choose, dealHand, gameOver, newGame, options, PENALTIES, play, playable, points, settle, totalHands, type Contract, type KGame, type KHand } from './rules';

interface Saved { humans: number; pnames: string[]; level: number; g: KGame; h: KHand; viewer: number; started: boolean; settled: boolean; recorded: boolean }
const fresh = (humans: number, pnames: string[], level: number, length: KGame['length']): Saved => {
  const g = newGame(length); return { humans, pnames, level, g, h: dealHand(g, freshRng()), viewer: 0, started: false, settled: false, recorded: false };
};
export const CONTRACT: Record<Contract, [string, string, string]> = {
  el: ['No tricks', '不吃墩', 'El almaz'], kupa: ['No hearts', '不吃红心', 'Kupa almaz'], erkek: ['No kings or jacks', '不吃K和J', 'Erkek almaz'],
  kiz: ['No queens', '不吃Q', 'Kız almaz'], rifki: ['Rıfkı (king of hearts)', 'Rıfkı（红心K）', 'Rıfkı'], son2: ['Last two', '最后两墩', 'Son iki'], koz: ['Trump', '将牌', 'Koz'],
};
const PEN_NOTE: Record<Contract, [string, string, string]> = {
  el: ['−50 a trick', '每墩 −50', 'el başı −50'], kupa: ['−30 a heart', '每张红心 −30', 'kupa başı −30'], erkek: ['−60 a K or J', '每张K/J −60', 'papaz/vale başı −60'],
  kiz: ['−100 a queen', '每张Q −100', 'kız başı −100'], rifki: ['−320', '−320', '−320'], son2: ['−180 each', '每墩 −180', 'her biri −180'], koz: ['+50 a trick', '每墩 +50', 'el başı +50'],
};

export default function King() {
  const t = useT(), lang = useLang(), me = activeOf(useData());
  const [s, setS] = useState<Saved>(() => loadJSON<Saved | null>('gp.king', null) ?? fresh(1, [], 2, 'short'));
  const [draft, setDraft] = useState({ humans: s.humans, level: s.level, length: s.g.length, names: s.pnames.length ? s.pnames : ['', t('Player 2', '玩家2', 'Oyuncu 2'), t('Player 3', '玩家3', 'Oyuncu 3'), t('Player 4', '玩家4', 'Oyuncu 4')] });
  const [kozSuit, setKozSuit] = useState<number | null>(null);
  const [ask, setAsk] = useState(false);
  useEffect(() => { saveJSON('gp.king', s); }, [s]);
  useRival('king', s.humans < 4 ? s.level : null);
  const { g, h } = s, human = (k: number) => k < s.humans, tl = (x: [string, string, string]) => t(x[0], x[1], x[2]);
  const names = [0, 1, 2, 3].map(k => (k === 0 ? pname(me, lang) : human(k) ? s.pnames[k] || t(`Player ${k + 1}`, `玩家${k + 1}`, `Oyuncu ${k + 1}`) : `${aiLabel(LEVELS[s.level].name, lang)} ${k + 1}`));
  const { flash, shown } = useTrickFlash(h.st);
  const actor = h.phase === 'choose' ? h.chooser : h.phase === 'play' ? h.st.turn : -1;
  const cover = s.humans > 1 && actor >= 0 && human(actor) && actor !== s.viewer && !flash;
  const mine = actor === s.viewer && human(actor) && !cover && !flash;
  const done = gameOver(g);
  const set = (nh: KHand) => { if (nh === h) return; if (!s.started) noteStarted('king'); setS(x => ({ ...x, h: nh, started: true })); };

  useComputer(actor >= 0 && !human(actor) && !flash && h.phase !== 'done', () => {
    if (h.phase === 'choose') { const c = aiChoose(g, h, actor, s.level); set(choose(h, g, actor, c.c, c.trump)); }
    else { playSound(); set(play(h, actor, aiPlay(h, actor, s.level))); }
  }, h.phase === 'play' ? 650 : 900, [h]);
  useEffect(() => {
    if (h.phase !== 'done' || s.settled || flash) return;
    const ng = settle(g, h), over = gameOver(ng);
    if (over && !s.recorded && s.humans < 4) {
      const best = Math.max(...ng.scores), top = ng.scores.filter(x => x === best).length;
      const result = ng.scores[0] === best ? (top > 1 ? 'draw' : 'win') : 'loss';
      recordResult(getData().activeId, 'king', { result, label: s.humans > 1 ? `same device · ${ng.scores.join('/')}` : `vs ${LEVELS[s.level].name} AI · ${ng.scores.join('/')}`, oppRating: s.humans > 1 ? undefined : LEVELS[s.level].rating });
    }
    setS(x => ({ ...x, g: ng, settled: true, recorded: x.recorded || over }));
  }, [h.phase, flash]); // eslint-disable-line
  const next = () => setS(x => ({ ...x, h: dealHand(x.g, freshRng()), settled: false }));
  const start = () => { setS(fresh(draft.humans, draft.names, draft.level, draft.length)); setAsk(false); };
  const onPlay = (c: Card) => { if (!mine || h.phase !== 'play') return; playSound(); set(play(h, s.viewer, c)); };
  const suitName = (k: number) => t(SUIT_NAMES[k][0], SUIT_NAMES[k][1], SUIT_NAMES[k][2]);

  // What each seat has taken that hurts in this contract.
  const taken = (k: number) => {
    const won = h.st.won[k];
    switch (h.contract) {
      case 'kupa': return `♥ ${won.filter(c => suitOf(c) === HEARTS).length}`;
      case 'erkek': return `K/J ${won.filter(c => rankOf(c) === K || rankOf(c) === J).length}`;
      case 'kiz': return `Q ${won.filter(c => rankOf(c) === Q).length}`;
      case 'rifki': return won.includes(HEARTS * 13 + K) ? 'K♥!' : '';
      default: return t(`${h.st.tricks[k]} tricks`, `${h.st.tricks[k]}墩`, `${h.st.tricks[k]} el`);
    }
  };
  const opts = h.phase === 'choose' ? options(g, h.chooser) : [];
  const status = done && h.phase === 'done' ? t('The game is over.', '游戏结束。', 'Oyun bitti.')
    : h.phase === 'choose' ? (mine ? t('Your choice: name a penalty or a trump hand.', '轮到你选：选择一个罚分局或将牌局。', 'Seçim sende: bir ceza ya da koz seç.') : t(`${names[actor]} is choosing the game…`, `${names[actor]}正在选择…`, `${names[actor]} oyunu seçiyor…`))
    : h.phase === 'play' ? (mine ? t('Your turn: play a highlighted card.', '轮到你：出一张高亮的牌。', 'Sıra sende: parlayan kartlardan birini at.') : t(`${names[actor]} is playing…`, `${names[actor]}出牌中…`, `${names[actor]} oynuyor…`))
    : t('The hand is over.', '本局结束。', 'El bitti.');
  return (
    <div className="play king">
      <div className="play-main">
        <div className="statline"><span role="status" aria-live="polite">{status}</span>
          {h.contract && <span className="kg-contract">{tl(CONTRACT[h.contract])}{h.contract === 'koz' && h.trump !== null ? ' ' + SUITS[h.trump] : ''} · <small>{tl(PEN_NOTE[h.contract])}</small> · {t(`chosen by ${names[h.chooser]}`, `${names[h.chooser]}选择`, `${names[h.chooser]} seçti`)}</span>}</div>
        {mine && h.phase === 'choose' && !cover && (
              <div className="kg-choose">
                <div className="kg-opts">{opts.filter(o => o !== 'koz').map(o => <button key={o} type="button" id={'kg-c-' + o} className="btn sm" onClick={() => set(choose(h, g, s.viewer, o, null))}>{tl(CONTRACT[o])}<small>{tl(PEN_NOTE[o])}</small></button>)}</div>
                {opts.includes('koz') && <div className="kg-koz"><span>{t('Trump:', '将牌：', 'Koz:')}</span>{[0, 1, 2, 3].map(k => <button key={k} type="button" id={'kg-koz-' + k} className={'btn suit' + (k === 1 || k === 2 ? ' red' : '') + (kozSuit === k ? ' on' : '')} aria-label={suitName(k)} onClick={() => { setKozSuit(k); set(choose(h, g, s.viewer, 'koz', k)); }}>{SUITS[k]}</button>)}</div>}
              </div>
        )}
        {cover ? <PassCover name={names[actor]} id="kg-ready" onReady={() => setS({ ...s, viewer: actor })} /> : (
          <TrickTable st={h.st} names={names} viewer={s.viewer} playable={playable(h, s.viewer)} onPlay={onPlay} trump={h.contract === 'koz' ? h.trump : null} shown={shown}
            badge={k => (k === h.chooser ? <span className="tt-badge">★</span> : null)}
            info={k => <span className="num">{h.phase === 'choose' ? g.scores[k] : taken(k)}</span>}
            centre={null} />
        )}
        {h.phase === 'done' && s.settled && (
          <div className="result">
            <table className="table">
              <thead><tr><th /><th>{t('This hand', '本局', 'Bu el')}</th><th>{t('Total', '总分', 'Toplam')}</th></tr></thead>
              <tbody>{[0, 1, 2, 3].map(k => <tr key={k}><th>{names[k]}</th><td className="num">{points(h)[k]}</td><td className="num"><b>{g.scores[k]}</b></td></tr>)}</tbody>
            </table>
            {done ? <>
              <p className="big-note">{t(`${names[g.scores.indexOf(Math.max(...g.scores))]} wins the game!`, `${names[g.scores.indexOf(Math.max(...g.scores))]}获胜！`, `Oyunu ${names[g.scores.indexOf(Math.max(...g.scores))]} kazandı!`)}</p>
              <button type="button" id="kg-again" className="btn primary" onClick={() => setS(fresh(s.humans, s.pnames, s.level, g.length))}>{t('Play again', '再来一局', 'Tekrar oyna')}</button>
            </> : <button type="button" id="kg-next" className="btn primary" onClick={next}>{t(`Next hand (${g.hand + 1}/${totalHands(g.length)})`, `下一局（${g.hand + 1}/${totalHands(g.length)}）`, `Sonraki el (${g.hand + 1}/${totalHands(g.length)})`)}</button>}
          </div>
        )}
      </div>
      <aside className="play-side">
        <div className="table-scroll"><table className="table kg-sheet">
          <thead><tr><th /><th>{t('Points', '分', 'Puan')}</th><th>{t('Trump left', '剩将牌局', 'Koz')}</th><th>{t('Penalty left', '剩罚分局', 'Ceza')}</th></tr></thead>
          <tbody>{[0, 1, 2, 3].map(k => <tr key={k}><th>{names[k]}</th><td className="num"><b>{g.scores[k]}</b></td><td className="num">{g.koz[k]}</td><td className="num">{g.ceza[k]}</td></tr>)}</tbody>
        </table></div>
        <p className="muted small">{t('Each penalty may be played twice in all:', '每种罚分局总共最多玩两次：', 'Her ceza oyunda en fazla iki kez oynanır:')} {PENALTIES.map(p => `${tl(CONTRACT[p])} ${g.used[p] ?? 0}/2`).join(' · ')}</p>
        <div className="setup">
          <h3>{t('New game', '新游戏', 'Yeni oyun')}</h3>
          <Seg id="kg-len" label={t('Length', '长度', 'Uzunluk')} value={draft.length} onChange={v => setDraft({ ...draft, length: v })}
            options={[{ value: 'short', label: t('Short: 8 hands', '短局：8局', 'Kısa: 8 el') }, { value: 'full', label: t('Full: 20 hands', '完整：20局', 'Tam: 20 el') }]} />
          <Seg id="kg-humans" label={t('People at the table', '桌上真人', 'Masadaki kişi sayısı')} value={draft.humans} onChange={v => setDraft({ ...draft, humans: v })} options={[1, 2, 3, 4].map(n => ({ value: n, label: String(n) }))} />
          {draft.humans > 1 && draft.names.slice(1, draft.humans).map((n, i) => <label key={i} className="field"><span className="field-label">{t(`Player ${i + 2}`, `玩家${i + 2}`, `Oyuncu ${i + 2}`)}</span><input id={'kg-n' + (i + 1)} className="input" value={n} maxLength={18} onChange={e => setDraft({ ...draft, names: draft.names.map((x, k) => (k === i + 1 ? e.target.value : x)) })} /></label>)}
          {draft.humans < 4 && <RivalPick id="kg-level" game="king" value={draft.level} onChange={v => setDraft({ ...draft, level: v })} levels={LEVELS} label={t('Computer players', '电脑玩家', 'Bilgisayar oyuncular')} />}
          {ask ? <div className="row"><button type="button" id="kg-discard" className="btn primary" onClick={start}>{t('Abandon and start', '放弃当前游戏', 'Bırak ve başla')}</button><button type="button" className="btn" onClick={() => setAsk(false)}>{t('Keep playing', '继续', 'Oynamaya devam')}</button></div>
            : <button type="button" id="kg-new" className="btn primary" onClick={() => (s.started && !done ? setAsk(true) : start())}>{t('Start', '开始', 'Başla')}</button>}
        </div>
      </aside>
    </div>
  );
}
