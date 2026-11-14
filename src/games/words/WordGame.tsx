import '../../maker/workshop.css';
import { useMemo, useState } from 'react';
import { useLang, useT } from '../../core/i18n';
import { loadJSON, saveJSON } from '../../core/storage';
import { activeOf, noteStarted, recordResult, useData } from '../../core/store';
import type { GameDef } from '../../maker/engine';
import { Player } from '../../maker/Player';
import { Seg } from '../../ui/bits';
import type { WLang } from './defs';

const NAMES: Record<WLang, string> = { tr: 'Türkçe', en: 'English', zh: '中文' };

/** A site word puzzle: a workshop game with a choice of puzzle language; every new game is a new puzzle. */
export function WordGame({ game, make, langs }: { game: string; make: (l: WLang) => GameDef; langs: WLang[] }) {
  const t = useT(), lang = useLang(), me = activeOf(useData());
  const [wl, setWl] = useState<WLang>(() => { const saved = loadJSON<WLang | null>(`gp.${game}.lang`, null); return saved && langs.includes(saved) ? saved : langs.includes(lang) ? lang : 'en'; });
  const def = useMemo(() => { noteStarted(game); return make(wl); }, [wl]); // eslint-disable-line
  const pick = (l: WLang) => { setWl(l); saveJSON(`gp.${game}.lang`, l); };
  return (
    <Player def={def}
      top={langs.length > 1 ? <Seg id={game + '-lang'} label={t('Puzzle language', '谜题语言', 'Bulmaca dili')} value={wl} onChange={pick} options={langs.map(l => ({ value: l, label: NAMES[l] }))} /> : undefined}
      onFinish={(st, ms) => recordResult(me.id, game, { result: st.over?.winner === 0 ? 'win' : 'loss', label: NAMES[wl], ms })} />
  );
}
