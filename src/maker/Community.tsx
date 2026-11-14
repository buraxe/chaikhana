import './workshop.css';
import { useEffect, useMemo, useState } from 'react';
import { locale, useLang, useT } from '../core/i18n';
import { loadJSON, saveJSON } from '../core/storage';
import { community, onBackendChange, type CommunityEntry } from './community';
import { txt, type GameDef } from './engine';
import { Player } from './Player';

const MINE = 'gp.workshop.mine';
type Kind = 'all' | 'game' | 'puzzle' | 'words';
const kindOf = (d: GameDef): Exclude<Kind, 'all'> => (d.words ? 'words' : d.kind === 'puzzle' || d.players.max === 1 ? 'puzzle' : 'game');

/** "From you": games players made in the Workshop and published. */
export function Community({ id }: { id?: string }) {
  const t = useT(), lang = useLang();
  const [entries, setEntries] = useState<CommunityEntry[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [q, setQ] = useState('');
  const [kind, setKind] = useState<Kind>('all');
  const [gen, setGen] = useState(0);
  useEffect(() => onBackendChange(() => setGen(g => g + 1)), []);
  useEffect(() => {
    let live = true;
    setFailed(false);
    community().list().then(e => { if (live) setEntries(e); }, () => { if (live) { setEntries([]); setFailed(true); } });
    return () => { live = false; };
  }, [gen, id]);

  const shown = useMemo(() => (entries ?? []).filter(e => (kind === 'all' || kindOf(e.def) === kind)
    && (!q.trim() || (txt(e.def.name, lang) + ' ' + e.author + ' ' + (e.note ?? '')).toLocaleLowerCase().includes(q.trim().toLocaleLowerCase()))), [entries, q, kind, lang]);
  const kinds: [Kind, string][] = [['all', t('All', '全部', 'Hepsi')], ['game', t('Games', '游戏', 'Oyunlar')], ['puzzle', t('Puzzles', '谜题', 'Bulmacalar')], ['words', t('Word puzzles', '猜词', 'Kelime')]];
  const date = (ms: number) => new Date(ms).toLocaleDateString(locale(lang), { day: 'numeric', month: 'short', year: 'numeric' });

  if (id) {
    const e = entries?.find(x => x.id === id);
    if (!entries) return <p className="muted">{t('Loading…', '加载中…', 'Yükleniyor…')}</p>;
    if (!e) return (
      <>
        <header className="page-head"><h1>{t('Not found', '找不到', 'Bulunamadı')}</h1></header>
        <p>{t('This game is not here (any more).', '这个游戏不在这里（或已被删除）。', 'Bu oyun burada yok (artık).')} <a href="#community">{t('Back to the list', '返回列表', 'Listeye dön')}</a></p>
      </>
    );
    const copyToWorkshop = () => {
      const mine = loadJSON<GameDef[]>(MINE, []), copyId = 'copy-' + e.id + '-' + Date.now().toString(36);
      saveJSON(MINE, [...mine, { ...e.def, id: copyId }]);
      saveJSON('gp.workshop.pick', copyId);
      location.hash = 'workshop';
    };
    return (
      <>
        <header className="page-head">
          <p className="eyebrow"><a href="#community">← {t('From you', '你们的作品', 'Sizden gelenler')}</a></p>
          <h1>{txt(e.def.name, lang)}</h1>
          <p className="lede">{t('by', '作者：', 'yapan:')} <b>{e.author}</b> · {date(e.publishedAt)}{e.note ? ` · ${e.note}` : ''}</p>
        </header>
        <Player def={e.def} onFinish={() => { community().recordPlay?.(e.id).catch(() => undefined); }} side={
          <div className="setup">
            <h3>{t('Like it?', '喜欢吗？', 'Beğendin mi?')}</h3>
            <button type="button" className="btn" id="cm-copy" onClick={copyToWorkshop}>{t('Open a copy in the Workshop', '在工坊中打开副本', 'Atölyede bir kopyasını aç')}</button>
            <p className="muted small">{t('See how it is made, change the rules, make your own version.', '看看它是怎么做的，修改规则，做出你自己的版本。', 'Nasıl yapıldığına bak, kuralları değiştir, kendi sürümünü yap.')}</p>
          </div>
        } />
      </>
    );
  }

  return (
    <>
      <header className="page-head">
        <h1>{t('From you', '你们的作品', 'Sizden gelenler')}</h1>
        <p className="lede">{t('Games and puzzles players made in the Workshop: board games, card games, logic puzzles and word puzzles. Play them here, or open a copy and make your own version.',
          '玩家在工坊里做的游戏和谜题：棋类、纸牌、逻辑谜题和猜词。可以在这里玩，也可以打开副本做自己的版本。',
          'Oyuncuların Atölyede yaptığı oyunlar ve bulmacalar: tahta oyunları, kart oyunları, mantık ve kelime bulmacaları. Burada oyna ya da bir kopyasını açıp kendi sürümünü yap.')}</p>
      </header>
      {!community().shared && <p className="wk-notice">{t('For now, published games are kept on this device only; when the site gets its server, they will be shown to everyone.', '目前已发布的游戏只保存在本设备上；网站接入服务器后，会向所有人展示。', 'Şimdilik yayınlanan oyunlar yalnızca bu cihazda tutuluyor; site sunucusuna kavuşunca herkese gösterilecek.')}</p>}
      <div className="wk-cfilter">
        <input type="search" id="cm-q" value={q} onChange={e => setQ(e.target.value)} placeholder={t('Search by name or maker', '按名称或作者搜索', 'Ada ya da yapana göre ara')} aria-label={t('Search', '搜索', 'Ara')} />
        <div className="seg" role="group">{kinds.map(([k, l]) => <button key={k} type="button" id={'cm-k-' + k} className={kind === k ? 'on' : ''} aria-pressed={kind === k} onClick={() => setKind(k)}>{l}</button>)}</div>
      </div>
      {failed && <p className="wk-errs">{t('The list could not be loaded. Try again later.', '列表无法加载，请稍后再试。', 'Liste yüklenemedi. Sonra yeniden dene.')}</p>}
      {entries && !shown.length && (
        <div className="wk-empty">
          <p>{entries.length ? t('Nothing matches.', '没有匹配的结果。', 'Eşleşen yok.') : t('Nothing here yet. Be the first: make a game in the Workshop and publish it.', '这里还什么都没有。做第一个吧：在工坊里做一个游戏并发布。', 'Henüz bir şey yok. İlk sen ol: Atölyede bir oyun yap ve yayınla.')}</p>
          <a className="btn primary" href="#workshop" id="cm-go">{t('Go to the Workshop', '去工坊', 'Atölyeye git')}</a>
        </div>
      )}
      <div className="wk-cgrid">
        {shown.map(e => (
          <a key={e.id} className="wk-ccard" href={'#community-' + e.id} id={'cm-' + e.id}>
            <span className="wk-ckind">{kinds.find(k => k[0] === kindOf(e.def))![1]}{kindOf(e.def) === 'game' ? ` · ${e.def.players.min}–${e.def.players.max}` : ''}</span>
            <b>{txt(e.def.name, lang)}</b>
            {(e.note || e.def.about) && <span className="wk-cnote">{e.note || txt(e.def.about, lang)}</span>}
            <span className="muted small">{e.author} · {date(e.publishedAt)}{e.plays ? ` · ${t(`${e.plays} plays`, `${e.plays} 次`, `${e.plays} oynanış`)}` : ''}</span>
          </a>
        ))}
      </div>
    </>
  );
}
