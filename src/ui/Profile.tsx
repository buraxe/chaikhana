import './Profile.css';
import { useState } from 'react';
import { CATALOGUE, gameName, metaOf } from '../core/catalogue';
import { pname, trLabel, useLang, useT, locale } from '../core/i18n';
import {
  activeOf, AVATAR_COLORS, createProfile, dailyStreak, deleteProfile, editProfile, GLYPHS, setActive, setLang, setTheme,
  statsOf, useData, type Profile, type Theme,
} from '../core/store';
import { Avatar, fmtTime, Section, Seg } from './bits';
import { historyLabel } from '../core/registry';

const ACH_TR: Record<string, [string, string]> = {
  'First solve': ['İlk çözüm', 'Herhangi bir Sudoku bitir'],
  'Clean nine': ['Temiz dokuzluk', 'İpucusuz bir 9×9 Sudoku çöz'],
  'Sixteen': ['On altılık', 'Bir 16×16 Sudoku çöz'],
  'Three in a row': ['Üç gün üst üste', 'Günlük bulmacayı üç gün üst üste çöz'],
  'Full week': ['Koca hafta', 'Günlük bulmacayı yedi gün üst üste çöz'],
  'First five': ['İlk beşli', 'Bir Gomoku oyunu kazan'],
  'Past the middle': ['Ortayı geçtin', 'Gomoku’da Orta seviye bilgisayarı yen'],
  'Top board': ['Baş masa', 'Gomoku’da Uzman bilgisayarı yen'],
  'Field cleared': ['Tarla temiz', 'Orta ya da Uzman bir mayın tarlasını temizle'],
  'Shortest path': ['En kısa yol', '6 ya da daha fazla diskli bir kuleyi en az hamleyle taşı'],
  'Four down': ['Dördü tamam', 'Dört Bağla’da Uzman bilgisayarı yen'],
  'Lights out': ['Işıklar söndü', '5×5 Işıkları Söndür’ü en az basışla çöz'],
  'Escape': ['Kaçış', 'Klasik Huarong Dao diziliminde Cao Cao’yu kurtar'],
  'Tavla match': ['Tavla maçı', 'Bir tavla maçı kazan'],
  'Okey!': ['Okey!', 'Bir Okey oyunu kazan'],
  'Crowned': ['Dama çıktı', 'Dama’da İleri seviye bilgisayarı yen'],
  'Clearance': ['Masayı temizle', 'Bilardoda bilgisayara karşı bir üçgen kazan'],
  '101': ['101', 'Bir 101 Okey oyunu kazan'],
  'Cubed': ['Küp ustası', 'Tamamen karışık bir 3×3 Rubik Küpü’nü yardımsız çöz'],
  'Seven boards': ['Yedi tahta', 'Beş tangram siluetini tamamla'],
};
function achievements(p: Profile): [string, string, string, string, boolean][] {
  const s = statsOf(p, 'sudoku'), g = statsOf(p, 'gomoku'), won = (name: string) => g.history.some(h => h.result === 'win' && h.label.includes(name + ' AI'));
  const hist = (id: string) => statsOf(p, id).history;
  return [
    ['First solve', '初次解题', 'Finish any Sudoku', '完成任意一道数独', s.played > 0],
    ['Clean nine', '干净利落', 'Solve a 9×9 Sudoku without hints', '不用提示完成9×9数独', Object.keys(s.best).some(k => k.startsWith('9-') || k.startsWith('9×9'))],
    ['Sixteen', '十六宫', 'Solve a 16×16 Sudoku', '完成16×16数独', s.history.some(h => h.label.startsWith('16×16'))],
    ['Three in a row', '连续三天', 'Solve the daily three days running', '连续三天完成每日挑战', dailyStreak(p) >= 3],
    ['Full week', '整整一周', 'Solve the daily seven days running', '连续七天完成每日挑战', dailyStreak(p) >= 7],
    ['First five', '初连五子', 'Win a game of Gomoku', '赢一局五子棋', g.wins > 0],
    ['Past the middle', '更上一层', 'Beat the Intermediate AI at Gomoku', '五子棋战胜中级电脑', won('Intermediate')],
    ['Top board', '棋逢对手', 'Beat the Expert AI at Gomoku', '五子棋战胜专家电脑', won('Expert')],
    ['Field cleared', '扫清雷区', 'Clear an Intermediate or Expert minefield', '完成中级或专家扫雷', hist('minesweeper').some(h => h.result === 'win' && /^(Intermediate|Expert)/.test(h.label))],
    ['Shortest path', '最短路径', 'Move a tower of 6 or more disks in the minimum moves', '用最少步数移动6个或更多盘的汉诺塔', hist('hanoi').some(h => h.label.includes('optimal') && parseInt(h.label) >= 6)],
    ['Four down', '四子连珠', 'Beat the Expert AI at Connect Four', '四子棋战胜专家电脑', hist('connect-four').some(h => h.result === 'win' && h.label.includes('Expert AI'))],
    ['Lights out', '一灯不留', 'Solve a 5×5 Lights Out in the fewest presses', '用最少次数完成5×5关灯游戏', hist('lights-out').some(h => h.label.startsWith('5×5') && h.label.includes('minimum'))],
    ['Escape', '义释曹操', 'Free Cao Cao in the classic Huarong Dao layout', '在经典布局“横刀立马”中救出曹操', hist('huarong').some(h => h.label.startsWith('classic'))],
    ['Tavla match', '双陆赛', 'Win a Tavla match', '赢得一场双陆棋比赛', hist('tavla').some(h => h.result === 'win')],
    ['Okey!', 'Okey!', 'Win a game of Okey', '赢得一场 Okey', hist('okey').some(h => h.result === 'win')],
    ['Crowned', '加冕', 'Beat the Advanced AI at Dama', '在土耳其跳棋中战胜高级电脑', hist('dama').some(h => h.result === 'win' && /(Advanced|Expert) AI/.test(h.label))],
    ['Clearance', '一杆清台', 'Win a rack of billiards against the computer', '在台球中战胜电脑赢下一局', hist('billiards').some(h => h.result === 'win' && h.label.includes(' AI'))],
    ['101', '101', 'Win a game of 101 Okey', '赢得一场 101 Okey', hist('okey-101').some(h => h.result === 'win')],
    ['Cubed', '魔方达人', "Solve a fully scrambled 3×3 Rubik's Cube without help", '不借助提示复原完全打乱的三阶魔方', hist('rubik').some(h => h.label.startsWith('3×3'))],
    ['Seven boards', '七巧玲珑', 'Complete five tangram silhouettes', '完成五个七巧板剪影', new Set(hist('tangram').map(h => h.label)).size >= 5],
  ];
}

