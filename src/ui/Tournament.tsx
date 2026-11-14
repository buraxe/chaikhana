import './Tournament.css';
import { useEffect, useState } from 'react';
import { gameName, metaOf } from '../core/catalogue';
import { useLang, useT } from '../core/i18n';
import { shuffle } from '../core/rng';
import { sfx } from '../core/sound';
import { loadJSON, saveJSON } from '../core/storage';
import { earnTea } from '../core/store';
import { GameArt } from './art';
import { Section, Seg } from './bits';

/**
 * A coffeehouse tournament for friends round one device: names in, games chosen, then a
 * league (everyone meets everyone) or a knockout. Each match is played in its own game in
 * same-device mode and the winner is entered here.
 */
const GAMES = ['chess', 'weiqi', 'xiangqi', 'shogi', 'pisti', 'tavla', 'dama', 'mancala', 'morris', 'reversi', 'connect-four', 'gomoku', 'qubic', 'dots-boxes', 'tictactoe', 'battleship', 'billiards', 'bulls-cows'];
type Res = 'a' | 'b' | 'd';
interface Fx { a: number; b: number; game: string; round: number; res?: Res }
interface Tour { name: string; players: string[]; games: string[]; format: 'league' | 'knockout'; fixtures: Fx[]; champion?: number }
const KEY = 'gp.tournament';

function leagueFixtures(n: number, games: string[]): Fx[] {
  // Circle method: one player stays, the rest rotate; an odd field gets a rest each round.
  const ids = Array.from({ length: n % 2 ? n + 1 : n }, (_, i) => i), m = ids.length, out: Fx[] = [];
  for (let r = 0; r < m - 1; r++) {
    for (let i = 0; i < m / 2; i++) {
      const a = ids[i], b = ids[m - 1 - i];
      if (a < n && b < n) out.push({ a: r % 2 ? b : a, b: r % 2 ? a : b, game: games[out.length % games.length], round: r });
    }
    ids.splice(1, 0, ids.pop()!);
  }
  return out;
}
function knockoutRound(field: number[], round: number, games: string[], offset: number): Fx[] {
  const out: Fx[] = [];
  for (let i = 0; i < field.length; i += 2) out.push({ a: field[i], b: field[i + 1] ?? -1, game: games[(offset + out.length) % games.length], round, res: field[i + 1] == null ? 'a' : undefined });
  return out;
}
const winnerOf = (f: Fx) => (f.res === 'a' ? f.a : f.res === 'b' ? f.b : -1);

