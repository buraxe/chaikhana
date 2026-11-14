import './Learn.css';
import { gameName, metaOf } from '../core/catalogue';
import { useLang, useT, pick as tri } from '../core/i18n';
import { LESSON_DIGEST, LESSON_FILES, useLesson } from '../core/lessons';
import { Section } from './bits';

const List = ({ items }: { items: string[] }) => <ul className="prose-list">{items.map(x => <li key={x}>{x}</li>)}</ul>;

export function Learn({ id }: { id: string }) {
  const t = useT(), lang = useLang(), lesson = useLesson(id);
  if (LESSON_FILES[id] && !lesson) return <p className="empty">{t('Loading…', '加载中…', 'Yükleniyor…')}</p>;
  if (!lesson) {
    return (
      <>
        <header className="page-head">
          <h1>{t('Learn & Practice', '学习与练习', 'Öğren ve Çalış')}</h1>
          <p className="lede">{t('Rules, history and strategy for every playable game. A lesson is added with each game.', '每款可玩游戏的规则、历史和技巧。每上线一款游戏，就会增加一篇课程。', 'Oynanabilir her oyun için kurallar, tarihçe ve strateji. Her oyunla birlikte bir ders eklenir.')}</p>
        </header>
        <div className="tiles">
          {Object.entries(LESSON_DIGEST).map(([gid, l]) => {
            const name = tri(l.names, lang);
            const glyph = [...name][0];
            return (
              <a key={gid} className="tile playable" href={'#learn-' + gid}>
                <span className={'tile-glyph' + (lang === 'zh' ? ' cjk' : '')} aria-hidden="true">{glyph}</span>
                <span className="tile-body"><span className="tile-name">{name}</span><span className="tile-meta">{(l[lang] ?? l.en).s}</span></span>
                <span className="tile-status playable">{t('Read', '阅读', 'Oku')}</span>
              </a>
            );
          })}
        </div>
      </>
    );
  }
  const n = lesson.names, text = lesson[lang] ?? lesson.en, meta = metaOf(id);
  return (
    <article className="lesson">
      <header className="page-head game-head">
        <div>
          <p className="eyebrow"><a href="#learn">{t('Learn & Practice', '学习与练习', 'Öğren ve Çalış')}</a></p>
          <h1>{tri(n, lang)}{n.pinyin && meta?.category === 'chinese' && <span className="pinyin"> {n.pinyin}</span>}</h1>
          <p className="lede">{text.summary}</p>
        </div>
        <a className="btn primary" href={'#' + id}>{t('Play', '开始游戏', 'Oyna')}{meta ? ' · ' + gameName(meta, lang) : ''}</a>
      </header>
      {lang === 'zh' && (n.trad || n.pinyin) && (
        <dl className="facts wide names">
          <div><dt>简体</dt><dd className="cjk-big">{n.zh}</dd></div>
          {n.trad && n.trad !== n.zh && <div><dt>繁体</dt><dd className="cjk-big">{n.trad}</dd></div>}
          {n.pinyin && <div><dt>拼音</dt><dd>{n.pinyin}</dd></div>}
        </dl>
      )}
      <Section title={t('Background', '背景', 'Arka plan')}><p className="prose">{text.history}</p></Section>
      {text.culture && <Section title={t('Cultural significance', '文化意义', 'Kültürel önemi')}><p className="prose">{text.culture}</p></Section>}
      <Section title={t('Rules', '规则', 'Kurallar')}><List items={text.rules} /></Section>
      <Section title={t('First strategies', '入门技巧', 'İlk stratejiler')}><List items={text.basics} /></Section>
      <Section title={t('Going further', '进阶', 'Daha ileri')}><List items={text.advanced} /></Section>
      <Section title={t('Common mistakes', '常见错误', 'Sık yapılan hatalar')}><List items={text.mistakes} /></Section>
    </article>
  );
}
