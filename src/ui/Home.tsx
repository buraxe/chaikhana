import { useEffect, useRef, useState, type ReactNode } from 'react';
import { sfx } from '../core/sound';
import { CATALOGUE, DEPTH_LABEL, gameName } from '../core/catalogue';
import type { GameMeta } from '../core/game';
import { locale, pick as tri, pname, useLang, useT } from '../core/i18n';
import { LESSON_DIGEST, useLesson } from '../core/lessons';
import { sentences } from '../core/text';
import { dayKey } from '../core/rng';
import { loadJSON } from '../core/storage';
import { activeOf, dailyStreak, useData, type Lang } from '../core/store';
import { GameArt } from './art';
import { fmtTime } from './bits';
import { Masthead } from './Masthead';
import { Tile } from './Tile';
import { IssueBox } from './Issue';
import { clipHeadline } from './Frame';

type Tri3 = [en: string, zh: string, tr: string];
const PHASES: [number, string, string, string][] = [
  [1, 'Platform foundation', '平台基础', 'Platform altyapısı'], [2, 'Core puzzles', '核心谜题', 'Temel bulmacalar'], [3, '3D and mechanical puzzles', '立体与机关谜题', '3B ve mekanik bulmacalar'],
  [4, 'Strategy board games', '策略棋类', 'Strateji oyunları'], [5, 'Turkish and Eastern tabletop', '土耳其与东方桌游', 'Türk ve Doğu masa oyunları'], [6, 'Online multiplayer', '联网对战', 'Çevrimiçi çok oyunculu'],
  [7, 'Rankings, archives, achievements', '排行、题库与成就', 'Sıralama, arşiv, başarımlar'], [8, 'Billiards and classics', '台球与经典小游戏', 'Bilardo ve klasikler'],
];

