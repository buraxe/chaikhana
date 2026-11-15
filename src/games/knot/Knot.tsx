import './knot.css';
import { useEffect, useState } from 'react';
import { useT } from '../../core/i18n';
import { sfx } from '../../core/sound';
import { loadJSON, saveJSON } from '../../core/storage';
import { getData, noteStarted, recordResult } from '../../core/store';
import { fmtTime, Seg } from '../../ui/bits';
import { closed, E, generate, loose, N, rot, S, Wb, type KPuzzle, type Mask } from './rules';

interface Saved { p: KPuzzle; m: Mask[]; turns: number; elapsed: number; solved: boolean; assisted: boolean; recorded: boolean }
const make = (n: number): Saved => { const p = generate(n, n); return { p, m: p.start, turns: 0, elapsed: 0, solved: false, assisted: false, recorded: false }; };

/** The cord inside one tile, drawn in a 1×1 box. */
function Cord({ m, x, y }: { m: Mask; x: number; y: number }) {
  const mid = { x: x + 0.5, y: y + 0.5 };
  const end = (b: Mask) => (b === N ? [mid.x, y] : b === S ? [mid.x, y + 1] : b === E ? [x + 1, mid.y] : [x, mid.y]);
  if (m === 15) {
    // Two cords crossing: the across one passes over, the up-and-down one is broken beneath it.
    return <g>
      <path className="kn-cord" d={`M${mid.x} ${y}V${mid.y - 0.2}M${mid.x} ${mid.y + 0.2}V${y + 1}`} />
      <path className="kn-cord" d={`M${x} ${mid.y}H${x + 1}`} />
    </g>;
  }
  const bits = [N, E, S, Wb].filter(b => m & b);
  if (bits.length !== 2) return null;
  const [a, b] = bits.map(end);
  const straight = (m === (N | S)) || (m === (E | Wb));
  return <path className="kn-cord" d={straight ? `M${a[0]} ${a[1]}L${b[0]} ${b[1]}` : `M${a[0]} ${a[1]}Q${mid.x} ${mid.y} ${b[0]} ${b[1]}`} />;
}

export default function Knot() {
  const t = useT();
  const [g, setG] = useState<Saved>(() => loadJSON<Saved | null>('gp.knot', null) ?? make(6));
  const [size, setSize] = useState(g.p.w);
  const { w, h } = g.p;
  useEffect(() => { saveJSON('gp.knot', g); }, [g]);
  useEffect(() => {
    if (g.solved || !g.turns) return;
    const id = setInterval(() => { if (!document.hidden) setG(x => ({ ...x, elapsed: x.elapsed + 1000 })); }, 1000);
    return () => clearInterval(id);
  }, [g.solved, g.turns > 0]); // eslint-disable-line

  const apply = (m: Mask[], assisted = false) => {
    if (!g.turns) noteStarted('rope');
    const s: Saved = { ...g, m, turns: g.turns + 1, assisted: g.assisted || assisted };
    if (closed(w, h, m) && !g.solved) {
      s.solved = true; setTimeout(() => sfx('win'), 120);
      if (!s.assisted && !g.recorded) { s.recorded = true; recordResult(getData().activeId, 'rope', { result: 'win', ms: g.elapsed, label: `${w}×${h} · ${s.turns} turns`, bestKey: `${w}×${h}` }); }
    }
    setG(s);
  };
  const turn = (i: number) => {
    if (g.solved || !g.m[i] || g.m[i] === 15) return;
    sfx('click', 0.3);
    apply(g.m.map((x, k) => (k === i ? rot(x) : x)));
  };
  const hint = () => {
    const i = g.m.findIndex((x, k) => x !== g.p.goal[k] && x !== 15 && x !== 0);
    if (i >= 0) apply(g.m.map((x, k) => (k === i ? g.p.goal[k] : x)), true);
  };
  const ends = g.m.reduce((n, _, i) => n + [N, E, S, Wb].filter(b => loose(w, h, g.m, i) & b).length, 0);
  return (
    <div className="play">
      <div className="play-main">
        <div className="statline"><span role="status" aria-live="polite">{g.solved ? t('Every cord is closed: the knot is tied!', '每根绳都闭合了：结打好了！', 'Bütün iplikler kapandı: düğüm atıldı!') : t(`${ends} loose ends. Tap a tile to turn it.`, `还有${ends}个线头。点击格子旋转。`, `${ends} açık uç var. Döndürmek için bir kareye dokun.`)}</span><span className="num">{g.turns} · {fmtTime(g.elapsed)}</span></div>
        <svg className={'kn-board' + (g.solved ? ' done' : '')} viewBox={`-0.1 -0.1 ${w + 0.2} ${h + 0.2}`} role="grid" aria-label={t('Knot board', '中国结棋盘', 'Düğüm tahtası')}>
          <rect className="kn-bg" x={-0.1} y={-0.1} width={w + 0.2} height={h + 0.2} rx={0.15} />
          {g.m.map((m, i) => {
            const x = i % w, y = Math.floor(i / w), lo = loose(w, h, g.m, i);
            return <g key={i} className={'kn-tile' + (m && m !== 15 ? ' turnable' : '') + (lo ? ' loose' : '')} onClick={() => turn(i)} role="gridcell" aria-label={m ? t('Cord tile', '绳块', 'İp karesi') : t('Empty', '空', 'Boş')}>
              <rect className="kn-cell" x={x + 0.03} y={y + 0.03} width={0.94} height={0.94} rx={0.08} />
              <Cord m={m} x={x} y={y} />
            </g>;
          })}
        </svg>
      </div>
      <aside className="play-side">
        {g.solved && <div className="result" role="status"><h3>{g.assisted ? t('Tied with hints', '在提示下完成', 'İpuçlarıyla bağlandı') : t('Tied', '打好了', 'Bağlandı')}</h3><p className="num big">{fmtTime(g.elapsed)}</p></div>}
        <div className="tools">
          <button type="button" id="kn-hint" className="btn" disabled={g.solved} onClick={hint}>{t('Hint', '提示', 'İpucu')}</button>
          <button type="button" className="btn" disabled={g.solved || !g.turns} onClick={() => setG({ ...g, m: g.p.start, turns: 0 })}>{t('Start over', '重来', 'Baştan')}</button>
        </div>
        <p className="muted small">{t('Each tap turns a tile a quarter turn. Tiles with loose ends are shaded. Corners can only sit where two cords meet; a straight piece on the edge must run along it. Crossings never need turning.', '每点一次，格子转90°。有线头的格子会变暗。拐角只能放在两根绳相接的地方；边上的直绳必须沿着边走。交叉的格子不用转。', 'Her dokunuş kareyi çeyrek tur döndürür. Açık ucu olan kareler gölgelidir. Köşeler yalnızca iki ipin buluştuğu yere oturur; kenardaki düz parça kenar boyunca uzanmalıdır. Kesişen karelerin dönmesine gerek yoktur.')}</p>
        <div className="setup">
          <Seg id="kn-size" label={t('Size', '大小', 'Boyut')} value={size} onChange={setSize} options={[{ value: 5, label: '5×5' }, { value: 6, label: '6×6' }, { value: 8, label: '8×8' }, { value: 10, label: '10×10' }]} />
          <button type="button" id={g.solved ? 'kn-again' : 'kn-new'} className="btn primary" onClick={() => setG(make(size))}>{t('New knot', '新的结', 'Yeni düğüm')}</button>
        </div>
      </aside>
    </div>
  );
}
