import './nonogram.css';
import { useEffect, useMemo, useRef, useState } from 'react';
import { sfx } from '../../core/sound';
import { useT } from '../../core/i18n';
import { loadJSON, saveJSON } from '../../core/storage';
import { getData, noteStarted, recordResult } from '../../core/store';
import { fmtTime, Pick, Seg } from '../../ui/bits';
import { clueOf, generate, logicSolve, matches, type Puzzle } from './rules';

interface Saved { p: Puzzle; cells: number[]; elapsed: number; done: boolean; hints: number; started: boolean; history: number[][] }
const fresh = (n: number): Saved => { const p = generate(n, n, Math.random); return { p, cells: new Array(n * n).fill(0), elapsed: 0, done: false, hints: 0, started: false, history: [] }; };

export default function Nonogram() {
  const t = useT();
  const [g, setG] = useState<Saved>(() => loadJSON<Saved | null>('gp.nonogram', null) ?? fresh(10));
  const [size, setSize] = useState(g.p.w);
  const [mode, setMode] = useState<'fill' | 'cross'>('fill');
  const [showErr, setShowErr] = useState(false);
  const paint = useRef<{ value: number; axis: 'r' | 'c' | null; start: number } | null>(null);
  const { p } = g, n = p.w;
  useEffect(() => { saveJSON('gp.nonogram', g); }, [g]);
  useEffect(() => {
    if (g.done || !g.started) return;
    const id = setInterval(() => { if (!document.hidden) setG(s => ({ ...s, elapsed: s.elapsed + 1000 })); }, 1000);
    return () => clearInterval(id);
  }, [g.done, g.started]);

  // cells: 0 empty, 1 filled, 2 crossed (marked empty)
  const setCell = (i: number, value: number, record: boolean) => {
    sfx('click', 0.7);
    setG(s => {
      if (s.done || s.cells[i] === value) return s;
      if (!s.started) noteStarted('nonogram');
      const cells = s.cells.slice(); cells[i] = value;
      const filled = cells.map(v => (v === 1 ? 1 : 0)), done = matches(s.p, filled);
      if (done && !s.done) recordResult(getData().activeId, 'nonogram', { result: 'win', ms: s.elapsed, label: `${s.p.w}×${s.p.h}${s.hints ? ' · with hints' : ''}`, bestKey: s.hints ? undefined : `${s.p.w}×${s.p.h}` });
      return { ...s, cells, done, started: true, history: record ? [...s.history.slice(-80), s.cells] : s.history };
    });
  };
  const onDown = (e: React.PointerEvent, i: number) => {
    if (g.done) return;
    (e.target as Element).releasePointerCapture?.(e.pointerId);
    const target = mode === 'fill' ? 1 : 2, value = g.cells[i] === target ? 0 : target;
    paint.current = { value, axis: null, start: i };
    setCell(i, value, true);
  };
  const onEnter = (i: number) => {
    const pt = paint.current;
    if (!pt) return;
    // Painting follows the row or column the drag started along.
    if (!pt.axis) pt.axis = Math.floor(i / n) === Math.floor(pt.start / n) ? 'r' : i % n === pt.start % n ? 'c' : null;
    if (!pt.axis || (pt.axis === 'r' && Math.floor(i / n) !== Math.floor(pt.start / n)) || (pt.axis === 'c' && i % n !== pt.start % n)) return;
    setCell(i, pt.value, false);
  };
  const onMove = (e: React.PointerEvent) => {
    if (!paint.current) return;
    const el = document.elementFromPoint(e.clientX, e.clientY) as HTMLElement | null;
    const k = el?.dataset?.cell;
    if (k !== undefined) onEnter(+k);
  };
  useEffect(() => { const up = () => { paint.current = null; }; window.addEventListener('pointerup', up); return () => window.removeEventListener('pointerup', up); }, []);
  const undo = () => setG(s => (s.history.length && !s.done ? { ...s, cells: s.history[s.history.length - 1], history: s.history.slice(0, -1) } : s));
  // A hint fills or crosses one cell that line logic can already decide from what you have.
  const hint = () => {
    const known = g.cells.map((v, i) => (v === 1 && p.solution[i] === 1 ? 1 : v === 2 && p.solution[i] === 0 ? 0 : -1));
    const wrong = g.cells.findIndex((v, i) => (v === 1 && p.solution[i] === 0) || (v === 2 && p.solution[i] === 1));
    if (wrong >= 0) { setG(s => ({ ...s, hints: s.hints + 1 })); setCell(wrong, 0, true); return; }
    const res = logicSolve(p, known);
    const k = res ? res.findIndex((v, i) => v !== -1 && known[i] === -1) : -1;
    const i = k >= 0 ? k : p.solution.findIndex((v, j) => known[j] === -1);
    if (i < 0) return;
    setG(s => ({ ...s, hints: s.hints + 1 }));
    setCell(i, p.solution[i] === 1 ? 1 : 2, true);
  };
  const rowDone = useMemo(() => Array.from({ length: p.h }, (_, r) => clueOf(g.cells.slice(r * n, r * n + n).map(v => (v === 1 ? 1 : 0))).join() === p.rows[r].join()), [g.cells, p, n]);
  const colDone = useMemo(() => Array.from({ length: n }, (_, c) => clueOf(Array.from({ length: p.h }, (_, r) => (g.cells[r * n + c] === 1 ? 1 : 0))).join() === p.cols[c].join()), [g.cells, p, n]);
  const maxCol = Math.max(1, ...p.cols.map(x => x.length)), maxRow = Math.max(1, ...p.rows.map(x => x.length));
  return (
    <div className="play">
      <div className="play-main">
        <div className="statline">
          <span role="status" aria-live="polite">{g.done ? t(`Solved in ${fmtTime(g.elapsed)}.`, `用时${fmtTime(g.elapsed)}完成！`, `${fmtTime(g.elapsed)} sürede çözüldü.`) : t('Fill the cells so every row and column matches its numbers.', '涂黑格子，使每行每列都符合提示数字。', 'Kareleri, her satır ve sütun kendi sayılarına uyacak şekilde doldur.')}</span>
          <span className="num">{fmtTime(g.elapsed)}</span>
        </div>
        <div className="ng-scroll">
          <div className={'ng' + (g.done ? ' done' : '')} style={{ ['--n' as string]: n, ['--rc' as string]: maxRow, ['--cc' as string]: maxCol }} onPointerMove={onMove}>
            <div className="ng-corner" />
            <div className="ng-cols">{p.cols.map((cl, c) => <div key={c} className={'ng-clue col' + (colDone[c] ? ' ok' : '') + (c % 5 === 4 && c < n - 1 ? ' br' : '')}>{(cl.length ? cl : [0]).map((v, k) => <span key={k}>{v}</span>)}</div>)}</div>
            <div className="ng-rows">{p.rows.map((rl, r) => <div key={r} className={'ng-clue row' + (rowDone[r] ? ' ok' : '') + (r % 5 === 4 && r < p.h - 1 ? ' bb' : '')}>{(rl.length ? rl : [0]).map((v, k) => <span key={k}>{v}</span>)}</div>)}</div>
            <div className="ng-grid" role="grid" aria-label={t(`Nonogram ${n} by ${n}`, `数织 ${n}×${n}`, `Nonogram ${n}×${n}`)}>
              {g.cells.map((v, i) => {
                const r = Math.floor(i / n), c = i % n, wrong = showErr && ((v === 1 && !p.solution[i]) || (v === 2 && p.solution[i]));
                return <button key={i} type="button" data-cell={i} className={'ng-cell' + (v === 1 ? ' fill' : v === 2 ? ' cross' : '') + (wrong ? ' wrong' : '') + (c % 5 === 4 && c < n - 1 ? ' br' : '') + (r % 5 === 4 && r < p.h - 1 ? ' bb' : '')}
                  onPointerDown={e => onDown(e, i)} aria-label={t(`Row ${r + 1}, column ${c + 1}`, `第${r + 1}行第${c + 1}列`, `Satır ${r + 1}, sütun ${c + 1}`) + ', ' + (v === 1 ? t('filled', '已涂', 'dolu') : v === 2 ? t('crossed', '已叉', 'çarpılı') : t('empty', '空', 'boş'))} />;
              })}
            </div>
          </div>
        </div>
      </div>
      <aside className="play-side">
        {g.done && (
          <div className="result" role="status">
            <h3>{t('Solved', '完成', 'Çözüldü')}</h3>
            <p className="num big">{fmtTime(g.elapsed)}</p>
            <p className="muted">{g.hints ? t(`${g.hints} hints · not counted for best time`, `用了${g.hints}次提示，不计入最佳用时`, `${g.hints} ipucu · en iyi süreye sayılmaz`) : `${n}×${n}`}</p>
            <button type="button" id="ng-again" className="btn primary" onClick={() => setG(fresh(n))}>{t('New puzzle', '新题目', 'Yeni bulmaca')}</button>
          </div>
        )}
        <Seg id="ng-mode" label={t('Tap to', '点击操作', 'Dokununca')} value={mode} onChange={setMode} options={[{ value: 'fill', label: t('■ Fill', '■ 涂黑', '■ Doldur') }, { value: 'cross', label: t('✕ Mark empty', '✕ 标记空格', '✕ Boş işaretle') }]} />
        <div className="tools">
          <button type="button" id="ng-undo" className="btn" disabled={!g.history.length || g.done} onClick={undo}>{t('Undo', '撤销', 'Geri al')}</button>
          <button type="button" id="ng-hint" className="btn" disabled={g.done} onClick={hint}>{t('Hint', '提示', 'İpucu')}{g.hints ? ` (${g.hints})` : ''}</button>
        </div>
        <label className="check" htmlFor="ng-err"><input id="ng-err" type="checkbox" checked={showErr} onChange={e => setShowErr(e.target.checked)} /> {t('Show mistakes', '显示错误', 'Hataları göster')}</label>
        <p className="muted small">{t('Drag along a row or column to paint several cells. Numbers turn grey when their line is complete. Every puzzle here can be solved by logic, without guessing.', '沿一行或一列拖动可以连续涂格。一行或一列完成后，提示数字会变灰。这里的每道题都能靠推理解出，不需要猜。', 'Birden çok kareyi boyamak için satır ya da sütun boyunca sürükle. Satırı tamamlanan sayılar griye döner. Buradaki her bulmaca tahmin etmeden, mantıkla çözülebilir.')}</p>
        <div className="setup">
          <h3>{t('New puzzle', '新题目', 'Yeni bulmaca')}</h3>
          <Pick id="ng-size" label={t('Size', '尺寸', 'Boyut')} value={size} onChange={setSize} options={[5, 10, 15].map(k => ({ value: k, label: `${k}×${k}` }))} />
          <button type="button" id="ng-new" className="btn primary" onClick={() => setG(fresh(size))}>{t('Generate', '生成', 'Üret')}</button>
        </div>
      </aside>
    </div>
  );
}
