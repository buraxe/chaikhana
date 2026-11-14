import './lights-out.css';
import { useEffect, useMemo, useRef, useState } from 'react';
import { sfx } from '../../core/sound';
import { loadJSON, saveJSON } from '../../core/storage';
import { getData, noteStarted, recordResult } from '../../core/store';
import { fmtTime, Pick } from '../../ui/bits';
import { useT } from '../../core/i18n';
import { press, scramble, solve } from './rules';

interface Saved { n: number; cells: number[]; start: number[]; presses: number; elapsed: number; assisted: boolean; recorded: boolean; best: number }

function fresh(n: number): Saved {
  const cells = scramble(n, Math.random);
  return { n, cells, start: cells, presses: 0, elapsed: 0, assisted: false, recorded: false, best: solve(n, cells)!.reduce((a, v) => a + v, 0) };
}

export default function LightsOut() {
  const t = useT();
  const [g, setG] = useState<Saved>(() => loadJSON<Saved | null>('gp.lights', null) ?? fresh(5));
  const [size, setSize] = useState(g.n);
  const [hint, setHint] = useState(-1);
  const [cursor, setCursor] = useState(-1);
  const recordedRef = useRef(g.recorded);
  const done = g.cells.every(v => v === 0);
  const solution = useMemo(() => (done ? null : solve(g.n, g.cells)), [g.cells, g.n, done]);
  const left = solution ? solution.reduce((a, v) => a + v, 0) : 0;

  useEffect(() => { saveJSON('gp.lights', g); }, [g]);
  useEffect(() => {
    if (done || g.presses === 0) return;
    const t = setInterval(() => { if (!document.hidden) setG(s => ({ ...s, elapsed: s.elapsed + 1000 })); }, 1000);
    return () => clearInterval(t);
  }, [done, g.presses]);

  const tap = (i: number) => {
    sfx('click');
    if (done) return;
    if (g.presses === 0) noteStarted('lights-off');
    const cells = press(g.cells, g.n, i), next = { ...g, cells, presses: g.presses + 1 };
    setHint(-1);
    if (cells.every(v => v === 0) && !recordedRef.current) {
      recordedRef.current = true; next.recorded = true;
      if (!g.assisted) recordResult(getData().activeId, 'lights-off', { result: 'win', ms: g.elapsed,
        label: `${g.n}×${g.n} · ${next.presses} presses${next.presses === g.best ? ' · minimum' : ''}`, bestKey: `${g.n}×${g.n}` });
    }
    setG(next);
  };
  const restart = (n: number) => { const f = fresh(n); recordedRef.current = false; setG(f); setHint(-1); setCursor(-1); };
  const retry = () => { recordedRef.current = false; setG({ ...g, cells: g.start, presses: 0, elapsed: 0, recorded: false }); setHint(-1); };
  const onKey = (e: React.KeyboardEvent) => {
    const d = ({ ArrowUp: -g.n, ArrowDown: g.n, ArrowLeft: -1, ArrowRight: 1 } as Record<string, number>)[e.key];
    if (d) {
      e.preventDefault();
      const cur = cursor < 0 ? 0 : cursor, x = cur % g.n;
      if ((d === -1 && x === 0) || (d === 1 && x === g.n - 1)) return;
      if (cur + d >= 0 && cur + d < g.n * g.n) setCursor(cur + d);
    } else if (cursor >= 0 && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); tap(cursor); }
  };
  const lit = g.cells.reduce((a, v) => a + v, 0);
  return (
    <div className="play">
      <div className="play-main">
        <div className="statline">
          <span role="status" aria-live="polite">{done ? t('All lights are off.', '所有灯都关了。', 'Bütün ışıklar söndü.') : t(`${lit} ${lit === 1 ? 'light' : 'lights'} on. Can be finished in ${left} more ${left === 1 ? 'press' : 'presses'}.`, `还有${lit}盏灯亮着，最少再按${left}次就能完成。`, `${lit} ışık yanıyor. ${left} basışta daha bitirilebilir.`)}</span>
          <span className="num">{t(`${g.presses} presses`, `已按${g.presses}次`, `${g.presses} basış`)}</span>
          <span className="num">{fmtTime(g.elapsed)}</span>
        </div>
        <div className="lo-grid" style={{ ['--n' as string]: g.n }} role="grid" tabIndex={0} onKeyDown={onKey}
          aria-label={t(`Lights off ${g.n} by ${g.n}. Arrow keys move, Enter presses.`, `关灯游戏 ${g.n}×${g.n}。方向键移动，回车按灯。`, `Işıkları Söndür ${g.n}×${g.n}. Ok tuşları taşır, Enter basar.`)}>
          {g.cells.map((v, i) => (
            <button key={i} type="button" role="gridcell" tabIndex={-1} className={'lo-cell' + (v ? ' on' : '') + (i === hint ? ' hint' : '') + (i === cursor ? ' cur' : '')}
              aria-label={t(`Row ${Math.floor(i / g.n) + 1}, column ${(i % g.n) + 1}, ${v ? 'on' : 'off'}`, `第${Math.floor(i / g.n) + 1}行第${(i % g.n) + 1}列，${v ? '亮' : '灭'}`, `Satır ${Math.floor(i / g.n) + 1}, sütun ${(i % g.n) + 1}, ${v ? 'açık' : 'kapalı'}`)} aria-pressed={!!v}
              onClick={() => { setCursor(i); tap(i); }} disabled={done} />
          ))}
        </div>
      </div>
      <aside className="play-side">
        {done && (
          <div className="result" role="status">
            <h3>{g.assisted ? t('Solved with hints', '在提示下完成', 'İpuçlarıyla çözüldü') : t('Solved', '完成', 'Çözüldü')}</h3>
            <p className="num big">{t(`${g.presses} presses`, `${g.presses}次`, `${g.presses} basış`)}</p>
            <p className="muted">{t(`The shortest solution was ${g.best}.`, `最短解法是${g.best}次。`, `En kısa çözüm ${g.best} basıştı.`)} {g.assisted ? t('Hints were used, so this run is not recorded.', '用了提示，这次不计成绩。', 'İpucu kullanıldı; bu deneme kaydedilmedi.') : fmtTime(g.elapsed)}</p>
            <button type="button" id="lo-again" className="btn primary" onClick={() => restart(g.n)}>{t('New puzzle', '新题目', 'Yeni bulmaca')}</button>
          </div>
        )}
        <div className="tools">
          <button type="button" id="lo-hint" className="btn" disabled={done || !solution} onClick={() => { setHint(solution!.indexOf(1)); setG({ ...g, assisted: true }); }}>{t('Hint', '提示', 'İpucu')}</button>
          <button type="button" id="lo-retry" className="btn" disabled={g.presses === 0} onClick={retry}>{t('Restart this puzzle', '重新开始本题', 'Bu bulmacayı baştan başlat')}</button>
        </div>
        {hint >= 0 && <p className="hint">{t('Press the outlined light. It is part of the shortest remaining solution.', '按下框出的灯，它属于剩余的最短解法。', 'İşaretli ışığa bas. Kalan en kısa çözümün bir parçası.')}</p>}
        <p className="muted small">{t('Pressing a light switches it and the lights above, below and beside it. Order does not matter, and pressing a light twice undoes it.', '按下一盏灯，它和上下左右的灯都会切换。顺序无关，同一盏灯按两次等于没按。', 'Bir ışığa basmak onu ve üstündeki, altındaki, yanlarındaki ışıkları değiştirir. Sıra önemli değildir; bir ışığa iki kez basmak etkisini geri alır.')}</p>
        <div className="setup">
          <h3>{t('New puzzle', '新题目', 'Yeni bulmaca')}</h3>
          <Pick id="lo-n" label={t('Grid', '尺寸', 'Izgara')} value={size} onChange={setSize} options={[3, 4, 5, 6, 7].map(n => ({ value: n, label: `${n}×${n}` }))} />
          <button type="button" id="lo-new" className="btn primary" onClick={() => restart(size)}>{t('Generate', '生成', 'Üret')}</button>
          <p className="muted small">{t('Every puzzle is built by pressing random lights on a dark board, so it always has a solution.', '每道题都是在全黑的棋盘上随机按灯生成的，所以一定有解。', 'Her bulmaca karanlık bir tahtada rastgele ışıklara basılarak kurulur, yani her zaman çözümü vardır.')}</p>
        </div>
      </aside>
    </div>
  );
}
