import './mahjong.css';
import { useEffect, useMemo, useState } from 'react';
import { byLevel, castName, charFor } from '../../core/cast';
import { pname, useLang, useT } from '../../core/i18n';
import { mulberry32 } from '../../core/rng';
import { sfx } from '../../core/sound';
import { loadJSON, saveJSON } from '../../core/storage';
import { activeOf, noteStarted, recordResult, useData } from '../../core/store';
import { RivalPick, useRival } from '../../ui/Cast';
import { aiResolve, aiTurn, LEVELS, rankDiscards } from './ai';
import { claimOptions, discard, kindOf, newHand, selfKong, selfOptions, waits, winSelf, type Claim, type Meld, type MJ } from './rules';
import { MjTile, tileName } from './Tile';

const HANDS = 4;
interface Saved { level: number; st: MJ; scores: number[]; hand: number; over: boolean; recorded: boolean; started: boolean; log: string[] }
const rngNow = () => mulberry32((Date.now() ^ (Math.random() * 1e9)) >>> 0);
const fresh = (level: number, scores = [0, 0, 0, 0], hand = 0): Saved => ({ level, st: newHand(hand % 4, rngNow()), scores, hand, over: false, recorded: false, started: false, log: [] });
const WIND = ['東', '南', '西', '北'];

const FAN: Record<string, [string, string, string]> = {
  win: ['Win', '和牌', 'Kazanma'], self: ['Self-drawn', '自摸', 'Kendi çekişi'], concealed: ['Concealed hand', '门前清', 'Kapalı el'],
  pairs: ['Seven pairs', '七对', 'Yedi çift'], pungs: ['All pungs', '碰碰胡', 'Hep üçlü'], flush: ['Full flush', '清一色', 'Tek renk'],
  half: ['Half flush', '混一色', 'Yarım renk'], honours: ['All honours', '字一色', 'Hep onur taşı'], simples: ['All simples', '断幺', 'Sadece 2–8'],
  dragon: ['Dragon pung', '箭刻', 'Ejder üçlüsü'], seatwind: ['Seat wind pung', '门风刻', 'Koltuk rüzgârı üçlüsü'], roundwind: ['Prevailing wind pung', '圈风刻', 'Tur rüzgârı üçlüsü'],
  kongbloom: ['Win off a kong', '杠上开花', 'Kong çiçeği'], lastdraw: ['Last tile of the wall', '海底捞月', 'Dipteki ay'], lastdiscard: ['Last discard', '河底捞鱼', 'Dipteki balık'],
};

