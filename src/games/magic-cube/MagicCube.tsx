import './rubik.css';
import { useEffect, useRef, useState } from 'react';
import { sfx } from '../../core/sound';
import type * as THREE_NS from 'three';
import { useT } from '../../core/i18n';
import { loadJSON, saveJSON } from '../../core/storage';
import { getData, noteStarted, recordResult } from '../../core/store';
import { createStage, loadThree, type Stage } from '../../core/three/engine';
import { fmtTime, Pick, Seg } from '../../ui/bits';
import { apply, faceMove, facelets2as3, facelets3, inverse, isRotation, isSolved, parse, scramble, solved, type Axis, type Cube, type Move } from './model';
import SolverWorker from './solver.worker?worker&inline';

const COLORS = [0xf7f5ef, 0xf5c518, 0x14a05a, 0x1f5fd1, 0xd6302b, 0xf27a1d];
const SCRAMBLE_LEN: Record<number, number> = { 2: 11, 3: 25, 4: 40, 5: 60 };
const FACES = ['U', 'D', 'L', 'R', 'F', 'B'];
interface Saved { size: number; cube: Cube; history: Move[]; moves: number; elapsed: number; scrambled: boolean; assisted: boolean; recorded: boolean }
const fresh = (size: number): Saved => ({ size, cube: solved(size), history: [], moves: 0, elapsed: 0, scrambled: false, assisted: false, recorded: false });

let worker: Worker | null = null, reqId = 0;
const pending = new Map<number, (r: { type: string; moves?: string; message?: string }) => void>();
function solver(): Worker {
  if (!worker) {
    worker = new SolverWorker();
    worker.onmessage = e => { const f = pending.get(e.data.id); if (f) { pending.delete(e.data.id); f(e.data); } };
  }
  return worker;
}
const askSolver = (facelets: string) => new Promise<string>((resolve, reject) => {
  const id = ++reqId;
  pending.set(id, r => (r.type === 'solution' ? resolve(r.moves!) : reject(new Error(r.message))));
  solver().postMessage({ id, type: 'solve', facelets });
});

