/**
 * A small shared 3D engine on top of three.js. three.js is loaded from a CDN the first time
 * a 3D game opens, so pages without 3D never download it. Games get a scene, a camera that
 * orbits a target, zoom by wheel or pinch, a render loop, ray picking and clean disposal.
 */
import type * as THREE_NS from 'three';

declare global { interface Window { THREE?: typeof THREE_NS } }
export type Three = typeof THREE_NS;

const SOURCES = [
  'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js',
  'https://cdn.jsdelivr.net/npm/three@0.128.0/build/three.min.js',
];
let loading: Promise<Three> | null = null;
export function loadThree(): Promise<Three> {
  if (window.THREE) return Promise.resolve(window.THREE);
  if (loading) return loading;
  loading = new Promise<Three>((resolve, reject) => {
    const tryAt = (k: number) => {
      if (k >= SOURCES.length) { loading = null; reject(new Error('3D engine could not be loaded')); return; }
      const s = document.createElement('script');
      s.src = SOURCES[k]; s.async = true;
      s.onload = () => (window.THREE ? resolve(window.THREE) : tryAt(k + 1));
      s.onerror = () => { s.remove(); tryAt(k + 1); };
      document.head.appendChild(s);
    };
    tryAt(0);
  });
  return loading;
}

export interface Stage {
  THREE: Three; scene: THREE_NS.Scene; camera: THREE_NS.PerspectiveCamera; renderer: THREE_NS.WebGLRenderer;
  /** Orbit state: angles in radians and distance from the target. */
  orbit: { theta: number; phi: number; radius: number; min: number; max: number };
  onFrame: (fn: (dt: number) => void) => () => void;
  pick: (clientX: number, clientY: number, objects: THREE_NS.Object3D[]) => THREE_NS.Intersection | null;
  ray: (clientX: number, clientY: number) => THREE_NS.Ray;
  orbitBy: (dx: number, dy: number) => void;
  zoomBy: (factor: number) => void;
  dispose: () => void;
}

export function createStage(THREE: Three, canvas: HTMLCanvasElement, opts: { radius?: number; background?: number | null } = {}): Stage {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: opts.background == null });
  renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
  const scene = new THREE.Scene();
  if (opts.background != null) scene.background = new THREE.Color(opts.background);
  const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
  scene.add(new THREE.AmbientLight(0xffffff, 0.62));
  const key = new THREE.DirectionalLight(0xffffff, 0.75); key.position.set(4, 7, 6); scene.add(key);
  const fill = new THREE.DirectionalLight(0xffffff, 0.3); fill.position.set(-5, -3, -4); scene.add(fill);
  const orbit = { theta: Math.PI / 4, phi: Math.PI / 3.2, radius: opts.radius ?? 8, min: 3, max: 30 };
  const placeCamera = () => {
    const { theta, phi, radius } = orbit;
    camera.position.set(radius * Math.sin(phi) * Math.sin(theta), radius * Math.cos(phi), radius * Math.sin(phi) * Math.cos(theta));
    camera.lookAt(0, 0, 0);
  };
  const resize = () => {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h; camera.updateProjectionMatrix();
  };
  const ro = new ResizeObserver(resize); ro.observe(canvas);
  resize(); placeCamera();
  const frameFns = new Set<(dt: number) => void>();
  let last = performance.now(), raf = 0, alive = true;
  const loop = (now: number) => {
    if (!alive) return;
    const dt = Math.min(0.05, (now - last) / 1000); last = now;
    frameFns.forEach(f => f(dt));
    placeCamera();
    renderer.render(scene, camera);
    raf = requestAnimationFrame(loop);
  };
  raf = requestAnimationFrame(loop);
  const raycaster = new THREE.Raycaster();
  // Edge outlines are drawn as lines; they must never catch a tap meant for the solid behind them.
  raycaster.params.Line = { threshold: 0.001 };
  const ndc = (x: number, y: number) => { const r = canvas.getBoundingClientRect(); return new THREE.Vector2(((x - r.left) / r.width) * 2 - 1, -((y - r.top) / r.height) * 2 + 1); };
  return {
    THREE, scene, camera, renderer, orbit,
    onFrame: fn => { frameFns.add(fn); return () => { frameFns.delete(fn); }; },
    pick: (x, y, objects) => { raycaster.setFromCamera(ndc(x, y), camera); return raycaster.intersectObjects(objects, true).find(h => (h.object as THREE_NS.Mesh).isMesh) ?? null; },
    ray: (x, y) => { raycaster.setFromCamera(ndc(x, y), camera); return raycaster.ray.clone(); },
    orbitBy: (dx, dy) => { orbit.theta -= dx * 0.008; orbit.phi = Math.max(0.15, Math.min(Math.PI - 0.15, orbit.phi - dy * 0.008)); },
    zoomBy: f => { orbit.radius = Math.max(orbit.min, Math.min(orbit.max, orbit.radius * f)); },
    dispose: () => {
      alive = false; cancelAnimationFrame(raf); ro.disconnect();
      scene.traverse(o => { const m = o as THREE_NS.Mesh; if (m.geometry) m.geometry.dispose(); const mat = m.material as THREE_NS.Material | THREE_NS.Material[] | undefined; if (Array.isArray(mat)) mat.forEach(x => x.dispose()); else mat?.dispose(); });
      renderer.dispose();
    },
  };
}

