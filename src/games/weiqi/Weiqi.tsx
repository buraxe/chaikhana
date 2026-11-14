import './weiqi.css';
import { useMemo, useState } from 'react';
import { useT } from '../../core/i18n';
import { Seg } from '../../ui/bits';
import { MatchPanel, useMatch } from '../../ui/useMatch';
import { Puzzle } from '../boards/Puzzle';
import { bestCapture, chooseMove, KOMI, LEVELS, newGame, play, place, replay, type GState } from './rules';

export function GoBoard({ st, enabled, onMove, hint }: { st: GState; enabled: boolean; onMove: (m: number) => void; hint?: number | null }) {
  const t = useT(), n = st.n, P = n * n;
  const last = st.moves[st.moves.length - 1];
  const stars = n === 9 ? [20, 24, 40, 56, 60] : n === 13 ? [42, 48, 84, 120, 126] : [];
  const dead = new Set(st.score?.dead ?? []);
  const [hover, setHover] = useState(-1);
  return (
    <svg className="go-board" viewBox={`-0.9 -0.9 ${n + 0.8} ${n + 0.8}`} role="grid" aria-label={t('Go board', '围棋棋盘', 'Go tahtası')} onMouseLeave={() => setHover(-1)}>
      <rect x={-0.9} y={-0.9} width={n + 0.8} height={n + 0.8} className="go-wood" />
      <g className="go-lines">{Array.from({ length: n }, (_, k) => <g key={k}><line x1={0} y1={k} x2={n - 1} y2={k} /><line x1={k} y1={0} x2={k} y2={n - 1} /></g>)}</g>
      {stars.map(i => <circle key={i} cx={i % n} cy={Math.floor(i / n)} r={0.09} className="go-star" />)}
      {Array.from({ length: n }, (_, k) => <g key={'c' + k} className="go-coord"><text x={k} y={-0.5}>{'ABCDEFGHJKLMNOPQRST'[k]}</text><text x={-0.6} y={k + 0.12}>{n - k}</text></g>)}
      {st.cells.map((v, i) => v ? <circle key={i + '-' + v} cx={i % n} cy={Math.floor(i / n)} r={0.46} className={'go-stone p' + v + (dead.has(i) ? ' dead' : '')} /> : null)}
      {last !== undefined && last < P && st.cells[last] ? <circle cx={last % n} cy={Math.floor(last / n)} r={0.16} className={'go-last p' + st.cells[last]} /> : null}
      {hint != null && hint < P && <circle cx={hint % n} cy={Math.floor(hint / n)} r={0.5} className="go-hint" />}
      {enabled && hover >= 0 && !st.cells[hover] && <circle cx={hover % n} cy={Math.floor(hover / n)} r={0.44} className={'go-ghost p' + st.turn} />}
      {Array.from({ length: P }, (_, i) => (
        <rect key={'h' + i} x={(i % n) - 0.5} y={Math.floor(i / n) - 0.5} width={1} height={1} fill="transparent" className={enabled && !st.cells[i] ? 'pt' : ''}
          role="gridcell" aria-label={'ABCDEFGHJKLMNOPQRST'[i % n] + (n - Math.floor(i / n))}
          onMouseEnter={() => setHover(i)} onClick={() => enabled && !st.cells[i] && place(st.cells, n, i, st.turn, st.ko) && onMove(i)} />
      ))}
    </svg>
  );
}

