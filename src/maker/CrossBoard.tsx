import { useEffect, useMemo, useState } from 'react';
import { useLang, useT } from '../core/i18n';
import { upper, type GameDef, type GState, type Input } from './engine';
import type { Placed } from './wordgen';

/** A crossword: the grid, the clue lists, typing by keyboard or the on-screen keys, checks and reveals. */
export function CrossBoard({ def, st, canAct, onInput }: { def: GameDef; st: GState; canAct: boolean; onInput: (i: Input) => void }) {
  const t = useT(), lang = useLang();
  const w = st.words!, grid = w.grid ?? [], gw = w.gw ?? 0, gh = w.gh ?? 0, placed = w.placed ?? [], filled = w.filled ?? [];
  const firstOpen = grid.findIndex(Boolean);
  const [sel, setSel] = useState(firstOpen);
  const [dir, setDir] = useState<'a' | 'd'>('a');
  const [check, setCheck] = useState(false);
  useEffect(() => { setSel(grid.findIndex(Boolean)); setDir('a'); setCheck(false); }, [grid]);

  const nums = useMemo(() => { const m = new Map<number, number>(); placed.forEach(p => m.set(p.cells[0], p.num!)); return m; }, [placed]);
  const wordAt = (cell: number, d: 'a' | 'd'): Placed | undefined => placed.find(p => p.dir === d && p.cells.includes(cell)) ?? placed.find(p => p.cells.includes(cell));
  const cur = sel >= 0 ? wordAt(sel, dir) : undefined;
  const curCells = new Set(cur?.cells ?? []);
  const alphabet = (def.words?.alphabet ?? [...new Set(grid.join(''))].sort().join('')).trim();
  const keyRows = alphabet.includes(' ') ? alphabet.split(/\s+/) : [alphabet];

  const go = (cell: number, d = dir) => { if (cell >= 0 && grid[cell]) { setSel(cell); if (!placed.some(p => p.dir === d && p.cells.includes(cell))) setDir(d === 'a' ? 'd' : 'a'); else setDir(d); } };
  const tap = (cell: number) => { if (cell === sel) { const other = dir === 'a' ? 'd' : 'a'; if (placed.some(p => p.dir === other && p.cells.includes(cell))) setDir(other); } else go(cell); };
  const step = (k: number) => { if (!cur) return; const i = cur.cells.indexOf(sel) + k; if (i >= 0 && i < cur.cells.length) setSel(cur.cells[i]); };
  const nextWord = (k = 1) => { const i = cur ? placed.indexOf(cur) : -1, n = placed[(i + k + placed.length) % placed.length]; if (n) { setSel(n.cells[0]); setDir(n.dir!); } };
  const type = (ch: string) => { if (!canAct || sel < 0) return; onInput({ k: 'letter', cell: sel, ch }); step(1); };
  const erase = () => {
    if (!canAct || sel < 0) return;
    if (filled[sel]) onInput({ k: 'letter', cell: sel, ch: '' });
    else if (cur) { const i = cur.cells.indexOf(sel); if (i > 0) { setSel(cur.cells[i - 1]); onInput({ k: 'letter', cell: cur.cells[i - 1], ch: '' }); } }
  };
  const move = (dr: number, dc: number) => {
    let r = Math.floor(sel / gw) + dr, c = (sel % gw) + dc;
    while (r >= 0 && c >= 0 && r < gh && c < gw) { const i = r * gw + c; if (grid[i]) { setSel(i); setDir(dr ? 'd' : 'a'); return; } r += dr; c += dc; }
  };
  const letters = new Set([...alphabet.replace(/\s/g, '')]);
  useEffect(() => {
    if (!canAct) return;
    const on = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      const el = e.target as HTMLElement;
      if (el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.tagName === 'SELECT' || el.isContentEditable)) return;
      const k = e.key;
      if (k === 'Backspace') { e.preventDefault(); erase(); }
      else if (k === 'ArrowRight') { e.preventDefault(); move(0, 1); }
      else if (k === 'ArrowLeft') { e.preventDefault(); move(0, -1); }
      else if (k === 'ArrowDown') { e.preventDefault(); move(1, 0); }
      else if (k === 'ArrowUp') { e.preventDefault(); move(-1, 0); }
      else if (k === 'Tab' || k === 'Enter') { e.preventDefault(); nextWord(e.shiftKey ? -1 : 1); }
      else if (k.length === 1) { const ch = upper(def, k); if (letters.has(ch) || /\p{L}/u.test(ch)) { e.preventDefault(); type(ch); } }
    };
    window.addEventListener('keydown', on);
    return () => window.removeEventListener('keydown', on);
  });

  const revealWord = () => { if (cur) for (const c of cur.cells) if (filled[c] !== grid[c]) onInput({ k: 'reveal', cell: c }); };
  const list = (d: 'a' | 'd') => placed.filter(p => p.dir === d);
  const done = (p: Placed) => p.cells.every(c => filled[c] === grid[c]);
  const head = (d: 'a' | 'd') => d === 'a' ? t('Across', '横向', 'Soldan sağa') : t('Down', '纵向', 'Yukarıdan aşağı');

  return (
    <div className="wk-cross">
      <div className="wk-cluebar" aria-live="polite">{cur ? <><b>{cur.num} {head(cur.dir!)}</b> {cur.clue ?? '…'}</> : ' '}</div>
      <div className="wk-cgridw">
        <div className="wk-cgrid2" style={{ gridTemplateColumns: `repeat(${gw}, minmax(0, 1fr))`, width: `min(100%, ${gw * 42}px)` }} role="grid" aria-label={t('Crossword', '填字游戏', 'Bulmaca')}>
          {grid.map((ch, i) => ch
            ? <button key={i} type="button" data-cell={i} className={'wk-cc' + (i === sel ? ' sel' : curCells.has(i) ? ' word' : '') + (check && filled[i] && filled[i] !== ch ? ' bad' : '')} onClick={() => tap(i)} aria-label={`${nums.get(i) ?? ''} ${filled[i] || t('empty', '空', 'boş')}`}>
                {nums.has(i) && <small>{nums.get(i)}</small>}<span>{filled[i]}</span>
              </button>
            : <span key={i} className="wk-cb" aria-hidden="true" />)}
        </div>
      </div>
      {canAct && (
        <div className="wk-kbd">
          {keyRows.map((row, i) => (
            <div key={i} className="wk-krow">
              {[...row].map(ch => <button key={ch} type="button" className="wk-key" onClick={() => type(ch)}>{ch}</button>)}
              {i === keyRows.length - 1 && <button type="button" className="wk-key wide" id="wk-cback" onClick={erase} aria-label={t('Delete', '删除', 'Sil')}>⌫</button>}
            </div>
          ))}
        </div>
      )}
      <div className="tools">
        <button type="button" className={'btn sm' + (check ? ' on' : '')} id="wk-check" aria-pressed={check} onClick={() => setCheck(c => !c)}>{t('Check', '检查', 'Kontrol et')}</button>
        <button type="button" className="btn sm" id="wk-reveal" disabled={!canAct || sel < 0 || filled[sel] === grid[sel]} onClick={() => onInput({ k: 'reveal', cell: sel })}>{t('Reveal letter', '揭开字母', 'Harf aç')}</button>
        <button type="button" className="btn sm" id="wk-reveal-word" disabled={!canAct || !cur || done(cur)} onClick={revealWord}>{t('Reveal word', '揭开单词', 'Kelimeyi aç')}</button>
        {(w.reveals ?? 0) > 0 && <span className="muted small">{t(`${w.reveals} letters revealed`, `已揭开 ${w.reveals} 个字母`, `${w.reveals} harf açıldı`)}</span>}
      </div>
      <div className="wk-clues">
        {(['a', 'd'] as const).map(d => (
          <section key={d}>
            <h4>{head(d)}</h4>
            <ol>
              {list(d).map(p => (
                <li key={p.num + d} className={(cur === p ? 'on' : '') + (done(p) ? ' done' : '')}>
                  <button type="button" onClick={() => { setSel(p.cells[0]); setDir(d); }}><b>{p.num}</b> {p.clue ?? '…'} <i>({p.cells.length})</i></button>
                </li>
              ))}
            </ol>
          </section>
        ))}
      </div>
      {st.over && <p className="muted small">{lang === 'tr' ? 'Tebrikler!' : lang === 'zh' ? '恭喜！' : 'Well done!'}</p>}
    </div>
  );
}
