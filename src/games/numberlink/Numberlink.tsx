import './numberlink.css';
import { useEffect, useRef, useState, type PointerEvent as PE } from 'react';
import { useT } from '../../core/i18n';
import { sfx } from '../../core/sound';
import { loadJSON, saveJSON } from '../../core/storage';
import { getData, noteStarted, recordResult } from '../../core/store';
import { fmtTime, Seg } from '../../ui/bits';
import { adjacent, connected, generate, solved, type Lines, type NPuzzle } from './rules';

const COLOURS = ['#c0392b', '#2471a3', '#229954', '#d68910', '#7d3c98', '#17a589', '#cb4335', '#a04000', '#2e4053', '#c71585', '#7f8c3a', '#5b2c6f'];
interface Saved { n: number; p: NPuzzle; lines: Lines; history: Lines[]; elapsed: number; recorded: boolean; hints: number }
const empty = (p: NPuzzle): Lines => Array.from({ length: Math.max(...p.ends) }, () => []);
const make = (n: number): Saved => { const p = generate(n, Math.random); return { n, p, lines: empty(p), history: [], elapsed: 0, recorded: false, hints: 0 }; };

export default function Numberlink() {
  const t = useT();
  const [g, setG] = useState<Saved>(() => loadJSON<Saved | null>('gp.numberlink', null) ?? make(5));
  const [size, setSize] = useState(g.n);
  const drag = useRef<{ k: number; before: Lines } | null>(null);
  useEffect(() => { saveJSON('gp.numberlink', g); }, [g]);
  const { p } = g, n = p.n, done = solved(p, g.lines), joined = connected(p, g.lines);
  useEffect(() => {
    if (done || !g.history.length) return;
    const id = setInterval(() => { if (!document.hidden) setG(x => ({ ...x, elapsed: x.elapsed + 1000 })); }, 1000);
    return () => clearInterval(id);
  }, [done, g.history.length > 0]); // eslint-disable-line
  const owner = new Array(n * n).fill(-1);
  g.lines.forEach((l, k) => l.forEach(i => { owner[i] = k; }));
  const filled = owner.filter(o => o >= 0).length;

  /** Commits a drawing (or the lines as they now stand, when `lines` is null) as one undo step. */
  const finish = (lines: Lines | null, before: Lines, hint = false) => setG(x => {
    const ls = lines ?? x.lines;
    if (ls === before) return x;
    if (!x.history.length) noteStarted('numberlink');
    const hints = x.hints + (hint ? 1 : 0);
    let recorded = x.recorded;
    if (solved(p, ls) && !recorded) { recorded = true; setTimeout(() => sfx('win'), 200); if (!hints) recordResult(getData().activeId, 'numberlink', { result: 'win', ms: x.elapsed, label: `${n}×${n}`, bestKey: `${n}×${n}` }); }
    return { ...x, lines: ls, history: [...x.history, before], recorded, hints };
  });
  const cellAt = (e: PE) => { const el = document.elementFromPoint(e.clientX, e.clientY)?.closest<HTMLElement>('[data-i]'); return el ? Number(el.dataset.i) : -1; };
  const down = (e: PE) => {
    if (done) return;
    const i = cellAt(e); if (i < 0) return;
    const k = p.ends[i] ? p.ends[i] - 1 : owner[i];
    if (k < 0) return;
    const lines = g.lines.map(l => l.slice());
    if (p.ends[i]) lines[k] = [i];
    else lines[k] = lines[k].slice(0, lines[k].indexOf(i) + 1);
    drag.current = { k, before: g.lines };
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    setG(x => ({ ...x, lines }));
  };
  const moveTo = (e: PE) => {
    const d = drag.current; if (!d) return;
    const j = cellAt(e); if (j < 0) return;
    setG(x => {
      const line = x.lines[d.k]; const last = line[line.length - 1];
      if (j === last || !adjacent(n, last, j)) return x;
      const lines = x.lines.map(l => l.slice());
      const at = line.indexOf(j);
      if (at >= 0) { lines[d.k] = line.slice(0, at + 1); return { ...x, lines }; }
      // Already joined: only backing up is allowed.
      if (line.length > 1 && p.ends[last] === d.k + 1) return x;
      if (p.ends[j] && p.ends[j] !== d.k + 1) return x;
      // Cut through another pair's line.
      lines.forEach((l, k) => { if (k !== d.k) { const c = l.indexOf(j); if (c >= 0) lines[k] = l.slice(0, c); } });
      lines[d.k] = [...line, j];
      sfx(p.ends[j] === d.k + 1 ? 'peg' : 'click', p.ends[j] ? 0.7 : 0.15);
      return { ...x, lines };
    });
  };
  const up = () => { const d = drag.current; if (!d) return; drag.current = null; finish(null, d.before); };
  const hint = () => {
    // Draw the first pair that is not already drawn exactly as in the solution.
    const k = p.paths.findIndex((path, kk) => { const l = g.lines[kk] ?? []; return l.join() !== path.join() && l.join() !== path.slice().reverse().join(); });
    if (k < 0) return;
    const lines = g.lines.map(l => l.slice());
    lines.forEach((l, kk) => { if (kk !== k) lines[kk] = l.filter(i => !p.paths[k].includes(i)); });
    lines[k] = p.paths[k].slice();
    finish(lines, g.lines, true);
  };
  const C = 100 / n, ctr = (i: number) => [(i % n + 0.5) * C, (Math.floor(i / n) + 0.5) * C];
  return (
    <div className="play">
      <div className="play-main">
        <div className="statline"><span role="status" aria-live="polite">{done ? (g.hints ? t('Solved with hints.', '在提示下完成。', 'İpuçlarıyla çözüldü.') : t('Solved: every pair joined, every square used!', '完成：每对都连上了，每格都用上了！', 'Çözüldü: her çift bağlandı, her kare kullanıldı!')) : t('Join each pair of numbers. Lines may not cross, and together they must fill the grid.', '把相同的数字连起来。线不能交叉，而且要铺满整个方格。', 'Her sayı çiftini birleştir. Çizgiler kesişmez ve hep birlikte ızgarayı doldurmalı.')}</span><span className="num">{fmtTime(g.elapsed)}</span></div>
        <div className="nl-board" style={{ ['--n' as string]: n }} onPointerDown={down} onPointerMove={moveTo} onPointerUp={up} onPointerCancel={up} role="grid" aria-label="Numberlink">
          {owner.map((o, i) => (
            <div key={i} data-i={i} role="gridcell" className="nl-cell" style={o >= 0 ? { background: `color-mix(in srgb, ${COLOURS[o % COLOURS.length]} 18%, var(--surface))` } : undefined} aria-label={p.ends[i] ? String(p.ends[i]) : undefined} />
          ))}
          <svg className="nl-lines" viewBox="0 0 100 100" aria-hidden="true">
            {g.lines.map((l, k) => l.length > 1 && <polyline key={k} points={l.map(i => ctr(i).join(',')).join(' ')} stroke={COLOURS[k % COLOURS.length]} className={joined[k] ? 'joined' : ''} />)}
            {p.ends.map((v, i) => v ? <g key={i}><circle cx={ctr(i)[0]} cy={ctr(i)[1]} r={C * 0.34} fill={COLOURS[(v - 1) % COLOURS.length]} /><text x={ctr(i)[0]} y={ctr(i)[1]} textAnchor="middle" dominantBaseline="central" style={{ fontSize: C * 0.4 }}>{v}</text></g> : null)}
          </svg>
        </div>
        <p className="muted small">{t('Drag from a number to draw its line; drag back to shorten it. Starting on a number again redraws its line.', '从数字开始拖动画线，往回拖可以缩短；从数字重新开始会重画这条线。', 'Bir sayıdan sürükleyerek çizgisini çiz; geri sürükleyince kısalır. Sayıdan yeniden başlarsan çizgi baştan çizilir.')}</p>
      </div>
      <aside className="play-side">
        <dl className="facts">
          <div><dt>{t('Pairs joined', '已连对数', 'Bağlanan çift')}</dt><dd className="num">{joined.filter(Boolean).length}/{joined.length}</dd></div>
          <div><dt>{t('Squares used', '已用格数', 'Kullanılan kare')}</dt><dd className="num">{filled}/{n * n}</dd></div>
        </dl>
        <div className="tools">
          <button type="button" id="nl-undo" className="btn" disabled={!g.history.length || done} onClick={() => setG({ ...g, lines: g.history[g.history.length - 1], history: g.history.slice(0, -1) })}>{t('Undo', '撤销', 'Geri al')}</button>
          <button type="button" id="nl-hint" className="btn" disabled={done} onClick={hint}>{t('Hint', '提示', 'İpucu')}</button>
        </div>
        <div className="setup">
          <Seg id="nl-size" label={t('Size', '大小', 'Boyut')} value={size} onChange={setSize} options={[5, 6, 7, 8].map(k => ({ value: k, label: `${k}×${k}` }))} />
          <button type="button" id={done ? 'nl-again' : 'nl-new'} className="btn primary" onClick={() => setG(make(size))}>{t('New puzzle', '新谜题', 'Yeni bulmaca')}</button>
        </div>
      </aside>
    </div>
  );
}
