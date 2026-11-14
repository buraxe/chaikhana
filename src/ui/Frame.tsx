import { lazy, Suspense, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react';

// The tutorial and its lesson load only when someone presses the button.
const Tour = lazy(() => import('./Tour'));
import { castName } from '../core/cast';
import { DUPLICATES, FRAME } from '../core/frame';
import { gameName, metaOf } from '../core/catalogue';
import { pname, useLang, useT, pick as tri } from '../core/i18n';
import { sfx } from '../core/sound';
import { onNote, setSound, useData, type Clip } from '../core/store';
import { LEAGUE_NAMES } from '../games/football/leagues';
import type { Lang } from '../core/store';

const HIDE_CSS = `${DUPLICATES.map(s => `.stage.framed ${s}`).join(',')}{display:none!important}`;
const find = (root: HTMLElement | null, sel?: string): HTMLButtonElement | null => {
  if (!root || !sel) return null;
  for (const s of sel.split(',')) { const el = root.querySelector<HTMLButtonElement>(s.trim()); if (el) return el; }
  return null;
};

/** The same toolbar over every game: restart, undo, hint, tutorial, rules, sound, focus. */
export function GameStage({ id, children }: { id: string; children: ReactNode }) {
  const t = useT(), sound = useData().sound !== false;
  const ref = useRef<HTMLDivElement>(null), map = FRAME[id] ?? {};
  const [state, setState] = useState({ undo: false, undoOn: false, hint: false, hintOn: false, again: false, fresh: false });
  const [ask, setAsk] = useState(false), [focus, setFocus] = useState(false), [tour, setTour] = useState(false);

  // Mirror the game's own buttons: shown when they exist, disabled when they are.
  useEffect(() => {
    const root = ref.current; if (!root) return;
    let raf = 0;
    const read = () => {
      raf = 0;
      const u = find(root, map.undo), h = find(root, map.hint), a = find(root, map.again), f = find(root, map.fresh);
      const next = { undo: !!u, undoOn: !!u && !u.disabled, hint: !!h, hintOn: !!h && !h.disabled, again: !!a, fresh: !!f };
      setState(s => (JSON.stringify(s) === JSON.stringify(next) ? s : next));
    };
    const mo = new MutationObserver(() => { if (!raf) raf = requestAnimationFrame(read); });
    mo.observe(root, { subtree: true, childList: true, attributes: true, attributeFilter: ['disabled'] });
    read();
    return () => { mo.disconnect(); cancelAnimationFrame(raf); };
  }, [id]); // eslint-disable-line

  useEffect(() => {
    if (!focus) return;
    const el = ref.current;
    el?.requestFullscreen?.().catch(() => { /* the frame may refuse; the CSS focus view still works */ });
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setFocus(false); };
    const onFs = () => { if (!document.fullscreenElement) setFocus(false); };
    window.addEventListener('keydown', onKey); document.addEventListener('fullscreenchange', onFs);
    return () => { window.removeEventListener('keydown', onKey); document.removeEventListener('fullscreenchange', onFs); if (document.fullscreenElement) void document.exitFullscreen().catch(() => {}); };
  }, [focus]);

  const press = (sel?: string) => { const b = find(ref.current, sel); if (b && !b.disabled) { b.click(); return true; } return false; };
  const restart = () => {
    setAsk(false);
    if (press(map.again)) return;
    press(map.fresh);
    // A game in progress asks to confirm in its own panel; the toolbar already asked.
    setTimeout(() => press(map.confirm), 30);
  };
  const canRestart = state.again || state.fresh;

  return (
    <div ref={ref} className={'stage framed' + (focus ? ' focus' : '')}>
      <style>{HIDE_CSS}</style>
      <div className="frame-bar" role="toolbar" aria-label={t('Game controls', '游戏控制', 'Oyun kontrolleri')}>
        {canRestart && (ask && !state.again ? (
          <span className="fb-ask">
            <span>{t('Start over?', '重新开始？', 'Baştan başlansın mı?')}</span>
            <button type="button" id="fr-restart-yes" className="fr-btn go" onClick={restart}>{t('Yes', '是', 'Evet')}</button>
            <button type="button" id="fr-restart-no" className="fr-btn" onClick={() => setAsk(false)}>{t('No', '否', 'Hayır')}</button>
          </span>
        ) : <FrBtn id="fr-restart" icon="↻" label={state.again ? t('Play again', '再来一局', 'Tekrar oyna') : t('Restart', '重新开始', 'Yeniden başlat')} onClick={() => (state.again ? restart() : setAsk(true))} hot={state.again} />)}
        {state.undo && <FrBtn id="fr-undo" icon="↶" label={t('Undo', '悔棋', 'Geri al')} disabled={!state.undoOn} onClick={() => press(map.undo)} />}
        {state.hint && <FrBtn id="fr-hint" icon="💡" label={t('Hint', '提示', 'İpucu')} disabled={!state.hintOn} onClick={() => press(map.hint)} />}
        <span className="fr-gap" />
        <FrBtn id="fr-tour" icon="🎓" label={t('Play the tutorial', '玩教程', 'Öğreticiyi oyna')} onClick={() => setTour(true)} />
        <a className="fr-btn" id="fr-rules" href={'#learn-' + id} title={t('Rules', '规则', 'Kurallar')}><span aria-hidden="true">📖</span><span className="fr-l">{t('Rules', '规则', 'Kurallar')}</span></a>
        <FrBtn id="fr-sound" icon={sound ? '🔊' : '🔇'} label={sound ? t('Sound on', '声音开', 'Ses açık') : t('Sound off', '声音关', 'Ses kapalı')} pressed={sound} onClick={() => setSound(!sound)} />
        <FrBtn id="fr-focus" icon={focus ? '✕' : '⛶'} label={focus ? t('Leave full screen', '退出全屏', 'Tam ekrandan çık') : t('Full screen', '全屏', 'Tam ekran')} pressed={focus} onClick={() => setFocus(!focus)} />
      </div>
      {children}
      {tour && <Suspense fallback={null}><Tour game={id} onClose={() => setTour(false)} /></Suspense>}
    </div>
  );
}
function FrBtn({ id, icon, label, onClick, disabled, pressed, hot }: { id: string; icon: string; label: string; onClick: () => void; disabled?: boolean; pressed?: boolean; hot?: boolean }) {
  return (
    <button type="button" id={id} className={'fr-btn' + (hot ? ' hot' : '') + (pressed ? ' on' : '')} title={label} aria-label={label} disabled={disabled} aria-pressed={pressed} onClick={() => { sfx('click'); onClick(); }}>
      <span aria-hidden="true">{icon}</span><span className="fr-l">{label}</span>
    </button>
  );
}


