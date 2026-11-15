import './untangle.css';
import { useEffect, useRef, useState } from 'react';
import { useT } from '../../core/i18n';
import { sfx } from '../../core/sound';
import { loadJSON, saveJSON } from '../../core/storage';
import { getData, noteStarted, recordResult } from '../../core/store';
import { fmtTime, Seg } from '../../ui/bits';
import { crossings, generate, type Pt, type UPuzzle } from './rules';

interface Saved { p: UPuzzle; pts: Pt[]; moves: number; elapsed: number; solved: boolean; recorded: boolean }
const make = (lines: number): Saved => { const p = generate(lines); return { p, pts: p.pts, moves: 0, elapsed: 0, solved: false, recorded: false }; };
const SIZES = [{ lines: 4, dots: 6 }, { lines: 5, dots: 10 }, { lines: 6, dots: 15 }, { lines: 7, dots: 21 }, { lines: 8, dots: 28 }];

export default function Untangle() {
  const t = useT();
  const [g, setG] = useState<Saved>(() => loadJSON<Saved | null>('gp.untangle', null) ?? make(5));
  const [lines, setLines] = useState(g.p.lines);
  const [drag, setDrag] = useState(-1);
  const svg = useRef<SVGSVGElement>(null);
  const bad = crossings(g.pts, g.p.edges);
  useEffect(() => { saveJSON('gp.untangle', g); }, [g]);
  useEffect(() => {
    if (g.solved || !g.moves) return;
    const id = setInterval(() => { if (!document.hidden) setG(x => ({ ...x, elapsed: x.elapsed + 1000 })); }, 1000);
    return () => clearInterval(id);
  }, [g.solved, g.moves > 0]); // eslint-disable-line

  const toBoard = (e: React.PointerEvent): Pt => {
    const m = svg.current!.getScreenCTM()!.inverse(), p = new DOMPoint(e.clientX, e.clientY).matrixTransform(m);
    return { x: Math.min(0.98, Math.max(0.02, p.x)), y: Math.min(0.98, Math.max(0.02, p.y)) };
  };
  const down = (e: React.PointerEvent, i: number) => { if (g.solved) return; (e.currentTarget as Element).setPointerCapture?.(e.pointerId); setDrag(i); sfx('click', 0.25); };
  const move = (e: React.PointerEvent) => { if (drag < 0) return; const p = toBoard(e); setG(s => ({ ...s, pts: s.pts.map((q, k) => (k === drag ? p : q)) })); };
  const up = () => {
    if (drag < 0) return;
    setDrag(-1);
    setG(s => {
      if (!s.moves) noteStarted('untangle');
      const next = { ...s, moves: s.moves + 1 };
      if (!s.solved && crossings(s.pts, s.p.edges).size === 0) {
        next.solved = true; setTimeout(() => sfx('win'), 100);
        if (!s.recorded) { next.recorded = true; recordResult(getData().activeId, 'untangle', { result: 'win', ms: s.elapsed, label: `${s.p.pts.length} dots · ${next.moves} moves`, bestKey: `${s.p.pts.length} dots` }); }
      }
      return next;
    });
  };
  return (
    <div className="play">
      <div className="play-main">
        <div className="statline"><span role="status" aria-live="polite">{g.solved ? t(`Untangled in ${g.moves} move${g.moves === 1 ? '' : 's'}!`, `用${g.moves}步解开了！`, `${g.moves} hamlede çözüldü!`) : t(`${bad.size} threads still cross. Drag the dots until none do.`, `还有${bad.size}条线交叉。拖动圆点，直到没有交叉。`, `${bad.size} çizgi hâlâ kesişiyor. Hiçbiri kesişmeyene kadar noktaları sürükle.`)}</span><span className="num">{g.moves} · {fmtTime(g.elapsed)}</span></div>
        <svg ref={svg} className={'un-board' + (g.solved ? ' done' : '')} viewBox="0 0 1 1" onPointerMove={move} onPointerUp={up} onPointerCancel={up} role="group" aria-label={t('Tangled threads', '缠绕的线', 'Dolaşık çizgiler')}>
          <rect className="un-bg" x={0} y={0} width={1} height={1} rx={0.02} />
          {g.p.edges.map(([a, b], i) => <line key={i} className={'un-edge' + (bad.has(i) ? ' bad' : '') + (a === drag || b === drag ? ' hot' : '')} x1={g.pts[a].x} y1={g.pts[a].y} x2={g.pts[b].x} y2={g.pts[b].y} />)}
          {g.pts.map((p, i) => <g key={i} onPointerDown={e => down(e, i)}><circle className="un-hit" cx={p.x} cy={p.y} r={0.05} /><circle className={'un-dot' + (i === drag ? ' drag' : '')} cx={p.x} cy={p.y} r={0.024} /></g>)}
        </svg>
      </div>
      <aside className="play-side">
        {g.solved && <div className="result" role="status"><h3>{t('Untangled', '解开了', 'Çözüldü')}</h3><p className="num big">{fmtTime(g.elapsed)}</p><p className="muted">{t(`${g.moves} move${g.moves === 1 ? '' : 's'}`, `${g.moves}步`, `${g.moves} hamle`)}</p></div>}
        <p className="muted small">{t('Threads that cross are drawn in red. Move dots to the outside first, then bring them in one by one. A dot with many threads usually belongs in the middle.', '交叉的线显示为红色。先把圆点移到外围，再一个个拉进来。连线多的圆点通常应该放在中间。', 'Kesişen çizgiler kırmızı görünür. Önce noktaları kenara taşı, sonra tek tek içeri al. Çok çizgisi olan bir nokta genellikle ortaya aittir.')}</p>
        <div className="setup">
          <Seg id="un-size" label={t('Dots', '圆点数', 'Nokta sayısı')} value={lines} onChange={setLines} options={SIZES.map(s => ({ value: s.lines, label: String(s.dots) }))} />
          <button type="button" id={g.solved ? 'un-again' : 'un-new'} className="btn primary" onClick={() => setG(make(lines))}>{t('New tangle', '新线团', 'Yeni yumak')}</button>
        </div>
      </aside>
    </div>
  );
}
