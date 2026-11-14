import './Library.css';
import { useMemo, useState } from 'react';
import { CATALOGUE } from '../core/catalogue';
import { CATEGORY_LABEL, type Category } from '../core/game';
import { useLang, useT, pick as tri } from '../core/i18n';
import { activeOf, useData } from '../core/store';
import { Pick } from './bits';
import { Masthead } from './Masthead';
import { Classifieds, PaperSection, Tile } from './Tile';

export function Library({ title, categories }: { title: string; categories: Category[] }) {
  const me = activeOf(useData()), t = useT(), lang = useLang();
  const [q, setQ] = useState('');
  const [cat, setCat] = useState<'all' | Category>('all');
  const [depth, setDepth] = useState(0);
  const [players, setPlayers] = useState('any');
  const [time, setTime] = useState('any');
  const [trad, setTrad] = useState('any');
  const [dim, setDim] = useState('any');
  const [onlyPlayable, setOnlyPlayable] = useState(false);

  const list = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return CATALOGUE.filter(g => categories.includes(g.category)
      && (cat === 'all' || g.category === cat)
      && (!needle || g.name.toLowerCase().includes(needle) || g.zh.includes(needle) || (g.tr ?? '').toLocaleLowerCase('tr').includes(needle))
      && (!depth || g.depth === depth)
      && (players === 'any' || (players === 'solo' ? g.players[1] === 1 : players === 'multi' ? g.players[1] > 1 : g.players[1] >= 3))
      && (time === 'any' || (time === 'short' ? g.minutes <= 10 : time === 'mid' ? g.minutes > 10 && g.minutes <= 20 : g.minutes > 20))
      && (trad === 'any' || g.tradition === trad)
      && (dim === 'any' || g.dim === dim)
      && (!onlyPlayable || g.status === 'playable'))
      .sort((a, b) => Number(b.status === 'playable') - Number(a.status === 'playable'));
  }, [q, cat, depth, players, time, trad, dim, onlyPlayable, categories]);

  const shownCats = categories.filter(c => list.some(g => g.category === c));
  const nPlay = list.filter(g => g.status === 'playable').length, nPlan = list.length - nPlay;
  const any = t('Any', '不限', 'Hepsi');
  return (
    <article className="paper">
      <Masthead small edition={t(`${title} supplement`, `${title}副刊`, `${title} eki`)} />
      <header className="page-head supp-head">
        <h1>{title}</h1>
        <p className="lede">{t(`${nPlay} playable, ${nPlan} planned. Planned games show the phase they are scheduled for.`, `${nPlay}款可玩，${nPlan}款计划中。计划中的游戏标注了预定推出的阶段。`, `${nPlay} oynanabilir, ${nPlan} planlı. Planlı oyunlar hangi aşamaya alındıklarını gösterir.`)}</p>
      </header>
      <form className="filters index-box" onSubmit={e => e.preventDefault()} role="search">
        <p className="index-flag">{t('Index', '索引', 'Fihrist')}</p>
        <label className="field grow" htmlFor="lib-q"><span className="field-label">{t('Search', '搜索', 'Ara')}</span>
          <input id="lib-q" type="search" value={q} onChange={e => setQ(e.target.value)} placeholder={t('Game name', '游戏名称', 'Oyun adı')} /></label>
        <Pick id="lib-cat" label={t('Type', '类型', 'Tür')} value={cat} onChange={setCat}
          options={[{ value: 'all', label: t('All types', '全部类型', 'Bütün türler') }, ...categories.map(c => ({ value: c, label: tri(CATEGORY_LABEL[c], lang) }))]} />
        <Pick id="lib-depth" label={t('Difficulty', '难度', 'Zorluk')} value={depth} onChange={setDepth}
          options={[{ value: 0, label: any }, { value: 1, label: t('Casual', '轻松', 'Hafif') }, { value: 2, label: t('Moderate', '适中', 'Orta') }, { value: 3, label: t('Deep', '烧脑', 'Derin') }]} />
        <Pick id="lib-players" label={t('Players', '人数', 'Oyuncu')} value={players} onChange={setPlayers}
          options={[{ value: 'any', label: any }, { value: 'solo', label: t('Single-player only', '仅单人', 'Yalnızca tek kişilik') }, { value: 'multi', label: t('Multiplayer', '多人', 'Çok oyunculu') }, { value: 'group', label: t('3 or more', '3人以上', '3 ya da daha fazla') }]} />
        <Pick id="lib-time" label={t('Playing time', '时长', 'Oyun süresi')} value={time} onChange={setTime}
          options={[{ value: 'any', label: any }, { value: 'short', label: t('10 min or less', '10分钟以内', '10 dk ya da az') }, { value: 'mid', label: t('11–20 min', '11–20分钟', '11–20 dk') }, { value: 'long', label: t('Over 20 min', '20分钟以上', '20 dk’dan fazla') }]} />
        <Pick id="lib-trad" label={t('Origin', '类别', 'Köken')} value={trad} onChange={setTrad}
          options={[{ value: 'any', label: any }, { value: 'traditional', label: t('Traditional', '传统', 'Geleneksel') }, { value: 'modern', label: t('Modern', '现代', 'Modern') }]} />
        <Pick id="lib-dim" label={t('View', '视图', 'Görünüm')} value={dim} onChange={setDim}
          options={[{ value: 'any', label: any }, { value: '2D', label: '2D' }, { value: '3D', label: '3D' }]} />
        <label className="check" htmlFor="lib-playable"><input id="lib-playable" type="checkbox" checked={onlyPlayable} onChange={e => setOnlyPlayable(e.target.checked)} /> {t('Playable now', '只看可玩', 'Şimdi oynanabilir')}</label>
      </form>
      {shownCats.length === 0 && <p className="empty">{t('No game matches these filters. Clear the search or widen a filter.', '没有符合条件的游戏。请清空搜索或放宽筛选条件。', 'Bu filtrelere uyan oyun yok. Aramayı temizle ya da bir filtreyi genişlet.')}</p>}
      {shownCats.map(c => (
        <PaperSection key={c} title={tri(CATEGORY_LABEL[c], lang)}>
          {list.some(g => g.category === c && g.status === 'playable') && <div className="cols lib-cols">{list.filter(g => g.category === c && g.status === 'playable').map(g => <Tile key={g.id} g={g} fav={me.favorites.includes(g.id)} />)}</div>}
          <Classifieds games={list.filter(g => g.category === c && g.status !== 'playable')} />
        </PaperSection>
      ))}
    </article>
  );
}
