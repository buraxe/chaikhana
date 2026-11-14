import './snake.css';
import { useEffect, useMemo, useRef, useState } from 'react';
import type * as THREE_NS from 'three';
import { useLang, useT } from '../../core/i18n';
import { sfx } from '../../core/sound';
import { loadJSON, saveJSON } from '../../core/storage';
import { getData, noteStarted, recordResult } from '../../core/store';
import { attachOrbit, createStage, loadThree, type Stage } from '../../core/three/engine';
import { Seg } from '../../ui/bits';
import { collides, joints, layout, randomSnake, SNAKES, solve, solved, type V3 } from './rules';

/** Twists that lay the snake out flat as a staircase, so it never starts tangled. */
function flat(runs: number[]): number[] {
  const tw: number[] = [];
  for (let j = 0; j < runs.length - 1; j++) {
    // Pick the twist that alternates the run directions between +x and +y.
    for (let k = 0; k < 4; k++) {
      const pos = layout(runs.slice(0, j + 2), [...tw, k]);
      const a = pos[pos.length - 1], b = pos[pos.length - 2];
      const d = [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
      if ((j % 2 === 0 && d[1] === 1) || (j % 2 === 1 && d[0] === 1)) { tw.push(k); break; }
    }
  }
  return tw;
}
interface Saved { kind: string; runs: number[]; twists: number[]; moves: number; recorded: boolean; hints: number }
const fresh = (kind: string): Saved => { const runs = kind === 'classic' ? SNAKES[0].runs : randomSnake(Math.random); return { kind, runs, twists: flat(runs), moves: 0, recorded: false, hints: 0 }; };

export default function SnakeCube() {
  const t = useT(); useLang();
  const [g, setG] = useState<Saved>(() => loadJSON<Saved | null>('gp.snake', null) ?? fresh('classic'));
  const [state3d, setState3d] = useState<'loading' | 'ready' | 'failed'>('loading');
  const [hintJ, setHintJ] = useState(-1);
  const [msg, setMsg] = useState('');
  const canvasRef = useRef<HTMLCanvasElement>(null), stage = useRef<Stage | null>(null), live = useRef<THREE_NS.Group | null>(null);
  const tapRef = useRef<(cube: number) => void>(() => {});
  useEffect(() => { saveJSON('gp.snake', g); }, [g]);
  const pos = useMemo(() => layout(g.runs, g.twists), [g.runs, g.twists]);
  const js = useMemo(() => joints(g.runs), [g.runs]);
  const done = solved(g.runs, g.twists);

  useEffect(() => {
    let dead = false;
    loadThree().then(THREE => {
      if (dead || !canvasRef.current) return;
      const S = createStage(THREE, canvasRef.current, { radius: 16 });
      S.orbit.min = 6; S.orbit.max = 34; S.orbit.phi = 0.9; S.orbit.theta = 0.5;
      stage.current = S;
      const grp = new THREE.Group(); S.scene.add(grp); live.current = grp;
      attachOrbit(S, canvasRef.current, { targets: () => grp.children.filter(o => typeof o.userData.cube === 'number'), onTap: o => { if (o) tapRef.current(o.userData.cube as number); } });
      setState3d('ready');
    }).catch(() => { if (!dead) setState3d('failed'); });
    return () => { dead = true; stage.current?.dispose(); stage.current = null; live.current = null; };
  }, []);

  // Redraw the chain, centred; joints are lighter with a dot, clashes red.
  useEffect(() => {
    const S = stage.current, grp = live.current; if (!S || !grp) return;
    const THREE = S.THREE;
    grp.children.slice().forEach(o => { grp.remove(o); const m = o as THREE_NS.Mesh; m.geometry?.dispose(); (m.material as THREE_NS.Material)?.dispose?.(); });
    const bad = collides(pos), c = [0, 1, 2].map(a => (Math.min(...pos.map(p => p[a])) + Math.max(...pos.map(p => p[a]))) / 2);
    const box = new THREE.BoxGeometry(0.94, 0.94, 0.94), edges = new THREE.EdgesGeometry(box);
    const mat = (hex: number, em = 0) => new THREE.MeshStandardMaterial({ color: hex, emissive: em, roughness: 0.7 });
    const at = (p: V3) => new THREE.Vector3(p[0] - c[0], p[1] - c[1], p[2] - c[2]);
    pos.forEach((p, i) => {
      const isJoint = js.includes(i), j = js.indexOf(i);
      const m = new THREE.Mesh(box, bad.has(i) ? mat(0xc0392b, 0x400000) : done ? mat(i % 2 ? 0x2f6b4f : 0x3d8a66) : isJoint ? mat(0xe2c08a, j === hintJ ? 0x7a1a10 : 0) : mat(i % 2 ? 0x9a6a3a : 0x7d5530));
      m.position.copy(at(p)); m.userData.cube = i; grp.add(m);
      const e = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: 0x2b1a0c, transparent: true, opacity: 0.35 })); e.position.copy(m.position); grp.add(e);
      if (isJoint && !done) { const dot = new THREE.Mesh(new THREE.SphereGeometry(0.12, 10, 8), mat(0x3b2410)); dot.position.copy(m.position); dot.position.y += 0.48; grp.add(dot); }
    });
    // The elastic through the middle.
    const line = new THREE.Line(new THREE.BufferGeometry().setFromPoints(pos.map(at)), new THREE.LineBasicMaterial({ color: 0x1d1a17 }));
    grp.add(line);
    if (done) { const frame = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(3.05, 3.05, 3.05)), new THREE.LineBasicMaterial({ color: 0xf2c14e })); grp.add(frame); }
  }, [pos, js, done, hintJ, state3d]);

  /** Twist joint j to the next way that does not run into itself. */
  const twist = (j: number, to?: number, hinted = false) => {
    if (done) return;
    const tw = g.twists.slice();
    let k = to ?? tw[j], tries = 0;
    do { k = (k + (to === undefined ? 1 : 0)) % 4; tw[j] = k; tries++; } while (to === undefined && collides(layout(g.runs, tw)).size > 0 && tries < 4);
    if (collides(layout(g.runs, tw)).size > 0 && to === undefined) { sfx('error', 0.4); setMsg(t('That joint has no room to turn: free the chain first.', '这个关节转不动：先把链子理开。', 'Bu eklem dönecek yer bulamıyor: önce zinciri aç.')); return; }
    if (!g.moves) noteStarted('snake-cube');
    sfx('peg', 0.5); setMsg(''); setHintJ(-1);
    const moves = g.moves + 1, win = solved(g.runs, tw), hints = g.hints + (hinted ? 1 : 0);
    let recorded = g.recorded;
    if (win && !recorded) { recorded = true; setTimeout(() => sfx('win'), 300); if (!hints) recordResult(getData().activeId, 'snake-cube', { result: 'win', label: `${g.kind === 'classic' ? 'Classic' : 'Random'} · ${moves} twists`, bestKey: g.kind }); }
    setG({ ...g, twists: tw, moves, recorded, hints });
  };
  tapRef.current = cube => {
    // Tapping a joint, or any cube, turns the nearest joint before it.
    let j = -1; for (let k = 0; k < js.length; k++) if (js[k] <= cube) j = k;
    if (j < 0) j = 0;
    twist(j);
  };
  const hint = () => {
    // Keep as many of the first twists as still lead to a solution, and fix the next one.
    for (let keep = g.twists.length; keep >= 0; keep--) {
      const sol = solve(g.runs, g.twists, keep);
      if (sol) {
        const j = sol.findIndex((k, i) => k !== g.twists[i]);
        if (j < 0) return;
        setHintJ(j);
        setTimeout(() => twist(j, sol[j], true), 350);
        return;
      }
    }
  };
  return (
    <div className="play">
      <div className="play-main">
        <div className="statline"><span role="status" aria-live="polite">{done ? (g.hints ? t('Folded into the cube, with hints.', '在提示下折成了立方体。', 'İpuçlarıyla küpe katlandı.') : t(`Folded into the cube in ${g.moves} twists!`, `用${g.moves}次转动折成了立方体！`, `${g.moves} çevirişte küpe katlandı!`)) : msg || t('Tap a light joint cube to swing the rest of the chain a quarter turn. Fold it into a 3×3×3 cube.', '点浅色的关节块，让后面的链子转四分之一圈。把它折成3×3×3的立方体。', 'Açık renkli bir eklem küpüne dokun, zincirin geri kalanı çeyrek tur döner. 3×3×3 küpe katla.')}</span><span className="num">{g.moves}</span></div>
        <div className="sn-stage">
          <canvas ref={canvasRef} className="sn-canvas" aria-label={t('The snake in 3D. Drag to turn the view, tap a joint to twist.', '三维蛇形立方。拖动旋转视角，点关节扭转。', '3B yılan. Görünümü döndürmek için sürükle, çevirmek için bir ekleme dokun.')} />
          {state3d === 'loading' && <p className="sn-note">{t('Loading 3D…', '正在加载三维…', '3B yükleniyor…')}</p>}
          {state3d === 'failed' && <p className="sn-note">{t('3D could not be loaded here.', '这里无法加载三维。', '3B burada yüklenemedi.')}</p>}
        </div>
        <div className="sn-joints" role="group" aria-label={t('Joints', '关节', 'Eklemler')}>
          {js.map((c, j) => <button key={j} type="button" id={'sn-j' + j} className={'btn sm' + (j === hintJ ? ' hint' : '')} disabled={done} onClick={() => twist(j)} aria-label={t(`Twist joint ${j + 1}`, `扭转第${j + 1}个关节`, `${j + 1}. eklemi çevir`)}>{j + 1}</button>)}
        </div>
      </div>
      <aside className="play-side">
        <dl className="facts"><div><dt>{t('Cubes', '方块', 'Küp')}</dt><dd className="num">27</dd></div><div><dt>{t('Joints', '关节', 'Eklem')}</dt><dd className="num">{js.length}</dd></div></dl>
        <p className="muted small">{t('Each joint can sit four ways. The numbered buttons twist the joints in order along the chain, from the end that stays put.', '每个关节有四种位置。编号按钮按链子顺序扭转关节，从固定不动的一端数起。', 'Her eklemin dört konumu var. Numaralı düğmeler, sabit kalan uçtan başlayarak zincir boyunca eklemleri sırayla çevirir.')}</p>
        <div className="tools">
          <button type="button" id="sn-hint" className="btn" disabled={done} onClick={hint}>{t('Hint', '提示', 'İpucu')}</button>
          <button type="button" id="sn-flat" className="btn" disabled={done} onClick={() => setG({ ...g, twists: flat(g.runs), moves: g.moves + 1 })}>{t('Lay it flat', '摊平', 'Düzleştir')}</button>
        </div>
        <div className="setup">
          <Seg id="sn-kind" label={t('Snake', '蛇', 'Yılan')} value={g.kind === 'classic' ? 'classic' : 'random'} onChange={k => setG(fresh(k))} options={[{ value: 'classic', label: t('Classic', '经典', 'Klasik') }, { value: 'random', label: t('New random', '随机', 'Yeni rastgele') }]} />
          <button type="button" id={done ? 'sn-again' : 'sn-new'} className="btn primary" onClick={() => setG(fresh(g.kind))}>{t('Start again', '重新开始', 'Baştan başla')}</button>
        </div>
      </aside>
    </div>
  );
}
