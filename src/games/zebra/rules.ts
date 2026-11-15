/**
 * Zebra puzzle (logic grid): n houses in a row, k categories, each value used once. A hidden
 * solution is drawn at random; clues true of it are added until exactly one solution fits,
 * then every clue that is not needed is taken out again, so the puzzle is unique and lean.
 */
export type Cat = 'color' | 'drink' | 'pet' | 'game' | 'name' | 'snack';
export type L3 = [en: string, zh: string, tr: string];
export const CATS: Record<Cat, { label: L3; values: L3[] }> = {
  color: { label: ['Colour', '颜色', 'Renk'], values: [['red', '红色', 'kırmızı'], ['green', '绿色', 'yeşil'], ['blue', '蓝色', 'mavi'], ['yellow', '黄色', 'sarı'], ['white', '白色', 'beyaz']] },
  drink: { label: ['Drink', '饮品', 'İçecek'], values: [['tea', '茶', 'çay'], ['coffee', '咖啡', 'kahve'], ['ayran', '酸奶饮', 'ayran'], ['sherbet', '果子露', 'şerbet'], ['water', '水', 'su']] },
  pet: { label: ['Pet', '宠物', 'Hayvan'], values: [['cat', '猫', 'kedi'], ['dog', '狗', 'köpek'], ['bird', '鸟', 'kuş'], ['fish', '鱼', 'balık'], ['rabbit', '兔子', 'tavşan']] },
  game: { label: ['Game', '游戏', 'Oyun'], values: [['chess', '国际象棋', 'satranç'], ['backgammon', '双陆棋', 'tavla'], ['go', '围棋', 'go'], ['dominoes', '多米诺', 'domino'], ['okey', '奥凯', 'okey']] },
  name: { label: ['Name', '名字', 'İsim'], values: [['Ali', '阿里', 'Ali'], ['Mei', '小梅', 'Mei'], ['Elif', '艾莉芙', 'Elif'], ['Wei', '小伟', 'Wei'], ['Kerem', '凯莱姆', 'Kerem']] },
  snack: { label: ['Snack', '点心', 'Atıştırmalık'], values: [['simit', '芝麻圈', 'simit'], ['dumplings', '饺子', 'mantı'], ['baklava', '果仁蜜饼', 'baklava'], ['mooncake', '月饼', 'ay keki'], ['börek', '千层酥饼', 'börek']] },
};
export const CAT_ORDER: Cat[] = ['name', 'color', 'drink', 'pet', 'game', 'snack'];

/** A value: category index (into the puzzle's cats) and value index. */
export type V = [c: number, v: number];
export type Clue =
  | { k: 'at'; a: V; house: number }      // a lives in house `house`
  | { k: 'same'; a: V; b: V }             // a and b are in the same house
  | { k: 'not'; a: V; b: V }              // a and b are in different houses
  | { k: 'left'; a: V; b: V }             // a is directly left of b
  | { k: 'next'; a: V; b: V }             // a is next to b
  | { k: 'before'; a: V; b: V };          // a is somewhere left of b

/** sol[c][v] = house of value v in category c. */
export type Sol = number[][];
export interface ZPuzzle { n: number; cats: Cat[]; clues: Clue[]; sol: Sol }

const shuffle = <T,>(a: T[], rnd: () => number) => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
function perms(n: number): number[][] {
  if (n === 1) return [[0]];
  const out: number[][] = [];
  for (const p of perms(n - 1)) for (let i = 0; i <= p.length; i++) out.push([...p.slice(0, i), n - 1, ...p.slice(i)]);
  return out;
}
const PERMS: Record<number, number[][]> = {};
const permsOf = (n: number) => (PERMS[n] ??= perms(n));

/** Is the clue true, given houses for the categories assigned so far? undefined when it cannot be told yet. */
export function check(c: Clue, s: (number[] | undefined)[]): boolean | undefined {
  const h = (x: V) => s[x[0]]?.[x[1]];
  if (c.k === 'at') { const a = h(c.a); return a === undefined ? undefined : a === c.house; }
  const a = h(c.a), b = h(c.b);
  if (a === undefined || b === undefined) return undefined;
  switch (c.k) {
    case 'same': return a === b;
    case 'not': return a !== b;
    case 'left': return a + 1 === b;
    case 'next': return Math.abs(a - b) === 1;
    case 'before': return a < b;
  }
}

/** Counts solutions up to `cap` by trying every arrangement of one category at a time. */
export function countSolutions(n: number, k: number, clues: Clue[], cap = 2): number {
  const s: (number[] | undefined)[] = Array(k).fill(undefined);
  // Clues are checked as soon as every category they mention is placed.
  const due: Clue[][] = Array.from({ length: k }, () => []);
  for (const c of clues) { const cs = c.k === 'at' ? [c.a[0]] : [c.a[0], c.b[0]]; due[Math.max(...cs)].push(c); }
  let found = 0;
  const rec = (ci: number) => {
    if (ci === k) { found++; return; }
    for (const p of permsOf(n)) {
      s[ci] = p;
      if (due[ci].every(c => check(c, s))) rec(ci + 1);
      if (found >= cap) break;
    }
    s[ci] = undefined;
  };
  rec(0);
  return found;
}

