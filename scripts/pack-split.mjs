// Turns dist-split/index.html into the artifact page (dist-split/chaikhana.html) and writes the
// list of supporting files, so publishing sends the page plus every file it loads.
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
const root = 'dist-split', html = readFileSync(join(root, 'index.html'), 'utf8');
const js = /<script type="module" crossorigin src="\.\/([^"]+)"><\/script>/.exec(html)?.[1];
const css = [...html.matchAll(/<link rel="stylesheet" crossorigin href="\.\/([^"]+)">/g)].map(m => m[1]);
if (!js) throw new Error('entry script not found');
const out = `<meta name="claude:viewport-fit-sides" content="cover">
<title>Chaikhana</title>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,500;0,700;0,800;0,900;1,500&amp;family=Source+Serif+4:ital,wght@0,400;0,600;1,400;1,500&amp;family=Instrument+Sans:wght@400;500;600&amp;family=Noto+Serif+SC:wght@500;700&amp;display=swap">
${css.map(c => `<link rel="stylesheet" href="${c}">`).join('\n')}
<script>/* The page's own stylesheets go to <head>, ahead of the per-game ones the app adds there later. */document.head.append(...document.querySelectorAll('body > link[rel=stylesheet]'))</script>
<div id="root"></div>
<script type="module" src="${js}"></script>
`;
writeFileSync(join(root, 'chaikhana.html'), out);
const files = readdirSync(join(root, 'app'), { recursive: true }).map(f => 'app/' + f).filter(f => statSync(join(root, f)).isFile()).sort();
const total = files.reduce((a, f) => a + statSync(join(root, f)).size, 0);
writeFileSync(join(root, 'files.json'), JSON.stringify(files, null, 1));
// The publish map: every current file, plus null for each file the last publish sent that is
// gone now (file names carry a content hash, so a changed file arrives under a new name).
let last = []; try { last = JSON.parse(readFileSync('scripts/published.json', 'utf8')); } catch {}
const map = Object.fromEntries(files.map(f => [f, `${process.cwd()}/${root}/${f}`]));
for (const f of last) if (!(f in map)) map[f] = null;
writeFileSync(join(root, 'publish-map.json'), JSON.stringify(map));
const gone = last.filter(f => !files.includes(f)).length, fresh = files.filter(f => !last.includes(f)).length;
console.log(`publish: ${fresh} new or changed, ${files.length - fresh} unchanged, ${gone} to remove (copy files.json to scripts/published.json after publishing)`);
console.log(`chaikhana.html + ${files.length} files, ${(total / 1024).toFixed(0)} KB in all; entry ${js}`);