/** The inside pages of the paper: one section per page, the first game is the page's lead story. */
const SECTIONS: { key: string; title: Tri3; note: Tri3; games: string[] }[] = [
  { key: 'kahve', title: ['Coffeehouse corner', '咖啡馆一角', 'Kahvehane köşesi'], note: ['The games of the Turkish coffeehouse: Tavla, Okey, 101 Okey and Dama.', '土耳其咖啡馆里的经典游戏：双陆棋、Okey、101 Okey 和土耳其跳棋。', 'Türk kahvehanesinin oyunları: Tavla, Okey, 101 Okey ve Dama.'], games: ['tavla', 'okey', 'okey-101', 'dama'] },
  { key: 'buyuk', title: ['The great board games', '四大棋', 'Büyük tahta oyunları'], note: ['Chess, Xiangqi, Shogi and Go: four classics, the regulars at five strengths, and a daily puzzle for each.', '国际象棋、象棋、将棋和围棋：四大经典，五位常客陪你下，每种棋每天一道谜题。', 'Satranç, Xiangqi, Shogi ve Go: dört klasik, beş seviyede müdavimler ve her biri için günlük bulmaca.'], games: ['chess', 'weiqi', 'xiangqi', 'shogi'] },
  { key: 'kart', title: ['Card table', '牌桌', 'Kart masası'], note: ['Mahjong with three regulars, Saranta’s own Sì Fēng, Pişti for two, Batak and King for four, and Texas Hold’em.', '和三位常客打一圈麻将，还有Saranta自创的四风、两人Pişti、四人Batak和King，以及德州扑克。', 'Üç müdavimle bir tur mahjong, Saranta’nın kendi oyunu Sì Fēng, iki kişilik Pişti, dört kişilik Batak ve King, bir de Texas Hold’em.'], games: ['mahjong', 'sifeng', 'pisti', 'batak', 'king', 'poker'] },
  { key: 'gelenek', title: ['Folk games', '民间棋戏', 'Halk oyunları'], note: ['Stones in pits and stones on lines: games played in the dust and on park benches for centuries.', '坑里的石子，线上的棋子：几百年来在泥地上和公园长椅上流传的游戏。', 'Kuyulardaki taşlar, çizgilerdeki taşlar: yüzyıllardır toprakta ve park banklarında oynanan oyunlar.'], games: ['mancala', 'morris'] },
  { key: 'cin', title: ['Traditional Chinese puzzles', '中国传统智力游戏', 'Geleneksel Çin bulmacaları'], note: ['Classic Chinese puzzles, each with its history and the story behind it.', '经典中国益智游戏，每一款都附有历史和背后的故事。', 'Her biri tarihçesi ve ardındaki hikâyesiyle klasik Çin bulmacaları.'], games: ['huarong', 'tangram', 'nine-rings'] },
  { key: 'bulmaca', title: ['Puzzle page', '谜题版', 'Bulmaca sayfası'], note: ['Pencil-free puzzles: logic, patience and a little luck.', '无需纸笔的谜题：逻辑、耐心，再加一点运气。', 'Kalem gerektirmeyen bulmacalar: mantık, sabır ve biraz da şans.'], games: ['sudoku', 'nonogram', 'minesweeper', 'lights-out'] },
  { key: 'yeni', title: ['New on the puzzle page', '谜题版新作', 'Bulmaca sayfasında yeni'], note: ['Numbers in cages, bridges between islands, boxes in a warehouse and the tile game everyone knows.', '笼子里的数字、岛之间的桥、仓库里的箱子，还有人人都知道的数字方块。', 'Kafeslerde sayılar, adalar arasında köprüler, depoda kutular ve herkesin bildiği sayı oyunu.'], games: ['kenken', 'hashi', 'sokoban', 'g2048'] },
  { key: 'mantik', title: ['The logic desk', '逻辑专栏', 'Mantık köşesi'], note: ['Signs between squares, zeros and ones, sums in a crossword and one long loop round the numbers.', '格子间的不等号、0和1、填字式的数字和，还有绕着数字的一条长回路。', 'Kareler arasında işaretler, sıfırlar ve birler, bulmacada toplamlar ve sayıların etrafında tek uzun döngü.'], games: ['futoshiki', 'binary', 'kakuro', 'slitherlink'] },
  { key: 'uc', title: ['In three dimensions', '三维谜题', 'Üç boyutta'], note: ['Take Lu Ban’s lock apart and build Kongming’s back up, crack harder burrs, fill boxes, build figures and fold a wooden snake into a cube.', '拆开鲁班锁、装好孔明锁，挑战更难的插接锁，装满盒子，搭出图形，再把木蛇折成立方体。', 'Lu Ban kilidini sök, Kongming kilidini kur, daha zor geçmeleri çöz, kutuları doldur, figürler kur ve tahta yılanı küpe katla.'], games: ['luban', 'kongming', 'burr', 'soma', 'packing-3d', 'assembly-3d', 'snake-cube'] },
  { key: 'yol', title: ['Paths and riddles', '路径与谜语', 'Yollar ve bilmeceler'], note: ['A snake of numbers, lines that fill the grid, queens in coloured fields and the oldest river riddle in writing.', '数字蛇、铺满方格的连线、颜色区域里的皇后，以及最古老的过河谜语。', 'Sayılardan bir yılan, ızgarayı dolduran çizgiler, renkli tarlalarda vezirler ve yazıya geçmiş en eski nehir bilmecesi.'], games: ['hidato', 'numberlink', 'n-queens', 'river-crossing'] },
  { key: 'akil', title: ['Brain teasers', '益智游戏', 'Akıl oyunları'], note: ['A cube, a tower and a code: puzzles to sit with alone.', '魔方、宝塔与密码：适合独自琢磨。', 'Küp, kule ve şifre: tek başına uğraşmalık.'], games: ['rubik', 'minesweeper-3d', 'bulls-cows', 'hanoi', 'mastermind'] },
  { key: 'strateji', title: ['Strategy', '策略', 'Strateji'], note: ['Two-player games, against the computer at five strengths or a friend on this device.', '双人对弈：挑战五种强度的电脑，或与身边的朋友同机对战。', 'İki kişilik oyunlar: beş seviyede bilgisayara ya da bu cihazda bir arkadaşa karşı.'], games: ['qubic', 'gomoku', 'reversi', 'connect-four'] },
  { key: 'spor', title: ['Sports page', '体育版', 'Spor sayfası'], note: ['Draft an XI from three leagues and chase the perfect 7-0, then a frame of pool.', '从三个联赛挑选首发，冲击完美的7比0；再来一局台球。', 'Üç ligden ilk on birini kur, kusursuz 7-0’ı kovala; ardından bir el bilardo.'], games: ['football-70', 'billiards'] },
  { key: 'klasik', title: ['Classics', '经典', 'Klasikler'], note: ['From the billiard table to pencil and paper.', '从台球桌到纸笔游戏。', 'Bilardo masasından kâğıt kaleme.'], games: ['battleship', 'dots-boxes', 'tictactoe'] },
];
const PAGE_KEY = 'gp.gazette.page';
const readPage = () => { try { return Number(sessionStorage.getItem(PAGE_KEY)) || 0; } catch { return 0; } };
const savePage = (n: number) => { try { sessionStorage.setItem(PAGE_KEY, String(n)); } catch { /* private mode */ } };


