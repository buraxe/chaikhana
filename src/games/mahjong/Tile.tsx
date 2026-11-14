import './mahjong.css';
import type { Lang } from '../../core/store';
import { rankOf, suitOf } from './rules';

/** Mahjong tiles, drawn: dots and bamboo in their traditional layouts, characters and honours in ink. */
const B = '#1f4e9c', G = '#1e7a4a', R = '#c0281f';
const NUM = '一二三四五六七八九';
const HONOUR = ['東', '南', '西', '北', '中', '發', ''];

type P = [number, number, string?];
const DOTS: Record<number, { r: number; at: P[] }> = {
  2: { r: 5.4, at: [[15, 12, G], [15, 28, B]] },
  3: { r: 4.4, at: [[8.5, 10, B], [15, 20, R], [21.5, 30, G]] },
  4: { r: 4.4, at: [[9.5, 12, B], [20.5, 12, G], [9.5, 28, G], [20.5, 28, B]] },
  5: { r: 3.9, at: [[9, 10.5, B], [21, 10.5, G], [15, 20, R], [9, 29.5, G], [21, 29.5, B]] },
  6: { r: 3.9, at: [[10, 9.5, G], [20, 9.5, G], [10, 20, R], [20, 20, R], [10, 30.5, R], [20, 30.5, R]] },
  7: { r: 3.2, at: [[8, 7, G], [15, 10.5, G], [22, 14, G], [10, 23, R], [20, 23, R], [10, 32, R], [20, 32, R]] },
  8: { r: 3.4, at: [[10, 7, B], [20, 7, B], [10, 15.5, B], [20, 15.5, B], [10, 24, B], [20, 24, B], [10, 32.5, B], [20, 32.5, B]] },
  9: { r: 3.3, at: [[8, 9.5, B], [15, 9.5, B], [22, 9.5, B], [8, 20, R], [15, 20, R], [22, 20, R], [8, 30.5, G], [15, 30.5, G], [22, 30.5, G]] },
};
const STICKS: Record<number, { h: number; at: P[] }> = {
  2: { h: 12, at: [[15, 12], [15, 28]] },
  3: { h: 11, at: [[15, 11], [9.5, 28], [20.5, 28]] },
  4: { h: 12, at: [[10, 12], [20, 12], [10, 28], [20, 28]] },
  5: { h: 11, at: [[8.5, 11], [21.5, 11], [15, 20, R], [8.5, 29], [21.5, 29]] },
  6: { h: 12, at: [[8, 12], [15, 12], [22, 12], [8, 28], [15, 28], [22, 28]] },
  7: { h: 9, at: [[15, 8, R], [8, 20], [15, 20], [22, 20], [8, 31], [15, 31], [22, 31]] },
  8: { h: 12, at: [[6.5, 12], [12, 12], [18, 12], [23.5, 12], [6.5, 28], [12, 28], [18, 28], [23.5, 28]] },
  9: { h: 9, at: [[8, 9], [15, 9, R], [22, 9], [8, 20], [15, 20, R], [22, 20], [8, 31], [15, 31, R], [22, 31]] },
};

