import './luban.css';
import { useEffect, useMemo, useRef, useState } from 'react';
import type * as THREE_NS from 'three';
import { useT } from '../../core/i18n';
import { sfx } from '../../core/sound';
import { loadJSON, saveJSON } from '../../core/storage';
import { getData, noteStarted, recordResult } from '../../core/store';
import { attachOrbit, createStage, loadThree, screenAxes, type Stage } from '../../core/three/engine';
import { Seg } from '../../ui/bits';
import { apply, AXIS, canLeave, canStep, DIRS, insertAt, isHome, moves, outPos, samePos, solve, startPos, trail, type Lock, type Move, type Pos } from './rules';

export const WALNUT = [0xc89b62, 0xa0703f, 0xd9b27a, 0x8a5a2e, 0xb98550, 0x6f4422];
interface Saved { id: string; pos: Pos; moves: number; history: Pos[]; recorded: boolean; hints: number }
/**
 * Six-stick locks. `apart`: take the lock to pieces (Lu Ban lock, burrs). `together`: the
 * pieces start outside and you build the lock (Kongming lock).
 */
export interface LockProps { game: string; store: string; locks: Lock[]; mode: 'apart' | 'together'; wood?: number[]; bench?: string }
/** Direction index for an axis and sign. */
const dirOf = (axis: number, sign: number) => axis * 2 + (sign > 0 ? 0 : 1);

