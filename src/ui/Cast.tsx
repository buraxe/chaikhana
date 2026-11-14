import { useEffect, useState, useSyncExternalStore } from 'react';
import { byLevel, CAST, castBio, castLine, castName, castTitle, charFor, levelOf, setChar, setCurrentGame, unlockedUpTo, type Event } from '../core/cast';
import { useLang, useT } from '../core/i18n';
import { activeOf, onNote, useData } from '../core/store';

/** A regular's face, drawn small enough to sit in a button. */
export function Face({ level, size = 40, mood }: { level: number; size?: number; mood?: 'happy' | 'sad' }) {
  const { skin, hair, cloth, style, mo, specs } = (CAST[level] ?? CAST[0]).look;
  const mouth = mood === 'sad' ? 'M16 28 q4 -3 8 0' : 'M16 26.5 q4 3.5 8 0';
  return (
    <svg className="face" viewBox="0 0 40 40" width={size} height={size} aria-hidden="true">
      <circle cx="20" cy="20" r="20" className="face-bg" />
      <path d={`M6 40 q14 -14 28 0`} fill={cloth} />
      {style === 'auntie' && <path d="M8 22 q0 -16 12 -16 q12 0 12 16 q-2 6 -4 8 h-16 q-2 -2 -4 -8z" fill={hair} />}
      <ellipse cx="20" cy="20" rx="9" ry="10.5" fill={skin} />
      {style === 'boy' && <path d="M11 17 q1 -9 9 -9 q8 0 9 9 q-3 -4 -9 -4 q-6 0 -9 4z" fill={hair} />}
      {style === 'moustache' && <><path d="M11.5 16 q1 -7 8.5 -7 q7.5 0 8.5 7 q-2 -3 -8.5 -3 q-6.5 0 -8.5 3z" fill={hair} /><path d="M14.5 24 q5.5 -3 11 0 q-2 2 -5.5 1 q-3.5 1 -5.5 -1z" fill={hair} /></>}
      {style === 'glasses' && <><path d="M12 14 q2 -5 8 -5 q6 0 8 5 q-3 -2 -8 -2 q-5 0 -8 2z" fill={hair} /><circle cx="16.3" cy="19" r="2.8" className="face-glass" /><circle cx="23.7" cy="19" r="2.8" className="face-glass" /><path d="M19.1 19 h1.8" className="face-glass" /></>}
      {style === 'beard' && <><path d="M11.5 15 q1 -6 8.5 -6 q7.5 0 8.5 6 q-2 -2 -8.5 -2 q-6.5 0 -8.5 2z" fill={hair} /><path d="M11.5 21 q1 11 8.5 11 q7.5 0 8.5 -11 q-2 5 -8.5 5 q-6.5 0 -8.5 -5z" fill={hair} /></>}
      {style === 'auntie' && <path d="M11 15 q9 -6 18 0 q-3 -7 -9 -7 q-6 0 -9 7z" fill={hair} />}
      {style === 'ponytail' && <><path d="M11 18 q0 -10 9 -10 q9 0 9 10 q-2 -5 -9 -5 q-7 0 -9 5z" fill={hair} /><path d="M27 11 q8 2 6 13 q-3 -4 -5 -9z" fill={hair} /><circle cx="27.5" cy="11.5" r="1.4" fill={cloth} /></>}
      {style === 'cap' && <><path d="M11.5 18 q0 -3 1 -4 h15 q1 1 1 4z" fill={hair} /><path d="M11 15 q1 -8 9 -8 q8 0 9 8z" fill={cloth} /><path d="M20 14.5 h12 q1 0 1 1 h-13z" fill={cloth} /><circle cx="20" cy="7.6" r="0.9" fill="#fff" /></>}
      {style === 'beret' && <><path d="M11 20 q-1 -8 4 -10 M29 20 q1 -8 -4 -10" stroke={hair} strokeWidth="3" fill="none" /><ellipse cx="19" cy="10" rx="10" ry="3.6" fill={cloth} transform="rotate(-8 19 10)" /><circle cx="18" cy="6.4" r="1" fill={cloth} /></>}
      {style === 'bun' && <><path d="M11 17 q0 -9 9 -9 q9 0 9 9 q-2 -4 -9 -4 q-7 0 -9 4z" fill={hair} /><circle cx="20" cy="6.8" r="3.6" fill={hair} /></>}
      {style === 'bald' && <><path d="M11.2 21 q-0.5 -5 2 -7" stroke={hair} strokeWidth="2.4" fill="none" strokeLinecap="round" /><path d="M28.8 21 q0.5 -5 -2 -7" stroke={hair} strokeWidth="2.4" fill="none" strokeLinecap="round" /><ellipse cx="17" cy="12.5" rx="2.2" ry="1" fill="#fff" opacity="0.35" /></>}
      {style === 'chef' && <><path d="M13 13 h14 v-3 h-14z" fill="#fbfaf6" stroke="#d8d2c4" strokeWidth="0.4" /><circle cx="15" cy="7.5" r="3.4" fill="#fbfaf6" /><circle cx="20" cy="5.8" r="3.8" fill="#fbfaf6" /><circle cx="25" cy="7.5" r="3.4" fill="#fbfaf6" /><path d="M11.5 19 q0 -4 2 -6 M28.5 19 q0 -4 -2 -6" stroke={hair} strokeWidth="2" fill="none" /></>}
      {style === 'cowboy' && <><path d="M12 17 q0 -3 2 -4 h12 q2 1 2 4z" fill={hair} /><ellipse cx="20" cy="12.6" rx="15" ry="2.6" fill="#7a5230" /><path d="M13.5 12 q0 -7 6.5 -7 q6.5 0 6.5 7z" fill="#8b5e34" /><path d="M13.5 11 h13" stroke="#3a2210" strokeWidth="1.1" /></>}
      {mo && <path d="M14.5 24 q5.5 -3 11 0 q-2 2 -5.5 1 q-3.5 1 -5.5 -1z" fill={hair === '#f0f0f0' ? '#ddd' : hair} />}
      {specs && <><circle cx="16.3" cy="19" r="2.8" className="face-glass" /><circle cx="23.7" cy="19" r="2.8" className="face-glass" /><path d="M19.1 19 h1.8" className="face-glass" /></>}
      <circle cx="16.3" cy="19.2" r="1.1" className="face-eye" /><circle cx="23.7" cy="19.2" r="1.1" className="face-eye" />
      {style !== 'beard' && <path d={mouth} className="face-mouth" />}
    </svg>
  );
}

