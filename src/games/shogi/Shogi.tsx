import './shogi.css';
import { useMemo, useState } from 'react';
import { useT } from '../../core/i18n';
import { MatchPanel, useMatch } from '../../ui/useMatch';
import { Puzzle } from '../boards/Puzzle';
import { chooseMove, dec, fromSfen, HAND, isSente, legal, LEVELS, newGame, play, replay, type SState } from './rules';

const KANJI: Record<string, string> = { R: '飛', B: '角', G: '金', S: '銀', N: '桂', L: '香', P: '歩', '+R': '龍', '+B': '馬', '+S': '全', '+N': '圭', '+L': '杏', '+P': 'と' };
const glyph = (p: string) => { const u = p.replace('+', '').toUpperCase(), pro = p.startsWith('+'); if (u === 'K') return isSente(p) ? '王' : '玉'; return KANJI[(pro ? '+' : '') + u]; };

function Piece({ x, y, p, flipDown, cls = '' }: { x: number; y: number; p: string; flipDown: boolean; cls?: string }) {
  return (
    <g transform={`translate(${x + 0.5} ${y + 0.5}) rotate(${flipDown ? 180 : 0})`} className={'sg-pc' + (p.startsWith('+') ? ' pro' : '') + cls}>
      <path d="M0 -0.42 L0.3 -0.3 L0.36 0.42 L-0.36 0.42 L-0.3 -0.3 Z" />
      <text y={0.17}>{glyph(p)}</text>
    </g>
  );
}

export function ShogiBoard({ st, flipped, enabled, onMove, hint }: { st: SState; flipped: boolean; enabled: boolean; onMove: (m: number) => void; hint?: number | null }) {
  const t = useT();
  const [sel, setSel] = useState(-1), [ask, setAsk] = useState<number[] | null>(null);
  const ms = useMemo(() => (enabled ? legal(st) : []), [st, enabled]);
  const targets = new Map<number, number[]>(); for (const m of ms) { const d = dec(m); if (d.from === sel) targets.set(d.to, [...(targets.get(d.to) ?? []), m]); }
  const last = st.moves.length ? dec(st.moves[st.moves.length - 1]) : null;
  const xy = (i: number) => { const r = Math.floor(i / 9), c = i % 9; return flipped ? [8 - c, 8 - r] : [c, r]; };
  const click = (i: number) => {
    if (!enabled) return;
    const tg = targets.get(i);
    if (tg) { if (tg.length > 1) setAsk(tg); else { onMove(tg[0]); setSel(-1); } return; }
    if (st.board[i] && isSente(st.board[i]) === (st.turn === 1) && ms.some(m => dec(m).from === i)) setSel(i === sel ? -1 : i); else setSel(-1);
  };
  const hand = (side: 0 | 1) => {
    const mine = (side === 0) === (st.turn === 1);
    return (
      <div className={'sg-hand' + (side === 1 ? ' gote' : '')} aria-label={side === 0 ? t('Sente’s hand', '先手持驹', 'Sente’nin eli') : t('Gote’s hand', '后手持驹', 'Gote’nin eli')}>
        {HAND.map((h, k) => st.hands[side][k] ? (
          <button key={h} type="button" id={`sg-hand-${side}-${h}`} className={'sg-hp' + (sel === 81 + k && mine ? ' sel' : '')} disabled={!enabled || !mine}
            onClick={() => setSel(sel === 81 + k ? -1 : 81 + k)}>
            <svg viewBox="0 0 1 1" width="34" height="34"><Piece x={0} y={0} p={side === 0 ? h : h.toLowerCase()} flipDown={false} /></svg>
            {st.hands[side][k] > 1 && <span className="num">×{st.hands[side][k]}</span>}
          </button>
        ) : null)}
      </div>
    );
  };
  const kingSq = st.check ? st.board.indexOf(st.turn === 1 ? 'K' : 'k') : -1;
  return (
    <div className="sg-wrap">
      {hand(flipped ? 0 : 1)}
      <svg className="sg-board" viewBox="-0.15 -0.15 9.3 9.3" role="grid" aria-label={t('Shogi board', '将棋棋盘', 'Shogi tahtası')}>
        <rect x={-0.15} y={-0.15} width={9.3} height={9.3} className="sg-wood" />
        {Array.from({ length: 81 }, (_, i) => { const [x, y] = xy(i); const h = hint != null && (dec(hint).to === i || dec(hint).from === i); return <rect key={i} x={x} y={y} width={1} height={1} className={'sg-sq' + (last && (last.to === i || last.from === i) ? ' last' : '') + (i === sel ? ' sel' : '') + (i === kingSq ? ' chk' : '') + (h ? ' hint' : '')} />; })}
        {[[3, 3], [6, 3], [3, 6], [6, 6]].map(([x, y]) => <circle key={x + '-' + y} cx={x} cy={y} r={0.06} className="sg-star" />)}
        {st.board.map((p, i) => { if (!p) return null; const [x, y] = xy(i); return <Piece key={i + p} x={x} y={y} p={p} flipDown={isSente(p) === flipped} />; })}
        {[...targets.keys()].map(i => { const [x, y] = xy(i); return <circle key={'t' + i} cx={x + 0.5} cy={y + 0.5} r={st.board[i] ? 0.44 : 0.13} className={st.board[i] ? 'sg-cap' : 'sg-dot'} />; })}
        {Array.from({ length: 81 }, (_, i) => { const [x, y] = xy(i); return <rect key={'h' + i} x={x} y={y} width={1} height={1} fill="transparent" onClick={() => click(i)} className={enabled ? 'pt' : ''} role="gridcell" aria-label={`${9 - (i % 9)}${'一二三四五六七八九'[Math.floor(i / 9)]}`} />; })}
      </svg>
      {hand(flipped ? 1 : 0)}
      {ask && (
        <div className="ch-promo" role="dialog" aria-label={t('Promote?', '升变？', 'Terfi?')}>
          <span>{t('Promote?', '要升变吗？', 'Terfi edilsin mi?')}</span>
          <button type="button" id="sg-pro-yes" className="btn primary" onClick={() => { onMove(ask.find(m => dec(m).pro)!); setAsk(null); setSel(-1); }}>{t('Promote', '升变', 'Terfi')}</button>
          <button type="button" id="sg-pro-no" className="btn" onClick={() => { onMove(ask.find(m => !dec(m).pro)!); setAsk(null); setSel(-1); }}>{t('Keep', '不升', 'Kalsın')}</button>
        </div>
      )}
    </div>
  );
}

