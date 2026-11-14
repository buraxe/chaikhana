import './okey.css';
import { useEffect, useMemo, useRef, useState } from 'react';
import { sfx } from '../../core/sound';
import { RivalPick, useRival } from '../../ui/Cast';
import { pname, trLabel, useLang, useT, aiLabel as aiLabelOf } from '../../core/i18n';
import { mulberry32 } from '../../core/rng';
import { loadJSON, saveJSON } from '../../core/storage';
import { activeOf, noteStarted, recordResult, useData } from '../../core/store';
import { Pick, Seg } from '../../ui/bits';
import { aiTurn, canShow, deal, discard, draw, finish, finishValue, LEVELS, prev, show, type Deal } from './game';
import { isWild, TILES, valueOf } from './rules';

const SLOTS = 30;
interface Saved {
  level: number; deal: Deal; scores: number[]; rack: (number | null)[]; hand: number; over: boolean; recorded: boolean; started: boolean; log: string[];
  /** Same-device play: seats 0…humans−1 are people, passing the device; the rest are computer players. */
  humans?: number; pnames?: string[]; racks?: Record<number, (number | null)[]>; viewer?: number; cover?: boolean;
}
const rngNow = () => mulberry32((Date.now() ^ (Math.random() * 1e9)) >>> 0);

function arrange(ids: number[], mode: 'runs' | 'groups', d: Deal): (number | null)[] {
  const ok = d.okey, val = (i: number) => valueOf(TILES[i], ok), wild = (i: number) => isWild(TILES[i], ok);
  const plain = ids.filter(i => !wild(i)), wilds = ids.filter(wild);
  const sorted = plain.sort((a, b) => mode === 'runs' ? val(a).c - val(b).c || val(a).n - val(b).n : val(a).n - val(b).n || val(a).c - val(b).c);
  const out: (number | null)[] = new Array(SLOTS).fill(null);
  let k = 0, last: { c: number; n: number } | null = null;
  for (const i of sorted) {
    const v = val(i);
    // Leave a gap between unrelated tiles, as players do on a real rack.
    if (last && k < SLOTS && (mode === 'runs' ? (v.c !== last.c || v.n - last.n > 1) : v.n !== last.n) && k % 15 !== 0) k++;
    if (k >= SLOTS) k = out.indexOf(null);
    out[k++] = i; last = v;
  }
  for (const w of wilds) { const f = out.lastIndexOf(null); out[f] = w; }
  return out;
}
const fresh = (level: number, scores = [20, 20, 20, 20], hand = 0, humans = 1, pnames: string[] = []): Saved => {
  const d = deal((hand + 3) % 4, rngNow());
  const racks: Record<number, (number | null)[]> = {};
  for (let k = 0; k < humans; k++) racks[k] = arrange(d.hands[k], 'runs', d);
  const viewer = humans > 1 ? d.turn % humans === d.turn ? d.turn : 0 : 0;
  return { level, deal: d, scores, rack: racks[0], racks, hand, over: false, recorded: false, started: false, log: [], humans, pnames, viewer, cover: humans > 1 };
};

