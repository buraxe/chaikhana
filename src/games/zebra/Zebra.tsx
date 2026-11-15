import './zebra.css';
import { useEffect, useState } from 'react';
import { useLang, useT } from '../../core/i18n';
import { sfx } from '../../core/sound';
import { loadJSON, saveJSON } from '../../core/storage';
import { getData, noteStarted, recordResult } from '../../core/store';
import { fmtTime, Seg } from '../../ui/bits';
import { CATS, clueText, generate, type ZPuzzle } from './rules';

/** marks[c][v][h]: 0 open, 1 crossed out, 2 this is it. */
type Marks = number[][][];
interface Saved { size: number; p: ZPuzzle; marks: Marks; history: Marks[]; done: boolean[]; elapsed: number; solved: boolean; assisted: boolean; recorded: boolean }
const blank = (p: ZPuzzle): Marks => p.cats.map(() => Array.from({ length: p.n }, () => Array(p.n).fill(0)));
const make = (size: number): Saved => { const p = generate(size, size); return { size, p, marks: blank(p), history: [], done: p.clues.map(() => false), elapsed: 0, solved: false, assisted: false, recorded: false }; };
/** The value placed in a cell: marked yes, or the only one not crossed out. */
function cellValue(m: Marks, c: number, h: number, n: number): number | null {
  const yes = m[c].findIndex(v => v[h] === 2); if (yes >= 0) return yes;
  const open = [...Array(n).keys()].filter(v => m[c][v][h] !== 1);
  return open.length === 1 ? open[0] : null;
}

