import './Tour.css';
import { useEffect, useLayoutEffect, useState } from 'react';
import { useLang, useT } from '../core/i18n';
import { LESSON_FILES, useLesson } from '../core/lessons';
import { stepText, tourFor, type Step } from '../core/tutorials';

/** The guided tour: a spotlight on one part of the game and a card that explains it. */
export default function Tour({ game, onClose }: { game: string; onClose: () => void }) {
  const lesson = useLesson(game);
  if (LESSON_FILES[game] && !lesson) return null;
  return <Steps steps={tourFor(game, lesson)} onClose={onClose} />;
}

function Steps({ steps, onClose }: { steps: Step[]; onClose: () => void }) {
  const t = useT(), lang = useLang();
  const [i, setI] = useState(0);
  const [box, setBox] = useState<DOMRect | null>(null);
  const step = steps[i], last = i === steps.length - 1;
  const target = () => (step?.at ? document.querySelector<HTMLElement>(step.at) ?? document.querySelector<HTMLElement>('.play-main') : null);
  useLayoutEffect(() => {
    if (!step) return;
    const el = target(); el?.scrollIntoView({ block: 'center', behavior: 'smooth' });
    let raf = 0;
    const loop = () => { const e = target(); setBox(b => { const r = e?.getBoundingClientRect() ?? null; return r && b && r.top === b.top && r.left === b.left && r.width === b.width && r.height === b.height ? b : r; }); raf = requestAnimationFrame(loop); };
    loop();
    return () => cancelAnimationFrame(raf);
  }, [i]); // eslint-disable-line
  useEffect(() => {
    if (!step?.act) return;
    const el = target(); if (!el) return;
    const go = () => setTimeout(() => (last ? onClose() : setI(n => n + 1)), 450);
    el.addEventListener('pointerup', go, { once: true });
    return () => el.removeEventListener('pointerup', go);
  }, [i]); // eslint-disable-line
  useEffect(() => { const k = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); }; window.addEventListener('keydown', k); return () => window.removeEventListener('keydown', k); }, [onClose]);
  if (!step) { onClose(); return null; }
  const pad = 8, vh = window.innerHeight, below = box ? box.bottom + 180 < vh || box.top < 200 : true;
  const cardTop = box ? (below ? Math.min(vh - 170, box.bottom + pad + 10) : Math.max(10, box.top - pad - 170)) : vh / 2 - 80;
  return (
    <div className="tour" role="dialog" aria-modal="false" aria-label={t('Tutorial', '教程', 'Öğretici')}>
      {box && <div className={'tour-spot' + (step.act ? ' act' : '')} style={{ top: box.top - pad, left: box.left - pad, width: box.width + pad * 2, height: Math.min(box.height + pad * 2, vh) }} />}
      <div className="tour-card" style={{ top: cardTop }}>
        <p className="tour-n num">{t(`Step ${i + 1} of ${steps.length}`, `第${i + 1}/${steps.length}步`, `Adım ${i + 1} / ${steps.length}`)}</p>
        <p className="tour-t">{stepText(step, lang)}</p>
        {step.act && <p className="tour-act">👆 {t('Try it now: tap the highlighted part.', '现在试试：点一下高亮的地方。', 'Şimdi dene: parlayan yere dokun.')}</p>}
        <div className="row">
          {i > 0 && <button type="button" className="btn sm" onClick={() => setI(i - 1)}>{t('Back', '上一步', 'Geri')}</button>}
          <button type="button" id="tour-next" className="btn sm primary" onClick={() => (last ? onClose() : setI(i + 1))}>{last ? t('Let’s play!', '开始吧！', 'Hadi oynayalım!') : step.act ? t('Skip', '跳过', 'Atla') : t('Next', '下一步', 'İleri')}</button>
          <button type="button" id="tour-close" className="btn sm" onClick={onClose}>{t('Close', '关闭', 'Kapat')}</button>
        </div>
      </div>
    </div>
  );
}