export default function Mahjong() {
  const t = useT(), lang = useLang(), me = activeOf(useData());
  const [g, setG] = useState<Saved>(() => loadJSON<Saved | null>('gp.mahjong', null) ?? fresh(2));
  const [level, setLevel] = useState(g.level);
  const [sel, setSel] = useState<number | null>(null);
  const [hint, setHint] = useState<number | null>(null);
  const [helpers, setHelpers] = useState(() => loadJSON('gp.mahjong.help', true));
  const [confirmNew, setConfirmNew] = useState(false);
  const st = g.st, levels = [0, g.level, g.level, g.level];
  useRival('mahjong', g.level);
  useEffect(() => { saveJSON('gp.mahjong', g); }, [g]);
  useEffect(() => { saveJSON('gp.mahjong.help', helpers); }, [helpers]);

  // The three regulars of the chosen strength; the one picked sits across the table.
  const faces = useMemo(() => {
    const chosen = charFor('mahjong', g.level), rest = byLevel(g.level).filter(w => w !== chosen);
    return [-1, rest[0] ?? chosen, chosen, rest[1] ?? chosen];
  }, [g.level]);
  const names = [pname(me, lang), ...[1, 2, 3].map(s => castName(faces[s], lang))];
  const seatWind = (s: number) => WIND[(s - st.dealer + 4) % 4];
  const tn = (id: number) => tileName(kindOf(id), lang);
  const say = (s: Saved, line: string): Saved => ({ ...s, log: [line, ...s.log].slice(0, 7) });

  /** After any move: note claims and settle the scores when a hand ends. */
  const advance = (s: Saved, nx: MJ): Saved => {
    let out: Saved = { ...s, st: nx };
    const before = s.st;
    for (let k = 0; k < 4; k++) if (nx.melds[k].length > before.melds[k].length) {
      const m = nx.melds[k][nx.melds[k].length - 1];
      const verb = m.type === 'chow' ? t('chows', '吃', 'çi yaptı') : m.type === 'pung' ? t('pungs', '碰', 'pong yaptı') : t('kongs', '杠', 'kong yaptı');
      out = say(out, `${names[k]} ${verb}: ${tileName(m.kinds[0], lang)}`);
      sfx('tile');
    } else if (nx.melds[k].some((m, i) => m.type === 'kong' && before.melds[k][i]?.type === 'pung')) out = say(out, `${names[k]} ${t('adds a kong', '加杠', 'kong ekledi')}`);
    if (nx.end && !before.end) {
      const e = nx.end, scores = s.scores.map((x, k) => x + e.delta[k]);
      out = say({ ...out, scores }, e.winner < 0 ? t('The wall is empty: a drawn hand.', '牌墙摸完，流局。', 'Duvar bitti: el berabere.')
        : e.from < 0 ? t(`${names[e.winner]} wins on a self-drawn tile, ${e.points} fan.`, `${names[e.winner]}自摸，${e.points}番。`, `${names[e.winner]} kendi çektiği taşla kazandı, ${e.points} fan.`)
          : t(`${names[e.winner]} wins on ${names[e.from]}’s discard, ${e.points} fan.`, `${names[e.winner]}胡了${names[e.from]}的牌，${e.points}番。`, `${names[e.winner]}, ${names[e.from]}’ın attığı taşla kazandı, ${e.points} fan.`));
      sfx(e.winner === 0 ? 'win' : e.winner < 0 ? 'click' : 'lose');
      if (s.hand + 1 >= HANDS && !s.recorded) {
        out.over = true; out.recorded = true;
        const top = Math.max(...scores), bottom = Math.min(...scores);
        const result = scores[0] === top && scores.filter(x => x === top).length === 1 ? 'win' : scores[0] === bottom ? 'loss' : 'draw';
        recordResult(me.id, 'mahjong', { result, label: `vs ${LEVELS[s.level].name} AI · ${scores.join('/')}`, oppRating: LEVELS[s.level].rating });
      }
    }
    return out;
  };
  const play = (nx: MJ) => { if (!g.started) noteStarted('mahjong'); setG(s => ({ ...advance(s, nx), started: true })); setSel(null); setHint(null); };

  // Computer seats: their own turn, and the claim round when the person has nothing to claim.
  const mineClaim = st.phase === 'claim' ? claimOptions(st, 0) : null;
  const iCanClaim = !!mineClaim && (mineClaim.win || mineClaim.pung || mineClaim.kong || mineClaim.chows.length > 0);
  useEffect(() => {
    if (st.phase === 'discard' && st.turn !== 0) {
      const id = setTimeout(() => { sfx('tileDraw', 0.5); setTimeout(() => sfx('tile', 0.8), 200); setG(s => advance(s, aiTurn(s.st, levels[s.st.turn], rngNow()))); }, 750);
      return () => clearTimeout(id);
    }
    if (st.phase === 'claim' && !iCanClaim) {
      const id = setTimeout(() => setG(s => advance(s, aiResolve(s.st, levels, null, 0, rngNow()))), st.last?.seat === 0 ? 450 : 350);
      return () => clearTimeout(id);
    }
  }, [st]); // eslint-disable-line

  const claim = (c: Claim) => play(aiResolve(st, levels, c, 0, rngNow()));
  const myTurn = st.phase === 'discard' && st.turn === 0;
  const self = myTurn ? selfOptions(st) : null;
  const hand = st.hands[0];
  const drawn = myTurn && st.drawn !== null && hand.includes(st.drawn) ? st.drawn : null;
  const shown = drawn !== null ? hand.filter(id => id !== drawn) : hand;
  const myWaits = useMemo(() => (helpers && hand.length % 3 === 1 ? waits(hand, st.melds[0].length) : []), [hand, helpers, st.melds]);
  const readyDiscards = useMemo(() => {
    if (!helpers || !myTurn) return new Set<number>();
    const out = new Set<number>();
    for (const id of hand) { const rest = hand.filter(x => x !== id); if (waits(rest, st.melds[0].length).length) out.add(kindOf(id)); }
    return out;
  }, [hand, helpers, myTurn, st.melds]);
  const tap = (id: number) => {
    if (!myTurn) return;
    if (sel === id) { sfx('tile'); play(discard(st, id)); return; }
    setSel(id); sfx('click', 0.4);
  };
  const showHint = () => { if (myTurn) { const best = rankDiscards(st, 4)[0].id; setHint(best); setSel(best); } };

  const status = st.phase === 'end' ? (g.over ? t('The round is over.', '一圈打完了。', 'Tur bitti.') : t('Hand over.', '本局结束。', 'El bitti.'))
    : myTurn ? (self?.win ? t('You can win! Press 自摸, or discard.', '可以自摸了！点“自摸”，或者打一张。', 'Kazanabilirsin! 自摸’a bas ya da bir taş at.') : t('Your turn: tap a tile, tap it again to discard.', '轮到你：点一张牌，再点一次打出。', 'Sıra sende: bir taşa dokun, atmak için tekrar dokun.'))
      : iCanClaim ? t(`${names[st.last!.seat]} discards ${tn(st.last!.tile)}.`, `${names[st.last!.seat]}打出${tn(st.last!.tile)}。`, `${names[st.last!.seat]} ${tn(st.last!.tile)} attı.`)
        : t(`${names[st.turn]} is thinking…`, `${names[st.turn]}思考中…`, `${names[st.turn]} düşünüyor…`);

  const Melds = ({ ms, small }: { ms: Meld[]; small?: boolean }) => (
    <div className="mj-melds">{ms.map((m, i) => (
      <span key={i} className="mj-meld">{m.kinds.map((k, j) => <MjTile key={j} k={k} back={m.type === 'ckong' && (j === 0 || j === 3)} className={small ? 'sm' : 'md'} />)}</span>
    ))}</div>
  );
  const River = ({ s }: { s: number }) => (
    <div className={'mj-river r' + ((s + 4) % 4)} aria-label={t(`${names[s]}’s discards`, `${names[s]}的弃牌`, `${names[s]} attıkları`)}>
      {st.river[s].map(id => <MjTile key={id} k={kindOf(id)} className={'rv' + (st.taken.includes(id) ? ' taken' : '') + (st.last?.tile === id ? ' last' : '')} />)}
    </div>
  );
  const Opp = ({ s, cls }: { s: number; cls: string }) => (
    <div className={'mj-opp ' + cls + (st.turn === s && st.phase !== 'end' ? ' turn' : '')}>
      <div className="mj-who"><span className="mj-wind">{seatWind(s)}</span><b>{names[s]}</b>{st.dealer === s && <span className="mj-dealer">{t('dealer', '庄', 'dağıtan')}</span>}<span className="num">{g.scores[s] > 0 ? '+' : ''}{g.scores[s]}</span></div>
      <div className="mj-backs">{st.phase === 'end' && st.end?.winner === s ? st.hands[s].map(id => <MjTile key={id} k={kindOf(id)} className="sm" />) : st.hands[s].map(id => <MjTile key={id} back className="sm" />)}</div>
      <Melds ms={st.melds[s]} small />
    </div>
  );

  const e = st.end;
  return (
    <div className="play mahjong">
      <div className="play-main">
        <div className="statline"><span role="status" aria-live="polite">{status}</span>
          <span className="muted num">{t(`East round · hand ${g.hand + 1}/${HANDS} · wall ${st.wall.length}`, `东风圈 · 第${g.hand + 1}/${HANDS}局 · 余${st.wall.length}张`, `Doğu turu · el ${g.hand + 1}/${HANDS} · duvar ${st.wall.length}`)}</span></div>
        <div className="mj-table">
          <Opp s={2} cls="o-top" />
          <Opp s={3} cls="o-left" />
          <div className="mj-centre">
            <River s={2} />
            <div className="mj-mid"><River s={3} /><div className="mj-hub"><b>東</b><span className="num">{st.wall.length}</span></div><River s={1} /></div>
            <River s={0} />
          </div>
          <Opp s={1} cls="o-right" />
        </div>

        <div className={'mj-me' + (myTurn ? ' turn' : '')}>
          <div className="mj-who"><span className="mj-wind">{seatWind(0)}</span><b>{names[0]}</b>{st.dealer === 0 && <span className="mj-dealer">{t('dealer', '庄', 'dağıtan')}</span>}<span className="num">{g.scores[0] > 0 ? '+' : ''}{g.scores[0]}</span></div>
          <Melds ms={st.melds[0]} />
          <div className="mj-hand" role="group" aria-label={t('Your hand', '你的手牌', 'Elin')}>
            {shown.map(id => (
              <button key={id} type="button" className={'mj-h' + (sel === id ? ' sel' : '') + (hint === id ? ' hint' : '') + (readyDiscards.has(kindOf(id)) ? ' ready' : '')} disabled={!myTurn} onClick={() => tap(id)} aria-label={tn(id)} aria-pressed={sel === id}>
                <MjTile k={kindOf(id)} />
              </button>
            ))}
            {drawn !== null && <button key={drawn} type="button" className={'mj-h drawn' + (sel === drawn ? ' sel' : '') + (hint === drawn ? ' hint' : '') + (readyDiscards.has(kindOf(drawn)) ? ' ready' : '')} onClick={() => tap(drawn)} aria-label={t(`${tn(drawn)}, just drawn`, `${tn(drawn)}，刚摸到`, `${tn(drawn)}, yeni çekildi`)} aria-pressed={sel === drawn}><MjTile k={kindOf(drawn)} /></button>}
          </div>

          {myTurn && (
            <div className="tools">
              {self?.win && <button type="button" id="mj-tsumo" className="btn primary" onClick={() => play(winSelf(st))}>自摸 {t('Win', '和牌', 'Kazan')}</button>}
              {self?.kongs.map(kg => <button key={kg.kind} type="button" id={'mj-kong-' + kg.kind} className="btn" onClick={() => play(selfKong(st, kg.kind))}>杠 {tileName(kg.kind, lang)}</button>)}
              <button type="button" id="mj-discard" className="btn primary" disabled={sel === null} onClick={() => sel !== null && play(discard(st, sel))}>{t('Discard', '打出', 'At')}{sel !== null ? ` ${tn(sel)}` : ''}</button>
              <button type="button" id="mj-hint" className="btn sm" onClick={showHint}>{t('Hint', '提示', 'İpucu')}</button>
            </div>
          )}
          {iCanClaim && mineClaim && st.last && (
            <div className="mj-claim" role="group" aria-label={t('Claim the discard', '要这张牌吗', 'Atılan taşı al')}>
              <MjTile k={kindOf(st.last.tile)} className="md" />
              {mineClaim.win && <button type="button" id="mj-win" className="btn primary" onClick={() => claim({ type: 'win' })}>胡 {t('Win', '和牌', 'Kazan')}</button>}
              {mineClaim.kong && <button type="button" id="mj-kong" className="btn" onClick={() => claim({ type: 'kong' })}>杠 Kong</button>}
              {mineClaim.pung && <button type="button" id="mj-pung" className="btn" onClick={() => claim({ type: 'pung' })}>碰 Pung</button>}
              {mineClaim.chows.map((ch, i) => <button key={i} type="button" id={'mj-chow-' + i} className="btn mj-chow" onClick={() => claim({ type: 'chow', kinds: ch })}>吃 {ch.map(k => <MjTile key={k} k={k} className="xs" />)}</button>)}
              <button type="button" id="mj-pass" className="btn" onClick={() => claim({ type: 'pass' })}>过 {t('Pass', '不要', 'Pas')}</button>
            </div>
          )}
          {helpers && myWaits.length > 0 && st.phase !== 'end' && (
            <p className="mj-waits">{t('Ready! Waiting for', '听牌！等', 'Hazırsın! Beklenen')}: {myWaits.map(k => <MjTile key={k} k={k} className="xs" />)}</p>
          )}
        </div>
      </div>

      <aside className="play-side">
        {e && (
          <div className="result mj-result" role="status">
            {e.winner < 0 ? <h3>{t('Drawn hand', '流局', 'Berabere el')}</h3> : <>
              <h3>{e.winner === 0 ? t('You win the hand!', '你胡了！', 'Eli kazandın!') : t(`${names[e.winner]} wins`, `${names[e.winner]}胡了`, `${names[e.winner]} kazandı`)}</h3>
              <ul className="mj-fans">{e.fans.map((f, i) => <li key={i}><span>{(FAN[f.id] ?? [f.id, f.id, f.id])[lang === 'zh' ? 1 : lang === 'tr' ? 2 : 0]}{lang !== 'zh' && <small className="muted"> {FAN[f.id]?.[1]}</small>}</span><b className="num">{f.pts}</b></li>)}
                <li className="tot"><span>{t('Total', '合计', 'Toplam')}</span><b className="num">{e.points} {t('fan', '番', 'fan')}</b></li></ul>
              <p className="muted small">{e.from < 0 ? t(`Everyone pays ${e.points}.`, `其他三家各付${e.points}。`, `Herkes ${e.points} öder.`) : t(`${names[e.from]} pays ${e.points * 2}.`, `${names[e.from]}付${e.points * 2}。`, `${names[e.from]} ${e.points * 2} öder.`)}</p>
            </>}
            {!g.over && <button type="button" id="mj-next" className="btn primary" onClick={() => setG(s => ({ ...fresh(s.level, s.scores, s.hand + 1), started: true, log: s.log }))}>{t('Next hand', '下一局', 'Sonraki el')}</button>}
            {g.over && <>
              <p>{[0, 1, 2, 3].map(k => ({ k, s: g.scores[k] })).sort((a, b) => b.s - a.s).map(x => `${names[x.k]} ${x.s > 0 ? '+' : ''}${x.s}`).join(' · ')}</p>
              <button type="button" id="mj-again" className="btn primary" onClick={() => setG(fresh(level))}>{t('New round', '再来一圈', 'Yeni tur')}</button>
            </>}
          </div>
        )}
        <dl className="facts">{[0, 1, 2, 3].map(k => <div key={k}><dt>{seatWind(k)} {names[k]}</dt><dd className="num">{g.scores[k] > 0 ? '+' : ''}{g.scores[k]}</dd></div>)}</dl>
        {g.log.length > 0 && <ul className="mj-log">{g.log.map((l, i) => <li key={i}>{l}</li>)}</ul>}
        <label className="check" htmlFor="mj-helpers"><input id="mj-helpers" type="checkbox" checked={helpers} onChange={e2 => setHelpers(e2.target.checked)} /> {t('Show when I am ready (听牌)', '提示听牌', 'Hazır olunca göster (听牌)')}</label>
        <p className="muted small">{t('Four hands make a round; the deal passes each hand. A win on a discard costs the discarder double; a self-drawn win costs everyone the fan.',
          '四局为一圈，每局换庄。点炮者付双倍；自摸则其他三家各付番数。', 'Dört el bir tur eder; her el dağıtan değişir. Atılan taşla kazanılırsa atan iki katını öder; kendi çekişinde herkes fan kadar öder.')}</p>
        <div className="setup">
          <h3>{t('New round', '新的一圈', 'Yeni tur')}</h3>
          <RivalPick id="mj-level" game="mahjong" value={level} onChange={setLevel} levels={LEVELS} label={t('Who sits at the table', '谁来打牌', 'Masaya kim oturuyor')} />
          {confirmNew ? (
            <div className="row">
              <button type="button" id="mj-abandon" className="btn primary" onClick={() => { setG(fresh(level)); setConfirmNew(false); }}>{t('Abandon and start', '放弃当前牌局', 'Bırak ve başla')}</button>
              <button type="button" id="mj-keep" className="btn" onClick={() => setConfirmNew(false)}>{t('Keep playing', '继续', 'Oynamaya devam')}</button>
            </div>
          ) : <button type="button" id="mj-new" className="btn primary" onClick={() => (g.started && !g.over ? setConfirmNew(true) : setG(fresh(level)))}>{t('Start', '开始', 'Başla')}</button>}
        </div>
      </aside>
    </div>
  );
}
