import './sliding.css';
import { useEffect, useState } from 'react';
import { useT } from '../../core/i18n';
import { sfx } from '../../core/sound';
import { loadJSON, saveJSON } from '../../core/storage';
import { getData, noteStarted, recordResult } from '../../core/store';
import { fmtTime, Seg } from '../../ui/bits';
import { nextMove, shuffle, slide, solved, type Tiles } from './rules';

interface Saved { n: number; tiles: Tiles; moves: number; history: Tiles[]; elapsed: number; assisted: boolean; recorded: boolean }
const make = (n: number): Saved => ({ n, tiles: shuffle(n), moves: 0, history: [], elapsed: 0, assisted: false, recorded: false });

export default function Sliding() {
  const t = useT();
  const [g, setG] = useState<Saved>(() => loadJSON<Saved | null>('gp.sliding', null) ?? make(4));
  const [size, setSize] = useState(g.n);
  const [hintAt, setHintAt] = useState(-1);
  const { n, tiles } = g, done = solved(tiles);
  useEffect(() => { saveJSON('gp.sliding', g); }, [g]);
  useEffect(() => {
    if (done || !g.moves) return;
    const id = setInterval(() => { if (!document.hidden) setG(x => ({ ...x, elapsed: x.elapsed + 1000 })); }, 1000);
    return () => clearInterval(id);
  }, [done, g.moves > 0]); // eslint-disable-line

  const move = (i: number, assisted = false) => {
    if (done) return;
    const next = slide(tiles, n, i);
    if (!next) { sfx('error', 0.3); return; }
    if (!g.moves) noteStarted('sliding-block');
    const steps = Math.abs(Math.floor(i / n) - Math.floor(tiles.indexOf(0) / n)) + Math.abs((i % n) - (tiles.indexOf(0) % n));
    const s: Saved = { ...g, tiles: next, moves: g.moves + steps, history: [...g.history, tiles], assisted: g.assisted || assisted };
    sfx('slide', 0.5); setHintAt(-1);
    if (solved(next) && !g.recorded) {
      setTimeout(() => sfx('win'), 150);
      if (!s.assisted) { s.recorded = true; recordResult(getData().activeId, 'sliding-block', { result: 'win', ms: g.elapsed, label: `${n}×${n} · ${s.moves} moves`, bestKey: `${n}×${n}` }); }
    }
    setG(s);
  };
  useEffect(() => {
    // Arrow keys move the tile next to the gap into it.
    const k = (e: KeyboardEvent) => {
      const d = ({ ArrowUp: n, ArrowDown: -n, ArrowLeft: 1, ArrowRight: -1 } as Record<string, number>)[e.key];
      if (d === undefined || (e.target as HTMLElement)?.tagName === 'INPUT') return;
      const gap = tiles.indexOf(0), i = gap + d;
      if (i < 0 || i >= n * n || (Math.abs(d) === 1 && Math.floor(i / n) !== Math.floor(gap / n))) return;
      e.preventDefault(); move(i);
    };
    window.addEventListener('keydown', k); return () => window.removeEventListener('keydown', k);
  }); // eslint-disable-line
  const hint = () => { const i = nextMove(tiles, n, n === 5 ? 400_000 : 200_000); if (i !== null) { setHintAt(i); setG({ ...g, assisted: true }); } };

  return (
    <div className="play">
      <div className="play-main">
        <div className="statline"><span role="status" aria-live="polite">{done ? t(`In order after ${g.moves} moves!`, `${g.moves}步排好了！`, `${g.moves} hamlede sıraya girdi!`) : t('Slide the tiles into order, 1 to the last, with the gap at the end.', '把数字滑成顺序，从1到最后，空格在末尾。', 'Taşları 1’den sona doğru sıraya diz; boşluk en sonda kalsın.')}</span><span className="num">{g.moves} · {fmtTime(g.elapsed)}</span></div>
        <div className={'sb-frame' + (done ? ' done' : '')} style={{ gridTemplateColumns: `repeat(${n}, 1fr)` }} role="grid" aria-label={t(`${n} by ${n} sliding tiles`, `${n}×${n}数字滑块`, `${n}×${n} kaydırmalı taşlar`)}>
          {tiles.map((v, i) => v ? (
            <button key={v} type="button" className={'sb-tile' + ((v - 1) === i ? ' home' : '') + (i === hintAt ? ' hint' : '')} style={{ gridRow: Math.floor(i / n) + 1, gridColumn: (i % n) + 1, fontSize: `${n === 3 ? 2 : n === 4 ? 1.6 : 1.25}rem` }} onClick={() => move(i)} aria-label={String(v)}>{v}</button>
          ) : <span key="gap" className="sb-gap" style={{ gridRow: Math.floor(i / n) + 1, gridColumn: (i % n) + 1 }} aria-hidden="true" />)}
        </div>
        <p className="muted small">{t('Tap any tile in line with the gap: it and the tiles between slide over. Arrow keys work too.', '点和空格在同一行或同一列的任意数字，它和中间的数字会一起滑过去。也可以用方向键。', 'Boşlukla aynı sıradaki ya da sütundaki herhangi bir taşa dokun: o ve aradakiler kayar. Ok tuşları da çalışır.')}</p>
      </div>
      <aside className="play-side">
        {done && <div className="result" role="status"><h3>{g.assisted ? t('Done with hints', '在提示下完成', 'İpuçlarıyla bitti') : t('Done', '完成', 'Bitti')}</h3><p className="num big">{fmtTime(g.elapsed)}</p><p className="muted">{t(`${g.moves} moves`, `${g.moves}步`, `${g.moves} hamle`)}</p></div>}
        <div className="tools">
          <button type="button" id="sb-undo" className="btn" disabled={!g.history.length || done} onClick={() => setG({ ...g, tiles: g.history[g.history.length - 1], history: g.history.slice(0, -1) })}>{t('Undo', '撤销', 'Geri al')}</button>
          <button type="button" id="sb-hint" className="btn" disabled={done} onClick={hint}>{t('Hint', '提示', 'İpucu')}</button>
        </div>
        {hintAt >= 0 && <p className="hint">{t('Slide the outlined tile.', '滑动框出的数字。', 'İşaretli taşı kaydır.')}</p>}
        <p className="muted small">{t('Solve it a row at a time: finish the top row, then the next, and leave the last two rows to solve together, column by column.', '一行一行来：先完成最上面一行，再下一行，最后两行一起一列一列地解。', 'Satır satır git: önce en üst satırı bitir, sonra bir sonrakini; son iki satırı birlikte, sütun sütun çöz.')}</p>
        <div className="setup">
          <Seg id="sb-size" label={t('Size', '大小', 'Boyut')} value={size} onChange={setSize} options={[{ value: 3, label: '3×3' }, { value: 4, label: '4×4' }, { value: 5, label: '5×5' }]} />
          <button type="button" id={done ? 'sb-again' : 'sb-new'} className="btn primary" onClick={() => { setG(make(size)); setHintAt(-1); }}>{t('Shuffle', '打乱', 'Karıştır')}</button>
        </div>
      </aside>
    </div>
  );
}
