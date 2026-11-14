import './football.css';
import { useEffect, useMemo, useRef, useState } from 'react';
import { sfx } from '../../core/sound';
import { useT } from '../../core/i18n';
import type { Match, Moment } from './sim';

export interface Side { name: string; short: string; colors: [string, string] }
type Line = { key: string; min: number; kind: 'mark' | Moment['type'] | 'kick'; us?: boolean; text: string; big?: boolean; ok?: boolean };

/**
 * Plays one match back minute by minute: a ticking clock, a scoreboard and a feed of the big
 * moments, then the shoot-out kick by kick. Goals hold the clock for a beat so they land.
 */
export function MatchReplay({ m, stage, home, away, pips, note, nextLabel, onNext, onSkipAll }: {
  m: Match; stage: string; home: Side; away: Side; pips: ('W' | 'D' | 'L' | 'now' | '')[];
  note?: string; nextLabel: string; onNext: () => void; onSkipAll: () => void;
}) {
  const t = useT();
  const end = m.et ? 120 : 90, kicks = m.shootout ?? [];
  const [clock, setClock] = useState(-1);
  const [kick, setKick] = useState(0);
  const [fast, setFast] = useState(false);
  const feedRef = useRef<HTMLOListElement>(null);
  const done = clock >= end && kick >= kicks.length;

  useEffect(() => {
    if (done) return;
    const at = m.moments.filter(x => x.min === clock);
    let wait = clock < 0 ? 700 : 70;
    if (at.some(x => x.type === 'goal')) wait = 1500;
    else if (at.length) wait = 520;
    if (clock === 45 || (clock === 90 && m.et) || (clock === 105 && m.et)) wait = Math.max(wait, 1100);
    if (clock >= end) wait = kick === 0 ? 1300 : 1100;
    const id = setTimeout(() => (clock < end ? setClock(c => c + 1) : setKick(k => k + 1)), fast ? Math.max(25, wait / 4) : wait);
    return () => clearTimeout(id);
  }, [clock, kick, fast, done, end, m]);

  const gf = m.moments.filter(x => x.type === 'goal' && x.us && x.min <= clock).length;
  const ga = m.moments.filter(x => x.type === 'goal' && !x.us && x.min <= clock).length;
  const shown = kicks.slice(0, kick), pa = shown.filter(k => k.us && k.scored).length, pb = shown.filter(k => !k.us && k.scored).length;
  const sofar = m.moments.filter(x => x.type === 'goal' && x.min <= clock), lastGoal = sofar[sofar.length - 1];
  const flash = lastGoal && clock - lastGoal.min <= 0 ? lastGoal : null;

  const say = (x: Moment): string => {
    const v = x.min % 3;
    switch (x.type) {
      case 'goal':
        if (x.pen) return t(`GOAL! ${x.who} sends the keeper the wrong way from the spot.`, `进球！${x.who}点球命中！`, `GOL! ${x.who} penaltıdan affetmedi!`);
        if (x.assist) return [t(`GOAL! ${x.who} finishes ${x.assist}'s pass.`, `进球！${x.assist}助攻，${x.who}破门！`, `GOL! ${x.assist} pasında ${x.who} topu ağlara gönderdi!`),
          t(`GOAL! ${x.assist} crosses, ${x.who} heads it in!`, `进球！${x.assist}传中，${x.who}头球破门！`, `GOL! ${x.assist} ortaladı, ${x.who} kafayı vurdu!`),
          t(`GOAL! ${x.assist} slips ${x.who} through, and he slots it home.`, `进球！${x.assist}直塞，${x.who}冷静推射！`, `GOL! ${x.assist} ara pası verdi, ${x.who} soğukkanlı bitirdi!`)][v];
        return [t(`GOAL! ${x.who} with a thunderbolt from distance!`, `进球！${x.who}远射破门！`, `GOL! ${x.who} uzaktan füzeyi çaktı!`),
          t(`GOAL! ${x.who} beats two men and scores!`, `进球！${x.who}连过两人破门！`, `GOL! ${x.who} iki kişiyi geçip golü attı!`),
          t(`GOAL! ${x.who} pounces on the rebound.`, `进球！${x.who}补射得手！`, `GOL! ${x.who} dönen topu affetmedi!`)][v];
      case 'save': return [t(`${x.who} shoots, the keeper saves.`, `${x.who}射门，被门将扑出。`, `${x.who} vurdu, kaleci gole izin vermedi.`),
        t(`Great save from ${x.who}'s header!`, `${x.who}头球攻门，门将神扑！`, `${x.who} kafayı vurdu, kaleciden müthiş kurtarış!`),
        t(`${x.who} one-on-one, but the keeper stands tall.`, `${x.who}单刀，被门将封堵。`, `${x.who} karşı karşıya kaldı ama kaleci kazandı.`)][v];
      case 'miss': return [t(`${x.who} drags it just wide.`, `${x.who}射门稍稍偏出。`, `${x.who} az farkla auta yolladı.`),
        t(`${x.who} blazes it over the bar.`, `${x.who}一脚打飞。`, `${x.who} topu tribüne gönderdi.`),
        t(`${x.who} free on the edge of the box… wide!`, `${x.who}禁区边缘无人盯防……偏了！`, `${x.who} ceza sahası önünde boştaydı… dışarı!`)][v];
      case 'post': return t(`${x.who} hits the woodwork!`, `${x.who}击中门框！`, `${x.who} direğe nişanladı, top direkten döndü!`);
      case 'yellow': return t(`Yellow card for ${x.who}.`, `${x.who}吃到黄牌。`, `${x.who} sarı kart gördü.`);
    }
  };

  const lines = useMemo(() => {
    const out: Line[] = [];
    if (clock >= 0) out.push({ key: 'ko', min: 0, kind: 'mark', text: t('Kick-off!', '比赛开始！', 'Başlama düdüğü çaldı!') });
    let a = 0, b = 0;
    const score = (upTo: number) => { a = m.moments.filter(x => x.type === 'goal' && x.us && x.min <= upTo).length; b = m.moments.filter(x => x.type === 'goal' && !x.us && x.min <= upTo).length; return `${a}–${b}`; };
    for (const x of m.moments) {
      if (x.min > clock) break;
      if (x.min > 45 && !out.some(l => l.key === 'ht')) out.push({ key: 'ht', min: 45, kind: 'mark', text: t(`Half-time · ${score(45)}`, `半场 · ${score(45)}`, `Devre arası · ${score(45)}`) });
      if (x.min > 90 && !out.some(l => l.key === 'et')) out.push({ key: 'et', min: 90, kind: 'mark', text: t(`Full time ${score(90)} — extra time!`, `常规时间${score(90)}——进入加时！`, `Normal süre ${score(90)} — uzatmalara gidiyoruz!`) });
      out.push({ key: `${x.min}-${x.type}-${x.who}`, min: x.min, kind: x.type, us: x.us, text: say(x), big: x.type === 'goal' });
    }
    if (clock >= 45 && !out.some(l => l.key === 'ht')) out.push({ key: 'ht', min: 45, kind: 'mark', text: t(`Half-time · ${score(45)}`, `半场 · ${score(45)}`, `Devre arası · ${score(45)}`) });
    if (m.et && clock >= 90 && !out.some(l => l.key === 'et')) out.push({ key: 'et', min: 90, kind: 'mark', text: t(`Full time ${score(90)} — extra time!`, `常规时间${score(90)}——进入加时！`, `Normal süre ${score(90)} — uzatmalara gidiyoruz!`) });
    if (clock >= end) {
      const s = score(end);
      out.push({ key: 'ft', min: end, kind: 'mark', text: kicks.length ? t(`Still ${s} after 120 minutes — penalties!`, `120分钟战成${s}——点球大战！`, `120 dakika sonunda ${s} — seri penaltılar!`) : t(`Full time · ${s}`, `全场结束 · ${s}`, `Maç sonu · ${s}`) });
    }
    shown.forEach((k, i) => out.push({ key: 'k' + i, min: end, kind: 'kick', us: k.us, ok: k.scored, text: k.scored ? t(`${k.who} scores.`, `${k.who}罚进。`, `${k.who} — gol.`) : t(`${k.who} misses!`, `${k.who}罚失！`, `${k.who} — kaçırdı!`) }));
    return out.reverse();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clock, kick, m, t]);

  useEffect(() => { feedRef.current?.scrollTo({ top: 0 }); }, [lines.length]);
  // Whistles and goals.
  useEffect(() => {
    if (clock === 0 || clock === 45 || (m.et && (clock === 90 || clock === 105)) || clock === end) sfx('whistle');
    const at = m.moments.filter(x => x.min === clock);
    if (at.some(x => x.type === 'goal')) sfx('goal');
    else if (at.some(x => x.type === 'post')) sfx('ball');
  }, [clock]); // eslint-disable-line
  useEffect(() => { const k = kicks[kick - 1]; if (k) sfx(k.scored ? 'goal' : 'error', k.scored ? 0.6 : 1); }, [kick]); // eslint-disable-line

  const minute = clock < 0 ? '0′' : clock >= end ? (kicks.length && kick < kicks.length ? t('PENS', '点球', 'PEN') : t('FT', '完场', 'MS')) : `${Math.min(clock, end)}′`;
  const won = m.result === 'W' || (m.pens && m.pens[0] > m.pens[1]);
  const lost = m.result === 'L' || (m.pens && m.pens[0] < m.pens[1]);
  const verdict = won ? t('Win!', '胜利！', 'Galibiyet!') : lost ? t('Defeat.', '失利。', 'Mağlubiyet.') : t('Draw.', '平局。', 'Beraberlik.');
  const crest = (s: Side) => <span className="fb-crest" style={{ background: s.colors[0], color: s.colors[1] }} aria-hidden="true">{s.short}</span>;

  return (
    <div className="fb-live">
      <ol className="fb-pips" aria-label={t('Cup run', '杯赛进程', 'Kupa yolu')}>
        {pips.map((p, i) => <li key={i} className={'p' + (p || 'x')} />)}
      </ol>
      <div className={'fb-board-live' + (flash ? ' goal ' + (flash.us ? 'us' : 'them') : '')}>
        <span className="fb-stage-live">{stage}</span>
        <div className="fb-teams">
          <div className="fb-team">{crest(home)}<b>{home.name}</b></div>
          <div className="fb-scoreline num" aria-live="polite">
            <span>{gf}</span><i>–</i><span>{ga}</span>
            {kicks.length > 0 && clock >= end && <small>({pa}–{pb} {t('pens', '点球', 'pen.')})</small>}
          </div>
          <div className="fb-team away">{crest(away)}<b>{away.name}</b></div>
        </div>
        <div className="fb-clock num"><span className={done ? '' : 'tick'}>{minute}</span>
          <i className="fb-bar" style={{ width: `${Math.max(0, Math.min(1, clock / end)) * 100}%` }} /></div>
        {flash && <div className="fb-goalflash" key={flash.min + flash.who}>{t('GOAL!', '进球！', 'GOOOL!')}</div>}
      </div>
      {kicks.length > 0 && clock >= end && (
        <div className="fb-pens" aria-label={t('Shoot-out', '点球大战', 'Seri penaltılar')}>
          {[true, false].map(us => (
            <div key={String(us)} className="fb-pen-row"><span>{us ? home.short : away.short}</span>
              {kicks.map((k, i) => (k.us === us ? <i key={i} className={i < kick ? (k.scored ? 'in' : 'out') : ''} /> : null))}</div>
          ))}
        </div>
      )}
      <ol className="fb-feed" ref={feedRef}>
        {lines.map(l => (
          <li key={l.key} className={'fb-ev ' + l.kind + (l.us === undefined ? '' : l.us ? ' us' : ' them') + (l.big ? ' gl' : '')}>
            <span className="fb-min num">{l.kind === 'kick' ? t('P', '点', 'P') : l.kind === 'mark' ? '' : `${l.min}′`}</span>
            <span className="fb-ico" aria-hidden="true">{({ goal: '⚽', save: '🧤', miss: '↗', post: '▮', yellow: '🟨', kick: l.ok ? '✅' : '❌', mark: '⏱' } as Record<string, string>)[l.kind]}</span>
            <span className="fb-txt">{l.us !== undefined && <span className="fb-tag" style={{ background: (l.us ? home : away).colors[0], color: (l.us ? home : away).colors[1] }}>{(l.us ? home : away).short}</span>}{l.text}</span>
          </li>
        ))}
      </ol>
      <div className="row fb-live-ctl">
        {!done ? <>
          <button type="button" id="fb-fast" className={'btn sm' + (fast ? ' on' : '')} aria-pressed={fast} onClick={() => setFast(!fast)}>{t('Fast ×4', '快进×4', 'Hızlı ×4')}</button>
          <button type="button" id="fb-skip" className="btn sm" onClick={() => { setClock(end); setKick(kicks.length); }}>{t('Skip match', '跳过本场', 'Maçı atla')}</button>
          <button type="button" id="fb-skipall" className="btn sm" onClick={onSkipAll}>{t('Straight to results', '直接看结果', 'Sonuçlara geç')}</button>
        </> : <>
          <p className={'fb-verdict ' + (won ? 'w' : lost ? 'l' : 'd')}><b>{verdict}</b>{note && <span>{note}</span>}</p>
          <button type="button" id="fb-nextmatch" className="btn primary" onClick={onNext}>{nextLabel}</button>
        </>}
      </div>
    </div>
  );
}
