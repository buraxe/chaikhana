import './rps.css';
import { useT } from '../../core/i18n';
import { sfx } from '../../core/sound';
import { MatchPanel, useMatch } from '../../ui/useMatch';
import { beats, chooseMove, legal, LEVELS, newGame, play, replay, TARGET, type Pick, type RState } from './rules';

const SIGN = ['✊', '✋', '✌️'];

export default function Rps() {
  const t = useT();
  const m = useMatch<RState>({ game: 'rps', key: 'gp.rps', levels: LEVELS, defaults: { opponent: 'ai', level: 2, human: 1, p2: 'guest' },
    newGame, replay, play: (s, mv) => { const n = play(s, mv); if (n.rounds.length > s.rounds.length) sfx(n.winner ? 'win' : 'click', 0.6); return n; },
    choose: (s, lv) => chooseMove(s, lv), legal, aiDelay: 350 });
  const { st } = m;
  const names = [t('Rock', '石头', 'Taş'), t('Paper', '布', 'Kâğıt'), t('Scissors', '剪刀', 'Makas')];
  const acc = ['taşı', 'kâğıdı', 'makası']; // Turkish accusative, so no suffix is glued onto a word
  const canAct = !m.over && !m.aiTurn;
  const last = st.rounds[st.rounds.length - 1];
  const local = m.cfg.opponent === 'local';
  const lastText = last ? (beats(last[0], last[1]) ? t(`${names[last[0]]} beats ${names[last[1]]}: point to ${m.nameOf(1)}.`, `${names[last[0]]}胜${names[last[1]]}：${m.nameOf(1)}得分。`, `${names[last[0]]} ${acc[last[1]]} yener: sayıyı ${m.nameOf(1)} alır.`)
    : beats(last[1], last[0]) ? t(`${names[last[1]]} beats ${names[last[0]]}: point to ${m.nameOf(2)}.`, `${names[last[1]]}胜${names[last[0]]}：${m.nameOf(2)}得分。`, `${names[last[1]]} ${acc[last[0]]} yener: sayıyı ${m.nameOf(2)} alır.`)
    : t('Same sign: the round is replayed.', '出了一样的：这一局重来。', 'Aynı işaret: el tekrarlanır.')) : '';
  const status = st.winner ? t(`${m.nameOf(st.winner)} wins the match ${Math.max(...st.score)}–${Math.min(...st.score)}.`, `${m.nameOf(st.winner)}以${Math.max(...st.score)}比${Math.min(...st.score)}赢得比赛。`, `${m.nameOf(st.winner)} maçı ${Math.max(...st.score)}–${Math.min(...st.score)} kazandı.`)
    : m.thinking ? t(`${m.nameOf(st.turn)} is choosing…`, `${m.nameOf(st.turn)}正在出拳…`, `${m.nameOf(st.turn)} seçiyor…`)
    : st.pending !== null && local ? t(`${m.nameOf(1)} has chosen. Pass the device: ${m.nameOf(2)}, your pick.`, `${m.nameOf(1)}已出。把设备交给${m.nameOf(2)}出拳。`, `${m.nameOf(1)} seçti. Cihazı uzat: ${m.nameOf(2)}, sıra sende.`)
    : t(`${m.nameOf(st.turn)}: choose rock, paper or scissors.`, `${m.nameOf(st.turn)}：出石头、剪刀还是布？`, `${m.nameOf(st.turn)}: taş, kâğıt ya da makas seç.`);
  return (
    <div className="play">
      <div className="play-main">
        <div className="statline"><span role="status" aria-live="polite">{status}</span><span className="num">{st.score[0]} – {st.score[1]}</span></div>
        <div className="rp-arena" aria-label={t('Last round', '上一局', 'Son el')}>
          {[0, 1].map(side => (
            <div key={side} className={'rp-hand' + (last && beats(last[side] as Pick, last[1 - side] as Pick) ? ' won' : '')}>
              <span className="rp-who">{m.nameOf(side + 1)}</span>
              <span className="rp-sign" aria-hidden="true">{last ? SIGN[last[side]] : '·'}</span>
              <span className="muted small">{last ? names[last[side]] : ''}</span>
              <span className="rp-pips" aria-label={t(`${st.score[side]} of ${TARGET}`, `${st.score[side]}/${TARGET}`, `${TARGET} sayıdan ${st.score[side]}`)}>{Array.from({ length: TARGET }, (_, k) => <i key={k} className={k < st.score[side] ? 'on' : ''} />)}</span>
            </div>
          ))}
        </div>
        <p className="muted rp-last" aria-live="polite">{lastText}</p>
        <div className="rp-picks" role="group" aria-label={t('Your pick', '出拳', 'Seçimin')}>
          {[0, 1, 2].map(k => (
            <button key={k} type="button" id={'rp-' + ['rock', 'paper', 'scissors'][k]} className="btn rp-pick" disabled={!canAct} onClick={() => m.apply(k)}>
              <span aria-hidden="true">{SIGN[k]}</span>{names[k]}
            </button>
          ))}
        </div>
        <p className="muted small">{t(`Rock blunts scissors, scissors cut paper, paper wraps rock. First to ${TARGET} wins; ties are replayed. The computer learns your habits as you play, so try not to have any.`, `石头砸剪刀，剪刀剪布，布包石头。先赢${TARGET}局者胜，平局重来。电脑会边玩边摸你的习惯，所以尽量别有习惯。`, `Taş makası körletir, makas kâğıdı keser, kâğıt taşı sarar. ${TARGET} sayıya ilk ulaşan kazanır; berabere eller tekrarlanır. Bilgisayar oynadıkça alışkanlıklarını öğrenir, o yüzden alışkanlığın olmasın.`)}</p>
        {st.rounds.length > 0 && <p className="rp-log muted small" aria-label={t('Rounds so far', '已出的局', 'Şimdiye kadarki eller')}>{st.rounds.map((r, i) => <span key={i}>{SIGN[r[0]]}{SIGN[r[1]]}</span>)}</p>}
      </div>
      <aside className="play-side"><MatchPanel id="rp" m={m} sides={[t('Picks first', '先出', 'Önce seçer'), t('Picks second', '后出', 'Sonra seçer')]} /></aside>
    </div>
  );
}
