import './okey101.css';
import { useEffect, useMemo, useRef, useState } from 'react';
import { sfx } from '../../core/sound';
import { RivalPick, useRival } from '../../ui/Cast';
import { pname, trLabel, useLang, useT, aiLabel as aiLabelOf } from '../../core/i18n';
import { mulberry32 } from '../../core/rng';
import { loadJSON, saveJSON } from '../../core/storage';
import { activeOf, noteStarted, recordResult, useData } from '../../core/store';
import { Pick, Seg } from '../../ui/bits';
import { isWild, TILES, valueOf } from '../okey/rules';
import { addTo, aiTurn, checkOpening, deal, discard, discardPenalty, draw, lay, LEVELS, prev, putBack, type Round } from './game';
import { analyze, canAdd, planMelds, planPairs } from './melds';

interface Saved { level: number; rounds: number; roundNo: number; round: Round; totals: number[]; history: number[][]; over: boolean; recorded: boolean; started: boolean; log: string[]; humans?: number; pnames?: string[]; viewer?: number; cover?: boolean }
const rngNow = () => mulberry32((Date.now() ^ (Math.random() * 1e9)) >>> 0);
const fresh = (level: number, rounds: number, humans = 1, pnames: string[] = []): Saved => {
  const round = deal(3, rngNow());
  return { level, rounds, roundNo: 1, round, totals: [0, 0, 0, 0], history: [], over: false, recorded: false, started: false, log: [], humans, pnames, viewer: round.turn < humans ? round.turn : 0, cover: humans > 1 };
};

