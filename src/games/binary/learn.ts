import type { Lesson } from '../../core/learn';
export const lesson: Lesson = {
  names: { en: 'Binary Puzzle (Takuzu)', zh: '二进制数独', tr: 'İkili Bulmaca (Takuzu)', pinyin: 'Èrjìnzhì shùdú', trad: '二進制數獨' },
  en: {
    summary: 'Fill the grid with 0s and 1s: never three alike in a line, as many 0s as 1s in every row and column, and no two rows or columns the same.',
    history: 'The puzzle was published as Tohu-Wa-Vohu in Italy and as Takuzu in France, and became popular in Dutch and Belgian newspapers as Binairo around 2009. Its three rules are easy to learn, but large grids need long chains of reasoning.',
    rules: ['Each square holds a 0 or a 1.', 'No more than two of the same digit may sit next to each other in a row or column.', 'Every row and every column has as many 0s as 1s.', 'No two rows are the same, and no two columns are the same.', 'Every puzzle has one solution, reachable by logic alone.'],
    basics: ['Two alike side by side: the squares at both ends must hold the other digit (00 → 1001).', 'Two alike with a gap: the gap takes the other digit (0_0 → 010).', 'When a row already has half its 0s, the rest are 1s.'],
    advanced: ['Near the end of a row, try each way of placing the last few digits; the ones that make three in a line are out.', 'Compare an almost-full row with a full one: if filling it one way would copy the full row, it must go the other way.'],
    mistakes: ['Counting only in rows: the columns have the same rule.', 'Forgetting the no-identical-lines rule until the very end.'],
  },
  zh: {
    summary: '在方格中填入0和1：同一行（列）不能有三个相同的连在一起，每行每列0和1一样多，任意两行或两列不能完全相同。',
    history: '这种谜题在意大利以Tohu-Wa-Vohu之名出版，在法国叫Takuzu，2009年前后以Binairo之名在荷兰和比利时的报纸上流行开来。三条规则很好学，但大棋盘需要很长的推理链。',
    rules: ['每格填0或1。', '同一行或同一列中，相同的数字最多只能两个相邻。', '每行、每列中0和1的数量相等。', '任意两行不能相同，任意两列也不能相同。', '每道题只有唯一解，全靠逻辑即可推出。'],
    basics: ['两个相同的相邻：两端必须填另一个数字（00 → 1001）。', '两个相同中间隔一格：中间填另一个数字（0_0 → 010）。', '一行的0已经够一半时，其余都是1。'],
    advanced: ['在一行快填满时，试遍最后几格的填法，凡是造成三个相连的都排除。', '把快填满的一行和已经填满的一行比较：如果某种填法会和它完全相同，就只能填另一种。'],
    mistakes: ['只数行不数列：列也有同样的规则。', '直到最后才想起“不能有相同的行”这条规则。'],
  },
  tr: {
    summary: 'Izgarayı 0 ve 1’lerle doldur: bir hatta asla üç aynı yan yana gelmez, her satır ve sütunda 0 ile 1 sayısı eşittir, hiçbir iki satır ya da sütun aynı olamaz.',
    history: 'Bulmaca İtalya’da Tohu-Wa-Vohu, Fransa’da Takuzu adıyla yayımlandı; 2009 civarında Binairo adıyla Hollanda ve Belçika gazetelerinde sevildi. Üç kuralı kolay öğrenilir ama büyük ızgaralar uzun akıl yürütme zincirleri ister.',
    rules: ['Her karede 0 ya da 1 bulunur.', 'Bir satır ya da sütunda aynı rakamdan en fazla ikisi yan yana durabilir.', 'Her satır ve her sütunda 0 ile 1 sayısı eşittir.', 'Hiçbir iki satır aynı olamaz, hiçbir iki sütun da.', 'Her bulmacanın tek çözümü vardır ve yalnızca mantıkla bulunur.'],
    basics: ['Yan yana iki aynı: iki ucundaki kareler diğer rakamı alır (00 → 1001).', 'Arada boşlukla iki aynı: boşluk diğer rakamı alır (0_0 → 010).', 'Bir satırın 0’ları yarıya ulaştıysa geri kalanı 1’dir.'],
    advanced: ['Satırın sonuna doğru son birkaç rakamın her dizilişini dene; üç yan yana yapanlar elenir.', 'Neredeyse dolu bir satırı dolu bir satırla karşılaştır: bir şekilde doldurmak onun aynısını yapacaksa öbür şekilde olmalı.'],
    mistakes: ['Yalnızca satırlarda saymak: sütunlarda da aynı kural var.', 'Aynı hat olmaz kuralını en sona kadar unutmak.'],
  },
};
