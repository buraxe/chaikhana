import './billiards.css';
import { useCallback, useEffect, useRef, useState } from 'react';
import { sfx } from '../../core/sound';
import { RivalPick, useRival } from '../../ui/Cast';
import { pname, trLabel, useLang, useT, aiLabel } from '../../core/i18n';
import { recordMatch, type MatchConfig } from '../../core/match';
import { loadJSON, saveJSON } from '../../core/storage';
import { activeOf, noteStarted, useData } from '../../core/store';
import { Pick, Seg } from '../../ui/bits';
import { chooseShot, LEVELS, placeCueBall } from './ai';
import { cloneBalls, CUSHIONS, free, H, newEvents, POCKETS, R, step, strike, W, type Ball, type ShotEvents, type Spin } from './physics';
import { groupOf, HEAD_X, judge, legalTargets, newTable, type Mode, type Table } from './rules';

type Felt = 'green' | 'blue' | 'wine' | 'purple' | 'teal' | 'black';
type Cue = 'maple' | 'ebony' | 'lacquer';
interface Cfg { mode: Mode; opponent: 'ai' | 'local'; level: number; p2: string; felt: Felt; cue: Cue }
interface Saved { cfg: Cfg; table: Table; racks: [number, number]; recorded: boolean; started: boolean }
const DEFAULT: Cfg = { mode: '8ball', opponent: 'ai', level: 2, p2: 'guest', felt: 'green', cue: 'maple' };
const FELT: Record<Felt, [string, string]> = { green: ['#1f6b45', '#17573a'], blue: ['#1f5a8a', '#174a72'], wine: ['#7a2833', '#62202a'], purple: ['#5b2c83', '#47216a'], teal: ['#1d6f6c', '#155956'], black: ['#26262b', '#18181c'] };
const CUES: Record<Cue, [string, string, string]> = { maple: ['#e8cf9c', '#b8894a', '#2a1a0c'], ebony: ['#3a2f2a', '#1b1512', '#d9c08a'], lacquer: ['#b8392f', '#7c1f18', '#e8d29a'] };
const BALL = ['#f5f1e6', '#e8b923', '#1f4fa8', '#c8302a', '#5b2c83', '#e2702a', '#1f7a43', '#7a1f25', '#141414'];
const RAIL = 0.085;
const fresh = (cfg: Cfg, racks: [number, number] = [0, 0]): Saved => ({ cfg, table: newTable(cfg.mode), racks, recorded: false, started: false });

