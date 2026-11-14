import './chess.css';
import { useMemo, useState } from 'react';
import { useT } from '../../core/i18n';
import { MatchPanel, useMatch } from '../../ui/useMatch';
import { Puzzle } from '../boards/Puzzle';
import { chooseMove, fromFen, isWhite, legal, LEVELS, mateIn, newGame, play, replay, san, type CState } from './rules';

const GLYPH: Record<string, string> = { K: '♚', Q: '♛', R: '♜', B: '♝', N: '♞', P: '♟' };
const fromOf = (m: number) => Math.floor((m % 4096) / 64), toOf = (m: number) => m % 64;

export function ChessBoard({ st, flipped, enabled, onMove, hint }: { st: CState; flipped: boolean; enabled: boolean; onMove: (m: number) => void; hint?: number | null }) {
  const t = useT();
  const [sel, setSel] = useState(-1), [promo, setPromo] = useState<number[] | null>(null);
  const ms = useMemo(() => (enabled ? legal(st) : []), [st, enabled]);
  const targets = new Map<number, number[]>(); for (const m of ms) if (fromOf(m) === sel) targets.set(toOf(m), [...(targets.get(toOf(m)) ?? []), m]);
  const last = st.moves[st.moves.length - 1];
  const kingInCheck = st.check ? st.board.indexOf(st.turn === 1 ? 'K' : 'k') : -1;
  const click = (i: number) => {
    if (!enabled) return;
    const tg = targets.get(i);
    if (tg) { if (tg.length > 1) setPromo(tg); else { onMove(tg[0]); setSel(-1); } return; }
    if (st.board[i] && isWhite(st.board[i]) === (st.turn === 1) && ms.some(m => fromOf(m) === i)) setSel(i === sel ? -1 : i); else setSel(-1);
  };
  const xy = (i: number) => { const r = Math.floor(i / 8), c = i % 8; return flipped ? [7 - c, 7 - r] : [c, r]; };
  return (
    <div className="ch-wrap">
      <svg className="ch-board" viewBox="-0.4 -0.1 8.5 8.5" role="grid" aria-label={t('Chess board', '国际象棋棋盘', 'Satranç tahtası')}>
        {Array.from({ length: 64 }, (_, i) => {
          const [x, y] = xy(i), dark = (Math.floor(i / 8) + i % 8) % 2 === 1;
          const cls = 'ch-sq' + (dark ? ' d' : ' l') + (last !== undefined && (fromOf(last) === i || toOf(last) === i) ? ' last' : '') + (i === sel ? ' sel' : '') + (i === kingInCheck ? ' chk' : '') + (hint != null && (fromOf(hint) === i || toOf(hint) === i) ? ' hint' : '');
          return <rect key={i} x={x} y={y} width={1} height={1} className={cls} />;
        })}
        {Array.from({ length: 8 }, (_, k) => <g key={k} className="ch-coord"><text x={-0.2} y={k + 0.6}>{flipped ? k + 1 : 8 - k}</text><text x={k + 0.5} y={8.35}>{'abcdefgh'[flipped ? 7 - k : k]}</text></g>)}
        {st.board.map((p, i) => { if (!p) return null; const [x, y] = xy(i); return <text key={i + p} x={x + 0.5} y={y + 0.8} className={'ch-pc ' + (isWhite(p) ? 'w' : 'b')}>{GLYPH[p.toUpperCase()]}{'︎'}</text>; })}
        {[...targets.keys()].map(i => { const [x, y] = xy(i); return <circle key={'t' + i} cx={x + 0.5} cy={y + 0.5} r={st.board[i] ? 0.45 : 0.15} className={st.board[i] ? 'ch-cap' : 'ch-dot'} />; })}
        {Array.from({ length: 64 }, (_, i) => { const [x, y] = xy(i); return <rect key={'h' + i} x={x} y={y} width={1} height={1} fill="transparent" role="gridcell" aria-label={'abcdefgh'[i % 8] + (8 - Math.floor(i / 8))} onClick={() => click(i)} className={enabled ? 'pt' : ''} />; })}
      </svg>
      {promo && (
        <div className="ch-promo" role="dialog" aria-label={t('Promote to', '升变为', 'Terfi')}>
          {promo.map(m => { const k = Math.floor(m / 4096); const g = 'QRBN'[k - 1]; return <button key={m} type="button" className="btn" id={'ch-pr-' + g} onClick={() => { onMove(m); setPromo(null); setSel(-1); }}><span className={'ch-pg ' + (st.turn === 1 ? 'w' : 'b')}>{GLYPH[g]}{'︎'}</span></button>; })}
          <button type="button" className="btn sm" onClick={() => setPromo(null)}>×</button>
        </div>
      )}
    </div>
  );
}

