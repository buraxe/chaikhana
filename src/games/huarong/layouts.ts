/**
 * Starting layouts. "min" is the shortest solution found by breadth-first search (see
 * huarong.test.ts, which checks every value). The classic 横刀立马 is the traditional
 * opening position; the others come from a search over random solvable positions.
 */
export interface Layout { id: string; en: string; zh: string; tr: string; rows: string; min: number; level: 1 | 2 | 3 | 4 | 5 }
export const LAYOUTS: Layout[] = [
  { id: 'l12', en: 'First steps', zh: '初出茅庐', tr: 'İlk adımlar', rows: '<><> ^^CC vvCC ^s.s vss.', min: 12, level: 1 },
  { id: 'l15', en: 'Open road', zh: '一路通途', tr: 'Açık yol', rows: '<><> CCs^ CCsv ^^.. vvss', min: 15, level: 1 },
  { id: 'l30a', en: 'Side door', zh: '旁门左道', tr: 'Yan kapı', rows: '<>.^ CC^v CCvs .sss <><>', min: 30, level: 2 },
  { id: 'l30b', en: 'Crossed paths', zh: '纵横交错', tr: 'Kesişen yollar', rows: '^<>. v^CC svCC .<>^ sssv', min: 30, level: 2 },
  { id: 'l50a', en: 'Guarded pass', zh: '重兵把守', tr: 'Korunan geçit', rows: '^..s vCC^ sCCv ^ss^ v<>v', min: 50, level: 3 },
  { id: 'l50b', en: 'Scattered ranks', zh: '散兵游勇', tr: 'Dağınık saflar', rows: 'ss<> sCC^ ^CCv v.<> <>.s', min: 50, level: 3 },
  { id: 'l75', en: 'Four pillars', zh: '四柱擎天', tr: 'Dört sütun', rows: '^..s vCC^ sCCv ^^<> vvss', min: 75, level: 4 },
  { id: 'classic', en: 'Sword drawn, horse reined (classic)', zh: '横刀立马（经典）', tr: 'Kılıç çekili, at dizginli (klasik)', rows: '^CC^ vCCv ^<>^ vssv s..s', min: 81, level: 4 },
  { id: 'l109', en: 'Long march', zh: '长途跋涉', tr: 'Uzun yürüyüş', rows: '.s^^ CCvv CC.s s<>^ <>sv', min: 109, level: 5 },
  { id: 'l119', en: 'Walls within walls', zh: '层层设防', tr: 'Sur içinde sur', rows: 'CC.s CCss s.<> ^<>^ v<>v', min: 119, level: 5 },
  { id: 'l132', en: 'Deep encirclement', zh: '重重包围', tr: 'Derin kuşatma', rows: 'ss.s ^^CC vvCC ^.<> v<>s', min: 132, level: 5 },
];
