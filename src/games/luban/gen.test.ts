// Generates Lu Ban locks: GEN=1 npx vitest run src/games/luban/gen.test.ts
import { it } from 'vitest';
import { createRequire } from 'node:module';
import { mulberry32 } from '../../core/rng';
import { build, level, sharedCells, solve, startPos, moves } from './rules';
const require = createRequire(import.meta.url);
it.skipIf(!process.env.GEN)('generate locks', () => {
  const rng = mulberry32(Number(process.env.SEED ?? 7)); const shared = sharedCells(), found: Record<number, unknown[]> = {};
  const t0 = Date.now(), want = Number(process.env.WANT ?? 3);
  let tries = 0;
  while (Date.now() - t0 < Number(process.env.MS ?? 240000)) {
    tries++;
    const design = new Map<number, number>();
    // Most shared cubes go to someone; a few become holes.
    for (const { k, who } of shared) { const r = rng(); design.set(k, r < 0.12 ? -1 : who[Math.floor(rng() * who.length)]); }
    const pieces = build(design); if (!pieces) continue;
    // Not falling apart at once, and only one or two pieces may move at the start.
    const first = moves(pieces, startPos(6));
    // The classic lock: exactly one key piece slides straight out. Otherwise nothing leaves at once.
    const key = first.length === 1 && first[0].out;
    if (!key && (first.some(m => m.out) || first.length === 0 || first.length > 4)) continue;
    if (key && moves(pieces, [null, ...startPos(5)].map((o, i) => (i === first[0].i ? null : [0, 0, 0])) as never).some(m => m.out)) { /* after the key, another piece leaves at once: fine */ }
    const path = solve(pieces, startPos(6), 3, Number(process.env.STATES ?? 60000)); if (!path) continue;
    const lv = level(path);
    if (lv < Number(process.env.MINLV ?? 0)) continue;
    if ((found[lv]?.length ?? 0) >= want) continue;
    (found[lv] ??= []).push({ pieces, level: lv, moves: path.length });
    require('fs').writeFileSync(process.env.OUT ?? 'src/games/luban/locks.json', JSON.stringify(found));
  }
  require('fs').writeFileSync('/tmp/claude-0/-home-claude/c85ce621-c00a-5737-aedf-da9dfcf7a2cf/scratchpad/lb.txt', `tries ${tries} ` + Object.entries(found).map(([l, a]) => l + ':' + a.length).join(' '));
}, 900000);