function ChessPuzzle() {
  const t = useT();
  return <Puzzle game="chess" title={t('Chess', '国际象棋', 'Satranç')} start={p => fromFen(p.pos)} play={play}
    board={(st, onMove, o) => <ChessBoard st={st} flipped={o.p.pos.split(' ')[1] === 'b'} enabled={o.enabled} onMove={onMove} hint={o.hint} />}
    check={(before, after, m, p, step) => (after.winner === before.turn ? 'solved' : p.kind === 'm2' && step === 0 && mateIn(before, 2).includes(m) ? 'continue' : 'wrong')}
    reply={st => chooseMove(st, 1)}
    sideName={p => (p.pos.split(' ')[1] === 'w' ? t('White to move', '白方走', 'Beyaz oynar') : t('Black to move', '黑方走', 'Siyah oynar'))}
    describe={p => (p.kind === 'm1' ? t('Mate in one', '一步杀', 'Bir hamlede mat') : t('Mate in two', '两步杀', 'İki hamlede mat'))} />;
}
export default function Chess({ daily = false }: { daily?: boolean }) {
  return daily ? <ChessPuzzle /> : <ChessGame />;
}

function ChessGame() {
  const t = useT();
  const m = useMatch<CState>({ game: 'chess', key: 'gp.chess', levels: LEVELS, defaults: { opponent: 'ai', level: 2, human: 1, p2: 'guest' },
    newGame, replay: ms => replay(ms), play, choose: (s, lv) => chooseMove(s, lv), legal, aiDelay: 250 });
  const { st } = m;
  const flipped = m.cfg.opponent === 'ai' && m.cfg.human === 2;
  const sanList = useMemo(() => { const out: string[] = []; let s = newGame(); for (const mv of st.moves) { out.push(san(s, mv)); s = play(s, mv); } return out; }, [st.moves]);
  const side = (c: number) => (c === 1 ? t('White', '白方', 'Beyaz') : t('Black', '黑方', 'Siyah'));
  const reason = { mate: t('checkmate', '将死', 'şah mat'), stalemate: t('stalemate', '逼和', 'pat'), fifty: t('fifty-move rule', '五十步规则', '50 hamle kuralı'), repetition: t('threefold repetition', '三次重复', 'üç kez tekrar'), material: t('insufficient material', '子力不足', 'yetersiz taş'), '': '' }[st.reason];
  const status = st.winner ? t(`${m.nameOf(st.winner)} wins by ${reason}.`, `${m.nameOf(st.winner)}${reason}获胜。`, `${m.nameOf(st.winner)} kazandı: ${reason}.`)
    : st.draw ? t(`Draw by ${reason}.`, `和棋：${reason}。`, `Berabere: ${reason}.`)
    : (m.thinking ? t(`${m.nameOf(st.turn)} is thinking…`, `${m.nameOf(st.turn)}思考中…`, `${m.nameOf(st.turn)} düşünüyor…`) : t(`${m.nameOf(st.turn)} to move (${side(st.turn)})`, `轮到${m.nameOf(st.turn)}（${side(st.turn)}）`, `Sıra ${m.nameOf(st.turn)} oyuncusunda (${side(st.turn)})`)) + (st.check ? t(' — check!', ' — 将军！', ' — şah!') : '');
  return (
    <div className="play">
      <div className="play-main">
        <div className="statline"><span role="status" aria-live="polite">{status}</span></div>
        <ChessBoard st={st} flipped={flipped} enabled={!m.over && !m.aiTurn} onMove={m.apply} />
        <ol className="movelist" aria-label={t('Moves', '棋谱', 'Hamleler')}>
          {sanList.map((s, i) => (i % 2 === 0 ? <li key={i}><span className="num">{i / 2 + 1}.</span> {s} {sanList[i + 1] ?? ''}</li> : null))}
        </ol>
      </div>
      <aside className="play-side"><MatchPanel id="ch" m={m} sides={[t('White (first)', '白（先手）', 'Beyaz (ilk)'), t('Black', '黑', 'Siyah')]} /></aside>
    </div>
  );
}