export default function Rubik() {
  const t = useT();
  const [g, setG] = useState<Saved>(() => loadJSON<Saved | null>('gp.rubik', null) ?? fresh(3));
  const [phase, setPhase] = useState<'loading' | 'ready' | 'error'>('loading');
  const [busy, setBusy] = useState('');
  const [playback, setPlayback] = useState<{ text: string[]; at: number } | null>(null);
  const [practice, setPractice] = useState<'full' | '4' | '8'>('full');
  const [redo, setRedo] = useState<Move[]>([]);
  const [undoStack, setUndoStack] = useState<Move[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stageRef = useRef<Stage | null>(null);
  const cubies = useRef<THREE_NS.Group[]>([]);
  const queue = useRef<{ move: Move; speed: number }[]>([]);
  const anim = useRef<{ move: Move; pivot: THREE_NS.Group; t: number; dur: number } | null>(null);
  const gRef = useRef(g); gRef.current = g;
  const solvedNow = isSolved(g.cube);

  useEffect(() => { saveJSON('gp.rubik', g); }, [g]);
  // Timer runs from the first turn after a full scramble until the cube is solved.
  useEffect(() => {
    if (!g.scrambled || solvedNow || g.moves === 0 || g.assisted) return;
    const id = setInterval(() => { if (!document.hidden) setG(s => ({ ...s, elapsed: s.elapsed + 100 })); }, 100);
    return () => clearInterval(id);
  }, [g.scrambled, solvedNow, g.moves, g.assisted]);
  useEffect(() => {
    if (!solvedNow || !g.scrambled || g.recorded || g.moves === 0) return;
    setG(s => ({ ...s, recorded: true }));
    if (!g.assisted) recordResult(getData().activeId, 'magic-cube', { result: 'win', ms: g.elapsed, label: `${g.size}×${g.size} · ${g.moves} moves`, bestKey: `${g.size}×${g.size}` });
  }, [solvedNow]); // eslint-disable-line

  // ---- 3D scene ----
  const buildCube = (stage: Stage, cube: Cube) => {
    const { THREE, scene } = stage;
    cubies.current.forEach(c => scene.remove(c));
    cubies.current = [];
    const body = new THREE.MeshStandardMaterial({ color: 0x111215, roughness: 0.55, metalness: 0.05 });
    const box = new THREE.BoxGeometry(0.96, 0.96, 0.96), plane = new THREE.PlaneGeometry(0.82, 0.82);
    const mats = COLORS.map(c => new THREE.MeshStandardMaterial({ color: c, roughness: 0.35, metalness: 0 }));
    const byPos = new Map<string, typeof cube.stickers>();
    for (const st of cube.stickers) { const k = st.p.join(','); if (!byPos.has(k)) byPos.set(k, []); byPos.get(k)!.push(st); }
    for (const [k, list] of byPos) {
      const [x, y, z] = k.split(',').map(Number), grp = new THREE.Group();
      grp.position.set(x / 2, y / 2, z / 2);
      grp.add(new THREE.Mesh(box, body));
      for (const st of list) {
        const m = new THREE.Mesh(plane, mats[st.color]);
        m.position.set(st.n[0] * 0.485, st.n[1] * 0.485, st.n[2] * 0.485);
        m.lookAt(st.n[0] * 2, st.n[1] * 2, st.n[2] * 2);
        m.userData.sticker = true;
        grp.add(m);
      }
      scene.add(grp); cubies.current.push(grp);
    }
    stage.orbit.radius = 3 + cube.size * 2.1; stage.orbit.min = cube.size * 1.6; stage.orbit.max = cube.size * 6;
  };
  useEffect(() => {
    let disposed = false;
    setPhase('loading');
    loadThree().then(THREE => {
      if (disposed || !canvasRef.current) return;
      const stage = createStage(THREE, canvasRef.current, { radius: 8 });
      stageRef.current = stage;
      buildCube(stage, gRef.current.cube);
      stage.onFrame(dt => step(dt));
      setPhase('ready');
    }).catch(() => !disposed && setPhase('error'));
    return () => { disposed = true; stageRef.current?.dispose(); stageRef.current = null; queue.current = []; anim.current = null; };
  }, [g.size]); // eslint-disable-line

  /** Turn the cubies of one layer (or all of them) about an axis, then snap them to the grid. */
  const step = (dt: number) => {
    const stage = stageRef.current;
    if (!stage) return;
    const { THREE, scene } = stage;
    if (!anim.current && queue.current.length) {
      const { move, speed } = queue.current.shift()!;
      const pivot = new THREE.Group(); scene.add(pivot);
      const coord = (2 * move.layer - (gRef.current.size - 1)) / 2;
      for (const c of cubies.current) {
        const v = c.position.getComponent(move.axis);
        if (move.layer < 0 || Math.abs(v - coord) < 0.1) pivot.attach(c);
      }
      anim.current = { move, pivot, t: 0, dur: speed };
    }
    const a = anim.current;
    if (!a) return;
    a.t = Math.min(1, a.t + dt / a.dur);
    const e = a.t < 0.5 ? 2 * a.t * a.t : 1 - Math.pow(-2 * a.t + 2, 2) / 2;
    const ang = (a.move.dir * Math.PI / 2) * e;
    a.pivot.rotation.set(a.move.axis === 0 ? ang : 0, a.move.axis === 1 ? ang : 0, a.move.axis === 2 ? ang : 0);
    if (a.t >= 1) {
      for (const c of [...a.pivot.children] as THREE_NS.Group[]) {
        scene.attach(c);
        c.position.set(Math.round(c.position.x * 2) / 2, Math.round(c.position.y * 2) / 2, Math.round(c.position.z * 2) / 2);
        const m = new THREE.Matrix4().makeRotationFromQuaternion(c.quaternion);
        const el = m.elements.map(v => Math.round(v));
        m.fromArray(el); c.quaternion.setFromRotationMatrix(m);
      }
      scene.remove(a.pivot);
      anim.current = null;
    }
  };
  const enqueue = (moves: Move[], speed = 0.18) => { for (const m of moves) queue.current.push({ move: m, speed }); };
  const idle = () => !anim.current && queue.current.length === 0;
  const waitIdle = () => new Promise<void>(res => { const tick = () => (idle() ? res() : setTimeout(tick, 50)); tick(); });

  /** A move made by the player (drag, button or key). */
  const play = (m: Move) => {
    sfx('slide', 0.6);
    if (playback) return;
    enqueue([m]);
    setUndoStack(u => [...u, m]); setRedo([]);
    setG(s => {
      if (!s.moves && s.scrambled && !isRotation(m)) noteStarted('magic-cube');
      return { ...s, cube: apply(s.cube, m), history: [...s.history, m], moves: s.moves + (isRotation(m) ? 0 : 1) };
    });
  };
  const undo = () => {
    const m = undoStack[undoStack.length - 1];
    if (!m || playback) return;
    enqueue([inverse(m)]);
    setUndoStack(u => u.slice(0, -1)); setRedo(r => [...r, m]);
    setG(s => ({ ...s, cube: apply(s.cube, inverse(m)), history: [...s.history, inverse(m)], moves: s.moves + (isRotation(m) ? 0 : 1) }));
  };
  const redoMove = () => {
    const m = redo[redo.length - 1];
    if (!m || playback) return;
    enqueue([m]); setRedo(r => r.slice(0, -1)); setUndoStack(u => [...u, m]);
    setG(s => ({ ...s, cube: apply(s.cube, m), history: [...s.history, m], moves: s.moves + (isRotation(m) ? 0 : 1) }));
  };
  const doScramble = async () => {
    if (playback) return;
    await waitIdle();
    const len = practice === 'full' ? SCRAMBLE_LEN[g.size] : +practice;
    const seq = scramble(g.size, len);
    enqueue(seq, 0.07);
    setUndoStack([]); setRedo([]);
    setG(s => ({ ...s, cube: seq.reduce(apply, s.cube), history: [...s.history, ...seq], moves: 0, elapsed: 0, scrambled: practice === 'full', assisted: false, recorded: false }));
  };
  const reset = () => {
    queue.current = []; setPlayback(null); setUndoStack([]); setRedo([]);
    const f = fresh(g.size); setG(f);
    if (stageRef.current && idle()) buildCube(stageRef.current, f.cube);
    else setTimeout(() => stageRef.current && buildCube(stageRef.current, f.cube), 400);
  };
  const solve = async () => {
    if (solvedNow || playback) return;
    // Let any turns still animating finish first, so the solver sees the cube as shown.
    await waitIdle();
    let moves: Move[] = [], text: string[] = [];
    try {
      if (g.size === 3 || g.size === 2) {
        setBusy(t('Preparing the solver (a few seconds the first time)…', '正在准备求解器（第一次需要几秒）…', 'Çözücü hazırlanıyor (ilk seferde birkaç saniye)…'));
        const sol = await askSolver(g.size === 3 ? facelets3(g.cube) : facelets2as3(g.cube));
        text = sol.trim().split(/\s+/).filter(Boolean);
        moves = parse(g.size, sol);
      } else {
        moves = g.history.slice().reverse().map(inverse);
        text = moves.map(m => (isRotation(m) ? '↻' : '·'));
      }
    } catch { setBusy(t('The solver could not be started.', '求解器无法启动。', 'Çözücü başlatılamadı.')); return; }
    setBusy('');
    if (!moves.length) return;
    setG(s => ({ ...s, assisted: true }));
    setPlayback({ text, at: 0 });
    // Feed the solution one move at a time so the list can follow along.
    const speed = g.size >= 4 ? 0.1 : 0.32;
    let k = 0;
    const feed = () => {
      if (k >= moves.length) { setPlayback(null); return; }
      if (!idle()) { setTimeout(feed, 40); return; }
      const m = moves[k++];
      enqueue([m], speed);
      setPlayback(p => (p ? { ...p, at: g.size >= 4 ? Math.min(p.text.length, k) : countTokens(text, k) } : p));
      setG(s => ({ ...s, cube: apply(s.cube, m), history: g.size >= 4 ? s.history.slice(0, -1) : [...s.history, m] }));
      setTimeout(feed, speed * 1000 + 30);
    };
    feed();
  };

  // ---- pointer input: drag a sticker to turn a layer, drag elsewhere to orbit ----
  const pointer = useRef<{ mode: 'turn' | 'orbit' | null; x: number; y: number; hit?: THREE_NS.Vector3; normal?: number; sign?: number; cubie?: THREE_NS.Vector3; done?: boolean }>({ mode: null, x: 0, y: 0 });
  const touches = useRef(new Map<number, { x: number; y: number }>());
  const onDown = (e: React.PointerEvent) => {
    const stage = stageRef.current;
    if (!stage) return;
    (e.target as Element).setPointerCapture(e.pointerId);
    touches.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (touches.current.size > 1) { pointer.current.mode = null; return; }
    const hit = idle() && !playback ? stage.pick(e.clientX, e.clientY, cubies.current) : null;
    if (hit && hit.object.userData.sticker) {
      const n = new stage.THREE.Vector3(); hit.object.getWorldDirection(n);
      const ax = [Math.abs(n.x), Math.abs(n.y), Math.abs(n.z)], normal = ax.indexOf(Math.max(...ax));
      const cp = new stage.THREE.Vector3(); hit.object.parent!.getWorldPosition(cp);
      pointer.current = { mode: 'turn', x: e.clientX, y: e.clientY, hit: hit.point.clone(), normal, sign: Math.sign(n.getComponent(normal)), cubie: cp };
    } else pointer.current = { mode: 'orbit', x: e.clientX, y: e.clientY };
  };
  const onMove = (e: React.PointerEvent) => {
    const stage = stageRef.current, p = pointer.current;
    if (!stage) return;
    const prevT = touches.current.get(e.pointerId);
    if (prevT && touches.current.size === 2) {
      const pts = [...touches.current.values()], other = pts.find(q => q !== prevT)!;
      const before = Math.hypot(prevT.x - other.x, prevT.y - other.y), after = Math.hypot(e.clientX - other.x, e.clientY - other.y);
      if (before > 0) stage.zoomBy(before / after);
      touches.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
      return;
    }
    touches.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (p.mode === 'orbit') { stage.orbitBy(e.clientX - p.x, e.clientY - p.y); p.x = e.clientX; p.y = e.clientY; return; }
    if (p.mode !== 'turn' || p.done || Math.hypot(e.clientX - p.x, e.clientY - p.y) < 12) return;
    const { THREE } = stage, nrm = new THREE.Vector3(); nrm.setComponent(p.normal!, p.sign!);
    const plane = new THREE.Plane().setFromNormalAndCoplanarPoint(nrm, p.hit!), out = new THREE.Vector3();
    if (!stage.ray(e.clientX, e.clientY).intersectPlane(plane, out)) return;
    const d = out.sub(p.hit!), tangents = [0, 1, 2].filter(k => k !== p.normal);
    const drag = Math.abs(d.getComponent(tangents[0])) > Math.abs(d.getComponent(tangents[1])) ? tangents[0] : tangents[1];
    const axis = tangents.find(k => k !== drag)! as Axis;
    const av = new THREE.Vector3(); av.setComponent(axis, 1);
    const s = Math.sign(new THREE.Vector3().crossVectors(av, p.hit!).dot(d)) || 1;
    const layer = Math.round((p.cubie!.getComponent(axis) * 2 + (g.size - 1)) / 2);
    p.done = true;
    play({ axis, layer, dir: s as 1 | -1 });
  };
  const onUp = (e: React.PointerEvent) => { touches.current.delete(e.pointerId); pointer.current.mode = null; };
  const onWheel = (e: React.WheelEvent) => { stageRef.current?.zoomBy(e.deltaY > 0 ? 1.1 : 0.9); };
  useEffect(() => {
    const on = (e: KeyboardEvent) => {
      const tg = e.target as HTMLElement;
      if (/^(INPUT|SELECT|TEXTAREA)$/.test(tg.tagName)) return;
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') { e.preventDefault(); e.shiftKey ? redoMove() : undo(); return; }
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      const k = e.key.toUpperCase();
      if (FACES.includes(k)) { e.preventDefault(); play(faceMove(g.size, k, e.shiftKey)); }
      else if (['X', 'Y', 'Z'].includes(k)) { e.preventDefault(); play(faceMove(g.size, k.toLowerCase(), e.shiftKey)); }
    };
    window.addEventListener('keydown', on);
    return () => window.removeEventListener('keydown', on);
  });
  // Tiny canvas wrapper keeps the page from scrolling while dragging on touch screens.
  const status = phase === 'loading' ? t('Loading the 3D engine…', '正在加载3D引擎…', '3B motoru yükleniyor…')
    : phase === 'error' ? t('The 3D engine could not be loaded. Check the connection and reload the page.', '3D引擎加载失败。请检查网络后刷新页面。', '3B motoru yüklenemedi. Bağlantıyı kontrol edip sayfayı yenile.')
    : busy || (playback ? t('Playing the solution…', '正在演示解法…', 'Çözüm oynatılıyor…')
      : solvedNow ? (g.scrambled && g.moves ? t(`Solved in ${fmtTime(g.elapsed)} with ${g.moves} moves.`, `用时${fmtTime(g.elapsed)}，${g.moves}步完成！`, `${fmtTime(g.elapsed)} sürede, ${g.moves} hamleyle çözüldü.`) : t('Solved. Scramble to start.', '已复原。打乱后开始。', 'Çözüldü. Başlamak için karıştır.'))
      : t('Drag a sticker to turn a layer. Drag the background to look around.', '拖动色块转动一层，拖动空白处旋转视角。', 'Bir katmanı çevirmek için bir çıkartmayı sürükle. Etrafa bakmak için arka planı sürükle.'));
  return (
    <div className="play rubik">
      <div className="play-main">
        <div className="statline">
          <span role="status" aria-live="polite">{status}</span>
          <span className="num">{t(`${g.moves} moves`, `${g.moves}步`, `${g.moves} hamle`)}</span>
          <span className="num">{fmtTime(g.elapsed)}</span>
        </div>
        <div className="rb-stage">
          <canvas ref={canvasRef} className="rb-canvas" onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp} onWheel={onWheel}
            aria-label={t("Magic cube in 3D. Drag stickers to turn layers; drag the background to rotate the view; scroll or pinch to zoom. Keys U D L R F B turn faces, Shift for counter-clockwise, X Y Z rotate the cube.", '三维魔方。拖动色块转动一层；拖动背景旋转视角；滚轮或双指缩放。键盘 U D L R F B 转面，Shift 为逆时针，X Y Z 整体旋转。', '3B sihirli küp. Katman çevirmek için çıkartmaları sürükle; görünümü döndürmek için arka planı sürükle; yakınlaştırmak için kaydır ya da iki parmakla sıkıştır. U D L R F B tuşları yüzleri çevirir, Shift ters yön, X Y Z küpü döndürür.')} />
          {phase !== 'ready' && <div className="rb-overlay">{status}</div>}
        </div>
        {playback && (
          <ol className="rb-solution" aria-label={t('Solution', '解法', 'Çözüm')}>
            {playback.text.map((m, i) => <li key={i} className={i < playback.at ? 'done' : i === playback.at ? 'now' : ''}>{m}</li>)}
          </ol>
        )}
      </div>
      <aside className="play-side">
        <div className="rb-pad" role="group" aria-label={t('Face turns', '转面', 'Yüz dönüşleri')}>
          {FACES.map(f => (
            <div key={f} className="rb-pair">
              <button type="button" id={'rb-' + f} className="btn sm" disabled={phase !== 'ready' || !!playback} onClick={() => play(faceMove(g.size, f))}>{f}</button>
              <button type="button" id={'rb-' + f + 'p'} className="btn sm" disabled={phase !== 'ready' || !!playback} onClick={() => play(faceMove(g.size, f, true))}>{f}′</button>
            </div>
          ))}
        </div>
        <div className="rb-pad rot" role="group" aria-label={t('Rotate the whole cube', '整体旋转', 'Bütün küpü döndür')}>
          {['x', 'y', 'z'].map(f => (
            <div key={f} className="rb-pair">
              <button type="button" id={'rb-' + f} className="btn sm" disabled={phase !== 'ready' || !!playback} onClick={() => play(faceMove(g.size, f))}>{f}</button>
              <button type="button" id={'rb-' + f + 'p'} className="btn sm" disabled={phase !== 'ready' || !!playback} onClick={() => play(faceMove(g.size, f, true))}>{f}′</button>
            </div>
          ))}
        </div>
        <div className="tools">
          <button type="button" id="rb-undo" className="btn" disabled={!undoStack.length || !!playback} onClick={undo}>{t('Undo', '撤销', 'Geri al')}</button>
          <button type="button" id="rb-redo" className="btn" disabled={!redo.length || !!playback} onClick={redoMove}>{t('Redo', '重做', 'Yinele')}</button>
          <button type="button" id="rb-reset" className="btn" onClick={reset}>{t('Reset', '复原', 'Sıfırla')}</button>
        </div>
        <div className="tools">
          <button type="button" id="rb-scramble" className="btn primary" disabled={phase !== 'ready' || !!playback} onClick={doScramble}>{t('Scramble', '打乱', 'Karıştır')}</button>
          <button type="button" id="rb-solve" className="btn" disabled={phase !== 'ready' || solvedNow || !!playback || !!busy} onClick={solve}>
            {g.size >= 4 ? t('Rewind to solved', '倒放复原', 'Çözülmüş hâle geri sar') : t('Show a solution', '演示解法', 'Bir çözüm göster')}</button>
        </div>
        <p className="muted small">{g.size >= 4 ? t('For 4×4 and 5×5, the solution replays your moves and the scramble backwards.', '4×4和5×5的解法是把打乱和你的操作倒着播放。', '4×4 ve 5×5’te çözüm, hamlelerini ve karıştırmayı geriye doğru oynatır.')
          : t('The solution uses the Kociemba two-phase method, which finds short solutions (usually about 20 moves on 3×3). Using it marks the solve as assisted.', '解法使用 Kociemba 两阶段算法，能找到较短的解（3×3通常约20步）。使用后本次不计成绩。', 'Çözüm, kısa çözümler bulan Kociemba iki aşamalı yöntemini kullanır (3×3’te genellikle 20 hamle civarı). Kullanmak çözümü yardımlı sayar.')}</p>
        <div className="setup">
          <h3>{t('Cube', '魔方', 'Küp')}</h3>
          <Pick id="rb-size" label={t('Size', '阶数', 'Boyut')} value={g.size} onChange={n => { setUndoStack([]); setRedo([]); setPlayback(null); setG(fresh(n)); }}
            options={[2, 3, 4, 5].map(n => ({ value: n, label: `${n}×${n}×${n}` }))} />
          <Seg id="rb-practice" label={t('Scramble', '打乱方式', 'Karıştır')} value={practice} onChange={setPractice}
            options={[{ value: 'full', label: t('Full (timed)', '完全（计时）', 'Tam (süreli)') }, { value: '4', label: t('Practice: 4 moves', '练习：4步', 'Antrenman: 4 hamle') }, { value: '8', label: t('Practice: 8 moves', '练习：8步', 'Antrenman: 8 hamle') }]} />
          <p className="muted small">{t('Keys: U D L R F B turn faces (Shift for counter-clockwise), X Y Z turn the whole cube, Ctrl+Z undoes. Scroll or pinch to zoom.', '键盘：U D L R F B 转面（Shift 为逆时针），X Y Z 整体旋转，Ctrl+Z 撤销。滚轮或双指缩放。', 'Tuşlar: U D L R F B yüzleri çevirir (ters yön için Shift), X Y Z bütün küpü çevirir, Ctrl+Z geri alır. Yakınlaştırmak için kaydır ya da sıkıştır.')}</p>
        </div>
      </aside>
    </div>
  );
}
/** The solver writes "R2" as one token but it plays as two moves; map moves played to tokens shown. */
function countTokens(text: string[], movesPlayed: number): number {
  let m = 0;
  for (let i = 0; i < text.length; i++) { m += text[i].includes('2') ? 2 : 1; if (m >= movesPlayed) return m === movesPlayed ? i + 1 : i; }
  return text.length;
}
