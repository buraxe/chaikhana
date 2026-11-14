import './queens.css';
import { useEffect, useMemo, useState } from 'react';
import { useT } from '../../core/i18n';
import { sfx } from '../../core/sound';
import { loadJSON, saveJSON } from '../../core/storage';
import { getData, noteStarted, recordResult } from '../../core/store';
import { fmtTime, Seg } from '../../ui/bits';
import { CLASSIC_TOTAL, complete, conflicts, generate, type RPuzzle } from './rules';

type Mode = 'regions' | 'classic';
/** Marks: 0 empty, 1 cross, 2 queen. */
interface Saved { mode: Mode; n: number; p: RPuzzle | null; marks: number[]; history: number[][]; elapsed: number; recorded: boolean; hints: number; found: Record<number, string[]> }
const make = (mode: Mode, n: number, found: Record<number, string[]> = {}): Saved => ({ mode, n, p: mode === 'regions' ? generate(n, Math.random) : null, marks: new Array(n * n).fill(0), history: [], elapsed: 0, recorded: false, hints: 0, found });
const REGION = ['#f4c7a1', '#b9d7ea', '#c8e6b0', '#f2b5c4', '#e0cdf2', '#f7e19b', '#b8e2d8', '#d9c3a5', '#c9cbe8'];

