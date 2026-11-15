/**
 * T-puzzle: four pieces cut from a capital T with 45° and square cuts (our own cut, not a
 * commercial one). The silhouettes were found by searching every way the four pieces meet
 * edge to edge on the lattice and keeping compact shapes that look like something, so every
 * one is solvable. Stored y-up like the tangram silhouettes.
 */
import type { Pt } from '../tangram/geometry';
import type { Silhouette } from '../tangram/silhouettes';

/** The pieces as they sit in the T (y down): trapezoid, square, notched hexagon, stem. */
export const T_PIECES: Record<string, Pt[]> = {
  A: [[0, 0], [3, 0], [1, 2], [0, 2]],
  B: [[4, 0], [6, 0], [6, 2], [4, 2]],
  C: [[3, 0], [4, 0], [4, 3], [2, 5], [2, 2], [1, 2]],
  D: [[4, 3], [4, 8], [2, 8], [2, 5]],
};
/* Grid units are scaled down on the table so the pieces sit at about tangram size. */
const scale = (p: Pt[]): Pt[] => p.map(([x, y]) => [x * 0.7, y * 0.7]);
export const STANDARD_T: Record<string, Pt[]> = Object.fromEntries(Object.entries(T_PIECES).map(([k, v]) => [k, scale(v)]));

const RAW: Silhouette[] = [
  { id: 't', en: 'T', zh: 'T字', tr: 'T', group: 'shape', polys: [[[0,0],[3,0],[1,-2],[0,-2]],[[4,0],[6,0],[6,-2],[4,-2]],[[3,0],[4,0],[4,-3],[2,-5],[2,-2],[1,-2]],[[4,-3],[4,-8],[2,-8],[2,-5]]]},
  { id: 'teapot', en: 'Teapot', zh: '茶壶', tr: 'Çaydanlık', group: 'shape', polys: [[[0,0],[3,0],[1,-2],[0,-2]],[[0,2],[2,2],[2,0],[0,0]],[[3,0],[2,0],[2,3],[4,5],[4,2],[5,2]],[[0,-3],[0,2],[-2,2],[-2,-1]]]},
  { id: 'boat', en: 'Sailboat', zh: '帆船', tr: 'Yelkenli', group: 'shape', polys: [[[0,0],[3,0],[1,-2],[0,-2]],[[-2,0],[0,0],[0,-2],[-2,-2]],[[-3,-2],[-2,-2],[-2,1],[-4,3],[-4,0],[-5,0]],[[3,0],[-2,0],[-2,2],[1,2]]]},
  { id: 'tick', en: 'Tick', zh: '对勾', tr: 'Onay işareti', group: 'shape', polys: [[[0,0],[3,0],[1,-2],[0,-2]],[[0,2],[2,2],[2,0],[0,0]],[[-1,-4],[-2,-4],[-2,-1],[0,1],[0,-2],[1,-2]],[[-4,1],[-4,-4],[-2,-4],[-2,-1]]]},
  { id: 'arrowhead', en: 'Arrowhead', zh: '箭头', tr: 'Ok ucu', group: 'shape', polys: [[[0,0],[3,0],[1,-2],[0,-2]],[[-2,0],[0,0],[0,-2],[-2,-2]],[[-2,-3],[-2,-2],[1,-2],[3,-4],[0,-4],[0,-5]],[[-2,0],[3,0],[3,2],[0,2]]]},
  { id: 'bird', en: 'Bird', zh: '飞鸟', tr: 'Kuş', group: 'shape', polys: [[[0,0],[3,0],[1,-2],[0,-2]],[[0,2],[2,2],[2,0],[0,0]],[[-2,3],[-2,4],[1,4],[3,2],[0,2],[0,1]],[[7,2],[2,2],[2,0],[5,0]]]},
  { id: 'cup', en: 'Cup', zh: '杯子', tr: 'Fincan', group: 'shape', polys: [[[0,0],[3,0],[1,-2],[0,-2]],[[0,2],[2,2],[2,0],[0,0]],[[-1,4],[-2,4],[-2,1],[0,-1],[0,2],[1,2]],[[4,5],[4,0],[2,0],[2,3]]]},
  { id: 'crown', en: 'Crown', zh: '王冠', tr: 'Taç', group: 'shape', polys: [[[0,0],[3,0],[1,-2],[0,-2]],[[0,2],[2,2],[2,0],[0,0]],[[3,0],[2,0],[2,3],[4,5],[4,2],[5,2]],[[0,-2],[0,3],[-2,3],[-2,0]]]},
  { id: 'boot', en: 'Boot', zh: '靴子', tr: 'Çizme', group: 'shape', polys: [[[0,0],[3,0],[1,-2],[0,-2]],[[0,2],[2,2],[2,0],[0,0]],[[-3,4],[-4,4],[-4,1],[-2,-1],[-2,2],[-1,2]],[[0,-3],[0,2],[-2,2],[-2,-1]]]},
  { id: 'mitten', en: 'Mitten', zh: '手套', tr: 'Eldiven', group: 'shape', polys: [[[0,0],[3,0],[1,-2],[0,-2]],[[0,2],[2,2],[2,0],[0,0]],[[-1,-4],[-2,-4],[-2,-1],[0,1],[0,-2],[1,-2]],[[-2,-4],[-2,1],[-4,1],[-4,-2]]]},
  { id: 'fish', en: 'Fish', zh: '鱼', tr: 'Balık', group: 'shape', polys: [[[0,0],[3,0],[1,-2],[0,-2]],[[-2,0],[0,0],[0,-2],[-2,-2]],[[-3,-4],[-4,-4],[-4,-1],[-2,1],[-2,-2],[-1,-2]],[[3,0],[-2,0],[-2,2],[1,2]]]},
  { id: 'wing', en: 'Wing', zh: '翅膀', tr: 'Kanat', group: 'shape', polys: [[[0,0],[3,0],[1,-2],[0,-2]],[[0,2],[2,2],[2,0],[0,0]],[[-1,-4],[-2,-4],[-2,-1],[0,1],[0,-2],[1,-2]],[[7,0],[2,0],[2,2],[5,2]]]},
];
export const T_SILHOUETTES: Silhouette[] = RAW.map(s => ({ ...s, polys: s.polys.map(scale) }));
