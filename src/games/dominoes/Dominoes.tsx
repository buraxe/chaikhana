import './dominoes.css';
import { useEffect, useState } from 'react';
import { castName, charFor } from '../../core/cast';
import { pname, useLang, useT } from '../../core/i18n';
import { sfx } from '../../core/sound';
import { loadJSON, saveJSON } from '../../core/storage';
import { activeOf, noteStarted, recordResult, useData } from '../../core/store';
import { RivalPick, useRival } from '../../ui/Cast';
import { chooseMove, deal, drawOrPass, ends, isDouble, LEVELS, pips, place, playable, TARGET, TILES, type DMove, type DRound } from './rules';

interface Saved { level: number; r: DRound; scores: number[]; started: boolean; done: boolean; log: string[] }
const fresh = (level: number, scores = [0, 0], leader: 0 | 1 | null = null): Saved => ({ level, r: deal(Math.random, leader), scores, started: false, done: false, log: [] });

/** A tile drawn with its pips. */
const SPOTS: Record<number, [number, number][]> = { 0: [], 1: [[.5, .5]], 2: [[.25, .25], [.75, .75]], 3: [[.25, .25], [.5, .5], [.75, .75]], 4: [[.25, .25], [.75, .25], [.25, .75], [.75, .75]], 5: [[.25, .25], [.75, .25], [.5, .5], [.25, .75], [.75, .75]], 6: [[.25, .22], [.75, .22], [.25, .5], [.75, .5], [.25, .78], [.75, .78]] };
export function Bone({ a, b, vertical, back, className = '' }: { a: number; b: number; vertical?: boolean; back?: boolean; className?: string }) {
  const half = (v: number, ox: number, oy: number) => SPOTS[v].map(([x, y], k) => <circle key={k} cx={ox + x * 20} cy={oy + y * 20} r={2.1} className={'do-pip v' + v} />);
  return (
    <svg className={'do-bone ' + (vertical ? 'v ' : 'h ') + className} viewBox={vertical ? '0 0 22 42' : '0 0 42 22'} aria-hidden="true">
      <rect x=".5" y=".5" width={vertical ? 21 : 41} height={vertical ? 41 : 21} rx="3.5" className={back ? 'do-back' : 'do-face'} />
      {!back && <>
        {vertical ? <path d="M3 21h16" className="do-bar" /> : <path d="M21 3v16" className="do-bar" />}
        {vertical ? <>{half(a, 1, 1)}{half(b, 1, 21)}</> : <>{half(a, 1, 1)}{half(b, 21, 1)}</>}
      </>}
    </svg>
  );
}

