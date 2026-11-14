import { useEffect, useMemo, useState } from 'react';
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

/** Anagrams: the secret's letters as tiles; tap them (or type) to spell the word. The clue helps. */
export function AnagramBoard({ def, st, canAct, onInput }: { def: GameDef; st: GState; canAct: boolean; onInput: (i: Input) => void }) {
  const t = useT(), w = st.words!, letters = [...(w.scramble ?? '')];
  const [order, setOrder] = useState<number[]>(() => letters.map((_, i) => i));
  const [used, setUsed] = useState<number[]>([]);
  const [msg, setMsg] = useState('');
  useEffect(() => { setOrder(letters.map((_, i) => i)); setUsed([]); setMsg(''); }, [w.scramble, w.secret]); // eslint-disable-line
  const clue = useMemo(() => {
    const cl = def.words?.clues ?? {};
    for (const [k, v] of Object.entries(cl)) if (upper(def, k.trim()) === w.secret) return v;
    return '';
  }, [def, w.secret]);
  const typed = used.map(i => letters[i]).join('');
  const add = (i: number) => { if (!canAct || used.includes(i)) return; setMsg(''); setUsed(u => [...u, i]); };
  const back = () => { setMsg(''); setUsed(u => u.slice(0, -1)); };
  const enter = () => {
    if (used.length !== letters.length) { setMsg(t('Use every letter.', '要用上所有字母。', 'Bütün harfleri kullan.')); return; }
    const inp: Input = { k: 'word', text: typed };
    if (!accepts(def, st, inp)) { setMsg(t('Not that one: try again.', '不对，再试试。', 'Olmadı, yeniden dene.')); setUsed([]); return; }
    onInput(inp);
  };
  const mix = () => setOrder(o => { const a = o.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; });
  useEffect(() => {
    if (!canAct) return;
    const on = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      const el = e.target as HTMLElement;
      if (el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.tagName === 'SELECT')) return;
      if (e.key === 'Enter') { e.preventDefault(); enter(); }
      else if (e.key === 'Backspace') { e.preventDefault(); back(); }
      else if (e.key.length === 1) { const ch = upper(def, e.key), i = order.find(k => letters[k] === ch && !used.includes(k)); if (i !== undefined) { e.preventDefault(); add(i); } }
    };
    window.addEventListener('keydown', on);
    return () => window.removeEventListener('keydown', on);
  });
  return (
    <div className="wk-words wk-anagram">
      {clue && <p className="wk-clue">💡 {clue}</p>}
      <div className="wk-wrow" style={{ ['--len' as string]: letters.length }}>{letters.map((_, k) => <span key={k} className={'wk-wcell' + (typed[k] ? ' typed' : '')}>{[...typed][k] ?? ''}</span>)}</div>
      {msg && <p className="wk-aim" role="status">{msg}</p>}
      {!st.over && <>
        <div className="wk-tiles">{order.map(i => <button key={i} type="button" className="wk-tile" disabled={!canAct || used.includes(i)} onClick={() => add(i)}>{letters[i]}</button>)}</div>
        <div className="tools">
          <button type="button" className="btn sm" id="wk-mix" onClick={mix}>⇄ {t('Shuffle', '打乱', 'Karıştır')}</button>
          <button type="button" className="btn sm" id="wk-aback" onClick={back} disabled={!used.length}>⌫</button>
          <button type="button" className="btn sm primary" id="wk-aenter" onClick={enter} disabled={!canAct}>{t('Enter', '确定', 'Gir')}</button>
        </div>
      </>}
      {st.over && <p className="wk-reveal">{t('Last word', '最后一个词', 'Son kelime')}: <b>{w.secret}</b></p>}
    </div>
  );
}
