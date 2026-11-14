import './battleship.css';
import { useEffect, useState } from 'react';
import { sfx } from '../../core/sound';
import { RivalPick, useRival } from '../../ui/Cast';
import { aiLabel, pname, trLabel, useLang, useT } from '../../core/i18n';
import { recordMatch } from '../../core/match';
import { loadJSON, saveJSON } from '../../core/storage';
import { activeOf, noteStarted, useData } from '../../core/store';
import { Pick, Seg } from '../../ui/bits';
import { allSunk, chooseShot, FLEET, fits, LEVELS, N, randomFleet, shipAt, shipCells, sunk, type Ship, type Side } from './rules';

type Who = 0 | 1;
interface Last { who: Who; cell: number; hit: boolean; sank: number }
interface G {
  phase: 'setup' | 'battle' | 'over'; mode: 'ai' | 'local'; level: number; p2: string;
  sides: [Side, Side]; placing: Who; turn: Who; winner: Who | null; last: Last | null;
  /** Local games hide everything between turns until the next player is ready. */
  cover: boolean;
}
const fresh = (mode: 'ai' | 'local', level: number, p2: string): G => ({
  phase: 'setup', mode, level, p2, sides: [{ ships: [], shots: [] }, { ships: mode === 'ai' ? randomFleet() : [], shots: [] }],
  placing: 0, turn: 0, winner: null, last: null, cover: mode === 'local',
});
const LETTERS = 'ABCDEFGHIJ';
const cellName = (i: number) => `${LETTERS[i % N]}${Math.floor(i / N) + 1}`;

function Grid({ side, reveal, onCell, onHover, small, label, lastCell, ghost, ghostOk }: {
  side: Side; reveal: boolean; onCell?: (i: number) => void; onHover?: (i: number) => void; small?: boolean; label: string; lastCell?: number; ghost?: number[]; ghostOk?: boolean;
}) {
  const shots = new Set(side.shots), g = new Set(ghost ?? []);
  return (
    <div className={'bs-grid' + (small ? ' small' : '') + (onCell ? ' live' : '')} role="grid" aria-label={label} onMouseLeave={() => onHover?.(-1)}>
      {Array.from({ length: N * N }, (_, i) => {
        const k = shipAt(side, i), hit = shots.has(i) && k >= 0, miss = shots.has(i) && k < 0, gone = k >= 0 && sunk(side, k);
        const cls = 'bs-cell' + (reveal && k >= 0 ? ' ship' : '') + (hit ? ' hit' : '') + (miss ? ' miss' : '') + (gone ? ' sunk' : '') + (i === lastCell ? ' last' : '') + (g.has(i) ? (ghostOk ? ' ghost' : ' ghost bad') : '');
        return onCell && !shots.has(i)
          ? <button key={i} type="button" className={cls} onClick={() => onCell(i)} onMouseEnter={() => onHover?.(i)} aria-label={cellName(i)} />
          : <span key={i} className={cls} />;
      })}
    </div>
  );
}