function Article({ g, lead, wide, fav }: { g: GameMeta; lead?: boolean; wide?: boolean; fav?: boolean }) {
  const t = useT(), lang = useLang(), big = lead || wide;
  // Small articles print the digest; the lead and wide ones load the full lesson for history and tips.
  const d = LESSON_DIGEST[g.id], dl = d ? d[lang] ?? d.en : undefined;
  const full = useLesson(big ? g.id : ''), text = full ? full[lang] ?? full.en : undefined;
  const players = g.players[0] === g.players[1] ? t(`${g.players[0]} player`, `${g.players[0]}人`, `${g.players[0]} oyuncu`) : t(`${g.players[0]}–${g.players[1]} players`, `${g.players[0]}–${g.players[1]}人`, `${g.players[0]}–${g.players[1]} oyuncu`);
  const meta = `${players} · ${t(`${g.minutes} min`, `${g.minutes}分钟`, `${g.minutes} dk`)} · ${tri(DEPTH_LABEL[g.depth], lang)} · ${g.dim}`;
  return (
    <a className={'art-story' + (lead ? ' lead' : '') + (wide ? ' wide' : '')} href={'#' + g.id}>
      <figure className="art-fig"><GameArt id={g.id} /></figure>
      <div className="art-body">
        <span className="story-head">{gameName(g, lang)}{fav && <span className="fav" aria-label={t('favourite', '收藏', 'favori')}> ★</span>}</span>
        <span className="story-meta">{meta}</span>
        {dl && <span className="story-deck">{dl.s}</span>}
        {dl && <span className="story-text first">{big && text ? text.history : dl.h}</span>}
        {wide && text?.culture && <span className="story-text">{sentences(text.culture, 2, lang)}</span>}
        {big && text?.basics[0] && <span className="tip"><b>{t('Tip from the regulars', '老茶客的提示', 'Müdavimlerden ipucu')}</b>{text.basics[0]}</span>}
        <span className="story-play">{t('Play', '开始', 'Oyna')} →</span>
      </div>
    </a>
  );
}

