import type { Lang } from './store';

/** The first `n` sentences of a text, in either script. */
export function sentences(s: string, n: number, lang: Lang) {
  const parts = lang === 'zh' ? s.split(/(?<=。)/) : s.split(/(?<=[.!?])\s+(?=[A-ZÇĞİÖŞÜ"“(])/);
  return parts.slice(0, n).join(lang === 'zh' ? '' : ' ');
}
