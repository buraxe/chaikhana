import './kenken.css';
import { useEffect, useMemo, useState } from 'react';
import { useT } from '../../core/i18n';
import { sfx } from '../../core/sound';
import { loadJSON, saveJSON } from '../../core/storage';
import { getData, noteStarted, recordResult } from '../../core/store';
import { fmtTime, Seg } from '../../ui/bits';
import { cageOk, clashes, generate, solved, type KPuzzle } from './rules';

interface Saved { n: number; p: KPuzzle; grid: number[]; history: number[][]; elapsed: number; recorded: boolean; hints: number }
const make = (n: number): Saved => { const p = generate(n, Math.random); return { n, p, grid: new Array(n * n).fill(0), history: [], elapsed: 0, recorded: false, hints: 0 }; };

export default function KenKen() {
  const t = useT();
  const [g, setG] = useState<Saved>(() => loadJSON<Saved | null>('gp.kenken', null) ?? make(4));
  const [size, setSize] = useState(g.n);
  const [sel, setSel] = useState(0);
  useEffect(() => { saveJSON('gp.kenken', g); }, [g]);
  const { n, p } = g, done = solved(p, g.grid), bad = clashes(n, g.grid);
  const owner = useMemo(() => { const o = new Array(n * n).fill(0); p.cages.forEach((c, k) => c.cells.forEach(i => { o[i] = k; })); return o; }, [p, n]);
  const label = useMemo(() => { const m = new Map<number, string>(); for (const c of p.cages) m.set(Math.min(...c.cells), `${c.target}${c.op}`); return m; }, [p]);
  useEffect(() => {
    if (done || !g.history.length) return;
    const id = setInterval(() => { if (!document.hidden) setG(x => ({ ...x, elapsed: x.elapsed + 1000 })); }, 1000);
    return () => clearInterval(id);
  }, [done, g.history.length > 0]); // eslint-disable-line
  const put = (v: number, hint = false) => {
    if (done || g.grid[sel] === v) return;
    if (!g.history.length) noteStarted('kenken');
    const grid = g.grid.slice(); grid[sel] = v; sfx(v ? 'peg' : 'click', 0.6);
    let recorded = g.recorded;
    const hints = g.hints + (hint ? 1 : 0);
    if (solved(p, grid) && !recorded) { recorded = true; setTimeout(() => sfx('win'), 200); if (!hints) recordResult(getData().activeId, 'kenken', { result: 'win', ms: g.elapsed, label: `${n}×${n}`, bestKey: `${n}×${n}` }); }
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
  const edge = (i: number, d: number) => { const j = i + d; if (d === 1 && i % n === n - 1) return true; if (d === -1 && i % n === 0) return true; if (j < 0 || j >= n * n) return true; return owner[j] !== owner[i]; };
  const hint = () => { const wrong = g.grid.findIndex((v, i) => v !== p.solution[i]); if (wrong < 0) return; setSel(wrong); setTimeout(() => setG(x => { const grid = x.grid.slice(); grid[wrong] = p.solution[wrong]; return { ...x, grid, history: [...x.history, x.grid], hints: x.hints + 1, recorded: solved(p, grid) || x.recorded }; }), 0); };
  return (
    <div className="play">
      <div className="play-main">
        <div className="statline"><span role="status" aria-live="polite">{done ? (g.hints ? t('Solved with hints.', '在提示下完成。', 'İpuçlarıyla çözüldü.') : t('Solved!', '完成！', 'Çözüldü!')) : t(`Each row and column holds 1–${n} once; each cage makes its target.`, `每行每列1到${n}各一次；每个笼子要算出目标数。`, `Her satır ve sütunda 1–${n} birer kez; her kafes hedef sayısını tutturmalı.`)}</span><span className="num">{fmtTime(g.elapsed)}</span></div>
        <div className="kk-grid" style={{ ['--n' as string]: n }} role="grid" aria-label="KenKen">
          {g.grid.map((v, i) => {
            const c = p.cages[owner[i]], ok = cageOk(c, g.grid);
            return (
              <button key={i} type="button" role="gridcell" className={'kk-cell' + (i === sel ? ' sel' : '') + (bad.has(i) ? ' bad' : '') + (ok === false ? ' cagebad' : ok ? ' cageok' : '')}
                style={{ borderTopWidth: edge(i, -n) ? 3 : 1, borderLeftWidth: edge(i, -1) ? 3 : 1, borderRightWidth: edge(i, 1) ? 3 : 1, borderBottomWidth: edge(i, n) ? 3 : 1 }}
                onClick={() => setSel(i)} aria-label={`${Math.floor(i / n) + 1}-${(i % n) + 1}: ${v || '·'}`}>
                {label.has(i) && <span className="kk-lab">{label.get(i)}</span>}
                <span className="kk-v">{v || ''}</span>
              </button>
            );
          })}
        </div>
        <div className="kk-pad">
          {Array.from({ length: n }, (_, k) => <button key={k} type="button" id={'kk-n' + (k + 1)} className="btn" disabled={done} onClick={() => put(k + 1)}>{k + 1}</button>)}
          <button type="button" className="btn" disabled={done} onClick={() => put(0)} aria-label={t('Erase', '擦除', 'Sil')}>⌫</button>
        </div>
      </div>
      <aside className="play-side">
        <p className="muted small">{t('“+” cages add up to the target, “×” multiply to it; “−” and “÷” cages have two cells whose difference or quotient is the target. A single-cell cage is simply given.', '“+”笼子相加等于目标，“×”相乘等于目标；“−”和“÷”笼子有两个格子，差或商等于目标。单格笼子直接给出答案。', '“+” kafeslerde toplam, “×” kafeslerde çarpım hedefi verir; “−” ve “÷” kafeslerin iki karesi vardır, farkları ya da bölümleri hedeftir. Tek kareli kafes doğrudan verilmiştir.')}</p>
        <div className="tools">
          <button type="button" id="kk-undo" className="btn" disabled={!g.history.length || done} onClick={() => setG({ ...g, grid: g.history[g.history.length - 1], history: g.history.slice(0, -1) })}>{t('Undo', '撤销', 'Geri al')}</button>
          <button type="button" id="kk-hint" className="btn" disabled={done} onClick={hint}>{t('Hint', '提示', 'İpucu')}</button>
        </div>
        <div className="setup">
          <Seg id="kk-size" label={t('Size', '大小', 'Boyut')} value={size} onChange={setSize} options={[4, 5, 6].map(k => ({ value: k, label: `${k}×${k}` }))} />
          <button type="button" id={done ? 'kk-again' : 'kk-new'} className="btn primary" onClick={() => { setG(make(size)); setSel(0); }}>{t('New puzzle', '新谜题', 'Yeni bulmaca')}</button>
        </div>
      </aside>
    </div>
  );
}