export function ProfilePage() {
  const data = useData(), me = activeOf(data), t = useT(), lang = useLang();
  const [name, setName] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);
  const games = CATALOGUE.filter(g => g.status === 'playable');
  const total = games.reduce((n, g) => n + statsOf(me, g.id).played, 0);
  const history = games.flatMap(g => statsOf(me, g.id).history.map(h => ({ ...h, gid: g.id, game: gameName(g, lang) }))).sort((a, b) => b.t - a.t).slice(0, 15);
  const add = (e: React.FormEvent) => { e.preventDefault(); if (name.trim()) { createProfile(name); setName(''); } };
  const streak = dailyStreak(me);

  return (
    <>
      <header className="page-head game-head">
        <div className="who big"><Avatar p={me} size={56} />
          <div><h1>{pname(me, lang)}</h1><p className="muted">{me.guest ? t('Guest profile', '游客档案', 'Misafir profili') : t('Local profile', '本地档案', 'Yerel profil')}{me.country ? ` · ${me.country}` : ''} · {t('since', '创建于', 'başlangıç')} {new Date(me.created).toLocaleDateString(locale(lang))}</p></div>
        </div>
      </header>
      <p className="lede">{t('Profiles live in this browser, with no password and no server. Registered online accounts come with the online phase and will be able to adopt a local profile.',
        '档案保存在这个浏览器里，不需要密码，也不经过服务器。联网账号会在联网阶段推出，届时可以接管本地档案。', 'Profiller bu tarayıcıda durur; şifre ve sunucu yoktur. Kayıtlı çevrimiçi hesaplar çevrimiçi aşamayla gelecek ve yerel bir profili devralabilecek.')}</p>

      <Section title={t('Settings', '设置', 'Ayarlar')}>
        <div className="form">
          <label className="field" htmlFor="pf-name"><span className="field-label">{t('Name', '名字', 'Ad')}</span>
            <input id="pf-name" value={me.name} maxLength={20} onChange={e => editProfile(me.id, { name: e.target.value })} /></label>
          <label className="field" htmlFor="pf-country"><span className="field-label">{t('Country', '国家或地区', 'Ülke')}</span>
            <input id="pf-country" value={me.country} maxLength={30} onChange={e => editProfile(me.id, { country: e.target.value })} placeholder={t('Optional', '选填', 'İsteğe bağlı')} /></label>
          <div className="field"><span className="field-label">{t('Symbol', '标志', 'Simge')}</span>
            <div className="swatches">{GLYPHS.map((gl, i) => (
              <button key={gl} type="button" id={'pf-g-' + i} className={'swatch' + (me.glyph === gl ? ' on' : '')} aria-pressed={me.glyph === gl} aria-label={t(`Symbol ${i + 1}`, `标志 ${i + 1}`, `Simge ${i + 1}`)} onClick={() => editProfile(me.id, { glyph: gl })}>
                <Avatar p={{ glyph: gl, color: me.color }} size={30} /></button>))}</div></div>
          <div className="field"><span className="field-label">{t('Colour', '颜色', 'Renk')}</span>
            <div className="swatches">{AVATAR_COLORS.map((c, i) => (
              <button key={c} type="button" id={'pf-c-' + i} className={'swatch' + (me.color === c ? ' on' : '')} aria-pressed={me.color === c} aria-label={t(`Colour ${i + 1}`, `颜色 ${i + 1}`, `Renk ${i + 1}`)} onClick={() => editProfile(me.id, { color: c })}>
                <span className="avatar" style={{ background: c, width: 30, height: 30 }} /></button>))}</div></div>
          <Seg id="pf-theme" label={t('Theme', '主题', 'Tema')} value={data.theme} onChange={(v: Theme) => setTheme(v)}
            options={[{ value: 'auto', label: t('Match device', '跟随设备', 'Cihaza uy') }, { value: 'light', label: t('Light', '浅色', 'Açık') }, { value: 'dark', label: t('Dark', '深色', 'Koyu') }]} />
          <Seg id="pf-lang" label={t('Language', '语言', 'Dil')} value={data.lang} onChange={setLang}
            options={[{ value: 'en', label: 'English' }, { value: 'tr', label: 'Türkçe' }, { value: 'zh', label: '中文' }]} />
        </div>
      </Section>

      <Section title={t('Statistics', '统计', 'İstatistikler')}>
        <dl className="facts wide">
          <div><dt>{t('Games finished', '完成的对局', 'Biten oyunlar')}</dt><dd className="num">{total}</dd></div>
          <div><dt>{t('Daily streak', '连续每日挑战', 'Günlük seri')}</dt><dd className="num">{streak}</dd></div>
          {games.map(g => { const s = statsOf(me, g.id); return (
            <div key={g.id}><dt>{gameName(g, lang)}</dt><dd className="num">{g.players[1] > 1
              ? t(`${s.rating} rating · ${s.wins}–${s.losses}–${s.draws}`, `${s.rating}分 · ${s.wins}胜${s.losses}负${s.draws}和`, `${s.rating} puan · ${s.wins}–${s.losses}–${s.draws}`)
              : t(`${s.played} solved`, `完成${s.played}次`, `${s.played} çözüldü`) + (s.started ? t(` · ${Math.round((100 * s.played) / s.started)}% completion`, ` · 完成率${Math.round((100 * s.played) / s.started)}%`, ` · %${Math.round((100 * s.played) / s.started)} tamamlama`) : '')}</dd></div>); })}
          <div><dt>{t('Favourites', '收藏', 'Favoriler')}</dt><dd>{me.favorites.length ? me.favorites.map(id => { const m = metaOf(id); return m ? gameName(m, lang) : id; }).join(t(', ', '、', ', ')) : t('None yet', '暂无', 'Henüz yok')}</dd></div>
        </dl>
      </Section>

      <Section title={t('Achievements', '成就', 'Başarımlar')}>
        <ul className="badges">{achievements(me).map(([en, zh, den, dzh, ok]) => (
          <li key={en} className={ok ? 'got' : ''}><b>{t(en, zh, ACH_TR[en]?.[0])}</b><span>{t(den, dzh, ACH_TR[en]?.[1])}</span><i>{ok ? t('Earned', '已获得', 'Kazanıldı') : t('Open', '未获得', 'Kazanılmadı')}</i></li>))}</ul>
      </Section>

      <Section title={t('Match history', '对局记录', 'Maç geçmişi')}>
        {history.length === 0 ? <p className="muted">{t('Finished games are listed here, newest first.', '完成的对局会列在这里，最新的在前。', 'Biten oyunlar en yeniden başlayarak burada listelenir.')}</p> : (
          <div className="table-scroll"><table className="table">
            <thead><tr><th>{t('Date', '日期', 'Tarih')}</th><th>{t('Game', '游戏', 'Oyun')}</th><th>{t('Details', '详情', 'Ayrıntılar')}</th><th className="r">{t('Result', '结果', 'Sonuç')}</th></tr></thead>
            <tbody>{history.map(h => (
              <tr key={h.t}><td className="num">{new Date(h.t).toLocaleDateString(locale(lang))}</td><td>{(() => { const m = CATALOGUE.find(x => x.id === h.gid); return m ? gameName(m, lang) : h.game; })()}</td><td>{historyLabel(h.gid, h.label, lang)}</td>
                <td className="r num">{h.ms != null ? fmtTime(h.ms) : h.result === 'win' ? t('Won', '胜', 'Galibiyet') : h.result === 'loss' ? t('Lost', '负', 'Mağlubiyet') : t('Draw', '和', 'Berabere')}</td></tr>))}</tbody>
          </table></div>
        )}
      </Section>

      <Section title={t('Profiles on this device', '本设备上的档案', 'Bu cihazdaki profiller')}>
        <ul className="profiles">{data.profiles.map(p => (
          <li key={p.id}><span className="who"><Avatar p={p} size={28} /> {pname(p, lang)}{p.guest ? t(' (guest)', '（游客）', ' (misafir)') : ''}</span>
            {p.id === me.id ? <span className="muted">{t('Playing now', '当前玩家', 'Şu an oynuyor')}</span>
              : <button type="button" id={'pf-use-' + p.id} className="btn sm" onClick={() => { setActive(p.id); setConfirmDelete(false); }}>{t('Switch', '切换', 'Geç')}</button>}</li>))}</ul>
        <form className="row" onSubmit={add}>
          <label className="field grow" htmlFor="pf-new"><span className="field-label">{t('New profile name', '新档案名字', 'Yeni profil adı')}</span>
            <input id="pf-new" value={name} maxLength={20} onChange={e => setName(e.target.value)} placeholder={t('e.g. a second player', '例如第二位玩家', 'ör. ikinci oyuncu')} /></label>
          <button type="submit" id="pf-add" className="btn primary" disabled={!name.trim()}>{t('Create profile', '创建档案', 'Profil oluştur')}</button>
        </form>
        {data.profiles.length > 1 && (confirmDelete ? (
          <div className="row"><span>{t(`Delete ${me.name} and all of its records?`, `删除“${me.name}”及其全部记录？`, `${me.name} ve bütün kayıtları silinsin mi?`)}</span>
            <button type="button" id="pf-del-yes" className="btn danger" onClick={() => { deleteProfile(me.id); setConfirmDelete(false); }}>{t('Delete', '删除', 'Sil')}</button>
            <button type="button" id="pf-del-no" className="btn" onClick={() => setConfirmDelete(false)}>{t('Cancel', '取消', 'Vazgeç')}</button></div>
        ) : <button type="button" id="pf-del" className="btn ghost" onClick={() => setConfirmDelete(true)}>{t('Delete this profile…', '删除此档案…', 'Bu profili sil…')}</button>)}
      </Section>
    </>
  );
}
