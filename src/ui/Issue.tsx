import { castName } from '../core/cast';
import { gameName, metaOf } from '../core/catalogue';
import { tasksFor, type Task } from '../core/daily';
import { useLang, useT } from '../core/i18n';
import { dayKey } from '../core/rng';
import { activeOf, dailyStreak, issueDone, useData } from '../core/store';
import { LEAGUE_NAMES } from '../games/football/leagues';
import { Face } from './Cast';
import { GameArt } from './art';

/** Today's issue: four jobs, each worth tea, with a bonus for finishing them all. */
export function IssueBox({ compact }: { compact?: boolean }) {
  const t = useT(), lang = useLang(), me = activeOf(useData()), day = dayKey();
  const tasks = tasksFor(day), done = issueDone(me, day), streak = dailyStreak(me);
  const gn = (id: string) => { const g = metaOf(id); return g ? gameName(g, lang) : id; };
  const row = (k: Task) => {
    const ok = done.includes(k.id);
    let title = '', desc = '', href = '#' + k.game;
    if (k.id === 'sudoku') { title = t('Daily Sudoku', '每日数独', 'Günün Sudokusu'); desc = t('9×9 Medium, the same grid for everyone.', '9×9 中等，人人同一盘。', '9×9 orta, herkese aynı ızgara.'); href = '#sudoku-daily'; }
    if (k.id === 'rival') { const n = castName(k.who ?? k.level!, lang); title = t(`Today’s rival: ${n}`, `今日对手：${n}`, `Günün rakibi: ${n}`); desc = t(`Beat ${n} (or someone stronger) at ${gn(k.game)}.`, `在${gn(k.game)}中打败${n}（或更强的对手）。`, `${gn(k.game)} masasında ${n}’ı (ya da daha güçlüsünü) yen.`); }
    if (k.id === 'puzzle') { title = t(`Puzzle of the day: ${gn(k.game)}`, `今日谜题：${gn(k.game)}`, `Günün bulmacası: ${gn(k.game)}`); desc = t('Solve one, any size.', '解出一题，大小不限。', 'Bir tane çöz, boyut fark etmez.'); }
    if (k.id === 'board') { title = t(`Board puzzle: ${gn(k.game)}`, `棋类谜题：${gn(k.game)}`, `Tahta bulmacası: ${gn(k.game)}`); desc = t('Mate in one or two, a tsume or a capture.', '一步或两步杀、诘将棋或提子题。', 'Bir ya da iki hamlede mat, tsume ya da taş alma.'); href = '#' + k.game + '-daily'; }
    if (k.id === 'f70') { const L = LEAGUE_NAMES[k.league!].name; title = t(`Today’s 7-0: ${L[0]}`, `今日7比0：${L[1]}`, `Günün 7-0’ı: ${L[2]}`); desc = t('Everyone rolls the same clubs today.', '今天大家抽到的球队都一样。', 'Bugün herkes aynı kulüpleri çekiyor.'); href = '#football-70-daily'; }
    return (
      <li key={k.id} className={'job' + (ok ? ' ok' : '')}>
        <span className="job-ic" aria-hidden="true">{k.id === 'rival' ? <Face level={k.who ?? k.level!} size={34} /> : <GameArt id={k.game} />}</span>
        <span className="job-body"><b>{title}</b>{!compact && <span>{desc}</span>}</span>
        {ok ? <span className="job-ok" aria-label={t('done', '已完成', 'tamam')}>✓</span> : <a className="btn sm" href={href}>{t('Play', '开始', 'Oyna')}</a>}
      </li>
    );
  };
  return (
    <section className="issue" aria-label={t('Today’s issue', '今日报纸', 'Günün sayısı')}>
      <header className="issue-head">
        <h2 className="box-flag">{t('Today’s issue', '今日报纸', 'Günün sayısı')}</h2>
        <span className="num">{done.length}/{tasks.length}</span>
      </header>
      <ol className="jobs">{tasks.map(row)}</ol>
      <p className="issue-foot">
        <span>{t('+5 🍵 a job, +10 🍵 for the full issue', '每项 +5 🍵，全部完成再 +10 🍵', 'Her iş +5 🍵, hepsi bitince +10 🍵')}</span>
        <span className="num">🔥 {t(`${streak}-day streak`, `连续${streak}天`, `${streak} günlük seri`)}</span>
      </p>
    </section>
  );
}
