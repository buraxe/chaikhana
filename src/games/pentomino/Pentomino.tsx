import './pentomino.css';
import { useEffect, useRef, useState } from 'react';
import { useT } from '../../core/i18n';
import { sfx } from '../../core/sound';
import { loadJSON, saveJSON } from '../../core/storage';
import { getData, noteStarted, recordResult } from '../../core/store';
import { fmtTime, Seg } from '../../ui/bits';
import { BOARDS, cellsOf, fits, makeBoard, orient, ORIENTS, solveFast, type Board, type Letter, type Placed } from './rules';

interface Saved { b: Board; placed: Placed[]; elapsed: number; assisted: boolean; recorded: boolean; started: boolean }
const make = (id: string): Saved => ({ b: makeBoard(id), placed: [], elapsed: 0, assisted: false, recorded: false, started: false });
const HUE: Record<Letter, number> = { F: 8, I: 38, L: 62, N: 95, P: 140, T: 172, U: 198, V: 222, W: 255, X: 285, Y: 318, Z: 345 };
/** The piece's cell nearest its middle: the one that sits under the pointer. */
const handle = (l: Letter, o: number) => {
  const c = orient(l, o), mx = c.reduce((a, p) => a + p[0], 0) / 5, my = c.reduce((a, p) => a + p[1], 0) / 5;
  return c.reduce((best, p) => (Math.hypot(p[0] - mx, p[1] - my) < Math.hypot(best[0] - mx, best[1] - my) ? p : best));
};
/** Next orientation after a quarter turn (dir ±1) or a mirror, among the piece's distinct ones. */
function turn(l: Letter, o: number, how: 'cw' | 'ccw' | 'flip'): number {
  const next = how === 'flip' ? (o ^ 4) : how === 'cw' ? ((o & 4) | ((o + 1) & 3)) : ((o & 4) | ((o + 3) & 3));
  const want = JSON.stringify(orient(l, next));
  return ORIENTS[l].find(k => JSON.stringify(orient(l, k)) === want) ?? next;
}

