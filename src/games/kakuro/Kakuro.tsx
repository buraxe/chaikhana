import './kakuro.css';
import { useEffect, useMemo, useState } from 'react';
import { useT } from '../../core/i18n';
import { sfx } from '../../core/sound';
import { loadJSON, saveJSON } from '../../core/storage';
import { getData, noteStarted, recordResult } from '../../core/store';
import { fmtTime, Seg } from '../../ui/bits';
import { generate, mistakes, solved, type KPuzzle } from './rules';

interface Saved { size: number; p: KPuzzle; grid: number[]; history: number[][]; elapsed: number; recorded: boolean; hints: number }
const make = (size: number): Saved => { const p = generate(size, Math.random); return { size, p, grid: new Array(p.w * p.h).fill(0), history: [], elapsed: 0, recorded: false, hints: 0 }; };
const label = (s: number) => `${s - 1}×${s - 1}`;

export default function Kakuro() {
  const t = useT();
  const [g, setG] = useState<Saved>(() => loadJSON<Saved | null>('gp.kakuro', null) ?? make(5));
  const [size, setSize] = useState(g.size);
  const [busy, setBusy] = useState(false);
  const [sel, setSel] = useState(() => g.p.cells.findIndex(c => !c.black));
  useEffect(() => { saveJSON('gp.kakuro', g); }, [g]);
  const { p } = g, w = p.w, done = solved(p, g.grid), bad = useMemo(() => mistakes(p, g.grid), [p, g.grid]);
  useEffect(() => {
    if (done || !g.history.length) return;
    const id = setInterval(() => { if (!document.hidden) setG(x => ({ ...x, elapsed: x.elapsed + 1000 })); }, 1000);
    return () => clearInterval(id);
  }, [done, g.history.length > 0]); // eslint-disable-line
  const put = (v: number, at = sel, hint = false) => {
    if (done || at < 0 || p.cells[at].black || g.grid[at] === v) return;
    if (!g.history.length) noteStarted('kakuro');
    const grid = g.grid.slice(); grid[at] = v; sfx(v ? 'peg' : 'click', 0.6);
    const hints = g.hints + (hint ? 1 : 0);
    let recorded = g.recorded;
    if (solved(p, grid) && !recorded) { recorded = true; setTimeout(() => sfx('win'), 200); if (!hints) recordResult(getData().activeId, 'kakuro', { result: 'win', ms: g.elapsed, label: label(g.size), bestKey: label(g.size) }); }
    setG({ ...g, grid, history: [...g.history, g.grid], recorded, hints });
  };
  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).closest('input, select, textarea')) return;
      const d = ({ ArrowUp: -w, ArrowDown: w, ArrowLeft: -1, ArrowRight: 1 } as Record<string, number>)[e.key];
      if (d) {
        e.preventDefault();
        setSel(s => { let j = s + d; while (j >= 0 && j < p.cells.length && p.cells[j].black) j += d; return j >= 0 && j < p.cells.length ? j : s; });
      } else if (/^[1-9]$/.test(e.key)) put(+e.key);
      else if (e.key === 'Backspace' || e.key === 'Delete' || e.key === '0') put(0);
    };
    window.addEventListener('keydown', k); return () => window.removeEventListener('keydown', k);
  });
  const fresh = () => { setBusy(true); setTimeout(() => { const s = make(size); setG(s); setSel(s.p.cells.findIndex(c => !c.black)); setBusy(false); }, 30); };
  const hint = () => { const i = g.grid.findIndex((v, j) => !p.cells[j].black && v !== p.solution[j]); if (i >= 0) { setSel(i); put(p.solution[i], i, true); } };
  // The runs through the selected cell, to show their sums.
  const runs = p.runs.filter(r => r.cells.includes(sel));
  return (
    <div className="play">
      <div className="play-main">
        <div className="statline"><span role="status" aria-live="polite">{busy ? t('Setting a new puzzle…', '正在出题…', 'Yeni bulmaca hazırlanıyor…') : done ? (g.hints ? t('Solved with hints.', '在提示下完成。', 'İpuçlarıyla çözüldü.') : t('Solved!', '完成！', 'Çözüldü!')) : t('Each run adds up to its clue, with no digit twice.', '每一段的数字之和等于提示，且不能重复。', 'Her dizi ipucundaki toplamı verir, hiçbir rakam iki kez yazılmaz.')}</span><span className="num">{fmtTime(g.elapsed)}</span></div>
        <div className="ka-grid" style={{ ['--w' as string]: w }} role="grid" aria-label="Kakuro">
          {p.cells.map((c, i) => c.black ? (
            <div key={i} className={'ka-black' + (c.right || c.down ? ' clue' : '')} aria-hidden={!c.right && !c.down}>
              {(c.right || c.down) && <svg viewBox="0 0 10 10" preserveAspectRatio="none" aria-hidden="true"><path d="M0 0L10 10" /></svg>}
              {c.right ? <span className="ka-r">{c.right}</span> : null}
              {c.down ? <span className="ka-d">{c.down}</span> : null}
            </div>
          ) : (
            <button key={i} type="button" role="gridcell" className={'ka-cell' + (i === sel ? ' sel' : '') + (runs.some(r => r.cells.includes(i)) ? ' run' : '') + (bad.has(i) ? ' bad' : '')} onClick={() => setSel(i)} aria-label={`${Math.floor(i / w)}-${i % w}: ${g.grid[i] || '·'}`}>{g.grid[i] || ''}</button>
          ))}
        </div>
        <div className="ka-pad">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(d => <button key={d} type="button" id={'ka-n' + d} className="btn" disabled={done || busy} onClick={() => put(d)}>{d}</button>)}
          <button type="button" className="btn" disabled={done || busy} onClick={() => put(0)} aria-label={t('Erase', '擦除', 'Sil')}>⌫</button>
        </div>
      </div>
      <aside className="play-side">
        {runs.length > 0 && <dl className="facts">{runs.map((r, k) => { const s = r.cells.reduce((a, i) => a + g.grid[i], 0); return <div key={k}><dt>{r.cells[1] === r.cells[0] + 1 ? t('Across', '横', 'Yatay') : t('Down', '竖', 'Dikey')} · {r.cells.length}</dt><dd className="num">{s}/{r.sum}</dd></div>; })}</dl>}
        <p className="muted small">{t('A clue above the diagonal belongs to the run to its right; below it, to the run going down. Some sums allow only one set of digits: 3 in two squares is always 1 and 2.', '斜线上方的数字属于右边的一段，下方的属于向下的一段。有些和只有一种组合：两格的3一定是1和2。', 'Çaprazın üstündeki ipucu sağındaki diziye, altındaki aşağı inen diziye aittir. Bazı toplamların tek bir rakam takımı vardır: iki karede 3 her zaman 1 ve 2’dir.')}</p>
        <div className="tools">
          <button type="button" id="ka-undo" className="btn" disabled={!g.history.length || done} onClick={() => setG({ ...g, grid: g.history[g.history.length - 1], history: g.history.slice(0, -1) })}>{t('Undo', '撤销', 'Geri al')}</button>
          <button type="button" id="ka-hint" className="btn" disabled={done} onClick={hint}>{t('Hint', '提示', 'İpucu')}</button>
        </div>
        <div className="setup">
          <Seg id="ka-size" label={t('Size', '大小', 'Boyut')} value={size} onChange={setSize} options={[5, 6, 7].map(k => ({ value: k, label: label(k) }))} />
          <button type="button" id={done ? 'ka-again' : 'ka-new'} className="btn primary" disabled={busy} onClick={fresh}>{t('New puzzle', '新谜题', 'Yeni bulmaca')}</button>
        </div>
      </aside>
    </div>
  );
}
