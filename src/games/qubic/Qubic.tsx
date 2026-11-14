import './qubic.css';
import { useEffect, useRef, useState } from 'react';
import type * as THREE_NS from 'three';
import { useT } from '../../core/i18n';
import { createStage, loadThree, type Stage } from '../../core/three/engine';
import { MatchPanel, useMatch } from '../../ui/useMatch';
import { CELLS, chooseMove, isLegal, legal, LEVELS, newGame, play, replay, type QState } from './rules';

const GAP = 1, LAYER = 1.25;
const pos = (i: number): [number, number, number] => {
  const y = Math.floor(i / 16), z = Math.floor((i % 16) / 4), x = i % 4;
  return [(x - 1.5) * GAP, (y - 1.5) * LAYER, (z - 1.5) * GAP];
};

export default function Qubic() {
  const t = useT();
  const m = useMatch<QState>({ game: 'qubic', key: 'gp.qubic', levels: LEVELS, defaults: { opponent: 'ai', level: 2, human: 1, p2: 'guest' },
    newGame, replay, play, choose: (s, lv) => chooseMove(s, lv), legal, aiDelay: 350 });
  const { st } = m;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stage = useRef<Stage | null>(null);
  const scene = useRef<{ pieces: THREE_NS.Mesh[]; dots: THREE_NS.Mesh[]; hits: THREE_NS.Mesh[]; mats: Record<string, THREE_NS.Material> } | null>(null);
  const [state3d, setState3d] = useState<'loading' | 'ready' | 'failed'>('loading');
  const [hover, setHover] = useState(-1);
  const canPlay = !m.over && !m.aiTurn;
  const tap = (i: number) => { if (canPlay && isLegal(st, i)) m.apply(i); };
  const tapRef = useRef(tap); tapRef.current = tap;

  // Build the cube once three.js is in.
  useEffect(() => {
    let dead = false;
    loadThree().then(THREE => {
      if (dead || !canvasRef.current) return;
      const S = createStage(THREE, canvasRef.current, { radius: 9.5 });
      S.orbit.phi = 1.05; S.orbit.min = 6; S.orbit.max = 16;
      stage.current = S;
      const mats = {
        p1: new THREE.MeshStandardMaterial({ color: 0xc8302a, roughness: 0.35, metalness: 0.1 }),
        p2: new THREE.MeshStandardMaterial({ color: 0x23272f, roughness: 0.3, metalness: 0.2 }),
        dot: new THREE.MeshStandardMaterial({ color: 0x8c7a5e, roughness: 0.8 }),
        dotHi: new THREE.MeshStandardMaterial({ color: 0xf2c14e, emissive: 0x6b4a00, roughness: 0.5 }),
        win: new THREE.MeshStandardMaterial({ color: 0xf2c14e, emissive: 0x8a5a00, roughness: 0.3 }),
        plate: new THREE.MeshStandardMaterial({ color: 0xd9c49a, transparent: true, opacity: 0.16, roughness: 0.9, depthWrite: false }),
        hit: new THREE.MeshBasicMaterial({ visible: false }),
      };
      const pieceGeo = new THREE.SphereGeometry(0.3, 28, 18), dotGeo = new THREE.SphereGeometry(0.07, 10, 8), hitGeo = new THREE.SphereGeometry(0.4, 8, 6);
      const pieces: THREE_NS.Mesh[] = [], dots: THREE_NS.Mesh[] = [], hits: THREE_NS.Mesh[] = [];
      for (let y = 0; y < 4; y++) {
        const plate = new THREE.Mesh(new THREE.BoxGeometry(4.3, 0.03, 4.3), mats.plate);
        plate.position.set(0, (y - 1.5) * LAYER - 0.32, 0); S.scene.add(plate);
        const edge = new THREE.LineSegments(new THREE.EdgesGeometry(plate.geometry), new THREE.LineBasicMaterial({ color: 0x8c7a5e, transparent: true, opacity: 0.5 }));
        edge.position.copy(plate.position); S.scene.add(edge);
      }
      for (let i = 0; i < CELLS; i++) {
        const [x, y, z] = pos(i);
        const p = new THREE.Mesh(pieceGeo, mats.p1); p.position.set(x, y, z); p.visible = false; S.scene.add(p); pieces.push(p);
        const d = new THREE.Mesh(dotGeo, mats.dot); d.position.set(x, y - 0.25, z); S.scene.add(d); dots.push(d);
        const h = new THREE.Mesh(hitGeo, mats.hit); h.position.set(x, y, z); h.userData.cell = i; S.scene.add(h); hits.push(h);
      }
      // A slow turn so the cube reads as 3D, stopped as soon as someone touches it.
      let idle = true;
      S.onFrame(dt => { if (idle) S.orbit.theta += dt * 0.12; });
      const cv = canvasRef.current;
      let down: { x: number; y: number; moved: boolean } | null = null;
      const pts = new Map<number, { x: number; y: number }>();
      let pinch = 0;
      cv.onpointerdown = e => { idle = false; cv.setPointerCapture(e.pointerId); pts.set(e.pointerId, { x: e.clientX, y: e.clientY }); down = { x: e.clientX, y: e.clientY, moved: pts.size > 1 }; };
      cv.onpointermove = e => {
        const prevPt = pts.get(e.pointerId);
        if (prevPt) {
          if (pts.size === 2) {
            pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
            const [a, b] = [...pts.values()], dist = Math.hypot(a.x - b.x, a.y - b.y);
            if (pinch) S.zoomBy(pinch / dist); pinch = dist; if (down) down.moved = true; return;
          }
          const dx = e.clientX - prevPt.x, dy = e.clientY - prevPt.y;
          pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
          if (down && Math.hypot(e.clientX - down.x, e.clientY - down.y) > 6) down.moved = true;
          if (down?.moved) S.orbitBy(dx, dy);
          return;
        }
        const hit = S.pick(e.clientX, e.clientY, hits);
        setHover(hit ? (hit.object.userData.cell as number) : -1);
      };
      const up = (e: PointerEvent) => {
        pts.delete(e.pointerId); if (pts.size < 2) pinch = 0;
        if (down && !down.moved && pts.size === 0) { const hit = S.pick(e.clientX, e.clientY, hits); if (hit) tapRef.current(hit.object.userData.cell as number); }
        if (pts.size === 0) down = null;
      };
      cv.onpointerup = up; cv.onpointercancel = up;
      cv.onwheel = e => { e.preventDefault(); idle = false; S.zoomBy(e.deltaY > 0 ? 1.08 : 0.93); };
      scene.current = { pieces, dots, hits, mats };
      setState3d('ready');
    }).catch(() => { if (!dead) setState3d('failed'); });
    return () => { dead = true; stage.current?.dispose(); stage.current = null; scene.current = null; };
  }, []);

  // Keep the 3D pieces in step with the game.
  useEffect(() => {
    const sc = scene.current; if (!sc) return;
    const win = new Set(st.line), last = st.moves[st.moves.length - 1];
    for (let i = 0; i < CELLS; i++) {
      const v = st.cells[i], p = sc.pieces[i];
      p.visible = v > 0;
      p.material = win.has(i) ? sc.mats.win : v === 1 ? sc.mats.p1 : sc.mats.p2;
      p.scale.setScalar(i === last ? 1.12 : 1);
      sc.dots[i].visible = !v;
      sc.dots[i].material = i === hover && canPlay ? sc.mats.dotHi : sc.mats.dot;
      sc.dots[i].scale.setScalar(i === hover && canPlay ? 2.2 : 1);
    }
  }, [st, hover, canPlay, state3d]);

  const colour = (p: number) => (p === 1 ? t('Red', '红方', 'Kırmızı') : t('Black', '黑方', 'Siyah'));
  const status = st.winner ? t(`${m.nameOf(st.winner)} wins with ${colour(st.winner)}`, `${m.nameOf(st.winner)}（${colour(st.winner)}）获胜`, `${m.nameOf(st.winner)} ${colour(st.winner)} ile kazandı`)
    : st.draw ? t('Draw: the cube is full.', '和棋：立方体已满。', 'Berabere: küp doldu.')
    : m.thinking ? t(`${m.nameOf(st.turn)} is thinking…`, `${m.nameOf(st.turn)}思考中…`, `${m.nameOf(st.turn)} düşünüyor…`)
    : t(`${m.nameOf(st.turn)} to move (${colour(st.turn)})`, `轮到${m.nameOf(st.turn)}（${colour(st.turn)}）`, `Sıra ${m.nameOf(st.turn)} oyuncusunda (${colour(st.turn)})`);
  const win = new Set(st.line), last = st.moves[st.moves.length - 1];
  return (
    <div className="play qubic">
      <div className="play-main">
        <div className="statline"><span role="status" aria-live="polite"><i className={'disc-dot q' + (st.winner || st.turn)} />{status}</span>
          <span className="muted">{t(`Move ${st.moves.length + (m.over ? 0 : 1)}`, `第${st.moves.length + (m.over ? 0 : 1)}手`, `Hamle ${st.moves.length + (m.over ? 0 : 1)}`)}</span></div>
        <div className="qb-stage">
          <canvas ref={canvasRef} className="qb-canvas" aria-label={t('3D cube. Drag to turn it, tap a point to place a stone, pinch or scroll to zoom.', '三维立方体。拖动旋转，点击位置落子，捏合或滚动缩放。', '3B küp. Çevirmek için sürükle, taş koymak için bir noktaya dokun, yakınlaştırmak için sıkıştır ya da kaydır.')} />
          {state3d === 'loading' && <p className="qb-note">{t('Loading the 3D engine…', '正在加载3D引擎…', '3B motoru yükleniyor…')}</p>}
          {state3d === 'failed' && <p className="qb-note">{t('The 3D view could not load; the layer boards below still work.', '3D视图加载失败，下方的分层棋盘仍可使用。', '3B görünüm yüklenemedi; aşağıdaki katman tahtaları yine de çalışır.')}</p>}
        </div>
        {/* The same cube, layer by layer: precise taps on small screens, and a plain view if 3D is unavailable. */}
        <div className="qb-layers" role="group" aria-label={t('Layers, bottom to top', '各层，从下到上', 'Katmanlar, alttan üste')}>
          {[0, 1, 2, 3].map(y => (
            <div key={y} className="qb-layer">
              <span className="qb-lname">{t(`Layer ${y + 1}`, `第${y + 1}层`, `${y + 1}. kat`)}</span>
              <div className="qb-grid">
                {Array.from({ length: 16 }, (_, k) => {
                  const i = y * 16 + k, v = st.cells[i];
                  return <button key={i} type="button" className={'qb-cell' + (v ? ' p' + v : '') + (win.has(i) ? ' win' : '') + (i === last ? ' last' : '') + (i === hover ? ' hov' : '')}
                    disabled={!canPlay || !!v} onClick={() => tap(i)} onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(-1)}
                    aria-label={t(`Layer ${y + 1}, row ${Math.floor(k / 4) + 1}, column ${(k % 4) + 1}`, `第${y + 1}层，第${Math.floor(k / 4) + 1}行，第${(k % 4) + 1}列`, `${y + 1}. kat, satır ${Math.floor(k / 4) + 1}, sütun ${(k % 4) + 1}`)} />;
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
      <aside className="play-side">
        <MatchPanel id="qb" m={m} sides={[t('Red (first)', '红（先手）', 'Kırmızı (ilk)'), t('Black', '黑', 'Siyah')]} />
        <p className="muted small">{t('Four in a line wins: along a row, a column, a pillar through the layers, or any diagonal, including the four that cross the whole cube. There are 76 lines in all.', '连成四子即胜：横、竖、贯穿各层的柱，或任意斜线，包括穿过整个立方体的四条对角线。共有76条线。', 'Bir çizgide dört taş kazandırır: satır, sütun, katları delen sütun ya da küpü baştan başa kesen dört çapraz dahil her çapraz. Toplam 76 çizgi var.')}</p>
      </aside>
    </div>
  );
}
