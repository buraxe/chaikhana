import { useState, type ReactNode } from 'react';
import { useLang, useT } from '../core/i18n';
import { WordBoard } from './WordBoard';
import { canSee, cardsOf, cellPropsOf, cellTypeOf, compile, isHole, legal, txt, zoneOfKey, type GameDef, type GState, type Input, type PieceDef } from './engine';

const DEFAULT_COLORS = ['#c0392b', '#1f4e9c', '#1e7a4a', '#e0a020', '#7b3fa0', '#1a8a8a'];
export const playerColor = (def: GameDef, p: number) => def.players.colors?.[p] ?? DEFAULT_COLORS[p % DEFAULT_COLORS.length];
export function playerName(def: GameDef, p: number, lang: 'en' | 'zh' | 'tr') {
  const n = def.players.names?.[p];
  return n ? txt(n, lang) : lang === 'zh' ? `玩家${p + 1}` : lang === 'tr' ? `Oyuncu ${p + 1}` : `Player ${p + 1}`;
}

/** One card face, coloured and labelled from its fields. */
export function CardFace({ def, id, onClick, active, small, picked }: { def: GameDef; id: number; onClick?: () => void; active?: boolean; small?: boolean; picked?: boolean }) {
  const c = cardsOf(def)[id], cd = def.cards!;
  const bg = cd.color ? cd.color.map[String(c[cd.color.field])] ?? '#777' : '#f8f3e6';
  const label = cd.label.replace(/\{(\w+)\}/g, (_, f: string) => String(c[f] ?? ''));
  const cls = 'wk-card' + (small ? ' sm' : '') + (active ? ' act' : '') + (picked ? ' picked' : '') + (cd.color ? ' tinted' : '');
  const title = Object.entries(c).map(([k, v]) => `${k}: ${v}`).join(', ');
  return onClick
    ? <button type="button" className={cls} style={{ background: bg }} onClick={onClick} disabled={!active} title={title} aria-label={title}><span>{label}</span></button>
    : <span className={cls} style={{ background: bg }} title={title}><span>{label}</span></span>;
}

function PieceShape({ p, x, y, r, color }: { p: PieceDef; x: number; y: number; r: number; color: string }) {
  const fill = p.color ?? color;
  switch (p.shape) {
    case 'square': return <rect x={x - r} y={y - r} width={r * 2} height={r * 2} rx={r * 0.2} fill={fill} className="wk-pc" />;
    case 'ring': return <circle cx={x} cy={y} r={r * 0.8} fill="none" stroke={fill} strokeWidth={r * 0.35} />;
    case 'pawn': return <g className="wk-pc" fill={fill}><circle cx={x} cy={y - r * 0.45} r={r * 0.42} /><path d={`M${x - r * 0.62} ${y + r * 0.85}L${x - r * 0.3} ${y - r * 0.1}H${x + r * 0.3}L${x + r * 0.62} ${y + r * 0.85}Z`} /></g>;
    case 'star': {
      const pts = Array.from({ length: 10 }, (_, i) => { const a = -Math.PI / 2 + (i * Math.PI) / 5, rr = i % 2 ? r * 0.45 : r; return `${x + rr * Math.cos(a)},${y + rr * Math.sin(a)}`; }).join(' ');
      return <polygon points={pts} fill={fill} className="wk-pc" />;
    }
    case 'text': return <text x={x} y={y + r * 0.4} fontSize={r * 1.4} textAnchor="middle" fill={fill} className="wk-pt">{p.label ?? '?'}</text>;
    default: return <g><circle cx={x} cy={y} r={r} fill={fill} className="wk-pc" /><circle cx={x} cy={y} r={r * 0.62} fill="none" stroke="rgba(255,255,255,.35)" strokeWidth={r * 0.1} /></g>;
  }
}