export function Home() {
  const me = activeOf(useData()), t = useT(), lang = useLang();
  const playable = CATALOGUE.filter(g => g.status === 'playable');
  const listed = new Set(SECTIONS.flatMap(s => s.games));
  const sections = SECTIONS.map((s, i) => ({ ...s, games: [...s.games, ...(i === SECTIONS.length - 1 ? playable.filter(g => !listed.has(g.id)).map(g => g.id) : [])] }));
  const titles = [t('Front page', '头版', 'Ön sayfa'), ...sections.map(s => t(...s.title)), t('Classifieds', '分类广告', 'İlanlar')];
  const last = titles.length - 1;

  const [page, setPageRaw] = useState(() => Math.min(readPage(), last));
  const [dir, setDir] = useState<'next' | 'prev' | ''>('');
  const paperRef = useRef<HTMLElement>(null);
  const go = (n: number) => {
    if (n < 0 || n > last || n === page) return;
    sfx('page');
    setDir(n > page ? 'next' : 'prev'); setPageRaw(n); savePage(n);
    const top = paperRef.current?.getBoundingClientRect().top ?? 0;
    if (top < 0) paperRef.current?.scrollIntoView({ block: 'start' });
  };
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).closest('input, select, textarea')) return;
      if (e.key === 'ArrowRight' || e.key === 'PageDown') go(page + 1);
      if (e.key === 'ArrowLeft' || e.key === 'PageUp') go(page - 1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });
  const touch = useRef<{ x: number; y: number } | null>(null);

  const date = new Date().toLocaleDateString(locale(lang), { day: 'numeric', month: 'long', year: 'numeric' });
  const folio = (n: number) => (
    <div className="folio"><span>{t('The Coffeehouse Gazette', '茶馆棋报', 'Kahvehane Gazetesi')}</span><span>{date}</span><span className="num">{t(`Page ${n + 1}`, `第${n + 1}版`, `Sayfa ${n + 1}`)}</span></div>
  );

  let body: ReactNode;
  if (page === 0) body = <FrontPage titles={titles} go={go} leads={sections.map(x => x.games[0])} />;
  else if (page === last) body = (
    <>
      {folio(page)}
      <header className="sec-flag big"><h2>{titles[page]}</h2><span className="sec-note">{t('Games that are planned but not built yet, and the publishing schedule.', '已计划但尚未推出的游戏，以及出版计划。', 'Planlanan ama henüz yapılmamış oyunlar ve yayın planı.')}</span></header>
      <div className="back">
        <section className="schedule">
          <h3 className="cl-flag">{t('Publishing schedule', '出版计划', 'Yayın planı')}</h3>
          <ol className="phases">
            {PHASES.map(([n, en, zh, tr]) => {
              const games = CATALOGUE.filter(g => g.phase === n), built = games.filter(g => g.status === 'playable').length;
              const state = n === 1 ? t('Built', '已完成', 'Hazır') : n === 6 ? t('Deferred', '暂缓', 'Ertelendi') : games.length ? t(`${built} of ${games.length} built`, `已完成 ${built}/${games.length}`, `${games.length} oyundan ${built} hazır`) : t('Planned', '计划中', 'Planlandı');
              return <li key={n}><span className="phase-n num">{t(`Phase ${n}`, `第${n}阶段`, `${n}. aşama`)}</span><span className="phase-label">{t(en, zh, tr)}</span><span className={'phase-state' + (n === 1 || built ? ' live' : '')}>{state}</span></li>;
            })}
          </ol>
        </section>
        <section className="classifieds">
          <h3 className="cl-flag">{t('Classifieds · coming soon', '分类广告 · 即将推出', 'İlanlar · yakında')}</h3>
          <div className="ads">{CATALOGUE.filter(g => g.status === 'planned').slice(0, 24).map(g => <Tile key={g.id} g={g} />)}</div>
          <p className="box-note"><a href="#puzzles">{t('Full listings in the Puzzles and Board Games supplements', '完整列表见谜题与棋牌副刊', 'Tüm ilanlar Bulmacalar ve Masa Oyunları eklerinde')} →</a></p>
        </section>
      </div>
    </>
  );
  else {
    const s = sections[page - 1], games = s.games.map(id => playable.find(g => g.id === id)).filter((g): g is GameMeta => !!g);
    body = (
      <>
        {folio(page)}
        <header className="sec-flag big"><h2>{t(...s.title)}</h2><span className="sec-note">{t(...s.note)}</span></header>
        <div className={'spread n' + games.length}>
          {games.length > 2
            ? <><Article g={games[0]} lead fav={me.favorites.includes(games[0].id)} />
              <div className="side-col">{games.slice(1).map(g => <Article key={g.id} g={g} fav={me.favorites.includes(g.id)} />)}</div></>
            : games.map(g => <Article key={g.id} g={g} wide fav={me.favorites.includes(g.id)} />)}
        </div>
      </>
    );
  }

  return (
    <article className="paper gazette" ref={paperRef} aria-roledescription={t('newspaper', '报纸', 'gazete')}
      onTouchStart={e => { const p = e.touches[0]; touch.current = { x: p.clientX, y: p.clientY }; }}
      onTouchEnd={e => {
        const s = touch.current, p = e.changedTouches[0]; touch.current = null;
        if (!s) return;
        const dx = p.clientX - s.x, dy = p.clientY - s.y;
        if (Math.abs(dx) > 70 && Math.abs(dy) < Math.abs(dx) * 0.6) go(page + (dx < 0 ? 1 : -1));
      }}>
      <div key={page} className={'page' + (dir ? ' turn-' + dir : '')} aria-live="polite">{body}</div>
      <nav className="pager" aria-label={t('Pages', '版面', 'Sayfalar')}>
        <button type="button" id="pg-prev" className="pg-btn" disabled={page === 0} onClick={() => go(page - 1)}>
          <span aria-hidden="true">‹</span> <span className="pg-lab">{page > 0 ? titles[page - 1] : ''}</span>
          <span className="sr">{t('Previous page', '上一版', 'Önceki sayfa')}</span></button>
        <span className="pg-count">{t(`Page ${page + 1} of ${last + 1}`, `第${page + 1}版，共${last + 1}版`, `Sayfa ${page + 1} / ${last + 1}`)}<small>{titles[page]}</small></span>
        <ol className="pg-dots">
          {titles.map((tt, i) => (
            <li key={i}><button type="button" id={'pg-' + (i + 1)} className={i === page ? 'on' : ''} aria-current={i === page ? 'page' : undefined} aria-label={`${t(`Page ${i + 1}`, `第${i + 1}版`, `Sayfa ${i + 1}`)}: ${tt}`} title={tt} onClick={() => go(i)}>{i + 1}</button></li>
          ))}
        </ol>
        <button type="button" id="pg-next" className="pg-btn next" disabled={page === last} onClick={() => go(page + 1)}>
          <span className="pg-lab">{page < last ? titles[page + 1] : ''}</span> <span aria-hidden="true">›</span>
          <span className="sr">{t('Next page', '下一版', 'Sonraki sayfa')}</span></button>
      </nav>
      {page < last && <button type="button" className="dog-ear" onClick={() => go(page + 1)} aria-label={t('Turn the page', '翻页', 'Sayfayı çevir')} title={t('Turn the page', '翻页', 'Sayfayı çevir')} />}
    </article>
  );
}