/** How a clipping's headline reads, in the paper's language. */
export function clipHeadline(c: Clip, lang: Lang, who: string): string {
  const g = c.game ? metaOf(c.game) : undefined, gn = g ? gameName(g, lang) : '';
  // Cup names are stored in English; show them in the paper's language.
  const lg = Object.values(LEAGUE_NAMES).find(l => l.name[0] === c.s);
  if (lg) c = { ...c, s: lang === 'zh' ? lg.name[1] : lang === 'tr' ? lg.name[2] : lg.name[0] };
  const T = (en: string, zh: string, tr: string) => (lang === 'zh' ? zh : lang === 'tr' ? tr : en);
  switch (c.k) {
    case 'beat': {
      const n = castName(c.n ?? c.lvl ?? 0, lang);
      return c.lvl === 4 ? T(`SENSATION! ${who} beats the legend ${n} at ${gn}`, `轰动！${who}在${gn}中击败传奇${n}`, `OLAY! ${who}, efsane ${n}’yı ${gn} masasında yendi`)
        : T(`${who} beats ${n} at ${gn}`, `${who}在${gn}中击败了${n}`, `${who}, ${gn} masasında ${n}’ı yendi`);
    }
    case 'first': return T(`${who}’s first win at ${gn}`, `${who}首次赢得${gn}`, `${who} ${gn}’da ilk zaferini aldı`);
    case 'seven': return T(`PERFECT! ${who} goes 7-0 in the ${c.s}`, `完美！${who}在${c.s}七战全胜`, `KUSURSUZ! ${who} ${c.s}’nde 7-0 yaptı`);
    case 'cup': return T(`${who} lifts the cup in the ${c.s}`, `${who}在${c.s}捧杯`, `${who} ${c.s}’nde kupayı kaldırdı`);
    case 'streak': return T(`${who} reads the Gazette ${c.n} days running`, `${who}连续${c.n}天读完棋报`, `${who} ${c.n} gündür Gazete’yi kaçırmıyor`);
    case 'issue': return T(`${who} finishes today’s whole issue`, `${who}完成了今天的整份报纸`, `${who} günün sayısını baştan sona bitirdi`);
    case 'tour': return T(`${c.s} wins the coffeehouse tournament`, `${c.s}赢得了茶馆锦标赛`, `Kahvehane turnuvasının şampiyonu: ${c.s}`);
  }
}

/** Small notices: tea earned and new clippings. */
export function Toasts() {
  const lang = useLang(), t = useT(), me = useData();
  const [items, setItems] = useState<{ id: number; node: ReactNode; kind: string }[]>([]);
  useEffect(() => onNote(n => {
    if (n.kind === 'result') { sfx(n.result === 'win' ? 'win' : n.result === 'loss' ? 'lose' : 'draw'); return; }
    const id = Math.random();
    const p = me.profiles.find(x => x.id === me.activeId);
    const node = n.kind === 'tea'
      ? <><b className="num">+{n.n}</b> 🍵 <span>{tri({ en: n.why[0], zh: n.why[1], tr: n.why[2] }, lang)}</span></>
      : <><span className="toast-k">{t('Clipping', '剪报', 'Kupür')}</span> {clipHeadline(n.clip, lang, p ? pname(p, lang) : '')}</>;
    if (n.kind === 'tea') setTimeout(() => sfx('tea'), 500);
    setItems(xs => [...xs.slice(-2), { id, node, kind: n.kind }]);
    setTimeout(() => setItems(xs => xs.filter(x => x.id !== id)), n.kind === 'clip' ? 5200 : 3200);
  }), [lang, me, t]);
  return <div className="toasts" aria-live="polite">{items.map(x => <div key={x.id} className={'toast ' + x.kind}>{x.node}</div>)}</div>;
}
