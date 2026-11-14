import type { Lesson } from '../../core/learn';
export const lesson: Lesson = {
  names: { en: 'Kakuro', zh: '数和', tr: 'Kakuro', pinyin: 'Shù hé', trad: '數和' },
  en: {
    summary: 'A crossword made of numbers: fill the white squares with digits 1–9 so each run adds up to the clue beside it, with no digit repeated in a run.',
    history: 'The puzzle was first printed in America in the 1950s as “Cross Sums” in Dell puzzle magazines. In the 1980s the Japanese publisher Nikoli named it Kakuro, from kasan kurosu, “addition cross”, and it became one of Japan’s favourite pencil puzzles, second only to Sudoku.',
    rules: ['Each white square takes a digit from 1 to 9.', 'A run is a line of white squares across or down. The number in the black square before it, above the diagonal for across and below it for down, is the run’s sum.', 'The digits in a run add up to its clue and are all different.', 'Every puzzle has one solution.'],
    basics: ['Learn the lonely sums: 3 in two squares is 1+2, 4 in two is 1+3, 16 in two is 7+9, 17 is 8+9; 6 in three is 1+2+3, 24 in three is 7+8+9.', 'Where an across and a down run cross, the digit must fit both: look for the one digit their sets share.', 'Fill the short runs first; they have the fewest ways.'],
    advanced: ['Count a whole block: when a group of runs covers the same squares across and down, the sums must agree, which can reveal one square.', 'High clues push out small digits: a 3-square run of 23 needs 6+8+9, so no square in it can be below 6.'],
    mistakes: ['Repeating a digit within a run because the sum works.', 'Reading a down clue as an across clue: the diagonal separates them.'],
  },
  zh: {
    summary: '数字版的填字游戏：在白格中填入1到9，使每一段的和等于旁边的提示，且同一段中数字不重复。',
    history: '这种谜题20世纪50年代最早在美国Dell谜题杂志上以“交叉和”（Cross Sums）的名字出现。80年代日本Nikoli出版社把它命名为Kakuro（来自“加算交叉”），它随后成为日本最受欢迎的纸笔谜题之一，仅次于数独。',
    rules: ['每个白格填1到9中的一个数字。', '一“段”是横向或纵向连续的白格。它前面黑格里的数字就是这一段的和：斜线上方是横向的，下方是纵向的。', '一段中的数字之和等于提示，且互不相同。', '每道题只有唯一解。'],
    basics: ['记住唯一组合：两格之和3是1+2，4是1+3，16是7+9，17是8+9；三格之和6是1+2+3，24是7+8+9。', '横竖两段交叉的格子必须同时满足两段：找它们组合中共有的数字。', '先填短的段，可能性最少。'],
    advanced: ['整块计算：当一组段横竖覆盖同样的格子，两个方向的总和必须相等，可以推出某一格。', '大的和会排除小数字：三格之和23必须是6+8+9，所以其中任何一格都不会小于6。'],
    mistakes: ['因为和对了就在同一段里重复数字。', '把纵向提示看成横向提示：斜线把它们分开。'],
  },
  tr: {
    summary: 'Sayılardan yapılmış bir bulmaca: beyaz karelere 1–9 rakamlarını yaz; her dizi yanındaki ipucuna eşit toplansın ve bir dizide hiçbir rakam tekrar etmesin.',
    history: 'Bulmaca ilk kez 1950’lerde Amerika’da Dell bulmaca dergilerinde “Cross Sums” adıyla basıldı. 1980’lerde Japon yayıncı Nikoli ona “toplama çaprazı” anlamına gelen kasan kurosu’dan Kakuro adını verdi; Japonya’nın Sudoku’dan sonra en sevilen kalem bulmacalarından biri oldu.',
    rules: ['Her beyaz kareye 1’den 9’a bir rakam yazılır.', 'Dizi, yatay ya da dikey sıralanan beyaz karelerdir. Önündeki siyah karedeki sayı dizinin toplamıdır: çaprazın üstündeki yatay, altındaki dikey dizi içindir.', 'Bir dizideki rakamlar ipucuna eşit toplanır ve hepsi farklıdır.', 'Her bulmacanın tek çözümü vardır.'],
    basics: ['Tek yollu toplamları öğren: iki karede 3 = 1+2, 4 = 1+3, 16 = 7+9, 17 = 8+9; üç karede 6 = 1+2+3, 24 = 7+8+9.', 'Yatay ve dikey dizinin kesiştiği kare ikisine de uymalı: iki takımın ortak rakamını ara.', 'Önce kısa dizileri doldur; en az ihtimal onlarda.'],
    advanced: ['Bütün bir bloğu say: bir grup dizi aynı kareleri yatay ve dikey kaplıyorsa toplamlar eşit olmalı; bu bir kareyi ortaya çıkarabilir.', 'Büyük ipuçları küçük rakamları dışlar: üç karede 23 için 6+8+9 gerekir, yani o dizide 6’dan küçük rakam olamaz.'],
    mistakes: ['Toplam tuttu diye bir dizide rakam tekrarlamak.', 'Dikey ipucunu yatay sanmak: çapraz ikisini ayırır.'],
  },
};
