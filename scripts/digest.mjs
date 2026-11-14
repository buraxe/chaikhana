// Writes the small summaries the home page needs (game names and one-paragraph standfirsts,
// tangram and huarong level names) to src/core/digest.json, so the full lessons can live in
// each game's own file and load only when someone opens that game or its lesson.
// Runs before every build.
import { runnerImport } from 'vite';
import { writeFileSync, readFileSync } from 'node:fs';
// The id → file map is read from lessons.ts, so a game's lesson is listed in one place only.
const map = [...readFileSync('src/core/lessons.ts', 'utf8').matchAll(/^\s+"?([\w-]+)"?: \(\) => import\('\.\.\/games\/([\w-]+)\/learn'\)/gm)];
const { module: tg } = await runnerImport('./src/games/tangram/silhouettes.ts');
const { module: hr } = await runnerImport('./src/games/huarong/layouts.ts');
const { module: { sentences } } = await runnerImport('./src/core/text.ts');
const brief = (t, lang) => ({ s: t.summary, h: sentences(t.history, 1, lang) });
const lessons = {};
for (const [, id, dir] of map) {
  const { module: { lesson: l } } = await runnerImport(`./src/games/${dir}/learn.ts`);
  lessons[id] = { names: l.names, en: brief(l.en, 'en'), zh: brief(l.zh, 'zh'), ...(l.tr ? { tr: brief(l.tr, 'tr') } : {}) };
}
const names = xs => Object.fromEntries(xs.map(x => [x.id, { en: x.en, zh: x.zh, tr: x.tr }]));
const digest = { lessons, tangram: names(tg.SILHOUETTES), huarong: names(hr.LAYOUTS) };
const out = JSON.stringify(digest, null, 1) + '\n';
const path = 'src/core/digest.json';
let old = ''; try { old = readFileSync(path, 'utf8'); } catch {}
if (old !== out) writeFileSync(path, out);
console.log(`digest: ${Object.keys(lessons).length} lessons, ${(out.length / 1024).toFixed(0)} KB`);
