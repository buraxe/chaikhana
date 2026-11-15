import './peg.css';
import { useEffect, useState } from 'react';
import { useT } from '../../core/i18n';
import { sfx } from '../../core/sound';
import { loadJSON, saveJSON } from '../../core/storage';
import { getData, noteStarted, recordResult } from '../../core/store';
import { fmtTime, Seg } from '../../ui/bits';
import { BOARDS, count, has, jump, legal, solve, startPegs, wonCentre, type BoardId, type PMove } from './rules';

/** Pegs are kept as a decimal string: JSON has no bigint. */
interface Saved { board: BoardId; pegs: string; history: string[]; elapsed: number; assisted: boolean; recorded: boolean }
const make = (board: BoardId): Saved => ({ board, pegs: startPegs(BOARDS[board]).toString(), history: [], elapsed: 0, assisted: false, recorded: false });

export default function Peg() {
  const t = useT();
  const [g, setG] = useState<Saved>(() => { const s = loadJSON<Saved | null>('gp.peg', null); return s && BOARDS[s.board] ? s : make('english'); });
  const [boardPick, setBoardPick] = useState<BoardId>(g.board);
  const [sel, setSel] = useState(-1);
  const [hint, setHint] = useState<PMove | null>(null);
  const [note, setNote] = useState('');
  const b = BOARDS[g.board], pegs = BigInt(g.pegs), moves = legal(b, pegs), left = count(pegs);
  const over = moves.length === 0, perfect = over && b.centre >= 0 && wonCentre(b, pegs), single = over && left === 1;
  useEffect(() => { saveJSON('gp.peg', g); }, [g]);
  useEffect(() => {
    if (over || !g.history.length) return;
    const id = setInterval(() => { if (!document.hidden) setG(x => ({ ...x, elapsed: x.elapsed + 1000 })); }, 1000);
    return () => clearInterval(id);
  }, [over, g.history.length > 0]); // eslint-disable-line

  const play = (m: PMove, assisted = false) => {
    const next = jump(pegs, m);
    if (!g.history.length) noteStarted('peg-solitaire');
    sfx('peg'); setSel(-1); setHint(null); setNote('');
    const s: Saved = { ...g, pegs: next.toString(), history: [...g.history, g.pegs], assisted: g.assisted || assisted };
    if (legal(b, next).length === 0) {
      if (count(next) === 1) {
        setTimeout(() => sfx('win'), 150);
        if (!s.assisted && !g.recorded) { s.recorded = true; const c = wonCentre(b, next); recordResult(getData().activeId, 'peg-solitaire', { result: 'win', ms: g.elapsed, label: `${g.board}${c && b.centre >= 0 ? ' · centre' : ''}`, bestKey: g.board }); }
      } else sfx('error', 0.4);
    }
    setG(s);
  };
  const tap = (i: number) => {
    if (over) return;
    if (has(pegs, i)) { setSel(sel === i ? -1 : i); sfx('click', 0.3); return; }
    const m = moves.find(([f, , to]) => f === sel && to === i) ?? (sel < 0 ? (() => { const ms = moves.filter(([, , to]) => to === i); return ms.length === 1 ? ms[0] : undefined; })() : undefined);
    if (m) play(m); else sfx('error', 0.3);
  };
  const giveHint = () => {
    const sol = solve(b, pegs, 1_500_000);
    if (sol && sol.length) { setHint(sol[0]); setSel(sol[0][0]); setNote(''); setG({ ...g, assisted: true }); }
    else setNote(sol === null ? t('There is no way to one peg from here. Undo a few moves.', '从这里已经不可能只剩一枚了。撤销几步吧。', 'Buradan tek taşa inmenin yolu yok. Birkaç hamle geri al.') : t('No quick answer from here.', '一时找不到解法。', 'Buradan hızlı bir çözüm bulunamadı.'));
  };

  const rows = Math.max(...b.holes.map(h => h[0])) + 1, cols = Math.max(...b.holes.map(h => h[1])) + 1;
  const tri = b.id === 'triangle';
  const pos = ([r, c]: [number, number]) => (tri ? { x: c - r / 2 + (rows - 1) / 2, y: r * 0.88 } : { x: c, y: r });
  const W = tri ? rows : cols, H = tri ? (rows - 1) * 0.88 + 1 : rows;
  const targets = new Set(sel >= 0 ? moves.filter(m => m[0] === sel).map(m => m[2]) : []);
  const status = perfect ? t('One peg left, right in the centre: a perfect finish!', '只剩一枚，正好在中心：完美收官！', 'Tek taş kaldı, tam ortada: kusursuz bitiş!')
    : single ? t('One peg left: solved!', '只剩一枚：解开了！', 'Tek taş kaldı: çözüldü!')
    : over ? t(`No more jumps: ${left} pegs left. Undo or start again.`, `没有可跳的了：剩下${left}枚。撤销或重来。`, `Atlanacak hamle kalmadı: ${left} taş kaldı. Geri al ya da baştan başla.`)
    : sel >= 0 ? t('Now tap the empty hole to jump into.', '再点要跳进去的空洞。', 'Şimdi atlanacak boş deliğe dokun.')
    : t(`Jump a peg over a neighbour into an empty hole. ${left} pegs left.`, `让棋子跳过相邻棋子落进空洞。还剩${left}枚。`, `Bir taşı komşusunun üstünden boş deliğe atlat. ${left} taş kaldı.`);

  return (
    <div className="play">
      <div className="play-main">
        <div className="statline"><span role="status" aria-live="polite">{status}</span><span className="num">{left} · {fmtTime(g.elapsed)}</span></div>
        <svg className={'pg-board' + (tri ? ' tri' : '')} viewBox={`-0.6 -0.6 ${W + 0.2} ${H + 0.2}`} role="grid" aria-label={t('Peg solitaire board', '孔明棋棋盘', 'Tek taş tahtası')}>
          <rect className="pg-wood" x={-0.6} y={-0.6} width={W + 0.2} height={H + 0.2} rx={tri ? 0.3 : 0.6} />
          {b.holes.map((h, i) => {
            const { x, y } = pos(h), peg = has(pegs, i);
            const cls = 'pg-hole' + (peg ? ' peg' : '') + (i === sel ? ' sel' : '') + (targets.has(i) ? ' target' : '') + (hint && hint[2] === i ? ' hint' : '') + (i === b.centre && !peg ? ' centre' : '');
            return <g key={i} className={cls} onClick={() => tap(i)} role="gridcell" aria-label={peg ? t('Peg', '棋子', 'Taş') : t('Empty hole', '空洞', 'Boş delik')}>
              <circle className="pg-pit" cx={x} cy={y} r={0.3} />
              {peg && <circle className="pg-peg" cx={x} cy={y} r={0.27} />}
            </g>;
          })}
        </svg>
        {note && <p className="hint">{note}</p>}
      </div>
      <aside className="play-side">
        {single && <div className="result" role="status"><h3>{g.assisted ? t('Solved with hints', '在提示下解开', 'İpuçlarıyla çözüldü') : perfect ? t('Perfect', '完美', 'Kusursuz') : t('Solved', '解开了', 'Çözüldü')}</h3><p className="num big">{fmtTime(g.elapsed)}</p></div>}
        <div className="tools">
          <button type="button" id="pg-undo" className="btn" disabled={!g.history.length || single} onClick={() => { setG({ ...g, pegs: g.history[g.history.length - 1], history: g.history.slice(0, -1) }); setSel(-1); setHint(null); setNote(''); }}>{t('Undo', '撤销', 'Geri al')}</button>
          <button type="button" id="pg-hint" className="btn" disabled={over} onClick={giveHint}>{t('Hint', '提示', 'İpucu')}</button>
        </div>
        <p className="muted small">{t('Tap a peg, then the empty hole two steps away; the peg jumped over is taken off. Leave one peg to win, and leave it in the centre for the classic perfect finish.', '点一枚棋子，再点隔一格的空洞；被跳过的棋子会被拿走。只剩一枚就赢了，留在正中心是经典的完美收官。', 'Bir taşa, sonra iki adım ötedeki boş deliğe dokun; üstünden atlanan taş kalkar. Tek taş bırakırsan kazanırsın; onu ortada bırakmak klasik kusursuz bitiştir.')}</p>
        <div className="setup">
          <Seg id="pg-board" label={t('Board', '棋盘', 'Tahta')} value={boardPick} onChange={setBoardPick} options={[{ value: 'english', label: t('Cross, 33', '十字形，33孔', 'Haç, 33') }, { value: 'triangle', label: t('Triangle, 15', '三角形，15孔', 'Üçgen, 15') }]} />
          <button type="button" id={single ? 'pg-again' : 'pg-new'} className="btn primary" onClick={() => { setG(make(boardPick)); setSel(-1); setHint(null); setNote(''); }}>{t('New game', '新游戏', 'Yeni oyun')}</button>
        </div>
      </aside>
    </div>
  );
}