export function GameView({ def, st, viewer, canAct, onInput, onExplain, hint }: { def: GameDef; st: GState; viewer: number | 'all'; canAct: boolean; onInput: (i: Input) => void; onExplain?: (i: Input) => void; hint?: Input | null }) {
  const lang = useLang(), t = useT();
  const [sel, setSel] = useState<number | null>(null);
  /** A card waiting for its cell, in games where cards are played onto the board. */
  const [selCard, setSelCard] = useState<number | null>(null);
  const moves = canAct ? legal(def, st) : [];
  const clicks = new Set(moves.flatMap(m => (m.k === 'click' ? [m.cell] : [])));
  const froms = new Set(moves.flatMap(m => (m.k === 'move' ? [m.from] : [])));
  const cardMoves = new Map(moves.flatMap(m => (m.k === 'card' && m.cell === undefined ? [[m.card, m] as const] : [])));
  const aimed = new Map<number, Map<number, Input>>();
  for (const m of moves) if (m.k === 'card' && m.cell !== undefined) { if (!aimed.has(m.card)) aimed.set(m.card, new Map()); aimed.get(m.card)!.set(m.cell, m); }
  const targets = new Set(selCard !== null ? [...(aimed.get(selCard)?.keys() ?? [])] : moves.flatMap(m => (m.k === 'move' && m.from === sel ? [m.to] : [])));
  const send = (i: Input) => { setSel(null); setSelCard(null); onInput(i); };
  const tapCard = (id: number) => {
    if (aimed.has(id)) { setSel(null); setSelCard(selCard === id ? null : id); return; }
    const m = cardMoves.get(id);
    if (m) send(m);
  };

  const tapCell = (i: number) => {
    if (selCard !== null) { const m = aimed.get(selCard)?.get(i); if (m) send(m); else setSelCard(null); return; }
    if (sel !== null && targets.has(i)) return send({ k: 'move', from: sel, to: i });
    if (clicks.has(i)) return send({ k: 'click', cell: i });
    if (froms.has(i)) return setSel(sel === i ? null : i);
    if (canAct && onExplain) onExplain(sel !== null ? { k: 'move', from: sel, to: i } : { k: 'click', cell: i });
    setSel(null);
  };

  let board: ReactNode = null;
  const b = def.board;
  if (b) {
    const c = compile(def), last = new Set(st.last), hex = b.grid === 'hex';
    // Geometry: square cells are 1×1; hexagons are pointy-topped, each row shifted half a cell.
    const HR = 1 / Math.sqrt(3), RowH = hex ? 0.866 : 1;
    const cen = (i: number): [number, number] => {
      const x = i % b.w, y = Math.floor(i / b.w);
      return hex ? [x + y * 0.5 + 0.5, y * RowH + HR] : [x + 0.5, y + 0.5];
    };
    const hexPts = (cx: number, cy: number, r: number) => Array.from({ length: 6 }, (_, k) => { const a = (Math.PI / 3) * k - Math.PI / 2; return `${cx + r * Math.cos(a)},${cy + r * Math.sin(a)}`; }).join(' ');
    const shape = (i: number, inset: number, props: Record<string, unknown>, key: string) => {
      const [cx, cy] = cen(i);
      return hex ? <polygon key={key} points={hexPts(cx, cy, HR - inset)} {...props} /> : <rect key={key} x={cx - 0.5 + inset} y={cy - 0.5 + inset} width={1 - 2 * inset} height={1 - 2 * inset} rx={0.06} {...props} />;
    };
    const W = hex ? b.w + (b.h - 1) * 0.5 : b.w, H = hex ? (b.h - 1) * RowH + 2 * HR : b.h;
    const cells: ReactNode[] = [], pieces: ReactNode[] = [], marks: ReactNode[] = [], links: ReactNode[] = [], hits: ReactNode[] = [];
    for (let i = 0; i < c.cells; i++) {
      if (isHole(def, i)) continue;
      const [cx, cy] = cen(i), x = i % b.w, y = Math.floor(i / b.w), ty = cellTypeOf(def, i), tdef = ty ? b.types?.[ty] : undefined;
      const fill = tdef?.color ?? (b.checker && (x + y) % 2 ? 'var(--wk-dark)' : 'var(--wk-light)');
      cells.push(shape(i, 0.02, { fill, className: 'wk-cell' + (last.has(i) ? ' last' : '') }, 'c' + i));
      if (tdef?.label) marks.push(<text key={'l' + i} x={cx} y={cy + 0.12} className="wk-clabel" textAnchor="middle">{tdef.label}</text>);
      if (b.showPath && c.pathPos[i] >= 0) marks.push(<text key={'n' + i} x={cx - 0.42} y={cy - 0.26} className="wk-num">{c.pathPos[i] + 1}</text>);
      const to = cellPropsOf(def, i).to;
      if (b.links && to !== undefined && to >= 0 && to < c.cells) {
        const up = c.pathPos[to] > c.pathPos[i], [tx, tyy] = cen(to);
        links.push(<line key={'k' + i} x1={cx} y1={cy} x2={tx} y2={tyy} className={'wk-link ' + (up ? 'up' : 'down')} markerEnd={`url(#wk-arrow-${up ? 'up' : 'down'})`} />);
      }
      const stack = st.board[i];
      stack.slice(-4).forEach((p, k, arr) => {
        const pd = def.pieces?.[p.t];
        if (!pd) return;
        const n = arr.length, off = n === 1 ? [0, 0] : [[-0.2, -0.2], [0.2, -0.2], [-0.2, 0.2], [0.2, 0.2]][k], r = n === 1 ? (hex ? 0.36 : 0.38) : 0.2;
        pieces.push(<PieceShape key={`p${i}-${k}`} p={pd} x={cx + off[0]} y={cy + off[1]} r={r} color={playerColor(def, p.o)} />);
        if (p.v !== undefined) pieces.push(<text key={`v${i}-${k}`} x={cx + off[0]} y={cy + off[1] + r * 0.38} fontSize={r * 1.1} textAnchor="middle" className="wk-val">{p.v}</text>);
      });
      if (stack.length > 4) marks.push(<text key={'h' + i} x={cx + 0.42} y={cy + 0.45} className="wk-num" textAnchor="end">{stack.length}</text>);
      if (clicks.has(i) && !stack.length) marks.push(<circle key={'d' + i} cx={cx} cy={cy} r={0.1} className="wk-hint" />);
      if (froms.has(i) && sel === null && selCard === null) marks.push(shape(i, 0.06, { className: 'wk-from' }, 'f' + i));
      if (sel === i) marks.push(shape(i, 0.04, { className: 'wk-sel' }, 's' + i));
      if (targets.has(i)) marks.push(<circle key={'t' + i} cx={cx} cy={cy} r={0.18} className="wk-target" />);
      if (hint && ((hint.k === 'click' && hint.cell === i) || (hint.k === 'move' && (hint.from === i || hint.to === i)) || (hint.k === 'card' && hint.cell === i))) marks.push(<circle key={'hint' + i} cx={cx} cy={cy} r={0.42} className="wk-hintring" />);
      hits.push(shape(i, 0, { fill: 'transparent', className: clicks.has(i) || froms.has(i) || targets.has(i) ? 'pt wk-hit' : 'wk-hit', onClick: () => tapCell(i), 'data-cell': i }, 'hit' + i));
    }
    board = (
      <svg className="wk-board" viewBox={`-0.1 -0.1 ${W + 0.2} ${H + 0.2}`} style={{ maxWidth: Math.min(640, W * 72) }} role="application" aria-label={t('Game board', '棋盘', 'Oyun tahtası')}>
        <defs>
          {['up', 'down'].map(k => <marker key={k} id={'wk-arrow-' + k} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="4" markerHeight="4" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" className={'wk-arrowhead ' + k} /></marker>)}
        </defs>
        {cells}{links}{marks}{pieces}{hits}
      </svg>
    );
  }

  const zoneKeys = Object.keys(st.zones).sort((a, b2) => zoneOfKey(a)[1] - zoneOfKey(b2)[1]);
  const zoneButtons = new Set(moves.flatMap(m => (m.k === 'zone' ? [m.zone] : [])));
  const playable = (id: number) => cardMoves.has(id) || aimed.has(id);
  const zones = zoneKeys.length > 0 && (
    <div className="wk-zones">
      {zoneKeys.map(key => {
        const [z, owner] = zoneOfKey(key), zd = def.zones?.[z], cards = st.zones[key], vis = canSee(def, key, viewer);
        if (!zd) return null;
        const head = txt(zd.name, lang) + (owner >= 0 ? ' · ' + playerName(def, owner, lang) : '');
        const clickable = zoneButtons.has(key);
        return (
          <div key={key} className={'wk-zone' + (owner >= 0 && owner === st.turn ? ' turn' : '')} style={owner >= 0 ? { borderColor: playerColor(def, owner) } : undefined}>
            <div className="wk-zhead"><b>{head}</b><span className="muted">{cards.length}</span>
              {clickable && <button type="button" className="btn sm primary" id={'wk-zone-' + z} onClick={() => send({ k: 'zone', zone: key })}>{txt(zd.name, lang)} ✋</button>}</div>
            <div className="wk-cards">
              {vis === 'all' && cards.map(id => <CardFace key={id} def={def} id={id} active={playable(id)} picked={selCard === id} onClick={playable(id) ? () => tapCard(id) : undefined} />)}
              {vis === 'top' && cards.length > 0 && <CardFace def={def} id={cards[cards.length - 1]} active={playable(cards[cards.length - 1])} picked={selCard === cards[cards.length - 1]} onClick={playable(cards[cards.length - 1]) ? () => tapCard(cards[cards.length - 1]) : undefined} />}
              {vis === 'none' && cards.length > 0 && <span className="wk-card back" aria-label={`${cards.length}`}><span>×{cards.length}</span></span>}
              {!cards.length && <span className="muted small">{t('empty', '空', 'boş')}</span>}
            </div>
          </div>
        );
      })}
    </div>
  );

  const canRoll = moves.some(m => m.k === 'roll');
  const buttons = Object.entries(def.buttons ?? {}).filter(([id]) => moves.some(m => m.k === 'button' && m.id === id));
  return (
    <div className="wk-view">
      {def.words && <WordBoard def={def} st={st} canAct={canAct} onInput={onInput} onExplain={onExplain} />}
      {selCard !== null && <p className="wk-aim" role="status">{t('Now choose a cell for the card.', '现在为这张牌选一个格子。', 'Şimdi kart için bir kare seç.')}</p>}
      {board}
      {(def.dice || buttons.length > 0) && (
        <div className="tools wk-dice">
          {def.dice && st.dice.map((d, i) => <span key={i} className="wk-die">{d}</span>)}
          {canRoll && <button type="button" className="btn primary" id="wk-roll" onClick={() => send({ k: 'roll' })}>🎲 {t('Roll', '掷骰', 'Zar at')}</button>}
          {buttons.map(([id, bd]) => <button key={id} type="button" className="btn" id={'wk-btn-' + id} onClick={() => send({ k: 'button', id })}>{txt(bd.name, lang)}</button>)}
        </div>
      )}
      {zones}
    </div>
  );
}
