import './sudoku.css';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { sfx } from '../../core/sound';
import { dayKey, hashString, mulberry32 } from '../../core/rng';
import { loadJSON, saveJSON } from '../../core/storage';
import { getData, markDaily, noteStarted, recordResult } from '../../core/store';
import { fmtTime, Pick } from '../../ui/bits';
import { trLabel, useLang, useT } from '../../core/i18n';
import { DIFFICULTIES, generate, SIZES, type Difficulty } from './generator';
import { conflicts, findSingle, SHAPES, SYMBOLS, units } from './rules';

interface Save {
  size: number; difficulty: Difficulty; givens: number[]; solution: number[];
  values: number[]; notes: number[]; elapsed: number; hints: number; mistakes: number;
  daily?: string; done: boolean; technique: string;
}
interface Snap { values: number[]; notes: number[] }
const cap = (s: string) => s[0].toUpperCase() + s.slice(1);

export default function Sudoku({ daily = false }: { daily?: boolean }) {
  const t = useT(), lang = useLang();
  const slot = daily ? 'gp.sudoku.daily' : 'gp.sudoku.free';
  const today = dayKey();
  const [g, setG] = useState<Save | null>(() => {
    const s = loadJSON<Save | null>(slot, null);
    return s && (!daily || s.daily === today) ? s : null;
  });
  const [sel, setSel] = useState(-1);
  const [notesMode, setNotesMode] = useState(false);
  const [showMistakes, setShowMistakes] = useState(() => loadJSON('gp.sudoku.check', true));
  const [paused, setPaused] = useState(false);
  const [busy, setBusy] = useState(false);
  const [hint, setHint] = useState('');
  const [size, setSize] = useState(g?.size ?? 9);
  const [diff, setDiff] = useState<Difficulty>(g?.difficulty ?? 'medium');
  const [confirmNew, setConfirmNew] = useState(false);
  const undo = useRef<Snap[]>([]), redo = useRef<Snap[]>([]);
  const [, bump] = useState(0);

  const start = useCallback((sz: number, d: Difficulty, day?: string) => {
    setBusy(true); setHint(''); setSel(-1); setConfirmNew(false); setPaused(false);
    undo.current = []; redo.current = [];
    setTimeout(() => {
      const p = generate(sz, d, day ? mulberry32(hashString('sudoku-' + day)) : Math.random, day ? 15000 : 3000);
      setG({ size: sz, difficulty: d, givens: p.givens, solution: p.solution, values: p.givens.slice(),
        notes: new Array(sz * sz).fill(0), elapsed: 0, hints: 0, mistakes: 0, daily: day, done: false, technique: p.technique });
      noteStarted('sudoku');
      setBusy(false);
    }, 30);
  }, []);

  useEffect(() => { if (!g && !busy) start(daily ? 9 : size, daily ? 'medium' : diff, daily ? today : undefined); }, []); // eslint-disable-line
  useEffect(() => { if (g) saveJSON(slot, g); }, [g, slot]);
  useEffect(() => { saveJSON('gp.sudoku.check', showMistakes); }, [showMistakes]);

  const running = !!g && !g.done && !paused && !busy;
  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => { if (!document.hidden) setG(s => (s ? { ...s, elapsed: s.elapsed + 1000 } : s)); }, 1000);
    return () => clearInterval(t);
  }, [running]);

  const shape = g ? SHAPES[g.size] : SHAPES[9];
  const n = shape.n;
  const clash = useMemo(() => (g ? conflicts(shape, g.values) : new Set<number>()), [g?.values, shape]); // eslint-disable-line

  const commit = (values: number[], notes: number[], extra: Partial<Save> = {}) => {
    if (!g) return;
    undo.current.push({ values: g.values, notes: g.notes }); redo.current = [];
    const done = values.every((v, i) => v === g.solution[i]);
    const next = { ...g, ...extra, values, notes, done };
    setG(next);
    if (done) {
      const me = getData().activeId, label = `${n}×${n} ${cap(g.difficulty)}${g.daily ? ' · daily' : ''}`;
      recordResult(me, 'sudoku', { result: 'win', label, ms: next.elapsed,
        bestKey: next.hints === 0 ? `${n}×${n} ${cap(g.difficulty)}` : undefined });
      if (g.daily) markDaily(g.daily, next.elapsed);
      setHint('');
    }
  };

  const place = (v: number) => {
    sfx('peg');
    if (!g || g.done || paused || sel < 0 || g.givens[sel]) return;
    const values = g.values.slice(), notes = g.notes.slice(); let mistakes = g.mistakes;
    if (notesMode) {
      if (values[sel]) return;
      notes[sel] ^= 1 << (v - 1);
    } else if (values[sel] === v) {
      values[sel] = 0;
    } else {
      values[sel] = v; notes[sel] = 0;
      for (const p of units(shape).peers[sel]) notes[p] &= ~(1 << (v - 1));
      if (v !== g.solution[sel]) mistakes++;
    }
    setHint('');
    commit(values, notes, { mistakes });
  };
  const erase = () => {
    if (!g || g.done || paused || sel < 0 || g.givens[sel] || (!g.values[sel] && !g.notes[sel])) return;
    const values = g.values.slice(), notes = g.notes.slice();
    values[sel] = 0; notes[sel] = 0;
    commit(values, notes);
  };
  const step = (from: Snap[], to: Snap[]) => {
    if (!g || g.done || !from.length) return;
    const s = from.pop()!;
    to.push({ values: g.values, notes: g.notes });
    setG({ ...g, values: s.values, notes: s.notes });
    bump(x => x + 1);
  };
  const giveHint = () => {
    if (!g || g.done || paused) return;
    const wrong = g.values.findIndex((v, i) => v && v !== g.solution[i]);
    if (wrong >= 0) {
      setSel(wrong); setG({ ...g, hints: g.hints + 1 });
      setHint(t('The selected cell does not match the solution. Clear it before going on.', '选中的格子与答案不符，请先清除再继续。', 'Seçili kare çözümle uyuşmuyor. Devam etmeden önce temizle.'));
      return;
    }
    const s = findSingle(shape, g.values);
    const cell = s ? s.cell : g.values.findIndex(v => !v);
    if (cell < 0) return;
    const v = g.solution[cell], sym = SYMBOLS[v - 1];
    const row = Math.floor(cell / n) + 1, col = (cell % n) + 1;
    const unitZh = { box: '宫', row: '行', column: '列' } as const;
    setHint(!s ? t(`No single is available here, so this one is given: ${sym} at row ${row}, column ${col}. Finding it needs pairs or other candidate eliminations.`, `目前没有唯一解可用，所以直接给出：第${row}行第${col}列填${sym}。要推出它，需要用到数对等排除技巧。`, `Burada tekli yok, bu yüzden bu veriliyor: ${row}. satır, ${col}. sütuna ${sym}. Bulmak için çiftler ya da başka aday elemeleri gerekir.`)
      : s.kind === 'hidden' ? t(`Hidden single: in this ${s.unit}, ${sym} fits only at row ${row}, column ${col}.`, `隐性唯一：在这一${unitZh[s.unit!]}中，${sym}只能填在第${row}行第${col}列。`, `Gizli tekli: bu ${s.unit} içinde ${sym} yalnızca ${row}. satır, ${col}. sütuna sığıyor.`)
      : t(`Naked single: row ${row}, column ${col} can only hold ${sym}. Its row, column and box rule out everything else.`, `显性唯一：第${row}行第${col}列只能填${sym}，其他数字都被所在的行、列、宫排除了。`, `Çıplak tekli: ${row}. satır, ${col}. sütuna yalnızca ${sym} gelebilir. Satırı, sütunu ve kutusu diğer her şeyi eler.`));
    const values = g.values.slice(), notes = g.notes.slice();
    values[cell] = v; notes[cell] = 0;
    for (const p of units(shape).peers[cell]) notes[p] &= ~(1 << (v - 1));
    setSel(cell);
    commit(values, notes, { hints: g.hints + 1 });
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (!g || (t && /^(INPUT|SELECT|TEXTAREA)$/.test(t.tagName))) return;
      const k = e.key;
      if ((e.ctrlKey || e.metaKey) && k.toLowerCase() === 'z') { e.preventDefault(); e.shiftKey ? step(redo.current, undo.current) : step(undo.current, redo.current); return; }
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      const move = ({ ArrowUp: -n, ArrowDown: n, ArrowLeft: -1, ArrowRight: 1 } as Record<string, number>)[k];
      if (move) {
        e.preventDefault();
        const cur = sel < 0 ? 0 : sel, c = cur % n;
        if ((move === -1 && c === 0) || (move === 1 && c === n - 1)) return;
        const next = cur + move;
        if (next >= 0 && next < n * n) setSel(next);
        return;
      }
      if (k === 'Backspace' || k === 'Delete' || k === '0') { erase(); return; }
      if (k.toLowerCase() === 'n') { setNotesMode(m => !m); return; }
      const v = SYMBOLS.indexOf(k.toUpperCase()) + 1;
      if (v >= 1 && v <= n) place(v);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  if (!g || busy) return <div className="game-loading" role="status">{t('Building a puzzle with one solution…', '正在生成唯一解的题目…', 'Tek çözümlü bir bulmaca kuruluyor…')}</div>;

  const selVal = sel >= 0 ? g.values[sel] : 0;
  const peers = sel >= 0 ? new Set(units(shape).peers[sel]) : new Set<number>();
  const counts = new Array(n + 1).fill(0);
  g.values.forEach(v => { counts[v]++; });
  const inProgress = !g.done && g.values.some((v, i) => v && !g.givens[i]);
  const newGame = () => (inProgress && !confirmNew ? setConfirmNew(true) : start(size, diff));

  return (
    <div className="play sdk" style={{ ['--n' as string]: n }}>
      <div className="play-main">
        <div className="statline">
          <span><b>{n}×{n}</b> {trLabel(cap(g.difficulty), lang)}{g.daily ? ` · ${g.daily}` : ''}</span>
          <span className="num" aria-label={t('Elapsed time', '用时', 'Geçen süre')}>{fmtTime(g.elapsed)}</span>
          {!g.done && <button type="button" className="btn ghost sm" id="sdk-pause" onClick={() => setPaused(p => !p)}>{paused ? t('Resume', '继续', 'Devam') : t('Pause', '暂停', 'Duraklat')}</button>}
        </div>
        <div className={'sdk-scroll' + (n === 16 ? ' wide' : '')}>
          <div className="sdk-wrap">
            <div className={'sdk-grid' + (paused ? ' veiled' : '')} role="grid" aria-label={t(`Sudoku ${n} by ${n}`, `${n}×${n}数独`, `Sudoku ${n}×${n}`)}>
              {g.values.map((v, i) => {
                const r = Math.floor(i / n), c = i % n, given = !!g.givens[i];
                const bad = v && !given && (clash.has(i) || (showMistakes && v !== g.solution[i]));
                const cls = ['sdk-cell', given ? 'given' : '', i === sel ? 'sel' : peers.has(i) ? 'peer' : '',
                  v && v === selVal && i !== sel ? 'same' : '', bad ? 'bad' : '', given && clash.has(i) ? 'clash' : '',
                  (c + 1) % shape.bc === 0 && c < n - 1 ? 'br' : '', (r + 1) % shape.br === 0 && r < n - 1 ? 'bb' : ''].join(' ');
                return (
                  <button key={i} type="button" role="gridcell" className={cls} tabIndex={i === sel || (sel < 0 && i === 0) ? 0 : -1}
                    aria-label={t(`Row ${r + 1}, column ${c + 1}, ${v ? SYMBOLS[v - 1] : 'empty'}${given ? ', clue' : ''}`, `第${r + 1}行第${c + 1}列，${v ? SYMBOLS[v - 1] : '空'}${given ? '，题目数字' : ''}`, `Satır ${r + 1}, sütun ${c + 1}, ${v ? SYMBOLS[v - 1] : 'boş'}${given ? ', ipucu' : ''}`)}
                    onClick={() => setSel(i)}>
                    {paused ? '' : v ? SYMBOLS[v - 1] : g.notes[i] ? (
                      <span className="sdk-notes" style={{ gridTemplateColumns: `repeat(${shape.bc}, 1fr)` }}>
                        {Array.from({ length: n }, (_, k) => <i key={k}>{(g.notes[i] >> k) & 1 ? SYMBOLS[k] : ''}</i>)}
                      </span>
                    ) : ''}
                  </button>
                );
              })}
            </div>
            {paused && <div className="veil-note">{t('Paused', '已暂停', 'Duraklatıldı')}</div>}
          </div>
        </div>
      </div>

      <aside className="play-side">
        {g.done ? (
          <div className="result" role="status">
            <h3>{t('Solved', '完成', 'Çözüldü')}</h3>
            <p className="num big">{fmtTime(g.elapsed)}</p>
            <p className="muted">{t(`${g.hints} ${g.hints === 1 ? 'hint' : 'hints'} · ${g.mistakes} wrong ${g.mistakes === 1 ? 'entry' : 'entries'}`, `提示${g.hints}次 · 填错${g.mistakes}次`, `${g.hints} ipucu · ${g.mistakes} yanlış giriş`)}
              {g.hints > 0 ? t('. Best times count only for solves without hints.', '。只有不用提示的完成才计入最佳用时。', '. En iyi süreler yalnızca ipucusuz çözümlerde sayılır.') : ''}</p>
            {g.daily && <p>{t("Today's puzzle is done. A new one arrives at midnight.", '今天的题目已完成，新题将在零点更新。', 'Bugünün bulmacası tamam. Yenisi gece yarısı geliyor.')}</p>}
          </div>
        ) : (
          <>
            <div className="pad" style={{ gridTemplateColumns: `repeat(${n === 16 ? 8 : n === 9 ? 9 : n}, 1fr)` }}>
              {Array.from({ length: n }, (_, k) => (
                <button key={k} type="button" id={`sdk-key-${k + 1}`} className="pad-key" disabled={!notesMode && counts[k + 1] >= n}
                  onClick={() => place(k + 1)} aria-label={t(`Enter ${SYMBOLS[k]}, ${n - counts[k + 1]} left`, `填入${SYMBOLS[k]}，还剩${n - counts[k + 1]}个`, `${SYMBOLS[k]} gir, ${n - counts[k + 1]} kaldı`)}>
                  {SYMBOLS[k]}<small>{Math.max(0, n - counts[k + 1])}</small>
                </button>
              ))}
            </div>
            <div className="tools">
              <button type="button" id="sdk-notes" className={'btn' + (notesMode ? ' on' : '')} aria-pressed={notesMode} onClick={() => setNotesMode(m => !m)}>{notesMode ? t('Notes on', '笔记：开', 'Not açık') : t('Notes off', '笔记：关', 'Not kapalı')}</button>
              <button type="button" id="sdk-erase" className="btn" onClick={erase}>{t('Erase', '擦除', 'Sil')}</button>
              <button type="button" id="sdk-undo" className="btn" disabled={!undo.current.length} onClick={() => step(undo.current, redo.current)}>{t('Undo', '撤销', 'Geri al')}</button>
              <button type="button" id="sdk-redo" className="btn" disabled={!redo.current.length} onClick={() => step(redo.current, undo.current)}>{t('Redo', '重做', 'Yinele')}</button>
              <button type="button" id="sdk-hint" className="btn" onClick={giveHint}>{t('Hint', '提示', 'İpucu')}{g.hints ? ` (${g.hints})` : ''}</button>
            </div>
            {hint && <p className="hint" role="status">{hint}</p>}
            <label className="check" htmlFor="sdk-check">
              <input id="sdk-check" type="checkbox" checked={showMistakes} onChange={e => setShowMistakes(e.target.checked)} />
              {t('Mark wrong entries as I go', '即时标出错误', 'Yanlış girişleri hemen işaretle')}
            </label>
            <p className="muted small">{t(`Keys: arrows move, 1–${SYMBOLS[n - 1]} enter, N toggles notes, Backspace erases, Ctrl+Z undoes.`, `键盘：方向键移动，1–${SYMBOLS[n - 1]}填数，N切换笔记，退格键擦除，Ctrl+Z撤销。`, `Tuşlar: oklar taşır, 1–${SYMBOLS[n - 1]} girer, N notları açar/kapatır, Backspace siler, Ctrl+Z geri alır.`)}</p>
          </>
        )}

        {!daily && (
          <div className="setup">
            <h3>{t('New puzzle', '新题目', 'Yeni bulmaca')}</h3>
            <div className="row">
              <Pick id="sdk-size" label={t('Grid', '尺寸', 'Izgara')} value={size} onChange={setSize} options={SIZES.map(s => ({ value: s, label: `${s}×${s}` }))} />
              <Pick id="sdk-diff" label={t('Difficulty', '难度', 'Zorluk')} value={diff} onChange={setDiff} options={DIFFICULTIES.map(d => ({ value: d, label: trLabel(cap(d), lang) }))} />
            </div>
            {confirmNew ? (
              <div className="row">
                <button type="button" id="sdk-discard" className="btn primary" onClick={() => start(size, diff)}>{t('Discard and start', '放弃并开始', 'Bırak ve başla')}</button>
                <button type="button" id="sdk-keep" className="btn" onClick={() => setConfirmNew(false)}>{t('Keep playing', '继续做', 'Oynamaya devam')}</button>
              </div>
            ) : <button type="button" id="sdk-new" className="btn primary" onClick={newGame}>{t('Generate', '生成', 'Üret')}</button>}
            <p className="muted small">{t('Easy and Medium are solvable with singles alone. Hard and Expert need candidate eliminations.', '简单和中等只用唯一法就能解出；困难和专家需要排除候选数。', 'Kolay ve Orta yalnızca teklilerle çözülebilir. Zor ve Uzman aday elemesi gerektirir.')}</p>
          </div>
        )}
      </aside>
    </div>
  );
}
