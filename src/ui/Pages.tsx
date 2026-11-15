import './Pages.css';
import { CATALOGUE, gameName, metaOf } from '../core/catalogue';
import { BOARD_PUZZLES, tasksFor } from '../core/daily';
import { solvedToday } from '../games/boards/Puzzle';
import { useTodaysPuzzle, type BoardGame } from '../games/boards/pools';
import { GameArt } from './art';
import { IssueBox } from './Issue';
import { pname, trLabel, useLang, useT, locale } from '../core/i18n';
import { dayKey } from '../core/rng';
import { activeOf, dailyStreak, statsOf, useData } from '../core/store';
import { Avatar, fmtBestKey, fmtTime, Section } from './bits';
import { Tile } from './Tile';
import { bestLabel } from '../core/registry';

export function LocalPlay() {
  const t = useT(), local = CATALOGUE.filter(g => g.players[1] > 1);
  return (
    <>
      <header className="page-head">
        <h1>{t('Multiplayer', '对战', 'Çok oyunculu')}</h1>
        <p className="lede">{t('Two ways to play today: against the computer, or with a second person on this device, passing it between turns. Add a profile for the second player and both records and ratings are kept. Online rooms, matchmaking and spectating are a later phase and are not built yet.',
          '目前有两种玩法：和电脑对弈，或者和身边的人在同一台设备上轮流下。为第二位玩家建立档案后，双方的战绩和积分都会保存。联网房间、匹配和观战属于后续阶段，尚未开发。', 'Bugün iki şekilde oynanır: bilgisayara karşı ya da bu cihazda ikinci bir kişiyle, sırayla cihazı birbirinize uzatarak. İkinci oyuncu için profil eklersen ikisinin de kayıtları ve puanları tutulur. Çevrimiçi odalar, eşleştirme ve izleme sonraki bir aşamadadır ve henüz yapılmadı.')}</p>
      </header>
      <a className="tour-promo" href="#tournament" id="go-tournament">
        <span className="tr-cup" aria-hidden="true">🏆</span>
        <span><b>{t('Coffeehouse tournament', '茶馆锦标赛', 'Kahvehane turnuvası')}</b>
          <span>{t('Two to eight friends, a league or a knockout, across the games you choose.', '两到八位朋友，联赛或淘汰赛，游戏任你挑。', 'İki ile sekiz arkadaş, lig ya da eleme, seçtiğiniz oyunlarda.')}</span></span>
        <span className="btn primary">{t('Set one up', '开始组织', 'Turnuva kur')} →</span>
      </a>
      <Section title={t('Same-device games', '同机对战游戏', 'Aynı cihazda oyunlar')}>
        <div className="cols">{local.filter(g => g.status === 'playable').map(g => <Tile key={g.id} g={g} />)}</div>
      </Section>
      {local.some(g => g.status === 'planned') && <Section title={t('Planned multiplayer games', '计划中的多人游戏', 'Planlanan çok oyunculu oyunlar')}>
        <div className="ads">{local.filter(g => g.status === 'planned').map(g => <Tile key={g.id} g={g} />)}</div>
      </Section>}
    </>
  );
}