export default function Zebra() {
  const t = useT(), lang = useLang(), li = lang === 'zh' ? 1 : lang === 'tr' ? 2 : 0;
  const [g, setG] = useState<Saved>(() => loadJSON<Saved | null>('gp.zebra', null) ?? make(4));
  const [size, setSize] = useState(g.size);
  const [pen, setPen] = useState<'x' | 'o'>('x');
  const [busy, setBusy] = useState(false);
  const { p } = g, n = p.n;
  useEffect(() => { saveJSON('gp.zebra', g); }, [g]);
  useEffect(() => {
    if (g.solved || !g.history.length) return;
    const id = setInterval(() => { if (!document.hidden) setG(x => ({ ...x, elapsed: x.elapsed + 1000 })); }, 1000);
    return () => clearInterval(id);
  }, [g.solved, g.history.length > 0]); // eslint-disable-line

  const values = p.cats.map((_, c) => [...Array(n).keys()].map(h => cellValue(g.marks, c, h, n)));
  const full = values.every(row => row.every(v => v !== null));
  const right = full && values.every((row, c) => row.every((v, h) => p.sol[c][v!] === h));

  const commit = (marks: Marks, extra: Partial<Saved> = {}) => {
    if (!g.history.length) noteStarted('zebra');
    const vals = p.cats.map((_, c) => [...Array(n).keys()].map(h => cellValue(marks, c, h, n)));
    const ok = vals.every((row, c) => row.every((v, h) => v !== null && p.sol[c][v] === h));
    const next: Saved = { ...g, ...extra, marks, history: [...g.history, g.marks] };
    if (ok && !g.solved) {
      next.solved = true; setTimeout(() => sfx('win'), 150);
      if (!next.assisted && !g.recorded) { next.recorded = true; recordResult(getData().activeId, 'zebra', { result: 'win', ms: g.elapsed, label: `${n}×${n} · ${p.clues.length} clues`, bestKey: `${n}×${n}` }); }
    }
    setG(next);
  };
  const tap = (c: number, v: number, h: number) => {
    if (g.solved) return;
    const m: Marks = JSON.parse(JSON.stringify(g.marks));
    if (pen === 'x') m[c][v][h] = m[c][v][h] === 1 ? 0 : 1;
    else if (m[c][v][h] === 2) m[c][v][h] = 0;
    else {
      // Yes here means no to every other value in this cell and to this value in every other house.
      for (let k = 0; k < n; k++) { if (k !== v && m[c][k][h] !== 2) m[c][k][h] = 1; if (k !== h && m[c][v][k] !== 2) m[c][v][k] = 1; }
      m[c][v][h] = 2;
    }
    sfx('click', 0.35);
    commit(m);
  };
  const hint = () => {
    // Fill in one cell that is not right yet, the first in reading order.
    for (let c = 0; c < p.cats.length; c++) for (let h = 0; h < n; h++) {
      const want = p.sol[c].indexOf(h);
      if (values[c][h] !== want || g.marks[c][want][h] !== 2) {
        const m: Marks = JSON.parse(JSON.stringify(g.marks));
        for (let k = 0; k < n; k++) { m[c][k][h] = k === want ? 2 : 1; if (k !== h) m[c][want][k] = 1; }
        commit(m, { assisted: true }); return;
      }
    }
  };
  const fresh = () => { setBusy(true); setTimeout(() => { setG(make(size)); setBusy(false); }, 30); };
  const bold = (s: string) => s.split('**').map((part, i) => (i % 2 ? <b key={i}>{part}</b> : part));
  const ord = (h: number) => t(`House ${h + 1}`, `${h + 1}号`, `${h + 1}. ev`);

  return (
    <div className="play">
      <div className="play-main">
        <div className="statline"><span role="status" aria-live="polite">{g.solved ? t('Solved: every house is right.', '解开了：每座房子都对了！', 'Çözüldü: her ev doğru.') : full && !right ? t('Every cell is filled, but something does not fit the clues yet.', '格子都填满了，但有地方和线索不符。', 'Her hücre dolu ama bir şey ipuçlarına uymuyor.') : t(`${n} houses in a row. Use the clues to find who lives where.`, `一排${n}座房子。根据线索推出谁住哪里。`, `Yan yana ${n} ev. İpuçlarından kimin nerede oturduğunu bul.`)}</span><span className="num">{fmtTime(g.elapsed)}</span></div>
        <div className="zb-wrap">
          <table className={'zb-grid n' + n}>
            <thead><tr><th />{[...Array(n).keys()].map(h => <th key={h} scope="col">{ord(h)}</th>)}</tr></thead>
            <tbody>
              {p.cats.map((cat, c) => (
                <tr key={cat}>
                  <th scope="row">{CATS[cat].label[li]}</th>
                  {[...Array(n).keys()].map(h => {
                    const val = values[c][h];
                    return (
                      <td key={h} className={val !== null ? 'set' : ''}>
                        {[...Array(n).keys()].map(v => {
                          const s = g.marks[c][v][h];
                          return <button key={v} type="button" className={'zb-v' + (s === 1 ? ' x' : s === 2 || val === v ? ' o' : '')} onClick={() => tap(c, v, h)}
                            aria-label={`${ord(h)}, ${CATS[cat].values[v][li]}: ${s === 1 ? t('ruled out', '已排除', 'elendi') : s === 2 ? t('chosen', '已选定', 'seçildi') : t('open', '未定', 'açık')}`}>{CATS[cat].values[v][li]}</button>;
                        })}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <ol className="zb-clues">
          {p.clues.map((c, i) => <li key={i} className={g.done[i] ? 'done' : ''} onClick={() => setG({ ...g, done: g.done.map((d, j) => (j === i ? !d : d)) })}>{bold(clueText(p, c, li as 0 | 1 | 2))}</li>)}
        </ol>
        <p className="muted small">{t('Tap a clue to tick it off once you have used it.', '用完一条线索后，点它划掉。', 'Kullandığın ipucuna dokunup üstünü çiz.')}</p>
      </div>
      <aside className="play-side">
        {g.solved && <div className="result" role="status"><h3>{g.assisted ? t('Solved with hints', '在提示下解开', 'İpuçlarıyla çözüldü') : t('Solved', '解开了', 'Çözüldü')}</h3><p className="num big">{fmtTime(g.elapsed)}</p></div>}
        <Seg id="zb-pen" label={t('Tapping a value', '点击一个值', 'Bir değere dokununca')} value={pen} onChange={setPen} options={[{ value: 'x', label: t('✗ rules it out', '✗ 排除', '✗ eler') }, { value: 'o', label: t('✓ chooses it', '✓ 选定', '✓ seçer') }]} />
        <div className="tools">
          <button type="button" id="zb-undo" className="btn" disabled={!g.history.length || g.solved} onClick={() => setG({ ...g, marks: g.history[g.history.length - 1], history: g.history.slice(0, -1) })}>{t('Undo', '撤销', 'Geri al')}</button>
          <button type="button" id="zb-hint" className="btn" disabled={g.solved} onClick={hint}>{t('Hint', '提示', 'İpucu')}</button>
          <button type="button" className="btn" disabled={g.solved} onClick={() => setG({ ...g, marks: blank(p), history: [...g.history, g.marks] })}>{t('Clear', '清空', 'Temizle')}</button>
        </div>
        <p className="muted small">{t('Each value belongs to exactly one house. Rule out what the clues forbid; when only one value is left in a cell, it is the answer. “Left” means towards house 1.', '每个值只属于一座房子。线索不允许的就排除；格子里只剩一个值时，它就是答案。“左边”指朝1号房的方向。', 'Her değer tam olarak bir eve aittir. İpuçlarının izin vermediğini ele; bir hücrede tek değer kalınca cevap odur. “Sol”, 1. eve doğru demektir.')}</p>
        <div className="setup">
          <Seg id="zb-size" label={t('Size', '大小', 'Boyut')} value={size} onChange={setSize} options={[{ value: 3, label: '3×3' }, { value: 4, label: '4×4' }, { value: 5, label: '5×5' }]} />
          <button type="button" id={g.solved ? 'zb-again' : 'zb-new'} className="btn primary" disabled={busy} onClick={fresh}>{busy ? t('Writing clues…', '正在出题…', 'İpuçları yazılıyor…') : t('New puzzle', '新谜题', 'Yeni bulmaca')}</button>
        </div>
      </aside>
    </div>
  );
}
