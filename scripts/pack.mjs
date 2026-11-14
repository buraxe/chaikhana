// Turns dist/index.html into a body-only page (dist/chaikhana.html) for hosts that
// supply their own document skeleton.
import { readFileSync, writeFileSync } from 'node:fs';
const html = readFileSync('dist/index.html', 'utf8');
// The bundle itself may contain "<style" (Sì Fēng's page travels as a string), so find the
// real tags in order: the script first, its first closing tag, then the stylesheet after it.
const cut = (open, close, from = 0, last = false) => {
  const a = html.indexOf(open, from); if (a < 0) throw new Error('missing ' + open);
  const b = html.indexOf('>', a) + 1; const c = last ? html.lastIndexOf(close) : html.indexOf(close, b);
  return { text: html.slice(b, c), end: c + close.length };
};
const s1 = cut('<script', '</script>');
const js = s1.text;
const css = cut('<style', '</style>', s1.end, true).text;
if (js.includes('</script')) throw new Error('bundle contains a closing script tag');
const out = `<meta name="claude:viewport-fit-sides" content="cover">
<title>Chaikhana</title>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,500;0,700;0,800;0,900;1,500&amp;family=Source+Serif+4:ital,wght@0,400;0,600;1,400;1,500&amp;family=Instrument+Sans:wght@400;500;600&amp;family=Noto+Serif+SC:wght@500;700&amp;display=swap">
<style>${css}</style>
<div id="root"></div>
<script type="module">${js}</script>
`;
writeFileSync('dist/chaikhana.html', out);
console.log('chaikhana.html', (out.length / 1024).toFixed(0) + ' KB');
