import './matchstick.css';
import { useEffect, useState } from 'react';
import { useT } from '../../core/i18n';
import { sfx } from '../../core/sound';
import { loadJSON, saveJSON } from '../../core/storage';
import { getData, noteStarted, recordResult } from '../../core/store';
import { fmtTime, Seg } from '../../ui/bits';
import { answers, generate, isTrue, moveMatch, parse, show, type Eq, type Level, type MPuzzle, type Pos } from './rules';

interface Saved { p: MPuzzle; eq: Eq; history: Eq[]; elapsed: number; solved: boolean; assisted: boolean; recorded: boolean }
const make = (moves: 1 | 2, level: Level): Saved => { const p = generate(moves, level); return { p, eq: parse(p.start), history: [], elapsed: 0, solved: false, assisted: false, recorded: false }; };
const STEP = 1.7;
/** Endpoints of a match position in a slot starting at x. */
function seg(kind: 'd' | 'op', x: number, b: number): [number, number, number, number] {
  if (kind === 'op') return b === 0 ? [x, 1, x + 1, 1] : [x + 0.5, 0.5, x + 0.5, 1.5];
  return ([[x, 0, x + 1, 0], [x + 1, 0, x + 1, 1], [x + 1, 1, x + 1, 2], [x, 2, x + 1, 2], [x, 1, x, 2], [x, 0, x, 1], [x, 1, x + 1, 1]] as [number, number, number, number][])[b];
}