function Dot({ x, y, r, c }: { x: number; y: number; r: number; c: string }) {
  return <g><circle cx={x} cy={y} r={r} fill="none" stroke={c} strokeWidth={r * 0.28} /><circle cx={x} cy={y} r={r * 0.45} fill={c} /><circle cx={x} cy={y} r={r * 0.15} fill="#fffaf0" /></g>;
}
function Stick({ x, y, h, c = G }: { x: number; y: number; h: number; c?: string }) {
  return <g><rect x={x - 1.9} y={y - h / 2} width={3.8} height={h} rx={1.9} fill={c} /><path d={`M${x - 1.9} ${y}h3.8M${x} ${y - h / 2 + 1.2}v${h - 2.4}`} stroke="#fffaf0" strokeWidth={0.55} opacity={0.75} /></g>;
}
function Face({ k }: { k: number }) {
  const s = suitOf(k), n = rankOf(k);
  if (s === 0) return <><text x="15" y="17.5" className="mj-ink" fontSize="12.5" textAnchor="middle">{NUM[n - 1]}</text><text x="15" y="34" className="mj-ink" fontSize="13.5" textAnchor="middle" fill={R}>萬</text></>;
  if (s === 1) {
    if (n === 1) return <g><circle cx="15" cy="20" r="10" fill="none" stroke={G} strokeWidth="1.6" /><circle cx="15" cy="20" r="7" fill={B} /><circle cx="15" cy="20" r="4.2" fill="#fffaf0" /><circle cx="15" cy="20" r="2.6" fill={R} />{[0, 1, 2, 3, 4, 5, 6, 7].map(i => <circle key={i} cx={15 + 8.5 * Math.cos(i * Math.PI / 4)} cy={20 + 8.5 * Math.sin(i * Math.PI / 4)} r=".8" fill="#fffaf0" />)}</g>;
    const d = DOTS[n];
    return <>{d.at.map(([x, y, c], i) => <Dot key={i} x={x} y={y} r={d.r} c={c ?? B} />)}</>;
  }
  if (s === 2) {
    if (n === 1) return (
      <g><path d="M9 27c0-6 4-10 9-10 3 0 5 2 5 4-3 0-5 1-6 3l3 5c-5 2-11 1-11-2z" fill={G} />
        <circle cx="20.5" cy="14" r="3.2" fill={R} /><path d="M23.4 13.4l3 .8-2.9 1.1z" fill="#d6a842" /><circle cx="21.3" cy="13.3" r=".7" fill="#fffaf0" />
        <path d="M10 26l-4 5M12 28l-3 6M15 29l-1 6" stroke={B} strokeWidth="1.3" strokeLinecap="round" /></g>
    );
    const d = STICKS[n];
    return <>{d.at.map(([x, y, c], i) => <Stick key={i} x={x} y={y} h={d.h} c={c} />)}</>;
  }
  const h = k - 27;
  if (h === 6) return <><rect x="7.5" y="8" width="15" height="24" rx="1.5" fill="none" stroke={B} strokeWidth="1.6" /><rect x="10" y="10.5" width="10" height="19" rx="1" fill="none" stroke={B} strokeWidth=".7" /></>;
  return <text x="15" y="27.5" className="mj-ink" fontSize="19" textAnchor="middle" fill={h === 4 ? R : h === 5 ? G : '#1b2a44'}>{HONOUR[h]}</text>;
}

/** One tile, face up or down. */
export function MjTile({ k, back, className = '' }: { k?: number; back?: boolean; className?: string }) {
  return (
    <svg className={'mj-tile ' + className} viewBox="0 0 30 42" aria-hidden="true">
      <rect x="1" y="3" width="28" height="38" rx="4" className={back ? 'mj-edge back' : 'mj-edge'} />
      <rect x="1" y="1" width="28" height="38" rx="4" className={back ? 'mj-back' : 'mj-face'} />
      {!back && k !== undefined && <Face k={k} />}
    </svg>
  );
}

const SUIT = [['Characters', '万', 'Karakter'], ['Dots', '筒', 'Daire'], ['Bamboo', '条', 'Bambu']];
const HON = [['East wind', '东风', 'Doğu rüzgârı'], ['South wind', '南风', 'Güney rüzgârı'], ['West wind', '西风', 'Batı rüzgârı'], ['North wind', '北风', 'Kuzey rüzgârı'],
  ['Red dragon', '红中', 'Kırmızı ejder'], ['Green dragon', '发财', 'Yeşil ejder'], ['White dragon', '白板', 'Beyaz ejder']];
/** "5 Dots", "五筒", "5 Daire". */
export function tileName(k: number, lang: Lang): string {
  const li = lang === 'zh' ? 1 : lang === 'tr' ? 2 : 0;
  if (k >= 27) return HON[k - 27][li];
  const n = rankOf(k), s = SUIT[suitOf(k)];
  return lang === 'zh' ? NUM[n - 1] + s[1] : `${n} ${s[li]}`;
}
