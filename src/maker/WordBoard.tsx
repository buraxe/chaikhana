import { useEffect, useState } from 'react';
import { useT } from '../core/i18n';
import { accepts, compile, upper, type GameDef, type GState, type Input } from './engine';

/** The guess grid and on-screen keyboard of a word puzzle. Physical keys work too. */
export function WordBoard({ def, st, canAct, onInput, onExplain }: { def: GameDef; st: GState; canAct: boolean; onInput: (i: Input) => void; onExplain?: (i: Input) => void }) {
  const t = useT(), wd = def.words!, len = wd.length;
  const [typed, setTyped] = useState('');
  const [msg, setMsg] = useState('');
  const guesses = st.words?.guesses ?? [];
  const rows = Math.max(wd.rows ?? 6, guesses.length + (st.over ? 0 : 1));
  // The keyboard: the game's own letters, or every letter its words use.
  const alphabet = (wd.alphabet ?? [...new Set(compile(def).words.join(''))].sort().join('')).trim();
  const keyRows = alphabet.includes(' ') ? alphabet.split(/\s+/) : alphabet.length > 12 ? [alphabet.slice(0, Math.ceil(alphabet.length / 3)), alphabet.slice(Math.ceil(alphabet.length / 3), Math.ceil(alphabet.length * 2 / 3)), alphabet.slice(Math.ceil(alphabet.length * 2 / 3))] : [alphabet];
  const letters = new Set([...alphabet.replace(/\s/g, '')]);
  const best: Record<string, string> = {};
  for (const g of guesses) [...g.text].forEach((ch, i) => { const m = g.marks[i], was = best[ch]; if (m === 'g' || (m === 'y' && was !== 'g') || (!was)) best[ch] = m; });

  const add = (ch: string) => { setMsg(''); setTyped(x => ([...x].length < len ? x + ch : x)); };
  const back = () => { setMsg(''); setTyped(x => [...x].slice(0, -1).join('')); };
  const enter = () => {
    if ([...typed].length !== len) { setMsg(t(`Words have ${len} letters.`, `单词有 ${len} 个字母。`, `Kelimeler ${len} harfli.`)); return; }
    const inp: Input = { k: 'word', text: typed };
    if (!accepts(def, st, inp)) { setMsg(t('That guess is not accepted (is it in the word list?).', '这个猜测不被接受（在词表里吗？）。', 'Bu tahmin kabul edilmedi (listede var mı?).')); onExplain?.(inp); return; }
    onInput(inp);
    setTyped('');
  };
  useEffect(() => { setTyped(''); setMsg(''); }, [def]);
  useEffect(() => {
    if (!canAct) return;
    const on = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      const el = e.target as HTMLElement;
      if (el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.tagName === 'SELECT' || el.isContentEditable)) return;
      if (e.key === 'Enter') { e.preventDefault(); enter(); }
      else if (e.key === 'Backspace') { e.preventDefault(); back(); }
      else if (e.key.length === 1) { const ch = upper(def, e.key); if (letters.has(ch)) { e.preventDefault(); add(ch); } }
    };
    window.addEventListener('keydown', on);
    return () => window.removeEventListener('keydown', on);
  }); // re-bound each render so it sees the current guess

  const cell = (ch: string, mark: string, k: number) => <span key={k} className={'wk-wcell' + (mark ? ' m-' + (mark === '.' ? 'x' : mark) : ch ? ' typed' : '')}>{ch}</span>;
  return (
    <div className="wk-words">
      <div className="wk-wgrid" style={{ ['--len' as string]: len }} role="grid" aria-label={t('Guesses', '猜测', 'Tahminler')}>
        {Array.from({ length: rows }, (_, r) => {
          const g = guesses[r], cur = !g && r === guesses.length && !st.over;
          const chars = g ? [...g.text] : cur ? [...typed] : [];
          return <div key={r} className="wk-wrow" role="row">{Array.from({ length: len }, (_, k) => cell(chars[k] ?? '', g ? g.marks[k] : '', k))}</div>;
        })}
      </div>
      {st.over && st.over.winner !== 0 && st.words && <p className="wk-reveal">{t('The word was', '答案是', 'Kelime şuydu')}: <b>{st.words.secret}</b></p>}
      {msg && <p className="wk-aim" role="status">{msg}</p>}
      {!st.over && (
        <div className="wk-kbd" aria-label={t('Keyboard', '键盘', 'Klavye')}>
          {keyRows.map((row, i) => (
            <div key={i} className="wk-krow">
              {i === keyRows.length - 1 && <button type="button" className="wk-key wide" id="wk-enter" onClick={enter} disabled={!canAct}>{t('Enter', '确定', 'Gir')}</button>}
              {[...row].map(ch => <button key={ch} type="button" className={'wk-key' + (best[ch] ? ' m-' + (best[ch] === '.' ? 'x' : best[ch]) : '')} onClick={() => add(ch)} disabled={!canAct}>{ch}</button>)}
              {i === keyRows.length - 1 && <button type="button" className="wk-key wide" id="wk-back" onClick={back} disabled={!canAct} aria-label={t('Delete', '删除', 'Sil')}>⌫</button>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
