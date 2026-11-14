import type { Lesson } from '../../core/learn';
export const lesson: Lesson = {
  names: { en: 'Hidato', zh: '数字蛇', tr: 'Hidato', pinyin: 'Shùzì shé', trad: '數字蛇' },
  en: {
    summary: 'Fill the grid with a chain of numbers from 1 to the last, each one touching the next sideways or diagonally, like a snake winding through every square.',
    history: 'Hidato was invented in 2005 by the Israeli mathematician Gyora Benedek; the name comes from the Hebrew for “riddle”. It spread through newspapers and phone apps in the late 2000s, and versions of the idea are also known as Numbrix (without diagonals) and Hidoku.',
    rules: ['Write the numbers from 1 to N, one in each square.', 'Each number must touch the next one: above, below, beside, or at a corner.', 'Some numbers are given, always including 1 and the last number, and every puzzle has one solution.'],
    basics: ['Look for gaps of one: if 7 and 9 are given, 8 must touch both, often leaving a single square.', 'Count distances: between 12 and 17 there are four numbers to place, so the two must be at most five steps apart.', 'Corners and edges have few neighbours, so paths through them are forced early.'],
    advanced: ['Watch for squares that can be reached by only one stretch of the snake: whichever missing numbers can get there must take it.', 'Do not cut off part of the grid: a region the snake can enter but not leave must hold one of its ends.'],
    mistakes: ['Forgetting diagonals: corners count as touching.', 'Filling a gap greedily and stranding an empty square no number can reach.'],
  },
  zh: {
    summary: '用一串从1到最后一个数的数字填满方格，每个数都要和下一个数横、竖或斜着相邻，像一条蛇穿过所有格子。',
    history: 'Hidato由以色列数学家吉奥拉·贝内德克于2005年发明，名字来自希伯来语的“谜语”。它在2000年代后期通过报纸和手机应用流行起来；类似的玩法还有不算斜向的Numbrix以及Hidoku。',
    rules: ['在每个格子里填入1到N中的一个数。', '每个数必须和下一个数相邻：上下左右或斜角都算。', '部分数字已给出，总是包括1和最后一个数；每道题只有唯一解。'],
    basics: ['找只差一个的空缺：如果给了7和9，8必须同时挨着它们，往往只剩一个格子。', '算距离：12和17之间要放四个数，所以它们最多相距五步。', '角落和边上的邻格少，经过它们的路线往往最先确定。'],
    advanced: ['注意只能被某一段蛇身到达的格子：能到那里的缺数就必须占用它。', '不要把一块区域隔断：蛇能进不能出的区域里一定有蛇头或蛇尾。'],
    mistakes: ['忘了斜角：斜对角也算相邻。', '急着填满一个空缺，结果留下一个没有数能到达的空格。'],
  },
  tr: {
    summary: 'Izgarayı 1’den sonuncuya kadar bir sayı zinciriyle doldur; her sayı bir sonrakine yandan ya da çaprazdan değsin, her kareden geçen bir yılan gibi.',
    history: 'Hidato’yu 2005’te İsrailli matematikçi Gyora Benedek icat etti; adı İbranicede “bilmece” anlamına gelen kelimeden gelir. 2000’lerin sonunda gazeteler ve telefon uygulamalarıyla yayıldı; fikrin çaprazsız hâli Numbrix, bir başka adı da Hidoku’dur.',
    rules: ['1’den N’e kadar sayıları her kareye bir tane olacak şekilde yaz.', 'Her sayı bir sonrakine değmeli: üstten, alttan, yandan ya da köşeden.', 'Bazı sayılar verilmiştir, 1 ve son sayı her zaman vardır; her bulmacanın tek çözümü vardır.'],
    basics: ['Bir eksikli boşlukları ara: 7 ve 9 verilmişse 8 ikisine de değmeli; çoğu zaman tek bir kare kalır.', 'Mesafeyi say: 12 ile 17 arasına dört sayı girecek, yani ikisi en fazla beş adım uzakta olabilir.', 'Köşelerin ve kenarların az komşusu vardır; oradan geçen yollar erken belli olur.'],
    advanced: ['Yalnızca yılanın bir parçasının ulaşabildiği karelere dikkat et: oraya varabilen eksik sayı orayı almak zorundadır.', 'Izgaranın bir parçasını kesip ayırma: yılanın girip çıkamadığı bir bölgede uçlardan biri olmalıdır.'],
    mistakes: ['Çaprazları unutmak: köşeden değmek de sayılır.', 'Bir boşluğu aceleyle doldurup hiçbir sayının ulaşamayacağı bir kare bırakmak.'],
  },
};
