import './tangram.css';
import { useEffect, useMemo, useRef, useState } from 'react';
import { sfx } from '../../core/sound';
import { useLang, useT, pick as tri } from '../../core/i18n';
import { loadJSON, saveJSON } from '../../core/storage';
import { getData, noteStarted, recordResult } from '../../core/store';
import { fmtTime } from '../../ui/bits';
import { bounds, compare, localOf, polygonIn, snap, SOLVED_ERROR, type Place, type Pt } from './geometry';
import type { Silhouette } from './silhouettes';

type Layout = 'wide' | 'tall';
type L3 = [string, string, string];
interface Saved { target: string; layout: Layout; pieces: Place[]; elapsed: number; assisted: boolean; recorded: boolean; done: boolean; started: boolean }
const FREE = 'free';

/** One dissection puzzle: a set of pieces, the silhouettes they make, and where things sit on the table. */
export interface DissectionSet {
  game: string; storeKey: string; prefix: string;
  standard: Record<string, Pt[]>;
  silhouettes: Silhouette[];
  view: Record<Layout, { w: number; h: number; target: [number, number]; tray: Pt[] }>;
  /** Starting turns (in 45° steps) for the scrambled tray, one per piece. */
  scramble: number[];
  pieceNames: L3[];
  tableLabel: L3;
  help: L3;
}

const pts = (poly: Pt[]) => poly.map(([x, y]) => `${x.toFixed(3)},${y.toFixed(3)}`).join(' ');

