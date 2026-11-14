import './sokoban.css';
import { useEffect, useRef, useState } from 'react';
import { useT } from '../../core/i18n';
import { sfx } from '../../core/sound';
import { loadJSON, saveJSON } from '../../core/storage';
import { getData, noteStarted, recordResult } from '../../core/store';
import { fmtTime, Seg } from '../../ui/bits';
import { generate, move, pathTo, solved, start, undo, type Level, type SokoState } from './rules';

type Size = 'small' | 'medium' | 'large';
interface Saved { size: Size; s: SokoState; elapsed: number; recorded: boolean }
const make = (size: Size): Saved => ({ size, s: start(generate(size, Math.random)), elapsed: 0, recorded: false });

export default function Sokoban() {
  const t = useT();
  const [g, setG] = useState<Saved>(() => loadJSON<Saved | null>('gp.sokoban', null) ?? make('small'));
  const [size, setSize] = useState<Size>(g.size);
  const touch = useRef<{ x: number; y: number } | null>(null);
  useEffect(() => { saveJSON('gp.sokoban', g); }, [g]);
  const done = solved(g.s), L: Level = g.s.lvl;
  useEffect(() => {
    if (done || !g.s.moves) return;
    const id = setInterval(() => { if (!document.hidden) setG(x => ({ ...x, elapsed: x.elapsed + 1000 })); }, 1000);
    return () => clearInterval(id);
  }, [done, g.s.moves > 0]); // eslint-disable-line
  const apply = (dirs: ('up' | 'down' | 'left' | 'right')[]) => {
    if (done) return;
    let s = g.s; for (const d of dirs) s = move(s, d);
    if (s === g.s) return;
    if (!g.s.moves) noteStarted('sokoban');
    sfx(s.pushes > g.s.pushes ? 'slide' : 'click', s.pushes > g.s.pushes ? 0.8 : 0.3);
    let recorded = g.recorded;
    if (solved(s) && !recorded) { recorded = true; setTimeout(() => sfx('win'), 200); recordResult(getData().activeId, 'sokoban', { result: 'win', ms: g.elapsed, label: `${g.size} · ${s.moves} moves, ${s.pushes} pushes`, bestKey: g.size }); }
    setG({ ...g, s, recorded });
  };
  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).closest('input, select, textarea')) return;
      const d = ({ ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right' } as Record<string, 'up' | 'down' | 'left' | 'right'>)[e.key];
      if (d) { e.preventDefault(); apply([d]); } else if (e.key === 'z' || e.key === 'u') setG(x => ({ ...x, s: undo(x.s) }));
    };
    window.addEventListener('keydown', k); return () => window.removeEventListener('keydown', k);
  });
  const tap = (i: number) => {
    const w = L.w, dx = (i % w) - (g.s.player % w), dy = Math.floor(i / w) - Math.floor(g.s.player / w);
    // Next to the keeper: step or push that way.
    if (Math.abs(dx) + Math.abs(dy) === 1) return apply([dx === 1 ? 'right' : dx === -1 ? 'left' : dy === 1 ? 'down' : 'up']);
    const p = pathTo(g.s, i); if (p) apply(p);
  };
  const onGoal = (b: number) => L.goals.includes(b);
  return (
    <div className="play">
      <div className="play-main">
        <div className="statline">
          <span role="status" aria-live="polite">{done ? t('Every box is home!', '所有箱子都到位了！', 'Bütün kutular yerinde!') : t(`${g.s.boxes.filter(onGoal).length} of ${L.goals.length} boxes on targets`, `${g.s.boxes.filter(onGoal).length}/${L.goals.length} 个箱子到位`, `${L.goals.length} kutudan ${g.s.boxes.filter(onGoal).length} tanesi hedefte`)}</span>
          <span className="num">{t(`${g.s.moves} moves · ${g.s.pushes} pushes`, `${g.s.moves}步 · 推${g.s.pushes}次`, `${g.s.moves} adım · ${g.s.pushes} itiş`)}</span><span className="num">{fmtTime(g.elapsed)}</span>
        </div>
        <svg className="sk-board" viewBox={`0 0 ${L.w} ${L.h}`} role="grid" aria-label={t('Sokoban', '推箱子', 'Sokoban')}
          onPointerDown={e => { touch.current = { x: e.clientX, y: e.clientY }; }}
          onPointerUp={e => { const s = touch.current; touch.current = null; if (!s) return; const dx = e.clientX - s.x, dy = e.clientY - s.y; if (Math.max(Math.abs(dx), Math.abs(dy)) > 30) apply([Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up')]); }}>
          {L.walls.map((wl, i) => <rect key={i} x={i % L.w} y={Math.floor(i / L.w)} width={1} height={1} className={wl ? 'sk-wall' : 'sk-floor'} onClick={() => !wl && tap(i)} />)}
          {L.goals.map(i => <circle key={'g' + i} cx={(i % L.w) + 0.5} cy={Math.floor(i / L.w) + 0.5} r={0.18} className="sk-goal" />)}
          {g.s.boxes.map((b, k) => <g key={'b' + k} className={'sk-box' + (onGoal(b) ? ' home' : '')} transform={`translate(${b % L.w} ${Math.floor(b / L.w)})`} onClick={() => tap(b)}><rect x={0.08} y={0.08} width={0.84} height={0.84} rx={0.08} /><path d="M0.08 0.08L0.92 0.92M0.92 0.08L0.08 0.92" /></g>)}
          <g className="sk-me" transform={`translate(${(g.s.player % L.w) + 0.5} ${Math.floor(g.s.player / L.w) + 0.5})`}><circle r={0.36} /><circle cx={-0.12} cy={-0.08} r={0.05} className="eye" /><circle cx={0.12} cy={-0.08} r={0.05} className="eye" /></g>
        </svg>
        <div className="sk-pad" aria-hidden="true">
          <button type="button" className="btn" tabIndex={-1} onClick={() => apply(['up'])}>↑</button>
          <button type="button" className="btn" tabIndex={-1} onClick={() => apply(['left'])}>←</button>
          <button type="button" className="btn" tabIndex={-1} onClick={() => apply(['down'])}>↓</button>
          <button type="button" className="btn" tabIndex={-1} onClick={() => apply(['right'])}>→</button>
        </div>
      </div>
      <aside className="play-side">
        <p className="muted small">{t('Push every box onto a target. You can push but never pull, and only one box at a time. Tap a floor square to walk there, or swipe and use the arrows.', '把所有箱子推到目标点。只能推不能拉，一次只能推一个。点地面可以走过去，也可以滑动或用方向键。', 'Her kutuyu bir hedefe it. İtebilirsin ama çekemezsin, bir seferde yalnızca bir kutu. Yürümek için bir kareye dokun ya da kaydır ve okları kullan.')}</p>
        <div className="tools">
          <button type="button" id="sk-undo" className="btn" disabled={!g.s.history.length || done} onClick={() => setG({ ...g, s: undo(g.s) })}>{t('Undo', '撤销', 'Geri al')}</button>
          <button type="button" id="sk-reset" className="btn" onClick={() => setG({ ...g, s: start(L), elapsed: 0, recorded: false })}>{t('Restart level', '重开本关', 'Bölümü baştan al')}</button>
        </div>
        <div className="setup">
          <Seg id="sk-size" label={t('Size', '大小', 'Boyut')} value={size} onChange={setSize} options={[{ value: 'small', label: t('Small · 2 boxes', '小 · 2箱', 'Küçük · 2 kutu') }, { value: 'medium', label: t('Medium · 3', '中 · 3箱', 'Orta · 3') }, { value: 'large', label: t('Large · 4', '大 · 4箱', 'Büyük · 4') }]} />
          <button type="button" id={done ? 'sk-again' : 'sk-new'} className="btn primary" onClick={() => setG(make(size))}>{t('New level', '新关卡', 'Yeni bölüm')}</button>
        </div>
      </aside>
    </div>
  );
}
