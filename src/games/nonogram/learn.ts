import type { Lesson } from '../../core/learn';
export const lesson: Lesson = {
  names: { en: 'Nonograms', tr: 'Nonogram', zh: '数织', pinyin: 'shùzhī' },
  en: {
    summary: 'Use the numbers beside each row and column to work out which cells are filled. The finished grid is a picture.',
    history: 'Nonograms were invented independently in 1987 by Non Ishida, a Japanese graphic designer, and Tetsuya Nishio. They became popular in British newspapers in the early 1990s, where the name nonogram was coined, and are also known as picross, griddlers and paint by numbers.',
    rules: ['Each number is a run of consecutive filled cells in that row or column, in order.', 'Runs are separated by at least one empty cell.', 'Fill cells, and mark cells you know are empty. The puzzle is solved when every line matches its numbers.', 'The puzzles here are generated at random and checked so that they can be solved by logic alone, with one answer.'],
    basics: ['Overlap: if a run is longer than half its free space, the middle cells must be filled. A 7 in a 10-cell row fills cells 4 to 7.', 'A line with a 0 is entirely empty. A line whose numbers plus gaps add up to its length is completely determined.', 'After every deduction, look at the crossing lines: each new cell changes what is possible there.'],
    advanced: ['Near an edge, a filled cell close to the border pushes the first run: fill from it as far as the run must reach.', 'When a run is complete, mark the cells on both sides of it as empty.', 'Compare the earliest and latest positions of each run; cells covered by both are filled.'],
    mistakes: ['Guessing instead of marking empties. The crosses carry as much information as the filled cells.'],
  },
  zh: {
    summary: '根据每行每列旁边的数字，推理出哪些格子要涂黑。完成后会得到一幅图案。',
    history: '数织在1987年分别由日本平面设计师石田伸和西尾彻也独立发明。1990年代初它在英国报纸上流行起来，nonogram 这个名字就是在那时起的，它也叫 picross、填色谜题等。',
    rules: ['每个数字代表这一行或一列中一段连续涂黑的格子，按顺序排列。', '相邻两段之间至少隔一个空格。', '涂黑格子，并把确定为空的格子打叉。所有行列都符合提示时即完成。', '这里的题目是随机生成的，并经过检查，保证只靠推理就能解出且答案唯一。'],
    basics: ['重叠法：如果一段的长度超过可用空间的一半，中间的格子一定是黑的。10格的一行里有7，就能确定第4到第7格。', '提示为0的行完全是空的；数字加上间隔正好等于长度的行可以直接填满。', '每推出一格，就去看与它交叉的那条线，新格子会改变那里的可能性。'],
    advanced: ['靠近边缘的黑格会限制第一段的位置：从它开始，涂到这一段必须达到的地方。', '一段完成后，在它两边打叉。', '比较每一段最靠前和最靠后的位置，两者都覆盖的格子一定是黑的。'],
    mistakes: ['不打叉而去猜。叉和黑格提供的信息一样多。'],
  },
  tr: {
    summary: 'Her satırın ve sütunun yanındaki sayılardan hangi karelerin dolu olduğunu bul. Tamamlanan ızgara bir resimdir.',
    history: 'Nonogramlar 1987’de Japon grafik tasarımcı Non Ishida ve Tetsuya Nishio tarafından birbirinden bağımsız olarak icat edildi. 1990’ların başında nonogram adının da konduğu İngiliz gazetelerinde sevildi; picross, griddler ve sayılarla boyama adlarıyla da bilinir.',
    rules: ['Her sayı, o satır ya da sütunda sırayla gelen ardışık dolu karelerden oluşan bir bloktur.', 'Bloklar arasında en az bir boş kare bulunur.', 'Kareleri doldur, boş olduğunu bildiklerini işaretle. Her çizgi sayılarına uyduğunda bulmaca çözülür.', 'Buradaki bulmacalar rastgele üretilir ve tek cevaplı, yalnızca mantıkla çözülebilir oldukları kontrol edilir.'],
    basics: ['Örtüşme: bir blok boş alanının yarısından uzunsa ortadaki kareler dolu olmalıdır. 10 karelik bir satırdaki 7, 4 ile 7 arasındaki kareleri doldurur.', '0 olan bir çizgi tamamen boştur. Sayıları ve aralarındaki boşluklar uzunluğuna eşit olan bir çizgi kesin olarak bellidir.', 'Her çıkarımdan sonra kesişen çizgilere bak: her yeni kare oradaki olasılıkları değiştirir.'],
    advanced: ['Kenara yakın dolu bir kare ilk bloğu iter: bloğun mutlaka uzanacağı yere kadar ondan itibaren doldur.', 'Bir blok tamamlanınca iki yanındaki kareleri boş işaretle.', 'Her bloğun en erken ve en geç konumlarını karşılaştır; ikisinin de kapladığı kareler doludur.'],
    mistakes: ['Boşları işaretlemek yerine tahmin etmek. Çarpılar dolu kareler kadar bilgi taşır.'],
  },
};
