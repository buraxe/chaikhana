import './bulls.css';
import { useEffect, useState } from 'react';
import { sfx } from '../../core/sound';
import { pname, useLang, useT } from '../../core/i18n';
import { loadJSON, saveJSON } from '../../core/storage';
import { activeOf, getData, noteStarted, recordResult, useData } from '../../core/store';
import { fmtTime, Seg } from '../../ui/bits';
import { candidates, score, secret, validGuess } from './rules';

interface Row { guess: string; plus: number; minus: number }
interface G { len: number; secret: string; rows: Row[]; t0: number; elapsed: number; done: boolean; gaveUp: boolean; started: boolean }
const fresh = (len: number): G => ({ len, secret: secret(len), rows: [], t0: 0, elapsed: 0, done: false, gaveUp: false, started: false });

function Solo({ onDuel }: { onDuel: () => void }) {
  const t = useT();
  const [g, setG] = useState<G>(() => loadJSON<G | null>('gp.bulls', null) ?? fresh(4));
  const [entry, setEntry] = useState('');
  const [err, setErr] = useState('');
  const [len, setLen] = useState(g.len);
  const [, tick] = useState(0);
  useEffect(() => { saveJSON('gp.bulls', g); }, [g]);
  useEffect(() => { if (!g.started || g.done) return; const id = setInterval(() => tick(x => x + 1), 1000); return () => clearInterval(id); }, [g.started, g.done]);
  const elapsed = g.done ? g.elapsed : g.started ? Date.now() - g.t0 : 0;
  const left = g.done ? 0 : candidates(g.len, g.rows).length;

  const press = (d: string) => { setErr(''); if (g.done) return; if (entry.length < g.len && !entry.includes(d) && !(entry === '' && d === '0')) setEntry(entry + d); };
  const submit = () => {
    sfx('peg');
    if (g.done) return;
    if (!validGuess(entry, g.len)) { setErr(t(`Enter ${g.len} different digits; the first cannot be 0.`, `请输入${g.len}个不同的数字，首位不能是0。`, `${g.len} farklı rakam gir; ilk rakam 0 olamaz.`)); return; }
    if (g.rows.some(r => r.guess === entry)) { setErr(t('You already tried that number.', '这个数已经猜过了。', 'Bu sayıyı zaten denedin.')); return; }
    const [plus, minus] = score(g.secret, entry), won = plus === g.len;
    const now = Date.now(), t0 = g.started ? g.t0 : now;
    if (!g.started) noteStarted('bulls-cows');
    const next: G = { ...g, rows: [...g.rows, { guess: entry, plus, minus }], started: true, t0, done: won, elapsed: won ? now - t0 : 0 };
    if (won) recordResult(getData().activeId, 'bulls-cows', { result: 'win', ms: now - t0, label: `${g.len} digits · ${next.rows.length} guesses`, bestKey: `${g.len} digits` });
    setG(next); setEntry('');
  };
  const giveUp = () => {
    if (g.done || !g.rows.length) return;
    recordResult(getData().activeId, 'bulls-cows', { result: 'loss', label: `${g.len} digits · gave up` });
    setG({ ...g, done: true, gaveUp: true, elapsed: Date.now() - g.t0 });
  };
  const onKey = (e: React.KeyboardEvent) => {
    if (/^\d$/.test(e.key)) press(e.key);
    else if (e.key === 'Backspace') setEntry(x => x.slice(0, -1));
    else if (e.key === 'Enter') submit();
  };
  const status = g.done ? (g.gaveUp ? t(`The number was ${g.secret}.`, `答案是${g.secret}。`, `Sayı ${g.secret} idi.`) : t(`Found ${g.secret} in ${g.rows.length} guesses, ${fmtTime(g.elapsed)}.`, `用${g.rows.length}次猜中${g.secret}，用时${fmtTime(g.elapsed)}。`, `${g.secret} sayısını ${g.rows.length} tahminde, ${fmtTime(g.elapsed)} sürede buldun.`))
    : t(`Find the ${g.len}-digit number. + right digit, right place; − right digit, wrong place.`, `猜出这个${g.len}位数。+ 表示数字和位置都对，− 表示数字对但位置不对。`, `${g.len} basamaklı sayıyı bul. + doğru rakam doğru yerde; − doğru rakam yanlış yerde.`);
  return (
    <div className="play">
      <div className="play-main">
        <div className="statline"><span role="status" aria-live="polite">{status}</span><span className="num">{fmtTime(elapsed)}</span></div>
        <div className="bc-box" tabIndex={0} onKeyDown={onKey} aria-label={t('Bulls and Cows. Type digits, Enter to guess.', '猜数字。输入数字，回车提交。', 'Sayı Bulmaca. Rakamları yaz, tahmin için Enter.')}>
          <ol className="bc-rows">
            {g.rows.map((r, k) => (
              <li key={k}><span className="bc-n">{k + 1}</span><span className="bc-guess num">{r.guess}</span>
                <span className="bc-clue"><b className="plus">+{r.plus}</b><b className="minus">−{r.minus}</b></span></li>
            ))}
            {!g.done && (
              <li className="bc-entry"><span className="bc-n">{g.rows.length + 1}</span>
                <span className="bc-slots">{Array.from({ length: g.len }, (_, i) => <span key={i} className={'bc-slot' + (i === entry.length ? ' cur' : '')}>{entry[i] ?? ''}</span>)}</span></li>
            )}
          </ol>
          {g.done && g.gaveUp === false && <p className="bc-win num">{g.secret}</p>}
          {err && <p className="bc-err" role="alert">{err}</p>}
          {/* The keypad belongs to the box, so a phone never has to scroll to type. */}
          {!g.done ? (
            <div className="bc-pad">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(d => <button key={d} type="button" id={'bc-' + d} disabled={entry.includes(d)} onClick={() => press(d)}>{d}</button>)}
              <button type="button" id="bc-del" className="fn" onClick={() => setEntry(x => x.slice(0, -1))} aria-label={t('Delete', '删除', 'Sil')}>⌫</button>
              <button type="button" id="bc-0" disabled={entry.includes('0') || entry === ''} onClick={() => press('0')}>0</button>
              <button type="button" id="bc-go" className="fn go" disabled={entry.length !== g.len} onClick={submit}>{t('Guess', '猜', 'Tahmin')}</button>
            </div>
          ) : <button type="button" id="bc-again" className="btn primary" onClick={() => { setG(fresh(len)); setEntry(''); }}>{t('New number', '新的数字', 'Yeni sayı')}</button>}
        </div>
      </div>
      <aside className="play-side">
        <dl className="facts">
          <div><dt>{t('Guesses', '猜测次数', 'Tahmin')}</dt><dd className="num">{g.rows.length}</dd></div>
          {!g.done && <div><dt>{t('Numbers still possible', '仍可能的数', 'Hâlâ olası sayılar')}</dt><dd className="num">{left}</dd></div>}
        </dl>
        {!g.done && g.rows.length > 0 && <button type="button" id="bc-giveup" className="btn" onClick={giveUp}>{t('Show the number', '公布答案', 'Sayıyı göster')}</button>}
        <p className="muted small">{t('Each clue counts digits: + for a right digit in the right place, − for a right digit in the wrong place. The clues do not say which digits they mean. Digits never repeat and the number never starts with 0.', '每条提示只数数字：+ 表示数字和位置都对，− 表示数字对但位置不对，但不告诉你是哪一位。数字不重复，首位不为0。', 'Her ipucu yalnızca sayar: + doğru rakam doğru yerde, − doğru rakam yanlış yerde. Hangi rakamlar olduğunu söylemez. Rakamlar tekrar etmez ve sayı 0 ile başlamaz.')}</p>
        <div className="setup">
          <h3>{t('New number', '新的数字', 'Yeni sayı')}</h3>
          <Seg id="bc-len" label={t('Digits', '位数', 'Basamak')} value={len} onChange={setLen} options={[3, 4, 5].map(n => ({ value: n, label: String(n) }))} />
          <button type="button" id="bc-new" className="btn primary" onClick={() => { setG(fresh(len)); setEntry(''); setErr(''); }}>{t('Start', '开始', 'Başla')}</button>
          <button type="button" id="bc-duel" className="btn" onClick={onDuel}>{t('⇄ Two players on this device', '⇄ 同机双人对战', '⇄ Bu cihazda iki kişi')}</button>
        </div>
      </aside>
    </div>
  );
}

