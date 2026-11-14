import { Component, Suspense, type ReactNode } from 'react';
import { DEPTH_LABEL, gameName, metaOf } from '../core/catalogue';
import { CATEGORY_LABEL } from '../core/game';
import { pname, trLabel, useLang, useT, pick as tri } from '../core/i18n';
import { bestLabel, SCREENS } from '../core/registry';
import { useLesson } from '../core/lessons';
import { activeOf, statsOf, toggleFavorite, useData } from '../core/store';
import { fmtBestKey, fmtTime, Section } from './bits';
import { RaceStage } from './RacePanel';
import { TableTalk } from './Cast';
import { GameStage } from './Frame';

class Boundary extends Component<{ children: ReactNode; msg: string }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() { return this.state.failed ? <p className="empty" role="alert">{this.props.msg}</p> : this.props.children; }
}

export function GamePage({ id, daily }: { id: string; daily: boolean }) {
  const me = activeOf(useData()), t = useT(), lang = useLang();
  const meta = metaOf(id)!, Screen = SCREENS[id], lesson = useLesson(id), s = statsOf(me, id);
  const fav = me.favorites.includes(id), name = gameName(meta, lang);
  const bests = Object.entries(s.best).sort();
  const museum = meta.category === 'chinese' && lesson;
  const text = lesson ? lesson[lang] ?? lesson.en : undefined;
  return (
    <>
      <header className="page-head game-head">
        <div>
          <p className="eyebrow">{tri(CATEGORY_LABEL[meta.category], lang)} · {tri(DEPTH_LABEL[meta.depth], lang)} · {meta.dim}</p>
          <h1>{name}{daily ? t(' · Daily', ' · 每日挑战', ' · Günlük') : ''}{lesson?.names.pinyin && meta.category === 'chinese' && <span className="pinyin"> {lesson.names.pinyin}</span>}</h1>
        </div>
        <div className="row">
          <button type="button" id="fav-toggle" className={'btn' + (fav ? ' on' : '')} aria-pressed={fav} onClick={() => toggleFavorite(id)}>{fav ? t('★ Favourite', '★ 已收藏', '★ Favori') : t('☆ Add to favourites', '☆ 收藏', '☆ Favorilere ekle')}</button>
        </div>
      </header>
      <GameStage id={id}>
      <TableTalk game={id} />
      <Boundary msg={t('This game stopped unexpectedly. Reload the page to continue; saved progress is kept.', '游戏意外中断。请刷新页面继续，已保存的进度不会丢失。', 'Bu oyun beklenmedik şekilde durdu. Devam etmek için sayfayı yenile; kayıtlı ilerleme korunur.')}>
        <Suspense fallback={<div className="game-loading" role="status">{t(`Loading ${name}…`, `正在加载${name}…`, `${name} yükleniyor…`)}</div>}>
          {daily ? <Screen daily /> : <RaceStage game={id}>{epoch => <Screen key={epoch} />}</RaceStage>}
        </Suspense>
      </Boundary>
      </GameStage>
      {museum && text && (
        <section className="museum" aria-label={t('About this puzzle', '关于这个谜题', 'Bu bulmaca hakkında')}>
          <dl className="museum-names">
            {lang === 'zh' ? (
              <>
                <div><dt>简体</dt><dd className="cjk-big">{lesson.names.zh}</dd></div>
                {lesson.names.trad && lesson.names.trad !== lesson.names.zh && <div><dt>繁体</dt><dd className="cjk-big">{lesson.names.trad}</dd></div>}
                <div><dt>拼音</dt><dd>{lesson.names.pinyin}</dd></div>
              </>
            ) : (
              <>
                <div><dt>{t('Name', '名字', 'Ad')}</dt><dd>{tri(lesson.names, lang)}</dd></div>
                <div><dt>{t('Pinyin', '拼音', 'Pinyin (Çince okunuş)')}</dt><dd>{lesson.names.pinyin}</dd></div>
              </>
            )}
          </dl>
          <div className="museum-text">
            <h2>{t('History', '历史', 'Tarihçe')}</h2>
            <p>{text.history}</p>
            {text.culture && <><h2>{t('Cultural significance', '文化意义', 'Kültürel önemi')}</h2><p>{text.culture}</p></>}
            <p><a href={'#learn-' + id}>{t('Rules and solving techniques', '规则与解法技巧', 'Kurallar ve çözüm teknikleri')} →</a></p>
          </div>
        </section>
      )}
      <Section title={t(`${pname(me, lang)}'s record`, `${pname(me, lang)}的战绩`, `${pname(me, lang)} – kayıtlar`)}>
        {s.played === 0 ? <p className="muted">{t('No finished games yet. Results appear here after your first one.', '还没有完成的对局。完成第一局后，成绩会显示在这里。', 'Henüz bitmiş oyun yok. Sonuçlar ilk oyunundan sonra burada görünür.')}</p> : (
          <dl className="facts wide">
            <div><dt>{t('Finished', '已完成', 'Biten')}</dt><dd className="num">{s.played}{s.started > s.played ? t(` of ${s.started} started`, ` / 开始 ${s.started}`, ` / ${s.started} başlanan`) : ''}</dd></div>
            {meta.players[1] > 1 && <div><dt>{t('Won · lost · drawn', '胜 · 负 · 和', 'Galibiyet · mağlubiyet · beraberlik')}</dt><dd className="num">{s.wins} · {s.losses} · {s.draws}</dd></div>}
            {meta.players[1] > 1 && <div><dt>{t(`${name} rating`, `${name}积分`, `${name} puanı`)}</dt><dd className="num">{s.rating}</dd></div>}
            {bests.map(([k, ms]) => <div key={k}><dt>{t('Best', '最佳', 'En iyi')} · {bestLabel(id, k, lang)}</dt><dd className="num">{fmtTime(ms)}</dd></div>)}
          </dl>
        )}
      </Section>
    </>
  );
}
