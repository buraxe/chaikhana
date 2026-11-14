import type { Lesson } from '../../core/learn';
export const lesson: Lesson = {
  names: { en: 'Hashi (Bridges)', tr: 'Hashi (Köprüler)', zh: '数桥' },
  en: {
    summary: 'Connect the islands with bridges so each has exactly as many as its number.',
    history: 'Hashiwokakero, “build bridges”, was published by the Japanese puzzle company Nikoli in 1990, the same house that made Sudoku famous. It is known in the West as Bridges or Chopsticks.',
    rules: ['Bridges run straight, horizontally or vertically, between two islands.', 'Each island needs exactly the number of bridges written on it.', 'There can be one or two bridges between two islands, never more.', 'Bridges may not cross islands or other bridges.', 'When finished, all islands must be connected into one group.'],
    basics: ['An island with 8 has two bridges in every direction; a corner island with 4 has two to each neighbour.', 'An island with only one neighbour sends all its bridges there.', 'Big numbers with few neighbours are the best place to start.'],
    advanced: ['Watch connectivity: two small islands joined by a double bridge can cut themselves off from the rest.', 'When a bridge would cross a needed one, it cannot be there.'],
    mistakes: ['Closing off a small group of islands with all their numbers satisfied.', 'Forgetting that bridges may not cross.'],
  },
  zh: {
    summary: '用桥把岛连起来，让每个岛的桥数正好等于它的数字。',
    history: '“架桥”（Hashiwokakero）由日本谜题公司Nikoli于1990年发表，正是让数独闻名的那家公司。西方称之为Bridges或Chopsticks。',
    rules: ['桥是直的，横向或纵向连接两个岛。', '每个岛的桥数必须等于上面的数字。', '两岛之间可以有一座或两座桥，不能更多。', '桥不能穿过岛，也不能和其他桥交叉。', '完成时所有岛必须连成一个整体。'],
    basics: ['数字8的岛四个方向都有两座桥；角上的4号岛对两个邻居各两座。', '只有一个邻居的岛，所有桥都通向它。', '数字大、邻居少的岛最适合入手。'],
    advanced: ['注意连通性：两个小岛用双桥相连可能会把自己和其他岛隔开。', '如果某座桥会挡住必须的桥，它就不能存在。'],
    mistakes: ['把一小群数字都满足的岛封闭起来。', '忘了桥不能交叉。'],
  },
  tr: {
    summary: 'Adaları köprülerle bağla; her adanın tam sayısı kadar köprüsü olsun.',
    history: 'Hashiwokakero, yani “köprü kur”, 1990’da Sudoku’yu ünlü yapan Japon bulmaca şirketi Nikoli tarafından yayımlandı. Batı’da Bridges ya da Chopsticks adıyla bilinir.',
    rules: ['Köprüler iki ada arasında düz gider, yatay ya da dikey.', 'Her adanın üstündeki sayı kadar köprüsü olmalıdır.', 'İki ada arasında bir ya da iki köprü olabilir, daha fazla olmaz.', 'Köprüler adaların ya da başka köprülerin üstünden geçemez.', 'Bitince bütün adalar tek bir grup olarak birbirine bağlı olmalıdır.'],
    basics: ['8 yazan adanın her yönde iki köprüsü vardır; köşedeki 4’lük adanın iki komşusuna ikişer köprüsü vardır.', 'Tek komşusu olan ada bütün köprülerini ona gönderir.', 'Büyük sayılı ve az komşulu adalar başlamak için en iyi yerdir.'],
    advanced: ['Bağlantıya dikkat: çift köprüyle bağlanan iki küçük ada kendini diğerlerinden koparabilir.', 'Bir köprü gerekli bir köprüyü kesecekse orada olamaz.'],
    mistakes: ['Sayıları tamamlanmış küçük bir ada grubunu kapalı bırakmak.', 'Köprülerin kesişemeyeceğini unutmak.'],
  },
};
