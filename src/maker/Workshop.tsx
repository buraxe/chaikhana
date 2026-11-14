import './workshop.css';
import { lazy, Suspense, useEffect, useMemo, useState } from 'react';
import { useLang, useT } from '../core/i18n';
import { sfx } from '../core/sound';
import { loadJSON, saveJSON } from '../core/storage';
import { Pick, Seg } from '../ui/bits';
import { chooseInput, LEVELS } from './ai';
import { apply, cardsOf, newGame, txt, validate, type EventName, type GameDef, type GState, type Input } from './engine';
import { EXAMPLES } from './examples';
import { GameView, playerColor, playerName } from './GameView';

type Seat = 'h' | number;
// Blockly is large, so the block editor loads only when its tab is opened.
const BlockEditor = lazy(() => import('./BlockEditor'));
const MINE = 'gp.workshop.mine';
const LEVEL_NAMES: Record<string, [string, string]> = { Beginner: ['新手', 'Acemi'], Easy: ['简单', 'Kolay'], Intermediate: ['中等', 'Orta'], Advanced: ['高级', 'İleri'], Expert: ['专家', 'Uzman'] };
const EVENT_NAMES: Record<EventName, [string, string, string]> = {
  start: ['When the game starts', '游戏开始时', 'Oyun başlayınca'],
  turn: ['When a turn starts', '回合开始时', 'Sıra başlayınca'],
  click: ['When a cell is clicked', '点击格子时', 'Bir kareye tıklanınca'],
  move: ['When a piece is moved', '移动棋子时', 'Bir taş taşınınca'],
  roll: ['When the dice are rolled', '掷骰时', 'Zar atılınca'],
  card: ['When a card is played', '出牌时', 'Bir kart oynanınca'],
  zone: ['When a pile is clicked', '点击牌堆时', 'Bir yığına tıklanınca'],
  button: ['When a button is pressed', '按下按钮时', 'Bir düğmeye basılınca'],
  enter: ['When a piece lands on a cell', '棋子落到格子上时', 'Bir taş bir kareye girince'],
  after: ['After every action', '每次行动之后', 'Her hamleden sonra'],
  blocked: ['When nobody can move', '无人可走时', 'Kimse oynayamayınca'],
};

const BLANK: GameDef = {
  format: 'chaikhana-game', version: 1, id: 'my-game', kind: 'game', name: 'My game',
  players: { min: 2, max: 2 },
  board: { w: 5, h: 5, checker: true },
  pieces: { stone: { name: 'Stone', shape: 'disc' } },
  rules: [{ on: 'click', when: { op: 'empty', cell: { op: 'get', name: 'cell' } }, do: [{ op: 'place', piece: 'stone', cell: { op: 'get', name: 'cell' } }, { op: 'if', test: { op: 'line', cell: { op: 'get', name: 'cell' }, n: 4 }, then: [{ op: 'win' }] }] }],
};

