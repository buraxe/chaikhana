import './table-tennis.css';
import { useEffect, useRef, useState } from 'react';
import { aiLabel, useLang, useT } from '../../core/i18n';
import { recordMatch, type MatchConfig } from '../../core/match';
import { sfx } from '../../core/sound';
import { loadJSON, saveJSON } from '../../core/storage';
import { activeOf, getData, noteStarted } from '../../core/store';
import { Seg } from '../../ui/bits';
import { RivalPick, useRival } from '../../ui/Cast';
import { aiTarget, atStrikingPoint, BR, canHit, clampPaddle, FLOOR, LEVELS, NET, newGame, PADDLE, serve, SLOW, step, strike, T, type Game, type V2, type Why } from './physics';

const X0 = -0.95, X1 = T + 0.95, Y0 = FLOOR - 0.08, Y1 = 1.1; // the view, in metres
const HAND = 7; // how fast a paddle follows the pointer, metres per second

export default function TableTennis() {
  const t = useT(), lang = useLang();
  const [cfg, setCfg] = useState<MatchConfig>(() => loadJSON<MatchConfig | null>('gp.tabletennis', null) ?? { opponent: 'ai', level: 1, human: 1, p2: 'guest' });
  const [draft, setDraft] = useState(cfg);
  const [view, setView] = useState<{ score: [number, number]; server: 1 | 2; winner: 0 | 1 | 2; last: Game['last']; serveWait: boolean }>({ score: [0, 0], server: 1, winner: 0, last: null, serveWait: true });
  const [epoch, setEpoch] = useState(0);
  const canvas = useRef<HTMLCanvasElement>(null);
  useRival('table-tennis', cfg.opponent === 'ai' ? cfg.level : null);
  useEffect(() => { saveJSON('gp.tabletennis', cfg); }, [cfg]);
  const nameOf = (s: 1 | 2) => (s === 1 ? (cfg.opponent === 'ai' ? t('You', '你', 'Sen') : t('Left', '左方', 'Sol')) : cfg.opponent === 'ai' ? aiLabel(LEVELS[cfg.level].name, lang) : t('Right', '右方', 'Sağ'));

  useEffect(() => {
    const cv = canvas.current!, ctx = cv.getContext('2d')!;
    const g = newGame(Math.random() < 0.5 ? 1 : 2);
    let raf = 0, last = performance.now(), started = false, recorded = false, aiClock = 0, aiGoal: V2 = g.p[1], serveClock = 0, lastHitter = -1, off = 0;
    const want: [V2, V2] = [{ ...g.p[0] }, { ...g.p[1] }];
    const fingers = new Map<number, 0 | 1>();
    const L = LEVELS[cfg.level], ai = cfg.opponent === 'ai';
    const sync = () => setView({ score: [...g.score] as [number, number], server: g.server, winner: g.winner, last: g.last, serveWait: g.phase === 'serve' });
    sync();
    const toWorld = (e: PointerEvent, touch: boolean): V2 => {
      const r = cv.getBoundingClientRect(), x = X0 + ((e.clientX - r.left) / r.width) * (X1 - X0), y = Y1 - ((e.clientY - r.top) / r.height) * (Y1 - Y0);
      return { x, y: y + (touch ? 0.18 : 0) }; // a finger hides what it touches, so the paddle rides just above it
    };
    const humanSide = (p: V2): 0 | 1 => (!ai && p.x > T / 2 ? 1 : 0);
    const tryServe = (k: 0 | 1) => { if (g.phase === 'serve' && g.server === k + 1) { serve(g, Math.random); sfx('click', 0.5); sync(); } };
    const down = (e: PointerEvent) => {
      const p = toWorld(e, e.pointerType !== 'mouse'), k = humanSide(p);
      fingers.set(e.pointerId, k); cv.setPointerCapture(e.pointerId); want[k] = p;
      if (!started) { started = true; noteStarted('table-tennis'); }
      tryServe(k);
    };
    const move = (e: PointerEvent) => {
      const k = fingers.get(e.pointerId) ?? (e.pointerType === 'mouse' ? humanSide(toWorld(e, false)) : undefined);
      if (k === undefined) return;
      want[k] = toWorld(e, e.pointerType !== 'mouse');
    };
    const up = (e: PointerEvent) => { fingers.delete(e.pointerId); };
    const key = (e: KeyboardEvent) => { if (e.key === ' ' || e.key === 'Enter') { if (g.phase === 'serve') { e.preventDefault(); tryServe(g.server === 1 || !ai ? (g.server - 1) as 0 | 1 : 0); } } };
    cv.addEventListener('pointerdown', down); cv.addEventListener('pointermove', move); cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', up);
    window.addEventListener('keydown', key);

    const follow = (k: 0 | 1, target: V2, speed: number, dt: number) => {
      const p = g.p[k], c = clampPaddle(target, k), dx = c.x - p.x, dy = c.y - p.y, d = Math.hypot(dx, dy), s = Math.min(d, speed * dt);
      const nx = d ? p.x + (dx / d) * s : p.x, ny = d ? p.y + (dy / d) * s : p.y;
      g.pv[k] = { x: (nx - p.x) / dt, y: (ny - p.y) / dt }; g.p[k] = { x: nx, y: ny };
    };
    const humanStrike = (k: 0 | 1) => {
      const v = g.pv[k], speed = Math.hypot(v.x, v.y);
      strike(g, k, Math.min(1, speed / 5), Math.max(-1, Math.min(1, v.y / 3)), 0.24, Math.random);
      sfx('click', 0.4 + Math.min(0.6, speed / 6));
    };
    const draw = () => {
      const dpr = window.devicePixelRatio || 1, w = cv.clientWidth, h = cv.clientHeight;
      if (cv.width !== Math.round(w * dpr)) { cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr); }
      const s = (w * dpr) / (X1 - X0);
      ctx.setTransform(s, 0, 0, -s, -X0 * s, Y1 * s);
      ctx.fillStyle = '#efe6d4'; ctx.fillRect(X0, Y0, X1 - X0, Y1 - Y0);
      ctx.fillStyle = '#c9b48f'; ctx.fillRect(X0, Y0, X1 - X0, FLOOR - Y0);
      // Table: top, legs.
      ctx.fillStyle = '#2e3a33'; ctx.fillRect(0.15, FLOOR, 0.05, -FLOOR); ctx.fillRect(T - 0.2, FLOOR, 0.05, -FLOOR); ctx.fillRect(T / 2 - 0.03, FLOOR, 0.06, -FLOOR);
      ctx.fillStyle = '#1f5c4a'; ctx.fillRect(0, -0.035, T, 0.035);
      ctx.fillStyle = '#f4f1e8'; ctx.fillRect(0, -0.004, T, 0.004);
      // Net.
      ctx.fillStyle = 'rgba(30,30,30,.55)'; ctx.fillRect(T / 2 - 0.006, 0, 0.012, NET);
      ctx.fillStyle = '#f4f1e8'; ctx.fillRect(T / 2 - 0.012, NET - 0.012, 0.024, 0.012);
      // Ball shadow on the table, then ball.
      if (g.ball.x > 0 && g.ball.x < T && g.ball.y > 0) { ctx.fillStyle = 'rgba(0,0,0,.18)'; ctx.beginPath(); ctx.ellipse(g.ball.x, 0.002, BR * 1.3, BR * 0.35, 0, 0, Math.PI * 2); ctx.fill(); }
      ctx.fillStyle = '#f7f3e9'; ctx.strokeStyle = '#d07a1f'; ctx.lineWidth = 0.008;
      ctx.beginPath(); ctx.arc(g.ball.x, g.ball.y, BR * 1.35, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      // Paddles: a round blade on a short handle.
      const paddle = (p: V2, k: 0 | 1, c: string) => {
        const dir = k === 0 ? -1 : 1;
        ctx.strokeStyle = '#8a5a2b'; ctx.lineWidth = 0.035; ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p.x + dir * 0.06, p.y - 0.13); ctx.stroke();
        ctx.fillStyle = c; ctx.beginPath(); ctx.ellipse(p.x, p.y, PADDLE * 0.45, PADDLE * 0.8, 0, 0, Math.PI * 2); ctx.fill();
      };
      paddle(g.p[0], 0, '#b5303a'); paddle(g.p[1], 1, '#222');
    };
    const frame = (now: number) => {
      const real = Math.min(0.033, (now - last) / 1000); last = now;
      if (!document.hidden && real > 0) {
        follow(0, want[0], HAND, real);
        if (ai) {
          if (g.hitter !== lastHitter) { lastHitter = g.hitter; off = (Math.random() * 2 - 1) * L.reach; }
          aiClock -= real;
          if (aiClock <= 0) { const a = aiTarget(g, 1); aiGoal = { x: a.x, y: a.y + off }; aiClock = L.react; }
          follow(1, aiGoal, L.speed * SLOW, real);
          if (g.phase === 'serve' && g.server === 2) { serveClock += real; if (serveClock > 0.9) { serveClock = 0; serve(g, Math.random); sfx('click', 0.5); sync(); } }
          if (canHit(g, 1) && atStrikingPoint(g, 1)) { strike(g, 1, L.pace, Math.random() * 0.4, L.err, Math.random, true); sfx('click', 0.6); }
        } else follow(1, want[1], HAND, real);
        if (canHit(g, 0)) humanStrike(0);
        if (!ai && canHit(g, 1)) humanStrike(1);
        const before = g.score[0] + g.score[1], phase = g.phase;
        step(g, real * SLOW);
        if (g.score[0] + g.score[1] !== before) {
          sfx(g.winner ? 'win' : 'peg', 0.6);
          if (g.winner && !recorded && started) { recorded = true; recordMatch('table-tennis', cfg, activeOf(getData()), undefined, g.winner === 1 ? 'win' : 'loss', `${g.score[0]}–${g.score[1]}`, LEVELS, false); }
          sync();
        } else if (phase !== g.phase) sync();
      }
      draw();
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      cv.removeEventListener('pointerdown', down); cv.removeEventListener('pointermove', move); cv.removeEventListener('pointerup', up); cv.removeEventListener('pointercancel', up);
      window.removeEventListener('keydown', key);
    };
  }, [cfg, epoch]);

  const why: Record<Why, [string, string, string]> = {
    net: ['into the net', '下网', 'file takıldı'], long: ['out', '出界', 'dışarı çıktı'], miss: ['not returned', '没接到', 'karşılanamadı'],
    double: ['bounced twice', '两跳', 'iki kez sekti'], own: ['serve fault', '发球失误', 'servis hatası'],
  };
  const { score, server, winner, last } = view;
  const humanServes = view.serveWait && (cfg.opponent === 'local' || server === 1);
  const status = winner ? t(`${nameOf(winner)} wins ${Math.max(...score)}–${Math.min(...score)}.`, `${nameOf(winner)}以${Math.max(...score)}比${Math.min(...score)}获胜。`, `${nameOf(winner)} ${Math.max(...score)}–${Math.min(...score)} kazandı.`)
    : humanServes ? t(`${nameOf(server)} to serve: tap the table (or press Space).`, `${nameOf(server)}发球：点一下球桌（或按空格）。`, `Servis ${nameOf(server)}: masaya dokun (ya da boşluk tuşu).`)
    : last ? t(`Point to ${nameOf(last.scorer)}: ${why[last.why][0]}.`, `${nameOf(last.scorer)}得分：${why[last.why][1]}。`, `Sayı: ${nameOf(last.scorer)} (${why[last.why][2]}).`)
    : t('First to 11, win by two.', '先得11分且领先两分者胜。', '11’e ilk ulaşan, iki sayı farkla kazanır.');
  return (
    <div className="play">
      <div className="play-main">
        <div className="statline"><span role="status" aria-live="polite">{status}</span><span className="num">{score[0]} – {score[1]}</span></div>
        <div className="tt-board">
          <div className="tt-score"><span className={server === 1 ? 'srv' : ''}>{nameOf(1)} <b>{score[0]}</b></span><span className={server === 2 ? 'srv' : ''}><b>{score[1]}</b> {nameOf(2)}</span></div>
          <canvas ref={canvas} className="tt-canvas" aria-label={t('Table tennis, seen from the side. Your paddle is the red one on the left.', '侧面看的乒乓球桌。你的球拍是左边红色的那个。', 'Yandan görünen masa tenisi. Senin raketin soldaki kırmızı olan.')} />
        </div>
        <p className="muted small">{t('Move the paddle with the mouse or a finger and meet the ball after it bounces on your side; the stroke is played on contact. A quick upward swing sends it fast and deep, a slow one keeps it safe. Turn a phone sideways for a bigger table.', '用鼠标或手指移动球拍，在球于你这边弹起后迎上去，碰到就会击球。快速向上挥拍，球又快又深；慢一点更稳。手机横过来，球桌更大。', 'Raketi fareyle ya da parmağınla oynat ve top senin tarafında sektikten sonra ona dokun; vuruş temasla yapılır. Hızlı ve yukarı doğru bir hareket topu hızlı ve derin gönderir, yavaş bir hareket güvenli tutar. Daha büyük masa için telefonu yan çevir.')}</p>
      </div>
      <aside className="play-side">
        {winner !== 0 && <div className="result" role="status"><h3>{winner === 1 && cfg.opponent === 'ai' ? t('You win', '你赢了', 'Kazandın') : `${nameOf(winner)} ${t('wins', '获胜', 'kazandı')}`}</h3><p className="num big">{score[0]} – {score[1]}</p></div>}
        <button type="button" id={winner ? 'tt-again' : 'tt-new'} className="btn primary" onClick={() => { setCfg(draft); setEpoch(e => e + 1); }}>{winner ? t('Play again', '再来一局', 'Tekrar oyna') : t('Restart', '重新开始', 'Yeniden başlat')}</button>
        <div className="setup">
          <h3>{t('New game', '新游戏', 'Yeni oyun')}</h3>
          <Seg id="tt-opp" label={t('Opponent', '对手', 'Rakip')} value={draft.opponent} onChange={v => setDraft({ ...draft, opponent: v })} options={[{ value: 'ai', label: t('Computer', '电脑', 'Bilgisayar') }, { value: 'local', label: t('Second player', '第二位玩家', 'İkinci oyuncu') }]} />
          {draft.opponent === 'ai' && <RivalPick id="tt-level" game="table-tennis" value={draft.level} onChange={v => setDraft({ ...draft, level: v })} levels={LEVELS} />}
        </div>
        {draft.opponent === 'local' && <p className="muted small">{t('Two players need a touch screen: each plays from their own half, one finger each.', '双人需要触摸屏：各自在自己的半边用一根手指操作。', 'İki oyuncu için dokunmatik ekran gerekir: herkes kendi yarısından, birer parmakla oynar.')}</p>}
      </aside>
    </div>
  );
}
