import { useLang, useT } from '../core/i18n';
import { EVENT_TEXT, EXPR_TEXT, LIT_TEXT, tx } from './blockText';
import { EXPRS, txt, type Explained, type ExprTree, type GameDef, type Input, type Trace, type Val } from './engine';
import { playerColor, playerName } from './GameView';

type Lang = 'en' | 'zh' | 'tr';
export interface LogEntry { id: number; who: number; input: Input; trace: Trace[] }
export interface Why { input: Input; items: Explained[] }

export function inputLabel(def: GameDef, i: Input, lang: Lang): string {
  const T = (en: string, zh: string, tr: string) => (lang === 'zh' ? zh : lang === 'tr' ? tr : en);
  switch (i.k) {
    case 'click': return T(`clicked cell ${i.cell}`, `点击了格子 ${i.cell}`, `${i.cell}. kareye tıkladı`);
    case 'move': return T(`moved ${i.from} → ${i.to}`, `从 ${i.from} 移到 ${i.to}`, `${i.from} → ${i.to} taşıdı`);
    case 'roll': return T('rolled the dice', '掷了骰子', 'zar attı');
    case 'card': return i.cell === undefined ? T('played a card', '出了一张牌', 'kart oynadı') : T(`played a card on ${i.cell}`, `把牌打到 ${i.cell}`, `${i.cell}. kareye kart oynadı`);
    case 'zone': return T(`clicked ${txt(def.zones?.[i.zone.split('@')[0]]?.name, lang)}`, `点击了${txt(def.zones?.[i.zone.split('@')[0]]?.name, lang)}`, `${txt(def.zones?.[i.zone.split('@')[0]]?.name, lang)} alanına tıkladı`);
    case 'word': return T(`guessed ${i.text}`, `猜了 ${i.text}`, `${i.text} tahmin etti`);
    case 'button': return T(`pressed ${txt(def.buttons?.[i.id]?.name, lang)}`, `按下了${txt(def.buttons?.[i.id]?.name, lang)}`, `${txt(def.buttons?.[i.id]?.name, lang)} düğmesine bastı`);
  }
}
export function ruleTitle(def: GameDef, i: number, lang: Lang): string {
  const r = def.rules[i];
  if (!r) return '?';
  return (r.name ? txt(r.name, lang) : tx(EVENT_TEXT[r.on], lang)) + ` · #${i + 1}`;
}

const fmt = (v: Val, lang: Lang) => (typeof v === 'boolean' ? tx(v ? LIT_TEXT.yes : LIT_TEXT.no, lang) : typeof v === 'string' ? `“${v}”` : String(v));
/** One block of a condition in words, with what each input came to and the result. */
function TreeLine({ node, lang, depth = 0 }: { node: ExprTree | Val; lang: Lang; depth?: number }) {
  if (typeof node !== 'object') return <li className="wk-tl leaf">{fmt(node, lang)}</li>;
  const keys = Object.keys(EXPRS[node.op]?.args ?? {}), tmpl = tx(EXPR_TEXT[node.op] ?? [node.op, node.op, node.op], lang);
  const parts = tmpl.split(/(%\d)/).map((p, i) => {
    const m = p.match(/^%(\d)$/);
    if (!m) return <span key={i}>{p}</span>;
    const k = keys[+m[1] - 1], a = node.args[k] ?? node.text?.[k];
    if (a === undefined) return <i key={i} className="muted">—</i>;
    const v = typeof a === 'object' ? a.value : a;
    return <b key={i} className="wk-tv">{node.op === 'get' ? String(a) : fmt(v as Val, lang)}</b>;
  });
  const kids = Object.values(node.args).filter((a): a is ExprTree => typeof a === 'object' && a.op !== 'get' && depth < 4);
  const ok = typeof node.value === 'boolean' ? node.value : null;
  return (
    <li className={'wk-tl' + (ok === false ? ' no' : ok ? ' yes' : '')}>
      <span>{node.op === 'get' ? <><code>{node.text?.name}</code> = <b className="wk-tv">{fmt(node.value, lang)}</b></> : parts}</span>
      {node.op !== 'get' && <span className="wk-tres">→ {fmt(node.value, lang)}</span>}
      {kids.length > 0 && <ul>{kids.map((k, i) => <TreeLine key={i} node={k} lang={lang} depth={depth + 1} />)}</ul>}
    </li>
  );
}