function FrontPage({ titles, go, leads }: { titles: string[]; go: (n: number) => void; leads: string[] }) {
  const me = activeOf(useData()), t = useT(), lang = useLang();
  const today = dayKey(), doneToday = me.daily[today], streak = dailyStreak(me);
  const playable = CATALOGUE.filter(g => g.status === 'playable');
  const sdk = loadJSON<{ size: number; elapsed: number; done: boolean } | null>('gp.sudoku.free', null);
  const gmk = loadJSON<{ moves: number[]; recorded: boolean } | null>('gp.gomoku', null);
  const news = me.clips?.[0] && Date.now() - me.clips[0].t < 3 * 864e5 ? me.clips[0] : null;
  return (
    <>
      <Masthead />
      <section className="front">
        <div className="front-lead">
          {news ? <>
            <p className="story-kicker breaking">{t('Breaking news', '最新消息', 'Son dakika')}</p>
            <h1 className="front-head">{clipHeadline(news, lang, pname(me, lang))}</h1>
          </> : <>
          <p className="story-kicker">{t("Today's puzzle", '今日谜题', 'Günün bulmacası')}</p>
          <h1 className="front-head">{doneToday != null
            ? t(`Today's Sudoku solved in ${fmtTime(doneToday)}`, `今日数独已完成，用时${fmtTime(doneToday)}`, `Günün Sudokusu ${fmtTime(doneToday)} sürede çözüldü`)
            : t("Today's Sudoku is out: one grid, the same for everyone", '今日数独出炉：同一天，人人同一盘', 'Günün Sudokusu çıktı: herkese aynı ızgara')}</h1>
          </>}
          <div className="front-row">
            <figure className="art-fig front-fig"><GameArt id="sudoku" /></figure>
            <p className="front-deck">{t(`Solve alone, play the computer at five strengths, or hand the screen to the person next to you. ${playable.length} games are playable today and ${CATALOGUE.length - playable.length} more are on the roadmap.`,
              `可以独自解题，可以和五种强度的电脑对弈，也可以把屏幕递给身边的人一起玩。目前有${playable.length}款游戏可玩，另有${CATALOGUE.length - playable.length}款在计划中。`, `Tek başına çöz, bilgisayara karşı beş seviyede oyna ya da ekranı yanındakine uzat. Bugün ${playable.length} oyun oynanabilir, ${CATALOGUE.length - playable.length} oyun daha yolda.`)}</p>
          </div>
          <div className="row">
            <a className="btn primary" href="#sudoku-daily">{doneToday != null ? t('Review the solved grid', '查看已完成的盘面', 'Çözülmüş ızgarayı incele') : t("Play today's Sudoku", '今日数独', 'Bugünün Sudokusunu oyna')}</a>
            <button type="button" className="btn" onClick={() => go(1)}>{t('Turn to the games', '翻到游戏版', 'Oyun sayfalarına geç')} →</button>
          </div>
          <section className="teasers" aria-label={t('Inside', '内页导读', 'İç sayfalarda')}>
            {leads.map((id, i) => {
              const g = playable.find(x => x.id === id);
              return g && (
                <button key={id} type="button" className="teaser" onClick={() => go(i + 1)}>
                  <figure className="art-fig"><GameArt id={id} /></figure>
                  <span className="teaser-body"><span className="story-kicker">{titles[i + 1]}</span><span className="teaser-head">{gameName(g, lang)}</span>
                    <span className="teaser-page">{t(`Page ${i + 2}`, `第${i + 2}版`, `Sayfa ${i + 2}`)} →</span></span>
                </button>
              );
            })}
          </section>
        </div>
        <aside className="front-side">
          <IssueBox compact />
          <section className="front-box" aria-label={t('In this issue', '本期内容', 'Bu sayıda')}>
            <h2 className="box-flag">{t('In this issue', '本期内容', 'Bu sayıda')}</h2>
            <ol className="contents">
              {titles.slice(1).map((tt, i) => (
                <li key={i}><button type="button" onClick={() => go(i + 1)}><span>{tt}</span><span className="dots" aria-hidden="true" /><span className="num">{i + 2}</span></button></li>
              ))}
            </ol>
          </section>
          <section className="front-box" aria-label={t('Your progress', '你的进度', 'İlerlemen')}>
            <h2 className="box-flag">{t("Reader's corner", '读者专栏', 'Okuyucu köşesi')}</h2>
            <dl className="facts">
              <div><dt>{t('Playing as', '当前玩家', 'Oyuncu')}</dt><dd>{pname(me, lang)}</dd></div>
              <div><dt>{t('Tea glasses', '茶杯', 'Çay bardağı')}</dt><dd><a href="#coffeehouse" className="num">🍵 {me.tea ?? 0}</a></dd></div>
              <div><dt>{t('Clippings', '剪报', 'Kupürler')}</dt><dd><a href="#coffeehouse" className="num">{me.clips?.length ?? 0}</a></dd></div>
              <div><dt>{t('Daily streak', '连续每日挑战', 'Günlük seri')}</dt><dd className="num">{t(`${streak} ${streak === 1 ? 'day' : 'days'}`, `${streak}天`, `${streak} gün`)}</dd></div>
              {sdk && !sdk.done && <div><dt>{t('Sudoku in progress', '进行中的数独', 'Süren Sudoku')}</dt><dd><a href="#sudoku">{sdk.size}×{sdk.size} · {fmtTime(sdk.elapsed)}</a></dd></div>}
              {gmk && gmk.moves.length > 0 && !gmk.recorded && <div><dt>{t('Gomoku in progress', '进行中的五子棋', 'Süren Gomoku')}</dt><dd><a href="#gomoku">{t(`Move ${gmk.moves.length + 1}`, `第${gmk.moves.length + 1}手`, `Hamle ${gmk.moves.length + 1}`)}</a></dd></div>}
            </dl>
          </section>
          <p className="weather">{t('Coffeehouse weather: tea well brewed, every table taken.', '茶馆天气：茶正浓，座无虚席。', 'Kahvehane hava durumu: çay demli, masalar dolu.')}</p>
        </aside>
      </section>
    </>
  );
}