/**
 * Picks the computer opponent: fifteen regulars at five strengths. Later strengths open as you
 * beat earlier ones; the chosen face for each strength is remembered per game.
 */
export function RivalPick({ id, game, value, onChange, levels, label }: {
  id: string; game: string; value: number; onChange: (v: number) => void; levels: { name: string; rating: number }[]; label?: string;
}) {
  const t = useT(), lang = useLang(), me = activeOf(useData());
  const open = unlockedUpTo(me.beaten?.[game]), beaten = me.beaten?.[game] ?? -1;
  const [, bump] = useState(0);
  const who = charFor(game, value);
  return (
    <div className="field rival-pick">
      <span className="field-label" id={id + '-l'}>{label ?? t('Opponent at the table', '对面坐的是', 'Masadaki rakip')}</span>
      <div className="rival-levels" role="radiogroup" aria-labelledby={id + '-l'}>
        {levels.map((l, lv) => {
          const locked = lv > open;
          return (
            <div key={lv} className={'rival-col' + (locked ? ' locked' : '') + (lv <= beaten ? ' beaten' : '')}>
              <span className="rival-r num">{l.rating}{lv <= beaten ? ' ★' : ''}</span>
              {byLevel(lv).map(w => (
                <button key={w} type="button" role="radio" id={w === lv ? `${id}-${lv}` : `${id}-c${w}`} aria-checked={value === lv && who === w} disabled={locked}
                  className={'rival' + (value === lv && who === w ? ' on' : '') + (locked ? ' locked' : '')}
                  title={locked ? t(`Beat a level-${lv} regular first`, `先打败上一级的常客`, `Önce bir alt seviyedeki birini yen`) : castName(w, lang)}
                  onClick={() => { setChar(game, w); bump(x => x + 1); onChange(lv); greetAgain(game, lv); }}>
                  <Face level={w} size={38} />
                  <span className="rival-flag" aria-hidden="true">{CAST[w].from}</span>
                  {locked && <span className="rival-lock" aria-hidden="true">🔒</span>}
                </button>
              ))}
            </div>
          );
        })}
      </div>
      <div className="rival-card" aria-live="polite">
        <b>{CAST[who].from} {castName(who, lang)}</b> <span className="muted">· {castTitle(who, lang)}</span>
        <p>{castBio(who, lang)}</p>
        {open < 4 && <p className="rival-next">{t(`Beat anyone in the ${levels[open].rating} column to open the next one.`, `打败${levels[open].rating}一列中的任何人，就能解锁下一列。`, `${levels[open].rating} sütunundaki herhangi birini yenersen sonraki sütun açılır.`)}</p>}
      </div>
    </div>
  );
}

// The opponent currently at the table, set by whichever game is open.
let rival: { game: string; level: number } | null = null;
const subs = new Set<() => void>();
/** A new face at the table says hello. */
function greetAgain(game: string, level: number) { rival = { game, level }; subs.forEach(f => f()); }
const setRivalNow = (r: typeof rival) => { if (r?.game === rival?.game && r?.level === rival?.level) return; rival = r; subs.forEach(f => f()); };
export function useRival(game: string, level: number | null) {
  setCurrentGame(game);
  useEffect(() => { setRivalNow(level == null ? null : { game, level }); }, [game, level]);
  useEffect(() => () => { setRivalNow(null); setCurrentGame(''); }, []);
}

/** The opponent's speech bubble above the board: a greeting, then a word after the result. */
export function TableTalk({ game }: { game: string }) {
  const lang = useLang();
  const r = useSyncExternalStore(f => { subs.add(f); return () => { subs.delete(f); }; }, () => rival);
  const [say, setSay] = useState<{ ev: Event; salt: number } | null>(null);
  useEffect(() => { if (r && r.game === game) setSay({ ev: 'greet', salt: Date.now() }); else setSay(null); }, [r, game]); // eslint-disable-line
  useEffect(() => onNote(n => {
    if (n.kind !== 'result' || n.game !== game || !rival || n.lvl == null) return;
    setSay({ ev: n.result === 'win' ? 'youWin' : n.result === 'loss' ? 'theyWin' : 'draw', salt: Date.now() });
  }), [game]);
  useEffect(() => { if (say?.ev !== 'greet') return; const id = setTimeout(() => setSay(null), 6000); return () => clearTimeout(id); }, [say]);
  if (!r || r.game !== game || !say) return null;
  const who = charFor(game, r.level);
  return (
    <div className={'table-talk ' + say.ev} role="status">
      <Face level={who} size={36} mood={say.ev === 'youWin' ? 'sad' : 'happy'} />
      <p><b>{CAST[who].from} {castName(who, lang)}</b><span>{castLine(who, say.ev as Exclude<Event, 'locked'>, lang, say.salt / 1000)}</span></p>
      <button type="button" className="tt-x" aria-label="×" onClick={() => setSay(null)}>×</button>
    </div>
  );
}
