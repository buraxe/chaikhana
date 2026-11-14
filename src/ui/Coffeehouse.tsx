import './Coffeehouse.css';
import { useState } from 'react';
import { byLevel, CAST, castBio, castName, castTitle, unlockedUpTo } from '../core/cast';
import { gameName, metaOf } from '../core/catalogue';
import { locale, pname, useLang, useT } from '../core/i18n';
import { sfx } from '../core/sound';
import { DEFAULT_EQUIP, ITEMS, type Slot } from '../core/shop';
import { activeOf, buyItem, equipItem, owns, useData } from '../core/store';
import { Face } from './Cast';
import { clipHeadline } from './Frame';
import { Section } from './bits';

/** Games played against the regulars. */
const TABLES = ['chess', 'weiqi', 'xiangqi', 'shogi', 'tavla', 'mahjong', 'okey', 'okey-101', 'pisti', 'batak', 'king', 'dama', 'mancala', 'morris', 'billiards', 'battleship', 'gomoku', 'reversi', 'connect-four', 'qubic', 'dots-boxes', 'tictactoe'];
const SLOTS: [Slot, [string, string, string]][] = [['wall', ['Walls', '墙面', 'Duvarlar']], ['tavla', ['Tavla board', '双陆棋盘', 'Tavla tahtası']], ['tiles', ['Okey tiles', 'Okey 牌', 'Okey taşları']], ['felt', ['Billiard cloth', '台呢', 'Bilardo çuhası']]];

