import './huarong.css';
import type { Lang } from '../../core/store';
import { sfx } from '../../core/sound';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useLang, useT, pick as tri } from '../../core/i18n';
import { loadJSON, saveJSON } from '../../core/storage';
import { getData, noteStarted, recordResult } from '../../core/store';
import { fmtTime, Pick } from '../../ui/bits';
import { LAYOUTS } from './layouts';
import { applyMove, canStep, COLS, destinations, parse, ROWS, SIZE, solve, solved, type HMove, type Piece } from './rules';

interface Snap { pieces: Piece[]; moves: number; last: number }
interface Saved extends Snap { layout: string; history: Snap[]; elapsed: number; assisted: boolean; recorded: boolean }

const GENERALS = [['Zhang Fei', '张飞'], ['Zhao Yun', '赵云'], ['Ma Chao', '马超'], ['Huang Zhong', '黄忠'], ['Guan Yu', '关羽']];
/** Names for the blocks: the first lying general is Guan Yu, as in the classic layout. */
function names(pieces: Piece[], lang: Lang): string[] {
  const k = lang === 'zh' ? 1 : 0, out: string[] = [];
  const firstH = pieces.findIndex(p => p.t === 'H');
  const pool = GENERALS.filter(g => g[0] !== 'Guan Yu' || firstH < 0);
  let next = 0;
  pieces.forEach((p, i) => {
    if (p.t === 'C') out[i] = lang === 'zh' ? '曹操' : 'Cao Cao';
    else if (p.t === 'S') out[i] = lang === 'zh' ? '兵' : '';
    else if (i === firstH) out[i] = GENERALS[4][k];
    else out[i] = (pool[next++] ?? GENERALS[4])[k];
  });
  return out;
}
function fresh(id: string): Saved {
  const l = LAYOUTS.find(x => x.id === id) ?? LAYOUTS[0];
  return { layout: l.id, pieces: parse(l.rows), moves: 0, last: -1, history: [], elapsed: 0, assisted: false, recorded: false };
}