/** The classic two-player game: each player hides a number, then they take turns guessing the other's. */
interface D { len: number; names: [string, string]; secrets: [string, string]; rows: [Row[], Row[]]; phase: 'secret0' | 'secret1' | 'play' | 'over'; turn: 0 | 1; cover: boolean; winner: -1 | 0 | 1 | 2 }
function Keypad({ entry, len, onDigit, onDel, onGo, go, hide }: { entry: string; len: number; onDigit: (d: string) => void; onDel: () => void; onGo: () => void; go: string; hide?: boolean }) {
  const t = useT();
  return (
    <>
      <span className="bc-slots">{Array.from({ length: len }, (_, i) => <span key={i} className={'bc-slot' + (i === entry.length ? ' cur' : '')}>{entry[i] ? (hide ? '•' : entry[i]) : ''}</span>)}</span>
      <div className="bc-pad">
        {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(d => <button key={d} type="button" id={'bd-' + d} disabled={entry.includes(d)} onClick={() => onDigit(d)}>{d}</button>)}
        <button type="button" className="fn" onClick={onDel} aria-label={t('Delete', '删除', 'Sil')}>⌫</button>
        <button type="button" id="bd-0" disabled={entry.includes('0') || entry === ''} onClick={() => onDigit('0')}>0</button>
        <button type="button" id="bd-go" className="fn go" disabled={entry.length !== len} onClick={onGo}>{go}</button>
      </div>
    </>
  );
}
function Duel({ onSolo }: { onSolo: () => void }) {
  const t = useT(), lang = useLang(), me = activeOf(useData());
  const freshD = (len: number, names: [string, string]): D => ({ len, names, secrets: ['', ''], rows: [[], []], phase: 'secret0', turn: 0, cover: true, winner: -1 });
  const [d, setD] = useState<D>(() => loadJSON<D | null>('gp.bulls.duel', null) ?? freshD(4, [pname(me, lang), t('Player 2', '玩家2', 'Oyuncu 2')]));
  const [entry, setEntry] = useState('');
  const [err, setErr] = useState('');
  const [names, setNames] = useState<[string, string]>(d.names);
  const [len, setLen] = useState(d.len);
  useEffect(() => { saveJSON('gp.bulls.duel', d); }, [d]);
  const digit = (x: string) => { setErr(''); if (entry.length < d.len && !entry.includes(x) && !(entry === '' && x === '0')) setEntry(entry + x); };
  const bad = t(`Enter ${d.len} different digits; the first cannot be 0.`, `请输入${d.len}个不同的数字，首位不能是0。`, `${d.len} farklı rakam gir; ilk rakam 0 olamaz.`);
  const setSecret = () => {
    if (!validGuess(entry, d.len)) { setErr(bad); return; }
    const k = d.phase === 'secret0' ? 0 : 1, secrets = d.secrets.slice() as [string, string]; secrets[k] = entry;
    setD({ ...d, secrets, phase: k === 0 ? 'secret1' : 'play', cover: k === 0, turn: 0 }); setEntry('');
  };
  const guess = () => {
    sfx('peg');
    if (!validGuess(entry, d.len)) { setErr(bad); return; }
    const p = d.turn, o = (1 - p) as 0 | 1, [plus, minus] = score(d.secrets[o], entry);
    const rows = [d.rows[0].slice(), d.rows[1].slice()] as [Row[], Row[]]; rows[p].push({ guess: entry, plus, minus });
    const solved = (k: 0 | 1) => rows[k].some(r => r.plus === d.len);
    let next: D = { ...d, rows, turn: o };
    // Rounds always finish, so a first-player solve can still be tied by the second player.
    if (rows[0].length === rows[1].length && (solved(0) || solved(1))) next = { ...next, phase: 'over', winner: solved(0) && solved(1) ? 2 : solved(0) ? 0 : 1 };
    setD(next); setEntry('');
  };
  const secretPhase = d.phase === 'secret0' || d.phase === 'secret1', who = d.phase === 'secret1' ? 1 : d.phase === 'secret0' ? 0 : d.turn;
  const status = d.phase === 'over' ? (d.winner === 2 ? t('Both found the number in the same round: a draw.', '双方在同一轮猜中：平局。', 'İkisi de aynı turda buldu: berabere.') : t(`${d.names[d.winner as 0 | 1]} wins!`, `${d.names[d.winner as 0 | 1]}获胜！`, `${d.names[d.winner as 0 | 1]} kazandı!`))
    : secretPhase ? t(`${d.names[who]}: choose your secret number.`, `${d.names[who]}：设定你的秘密数字。`, `${d.names[who]}: gizli sayını seç.`)
    : t(`${d.names[d.turn]}: guess ${d.names[1 - d.turn]}’s number.`, `${d.names[d.turn]}：猜${d.names[1 - d.turn]}的数字。`, `${d.names[d.turn]}: ${d.names[1 - d.turn]} oyuncusunun sayısını tahmin et.`);
  return (
    <div className="play">
      <div className="play-main">
        <div className="statline"><span role="status" aria-live="polite">{d.cover ? '' : status}</span></div>
        <div className="bc-box">
          {d.cover && secretPhase ? (
            <div className="race-card">
              <h3>{t(`${d.names[who]}, your secret`, `${d.names[who]}，设定秘密数字`, `${d.names[who]}, gizli sayın`)}</h3>
              <p className="muted">{t('Hand over the device; the other player should look away.', '把设备交出去，另一位请回避。', 'Cihazı ver; diğer oyuncu bakmasın.')}</p>
              <button type="button" id="bd-ready" className="btn primary" onClick={() => setD({ ...d, cover: false })}>{t('I’m ready', '我准备好了', 'Hazırım')}</button>
            </div>
          ) : (
            <>
              {!secretPhase && (
                <div className="bd-cols">
                  {[0, 1].map(k => (
                    <ol key={k} className={'bc-rows' + (d.turn === k && d.phase === 'play' ? ' on' : '')} aria-label={d.names[k]}>
                      <li className="bd-head"><b>{d.names[k]}</b>{d.phase === 'over' && <span className="muted num"> · {d.secrets[k]}</span>}</li>
                      {d.rows[k].map((r, i) => <li key={i}><span className="bc-n">{i + 1}</span><span className="bc-guess num">{r.guess}</span><span className="bc-clue"><b className="plus">+{r.plus}</b><b className="minus">−{r.minus}</b></span></li>)}
                    </ol>
                  ))}
                </div>
              )}
              {d.phase !== 'over' && <Keypad entry={entry} len={d.len} hide={secretPhase} onDigit={digit} onDel={() => setEntry(x => x.slice(0, -1))} onGo={secretPhase ? setSecret : guess} go={secretPhase ? t('Hide', '确定', 'Sakla') : t('Guess', '猜', 'Tahmin')} />}
              {err && <p className="bc-err" role="alert">{err}</p>}
              {d.phase === 'over' && <button type="button" id="bd-again" className="btn primary" onClick={() => { setD(freshD(d.len, d.names)); setEntry(''); }}>{t('Play again', '再来一局', 'Tekrar oyna')}</button>}
            </>
          )}
        </div>
      </div>
      <aside className="play-side">
        <p className="muted small">{t('Each player hides a number. Take turns guessing the other’s; the clues are + for a right digit in the right place and − for a right digit in the wrong place. The second player always gets the same number of guesses.', '双方各藏一个数，轮流猜对方的。+ 表示数字和位置都对，− 表示数字对但位置不对。后手总有同样多的猜测次数。', 'Her oyuncu bir sayı saklar. Sırayla diğerininkini tahmin edersiniz; + doğru rakam doğru yerde, − doğru rakam yanlış yerde demektir. İkinci oyuncu her zaman aynı sayıda tahmin hakkı alır.')}</p>
        <div className="setup">
          <h3>{t('New duel', '新对局', 'Yeni düello')}</h3>
          {[0, 1].map(k => <label key={k} className="field"><span className="field-label">{t(`Player ${k + 1}`, `玩家${k + 1}`, `Oyuncu ${k + 1}`)}</span>
            <input className="input" id={'bd-name-' + k} value={names[k]} maxLength={20} onChange={e => setNames((k === 0 ? [e.target.value, names[1]] : [names[0], e.target.value]) as [string, string])} /></label>)}
          <Seg id="bd-len" label={t('Digits', '位数', 'Basamak')} value={len} onChange={setLen} options={[3, 4, 5].map(n => ({ value: n, label: String(n) }))} />
          <button type="button" id="bd-new" className="btn primary" onClick={() => { setD(freshD(len, [names[0].trim() || 'P1', names[1].trim() || 'P2'])); setEntry(''); setErr(''); }}>{t('Start', '开始', 'Başla')}</button>
          <button type="button" id="bd-solo" className="btn" onClick={onSolo}>{t('Back to solo', '返回单人', 'Tek kişiye dön')}</button>
        </div>
      </aside>
    </div>
  );
}

export default function Bulls() {
  const [duel, setDuel] = useState(() => loadJSON<string>('gp.bulls.mode', 'solo') === 'duel');
  useEffect(() => { saveJSON('gp.bulls.mode', duel ? 'duel' : 'solo'); }, [duel]);
  return duel ? <Duel onSolo={() => setDuel(false)} /> : <Solo onDuel={() => setDuel(true)} />;
}
