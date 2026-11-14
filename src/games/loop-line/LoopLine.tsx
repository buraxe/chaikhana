import './slitherlink.css';
import { useEffect, useMemo, useState } from 'react';
import { useT } from '../../core/i18n';
import { sfx } from '../../core/sound';
import { loadJSON, saveJSON } from '../../core/storage';
import { getData, noteStarted, recordResult } from '../../core/store';
import { fmtTime, Seg } from '../../ui/bits';
import { badClues, edgeCount, edgeDots, generate, solved, type SPuzzle } from './rules';

/** Edge marks: 0 unknown, 1 line, 2 cross. */
interface Saved { n: number; p: SPuzzle; lines: number[]; history: number[][]; elapsed: number; recorded: boolean; hints: number }
const make = (n: number): Saved => { const p = generate(n, n, Math.random); return { n, p, lines: new Array(edgeCount(n, n)).fill(0), history: [], elapsed: 0, recorded: false, hints: 0 }; };
const U = 40, PAD = 14;

export default function Slitherlink() {
  const t = useT();
  const [g, setG] = useState<Saved>(() => loadJSON<Saved | null>('gp.slither', null) ?? make(5));
  const [size, setSize] = useState(g.n);
  const [busy, setBusy] = useState(false);
  useEffect(() => { saveJSON('gp.slither', g); }, [g]);
  const { p } = g, w = p.w, h = p.h, done = solved(p, g.lines), bad = useMemo(() => badClues(p, g.lines), [p, g.lines]);
  useEffect(() => {
    if (done || !g.history.length) return;
    const id = setInterval(() => { if (!document.hidden) setG(x => ({ ...x, elapsed: x.elapsed + 1000 })); }, 1000);
    return () => clearInterval(id);
  }, [done, g.history.length > 0]); // eslint-disable-line
  const mark = (e: number, v: number, hint = false) => {
    if (done || g.lines[e] === v) return;
    if (!g.history.length) noteStarted('loop-line');
    const lines = g.lines.slice(); lines[e] = v; sfx(v === 1 ? 'peg' : 'click', 0.4);
    const hints = g.hints + (hint ? 1 : 0);
    let recorded = g.recorded;
    if (solved(p, lines) && !recorded) { recorded = true; setTimeout(() => sfx('win'), 200); if (!hints) recordResult(getData().activeId, 'loop-line', { result: 'win', ms: g.elapsed, label: `${w}×${h}`, bestKey: `${w}×${h}` }); }
    setG({ ...g, lines, history: [...g.history, g.lines], recorded, hints });
  };
  const hint = () => {
    const e = g.lines.findIndex((v, k) => (v === 1) !== (p.solution[k] === 1) && !(v === 0 && p.solution[k] === 0));
    if (e >= 0) mark(e, p.solution[e] === 1 ? 1 : 2, true);
  };
  const fresh = () => { setBusy(true); setTimeout(() => { setG(make(size)); setBusy(false); }, 30); };
  const dot = (d: number) => [PAD + (d % (w + 1)) * U, PAD + Math.floor(d / (w + 1)) * U];
  const W = w * U + 2 * PAD, H = h * U + 2 * PAD;
  return (
    <div className="play">
      <div className="play-main">
        <div className="statline"><span role="status" aria-live="polite">{busy ? t('Drawing a new loop…', '正在出题…', 'Yeni döngü hazırlanıyor…') : done ? (g.hints ? t('Solved with hints.', '在提示下完成。', 'İpuçlarıyla çözüldü.') : t('Solved: one closed loop!', '完成：一条闭合的回路！', 'Çözüldü: tek bir kapalı döngü!')) : t('Draw one closed loop. Each number counts its square’s sides on the loop.', '画一条闭合回路。数字表示该格有几条边在回路上。', 'Tek bir kapalı döngü çiz. Her sayı, karesinin kaç kenarının döngüde olduğunu söyler.')}</span><span className="num">{fmtTime(g.elapsed)}</span></div>
        <svg className={'sl-board' + (done ? ' done' : '')} viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Loop line">
          {p.clues.map((c, i) => c >= 0 && <text key={'c' + i} x={PAD + (i % w + 0.5) * U} y={PAD + (Math.floor(i / w) + 0.5) * U} className={'sl-clue' + (bad.has(i) ? ' bad' : '')} textAnchor="middle" dominantBaseline="central">{c}</text>)}
          {g.lines.map((v, e) => {
            const [a, b] = edgeDots(w, h, e), [x1, y1] = dot(a), [x2, y2] = dot(b), mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
            return (
              <g key={e} className="sl-edge" onClick={() => mark(e, v === 1 ? 2 : v === 2 ? 0 : 1)} onContextMenu={ev => { ev.preventDefault(); mark(e, v === 2 ? 0 : 2); }}>
                <line x1={x1} y1={y1} x2={x2} y2={y2} className="sl-hit" />
                {v === 1 && <line x1={x1} y1={y1} x2={x2} y2={y2} className="sl-line" />}
                {v === 2 && <path d={`M${mx - 4} ${my - 4}l8 8M${mx + 4} ${my - 4}l-8 8`} className="sl-x" />}
              </g>
            );
          })}
          {Array.from({ length: (w + 1) * (h + 1) }, (_, d) => { const [x, y] = dot(d); return <circle key={'d' + d} cx={x} cy={y} r={3} className="sl-dot" />; })}
        </svg>
        <p className="muted small">{t('Tap a side to draw a line, again for a cross (sure it is empty), again to clear. Right-click marks a cross.', '点一条边画线，再点一次标“×”（确定不是），再点清除。右键直接标“×”。', 'Bir kenara dokununca çizgi, tekrar dokununca çarpı (kesin boş), bir daha dokununca temizlenir. Sağ tık doğrudan çarpı koyar.')}</p>
      </div>
      <aside className="play-side">
        <div className="tools">
          <button type="button" id="sl-undo" className="btn" disabled={!g.history.length || done} onClick={() => setG({ ...g, lines: g.history[g.history.length - 1], history: g.history.slice(0, -1) })}>{t('Undo', '撤销', 'Geri al')}</button>
          <button type="button" id="sl-hint" className="btn" disabled={done} onClick={hint}>{t('Hint', '提示', 'İpucu')}</button>
        </div>
        <div className="setup">
          <Seg id="sl-size" label={t('Size', '大小', 'Boyut')} value={size} onChange={setSize} options={[5, 7, 10].map(k => ({ value: k, label: `${k}×${k}` }))} />
          <button type="button" id={done ? 'sl-again' : 'sl-new'} className="btn primary" disabled={busy} onClick={fresh}>{t('New puzzle', '新谜题', 'Yeni bulmaca')}</button>
        </div>
      </aside>
    </div>
  );
}