export default function Huarong() {
  const t = useT(), lang = useLang();
  const [g, setG] = useState<Saved>(() => loadJSON<Saved | null>('gp.huarong', null) ?? fresh('classic'));
  const [pick, setPick] = useState(g.layout);
  const [sel, setSel] = useState(-1);
  const [hint, setHint] = useState<HMove | null>(null);
  const [busy, setBusy] = useState(false);
  const [auto, setAuto] = useState<HMove[] | null>(null);
  const boardRef = useRef<HTMLDivElement>(null);
  const drag = useRef<{ i: number; x: number; y: number; moved: boolean } | null>(null);
  const layout = LAYOUTS.find(l => l.id === g.layout) ?? LAYOUTS[0];
  const done = solved(g.pieces);
  const label = useMemo(() => names(g.pieces, lang), [g.pieces, lang]);

  useEffect(() => { saveJSON('gp.huarong', g); }, [g]);
  useEffect(() => {
    if (done || g.moves === 0 || auto) return;
    const id = setInterval(() => { if (!document.hidden) setG(s => ({ ...s, elapsed: s.elapsed + 1000 })); }, 1000);
    return () => clearInterval(id);
  }, [done, g.moves, auto]);

  // One move = one piece travelling, so consecutive steps of the same piece count once.
  const commit = (pieces: Piece[], i: number, viaHelp = false) => {
    setG(s => {
      if (s.moves === 0 && !viaHelp) noteStarted('huarong');
      const moves = s.last === i ? s.moves : s.moves + 1;
      const next: Saved = { ...s, pieces, moves, last: i, history: s.last === i ? s.history : [...s.history, { pieces: s.pieces, moves: s.moves, last: s.last }] };
      if (solved(pieces) && !s.recorded) {
        next.recorded = true;
        if (!s.assisted && !viaHelp) recordResult(getData().activeId, 'huarong', { result: 'win', ms: s.elapsed,
          label: `${layout.id} · ${moves} moves${moves === layout.min ? ' · optimal' : ''}`, bestKey: layout.id });
      }
      return next;
    });
    setHint(null);
  };
  const step = (i: number, dr: number, dc: number) => {
    sfx('slide');
    if (done || auto || !canStep(g.pieces, i, dr, dc)) return false;
    commit(g.pieces.map((p, k) => (k === i ? { ...p, r: p.r + dr, c: p.c + dc } : p)), i);
    return true;
  };

  useEffect(() => {
    if (!auto) return;
    if (!auto.length) { setAuto(null); return; }
    const id = setTimeout(() => {
      const m = auto[0], i = g.pieces.findIndex(p => p.r === m.r0 && p.c === m.c0);
      const next = applyMove(g.pieces, m);
      if (next === g.pieces) { setAuto(null); return; }
      commit(next, i, true); setAuto(auto.slice(1));
    }, 420);
    return () => clearTimeout(id);
  }, [auto, g.pieces]); // eslint-disable-line

  const cellFromPoint = (x: number, y: number) => {
    const r = boardRef.current!.getBoundingClientRect();
    return { c: Math.floor(((x - r.left) / r.width) * COLS), r: Math.floor(((y - r.top) / r.height) * ROWS), cw: r.width / COLS, ch: r.height / ROWS };
  };
  const onDown = (e: React.PointerEvent, i: number) => {
    if (done || auto) return;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    drag.current = { i, x: e.clientX, y: e.clientY, moved: false };
    setSel(i);
  };
  const onMove = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d) return;
    const { cw, ch } = cellFromPoint(e.clientX, e.clientY);
    const dx = (e.clientX - d.x) / cw, dy = (e.clientY - d.y) / ch;
    if (Math.abs(dx) >= 0.55 && Math.abs(dx) >= Math.abs(dy)) { if (step(d.i, 0, Math.sign(dx))) { d.x += Math.sign(dx) * cw; d.moved = true; } }
    else if (Math.abs(dy) >= 0.55) { if (step(d.i, Math.sign(dy), 0)) { d.y += Math.sign(dy) * ch; d.moved = true; } }
  };
  const onUp = () => { drag.current = null; };
  // Tapping an empty cell moves the selected piece there, if it can get there in one move.
  const onBoardClick = (e: React.MouseEvent) => {
    if (sel < 0 || done || auto || e.target !== boardRef.current) return;
    const { r, c } = cellFromPoint(e.clientX, e.clientY), p = g.pieces[sel], [w, h] = SIZE[p.t];
    const dest = destinations(g.pieces, sel).find(d => r >= d.r && r < d.r + h && c >= d.c && c < d.c + w);
    if (dest) commit(g.pieces.map((q, k) => (k === sel ? { ...q, r: dest.r, c: dest.c } : q)), sel);
  };
  const onKey = (e: React.KeyboardEvent, i: number) => {
    const d = ({ ArrowUp: [-1, 0], ArrowDown: [1, 0], ArrowLeft: [0, -1], ArrowRight: [0, 1] } as Record<string, number[]>)[e.key];
    if (d) { e.preventDefault(); setSel(i); step(i, d[0], d[1]); }
  };
  const findHint = (all: boolean) => {
    setBusy(true); setSel(-1);
    setTimeout(() => {
      const path = solve(g.pieces);
      setBusy(false);
      if (!path || !path.length) return;
      setG(s => ({ ...s, assisted: true }));
      if (all) setAuto(path); else setHint(path[0]);
    }, 30);
  };
  const undo = () => {
    if (auto || !g.history.length) return;
    const prev = g.history[g.history.length - 1];
    setG({ ...g, ...prev, last: -1, history: g.history.slice(0, -1) }); setHint(null);
  };
  const restart = (id: string) => { setG(fresh(id)); setSel(-1); setHint(null); setAuto(null); };

  const hintPiece = hint ? g.pieces.findIndex(p => p.r === hint.r0 && p.c === hint.c0) : -1;
  const pos = (p: { r: number; c: number }, t0: Piece['t']) => {
    const [w, h] = SIZE[t0];
    return { left: `${(p.c / COLS) * 100}%`, top: `${(p.r / ROWS) * 100}%`, width: `${(w / COLS) * 100}%`, height: `${(h / ROWS) * 100}%` };
  };
  const levelName = (n: number) => [t('Beginner', '入门', 'Acemi'), t('Easy', '简单', 'Kolay'), t('Medium', '中等', 'Orta'), t('Hard', '困难', 'Zor'), t('Expert', '专家', 'Uzman')][n - 1];
  return (
    <div className="play">
      <div className="play-main">
        <div className="statline">
          <span role="status" aria-live="polite">{done ? t('Cao Cao has escaped through Huarong Pass.', '曹操已经逃出华容道！', 'Cao Cao, Huarong Geçidi’nden kaçtı.')
            : busy ? t('Searching for the shortest solution…', '正在寻找最短解法…', 'En kısa çözüm aranıyor…')
            : auto ? t('Showing a shortest solution…', '正在演示最短解法…', 'En kısa çözümlerden biri gösteriliyor…')
            : t('Slide the blocks so Cao Cao reaches the exit at the bottom.', '滑动木块，让曹操到达底部出口。', 'Blokları kaydırarak Cao Cao’yu alttaki çıkışa ulaştır.')}</span>
          <span className="num">{t(`${g.moves} moves · minimum ${layout.min}`, `${g.moves}步 · 最少${layout.min}步`, `${g.moves} hamle · en az ${layout.min}`)}</span>
          <span className="num">{fmtTime(g.elapsed)}</span>
        </div>
        <div className="hr-frame">
          <div className="hr-board" ref={boardRef} onClick={onBoardClick} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp}
            role="group" aria-label={t('Huarong Dao board, 4 by 5. Select a block and use the arrow keys, drag it, or tap an empty cell.', '华容道棋盘，4×5。选中木块后用方向键、拖动或点击空格移动。', 'Huarong Dao tahtası, 4×5. Bir blok seçip ok tuşlarını kullan, sürükle ya da boş bir kareye dokun.')}>
            {hint && hintPiece >= 0 && <div className="hr-ghost" style={pos({ r: hint.r1, c: hint.c1 }, g.pieces[hintPiece].t)} aria-hidden="true" />}
            {g.pieces.map((p, i) => (
              <button key={i} type="button" className={`hr-piece t-${p.t}${i === sel ? ' sel' : ''}${i === hintPiece ? ' hint' : ''}${done && p.t === 'C' ? ' free' : ''}`}
                style={pos(p, p.t)} onPointerDown={e => onDown(e, i)} onKeyDown={e => onKey(e, i)} onFocus={() => setSel(i)}
                aria-label={(label[i] || t('Soldier', '兵', 'Asker')) + ` (${t('row', '行', 'satır')} ${p.r + 1}, ${t('column', '列', 'sütun')} ${p.c + 1})`}>
                <span>{label[i]}</span>
              </button>
            ))}
          </div>
          <div className="hr-exit" aria-hidden="true">{t('Exit', '出口', 'Çıkış')}</div>
        </div>
      </div>
      <aside className="play-side">
        {done && (
          <div className="result" role="status">
            <h3>{g.assisted ? t('Escaped with help', '在帮助下逃出', 'Yardımla kaçtı') : t('Escaped', '成功逃脱', 'Kaçtı')}</h3>
            <p className="num big">{t(`${g.moves} moves`, `${g.moves}步`, `${g.moves} hamle`)}</p>
            <p className="muted">{g.moves === layout.min ? t('That is the minimum for this layout.', '这正是本布局的最少步数。', 'Bu dizilim için en az hamle bu.') : t(`The minimum for this layout is ${layout.min}.`, `本布局最少需要${layout.min}步。`, `Bu dizilim için en az hamle ${layout.min}.`)}
              {g.assisted ? ' ' + t('Hints or the solver were used, so this run is not recorded.', '用了提示或演示，这次不计成绩。', 'İpucu ya da çözücü kullanıldı; bu deneme kaydedilmedi.') : ' ' + fmtTime(g.elapsed)}</p>
            <button type="button" id="hr-again" className="btn primary" onClick={() => restart(g.layout)}>{t('Play again', '再来一次', 'Tekrar oyna')}</button>
          </div>
        )}
        <div className="tools">
          <button type="button" id="hr-undo" className="btn" disabled={!g.history.length || !!auto} onClick={undo}>{t('Undo', '撤销', 'Geri al')}</button>
          <button type="button" id="hr-hint" className="btn" disabled={done || busy || !!auto} onClick={() => findHint(false)}>{t('Hint', '提示', 'İpucu')}</button>
          <button type="button" id="hr-auto" className={'btn' + (auto ? ' on' : '')} disabled={done || busy} onClick={() => (auto ? setAuto(null) : findHint(true))}>{auto ? t('Stop', '停止', 'Durdur') : t('Show solution', '演示解法', 'Çözümü göster')}</button>
        </div>
        {hint && <p className="hint">{t(`Move ${label[hintPiece] || 'the soldier'} to the outlined place.`, `把${label[hintPiece] || '兵'}移到虚线框的位置。`, `${label[hintPiece] || 'Askeri'} işaretli yere taşı.`)}</p>}
        <p className="muted small">{t('Drag a block, or select it and use the arrow keys. With a block selected, tapping an empty cell moves it there if it can reach. Moving one block, even around a corner, counts as one move.',
          '拖动木块，或选中后用方向键移动。选中木块后点击空格，如果能到达就会直接移过去。同一块木块连续移动，即使拐弯，也只算一步。', 'Bir bloğu sürükle ya da seçip ok tuşlarını kullan. Blok seçiliyken boş bir kareye dokunursan ulaşabiliyorsa oraya gider. Bir bloğu köşe dönse bile bir kez taşımak bir hamle sayılır.')}</p>
        <div className="setup">
          <h3>{t('Layout', '布局', 'Dizilim')}</h3>
          <Pick id="hr-layout" label={t('Starting position', '开局', 'Başlangıç dizilimi')} value={pick} onChange={setPick}
            options={LAYOUTS.map(l => ({ value: l.id, label: `${tri(l, lang)} · ${levelName(l.level)} · ${t(`${l.min} moves`, `${l.min}步`, `${l.min} hamle`)}` }))} />
          <button type="button" id="hr-new" className="btn primary" onClick={() => restart(pick)}>{t('Start', '开始', 'Başla')}</button>
        </div>
      </aside>
    </div>
  );
}
