import './ninerings.css';
import { useEffect, useState } from 'react';
import { useT } from '../../core/i18n';
import { sfx } from '../../core/sound';
import { loadJSON, saveJSON } from '../../core/storage';
import { getData, noteStarted, recordResult } from '../../core/store';
import { fmtTime, Seg } from '../../ui/bits';
import { bestMove, canMove, done as cleared, move, optimal, remaining, start, type NState } from './rules';

interface Saved { s: NState; moves: number; elapsed: number; recorded: boolean; hints: number; history: NState[] }
const make = (n: number): Saved => ({ s: start(n), moves: 0, elapsed: 0, recorded: false, hints: 0, history: [] });

export default function NineRings() {
  const t = useT();
  const [g, setG] = useState<Saved>(() => loadJSON<Saved | null>('gp.ninerings', null) ?? make(5));
  const [size, setSize] = useState(g.s.n);
  const [hintAt, setHintAt] = useState(-1);
  useEffect(() => { saveJSON('gp.ninerings', g); }, [g]);
  const { s } = g, n = s.n, done = cleared(s), best = optimal(n);
  useEffect(() => {
    if (done || !g.moves) return;
    const id = setInterval(() => { if (!document.hidden) setG(x => ({ ...x, elapsed: x.elapsed + 1000 })); }, 1000);
    return () => clearInterval(id);
  }, [done, g.moves > 0]); // eslint-disable-line
  const tap = (k: number, hint = false) => {
    if (done) return;
    if (!canMove(s, k)) { sfx('error', 0.4); return; }
    if (!g.moves) noteStarted('nine-rings');
    const ns = move(s, k), moves = g.moves + 1, hints = g.hints + (hint ? 1 : 0);
    sfx(ns.on[k] ? 'peg' : 'slide', 0.6); setHintAt(-1);
    let recorded = g.recorded;
    if (cleared(ns) && !recorded) { recorded = true; setTimeout(() => sfx('win'), 200); if (!hints) recordResult(getData().activeId, 'nine-rings', { result: 'win', ms: g.elapsed, label: `${n} · ${moves}/${best}`, bestKey: `${n}` }); }
    setG({ ...g, s: ns, moves, recorded, hints, history: [...g.history.slice(-400), s] });
  };
  // Ring k sits at x; ring 1 (k = 0) is at the tip of the bar, on the right.
  const X = (k: number) => 470 - k * (420 / Math.max(n, 1)) - 20, R = Math.min(30, 210 / n);
  return (
    <div className="play">
      <div className="play-main">
        <div className="statline"><span role="status" aria-live="polite">{done ? (g.hints ? t('Every ring is off, with hints.', '在提示下取下了所有环。', 'Bütün halkalar çıktı, ipuçlarıyla.') : g.moves === best ? t(`All rings off in the fewest moves: ${best}!`, `用最少的${best}步取下了所有环！`, `Bütün halkalar en az hamleyle çıktı: ${best}!`) : t(`All rings off in ${g.moves} moves (best ${best}).`, `用${g.moves}步取下了所有环（最少${best}步）。`, `Bütün halkalar ${g.moves} hamlede çıktı (en iyisi ${best}).`)) : t('Take every ring off the bar.', '把所有的环都从剑上取下来。', 'Bütün halkaları çubuktan çıkar.')}</span><span className="num">{fmtTime(g.elapsed)}</span></div>
        <svg className="nr-board" viewBox="0 0 520 260" role="group" aria-label={t('Nine linked rings', '九连环', 'Dokuz halka')}>
          <path d="M8 205h500" className="nr-base" />
          {/* the bar: a long loop with a handle on the left */}
          <path d="M60 92h440a10 10 0 0 1 0 20h-440" className="nr-bar" />
          <rect x="10" y="84" width="54" height="36" rx="8" className="nr-handle" />
          {s.on.map((on, k) => {
            const x = X(k), y = on ? 102 : 150, can = !done && canMove(s, k);
            return (
              <g key={k} className={'nr-ring' + (on ? ' on' : ' off') + (can ? ' can' : '') + (hintAt === k ? ' hint' : '')} onClick={() => tap(k)} role="button" tabIndex={0}
                aria-label={t(`Ring ${k + 1}, ${on ? 'on' : 'off'}`, `第${k + 1}环，${on ? '在剑上' : '已取下'}`, `Halka ${k + 1}, ${on ? 'takılı' : 'çıkmış'}`)} aria-disabled={!can}
                onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); tap(k); } }}>
                <path d={`M${x} 205V${y + R * 0.9}`} className="nr-post" />
                {k < n - 1 && <path d={`M${x} ${y + R * 0.9}L${X(k + 1)} ${(s.on[k + 1] ? 102 : 150) + R * 0.9}`} className="nr-link" />}
                <rect x={x - R * 0.55} y={y - R - 4} width={R * 1.1} height={238 - y + R} className="nr-hitbox" />
                <ellipse cx={x} cy={y} rx={R * 0.42} ry={R} className="nr-o" />
                <text x={x} y={238} textAnchor="middle" className="nr-num">{k + 1}</text>
              </g>
            );
          })}
        </svg>
        <p className="muted small">{t('Ring 1, at the tip, always moves. Any other ring moves only when the ring just outside it is on the bar and every ring beyond that is off. Movable rings glow.', '最外面的第1环随时可以上下。其他环只有在它外侧紧邻的环在剑上、且更外面的环都已取下时才能动。能动的环会发亮。', 'Uçtaki 1. halka her zaman oynar. Diğer bir halka ancak hemen dışındaki halka çubuktayken ve ondan ötekilerin hepsi çıkmışken oynar. Oynayabilen halkalar parlar.')}</p>
      </div>
      <aside className="play-side">
        <dl className="facts">
          <div><dt>{t('Moves', '步数', 'Hamle')}</dt><dd className="num">{g.moves}</dd></div>
          <div><dt>{t('Fewest possible', '最少步数', 'En az')}</dt><dd className="num">{best}</dd></div>
          <div><dt>{t('Still needed', '还需', 'Kalan en az')}</dt><dd className="num">{remaining(s)}</dd></div>
        </dl>
        <div className="tools">
          <button type="button" id="nr-undo" className="btn" disabled={!g.history.length || done} onClick={() => setG({ ...g, s: g.history[g.history.length - 1], history: g.history.slice(0, -1), moves: g.moves + 1 })}>{t('Undo', '撤销', 'Geri al')}</button>
          <button type="button" id="nr-hint" className="btn" disabled={done} onClick={() => { const k = bestMove(s); setHintAt(k); setG(x => ({ ...x, hints: x.hints + 1 })); }}>{t('Hint', '提示', 'İpucu')}</button>
        </div>
        <div className="setup">
          <Seg id="nr-size" label={t('Rings', '环数', 'Halka')} value={size} onChange={setSize} options={[5, 7, 9].map(k => ({ value: k, label: String(k) }))} />
          <button type="button" id={done ? 'nr-again' : 'nr-new'} className="btn primary" onClick={() => { setG(make(size)); setHintAt(-1); }}>{t('Start again', '重新开始', 'Baştan başla')}</button>
        </div>
      </aside>
    </div>
  );
}