export default function OkeyGame() {
  const t = useT(), lang = useLang(), data = useData(), me = activeOf(data);
  const [g, setG] = useState<Saved>(() => loadJSON<Saved | null>('gp.okey', null) ?? fresh(2));
  const [sel, setSel] = useState<number | null>(null);
  const [level, setLevel] = useState(g.level);
  const [markOkey, setMarkOkey] = useState(() => loadJSON('gp.okey.mark', true));
  const [confirmNew, setConfirmNew] = useState(false);
  const busy = useRef(false);
  const humans = g.humans ?? 1, viewer = g.viewer ?? 0, isHuman = (k: number) => k < humans;
  const racks = g.racks ?? { 0: g.rack }, rack = racks[viewer] ?? g.rack;
  const d = g.deal, mine = d.turn === viewer && !d.end && !g.cover;
  const dirs = [pname(me, lang), t('Right', '右家', 'Sağ'), t('Across', '对家', 'Karşı'), t('Left', '左家', 'Sol')];
  const names = [0, 1, 2, 3].map(k => (k === 0 ? pname(me, lang) : k < humans ? g.pnames?.[k] || t(`Player ${k + 1}`, `玩家${k + 1}`, `Oyuncu ${k + 1}`) : humans > 1 ? t(`Computer ${k + 1}`, `电脑${k + 1}`, `Bilgisayar ${k + 1}`) : dirs[k]));
  /** Display position (0 bottom, 1 right, 2 top, 3 left) to seat, seen from the player at the screen. */
  const at = (p: number) => (viewer + p) % 4;
  const [humansDraft, setHumansDraft] = useState(humans);
  const [namesDraft, setNamesDraft] = useState<string[]>(() => g.pnames?.length ? g.pnames : ['', t('Player 2', '玩家2', 'Oyuncu 2'), t('Player 3', '玩家3', 'Oyuncu 3'), t('Player 4', '玩家4', 'Oyuncu 4')]);
  const newGame = () => fresh(level, undefined, 0, humansDraft, namesDraft);
  const aiLabel = aiLabelOf(LEVELS[g.level].name, lang);
  useRival('okey', (g.humans ?? 1) < 4 ? g.level : null);

  useEffect(() => { saveJSON('gp.okey', g); }, [g]);
  useEffect(() => { saveJSON('gp.okey.mark', markOkey); }, [markOkey]);

  // Keep the rack in step with the hand: new tiles go into the first free slot.
  const syncRack = (rk: (number | null)[], hand: number[]) => {
    const r = rk.map(x => (x !== null && hand.includes(x) ? x : null));
    for (const id of hand) if (!r.includes(id)) { const f = r.indexOf(null); r[f >= 0 ? f : r.length] = id; }
    return r;
  };
  const settleDeal = (s: Saved, nd: Deal, note?: string): Saved => {
    const rk: Record<number, (number | null)[]> = {}, hs = s.humans ?? 1, old = s.racks ?? { 0: s.rack };
    for (let k = 0; k < hs; k++) rk[k] = syncRack(old[k] ?? [], nd.hands[k]);
    const next: Saved = { ...s, deal: nd, rack: rk[0], racks: rk, log: note ? [note, ...s.log].slice(0, 6) : s.log };
    // Hand the device over when the turn reaches another person.
    if (hs > 1 && !nd.end && nd.turn < hs && nd.turn !== (s.viewer ?? 0)) { next.viewer = nd.turn; next.cover = true; }
    if (nd.end && !s.deal.end) {
      const scores = s.scores.slice();
      if (nd.end.winner >= 0) for (let k = 0; k < 4; k++) if (k !== nd.end.winner) scores[k] -= nd.end.penalty;
      next.scores = scores;
      next.over = scores.some(x => x <= 0);
      if (next.over && !s.recorded) {
        next.recorded = true;
        const rank = [...scores].sort((a, b) => b - a), myRank = rank.indexOf(scores[0]);
        const result = scores[0] === rank[0] ? 'win' : scores[0] === rank[3] ? 'loss' : 'draw';
        recordResult(me.id, 'okey', { result, label: (s.humans ?? 1) > 1 ? `same device · ${scores.join('/')}` : `vs ${LEVELS[s.level].name} AI · ${scores.join('/')}`, oppRating: (s.humans ?? 1) > 1 ? undefined : LEVELS[s.level].rating });
        void myRank;
      }
    }
    return next;
  };
  const showFor = (s: Saved, seat: number): Saved => {
    const nd = show(s.deal, seat), scores = s.scores.slice();
    for (let k = 0; k < 4; k++) if (k !== seat) scores[k] -= 1;
    return { ...s, deal: nd, scores, log: [t(`${names[seat]} shows the indicator. Everyone else loses 1.`, `${names[seat]}亮出指示牌，其他人各扣1分。`, `${names[seat]} göstergeyi açtı. Diğer herkes 1 kaybeder.`), ...s.log].slice(0, 6) };
  };

  // Computer seats play in turn.
  useEffect(() => {
    if (d.end || isHuman(d.turn) || busy.current) return;
    busy.current = true;
    const id = setTimeout(() => {
      busy.current = false;
      const seat = d.turn, res = aiTurn(d, g.level, rngNow());
      sfx('tileDraw', 0.6); setTimeout(() => sfx('tile', 0.8), 260);
      setG(s => {
        let cur = s;
        if (res.steps.includes('show')) cur = showFor(cur, seat);
        const note = res.steps.includes('finish') ? t(`${names[seat]} finishes!`, `${names[seat]}和牌！`, `${names[seat]} bitirdi!`)
          : res.steps.includes('discard-take') ? t(`${names[seat]} takes the discard.`, `${names[seat]}拿了弃牌。`, `${names[seat]} atılan taşı aldı.`) : undefined;
        return settleDeal(cur, res.deal, note);
      });
    }, 900);
    return () => { clearTimeout(id); busy.current = false; };
  }, [d.turn, d.end, d.phase, d.hands]); // eslint-disable-line

  const act = (nd: Deal, note?: string) => { sfx(nd.phase === 'discard' && d.phase === 'draw' ? 'tileDraw' : 'tile'); if (!g.started) noteStarted('okey'); setG(s => ({ ...settleDeal(s, nd, note), started: true })); setSel(null); };
  const leftTop = d.discards[prev(viewer)][d.discards[prev(viewer)].length - 1];
  const canFinishWith = sel !== null && mine && d.phase === 'discard' ? finishValue(d, sel) : 0;
  const anyFinish = useMemo(() => (mine && d.phase === 'discard' ? d.hands[viewer].some(i => finishValue(d, i) > 0) : false), [d, mine, viewer]);
  const setRack = (r: (number | null)[]) => setG({ ...g, rack: viewer === 0 ? r : g.rack, racks: { ...racks, [viewer]: r } });

  const clickSlot = (k: number) => {
    const here = rack[k];
    if (sel === null) { if (here !== null) setSel(here); return; }
    if (here === sel) { setSel(null); return; }
    const r = rack.slice(), from = r.indexOf(sel);
    r[from] = here; r[k] = sel;
    sfx('tile', 0.5); setRack(r); setSel(null);
  };
  const Tile = ({ id, small }: { id: number; small?: boolean }) => {
    const tl = TILES[id], wild = isWild(tl, d.okey);
    return (
      <span className={'ok-tile' + (small ? ' small' : '') + (tl.fake ? ' fake' : ' c' + tl.c) + (wild && markOkey ? ' wild' : '')}>
        {tl.fake ? <b aria-label={t('false joker', '假okey', 'sahte okey')}>✣</b> : <b>{tl.n}</b>}
        {!tl.fake && <i />}
      </span>
    );
  };
  const tileName = (id: number) => {
    const tl = TILES[id];
    if (tl.fake) return t('false joker', '假okey', 'sahte okey');
    return `${[t('red', '红', 'kırmızı'), t('yellow', '黄', 'sarı'), t('blue', '蓝', 'mavi'), t('black', '黑', 'siyah')][tl.c]} ${tl.n}`;
  };
  const Pile = ({ seat, cls }: { seat: number; cls: string }) => {
    const pile = d.discards[seat], top = pile[pile.length - 1];
    const takeable = seat === prev(viewer) && mine && d.phase === 'draw' && top !== undefined;
    return (
      <button type="button" className={'ok-pile ' + cls + (takeable ? ' take' : '')} disabled={!takeable} onClick={() => act(draw(d, 'discard'))}
        aria-label={top !== undefined ? t(`${names[seat]}'s discard: ${tileName(top)}`, `${names[seat]}的弃牌：${tileName(top)}`, `${names[seat]} attı: ${tileName(top)}`) : t('Empty discard pile', '空弃牌堆', 'Atılan taş yok')}>
        {top !== undefined ? <Tile id={top} /> : <span className="ok-empty" />}
      </button>
    );
  };
  const end = d.end;
  const status = g.over ? t('Game over.', '游戏结束。', 'Oyun bitti.')
    : end ? (end.winner < 0 ? t('The tiles ran out. Nobody scores this deal.', '牌摸完了，本局无人得分。', 'Taşlar bitti. Bu elde kimse puan almadı.')
      : t(`${names[end.winner]} finished${end.pairs ? ' with seven pairs' : ''}${end.joker ? ' by discarding an okey' : ''}. Everyone else loses ${end.penalty}.`, `${names[end.winner]}${end.pairs ? '以七对' : ''}${end.joker ? '打出okey' : ''}和牌，其他人各扣${end.penalty}分。`, `${names[end.winner]} bitirdi${end.pairs ? ' (çifte gitti)' : ''}${end.joker ? ' (okey atarak)' : ''}. Diğer herkes ${end.penalty} kaybeder.`))
    : mine ? (d.phase === 'draw' ? t('Your turn: draw from the centre, or take the tile on your left.', '轮到你：从中间摸牌，或拿左边的弃牌。', 'Sıra sende: ortadan çek ya da solundaki taşı al.')
      : anyFinish ? t('You can finish! Select the tile to throw and press Finish.', '你可以和牌了！选中要打出的牌，然后点“和牌”。', 'Bitirebilirsin! Atacağın taşı seç ve Bitir’e bas.') : t('Select a tile and discard it.', '选一张牌打出。', 'Bir taş seç ve at.'))
    : t(`${names[d.turn]} is playing…`, `${names[d.turn]}出牌中…`, `${names[d.turn]} oynuyor…`);

  const Seat = ({ p, cls }: { p: number; cls: string }) => {
    const k = at(p);
    return <div className={'ok-seat ' + cls}><b>{names[k]}</b><span>{isHuman(k) ? t('Player', '玩家', 'Oyuncu') : aiLabel}</span><span className={'num' + (d.turn === k && !end ? ' turn' : '')}>{t(`${d.hands[k].length} tiles`, `${d.hands[k].length}张`, `${d.hands[k].length} taş`)}</span></div>;
  };
  return (
    <div className="play okey">
      <div className="play-main">
        <div className="statline"><span role="status" aria-live="polite">{status}</span></div>
        <div className="ok-table">
          <Pile seat={at(2)} cls="tl" />
          <Seat p={2} cls="s-top" />
          <Pile seat={at(1)} cls="tr" />
          <Seat p={3} cls="s-left" />
          <div className="ok-centre">
            <button type="button" className={'ok-draw' + (mine && d.phase === 'draw' ? ' take' : '')} disabled={!(mine && d.phase === 'draw')} onClick={() => act(draw(d, 'pile'))}
              aria-label={t(`Draw from the centre, ${d.pile.length} left`, `从中间摸牌，剩${d.pile.length}张`, `Ortadan çek, ${d.pile.length} kaldı`)}>
              <span className="ok-back" /><span className="num">{d.pile.length}</span>
            </button>
            <div className="ok-ind"><Tile id={d.indicator} /><small>{t('Indicator', '指示牌', 'Gösterge')}</small></div>
          </div>
          <Seat p={1} cls="s-right" />
          <Pile seat={at(3)} cls="bl" />
          <div className="ok-seat s-bottom"><b>{names[viewer]}</b><span className={d.turn === viewer && !end ? 'turn' : ''}>{t('You', '你', 'Sen')}</span></div>
          <Pile seat={viewer} cls="br" />
        </div>
        {g.cover && !end ? (
          <div className="ok-cover race-card">
            {isHuman(d.turn) ? <>
              <h3>{t(`${names[d.turn]}, your turn`, `轮到${names[d.turn]}`, `Sıra ${names[d.turn]} oyuncusunda`)}</h3>
              <p className="muted">{t('Hand over the device; the others should not look at the rack.', '把设备交出去，其他人请不要看牌架。', 'Cihazı ver; diğerleri ıstakaya bakmasın.')}</p>
              <button type="button" id="ok-ready" className="btn primary" onClick={() => setG({ ...g, cover: false, viewer: d.turn })}>{t('I’m ready', '我准备好了', 'Hazırım')}</button>
            </> : <p className="muted">{t(`${names[d.turn]} is playing…`, `${names[d.turn]}出牌中…`, `${names[d.turn]} oynuyor…`)}</p>}
          </div>
        ) : <>
        <div className="ok-rack" role="group" aria-label={t('Your rack. Tap a tile, then tap another place to move it.', '你的牌架。点一张牌，再点另一个位置来移动。', 'Istakan. Bir taşa dokun, sonra taşımak için başka bir yere dokun.')}>
          {rack.slice(0, SLOTS).map((id, k) => (
            <button key={k} type="button" className={'ok-slot' + (id !== null && id === sel ? ' sel' : '')} onClick={() => clickSlot(k)}
              aria-label={id !== null ? tileName(id) : t('empty slot', '空位', 'boş yer')}>{id !== null && <Tile id={id} />}</button>
          ))}
        </div>
        <div className="tools">
          <button type="button" id="ok-runs" className="btn sm" onClick={() => setRack(arrange(d.hands[viewer], 'runs', d))}>{t('Sort by runs', '按顺子排', 'Seriye göre diz')}</button>
          <button type="button" id="ok-groups" className="btn sm" onClick={() => setRack(arrange(d.hands[viewer], 'groups', d))}>{t('Sort by groups', '按同数排', 'Gruba göre diz')}</button>
          {mine && canShow(d, viewer) && <button type="button" id="ok-show" className="btn sm" onClick={() => setG(showFor(g, viewer))}>{t('Show indicator (−1 to others)', '亮指示牌（他人−1）', 'Göstergeyi aç (diğerlerine −1)')}</button>}
          {mine && d.phase === 'discard' && <button type="button" id="ok-discard" className="btn primary" disabled={sel === null} onClick={() => sel !== null && act(discard(d, sel))}>{t('Discard', '打出', 'At')}</button>}
          {mine && d.phase === 'discard' && <button type="button" id="ok-finish" className={'btn' + (canFinishWith ? ' primary' : '')} disabled={!canFinishWith} onClick={() => sel !== null && act(finish(d, sel), t('You finish!', '你和牌了！', 'Bitirdin!'))}>{t('Finish', '和牌', 'Bitir')}{canFinishWith ? ` (−${canFinishWith})` : ''}</button>}
        </div>
        </>}
      </div>
      <aside className="play-side">
        <dl className="facts">
          {[0, 1, 2, 3].map(k => <div key={k}><dt>{names[k]}</dt><dd className="num">{g.scores[k]}</dd></div>)}
        </dl>
        {end && !g.over && <button type="button" id="ok-next" className="btn primary" onClick={() => setG(s => ({ ...fresh(s.level, s.scores, s.hand + 1, s.humans ?? 1, s.pnames ?? []), started: true }))}>{t('Next deal', '下一局', 'Sonraki el')}</button>}
        {end && end.winner >= 0 && end.winner !== viewer && (
          <div className="ok-reveal">
            <h3>{t(`${names[end.winner]}'s hand`, `${names[end.winner]}的牌`, `${names[end.winner]} eli`)}</h3>
            <div className="ok-reveal-tiles">{arrange(d.hands[end.winner], end.pairs ? 'groups' : 'runs', d).filter((x): x is number => x !== null).map(id => <Tile key={id} id={id} small />)}</div>
          </div>
        )}
        {g.over && (
          <div className="result" role="status">
            <h3>{t('Final scores', '最终得分', 'Son puanlar')}</h3>
            <p className="muted">{[0, 1, 2, 3].map(k => ({ k, s: g.scores[k] })).sort((a, b) => b.s - a.s).map(x => `${names[x.k]} ${x.s}`).join(' · ')}</p>
            <button type="button" id="ok-again" className="btn primary" onClick={() => setG(newGame())}>{t('New game', '新游戏', 'Yeni oyun')}</button>
          </div>
        )}
        {g.log.length > 0 && <ul className="ok-log">{g.log.map((l, i) => <li key={i}>{l}</li>)}</ul>}
        <label className="check" htmlFor="ok-mark"><input id="ok-mark" type="checkbox" checked={markOkey} onChange={e => setMarkOkey(e.target.checked)} /> {t('Mark the okey tiles', '标出okey牌', 'Okey taşlarını işaretle')}</label>
        <p className="muted small">{t('Everyone starts with 20 points. A normal finish costs the others 2; seven pairs or throwing an okey to finish costs 4. The game ends when someone reaches zero.',
          '每人起始20分。普通和牌其他人各扣2分；七对或打出okey和牌扣4分。有人分数降到0时游戏结束。', 'Herkes 20 puanla başlar. Normal bitiş diğerlerine 2’ye, çifte gitmek ya da okey atarak bitirmek 4’e mal olur. Biri sıfıra inince oyun biter.')}</p>
        <div className="setup">
          <h3>{t('New game', '新游戏', 'Yeni oyun')}</h3>
          <Seg id="ok-humans" label={t('People at the table', '真人玩家', 'Masadaki kişiler')} value={humansDraft} onChange={setHumansDraft}
            options={[1, 2, 3, 4].map(n => ({ value: n, label: String(n) }))} />
          {humansDraft > 1 && [1, 2, 3].filter(k => k < humansDraft).map(k => (
            <label key={k} className="field"><span className="field-label">{t(`Player ${k + 1}`, `玩家${k + 1}`, `Oyuncu ${k + 1}`)}</span>
              <input className="input" id={'ok-name-' + k} value={namesDraft[k] ?? ''} maxLength={20} onChange={e => setNamesDraft(namesDraft.map((x, j) => (j === k ? e.target.value : x)))} /></label>
          ))}
          {humansDraft < 4 && <RivalPick id="ok-level" game={'okey'} value={level} onChange={setLevel} levels={LEVELS} label={t('Computer players', '电脑玩家', 'Bilgisayar oyuncular')} />}
          {confirmNew ? (
            <div className="row">
              <button type="button" id="ok-discard-game" className="btn primary" onClick={() => { setG(newGame()); setConfirmNew(false); }}>{t('Abandon and start', '放弃当前游戏', 'Bırak ve başla')}</button>
              <button type="button" id="ok-keep" className="btn" onClick={() => setConfirmNew(false)}>{t('Keep playing', '继续', 'Oynamaya devam')}</button>
            </div>
          ) : <button type="button" id="ok-new" className="btn primary" onClick={() => (g.started && !g.over ? setConfirmNew(true) : setG(newGame()))}>{t('Start', '开始', 'Başla')}</button>}
        </div>
      </aside>
    </div>
  );
}