export default function Billiards() {
  const t = useT(), lang = useLang(), data = useData(), me = activeOf(data);
  const [g, setG] = useState<Saved>(() => loadJSON<Saved | null>('gp.pool', null) ?? fresh(DEFAULT));
  const [draft, setDraft] = useState<Cfg>(g.cfg);
  const [angle, setAngle] = useState(0);
  const [power, setPower] = useState(0.45);
  const [spin, setSpin] = useState<Spin>({ follow: 0, side: 0 });
  const [running, setRunning] = useState(false);
  const [confirmNew, setConfirmNew] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const live = useRef<{ balls: Ball[]; ev: ShotEvents; spin: Spin } | null>(null);
  const drag = useRef<'aim' | 'place' | null>(null);
  const aimFrom = useRef({ theta: 0, a: 0 });
  const stroke = useRef<{ t0: number; a: number; pw: number } | null>(null);
  const pull = useRef<{ y0: number; h: number; pw: number } | null>(null);
  const [pulling, setPulling] = useState(false);
  const [spinOpen, setSpinOpen] = useState(false);
  const aiBusy = useRef(false);
  const vertical = useRef(false);
  const tbl = g.table, cfg = g.cfg;
  const p2 = data.profiles.find(p => p.id === cfg.p2 && p.id !== me.id);
  const isHuman = (p: number) => cfg.mode === 'practice' || cfg.opponent === 'local' || p === 0;
  const aiName = aiLabel(LEVELS[cfg.level].name, lang);
  useRival('billiards', cfg.opponent === 'ai' ? cfg.level : null);
  const nameOf = (p: number) => (p === 0 ? pname(me, lang) : cfg.opponent === 'ai' ? aiName : p2 ? pname(p2, lang) : t('Guest', '游客', 'Misafir'));
  const humanTurn = !running && tbl.winner < 0 && isHuman(tbl.turn);

  useEffect(() => { saveJSON('gp.pool', g); }, [g]);

  // ---- drawing ----
  const draw = useCallback(() => {
    const cv = canvasRef.current, wrap = wrapRef.current;
    if (!cv || !wrap) return;
    // On an upright phone the table stands on its end, head string at the bottom.
    const vert = wrap.clientWidth < 560;
    vertical.current = vert;
    const cssW = wrap.clientWidth, s = cssW / ((vert ? H : W) + 2 * RAIL), cssH = ((vert ? W : H) + 2 * RAIL) * s, dpr = window.devicePixelRatio || 1;
    if (cv.width !== Math.round(cssW * dpr) || cv.height !== Math.round(cssH * dpr)) { cv.width = Math.round(cssW * dpr); cv.height = Math.round(cssH * dpr); cv.style.height = cssH + 'px'; }
    const c = cv.getContext('2d')!;
    if (vert) c.setTransform(0, -dpr * s, dpr * s, 0, dpr * s * RAIL, dpr * s * (W + RAIL));
    else c.setTransform(dpr * s, 0, 0, dpr * s, dpr * s * RAIL, dpr * s * RAIL);
    const balls = live.current?.balls ?? tbl.balls;
    // rails and felt
    const wood = c.createLinearGradient(0, -RAIL, 0, H + RAIL); wood.addColorStop(0, '#6b3f1d'); wood.addColorStop(0.5, '#4a2a12'); wood.addColorStop(1, '#6b3f1d');
    c.fillStyle = wood; c.fillRect(-RAIL, -RAIL, W + 2 * RAIL, H + 2 * RAIL);
    const [f1, f2] = FELT[cfg.felt], felt = c.createRadialGradient(W / 2, H / 2, 0.1, W / 2, H / 2, W * 0.6);
    felt.addColorStop(0, f1); felt.addColorStop(1, f2);
    c.fillStyle = felt; c.fillRect(-0.02, -0.02, W + 0.04, H + 0.04);
    c.strokeStyle = 'rgba(0,0,0,.35)'; c.lineWidth = 0.012;
    for (const [x1, y1, x2, y2] of CUSHIONS) { c.beginPath(); c.moveTo(x1, y1); c.lineTo(x2, y2); c.stroke(); }
    c.fillStyle = '#e9dcc0';
    for (let k = 1; k < 8; k++) if (k !== 4) for (const y of [-RAIL / 2, H + RAIL / 2]) { c.beginPath(); c.arc((W * k) / 8, y, 0.008, 0, 7); c.fill(); }
    for (let k = 1; k < 4; k++) for (const x of [-RAIL / 2, W + RAIL / 2]) { c.beginPath(); c.arc(x, (H * k) / 4, 0.008, 0, 7); c.fill(); }
    c.fillStyle = '#0b0b0b';
    for (const p of POCKETS) { c.beginPath(); c.arc(p.x, p.y, p.r + 0.006, 0, 7); c.fill(); }
    c.strokeStyle = 'rgba(255,255,255,.12)'; c.lineWidth = 0.003;
    c.beginPath(); c.moveTo(HEAD_X, 0); c.lineTo(HEAD_X, H); c.stroke();
    c.fillStyle = 'rgba(255,255,255,.25)'; c.beginPath(); c.arc(W * 0.75, H / 2, 0.006, 0, 7); c.fill();
    // aim guide
    const cue = balls.find(b => b.id === 0);
    if (humanTurn && !live.current && !stroke.current && cue && cue.on && !tbl.ballInHand) {
      const dx = Math.cos(angle), dy = Math.sin(angle);
      let tHit = Infinity, hit: Ball | null = null;
      for (const b of balls) {
        if (!b.on || b.id === 0) continue;
        const ox = cue.x - b.x, oy = cue.y - b.y, bq = ox * dx + oy * dy, cq = ox * ox + oy * oy - 4 * R * R, disc = bq * bq - cq;
        if (disc < 0) continue;
        const tt = -bq - Math.sqrt(disc);
        if (tt > 0 && tt < tHit) { tHit = tt; hit = b; }
      }
      let tWall = Infinity;
      if (dx > 0) tWall = Math.min(tWall, (W - R - cue.x) / dx); if (dx < 0) tWall = Math.min(tWall, (R - cue.x) / dx);
      if (dy > 0) tWall = Math.min(tWall, (H - R - cue.y) / dy); if (dy < 0) tWall = Math.min(tWall, (R - cue.y) / dy);
      const tt = Math.min(tHit, tWall), gx = cue.x + dx * tt, gy = cue.y + dy * tt;
      c.setLineDash([0.02, 0.015]); c.strokeStyle = 'rgba(255,255,255,.7)'; c.lineWidth = 0.004;
      c.beginPath(); c.moveTo(cue.x, cue.y); c.lineTo(gx, gy); c.stroke(); c.setLineDash([]);
      c.beginPath(); c.arc(gx, gy, R, 0, 7); c.stroke();
      if (hit && tHit <= tWall) {
        const nx = hit.x - gx, ny = hit.y - gy, nl = Math.hypot(nx, ny);
        c.strokeStyle = 'rgba(255,230,150,.85)';
        c.beginPath(); c.moveTo(hit.x, hit.y); c.lineTo(hit.x + (nx / nl) * 0.25, hit.y + (ny / nl) * 0.25); c.stroke();
        const legal = legalTargets(tbl).includes(hit.id);
        if (!legal && cfg.mode !== 'practice') { c.strokeStyle = '#ff6b5a'; c.lineWidth = 0.006; c.beginPath(); c.arc(hit.x, hit.y, R + 0.008, 0, 7); c.stroke(); }
      }
    }
    // balls
    for (const b of balls) {
      if (!b.on) continue;
      c.fillStyle = 'rgba(0,0,0,.28)'; c.beginPath(); c.arc(b.x + 0.004, b.y + 0.006, R, 0, 7); c.fill();
      const base = b.id === 0 ? BALL[0] : b.id > 8 ? BALL[0] : BALL[b.id];
      c.fillStyle = base; c.beginPath(); c.arc(b.x, b.y, R, 0, 7); c.fill();
      if (b.id > 8) { c.save(); c.beginPath(); c.arc(b.x, b.y, R, 0, 7); c.clip(); c.fillStyle = BALL[b.id - 8]; c.fillRect(b.x - R, b.y - R * 0.55, 2 * R, R * 1.1); c.restore(); }
      if (b.id > 0) {
        c.fillStyle = '#f8f5ec'; c.beginPath(); c.arc(b.x, b.y, R * 0.48, 0, 7); c.fill();
        c.fillStyle = '#111'; c.font = `700 ${R * 0.62}px system-ui, sans-serif`; c.textAlign = 'center'; c.textBaseline = 'middle';
        c.save(); c.translate(b.x, b.y); if (vertical.current) c.rotate(Math.PI / 2); c.fillText(String(b.id), 0, R * 0.04); c.restore();
      }
      const shine = c.createRadialGradient(b.x - R * 0.35, b.y - R * 0.4, 0, b.x, b.y, R);
      shine.addColorStop(0, 'rgba(255,255,255,.55)'); shine.addColorStop(0.35, 'rgba(255,255,255,0)'); shine.addColorStop(1, 'rgba(0,0,0,.25)');
      c.fillStyle = shine; c.beginPath(); c.arc(b.x, b.y, R, 0, 7); c.fill();
    }
    // cue stick
    // The cue is drawn while a player lines up and during the stroke itself, never while the balls run.
    const st = stroke.current;
    if (cue && cue.on && !tbl.ballInHand && (st || (humanTurn && !live.current))) {
      const a = st ? st.a : angle, pw = st ? st.pw : power;
      let back = 0.03 + pw * 0.18;
      if (st) { const k = Math.min(1, (performance.now() - st.t0) / 110); back = (0.03 + pw * 0.18) * (1 - k) - 0.004 * k; }
      const [shaft, butt, tip] = CUES[cfg.cue], len = 1.2;
      const dx = Math.cos(a), dy = Math.sin(a);
      const x1 = cue.x - dx * (R + back), y1 = cue.y - dy * (R + back), x2 = x1 - dx * len, y2 = y1 - dy * len;
      const grad = c.createLinearGradient(x1, y1, x2, y2); grad.addColorStop(0, shaft); grad.addColorStop(0.55, shaft); grad.addColorStop(0.62, butt); grad.addColorStop(1, butt);
      c.lineCap = 'round'; c.strokeStyle = grad; c.lineWidth = 0.016; c.beginPath(); c.moveTo(x1, y1); c.lineTo(x2, y2); c.stroke();
      c.strokeStyle = tip; c.lineWidth = 0.012; c.beginPath(); c.moveTo(x1, y1); c.lineTo(x1 - dx * 0.012, y1 - dy * 0.012); c.stroke();
    }
    if (tbl.ballInHand && cue && humanTurn) {
      c.strokeStyle = 'rgba(255,255,255,.8)'; c.lineWidth = 0.004; c.setLineDash([0.012, 0.01]);
      c.beginPath(); c.arc(cue.x, cue.y, R + 0.012, 0, 7); c.stroke(); c.setLineDash([]);
    }
  }, [tbl, angle, power, humanTurn, cfg.felt, cfg.cue, cfg.mode]);

  useEffect(() => { draw(); }, [draw]);
  useEffect(() => { const on = () => draw(); window.addEventListener('resize', on); return () => window.removeEventListener('resize', on); }, [draw]);

  // ---- shooting ----
  const shoot = (a: number, pw: number, sp: Spin) => {
    if (running || tbl.winner >= 0) return;
    if (!g.started) noteStarted('billiards');
    const balls = cloneBalls(tbl.balls), ev = newEvents(), s = { ...sp };
    setRunning(true);
    stroke.current = { t0: performance.now(), a, pw };
    const swing = (now: number) => {
      draw();
      if (now - stroke.current!.t0 < 120) { requestAnimationFrame(swing); return; }
      stroke.current = null;
      strike(balls, a, pw); sfx('cue', 0.4 + pw * 0.6); ev.sounds = [];
      live.current = { balls, ev, spin: s };
      lastT = performance.now();
      requestAnimationFrame(frame);
    };
    let lastT = performance.now();
    const frame = (now: number) => {
      const dt = Math.min(0.04, (now - lastT) / 1000); lastT = now;
      const L = live.current!;
      const still = step(L.balls, dt, L.ev, L.spin);
      if (L.ev.sounds?.length) { for (const [k, v] of L.ev.sounds.slice(0, 3)) if (k === 'pocket' || v > 0.05) sfx(k, k === 'pocket' ? 1 : Math.min(1, v / 2.2)); L.ev.sounds.length = 0; }
      draw();
      if (still && L.ev.time < 25) { requestAnimationFrame(frame); return; }
      live.current = null;
      setRunning(false);
      setG(prev => {
        const res = judge(prev.table, L.balls, L.ev);
        const next: Saved = { ...prev, table: res, started: true };
        if (res.winner >= 0 && prev.table.winner < 0 && cfg.mode !== 'practice') {
          const racks: [number, number] = [prev.racks[0], prev.racks[1]]; racks[res.winner as 0 | 1]++;
          next.racks = racks;
          const mc: MatchConfig = { opponent: cfg.opponent, level: cfg.level, human: 1, p2: cfg.p2 };
          recordMatch('billiards', mc, me, p2, res.winner === 0 ? 'win' : 'loss', cfg.mode === '8ball' ? '8-ball' : '9-ball', LEVELS, false);
        }
        return next;
      });
    };
    requestAnimationFrame(swing);
  };

  // Computer turns.
  useEffect(() => {
    if (running || tbl.winner >= 0 || isHuman(tbl.turn) || aiBusy.current) return;
    aiBusy.current = true;
    const id = setTimeout(() => {
      let cur = tbl;
      if (cur.ballInHand) {
        const p = placeCueBall(cur, cur.behindLine);
        cur = { ...cur, balls: cur.balls.map(b => (b.id === 0 ? { ...b, x: p.x, y: p.y, on: true } : b)), ballInHand: false };
        setG(prev => ({ ...prev, table: cur }));
      }
      const shot = chooseShot(cur, cfg.level);
      setAngle(shot.angle); setPower(shot.power);
      setTimeout(() => { aiBusy.current = false; shoot(shot.angle, shot.power, shot.spin); }, 650);
    }, 700);
    return () => { clearTimeout(id); aiBusy.current = false; };
  }, [tbl, running]); // eslint-disable-line

  // ---- input ----
  const world = (e: { clientX: number; clientY: number }) => {
    const r = canvasRef.current!.getBoundingClientRect();
    if (vertical.current) { const s = r.width / (H + 2 * RAIL); return { x: W + RAIL - (e.clientY - r.top) / s, y: (e.clientX - r.left) / s - RAIL }; }
    const s = r.width / (W + 2 * RAIL);
    return { x: (e.clientX - r.left) / s - RAIL, y: (e.clientY - r.top) / s - RAIL };
  };
  const placeAt = (x: number, y: number) => {
    const maxX = tbl.behindLine ? HEAD_X : W - R;
    const px = Math.max(R, Math.min(maxX, x)), py = Math.max(R, Math.min(H - R, y));
    if (!free(tbl.balls, px, py, 0)) return;
    setG(prev => ({ ...prev, table: { ...prev.table, balls: prev.table.balls.map(b => (b.id === 0 ? { ...b, x: px, y: py, on: true } : b)) } }));
  };
  const onDown = (e: React.PointerEvent) => {
    if (!humanTurn) return;
    (e.target as Element).setPointerCapture(e.pointerId);
    const p = world(e), cue = tbl.balls.find(b => b.id === 0)!;
    if (tbl.ballInHand && (Math.hypot(p.x - cue.x, p.y - cue.y) < R * 3 || !cue.on)) { drag.current = 'place'; placeAt(p.x, p.y); return; }
    // Aiming works like holding the cue: wherever the finger lands, turning it around the cue
    // ball turns the cue by the same angle, so the view in front of the ball stays clear.
    drag.current = 'aim';
    aimFrom.current = { theta: Math.atan2(p.y - cue.y, p.x - cue.x), a: angle };
  };
  const onMove = (e: React.PointerEvent) => {
    if (!drag.current) return;
    const p = world(e), cue = tbl.balls.find(b => b.id === 0)!;
    if (drag.current === 'place') placeAt(p.x, p.y);
    else { const th = Math.atan2(p.y - cue.y, p.x - cue.x); let d = th - aimFrom.current.theta; d = Math.atan2(Math.sin(d), Math.cos(d)); setAngle(aimFrom.current.a + d); aimFrom.current = { theta: th, a: aimFrom.current.a + d }; }
  };
  const onUp = () => { drag.current = null; };
  const confirmPlace = () => setG(prev => ({ ...prev, table: { ...prev.table, ballInHand: false } }));
  const onKey = (e: React.KeyboardEvent) => {
    if (!humanTurn || tbl.ballInHand) return;
    const fine = e.shiftKey ? 0.002 : 0.012;
    if (e.key === 'ArrowLeft') { e.preventDefault(); setAngle(a => a - fine); }
    else if (e.key === 'ArrowRight') { e.preventDefault(); setAngle(a => a + fine); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setPower(p => Math.min(1, p + 0.05)); }
    else if (e.key === 'ArrowDown') { e.preventDefault(); setPower(p => Math.max(0.05, p - 0.05)); }
    else if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); shoot(angle, power, spin); }
  };
  const spinPad = (e: React.PointerEvent<SVGSVGElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    let x = ((e.clientX - r.left) / r.width) * 2 - 1, y = ((e.clientY - r.top) / r.height) * 2 - 1;
    const d = Math.hypot(x, y); if (d > 0.8) { x *= 0.8 / d; y *= 0.8 / d; }
    setSpin({ side: Math.round(x * 10) / 10, follow: Math.round(-y * 10) / 10 });
  };

  const pullDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!humanTurn || tbl.ballInHand) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    pull.current = { y0: e.clientY, h: e.currentTarget.getBoundingClientRect().height * 0.85, pw: 0 };
    setPulling(true); setPower(0);
  };
  const pullMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const P = pull.current; if (!P) return;
    P.pw = Math.max(0, Math.min(1, (e.clientY - P.y0) / P.h)); setPower(P.pw);
  };
  const pullUp = () => {
    const P = pull.current; pull.current = null; setPulling(false);
    if (P && P.pw >= 0.04) shoot(angle, Math.max(0.05, P.pw), spin); else setPower(0.45);
  };
  const groupName = (gr: string | null) => (gr === 'solids' ? t('solids (1–7)', '全色球（1–7）', 'düzler (1–7)') : gr === 'stripes' ? t('stripes (9–15)', '花色球（9–15）', 'çizgililer (9–15)') : '');
  const foulText: Record<string, [string, string, string]> = {
    scratch: ['Foul: the cue ball went in.', '犯规：母球落袋。', 'Faul: beyaz top cebe girdi.'], nohit: ['Foul: no ball was hit.', '犯规：没有击中任何球。', 'Faul: hiçbir topa değmedi.'],
    wrongball: ['Foul: the wrong ball was hit first.', '犯规：先击中了错误的球。', 'Faul: önce yanlış topa vuruldu.'], norail: ['Foul: no ball reached a cushion after contact.', '犯规：击球后没有球碰库。', 'Faul: temastan sonra hiçbir top banda gitmedi.'],
  };
  const msgText: Record<string, [string, string, string]> = {
    nine: ['The 9 is down. Rack over.', '9号球落袋，本局结束。', '9 numara girdi. Üçgen bitti.'], eightwin: ['The 8 is down after clearing the group.', '清台后打进8号球。', 'Grup temizlendikten sonra 8 girdi.'],
    eightlose: ['The 8 went down too early or on a foul.', '8号球过早落袋或犯规落袋。', '8 erken ya da faulle girdi.'], eightspot: ['The 8 went in on the break and is respotted.', '开球时8号球落袋，放回置球点。', '8 açılışta girdi ve yerine kondu.'],
  };
  const status = tbl.winner >= 0 ? t(`${nameOf(tbl.winner)} wins the rack. `, `${nameOf(tbl.winner)}赢得本局。`, `${nameOf(tbl.winner)} bu üçgeni kazandı. `) + (tbl.message && msgText[tbl.message] ? t(...msgText[tbl.message]) : '')
    : running ? t('Balls rolling…', '球在滚动…', 'Toplar yuvarlanıyor…')
    : (tbl.foul ? t(...foulText[tbl.foul]) + ' ' : '') + (cfg.mode === 'practice' ? t('Practice: shoot as you like.', '练习模式：随意击球。', 'Antrenman: istediğin gibi vur.')
      : isHuman(tbl.turn) ? (tbl.ballInHand ? t(`${nameOf(tbl.turn)}: ball in hand${tbl.behindLine ? ' behind the line' : ''}. Drag the cue ball, then confirm.`, `${nameOf(tbl.turn)}：自由球${tbl.behindLine ? '（开球线后）' : ''}。拖动母球后确认。`, `${nameOf(tbl.turn)}: top elde${tbl.behindLine ? ' (çizginin gerisinde)' : ''}. Beyaz topu sürükle, sonra onayla.`) : t(`${nameOf(tbl.turn)} to shoot.`, `轮到${nameOf(tbl.turn)}击球。`, `Vuruş sırası: ${nameOf(tbl.turn)}.`))
      : t(`${nameOf(tbl.turn)} is lining up…`, `${nameOf(tbl.turn)}正在瞄准…`, `${nameOf(tbl.turn)} nişan alıyor…`));
  const potted = (ids: number[]) => ids.filter(id => !tbl.balls.find(b => b.id === id)?.on);
  const groupsRow = cfg.mode === '8ball' && (tbl.groups[0] || tbl.groups[1]);

  return (
    <div className="play pool">
      <div className="play-main">
        <div className="statline"><span role="status" aria-live="polite">{status}</span></div>
        <div className="pool-rig">
        <div className="pool-wrap" ref={wrapRef}>
          <canvas ref={canvasRef} className="pool-canvas" tabIndex={0} onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp} onKeyDown={onKey}
            aria-label={t('Pool table. Turn the cue around the cue ball to aim. Arrow keys aim and set power, Space shoots.', '台球桌。绕母球转动球杆来瞄准。方向键瞄准和调力度，空格击球。', 'Bilardo masası. Nişan için ıstakayı beyaz topun etrafında çevir. Ok tuşları nişan ve güç ayarlar, Boşluk vurur.')} />
          {tbl.winner >= 0 && (
            <div className="pool-card" role="status">
              <p>{t(`${nameOf(tbl.winner)} wins the rack. `, `${nameOf(tbl.winner)}赢得本局。`, `${nameOf(tbl.winner)} bu üçgeni kazandı. `)}</p>
              <button type="button" id="pool-next" className="btn primary" onClick={() => setG({ ...fresh(cfg, g.racks), table: { ...newTable(cfg.mode), turn: (1 - tbl.winner) as 0 | 1 } })}>{t('Next rack', '下一局', 'Sonraki üçgen')}</button>
            </div>
          )}
          {spinOpen && humanTurn && (
            <div className="pool-spin-pop">
              <span className="field-label">{t('Spin', '加塞', 'Falso')}</span>
              <svg className="spin-pad" viewBox="-1 -1 2 2" onPointerDown={spinPad} role="img" aria-label={t(`Spin: follow ${spin.follow}, side ${spin.side}`, `加塞：高低 ${spin.follow}，左右 ${spin.side}`, `Falso: ileri ${spin.follow}, yan ${spin.side}`)}>
                <circle r="0.95" className="spin-ball" /><circle r="0.8" className="spin-ring" />
                <circle cx={spin.side} cy={-spin.follow} r="0.14" className="spin-dot" />
              </svg>
              <div className="row">
                <button type="button" id="pool-spin-reset" className="btn sm" onClick={() => setSpin({ follow: 0, side: 0 })}>{t('Centre', '中杆', 'Orta')}</button>
                <button type="button" id="pool-spin-close" className="btn sm" onClick={() => setSpinOpen(false)}>{t('Done', '完成', 'Tamam')}</button>
              </div>
            </div>
          )}
        </div>
        {/* Controls hug the outside of the table: power down the right edge, the rest along the bottom. */}
        <div className={'pool-power' + (pulling ? ' on' : '') + (humanTurn && !tbl.ballInHand ? '' : ' off')} onPointerDown={pullDown} onPointerMove={pullMove} onPointerUp={pullUp} onPointerCancel={pullUp}
          role="slider" aria-orientation="vertical" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(power * 100)} aria-label={t('Power: pull down and let go to shoot', '力度：向下拉，松手击球', 'Güç: aşağı çek, bırakınca vur')}>
          <span className="pp-label">{pulling ? `${Math.round(power * 100)}%` : t('Pull', '拉杆', 'Çek')}</span>
          <span className="pp-track"><span className="pp-fill" style={{ height: `${(pulling ? power : 0) * 100}%` }} /></span>
          <span className="pp-arrow" aria-hidden="true">▼</span>
        </div>
        <div className="pool-dock">
          <button type="button" id="pool-spin" className={'pool-round' + (spinOpen ? ' on' : '')} disabled={!humanTurn || tbl.ballInHand} onClick={() => setSpinOpen(o => !o)} aria-expanded={spinOpen}
            aria-label={t(`Spin: follow ${spin.follow}, side ${spin.side}`, `加塞：高低 ${spin.follow}，左右 ${spin.side}`, `Falso: ileri ${spin.follow}, yan ${spin.side}`)} title={t('Spin', '加塞', 'Falso')}>
            <svg viewBox="-1 -1 2 2" aria-hidden="true"><circle r="0.92" className="spin-ball" /><circle cx={spin.side * 0.8} cy={-spin.follow * 0.8} r="0.2" className="spin-dot" /></svg>
          </button>
          <button type="button" id="pool-left" className="pool-round" disabled={!humanTurn || tbl.ballInHand} onClick={() => setAngle(a => a - 0.004)} aria-label={t('Fine aim left', '微调向左', 'İnce ayar sola')}>⟲</button>
          <button type="button" id="pool-right" className="pool-round" disabled={!humanTurn || tbl.ballInHand} onClick={() => setAngle(a => a + 0.004)} aria-label={t('Fine aim right', '微调向右', 'İnce ayar sağa')}>⟳</button>
          <span className="pool-dock-gap" />
          {tbl.ballInHand && humanTurn && <button type="button" id="pool-place" className="btn primary" onClick={confirmPlace}>{t('Place cue ball', '确认母球位置', 'Beyaz topu yerleştir')}</button>}
          {cfg.mode === 'practice' && !running && !tbl.ballInHand && <>
            <button type="button" id="pool-bih" className="btn sm" onClick={() => setG(prev => ({ ...prev, table: { ...prev.table, ballInHand: true, behindLine: false } }))}>{t('Move cue ball', '移动母球', 'Beyaz topu taşı')}</button>
            <button type="button" id="pool-rerack" className="btn sm" onClick={() => setG(fresh(cfg))}>{t('Re-rack', '重新摆球', 'Yeniden diz')}</button>
          </>}
        </div>
        </div>
        {cfg.mode === '9ball' && <p className="muted small">{t(`Next ball to hit: ${legalTargets(tbl)[0] ?? '–'}`, `下一个目标球：${legalTargets(tbl)[0] ?? '–'}`, `Vurulacak sıradaki top: ${legalTargets(tbl)[0] ?? '–'}`)}</p>}
        {groupsRow && <p className="muted small">{nameOf(0)}: {groupName(tbl.groups[0])} · {nameOf(1)}: {groupName(tbl.groups[1])}</p>}
        {cfg.mode === '8ball' && <div className="pool-potted">{[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15].map(id => (
          <span key={id} className={'pool-chip' + (potted([id]).length ? ' down' : '') + (groupOf(id) === 'stripes' ? ' stripe' : '')} style={{ ['--bc' as string]: BALL[id > 8 ? id - 8 : id] }}>{id}</span>))}</div>}
      </div>
      <aside className="play-side">
        {cfg.mode !== 'practice' && (
          <dl className="facts tally">
            <div><dt>{nameOf(0)}</dt><dd className="num">{g.racks[0]}</dd></div>
            <div><dt>{nameOf(1)}</dt><dd className="num">{g.racks[1]}</dd></div>
            <div><dt>{t('Turn', '击球', 'Sıra')}</dt><dd>{nameOf(tbl.turn)}</dd></div>
          </dl>
        )}
        <p className="muted small">{t('Put a finger on the cue, or anywhere on the table, and turn it around the cue ball to aim; the dotted line shows where the cue ball meets the first ball. Pull down on the power bar at the side of the table and let go to shoot. The small ball sets spin: follow keeps the cue ball rolling, draw brings it back, side spin changes how it comes off the cushions.',
          '把手指放在球杆上（或桌面任意处），绕母球转动来瞄准，虚线显示母球与第一颗球的接触点。在球桌侧边的力度条上向下拉，松手即击球。小球按钮用来加塞：高杆让母球继续前进，低杆让它回缩，左右塞改变碰库后的角度。', 'Nişan için parmağını ıstakaya ya da masada herhangi bir yere koy ve beyaz topun etrafında çevir; noktalı çizgi beyaz topun ilk topa nerede değdiğini gösterir. Masanın kenarındaki güç çubuğunu aşağı çekip bırakınca vurursun. Küçük top düğmesi falsoyu ayarlar: ileri falso beyaz topu yuvarlanmaya devam ettirir, geri falso geri getirir, yan falso bantlardan nasıl döneceğini değiştirir.')}</p>
        <div className="setup">
          <h3>{t('New game', '新游戏', 'Yeni oyun')}</h3>
          <Seg id="pool-mode" label={t('Game', '玩法', 'Oyun')} value={draft.mode} onChange={v => setDraft({ ...draft, mode: v })}
            options={[{ value: '8ball', label: t('8-ball', '八球', '8 top') }, { value: '9ball', label: t('9-ball', '九球', '9 top') }, { value: 'practice', label: t('Practice', '练习', 'Antrenman') }]} />
          {draft.mode !== 'practice' && <Seg id="pool-opp" label={t('Opponent', '对手', 'Rakip')} value={draft.opponent} onChange={v => setDraft({ ...draft, opponent: v })}
            options={[{ value: 'ai', label: t('Computer', '电脑', 'Bilgisayar') }, { value: 'local', label: t('Second player', '第二位玩家', 'İkinci oyuncu') }]} />}
          {draft.mode !== 'practice' && (draft.opponent === 'ai'
            ? <RivalPick id="pool-level" game={'billiards'} value={draft.level} onChange={v => setDraft({ ...draft, level: v })} levels={LEVELS} />
            : <Pick id="pool-p2" label={t('Second player', '第二位玩家', 'İkinci oyuncu')} value={draft.p2} onChange={v => setDraft({ ...draft, p2: v })}
                options={[{ value: 'guest', label: t('Guest', '游客', 'Misafir') }, ...data.profiles.filter(p => p.id !== me.id).map(p => ({ value: p.id, label: pname(p, lang) }))]} />)}
          <Seg id="pool-felt" label={t('Cloth', '台呢', 'Çuha')} value={draft.felt} onChange={v => { setDraft({ ...draft, felt: v }); setG(prev => ({ ...prev, cfg: { ...prev.cfg, felt: v } })); }}
            options={[{ value: 'green', label: t('Green', '绿', 'Yeşil') }, { value: 'blue', label: t('Blue', '蓝', 'Mavi') }, { value: 'wine', label: t('Wine', '酒红', 'Bordo') },
              ...(['purple', 'teal', 'black'] as const).filter(f => (me.owned ?? []).includes('felt-' + f)).map(f => ({ value: f, label: ({ purple: t('Purple', '紫', 'Mor'), teal: t('Teal', '青绿', 'Petrol'), black: t('Black', '黑', 'Siyah') })[f] }))]} />
          <Seg id="pool-cue" label={t('Cue', '球杆', 'Istaka')} value={draft.cue} onChange={v => { setDraft({ ...draft, cue: v }); setG(prev => ({ ...prev, cfg: { ...prev.cfg, cue: v } })); }}
            options={[{ value: 'maple', label: t('Maple', '枫木', 'Akçaağaç') }, { value: 'ebony', label: t('Ebony', '乌木', 'Abanoz') }, { value: 'lacquer', label: t('Red lacquer', '红漆', 'Kırmızı lake') }]} />
          {confirmNew ? (
            <div className="row">
              <button type="button" id="pool-discard" className="btn primary" onClick={() => { setG(fresh(draft)); setConfirmNew(false); }}>{t('Abandon and start', '放弃当前游戏', 'Bırak ve başla')}</button>
              <button type="button" id="pool-keep" className="btn" onClick={() => setConfirmNew(false)}>{t('Keep playing', '继续', 'Oynamaya devam')}</button>
            </div>
          ) : <button type="button" id="pool-new" className="btn primary" onClick={() => (g.started && tbl.winner < 0 && cfg.mode !== 'practice' ? setConfirmNew(true) : setG(fresh(draft)))}>{t('Start', '开始', 'Başla')}</button>}
        </div>
      </aside>
    </div>
  );
}