/** Put ships where you like: pick a ship, choose its direction, tap the bow square. Tap a placed ship to pick it up again. */
function Placer({ ships, onChange, onDone, title }: { ships: Ship[]; onChange: (s: Ship[]) => void; onDone: () => void; title: string }) {
  const t = useT();
  const [hor, setHor] = useState(true);
  const [hover, setHover] = useState(-1);
  const remaining = FLEET.slice();
  for (const sh of ships) { const k = remaining.indexOf(sh.size); if (k >= 0) remaining.splice(k, 1); }
  const [sel, setSel] = useState(0);
  const size = remaining[Math.min(sel, remaining.length - 1)];
  const ghost = size && hover >= 0 ? shipCells(hover, size, hor) : null;
  const ok = !!ghost && fits(ships, ghost);
  const tap = (i: number) => {
    const k = ships.findIndex(sh => sh.cells.includes(i));
    if (k >= 0) { const sh = ships[k], rest = ships.filter((_, j) => j !== k); onChange(rest); setHor(sh.cells.length < 2 || sh.cells[1] - sh.cells[0] === 1); setSel(0); setHover(-1); return; }
    if (!size) return;
    const cells = shipCells(i, size, hor);
    if (cells && fits(ships, cells)) { onChange([...ships, { cells, size }]); setSel(0); }
    else setHover(i);
  };
  const names: Record<number, string> = { 5: t('Carrier', '航母', 'Uçak gemisi'), 4: t('Battleship', '战列舰', 'Zırhlı'), 3: t('Cruiser', '巡洋舰', 'Kruvazör'), 2: t('Destroyer', '驱逐舰', 'Muhrip') };
  return (
    <div className="bs-placer">
      <h3>{title}</h3>
      <div className="bs-dock" role="group" aria-label={t('Ships to place', '待放置的船', 'Yerleştirilecek gemiler')}>
        {remaining.map((s, k) => (
          <button key={k} type="button" className={'bs-ship' + (k === Math.min(sel, remaining.length - 1) ? ' on' : '')} onClick={() => setSel(k)} aria-label={`${names[s]} (${s})`}>
            {Array.from({ length: s }, (_, j) => <i key={j} />)}<span>{names[s]}</span>
          </button>
        ))}
        {!remaining.length && <p className="muted small">{t('All ships are placed. Tap a ship to move it.', '所有船都放好了。点一艘船可以重新摆放。', 'Bütün gemiler yerinde. Taşımak için bir gemiye dokun.')}</p>}
      </div>
      <Grid side={{ ships, shots: [] }} reveal onCell={tap} onHover={setHover} label={title} ghost={ghost ?? undefined} ghostOk={ok} />
      <div className="row bs-setup">
        <button type="button" id="bs-rotate" className="btn" onClick={() => setHor(h => !h)}>{hor ? t('↻ Horizontal', '↻ 横向', '↻ Yatay') : t('↻ Vertical', '↻ 纵向', '↻ Dikey')}</button>
        <button type="button" id="bs-shuffle" className="btn" onClick={() => onChange(randomFleet())}>{t('Random', '随机', 'Rastgele')}</button>
        <button type="button" id="bs-clear" className="btn" disabled={!ships.length} onClick={() => onChange([])}>{t('Clear', '清空', 'Temizle')}</button>
        <button type="button" id="bs-ready" className="btn primary" disabled={remaining.length > 0} onClick={onDone}>{t('Ready', '准备好了', 'Hazır')}</button>
      </div>
      <p className="muted small">{t('Pick a ship, choose its direction, then tap the square for its bow (top or left end). Ships may not touch, not even at the corners.', '选一艘船和方向，再点船头（最上或最左端）所在的格子。船与船不能相邻，连角也不行。', 'Bir gemi ve yön seç, sonra baş kısmının (üst ya da sol uç) geleceği kareye dokun. Gemiler köşeden bile birbirine değemez.')}</p>
    </div>
  );
}

