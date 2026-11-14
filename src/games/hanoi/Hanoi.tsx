import './hanoi.css';
import { useEffect, useRef, useState } from 'react';
import { sfx } from '../../core/sound';
import { loadJSON, saveJSON } from '../../core/storage';
import { getData, noteStarted, recordResult } from '../../core/store';
import { fmtTime, Pick } from '../../ui/bits';
import { useT } from '../../core/i18n';
import { canMove, minimum, move, newGame, nextMove, solved, type HMove, type HState } from './rules';

interface Saved { st: HState; history: HState[]; elapsed: number; assisted: boolean; recorded: boolean }
const PEG_X = [5.5, 16.5, 27.5];

export default function Hanoi() {
  const t = useT();
  const saved = useRef(loadJSON<Saved | null>('gp.hanoi', null)).current;
  const [st, setSt] = useState<HState>(saved?.st ?? newGame(4));
  const [history, setHistory] = useState<HState[]>(saved?.history ?? []);
  const [elapsed, setElapsed] = useState(saved?.elapsed ?? 0);
  const [assisted, setAssisted] = useState(saved?.assisted ?? false);
  const recorded = useRef(saved?.recorded ?? false);
  const [held, setHeld] = useState(-1);
  const [hint, setHint] = useState<HMove | null>(null);
  const [auto, setAuto] = useState(false);
  const [size, setSize] = useState(st.n);
  const done = solved(st);

  useEffect(() => { saveJSON('gp.hanoi', { st, history, elapsed, assisted, recorded: recorded.current } satisfies Saved); }, [st, history, elapsed, assisted]);
  useEffect(() => {
    if (done || st.moves === 0 || auto) return;
    const t = setInterval(() => { if (!document.hidden) setElapsed(e => e + 1000); }, 1000);
    return () => clearInterval(t);
  }, [done, st.moves, auto]);

  const doMove = (m: HMove, viaAuto = false) => {
    if (!canMove(st, m)) return;
    const next = move(st, m);
    if (st.moves === 0 && !viaAuto) noteStarted('hanoi');
    setHistory(h => [...h, st]); setSt(next); setHint(null); setHeld(-1);
    if (solved(next) && !recorded.current && !assisted && !viaAuto) {
      recorded.current = true;
      const optimal = next.moves === minimum(next.n);
      recordResult(getData().activeId, 'hanoi', { result: 'win', ms: elapsed,
        label: `${next.n} disks · ${next.moves} moves${optimal ? ' · optimal' : ''}`, bestKey: `${next.n} disks` });
    }
  };
  useEffect(() => {
    if (!auto) return;
    const m = nextMove(st);
    if (!m) { setAuto(false); return; }
    const t = setTimeout(() => doMove(m, true), Math.max(90, 700 / st.n));
    return () => clearTimeout(t);
  }, [auto, st]); // eslint-disable-line

  const tapPeg = (p: number) => {
    sfx('slide');
    if (done || auto) return;
    if (held < 0) { if (st.pegs[p].length) setHeld(p); return; }
    if (held === p) { setHeld(-1); return; }
    if (canMove(st, [held, p])) doMove([held, p]); else setHeld(st.pegs[p].length ? p : -1);
  };
  useEffect(() => {
    const on = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement)?.tagName === 'SELECT') return;
      if (/^[1-3]$/.test(e.key)) tapPeg(+e.key - 1);
      else if (e.key === 'Escape') setHeld(-1);
    };
    window.addEventListener('keydown', on);
    return () => window.removeEventListener('keydown', on);
  });
  const restart = (n: number) => {
    setSt(newGame(n)); setHistory([]); setElapsed(0); setAssisted(false); recorded.current = false; setHeld(-1); setHint(null); setAuto(false);
  };
  const undo = () => { if (!history.length || auto) return; setSt(history[history.length - 1]); setHistory(h => h.slice(0, -1)); setAssisted(true); setHeld(-1); };

  const min = minimum(st.n);
  const diskW = (d: number) => 2.2 + (d / st.n) * 8.4;
  return (
    <div className="play">
      <div className="play-main">
        <div className="statline">
          <span role="status" aria-live="polite">{done ? (auto || assisted ? t('Solved with help.', '在帮助下完成。', 'Yardımla çözüldü.') : st.moves === min ? t('Solved in the minimum number of moves.', '用最少步数完成！', 'En az hamleyle çözüldü.') : t(`Solved in ${st.moves} moves.`, `用${st.moves}步完成。`, `${st.moves} hamlede çözüldü.`))
            : held >= 0 ? t(`Holding a disk from peg ${held + 1}. Choose where to put it.`, `拿起了${held + 1}号柱的圆盘，请选择放到哪里。`, `${held + 1}. çubuktan bir disk elinde. Nereye koyacağını seç.`) : t('Move the whole tower to the right-hand peg.', '把整座塔移到最右边的柱子上。', 'Kulenin tamamını sağdaki çubuğa taşı.')}</span>
          <span className="num">{t(`${st.moves} / ${min} moves`, `${st.moves} / ${min} 步`, `${st.moves} / ${min} hamle`)}</span>
          <span className="num">{fmtTime(elapsed)}</span>
        </div>
        <svg className="hanoi" viewBox="0 0 33 15" role="group" aria-label={t('Three pegs. Press 1, 2 or 3 to pick up and drop disks.', '三根柱子。按1、2、3拿起和放下圆盘。', 'Üç çubuk. Disk alıp bırakmak için 1, 2 ya da 3’e bas.')}>
          <rect x="0.5" y="13" width="32" height="0.8" rx="0.2" className="h-base" />
          {PEG_X.map((x, p) => (
            <g key={p}>
              <rect x={x - 0.22} y={3} width={0.44} height={10} rx="0.2" className={'h-peg' + (hint && (hint[0] === p || hint[1] === p) ? ' hint' : '')} />
              <text x={x} y={14.75} textAnchor="middle" className="h-label">{p + 1}</text>
              {st.pegs[p].map((d, k) => {
                const lifted = held === p && k === st.pegs[p].length - 1, w = diskW(d);
                return <rect key={d} x={x - w / 2} y={lifted ? 1 : 12 - k} width={w} height={0.92} rx="0.4" className="h-disk"
                  style={{ fill: `color-mix(in srgb, var(--red) ${Math.round(100 - ((d - 1) / Math.max(1, st.n - 1)) * 100)}%, var(--gold))` }} />;
              })}
              <rect x={x - 5.4} y={0} width={10.8} height={14} fill="transparent" className={done || auto ? '' : 'pt'} onClick={() => tapPeg(p)}
                role="button" aria-label={t(`Peg ${p + 1}, ${st.pegs[p].length} disks`, `${p + 1}号柱，${st.pegs[p].length}个圆盘`, `${p + 1}. çubuk, ${st.pegs[p].length} disk`)} />
            </g>
          ))}
        </svg>
      </div>
      <aside className="play-side">
        {done && (
          <div className="result" role="status">
            <h3>{auto || assisted ? t('Solved with help', '在帮助下完成', 'Yardımla çözüldü') : t('Solved', '完成', 'Çözüldü')}</h3>
            <p className="num big">{t(`${st.moves} moves`, `${st.moves}步`, `${st.moves} hamle`)}</p>
            <p className="muted">{t(`Minimum for ${st.n} disks is ${min}.`, `${st.n}个盘最少需要${min}步。`, `${st.n} disk için en az hamle ${min}.`)} {auto || assisted ? t('Hints, undo or the solver were used, so this run is not recorded.', '用了提示、撤销或自动解法，这次不计成绩。', 'İpucu, geri alma ya da çözücü kullanıldı; bu deneme kaydedilmedi.') : fmtTime(elapsed)}</p>
            <button type="button" id="hn-again" className="btn primary" onClick={() => restart(st.n)}>{t('Play again', '再来一次', 'Tekrar oyna')}</button>
          </div>
        )}
        <div className="tools">
          <button type="button" id="hn-undo" className="btn" disabled={!history.length || auto} onClick={undo}>{t('Undo', '撤销', 'Geri al')}</button>
          <button type="button" id="hn-hint" className="btn" disabled={done || auto} onClick={() => { setHint(nextMove(st)); setAssisted(true); }}>{t('Hint', '提示', 'İpucu')}</button>
          <button type="button" id="hn-auto" className={'btn' + (auto ? ' on' : '')} disabled={done} onClick={() => { setAuto(a => !a); setHeld(-1); }}>{auto ? t('Stop solver', '停止演示', 'Çözücüyü durdur') : t('Show solution', '演示解法', 'Çözümü göster')}</button>
        </div>
        {hint && <p className="hint">{t(`Move the top disk of peg ${hint[0] + 1} to peg ${hint[1] + 1}.`, `把${hint[0] + 1}号柱最上面的盘移到${hint[1] + 1}号柱。`, `${hint[0] + 1}. çubuğun en üstteki diskini ${hint[1] + 1}. çubuğa taşı.`)}</p>}
        <p className="muted small">{t('Click or tap a peg to lift its top disk, then a peg to drop it. A disk can only sit on a larger one. Hints and undo mark the run as assisted.', '点击一根柱子拿起最上面的圆盘，再点另一根柱子放下。圆盘只能放在更大的盘上。使用提示或撤销后，这次不计成绩。', 'Bir çubuğa tıklayıp en üstteki diski kaldır, sonra bırakacağın çubuğa tıkla. Disk yalnızca daha büyük bir diskin üstüne konabilir. İpucu ve geri alma denemeyi yardımlı sayar.')}</p>
        <div className="setup">
          <h3>{t('New tower', '新的塔', 'Yeni kule')}</h3>
          <Pick id="hn-n" label={t('Disks', '圆盘数', 'Disk')} value={size} onChange={setSize} options={[3, 4, 5, 6, 7, 8].map(n => ({ value: n, label: t(`${n} disks · minimum ${minimum(n)} moves`, `${n}个盘 · 最少${minimum(n)}步`, `${n} disk · en az ${minimum(n)} hamle`) }))} />
          <button type="button" id="hn-new" className="btn primary" onClick={() => restart(size)}>{t('Start', '开始', 'Başla')}</button>
        </div>
      </aside>
    </div>
  );
}
