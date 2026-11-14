import { DEPTH_LABEL, gameName } from '../core/catalogue';
import { CATEGORY_LABEL, type GameMeta } from '../core/game';
import { useLang, useT, pick as tri } from '../core/i18n';
import { LESSON_DIGEST } from '../core/lessons';
import type { Lang } from '../core/store';

/** First sentence of the lesson summary, in the current language: the article's standfirst. */
export function blurbOf(id: string, lang: Lang) {
  const l = LESSON_DIGEST[id];
  return l ? (l[lang] ?? l.en).s : '';
}

/**
 * One game, set as a newspaper article: kicker, headline, a line of particulars, the
 * standfirst from its lesson, and a "Play" line. Planned games are set as classified ads.
 */
export function Tile({ g, fav, lead }: { g: GameMeta; fav?: boolean; lead?: boolean }) {
  const lang = useLang(), t = useT(), name = gameName(g, lang);
  const players = g.players[0] === g.players[1] ? t(`${g.players[0]} player`, `${g.players[0]}人`, `${g.players[0]} oyuncu`) : t(`${g.players[0]}–${g.players[1]} players`, `${g.players[0]}–${g.players[1]}人`, `${g.players[0]}–${g.players[1]} oyuncu`);
  const meta = `${players} · ${t(`${g.minutes} min`, `${g.minutes}分钟`, `${g.minutes} dk`)} · ${tri(DEPTH_LABEL[g.depth], lang)} · ${g.dim}`;
  if (g.status !== 'playable') {
    return (
      <div className="ad" aria-label={t(`${name}, planned for phase ${g.phase}`, `${name}，计划于第${g.phase}阶段推出`, `${name}, ${g.phase}. aşamaya planlı`)}>
        <span className="ad-name">{name}</span>
        <span className="ad-meta">{meta}</span>
        <span className="ad-when">{t(`Coming in phase ${g.phase}`, `第${g.phase}阶段推出`, `${g.phase}. aşamada geliyor`)}</span>
      </div>
    );
  }
  return (
    <a className={'story' + (lead ? ' lead' : '')} href={'#' + g.id}>
      <span className="story-kicker">{tri(CATEGORY_LABEL[g.category], lang)}{fav && <span className="fav" aria-label={t('favourite', '收藏', 'favori')}> ★</span>}</span>
      <span className="story-head">{name}</span>
      <span className="story-meta">{meta}</span>
      <span className="story-text">{blurbOf(g.id, lang)}</span>
      <span className="story-play">{t('Play', '开始', 'Oyna')} →</span>
    </a>
  );
}

/** Planned games grouped as a classifieds column. */
export function Classifieds({ games, title }: { games: GameMeta[]; title?: string }) {
  const t = useT();
  if (!games.length) return null;
  return (
    <section className="classifieds">
      <h3 className="cl-flag">{title ?? t('Classifieds · coming soon', '分类广告 · 即将推出', 'İlanlar · yakında')}</h3>
      <div className="ads">{games.map(g => <Tile key={g.id} g={g} />)}</div>
    </section>
  );
}

/** A newspaper section: a ruled flag with the section name, then columns. */
export function PaperSection({ title, note, children }: { title: string; note?: string; children: React.ReactNode }) {
  return (
    <section className="paper-sec">
      <header className="sec-flag"><h2>{title}</h2>{note && <span className="sec-note">{note}</span>}</header>
      {children}
    </section>
  );
}
