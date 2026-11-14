import './mastermind.css';
import { useEffect, useState } from 'react';
import { sfx } from '../../core/sound';
import { useT } from '../../core/i18n';
import { loadJSON, saveJSON } from '../../core/storage';
import { getData, noteStarted, recordResult } from '../../core/store';
import { fmtTime, Pick, Seg } from '../../ui/bits';
import { nextGuess, randomCode, score, VARIANTS } from './rules';

const cap = (k: string) => k[0].toUpperCase() + k.slice(1);
const PEG = ['#c8302a', '#1f5fd1', '#1f9a52', '#f2c014', '#f07c1c', '#7a3fb0', '#e8e4d8', '#2a2a2e'];
type Row = { guess: number[]; result: [number, number] };
interface Saved { mode: 'you' | 'cpu'; variant: string; secret: number[] | null; rows: Row[]; current: number[]; elapsed: number; over: '' | 'won' | 'lost'; strategy: 'consistent' | 'knuth'; started: boolean }
const fresh = (mode: Saved['mode'], variant: string, strategy: Saved['strategy']): Saved => ({
  mode, variant, strategy, secret: mode === 'you' ? randomCode(VARIANTS[variant], Math.random) : null, rows: [], current: [], elapsed: 0, over: '', started: false,
});

export default function Mastermind() {
  const t = useT();
  const [g, setG] = useState<Saved>(() => loadJSON<Saved | null>('gp.mastermind', null) ?? fresh('you', 'classic', 'knuth'));
  const [draft, setDraft] = useState({ mode: g.mode, variant: g.variant, strategy: g.strategy });
  const v = VARIANTS[g.variant];
  useEffect(() => { saveJSON('gp.mastermind', g); }, [g]);
  useEffect(() => {
    if (g.mode !== 'you' || g.over || !g.started) return;
    const id = setInterval(() => { if (!document.hidden) setG(s => ({ ...s, elapsed: s.elapsed + 1000 })); }, 1000);
    return () => clearInterval(id);
  }, [g.mode, g.over, g.started]);
  // The computer guesses your code, one guess at a time.
  useEffect(() => {
    if (g.mode !== 'cpu' || !g.secret || g.over) return;
    const id = setTimeout(() => setG(s => {
      if (!s.secret || s.over) return s;
      const guess = nextGuess(VARIANTS[s.variant], s.rows, s.strategy), result = score(s.secret, guess), rows = [...s.rows, { guess, result }];
      return { ...s, rows, over: result[0] === VARIANTS[s.variant].pegs ? 'won' : rows.length >= VARIANTS[s.variant].tries ? 'lost' : '' };
    }), 900);
    return () => clearTimeout(id);
  }, [g.mode, g.secret, g.rows.length, g.over]);

  const add = (c: number) => {
    if (g.over || g.current.length >= v.pegs) return;
    if (!v.repeats && g.current.includes(c)) return;
    setG(s => ({ ...s, current: [...s.current, c] }));
  };
  const submit = () => {
    sfx('peg');
    if (g.current.length !== v.pegs) return;
    if (g.mode === 'cpu') { setG(s => ({ ...s, secret: s.current, current: [] })); return; }
    const result = score(g.secret!, g.current), rows = [...g.rows, { guess: g.current, result }];
    const won = result[0] === v.pegs, lost = !won && rows.length >= v.tries;
    if (!g.started) noteStarted('code-breaker');
    if (won || lost) recordResult(getData().activeId, 'code-breaker', { result: won ? 'win' : 'loss', ms: won ? g.elapsed : undefined, label: `${cap(g.variant)} · ${rows.length} guesses`, bestKey: won ? cap(g.variant) : undefined });
    setG(s => ({ ...s, rows, current: [], started: true, over: won ? 'won' : lost ? 'lost' : '' }));
  };
  const Peg = ({ c, small }: { c: number; small?: boolean }) => <span className={'mm-peg' + (small ? ' small' : '')} style={{ background: PEG[c] }} />;
  const Keys = ({ r }: { r: [number, number] }) => (
    <span className="mm-keys" style={{ gridTemplateColumns: `repeat(${Math.ceil(v.pegs / 2)}, 1fr)` }} aria-label={t(`${r[0]} black, ${r[1]} white`, `${r[0]}黑 ${r[1]}白`, `${r[0]} siyah, ${r[1]} beyaz`)}>
      {Array.from({ length: v.pegs }, (_, k) => <i key={k} className={k < r[0] ? 'b' : k < r[0] + r[1] ? 'w' : ''} />)}
    </span>
  );
  const variantName = (k: string) => ({ easy: t('Easy · 4 pegs, 6 colours, no repeats', '简单 · 4位 6色 不重复', 'Kolay · 4 çivi, 6 renk, tekrar yok'), classic: t('Classic · 4 pegs, 6 colours', '经典 · 4位 6色', 'Klasik · 4 çivi, 6 renk'), hard: t('Hard · 5 pegs, 8 colours', '困难 · 5位 8色', 'Zor · 5 çivi, 8 renk') } as Record<string, string>)[k];
  const choosing = g.mode === 'cpu' && !g.secret;
  const status = g.mode === 'you'
    ? (g.over === 'won' ? t(`Cracked in ${g.rows.length} guesses.`, `${g.rows.length}次猜中！`, `${g.rows.length} tahminde kırıldı.`) : g.over === 'lost' ? t('Out of guesses. The code is shown below.', '次数用完了，答案在下方。', 'Tahmin hakkı bitti. Şifre aşağıda.') : t(`Guess the hidden code. ${v.tries - g.rows.length} guesses left.`, `猜出隐藏的密码，还剩${v.tries - g.rows.length}次。`, `Gizli şifreyi bul. ${v.tries - g.rows.length} tahmin hakkın kaldı.`))
    : choosing ? t('Choose a secret code for the computer to crack.', '设置一个让电脑破解的密码。', 'Bilgisayarın kıracağı gizli bir şifre seç.')
    : g.over === 'won' ? t(`The computer cracked your code in ${g.rows.length} guesses.`, `电脑用${g.rows.length}次猜出了你的密码。`, `Bilgisayar şifreni ${g.rows.length} tahminde kırdı.`) : g.over === 'lost' ? t('The computer ran out of guesses.', '电脑的次数用完了。', 'Bilgisayarın tahmin hakkı bitti.') : t('The computer is thinking…', '电脑思考中…', 'Bilgisayar düşünüyor…');
  return (
    <div className="play">
      <div className="play-main">
        <div className="statline"><span role="status" aria-live="polite">{status}</span>{g.mode === 'you' && <span className="num">{fmtTime(g.elapsed)}</span>}</div>
        <div className="mm-board">
          {(g.mode === 'you' ? g.over : g.secret) && (
            <div className="mm-row secret"><span className="mm-n">{t('Code', '密码', 'Şifre')}</span><span className="mm-pegs">{(g.secret ?? []).map((c, k) => <Peg key={k} c={c} />)}</span></div>
          )}
          {g.rows.map((r, i) => (
            <div key={i} className="mm-row"><span className="mm-n num">{i + 1}</span><span className="mm-pegs">{r.guess.map((c, k) => <Peg key={k} c={c} />)}</span><Keys r={r.result} /></div>
          ))}
          {((g.mode === 'you' && !g.over) || choosing) && (
            <div className="mm-row current"><span className="mm-n num">{choosing ? '?' : g.rows.length + 1}</span>
              <span className="mm-pegs">{Array.from({ length: v.pegs }, (_, k) => (g.current[k] !== undefined ? <button key={k} type="button" className="mm-slot filled" onClick={() => setG(s => ({ ...s, current: s.current.filter((_, j) => j !== k) }))} aria-label={t('Remove peg', '移除', 'Çiviyi kaldır')}><Peg c={g.current[k]} /></button> : <span key={k} className="mm-slot" />))}</span>
            </div>
          )}
        </div>
        {((g.mode === 'you' && !g.over) || choosing) && (
          <>
            <div className="mm-palette" role="group" aria-label={t('Colours', '颜色', 'Renkler')}>
              {Array.from({ length: v.colors }, (_, c) => <button key={c} type="button" id={'mm-c' + c} className="mm-pick" disabled={!v.repeats && g.current.includes(c)} onClick={() => add(c)} aria-label={t(`Colour ${c + 1}`, `颜色${c + 1}`, `Renk ${c + 1}`)}><Peg c={c} /></button>)}
            </div>
            <div className="tools">
              <button type="button" id="mm-back" className="btn" disabled={!g.current.length} onClick={() => setG(s => ({ ...s, current: s.current.slice(0, -1) }))}>{t('Delete', '删除', 'Sil')}</button>
              <button type="button" id="mm-go" className="btn primary" disabled={g.current.length !== v.pegs} onClick={submit}>{choosing ? t('Set code', '确定密码', 'Şifreyi belirle') : t('Guess', '猜', 'Tahmin et')}</button>
            </div>
          </>
        )}
        <p className="muted small">{t('Black peg: right colour in the right place. White peg: right colour in the wrong place. The order of the pegs on the right says nothing about which position they refer to.', '黑钉：颜色和位置都对。白钉：颜色对但位置不对。右边钉子的顺序与位置无关。', 'Siyah çivi: doğru renk, doğru yer. Beyaz çivi: doğru renk, yanlış yer. Sağdaki çivilerin sırası hangi konuma ait olduklarını göstermez.')}</p>
      </div>
      <aside className="play-side">
        {g.over && <button type="button" id="mm-again" className="btn primary" onClick={() => setG(fresh(g.mode, g.variant, g.strategy))}>{t('Play again', '再来一局', 'Tekrar oyna')}</button>}
        <div className="setup">
          <h3>{t('New game', '新游戏', 'Yeni oyun')}</h3>
          <Seg id="mm-mode" label={t('Who guesses', '谁来猜', 'Kim tahmin ediyor')} value={draft.mode} onChange={m => setDraft({ ...draft, mode: m })} options={[{ value: 'you', label: t('You', '你', 'Sen') }, { value: 'cpu', label: t('Computer', '电脑', 'Bilgisayar') }]} />
          <Pick id="mm-variant" label={t('Variant', '玩法', 'Çeşit')} value={draft.variant} onChange={k => setDraft({ ...draft, variant: k })} options={Object.keys(VARIANTS).map(k => ({ value: k, label: variantName(k) }))} />
          {draft.mode === 'cpu' && <Seg id="mm-strategy" label={t('Computer strategy', '电脑策略', 'Bilgisayar stratejisi')} value={draft.strategy} onChange={s => setDraft({ ...draft, strategy: s })}
            options={[{ value: 'consistent', label: t('Simple', '简单', 'Basit') }, { value: 'knuth', label: t("Knuth's minimax", 'Knuth 极小极大', 'Knuth minimaks') }]} />}
          <button type="button" id="mm-new" className="btn primary" onClick={() => setG(fresh(draft.mode, draft.variant, draft.strategy))}>{t('Start', '开始', 'Başla')}</button>
          <p className="muted small">{t("Knuth's method picks the guess whose worst answer leaves the fewest codes; on the classic board it never needs more than five guesses.", 'Knuth 方法每次选择“最坏情况下剩余可能最少”的猜测，在经典玩法中最多五次就能猜中。', 'Knuth yöntemi, en kötü cevabı en az şifre bırakan tahmini seçer; klasik tahtada hiçbir zaman beşten fazla tahmine ihtiyaç duymaz.')}</p>
        </div>
      </aside>
    </div>
  );
}
