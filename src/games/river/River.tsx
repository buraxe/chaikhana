import './river.css';
import { useEffect, useState } from 'react';
import { useLang, useT } from '../../core/i18n';
import { sfx } from '../../core/sound';
import { loadJSON, saveJSON } from '../../core/storage';
import { getData, noteStarted, recordResult } from '../../core/store';
import { Seg } from '../../ui/bits';
import { allAcross, best, check, cross, SCENARIOS, solve, start, type RState } from './rules';

interface Saved { sc: string; st: RState; history: RState[]; recorded: boolean; hints: number }
const make = (sc: string): Saved => ({ sc, st: start(), history: [], recorded: false, hints: 0 });

export default function River() {
  const t = useT(), lang = useLang(), li = lang === 'zh' ? 1 : lang === 'tr' ? 2 : 0;
  const [g, setG] = useState<Saved>(() => loadJSON<Saved | null>('gp.river', null) ?? make('farmer'));
  const [pick, setPick] = useState<number[]>([]);
  const [msg, setMsg] = useState('');
  const [hint, setHint] = useState<number[] | null>(null);
  useEffect(() => { saveJSON('gp.river', g); }, [g]);
  const s = SCENARIOS.find(x => x.id === g.sc) ?? SCENARIOS[0], st = g.st;
  const done = allAcross(s, st), over = !!s.limit && st.used > s.limit, target = best(s);
  const side = (k: number) => !!(st.mask & (1 << k));
  const toggle = (k: number) => {
    if (done || side(k) !== st.far) return;
    setMsg(''); setHint(null);
    setPick(pk => (pk.includes(k) ? pk.filter(x => x !== k) : pk.length < s.cap ? [...pk, k] : pk));
    sfx('click', 0.4);
  };
  const REASON = {
    empty: t('Choose who goes first.', '先选上船的人。', 'Önce kimin gideceğini seç.'),
    full: t(`The ${s.lift[0]} takes only ${s.cap}.`, `${s.lift[1]}最多${s.cap}个。`, `${s.lift[2]} en fazla ${s.cap} kişi alır.`),
    side: t('They are on the other bank.', '他们在对岸。', 'Onlar karşı kıyıda.'),
    rower: t('Someone has to row.', '得有人划船。', 'Biri kürek çekmeli.'),
    unsafe: t('Not safe: someone left behind would be eaten.', '不安全：留下的会被吃掉。', 'Güvenli değil: geride kalan biri yenir.'),
  };
  const go = (pk = pick, hinted = false) => {
    const why = check(s, st, pk);
    if (why) { setMsg(REASON[why]); sfx('error', 0.4); return; }
    if (!g.history.length) noteStarted('river-crossing');
    const nx = cross(s, st, pk), hints = g.hints + (hinted ? 1 : 0);
    let recorded = g.recorded;
    sfx('slide', 0.6);
    if (allAcross(s, nx) && !recorded) {
      recorded = true; setTimeout(() => sfx('win'), 300);
      if (!hints) recordResult(getData().activeId, 'river-crossing', { result: 'win', label: `${s.title[0]} · ${s.limit ? nx.used + ' min' : nx.moves + ' crossings'}`, bestKey: s.id });
    }
    setG({ ...g, st: nx, history: [...g.history, st], recorded, hints }); setPick([]); setMsg(''); setHint(null);
  };
  const showHint = () => {
    const path = solve(s, st);
    if (!path) { setMsg(s.limit ? t('No way to make it in time from here: undo or start again.', '从这里已经来不及了：撤销或重来。', 'Buradan zamanında yetişmek imkânsız: geri al ya da baştan başla.') : t('No way from here.', '从这里走不通。', 'Buradan yol yok.')); return; }
    setHint(path[0]); setPick(path[0]); setG(x => ({ ...x, hints: x.hints + 1 }));
  };
  const Bank = ({ far }: { far: boolean }) => (
    <div className={'rv-bank' + (far ? ' far' : ' near')}>
      <h3>{far ? t('Far bank', '对岸', 'Karşı kıyı') : t('This bank', '这岸', 'Bu kıyı')}</h3>
      <div className="rv-people">
        {s.who.map((w, k) => side(k) === far && !(pick.includes(k) && st.far === far) ? (
          <button key={w.id} type="button" className={'rv-who' + (hint?.includes(k) ? ' hint' : '')} disabled={done || st.far !== far} onClick={() => toggle(k)} aria-label={w.name[li]}>
            <span className="rv-icon" aria-hidden="true">{w.icon}</span><small>{w.name[li]}</small>
          </button>
        ) : null)}
      </div>
    </div>
  );
  return (
    <div className="play">
      <div className="play-main">
        <div className="statline"><span role="status" aria-live="polite">{done ? (g.hints ? t('Everyone is across, with hints.', '在提示下全部过河了。', 'Herkes karşıya geçti, ipuçlarıyla.') : (s.limit ? st.used : st.moves) === target ? t('Everyone across, in the best possible way!', '全部过河，而且是最优解！', 'Herkes karşıda, hem de en iyi yoldan!') : t('Everyone is across!', '全部过河了！', 'Herkes karşıya geçti!')) : over ? t('Time is up: the torch has gone out.', '时间到了：手电筒灭了。', 'Süre doldu: fener söndü.') : s.rule[li]}</span>
          <span className="num">{s.limit ? `${st.used}/${s.limit} ${t('min', '分', 'dk')}` : `${st.moves} ${t('crossings', '次', 'geçiş')}`}</span></div>
        <div className={'rv-scene ' + s.id}>
          <Bank far={false} />
          <div className="rv-water">
            <div className={'rv-boat' + (st.far ? ' at-far' : '')}>
              <span className="rv-lift" aria-hidden="true">{s.limit ? '🔦' : '⛵'}</span>
              {pick.map(k => <button key={k} type="button" className="rv-who in" onClick={() => toggle(k)} aria-label={s.who[k].name[li]}><span className="rv-icon" aria-hidden="true">{s.who[k].icon}</span></button>)}
            </div>
          </div>
          <Bank far />
        </div>
        <div className="tools">
          <button type="button" id="rv-go" className="btn primary" disabled={done || over} onClick={() => go()}>{st.far ? t('Come back', '返回', 'Geri dön') : t('Cross', '过河', 'Karşıya geç')} {pick.map(k => s.who[k].icon).join(' ')}</button>
          {msg && <span className="rv-msg" role="alert">{msg}</span>}
        </div>
      </div>
      <aside className="play-side">
        <dl className="facts">
          <div><dt>{s.limit ? t('Fastest possible', '最快', 'En hızlı') : t('Fewest crossings', '最少次数', 'En az geçiş')}</dt><dd className="num">{target}{s.limit ? ' ' + t('min', '分', 'dk') : ''}</dd></div>
        </dl>
        <p className="muted small">{t(`Tap people on the ${s.lift[0]}’s side to put them aboard, then press the button.`, `点${s.lift[1]}所在岸边的人让他们上去，再按按钮。`, `${s.lift[2]} hangi kıyıdaysa oradakilere dokunarak bindir, sonra düğmeye bas.`)}</p>
        <div className="tools">
          <button type="button" id="rv-undo" className="btn" disabled={!g.history.length || done} onClick={() => { setG({ ...g, st: g.history[g.history.length - 1], history: g.history.slice(0, -1) }); setPick([]); setMsg(''); }}>{t('Undo', '撤销', 'Geri al')}</button>
          <button type="button" id="rv-hint" className="btn" disabled={done} onClick={showHint}>{t('Hint', '提示', 'İpucu')}</button>
        </div>
        <div className="setup">
          <Seg id="rv-sc" label={t('Riddle', '谜题', 'Bilmece')} value={g.sc} onChange={v => { setG(make(v)); setPick([]); setMsg(''); setHint(null); }} options={SCENARIOS.map(x => ({ value: x.id, label: x.title[li] }))} />
          <button type="button" id={done ? 'rv-again' : 'rv-new'} className="btn primary" onClick={() => { setG(make(g.sc)); setPick([]); setMsg(''); setHint(null); }}>{t('Start again', '重新开始', 'Baştan başla')}</button>
        </div>
      </aside>
    </div>
  );
}