export default function Battleship() {
  const t = useT(), lang = useLang(), data = useData(), me = activeOf(data);
  const [g, setG] = useState<G>(() => { const s = loadJSON<G | null>('gp.battleship2', null); return s && s.sides ? s : fresh('ai', 2, 'guest'); });
  const [draft, setDraft] = useState({ mode: g.mode, level: g.level, p2: g.p2 });
  useEffect(() => { saveJSON('gp.battleship2', g); }, [g]);
  const p2 = data.profiles.find(p => p.id === g.p2 && p.id !== me.id);
  useRival('sea-battle', g.mode === 'ai' ? g.level : null);
  const name = (w: Who) => (w === 0 ? pname(me, lang) : g.mode === 'ai' ? aiLabel(LEVELS[g.level].name, lang) : p2 ? pname(p2, lang) : t('Guest', '游客', 'Misafir'));
  const left = (s: Side) => s.ships.filter((_, k) => !sunk(s, k)).length;
  const other = (w: Who): Who => (w === 0 ? 1 : 0);

  const finish = (next: G, winner: Who): G => {
    recordMatch('sea-battle', { opponent: next.mode, level: next.level, human: 1, p2: next.p2 }, me, p2, winner === 0 ? 'win' : 'loss', '', LEVELS, false);
    return { ...next, phase: 'over', winner, cover: false };
  };
  // A shot by `who` lands on the other side.
  const fire = (prev: G, who: Who, i: number): G => {
    const target = prev.sides[other(who)], hitSide: Side = { ...target, shots: [...target.shots, i] }, k = shipAt(hitSide, i), hit = k >= 0;
    const sides: [Side, Side] = who === 0 ? [prev.sides[0], hitSide] : [hitSide, prev.sides[1]];
    let next: G = { ...prev, sides, turn: other(who), last: { who, cell: i, hit, sank: hit && sunk(hitSide, k) ? hitSide.ships[k].size : 0 } };
    sfx(next.last!.sank ? 'sink' : hit ? 'hit' : 'splash');
    if (allSunk(hitSide)) next = finish(next, who);
    else if (prev.mode === 'local') next.cover = true;
    return next;
  };
  const shoot = (i: number) => {
    if (g.phase !== 'battle' || g.cover || (g.mode === 'ai' && g.turn !== 0)) return;
    if (g.sides[other(g.turn)].shots.includes(i)) return;
    setG(fire(g, g.turn, i));
  };
  useEffect(() => {
    if (g.mode !== 'ai' || g.phase !== 'battle' || g.turn !== 1) return;
    const id = setTimeout(() => setG(prev => (prev.phase === 'battle' && prev.turn === 1 ? fire(prev, 1, chooseShot(prev.sides[0], prev.level)) : prev)), 750);
    return () => clearTimeout(id);
  }, [g.phase, g.turn, g.mode]); // eslint-disable-line

  const setShips = (w: Who, ships: Ship[]) => setG(prev => ({ ...prev, sides: (w === 0 ? [{ ships, shots: [] }, prev.sides[1]] : [prev.sides[0], { ships, shots: [] }]) as [Side, Side] }));
  const placed = (w: Who) => {
    if (g.mode === 'ai' || w === 1) { noteStarted('sea-battle'); setG({ ...g, phase: 'battle', turn: 0, cover: g.mode === 'local' }); }
    else setG({ ...g, placing: 1, cover: true });
  };

  const L = g.last;
  const lastText = !L ? '' : L.sank ? t(`${name(L.who)}: ${cellName(L.cell)}, hit and sunk (${L.sank})! `, `${name(L.who)}：${cellName(L.cell)}，击沉（${L.sank}格）！`, `${name(L.who)}: ${cellName(L.cell)}, vurdu ve batırdı (${L.sank} kare)! `)
    : L.hit ? t(`${name(L.who)}: ${cellName(L.cell)}, hit! `, `${name(L.who)}：${cellName(L.cell)}，命中！`, `${name(L.who)}: ${cellName(L.cell)}, isabet! `)
    : t(`${name(L.who)}: ${cellName(L.cell)}, miss. `, `${name(L.who)}：${cellName(L.cell)}，落空。`, `${name(L.who)}: ${cellName(L.cell)}, karavana. `);
  // Whose eyes are on the screen: in a local game the player to move; against the computer always player 1.
  const viewer: Who = g.mode === 'ai' ? 0 : g.phase === 'setup' ? g.placing : g.turn;
  const status = g.phase === 'setup' ? t(`${name(viewer)}: place your fleet.`, `${name(viewer)}：摆放你的舰队。`, `${name(viewer)}: filonu yerleştir.`)
    : g.phase === 'over' ? lastText + t(`${name(g.winner!)} wins!`, `${name(g.winner!)}获胜！`, `${name(g.winner!)} kazandı!`)
    : lastText + (g.mode === 'ai' && g.turn === 1 ? t(`${name(1)} is aiming…`, `${name(1)}正在瞄准…`, `${name(1)} nişan alıyor…`) : t(`${name(g.turn)}: tap a square on the enemy waters.`, `${name(g.turn)}：点击敌方海域的格子。`, `${name(g.turn)}: düşman sularında bir kareye dokun.`));

  return (
    <div className="play bs">
      <div className="play-main">
        <div className="statline"><span role="status" aria-live="polite">{g.cover ? '' : status}</span></div>
        {g.cover ? (
          <div className="bs-cover">
            <div className="race-card">
              {g.phase === 'battle' && L && <p>{lastText}</p>}
              <h3>{g.phase === 'setup' ? t(`${name(g.placing)} places the fleet`, `由${name(g.placing)}摆放舰队`, `Filoyu ${name(g.placing)} yerleştiriyor`) : t(`${name(g.turn)}, your turn`, `轮到${name(g.turn)}`, `Sıra ${name(g.turn)} oyuncusunda`)}</h3>
              <p className="muted">{t('Hand over the device; the other player should look away.', '把设备交出去，另一位请回避。', 'Cihazı ver; diğer oyuncu bakmasın.')}</p>
              <button type="button" id="bs-go" className="btn primary" onClick={() => setG({ ...g, cover: false })}>{t('I’m ready', '我准备好了', 'Hazırım')}</button>
            </div>
          </div>
        ) : g.phase === 'setup' ? (
          <Placer key={g.placing} ships={g.sides[g.placing].ships} onChange={s => setShips(g.placing, s)} onDone={() => placed(g.placing)}
            title={t(`${name(g.placing)}: your fleet`, `${name(g.placing)}：你的舰队`, `${name(g.placing)}: filon`)} />
        ) : (
          <div className="bs-boards">
            <section className="bs-sea">
              <h3>{t('Enemy waters', '敌方海域', 'Düşman suları')} <span className="muted">· {t(`${left(g.sides[other(viewer)])} ships left`, `剩${left(g.sides[other(viewer)])}艘`, `${left(g.sides[other(viewer)])} gemi kaldı`)}</span></h3>
              <Grid side={g.sides[other(viewer)]} reveal={g.phase === 'over'} onCell={g.phase === 'battle' && g.turn === viewer ? shoot : undefined}
                label={t('Enemy waters', '敌方海域', 'Düşman suları')} lastCell={L?.who === viewer ? L.cell : undefined} />
            </section>
            <section className="bs-sea mine">
              <h3>{t('Your fleet', '你的舰队', 'Senin filon')} <span className="muted">· {t(`${left(g.sides[viewer])} ships left`, `剩${left(g.sides[viewer])}艘`, `${left(g.sides[viewer])} gemi kaldı`)}</span></h3>
              <Grid side={g.sides[viewer]} reveal small label={t('Your fleet', '你的舰队', 'Senin filon')} lastCell={L && L.who !== viewer ? L.cell : undefined} />
              {g.phase === 'over' && <button type="button" id="bs-again" className="btn primary" onClick={() => setG(fresh(g.mode, g.level, g.p2))}>{t('Play again', '再来一局', 'Tekrar oyna')}</button>}
            </section>
          </div>
        )}
      </div>
      <aside className="play-side">
        <dl className="facts tally">
          <div><dt>{name(0)}</dt><dd className="num">{left(g.sides[0])}</dd></div>
          <div><dt>{name(1)}</dt><dd className="num">{left(g.sides[1])}</dd></div>
        </dl>
        <p className="muted small">{t('Each side has a carrier (5), a battleship (4), two cruisers (3) and a destroyer (2). Ships never touch, not even at the corners. Take turns firing one shot; the first to sink the whole enemy fleet wins.', '双方各有航母（5格）、战列舰（4格）、两艘巡洋舰（3格）和一艘驱逐舰（2格）。舰船互不相邻，连角也不挨着。双方轮流开一炮，先击沉对方全部舰队者获胜。', 'Her tarafın bir uçak gemisi (5), bir zırhlısı (4), iki kruvazörü (3) ve bir muhribi (2) var. Gemiler köşeden bile birbirine değmez. Sırayla birer atış yapılır; düşman filosunun tamamını ilk batıran kazanır.')}</p>
        <div className="setup">
          <h3>{t('New game', '新游戏', 'Yeni oyun')}</h3>
          <Seg id="bs-mode" label={t('Opponent', '对手', 'Rakip')} value={draft.mode} onChange={v => setDraft({ ...draft, mode: v })}
            options={[{ value: 'ai', label: t('Computer', '电脑', 'Bilgisayar') }, { value: 'local', label: t('Second player', '第二位玩家', 'İkinci oyuncu') }]} />
          {draft.mode === 'ai'
            ? <RivalPick id="bs-level" game={'sea-battle'} value={draft.level} onChange={v => setDraft({ ...draft, level: v })} levels={LEVELS} />
            : <Pick id="bs-p2" label={t('Second player', '第二位玩家', 'İkinci oyuncu')} value={draft.p2} onChange={v => setDraft({ ...draft, p2: v })}
                options={[{ value: 'guest', label: t('Guest', '游客', 'Misafir') }, ...data.profiles.filter(p => p.id !== me.id).map(p => ({ value: p.id, label: pname(p, lang) }))]} />}
          <button type="button" id="bs-new" className="btn primary" onClick={() => setG(fresh(draft.mode, draft.level, draft.p2))}>{t('Start', '开始', 'Başla')}</button>
        </div>
      </aside>
    </div>
  );
}
