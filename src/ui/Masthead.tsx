import { locale, useLang, useT } from '../core/i18n';

const FOUNDED = Date.UTC(2026, 0, 1);

/** The paper's nameplate. `edition` names a supplement (Puzzles, Board Games) under the title. */
export function Masthead({ edition, small }: { edition?: string; small?: boolean }) {
  const t = useT(), lang = useLang();
  const now = new Date();
  const issue = Math.max(1, Math.floor((Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()) - FOUNDED) / 864e5) + 1);
  const date = now.toLocaleDateString(locale(lang), { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  return (
    <header className={'masthead' + (small ? ' small' : '')}>
      <div className="mh-ears">
        <span className="num">{t(`No. ${issue}`, `第${issue}期`, `Sayı ${issue}`)}</span>
        <span className="mh-date">{date}</span>
        <span>{t('Price: one glass of tea', '定价：一杯茶', 'Fiyatı: bir çay')}</span>
      </div>
      <p className="mh-title">{t('The Coffeehouse Gazette', '茶馆棋报', 'Kahvehane Gazetesi')}</p>
      <div className="mh-motto">
        <span>{edition ?? t('All the games fit to play', '凡值得一玩，尽在此报', 'Oynanmaya değer her oyun')}</span>
      </div>
    </header>
  );
}
