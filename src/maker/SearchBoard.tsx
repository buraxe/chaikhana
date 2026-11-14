import { useEffect, useRef, useState } from 'react';
import { useLang, useT } from '../core/i18n';
import { accepts, txt, type GameDef, type GState, type Input } from './engine';

const HUES = [8, 32, 52, 95, 145, 175, 200, 225, 260, 290, 320, 345];

/** A word search: drag across letters in a straight line (or tap the first and the last). */
export function SearchBoard({ def, st, canAct, onInput }: { def: GameDef; st: GState; canAct: boolean; onInput: (i: Input) => void }) {
  const t = useT(), lang = useLang();
  const w = st.words!, grid = w.grid ?? [], gw = w.gw ?? 0, gh = w.gh ?? 0, placed = w.placed ?? [], found = w.found ?? [];
  const [start, setStart] = useState<number | null>(null);
  const [end, setEnd] = useState<number | null>(null);
  const [anchor, setAnchor] = useState<number | null>(null);
  const [miss, setMiss] = useState(false);
  const dragging = useRef(false);
  // The ends of the drag, kept outside React too: a quick release can come before the last move is drawn.
  const ends = useRef<{ a: number | null; b: number | null }>({ a: null, b: null });
  useEffect(() => { setStart(null); setEnd(null); setAnchor(null); }, [grid]);

  /** The straight line from a to b, or null if they are not in a row, column or diagonal. */
  const line = (a: number, b: number): number[] | null => {
    const r0 = Math.floor(a / gw), c0 = a % gw, r1 = Math.floor(b / gw), c1 = b % gw, dr = r1 - r0, dc = c1 - c0;
    if (dr !== 0 && dc !== 0 && Math.abs(dr) !== Math.abs(dc)) return null;
    const n = Math.max(Math.abs(dr), Math.abs(dc)), sr = Math.sign(dr), sc = Math.sign(dc);
    return Array.from({ length: n + 1 }, (_, k) => (r0 + sr * k) * gw + c0 + sc * k);
  };
  const selCells = start !== null && end !== null ? line(start, end) ?? [start] : anchor !== null ? [anchor] : [];
  const sel = new Set(selCells);
  const colour = new Map<number, number>();
  found.forEach((pi, k) => placed[pi]?.cells.forEach(c => colour.set(c, HUES[k % HUES.length])));

  const submit = (cells: number[]) => {
    if (cells.length < 2) return;
    const inp: Input = { k: 'word', text: cells.map(c => grid[c]).join('') };
    if (accepts(def, st, inp)) onInput(inp);
    else { setMiss(true); setTimeout(() => setMiss(false), 450); }
  };
  const cellAt = (e: React.PointerEvent) => { const el = document.elementFromPoint(e.clientX, e.clientY) as HTMLElement | null; const v = el?.closest('[data-cell]')?.getAttribute('data-cell'); return v == null ? null : Number(v); };
  const down = (e: React.PointerEvent) => {
    if (!canAct) return;
    const c = cellAt(e); if (c === null) return;
    (e.target as Element).releasePointerCapture?.(e.pointerId);
    dragging.current = true; ends.current = { a: c, b: c }; setStart(c); setEnd(c);
  };
  const moveP = (e: React.PointerEvent) => { if (!dragging.current) return; const c = cellAt(e), a = ends.current.a; if (c !== null && a !== null && line(a, c)) { ends.current.b = c; setEnd(c); } };
  const up = (e?: React.PointerEvent) => {
    if (!dragging.current) return;
    dragging.current = false;
    const a = ends.current.a;
    let b = ends.current.b;
    const c = e ? cellAt(e) : null;
    if (c !== null && a !== null && line(a, c)) b = c;
    const start = a, end = b;
    if (start !== null && end !== null && start !== end) { submit(line(start, end) ?? []); setAnchor(null); }
    else if (start !== null) {
      // A tap: the first tap marks the start, a second tap on the same line finishes the word.
      if (anchor === null || anchor === start) setAnchor(anchor === start ? null : start);
      else { const l = line(anchor, start); if (l) submit(l); setAnchor(null); }
    }
    setStart(null); setEnd(null);
  };

  const size = `min(100%, ${gw * (def.words?.locale === 'zh' ? 48 : 40)}px)`;
  return (
    <div className="wk-search">
      {w.theme && <p className="wk-theme">{t('Theme', '主题', 'Tema')}: <b>{txt(w.theme, lang)}</b> · {t(`${found.length} of ${placed.length} found`, `已找到 ${found.length}/${placed.length}`, `${placed.length} kelimeden ${found.length} bulundu`)}</p>}
      <div className={'wk-sgrid' + (miss ? ' miss' : '')} style={{ gridTemplateColumns: `repeat(${gw}, minmax(0, 1fr))`, width: size }} role="grid" aria-label={t('Letter grid', '字母格', 'Harf tablosu')}
        onPointerDown={down} onPointerMove={moveP} onPointerUp={up} onPointerLeave={up} onPointerCancel={up}>
        {grid.map((ch, i) => (
          <span key={i} data-cell={i} className={'wk-sc' + (sel.has(i) ? ' sel' : '') + (colour.has(i) ? ' hit' : '')} style={colour.has(i) ? { ['--hue' as string]: colour.get(i) } : undefined}>{ch}</span>
        ))}
      </div>
      <ul className="wk-swords">
        {placed.map((p, i) => <li key={i} className={found.includes(i) ? 'done' : ''} style={found.includes(i) ? { ['--hue' as string]: HUES[found.indexOf(i) % HUES.length] } : undefined}>{p.word}</li>)}
      </ul>
      <p className="muted small">{t('Drag across a word, or tap its first letter and then its last.', '沿词语拖动，或先点第一个字再点最后一个字。', 'Kelimenin üzerinden sürükle ya da önce ilk, sonra son harfine dokun.')}{gh ? '' : ''}</p>
    </div>
  );
}