/**
 * Drag to orbit, pinch or wheel to zoom, tap to pick. `onTap` gets the tapped object (or
 * null); `onView` fires when a drag or zoom ends, for games whose controls follow the view.
 */
export function attachOrbit(S: Stage, canvas: HTMLCanvasElement, opts: { targets: () => THREE_NS.Object3D[]; onTap: (o: THREE_NS.Object3D | null) => void; onView?: () => void; onTouch?: () => void }) {
  let down: { x: number; y: number; moved: boolean } | null = null, pinch = 0;
  const pts = new Map<number, { x: number; y: number }>();
  canvas.onpointerdown = e => { opts.onTouch?.(); canvas.setPointerCapture(e.pointerId); pts.set(e.pointerId, { x: e.clientX, y: e.clientY }); down = { x: e.clientX, y: e.clientY, moved: pts.size > 1 }; };
  canvas.onpointermove = e => {
    const p = pts.get(e.pointerId); if (!p) return;
    if (pts.size === 2) {
      pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
      const [a, b] = [...pts.values()], dist = Math.hypot(a.x - b.x, a.y - b.y);
      if (pinch) S.zoomBy(pinch / dist); pinch = dist; if (down) down.moved = true; return;
    }
    const dx = e.clientX - p.x, dy = e.clientY - p.y;
    pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (down && Math.hypot(e.clientX - down.x, e.clientY - down.y) > 6) down.moved = true;
    if (down?.moved) S.orbitBy(dx, dy);
  };
  const up = (e: PointerEvent) => {
    pts.delete(e.pointerId); if (pts.size < 2) pinch = 0;
    if (down && pts.size === 0) {
      if (!down.moved) { const hit = S.pick(e.clientX, e.clientY, opts.targets()); opts.onTap(hit ? hit.object : null); }
      else opts.onView?.();
    }
    if (pts.size === 0) down = null;
  };
  canvas.onpointerup = up; canvas.onpointercancel = up;
  let wheelT = 0;
  canvas.onwheel = e => { e.preventDefault(); opts.onTouch?.(); S.zoomBy(e.deltaY > 0 ? 1.08 : 0.93); clearTimeout(wheelT); wheelT = window.setTimeout(() => opts.onView?.(), 200); };
}

/**
 * The world axes that best match the screen right now: right, up, and towards the viewer,
 * each as [axis 0|1|2, sign]. Lets arrow buttons move things the way they look on screen.
 */
export function screenAxes(S: Stage): { right: [number, number]; up: [number, number]; toward: [number, number] } {
  const cam = S.camera.position, f = [-cam.x, -cam.y, -cam.z], len = Math.hypot(f[0], f[1], f[2]);
  const fw = f.map(v => v / len);
  const right = [fw[1] * 0 - fw[2] * 1, fw[2] * 0 - fw[0] * 0, fw[0] * 1 - fw[1] * 0]; // f × (0,1,0)
  const upv = [right[1] * fw[2] - right[2] * fw[1], right[2] * fw[0] - right[0] * fw[2], right[0] * fw[1] - right[1] * fw[0]]; // right × f
  const best = (v: number[], not: number[]): [number, number] => { let a = -1, m = -1; for (let k = 0; k < 3; k++) if (!not.includes(k) && Math.abs(v[k]) > m) { m = Math.abs(v[k]); a = k; } return [a, Math.sign(v[a]) || 1]; };
  const r = best(right, []), u = best(upv, [r[0]]);
  const t = 3 - r[0] - u[0];
  return { right: r, up: u, toward: [t, Math.sign(-fw[t]) || 1] };
}