export default function Dominoes() {
  const t = useT(), lang = useLang(), me = activeOf(useData());
  const [g, setG] = useState<Saved>(() => loadJSON<Saved | null>('gp.dominoes', null) ?? fresh(2));
  const [level, setLevel] = useState(g.level);
  const [pickTile, setPickTile] = useState<number | null>(null);
  useEffect(() => { saveJSON('gp.dominoes', g); }, [g]);
  useRival('dominoes', g.level);
  const r = g.r, names = [pname(me, lang), castName(charFor('dominoes', g.level), lang)];
  const mine = r.turn === 0 && !r.over, opts = playable(r, 0), e = ends(r);
  const say = (s: Saved, line: string): Saved => ({ ...s, log: [line, ...s.log].slice(0, 6) });

  /** After each move: settle a finished round and the match. */
  const settle = (s: Saved, nr: DRound): Saved => {
    let out: Saved = { ...s, r: nr, started: true };
    if (nr.over && !s.r.over) {
      const o = nr.over, scores = s.scores.slice();
      if (o.winner >= 0) scores[o.winner] += o.points;
      out = say({ ...out, scores }, o.winner < 0 ? t('Blocked, and the hands weigh the same: no points.', '堵死了，两手点数相同：不计分。', 'Kilitlendi, eller eşit: puan yok.')
        : t(`${names[o.winner]} ${o.blocked ? 'has the lighter hand' : 'plays out'} and scores ${o.points}.`, `${names[o.winner]}${o.blocked ? '手里点数较少' : '出完了牌'}，得${o.points}分。`, `${names[o.winner]} ${o.blocked ? 'daha hafif elle' : 'elini bitirdi ve'} ${o.points} puan aldı.`));
      sfx(o.winner === 0 ? 'win' : o.winner === 1 ? 'lose' : 'click');
      if (Math.max(...scores) >= TARGET) {
        out.done = true;
        const won = scores[0] > scores[1];
        recordResult(me.id, 'dominoes', { result: won ? 'win' : scores[0] === scores[1] ? 'draw' : 'loss', label: `vs ${LEVELS[s.level].name} AI · ${scores[0]}–${scores[1]}`, oppRating: LEVELS[s.level].rating });
      }
    }
    return out;
  };
  const doMove = (m: DMove) => { if (!g.started) noteStarted('dominoes'); sfx('tile'); setG(s => settle(s, place(s.r, m))); setPickTile(null); };
  const draw = () => { sfx('tileDraw', 0.6); setG(s => settle(s, drawOrPass(s.r))); };

  // The computer's turn: play, or draw until it can, or pass.
  useEffect(() => {
    if (r.over || r.turn !== 1) return;
    const id = setTimeout(() => {
      setG(s => {
        if (s.r.over || s.r.turn !== 1) return s;
        const os = playable(s.r, 1);
        if (os.length) { sfx('tile'); return settle(s, place(s.r, chooseMove(s.r, s.level))); }
        sfx('tileDraw', 0.5);
        const nr = drawOrPass(s.r);
        return nr.bone.length === s.r.bone.length && !nr.over ? say(settle(s, nr), t(`${names[1]} passes.`, `${names[1]}过。`, `${names[1]} pas geçti.`)) : settle(s, nr);
      });
    }, 650);
    return () => clearTimeout(id);
  }, [r]); // eslint-disable-line

  const tap = (tile: number) => {
    if (!mine) return;
    const ways = opts.filter(o => o.t === tile);
    if (!ways.length) { sfx('error', 0.3); return; }
    if (ways.length === 1) doMove(ways[0]); else setPickTile(tile);
  };
  const status = g.done ? (g.scores[0] > g.scores[1] ? t('You win the match!', '你赢下了比赛！', 'Maçı kazandın!') : t(`${names[1]} wins the match.`, `${names[1]}赢下了比赛。`, `Maçı ${names[1]} kazandı.`))
    : r.over ? t('Round over.', '本局结束。', 'El bitti.')
    : mine ? (opts.length ? t('Your turn: tap a tile that matches an end.', '轮到你：点一张能接上的牌。', 'Sıra sende: bir uca uyan taşa dokun.') : r.bone.length ? t('Nothing fits: draw from the boneyard.', '没有能接的牌：从牌堆摸一张。', 'Uyan taş yok: yığından çek.') : t('Nothing fits and the boneyard is empty: pass.', '没有能接的牌，牌堆也空了：过。', 'Uyan taş yok, yığın da boş: pas geç.'))
    : t(`${names[1]} is thinking…`, `${names[1]}思考中…`, `${names[1]} düşünüyor…`);
  return (
    <div className="play">
      <div className="play-main">
        <div className="statline"><span role="status" aria-live="polite">{status}</span><span className="num">{g.scores[0]} – {g.scores[1]} / {TARGET}</span></div>
        <div className="do-table">
          <div className="do-opp"><b>{names[1]}</b><span className="do-hand small">{r.hands[1].map((tile, k) => r.over ? <Bone key={k} a={TILES[tile][0]} b={TILES[tile][1]} vertical /> : <Bone key={k} a={0} b={0} vertical back />)}</span></div>
          <div className="do-line" aria-label={t('The line of play', '牌龙', 'Oyun hattı')}>
            {e && <span className="do-end">{e[0]}</span>}
            {r.line.map((p, k) => <Bone key={k} a={p.l} b={p.r} vertical={isDouble(p.t)} className={k === 0 || k === r.line.length - 1 ? 'edge' : ''} />)}
            {e && <span className="do-end">{e[1]}</span>}
            {!r.line.length && <span className="muted">{t('The first tile opens the line.', '第一张牌开局。', 'İlk taş hattı açar.')}</span>}
          </div>
          <p className="do-bone-count muted small">{t(`Boneyard: ${r.bone.length}`, `牌堆：${r.bone.length}`, `Yığın: ${r.bone.length}`)}</p>
        </div>
        <div className="do-mine">
          <div className="do-hand" role="group" aria-label={t('Your tiles', '你的牌', 'Taşların')}>
            {r.hands[0].slice().sort((a, b) => a - b).map(tile => {
              const fits = opts.some(o => o.t === tile);
              return <button key={tile} type="button" className={'do-tbtn' + (mine && fits ? ' fits' : '') + (pickTile === tile ? ' sel' : '')} disabled={!mine} onClick={() => tap(tile)} aria-label={`${TILES[tile][0]}–${TILES[tile][1]}`}><Bone a={TILES[tile][0]} b={TILES[tile][1]} vertical /></button>;
            })}
          </div>
          {pickTile !== null && e && (
            <div className="tools">
              <button type="button" id="do-left" className="btn" onClick={() => doMove({ t: pickTile, side: 'L' })}>◀ {t('Left end', '左端', 'Sol uç')} ({e[0]})</button>
              <button type="button" id="do-right" className="btn" onClick={() => doMove({ t: pickTile, side: 'R' })}>{t('Right end', '右端', 'Sağ uç')} ({e[1]}) ▶</button>
            </div>
          )}
          {mine && !opts.length && <button type="button" id="do-draw" className="btn primary" onClick={draw}>{r.bone.length ? t('Draw a tile', '摸牌', 'Taş çek') : t('Pass', '过', 'Pas')}</button>}
        </div>
      </div>
      <aside className="play-side">
        {r.over && !g.done && <button type="button" id="do-next" className="btn primary" onClick={() => setG(s => ({ ...fresh(s.level, s.scores, s.r.over && s.r.over.winner >= 0 ? s.r.over.winner as 0 | 1 : null), started: true, log: s.log }))}>{t('Next round', '下一局', 'Sonraki el')}</button>}
        {g.done && <button type="button" id="do-again" className="btn primary" onClick={() => setG(fresh(level))}>{t('New match', '新比赛', 'Yeni maç')}</button>}
        <dl className="facts"><div><dt>{names[0]}</dt><dd className="num">{g.scores[0]}</dd></div><div><dt>{names[1]}</dt><dd className="num">{g.scores[1]}</dd></div><div><dt>{t('Pips in your hand', '你手里的点数', 'Elindeki puan')}</dt><dd className="num">{r.hands[0].reduce((s, x) => s + pips(x), 0)}</dd></div></dl>
        {g.log.length > 0 && <ul className="do-log">{g.log.map((l, i) => <li key={i}>{l}</li>)}</ul>}
        <div className="setup">
          <h3>{t('New match', '新比赛', 'Yeni maç')}</h3>
          <RivalPick id="do-level" game="dominoes" value={level} onChange={setLevel} levels={LEVELS} />
          <button type="button" id="do-new" className="btn primary" onClick={() => setG(fresh(level))}>{t('Start', '开始', 'Başla')}</button>
        </div>
      </aside>
    </div>
  );
}
