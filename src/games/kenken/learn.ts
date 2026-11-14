import type { Lesson } from '../../core/learn';
export const lesson: Lesson = {
  names: { en: 'KenKen', tr: 'KenKen', zh: '聪明格' },
  en: {
    summary: 'A Latin square with arithmetic: every row and column holds each number once, and each cage makes its target.',
    history: 'Japanese maths teacher Tetsuya Miyamoto invented the puzzle in 2004 to help his students think, calling it “the art of teaching without teaching”. It spread worldwide after The Times began printing it in 2008.',
    rules: ['Fill an n×n grid with the numbers 1 to n.', 'No number repeats in any row or column.', 'Each heavy-outlined cage shows a target and an operation: the numbers in the cage must combine to the target.', '“−” and “÷” cages have two cells: their difference or quotient is the target, in either order.', 'A single-cell cage gives its number directly.'],
    basics: ['Fill single-cell cages first.', 'A two-cell “÷ 2” cage in a 4×4 can only be 1–2 or 2–4.', 'Use the row and column rule as in Sudoku to rule numbers out.'],
    advanced: ['Large “×” targets pin down which numbers are present: 60 in three cells of a 5×5 must be 3, 4 and 5.', 'The numbers in each row add up to n(n+1)/2: use that to find the last cell of a row.'],
    mistakes: ['Forgetting that a cage may repeat a number if the cells are not in the same row or column.', 'Reading “−” cages in only one order.'],
  },
  zh: {
    summary: '带算术的拉丁方：每行每列数字各一次，每个笼子要算出目标数。',
    history: '日本数学老师宫本哲也在2004年发明了这种谜题，用来训练学生思考，称之为“不教而教的艺术”。2008年《泰晤士报》开始刊登后风靡全球。',
    rules: ['在n×n的格子里填入1到n。', '每行每列数字不重复。', '粗线围成的笼子标有目标数和运算：笼内数字经运算要等于目标数。', '“−”和“÷”笼子有两个格子：它们的差或商等于目标数，顺序不限。', '单格笼子直接给出数字。'],
    basics: ['先填单格笼子。', '4×4中“÷2”的两格笼子只能是1和2或2和4。', '像数独一样用行列规则排除数字。'],
    advanced: ['大的“×”目标能确定有哪些数字：5×5中三格积为60必定是3、4、5。', '每行数字之和是n(n+1)/2：用它求出一行的最后一格。'],
    mistakes: ['忘了笼内格子不在同一行列时数字可以重复。', '只按一种顺序理解“−”笼子。'],
  },
  tr: {
    summary: 'Aritmetikli bir Latin karesi: her satır ve sütunda her sayı bir kez, her kafes de hedefini tutturur.',
    history: 'Japon matematik öğretmeni Tetsuya Miyamoto bulmacayı 2004’te öğrencilerinin düşünmesine yardım etmek için icat etti ve “öğretmeden öğretme sanatı” dedi. The Times 2008’de yayımlamaya başlayınca bütün dünyaya yayıldı.',
    rules: ['n×n ızgarayı 1’den n’ye kadar sayılarla doldur.', 'Hiçbir satır ya da sütunda sayı tekrar etmez.', 'Kalın çizgili her kafeste bir hedef ve bir işlem yazar: kafesteki sayılar o işlemle hedefi vermelidir.', '“−” ve “÷” kafeslerinin iki karesi vardır: farkları ya da bölümleri, hangi sırayla olursa olsun, hedefi verir.', 'Tek kareli kafes sayısını doğrudan verir.'],
    basics: ['Önce tek kareli kafesleri doldur.', '4×4’te iki kareli “÷ 2” kafesi yalnızca 1–2 ya da 2–4 olabilir.', 'Sudoku’daki gibi satır ve sütun kuralıyla sayıları ele.'],
    advanced: ['Büyük “×” hedefleri hangi sayıların olduğunu belirler: 5×5’te üç karenin çarpımı 60 ise 3, 4 ve 5’tir.', 'Her satırın toplamı n(n+1)/2’dir: bir satırın son karesini bununla bul.'],
    mistakes: ['Kareler aynı satır ya da sütunda değilse kafeste sayı tekrarlanabileceğini unutmak.', '“−” kafeslerini tek bir sırayla okumak.'],
  },
};
