import './football.css';
import { useEffect, useMemo, useState } from 'react';
import { sfx } from '../../core/sound';
import { pname, useLang, useT } from '../../core/i18n';
import { loadJSON, saveJSON } from '../../core/storage';
import { activeOf, getData, noteStarted, recordResult, useData } from '../../core/store';
import { dayKey, hashString } from '../../core/rng';
import { tasksFor } from '../../core/daily';
import { Seg } from '../../ui/bits';
import { LEAGUES, teamOf, teamsOf, type LeagueId, type Player, type Role } from './data';
import { MatchReplay, type Side } from './Replay';
import { drawPath, fit, FORMATIONS, rate, simulate, type Campaign, type Formation, type Style } from './sim';

type Mode = 'classic' | 'almanac';
interface Done { name: string; xi: Player[]; campaign: Campaign }
interface Run {
  league: LeagueId; mode: Mode; formation: Formation; style: Style; phase: 'setup' | 'draft' | 'playing' | 'result'; live: number;
  xi: (Player | null)[]; rolled: string | null; rerolls: number; seed: number; path: string[]; rolls: number;
  players: string[]; current: number; done: Done[]; campaign: Campaign | null; cover: boolean; day?: string;
}
const blank = (): Run => ({ league: 'giants', mode: 'classic', formation: '4-3-3', style: 'balanced', phase: 'setup', live: 0, xi: new Array(11).fill(null), rolled: null, rerolls: 2, seed: 1, path: [], rolls: 0, players: [], current: 0, done: [], campaign: null, cover: false });
const ROLE_TR: Record<Role, [string, string, string]> = {
  GK: ['GK', '门将', 'KL'], RB: ['RB', '右后卫', 'SĞB'], CB: ['CB', '中后卫', 'STP'], LB: ['LB', '左后卫', 'SLB'], DM: ['DM', '后腰', 'DOS'],
  CM: ['CM', '中场', 'MO'], AM: ['AM', '前腰', 'OOS'], RW: ['RW', '右边锋', 'SĞK'], LW: ['LW', '左边锋', 'SLK'], ST: ['ST', '中锋', 'FV'],
};

