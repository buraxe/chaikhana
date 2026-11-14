import './hashi.css';
import { useEffect, useState } from 'react';
import { useT } from '../../core/i18n';
import { sfx } from '../../core/sound';
import { loadJSON, saveJSON } from '../../core/storage';
import { getData, noteStarted, recordResult } from '../../core/store';
import { fmtTime, Seg } from '../../ui/bits';
import { counts, cycle, generate, solved, type Bridges, type HPuzzle } from './rules';

interface Saved { size: number; p: HPuzzle; br: Bridges; history: Bridges[]; elapsed: number; recorded: boolean }
const SIZES: Record<number, number> = { 7: 9, 9: 14, 11: 20 };
const make = (size: number): Saved => ({ size, p: generate(size, SIZES[size], Math.random), br: {}, history: [], elapsed: 0, recorded: false });

export default function Hashi() {
  const t = useT();
  const [g, setG] = useState<Saved>(() => loadJSON<Saved | null>('gp.hashi', null) ?? make(7));
  const [size, setSize] = useState(g.size);
  const [sel, setSel] = useState(-1);
  useEffect(() => { saveJSON('gp.hashi', g); }, [g]);
  const done = solved(g.p, g.br), n = counts(g.p, g.br);
  useEffect(() => {
    if (done || !g.history.length) return;
    const id = setInterval(() => { if (!document.hidden) setG(x => ({ ...x, elapsed: x.elapsed + 1000 })); }, 1000);
    return () => clearInterval(id);
  }, [done, g.history.length > 0]); // eslint-disable-line
  const tap = (i: number) => {
    if (done) return;
    if (sel < 0 || sel === i) { setSel(sel === i ? -1 : i); sfx('click', 0.4); return; }
    const br = cycle(g.p, g.br, sel, i);
    if (!br) { setSel(i); sfx('error', 0.5); return; }
    if (!g.history.length) noteStarted('hashi');
    sfx('peg');
    let recorded = g.recorded;
    if (solved(g.p, br) && !recorded) { recorded = true; setTimeout(() => sfx('win'), 200); recordResult(getData().activeId, 'hashi', { result: 'win', ms: g.elapsed, label: `${g.size}×${g.size} · ${g.p.islands.length} islands`, bestKey: `${g.size}×${g.size}` }); }
    setG({ ...g, br, history: [...g.history, g.br], recorded });
  };
  const S = g.p.size;
  return (
    <div className="play">
      <div className="play-main">
        <div className="statline"><span role="status" aria-live="polite">{done ? t('All islands are joined!', '所有岛都连起来了！', 'Bütün adalar bağlandı!') : sel >= 0 ? t('Now tap an island in line with it.', '再点同一直线上的岛。', 'Şimdi aynı hizadaki bir adaya dokun.') : t('Tap an island, then a neighbour in line: 0 → 1 → 2 → 0 bridges.', '点一个岛，再点同一直线上的邻岛：0→1→2→0座桥。', 'Bir adaya, sonra aynı hizadaki komşusuna dokun: 0 → 1 → 2 → 0 köprü.')}</span><span className="num">{fmtTime(g.elapsed)}</span></div>
        <svg className="hs-board" viewBox={`-0.6 -0.6 ${S + 0.2} ${S + 0.2}`} role="grid" aria-label="Hashi">
          {Array.from({ length: S }, (_, k) => <g key={k} className="hs-grid"><line x1={0} y1={k} x2={S - 1} y2={k} /><line x1={k} y1={0} x2={k} y2={S - 1} /></g>)}
          {Object.entries(g.br).map(([k, v]) => {
            const [a, b] = k.split('-').map(Number), A = g.p.islands[a], B = g.p.islands[b], horiz = A.r === B.r, off = v === 2 ? 0.1 : 0;
            return <g key={k} className="hs-bridge">{(v === 2 ? [-off, off] : [0]).map((o, j) => <line key={j} x1={A.c + (horiz ? 0 : o)} y1={A.r + (horiz ? o : 0)} x2={B.c + (horiz ? 0 : o)} y2={B.r + (horiz ? o : 0)} />)}</g>;
          })}
          {g.p.islands.map((x, i) => (
            <g key={i} className={'hs-isl' + (i === sel ? ' sel' : '') + (n[i] === x.n ? ' full' : n[i] > x.n ? ' over' : '')} onClick={() => tap(i)} role="gridcell" aria-label={t(`Island ${x.n}, ${n[i]} bridges`, `岛${x.n}，已有${n[i]}座桥`, `Ada ${x.n}, ${n[i]} köprü`)}>
              <circle cx={x.c} cy={x.r} r={0.38} /><text x={x.c} y={x.r + 0.14}>{x.n}</text>
            </g>
          ))}
        </svg>
      </div>
      <aside className="play-side">
        <p className="muted small">{t('Every island needs as many bridges as its number. Bridges run straight, at most two between two islands, never cross, and in the end every island must be connected.', '每个岛需要和数字一样多的桥。桥是直的，两岛之间最多两座，不能交叉，最后所有岛必须连成一体。', 'Her adanın sayısı kadar köprüsü olmalı. Köprüler düz gider, iki ada arasında en fazla iki tane olur, kesişmez ve sonunda bütün adalar birbirine bağlı olmalıdır.')}</p>
        <div className="tools">
          <button type="button" id="hs-undo" className="btn" disabled={!g.history.length || done} onClick={() => setG({ ...g, br: g.history[g.history.length - 1], history: g.history.slice(0, -1) })}>{t('Undo', '撤销', 'Geri al')}</button>
          <button type="button" className="btn" onClick={() => setG({ ...g, br: {}, history: [], elapsed: 0 })}>{t('Clear', '清空', 'Temizle')}</button>
        </div>
        <div className="setup">
          <Seg id="hs-size" label={t('Size', '大小', 'Boyut')} value={size} onChange={setSize} options={[{ value: 7, label: '7×7' }, { value: 9, label: '9×9' }, { value: 11, label: '11×11' }]} />
          <button type="button" id={done ? 'hs-again' : 'hs-new'} className="btn primary" onClick={() => { setG(make(size)); setSel(-1); }}>{t('New puzzle', '新谜题', 'Yeni bulmaca')}</button>
        </div>
      </aside>
    </div>
  );
}