export function Workshop() {
  const t = useT(), lang = useLang();
  const [mine, setMine] = useState<GameDef[]>(() => loadJSON<GameDef[]>(MINE, []));
  const all = useMemo(() => [...EXAMPLES, ...mine], [mine]);
  const [defId, setDefId] = useState(() => loadJSON<string>('gp.workshop.pick', EXAMPLES[0].id));
  const def = all.find(d => d.id === defId) ?? EXAMPLES[0];
  const isMine = mine.some(d => d.id === def.id);
  const [tab, setTab] = useState<'play' | 'blocks' | 'rules' | 'json'>('play');
  const [count, setCount] = useState(def.players.max);
  const [seats, setSeats] = useState<Seat[]>(['h', 2, 2, 2, 2, 2]);
  // The state is kept with the definition it belongs to, so a switch never pairs a board with the wrong game.
  // Earlier states are kept for undo.
  const [game, setGame] = useState<{ def: GameDef; st: GState; hist: GState[] } | null>(null);
  const st = game && game.def === def ? game.st : null;
  const setSt = (n: GState) => setGame({ def, st: n, hist: [] });
  /** The seat that last saw the hidden hands: a pass-the-device screen covers them in between. */
  const [seenBy, setSeenBy] = useState<number | null>(null);
  const [src, setSrc] = useState('');
  const [errs, setErrs] = useState<string[]>([]);
  const [note, setNote] = useState('');

  useEffect(() => { saveJSON(MINE, mine); }, [mine]);
  useEffect(() => { saveJSON('gp.workshop.pick', def.id); }, [def.id]);
  // A new game whenever the definition changes.
  useEffect(() => {
    const n = Math.max(def.players.min, Math.min(def.players.max, def.players.max));
    setCount(n);
    setSrc(JSON.stringify(def, null, 2));
    setErrs([]); setNote('');
    setSt(newGame(def, n));
  }, [def]);

  const seatOf = (p: number): Seat => (def.players.max === 1 ? 'h' : seats[p]);
  const humans = st ? Array.from({ length: st.players }, (_, p) => p).filter(p => seatOf(p) === 'h') : [];
  const aiTurn = !!st && !st.over && seatOf(st.turn) !== 'h';
  const viewer: number | 'all' = !st ? 'all' : seatOf(st.turn) === 'h' ? st.turn : humans.length ? humans[0] : 'all';

  const play = (i: Input) => setGame(g => {
    if (!g || g.def !== def) return g;
    const s = g.st, n = apply(def, s, i);
    if (n.over && !s.over) sfx(n.over.winner >= 0 && seatOf(n.over.winner) === 'h' ? 'win' : n.over.winner < 0 ? 'draw' : 'lose');
    else sfx(i.k === 'roll' ? 'dice' : i.k === 'card' || i.k === 'zone' ? 'card' : 'stone', 0.6);
    return { def, st: n, hist: [...g.hist.slice(-200), s] };
  });
  /** Back to the last position where a person was to move. */
  const undo = () => setGame(g => {
    if (!g || !g.hist.length) return g;
    const hist = g.hist.slice();
    let back = hist.pop()!;
    while (hist.length && seatOf(back.turn) !== 'h') back = hist.pop()!;
    if (seatOf(back.turn) !== 'h') return g;
    setSeenBy(back.turn);
    return { def, st: back, hist };
  });
  const canUndo = !!game && game.def === def && game.hist.some(h => seatOf(h.turn) === 'h') && !aiTurn;
  const secret = Object.values(def.zones ?? {}).some(z => z.show === 'owner') && humans.length > 1;
  const passing = !!st && secret && !st.over && seatOf(st.turn) === 'h' && seenBy !== st.turn;
  useEffect(() => {
    if (!aiTurn || !st) return;
    const level = seatOf(st.turn) as number;
    const id = setTimeout(() => { const m = chooseInput(def, st, level, { ms: 1200 }); if (m) play(m); }, 450);
    return () => clearTimeout(id);
  }, [st, aiTurn]); // eslint-disable-line

  const restart = () => { setSeenBy(null); setSt(newGame(def, count)); };
  const load = (save: boolean) => {
    let parsed: unknown;
    try { parsed = JSON.parse(src); } catch (e) { setErrs([t('This is not valid JSON: ', '这不是有效的JSON：', 'Bu geçerli bir JSON değil: ') + (e as Error).message]); return; }
    const problems = validate(parsed);
    setErrs(problems);
    if (problems.length) return;
    let d = parsed as GameDef;
    const fromExample = EXAMPLES.some(e => e.id === d.id);
    if (save || fromExample || isMine) {
      if (fromExample) d = { ...d, id: d.id.replace(/^ex-/, 'my-') + '-' + Date.now().toString(36) };
      setMine(m => [...m.filter(x => x.id !== d.id), d]);
      setNote(t('Saved to your games on this device.', '已保存到本设备上的“我的游戏”。', 'Bu cihazdaki oyunlarına kaydedildi.'));
    }
    setDefId(d.id);
    setTab('play');
  };
  /** Rules from the block editor: an example is saved as the player's own copy. */
  const applyRules = (rules: GameDef['rules']) => {
    let d: GameDef = { ...def, rules };
    if (!isMine) d = { ...d, id: def.id.replace(/^ex-/, 'my-') + '-' + Date.now().toString(36), name: typeof def.name === 'string' ? def.name + ' *' : { ...def.name, en: def.name.en + ' *', ...(def.name.zh ? { zh: def.name.zh + ' *' } : {}), ...(def.name.tr ? { tr: def.name.tr + ' *' } : {}) } };
    setMine(m => [...m.filter(x => x.id !== d.id), d]);
    setDefId(d.id);
    setTab('play');
  };
  const remove = () => { setMine(m => m.filter(x => x.id !== def.id)); setDefId(EXAMPLES[0].id); };
  const copy = () => { navigator.clipboard?.writeText(src).then(() => setNote(t('Copied.', '已复制。', 'Kopyalandı.')), () => setNote(t('Select the text and copy it by hand.', '请手动选择并复制。', 'Metni seçip elle kopyala.'))); };

  const status = !st ? '' : st.error ? t('The game stopped: ', '游戏中止：', 'Oyun durdu: ') + st.error
    : st.over ? (def.kind === 'puzzle' || st.players === 1
      ? (st.over.winner === 0 ? t('Solved!', '完成！', 'Çözüldü!') : st.over.stuck ? t('No moves left.', '无路可走了。', 'Hamle kalmadı.') : t('Not solved.', '未完成。', 'Çözülemedi.'))
      : st.over.winner >= 0 ? t(`${playerName(def, st.over.winner, 'en')} wins!`, `${playerName(def, st.over.winner, 'zh')}获胜！`, `${playerName(def, st.over.winner, 'tr')} kazandı!`) : t('Draw.', '和棋。', 'Berabere.'))
    : st.players === 1 ? t('Your move.', '请走。', 'Sıra sende.')
    : aiTurn ? t(`${playerName(def, st.turn, 'en')} (computer) is thinking…`, `${playerName(def, st.turn, 'zh')}（电脑）思考中…`, `${playerName(def, st.turn, 'tr')} (bilgisayar) düşünüyor…`)
    : t(`${playerName(def, st.turn, 'en')} to move`, `轮到${playerName(def, st.turn, 'zh')}`, `Sıra: ${playerName(def, st.turn, 'tr')}`);
  const levelName = (i: number) => { const n = LEVELS[i].name; return lang === 'zh' ? LEVEL_NAMES[n][0] : lang === 'tr' ? LEVEL_NAMES[n][1] : n; };

  return (
    <>
      <header className="page-head">
        <h1>{t('Workshop', '工坊', 'Atölye')}</h1>
        <p className="lede">{t('Make your own games and puzzles. A game is materials (a board, pieces, cards, dice, counters) and rules of the form “when this happens, if that holds, do these”. For now games are written as JSON; the block editor that builds the same rules by dragging comes next.',
          '制作你自己的游戏和谜题。一个游戏由材料（棋盘、棋子、纸牌、骰子、计数器）和“当……发生时，如果……，就做……”形式的规则组成。目前游戏以JSON编写；用拖拽积木来搭建同样规则的编辑器是下一步。',
          'Kendi oyunlarını ve bulmacalarını yap. Bir oyun, malzemelerden (tahta, taşlar, kartlar, zar, sayaçlar) ve “şu olunca, şu doğruysa, şunları yap” biçimindeki kurallardan oluşur. Şimdilik oyunlar JSON olarak yazılıyor; aynı kuralları sürükleyerek kuran blok düzenleyici sıradaki adım.')}</p>
      </header>

      <div className="wk-picker" role="list">
        {all.map(d => (
          <button key={d.id} type="button" role="listitem" id={'wk-pick-' + d.id} className={'wk-pick' + (d.id === def.id ? ' on' : '')} onClick={() => setDefId(d.id)}>
            <b>{txt(d.name, lang)}</b>
            <span>{mine.includes(d) ? t('Your game', '我的游戏', 'Senin oyunun') : t('Example', '示例', 'Örnek')} · {d.kind === 'puzzle' ? t('puzzle', '谜题', 'bulmaca') : `${d.players.min}–${d.players.max} ${t('players', '人', 'oyuncu')}`}</span>
          </button>
        ))}
        <button type="button" className="wk-pick new" id="wk-new" onClick={() => { setSrc(JSON.stringify({ ...BLANK, id: 'my-' + Date.now().toString(36) }, null, 2)); setErrs([]); setTab('json'); }}>
          <b>+ {t('New game', '新游戏', 'Yeni oyun')}</b><span>{t('Start from a blank template', '从空白模板开始', 'Boş şablondan başla')}</span>
        </button>
      </div>

      <div className="seg wk-tabs" role="tablist">
        {([['play', t('Play', '试玩', 'Oyna')], ['blocks', t('Blocks', '积木', 'Bloklar')], ['rules', t('Materials', '材料', 'Malzemeler')], ['json', 'JSON']] as const).map(([k, l]) => (
          <button key={k} type="button" role="tab" id={'wk-tab-' + k} aria-selected={tab === k} className={tab === k ? 'on' : ''} onClick={() => setTab(k)}>{l}</button>
        ))}
      </div>

      {tab === 'play' && st && (
        <div className="play">
          <div className="play-main">
            <div className="statline"><span role="status" aria-live="polite">{st.players > 1 && !st.over && <i className="wk-dot" style={{ background: playerColor(def, st.turn) }} />}{status}</span>
              {st.msg && <span className="wk-msg">{txt(st.msg, lang)}</span>}</div>
            <GameView def={def} st={st} viewer={passing ? -1 : viewer} canAct={!aiTurn && !passing} onInput={play} />
            {passing && (
              <div className="wk-pass" role="dialog" aria-modal="true" aria-labelledby="wk-pass-h">
                <div>
                  <h2 id="wk-pass-h">{t(`Pass to ${playerName(def, st.turn, 'en')}`, `请交给${playerName(def, st.turn, 'zh')}`, `Cihazı ${playerName(def, st.turn, 'tr')} oyuncusuna ver`)}</h2>
                  <p>{t('The other players should look away: your hand is about to be shown.', '其他玩家请回避：马上要显示你的手牌。', 'Diğer oyuncular baksın istemiyorsan başka yöne baksınlar: elin gösterilecek.')}</p>
                  <button type="button" className="btn primary" id="wk-ready" onClick={() => setSeenBy(st.turn)}>{t('I’m ready', '我准备好了', 'Hazırım')}</button>
                </div>
              </div>
            )}
          </div>
          <aside className="play-side">
            {def.about && <p className="muted small">{txt(def.about, lang)}</p>}
            {Object.entries(def.vars ?? {}).some(([, v]) => v.show) && (
              <dl className="facts">{Object.entries(def.vars ?? {}).filter(([, v]) => v.show).flatMap(([k, v]) => (st.vars[k].length === 1
                ? [<div key={k}><dt>{txt(v.name, lang)}</dt><dd className="num">{st.vars[k][0]}</dd></div>]
                : st.vars[k].map((x, p) => <div key={k + p}><dt>{txt(v.name, lang)} · {playerName(def, p, lang)}</dt><dd className="num">{x}</dd></div>)))}</dl>
            )}
            <div className="setup">
              {def.players.max > 1 && def.players.min !== def.players.max && (
                <Seg id="wk-count" label={t('Players', '人数', 'Oyuncu sayısı')} value={count} onChange={setCount}
                  options={Array.from({ length: def.players.max - def.players.min + 1 }, (_, i) => ({ value: def.players.min + i, label: String(def.players.min + i) }))} />
              )}
              {def.players.max > 1 && Array.from({ length: count }, (_, p) => (
                <Pick key={p} id={'wk-seat-' + p} label={playerName(def, p, lang)} value={String(seats[p])}
                  onChange={v => setSeats(s => s.map((x, i) => (i === p ? (v === 'h' ? 'h' : Number(v)) : x)))}
                  options={[{ value: 'h', label: t('Person', '真人', 'Kişi') }, ...LEVELS.map((_, i) => ({ value: String(i), label: t('Computer', '电脑', 'Bilgisayar') + ' · ' + levelName(i) }))]} />
              ))}
              <button type="button" className="btn" id="wk-undo" disabled={!canUndo} onClick={undo}>↶ {t('Undo', '悔棋', 'Geri al')}</button>
              <button type="button" className="btn primary" id="wk-restart" onClick={restart}>{st.over ? t('Play again', '再来一局', 'Tekrar oyna') : t('Restart', '重新开始', 'Yeniden başla')}</button>
            </div>
          </aside>
        </div>
      )}

      {tab === 'blocks' && (
        <Suspense fallback={<p className="muted">{t('Loading the block editor…', '正在加载积木编辑器…', 'Blok düzenleyici yükleniyor…')}</p>}>
          <BlockEditor def={def} onApply={applyRules} />
        </Suspense>
      )}

      {tab === 'rules' && (
        <div className="wk-rules">
          <section>
            <h3>{t('Materials', '材料', 'Malzemeler')}</h3>
            <ul className="wk-list">
              <li>{def.kind === 'puzzle' ? t('One-player puzzle', '单人谜题', 'Tek kişilik bulmaca') : t(`${def.players.min}–${def.players.max} players`, `${def.players.min}–${def.players.max}人`, `${def.players.min}–${def.players.max} oyuncu`)}</li>
              {def.board && <li>{t('Board', '棋盘', 'Tahta')}: {def.board.w}×{def.board.h}{def.board.path === 'snake' ? t(', race track', '，赛道', ', yarış yolu') : ''}</li>}
              {Object.entries(def.board?.types ?? {}).map(([k, ty]) => <li key={k}><i className="wk-swatch" style={{ background: ty.color }} /> {t('Cell type', '格子类型', 'Kare türü')}: {txt(ty.name, lang)}</li>)}
              {Object.entries(def.pieces ?? {}).map(([k, p]) => <li key={k}>{t('Piece', '棋子', 'Taş')}: {txt(p.name, lang)} ({p.shape})</li>)}
              {def.cards && <li>{t('Cards', '纸牌', 'Kartlar')}: {cardsOf(def).length} — {Object.entries(def.cards.fields).map(([f, v]) => `${f} (${v.length})`).join(' × ')}{(def.cards.copies ?? 1) > 1 ? ` × ${def.cards.copies}` : ''}</li>}
              {Object.entries(def.zones ?? {}).map(([k, z]) => <li key={k}>{t('Zone', '区域', 'Alan')}: {txt(z.name, lang)} ({z.owner === 'each' ? t('one per player', '每人一个', 'oyuncu başına') : t('shared', '共用', 'ortak')})</li>)}
              {def.dice && <li>{t('Dice', '骰子', 'Zar')}: {def.dice.count} × d{def.dice.faces}</li>}
              {Object.entries(def.vars ?? {}).map(([k, v]) => <li key={k}>{t('Counter', '计数器', 'Sayaç')}: {txt(v.name, lang)}</li>)}
            </ul>
          </section>
          <section>
            <h3>{t('Rules', '规则', 'Kurallar')}</h3>
            <ol className="wk-list rules">
              {def.rules.map((r, i) => (
                <li key={i}><span className="wk-event">{t(...EVENT_NAMES[r.on])}{r.cellType ? ` · ${txt(def.board?.types?.[r.cellType]?.name, lang)}` : ''}{r.zone ? ` · ${txt(def.zones?.[r.zone]?.name, lang)}` : ''}</span>
                  {r.name && <b>{txt(r.name, lang)}</b>}
                  <span className="muted small">{r.when ? t('with a condition', '带条件', 'koşullu') + ' · ' : ''}{r.do.length} {t('actions', '个动作', 'eylem')}</span></li>
              ))}
            </ol>
          </section>
        </div>
      )}

      {tab === 'json' && (
        <div className="wk-json">
          <textarea id="wk-src" value={src} onChange={e => setSrc(e.target.value)} spellCheck={false} aria-label={t('Game definition', '游戏定义', 'Oyun tanımı')} />
          <div className="tools">
            <button type="button" className="btn primary" id="wk-load" onClick={() => load(false)}>{t('Check and play', '检查并试玩', 'Kontrol et ve oyna')}</button>
            <button type="button" className="btn" id="wk-save" onClick={() => load(true)}>{t('Save as my game', '保存为我的游戏', 'Oyunum olarak kaydet')}</button>
            <button type="button" className="btn" id="wk-copy" onClick={copy}>{t('Copy', '复制', 'Kopyala')}</button>
            {isMine && <button type="button" className="btn danger" id="wk-delete" onClick={remove}>{t('Delete', '删除', 'Sil')}</button>}
          </div>
          {note && <p className="muted small" role="status">{note}</p>}
          {errs.length > 0 && <ul className="wk-errs" role="alert">{errs.slice(0, 12).map((e, i) => <li key={i}>{e}</li>)}</ul>}
        </div>
      )}
    </>
  );
}