export function Daily() {
  const me = activeOf(useData()), t = useT(), lang = useLang(), today = dayKey(), done = me.daily[today];
  const days = Array.from({ length: 14 }, (_, k) => { const d = new Date(); d.setDate(d.getDate() - (13 - k)); return d; });
  const solved = Object.values(me.daily), streak = dailyStreak(me);
  return (
    <>
      <header className="page-head">
        <h1>{t('Today’s issue', '今日报纸', 'Günün sayısı')}</h1>
        <p className="lede">{t('Every day the Gazette prints four jobs: a Sudoku, a rival to beat, a puzzle and a 7-0 run, the same for everyone on the same date. Each earns tea; do at least one a day to keep your streak. A new issue comes out at midnight.', '棋报每天刊出四项任务：一道数独、一位要打败的对手、一道谜题和一次7比0挑战，同一天人人相同。每项都能赚茶杯；每天至少完成一项即可保持连续记录。零点出新报。', 'Gazete her gün dört iş yayımlar: bir Sudoku, yenilecek bir rakip, bir bulmaca ve bir 7-0 koşusu; aynı gün herkes için aynı. Her biri çay kazandırır; seriyi korumak için günde en az birini yap. Yeni sayı gece yarısı çıkar.')}</p>
      </header>
      <div className="daily">
        <div className="daily-card">
          <p className="eyebrow">{new Date().toLocaleDateString(locale(lang), { weekday: 'long', month: 'long', day: 'numeric' })}{done != null ? ` · ${t('Sudoku', '数独', 'Sudoku')} ${fmtTime(done)}` : ''}</p>
          <IssueBox />
        </div>
        <dl className="facts">
          <div><dt>{t('Current streak', '当前连续', 'Güncel seri')}</dt><dd className="num">{t(`${streak} ${streak === 1 ? 'day' : 'days'}`, `${streak}天`, `${streak} gün`)}</dd></div>
          <div><dt>{t('Dailies solved', '已完成', 'Çözülen günlükler')}</dt><dd className="num">{solved.length}</dd></div>
          <div><dt>{t('Fastest daily', '最快用时', 'En hızlı günlük')}</dt><dd className="num">{solved.length ? fmtTime(Math.min(...solved)) : '–'}</dd></div>
        </dl>
      </div>
      <Section title={t('Board puzzles of the day', '今日棋类谜题', 'Günün tahta bulmacaları')}>
        <ul className="board-puz">
          {BOARD_PUZZLES.map(g => <BoardPuz key={g} g={g as BoardGame} />)}
        </ul>
      </Section>
      <Section title={t('Last 14 days', '最近14天', 'Son 14 gün')}>
        <ol className="days">
          {days.map(d => { const k = dayKey(d), ms = me.daily[k], jobs = me.issue?.[k]?.length ?? 0; return (
            <li key={k} className={ms != null || jobs ? 'hit' : ''} title={jobs ? `${jobs}/${tasksFor(k).length}` : undefined} aria-label={`${k}: ${ms != null ? t('solved in ', '用时 ', 'çözüm süresi ') + fmtTime(ms) : t('not solved', '未完成', 'çözülmedi')}`}>
              <span className="num">{d.getDate()}</span><small className="num">{jobs ? `${jobs}/${tasksFor(k).length}` : ms != null ? fmtTime(ms) : '·'}</small>
            </li>); })}
        </ol>
      </Section>
    </>
  );
}

