import './cubemines.css';
import { useEffect, useRef, useState } from 'react';
import { sfx } from '../../core/sound';
import type * as THREE_NS from 'three';
import { useT } from '../../core/i18n';
import { loadJSON, saveJSON } from '../../core/storage';
import { getData, noteStarted, recordResult } from '../../core/store';
import { createStage, loadThree } from '../../core/three/engine';
import { fmtTime, Seg } from '../../ui/bits';
import { chord, count, geometry, newGame, PRESETS, reveal, toggleFlag, type CMState } from './rules';

type Size = keyof typeof PRESETS;
interface Saved { size: Size; st: CMState; elapsed: number }
const NUM_COLORS = ['', '#2c5a9a', '#2f6b4f', '#c8302a', '#1f2a5c', '#7a2a1f', '#2a6e74', '#111', '#666'];

/** One small canvas texture per face state: hidden, numbers 0–8, flag, mine, exploded mine. */
function makeMaterials(THREE: typeof THREE_NS) {
  const tex = (draw: (c: CanvasRenderingContext2D) => void) => {
    const cv = document.createElement('canvas'); cv.width = cv.height = 128;
    const c = cv.getContext('2d')!; draw(c);
    const t = new THREE.CanvasTexture(cv); t.anisotropy = 4;
    return new THREE.MeshStandardMaterial({ map: t, roughness: 0.7, side: THREE.DoubleSide });
  };
  const tile = (c: CanvasRenderingContext2D, fill: string, edge: string) => { c.fillStyle = edge; c.fillRect(0, 0, 128, 128); c.fillStyle = fill; c.fillRect(8, 8, 112, 112); };
  const hidden = tex(c => { tile(c, '#5b7fa6', '#3e5f84'); c.fillStyle = 'rgba(255,255,255,.18)'; c.fillRect(8, 8, 112, 18); });
  const hover = tex(c => { tile(c, '#86a8cf', '#5b7fa6'); });
  const nums = Array.from({ length: 9 }, (_, k) => tex(c => {
    tile(c, '#efe6d2', '#cbbd9c');
    if (k) { c.fillStyle = NUM_COLORS[k]; c.font = 'bold 84px system-ui, sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(String(k), 64, 70); }
  }));
  const flag = tex(c => { tile(c, '#5b7fa6', '#3e5f84'); c.fillStyle = '#222'; c.fillRect(56, 28, 8, 72); c.fillStyle = '#d6262b'; c.beginPath(); c.moveTo(64, 28); c.lineTo(100, 46); c.lineTo(64, 64); c.fill(); c.fillRect(40, 96, 40, 8); });
  const mine = tex(c => { tile(c, '#efe6d2', '#cbbd9c'); c.fillStyle = '#111'; c.beginPath(); c.arc(64, 64, 26, 0, 7); c.fill(); c.strokeStyle = '#111'; c.lineWidth = 8; for (let a = 0; a < 4; a++) { c.beginPath(); c.moveTo(64 + 40 * Math.cos(a * Math.PI / 4), 64 + 40 * Math.sin(a * Math.PI / 4)); c.lineTo(64 - 40 * Math.cos(a * Math.PI / 4), 64 - 40 * Math.sin(a * Math.PI / 4)); c.stroke(); } });
  const boom = tex(c => { tile(c, '#d6262b', '#8a1418'); c.fillStyle = '#111'; c.beginPath(); c.arc(64, 64, 26, 0, 7); c.fill(); });
  return { hidden, hover, nums, flag, mine, boom };
}

export default function CubeMines() {
  const t = useT();
  const saved = useRef(loadJSON<Saved | null>('gp.cubemines', null)).current;
  const [size, setSize] = useState<Size>(saved?.size ?? 'medium');
  const [st, setSt] = useState<CMState>(() => saved?.st ?? newGame(PRESETS.medium.n, PRESETS.medium.mines));
  const [elapsed, setElapsed] = useState(saved?.elapsed ?? 0);
  const [flagMode, setFlagMode] = useState(false);
  const [hover, setHover] = useState(-1);
  const [view, setView] = useState<'loading' | 'ready' | 'failed'>('loading');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const world = useRef<{ meshes: THREE_NS.Mesh[]; mats: ReturnType<typeof makeMaterials>; rebuild: (n: number) => void } | null>(null);
  const stRef = useRef(st); stRef.current = st;
  const flagRef = useRef(flagMode); flagRef.current = flagMode;

  useEffect(() => { saveJSON('gp.cubemines', { size, st, elapsed } satisfies Saved); }, [size, st, elapsed]);
  useEffect(() => {
    if (st.status !== 'playing') return;
    const id = setInterval(() => { if (!document.hidden) setElapsed(e => e + 1000); }, 1000);
    return () => clearInterval(id);
  }, [st.status]);

  const act = (i: number, asFlag: boolean) => {
    const s = stRef.current;
    let next = s;
    if (asFlag) next = toggleFlag(s, i);
    else if (s.open[i]) next = chord(s, i);
    else next = reveal(s, i);
    if (next === s) return;
    sfx(next.status === 'lost' ? 'boom' : asFlag ? 'flag' : 'reveal');
    if (s.status === 'ready') noteStarted('minesweeper-3d');
    if ((next.status === 'won' || next.status === 'lost') && s.status === 'playing') {
      recordResult(getData().activeId, 'minesweeper-3d', { result: next.status === 'won' ? 'win' : 'loss', ms: next.status === 'won' ? elapsedRef.current : undefined, label: `${next.n}×${next.n}×6 · ${next.mines} mines`, bestKey: next.status === 'won' ? `${next.n}×${next.n}×6` : undefined });
    }
    setSt(next);
  };
  const elapsedRef = useRef(elapsed); elapsedRef.current = elapsed;
  const actRef = useRef(act); actRef.current = act;

  useEffect(() => {
    let dead = false;
    loadThree().then(THREE => {
      if (dead || !canvasRef.current) return;
      const S = createStage(THREE, canvasRef.current, { radius: 14 });
      S.orbit.min = 7; S.orbit.max = 30;
      const mats = makeMaterials(THREE), plane = new THREE.PlaneGeometry(0.98, 0.98);
      let group = new THREE.Group(); S.scene.add(group);
      const meshes: THREE_NS.Mesh[] = [];
      const rebuild = (n: number) => {
        S.scene.remove(group); group.traverse(o => { const m = o as THREE_NS.Mesh; if (m.geometry && m.geometry !== plane) m.geometry.dispose(); });
        group = new THREE.Group(); meshes.length = 0;
        const core = new THREE.Mesh(new THREE.BoxGeometry(n - 0.02, n - 0.02, n - 0.02), new THREE.MeshStandardMaterial({ color: 0x2a3a4c, roughness: 0.9 }));
        group.add(core);
        geometry(n).cells.forEach((c, i) => {
          const m = new THREE.Mesh(plane, mats.hidden);
          m.position.set(c.center[0] + c.normal[0] * 0.01, c.center[1] + c.normal[1] * 0.01, c.center[2] + c.normal[2] * 0.01);
          m.lookAt(c.center[0] + c.normal[0] * 5, c.center[1] + c.normal[1] * 5, c.center[2] + c.normal[2] * 5);
          m.userData.cell = i; group.add(m); meshes.push(m);
        });
        S.scene.add(group);
        S.orbit.radius = n * 2.9; S.orbit.min = n * 1.6; S.orbit.max = n * 5;
      };
      rebuild(stRef.current.n);
      const cv = canvasRef.current;
      const pts = new Map<number, { x: number; y: number }>();
      let down: { x: number; y: number; moved: boolean; t: number; timer: number; fired: boolean } | null = null, pinch = 0;
      cv.oncontextmenu = e => e.preventDefault();
      cv.onpointerdown = e => {
        cv.setPointerCapture(e.pointerId); pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
        if (pts.size > 1) { if (down) { clearTimeout(down.timer); down.moved = true; } return; }
        const x = e.clientX, y = e.clientY, right = e.button === 2;
        down = { x, y, moved: false, t: performance.now(), fired: false, timer: 0 };
        const d = down;
        // Long press flags; so does a right click.
        d.timer = window.setTimeout(() => { if (!d.moved) { const h = S.pick(x, y, meshes); if (h) { d.fired = true; actRef.current(h.object.userData.cell, true); navigator.vibrate?.(20); } } }, 430);
        if (right) { clearTimeout(d.timer); const h = S.pick(x, y, meshes); if (h) { d.fired = true; actRef.current(h.object.userData.cell, true); } }
      };
      cv.onpointermove = e => {
        const prev = pts.get(e.pointerId);
        if (!prev) { const h = S.pick(e.clientX, e.clientY, meshes); setHover(h ? h.object.userData.cell : -1); return; }
        pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
        if (pts.size === 2) { const [a, b] = [...pts.values()], dist = Math.hypot(a.x - b.x, a.y - b.y); if (pinch) S.zoomBy(pinch / dist); pinch = dist; return; }
        if (down && Math.hypot(e.clientX - down.x, e.clientY - down.y) > 7) { down.moved = true; clearTimeout(down.timer); }
        if (down?.moved) S.orbitBy(e.clientX - prev.x, e.clientY - prev.y);
      };
      const up = (e: PointerEvent) => {
        pts.delete(e.pointerId); if (pts.size < 2) pinch = 0;
        if (down && pts.size === 0) {
          clearTimeout(down.timer);
          if (!down.moved && !down.fired) { const h = S.pick(e.clientX, e.clientY, meshes); if (h) actRef.current(h.object.userData.cell, flagRef.current); }
          down = null;
        }
      };
      cv.onpointerup = up; cv.onpointercancel = up;
      cv.onwheel = e => { e.preventDefault(); S.zoomBy(e.deltaY > 0 ? 1.08 : 0.93); };
      world.current = { meshes, mats, rebuild };
      setView('ready');
    }).catch(() => { if (!dead) setView('failed'); });
    return () => { dead = true; world.current = null; };
  }, []);

  // Paint the faces from the game state.
  const builtN = useRef(0);
  useEffect(() => {
    const w = world.current; if (!w) return;
    if (builtN.current !== st.n) { w.rebuild(st.n); builtN.current = st.n; }
    const over = st.status === 'won' || st.status === 'lost';
    w.meshes.forEach((m, i) => {
      m.material = st.open[i] ? (st.mine[i] ? (i === st.boom ? w.mats.boom : w.mats.mine) : w.mats.nums[count(st, i)])
        : over && st.mine[i] ? (st.flag[i] ? w.mats.flag : w.mats.mine)
        : st.flag[i] ? w.mats.flag : i === hover && !over ? w.mats.hover : w.mats.hidden;
    });
  }, [st, hover, view]);

  const start = (s: Size) => { setSize(s); setSt(newGame(PRESETS[s].n, PRESETS[s].mines)); setElapsed(0); };
  const flags = st.flag.filter(Boolean).length;
  const status = st.status === 'won' ? t(`Cleared in ${fmtTime(elapsed)}!`, `用时${fmtTime(elapsed)}，全部扫清！`, `${fmtTime(elapsed)} sürede temizlendi!`)
    : st.status === 'lost' ? t('A mine went off.', '踩到地雷了。', 'Bir mayın patladı.')
    : st.status === 'ready' ? t('Tap any square to start; the first one is always safe.', '点任意一格开始，第一下总是安全的。', 'Başlamak için herhangi bir kareye dokun; ilki her zaman güvenlidir.')
    : flagMode ? t('Flag mode: taps place flags.', '插旗模式：点击插旗。', 'Bayrak modu: dokunuşlar bayrak koyar.') : t('Drag to turn the cube. Long-press or right-click to flag.', '拖动旋转立方体。长按或右键插旗。', 'Küpü çevirmek için sürükle. Bayrak için uzun bas ya da sağ tıkla.');
  return (
    <div className="play cubemines">
      <div className="play-main">
        <div className="statline"><span role="status" aria-live="polite">{status}</span>
          <span className="num">💣 {st.mines - flags} · {fmtTime(elapsed)}</span></div>
        <div className="qb-stage">
          <canvas ref={canvasRef} className="qb-canvas cm-canvas" aria-label={t('Minesweeper on a cube. Drag to turn it, tap a square to open it, long-press to flag.', '立方体扫雷。拖动旋转，点击方格打开，长按插旗。', 'Küp üzerinde Mayın Tarlası. Çevirmek için sürükle, açmak için kareye dokun, bayrak için uzun bas.')} />
          {view === 'loading' && <p className="qb-note">{t('Loading the 3D engine…', '正在加载3D引擎…', '3B motoru yükleniyor…')}</p>}
          {view === 'failed' && <p className="qb-note">{t('The 3D engine could not load. Check the connection and reload the page.', '3D引擎加载失败。请检查网络后刷新页面。', '3B motoru yüklenemedi. Bağlantıyı kontrol edip sayfayı yenile.')}</p>}
          <div className="cm-tools">
            <button type="button" id="cm-flag" className={'pool-round' + (flagMode ? ' on' : '')} aria-pressed={flagMode} onClick={() => setFlagMode(f => !f)} title={t('Flag mode', '插旗模式', 'Bayrak modu')}>⚑</button>
            {(st.status === 'won' || st.status === 'lost') && <button type="button" id="cm-again" className="btn primary" onClick={() => start(size)}>{t('New cube', '新的立方体', 'Yeni küp')}</button>}
          </div>
        </div>
      </div>
      <aside className="play-side">
        <p className="muted small">{t('The six faces are joined: a square on an edge also touches squares on the next face, and a number counts mines on every face it touches. Tap an open number whose flags are all placed to open its other neighbours.', '六个面是连在一起的：棱边上的方格也挨着相邻面的方格，数字会统计它接触到的所有面上的地雷。点击旗子已插满的数字，可以打开它其余的邻格。', 'Altı yüz birbirine bağlıdır: kenardaki bir kare yandaki yüzün karelerine de değer ve bir sayı değdiği her yüzdeki mayınları sayar. Bayrakları tamam olan açık bir sayıya dokunursan diğer komşuları açılır.')}</p>
        <div className="setup">
          <h3>{t('New cube', '新的立方体', 'Yeni küp')}</h3>
          <Seg id="cm-size" label={t('Size', '尺寸', 'Boyut')} value={size} onChange={start}
            options={[{ value: 'small', label: t('4×4 · 12', '4×4 · 12', '4×4 · 12') }, { value: 'medium', label: t('5×5 · 22', '5×5 · 22', '5×5 · 22') }, { value: 'large', label: t('6×6 · 36', '6×6 · 36', '6×6 · 36') }]} />
          <button type="button" id="cm-new" className="btn primary" onClick={() => start(size)}>{t('Start', '开始', 'Başla')}</button>
        </div>
      </aside>
    </div>
  );
}