export default function Pentomino() {
  const t = useT();
  const [g, setG] = useState<Saved>(() => loadJSON<Saved | null>('gp.pentomino', null) ?? make('5×6'));
  const [boardId, setBoardId] = useState(g.b.id);
  const [sel, setSel] = useState<{ l: Letter; o: number } | null>(null);
  const [hover, setHover] = useState<[number, number] | null>(null);
  const [note, setNote] = useState('');
  const svg = useRef<SVGSVGElement>(null);
  const { w, h } = g.b;
  const used = new Set(g.placed.map(p => p.l));
  const tray = g.b.pieces.filter(l => !used.has(l));
  const done = tray.length === 0;
  const taken = new Set<number>(); for (const p of g.placed) for (const [x, y] of cellsOf(p)) taken.add(y * w + x);

  useEffect(() => { saveJSON('gp.pentomino', g); }, [g]);
  useEffect(() => {
    if (done || !g.started) return;
    const id = setInterval(() => { if (!document.hidden) setG(s => ({ ...s, elapsed: s.elapsed + 1000 })); }, 1000);
    return () => clearInterval(id);
  }, [done, g.started]);
  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      if (!sel || (e.target as HTMLElement)?.tagName === 'INPUT') return;
      if (e.key === 'r' || e.key === 'R') setSel({ ...sel, o: turn(sel.l, sel.o, e.shiftKey ? 'ccw' : 'cw') });
      else if (e.key === 'f' || e.key === 'F') setSel({ ...sel, o: turn(sel.l, sel.o, 'flip') });
      else if (e.key === 'Escape') setSel(null);
    };
    window.addEventListener('keydown', k); return () => window.removeEventListener('keydown', k);
  }, [sel]);

  const ghostAt = (cx: number, cy: number): Placed | null => { if (!sel) return null; const [hx, hy] = handle(sel.l, sel.o); return { l: sel.l, o: sel.o, x: cx - hx, y: cy - hy }; };
  const cellFromEvent = (e: React.PointerEvent): [number, number] | null => {
    const m = svg.current?.getScreenCTM()?.inverse(); if (!m) return null;
    const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(m), x = Math.floor(p.x), y = Math.floor(p.y);
    return x >= 0 && y >= 0 && x < w && y < h ? [x, y] : null;
  };
  const place = (next: Placed[], extra: Partial<Saved> = {}) => {
    const s: Saved = { ...g, ...extra, placed: next, started: true };
    if (!g.started) noteStarted('pentomino');
    if (next.length === g.b.pieces.length && !g.recorded) {
      setTimeout(() => sfx('win'), 150);
      if (!s.assisted) { s.recorded = true; recordResult(getData().activeId, 'pentomino', { result: 'win', ms: g.elapsed, label: `${g.b.id} · ${g.b.pieces.length} pieces`, bestKey: g.b.id }); }
    }
    setG(s);
  };
  const click = (e: React.PointerEvent) => {
    if (done) return;
    const c = cellFromEvent(e); if (!c) return;
    const at = g.placed.findIndex(p => cellsOf(p).some(([x, y]) => x === c[0] && y === c[1]));
    if (at >= 0 && !sel) {
      // Pick a placed piece back up, keeping how it was turned.
      const p = g.placed[at]; setSel({ l: p.l, o: p.o }); setG({ ...g, placed: g.placed.filter((_, i) => i !== at) }); sfx('click', 0.4); setNote(''); return;
    }
    const gp = ghostAt(c[0], c[1]);
    if (!gp) return;
    if (!fits(w, h, taken, gp)) { sfx('error', 0.5); return; }
    sfx('peg'); setSel(null); setNote('');
    place([...g.placed, gp]);
  };
  const hint = () => {
    const out: { gaveUp?: boolean } = {};
    const sol = solveFast(w, h, g.placed, g.b.pieces, undefined, 1_500_000, out);
    if (!sol) { setNote(out.gaveUp ? t('No quick answer from here. Try taking a piece off.', '从这里一时找不到解，试着拿走一块。', 'Buradan hızlı bir çözüm bulunamadı. Bir parçayı geri almayı dene.') : t('The pieces on the board cannot all stay: take one off and try again.', '盘上的块不能全部保留：拿走一块再试。', 'Tahtadaki parçaların hepsi kalamaz: birini geri al ve yeniden dene.')); return; }
    setNote(t(`Hint: the ${sol[0].l} goes here.`, `提示：${sol[0].l}放在这里。`, `İpucu: ${sol[0].l} buraya gelir.`));
    setSel(null); place([...g.placed, sol[0]], { assisted: true });
  };
  const ghost = hover ? ghostAt(hover[0], hover[1]) : null;
  const ghostOk = ghost ? fits(w, h, taken, ghost) : false;
  const pieceSvg = (l: Letter, o: number) => {
    const c = orient(l, o), cw = Math.max(...c.map(p => p[0])) + 1, ch = Math.max(...c.map(p => p[1])) + 1, s = Math.max(cw, ch);
    return <svg viewBox={`${(cw - s) / 2 - 0.3} ${(ch - s) / 2 - 0.3} ${s + 0.6} ${s + 0.6}`} aria-hidden="true">{c.map(([x, y], i) => <rect key={i} x={x} y={y} width={1} height={1} style={{ ['--hue' as string]: HUE[l] }} />)}</svg>;
  };

  return (
    <div className="play">
      <div className="play-main">
        <div className="statline"><span role="status" aria-live="polite">{done ? t('The rectangle is full!', '长方形拼满了！', 'Dikdörtgen doldu!') : sel ? t(`Place the ${sel.l}: tap the board. R turns it, F flips it.`, `放${sel.l}：点棋盘。R旋转，F翻转。`, `${sel.l} parçasını yerleştir: tahtaya dokun. R döndürür, F çevirir.`) : t('Pick a piece below, or tap a placed piece to lift it.', '从下面选一块，或点盘上的块把它拿起。', 'Aşağıdan bir parça seç ya da yerleşmiş bir parçaya dokunup kaldır.')}</span><span className="num">{fmtTime(g.elapsed)}</span></div>
        <svg ref={svg} className="pt-board" viewBox={`-0.1 -0.1 ${w + 0.2} ${h + 0.2}`} onPointerMove={e => setHover(cellFromEvent(e))} onPointerLeave={() => setHover(null)} onPointerUp={click}
          role="grid" aria-label={t(`Board ${w} by ${h}`, `${w}×${h}棋盘`, `${w}×${h} tahta`)}>
          {Array.from({ length: w * h }, (_, i) => <rect key={i} className="pt-cell" x={i % w} y={Math.floor(i / w)} width={1} height={1} />)}
          {g.placed.map((p, i) => <g key={i} className="pt-piece" style={{ ['--hue' as string]: HUE[p.l] }}>{cellsOf(p).map(([x, y], k) => <rect key={k} x={x} y={y} width={1} height={1} />)}<text x={cellsOf(p)[2][0] + 0.5} y={cellsOf(p)[2][1] + 0.68}>{p.l}</text></g>)}
          {ghost && <g className={'pt-ghost' + (ghostOk ? '' : ' bad')} style={{ ['--hue' as string]: HUE[ghost.l] }}>{cellsOf(ghost).filter(([x, y]) => x >= 0 && y >= 0 && x < w && y < h).map(([x, y], k) => <rect key={k} x={x} y={y} width={1} height={1} />)}</g>}
        </svg>
        <div className="pt-tray" role="list" aria-label={t('Pieces to place', '待放的块', 'Yerleştirilecek parçalar')}>
          {tray.map(l => (
            <button key={l} type="button" role="listitem" id={'pt-' + l} className={'pt-tp' + (sel?.l === l ? ' on' : '')} onClick={() => { setSel(sel?.l === l ? null : { l, o: sel?.l === l ? sel.o : ORIENTS[l][0] }); setNote(''); }} aria-label={t(`Piece ${l}`, `${l}块`, `${l} parçası`)}>
              {pieceSvg(l, sel?.l === l ? sel.o : ORIENTS[l][0])}<span>{l}</span>
            </button>
          ))}
        </div>
        {note && <p className="hint">{note}</p>}
      </div>
      <aside className="play-side">
        {done && <div className="result" role="status"><h3>{g.assisted ? t('Filled with hints', '在提示下完成', 'İpuçlarıyla doldu') : t('Filled', '完成', 'Doldu')}</h3><p className="num big">{fmtTime(g.elapsed)}</p></div>}
        <div className="tools">
          <button type="button" id="pt-rotl" className="btn" disabled={!sel} onClick={() => sel && setSel({ ...sel, o: turn(sel.l, sel.o, 'ccw') })} aria-label={t('Turn left', '向左转', 'Sola döndür')}>⟲</button>
          <button type="button" id="pt-rotr" className="btn" disabled={!sel} onClick={() => sel && setSel({ ...sel, o: turn(sel.l, sel.o, 'cw') })} aria-label={t('Turn right', '向右转', 'Sağa döndür')}>⟳</button>
          <button type="button" id="pt-flip" className="btn" disabled={!sel} onClick={() => sel && setSel({ ...sel, o: turn(sel.l, sel.o, 'flip') })}>{t('Flip', '翻转', 'Çevir')}</button>
        </div>
        <div className="tools">
          <button type="button" id="pt-hint" className="btn" disabled={done} onClick={hint}>{t('Hint', '提示', 'İpucu')}</button>
          <button type="button" id="pt-undo" className="btn" disabled={!g.placed.length || done} onClick={() => setG({ ...g, placed: g.placed.slice(0, -1) })}>{t('Undo', '撤销', 'Geri al')}</button>
          <button type="button" className="btn" disabled={!g.placed.length || done} onClick={() => { setG({ ...g, placed: [] }); setNote(''); }}>{t('Clear', '清空', 'Temizle')}</button>
        </div>
        <p className="muted small">{t('Pentominoes are the twelve shapes made of five squares, each named after the letter it looks like. Fill the rectangle with the pieces shown, using each once. Pieces may be turned and flipped.', '五连块是由五个正方形组成的十二种形状，每种都以它像的字母命名。用下方的块把长方形填满，每块用一次，可以旋转和翻转。', 'Pentominolar beş kareden oluşan on iki şekildir; her biri benzediği harfin adını taşır. Gösterilen parçaların her birini bir kez kullanarak dikdörtgeni doldur. Parçalar döndürülüp çevrilebilir.')}</p>
        <div className="setup">
          <Seg id="pt-board" label={t('Board', '棋盘', 'Tahta')} value={boardId} onChange={setBoardId} options={BOARDS.map(b => ({ value: b.id, label: b.id }))} />
          <button type="button" id={done ? 'pt-again' : 'pt-new'} className="btn primary" onClick={() => { setG(make(boardId)); setSel(null); setNote(''); }}>{t('New board', '新棋盘', 'Yeni tahta')}</button>
        </div>
      </aside>
    </div>
  );
}
