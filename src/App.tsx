import { lazy, Suspense, useEffect, useState } from 'react';
import { PLAYABLE } from './core/catalogue';
import { pname, useT } from './core/i18n';
import { activeOf, setLang, useData, type Lang } from './core/store';
import { Avatar } from './ui/bits';
import { GamePage } from './ui/GamePage';
import { Home } from './ui/Home';
import { Toasts } from './ui/Frame';

// Every page but the front page loads in its own file when it is first opened.
const Learn = lazy(() => import('./ui/Learn').then(m => ({ default: m.Learn })));
const Library = lazy(() => import('./ui/Library').then(m => ({ default: m.Library })));
const Daily = lazy(() => import('./ui/Pages').then(m => ({ default: m.Daily })));
const LocalPlay = lazy(() => import('./ui/Pages').then(m => ({ default: m.LocalPlay })));
const Rankings = lazy(() => import('./ui/Pages').then(m => ({ default: m.Rankings })));
const ProfilePage = lazy(() => import('./ui/Profile').then(m => ({ default: m.ProfilePage })));
const Coffeehouse = lazy(() => import('./ui/Coffeehouse').then(m => ({ default: m.Coffeehouse })));
const Workshop = lazy(() => import('./maker/Workshop').then(m => ({ default: m.Workshop })));
const Tournament = lazy(() => import('./ui/Tournament').then(m => ({ default: m.Tournament })));