export function Coffeehouse() {
  const t = useT(), lang = useLang(), me = activeOf(useData());
  const [msg, setMsg] = useState('');
  const tea = me.tea ?? 0;
  const tl = (x: [string, string, string]) => t(x[0], x[1], x[2]);
  return (
    <>
      <header className="page-head">
        <h1>{t('The Coffeehouse', '茶馆', 'Kahvehane')}</h1>
        <p className="lede">{t('The regulars, the tea stove and the clippings wall. Every game you finish earns tea glasses; spend them on looks for the tables.', '常客、茶炉和剪报墙。每完成一局都能赚到茶杯，可以用来装扮桌子。', 'Müdavimler, çay ocağı ve kupür duvarı. Bitirdiğin her oyun çay bardağı kazandırır; onlarla masalara yeni görünümler alırsın.')}</p>
      </header>
      <div className="tea-bank">
        <span className="tea-glass" aria-hidden="true">🍵</span>
        <div><b className="num">{tea}</b><span>{t('tea glasses', '个茶杯', 'çay bardağı')}</span></div>
        <small className="muted">{t(`${me.teaEarned ?? 0} earned in all`, `累计获得${me.teaEarned ?? 0}`, `toplam ${me.teaEarned ?? 0} kazanıldı`)}</small>
        <a className="btn" href="#tournament">🏆 {t('Hold a tournament', '举办锦标赛', 'Turnuva düzenle')}</a>
      </div>

      <Section title={t('The regulars', '常客', 'Müdavimler')}>
        <p className="muted">{t('Fifteen regulars from Istanbul, Beijing and beyond, at five strengths. The first three strengths will sit with anyone; beat someone at a strength in a game and the next strength opens in that game.', '十五位常客，来自伊斯坦布尔、北京和更远的地方，分五个强度。前三档谁都愿意陪你下；在某个游戏里打败某一档的人，下一档就会在这个游戏里解锁。', 'İstanbul’dan, Pekin’den ve daha uzaklardan on beş müdavim, beş güç seviyesinde. İlk üç seviye herkesle oturur; bir oyunda bir seviyeden birini yenersen, o oyunda bir sonraki seviye açılır.')}</p>
        {[0, 1, 2, 3, 4].map(lv => (
          <div key={lv} className="reg-tier">
            <h3 className="reg-tier-h">{[t('Beginners', '新手', 'Acemiler'), t('Easy-going', '轻松', 'Rahat oyuncular'), t('Solid players', '稳健', 'Sağlam oyuncular'), t('Sharp minds', '高手', 'Keskin zekâlar'), t('Legends', '传奇', 'Efsaneler')][lv]}</h3>
            <ol className="regulars">
              {byLevel(lv).map(i => (
                <li key={i} className="regular">
                  <Face level={i} size={64} />
                  <div><b>{CAST[i].from} {castName(i, lang)}</b><span className="muted">{castTitle(i, lang)}</span><p>{castBio(i, lang)}</p></div>
                </li>
              ))}
            </ol>
          </div>
        ))}
        <div className="table-scroll">
          <table className="table ladder">
            <thead><tr><th>{t('Game', '游戏', 'Oyun')}</th>{[0, 1, 2, 3, 4].map(i => <th key={i} title={byLevel(i).map(w => castName(w, lang)).join(', ')}><span className="ladder-faces">{byLevel(i).map(w => <Face key={w} level={w} size={20} />)}</span></th>)}</tr></thead>
            <tbody>
              {TABLES.map(id => {
                const g = metaOf(id); if (!g) return null;
                const b = me.beaten?.[id] ?? -1, open = unlockedUpTo(me.beaten?.[id]);
                return (
                  <tr key={id}><th><a href={'#' + id}>{gameName(g, lang)}</a></th>
                    {[0, 1, 2, 3, 4].map(i => <td key={i} className={i <= b ? 'won' : i <= open ? 'open' : 'shut'} aria-label={i <= b ? t('beaten', '已击败', 'yenildi') : i <= open ? t('open', '可挑战', 'açık') : t('locked', '未解锁', 'kilitli')}>{i <= b ? '★' : i <= open ? '·' : '🔒'}</td>)}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Section>

      <Section title={t('The tea stove', '茶炉', 'Çay ocağı')} aside={msg ? <span className="muted" role="status">{msg}</span> : undefined}>
        {SLOTS.map(([slot, name]) => {
          const items = ITEMS.filter(x => x.slot === slot);
          const cur = me.equip?.[slot] ?? (slot === 'felt' ? '' : DEFAULT_EQUIP[slot as Exclude<Slot, 'felt'>]);
          return (
            <div key={slot} className="shop-row">
              <h3>{tl(name)}{slot === 'felt' && <small className="muted"> · {t('choose it in the billiards setup', '在台球设置里选择', 'bilardo ayarlarından seçilir')}</small>}</h3>
              <ul className="shop">
                {items.map(it => {
                  const have = owns(me, it.id), on = cur === it.id;
                  return (
                    <li key={it.id} className={'ware' + (on ? ' on' : '')}>
                      <span className="ware-sw" aria-hidden="true">{it.swatch.map((c, k) => <i key={k} style={{ background: c }} />)}</span>
                      <b>{tl(it.name)}</b>
                      {have ? (slot === 'felt' ? <span className="muted small">{t('Owned', '已拥有', 'Sende var')}</span>
                        : <button type="button" id={'eq-' + it.id} className={'btn sm' + (on ? ' on' : '')} disabled={on} onClick={() => { equipItem(it.id); sfx('click'); }}>{on ? t('In use', '使用中', 'Kullanılıyor') : t('Use', '使用', 'Kullan')}</button>)
                        : <button type="button" id={'buy-' + it.id} className="btn sm primary" disabled={tea < it.price} onClick={() => { if (buyItem(it.id)) { sfx('tea'); setMsg(t(`${tl(it.name)} is yours.`, `${tl(it.name)}已归你所有。`, `${tl(it.name)} artık senin.`)); } }}>🍵 {it.price}</button>}
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </Section>

      <Section title={t('Clippings wall', '剪报墙', 'Kupür duvarı')}>
        {!me.clips?.length ? <p className="muted">{t('No clippings yet. Beat a regular, finish a puzzle or win a cup and the paper will write about you.', '还没有剪报。打败一位常客、解出一道谜题或赢下一座奖杯，报纸就会报道你。', 'Henüz kupür yok. Bir müdavimi yen, bir bulmaca çöz ya da kupa kazan; gazete senden bahsetsin.')}</p> : (
          <ol className="clips">
            {me.clips.map((c, i) => (
              <li key={i} className={'clip k-' + c.k} style={{ rotate: `${((i * 37) % 7) - 3}deg` }}>
                <span className="clip-date">{new Date(c.t).toLocaleDateString(locale(lang), { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                <b className="clip-head">{clipHeadline(c, lang, pname(me, lang))}</b>
                {c.k === 'beat' && c.lvl != null && <Face level={c.n ?? c.lvl} size={34} mood="sad" />}
              </li>
            ))}
          </ol>
        )}
      </Section>
    </>
  );
}
