import './minesweeper.css';
import { useEffect, useRef, useState } from 'react';
import { sfx } from '../../core/sound';
import { loadJSON, saveJSON } from '../../core/storage';
import { getData, noteStarted, recordResult } from '../../core/store';
import { fmtTime, Pick, Seg } from '../../ui/bits';
import { trLabel, useLang, useT } from '../../core/i18n';
import { chord, newBoard, PRESETS, reveal, toggleFlag, type MState } from './rules';

type Preset = keyof typeof PRESETS | 'custom';
interface Saved { preset: Preset; st: MState; elapsed: number; custom: { w: number; h: number; density: number } }

export default function Minesweeper() {
  const t = useT(), lang = useLang();
  const saved = useRef(loadJSON<Saved | null>('gp.mines', null)).current;
  const [preset, setPreset] = useState<Preset>(saved?.preset ?? 'beginner');
  const [custom, setCustom] = useState(saved?.custom ?? { w: 12, h: 12, density: 15 });
  const dims = (p: Preset) => (p === 'custom'
    ? { w: custom.w, h: custom.h, mines: Math.max(1, Math.round((custom.w * custom.h * custom.density) / 100)) } : PRESETS[p]);
  const [st, setSt] = useState<MState>(() => saved?.st ?? newBoard(9, 9, 10));
  const [elapsed, setElapsed] = useState(saved?.elapsed ?? 0);
  const [flagMode, setFlagMode] = useState(false);
  const [cursor, setCursor] = useState(-1);
  const longPress = useRef<{ t: number; fired: boolean }>({ t: 0, fired: false });

  useEffect(() => { saveJSON('gp.mines', { preset, st, elapsed, custom } satisfies Saved); }, [preset, st, elapsed, custom]);
  useEffect(() => {
    if (st.status !== 'playing') return;
    const t = setInterval(() => { if (!document.hidden) setElapsed(e => e + 1000); }, 1000);
    return () => clearInterval(t);
  }, [st.status]);

  const label = preset === 'custom' ? `Custom ${st.w}×${st.h}, ${st.mines} mines` : PRESETS[preset].label;
  const commit = (next: MState) => {
    if (next === st) return;
    sfx(next.status === 'lost' ? 'boom' : next.flags !== st.flags ? 'flag' : 'reveal');
    if (st.status === 'ready' && next.status !== 'ready') noteStarted('minesweeper');
    setSt(next);
    if (next.status === 'won' || next.status === 'lost') {
      recordResult(getData().activeId, 'minesweeper', { result: next.status === 'won' ? 'win' : 'loss', label,
        ms: next.status === 'won' ? elapsed : undefined, bestKey: next.status === 'won' ? label : undefined });
    }
  };
  const act = (i: number, flag: boolean) => {
    if (st.status === 'won' || st.status === 'lost') return;
    if (flag) commit(toggleFlag(st, i));
    else if (st.cell[i] === 1) commit(chord(st, i));
    else commit(reveal(st, i));
  };
  const restart = (p: Preset = preset) => {
    const d = dims(p);
    setPreset(p); setSt(newBoard(d.w, d.h, d.mines)); setElapsed(0); setCursor(-1);
  };

  const onKey = (e: React.KeyboardEvent) => {
    const d = ({ ArrowUp: -st.w, ArrowDown: st.w, ArrowLeft: -1, ArrowRight: 1 } as Record<string, number>)[e.key];
    if (d) {
      e.preventDefault();
      const cur = cursor < 0 ? 0 : cursor, x = cur % st.w;
      if ((d === -1 && x === 0) || (d === 1 && x === st.w - 1)) return;
      if (cur + d >= 0 && cur + d < st.w * st.h) setCursor(cur + d);
    } else if (cursor >= 0 && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); act(cursor, false); }
    else if (cursor >= 0 && e.key.toLowerCase() === 'f') act(cursor, true);
  };

  const over = st.status === 'won' || st.status === 'lost';
  const status = st.status === 'won' ? t(`Cleared in ${fmtTime(elapsed)}`, `用时${fmtTime(elapsed)}完成`, `${fmtTime(elapsed)} sürede temizlendi`) : st.status === 'lost' ? t('A mine went off.', '踩到地雷了。', 'Bir mayın patladı.')
    : st.status === 'ready' ? t('Click any square to start. The first click is always safe.', '点击任意格子开始，第一下一定安全。', 'Başlamak için herhangi bir kareye tıkla. İlk tıklama her zaman güvenlidir.') : flagMode ? t('Flag mode: taps place flags.', '插旗模式：点击插旗。', 'Bayrak modu: dokunuşlar bayrak koyar.') : t('Dig mode', '挖掘模式', 'Kazma modu');
  return (
    <div className="play">
      <div className="play-main">
        <div className="statline">
          <span role="status" aria-live="polite">{status}</span>
          <span className="num" aria-label={t('Mines left', '剩余地雷', 'Kalan mayın')}>⚑ {st.mines - st.flags}</span>
          <span className="num" aria-label={t('Elapsed time', '用时', 'Geçen süre')}>{fmtTime(elapsed)}</span>
          <button type="button" id="ms-restart" className="btn sm" onClick={() => restart()}>{t('New board', '新棋盘', 'Yeni tarla')}</button>
        </div>
        <div className="ms-scroll">
          <div className={'ms-grid' + (over ? ' over' : '')} style={{ ['--w' as string]: st.w }} role="grid" tabIndex={0} onKeyDown={onKey}
            aria-label={t(`Minefield ${st.w} by ${st.h}. Arrow keys move, Enter digs, F flags.`, `雷区 ${st.w}×${st.h}。方向键移动，回车挖开，F插旗。`, `Mayın tarlası ${st.w}×${st.h}. Ok tuşları taşır, Enter kazar, F bayrak koyar.`)}>
            {st.cell.map((c, i) => {
              const open = c === 1, mine = !!st.mine[i];
              const showMine = over && mine && c !== 2;
              const wrongFlag = st.status === 'lost' && c === 2 && !mine;
              const cls = ['ms-cell', open || showMine ? 'open' : '', c === 2 ? 'flag' : '', i === st.exploded ? 'boom' : '',
                wrongFlag ? 'wrong' : '', open && !mine && st.adj[i] ? 'n' + st.adj[i] : '', i === cursor ? 'cur' : ''].join(' ');
              return (
                <button key={i} type="button" role="gridcell" tabIndex={-1} className={cls}
                  aria-label={c === 2 ? t('flagged', '已插旗', 'bayraklı') : open ? (mine ? t('mine', '地雷', 'mayın') : st.adj[i] ? `${st.adj[i]}` : t('empty', '空', 'boş')) : t('hidden', '未打开', 'kapalı')}
                  onClick={() => { if (longPress.current.fired) { longPress.current.fired = false; return; } setCursor(i); act(i, flagMode); }}
                  onContextMenu={e => { e.preventDefault(); act(i, true); }}
                  onPointerDown={e => {
                    if (e.pointerType !== 'touch') return;
                    longPress.current.t = window.setTimeout(() => { longPress.current.fired = true; act(i, !flagMode); navigator.vibrate?.(15); }, 380);
                  }}
                  onPointerUp={() => clearTimeout(longPress.current.t)} onPointerLeave={() => clearTimeout(longPress.current.t)}>
                  {c === 2 ? (wrongFlag ? '✕' : '⚑') : showMine || (open && mine) ? '✹' : open && st.adj[i] ? st.adj[i] : ''}
                </button>
              );
            })}
          </div>
        </div>
      </div>
      <aside className="play-side">
        {over && (
          <div className="result" role="status">
            <h3>{st.status === 'won' ? t('Field cleared', '雷区已清空', 'Tarla temizlendi') : t('Boom', '爆炸了', 'Bum')}</h3>
            {st.status === 'won' && <p className="num big">{fmtTime(elapsed)}</p>}
            <p className="muted">{trLabel(label, lang)}</p>
            <button type="button" id="ms-again" className="btn primary" onClick={() => restart()}>{t('Play again', '再来一局', 'Tekrar oyna')}</button>
          </div>
        )}
        <Seg id="ms-mode" label={t('Tap action', '点击操作', 'Dokunma eylemi')} value={flagMode ? 'flag' : 'dig'} onChange={v => setFlagMode(v === 'flag')}
          options={[{ value: 'dig', label: t('Dig', '挖掘', 'Kaz') }, { value: 'flag', label: t('⚑ Flag', '⚑ 插旗', '⚑ Bayrak') }]} />
        <p className="muted small">{t('Right-click or long-press to flag. Click a number whose mines are all flagged to open its other neighbours. Keys: arrows, Enter, F.', '右键或长按插旗。数字周围的雷都插好旗后，点击这个数字可打开其余相邻格子。键盘：方向键、回车、F。', 'Bayrak için sağ tıkla ya da uzun bas. Mayınlarının hepsi bayraklı bir sayıya tıklarsan diğer komşuları açılır. Tuşlar: oklar, Enter, F.')}</p>
        <div className="setup">
          <h3>{t('Board', '棋盘', 'Tahta')}</h3>
          <Pick id="ms-preset" label={t('Level', '难度', 'Seviye')} value={preset} onChange={p => restart(p)}
            options={[...Object.entries(PRESETS).map(([k, p]) => ({ value: k as Preset, label: `${trLabel(p.label, lang)} · ${p.w}×${p.h}, ${t(`${p.mines} mines`, `${p.mines}颗雷`, `${p.mines} mayın`)}` })), { value: 'custom' as Preset, label: t('Custom', '自定义', 'Özel') }]} />
          {preset === 'custom' && (
            <>
              <div className="row">
                <label className="field" htmlFor="ms-w"><span className="field-label">{t('Width', '宽', 'Genişlik')}</span>
                  <input id="ms-w" type="number" min={5} max={30} value={custom.w} onChange={e => setCustom({ ...custom, w: Math.max(5, Math.min(30, +e.target.value || 5)) })} /></label>
                <label className="field" htmlFor="ms-h"><span className="field-label">{t('Height', '高', 'Yükseklik')}</span>
                  <input id="ms-h" type="number" min={5} max={24} value={custom.h} onChange={e => setCustom({ ...custom, h: Math.max(5, Math.min(24, +e.target.value || 5)) })} /></label>
              </div>
              <label className="field" htmlFor="ms-d"><span className="field-label">{t(`Mine density: ${custom.density}% · ${dims('custom').mines} mines`, `地雷密度：${custom.density}% · ${dims('custom').mines}颗雷`, `Mayın yoğunluğu: %${custom.density} · ${dims('custom').mines} mayın`)}</span>
                <input id="ms-d" type="range" min={8} max={30} value={custom.density} onChange={e => setCustom({ ...custom, density: +e.target.value })} /></label>
              <button type="button" id="ms-custom" className="btn primary" onClick={() => restart('custom')}>{t('Start custom board', '开始自定义棋盘', 'Özel tarlayı başlat')}</button>
            </>
          )}
        </div>
      </aside>
    </div>
  );
}
