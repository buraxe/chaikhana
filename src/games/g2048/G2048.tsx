import './g2048.css';
import { useEffect, useRef, useState } from 'react';
import { useT } from '../../core/i18n';
import { sfx } from '../../core/sound';
import { loadJSON, saveJSON } from '../../core/storage';
import { getData, noteStarted, recordResult } from '../../core/store';
import { best, canMove, fresh48, slide, spawn, type B48, type Dir } from './rules';

interface Saved { b: B48; prev: B48 | null; top: number; won: boolean; over: boolean; recorded: boolean; undone: boolean; merged: number[] }
const make = (): Saved => ({ b: fresh48(Math.random), prev: null, top: loadJSON<number>('gp.2048.top', 0), won: false, over: false, recorded: false, undone: false, merged: [] });

export default function G2048() {
  const t = useT();
  const [g, setG] = useState<Saved>(() => loadJSON<Saved | null>('gp.2048', null) ?? make());
  const start = useRef<{ x: number; y: number } | null>(null);
  useEffect(() => { saveJSON('gp.2048', g); }, [g]);
  const go = (d: Dir) => {
    if (g.over) return;
    const r = slide(g.b, d); if (!r) return;
    if (!g.b.moves) noteStarted('g2048');
    const b = { ...r.b, cells: spawn(r.b.cells, Math.random) };
    sfx(r.merged.length ? 'pop' : 'slide', r.merged.length ? 0.6 : 0.4);
    const won = g.won || best(b) >= 2048, over = !canMove(b), top = Math.max(g.top, b.score);
    let recorded = g.recorded;
    if (won && !g.won && !g.undone) { recordResult(getData().activeId, 'g2048', { result: 'win', label: `2048 · ${b.score} points` }); recorded = true; }
    if (over && !recorded) { recordResult(getData().activeId, 'g2048', { result: 'loss', label: `best tile ${best(b)} · ${b.score} points${g.undone ? ' · unrated' : ''}` }); recorded = true; }
    if (top > g.top) saveJSON('gp.2048.top', top);
    setG({ ...g, b, prev: g.b, won, over, top, recorded, merged: r.merged });
  };
  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      const d = ({ ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right', w: 'up', s: 'down', a: 'left', d: 'right' } as Record<string, Dir>)[e.key];
      if (d && !(e.target as HTMLElement).closest('input, select, textarea')) { e.preventDefault(); go(d); }
    };
    window.addEventListener('keydown', k); return () => window.removeEventListener('keydown', k);
  });
  const status = g.over ? t(`No moves left. Score ${g.b.score}.`, `无路可走。得分${g.b.score}。`, `Hamle kalmadı. Puan ${g.b.score}.`)
    : g.won ? t('2048! Keep going for a bigger tile.', '2048！继续冲更大的数字。', '2048! Daha büyüğü için devam et.')
    : t('Swipe or use the arrow keys. Equal tiles merge.', '滑动或用方向键。相同的数字会合并。', 'Kaydır ya da ok tuşlarını kullan. Aynı sayılar birleşir.');
  return (
    <div className="play">
      <div className="play-main">
        <div className="statline"><span role="status" aria-live="polite">{status}</span><span className="num">{t(`Score ${g.b.score}`, `得分 ${g.b.score}`, `Puan ${g.b.score}`)}</span><span className="num muted">{t(`Best ${g.top}`, `最高 ${g.top}`, `En iyi ${g.top}`)}</span></div>
        <div className="t48" role="grid" aria-label="2048" tabIndex={0}
          onPointerDown={e => { start.current = { x: e.clientX, y: e.clientY }; }}
          onPointerUp={e => { const s = start.current; start.current = null; if (!s) return; const dx = e.clientX - s.x, dy = e.clientY - s.y; if (Math.max(Math.abs(dx), Math.abs(dy)) < 24) return; go(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up')); }}>
          {g.b.cells.map((v, i) => <div key={i + '-' + v + '-' + g.b.moves} role="gridcell" className={'t48-c v' + Math.min(v, 4096) + (g.merged.includes(i) ? ' pop' : '') + (v > 4096 ? ' big' : '')}>{v || ''}</div>)}
        </div>
        <div className="row t48-pad" aria-hidden="true">
          {(['left', 'up', 'down', 'right'] as Dir[]).map(d => <button key={d} type="button" className="btn" tabIndex={-1} onClick={() => go(d)}>{({ left: '←', up: '↑', down: '↓', right: '→' })[d]}</button>)}
        </div>
      </div>
      <aside className="play-side">
        <p className="muted small">{t('Every move slides all tiles as far as they go and adds a 2 or a 4. Two equal tiles that meet become one: reach the 2048 tile.', '每次移动所有方块都会滑到底，并新增一个2或4。相同的两块相遇会合并：拼出2048。', 'Her hamlede bütün kareler gidebildiği yere kayar ve yeni bir 2 ya da 4 gelir. Karşılaşan iki eşit kare birleşir: 2048’e ulaş.')}</p>
        <div className="tools">
          <button type="button" id="g48-undo" className="btn" disabled={!g.prev || g.over} onClick={() => g.prev && setG({ ...g, b: g.prev, prev: null, undone: true, merged: [] })}>{t('Undo', '撤销', 'Geri al')}</button>
          <button type="button" id={g.over ? 'g48-again' : 'g48-new'} className="btn primary" onClick={() => setG(make())}>{t('New game', '新游戏', 'Yeni oyun')}</button>
        </div>
      </aside>
    </div>
  );
}
