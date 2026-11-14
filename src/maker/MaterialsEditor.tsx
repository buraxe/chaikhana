import { useMemo, useState, type ReactNode } from 'react';
import { useLang, useT } from '../core/i18n';
import { canon, cardsOf, compile, txt, validate, type BoardDef, type GameDef, type Mark, type PieceDef, type Text, type ZoneDef } from './engine';
import { CardFace, playerColor } from './GameView';

type Lang = 'en' | 'zh' | 'tr';
/** Edits a multi-language text in the current language, keeping the others. */
function setText(t: Text | undefined, lang: Lang, v: string): Text {
  if (t === undefined || typeof t === 'string') return v;
  return { ...t, [lang]: v, ...(lang === 'en' ? {} : { en: t.en || v }) };
}
/** A short id from a name: ascii, lowercase, unique among the existing ones. */
function slug(name: string, taken: Record<string, unknown> | undefined, fallback: string): string {
  const base = name.normalize('NFKD').replace(/[̀-ͯ]/g, '').replace(/ı/g, 'i').toLowerCase().replace(/[^a-z0-9]+/g, '') || fallback;
  let id = base, k = 2;
  while (taken && id in taken) id = base + k++;
  return id;
}
/** "1-9" becomes 1…9; "red, blue" stays words; numbers become numbers. */
export function parseValues(s: string): (string | number)[] {
  const out: (string | number)[] = [];
  for (const raw of s.split(',').map(x => x.trim()).filter(Boolean)) {
    const m = raw.match(/^(-?\d+)\s*-\s*(-?\d+)$/);
    if (m) { const a = +m[1], b = +m[2]; for (let i = a; a <= b ? i <= b : i >= b; i += a <= b ? 1 : -1) out.push(i); continue; }
    out.push(/^-?\d+(\.\d+)?$/.test(raw) ? Number(raw) : raw);
  }
  return out;
}
const PALETTE = ['#c0392b', '#1f4e9c', '#1e7a4a', '#e0a020', '#7b3fa0', '#1a8a8a'];
const SHAPES: PieceDef['shape'][] = ['disc', 'square', 'pawn', 'star', 'ring', 'text'];

function Sec({ title, children, aside }: { title: string; children: ReactNode; aside?: ReactNode }) {
  return <section className="wk-sec"><header><h3>{title}</h3>{aside}</header>{children}</section>;
}
function F({ label, children, wide }: { label: string; children: ReactNode; wide?: boolean }) {
  return <label className={'wk-f' + (wide ? ' wide' : '')}><span>{label}</span>{children}</label>;
}