export function Tournament() {
  const t = useT(), lang = useLang();
  const [tour, setTour] = useState<Tour | null>(() => loadJSON<Tour | null>(KEY, null));
  const [names, setNames] = useState<string[]>(['', '', '', '']);
  const [games, setGames] = useState<string[]>(['tavla', 'dama', 'connect-four']);
  const [format, setFormat] = useState<'league' | 'knockout'>('league');
  const [title, setTitle] = useState('');
  const [ask, setAsk] = useState(false);
  useEffect(() => { saveJSON(KEY, tour); }, [tour]);
  const gn = (id: string) => { const g = metaOf(id); return g ? gameName(g, lang) : id; };

  const start = () => {
    const players = names.map(n => n.trim()).filter(Boolean);
    if (players.length < 2 || !games.length) return;
    const order = format === 'knockout' ? shuffle(players.map((_, i) => i), Math.random) : [];
    // Pad the knockout field so byes fall in the first round only.
    let size = 1; while (size < players.length) size *= 2;
    const field: number[] = []; order.forEach((p, i) => { field.push(p); if (i < size - players.length) field.push(-2); });
    const fixtures = format === 'league' ? leagueFixtures(players.length, games)
      : knockoutRound(field.map(x => (x === -2 ? -1 : x)), 0, games, 0).map(f => (f.b === -1 ? { ...f, res: 'a' as Res } : f));
    setTour({ name: title.trim() || t('Coffeehouse Cup', '茶馆杯', 'Kahvehane Kupası'), players, games, format, fixtures });
    sfx('whistle');
  };
  if (!tour) {
    const valid = names.filter(n => n.trim()).length >= 2 && games.length > 0;
    return (
      <>
        <header className="page-head">
          <h1>{t('Coffeehouse tournament', '茶馆锦标赛', 'Kahvehane turnuvası')}</h1>
          <p className="lede">{t('Two to eight friends, one device. Pick the games, choose a league or a knockout, and play each match in its game’s same-device mode. Enter the winner here.', '两到八位朋友，一台设备。选好游戏，选择联赛或淘汰赛，每场比赛都在对应游戏的同机模式下进行，然后在这里登记胜者。', 'İki ile sekiz arkadaş, tek cihaz. Oyunları seç, lig ya da eleme usulünü belirle; her maçı o oyunun aynı cihaz modunda oyna ve kazananı buraya yaz.')}</p>
        </header>
        <div className="tour-setup">
          <label className="field"><span className="field-label">{t('Tournament name', '锦标赛名称', 'Turnuva adı')}</span>
            <input id="tr-title" className="input" value={title} placeholder={t('Coffeehouse Cup', '茶馆杯', 'Kahvehane Kupası')} onChange={e => setTitle(e.target.value)} maxLength={40} /></label>
          <div className="field"><span className="field-label">{t('Players', '玩家', 'Oyuncular')}</span>
            <ol className="tr-names">
              {names.map((n, i) => (
                <li key={i}><span className="num">{i + 1}</span><input id={'tr-p' + i} className="input" value={n} maxLength={18} placeholder={t(`Player ${i + 1}`, `玩家${i + 1}`, `Oyuncu ${i + 1}`)} onChange={e => setNames(ns => ns.map((x, k) => (k === i ? e.target.value : x)))} />
                  {names.length > 2 && <button type="button" className="btn sm" aria-label={t('Remove', '移除', 'Çıkar')} onClick={() => setNames(ns => ns.filter((_, k) => k !== i))}>×</button>}</li>
              ))}
            </ol>
            {names.length < 8 && <button type="button" id="tr-add" className="btn sm" onClick={() => setNames(ns => [...ns, ''])}>+ {t('Add player', '添加玩家', 'Oyuncu ekle')}</button>}
          </div>
          <div className="field"><span className="field-label">{t('Games (matches rotate through them)', '游戏（比赛轮流使用）', 'Oyunlar (maçlar sırayla bunlarda oynanır)')}</span>
            <div className="tr-games">
              {GAMES.map(id => { const on = games.includes(id); return (
                <button key={id} type="button" id={'tr-g-' + id} className={'tr-game' + (on ? ' on' : '')} aria-pressed={on} onClick={() => setGames(gs => (on ? gs.filter(x => x !== id) : [...gs, id]))}>
                  <GameArt id={id} /><span>{gn(id)}</span></button>); })}
            </div>
          </div>
          <Seg id="tr-format" label={t('Format', '赛制', 'Usul')} value={format} onChange={setFormat}
            options={[{ value: 'league', label: t('League: everyone plays everyone', '联赛：循环对战', 'Lig: herkes herkesle') }, { value: 'knockout', label: t('Knockout', '淘汰赛', 'Eleme') }]} />
          <button type="button" id="tr-start" className="btn primary" disabled={!valid} onClick={start}>{t('Draw the fixtures', '抽签排赛', 'Fikstürü çek')}</button>
        </div>
      </>
    );
  }

  const P = (i: number) => (i < 0 ? t('bye', '轮空', 'bay') : tour.players[i]);
  const open = tour.fixtures.find(f => !f.res && f.b >= 0);
  const table = tour.players.map((name, i) => {
    const mine = tour.fixtures.filter(f => f.res && (f.a === i || f.b === i) && f.b >= 0);
    const w = mine.filter(f => winnerOf(f) === i).length, d = mine.filter(f => f.res === 'd').length, l = mine.length - w - d;
    return { i, name, p: mine.length, w, d, l, pts: w * 3 + d };
  }).sort((x, y) => y.pts - x.pts || y.w - x.w);
  const rounds = [...new Set(tour.fixtures.map(f => f.round))];

  const record = (f: Fx, res: Res) => {
    sfx('click');
    setTour(prev => {
      if (!prev) return prev;
      const idx = tour.fixtures.indexOf(f);
      let fixtures = prev.fixtures.map((x, i) => (i === idx ? { ...x, res } : x));
      let champion: number | undefined;
      if (prev.format === 'knockout') {
        const r = f.round, cur = fixtures.filter(x => x.round === r);
        if (cur.every(x => x.res)) {
          const field = cur.map(winnerOf);
          if (field.length === 1) champion = field[0];
          else fixtures = [...fixtures, ...knockoutRound(field, r + 1, prev.games, fixtures.length)];
        }
      } else if (fixtures.every(x => x.res)) {
        const best = prev.players.map((_, i) => { const m = fixtures.filter(x => x.a === i || x.b === i); const w = m.filter(x => winnerOf(x) === i).length, d = m.filter(x => x.res === 'd').length; return { i, pts: w * 3 + d, w }; }).sort((x, y) => y.pts - x.pts || y.w - x.w);
        champion = best[0].i;
      }
      if (champion != null) {
        setTimeout(() => { sfx('win'); earnTea(10, ['Tournament played', '完成锦标赛', 'Turnuva tamamlandı'], { k: 'tour', s: prev.players[champion!] }); }, 50);
      }
      return { ...prev, fixtures, champion };
    });
  };
  const undo = () => {
    setTour(prev => {
      if (!prev) return prev;
      const doneIdx = prev.fixtures.map((f, i) => (f.res && f.b >= 0 ? i : -1)).filter(i => i >= 0);
      const last = doneIdx[doneIdx.length - 1]; if (last == null) return prev;
      const r = prev.fixtures[last].round;
      const fixtures = prev.fixtures.filter(f => prev.format === 'league' || f.round <= r).map((f, i) => (i === last ? { ...f, res: undefined } : f));
      return { ...prev, fixtures, champion: undefined };
    });
  };
  const stageName = (r: number) => {
    if (tour.format === 'league') return t(`Round ${r + 1}`, `第${r + 1}轮`, `${r + 1}. tur`);
    const left = tour.fixtures.filter(f => f.round === r).length;
    return left === 1 ? t('Final', '决赛', 'Final') : left === 2 ? t('Semi-finals', '半决赛', 'Yarı final') : left === 4 ? t('Quarter-finals', '四分之一决赛', 'Çeyrek final') : t(`Round ${r + 1}`, `第${r + 1}轮`, `${r + 1}. tur`);
  };

  return (
    <>
      <header className="page-head">
        <p className="eyebrow">{tour.format === 'league' ? t('League', '联赛', 'Lig') : t('Knockout', '淘汰赛', 'Eleme')} · {tour.players.length} {t('players', '名玩家', 'oyuncu')}</p>
        <h1>{tour.name}</h1>
      </header>
      {tour.champion != null ? (
        <div className="tr-champ" role="status">
          <span className="tr-cup" aria-hidden="true">🏆</span>
          <p className="eyebrow">{t('Champion', '冠军', 'Şampiyon')}</p>
          <h2>{tour.players[tour.champion]}</h2>
          <p className="muted">{t('The whole coffeehouse stands up for a round of tea.', '全茶馆起立，为冠军敬茶。', 'Bütün kahvehane ayağa kalktı, çaylar şampiyondan!')}</p>
          <div className="row"><button type="button" id="tr-new" className="btn primary" onClick={() => setTour(null)}>{t('New tournament', '新锦标赛', 'Yeni turnuva')}</button><button type="button" className="btn" onClick={undo}>{t('Undo last result', '撤销上一个结果', 'Son sonucu geri al')}</button></div>
        </div>
      ) : open && (
        <div className="tr-next">
          <p className="eyebrow">{stageName(open.round)} · {t('Next match', '下一场', 'Sıradaki maç')}</p>
          <div className="tr-vs"><b>{P(open.a)}</b><span>{t('vs', '对', '–')}</span><b>{P(open.b)}</b></div>
          <a className="tr-gamelink" href={'#' + open.game}><GameArt id={open.game} /><span>{gn(open.game)}</span><small>{t('Open the game and choose “Second player”', '打开游戏并选择“第二位玩家”', 'Oyunu aç ve “İkinci oyuncu”yu seç')} →</small></a>
          <p className="field-label">{t('Who won?', '谁赢了？', 'Kim kazandı?')}</p>
          <div className="row tr-res">
            <button type="button" id="tr-a" className="btn primary" onClick={() => record(open, 'a')}>{P(open.a)}</button>
            {tour.format === 'league' && <button type="button" id="tr-d" className="btn" onClick={() => record(open, 'd')}>{t('Draw', '平局', 'Berabere')}</button>}
            <button type="button" id="tr-b" className="btn primary" onClick={() => record(open, 'b')}>{P(open.b)}</button>
          </div>
        </div>
      )}
      {tour.format === 'league' && (
        <Section title={t('Table', '积分榜', 'Puan durumu')}>
          <div className="table-scroll"><table className="table tr-table">
            <thead><tr><th>#</th><th>{t('Player', '玩家', 'Oyuncu')}</th><th>{t('P', '赛', 'O')}</th><th>{t('W', '胜', 'G')}</th><th>{t('D', '平', 'B')}</th><th>{t('L', '负', 'M')}</th><th>{t('Pts', '分', 'P')}</th></tr></thead>
            <tbody>{table.map((r, k) => <tr key={r.i} className={k === 0 ? 'lead' : ''}><td className="num">{k + 1}</td><th>{r.name}</th><td className="num">{r.p}</td><td className="num">{r.w}</td><td className="num">{r.d}</td><td className="num">{r.l}</td><td className="num"><b>{r.pts}</b></td></tr>)}</tbody>
          </table></div>
        </Section>
      )}
      <Section title={tour.format === 'league' ? t('Fixtures', '赛程', 'Fikstür') : t('Bracket', '对阵', 'Eşleşmeler')}>
        <div className={'tr-rounds' + (tour.format === 'knockout' ? ' bracket' : '')}>
          {rounds.map(r => (
            <div key={r} className="tr-round">
              <h3>{stageName(r)}</h3>
              <ol>{tour.fixtures.filter(f => f.round === r).map((f, k) => (
                <li key={k} className={'tr-fx' + (f === open ? ' now' : '') + (f.res ? ' done' : '')}>
                  <span className={winnerOf(f) === f.a ? 'w' : ''}>{P(f.a)}</span>
                  <small>{f.b < 0 ? '' : f.res === 'd' ? '½–½' : f.res ? (f.res === 'a' ? '1–0' : '0–1') : gn(f.game)}</small>
                  <span className={winnerOf(f) === f.b ? 'w' : ''}>{P(f.b)}</span>
                </li>
              ))}</ol>
            </div>
          ))}
        </div>
      </Section>
      <div className="row">
        <button type="button" id="tr-undo" className="btn" onClick={undo}>{t('Undo last result', '撤销上一个结果', 'Son sonucu geri al')}</button>
        {ask ? <><button type="button" id="tr-end-yes" className="btn primary" onClick={() => { setTour(null); setAsk(false); }}>{t('End it', '结束', 'Bitir')}</button><button type="button" className="btn" onClick={() => setAsk(false)}>{t('Keep going', '继续', 'Devam et')}</button></>
          : <button type="button" id="tr-end" className="btn" onClick={() => setAsk(true)}>{t('End the tournament', '结束锦标赛', 'Turnuvayı bitir')}</button>}
      </div>
    </>
  );
}