export function WhyPanel({ def, why, onClose, onOpen }: { def: GameDef; why: Why; onClose: () => void; onOpen: (rule: number) => void }) {
  const t = useT(), lang = useLang();
  const reason = (w: Explained['why']) => w === null ? t('applies — it would run', '成立——会执行', 'geçerli — çalışırdı')
    : w === 'when' ? t('its condition is false', '条件不成立', 'koşulu tutmadı')
    : w === 'cellType' ? t('only for another cell type', '只适用于另一种格子', 'başka bir kare türü için')
    : w === 'zone' ? t('only for another zone', '只适用于另一个区域', 'başka bir alan için')
    : w === 'button' ? t('only for another button', '只适用于另一个按钮', 'başka bir düğme için')
    : w === 'target' ? t('cards here are played differently (onto a cell or not)', '这里的牌出法不同（是否打到格子上）', 'kart burada başka türlü oynanıyor (kareye ya da değil)')
    : t('a block failed', '有积木出错', 'bir blok hata verdi');
  return (
    <div className="wk-why" role="region" aria-label={t('Why nothing happened', '为什么没有反应', 'Neden bir şey olmadı')}>
      <header><b>{t('Why nothing happened', '为什么没有反应', 'Neden bir şey olmadı')}: {inputLabel(def, why.input, lang)}</b><button type="button" className="btn sm ghost" onClick={onClose} aria-label={t('Close', '关闭', 'Kapat')}>✕</button></header>
      {!why.items.length && <p className="muted small">{t('No rule listens to this kind of action. Add one in Blocks.', '没有规则响应这种操作。请在“积木”中添加。', 'Bu tür bir hamleyi dinleyen kural yok. Bloklar’dan bir kural ekle.')}</p>}
      <ul className="wk-whylist">
        {why.items.map(it => (
          <li key={it.rule}>
            <button type="button" className="wk-rulelink" onClick={() => onOpen(it.rule)}>{ruleTitle(def, it.rule, lang)}</button>
            <span className={it.why === null ? 'wk-ok' : 'wk-bad'}>{reason(it.why)}</span>
            {it.cond !== undefined && it.why === 'when' && <ul className="wk-tree"><TreeLine node={it.cond} lang={lang} /></ul>}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function WatchLog({ def, log, onOpen, onClear }: { def: GameDef; log: LogEntry[]; onOpen: (rule: number, paths: string[]) => void; onClear: () => void }) {
  const t = useT(), lang = useLang();
  return (
    <div className="wk-log">
      <header><b>{t('Rule log', '规则日志', 'Kural günlüğü')}</b>{log.length > 0 && <button type="button" className="btn sm ghost" onClick={onClear}>{t('Clear', '清空', 'Temizle')}</button>}</header>
      {!log.length && <p className="muted small">{t('Make a move: every rule that is checked appears here. Tap a rule to see its blocks.', '走一步：每条被检查的规则都会显示在这里。点规则可查看它的积木。', 'Bir hamle yap: kontrol edilen her kural burada görünür. Bloklarını görmek için kurala dokun.')}</p>}
      <ol reversed className="wk-loglist">
        {[...log].reverse().map(e => {
          const rules = e.trace.filter((x): x is Extract<Trace, { kind: 'rule' }> => x.kind === 'rule');
          return (
            <li key={e.id}>
              <div className="wk-loghead"><i className="wk-dot" style={{ background: playerColor(def, e.who) }} /> {playerName(def, e.who, lang)} · {inputLabel(def, e.input, lang)}</div>
              <ul>
                {rules.map((r, k) => {
                  const acts = e.trace.filter(x => x.kind === 'act' && x.rule === r.rule).map(x => (x as Extract<Trace, { kind: 'act' }>).path);
                  return (
                    <li key={k} className={r.ran ? 'ran' : 'skip'}>
                      <button type="button" className="wk-rulelink" onClick={() => onOpen(r.rule, r.ran ? acts : [])}>{ruleTitle(def, r.rule, lang)}</button>
                      <span className="small">{r.ran ? t(`ran · ${acts.length} actions`, `已执行 · ${acts.length} 个动作`, `çalıştı · ${acts.length} eylem`) : r.why === 'when' ? t('condition false', '条件不成立', 'koşul tutmadı') : t('not for this', '不适用', 'buna değil')}</span>
                    </li>
                  );
                })}
              </ul>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
