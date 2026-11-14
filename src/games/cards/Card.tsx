import './cards.css';
import { isRed, rankOf, RANKS, suitOf, SUITS, cardName, type Card } from './deck';
import { useLang } from '../../core/i18n';

/** One playing card, drawn in CSS so it scales with its container. */
export function PlayingCard({ c, back, small, className }: { c?: Card; back?: boolean; small?: boolean; className?: string }) {
  const lang = useLang();
  if (back || c === undefined) return <span className={'pc back' + (small ? ' sm' : '') + (className ? ' ' + className : '')} aria-hidden="true" />;
  const r = RANKS[rankOf(c)], s = SUITS[suitOf(c)], face = rankOf(c) >= 9 && rankOf(c) <= 11;
  return (
    <span className={'pc' + (isRed(c) ? ' red' : '') + (small ? ' sm' : '') + (face ? ' face' : '') + (className ? ' ' + className : '')} role="img" aria-label={cardName(c, lang)}>
      <span className="pc-i"><b>{r}</b><i>{s}</i></span>
      <span className="pc-s">{face ? <><em>{r}</em>{s}</> : s}</span>
      <span className="pc-i rot"><b>{r}</b><i>{s}</i></span>
    </span>
  );
}

/** A hand of cards as a fan of buttons. Cards not in `playable` are dimmed and disabled. */
export function Hand({ cards, playable, onPlay, selected, label, id = 'hand' }: {
  cards: Card[]; playable?: Card[]; onPlay?: (c: Card) => void; selected?: Card | null; label: string; id?: string;
}) {
  const lang = useLang();
  return (
    <div className="pc-hand" role="group" aria-label={label} style={{ ['--n' as string]: cards.length }}>
      {cards.map(c => {
        const ok = !playable || playable.includes(c);
        return (
          <button key={c} type="button" id={`${id}-${c}`} className={'pc-btn' + (ok && playable ? ' ok' : '') + (selected === c ? ' sel' : '')} disabled={!onPlay || !ok}
            onClick={() => onPlay?.(c)} aria-label={cardName(c, lang)}>
            <PlayingCard c={c} />
          </button>
        );
      })}
    </div>
  );
}
