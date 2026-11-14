import './futoshiki.css';
import { useEffect, useMemo, useState } from 'react';
import { useT } from '../../core/i18n';
import { sfx } from '../../core/sound';
import { loadJSON, saveJSON } from '../../core/storage';
import { getData, noteStarted, recordResult } from '../../core/store';
import { fmtTime, Seg } from '../../ui/bits';
import { generate, mistakes, solved, type FPuzzle } from './rules';

interface Saved { n: number; p: FPuzzle; grid: number[]; history: number[][]; elapsed: number; recorded: boolean; hints: number }
const make = (n: number): Saved => { const p = generate(n, Math.random); return { n, p, grid: p.givens.slice(), history: [], elapsed: 0, recorded: false, hints: 0 }; };

export default function Futoshiki() {
  const t = useT();
  const [g, setG] = useState<Saved>(() => loadJSON<Saved | null>('gp.futoshiki', null) ?? make(5));
  const [size, setSize] = useState(g.n);
  const [sel, setSel] = useState(() => g.p.givens.findIndex(v => !v));
  useEffect(() => { saveJSON('gp.futoshiki', g); }, [g]);
  const { n, p } = g, done = solved(p, g.grid), bad = useMemo(() => mistakes(p, g.grid), [p, g.grid]);
  useEffect(() => {
    if (done || !g.history.length) return;
    const id = setInterval(() => { if (!document.hidden) setG(x => ({ ...x, elapsed: x.elapsed + 1000 })); }, 1000);
    return () => clearInterval(id);
  }, [done, g.history.length > 0]); // eslint-disable-line
  const signAt = useMemo(() => { const m = new Map<string, boolean>(); p.signs.forEach(s => m.set(s.a + ':' + s.b, s.lt)); return m; }, [p]);
  const put = (v: number, hint = false) => {
    if (done || sel < 0 || p.givens[sel] || g.grid[sel] === v) return;
    if (!g.history.length) noteStarted('futoshiki');
    const grid = g.grid.slice(); grid[sel] = v; sfx(v ? 'peg' : 'click', 0.6);
    const hints = g.hints + (hint ? 1 : 0);
    let recorded = g.recorded;
    if (solved(p, grid) && !recorded) { recorded = true; setTimeout(() => sfx('win'), 200); if (!hints) recordResult(getData().activeId, 'futoshiki', { result: 'win', ms: g.elapsed, label: `${n}×${n}`, bestKey: `${n}×${n}` }); }
    setG({ ...g, grid, history: [...g.history, g.grid], recorded, hints });
  };
  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).closest('input, select, textarea')) return;
      const d = ({ ArrowUp: -n, ArrowDown: n, ArrowLeft: -1, ArrowRight: 1 } as Record<string, number>)[e.key];
      if (d) { e.preventDefault(); setSel(s => Math.max(0, Math.min(n * n - 1, s + d))); }
      else if (/^[1-9]$/.test(e.key) && +e.key <= n) put(+e.key);
      else if (e.key === 'Backspace' || e.key === 'Delete' || e.key === '0') put(0);
    };
    window.addEventListener('keydown', k); return () => window.removeEventListener('keydown', k);
  });
  const hint = () => {
    const i = g.grid.findIndex((v, j) => v !== p.solution[j]); if (i < 0) return;
    setSel(i);
    setG(x => { const grid = x.grid.slice(); grid[i] = p.solution[i]; return { ...x, grid, history: [...x.history, x.grid], hints: x.hints + 1, recorded: x.recorded || solved(p, grid) }; });
  };
  // Cells on even grid lines, signs between them.
  const items: JSX.Element[] = [];
  for (let r = 0; r < 2 * n - 1; r++) for (let c = 0; c < 2 * n - 1; c++) {
    const key = r + '-' + c;
    if (r % 2 === 0 && c % 2 === 0) {
      const i = (r / 2) * n + c / 2, v = g.grid[i], given = !!p.givens[i];
      items.push(<button key={key} type="button" role="gridcell" className={'fu-cell' + (given ? ' given' : '') + (i === sel ? ' sel' : '') + (bad.has(i) ? ' bad' : '')} onClick={() => setSel(i)} aria-label={`${r / 2 + 1}-${c / 2 + 1}: ${v || '·'}`}>{v || ''}</button>);
    } else if (r % 2 === 0) {
      const a = (r / 2) * n + (c - 1) / 2, lt = signAt.get(a + ':' + (a + 1));
      items.push(<span key={key} className="fu-sign" aria-hidden="true">{lt === undefined ? '' : lt ? '<' : '>'}</span>);
    } else if (c % 2 === 0) {
      const a = ((r - 1) / 2) * n + c / 2, lt = signAt.get(a + ':' + (a + n));
      items.push(<span key={key} className="fu-sign v" aria-hidden="true">{lt === undefined ? '' : lt ? '∧' : '∨'}</span>);
    } else items.push(<span key={key} />);
  }
  return (
    <div className="play">
      <div className="play-main">
        <div className="statline"><span role="status" aria-live="polite">{done ? (g.hints ? t('Solved with hints.', '在提示下完成。', 'İpuçlarıyla çözüldü.') : t('Solved!', '完成！', 'Çözüldü!')) : t(`Each row and column holds 1–${n} once; obey every sign.`, `每行每列1到${n}各一次；遵守所有不等号。`, `Her satır ve sütunda 1–${n} birer kez; bütün işaretlere uy.`)}</span><span className="num">{fmtTime(g.elapsed)}</span></div>
        <div className="fu-grid" style={{ ['--n' as string]: n }} role="grid" aria-label="Futoshiki">{items}</div>
        <div className="kk-pad fu-pad">
          {Array.from({ length: n }, (_, k) => <button key={k} type="button" id={'fu-n' + (k + 1)} className="btn" disabled={done} onClick={() => put(k + 1)}>{k + 1}</button>)}
          <button type="button" className="btn" disabled={done} onClick={() => put(0)} aria-label={t('Erase', '擦除', 'Sil')}>⌫</button>
        </div>
      </div>
      <aside className="play-side">
        <p className="muted small">{t('“<” and “>” compare the two squares they sit between: the small end points at the smaller number. ∧ and ∨ do the same up and down.', '“<”和“>”比较两侧的格子：尖的一头指向较小的数。∧和∨表示上下比较。', '“<” ve “>” arasında durdukları iki kareyi karşılaştırır: sivri uç küçük sayıyı gösterir. ∧ ve ∨ aynısını yukarı-aşağı yapar.')}</p>
        <div className="tools">
          <button type="button" id="fu-undo" className="btn" disabled={!g.history.length || done} onClick={() => setG({ ...g, grid: g.history[g.history.length - 1], history: g.history.slice(0, -1) })}>{t('Undo', '撤销', 'Geri al')}</button>
          <button type="button" id="fu-hint" className="btn" disabled={done} onClick={hint}>{t('Hint', '提示', 'İpucu')}</button>
        </div>
        <div className="setup">
          <Seg id="fu-size" label={t('Size', '大小', 'Boyut')} value={size} onChange={setSize} options={[4, 5, 6].map(k => ({ value: k, label: `${k}×${k}` }))} />
          <button type="button" id={done ? 'fu-again' : 'fu-new'} className="btn primary" onClick={() => { const s = make(size); setG(s); setSel(s.p.givens.findIndex(v => !v)); }}>{t('New puzzle', '新谜题', 'Yeni bulmaca')}</button>
        </div>
      </aside>
    </div>
  );
}
