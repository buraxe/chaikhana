import type { Lesson } from '../../core/learn';
export const lesson: Lesson = {
  names: { en: 'Sudoku', tr: 'Sudoku', zh: '数独', trad: '數獨', pinyin: 'shùdú' },
  en: {
    summary: 'Fill the grid so every row, column and box holds each symbol exactly once.',
    history: 'The modern puzzle first appeared in 1979 in an American magazine under the name Number Place, designed by Howard Garns. The Japanese publisher Nikoli introduced it in 1984 and gave it the name Sudoku, short for a phrase meaning "the digits must stay single". It spread worldwide in 2004 and 2005 through newspapers.',
    rules: [
      'Each row contains every symbol once.',
      'Each column contains every symbol once.',
      'Each outlined box contains every symbol once.',
      'The printed clues cannot be changed. Every puzzle here has exactly one solution, and Easy and Medium never need guessing.',
      'Sizes: 4×4 uses 1–4 in 2×2 boxes, 6×6 uses 1–6 in boxes two rows tall and three wide, 9×9 uses 1–9, and 16×16 uses 1–9 then A–G in 4×4 boxes.',
    ],
    basics: [
      'Hidden single: pick a number and a box, and cross out the cells its row and column neighbours rule out. If one cell is left, the number goes there.',
      'Naked single: pick a cell and list what its row, column and box already contain. If only one value is missing, it goes there.',
      'Work the most crowded rows, columns and boxes first. They have the fewest open questions.',
      'Use notes for cells with two or three candidates, and keep them current as you place numbers.',
    ],
    advanced: [
      'Locked candidates: if a number can only sit in one row of a box, remove it from the rest of that row outside the box.',
      'Naked pairs: two cells in a unit that share the same two candidates claim both values, so remove them from the other cells of the unit.',
      'Hidden pairs: two values that fit only the same two cells of a unit clear every other candidate from those cells.',
      'X-Wing: when a number has exactly two places in each of two rows and they line up in the same two columns, remove it from the rest of those columns.',
    ],
    mistakes: [
      'Guessing early. One wrong guess spreads quietly and surfaces twenty moves later.',
      'Leaving stale notes. A note that is no longer possible hides the single next to it.',
      'Scanning only rows and columns and forgetting the box, or the reverse.',
    ],
  },
  zh: {
    summary: '在格子里填数，使每一行、每一列、每一宫中每个符号都恰好出现一次。',
    history: '现代数独最早于1979年刊登在美国一本杂志上，名为 Number Place，设计者是霍华德·格恩斯。日本出版社 Nikoli 在1984年把它引入日本，取名“数独”，意思是“数字必须单独出现”。2004至2005年间，它借助报纸风靡全世界。',
    rules: [
      '每一行包含所有符号各一次。',
      '每一列包含所有符号各一次。',
      '每个粗线框出的宫包含所有符号各一次。',
      '题目给出的数字不能修改。这里的每道题都只有唯一解，简单和中等难度不需要猜测。',
      '尺寸：4×4 用1–4，宫为2×2；6×6 用1–6，宫为两行三列；9×9 用1–9；16×16 用1–9和A–G，宫为4×4。',
    ],
    basics: [
      '隐性唯一：选一个数字和一个宫，排除该数字所在行列已经占据的格子。如果只剩一个格子，数字就填在那里。',
      '显性唯一：选一个格子，看它所在的行、列、宫里已经有哪些数字。如果只缺一个，就填那个数字。',
      '先处理最满的行、列、宫，那里需要判断的地方最少。',
      '对只剩两三个候选数的格子做笔记，并在填数后及时更新。',
    ],
    advanced: [
      '区块排除：如果一个数字在某宫里只能出现在同一行，就可以把这一行在宫外的该候选数删去。',
      '显性数对：同一单元中两个格子的候选数都恰好是同样的两个数，这两个数就被它们占用，可以从单元其他格子里删去。',
      '隐性数对：两个数字在某单元里只能放在同样的两个格子，这两个格子的其他候选数都可以删去。',
      'X-Wing：某个数字在两行中各只有两个位置，且位于相同的两列，就可以把这两列其他格子里的该数字删去。',
    ],
    mistakes: [
      '过早猜测。一个错误会悄悄扩散，二十步之后才暴露出来。',
      '笔记没有更新。已经不可能的候选数会掩盖旁边的唯一解。',
      '只看行和列而忘了宫，或者只看宫。',
    ],
  },
  tr: {
    summary: 'Izgarayı, her satırda, sütunda ve kutuda her simge tam bir kez olacak şekilde doldur.',
    history: 'Bugünkü bulmaca ilk kez 1979’da bir Amerikan dergisinde Number Place adıyla, Howard Garns’ın tasarımıyla çıktı. Japon yayıncı Nikoli 1984’te bulmacayı Japonya’ya getirdi ve ona “rakamlar tek kalmalı” anlamına gelen bir sözün kısaltması olan Sudoku adını verdi. 2004 ve 2005’te gazeteler aracılığıyla bütün dünyaya yayıldı.',
    rules: [
      'Her satırda her simge bir kez bulunur.',
      'Her sütunda her simge bir kez bulunur.',
      'Çerçeveli her kutuda her simge bir kez bulunur.',
      'Basılı ipuçları değiştirilemez. Buradaki her bulmacanın tam bir çözümü vardır; Kolay ve Orta hiç tahmin gerektirmez.',
      'Boyutlar: 4×4, 2×2 kutularda 1–4; 6×6, iki satır yüksekliğinde ve üç sütun genişliğinde kutularda 1–6; 9×9, 1–9; 16×16 ise 4×4 kutularda 1–9 ve ardından A–G kullanır.',
    ],
    basics: [
      'Gizli tekli: bir sayı ve bir kutu seç; satır ve sütun komşularının dışladığı kareleri ele. Tek kare kalırsa sayı oraya gider.',
      'Çıplak tekli: bir kare seç ve satırında, sütununda, kutusunda zaten bulunanları say. Tek bir değer eksikse o kareye o gelir.',
      'Önce en dolu satır, sütun ve kutularla uğraş. En az açık soru onlarda kalır.',
      'İki ya da üç adayı olan kareler için not al ve sayı yerleştirdikçe notları güncel tut.',
    ],
    advanced: [
      'Kilitli adaylar: bir sayı bir kutuda yalnızca tek bir satıra gelebiliyorsa, o satırın kutu dışındaki kısmından o sayıyı sil.',
      'Çıplak çiftler: bir birimde aynı iki adayı paylaşan iki kare bu iki değeri sahiplenir; onları birimin diğer karelerinden sil.',
      'Gizli çiftler: bir birimde yalnızca aynı iki kareye sığan iki değer, o karelerdeki diğer bütün adayları temizler.',
      'X-Wing: bir sayının iki satırın her birinde tam iki yeri varsa ve bunlar aynı iki sütuna denk geliyorsa, o sayıyı bu sütunların geri kalanından sil.',
    ],
    mistakes: [
      'Erken tahmin etmek. Tek bir yanlış tahmin sessizce yayılır ve yirmi hamle sonra ortaya çıkar.',
      'Eskimiş notlar bırakmak. Artık mümkün olmayan bir not, yanındaki tekliyi gizler.',
      'Yalnızca satır ve sütunları tarayıp kutuyu unutmak ya da tersini yapmak.',
    ],
  },
};