export default function Queens() {
  const t = useT();
  const [g, setG] = useState<Saved>(() => loadJSON<Saved | null>('gp.queens', null) ?? make('regions', 7));
  const [mode, setMode] = useState<Mode>(g.mode);
  const [size, setSize] = useState(g.n);
  const [shade, setShade] = useState(true);
  useEffect(() => { saveJSON('gp.queens', g); }, [g]);
  const { n, p } = g, region = p?.region ?? null;
  const queens = useMemo(() => g.marks.map((m, i) => (m === 2 ? i : -1)).filter(i => i >= 0), [g.marks]);
  const bad = useMemo(() => conflicts(n, queens, region), [n, queens, region]);
  const done = complete(n, queens, region);
  const key = queens.join(',');
  const found = g.found[n] ?? [];
  useEffect(() => {
    if (done || !g.history.length || g.mode === 'classic') return;
    const id = setInterval(() => { if (!document.hidden) setG(x => ({ ...x, elapsed: x.elapsed + 1000 })); }, 1000);
    return () => clearInterval(id);
  }, [done, g.history.length > 0, g.mode]); // eslint-disable-line
  // Squares a queen attacks (classic), for the optional shading.
  const attacked = useMemo(() => {
    const a = new Set<number>(); if (g.mode !== 'classic' || !shade) return a;
    for (const q of queens) for (let i = 0; i < n * n; i++) { const r = Math.floor(i / n), c = i % n, qr = Math.floor(q / n), qc = q % n; if (i !== q && (r === qr || c === qc || Math.abs(r - qr) === Math.abs(c - qc))) a.add(i); }
    return a;
  }, [queens, n, shade, g.mode]);
  const set = (i: number, v: number, hint = false) => {
    if (g.mode === 'regions' && done) return;
    if (!g.history.length) noteStarted('n-queens');
    const marks = g.marks.slice(); marks[i] = v; sfx(v === 2 ? 'peg' : 'click', 0.5);
    const qs = marks.map((m, j) => (m === 2 ? j : -1)).filter(j => j >= 0), hints = g.hints + (hint ? 1 : 0);
    let { recorded, found: fd } = g;
    if (complete(n, qs, region)) {
      if (g.mode === 'regions' && !recorded) { recorded = true; setTimeout(() => sfx('win'), 200); if (!hints) recordResult(getData().activeId, 'n-queens', { result: 'win', ms: g.elapsed, label: `${n}×${n}`, bestKey: `${n}×${n}` }); }
      if (g.mode === 'classic' && !(fd[n] ?? []).includes(qs.join(','))) {
        fd = { ...fd, [n]: [...(fd[n] ?? []), qs.join(',')] }; setTimeout(() => sfx('win'), 150);
        if (fd[n].length === CLASSIC_TOTAL[n]) recordResult(getData().activeId, 'n-queens', { result: 'win', label: `${n} queens · all ${CLASSIC_TOTAL[n]}` });
      }
    }
    setG({ ...g, marks, history: [...g.history, g.marks], recorded, hints, found: fd });
  };
  const tap = (i: number) => set(i, g.mode === 'classic' ? (g.marks[i] === 2 ? 0 : 2) : (g.marks[i] + 1) % 3);
  const hint = () => {
    if (!p) return;
    const r = p.solution.findIndex((c, row) => g.marks[row * n + c] !== 2);
    if (r >= 0) set(r * n + p.solution[r], 2, true);
  };
  const edge = (i: number, d: number) => {
    if (!region) return false;
    const j = i + d; if (d === 1 && i % n === n - 1) return true; if (d === -1 && i % n === 0) return true; if (j < 0 || j >= n * n) return true;
    return region[j] !== region[i];
  };
  return (
    <div className="play">
      <div className="play-main">
        <div className="statline"><span role="status" aria-live="polite">{g.mode === 'regions'
          ? (done ? (g.hints ? t('Solved with hints.', '在提示下完成。', 'İpuçlarıyla çözüldü.') : t('Solved!', '完成！', 'Çözüldü!')) : t('One queen in each row, column and colour; no two queens touch.', '每行、每列、每种颜色各一个皇后；皇后之间不能相邻（斜角也不行）。', 'Her satırda, sütunda ve renkte bir vezir; iki vezir birbirine değmez.'))
          : (done ? (found.includes(key) && found.indexOf(key) < found.length - 1 ? t('A solution, but you found this one before.', '这个解之前找到过了。', 'Bir çözüm ama bunu daha önce bulmuştun.') : t('A new solution!', '新的解！', 'Yeni bir çözüm!')) : t(`Place ${n} queens so none attacks another.`, `放${n}个皇后，互相不能攻击。`, `${n} veziri hiçbiri diğerini tehdit etmeyecek şekilde yerleştir.`))}</span>
          {g.mode === 'regions' ? <span className="num">{fmtTime(g.elapsed)}</span> : <span className="num">{found.length}/{CLASSIC_TOTAL[n]}</span>}</div>
        <div className={'qn-grid ' + g.mode} style={{ ['--n' as string]: n }} role="grid" aria-label={t('Queens', '皇后', 'Vezirler')}>
          {g.marks.map((m, i) => (
            <button key={i} type="button" role="gridcell" className={'qn-cell' + ((Math.floor(i / n) + i % n) % 2 ? ' dark' : '') + (bad.has(i) ? ' bad' : '') + (attacked.has(i) && m !== 2 ? ' hit' : '')}
              style={region ? { background: REGION[region[i] % REGION.length], borderTopWidth: edge(i, -n) ? 2.5 : .5, borderLeftWidth: edge(i, -1) ? 2.5 : .5, borderRightWidth: edge(i, 1) ? 2.5 : .5, borderBottomWidth: edge(i, n) ? 2.5 : .5 } : undefined}
              onClick={() => tap(i)} aria-label={`${Math.floor(i / n) + 1}-${(i % n) + 1}: ${m === 2 ? '♛' : m === 1 ? '×' : '·'}`}>
              {m === 2 ? '♛' : m === 1 ? '×' : ''}
            </button>
          ))}
        </div>
        <p className="muted small">{g.mode === 'regions' ? t('Tap once for a cross (no queen here), twice for a queen, three times to clear.', '点一次标“×”（这里没有皇后），点两次放皇后，点三次清除。', 'Bir dokunuş çarpı (burada vezir yok), iki dokunuş vezir, üç dokunuş temizler.') : t('Tap to place or lift a queen. Every new arrangement you find is kept.', '点击放置或拿起皇后。你找到的每一种新摆法都会被记下来。', 'Vezir koymak ya da kaldırmak için dokun. Bulduğun her yeni diziliş saklanır.')}</p>
      </div>
      <aside className="play-side">
        {g.mode === 'classic' && <label className="check" htmlFor="qn-shade"><input id="qn-shade" type="checkbox" checked={shade} onChange={e => setShade(e.target.checked)} /> {t('Shade attacked squares', '标出被攻击的格子', 'Tehdit edilen kareleri göster')}</label>}
        <div className="tools">
          <button type="button" id="qn-undo" className="btn" disabled={!g.history.length || (g.mode === 'regions' && done)} onClick={() => setG({ ...g, marks: g.history[g.history.length - 1], history: g.history.slice(0, -1) })}>{t('Undo', '撤销', 'Geri al')}</button>
          {g.mode === 'regions' && <button type="button" id="qn-hint" className="btn" disabled={done} onClick={hint}>{t('Hint', '提示', 'İpucu')}</button>}
          {g.mode === 'classic' && <button type="button" id="qn-clear" className="btn" onClick={() => setG({ ...g, marks: new Array(n * n).fill(0), history: [...g.history, g.marks] })}>{t('Clear board', '清空', 'Tahtayı temizle')}</button>}
        </div>
        <div className="setup">
          <Seg id="qn-mode" label={t('Puzzle', '玩法', 'Bulmaca')} value={mode} onChange={v => { setMode(v); setSize(v === 'classic' ? 8 : 7); }} options={[{ value: 'regions' as Mode, label: t('Colour regions', '颜色区域', 'Renk bölgeleri') }, { value: 'classic' as Mode, label: t('Classic', '经典', 'Klasik') }]} />
          <Seg id="qn-size" label={t('Size', '大小', 'Boyut')} value={size} onChange={setSize} options={(mode === 'classic' ? [4, 5, 6, 7, 8] : [6, 7, 8, 9]).map(k => ({ value: k, label: `${k}×${k}` }))} />
          <button type="button" id={done && g.mode === 'regions' ? 'qn-again' : 'qn-new'} className="btn primary" onClick={() => setG(make(mode, size, g.found))}>{mode === 'regions' ? t('New puzzle', '新谜题', 'Yeni bulmaca') : t('Set up board', '摆好棋盘', 'Tahtayı kur')}</button>
        </div>
      </aside>
    </div>
  );
}