// Routes are plain #names so a link to any page can be shared or bookmarked.
const NAV: [route: string, en: string, zh: string, tr: string][] = [
  ['home', 'Home', '首页', 'Ana sayfa'], ['puzzles', 'Puzzles', '谜题', 'Bulmacalar'], ['board-games', 'Board Games', '棋牌', 'Masa Oyunları'],
  ['local-play', 'Multiplayer', '对战', 'Çok oyunculu'], ['daily', 'Daily', '每日挑战', 'Günlük'], ['rankings', 'Rankings', '排行', 'Sıralama'],
  ['coffeehouse', 'Coffeehouse', '茶馆', 'Kahvehane'], ['workshop', 'Workshop', '工坊', 'Atölye'], ['learn', 'Learn', '学习', 'Öğren'], ['profile', 'Profile', '我的', 'Profil'],
];
const LANGS: [Lang, string, string, string][] = [['en', 'EN', 'English', 'en'], ['tr', 'TR', 'Türkçe', 'tr'], ['zh', '中', '中文', 'zh-Hans']];
const read = () => location.hash.replace(/^#/, '') || 'home';

export default function App() {
  const [route, setRoute] = useState(read);
  const [menu, setMenu] = useState(false);
  const data = useData(), me = activeOf(data), t = useT(), lang = data.lang;
  useEffect(() => {
    const on = () => { setRoute(read()); setMenu(false); window.scrollTo(0, 0); };
    window.addEventListener('hashchange', on);
    return () => window.removeEventListener('hashchange', on);
  }, []);
  useEffect(() => { document.title = t('Chaikhana · puzzles & board games', 'Chaikhana · 益智与棋牌', 'Chaikhana · bulmaca ve masa oyunları'); }, [t]);

  const gameId = route.replace(/-daily$/, '');
  const lesson = route.startsWith('learn-') ? route.slice(6) : '';
  const shared = route.startsWith('workshop-g-') ? route : '';
  const section = PLAYABLE.has(gameId) ? '' : lesson ? 'learn' : route === 'tournament' ? 'local-play' : shared ? 'workshop' : route;
  let page;
  if (PLAYABLE.has(gameId)) page = <GamePage key={route} id={gameId} daily={route.endsWith('-daily')} />;
  else if (route === 'puzzles') page = <Library key="p" title={t('Puzzles', '谜题', 'Bulmacalar')} categories={['logic', 'spatial', 'chinese']} />;
  else if (route === 'board-games') page = <Library key="b" title={t('Board Games', '棋牌', 'Masa Oyunları')} categories={['strategy', 'tabletop', 'cards', 'classic']} />;
  else if (route === 'local-play') page = <LocalPlay />;
  else if (route === 'daily') page = <Daily />;
  else if (route === 'rankings') page = <Rankings />;
  else if (route === 'learn' || lesson) page = <Learn id={lesson} />;
  else if (route === 'profile') page = <ProfilePage />;
  else if (route === 'coffeehouse') page = <Coffeehouse />;
  else if (route === 'tournament') page = <Tournament />;
  else if (route === 'workshop' || shared) page = <Workshop incoming={shared || undefined} />;
  else page = <Home />;

  return (
    <>
      <header className="top">
        <div className="wrap top-in">
          <a className="brand" href="#home" aria-label={t('Chaikhana, home', 'Chaikhana，首页', 'Chaikhana, ana sayfa')}>
            <svg className="seal" viewBox="0 0 36 36" aria-hidden="true">
              <ellipse cx="18" cy="31.5" rx="13" ry="3" className="seal-saucer" />
              <path d="M11.5 6h13c-.4 3.6-2.6 6.4-3.6 8.6-.6 1.4-.6 2.6 0 4 1 2.2 3.2 5 3.6 8.6-2.2 1.6-10.8 1.6-13 0 .4-3.6 2.6-6.4 3.6-8.6.6-1.4.6-2.6 0-4C14.1 12.4 11.9 9.6 11.5 6z" className="seal-glass" />
              <path d="M13.2 11.5h9.6c-.9 1.4-1.6 2.3-1.9 3.1-.6 1.4-.6 2.6 0 4 1 2.2 3 4.9 3.4 8.3-2.4 1.2-9.8 1.2-12.2 0 .4-3.4 2.4-6.1 3.4-8.3.6-1.4.6-2.6 0-4-.3-.8-1-1.7-1.9-3.1z" className="seal-tea" />
              <path d="M11.5 6h13" className="seal-rim" />
            </svg>
            {/* The name is the same in every language: the Silk Road teahouse, çayhane, 茶馆. */}
            <span className="brand-name"><span className="brand-word">Chai<em>khana</em></span><small className="brand-tag">{t('puzzles & board games', '益智与棋牌', 'bulmaca ve masa oyunları')}</small></span>
          </a>
          <div className="lang-pick" role="group" aria-label={t('Language', '语言', 'Dil')}>
            {LANGS.map(([l, short, long, tag]) => (
              <button key={l} type="button" id={'lang-' + l} lang={tag} className={data.lang === l ? 'on' : ''} aria-pressed={data.lang === l} aria-label={long} title={long} onClick={() => setLang(l)}>{short}</button>
            ))}
          </div>
          <button type="button" id="nav-toggle" className="nav-toggle" aria-expanded={menu} aria-controls="nav" onClick={() => setMenu(m => !m)} aria-label={t('Menu', '菜单', 'Menü')}><span aria-hidden="true">☰</span></button>
          <nav id="nav" className={'nav' + (menu ? ' open' : '')} aria-label={t('Main', '主导航', 'Ana')}>
            {NAV.map(([r, en, zh, tr]) => (
              <a key={r} href={'#' + r} className={section === r ? 'on' : ''} aria-current={section === r ? 'page' : undefined}>
                {r === 'profile' ? <><Avatar p={me} size={20} /> {pname(me, lang)}</> : t(en, zh, tr)}
              </a>
            ))}
          </nav>
        </div>
        <div className="kilim" aria-hidden="true" />
      </header>
      <main className="wrap main"><Suspense fallback={<p className="empty" aria-busy="true">…</p>}>{page}</Suspense></main>
      <Toasts />
      <footer className="wrap foot">
        <span>{t('Everything here runs and saves on this device. Online play comes in a later phase.', '所有内容都在本设备上运行和保存。联网对战将在后续阶段推出。', 'Buradaki her şey bu cihazda çalışır ve kaydedilir. Çevrimiçi oyun sonraki bir aşamada gelecek.')}</span>
      </footer>
    </>
  );
}