export function Rankings() {
  const data = useData(), me = activeOf(data), t = useT(), lang = useLang();
  const playable = CATALOGUE.filter(g => g.status === 'playable');
  const multi = playable.filter(g => g.players[1] > 1).map(g => ({ g, rows: data.profiles.map(p => ({ p, s: statsOf(p, g.id) }))
    .filter(x => x.s.played > 0).sort((a, b) => b.s.rating - a.s.rating) })).filter(x => x.rows.length);
  const bests = playable.filter(g => g.players[1] === 1).flatMap(g => {
    const keys = [...new Set(data.profiles.flatMap(p => Object.keys(statsOf(p, g.id).best)))].sort();
    return keys.map(k => ({ g, k, top: data.profiles.map(p => ({ p, ms: statsOf(p, g.id).best[k] })).filter(x => x.ms != null).sort((a, b) => a.ms - b.ms)[0] }));
  });
  return (
    <>
      <header className="page-head">
        <h1>{t('Rankings', '排行', 'Sıralama')}</h1>
        <p className="lede">{t('Standings for the profiles on this device. Each game keeps its own rating, starting at 1000; there is no combined score. Global leaderboards arrive with online play.',
          '本设备上各玩家档案的排名。每款游戏单独计算积分，初始为1000分，不设总分。全球排行榜会随联网对战推出。', 'Bu cihazdaki profillerin sıralaması. Her oyunun 1000’den başlayan kendi puanı vardır; birleşik puan yoktur. Küresel sıralamalar çevrimiçi oyunla gelecek.')}</p>
      </header>
      {multi.length === 0 && <Section title={t('Ratings', '积分', 'Puanlar')}><p className="muted">{t('No finished two-player games yet. Ratings appear after the first rated game.', '还没有完成的双人对局。第一局计分对局结束后会显示积分。', 'Henüz bitmiş iki kişilik oyun yok. Puanlar ilk puanlı oyundan sonra görünür.')}</p></Section>}
      {multi.map(({ g, rows }) => (
        <Section key={g.id} title={t(`${g.name} rating`, `${g.zh}积分`, `${gameName(g, 'tr')} puanı`)}>
          <div className="table-scroll"><table className="table">
            <thead><tr><th>#</th><th>{t('Player', '玩家', 'Oyuncu')}</th><th className="r">{t('Rating', '积分', 'Puan')}</th><th className="r">{t('Won', '胜', 'Galibiyet')}</th><th className="r">{t('Lost', '负', 'Mağlubiyet')}</th><th className="r">{t('Drawn', '和', 'Beraberlik')}</th></tr></thead>
            <tbody>{rows.map(({ p, s }, i) => (
              <tr key={p.id} className={p.id === me.id ? 'me' : ''}>
                <td className="num">{i + 1}</td><td><span className="who"><Avatar p={p} size={22} /> {pname(p, lang)}</span></td>
                <td className="r num">{s.rating}</td><td className="r num">{s.wins}</td><td className="r num">{s.losses}</td><td className="r num">{s.draws}</td>
              </tr>))}</tbody>
          </table></div>
        </Section>
      ))}
      <Section title={t('Best times', '最佳用时', 'En iyi süreler')}>
        {bests.length === 0 ? <p className="muted">{t('No best times yet. A time is recorded for each solve without hints or undo.', '还没有最佳用时。不使用提示和悔棋完成的题目会记录用时。', 'Henüz en iyi süre yok. İpucusuz ve geri almasız her çözüm için süre kaydedilir.')}</p> : (
          <div className="table-scroll"><table className="table">
            <thead><tr><th>{t('Game', '游戏', 'Oyun')}</th><th>{t('Puzzle', '题目', 'Bulmaca')}</th><th>{t('Holder', '保持者', 'Sahibi')}</th><th className="r">{t('Time', '用时', 'Süre')}</th></tr></thead>
            <tbody>{bests.map(({ g, k, top }) => (
              <tr key={g.id + k} className={top.p.id === me.id ? 'me' : ''}><td>{gameName(g, lang)}</td><td>{bestLabel(g.id, k, lang)}</td>
                <td><span className="who"><Avatar p={top.p} size={22} /> {pname(top.p, lang)}</span></td><td className="r num">{fmtTime(top.ms)}</td></tr>))}</tbody>
          </table></div>
        )}
      </Section>
    </>
  );
}

/** One of today's board puzzles, named by its kind once its pool has loaded. */
function BoardPuz({ g }: { g: BoardGame }) {
  const t = useT(), lang = useLang(), meta = metaOf(g), done = solvedToday(g), p = useTodaysPuzzle(g)?.p;
  return (
    <li className={done ? 'ok' : ''}><a href={'#' + g + '-daily'}><GameArt id={g} /><span><b>{meta ? gameName(meta, lang) : g}</b>
      <small>{!p ? '…' : p.kind === 'm1' ? t('Mate in one', '一步杀', 'Bir hamlede mat') : p.kind === 'm2' ? t('Mate in two', '两步杀', 'İki hamlede mat') : t(`Capture ${p.n} stones`, `提${p.n}子`, `${p.n} taş al`)}</small></span>
      {done ? <span className="job-ok">✓</span> : <span className="btn sm">{t('Solve', '去解', 'Çöz')}</span>}</a></li>
  );
}
