import { useData, type Lang, type Profile } from './store';
import { castName, currentCharFor, LEVEL_OF } from './cast';

/** Every screen shows one language. Strings sit next to each other at the call site: t('Play', '开始', 'Oyna'). */
export const useLang = (): Lang => useData().lang;
export function useT() {
  const lang = useLang();
  return (en: string, zh: string, tr?: string) => (lang === 'zh' ? zh : lang === 'tr' ? tr ?? en : en);
}
export type Tri = { en: string; zh: string; tr?: string };
/** Picks the current language from a {en, zh, tr} record, falling back to English. */
export const pick = (o: Tri, lang: Lang) => (lang === 'zh' ? o.zh : lang === 'tr' ? o.tr ?? o.en : o.en);
export const locale = (lang: Lang) => (lang === 'zh' ? 'zh-CN' : lang === 'tr' ? 'tr-TR' : 'en-GB');

// Results are stored with English labels ("vs Expert AI · Renju"), so records stay readable
// whichever language they were played in. These terms translate them for display.
const TERMS_ZH: [RegExp, string][] = [
  [/unrated \(undo used\)/g, '不计分（用了悔棋）'],
  [/same device/g, '同机对战'],
  [/\bvs (.+?) AI\b/g, '对$1电脑'],
  [/\bvs\b/g, '对'],
  [/\bBeginner\b/g, '入门'], [/\bEasy\b/g, '简单'], [/\bMedium\b/g, '中等'], [/\bIntermediate\b/g, '中级'],
  [/\bAdvanced\b/g, '高级'], [/\bExpert\b/g, '专家'], [/\bHard\b/g, '困难'],
  [/\bFreestyle\b/g, '自由规则'], [/\bStandard\b/g, '标准规则'], [/\bRenju\b/g, '连珠规则'],
  [/\bdaily\b/g, '每日'], [/\bCustom\b/g, '自定义'], [/(\d+) mines\b/g, '$1颗雷'],
  [/(\d+) disks\b/g, '$1个盘'], [/(\d+) moves\b/g, '$1步'], [/(\d+) presses\b/g, '$1次'],
  [/\boptimal\b/g, '最少步数'], [/\bminimum\b/g, '最少次数'], [/\bwith hints\b/g, '用了提示'],
  [/\bGuest\b/g, '游客'], [/\bClassic\b/g, '经典'], [/(\d+) guesses\b/g, '$1次猜测'], [/(\d+) digits\b/g, '$1位数'], [/\bgave up\b/g, '放弃'],
];
const TERMS_TR: [RegExp, string][] = [
  [/unrated \(undo used\)/g, 'puansız (geri alındı)'],
  [/same device/g, 'aynı cihaz'],
  [/\bvs (.+?) AI\b/g, '$1 bilgisayara karşı'],
  [/\bvs\b/g, 'karşı'],
  [/\bBeginner\b/g, 'Acemi'], [/\bEasy\b/g, 'Kolay'], [/\bMedium\b/g, 'Orta'], [/\bIntermediate\b/g, 'Orta seviye'],
  [/\bAdvanced\b/g, 'İleri'], [/\bExpert\b/g, 'Uzman'], [/\bHard\b/g, 'Zor'],
  [/\bFreestyle\b/g, 'Serbest'], [/\bStandard\b/g, 'Standart'], [/\bRenju\b/g, 'Renju'],
  [/\bdaily\b/g, 'günlük'], [/\bCustom\b/g, 'Özel'], [/(\d+) mines\b/g, '$1 mayın'],
  [/(\d+) disks\b/g, '$1 disk'], [/(\d+) moves\b/g, '$1 hamle'], [/(\d+) presses\b/g, '$1 basış'],
  [/\boptimal\b/g, 'en az hamle'], [/\bminimum\b/g, 'en az'], [/\bwith hints\b/g, 'ipuçlu'],
  [/\bGuest\b/g, 'Misafir'], [/\bClassic\b/g, 'Klasik'], [/(\d+) guesses\b/g, '$1 tahmin'], [/(\d+) digits\b/g, '$1 basamak'], [/\bgave up\b/g, 'pes edildi'],
  [/\bpractice\b/gi, 'antrenman'], [/(\d+)-point match\b/g, '$1 sayılık maç'], [/(\d+) rounds\b/g, '$1 el'],
];
export function trLabel(s: string, lang: Lang): string {
  // Computer opponents are the coffeehouse regulars.
  // A label may end in " · @12": the regular who played that strength.
  const at = / · @(\d+)$/.exec(s), who = at ? +at[1] : null;
  if (at) s = s.slice(0, at.index);
  s = s.replace(/\bvs (Beginner|Easy|Intermediate|Advanced|Expert) AI\b/g, (_, l: string) => (lang === 'zh' ? '对' : lang === 'tr' ? '' : 'vs ') + castName(who ?? LEVEL_OF[l], lang) + (lang === 'tr' ? '’a karşı' : ''));
  if (lang === 'en') return s;
  let out = s;
  for (const [re, rep] of lang === 'zh' ? TERMS_ZH : TERMS_TR) out = out.replace(re, rep);
  return out;
}
/** "Expert AI" / "专家电脑" / "Uzman bilgisayar" */
export const aiLabel = (level: string, lang: Lang) => (level in LEVEL_OF ? castName(currentCharFor(LEVEL_OF[level]), lang)
  : lang === 'zh' ? `${trLabel(level, 'zh')}电脑` : lang === 'tr' ? `${trLabel(level, 'tr')} bilgisayar` : `${level} AI`);

/** The default guest profile is stored as "Guest"; show it in the current language. */
export const guestName = (lang: Lang) => (lang === 'zh' ? '游客' : lang === 'tr' ? 'Misafir' : 'Guest');
export const pname = (p: Pick<Profile, 'name' | 'guest'>, lang: Lang) => (p.guest && p.name === 'Guest' ? guestName(lang) : p.name);