/** Drag-and-turn table shared by the tangram and the T-puzzle. */
export function Dissection({ set }: { set: DissectionSet }) {
  const t = useT(), lang = useLang();
  const tt = (s: L3) => t(s[0], s[1], s[2]);
  const IDS = Object.keys(set.standard), SIL = set.silhouettes, P = set.prefix;
  const local = useMemo(() => localOf(set.standard), [set.standard]);
  const polyOf = (p: Place) => polygonIn(local, p);
  const trayPieces = (layout: Layout, scramble: boolean): Place[] => IDS.map((id, k) => {
    const [x, y] = set.view[layout].tray[k];
    return { id, x, y, rot: scramble ? set.scramble[k] : 0, flip: false };
  });
  /** Silhouette polygons placed in the target area (stored y-up, drawn y-down). */
  const placeTarget = (id: string, layout: Layout): Pt[][] => {
    const s = SIL.find(x => x.id === id);
    if (!s) return [];
    const flipped = s.polys.map(p => p.map(([x, y]) => [x, -y] as Pt));
    const b = bounds(flipped), [cx, cy] = set.view[layout].target;
    const dx = cx - (b.x0 + b.x1) / 2, dy = cy - (b.y0 + b.y1) / 2;
    return flipped.map(p => p.map(([x, y]) => [x + dx, y + dy] as Pt));
  };
  const fresh = (target: string): Saved => {
    const layout: Layout = typeof window !== 'undefined' && window.innerWidth < 640 ? 'tall' : 'wide';
    return { target, layout, pieces: trayPieces(layout, target !== FREE), elapsed: 0, assisted: false, recorded: false, done: false, started: false };
  };

  const [g, setG] = useState<Saved>(() => loadJSON<Saved | null>(set.storeKey, null) ?? fresh(SIL[0].id));
  const [sel, setSel] = useState(-1);
  const [hintK, setHintK] = useState(-1);
  const [showAll, setShowAll] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);
  const drag = useRef<{ i: number; dx: number; dy: number; sx: number; sy: number; moved: boolean } | null>(null);
  const view = set.view[g.layout], free = g.target === FREE;
  const target = useMemo(() => placeTarget(g.target, g.layout), [g.target, g.layout]); // eslint-disable-line
  const polys = g.pieces.map(polyOf);

  useEffect(() => { saveJSON(set.storeKey, g); }, [g, set.storeKey]);
  useEffect(() => {
    if (g.done || !g.started || free) return;
    const id = setInterval(() => { if (!document.hidden) setG(s => ({ ...s, elapsed: s.elapsed + 1000 })); }, 1000);
    return () => clearInterval(id);
  }, [g.done, g.started, free]);

  const settle = (pieces: Place[], i: number) => {
    const anchors: Pt[] = [...(free ? [] : target.flat()), ...pieces.flatMap((p, k) => (k === i ? [] : polyOf(p)))];
    sfx('slide');
    const placed = pieces.map((p, k) => (k === i ? snap(p, anchors, 0.45, polyOf) : p));
    setG(s => {
      const next: Saved = { ...s, pieces: placed, started: true };
      if (!s.started && !free) noteStarted(set.game);
      if (!free && !s.done && compare(target, placed.map(polyOf)).error < SOLVED_ERROR) {
        next.done = true;
        if (!s.recorded && !s.assisted) {
          next.recorded = true;
          recordResult(getData().activeId, set.game, { result: 'win', ms: s.elapsed, label: s.target, bestKey: s.target });
        }
      }
      return next;
    });
  };
  const toWorld = (e: { clientX: number; clientY: number }): Pt => {
    const m = svgRef.current!.getScreenCTM()!.inverse(), p = new DOMPoint(e.clientX, e.clientY).matrixTransform(m);
    return [p.x, p.y];
  };
  const onDown = (e: React.PointerEvent, i: number) => {
    if (g.done) return;
    (e.target as Element).setPointerCapture(e.pointerId);
    const [x, y] = toWorld(e), p = g.pieces[i];
    drag.current = { i, dx: p.x - x, dy: p.y - y, sx: x, sy: y, moved: false };
    setSel(i);
  };
  const onMove = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d) return;
    const [x, y] = toWorld(e);
    if (!d.moved && Math.hypot(x - d.sx, y - d.sy) < 0.25) return;
    d.moved = true;
    const nx = Math.max(0.3, Math.min(view.w - 0.3, x + d.dx)), ny = Math.max(0.3, Math.min(view.h - 0.3, y + d.dy));
    setG(s => ({ ...s, pieces: s.pieces.map((p, k) => (k === d.i ? { ...p, x: nx, y: ny } : p)) }));
  };
  const onUp = () => {
    const d = drag.current;
    drag.current = null;
    if (!d) return;
    if (d.moved) settle(g.pieces, d.i);
    else rotate(d.i, 1);
  };
  const rotate = (i: number, dir: number) => {
    if (i < 0 || g.done) return;
    settle(g.pieces.map((p, k) => (k === i ? { ...p, rot: (p.rot + dir + 8) % 8 } : p)), i);
  };
  const flip = (i: number) => {
    if (i < 0 || g.done) return;
    settle(g.pieces.map((p, k) => (k === i ? { ...p, flip: !p.flip } : p)), i);
  };
  const onKey = (e: React.KeyboardEvent, i: number) => {
    const d = ({ ArrowUp: [0, -0.5], ArrowDown: [0, 0.5], ArrowLeft: [-0.5, 0], ArrowRight: [0.5, 0] } as Record<string, number[]>)[e.key];
    if (d) { e.preventDefault(); settle(g.pieces.map((p, k) => (k === i ? { ...p, x: p.x + d[0], y: p.y + d[1] } : p)), i); }
    else if (e.key === 'r' || e.key === 'R') rotate(i, e.shiftKey ? -1 : 1);
    else if (e.key === 'f' || e.key === 'F') flip(i);
  };
  const start = (id: string) => { setG(fresh(id)); setSel(-1); setHintK(-1); setShowAll(false); };
  const reset = () => { setG(s => ({ ...s, pieces: trayPieces(s.layout, !free), done: false })); setSel(-1); };
  // A hint outlines one piece of the stored solution, largest first, that is not yet covered.
  const giveHint = () => {
    const order = [...target.keys()].sort((a, b) => target[b].length - target[a].length);
    const k = order.find(j => compare([target[j]], polys).miss > 2) ?? order[0];
    setHintK(k); setG(s => ({ ...s, assisted: true }));
  };
  const silName = (id: string) => { const s = SIL.find(x => x.id === id); return s ? tri(s, lang) : ''; };
  const allStd = Object.values(set.standard), sb = bounds(allStd);

  return (
    <div className="play">
      <div className="play-main">
        <div className="statline">
          <span role="status" aria-live="polite">{free ? t('Free play: make any shape you like.', '自由拼：随意拼出你喜欢的形状。', 'Serbest oyun: istediğin şekli yap.')
            : g.done ? t(`${silName(g.target)} complete.`, `“${silName(g.target)}”拼好了！`, `${silName(g.target)} tamamlandı.`)
            : t(`Fill the silhouette: ${silName(g.target)}.`, `拼出剪影：${silName(g.target)}。`, `Silueti doldur: ${silName(g.target)}.`)}</span>
          {!free && <span className="num">{fmtTime(g.elapsed)}</span>}
        </div>
        <svg ref={svgRef} className={'tg ' + g.layout} viewBox={`0 0 ${view.w} ${view.h}`} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp}
          role="group" aria-label={tt(set.tableLabel) + ' ' + t('Drag pieces to move them, tap to rotate. Pieces can also be focused and moved with the arrow keys, R rotates, F flips.', '拖动移动板块，点击旋转。也可以选中板块后用方向键移动，R旋转，F翻转。', 'Parçaları taşımak için sürükle, döndürmek için dokun. Parçalar odaklanıp ok tuşlarıyla da taşınabilir; R döndürür, F çevirir.')}>
          <rect x="0" y="0" width={view.w} height={view.h} className="tg-table" />
          {!free && <g className="tg-target">{target.map((p, k) => <polygon key={'t' + k} points={pts(p)} />)}</g>}
          {!free && (showAll || hintK >= 0) && target.map((p, k) => (showAll || k === hintK) && <polygon key={'h' + k} points={pts(p)} className="tg-hint" />)}
          {g.pieces.map((p, i) => (
            <polygon key={p.id} points={pts(polys[i])} className={`tg-piece c${i}${i === sel ? ' sel' : ''}`} tabIndex={0}
              onPointerDown={e => onDown(e, i)} onKeyDown={e => onKey(e, i)} onFocus={() => setSel(i)} aria-label={tt(set.pieceNames[i])} />
          ))}
        </svg>
      </div>
      <aside className="play-side">
        {g.done && (
          <div className="result" role="status">
            <h3>{g.assisted ? t('Completed with hints', '在提示下完成', 'İpuçlarıyla tamamlandı') : t('Completed', '完成', 'Tamamlandı')}</h3>
            <p className="num big">{fmtTime(g.elapsed)}</p>
            <p className="muted">{silName(g.target)}{g.assisted ? ' · ' + t('Hints were used, so this run is not recorded.', '用了提示，这次不计成绩。', 'İpucu kullanıldı; bu deneme kaydedilmedi.') : ''}</p>
            <button type="button" id={P + '-next'} className="btn primary" onClick={() => { const i = SIL.findIndex(s => s.id === g.target); start(SIL[(i + 1) % SIL.length].id); }}>{t('Next silhouette', '下一个剪影', 'Sonraki siluet')}</button>
          </div>
        )}
        <div className="tools">
          <button type="button" id={P + '-rotl'} className="btn" disabled={sel < 0 || g.done} onClick={() => rotate(sel, -1)} aria-label={t('Rotate left 45°', '向左旋转45°', '45° sola döndür')}>⟲ 45°</button>
          <button type="button" id={P + '-rotr'} className="btn" disabled={sel < 0 || g.done} onClick={() => rotate(sel, 1)} aria-label={t('Rotate right 45°', '向右旋转45°', '45° sağa döndür')}>⟳ 45°</button>
          <button type="button" id={P + '-flip'} className="btn" disabled={sel < 0 || g.done} onClick={() => flip(sel)}>{t('Flip', '翻转', 'Çevir')}</button>
          <button type="button" id={P + '-reset'} className="btn" onClick={reset}>{t('Clear table', '放回原处', 'Masayı temizle')}</button>
        </div>
        {!free && !g.done && (
          <div className="tools">
            <button type="button" id={P + '-hint'} className="btn" onClick={giveHint}>{t('Hint', '提示', 'İpucu')}</button>
            <button type="button" id={P + '-show'} className={'btn' + (showAll ? ' on' : '')} onClick={() => { setShowAll(v => !v); setG(s => ({ ...s, assisted: true })); }}>{showAll ? t('Hide solution', '隐藏答案', 'Çözümü gizle') : t('Show solution', '显示答案', 'Çözümü göster')}</button>
          </div>
        )}
        {hintK >= 0 && !showAll && !g.done && <p className="hint">{t('The outlined area is where one piece goes in a known solution.', '虚线框出的是已知解法中一块板的位置。', 'İşaretli alan, bilinen bir çözümde bir parçanın geldiği yerdir.')}</p>}
        <p className="muted small">{tt(set.help)}</p>
        <div className="setup">
          <h3>{t('Silhouettes', '剪影', 'Siluetler')}</h3>
          <div className="tg-pick" role="list">
            {SIL.map(s => {
              const b = bounds(s.polys), w = b.x1 - b.x0, h = b.y1 - b.y0, m = Math.max(w, h) * 0.12;
              return (
                <button key={s.id} type="button" role="listitem" id={P + '-s-' + s.id} className={'tg-thumb' + (s.id === g.target ? ' on' : '')} onClick={() => start(s.id)} title={tri(s, lang)}>
                  <svg viewBox={`${b.x0 - m} ${-b.y1 - m} ${w + 2 * m} ${h + 2 * m}`} aria-hidden="true">
                    {s.polys.map((p, k) => <polygon key={k} points={pts(p.map(([x, y]) => [x, -y] as Pt))} />)}
                  </svg>
                  <span>{tri(s, lang)}</span>
                </button>
              );
            })}
            <button type="button" role="listitem" id={P + '-free'} className={'tg-thumb free' + (free ? ' on' : '')} onClick={() => start(FREE)}>
              <svg viewBox={`${sb.x0 - 0.5} ${sb.y0 - 0.5} ${sb.x1 - sb.x0 + 1} ${sb.y1 - sb.y0 + 1}`} aria-hidden="true">{allStd.map((p, k) => <polygon key={k} points={pts(p)} />)}</svg>
              <span>{t('Free play', '自由拼', 'Serbest oyun')}</span>
            </button>
          </div>
        </div>
      </aside>
    </div>
  );
}