function ShogiPuzzle() {
  const t = useT();
  return <Puzzle game="shogi" title={t('Shogi', '将棋', 'Shogi')} start={p => fromSfen(p.pos)} play={play}
    board={(st, onMove, o) => <ShogiBoard st={st} flipped={o.p.pos.split(' ')[1] === 'w'} enabled={o.enabled} onMove={onMove} hint={o.hint} />}
    check={(before, after) => (after.winner === before.turn ? 'solved' : 'wrong')}
    sideName={p => (p.pos.split(' ')[1] === 'b' ? t('Sente to move', '先手走', 'Sente oynar') : t('Gote to move', '后手走', 'Gote oynar'))}
    describe={() => t('Tsume: mate in one', '诘将棋：一手杀', 'Tsume: bir hamlede mat')} />;
}
export default function Shogi({ daily = false }: { daily?: boolean }) { return daily ? <ShogiPuzzle /> : <ShogiGame />; }
function ShogiGame() {
  const t = useT();
  const m = useMatch<SState>({ game: 'shogi', key: 'gp.shogi', levels: LEVELS, defaults: { opponent: 'ai', level: 2, human: 1, p2: 'guest' },
    newGame, replay: ms => replay(ms), play, choose: (s, lv) => chooseMove(s, lv), legal, aiDelay: 250 });
  const { st } = m;
  const side = (c: number) => (c === 1 ? t('Sente', '先手', 'Sente') : t('Gote', '后手', 'Gote'));
  const reason = { mate: t('checkmate', '将死', 'mat'), repetition: t('fourfold repetition (sennichite)', '千日手', 'dört kez tekrar (sennichite)'), long: t('move limit', '步数上限', 'hamle sınırı'), '': '' }[st.reason];
  const status = st.winner ? t(`${m.nameOf(st.winner)} wins by ${reason}.`, `${m.nameOf(st.winner)}${reason}获胜。`, `${m.nameOf(st.winner)} kazandı: ${reason}.`)
    : st.draw ? t(`Draw: ${reason}.`, `和棋：${reason}。`, `Berabere: ${reason}.`)
    : (m.thinking ? t(`${m.nameOf(st.turn)} is thinking…`, `${m.nameOf(st.turn)}思考中…`, `${m.nameOf(st.turn)} düşünüyor…`) : t(`${m.nameOf(st.turn)} to move (${side(st.turn)})`, `轮到${m.nameOf(st.turn)}（${side(st.turn)}）`, `Sıra ${m.nameOf(st.turn)} oyuncusunda (${side(st.turn)})`)) + (st.check ? t(' — check!', ' — 王手！', ' — şah!') : '');
  return (
    <div className="play">
      <div className="play-main">
        <div className="statline"><span role="status" aria-live="polite">{status}</span></div>
        <ShogiBoard st={st} flipped={m.cfg.opponent === 'ai' && m.cfg.human === 2} enabled={!m.over && !m.aiTurn} onMove={m.apply} />
        <p className="muted small">{t('Tap a piece, then a highlighted square. Captured pieces join your hand: tap one below the board to drop it.', '点棋子，再点高亮格。吃掉的棋子进入持驹：点棋盘下方的持驹即可打入。', 'Bir taşa, sonra parlayan kareye dokun. Aldığın taşlar eline geçer: tahtanın altındakilerden birine dokunup istediğin yere koy.')}</p>
      </div>
      <aside className="play-side"><MatchPanel id="sg" m={m} sides={[t('Sente (first)', '先手', 'Sente (ilk)'), t('Gote', '后手', 'Gote')]} /></aside>
    </div>
  );
}
