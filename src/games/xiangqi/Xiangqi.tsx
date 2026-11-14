import './xiangqi.css';
import { useMemo, useState } from 'react';
import { useLang, useT } from '../../core/i18n';
import { MatchPanel, useMatch } from '../../ui/useMatch';
import { Puzzle } from '../boards/Puzzle';
import { chooseMove, fromFen, isRed, legal, LEVELS, mateIn, newGame, play, replay, type XState } from './rules';

const ZH: Record<string, string> = { K: '帥', A: '仕', E: '相', H: '傌', R: '俥', C: '炮', P: '兵', k: '將', a: '士', e: '象', h: '馬', r: '車', c: '砲', p: '卒' };

export function XiangqiBoard({ st, flipped, enabled, onMove, hint }: { st: XState; flipped: boolean; enabled: boolean; onMove: (m: number) => void; hint?: number | null }) {
  const t = useT(), lang = useLang();
  const [sel, setSel] = useState(-1);
  const ms = useMemo(() => (enabled ? legal(st) : []), [st, enabled]);
  const targets = new Map<number, number>(); for (const m of ms) if (Math.floor(m / 90) === sel) targets.set(m % 90, m);
  const last = st.moves[st.moves.length - 1];
  const xy = (i: number) => { const r = Math.floor(i / 9), c = i % 9; return flipped ? [8 - c, 9 - r] : [c, r]; };
  const click = (i: number) => {
    if (!enabled) return;
    const m = targets.get(i); if (m !== undefined) { onMove(m); setSel(-1); return; }
    if (st.board[i] && isRed(st.board[i]) === (st.turn === 1) && ms.some(x => Math.floor(x / 90) === i)) setSel(i === sel ? -1 : i); else setSel(-1);
  };
  const general = st.check ? st.board.indexOf(st.turn === 1 ? 'K' : 'k') : -1;
  return (
    <svg className="xq-board" viewBox="-0.7 -0.7 9.4 10.4" role="grid" aria-label={t('Xiangqi board', '象棋棋盘', 'Çin satrancı tahtası')}>
      <rect x={-0.55} y={-0.55} width={9.1} height={10.1} rx={0.15} className="xq-wood" />
      <g className="xq-lines">
        {Array.from({ length: 10 }, (_, r) => <line key={'h' + r} x1={0} y1={r} x2={8} y2={r} />)}
        {Array.from({ length: 9 }, (_, c) => (c === 0 || c === 8 ? <line key={'v' + c} x1={c} y1={0} x2={c} y2={9} /> : <g key={'v' + c}><line x1={c} y1={0} x2={c} y2={4} /><line x1={c} y1={5} x2={c} y2={9} /></g>))}
        <path d="M3 0L5 2M5 0L3 2M3 7L5 9M5 7L3 9" />
      </g>
      <text x={2} y={4.65} className="xq-river">{lang === 'zh' ? '楚 河' : lang === 'tr' ? 'NEHİR' : 'RIVER'}</text>
      <text x={6} y={4.65} className="xq-river">{lang === 'zh' ? '漢 界' : ''}</text>
      {last !== undefined && [Math.floor(last / 90), last % 90].map((i, k) => { const [x, y] = xy(i); return <rect key={'l' + k} x={x - 0.45} y={y - 0.45} width={0.9} height={0.9} className="xq-last" />; })}
      {hint != null && [Math.floor(hint / 90), hint % 90].map((i, k) => { const [x, y] = xy(i); return <circle key={'hn' + k} cx={x} cy={y} r={0.5} className="xq-hint" />; })}
      {st.board.map((p, i) => {
        if (!p) return null; const [x, y] = xy(i), red = isRed(p);
        return (
          <g key={i + p} className={'xq-pc ' + (red ? 'r' : 'b') + (i === sel ? ' sel' : '') + (i === general ? ' chk' : '')}>
            <circle cx={x} cy={y} r={0.43} /><circle cx={x} cy={y} r={0.35} className="ring" />
            <text x={x} y={y + 0.16}>{ZH[p]}</text>
          </g>
        );
      })}
      {[...targets.keys()].map(i => { const [x, y] = xy(i); return <circle key={'t' + i} cx={x} cy={y} r={st.board[i] ? 0.47 : 0.13} className={st.board[i] ? 'xq-cap' : 'xq-dot'} />; })}
      {Array.from({ length: 90 }, (_, i) => { const [x, y] = xy(i); return <rect key={'c' + i} x={x - 0.5} y={y - 0.5} width={1} height={1} fill="transparent" onClick={() => click(i)} className={enabled ? 'pt' : ''} role="gridcell" aria-label={`${'abcdefghi'[i % 9]}${9 - Math.floor(i / 9)}`} />; })}
    </svg>
  );
}

