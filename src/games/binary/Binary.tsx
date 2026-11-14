import './binary.css';
import { useEffect, useMemo, useState } from 'react';
import { useT } from '../../core/i18n';
import { sfx } from '../../core/sound';
import { loadJSON, saveJSON } from '../../core/storage';
import { getData, noteStarted, recordResult } from '../../core/store';
import { fmtTime, Seg } from '../../ui/bits';
import { generate, mistakes, solved, type BPuzzle } from './rules';

interface Saved { n: number; p: BPuzzle; grid: number[]; history: number[][]; elapsed: number; recorded: boolean; hints: number }
const make = (n: number): Saved => { const p = generate(n, Math.random); return { n, p, grid: p.givens.slice(), history: [], elapsed: 0, recorded: false, hints: 0 }; };

export default function Binary() {
  const t = useT();
  const [g, setG] = useState<Saved>(() => loadJSON<Saved | null>('gp.binary', null) ?? make(6));
  const [size, setSize] = useState(g.n);
  const [check, setCheck] = useState(true);
  useEffect(() => { saveJSON('gp.binary', g); }, [g]);
  const { n, p } = g, done = solved(n, g.grid), bad = useMemo(() => (check ? mistakes(n, g.grid) : new Set<number>()), [n, g.grid, check]);
  useEffect(() => {
    if (done || !g.history.length) return;
    const id = setInterval(() => { if (!document.hidden) setG(x => ({ ...x, elapsed: x.elapsed + 1000 })); }, 1000);
    return () => clearInterval(id);
  }, [done, g.history.length > 0]); // eslint-disable-line
  const set = (i: number, v: number, hint = false) => {
    if (done || p.givens[i] >= 0) return;
    if (!g.history.length) noteStarted('binary');
    const grid = g.grid.slice(); grid[i] = v; sfx(v < 0 ? 'click' : 'peg', 0.5);
    const hints = g.hints + (hint ? 1 : 0);
    let recorded = g.recorded;
    if (solved(n, grid) && !recorded) { recorded = true; setTimeout(() => sfx('win'), 200); if (!hints) recordResult(getData().activeId, 'binary', { result: 'win', ms: g.elapsed, label: `${n}×${n}`, bestKey: `${n}×${n}` }); }
    setG({ ...g, grid, history: [...g.history, g.grid], recorded, hints });
  };
  // Tap: empty → 0 → 1 → empty. Right-click goes the other way.
  const cycle = (i: number, back = false) => set(i, back ? [1, -1, 0][g.grid[i] + 1] : [0, 1, -1][g.grid[i] + 1]);
  const hint = () => { const i = g.grid.findIndex((v, j) => v !== p.solution[j]); if (i >= 0) set(i, p.solution[i], true); };
  const filled = g.grid.filter(v => v >= 0).length;
  return (
    <div className="play">
      <div className="play-main">
        <div className="statline"><span role="status" aria-live="polite">{done ? (g.hints ? t('Solved with hints.', '在提示下完成。', 'İpuçlarıyla çözüldü.') : t('Solved!', '完成！', 'Çözüldü!')) : t('No three alike in a line, equal 0s and 1s, no two lines the same.', '一行不能连续三个相同，0和1一样多，任意两行（列）不能相同。', 'Bir hatta üç aynı yan yana olmaz, 0 ve 1 sayısı eşit, iki hat birbirinin aynısı olamaz.')}</span><span className="num">{fmtTime(g.elapsed)}</span></div>
        <div className="bn-grid" style={{ ['--n' as string]: n }} role="grid" aria-label={t('Binary puzzle', '二进制数独', 'İkili bulmaca')}>
          {g.grid.map((v, i) => (
            <button key={i} type="button" role="gridcell" className={'bn-cell' + (p.givens[i] >= 0 ? ' given' : '') + (v === 0 ? ' z' : v === 1 ? ' o' : '') + (bad.has(i) ? ' bad' : '')}
              onClick={() => cycle(i)} onContextMenu={e => { e.preventDefault(); cycle(i, true); }} aria-label={`${Math.floor(i / n) + 1}-${(i % n) + 1}: ${v < 0 ? '·' : v}`}>
              {v < 0 ? '' : v}
            </button>
          ))}
        </div>
        <p className="muted small">{t('Tap a square to cycle 0, 1, empty. Right-click goes backwards.', '点格子在0、1、空之间切换；右键反向。', 'Kareye dokununca 0, 1, boş sırasıyla değişir. Sağ tık geri gider.')}</p>
      </div>
      <aside className="play-side">
        <dl className="facts"><div><dt>{t('Filled', '已填', 'Dolu')}</dt><dd className="num">{filled}/{n * n}</dd></div></dl>
        <label className="check" htmlFor="bn-check"><input id="bn-check" type="checkbox" checked={check} onChange={e => setCheck(e.target.checked)} /> {t('Mark broken rules', '标出违规', 'Kural ihlallerini göster')}</label>
        <div className="tools">
          <button type="button" id="bn-undo" className="btn" disabled={!g.history.length || done} onClick={() => setG({ ...g, grid: g.history[g.history.length - 1], history: g.history.slice(0, -1) })}>{t('Undo', '撤销', 'Geri al')}</button>
          <button type="button" id="bn-hint" className="btn" disabled={done} onClick={hint}>{t('Hint', '提示', 'İpucu')}</button>
        </div>
        <div className="setup">
          <Seg id="bn-size" label={t('Size', '大小', 'Boyut')} value={size} onChange={setSize} options={[6, 8, 10].map(k => ({ value: k, label: `${k}×${k}` }))} />
          <button type="button" id={done ? 'bn-again' : 'bn-new'} className="btn primary" onClick={() => setG(make(size))}>{t('New puzzle', '新谜题', 'Yeni bulmaca')}</button>
        </div>
      </aside>
    </div>
  );
}