function randomClue(sol: Sol, n: number, k: number, rnd: () => number): Clue {
  const pickV = (): V => [Math.floor(rnd() * k), Math.floor(rnd() * n)];
  const houseOf = (x: V) => sol[x[0]][x[1]];
  const at = (house: number, c: number): V => [c, sol[c].indexOf(house)];
  const r = rnd();
  const a = pickV();
  let c2 = Math.floor(rnd() * k);
  if (k > 1) while (c2 === a[0]) c2 = Math.floor(rnd() * k);
  const ha = houseOf(a);
  if (r < 0.1) return { k: 'at', a, house: ha };
  if (r < 0.4) return { k: 'same', a, b: at(ha, c2) };
  if (r < 0.55 && ha + 1 < n) return { k: 'left', a, b: at(ha + 1, c2) };
  if (r < 0.72) { const hs = [ha - 1, ha + 1].filter(x => x >= 0 && x < n); return { k: 'next', a, b: at(hs[Math.floor(rnd() * hs.length)], c2) }; }
  if (r < 0.86 && ha + 1 < n) return { k: 'before', a, b: at(ha + 1 + Math.floor(rnd() * (n - ha - 1)), c2) };
  let hb = Math.floor(rnd() * n); while (hb === ha) hb = Math.floor(rnd() * n);
  return { k: 'not', a, b: at(hb, c2) };
}

export function generate(n: number, k: number, rnd: () => number = Math.random): ZPuzzle {
  const cats = shuffle(CAT_ORDER.slice(1), rnd).slice(0, k - 1);
  cats.unshift('name');
  const sol: Sol = cats.map(() => shuffle([...Array(n).keys()], rnd));
  const clues: Clue[] = [];
  const key = (c: Clue) => JSON.stringify(c);
  const seen = new Set<string>();
  // Add clues until there is exactly one answer.
  while (countSolutions(n, k, clues) > 1) {
    const c = randomClue(sol, n, k, rnd);
    if (seen.has(key(c))) continue;
    seen.add(key(c)); clues.push(c);
  }
  // Then remove any clue the answer does not need, trying the most direct ones first.
  const order = shuffle([...clues.keys()], rnd).sort((x, y) => Number(clues[y].k === 'at') - Number(clues[x].k === 'at') || Number(clues[y].k === 'same') - Number(clues[x].k === 'same'));
  const keep = new Set(clues.keys());
  for (const i of order) {
    keep.delete(i);
    if (countSolutions(n, k, clues.filter((_, j) => keep.has(j))) !== 1) keep.add(i);
  }
  return { n, cats, clues: clues.filter((_, j) => keep.has(j)), sol };
}

/** The clue written out in one language. Values are bold-marked with ** so the screen can style them. */
export function clueText(p: ZPuzzle, c: Clue, li: 0 | 1 | 2): string {
  const v = (x: V) => '**' + CATS[p.cats[x[0]]].values[x[1]][li] + '**';
  const ord = (h: number) => [['first', '第一', 'birinci'], ['second', '第二', 'ikinci'], ['third', '第三', 'üçüncü'], ['fourth', '第四', 'dördüncü'], ['fifth', '第五', 'beşinci']][h][li];
  const who = (x: V) => {
    const cat = p.cats[x[0]], w = v(x);
    if (cat === 'name') return w;
    const pre: Record<Cat, L3> = {
      name: ['', '', ''], color: ['the person in the ' + w + ' house', '住' + w + '房子的人', w + ' evde oturan'],
      drink: ['the ' + w + ' drinker', '喝' + w + '的人', w + ' içen'], pet: ['the ' + w + ' owner', '养' + w + '的人', w + ' besleyen'],
      game: ['the ' + w + ' player', '下' + w + '的人', w + ' oynayan'], snack: ['the one who eats ' + w, '吃' + w + '的人', w + ' yiyen'],
    };
    return pre[cat][li];
  };
  const cap = (s: string) => s.replace(/^(\**)(\S)/, (_, m: string, ch: string) => m + ch.toLocaleUpperCase(['en', 'zh', 'tr'][li]));
  const A = who(c.a), B = c.k === 'at' ? '' : who(c.b);
  // Turkish: a noun phrase ending in "kişi" (or a bare name) and sentence shapes that need no case endings.
  const tr = (x: V) => (p.cats[x[0]] === 'name' ? v(x) : who(x) + ' kişi');
  const TA = tr(c.a), TB = c.k === 'at' ? '' : tr(c.b);
  switch (c.k) {
    case 'at': return [cap(`${A} lives in the ${ord(c.house)} house.`), `${A}住在${ord(c.house)}座房子。`, cap(`${TA} ${ord(c.house)} evde oturur.`)][li];
    case 'same': return [cap(`${A} is ${B}.`), `${A}就是${B}。`, cap(`${TA} ile ${TB} aynı kişidir.`)][li];
    case 'not': return [cap(`${A} is not ${B}.`), `${A}不是${B}。`, cap(`${TA} ile ${TB} farklı kişilerdir.`)][li];
    case 'left': return [cap(`${A} lives directly left of ${B}.`), `${A}住在${B}的紧左边。`, cap(`Soldan sağa ${TA}, hemen ardından ${TB} gelir.`)][li];
    case 'next': return [cap(`${A} lives next to ${B}.`), `${A}和${B}是邻居。`, cap(`${TA} ile ${TB} komşudur.`)][li];
    case 'before': return [cap(`${A} lives somewhere left of ${B}.`), `${A}住在${B}左边的某处。`, cap(`Soldan sağa önce ${TA} gelir; ${TB} daha sağdadır.`)][li];
  }
}
