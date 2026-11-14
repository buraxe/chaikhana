import { useState, type ReactNode } from 'react';
import { beginTurn, endRace, giveUpTurn, RACE_KEYS, startRace, useRace } from '../core/duel';
import { pname, trLabel, useLang, useT } from '../core/i18n';
import { activeOf, useData } from '../core/store';
import { fmtTime } from './bits';

/**
 * "Take turns" mode for one-player puzzles: everyone solves the same puzzle on this device,
 * one after another, and the fastest solve wins. Wraps the game screen.
 */
export function RaceStage({ game, children }: { game: string; children: (epoch: number) => ReactNode }) {
  const t = useT(), lang = useLang(), data = useData(), me = activeOf(data);
  const race = useRace(), r = race && race.game === game ? race : null;
  const [open, setOpen] = useState(false);
  const [names, setNames] = useState<string[]>(() => [pname(me, lang), data.profiles.find(p => p.id !== me.id)?.name ?? t('Player 2', '玩家2', 'Oyuncu 2')]);
  if (!RACE_KEYS[game]) return <>{children(0)}</>;
  const done = r && r.turn >= r.players.length;
  const ranking = r ? r.players.map((n, i) => ({ n, res: r.results[i] })).sort((a, b) => (a.res?.ok ? a.res.ms ?? 1e12 : 1e13) - (b.res?.ok ? b.res.ms ?? 1e12 : 1e13)) : [];
  const winner = done && ranking[0]?.res?.ok ? ranking[0].n : null;
  return (
    <>
      <div className="race-bar">
        {!r ? (
          <>
            <button type="button" id="race-toggle" className="btn sm" aria-expanded={open} onClick={() => setOpen(o => !o)}>
              {t('⇄ Take turns on this device', '⇄ 同机轮流比赛', '⇄ Bu cihazda sırayla yarış')}</button>
            {open && (
              <div className="race-setup">
                <p className="muted small">{t('Everyone solves the same puzzle, one after another. Set up the puzzle first, then start; the fastest solve wins. Results are not saved to profiles.', '所有人依次解同一道题。先设置好题目再开始，用时最短者获胜。成绩不会记入个人档案。', 'Herkes aynı bulmacayı sırayla çözer. Önce bulmacayı ayarla, sonra başlat; en hızlı çözen kazanır. Sonuçlar profillere kaydedilmez.')}</p>
                {names.map((n, i) => (
                  <div className="row" key={i}>
                    <input className="input" id={'race-name-' + i} value={n} maxLength={20} aria-label={t(`Player ${i + 1}`, `玩家${i + 1}`, `Oyuncu ${i + 1}`)} onChange={e => setNames(names.map((x, k) => (k === i ? e.target.value : x)))} />
                    {names.length > 2 && <button type="button" className="btn sm" onClick={() => setNames(names.filter((_, k) => k !== i))} aria-label={t('Remove', '移除', 'Çıkar')}>✕</button>}
                  </div>
                ))}
                <div className="row">
                  {names.length < 4 && <button type="button" id="race-add" className="btn sm" onClick={() => setNames([...names, t(`Player ${names.length + 1}`, `玩家${names.length + 1}`, `Oyuncu ${names.length + 1}`)])}>+ {t('Player', '玩家', 'Oyuncu')}</button>}
                  <button type="button" id="race-start" className="btn primary sm" onClick={() => { startRace(game, names.map((n, i) => n.trim() || t(`Player ${i + 1}`, `玩家${i + 1}`, `Oyuncu ${i + 1}`))); setOpen(false); }}>{t('Start the race', '开始比赛', 'Yarışı başlat')}</button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="race-live">
            <span className="race-tag">{t('Race', '比赛', 'Yarış')}</span>
            <ol className="race-players">
              {r.players.map((n, i) => (
                <li key={i} className={i === r.turn && !done ? 'on' : ''}>
                  <b>{n}</b> <span className="num">{r.results[i] ? (r.results[i]!.ok ? fmtTime(r.results[i]!.ms ?? 0) : t('gave up', '放弃', 'pes etti')) : i === r.turn ? t('playing', '进行中', 'oynuyor') : '–'}</span>
                </li>
              ))}
            </ol>
            {!done && !r.waiting && <button type="button" id="race-giveup" className="btn sm" onClick={giveUpTurn}>{t('Give up this turn', '放弃本轮', 'Bu turu bırak')}</button>}
            <button type="button" id="race-end" className="btn sm" onClick={endRace}>{t('End race', '结束比赛', 'Yarışı bitir')}</button>
          </div>
        )}
      </div>
      <div className="race-stage">
        {children(r ? r.epoch : 0)}
        {r && r.waiting && (
          <div className="race-cover" role="dialog" aria-modal="true">
            {done ? (
              <div className="race-card">
                <h3>{winner ? t(`${winner} wins!`, `${winner}获胜！`, `${winner} kazandı!`) : t('Nobody finished.', '没有人完成。', 'Kimse bitiremedi.')}</h3>
                <ol className="race-result">
                  {ranking.map(({ n, res }, i) => <li key={i}><span>{i + 1}. {n}</span><span className="num">{res?.ok ? fmtTime(res.ms ?? 0) : t('gave up', '放弃', 'pes etti')}</span>{res?.label && <small className="muted">{trLabel(res.label, lang)}</small>}</li>)}
                </ol>
                <div className="row">
                  <button type="button" id="race-again" className="btn primary" onClick={() => startRace(game, r.players)}>{t('Again, same puzzle', '同一道题再来', 'Aynı bulmacayla tekrar')}</button>
                  <button type="button" id="race-close" className="btn" onClick={endRace}>{t('Done', '完成', 'Bitti')}</button>
                </div>
              </div>
            ) : (
              <div className="race-card">
                <p className="muted">{t(`Turn ${r.turn + 1} of ${r.players.length}`, `第${r.turn + 1}轮，共${r.players.length}轮`, `Tur ${r.turn + 1} / ${r.players.length}`)}</p>
                <h3>{t(`${r.players[r.turn]}, your turn`, `轮到${r.players[r.turn]}`, `Sıra ${r.players[r.turn]} oyuncusunda`)}</h3>
                <p>{t('Hand over the device. The clock starts with your first move.', '把设备交给下一位。第一步开始计时。', 'Cihazı ver. Süre ilk hamlende başlar.')}</p>
                <button type="button" id="race-go" className="btn primary" onClick={beginTurn}>{t('I’m ready', '我准备好了', 'Hazırım')}</button>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