function XiangqiPuzzle() {
  const t = useT();
  return <Puzzle game="xiangqi" title={t('Xiangqi', '象棋', 'Xiangqi')} start={p => fromFen(p.pos)} play={play}
    board={(st, onMove, o) => <XiangqiBoard st={st} flipped={o.p.pos.endsWith(' b')} enabled={o.enabled} onMove={onMove} hint={o.hint} />}
    check={(before, after, m, p, step) => (after.winner === before.turn ? 'solved' : p.kind === 'm2' && step === 0 && mateIn(before, 2).includes(m) ? 'continue' : 'wrong')}
    reply={st => chooseMove(st, 1)}
    sideName={p => (p.pos.endsWith(' w') ? t('Red to move', '红方走', 'Kırmızı oynar') : t('Black to move', '黑方走', 'Siyah oynar'))}
    describe={p => (p.kind === 'm1' ? t('Mate in one', '一步杀', 'Bir hamlede mat') : t('Mate in two', '两步杀', 'İki hamlede mat'))} />;
}
export default function Xiangqi({ daily = false }: { daily?: boolean }) { return daily ? <XiangqiPuzzle /> : <XiangqiGame />; }
function XiangqiGame() {
  const t = useT();
  const m = useMatch<XState>({ game: 'xiangqi', key: 'gp.xiangqi', levels: LEVELS, defaults: { opponent: 'ai', level: 2, human: 1, p2: 'guest' },
    newGame, replay: ms => replay(ms), play, choose: (s, lv) => chooseMove(s, lv), legal, aiDelay: 250 });
  const { st } = m;
  const side = (c: number) => (c === 1 ? t('Red', '红方', 'Kırmızı') : t('Black', '黑方', 'Siyah'));
  const reason = { mate: t('checkmate', '将死', 'mat'), stalemate: t('no legal move', '困毙', 'hamle kalmadı'), repetition: t('repetition', '重复局面', 'tekrar'), quiet: t('120 moves without a capture', '120步无吃子', '120 hamle taş alınmadı'), '': '' }[st.reason];
  const status = st.winner ? t(`${m.nameOf(st.winner)} wins: ${reason}.`, `${m.nameOf(st.winner)}获胜：${reason}。`, `${m.nameOf(st.winner)} kazandı: ${reason}.`)
    : st.draw ? t(`Draw: ${reason}.`, `和棋：${reason}。`, `Berabere: ${reason}.`)
    : (m.thinking ? t(`${m.nameOf(st.turn)} is thinking…`, `${m.nameOf(st.turn)}思考中…`, `${m.nameOf(st.turn)} düşünüyor…`) : t(`${m.nameOf(st.turn)} to move (${side(st.turn)})`, `轮到${m.nameOf(st.turn)}（${side(st.turn)}）`, `Sıra ${m.nameOf(st.turn)} oyuncusunda (${side(st.turn)})`)) + (st.check ? t(' — check!', ' — 将军！', ' — şah!') : '');
  return (
    <div className="play">
      <div className="play-main">
        <div className="statline"><span role="status" aria-live="polite">{status}</span></div>
        <XiangqiBoard st={st} flipped={m.cfg.opponent === 'ai' && m.cfg.human === 2} enabled={!m.over && !m.aiTurn} onMove={m.apply} />
      </div>
      <aside className="play-side"><MatchPanel id="xq" m={m} sides={[t('Red (first)', '红（先手）', 'Kırmızı (ilk)'), t('Black', '黑', 'Siyah')]} /></aside>
    </div>
  );
}
