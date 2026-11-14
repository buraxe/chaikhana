import './sifeng.css';
import { useEffect, useMemo } from 'react';
import { useLang, useT } from '../../core/i18n';
import { soundEnabled } from '../../core/sound';
import { getData, noteStarted, recordResult, setSound } from '../../core/store';
import RAW from './sifeng.html?raw';

/**
 * 四风 · Sì Fēng, Saranta's mahjong-style line game, runs as its own page inside a frame.
 * The platform hands it the language and sound setting, and books the result when a game ends.
 */
const PAGE = RAW.replace('<%/script%>', '</scr' + 'ipt>');
interface Over { players: { name: string; score: number; ai: string | null }[]; why: string }
declare global { interface Window { __sifengHost?: { lang: () => string; sound: () => boolean; setSound: (on: boolean) => void; started: () => void; over: (r: Over) => void } } }

export default function Sifeng() {
  const t = useT(), lang = useLang();
  useEffect(() => {
    window.__sifengHost = {
      lang: () => lang, sound: () => soundEnabled(), setSound: on => setSound(on), started: () => noteStarted('sifeng'),
      over: r => {
        const humans = r.players.map((p, i) => (p.ai ? -1 : i)).filter(i => i >= 0), me = humans[0] ?? 0;
        const best = Math.max(...r.players.map(p => p.score)), mine = r.players[me].score, top = r.players.filter(p => p.score === best).length;
        const result = mine === best ? (top > 1 ? 'draw' : 'win') : 'loss';
        const scores = r.players.map(p => `${p.name} ${p.score}`).join(' · ');
        recordResult(getData().activeId, 'sifeng', { result, label: (humans.length > 1 ? 'same device · ' : 'vs bots · ') + scores });
      },
    };
    return () => { delete window.__sifengHost; };
  }, [lang]);
  // A new language reloads the game page so its menus follow.
  const doc = useMemo(() => PAGE, []);
  return (
    <div className="play sifeng">
      <div className="play-main">
        <iframe key={lang} className="sf-frame" title={t('Sì Fēng', '四风', 'Sì Fēng')} srcDoc={doc} allow="fullscreen" />
        <p className="muted small">{t('Drag tiles to the table, pinch or use + and − to zoom. Your game is saved on this device.', '把牌拖到桌上，双指或用 + − 缩放。对局会保存在这台设备上。', 'Taşları masaya sürükle; yakınlaştırmak için iki parmak ya da + ve − kullan. Oyunun bu cihazda kaydedilir.')}</p>
      </div>
    </div>
  );
}