export function MaterialsEditor({ def, onSave }: { def: GameDef; onSave: (d: GameDef) => void }) {
  const t = useT(), lang = useLang();
  const [d, setD] = useState<GameDef>(() => structuredClone(def));
  const up = (f: (x: GameDef) => void) => setD(prev => { const n = structuredClone(prev); f(n); return n; });
  const errs = useMemo(() => validate(d), [d]);
  const dirty = canon(d) !== canon(def);
  const tt = (x: Text | undefined) => txt(x, lang);

  // ── board painting ──
  const [brush, setBrush] = useState<string>('');
  const [linkFrom, setLinkFrom] = useState<number | null>(null);
  const [picked, setPicked] = useState<number | null>(null);
  const [painting, setPainting] = useState(false);
  const [propName, setPropName] = useState('');
  const b = d.board;
  const markOf = (i: number) => b?.marks?.find(m => m.cell === i);
  const setMark = (i: number, f: (m: Mark) => void) => up(x => {
    const bd = x.board!, ms = bd.marks ?? (bd.marks = []);
    let m = ms.find(z => z.cell === i);
    if (!m) { m = { cell: i }; ms.push(m); }
    f(m);
    if (m.props && !Object.keys(m.props).length) delete m.props;
    bd.marks = ms.filter(z => z.type || z.props);
  });
  const paint = (i: number) => {
    if (brush === 'link') {
      if (linkFrom === null) { setLinkFrom(i); return; }
      if (linkFrom !== i) setMark(linkFrom, m => { m.props = { ...m.props, to: i }; });
      else setMark(i, m => { if (m.props) delete m.props.to; });
      setLinkFrom(null);
      return;
    }
    if (brush === 'num') { setPicked(i); return; }
    setMark(i, m => { if (brush) m.type = brush; else delete m.type; });
  };
  const resize = (w: number, h: number) => up(x => {
    const bd = x.board!, ow = bd.w;
    bd.marks = (bd.marks ?? []).flatMap(m => {
      const r = Math.floor(m.cell / ow), c = m.cell % ow;
      if (r >= h || c >= w) return [];
      const to = m.props?.to;
      const props = to === undefined ? m.props : (() => { const tr = Math.floor(to / ow), tc = to % ow; const p = { ...m.props }; if (tr < h && tc < w) p.to = tr * w + tc; else delete p.to; return p; })();
      return [{ ...m, cell: r * w + c, ...(props ? { props } : {}) }];
    });
    bd.w = w; bd.h = h;
    if (Array.isArray(bd.path)) bd.path = 'rows';
  });

  let boardSvg: ReactNode = null;
  if (b) {
    const c = compile(d), hex = b.grid === 'hex', HR = 1 / Math.sqrt(3), RH = hex ? 0.866 : 1;
    const cen = (i: number): [number, number] => { const x = i % b.w, y = Math.floor(i / b.w); return hex ? [x + y * 0.5 + 0.5, y * RH + HR] : [x + 0.5, y + 0.5]; };
    const W = hex ? b.w + (b.h - 1) * 0.5 : b.w, H = hex ? (b.h - 1) * RH + 2 * HR : b.h;
    const shape = (i: number, props: Record<string, unknown>) => {
      const [cx, cy] = cen(i);
      return hex
        ? <polygon key={i} points={Array.from({ length: 6 }, (_, k) => { const a = (Math.PI / 3) * k - Math.PI / 2; return `${cx + (HR - 0.02) * Math.cos(a)},${cy + (HR - 0.02) * Math.sin(a)}`; }).join(' ')} {...props} />
        : <rect key={i} x={cx - 0.48} y={cy - 0.48} width={0.96} height={0.96} rx={0.06} {...props} />;
    };
    const cellAt = (e: React.PointerEvent) => { const el = document.elementFromPoint(e.clientX, e.clientY) as SVGElement | null; const v = el?.getAttribute('data-cell'); return v == null ? null : Number(v); };
    boardSvg = (
      <svg className="wk-board wk-paint" viewBox={`-0.1 -0.1 ${W + 0.2} ${H + 0.2}`} style={{ maxWidth: Math.min(560, W * 56) }}
        onPointerDown={e => { const i = cellAt(e); if (i === null) return; (e.target as Element).releasePointerCapture?.(e.pointerId); setPainting(brush !== 'link' && brush !== 'num'); paint(i); }}
        onPointerMove={e => { if (!painting) return; const i = cellAt(e); if (i !== null && (markOf(i)?.type ?? '') !== brush) paint(i); }}
        onPointerUp={() => setPainting(false)} onPointerLeave={() => setPainting(false)}>
        <defs>{['up', 'down'].map(k => <marker key={k} id={'wk-ed-arrow-' + k} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="4" markerHeight="4" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" className={'wk-arrowhead ' + k} /></marker>)}</defs>
        {Array.from({ length: c.cells }, (_, i) => {
          const m = markOf(i), ty = m?.type, x = i % b.w, y = Math.floor(i / b.w);
          const fill = ty === '#' ? 'transparent' : ty && b.types?.[ty] ? b.types[ty].color : b.checker && (x + y) % 2 ? 'var(--wk-dark)' : 'var(--wk-light)';
          return shape(i, { fill, 'data-cell': i, className: 'wk-pcell' + (ty === '#' ? ' hole' : '') + (linkFrom === i || picked === i ? ' on' : '') });
        })}
        {b.showPath && c.path.map((cell, k) => { const [cx, cy] = cen(cell); return <text key={'n' + cell} x={cx - 0.4} y={cy - 0.24} className="wk-num" pointerEvents="none">{k + 1}</text>; })}
        {(b.marks ?? []).filter(m => m.props?.to !== undefined).map(m => { const [x1, y1] = cen(m.cell), [x2, y2] = cen(m.props!.to); const upp = c.pathPos[m.props!.to] > c.pathPos[m.cell]; return <line key={'l' + m.cell} x1={x1} y1={y1} x2={x2} y2={y2} className={'wk-link ' + (upp ? 'up' : 'down')} markerEnd={`url(#wk-ed-arrow-${upp ? 'up' : 'down'})`} pointerEvents="none" />; })}
        {(b.marks ?? []).filter(m => m.props && Object.keys(m.props).some(k => k !== 'to')).map(m => { const [cx, cy] = cen(m.cell); return <circle key={'p' + m.cell} cx={cx + 0.3} cy={cy + 0.3} r={0.08} className="wk-propdot" pointerEvents="none" />; })}
      </svg>
    );
  }

  // ── list helpers for keyed materials ──
  type Keyed = 'pieces' | 'zones' | 'vars' | 'buttons';
  const addKeyed = (k: Keyed, name: string, make: () => object) => up(x => { const rec = ((x as unknown as Record<string, Record<string, unknown>>)[k] ??= {}); rec[slug(name, rec, k.slice(0, -1))] = make(); });
  const delKeyed = (k: Keyed, id: string) => up(x => { const rec = (x as unknown as Record<string, Record<string, unknown> | undefined>)[k]; if (rec) { delete rec[id]; if (!Object.keys(rec).length) delete (x as unknown as Record<string, unknown>)[k]; } });
  const del = (k: Keyed, id: string) => <button type="button" className="btn sm ghost" aria-label={t('Remove', '删除', 'Kaldır')} title={t('Remove', '删除', 'Kaldır')} onClick={() => delKeyed(k, id)}>✕</button>;
  const idTag = (id: string) => <code className="wk-id" title={t('Name used in the rules', '规则中使用的名称', 'Kurallarda kullanılan ad')}>{id}</code>;

  const cards = d.cards;
  const preview = cards ? cardsOf(d).slice(0, 12).map((_, i) => i) : [];

  return (
    <div className="wk-mat">
      <div className="wk-mat-bar">
        <button type="button" className="btn primary" id="wk-mat-save" disabled={!dirty || errs.length > 0} onClick={() => onSave(d)}>{t('Save and play', '保存并试玩', 'Kaydet ve oyna')}</button>
        <button type="button" className="btn" id="wk-mat-revert" disabled={!dirty} onClick={() => setD(structuredClone(def))}>{t('Undo all changes', '撤销全部修改', 'Tüm değişiklikleri geri al')}</button>
        {errs.length > 0 && <span className="wk-mat-err">{t(`${errs.length} problems`, `${errs.length} 个问题`, `${errs.length} sorun`)}</span>}
      </div>
      {errs.length > 0 && <ul className="wk-errs" role="alert">{errs.slice(0, 6).map((e, i) => <li key={i}>{e}</li>)}</ul>}

      <Sec title={t('General', '基本', 'Genel')}>
        <div className="wk-row">
          <F label={t('Name', '名称', 'Ad')} wide><input id="wk-m-name" value={tt(d.name)} onChange={e => up(x => { x.name = setText(x.name, lang, e.target.value); })} /></F>
          <F label={t('Kind', '类型', 'Tür')}>
            <select id="wk-m-kind" value={d.kind} onChange={e => up(x => { x.kind = e.target.value as GameDef['kind']; if (x.kind === 'puzzle') x.players = { ...x.players, min: 1, max: 1 }; })}>
              <option value="game">{t('Game', '游戏', 'Oyun')}</option><option value="puzzle">{t('Puzzle (one player)', '谜题（单人）', 'Bulmaca (tek kişi)')}</option>
            </select>
          </F>
          {d.kind === 'game' && <>
            <F label={t('Players from', '最少人数', 'En az oyuncu')}><input type="number" min={1} max={6} value={d.players.min} onChange={e => up(x => { x.players.min = Math.max(1, Math.min(6, +e.target.value)); x.players.max = Math.max(x.players.max, x.players.min); })} /></F>
            <F label={t('to', '最多人数', 'En çok')}><input type="number" min={1} max={6} value={d.players.max} onChange={e => up(x => { x.players.max = Math.max(x.players.min, Math.min(6, +e.target.value)); })} /></F>
            <F label={t('Turns', '回合', 'Sıra')}>
              <select value={d.turns ?? 'auto'} onChange={e => up(x => { x.turns = e.target.value as 'auto' | 'manual'; })}>
                <option value="auto">{t('Pass after each action', '每次行动后轮换', 'Her hamleden sonra geçer')}</option>
                <option value="manual">{t('Only on “end the turn”', '仅在“结束回合”时', 'Yalnızca “sırayı bitir” ile')}</option>
              </select>
            </F>
          </>}
        </div>
        <F label={t('Description', '说明', 'Açıklama')} wide><textarea rows={2} value={tt(d.about)} onChange={e => up(x => { x.about = setText(x.about, lang, e.target.value); })} /></F>
        <div className="wk-row">
          {Array.from({ length: d.players.max }, (_, p) => (
            <F key={p} label={t(`Player ${p + 1}`, `玩家${p + 1}`, `Oyuncu ${p + 1}`)}>
              <span className="wk-pl">
                <input type="color" value={playerColor(d, p)} onChange={e => up(x => { const cs = Array.from({ length: x.players.max }, (_, i) => playerColor(x, i)); cs[p] = e.target.value; x.players.colors = cs; })} />
                <input placeholder={t(`Player ${p + 1}`, `玩家${p + 1}`, `Oyuncu ${p + 1}`)} value={tt(d.players.names?.[p])} onChange={e => up(x => { const ns = Array.from({ length: x.players.max }, (_, i) => x.players.names?.[i] ?? ''); ns[p] = setText(ns[p] || undefined, lang, e.target.value); x.players.names = ns; if (ns.every(n => !txt(n, lang))) delete x.players.names; })} />
              </span>
            </F>
          ))}
        </div>
      </Sec>

      <Sec title={t('Board', '棋盘', 'Tahta')} aside={
        <label className="check"><input type="checkbox" id="wk-m-board" checked={!!b} onChange={e => up(x => { if (e.target.checked) x.board = { w: 8, h: 8, checker: true }; else delete x.board; })} /> {t('Use a board', '使用棋盘', 'Tahta kullan')}</label>}>
        {b ? <>
          <div className="wk-row">
            <F label={t('Width', '宽', 'Genişlik')}><input id="wk-m-w" type="number" min={1} max={20} value={b.w} onChange={e => resize(Math.max(1, Math.min(20, +e.target.value || 1)), b.h)} /></F>
            <F label={t('Height', '高', 'Yükseklik')}><input id="wk-m-h" type="number" min={1} max={20} value={b.h} onChange={e => resize(b.w, Math.max(1, Math.min(20, +e.target.value || 1)))} /></F>
            <F label={t('Cells', '格子', 'Kareler')}>
              <select id="wk-m-grid" value={b.grid ?? 'square'} onChange={e => up(x => { x.board!.grid = e.target.value as BoardDef['grid']; })}>
                <option value="square">{t('Squares', '方格', 'Kare')}</option><option value="hex">{t('Hexagons', '六边形', 'Altıgen')}</option>
              </select>
            </F>
            <F label={t('Race track', '赛道', 'Yarış yolu')}>
              <select value={Array.isArray(b.path) ? 'custom' : b.path ?? 'rows'} onChange={e => up(x => { const v = e.target.value; if (v !== 'custom') x.board!.path = v as 'rows' | 'snake'; x.board!.showPath = v === 'snake' || (v === 'rows' && !!x.board!.showPath); })}>
                <option value="rows">{t('Reading order', '按行', 'Okuma sırası')}</option>
                <option value="snake">{t('Snake from bottom left', '从左下蛇形', 'Sol alttan yılan gibi')}</option>
                {Array.isArray(b.path) && <option value="custom">{t('Custom', '自定义', 'Özel')}</option>}
              </select>
            </F>
          </div>
          <div className="wk-row checks">
            <label className="check"><input type="checkbox" checked={!!b.checker} onChange={e => up(x => { x.board!.checker = e.target.checked; })} /> {t('Checkered', '棋盘格', 'Damalı')}</label>
            <label className="check"><input type="checkbox" checked={!!b.showPath} onChange={e => up(x => { x.board!.showPath = e.target.checked; })} /> {t('Number the track', '显示格子编号', 'Yolu numarala')}</label>
            <label className="check"><input type="checkbox" checked={!!b.links} onChange={e => up(x => { x.board!.links = e.target.checked; })} /> {t('Show arrows', '显示箭头', 'Okları göster')}</label>
          </div>

          <h4>{t('Cell types', '格子类型', 'Kare türleri')}</h4>
          <div className="wk-items">
            {Object.entries(b.types ?? {}).map(([id, ty]) => (
              <div key={id} className="wk-item">
                <input type="color" value={ty.color} onChange={e => up(x => { x.board!.types![id].color = e.target.value; })} aria-label={t('Colour', '颜色', 'Renk')} />
                <input value={tt(ty.name)} onChange={e => up(x => { x.board!.types![id].name = setText(x.board!.types![id].name, lang, e.target.value); })} aria-label={t('Name', '名称', 'Ad')} />
                <input className="short" value={ty.label ?? ''} placeholder={t('label', '标记', 'etiket')} maxLength={3} onChange={e => up(x => { if (e.target.value) x.board!.types![id].label = e.target.value; else delete x.board!.types![id].label; })} />
                {idTag(id)}
                <button type="button" className="btn sm ghost" aria-label={t('Remove', '删除', 'Kaldır')} onClick={() => up(x => { delete x.board!.types![id]; x.board!.marks = (x.board!.marks ?? []).map(m => (m.type === id ? { ...m, type: undefined } : m)).filter(m => m.type || m.props); })}>✕</button>
              </div>
            ))}
            <button type="button" className="btn sm" id="wk-m-addtype" onClick={() => up(x => { const types = (x.board!.types ??= {}); const n = Object.keys(types).length; const name = t(`Type ${n + 1}`, `类型${n + 1}`, `Tür ${n + 1}`); types[slug(name, types, 'type')] = { name, color: ['#b8d8a8', '#e8b0a0', '#bfcdea', '#f0dc8c', '#d8b8e8'][n % 5] }; })}>+ {t('Cell type', '格子类型', 'Kare türü')}</button>
          </div>

          <h4>{t('Paint the board', '绘制棋盘', 'Tahtayı boya')}</h4>
          <div className="wk-brushes" role="radiogroup" aria-label={t('Brush', '画笔', 'Fırça')}>
            {[['', t('Plain', '普通', 'Düz'), 'var(--wk-light)'], ['#', t('Hole', '挖空', 'Delik'), 'transparent'], ...Object.entries(b.types ?? {}).map(([id, ty]) => [id, tt(ty.name), ty.color])].map(([id, name, col]) => (
              <button key={id || 'plain'} type="button" role="radio" aria-checked={brush === id} id={'wk-brush-' + (id === '#' ? 'hole' : id || 'plain')} className={'wk-brush' + (brush === id ? ' on' : '')} onClick={() => { setBrush(id); setLinkFrom(null); setPicked(null); }}>
                <i style={{ background: col }} className={id === '#' ? 'hole' : ''} />{name}
              </button>
            ))}
            <button type="button" role="radio" aria-checked={brush === 'link'} id="wk-brush-link" className={'wk-brush' + (brush === 'link' ? ' on' : '')} onClick={() => { setBrush('link'); setPicked(null); }}>➜ {t('Arrow', '箭头', 'Ok')}</button>
            <button type="button" role="radio" aria-checked={brush === 'num'} id="wk-brush-num" className={'wk-brush' + (brush === 'num' ? ' on' : '')} onClick={() => { setBrush('num'); setLinkFrom(null); }}># {t('Numbers', '数值', 'Sayılar')}</button>
          </div>
          <p className="muted small">{brush === 'link' ? (linkFrom === null ? t('Tap the cell the arrow starts from.', '点箭头起点的格子。', 'Okun başlayacağı kareye dokun.') : t('Now tap where it leads (the same cell removes it). Rules read it as the number “to”.', '再点终点（点同一格则删除）。规则中读作数值“to”。', 'Şimdi gideceği kareye dokun (aynı kare oku siler). Kurallar bunu “to” sayısı olarak okur.'))
            : brush === 'num' ? t('Tap a cell to give it numbers the rules can read.', '点一个格子，为它设置规则可读取的数值。', 'Bir kareye dokun, kuralların okuyabileceği sayılar ver.')
            : t('Tap or drag across cells to paint them.', '点击或拖动来绘制格子。', 'Boyamak için karelere dokun ya da sürükle.')}</p>
          {boardSvg}
          {brush === 'num' && picked !== null && (
            <div className="wk-props">
              <b>{t(`Cell ${picked}`, `格子 ${picked}`, `Kare ${picked}`)}</b>
              {Object.entries(markOf(picked)?.props ?? {}).map(([k, v]) => (
                <span key={k} className="wk-prop"><code>{k}</code><input type="number" value={v} onChange={e => setMark(picked, m => { m.props = { ...m.props, [k]: +e.target.value }; })} />
                  <button type="button" className="btn sm ghost" onClick={() => setMark(picked, m => { if (m.props) delete m.props[k]; })}>✕</button></span>
              ))}
              <input className="short" value={propName} placeholder={t('name', '名称', 'ad')} onChange={e => setPropName(e.target.value.replace(/[^A-Za-z0-9_]/g, ''))} aria-label={t('Number name', '数值名称', 'Sayının adı')} />
              <button type="button" className="btn sm" id="wk-m-addprop" disabled={!propName} onClick={() => { setMark(picked, m => { m.props = { ...m.props, [propName]: m.props?.[propName] ?? 0 }; }); setPropName(''); }}>+ {t('Number', '数值', 'Sayı')}</button>
            </div>
          )}
        </> : <p className="muted small">{t('Without a board the game is played with cards, dice and counters only.', '没有棋盘时，游戏只用纸牌、骰子和计数器进行。', 'Tahtasız oyun yalnızca kart, zar ve sayaçlarla oynanır.')}</p>}
      </Sec>

      <Sec title={t('Pieces', '棋子', 'Taşlar')}>
        <div className="wk-items">
          {Object.entries(d.pieces ?? {}).map(([id, p]) => (
            <div key={id} className="wk-item">
              <svg viewBox="0 0 1 1" className="wk-pprev" aria-hidden="true"><circle cx=".5" cy=".5" r=".4" fill={p.color ?? playerColor(d, 0)} /></svg>
              <input value={tt(p.name)} onChange={e => up(x => { x.pieces![id].name = setText(x.pieces![id].name, lang, e.target.value); })} aria-label={t('Name', '名称', 'Ad')} />
              <select value={p.shape} onChange={e => up(x => { x.pieces![id].shape = e.target.value as PieceDef['shape']; })} aria-label={t('Shape', '形状', 'Şekil')}>
                {SHAPES.map(s => <option key={s} value={s}>{({ disc: t('disc', '圆片', 'pul'), square: t('square', '方块', 'kare'), pawn: t('pawn', '兵', 'piyon'), star: t('star', '星', 'yıldız'), ring: t('ring', '环', 'halka'), text: t('letter', '文字', 'harf') } as Record<string, string>)[s]}</option>)}
              </select>
              {p.shape === 'text' && <input className="short" maxLength={2} value={p.label ?? ''} placeholder="A" onChange={e => up(x => { x.pieces![id].label = e.target.value; })} />}
              <label className="check small"><input type="checkbox" checked={!!p.color} onChange={e => up(x => { if (e.target.checked) x.pieces![id].color = '#555555'; else delete x.pieces![id].color; })} /> {t('own colour', '固定颜色', 'sabit renk')}</label>
              {p.color && <input type="color" value={p.color} onChange={e => up(x => { x.pieces![id].color = e.target.value; })} />}
              {idTag(id)}{del('pieces', id)}
            </div>
          ))}
          <button type="button" className="btn sm" id="wk-m-addpiece" onClick={() => addKeyed('pieces', t('Piece', '棋子', 'Taş'), () => ({ name: t('Piece', '棋子', 'Taş'), shape: 'disc' }))}>+ {t('Piece', '棋子', 'Taş')}</button>
        </div>
        <p className="muted small">{t('Pieces take the colour of the player who owns them unless they have their own.', '棋子默认使用所属玩家的颜色，除非设置了固定颜色。', 'Taşlar, sabit renk verilmedikçe sahibi olan oyuncunun rengini alır.')}</p>
      </Sec>

      <Sec title={t('Cards', '纸牌', 'Kartlar')} aside={
        <label className="check"><input type="checkbox" id="wk-m-cards" checked={!!cards} onChange={e => up(x => { if (e.target.checked) x.cards = { fields: { n: [1, 2, 3, 4, 5, 6, 7, 8, 9] }, label: '{n}' }; else delete x.cards; })} /> {t('Use cards', '使用纸牌', 'Kart kullan')}</label>}>
        {cards ? <>
          <div className="wk-items">
            {Object.entries(cards.fields).map(([f, vals]) => (
              <div key={f} className="wk-item">
                <code className="wk-id">{f}</code>
                <input className="wide" defaultValue={vals.join(', ')} key={f + vals.join()} aria-label={t('Values', '取值', 'Değerler')}
                  onBlur={e => up(x => { const v = parseValues(e.target.value); if (v.length) x.cards!.fields[f] = v; })} />
                <span className="muted small">{vals.length}</span>
                {Object.keys(cards.fields).length > 1 && <button type="button" className="btn sm ghost" aria-label={t('Remove', '删除', 'Kaldır')} onClick={() => up(x => { delete x.cards!.fields[f]; if (x.cards!.color?.field === f) delete x.cards!.color; })}>✕</button>}
              </div>
            ))}
            <button type="button" className="btn sm" id="wk-m-addfield" onClick={() => up(x => { const fs = x.cards!.fields; fs[slug(t('field', '字段', 'alan'), fs, 'field')] = ['a', 'b']; })}>+ {t('Field', '字段', 'Alan')}</button>
          </div>
          <p className="muted small">{t('Each field is a list of values, separated by commas; “1-9” means 1 to 9. The deck has one card for every combination.', '每个字段是用逗号分隔的取值；“1-9”表示1到9。牌堆中每种组合一张。', 'Her alan virgülle ayrılmış değerlerdir; “1-9”, 1’den 9’a demektir. Destede her birleşimden bir kart olur.')}</p>
          <div className="wk-row">
            <F label={t('Copies of each', '每种张数', 'Her birinden')}><input type="number" min={1} max={8} value={cards.copies ?? 1} onChange={e => up(x => { const v = Math.max(1, Math.min(8, +e.target.value || 1)); if (v > 1) x.cards!.copies = v; else delete x.cards!.copies; })} /></F>
            <F label={t('Card shows', '牌面显示', 'Kartta yazan')}><input value={cards.label} onChange={e => up(x => { x.cards!.label = e.target.value; })} placeholder="{n}" /></F>
            <F label={t('Colour by', '按此着色', 'Renk alanı')}>
              <select value={cards.color?.field ?? ''} onChange={e => up(x => { const f = e.target.value; if (!f) { delete x.cards!.color; return; } x.cards!.color = { field: f, map: Object.fromEntries(x.cards!.fields[f].map((v, i) => [String(v), PALETTE[i % PALETTE.length]])) }; })}>
                <option value="">{t('none', '无', 'yok')}</option>
                {Object.keys(cards.fields).map(f => <option key={f} value={f}>{f}</option>)}
              </select>
            </F>
          </div>
          {cards.color && (
            <div className="wk-row">
              {cards.fields[cards.color.field]?.map(v => (
                <label key={String(v)} className="wk-swatchpick"><input type="color" value={cards.color!.map[String(v)] ?? '#777777'} onChange={e => up(x => { x.cards!.color!.map[String(v)] = e.target.value; })} /> {String(v)}</label>
              ))}
            </div>
          )}
          <div className="wk-cards">{preview.map(id => <CardFace key={id} def={d} id={id} />)}<span className="muted small">{t(`${cardsOf(d).length} cards`, `共 ${cardsOf(d).length} 张`, `${cardsOf(d).length} kart`)}</span></div>
        </> : <p className="muted small">{t('Cards are made from fields, like colour and number.', '纸牌由字段组合而成，例如颜色和数字。', 'Kartlar renk ve sayı gibi alanlardan üretilir.')}</p>}
      </Sec>

      <Sec title={t('Zones', '区域', 'Alanlar')}>
        <div className="wk-items">
          {Object.entries(d.zones ?? {}).map(([id, z]) => (
            <div key={id} className="wk-item">
              <input value={tt(z.name)} onChange={e => up(x => { x.zones![id].name = setText(x.zones![id].name, lang, e.target.value); })} aria-label={t('Name', '名称', 'Ad')} />
              <select value={z.owner} onChange={e => up(x => { x.zones![id].owner = e.target.value as ZoneDef['owner']; })}>
                <option value="shared">{t('shared', '共用', 'ortak')}</option><option value="each">{t('one per player', '每人一个', 'oyuncu başına')}</option>
              </select>
              <select value={z.show} onChange={e => up(x => { x.zones![id].show = e.target.value as ZoneDef['show']; })}>
                <option value="all">{t('face up', '正面朝上', 'açık')}</option><option value="owner">{t('only its owner sees', '仅主人可见', 'yalnızca sahibi görür')}</option>
                <option value="top">{t('top card shown', '只显示顶牌', 'üstteki görünür')}</option><option value="count">{t('face down', '背面朝上', 'kapalı')}</option>
              </select>
              {idTag(id)}{del('zones', id)}
            </div>
          ))}
          <button type="button" className="btn sm" id="wk-m-addzone" onClick={() => addKeyed('zones', t('Zone', '区域', 'Alan'), () => ({ name: t('Zone', '区域', 'Alan'), owner: 'shared', show: 'all' }))}>+ {t('Zone', '区域', 'Alan')}</button>
        </div>
        <p className="muted small">{t('Zones hold cards: a deck, a discard pile, each player’s hand.', '区域用来放牌：牌堆、弃牌堆、每位玩家的手牌。', 'Alanlar kartları tutar: deste, ıskarta, her oyuncunun eli.')}</p>
      </Sec>

      <Sec title={t('Dice', '骰子', 'Zar')} aside={
        <label className="check"><input type="checkbox" id="wk-m-dice" checked={!!d.dice} onChange={e => up(x => { if (e.target.checked) x.dice = { count: 1, faces: 6 }; else delete x.dice; })} /> {t('Use dice', '使用骰子', 'Zar kullan')}</label>}>
        {d.dice && <div className="wk-row">
          <F label={t('How many', '数量', 'Kaç tane')}><input type="number" min={1} max={6} value={d.dice.count} onChange={e => up(x => { x.dice!.count = Math.max(1, Math.min(6, +e.target.value || 1)); })} /></F>
          <F label={t('Faces', '面数', 'Yüz sayısı')}><input type="number" min={2} max={20} value={d.dice.faces} onChange={e => up(x => { x.dice!.faces = Math.max(2, Math.min(20, +e.target.value || 6)); })} /></F>
        </div>}
      </Sec>

      <Sec title={t('Counters', '计数器', 'Sayaçlar')}>
        <div className="wk-items">
          {Object.entries(d.vars ?? {}).map(([id, v]) => (
            <div key={id} className="wk-item">
              <input value={tt(v.name)} onChange={e => up(x => { x.vars![id].name = setText(x.vars![id].name, lang, e.target.value); })} aria-label={t('Name', '名称', 'Ad')} />
              <select value={v.per} onChange={e => up(x => { x.vars![id].per = e.target.value as 'player' | 'game'; })}>
                <option value="player">{t('each player', '每位玩家', 'her oyuncu')}</option><option value="game">{t('whole game', '整局', 'tüm oyun')}</option>
              </select>
              <F label={t('starts at', '初始值', 'başlangıç')}><input className="short" type="number" value={v.init} onChange={e => up(x => { x.vars![id].init = +e.target.value; })} /></F>
              <label className="check small"><input type="checkbox" checked={!!v.show} onChange={e => up(x => { x.vars![id].show = e.target.checked; })} /> {t('shown', '显示', 'göster')}</label>
              {idTag(id)}{del('vars', id)}
            </div>
          ))}
          <button type="button" className="btn sm" id="wk-m-addvar" onClick={() => addKeyed('vars', t('Score', '分数', 'Puan'), () => ({ name: t('Score', '分数', 'Puan'), per: 'player', init: 0, show: true }))}>+ {t('Counter', '计数器', 'Sayaç')}</button>
        </div>
      </Sec>

      <Sec title={t('Buttons', '按钮', 'Düğmeler')}>
        <div className="wk-items">
          {Object.entries(d.buttons ?? {}).map(([id, bt]) => (
            <div key={id} className="wk-item">
              <input value={tt(bt.name)} onChange={e => up(x => { x.buttons![id].name = setText(x.buttons![id].name, lang, e.target.value); })} aria-label={t('Name', '名称', 'Ad')} />
              {idTag(id)}{del('buttons', id)}
            </div>
          ))}
          <button type="button" className="btn sm" id="wk-m-addbutton" onClick={() => addKeyed('buttons', t('Pass', '过', 'Pas'), () => ({ name: t('Pass', '过', 'Pas') }))}>+ {t('Button', '按钮', 'Düğme')}</button>
        </div>
        <p className="muted small">{t('A button appears while a “When a button is pressed” rule allows it, such as Pass or Stop.', '当“按下按钮时”规则允许时，按钮才会出现，例如“过”或“停”。', 'Bir düğme, “Bir düğmeye basılınca” kuralı izin verdiği sürece görünür; Pas ya da Dur gibi.')}</p>
      </Sec>
    </div>
  );
}