/** Today's 7-0: the same league and the same rolls for everyone on this date. */
function dailyRun(name: string): Run {
  const day = dayKey(), task = tasksFor(day).find(x => x.id === 'f70')!, seed = hashString('f70:' + day), league = task.league ?? 'giants';
  return { ...blank(), league, phase: 'draft', seed, path: drawPath(league, seed), players: [name], day };
}
export default function Football({ daily = false }: { daily?: boolean }) {
  const t = useT(), lang = useLang(), me = activeOf(useData());
  const KEY = daily ? 'gp.f70.daily' : 'gp.f70b';
  const [r, setR] = useState<Run>(() => {
    const s = loadJSON<Run | null>(KEY, null);
    if (daily) return s && s.day === dayKey() ? s : dailyRun(pname(me, lang));
    return s ?? blank();
  });
  const [sel, setSel] = useState(-1);
  const [names, setNames] = useState<string[]>(() => [pname(me, lang), t('Player 2', '玩家2', 'Oyuncu 2'), t('Player 3', '玩家3', 'Oyuncu 3'), t('Player 4', '玩家4', 'Oyuncu 4')]);
  const [count, setCount] = useState(1);
  const [copied, setCopied] = useState(false);
  const [best, setBest] = useState<Record<string, { name: string; w: number; d: number; l: number; champ: boolean; seven: boolean; score: number; t: number }[]>>(() => loadJSON('gp.f70.best', {}));
  useEffect(() => { saveJSON(KEY, r); }, [r, KEY]);
  useEffect(() => { saveJSON('gp.f70.best', best); }, [best]);
  const L = LEAGUES[r.league], slots = FORMATIONS[r.formation];
  const tl = (x: [string, string, string]) => t(x[0], x[1], x[2]);
  const clubName = (key: string) => { const tm = teamOf(key); if (!tm) return key; return (lang === 'zh' && tm.club.zh ? tm.club.zh : tm.club.name); };
  const teamName = (key: string) => `${clubName(key)} · ${teamOf(key)?.season.label ?? ''}`;
  const roleName = (ro: Role) => tl(ROLE_TR[ro]);
  // One man can't play twice, even from two different seasons.
  const picked = new Set(r.xi.filter(Boolean).map(p => p!.name));
  const filled = r.xi.filter(Boolean).length;
  const rated = useMemo(() => rate(r.xi, slots, r.style), [r.xi, slots, r.style]);
  const STAGES = [t('Group 1', '小组赛1', 'Grup 1'), t('Group 2', '小组赛2', 'Grup 2'), t('Group 3', '小组赛3', 'Grup 3'), t('Round of 16', '16强', 'Son 16'), t('Quarter-final', '四分之一决赛', 'Çeyrek final'), t('Semi-final', '半决赛', 'Yarı final'), t('Final', '决赛', 'Final')];

  const start = () => {
    const seed = (Date.now() ^ Math.floor(Math.random() * 1e9)) >>> 0, players = names.slice(0, count).map((n, i) => n.trim() || t(`Player ${i + 1}`, `玩家${i + 1}`, `Oyuncu ${i + 1}`));
    noteStarted('football-70');
    setR({ ...r, phase: 'draft', xi: new Array(11).fill(null), rolled: null, rerolls: 2, seed, path: drawPath(r.league, seed), rolls: 0, players, current: 0, done: [], campaign: null, cover: count > 1 });
    setSel(-1);
  };
  // Rolls follow the seed, so every player in a same-device game sees the same sequence of clubs.
  const roll = (reroll = false) => {
    sfx('card');
    const keys = teamsOf(r.league), k = r.rolls + 1, x = Math.sin(r.seed * 9301 + k * 49297) * 233280;
    const id = keys[Math.floor((x - Math.floor(x)) * keys.length)];
    setR({ ...r, rolled: id, rolls: k, rerolls: reroll ? r.rerolls - 1 : r.rerolls });
  };
  const place = (p: Player) => {
    if (!r.rolled || picked.has(p.name)) return;
    let k = sel >= 0 && !r.xi[sel] ? sel : -1;
    if (k < 0) { let bestV = -1; slots.forEach((s, i) => { if (!r.xi[i]) { const v = fit(p.role, s.role) * 100 + p.rating / 100; if (v > bestV) { bestV = v; k = i; } } }); }
    if (k < 0) return;
    const xi = r.xi.slice(); xi[k] = p;
    setR({ ...r, xi, rolled: null }); setSel(-1);
  };
  const play = () => {
    const xi = r.xi as Player[], campaign = simulate(xi, slots, r.style, r.path, r.seed + 17);
    setR({ ...r, phase: 'playing', live: 0, campaign });
  };
  // The result counts, and shows in the best runs, only once the replay is over.
  const finish = () => {
    const xi = r.xi as Player[], campaign = r.campaign!;
    const who = r.players[r.current] ?? pname(me, lang);
    if (r.players.length <= 1) recordResult(getData().activeId, 'football-70', { result: campaign.champion ? 'win' : 'loss', label: `${L.name[0]} · ${campaign.wins}W ${campaign.draws}D ${campaign.losses}L${campaign.sevenZero ? ' · 7-0' : ''}${daily ? ' · daily' : ''}` });
    const entry = { name: who, w: campaign.wins, d: campaign.draws, l: campaign.losses, champ: campaign.champion, seven: campaign.sevenZero, score: campaign.score, t: Date.now() };
    setBest(b => ({ ...b, [r.league]: [...(b[r.league] ?? []), entry].sort((a, c) => c.score - a.score).slice(0, 8) }));
    setR({ ...r, phase: 'result', campaign, done: [...r.done, { name: who, xi, campaign }] });
  };
  const nextPlayer = () => setR({ ...r, phase: 'draft', live: 0, current: r.current + 1, xi: new Array(11).fill(null), rolled: null, rerolls: 2, rolls: 0, campaign: null, cover: true });
  const share = async (c: Campaign) => {
    const lines = [`7-0 · ${tl(L.name)} · ${r.formation}`, c.matches.map(m => `${m.result === 'W' ? '🟩' : m.result === 'D' ? '🟨' : '🟥'}`).join(''),
      `${c.wins}-${c.draws}-${c.losses} · ${c.gf}:${c.ga}${c.sevenZero ? ' · 7-0!' : c.champion ? ' · 🏆' : ''}`, (r.xi as Player[]).map(p => p.name).join(', ')];
    try { await navigator.clipboard.writeText(lines.join('\n')); setCopied(true); setTimeout(() => setCopied(false), 1800); } catch { /* clipboard refused */ }
  };

  const rolledTeam = r.rolled ? teamOf(r.rolled) ?? null : null, rolledClub = rolledTeam?.club ?? null;
  const showRating = r.mode === 'classic';
  const c = r.campaign;
  const banner = c ? (c.sevenZero ? t('7-0! Seven wins out of seven.', '7比0！七战全胜。', '7-0! Yedide yedi galibiyet.') : c.champion ? t(`Champions! ${c.wins} wins, ${c.draws} draws.`, `夺冠！${c.wins}胜${c.draws}平。`, `Şampiyon! ${c.wins} galibiyet, ${c.draws} beraberlik.`) : (c.out <= 2 ? t('Out in the group stage.', '小组赛出局。', 'Grupta elendi.') : t(`Out in the ${STAGES[c.out]}.`, `止步${STAGES[c.out]}。`, `${STAGES[c.out]} turunda elendi.`))) : '';
  const lastPlayer = r.current >= r.players.length - 1;

  return (
    <div className="play fb">
      <div className="play-main">
        {r.phase === 'setup' && (
          <div className="fb-setup">
            <p className="lede">{t('Roll a club from one of its seasons (today’s squad or a legendary one), take one of its players, fill your XI and play a seven-match cup run, minute by minute. Seven wins out of seven is the 7-0.', '抽一支球队的某个赛季（现役或传奇阵容），从中选一名球员，凑齐首发十一人，然后一分钟一分钟地踢完七场杯赛。七战全胜就是7比0。', 'Bir kulübü sezonuyla çek (bugünkü kadrosu ya da efsane bir kadrosu), içinden bir oyuncu al, ilk on birini tamamla ve yedi maçlık kupa yolunu dakika dakika izle. Yedide yedi galibiyet 7-0’dır.')}</p>
            <div className="fb-leagues" role="group" aria-label={t('League', '联赛', 'Lig')}>
              {(Object.keys(LEAGUES) as LeagueId[]).map(id => (
                <button key={id} type="button" id={'fb-lg-' + id} className={'fb-league ' + id + (r.league === id ? ' on' : '')} aria-pressed={r.league === id} onClick={() => setR({ ...r, league: id })}>
                  <b>{tl(LEAGUES[id].name)}</b><span>{(() => { const n = LEAGUES[id].clubs.length, sq = teamsOf(id).length; return t(`${n} clubs · ${sq} squads`, `${n}支球队 · ${sq}套阵容`, `${n} kulüp · ${sq} kadro`); })()} · {tl(LEAGUES[id].cup)}</span>
                </button>
              ))}
            </div>
            <div className="fb-opts">
              <Seg id="fb-mode" label={t('Mode', '模式', 'Mod')} value={r.mode} onChange={v => setR({ ...r, mode: v })}
                options={[{ value: 'classic', label: t('Classic', '经典', 'Klasik') }, { value: 'almanac', label: t('Almanac (no ratings)', '年鉴（隐藏评分）', 'Almanak (puansız)') }]} />
              <div className="field"><label className="field-label" htmlFor="fb-form">{t('Formation', '阵型', 'Diziliş')}</label>
                <select id="fb-form" className="input" value={r.formation} onChange={e => setR({ ...r, formation: e.target.value as Formation })}>{(Object.keys(FORMATIONS) as Formation[]).map(f => <option key={f}>{f}</option>)}</select></div>
              <Seg id="fb-style" label={t('Style', '风格', 'Oyun tarzı')} value={r.style} onChange={v => setR({ ...r, style: v })}
                options={[{ value: 'defensive', label: t('Defensive', '防守', 'Savunma') }, { value: 'balanced', label: t('Balanced', '均衡', 'Dengeli') }, { value: 'attacking', label: t('Attacking', '进攻', 'Hücum') }]} />
              <Seg id="fb-count" label={t('Players on this device', '同机玩家', 'Bu cihazdaki oyuncular')} value={count} onChange={setCount} options={[1, 2, 3, 4].map(n => ({ value: n, label: String(n) }))} />
              {count > 1 && names.slice(0, count).map((n, i) => (
                <input key={i} className="input" id={'fb-name-' + i} value={n} maxLength={20} aria-label={t(`Player ${i + 1}`, `玩家${i + 1}`, `Oyuncu ${i + 1}`)} onChange={e => setNames(names.map((x, j) => (j === i ? e.target.value : x)))} />
              ))}
            </div>
            <button type="button" id="fb-start" className="btn primary" onClick={start}>{t('Start the draft', '开始选人', 'Seçime başla')}</button>
          </div>
        )}

        {r.phase !== 'setup' && r.cover && (
          <div className="race-card fb-cover">
            <h3>{t(`${r.players[r.current]}, your draft`, `轮到${r.players[r.current]}选人`, `Sıra ${r.players[r.current]} oyuncusunda`)}</h3>
            <p className="muted">{t('Everyone gets the same clubs in the same order and plays the same opponents.', '每个人抽到的球队顺序相同，对手也相同。', 'Herkese aynı kulüpler aynı sırayla gelir ve aynı rakiplerle oynanır.')}</p>
            <button type="button" id="fb-ready" className="btn primary" onClick={() => setR({ ...r, cover: false })}>{t('I’m ready', '我准备好了', 'Hazırım')}</button>
          </div>
        )}

        {r.phase === 'draft' && !r.cover && (
          <div className="fb-draft">
            <div className="statline"><span role="status" aria-live="polite">{filled < 11 ? (r.players.length > 1 ? `${r.players[r.current]} · ` : '') + t(`Pick ${filled + 1} of 11`, `第${filled + 1}/11人`, `Seçim ${filled + 1} / 11`) : t('Your XI is ready.', '首发十一人已就位。', 'İlk on birin hazır.')}</span>
              <span className="num">{tl(L.name)} · {r.formation}{showRating ? ` · ${t('Rating', '评分', 'Güç')} ${Math.round(rated.overall)}` : ''}</span></div>
            <div className="fb-board">
              <div className="fb-pitch" role="group" aria-label={t('Your XI. Tap a position, then a player.', '你的首发。先点位置，再点球员。', 'İlk on birin. Önce bir mevkiye, sonra bir oyuncuya dokun.')}>
                <div className="fb-lines" aria-hidden="true"><i className="box b1" /><i className="box b2" /><i className="circle" /><i className="half" /></div>
                {slots.map((s, i) => {
                  const p = r.xi[i], f = p ? fit(p.role, s.role) : 1;
                  return (
                    <button key={i} type="button" className={'fb-slot' + (p ? ' full' : '') + (sel === i ? ' sel' : '') + (p && f < 0.8 ? ' poor' : '')} style={{ left: s.x + '%', top: s.y + '%' }}
                      onClick={() => setSel(sel === i ? -1 : i)} aria-label={`${roleName(s.role)}${p ? ': ' + p.name : ''}`}>
                      <span className="fb-dot">{p ? (showRating ? Math.round(p.rating * f) : '✓') : roleName(s.role)}</span>
                      <span className="fb-name">{p ? p.name : ''}</span>
                    </button>
                  );
                })}
              </div>
              <div className="fb-side">
                {filled < 11 ? (rolledClub ? (
                  <div className="fb-club">
                    <div className="fb-club-head" style={{ ['--c1' as string]: rolledClub.colors[0], ['--c2' as string]: rolledClub.colors[1] }}>
                      <span className="fb-crest" aria-hidden="true">{rolledClub.short}</span><b>{clubName(r.rolled!)}</b><span className="fb-season num">{rolledTeam!.season.label}</span>
                    </div>
                    <p className="muted small">{sel >= 0 ? t(`Choosing for ${roleName(slots[sel].role)}.`, `正在为${roleName(slots[sel].role)}选人。`, `${roleName(slots[sel].role)} için seçiyorsun.`) : t('Tap a player; they go to the open position that suits them best. Or tap a position on the pitch first.', '点一名球员，他会进入最合适的空位。也可以先点球场上的位置。', 'Bir oyuncuya dokun; ona en uygun boş mevkiye geçer. İstersen önce sahada bir mevkiye dokun.')}</p>
                    <ul className="fb-squad">
                      {rolledTeam!.season.squad.slice().sort((a, b) => 'GK RB CB LB DM CM AM RW LW ST'.indexOf(a.role) - 'GK RB CB LB DM CM AM RW LW ST'.indexOf(b.role)).map(p => {
                        const f = sel >= 0 ? fit(p.role, slots[sel].role) : null, gone = picked.has(p.name);
                        return (
                          <li key={p.id}><button type="button" className={'fb-pl' + (gone ? ' gone' : '') + (f !== null && f < 0.8 ? ' poor' : '')} disabled={gone || (sel >= 0 && !!r.xi[sel])} onClick={() => place(p)}>
                            <span className="fb-role">{roleName(p.role)}</span><span className="fb-pn">{p.name}</span>
                            <span className="fb-rt num">{showRating ? (f !== null ? `${p.rating} → ${Math.round(p.rating * f)}` : p.rating) : f !== null ? `${Math.round(f * 100)}%` : ''}</span>
                          </button></li>
                        );
                      })}
                    </ul>
                    <button type="button" id="fb-reroll" className="btn sm" disabled={r.rerolls <= 0} onClick={() => roll(true)}>{t(`Reroll (${r.rerolls} left)`, `重抽（剩${r.rerolls}次）`, `Yeniden çek (${r.rerolls} hak)`)}</button>
                  </div>
                ) : (
                  <div className="fb-roll">
                    <button type="button" id="fb-roll" className="btn primary fb-roll-btn" onClick={() => roll()}>🎲 {t('Roll a club', '抽一支球队', 'Kulüp çek')}</button>
                    <p className="muted small">{t('Fill the scarce positions first: goalkeeper, centre-backs and full-backs run out fast.', '先补稀缺位置：门将、中后卫和边后卫最难找。', 'Önce az bulunan mevkileri doldur: kaleci, stoper ve bekler çabuk tükenir.')}</p>
                  </div>
                )) : (
                  <div className="fb-roll">
                    {showRating && <dl className="facts"><div><dt>{t('Attack', '进攻', 'Hücum')}</dt><dd className="num">{Math.round(rated.att)}</dd></div><div><dt>{t('Midfield', '中场', 'Orta saha')}</dt><dd className="num">{Math.round(rated.mid)}</dd></div><div><dt>{t('Defence', '防守', 'Savunma')}</dt><dd className="num">{Math.round(rated.def)}</dd></div><div><dt>{t('Chemistry', '默契', 'Uyum')}</dt><dd className="num">+{rated.chem.toFixed(1)}</dd></div></dl>}
                    <button type="button" id="fb-play" className="btn primary fb-roll-btn" onClick={play}>{t(`Play the ${tl(L.cup)}`, `出战${tl(L.cup)}`, `${tl(L.cup)} yoluna çık`)}</button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {r.phase === 'playing' && c && c.matches[r.live] && (() => {
          const m = c.matches[r.live], opp = teamOf(m.opp), last = r.live >= c.matches.length - 1;
          const pts = c.matches.slice(0, 3).reduce((a, x) => a + (x.result === 'W' ? 3 : x.result === 'D' ? 1 : 0), 0);
          const note = r.live === 2 ? (c.out === 2 ? t(`Out in the group with ${pts} points.`, `小组赛仅得${pts}分，出局。`, `${pts} puanla grupta elendin.`) : t(`Through to the knockouts with ${pts} points!`, `小组赛积${pts}分，晋级淘汰赛！`, `${pts} puanla gruptan çıktın, eleme turları başlıyor!`))
            : last && c.champion ? (c.sevenZero ? t('Seven out of seven. The 7-0!', '七战全胜，7比0！', 'Yedide yedi. İşte 7-0!') : t('You lift the cup!', '你捧起了奖杯！', 'Kupayı kaldırdın!'))
            : last && r.live >= 3 ? t('The cup run ends here.', '杯赛之旅到此为止。', 'Kupa macerası burada bitti.') : undefined;
          const home: Side = { name: r.players.length > 1 ? r.players[r.current] : t('Your XI', '你的阵容', 'Senin 11’in'), short: t('YOU', '你', 'SEN'), colors: ['#a3262a', '#fff8ee'] };
          const away: Side = { name: teamName(m.opp), short: opp?.club.short ?? '?', colors: opp?.club.colors ?? ['#888', '#fff'] };
          const pips = STAGES.map((_, i) => (i < r.live ? c.matches[i].result : i === r.live ? 'now' : '') as 'W' | 'D' | 'L' | 'now' | '');
          return <MatchReplay key={r.live} m={m} stage={`${STAGES[m.stage]} · ${tl(L.cup)}`} home={home} away={away} pips={pips} note={note}
            nextLabel={last ? t('See the cup run', '查看战绩', 'Sonuçları gör') : t(`Next: ${STAGES[r.live + 1]}`, `下一场：${STAGES[r.live + 1]}`, `Sıradaki maç: ${STAGES[r.live + 1]}`)}
            onNext={() => (last ? finish() : setR({ ...r, live: r.live + 1 }))} onSkipAll={finish} />;
        })()}

        {r.phase === 'result' && c && !r.cover && (
          <div className="fb-result">
            <div className={'fb-banner' + (c.sevenZero ? ' seven' : c.champion ? ' champ' : '')}><span>{r.players.length > 1 ? r.players[r.current] + ' · ' : ''}{tl(L.cup)}</span><b>{banner}</b>
              <span className="num">{c.wins}–{c.draws}–{c.losses} · {c.gf}:{c.ga}</span></div>
            <ol className="fb-matches">
              {c.matches.map((m, i) => (
                <li key={i} className={'r' + m.result}>
                  <span className="fb-stage">{STAGES[m.stage]}</span>
                  <span className="fb-opp">{t('vs', '对', '–')} {teamName(m.opp)}</span>
                  <span className="fb-score num">{m.gf}–{m.ga}{m.et ? (m.pens ? t(` (pens ${m.pens[0]}–${m.pens[1]})`, `（点球${m.pens[0]}–${m.pens[1]}）`, ` (pen. ${m.pens[0]}–${m.pens[1]})`) : t(' aet', '（加时）', ' uz.')) : ''}</span>
                  <span className="fb-goals">{m.goals.filter(g => g.us).map(g => `${g.who} ${g.min}′${g.pen ? t(' (pen)', '（点）', ' (p)') : ''}`).join(', ')}</span>
                </li>
              ))}
            </ol>
            <div className="row">
              <button type="button" id="fb-share" className="btn" onClick={() => share(c)}>{copied ? t('Copied', '已复制', 'Kopyalandı') : t('Copy result', '复制结果', 'Sonucu kopyala')}</button>
              {r.players.length > 1 && !lastPlayer ? <button type="button" id="fb-next" className="btn primary" onClick={nextPlayer}>{t(`Next: ${r.players[r.current + 1]}`, `下一位：${r.players[r.current + 1]}`, `Sıradaki: ${r.players[r.current + 1]}`)}</button>
                : daily ? <p className="muted">{t('That was today’s 7-0. A new league and new rolls arrive at midnight.', '这是今天的7比0。新联赛和新抽签将在零点更新。', 'Bugünün 7-0’ı buydu. Yeni lig ve yeni çekilişler gece yarısı geliyor.')}</p>
                : <button type="button" id="fb-again" className="btn primary" onClick={() => setR({ ...r, phase: 'setup' })}>{t('New draft', '重新选人', 'Yeni kadro')}</button>}
            </div>
            {r.players.length > 1 && lastPlayer && (
              <div className="fb-standings">
                <h3>{t('Same-device standings', '同机排名', 'Bu cihazdaki sıralama')}</h3>
                <ol>{r.done.slice().sort((a, b) => b.campaign.score - a.campaign.score).map((d, i) => (
                  <li key={i}><b>{i + 1}. {d.name}</b><span className="num">{d.campaign.wins}–{d.campaign.draws}–{d.campaign.losses}{d.campaign.sevenZero ? ' · 7-0' : d.campaign.champion ? ' · 🏆' : ''}</span></li>
                ))}</ol>
              </div>
            )}
          </div>
        )}
      </div>
      <aside className="play-side">
        <h3>{t('Best runs', '最佳战绩', 'En iyi yollar')} · {tl(L.name)}</h3>
        {(best[r.league] ?? []).length === 0 ? <p className="muted small">{t('No runs yet in this league.', '这个联赛还没有战绩。', 'Bu ligde henüz yol yok.')}</p> : (
          <ol className="fb-best">{(best[r.league] ?? []).map((b, i) => <li key={i}><span>{b.name}</span><span className="num">{b.w}–{b.d}–{b.l}{b.seven ? ' · 7-0' : b.champ ? ' · 🏆' : ''}</span></li>)}</ol>
        )}
        <p className="muted small">{t('A player keeps full strength in his own position and loses some in a nearby one; out of position he is much weaker. Players from the same club add chemistry, even from different seasons; teammates from the same season add a little more. Every club and player here is fictional.', '球员在本位发挥全部实力，在相近位置略有下降，打错位置会弱很多。同一俱乐部的球员会增加默契，即使来自不同赛季；同一赛季的队友加得更多。这里的球队和球员都是虚构的。', 'Oyuncu kendi mevkisinde tam güçtedir, yakın mevkide biraz düşer, yabancı mevkide çok zayıflar. Aynı kulüpten oyuncular farklı sezonlardan olsa da uyum katar; aynı sezondan olanlar biraz daha fazla. Buradaki bütün kulüpler ve oyuncular kurgusaldır.')}</p>
        {r.phase !== 'setup' && !daily && <button type="button" id="fb-quit" className="btn sm" onClick={() => setR({ ...r, phase: 'setup' })}>{t('Back to setup', '返回设置', 'Ayarlara dön')}</button>}
      </aside>
    </div>
  );
}
