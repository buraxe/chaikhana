import './air-hockey.css';
import { useEffect, useRef, useState } from 'react';
import { aiLabel, useLang, useT } from '../../core/i18n';
import { recordMatch, type MatchConfig } from '../../core/match';
import { sfx } from '../../core/sound';
import { loadJSON, saveJSON } from '../../core/storage';
import { activeOf, getData, noteStarted } from '../../core/store';
import { Seg } from '../../ui/bits';
import { RivalPick, useRival } from '../../ui/Cast';
import { aiSpeed, aiTarget, clampMallet, GOAL, H, LEVELS, MR, newTable, PR, step, TARGET, W, type Table, type V2 } from './physics';

const HAND = 7; // how fast a mallet can follow the finger, table units per second

export default function AirHockey() {
  const t = useT(), lang = useLang();
  const [cfg, setCfg] = useState<MatchConfig>(() => loadJSON<MatchConfig | null>('gp.airhockey', null) ?? { opponent: 'ai', level: 1, human: 1, p2: 'guest' });
  const [draft, setDraft] = useState(cfg);
  const [score, setScore] = useState<[number, number]>([0, 0]);
  const [winner, setWinner] = useState<0 | 1 | 2>(0);
  const [epoch, setEpoch] = useState(0);
  const canvas = useRef<HTMLCanvasElement>(null);
  const tableRef = useRef<Table>(newTable());
  useRival('air-hockey', cfg.opponent === 'ai' ? cfg.level : null);
  useEffect(() => { saveJSON('gp.airhockey', cfg); }, [cfg]);
  const nameOf = (side: 1 | 2) => (side === 1 ? (cfg.opponent === 'ai' ? t('You', '你', 'Sen') : t('Bottom', '下方', 'Alt')) : cfg.opponent === 'ai' ? aiLabel(LEVELS[cfg.level].name, lang) : t('Top', '上方', 'Üst'));

  useEffect(() => {
    const cv = canvas.current!, ctx = cv.getContext('2d')!;
    const tb = (tableRef.current = newTable(Math.random() < 0.5 ? 1 : 2));
    setScore([0, 0]); setWinner(0);
    let started = false, recorded = false, raf = 0, last = performance.now(), aiGoal: V2 = tb.m[1], aiClock = 0;
    const want: [V2, V2] = [{ ...tb.m[0] }, { ...tb.m[1] }];
    const keys = new Set<string>();
    const fingers = new Map<number, 0 | 1>();
    const scale = () => cv.clientWidth / W;
    const toTable = (e: PointerEvent): V2 => { const r = cv.getBoundingClientRect(), s = r.width / W; return { x: (e.clientX - r.left) / s, y: (e.clientY - r.top) / s }; };
    const down = (e: PointerEvent) => {
      const p = toTable(e), side: 0 | 1 = cfg.opponent === 'local' && p.y < H / 2 ? 1 : 0;
      fingers.set(e.pointerId, side); cv.setPointerCapture(e.pointerId); want[side] = p;
      if (!started) { started = true; noteStarted('air-hockey'); }
    };
    const move = (e: PointerEvent) => {
      const side = fingers.get(e.pointerId) ?? (e.pointerType === 'mouse' ? 0 : undefined);
      if (side === undefined) return;
      want[side] = toTable(e);
      if (!started && e.pointerType === 'mouse') { started = true; noteStarted('air-hockey'); }
    };
    const up = (e: PointerEvent) => { fingers.delete(e.pointerId); };
    const kd = (e: KeyboardEvent) => { if ('wasd'.includes(e.key.toLowerCase()) && cfg.opponent === 'local') { keys.add(e.key.toLowerCase()); e.preventDefault(); } };
    const ku = (e: KeyboardEvent) => keys.delete(e.key.toLowerCase());
    cv.addEventListener('pointerdown', down); cv.addEventListener('pointermove', move); cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', up);
    window.addEventListener('keydown', kd); window.addEventListener('keyup', ku);

    const follow = (k: 0 | 1, target: V2, speed: number, dt: number) => {
      const m = tb.m[k], c = clampMallet(target, k), dx = c.x - m.x, dy = c.y - m.y, d = Math.hypot(dx, dy), s = Math.min(d, speed * dt);
      const nx = d ? m.x + (dx / d) * s : m.x, ny = d ? m.y + (dy / d) * s : m.y;
      tb.mv[k] = { x: (nx - m.x) / dt, y: (ny - m.y) / dt }; tb.m[k] = { x: nx, y: ny };
    };
    const draw = () => {
      const dpr = window.devicePixelRatio || 1, w = cv.clientWidth, h = cv.clientHeight;
      if (cv.width !== Math.round(w * dpr)) { cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr); }
      const s = scale() * dpr;
      ctx.setTransform(s, 0, 0, s, 0, 0);
      ctx.fillStyle = '#dfeef2'; ctx.fillRect(0, 0, W, H);
      ctx.strokeStyle = '#b5303a'; ctx.lineWidth = 0.008; ctx.beginPath(); ctx.moveTo(0, H / 2); ctx.lineTo(W, H / 2); ctx.stroke();
      ctx.beginPath(); ctx.arc(W / 2, H / 2, 0.14, 0, Math.PI * 2); ctx.stroke();
      ctx.strokeStyle = '#2d5d8a';
      for (const y of [0, H]) { ctx.beginPath(); ctx.arc(W / 2, y, GOAL / 2 + 0.05, 0, Math.PI * 2); ctx.stroke(); }
      ctx.fillStyle = '#1f2a33'; ctx.fillRect(W / 2 - GOAL / 2, -0.01, GOAL, 0.018); ctx.fillRect(W / 2 - GOAL / 2, H - 0.008, GOAL, 0.018);
      // Tiny air holes.
      ctx.fillStyle = 'rgba(40,70,90,.13)';
      for (let y = 0.05; y < H; y += 0.08) for (let x = 0.05; x < W; x += 0.08) { ctx.beginPath(); ctx.arc(x, y, 0.004, 0, Math.PI * 2); ctx.fill(); }
      const mallet = (p: V2, c: string) => { ctx.fillStyle = c; ctx.beginPath(); ctx.arc(p.x, p.y, MR, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = 'rgba(255,255,255,.35)'; ctx.beginPath(); ctx.arc(p.x, p.y, MR * 0.45, 0, Math.PI * 2); ctx.fill(); };
      mallet(tb.m[0], '#b5303a'); mallet(tb.m[1], '#2d5d8a');
      ctx.fillStyle = '#14181c'; ctx.beginPath(); ctx.arc(tb.puck.x, tb.puck.y, PR, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#e0b84a'; ctx.lineWidth = 0.006; ctx.beginPath(); ctx.arc(tb.puck.x, tb.puck.y, PR * 0.6, 0, Math.PI * 2); ctx.stroke();
    };
    const frame = (now: number) => {
      const dt = Math.min(0.033, (now - last) / 1000); last = now;
      if (!document.hidden && dt > 0) {
        follow(0, want[0], HAND, dt);
        if (cfg.opponent === 'ai') {
          aiClock -= dt;
          if (aiClock <= 0) { aiGoal = aiTarget(tb, cfg.level); aiClock = LEVELS[cfg.level].react; }
          follow(1, aiGoal, aiSpeed(tb, cfg.level), dt);
        } else {
          if (keys.size) { const k = 1.8 * dt; want[1] = { x: tb.m[1].x + (keys.has('d') ? k * 4 : 0) - (keys.has('a') ? k * 4 : 0), y: tb.m[1].y + (keys.has('s') ? k * 4 : 0) - (keys.has('w') ? k * 4 : 0) }; }
          follow(1, want[1], HAND, dt);
        }
        const before = tb.score[0] + tb.score[1], speedBefore = Math.hypot(tb.pv.x, tb.pv.y);
        step(tb, dt);
        const speedAfter = Math.hypot(tb.pv.x, tb.pv.y);
        if (speedAfter > speedBefore + 0.4) sfx('click', Math.min(1, speedAfter / 3));
        if (tb.score[0] + tb.score[1] !== before) {
          setScore([...tb.score] as [number, number]);
          sfx(tb.winner ? 'win' : 'peg');
          if (tb.winner && !recorded && started) {
            recorded = true; setWinner(tb.winner);
            recordMatch('air-hockey', cfg, activeOf(getData()), undefined, tb.winner === 1 ? 'win' : 'loss', `${tb.score[0]}–${tb.score[1]}`, LEVELS, false);
          } else if (tb.winner) setWinner(tb.winner);
        }
      }
      draw();
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      cv.removeEventListener('pointerdown', down); cv.removeEventListener('pointermove', move); cv.removeEventListener('pointerup', up); cv.removeEventListener('pointercancel', up);
      window.removeEventListener('keydown', kd); window.removeEventListener('keyup', ku);
    };
  }, [cfg, epoch]);

  const status = winner ? t(`${nameOf(winner)} wins ${Math.max(...score)}–${Math.min(...score)}.`, `${nameOf(winner)}以${Math.max(...score)}比${Math.min(...score)}获胜。`, `${nameOf(winner)} ${Math.max(...score)}–${Math.min(...score)} kazandı.`)
    : t(`First to ${TARGET} goals. Move your mallet with your finger or the mouse.`, `先进${TARGET}球者胜。用手指或鼠标移动球拍。`, `${TARGET} gole ilk ulaşan kazanır. Tokmağını parmağınla ya da fareyle oynat.`);
  return (
    <div className="play">
      <div className="play-main">
        <div className="statline"><span role="status" aria-live="polite">{status}</span><span className="num">{score[0]} – {score[1]}</span></div>
        <div className="ah-wrap">
          <div className="ah-score top"><span>{nameOf(2)}</span><b>{score[1]}</b></div>
          <canvas ref={canvas} className="ah-table" aria-label={t('Air hockey table. Your mallet is the red one at the bottom.', '冰球桌。你的球拍是下方的红色那个。', 'Hava hokeyi masası. Senin tokmağın alttaki kırmızı olan.')} />
          <div className="ah-score bottom"><span>{nameOf(1)}</span><b>{score[0]}</b></div>
        </div>
      </div>
      <aside className="play-side">
        {winner !== 0 && <div className="result" role="status"><h3>{winner === 1 && cfg.opponent === 'ai' ? t('You win', '你赢了', 'Kazandın') : `${nameOf(winner)} ${t('wins', '获胜', 'kazandı')}`}</h3><p className="num big">{score[0]} – {score[1]}</p></div>}
        <button type="button" id={winner ? 'ah-again' : 'ah-new'} className="btn primary" onClick={() => { setCfg(draft); setEpoch(e => e + 1); }}>{winner ? t('Play again', '再来一局', 'Tekrar oyna') : t('Restart', '重新开始', 'Yeniden başlat')}</button>
        <div className="setup">
          <h3>{t('New game', '新游戏', 'Yeni oyun')}</h3>
          <Seg id="ah-opp" label={t('Opponent', '对手', 'Rakip')} value={draft.opponent} onChange={v => setDraft({ ...draft, opponent: v })} options={[{ value: 'ai', label: t('Computer', '电脑', 'Bilgisayar') }, { value: 'local', label: t('Second player', '第二位玩家', 'İkinci oyuncu') }]} />
          {draft.opponent === 'ai' && <RivalPick id="ah-level" game="air-hockey" value={draft.level} onChange={v => setDraft({ ...draft, level: v })} levels={LEVELS} />}
        </div>
        <p className="muted small">{draft.opponent === 'local' ? t('Two players: each plays from their own end of the screen, one finger each. On a computer the top player uses W A S D.', '双人：各自在屏幕的一端用一根手指操作。在电脑上，上方玩家用W A S D。', 'İki oyuncu: herkes ekranın kendi ucundan, birer parmakla oynar. Bilgisayarda üstteki oyuncu W A S D kullanır.')
          : t('Hit the puck into the goal at the top. Your mallet stays in your half. Strike it moving: the faster the mallet, the harder the shot, and the walls are your friends.', '把冰球打进上方的球门。你的球拍只能在自己的半场移动。边移动边击球：球拍越快，球越猛；多利用边墙。', 'Pulu yukarıdaki kaleye sok. Tokmağın kendi yarı sahanda kalır. Hareket ederken vur: tokmak ne kadar hızlıysa şut o kadar sert olur; duvarları kullan.')}</p>
      </aside>
    </div>
  );
}