export default function LockGame({ game, store, locks: ALL, mode, wood: WOOD = WALNUT, bench }: LockProps) {
  const t = useT();
  const LEVELS = [...new Set(ALL.map(l => l.level))];
  const fresh = (id: string): Saved => ({ id, pos: mode === 'apart' ? startPos(6) : outPos(6), moves: 0, history: [], recorded: false, hints: 0 });
  const [g, setG] = useState<Saved>(() => loadJSON<Saved | null>(store, null) ?? fresh(ALL[0].id));
  const [sel, setSel] = useState(-1);
  const [state3d, setState3d] = useState<'loading' | 'ready' | 'failed'>('loading');
  const [axes, setAxes] = useState<ReturnType<typeof screenAxes> | null>(null);
  const [hintMove, setHintMove] = useState<Move | null>(null);
  const [msg, setMsg] = useState('');
  const canvasRef = useRef<HTMLCanvasElement>(null), stage = useRef<Stage | null>(null);
  const groups = useRef<THREE_NS.Group[]>([]), mats = useRef<THREE_NS.MeshStandardMaterial[]>([]);
  const selRef = useRef(sel); selRef.current = sel;
  useEffect(() => { saveJSON(store, g); }, [g]); // eslint-disable-line
  const lock = ALL.find(l => l.id === g.id) ?? ALL[0], pieces = lock.pieces;
  const done = mode === 'apart' ? g.pos.every(o => !o) : isHome(g.pos);
  const path = useMemo(() => (mode === 'together' ? trail(pieces) : null), [lock.id]); // eslint-disable-line
  /** Where a piece waits outside the lock while it is being built: pulled out along its own axis. */
  const park = (i: number): [number, number, number] => { const v: [number, number, number] = [0, 0, 0]; v[AXIS[i]] = i % 2 ? -6.5 : 6.5; return v; };

  // Build the scene for this lock.
  useEffect(() => {
    let dead = false;
    loadThree().then(THREE => {
      if (dead || !canvasRef.current) return;
      const S = createStage(THREE, canvasRef.current, { radius: mode === 'together' ? 29 : 17 });
      S.orbit.min = 9; S.orbit.max = 34; S.orbit.phi = 1.0; S.orbit.theta = 0.7;
      stage.current = S;
      const geo = new THREE.BoxGeometry(0.97, 0.97, 0.97), edges = new THREE.EdgesGeometry(geo);
      const lineMat = new THREE.LineBasicMaterial({ color: 0x3b2410, transparent: true, opacity: 0.35 });
      mats.current = WOOD.map(c => new THREE.MeshStandardMaterial({ color: c, roughness: 0.75, metalness: 0.02 }));
      groups.current = pieces.map((cells, i) => {
        const grp = new THREE.Group();
        for (const [x, y, z] of cells) {
          const m = new THREE.Mesh(geo, mats.current[i]); m.position.set(x - 2.5, y - 2.5, z - 2.5); m.userData.piece = i; grp.add(m);
          const e = new THREE.LineSegments(edges, lineMat); e.position.copy(m.position); grp.add(e);
        }
        S.scene.add(grp); return grp;
      });
      // Pieces glide to their places.
      S.onFrame(dt => groups.current.forEach(grp => {
        const tgt = grp.userData.target as THREE_NS.Vector3 | undefined; if (!tgt) return;
        grp.position.lerp(tgt, Math.min(1, dt * 12));
        const fade = grp.userData.out ? Math.max(0, (grp.userData.fade ?? 1) - dt * 1.6) : 1;
        grp.userData.fade = fade; grp.visible = fade > 0.02;
      }));
      let idle = true;
      S.onFrame(dt => { if (idle) S.orbit.theta += dt * 0.15; });
      attachOrbit(S, canvasRef.current, {
        targets: () => groups.current.filter(x => x.visible),
        onTap: o => { const i = o?.userData.piece; if (typeof i === 'number') { setSel(i === selRef.current ? -1 : i); sfx('click', 0.4); } else setSel(-1); },
        onView: () => setAxes(screenAxes(S)),
        onTouch: () => { idle = false; },
      });
      setAxes(screenAxes(S)); setState3d('ready');
    }).catch(() => { if (!dead) setState3d('failed'); });
    return () => { dead = true; stage.current?.dispose(); stage.current = null; groups.current = []; };
  }, [lock.id]); // eslint-disable-line

  // Keep the pieces where the position says; selection glows.
  useEffect(() => {
    const S = stage.current; if (!S || state3d !== 'ready') return;
    groups.current.forEach((grp, i) => {
      const o = g.pos[i];
      const tgt = grp.userData.target as THREE_NS.Vector3 | undefined ?? new S.THREE.Vector3();
      if (o) { tgt.set(o[0], o[1], o[2]); grp.userData.out = false; grp.userData.fade = 1; grp.visible = true; }
      else if (mode === 'together') { const p = park(i); tgt.set(p[0], p[1], p[2]); grp.userData.out = false; grp.userData.fade = 1; grp.visible = true; }
      else if (!grp.userData.out) {
        // Fly out along the way it left.
        const last = g.history.length ? g.history[g.history.length - 1][i] : null, d = hintOut.current.get(i) ?? [0, 8, 0];
        tgt.set((last?.[0] ?? 0) + d[0], (last?.[1] ?? 0) + d[1], (last?.[2] ?? 0) + d[2]); grp.userData.out = true;
      }
      grp.userData.target = tgt;
      mats.current[i]?.emissive.setHex(i === sel ? 0x5a3a00 : hintMove?.i === i ? 0x6b1a10 : 0x000000);
    });
  }, [g.pos, sel, hintMove, state3d]); // eslint-disable-line
  const hintOut = useRef(new Map<number, [number, number, number]>());
  useEffect(() => { if (sel >= 0 && !g.pos[sel]) setSel(-1); }, [g.pos, sel]);

  const doMove = (m: Move, hinted = false, to?: Pos) => {
    if (!g.moves) noteStarted(game);
    const pos = to ?? apply(g.pos, m), moves = g.moves + 1, hints = g.hints + (hinted ? 1 : 0);
    if (m.out) { const d = DIRS[m.d]; hintOut.current.set(m.i, [d[0] * 9, d[1] * 9, d[2] * 9]); sfx('slide', 0.8); } else sfx('peg', 0.6);
    let recorded = g.recorded;
    if ((mode === 'apart' ? pos.every(o => !o) : isHome(pos)) && !recorded) {
      recorded = true; setTimeout(() => sfx('win'), 400);
      if (!hints) recordResult(getData().activeId, game, { result: 'win', label: `${lock.id} · ${moves}/${lock.moves}`, bestKey: lock.id });
    }
    setG({ ...g, pos, moves, history: [...g.history, g.pos], recorded, hints }); setHintMove(null); setMsg('');
  };
  const push = (axis: number, sign: number) => {
    if (sel < 0 || done) { setMsg(t('Tap a piece first.', '先点选一块木条。', 'Önce bir parçaya dokun.')); return; }
    const d = dirOf(axis, sign);
    if (!g.pos[sel]) {
      // Outside (building the lock): push it in from this side.
      const o = insertAt(pieces, g.pos, sel, d);
      if (o) doMove({ i: sel, d }, false, g.pos.map((p, k) => (k === sel ? o : p)));
      else { sfx('error', 0.4); setMsg(t('It cannot get in from that side.', '从这一侧放不进去。', 'O taraftan giremiyor.')); }
      return;
    }
    if (canLeave(pieces, g.pos, sel, DIRS[d])) doMove({ i: sel, d, out: true });
    else if (canStep(pieces, g.pos, sel, DIRS[d])) doMove({ i: sel, d });
    else { sfx('error', 0.4); setMsg(t('It will not move that way.', '这个方向推不动。', 'O yöne kımıldamıyor.')); }
  };
  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      if (!axes || (e.target as HTMLElement).closest('input, select, textarea')) return;
      const map: Record<string, [number, number]> = { ArrowRight: [axes.right[0], axes.right[1]], ArrowLeft: [axes.right[0], -axes.right[1]], ArrowUp: [axes.up[0], axes.up[1]], ArrowDown: [axes.up[0], -axes.up[1]], s: [axes.toward[0], axes.toward[1]], w: [axes.toward[0], -axes.toward[1]] };
      const m = map[e.key]; if (m) { e.preventDefault(); push(m[0], m[1]); }
    };
    window.addEventListener('keydown', k); return () => window.removeEventListener('keydown', k);
  });
  const hint = () => {
    if (mode === 'together' && path) {
      // Follow the take-apart solution backwards: find where we are on it and step towards home.
      const j = path.at.findIndex(p => samePos(p, g.pos));
      if (j > 0) {
        const m = path.moves[j - 1], to = path.at[j - 1];
        setSel(m.i); setG(x => ({ ...x }));
        doMove({ i: m.i, d: m.d }, true, to);
        return;
      }
      // A few steps off the way: search briefly for a route back onto it.
      const key = (p: Pos) => p.map(o => (o ? o.join(',') : 'x')).join('|');
      const onPath = new Map(path.at.map((p, k) => [key(p), k]));
      const seen = new Map<string, Move | null>([[key(g.pos), null]]);
      let frontier: { p: Pos; first: Move | null }[] = [{ p: g.pos, first: null }];
      for (let depth = 0; depth < 4 && frontier.length; depth++) {
        const next: typeof frontier = [];
        for (const f of frontier) for (const m of moves(pieces, f.p).filter(x => !x.out)) {
          const q = apply(f.p, m), kq = key(q); if (seen.has(kq)) continue;
          seen.set(kq, m); const first = f.first ?? m;
          if (onPath.has(kq)) { setSel(first.i); doMove(first, true); return; }
          next.push({ p: q, first });
        }
        frontier = next;
      }
      setMsg(t('This is off the known way in: take pieces back out (or undo) and try the hint again.', '这一步偏离了已知的装法：把木条抽出来（或撤销），再试提示。', 'Bu bilinen yoldan sapmış: parçaları geri çıkar (ya da geri al) ve ipucunu yeniden dene.'));
      return;
    }
    const path2 = solve(pieces, g.pos, 5, 150000);
    if (!path2?.length) { setMsg(t('No way out from here within reach: undo a few moves.', '从这里找不到出路：撤销几步试试。', 'Buradan yakın bir çıkış yok: birkaç hamle geri al.')); return; }
    setHintMove(path2[0]); setSel(path2[0].i); setG(x => ({ ...x, hints: x.hints + 1 }));
  };
  const btn = (axis: number, sign: number, label: string, id: string) => {
    const d = dirOf(axis, sign), outside = sel >= 0 && !g.pos[sel];
    const ok = sel >= 0 && !done && (outside ? !!insertAt(pieces, g.pos, sel, d) : canStep(pieces, g.pos, sel, DIRS[d])), out = ok && !outside && canLeave(pieces, g.pos, sel, DIRS[d]);
    const isHint = hintMove && hintMove.i === sel && hintMove.d === d;
    return <button type="button" id={id} className={'btn lb-dir' + (out ? ' out' : '') + (isHint ? ' hint' : '')} disabled={!ok} onClick={() => push(axis, sign)} aria-label={label}>{label}</button>;
  };
  const left = g.pos.filter(Boolean).length;
  const levelLocks = ALL.filter(l => l.level === lock.level);
  return (
    <div className="play">
      <div className="play-main">
        <div className="statline"><span role="status" aria-live="polite">{done && mode === 'together' ? (g.hints ? t('The lock is built, with hints.', '在提示下装好了。', 'Kilit ipuçlarıyla kuruldu.') : t(`The lock is built in ${g.moves} moves!`, `用${g.moves}步装好了！`, `Kilit ${g.moves} hamlede kuruldu!`)) : done ? (g.hints ? t('Taken apart, with hints.', '在提示下拆开了。', 'İpuçlarıyla söküldü.') : g.moves === lock.moves ? t(`Taken apart in the fewest moves: ${lock.moves}!`, `用最少的${lock.moves}步拆开了！`, `En az hamleyle söküldü: ${lock.moves}!`) : t(`Taken apart in ${g.moves} moves (best ${lock.moves}).`, `用${g.moves}步拆开了（最少${lock.moves}步）。`, `${g.moves} hamlede söküldü (en iyisi ${lock.moves}).`)) : msg || (sel < 0 ? (mode === 'together' ? t('Tap a stick lying outside, then push it in with an arrow. Build the lock with all six.', '点一根放在外面的木条，用箭头把它推进去。用六根木条装好整把锁。', 'Dışarıdaki bir çubuğa dokun, sonra bir okla içeri it. Altısıyla kilidi kur.') : t('Tap a stick, then slide it with the arrows. A stick that slides clear leaves the lock.', '点一根木条，再用箭头推动它。能完全推出的木条就会离开。', 'Bir çubuğa dokun, sonra oklarla kaydır. Tamamen çıkabilen çubuk kilitten ayrılır.')) : t('Slide it with the arrows; dark arrows mean it can go.', '用箭头推动；亮起的箭头表示可以推。', 'Oklarla kaydır; koyu oklar o yöne gidebileceğini gösterir.'))}</span><span className="num">{g.moves} · {mode === 'apart' ? 6 - left : g.pos.filter(o => o && !o[0] && !o[1] && !o[2]).length}/6</span></div>
        <div className="lb-stage" style={bench ? { background: bench } : undefined}>
          <canvas ref={canvasRef} className="lb-canvas" aria-label={t('The lock in 3D. Drag to turn it, tap a stick to pick it.', '三维鲁班锁。拖动可旋转，点击木条选中它。', '3B kilit. Döndürmek için sürükle, seçmek için bir çubuğa dokun.')} />
          {state3d === 'loading' && <p className="lb-note">{t('Loading 3D…', '正在加载三维…', '3B yükleniyor…')}</p>}
          {state3d === 'failed' && <p className="lb-note">{t('3D could not be loaded here.', '这里无法加载三维。', '3B burada yüklenemedi.')}</p>}
        </div>
        {axes && (
          <div className="lb-pad" role="group" aria-label={t('Slide the stick', '推动木条', 'Çubuğu kaydır')}>
            <span />{btn(axes.up[0], axes.up[1], '↑', 'lb-up')}{btn(axes.toward[0], -axes.toward[1], '⊗', 'lb-away')}
            {btn(axes.right[0], -axes.right[1], '←', 'lb-left')}<span className="lb-sel">{sel >= 0 ? <i style={{ background: '#' + WOOD[sel].toString(16) }} /> : '·'}</span>{btn(axes.right[0], axes.right[1], '→', 'lb-right')}
            <span />{btn(axes.up[0], -axes.up[1], '↓', 'lb-down')}{btn(axes.toward[0], axes.toward[1], '⊙', 'lb-toward')}
          </div>
        )}
      </div>
      <aside className="play-side">
        <dl className="facts">
          <div><dt>{t('Level', '难度', 'Seviye')}</dt><dd className="num">{lock.level}</dd></div>
          <div><dt>{mode === 'apart' ? t('Fewest moves', '最少步数', 'En az hamle') : t('Moves to take it apart', '拆开所需步数', 'Sökmek için hamle')}</dt><dd className="num">{lock.moves}</dd></div>
        </dl>
        <p className="muted small">{t('The level counts the moves before the first stick can come out. ⊙ slides towards you, ⊗ away. Keys: arrows, W and S.', '难度表示第一根木条能拔出之前需要的步数。⊙朝你推，⊗往里推。键盘：方向键、W和S。', 'Seviye, ilk çubuk çıkabilene kadar gereken hamle sayısıdır. ⊙ sana doğru, ⊗ içeri kaydırır. Tuşlar: oklar, W ve S.')}</p>
        <div className="tools">
          <button type="button" id="lb-undo" className="btn" disabled={!g.history.length || done} onClick={() => { setG({ ...g, pos: g.history[g.history.length - 1], history: g.history.slice(0, -1), moves: g.moves + 1 }); setHintMove(null); }}>{t('Undo', '撤销', 'Geri al')}</button>
          <button type="button" id="lb-hint" className="btn" disabled={done} onClick={hint}>{t('Hint', '提示', 'İpucu')}</button>
        </div>
        <div className="setup">
          <Seg id="lb-level" label={t('Level', '难度', 'Seviye')} value={lock.level} onChange={(lv: number) => { setG(fresh(ALL.find(l => l.level === lv)!.id)); setSel(-1); setHintMove(null); }} options={LEVELS.map(l => ({ value: l, label: String(l) }))} />
          {levelLocks.length > 1 && <Seg id="lb-lock" label={t('Lock', '锁', 'Kilit')} value={lock.id} onChange={id => { setG(fresh(id)); setSel(-1); setHintMove(null); }} options={levelLocks.map((l, k) => ({ value: l.id, label: String.fromCharCode(65 + k) }))} />}
          <button type="button" id={done ? 'lb-again' : 'lb-new'} className="btn primary" onClick={() => { setG(fresh(lock.id)); setSel(-1); setHintMove(null); }}>{mode === 'apart' ? t('Put it back together', '重新装好', 'Yeniden birleştir') : t('Scatter the pieces', '重新打散', 'Parçaları dağıt')}</button>
        </div>
      </aside>
    </div>
  );
}