export default function Okey101() {
  const t = useT(), lang = useLang(), data = useData(), me = activeOf(data);
  const [g, setG] = useState<Saved>(() => loadJSON<Saved | null>('gp.okey101', null) ?? fresh(2, 5));
  const [sel, setSel] = useState<number[]>([]);
  const [staged, setStaged] = useState<number[][]>([]);
  const [sortMode, setSortMode] = useState<'runs' | 'groups'>('runs');
  const [warn, setWarn] = useState<number | null>(null);
  const [msg, setMsg] = useState('');
  const [level, setLevel] = useState(g.level);
  const [rounds, setRounds] = useState(g.rounds);
  const [confirmNew, setConfirmNew] = useState(false);
  const busy = useRef(false);
  const humans = g.humans ?? 1, V = g.viewer ?? 0, isHuman = (k: number) => k < humans;
  const r = g.round, ok = r.okey, mine = r.turn === V && !r.end && !g.over && !g.cover;
  const dirs = [pname(me, lang), t('Right', '右家', 'Sağ'), t('Across', '对家', 'Karşı'), t('Left', '左家', 'Sol')];
  const names = [0, 1, 2, 3].map(k => (k === 0 ? pname(me, lang) : k < humans ? g.pnames?.[k] || t(`Player ${k + 1}`, `玩家${k + 1}`, `Oyuncu ${k + 1}`) : humans > 1 ? t(`Computer ${k + 1}`, `电脑${k + 1}`, `Bilgisayar ${k + 1}`) : dirs[k]));
  const [humansDraft, setHumansDraft] = useState(humans);
  const [namesDraft, setNamesDraft] = useState<string[]>(() => g.pnames?.length ? g.pnames : ['', t('Player 2', '玩家2', 'Oyuncu 2'), t('Player 3', '玩家3', 'Oyuncu 3'), t('Player 4', '玩家4', 'Oyuncu 4')]);
  const newGame = () => fresh(level, rounds, humansDraft, namesDraft);
  const aiLabel = aiLabelOf(LEVELS[g.level].name, lang);
  useRival('okey-101', (g.humans ?? 1) < 4 ? g.level : null);

  useEffect(() => { saveJSON('gp.okey101', g); }, [g]);
  useEffect(() => { setSel([]); setStaged([]); setWarn(null); }, [r.turn, g.roundNo]);

  const settle = (s: Saved, nr: Round): Saved => {
    const next: Saved = { ...s, round: nr };
    const hs = s.humans ?? 1;
    // Hand the device over when the turn reaches another person.
    if (hs > 1 && !nr.end && nr.turn < hs && nr.turn !== (s.viewer ?? 0)) { next.viewer = nr.turn; next.cover = true; }
    if (nr.end && !s.round.end) {
      next.totals = s.totals.map((v, k) => v + nr.end!.scores[k]);
      next.history = [...s.history, nr.end.scores];
      next.over = s.roundNo >= s.rounds;
      if (next.over && !s.recorded) {
        next.recorded = true;
        const sorted = [...next.totals].sort((a, b) => a - b);
        const result = next.totals[0] === sorted[0] ? 'win' : next.totals[0] === sorted[3] ? 'loss' : 'draw';
        recordResult(me.id, 'okey-101', { result, label: hs > 1 ? `same device · ${next.totals.join('/')}` : `vs ${LEVELS[s.level].name} AI · ${next.totals.join('/')}`, oppRating: hs > 1 ? undefined : LEVELS[s.level].rating });
      }
    }
    return next;
  };
  // Computer seats.
  useEffect(() => {
    if (r.end || isHuman(r.turn) || g.over || busy.current) return;
    busy.current = true;
    const steps = aiTurn(r, g.level, rngNow());
    sfx('tileDraw', 0.6); setTimeout(() => sfx('tile', 0.8), 260);
    let k = 0, timer = 0;
    const tick = () => {
      if (k >= steps.length) { busy.current = false; return; }
      const st = steps[k++];
      setG(s => settle(s, st));
      timer = window.setTimeout(tick, k === steps.length ? 0 : 550);
    };
    timer = window.setTimeout(tick, 700);
    return () => { clearTimeout(timer); busy.current = false; };
  }, [r.turn, r.end, g.over, g.roundNo]); // eslint-disable-line

  const act = (nr: Round) => { if (nr === r) return false; sfx('tile'); if (!g.started) noteStarted('okey-101'); setG(s => ({ ...settle(s, nr), started: true })); setSel([]); setMsg(''); return true; };
  const stagedFlat = staged.flat();
  const rack = useMemo(() => {
    const val = (i: number) => valueOf(TILES[i], ok), wild = (i: number) => isWild(TILES[i], ok);
    return r.hands[V].filter(i => !stagedFlat.includes(i)).sort((a, b) => {
      if (wild(a) !== wild(b)) return wild(a) ? 1 : -1;
      return sortMode === 'runs' ? val(a).c - val(b).c || val(a).n - val(b).n : val(a).n - val(b).n || val(a).c - val(b).c;
    });
  }, [r.hands, staged, sortMode, ok]); // eslint-disable-line

  const toggle = (id: number) => setSel(s => (s.includes(id) ? s.filter(x => x !== id) : [...s, id]));
  const makeSet = () => {
    const shape = analyze(sel, ok);
    if (!shape) { setMsg(t('Those tiles do not form a set.', '这几张牌组不成牌组。', 'Bu taşlar per oluşturmuyor.')); return; }
    if (!r.opened[V]) { setStaged(st => [...st, sel]); setSel([]); setMsg(''); return; }
    if ((r.opened[V] === 'pairs') !== (shape.kind === 'pair')) { setMsg(r.opened[V] === 'pairs' ? t('You opened with pairs, so you can only lay pairs.', '你是以对子开牌的，只能出对子。', 'Çiftten açtın, yalnızca çift işleyebilirsin.') : t('After opening with sets you cannot lay pairs.', '以牌组开牌后不能出对子。', 'Seriden açtıktan sonra çift işleyemezsin.')); return; }
    if (!act(lay(r, [sel]))) setMsg(t('Keep at least one tile to discard.', '至少要留一张牌用来打出。', 'Atmak için en az bir taş bırak.'));
  };
  const opening = staged.length ? checkOpening(staged, ok) : null;
  const confirmOpen = () => { if (opening?.ok && act(lay(r, staged))) setStaged([]); else setMsg(t('Keep at least one tile to discard.', '至少要留一张牌用来打出。', 'Atmak için en az bir taş bırak.')); };
  const suggest = () => {
    const hand = r.hands[V], p = planMelds(hand, ok), pairs = planPairs(hand, ok);
    if (p.points >= 101 || pairs.length < 5) setStaged(p.melds); else setStaged(pairs.slice(0, Math.min(pairs.length, Math.floor((hand.length - 1) / 2))));
    setSel([]);
  };
  const tryDiscard = (force = false) => {
    if (sel.length !== 1) return;
    const id = sel[0];
    if (r.mustUse !== null && r.hands[V].includes(r.mustUse)) { setMsg(t('Use the tile you took from the left first, or put it back.', '先用掉从左边拿的牌，或者把它放回去。', 'Soldan aldığın taşı önce kullan ya da geri koy.')); return; }
    if (!force && discardPenalty(r, id) > 0) { setWarn(id); return; }
    setWarn(null);
    if (r.hands[V].length === 1 && !r.opened[V]) { setMsg(t('You have to open before you can finish.', '必须先开牌才能和牌。', 'Bitirmeden önce açman gerekir.')); return; }
    act(discard(r, id));
  };
  const addable = sel.length === 1 && r.opened[V] ? new Set(r.melds.filter(m => canAdd(m, sel[0], ok)).map(m => m.id)) : new Set<number>();
  const tileName = (id: number) => { const tl = TILES[id]; return tl.fake ? t('false joker', '假okey', 'sahte okey') : `${[t('red', '红', 'kırmızı'), t('yellow', '黄', 'sarı'), t('blue', '蓝', 'mavi'), t('black', '黑', 'siyah')][tl.c]} ${tl.n}`; };
  const Tile = ({ id, small, onClick, on }: { id: number; small?: boolean; onClick?: () => void; on?: boolean }) => {
    const tl = TILES[id], wild = isWild(tl, ok);
    const inner = <span className={'ok-tile' + (small ? ' small' : '') + (tl.fake ? ' fake' : ' c' + tl.c) + (wild ? ' wild' : '')}>{tl.fake ? <b>✣</b> : <b>{tl.n}</b>}{!tl.fake && <i />}</span>;
    return onClick ? <button type="button" className={'o1-tile' + (on ? ' sel' : '')} onClick={onClick} aria-pressed={on} aria-label={tileName(id)}>{inner}</button> : inner;
  };
  const leftTop = r.discards[prev(V)][r.discards[prev(V)].length - 1];
  const end = r.end;
  const status = g.over ? t('Game over.', '游戏结束。', 'Oyun bitti.')
    : end ? (end.finisher < 0 ? t('The tiles ran out. Leftover tiles are counted.', '牌摸完了，按剩余的牌计分。', 'Taşlar bitti. Eldeki taşlar sayılıyor.') : t(`${names[end.finisher]} finished${end.okeyFinish ? ' by discarding an okey' : ''}${end.pairsFinish ? ' with pairs' : ''}${end.direct ? ' in one go' : ''}.`, `${names[end.finisher]}${end.direct ? '一次' : ''}${end.pairsFinish ? '以对子' : ''}${end.okeyFinish ? '打出okey' : ''}和牌。`, `${names[end.finisher]} bitirdi${end.okeyFinish ? ' (okey atarak)' : ''}${end.pairsFinish ? ' (çiftle)' : ''}${end.direct ? ' (elden)' : ''}.`))
    : mine ? (r.phase === 'draw' ? (r.pile.length ? t('Your turn: draw from the centre or take the tile on your left.', '轮到你：从中间摸牌，或拿左边的弃牌。', 'Sıra sende: ortadan çek ya da solundaki taşı al.') : t('The centre is empty. Take the tile on your left, or end the round.', '中间没牌了。拿左边的弃牌，或者结束本局。', 'Orta boş. Solundaki taşı al ya da eli bitir.'))
      : !r.opened[V] ? t('Make sets worth 101 or more (or five pairs) to open, or discard a tile.', '组成101分以上的牌组（或五个对子）开牌，或者打出一张牌。', 'Açmak için 101 ya da daha fazla puanlık per (ya da beş çift) yap veya bir taş at.')
      : t('Lay sets, add tiles to sets on the table, then discard.', '出牌组、往桌上的牌组加牌，然后打出一张。', 'Per indir, masadaki perlere taş işle, sonra at.'))
    : t(`${names[r.turn]} is playing…`, `${names[r.turn]}出牌中…`, `${names[r.turn]} oynuyor…`);
  const nextRound = () => setG(s => { const round = deal((s.round.dealer + 1) % 4, rngNow()), hs = s.humans ?? 1; return { ...s, roundNo: s.roundNo + 1, round, viewer: hs > 1 ? (round.turn < hs ? round.turn : s.viewer) : 0, cover: hs > 1 }; });

  return (
    <div className="play okey o101">
      <div className="play-main">
        <div className="statline"><span role="status" aria-live="polite">{status}</span><span className="num">{t(`Round ${g.roundNo} of ${g.rounds}`, `第${g.roundNo}局 / 共${g.rounds}局`, `El ${g.roundNo} / ${g.rounds}`)}</span></div>
        <div className="o1-top">
          <div className="ok-centre">
            <button type="button" className={'ok-draw' + (mine && r.phase === 'draw' ? ' take' : '')} disabled={!(mine && r.phase === 'draw')} onClick={() => act(draw(r, 'pile'))}
              aria-label={r.pile.length ? t(`Draw from the centre, ${r.pile.length} left`, `从中间摸牌，剩${r.pile.length}张`, `Ortadan çek, ${r.pile.length} kaldı`) : t('End the round', '结束本局', 'Eli bitir')}>
              <span className="ok-back" /><span className="num">{r.pile.length || t('End', '结束', 'Bitir')}</span>
            </button>
            <div className="ok-ind"><Tile id={r.indicator} /><small>{t('Indicator', '指示牌', 'Gösterge')}</small></div>
            <button type="button" className={'ok-pile' + (mine && r.phase === 'draw' && leftTop !== undefined ? ' take' : '')} disabled={!(mine && r.phase === 'draw' && leftTop !== undefined)} onClick={() => act(draw(r, 'discard'))}
              aria-label={leftTop !== undefined ? t(`Take ${tileName(leftTop)} from the left`, `拿左边的${tileName(leftTop)}`, `Soldan ${tileName(leftTop)} al`) : t('Empty discard pile', '空弃牌堆', 'Atılan taş yok')}>
              {leftTop !== undefined ? <Tile id={leftTop} /> : <span className="ok-empty" />}
            </button>
            <small className="o1-label">{t('From the left', '左家弃牌', 'Soldan')}</small>
          </div>
          <div className="o1-seats">
            {[1, 2, 3].map(p => (V + p) % 4).map(k => (
              <div key={k} className={'o1-seat' + (r.turn === k && !end ? ' turn' : '')}>
                <b>{names[k]}</b><span>{isHuman(k) ? t('Player', '玩家', 'Oyuncu') : aiLabel}</span>
                <span className="num">{t(`${r.hands[k].length} tiles`, `${r.hands[k].length}张`, `${r.hands[k].length} taş`)}{r.opened[k] ? ' · ' + (r.opened[k] === 'pairs' ? t('opened (pairs)', '已开牌（对子）', 'açtı (çift)') : t('opened', '已开牌', 'açtı')) : ''}</span>
                {r.discards[k].length > 0 && <Tile id={r.discards[k][r.discards[k].length - 1]} small />}
              </div>
            ))}
          </div>
        </div>
        <div className="o1-table" aria-label={t('Sets on the table', '桌上的牌组', 'Masadaki perler')}>
          {r.melds.length === 0 ? <p className="muted small">{t('No sets on the table yet.', '桌上还没有牌组。', 'Masada henüz per yok.')}</p> : [0, 1, 2, 3].filter(k => r.melds.some(m => m.owner === k)).map(k => (
            <div key={k} className="o1-owner">
              <span className="o1-name">{names[k]}</span>
              <div className="o1-melds">
                {r.melds.filter(m => m.owner === k).map(m => (
                  <button key={m.id} type="button" className={'o1-meld' + (addable.has(m.id) ? ' can' : '')} disabled={!(mine && r.phase === 'play' && addable.has(m.id))}
                    onClick={() => act(addTo(r, m.id, sel[0]))} aria-label={t('Set: ', '牌组：', 'Per: ') + m.tiles.map(tileName).join(', ')}>
                    {sortForShow(m.tiles, ok).map(id => <Tile key={id} id={id} small />)}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
        {staged.length > 0 && (
          <div className="o1-staged">
            <span>{opening?.kind === 'pairs' ? t(`Opening: ${opening.pairs} pairs (need 5)`, `开牌：${opening.pairs}个对子（需要5个）`, `Açılış: ${opening.pairs} çift (5 gerekli)`) : t(`Opening: ${opening?.points ?? 0} points (need 101)`, `开牌：${opening?.points ?? 0}分（需要101分）`, `Açılış: ${opening?.points ?? 0} puan (101 gerekli)`)}</span>
            <div className="o1-melds">{staged.map((s, i) => <span key={i} className="o1-meld">{sortForShow(s, ok).map(id => <Tile key={id} id={id} small />)}</span>)}</div>
            <div className="row">
              <button type="button" id="o1-open" className="btn primary" disabled={!opening?.ok || !mine || r.phase !== 'play'} onClick={confirmOpen}>{t('Open', '开牌', 'Aç')}</button>
              <button type="button" id="o1-unstage" className="btn" onClick={() => setStaged([])}>{t('Take back', '收回', 'Geri al')}</button>
            </div>
          </div>
        )}
        {g.cover && !end ? (
          <div className="ok-cover race-card">
            {isHuman(r.turn) ? <>
              <h3>{t(`${names[r.turn]}, your turn`, `轮到${names[r.turn]}`, `Sıra ${names[r.turn]} oyuncusunda`)}</h3>
              <p className="muted">{t('Hand over the device; the others should not look at the rack.', '把设备交出去，其他人请不要看牌架。', 'Cihazı ver; diğerleri ıstakaya bakmasın.')}</p>
              <button type="button" id="o1-ready" className="btn primary" onClick={() => setG({ ...g, cover: false, viewer: r.turn })}>{t('I’m ready', '我准备好了', 'Hazırım')}</button>
            </> : <p className="muted">{t(`${names[r.turn]} is playing…`, `${names[r.turn]}出牌中…`, `${names[r.turn]} oynuyor…`)}</p>}
          </div>
        ) : <>
        <div className="o1-rack" role="group" aria-label={t('Your tiles. Tap to select.', '你的牌。点击选择。', 'Taşların. Seçmek için dokun.')}>
          {rack.map(id => <Tile key={id} id={id} onClick={() => toggle(id)} on={sel.includes(id)} />)}
        </div>
        {msg && <p className="hint">{msg}</p>}
        {warn !== null && (
          <div className="hint">
            {isWild(TILES[warn], ok) ? t('Discarding an okey costs 101 points.', '打出okey要罚101分。', 'Okey atmak 101 puana mal olur.') : t('This tile fits a set on the table. Discarding it costs 101 points.', '这张牌可以加到桌上的牌组里，打出要罚101分。', 'Bu taş masadaki bir pere işlenebilir. Atmak 101 puana mal olur.')}
            <div className="row"><button type="button" id="o1-force" className="btn sm danger" onClick={() => tryDiscard(true)}>{t('Discard anyway', '仍然打出', 'Yine de at')}</button><button type="button" id="o1-cancel" className="btn sm" onClick={() => setWarn(null)}>{t('Cancel', '取消', 'Vazgeç')}</button></div>
          </div>
        )}
        <div className="tools">
          <button type="button" id="o1-sort" className="btn sm" onClick={() => setSortMode(m => (m === 'runs' ? 'groups' : 'runs'))}>{sortMode === 'runs' ? t('Sort by number', '按数字排', 'Sayıya göre diz') : t('Sort by colour', '按颜色排', 'Renge göre diz')}</button>
          {mine && r.phase === 'play' && <>
            <button type="button" id="o1-set" className="btn" disabled={sel.length < 2} onClick={makeSet}>{r.opened[V] ? t('Lay set', '出牌组', 'Per indir') : t('Add to opening', '加入开牌', 'Açılışa ekle')}</button>
            {!r.opened[V] && <button type="button" id="o1-suggest" className="btn" onClick={suggest}>{t('Suggest sets', '推荐牌组', 'Per öner')}</button>}
            {r.mustUse !== null && r.hands[V].includes(r.mustUse) && !r.laidThisTurn && <button type="button" id="o1-back" className="btn" onClick={() => act(putBack(r))}>{t('Put back', '放回', 'Geri koy')}</button>}
            <button type="button" id="o1-discard" className="btn primary" disabled={sel.length !== 1} onClick={() => tryDiscard()}>{r.hands[V].length === 1 ? t('Finish', '和牌', 'Bitir') : t('Discard', '打出', 'At')}</button>
          </>}
        </div>
        </>}
      </div>
      <aside className="play-side">
        <div className="table-scroll"><table className="table">
          <thead><tr><th>{t('Player', '玩家', 'Oyuncu')}</th>{g.history.map((_, i) => <th key={i} className="r">{i + 1}</th>)}<th className="r">{t('Total', '总分', 'Toplam')}</th></tr></thead>
          <tbody>{[0, 1, 2, 3].map(k => (
            <tr key={k} className={k === V ? 'me' : ''}><td>{names[k]}</td>{g.history.map((h, i) => <td key={i} className="r num">{h[k]}</td>)}<td className="r num"><b>{g.totals[k]}</b></td></tr>
          ))}</tbody>
        </table></div>
        <p className="muted small">{t('Lowest total wins. Finishing scores −101; players who never opened get 202; others count the tiles left on their rack, plus 101 for each okey kept.',
          '总分最低者获胜。和牌得−101分；没开牌的玩家记202分；其他人按牌架上剩余牌的点数计分，每留一张okey再加101分。', 'En düşük toplam kazanır. Biten −101 yazar; hiç açmayanlar 202 alır; diğerleri ıstakada kalan taşları sayar, tutulan her okey için 101 eklenir.')}</p>
        {end && !g.over && <button type="button" id="o1-next" className="btn primary" onClick={nextRound}>{t('Next round', '下一局', 'Sonraki el')}</button>}
        {g.over && (
          <div className="result" role="status">
            <h3>{t('Final standings', '最终排名', 'Genel sıralama')}</h3>
            <p className="muted">{[0, 1, 2, 3].map(k => ({ k, v: g.totals[k] })).sort((a, b) => a.v - b.v).map(x => `${names[x.k]} ${x.v}`).join(' · ')}</p>
            <button type="button" id="o1-again" className="btn primary" onClick={() => setG(newGame())}>{t('New game', '新游戏', 'Yeni oyun')}</button>
          </div>
        )}
        <div className="setup">
          <h3>{t('New game', '新游戏', 'Yeni oyun')}</h3>
          <Seg id="o1-humans" label={t('People at the table', '真人玩家', 'Masadaki kişiler')} value={humansDraft} onChange={setHumansDraft} options={[1, 2, 3, 4].map(n => ({ value: n, label: String(n) }))} />
          {humansDraft > 1 && [1, 2, 3].filter(k => k < humansDraft).map(k => (
            <label key={k} className="field"><span className="field-label">{t(`Player ${k + 1}`, `玩家${k + 1}`, `Oyuncu ${k + 1}`)}</span>
              <input className="input" id={'o1-name-' + k} value={namesDraft[k] ?? ''} maxLength={20} onChange={e => setNamesDraft(namesDraft.map((x, j) => (j === k ? e.target.value : x)))} /></label>
          ))}
          {humansDraft < 4 && <RivalPick id="o1-level" game={'okey-101'} value={level} onChange={setLevel} levels={LEVELS} label={t('Computer players', '电脑玩家', 'Bilgisayar oyuncular')} />}
          <Pick id="o1-rounds" label={t('Rounds', '局数', 'El sayısı')} value={rounds} onChange={setRounds} options={[3, 5, 7, 11].map(n => ({ value: n, label: t(`${n} rounds`, `${n}局`, `${n} el`) }))} />
          {confirmNew ? (
            <div className="row">
              <button type="button" id="o1-discard-game" className="btn primary" onClick={() => { setG(newGame()); setConfirmNew(false); }}>{t('Abandon and start', '放弃当前游戏', 'Bırak ve başla')}</button>
              <button type="button" id="o1-keep" className="btn" onClick={() => setConfirmNew(false)}>{t('Keep playing', '继续', 'Oynamaya devam')}</button>
            </div>
          ) : <button type="button" id="o1-new" className="btn primary" onClick={() => (g.started && !g.over ? setConfirmNew(true) : setG(newGame()))}>{t('Start', '开始', 'Başla')}</button>}
        </div>
      </aside>
    </div>
  );
}
/** Show a set in playing order (by the value each tile stands for). */
function sortForShow(ids: number[], ok: { c: number; n: number }): number[] {
  const shape = analyze(ids, ok);
  if (!shape) return ids;
  const remaining = ids.slice(), out: number[] = [];
  for (const v of shape.as) {
    let k = remaining.findIndex(i => !isWild(TILES[i], ok) && valueOf(TILES[i], ok).c === v.c && valueOf(TILES[i], ok).n === v.n);
    if (k < 0) k = remaining.findIndex(i => isWild(TILES[i], ok));
    if (k < 0) k = 0;
    out.push(remaining.splice(k, 1)[0]);
  }
  return [...out, ...remaining];
}