export default function Matchstick() {
  const t = useT();
  const [g, setG] = useState<Saved>(() => loadJSON<Saved | null>('gp.matchstick', null) ?? make(1, 'easy'));
  const [moves, setMoves] = useState<1 | 2>(g.p.moves as 1 | 2);
  const [level, setLevel] = useState<Level>(g.p.level);
  const [held, setHeld] = useState<Pos | null>(null);
  const [miss, setMiss] = useState(false);
  const [shown, setShown] = useState<string[] | null>(null);
  const used = g.history.length, left = g.p.moves - used;
  useEffect(() => { saveJSON('gp.matchstick', g); }, [g]);
  useEffect(() => {
    if (g.solved || !used) return;
    const id = setInterval(() => { if (!document.hidden) setG(x => ({ ...x, elapsed: x.elapsed + 1000 })); }, 1000);
    return () => clearInterval(id);
  }, [g.solved, used > 0]); // eslint-disable-line

  const tapOn = (pos: Pos) => { if (g.solved || left <= 0) return; setHeld(held && held[0] === pos[0] && held[1] === pos[1] ? null : pos); sfx('click', 0.35); };
  const tapOff = (pos: Pos) => {
    if (!held || g.solved) return;
    const eq = moveMatch(g.eq, held, pos);
    setHeld(null);
    if (!show(eq)) { sfx('error', 0.5); setMiss(true); setTimeout(() => setMiss(false), 500); return; }
    if (!used) noteStarted('matchstick');
    sfx('peg');
    const next: Saved = { ...g, eq, history: [...g.history, g.eq] };
    if (next.history.length === g.p.moves && isTrue(eq)) {
      next.solved = true; setTimeout(() => sfx('win'), 150);
      if (!g.assisted && !g.recorded) { next.recorded = true; recordResult(getData().activeId, 'matchstick', { result: 'win', ms: g.elapsed, label: `${g.p.start} → ${show(eq)}`, bestKey: `${g.p.moves} · ${g.p.level}` }); }
    } else if (next.history.length === g.p.moves) sfx('error', 0.4);
    setG(next);
  };
  const fresh = () => { setG(make(moves, level)); setHeld(null); setShown(null); };

  let x = 0;
  const parts = g.eq.map((s, i) => { const x0 = x; x += s.k === 'd' ? STEP : STEP; return { s, i, x0 }; });
  const W = x - (STEP - 1);
  const isHeld = (i: number, b: number) => held !== null && held[0] === i && held[1] === b;
  const text = show(g.eq) ?? '';
  const status = g.solved ? t(`True: ${text}`, `成立了：${text}`, `Doğru: ${text}`)
    : left === 0 ? t(`${text} is still not true. Undo and try another way.`, `${text}还是不成立。撤销后换个办法。`, `${text} hâlâ doğru değil. Geri al ve başka yol dene.`)
    : held ? t('Now tap an empty place to lay the match there.', '再点一个空位放下火柴。', 'Şimdi kibriti koymak için boş bir yere dokun.')
    : t(`Move ${left} match${left > 1 ? 'es' : ''} to make the equation true.`, `移动${left}根火柴，让等式成立。`, `Eşitliği doğru yapmak için ${left} kibrit oynat.`);

  return (
    <div className="play">
      <div className="play-main">
        <div className="statline"><span role="status" aria-live="polite">{status}</span><span className="num">{fmtTime(g.elapsed)}</span></div>
        <svg className={'mc-board' + (miss ? ' miss' : '') + (g.solved ? ' done' : '')} viewBox={`-0.5 -0.5 ${W + 1} 3`} role="group" aria-label={t(`Equation in matches: ${text}`, `火柴等式：${text}`, `Kibritten eşitlik: ${text}`)}>
          {parts.map(({ s, i, x0 }) => {
            if (s.k === 'eq') return <g key={i} className="mc-eq">{[0.75, 1.25].map(y => <line key={y} x1={x0 + 0.1} y1={y} x2={x0 + 0.9} y2={y} />)}</g>;
            const n = s.k === 'd' ? 7 : 2;
            return (
              <g key={i}>
                {Array.from({ length: n }, (_, b) => {
                  const [x1, y1, x2, y2] = seg(s.k, x0, b), on = (s.m >> b) & 1, hx = x1 + (x2 - x1) * 0.1, hy = y1 + (y2 - y1) * 0.1;
                  const ex = x1 + (x2 - x1) * 0.9, ey = y1 + (y2 - y1) * 0.9;
                  if (!on) return <g key={b} className={'mc-slot' + (held ? ' live' : '')} onClick={() => tapOff([i, b])}><line className="mc-hit" x1={hx} y1={hy} x2={ex} y2={ey} /><line className="mc-ghost" x1={hx} y1={hy} x2={ex} y2={ey} /></g>;
                  return (
                    <g key={b} className={'mc-match' + (isHeld(i, b) ? ' held' : '')} onClick={() => tapOn([i, b])} role="button" aria-label={t('Match', '火柴', 'Kibrit')}>
                      <line className="mc-hit" x1={hx} y1={hy} x2={ex} y2={ey} />
                      <line className="mc-stick" x1={hx} y1={hy} x2={ex} y2={ey} />
                      <circle className="mc-head" cx={ex} cy={ey} r={0.075} />
                    </g>
                  );
                })}
              </g>
            );
          })}
        </svg>
        <p className="muted small">{t('Tap a match to pick it up, then tap an empty place to put it down. The equals sign stays where it is; every other match may move. Any true equation counts.', '点一根火柴把它拿起，再点一个空位放下。等号不能动，其他火柴都可以移动。任何成立的等式都算。', 'Bir kibrite dokunup al, sonra boş bir yere dokunup bırak. Eşittir işareti yerinde kalır; diğer bütün kibritler oynayabilir. Doğru olan her eşitlik sayılır.')}</p>
        {shown && <p className="hint">{t('Answers: ', '答案：', 'Cevaplar: ')}{shown.join(' · ')}</p>}
      </div>
      <aside className="play-side">
        {g.solved && <div className="result" role="status"><h3>{g.assisted ? t('Solved after peeking', '看过答案后解开', 'Cevaba bakarak çözüldü') : t('Solved', '解开了', 'Çözüldü')}</h3><p className="num big">{fmtTime(g.elapsed)}</p><p className="muted">{g.p.start} → {text}</p></div>}
        <div className="tools">
          <button type="button" id="mc-undo" className="btn" disabled={!used || g.solved} onClick={() => { setG({ ...g, eq: g.history[used - 1], history: g.history.slice(0, -1) }); setHeld(null); }}>{t('Undo', '撤销', 'Geri al')}</button>
          <button type="button" className="btn" disabled={!used || g.solved} onClick={() => { setG({ ...g, eq: parse(g.p.start), history: [] }); setHeld(null); }}>{t('Start over', '重来', 'Baştan')}</button>
          <button type="button" id="mc-hint" className="btn" disabled={g.solved} onClick={() => { setShown(answers(parse(g.p.start), g.p.moves)); setG({ ...g, assisted: true }); }}>{t('Show answers', '显示答案', 'Cevapları göster')}</button>
        </div>
        <div className="setup">
          <Seg id="mc-moves" label={t('Matches to move', '移动根数', 'Oynatılacak kibrit')} value={moves} onChange={setMoves} options={[{ value: 1, label: '1' }, { value: 2, label: '2' }]} />
          <Seg id="mc-level" label={t('Numbers', '数字', 'Sayılar')} value={level} onChange={setLevel} options={[{ value: 'easy', label: t('One digit', '一位数', 'Tek basamak') }, { value: 'hard', label: t('Two digits', '两位数', 'İki basamak') }]} />
          <button type="button" id={g.solved ? 'mc-again' : 'mc-new'} className="btn primary" onClick={fresh}>{t('New puzzle', '新谜题', 'Yeni bulmaca')}</button>
        </div>
      </aside>
    </div>
  );
}