function GoPuzzle() {
  const t = useT();
  const start = (pos: string) => {
    const [body, ko] = pos.split(':'), side = body.slice(-1), cells = body.slice(0, -1).split('').map(Number), n = Math.round(Math.sqrt(cells.length));
    return { ...newGame(n), cells, turn: (side === 'b' ? 1 : 2) as 1 | 2, ko: ko ? +ko : -1 };
  };
  return <Puzzle game="weiqi" title={t('Go', '围棋', 'Go')} start={p => start(p.pos)} play={play}
    board={(st, onMove, o) => <GoBoard st={st} enabled={o.enabled} onMove={onMove} hint={o.hint} />}
    check={(before, _after, m) => (bestCapture(before).moves.includes(m) ? 'solved' : 'wrong')}
    sideName={p => (p.pos.split(':')[0].endsWith('b') ? t('Black to play', '黑先', 'Siyah oynar') : t('White to play', '白先', 'Beyaz oynar'))}
    describe={p => t(`Capture ${p.n} stones in one move`, `一手提掉${p.n}子`, `Tek hamlede ${p.n} taş al`)} />;
}
export default function Weiqi({ daily = false }: { daily?: boolean }) { return daily ? <GoPuzzle /> : <GoGame />; }
function GoGame() {
  const t = useT();
  const [size, setSize] = useState<9 | 13>(() => { try { return (Number(localStorage.getItem('gp.go.size')) === 13 ? 13 : 9); } catch { return 9; } });
  return <GoMatch key={size} size={size} setSize={s => { try { localStorage.setItem('gp.go.size', String(s)); } catch { /* ignore */ } setSize(s); }} t={t} />;
}
function GoMatch({ size, setSize, t }: { size: 9 | 13; setSize: (s: 9 | 13) => void; t: ReturnType<typeof useT> }) {
  const P = size * size;
  const m = useMatch<GState>({ game: 'weiqi', key: 'gp.go.' + size, levels: LEVELS, defaults: { opponent: 'ai', level: 2, human: 1, p2: 'guest' },
    newGame: () => newGame(size), replay: ms => replay(ms, size), play, choose: (s, lv) => chooseMove(s, lv),
    legal: s => { const out: number[] = []; for (let i = 0; i < P; i++) if (place(s.cells, size, i, s.turn, s.ko)) out.push(i); return out; }, aiDelay: 200 });
  const { st } = m;
  const side = (c: number) => (c === 1 ? t('Black', '黑方', 'Siyah') : t('White', '白方', 'Beyaz'));
  const lastPass = st.moves.length > 0 && st.moves[st.moves.length - 1] === P;
  const sc = st.score;
  const status = sc ? t(`${m.nameOf(st.winner)} wins by ${Math.abs(sc.black - sc.white)} points (Black ${sc.black}, White ${sc.white}).`, `${m.nameOf(st.winner)}胜${Math.abs(sc.black - sc.white)}目（黑${sc.black}，白${sc.white}）。`, `${m.nameOf(st.winner)} ${Math.abs(sc.black - sc.white)} puanla kazandı (Siyah ${sc.black}, Beyaz ${sc.white}).`)
    : (lastPass ? t(`${m.nameOf(3 - st.turn)} passed. `, `${m.nameOf(3 - st.turn)}停一手。`, `${m.nameOf(3 - st.turn)} pas geçti. `) : '')
      + (m.thinking ? t(`${m.nameOf(st.turn)} is thinking…`, `${m.nameOf(st.turn)}思考中…`, `${m.nameOf(st.turn)} düşünüyor…`) : t(`${m.nameOf(st.turn)} to play (${side(st.turn)})`, `轮到${m.nameOf(st.turn)}（${side(st.turn)}）`, `Sıra ${m.nameOf(st.turn)} oyuncusunda (${side(st.turn)})`));
  const canPlay = !m.over && !m.aiTurn;
  const prisoners = useMemo(() => st.caps, [st.caps]);
  return (
    <div className="play">
      <div className="play-main">
        <div className="statline"><span role="status" aria-live="polite">{status}</span><span className="num muted">⚫ {prisoners[0]} · ⚪ {prisoners[1]}</span></div>
        <GoBoard st={st} enabled={canPlay} onMove={m.apply} />
        <div className="tools">
          <button type="button" id="go-pass" className="btn" disabled={!canPlay} onClick={() => m.apply(P)}>{t('Pass', '停一手', 'Pas')}</button>
          <span className="muted small">{t(`Area scoring, komi ${KOMI}. Two passes in a row end the game; stones that cannot live are taken off before counting.`, `数子法，贴${KOMI}目。连续两次停一手结束对局；数子前会提走死子。`, `Alan sayımı, komi ${KOMI}. Arka arkaya iki pas oyunu bitirir; yaşayamayacak taşlar saymadan önce kaldırılır.`)}</span>
        </div>
      </div>
      <aside className="play-side">
        <Seg id="go-size" label={t('Board', '棋盘', 'Tahta')} value={size} onChange={v => setSize(v)} options={[{ value: 9, label: '9×9' }, { value: 13, label: '13×13' }]} />
        <MatchPanel id="go" m={m} sides={[t('Black (first)', '黑（先手）', 'Siyah (ilk)'), t('White', '白', 'Beyaz')]} />
      </aside>
    </div>
  );
}
