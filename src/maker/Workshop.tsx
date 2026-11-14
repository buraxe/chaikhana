import './workshop.css';
import { lazy, Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { pname, useLang, useT } from '../core/i18n';
import { loadJSON, saveJSON } from '../core/storage';
import { activeOf, useData } from '../core/store';
import { community } from './community';
import { canon, txt, validate, type GameDef } from './engine';
import { EXAMPLES } from './examples';
import { MaterialsEditor } from './MaterialsEditor';
import { Player } from './Player';
import { decodeGame, encodeGame, shareLink } from './share';

// Blockly is large, so the block editor loads only when its tab is opened.
const BlockEditor = lazy(() => import('./BlockEditor'));
export const MINE = 'gp.workshop.mine';

const BLANK: GameDef = {
  format: 'chaikhana-game', version: 1, id: 'my-game', kind: 'game', name: 'My game',
  players: { min: 2, max: 2 },
  board: { w: 5, h: 5, checker: true },
  pieces: { stone: { name: { en: 'Stone', zh: '棋子', tr: 'Taş' }, shape: 'disc' } },
  rules: [{ on: 'click', when: { op: 'empty', cell: { op: 'get', name: 'cell' } }, do: [{ op: 'place', piece: 'stone', cell: { op: 'get', name: 'cell' } }, { op: 'if', test: { op: 'line', cell: { op: 'get', name: 'cell' }, n: 4 }, then: [{ op: 'win' }] }] }],
};
const BLANK_WORDS: GameDef = {
  format: 'chaikhana-game', version: 1, id: 'my-words', kind: 'puzzle', name: 'My word puzzle',
  players: { min: 1, max: 1 },
  words: { list: ['kalem', 'kitap', 'araba', 'deniz', 'güneş'], length: 5, rows: 6, locale: 'tr' },
  rules: [
    { on: 'start', do: [{ op: 'pickWord' }] },
    { on: 'word', when: { op: 'eq', a: { op: 'len', text: { op: 'get', name: 'guess' } }, b: { op: 'wordLen' } }, do: [
      { op: 'addGuess', text: { op: 'get', name: 'guess' } },
      { op: 'if', test: { op: 'eq', a: { op: 'get', name: 'guess' }, b: { op: 'secret' } }, then: [{ op: 'win' }], else: [{ op: 'if', test: { op: 'ge', a: { op: 'guesses' }, b: 6 }, then: [{ op: 'lose' }] }] },
    ] },
  ],
};

export function Workshop({ incoming }: { incoming?: string }) {
  const t = useT(), lang = useLang(), me = activeOf(useData());
  const [mine, setMine] = useState<GameDef[]>(() => loadJSON<GameDef[]>(MINE, []));
  const all = useMemo(() => [...EXAMPLES, ...mine], [mine]);
  const [defId, setDefId] = useState(() => loadJSON<string>('gp.workshop.pick', EXAMPLES[0].id));
  const def = all.find(d => d.id === defId) ?? EXAMPLES[0];
  const isMine = mine.some(d => d.id === def.id);
  const [tab, setTab] = useState<'play' | 'blocks' | 'rules' | 'json'>('play');
  const [src, setSrc] = useState('');
  const [errs, setErrs] = useState<string[]>([]);
  const [note, setNote] = useState('');
  const [focus, setFocus] = useState<{ rule: number; paths: string[] } | null>(null);
  const [link, setLink] = useState('');
  const [paste, setPaste] = useState('');
  const [shareNote, setShareNote] = useState('');
  const [author, setAuthor] = useState(() => loadJSON<string>('gp.workshop.author', '') || pname(me, lang));
  const [blurb, setBlurb] = useState('');
  const [pubNote, setPubNote] = useState<{ text: string; id?: string } | null>(null);

  useEffect(() => { saveJSON(MINE, mine); }, [mine]);
  useEffect(() => { saveJSON('gp.workshop.pick', def.id); }, [def.id]);
  useEffect(() => { saveJSON('gp.workshop.author', author); }, [author]);
  useEffect(() => { setSrc(JSON.stringify(def, null, 2)); setErrs([]); setNote(''); setLink(''); setPubNote(null); }, [def]);

  /** A shared game: add it to the player's games and open it. */
  const adopt = (d: GameDef) => {
    const id = d.id.startsWith('ex-') ? d.id.replace(/^ex-/, 'shared-') : d.id;
    const exists = mine.find(x => x.id === id);
    const fresh: GameDef = exists && canon(exists) !== canon({ ...d, id }) ? { ...d, id: id + '-' + Date.now().toString(36) } : { ...d, id };
    setMine(m => [...m.filter(x => x.id !== fresh.id), fresh]);
    setDefId(fresh.id);
    setTab('play');
    setShareNote(t(`“${txt(fresh.name, 'en')}” was added to your games.`, `“${txt(fresh.name, 'zh')}”已加入你的游戏。`, `“${txt(fresh.name, 'tr')}” oyunlarına eklendi.`));
  };
  const took = useRef(false);
  useEffect(() => {
    if (!incoming || took.current) return;
    took.current = true;
    decodeGame(incoming).then(adopt, e => setShareNote(t('This link does not hold a game: ', '这个链接里没有游戏：', 'Bu linkte oyun yok: ') + (e as Error).message));
    try { history.replaceState(null, '', '#workshop'); } catch { /* the address stays as it was */ }
  }, [incoming]); // eslint-disable-line

  const load = (save: boolean) => {
    let parsed: unknown;
    try { parsed = JSON.parse(src); } catch (e) { setErrs([t('This is not valid JSON: ', '这不是有效的JSON：', 'Bu geçerli bir JSON değil: ') + (e as Error).message]); return; }
    const problems = validate(parsed, lang);
    setErrs(problems);
    if (problems.length) return;
    let d = parsed as GameDef;
    const fromExample = EXAMPLES.some(e => e.id === d.id);
    if (save || fromExample || isMine) {
      if (fromExample) d = { ...d, id: d.id.replace(/^ex-/, 'my-') + '-' + Date.now().toString(36) };
      setMine(m => [...m.filter(x => x.id !== d.id), d]);
      setNote(t('Saved to your games on this device.', '已保存到本设备上的“我的游戏”。', 'Bu cihazdaki oyunlarına kaydedildi.'));
    }
    setDefId(d.id);
    setTab('play');
  };
  /** Saves an edited game; an example is saved as the player's own copy. */
  const saveDef = (edited: GameDef) => {
    let d: GameDef = edited;
    if (!isMine) d = { ...d, id: def.id.replace(/^ex-/, 'my-') + '-' + Date.now().toString(36), name: typeof d.name === 'string' ? d.name + ' *' : { ...d.name, en: d.name.en + ' *', ...(d.name.zh ? { zh: d.name.zh + ' *' } : {}), ...(d.name.tr ? { tr: d.name.tr + ' *' } : {}) } };
    setMine(m => [...m.filter(x => x.id !== d.id), d]);
    setDefId(d.id);
    setTab('play');
  };
  const newFrom = (tpl: GameDef, name: string) => { const d: GameDef = { ...structuredClone(tpl), id: 'my-' + Date.now().toString(36), name }; setMine(m => [...m, d]); setDefId(d.id); setTab('rules'); };
  const remove = () => { setMine(m => m.filter(x => x.id !== def.id)); setDefId(EXAMPLES[0].id); };
  const copy = () => { navigator.clipboard?.writeText(src).then(() => setNote(t('Copied.', '已复制。', 'Kopyalandı.')), () => setNote(t('Select the text and copy it by hand.', '请手动选择并复制。', 'Metni seçip elle kopyala.'))); };
  const openRule = (rule: number, paths: string[] = []) => { setFocus({ rule, paths: ['r' + rule, ...paths.map(p => `r${rule}.${p}`)] }); setTab('blocks'); };
  const share = async () => {
    try { setLink(shareLink(await encodeGame(def))); setShareNote(''); }
    catch { setShareNote(t('This browser cannot make share codes.', '此浏览器无法生成分享码。', 'Bu tarayıcı paylaşım kodu oluşturamıyor.')); }
  };
  const copyLink = () => { navigator.clipboard?.writeText(link).then(() => setShareNote(t('Link copied.', '链接已复制。', 'Link kopyalandı.')), () => setShareNote(t('Select the link and copy it by hand.', '请手动选择并复制链接。', 'Linki seçip elle kopyala.'))); };
  const importCode = () => { decodeGame(paste).then(d => { setPaste(''); adopt(d); }, e => setShareNote(t('Not a game code: ', '不是游戏码：', 'Oyun kodu değil: ') + (e as Error).message)); };
  const publish = async () => {
    try {
      const e = await community().publish(def, { author, note: blurb });
      setPubNote({ id: e.id, text: community().shared
        ? t('Published: everyone can find it under “From you”.', '已发布：大家都能在“你们的作品”中找到它。', 'Yayınlandı: herkes “Sizden gelenler”de bulabilir.')
        : t('Published on this device. Once the site has its server, published games reach everyone.', '已在本设备上发布。网站接入服务器后，发布的游戏会对所有人可见。', 'Bu cihazda yayınlandı. Site sunucusuna kavuşunca yayınlanan oyunlar herkese ulaşacak.') });
    } catch (e) { setPubNote({ text: t('Could not publish: ', '无法发布：', 'Yayınlanamadı: ') + (e as Error).message }); }
  };

  const side = (
    <>
      <div className="setup">
        <h3>{t('Share', '分享', 'Paylaş')}</h3>
        <button type="button" className="btn" id="wk-share" onClick={share}>{t('Make a share link', '生成分享链接', 'Paylaşım linki oluştur')}</button>
        {link && <>
          <input className="wk-linkbox" id="wk-link" readOnly value={link} onFocus={e => e.target.select()} aria-label={t('Share link', '分享链接', 'Paylaşım linki')} />
          <button type="button" className="btn sm" id="wk-copylink" onClick={copyLink}>{t('Copy', '复制', 'Kopyala')}</button>
          <p className="muted small">{t('Anyone who opens the link gets this game in their Workshop. The link opens the public site.', '打开链接的人会在自己的工坊里得到这个游戏。链接指向公开网站。', 'Linki açan herkes bu oyunu kendi Atölyesine alır. Link herkese açık siteyi açar.')}</p>
        </>}
        <label className="wk-f"><span>{t('Got a code or link? Paste it here', '有分享码或链接？粘贴到这里', 'Kod ya da link mi geldi? Buraya yapıştır')}</span>
          <input id="wk-paste" value={paste} onChange={e => setPaste(e.target.value)} placeholder="workshop-g-…" /></label>
        <button type="button" className="btn sm" id="wk-import" disabled={paste.trim().length < 8} onClick={importCode}>{t('Add the game', '添加游戏', 'Oyunu ekle')}</button>
        {shareNote && <p className="muted small" role="status">{shareNote}</p>}
      </div>
      <div className="setup">
        <h3>{t('Publish', '发布', 'Yayınla')}</h3>
        {isMine ? <>
          <label className="wk-f"><span>{t('Made by', '作者', 'Yapan')}</span><input id="wk-author" value={author} maxLength={40} onChange={e => setAuthor(e.target.value)} /></label>
          <label className="wk-f"><span>{t('A line for players (optional)', '给玩家的一句话（可选）', 'Oyunculara bir cümle (isteğe bağlı)')}</span><input id="wk-blurb" value={blurb} maxLength={140} onChange={e => setBlurb(e.target.value)} /></label>
          <button type="button" className="btn primary" id="wk-publish" disabled={!def.rules.length || !author.trim()} onClick={publish}>{t('Publish to “From you”', '发布到“你们的作品”', '“Sizden gelenler”e gönder')}</button>
          {pubNote && <p className="muted small" role="status">{pubNote.text} {pubNote.id && <a href={'#community-' + pubNote.id}>{t('Open', '打开', 'Aç')}</a>}</p>}
        </> : <p className="muted small">{t('Examples cannot be published. Change something and save it, and the copy becomes yours.', '示例不能发布。修改并保存后，副本就归你了。', 'Örnekler yayınlanamaz. Bir şeyi değiştirip kaydedince kopya senin olur.')}</p>}
      </div>
    </>
  );

  return (
    <>
      <header className="page-head">
        <h1>{t('Workshop', '工坊', 'Atölye')}</h1>
        <p className="lede">{t('Make your own games and puzzles. Set out the materials (a board you paint, pieces, cards, dice, counters, a word list), then build the rules from blocks: “when this happens, if that holds, do these”. Try it at once against the computer or a friend, then share or publish it.',
          '制作你自己的游戏和谜题。先准备材料（可以绘制的棋盘、棋子、纸牌、骰子、计数器、词表），再用积木搭建规则：“当……发生时，如果……，就做……”。马上和电脑或朋友试玩，然后分享或发布。',
          'Kendi oyunlarını ve bulmacalarını yap. Önce malzemeleri hazırla (boyayarak tasarladığın tahta, taşlar, kartlar, zar, sayaçlar, kelime listesi), sonra kuralları bloklarla kur: “şu olunca, şu doğruysa, şunları yap”. Hemen bilgisayara ya da bir arkadaşına karşı dene, sonra paylaş ya da yayınla.')}</p>
      </header>

      {shareNote && tab !== 'play' && <p className="wk-msg" role="status">{shareNote}</p>}
      <div className="wk-picker" role="list">
        {all.map(d => (
          <button key={d.id} type="button" role="listitem" id={'wk-pick-' + d.id} className={'wk-pick' + (d.id === def.id ? ' on' : '')} onClick={() => setDefId(d.id)}>
            <b>{txt(d.name, lang)}</b>
            <span>{mine.includes(d) ? t('Your game', '我的游戏', 'Senin oyunun') : t('Example', '示例', 'Örnek')} · {d.words ? t('words', '单词', 'kelime') : d.kind === 'puzzle' ? t('puzzle', '谜题', 'bulmaca') : `${d.players.min}–${d.players.max} ${t('players', '人', 'oyuncu')}`}</span>
          </button>
        ))}
        <button type="button" className="wk-pick new" id="wk-new" onClick={() => newFrom(BLANK, t('My game', '我的游戏', 'Oyunum'))}>
          <b>+ {t('New game', '新游戏', 'Yeni oyun')}</b><span>{t('A board and pieces to start from', '从棋盘和棋子开始', 'Tahta ve taşlarla başla')}</span>
        </button>
        <button type="button" className="wk-pick new" id="wk-new-words" onClick={() => newFrom(BLANK_WORDS, t('My word puzzle', '我的猜词游戏', 'Kelime bulmacam'))}>
          <b>+ {t('New word puzzle', '新猜词游戏', 'Yeni kelime bulmacası')}</b><span>{t('Your own list, Wordle style', '用你自己的词表，Wordle 玩法', 'Kendi listen, Wordle usulü')}</span>
        </button>
      </div>

      <div className="seg wk-tabs" role="tablist">
        {([['play', t('Play', '试玩', 'Oyna')], ['blocks', t('Blocks', '积木', 'Bloklar')], ['rules', t('Materials', '材料', 'Malzemeler')], ['json', 'JSON']] as const).map(([k, l]) => (
          <button key={k} type="button" role="tab" id={'wk-tab-' + k} aria-selected={tab === k} className={tab === k ? 'on' : ''} onClick={() => setTab(k)}>{l}</button>
        ))}
      </div>

      {tab === 'play' && <Player def={def} testing onOpenRule={openRule} side={side} />}

      {tab === 'blocks' && (
        <Suspense fallback={<p className="muted">{t('Loading the block editor…', '正在加载积木编辑器…', 'Blok düzenleyici yükleniyor…')}</p>}>
          <BlockEditor def={def} onApply={rules => saveDef({ ...def, rules })} focus={focus} />
        </Suspense>
      )}

      {tab === 'rules' && <MaterialsEditor key={def.id + canon(def)} def={def} onSave={saveDef} />}

      {tab === 'json' && (
        <div className="wk-json">
          <textarea id="wk-src" value={src} onChange={e => setSrc(e.target.value)} spellCheck={false} aria-label={t('Game definition', '游戏定义', 'Oyun tanımı')} />
          <div className="tools">
            <button type="button" className="btn primary" id="wk-load" onClick={() => load(false)}>{t('Check and play', '检查并试玩', 'Kontrol et ve oyna')}</button>
            <button type="button" className="btn" id="wk-save" onClick={() => load(true)}>{t('Save as my game', '保存为我的游戏', 'Oyunum olarak kaydet')}</button>
            <button type="button" className="btn" id="wk-copy" onClick={copy}>{t('Copy', '复制', 'Kopyala')}</button>
            {isMine && <button type="button" className="btn danger" id="wk-delete" onClick={remove}>{t('Delete', '删除', 'Sil')}</button>}
          </div>
          {note && <p className="muted small" role="status">{note}</p>}
          {errs.length > 0 && <ul className="wk-errs" role="alert">{errs.slice(0, 12).map((e, i) => <li key={i}>{e}</li>)}</ul>}
        </div>
      )}
    </>
  );
}
