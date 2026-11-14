import './cards.css';
import type { ReactNode } from 'react';
import { useT } from '../../core/i18n';
import { PlayingCard, Hand } from './Card';
import { SUITS, type Card } from './deck';
import type { Play, TrickState } from './trick';

/**
 * The table for four-player trick games, seen from the player at the screen: three opponents
 * round the edge, the trick in the middle, your hand at the bottom.
 */
export function TrickTable({ st, names, viewer, playable, onPlay, trump, info, centre, shown, hideHand, badge }: {
  st: TrickState; names: string[]; viewer: number; playable: Card[]; onPlay: (c: Card) => void;
  trump: number | null; info: (seat: number) => ReactNode; centre?: ReactNode; shown: Play[]; hideHand?: boolean; badge?: (seat: number) => ReactNode;
}) {
  const t = useT();
  const pos = (seat: number) => ['b', 'r', 't', 'l'][(seat - viewer + 4) % 4];
  const Seat = ({ seat }: { seat: number }) => (
    <div className={'tt-seat p-' + pos(seat) + (st.turn === seat && st.hands[seat].length ? ' turn' : '')}>
      <div className="tt-name"><b>{names[seat]}</b>{badge?.(seat)}</div>
      <div className="tt-info">{info(seat)}</div>
      {pos(seat) !== 'b' && <div className="tt-backs" aria-label={t(`${st.hands[seat].length} cards`, `${st.hands[seat].length}张牌`, `${st.hands[seat].length} kart`)}>
        {st.hands[seat].slice(0, 13).map((_, i) => <PlayingCard key={i} back small />)}</div>}
    </div>
  );
  return (
    <div className="tt">
      <div className="tt-felt">
        {[0, 1, 2, 3].map(s => <Seat key={s} seat={s} />)}
        <div className="tt-mid">
          {trump !== null && <span className={'tt-trump' + (trump === 1 || trump === 2 ? ' red' : '')} title={t('Trump', '将牌', 'Koz')}>{SUITS[trump]}</span>}
          {shown.map(p => <div key={p.seat + '-' + p.card} className={'tt-play q-' + pos(p.seat)}><PlayingCard c={p.card} /></div>)}
          {centre && <div className="tt-centre">{centre}</div>}
        </div>
      </div>
      {!hideHand && <Hand cards={st.hands[viewer]} playable={st.turn === viewer ? playable : []} onPlay={onPlay} label={t('Your hand', '你的手牌', 'Elin')} />}
    </div>
  );
}

/** Hand the device to the next person without showing the last hand. */
export function PassCover({ name, onReady, id }: { name: string; onReady: () => void; id: string }) {
  const t = useT();
  return (
    <div className="race-card tt-cover">
      <h3>{t(`${name}, your turn`, `轮到${name}`, `Sıra ${name} oyuncusunda`)}</h3>
      <p className="muted">{t('Hand over the device; the others should not look.', '把设备交出去，其他人请不要看。', 'Cihazı ver; diğerleri bakmasın.')}</p>
      <button type="button" id={id} className="btn primary" onClick={onReady}>{t('I’m ready', '我准备好了', 'Hazırım')}</button>
    </div>
  );
}
