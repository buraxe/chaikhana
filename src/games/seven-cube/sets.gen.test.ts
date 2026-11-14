// Generates packing boxes and assembly figures: GEN=1 npx vitest run src/games/soma/sets.gen.test.ts
import { it } from 'vitest';
import { createRequire } from 'node:module';
import { mulberry32 } from '../../core/rng';
import { cut, shapeKey, solve, type Figure, type Piece, type V3 } from './rules';
const require = createRequire(import.meta.url);
const box = (w: number, h: number, d: number, at: V3 = [0, 0, 0]) => { const o: V3[] = []; for (let x = 0; x < w; x++) for (let y = 0; y < h; y++) for (let z = 0; z < d; z++) o.push([x + at[0], y + at[1], z + at[2]]); return o; };
type Spec = { id: string; name: [string, string, string]; cells: V3[]; min: number; max: number; tries: number; fixed?: Piece[] };

function best(spec: Spec, rng: () => number): Figure {
  if (spec.fixed) return { id: spec.id, name: spec.name, cells: spec.cells, pieces: spec.fixed, solutions: solve(spec.cells, new Map(), 500, spec.fixed).length };
  let pick: Figure | null = null, loose: Figure | null = null;
  for (let k = 0; k < spec.tries * 3 && !(pick && k >= spec.tries); k++) {
    const pieces = cut(spec.cells, spec.min, spec.max, rng);
    if (!pieces) continue;
    // Skip sets with two identical pieces (less interesting) and plain straight bars.
    const twins = new Set(pieces.map(p => shapeKey(p.cells))).size < pieces.length;
    const n = solve(spec.cells, new Map(), 300, pieces).length;
    if (!n) continue;
    if (twins) { if (!loose || n < loose.solutions!) loose = { id: spec.id, name: spec.name, cells: spec.cells, pieces, solutions: n }; continue; }
    if (!pick || n < pick.solutions!) pick = { id: spec.id, name: spec.name, cells: spec.cells, pieces, solutions: n };
    if (n <= 4) break;
  }
  if (!pick && !loose) throw new Error('no set for ' + spec.id);
  return (pick ?? loose)!;
}
it.skipIf(!process.env.GEN)('generate sets', () => {
  const rng = mulberry32(31);
  const slab: V3[] = [[0, 0, 0], [1, 0, 0], [0, 1, 0], [1, 1, 0]];
  const packing: Spec[] = [
    { id: 'sg', name: ['Slothouber–Graatsma', 'Slothouber–Graatsma 立方', 'Slothouber–Graatsma'], cells: box(3, 3, 3), min: 0, max: 0, tries: 0,
      fixed: [...Array(6)].map((_, k) => ({ id: 'S' + (k + 1), name: ['2×2 slab', '2×2 板', '2×2 levha'] as [string, string, string], cells: slab, color: [0xc0392b, 0x2471a3, 0x229954, 0xd68910, 0x7d3c98, 0x17a589][k] }))
        .concat([...Array(3)].map((_, k) => ({ id: 'C' + (k + 1), name: ['Single cube', '单块', 'Tek küp'] as [string, string, string], cells: [[0, 0, 0]] as V3[], color: 0xf2c14e }))) },
    { id: 'b234', name: ['Box 2×3×4', '2×3×4 盒子', '2×3×4 kutu'], cells: box(4, 2, 3), min: 4, max: 5, tries: 200 },
    { id: 'b333', name: ['Box 3×3×3', '3×3×3 盒子', '3×3×3 kutu'], cells: box(3, 3, 3), min: 4, max: 6, tries: 200 },
    { id: 'b244', name: ['Box 2×4×4', '2×4×4 盒子', '2×4×4 kutu'], cells: box(4, 2, 4), min: 4, max: 6, tries: 120 },
    { id: 'b334', name: ['Box 3×3×4', '3×3×4 盒子', '3×3×4 kutu'], cells: box(4, 3, 3), min: 5, max: 6, tries: 80 },
    { id: 'b344', name: ['Box 3×4×4', '3×4×4 盒子', '3×4×4 kutu'], cells: box(4, 3, 4), min: 5, max: 7, tries: 30 },
  ];
  const minus = (a: V3[], b: V3[]) => { const s = new Set(b.map(c => c.join())); return a.filter(c => !s.has(c.join())); };
  const ring = (n: number, y: number) => minus(box(n, 1, n, [0, y, 0]), box(n - 2, 1, n - 2, [1, y, 1]));
  const assembly: Spec[] = [
    { id: 'cross', name: ['Cross', '十字', 'Haç'], cells: [...box(1, 6, 1, [2, 0, 2]), ...minus(box(5, 1, 1, [0, 4, 2]), [[2, 4, 2]]), ...minus(box(1, 1, 5, [2, 4, 0]), [[2, 4, 2]])], min: 2, max: 4, tries: 200 },
    { id: 'chair', name: ['Chair', '椅子', 'Sandalye'], cells: [...box(3, 1, 3, [0, 2, 0]), ...box(1, 2, 1, [0, 0, 0]), ...box(1, 2, 1, [2, 0, 0]), ...box(1, 2, 1, [0, 0, 2]), ...box(1, 2, 1, [2, 0, 2]), ...box(3, 3, 1, [0, 3, 0])], min: 3, max: 5, tries: 200 },
    { id: 'bridge', name: ['Bridge', '石桥', 'Köprü'], cells: [...box(2, 2, 2, [0, 0, 0]), ...box(2, 2, 2, [4, 0, 0]), ...box(6, 1, 2, [0, 2, 0])], min: 4, max: 5, tries: 200 },
    { id: 'castle', name: ['Castle', '城堡', 'Kale'], cells: [...box(4, 1, 4), ...ring(4, 1), [0, 2, 0], [3, 2, 0], [0, 2, 3], [3, 2, 3]], min: 4, max: 5, tries: 120 },
    { id: 'ziggurat', name: ['Stepped pyramid', '阶梯金字塔', 'Basamaklı piramit'], cells: [...box(5, 1, 5), ...box(3, 1, 3, [1, 1, 1]), [2, 2, 2]], min: 4, max: 6, tries: 60 },
  ];
  const out = (specs: Spec[]) => specs.map(s => { const f = best(s, rng); return f; });
  const P = out(packing), A = out(assembly);
  require('fs').writeFileSync('src/games/packing/sets.json', JSON.stringify(P));
  require('fs').writeFileSync('src/games/assembly/sets.json', JSON.stringify(A));
  require('fs').writeFileSync('/tmp/claude-0/-home-claude/c85ce621-c00a-5737-aedf-da9dfcf7a2cf/scratchpad/sets.txt', [...P, ...A].map(f => `${f.id} cells ${f.cells.length} pieces ${f.pieces!.length} sols ${f.solutions}`).join('\n'));
}, 900000);
