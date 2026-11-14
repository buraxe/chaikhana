import './soma.css';
import { useEffect, useMemo, useRef, useState } from 'react';
import type * as THREE_NS from 'three';
import { useLang, useT } from '../../core/i18n';
import { sfx } from '../../core/sound';
import { loadJSON, saveJSON } from '../../core/storage';
import { getData, noteStarted, recordResult } from '../../core/store';
import { attachOrbit, createStage, loadThree, screenAxes, type Stage } from '../../core/three/engine';
import { Seg } from '../../ui/bits';
import { cellKey, normal, PIECES, rotX, rotY, rotZ, solve, type Figure, type V3 } from './rules';

interface Active { piece: number; cells: V3[]; at: V3 }
interface Saved { fig: string; placed: Record<number, V3[]>; active: Active | null; moves: number; recorded: boolean; hints: number; built: string[] }
const fresh = (fig: string, built: string[] = []): Saved => ({ fig, placed: {}, active: null, moves: 0, recorded: false, hints: 0, built });
const shift = (cells: V3[], at: V3): V3[] => cells.map(c => [c[0] + at[0], c[1] + at[1], c[2] + at[2]] as V3);

/** Building with polycubes: Soma figures, packing boxes and assembly figures all use this. */
export interface PolyProps { game: string; store: string; figures: Figure[]; label: [string, string, string]; intro?: [string, string, string] }
export default function Poly({ game, store, figures: FIGURES, label, intro }: PolyProps) {
  const t = useT(), lang = useLang(), li = lang === 'zh' ? 1 : lang === 'tr' ? 2 : 0;
  const [g, setG] = useState<Saved>(() => loadJSON<Saved | null>(store, null) ?? fresh(FIGURES[0].id));
  const [state3d, setState3d] = useState<'loading' | 'ready' | 'failed'>('loading');
  const [axes, setAxes] = useState<ReturnType<typeof screenAxes> | null>(null);
  const [msg, setMsg] = useState('');
  const canvasRef = useRef<HTMLCanvasElement>(null), stage = useRef<Stage | null>(null), live = useRef<THREE_NS.Group | null>(null);
  const tapRef = useRef<(p: number | null) => void>(() => {});
  useEffect(() => { saveJSON(store, g); }, [g]); // eslint-disable-line
  const fig = FIGURES.find(f => f.id === g.fig) ?? FIGURES[0], PCS = fig.pieces ?? PIECES, N = PCS.length;
  const figSet = useMemo(() => new Set(fig.cells.map(cellKey)), [fig]);
  const centre = useMemo(() => [0, 1, 2].map(a => (Math.min(...fig.cells.map(c => c[a])) + Math.max(...fig.cells.map(c => c[a]))) / 2), [fig]);
  const placedCount = Object.keys(g.placed).length, done = placedCount === N;
  const taken = useMemo(() => { const s = new Set<string>(); Object.values(g.placed).forEach(cs => cs.forEach(c => s.add(cellKey(c)))); return s; }, [g.placed]);
  const activeCells = g.active ? shift(g.active.cells, g.active.at) : [];
  const fits = activeCells.length > 0 && activeCells.every(c => figSet.has(cellKey(c)) && !taken.has(cellKey(c)));

  useEffect(() => {
    let dead = false;
    loadThree().then(THREE => {
      if (dead || !canvasRef.current) return;
      const S = createStage(THREE, canvasRef.current, { radius: 12 });
      S.orbit.min = 6; S.orbit.max = 26; S.orbit.phi = 0.95; S.orbit.theta = 0.6;
      stage.current = S;
      const grp = new THREE.Group(); S.scene.add(grp); live.current = grp;
      attachOrbit(S, canvasRef.current, {
        targets: () => grp.children.filter(o => typeof o.userData.piece === 'number'),
        onTap: o => tapRef.current(o ? (o.userData.piece as number) : null),
        onView: () => setAxes(screenAxes(S)),
      });
      setAxes(screenAxes(S)); setState3d('ready');
    }).catch(() => { if (!dead) setState3d('failed'); });
    return () => { dead = true; stage.current?.dispose(); stage.current = null; live.current = null; };
  }, []);

  // Redraw: the figure as glass, placed pieces solid, the piece in hand see-through.
  useEffect(() => {
    const S = stage.current, grp = live.current; if (!S || !grp) return;
    const THREE = S.THREE;
    grp.children.slice().forEach(o => { grp.remove(o); const m = o as THREE_NS.Mesh; m.geometry?.dispose(); (m.material as THREE_NS.Material)?.dispose?.(); });
    const box = new THREE.BoxGeometry(0.96, 0.96, 0.96);
    const put = (c: V3, mat: THREE_NS.Material, piece?: number, edge = 0x000000, edgeOp = 0.25) => {
      const m = new THREE.Mesh(box, mat); m.position.set(c[0] - centre[0], c[1] - centre[1], c[2] - centre[2]); if (piece !== undefined) m.userData.piece = piece; grp.add(m);
      const e = new THREE.LineSegments(new THREE.EdgesGeometry(box), new THREE.LineBasicMaterial({ color: edge, transparent: true, opacity: edgeOp })); e.position.copy(m.position); grp.add(e);
    };
    const glass = new THREE.MeshStandardMaterial({ color: 0x9fb4c8, transparent: true, opacity: 0.12, depthWrite: false });
    for (const c of fig.cells) if (!taken.has(cellKey(c))) put(c, glass, undefined, 0x51667a, 0.35);
    Object.entries(g.placed).forEach(([p, cs]) => { const mat = new THREE.MeshStandardMaterial({ color: PCS[+p].color, roughness: 0.55 }); cs.forEach(c => put(c, mat, +p)); });
    if (g.active) {
      const mat = new THREE.MeshStandardMaterial({ color: PCS[g.active.piece].color, transparent: true, opacity: 0.78, emissive: fits ? 0x0b3d1c : 0x6b0f0f, roughness: 0.4 });
      activeCells.forEach(c => put(c, mat, g.active!.piece, fits ? 0x0b3d1c : 0x6b0f0f, 0.9));
    }
  }, [g.placed, g.active, fig, state3d]); // eslint-disable-line

  const change = (s: Saved) => { if (!g.moves) noteStarted(game); setG({ ...s, moves: s.moves + 1 }); setMsg(''); };
  /** Takes a piece in hand: from the tray it appears above the figure; from the figure, where it was. */
  const take = (p: number) => {
    if (done) return;
    if (g.active?.piece === p) return;
    const placed = { ...g.placed };
    let active: Active;
    if (placed[p]) { const n = normal(placed[p]); const m = [0, 1, 2].map(a => Math.min(...placed[p].map(c => c[a]))) as V3; active = { piece: p, cells: n, at: m }; delete placed[p]; }
    else { const top = Math.max(...fig.cells.map(c => c[1])); active = { piece: p, cells: normal(PCS[p].cells), at: [Math.floor(centre[0]) - 1, top + 1, Math.floor(centre[2]) - 1] }; }
    // Whatever was in hand goes back to the tray.
    sfx('click', 0.5); change({ ...g, placed, active });
  };
  tapRef.current = p => { if (p === null || g.active?.piece === p) return; take(p); };
  const move = (axis: number, sign: number) => { if (!g.active) return; const at = g.active.at.slice() as V3; at[axis] += sign; sfx('click', 0.25); change({ ...g, active: { ...g.active, at } }); };
  const rotate = (f: (c: V3) => V3) => {
    if (!g.active) return;
    const before = shift(g.active.cells, g.active.at), turned = normal(g.active.cells.map(f));
    // Keep the piece roughly where it was: same centre.
    const cb = [0, 1, 2].map(a => before.reduce((s, c) => s + c[a], 0) / before.length), ct = [0, 1, 2].map(a => turned.reduce((s, c) => s + c[a], 0) / turned.length);
    const at = [0, 1, 2].map(a => Math.round(cb[a] - ct[a])) as V3;
    sfx('click', 0.35); change({ ...g, active: { ...g.active, cells: turned, at } });
  };
  const place = (hinted = false) => {
    if (!g.active || !fits) { sfx('error', 0.4); setMsg(t('It must sit inside the figure without overlapping.', '它必须放在图形里面，而且不能重叠。', 'Figürün içinde ve çakışmadan durmalı.')); return; }
    const placed = { ...g.placed, [g.active.piece]: activeCells }, n = Object.keys(placed).length, hints = g.hints + (hinted ? 1 : 0);
    let { recorded, built } = g;
    sfx('peg', 0.7);
    if (n === N && !recorded) {
      recorded = true; setTimeout(() => sfx('win'), 300);
      built = built.includes(fig.id) ? built : [...built, fig.id];
      if (!hints) recordResult(getData().activeId, game, { result: 'win', label: `${fig.name[0]} · ${g.moves + 1} moves`, bestKey: fig.id });
    }
    change({ ...g, placed, active: null, recorded, hints, built });
  };
  const putBack = () => { if (g.active) change({ ...g, active: null }); };
  const hint = () => {
    const idx = new Map(fig.cells.map((c, i) => [cellKey(c), i]));
    const fixed = new Map(Object.entries(g.placed).map(([p, cs]) => [+p, cs.map(c => idx.get(cellKey(c))!)]));
    let sol = solve(fig.cells, fixed, 1, PCS)[0], kept = true;
    if (!sol) { sol = solve(fig.cells, new Map(), 1, PCS)[0]; kept = false; }
    const next = sol.find(s => !g.placed[s.piece] || !kept);
    if (!next) return;
    const cells = next.cells.map(i => fig.cells[i]);
    const placed: Record<number, V3[]> = kept ? { ...g.placed } : {};
    if (!kept) setMsg(t('Those pieces could not all stay; starting again from a full solution.', '这些块不能都留着；按完整解法重新开始。', 'O parçaların hepsi kalamazdı; tam bir çözümden yeniden başlanıyor.'));
    placed[next.piece] = cells;
    sfx('peg', 0.7);
    const n = Object.keys(placed).length;
    setG({ ...g, placed, active: null, hints: g.hints + 1, moves: g.moves + 1, recorded: g.recorded || n === N });
    if (n === N) setTimeout(() => sfx('win'), 300);
  };
  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      if (!axes || (e.target as HTMLElement).closest('input, select, textarea')) return;
      const map: Record<string, [number, number]> = { ArrowRight: [axes.right[0], axes.right[1]], ArrowLeft: [axes.right[0], -axes.right[1]], ArrowUp: [axes.up[0], axes.up[1]], ArrowDown: [axes.up[0], -axes.up[1]], s: [axes.toward[0], axes.toward[1]], w: [axes.toward[0], -axes.toward[1]] };
      const m = map[e.key];
      if (m) { e.preventDefault(); move(m[0], m[1]); }
      else if (e.key === 'r') rotate(rotY); else if (e.key === 'f') rotate(rotX); else if (e.key === 'v') rotate(rotZ);
      else if (e.key === 'Enter') place();
    };
    window.addEventListener('keydown', k); return () => window.removeEventListener('keydown', k);
  });
  const arrow = (axis: number, sign: number, label: string, id: string) => <button type="button" id={id} className="btn sm-dir" disabled={!g.active} onClick={() => move(axis, sign)} aria-label={label}>{label}</button>;
  const ROT = [rotX, rotY, rotZ];
  return (
    <div className="play">
      <div className="play-main">
        <div className="statline"><span role="status" aria-live="polite">{done ? (g.hints ? t(`${fig.name[0]} built, with hints.`, `在提示下拼成了${fig.name[1]}。`, `${fig.name[2]} ipuçlarıyla kuruldu.`) : t(`${fig.name[0]} built!`, `拼成了${fig.name[1]}！`, `${fig.name[2]} kuruldu!`)) : msg || (g.active ? t('Move and turn the piece, then place it inside the glass figure.', '移动、旋转这块，然后把它放进玻璃图形里。', 'Parçayı hareket ettir ve döndür, sonra cam figürün içine yerleştir.') : t('Pick a piece from the tray below.', '从下面的托盘里选一块。', 'Aşağıdaki tepsiden bir parça seç.'))}</span><span className="num">{placedCount}/{N}</span></div>
        <div className="sm-stage">
          <canvas ref={canvasRef} className="sm-canvas" aria-label={t('The figure in 3D. Drag to turn it; tap a placed piece to pick it up.', '三维图形。拖动旋转；点已放好的块可以拿起来。', '3B figür. Döndürmek için sürükle; yerleşmiş parçaya dokununca geri alırsın.')} />
          {state3d === 'loading' && <p className="sm-note">{t('Loading 3D…', '正在加载三维…', '3B yükleniyor…')}</p>}
          {state3d === 'failed' && <p className="sm-note">{t('3D could not be loaded here.', '这里无法加载三维。', '3B burada yüklenemedi.')}</p>}
        </div>
        <div className="sm-tray" role="group" aria-label={t('Pieces', '拼块', 'Parçalar')}>
          {PCS.map((p, i) => (
            <button key={p.id + i} type="button" id={'sm-p' + p.id} className={'sm-piece' + (g.placed[i] ? ' placed' : '') + (g.active?.piece === i ? ' on' : '')} disabled={done} onClick={() => take(i)} title={p.name[li]}>
              <svg viewBox="-2 -10 40 40" aria-hidden="true">{p.cells.slice().sort((a, b) => b[2] - a[2] || a[1] - b[1]).map(([x, y, z], k) => <rect key={k} x={4 + x * 6 + z * 3.5} y={18 - y * 6 - z * 3.5} width="6" height="6" fill={'#' + p.color.toString(16).padStart(6, '0')} stroke="#1d1a17" strokeWidth=".6" />)}</svg>
              <small>{p.id}</small>
            </button>
          ))}
        </div>
        {g.active && axes && (
          <div className="sm-controls">
            <div className="sm-pad" role="group" aria-label={t('Move', '移动', 'Hareket')}>
              <span />{arrow(axes.up[0], axes.up[1], '↑', 'sm-up')}{arrow(axes.toward[0], -axes.toward[1], '⊗', 'sm-away')}
              {arrow(axes.right[0], -axes.right[1], '←', 'sm-left')}<span />{arrow(axes.right[0], axes.right[1], '→', 'sm-right')}
              <span />{arrow(axes.up[0], -axes.up[1], '↓', 'sm-down')}{arrow(axes.toward[0], axes.toward[1], '⊙', 'sm-toward')}
            </div>
            <div className="sm-rot" role="group" aria-label={t('Turn', '旋转', 'Döndür')}>
              <button type="button" id="sm-rot-v" className="btn" onClick={() => rotate(ROT[axes.up[0]])}>⟲ {t('spin', '水平转', 'çevir')}</button>
              <button type="button" id="sm-rot-r" className="btn" onClick={() => rotate(ROT[axes.right[0]])}>⤾ {t('tip', '前后翻', 'devir')}</button>
              <button type="button" id="sm-rot-t" className="btn" onClick={() => rotate(ROT[axes.toward[0]])}>↻ {t('roll', '左右翻', 'yuvarla')}</button>
            </div>
            <div className="tools">
              <button type="button" id="sm-place" className="btn primary" disabled={!fits} onClick={() => place()}>{t('Place', '放下', 'Yerleştir')}</button>
              <button type="button" id="sm-back" className="btn" onClick={putBack}>{t('Back to tray', '放回托盘', 'Tepsiye geri')}</button>
            </div>
          </div>
        )}
      </div>
      <aside className="play-side">
        <p className="muted small">{t('Keys: arrows move, W and S go in and out, R spins, F tips, V rolls, Enter places. Every one here can be built with all its pieces.', '键盘：方向键移动，W和S前后，R水平转，F前后翻，V左右翻，回车放下。这里的每一个都能用全部拼块完成。', 'Tuşlar: oklar hareket, W ve S içeri-dışarı, R çevirir, F devirir, V yuvarlar, Enter yerleştirir. Buradakilerin hepsi bütün parçalarıyla kurulabilir.')}{intro && <> {intro[li]}</>}</p>
        <div className="tools">
          <button type="button" id="sm-hint" className="btn" disabled={done} onClick={hint}>{t('Hint', '提示', 'İpucu')}</button>
          <button type="button" id="sm-clear" className="btn" disabled={!placedCount && !g.active} onClick={() => setG({ ...fresh(g.fig, g.built) })}>{t('Clear', '清空', 'Temizle')}</button>
        </div>
        <div className="setup">
          <Seg id="sm-fig" label={label[li]} value={g.fig} onChange={id => setG(fresh(id, g.built))} options={FIGURES.map(f => ({ value: f.id, label: (g.built.includes(f.id) ? '★ ' : '') + f.name[li] }))} />
          <button type="button" id={done ? 'sm-again' : 'sm-new'} className="btn primary" onClick={() => { const k = (FIGURES.findIndex(f => f.id === g.fig) + 1) % FIGURES.length; setG(fresh(done ? FIGURES[k].id : g.fig, g.built)); }}>{done ? t('Next one', '下一个', 'Sonraki') : t('Start over', '重新开始', 'Baştan başla')}</button>
        </div>
      </aside>
    </div>
  );
}
