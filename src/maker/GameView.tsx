import { useState, type ReactNode } from 'react';
import { useLang, useT } from '../core/i18n';
import { canSee, cardsOf, cellPropsOf, cellTypeOf, compile, isHole, legal, txt, zoneOfKey, type GameDef, type GState, type Input, type PieceDef } from './engine';

const DEFAULT_COLORS = ['#c0392b', '#1f4e9c', '#1e7a4a', '#e0a020', '#7b3fa0', '#1a8a8a'];
export const playerColor = (def: GameDef, p: number) => def.players.colors?.[p] ?? DEFAULT_COLORS[p % DEFAULT_COLORS.length];
export function playerName(def: GameDef, p: number, lang: 'en' | 'zh' | 'tr') {
  const n = def.players.names?.[p];
  return n ? txt(n, lang) : lang === 'zh' ? `玩家${p + 1}` : lang === 'tr' ? `Oyuncu ${p + 1}` : `Player ${p + 1}`;
}

/** One card face, coloured and labelled from its fields. */
export function CardFace({ def, id, onClick, active, small }: { def: GameDef; id: number; onClick?: () => void; active?: boolean; small?: boolean }) {
  const c = cardsOf(def)[id], cd = def.cards!;
  const bg = cd.color ? cd.color.map[String(c[cd.color.field])] ?? '#777' : '#f8f3e6';
  const label = cd.label.replace(/\{(\w+)\}/g, (_, f: string) => String(c[f] ?? ''));
  const cls = 'wk-card' + (small ? ' sm' : '') + (active ? ' act' : '') + (cd.color ? ' tinted' : '');
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

export function GameView({ def, st, viewer, canAct, onInput }: { def: GameDef; st: GState; viewer: number | 'all'; canAct: boolean; onInput: (i: Input) => void }) {
  const lang = useLang(), t = useT();
  const [sel, setSel] = useState<number | null>(null);
  const moves = canAct ? legal(def, st) : [];
  const clicks = new Set(moves.flatMap(m => (m.k === 'click' ? [m.cell] : [])));
  const froms = new Set(moves.flatMap(m => (m.k === 'move' ? [m.from] : [])));
  const targets = new Set(moves.flatMap(m => (m.k === 'move' && m.from === sel ? [m.to] : [])));
  const send = (i: Input) => { setSel(null); onInput(i); };

  const tapCell = (i: number) => {
    if (sel !== null && targets.has(i)) return send({ k: 'move', from: sel, to: i });
    if (clicks.has(i)) return send({ k: 'click', cell: i });
    if (froms.has(i)) return setSel(sel === i ? null : i);
    setSel(null);
  };

  let board: ReactNode = null;
  const b = def.board;
  if (b) {
    const c = compile(def), last = new Set(st.last);
    const cells: ReactNode[] = [], pieces: ReactNode[] = [], marks: ReactNode[] = [], links: ReactNode[] = [];
    for (let i = 0; i < c.cells; i++) {
      if (isHole(def, i)) continue;
      const x = i % b.w, y = Math.floor(i / b.w), ty = cellTypeOf(def, i), tdef = ty ? b.types?.[ty] : undefined;
      const fill = tdef?.color ?? (b.checker && (x + y) % 2 ? 'var(--wk-dark)' : 'var(--wk-light)');
      cells.push(<rect key={i} x={x + 0.02} y={y + 0.02} width={0.96} height={0.96} rx={0.06} fill={fill} className={'wk-cell' + (last.has(i) ? ' last' : '')} />);
      if (tdef?.label) marks.push(<text key={'l' + i} x={x + 0.5} y={y + 0.62} className="wk-clabel" textAnchor="middle">{tdef.label}</text>);
      if (b.showPath && c.pathPos[i] >= 0) marks.push(<text key={'n' + i} x={x + 0.08} y={y + 0.24} className="wk-num">{c.pathPos[i] + 1}</text>);
      const to = cellPropsOf(def, i).to;
      if (b.links && to !== undefined && to >= 0 && to < c.cells) {
        const up = c.pathPos[to] > c.pathPos[i];
        links.push(<line key={'k' + i} x1={x + 0.5} y1={y + 0.5} x2={(to % b.w) + 0.5} y2={Math.floor(to / b.w) + 0.5} className={'wk-link ' + (up ? 'up' : 'down')} markerEnd={`url(#wk-arrow-${up ? 'up' : 'down'})`} />);
      }
      const stack = st.board[i];
      stack.slice(-4).forEach((p, k, arr) => {
        const pd = def.pieces?.[p.t];
        if (!pd) return;
        const n = arr.length, off = n === 1 ? [0, 0] : [[-0.2, -0.2], [0.2, -0.2], [-0.2, 0.2], [0.2, 0.2]][k];
        pieces.push(<PieceShape key={`p${i}-${k}`} p={pd} x={x + 0.5 + off[0]} y={y + 0.5 + off[1]} r={n === 1 ? 0.36 : 0.2} color={playerColor(def, p.o)} />);
      });
      if (stack.length > 4) marks.push(<text key={'h' + i} x={x + 0.92} y={y + 0.95} className="wk-num" textAnchor="end">{stack.length}</text>);
      if (clicks.has(i) && !stack.length) marks.push(<circle key={'d' + i} cx={x + 0.5} cy={y + 0.5} r={0.1} className="wk-hint" />);
      if (froms.has(i) && sel === null) marks.push(<rect key={'f' + i} x={x + 0.06} y={y + 0.06} width={0.88} height={0.88} rx={0.08} className="wk-from" />);
      if (sel === i) marks.push(<rect key={'s' + i} x={x + 0.04} y={y + 0.04} width={0.92} height={0.92} rx={0.08} className="wk-sel" />);
      if (targets.has(i)) marks.push(<circle key={'t' + i} cx={x + 0.5} cy={y + 0.5} r={0.18} className="wk-target" />);
    }
    const hits = Array.from({ length: c.cells }, (_, i) => isHole(def, i) ? null
      : <rect key={'hit' + i} x={i % b.w} y={Math.floor(i / b.w)} width={1} height={1} fill="transparent" className={clicks.has(i) || froms.has(i) || targets.has(i) ? 'pt' : ''} onClick={() => tapCell(i)} />);
    board = (
      <svg className="wk-board" viewBox={`-0.1 -0.1 ${b.w + 0.2} ${b.h + 0.2}`} style={{ maxWidth: Math.min(640, b.w * 72) }} role="application" aria-label={t('Game board', '棋盘', 'Oyun tahtası')}>
        <defs>
          {['up', 'down'].map(k => <marker key={k} id={'wk-arrow-' + k} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="4" markerHeight="4" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" className={'wk-arrowhead ' + k} /></marker>)}
        </defs>
        {cells}{links}{marks}{pieces}{hits}
      </svg>
    );
  }

  const zoneKeys = Object.keys(st.zones).sort((a, b2) => zoneOfKey(a)[1] - zoneOfKey(b2)[1]);
  const zoneButtons = new Set(moves.flatMap(m => (m.k === 'zone' ? [m.zone] : [])));
  const cardMoves = new Map(moves.flatMap(m => (m.k === 'card' ? [[m.card, m] as const] : [])));
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
              {vis === 'all' && cards.map(id => <CardFace key={id} def={def} id={id} active={cardMoves.has(id)} onClick={cardMoves.has(id) ? () => send(cardMoves.get(id)!) : undefined} />)}
              {vis === 'top' && cards.length > 0 && <CardFace def={def} id={cards[cards.length - 1]} active={cardMoves.has(cards[cards.length - 1])} onClick={cardMoves.has(cards[cards.length - 1]) ? () => send(cardMoves.get(cards[cards.length - 1])!) : undefined} />}
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
