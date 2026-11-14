import './hidato.css';
import { useEffect, useMemo, useState } from 'react';
import { useT } from '../../core/i18n';
import { sfx } from '../../core/sound';
import { loadJSON, saveJSON } from '../../core/storage';
import { getData, noteStarted, recordResult } from '../../core/store';
import { fmtTime, Seg } from '../../ui/bits';
import { generate, mistakes, solved, touches, type HPuzzle } from './rules';

interface Saved { n: number; p: HPuzzle; grid: number[]; history: number[][]; elapsed: number; recorded: boolean; hints: number }
const make = (n: number): Saved => { const p = generate(n, n, Math.random); return { n, p, grid: p.givens.slice(), history: [], elapsed: 0, recorded: false, hints: 0 }; };
/** The smallest number not yet on the board. */
const lowestMissing = (g: number[]) => { const have = new Set(g); for (let k = 1; k <= g.length; k++) if (!have.has(k)) return k; return 0; };

export default function Hidato() {
  const t = useT();
  const [g, setG] = useState<Saved>(() => loadJSON<Saved | null>('gp.hidato', null) ?? make(5));
  const [size, setSize] = useState(g.n);
  const [cur, setCur] = useState(() => lowestMissing(g.grid));
  useEffect(() => { saveJSON('gp.hidato', g); }, [g]);
  const { p } = g, n = p.w, N = n * n, done = solved(p, g.grid), bad = useMemo(() => mistakes(p, g.grid), [p, g.grid]);
  useEffect(() => {
    if (done || !g.history.length) return;
    const id = setInterval(() => { if (!document.hidden) setG(x => ({ ...x, elapsed: x.elapsed + 1000 })); }, 1000);
    return () => clearInterval(id);
  }, [done, g.history.length > 0]); // eslint-disable-line
  const onBoard = useMemo(() => new Set(g.grid), [g.grid]);
  const prevAt = g.grid.indexOf(cur - 1), nextAt = g.grid.indexOf(cur + 1);
  const write = (grid: number[], hint = false) => {
    if (!g.history.length) noteStarted('hidato');
    const hints = g.hints + (hint ? 1 : 0);
    let recorded = g.recorded;
    if (solved(p, grid) && !recorded) { recorded = true; setTimeout(() => sfx('win'), 200); if (!hints) recordResult(getData().activeId, 'hidato', { result: 'win', ms: g.elapsed, label: `${n}×${n}`, bestKey: `${n}×${n}` }); }
    setG({ ...g, grid, history: [...g.history, g.grid], recorded, hints });
    setCur(lowestMissing(grid));
  };
  const tap = (i: number) => {
    if (done || p.givens[i]) return;
    const grid = g.grid.slice();
    if (grid[i]) { const v = grid[i]; grid[i] = 0; sfx('click', 0.5); write(grid); setCur(v); return; }
    if (!cur || onBoard.has(cur)) return;
    grid[i] = cur; sfx('peg', 0.6); write(grid);
  };
  const step = (d: number) => { let k = cur; do { k += d; } while (k >= 1 && k <= N && onBoard.has(k)); if (k >= 1 && k <= N) setCur(k); };
  const hint = () => { const i = g.grid.findIndex((v, j) => v !== p.solution[j]); if (i < 0) return; const grid = g.grid.slice(); grid[i] = p.solution[i]; write(grid, true); };
  return (
    <div className="play">
      <div className="play-main">
        <div className="statline"><span role="status" aria-live="polite">{done ? (g.hints ? t('Solved with hints.', '在提示下完成。', 'İpuçlarıyla çözüldü.') : t('Solved: the snake is whole!', '完成：数字蛇连起来了！', 'Çözüldü: yılan tamamlandı!')) : t(`Write 1 to ${N} so each number touches the next, even at a corner.`, `填入1到${N}，每个数都要和下一个数相邻（斜着也算）。`, `1’den ${N}’e kadar yaz; her sayı bir sonrakine değsin, köşeden de olur.`)}</span><span className="num">{fmtTime(g.elapsed)}</span></div>
        <div className="hd-grid" style={{ ['--n' as string]: n }} role="grid" aria-label="Hidato">
          {g.grid.map((v, i) => {
            const near = !v && ((prevAt >= 0 && touches(n, i, prevAt)) || (nextAt >= 0 && touches(n, i, nextAt)));
            const both = !v && prevAt >= 0 && nextAt >= 0 && touches(n, i, prevAt) && touches(n, i, nextAt);
            return (
              <button key={i} type="button" role="gridcell" className={'hd-cell' + (p.givens[i] ? ' given' : '') + (v === 1 || v === N ? ' end' : '') + (bad.has(i) ? ' bad' : '') + (both ? ' both' : near ? ' near' : '') + (v && (v === cur - 1 || v === cur + 1) ? ' link' : '')}
                onClick={() => tap(i)} aria-label={`${Math.floor(i / n) + 1}-${(i % n) + 1}: ${v || '·'}`}>{v || ''}</button>
            );
          })}
        </div>
        <div className="hd-cur">
          <button type="button" className="btn" onClick={() => step(-1)} aria-label={t('Previous missing number', '上一个缺的数', 'Önceki eksik sayı')}>◀</button>
          <span>{t('Placing', '要放的数', 'Yerleştirilen')} <b className="num">{cur || '—'}</b></span>
          <button type="button" className="btn" onClick={() => step(1)} aria-label={t('Next missing number', '下一个缺的数', 'Sonraki eksik sayı')}>▶</button>
        </div>
      </div>
      <aside className="play-side">
        <p className="muted small">{t('Tap an empty square to write the number shown below the grid; tap your own number to take it back. Squares next to its neighbours in the sequence are tinted; the darker ones touch both.', '点空格写入下方显示的数字；点自己写的数字可以收回。和前后两个数相邻的格子会着色，颜色深的两边都挨着。', 'Boş bir kareye dokununca ızgaranın altındaki sayı yazılır; kendi yazdığın sayıya dokununca geri alınır. Dizideki komşularına değen kareler renklenir; koyu olanlar ikisine de değer.')}</p>
        <div className="tools">
          <button type="button" id="hd-undo" className="btn" disabled={!g.history.length || done} onClick={() => { const grid = g.history[g.history.length - 1]; setG({ ...g, grid, history: g.history.slice(0, -1) }); setCur(lowestMissing(grid)); }}>{t('Undo', '撤销', 'Geri al')}</button>
          <button type="button" id="hd-hint" className="btn" disabled={done} onClick={hint}>{t('Hint', '提示', 'İpucu')}</button>
        </div>
        <div className="setup">
          <Seg id="hd-size" label={t('Size', '大小', 'Boyut')} value={size} onChange={setSize} options={[5, 6, 7].map(k => ({ value: k, label: `${k}×${k}` }))} />
          <button type="button" id={done ? 'hd-again' : 'hd-new'} className="btn primary" onClick={() => { const s = make(size); setG(s); setCur(lowestMissing(s.grid)); }}>{t('New puzzle', '新谜题', 'Yeni bulmaca')}</button>
        </div>
      </aside>
    </div>
  );
}
