import type { Lesson } from '../../core/learn';
export const lesson: Lesson = {
  names: { en: 'Pentominoes', zh: '五连块', tr: 'Pentomino', pinyin: 'wǔ lián kuài' },
  en: {
    summary: 'Twelve shapes, each made of five squares: fit them together to fill a rectangle.',
    history: 'The puzzle-maker Henry Dudeney used a set of these shapes in a puzzle of 1907, and the mathematician Solomon Golomb gave them the name “pentominoes” in 1953 and made them famous with his book on polyominoes. The twelve can fill a 6×10 rectangle in 2,339 different ways, but a 3×20 rectangle in only two, which makes the long thin board much harder than it looks. Arthur C. Clarke made pentominoes a plot point in a novel, and the falling-block video games grew from the smaller four-square family.',
    rules: ['Each piece is named after the letter it resembles: F, I, L, N, P, T, U, V, W, X, Y and Z.', 'Fill every square of the board, using each piece shown exactly once.', 'Pieces may be turned and flipped over; they may not overlap or hang off the board.', 'Small boards use a handful of the pieces; the four big boards use all twelve.'],
    basics: ['Place the awkward pieces first: X, then F, W and the long I.', 'Corners and edges are easiest to fill with L, P, U, V and the I.', 'Watch the empty pockets: a pocket of empty squares must hold whole pieces, so its size must be a multiple of five.', 'Lift a piece back off by tapping it when you are stuck.'],
    advanced: ['X fits only where it has room on all four sides, so on 6×10 it must sit near the edge of one half; try it in each spot in turn.', 'On 3×20 there are only two answers; the X, the I and the ends of the board decide almost everything.', 'Build from one end of the board to the other rather than leaving gaps in the middle.'],
    mistakes: ['Leaving a hole of one to four squares that no piece can reach.', 'Forgetting that flipping a piece makes a different fit: N, Y, L, P, F and Z all have two faces.'],
  },
  zh: {
    summary: '十二种形状，每种由五个正方形组成：把它们拼起来填满一个长方形。',
    history: '谜题作家亨利·杜德尼在1907年的一道谜题中用到了这套形状；数学家所罗门·格隆布在1953年为它们取名“pentomino”，并通过关于多连块的著作使其闻名。这十二块拼成6×10长方形有2339种方法，拼成3×20却只有两种，所以细长的棋盘比看上去难得多。亚瑟·克拉克曾把五连块写进小说情节，而下落方块类电子游戏则源自更小的四格家族。',
    rules: ['每块以它像的字母命名：F、I、L、N、P、T、U、V、W、X、Y和Z。', '填满棋盘的每一格，下方显示的每块正好用一次。', '可以旋转和翻转，但不能重叠，也不能超出棋盘。', '小棋盘只用其中几块；四个大棋盘用全部十二块。'],
    basics: ['先放难放的块：X，然后是F、W和长条I。', '角和边最适合用L、P、U、V和I来填。', '注意空的小区域：被围住的空格必须正好放下整块，所以格数必须是5的倍数。', '卡住时，点盘上的块就能把它拿起来。'],
    advanced: ['X只能放在四面都有空间的地方，所以在6×10上它必须靠近某一半的边缘；逐个位置去试。', '3×20只有两个解；X、I和棋盘两端几乎决定了一切。', '从棋盘的一端拼到另一端，不要在中间留空。'],
    mistakes: ['留下一到四格的小洞，没有任何块能放进去。', '忘了翻转后的块是另一种拼法：N、Y、L、P、F和Z都有两面。'],
  },
  tr: {
    summary: 'Her biri beş kareden oluşan on iki şekil: onları birleştirip bir dikdörtgeni doldur.',
    history: 'Bulmaca yazarı Henry Dudeney 1907’de bir bulmacasında bu şekilleri kullandı; matematikçi Solomon Golomb 1953’te onlara “pentomino” adını verdi ve poliominolar üzerine kitabıyla ünlendirdi. On iki parça 6×10’luk bir dikdörtgeni 2.339 farklı şekilde doldurabilir, ama 3×20’liği yalnızca iki şekilde; bu yüzden uzun ince tahta göründüğünden çok daha zordur. Arthur C. Clarke pentominoları bir romanının olay örgüsüne kattı; düşen bloklu video oyunları da daha küçük dört karelik aileden doğdu.',
    rules: ['Her parça benzediği harfin adını taşır: F, I, L, N, P, T, U, V, W, X, Y ve Z.', 'Gösterilen her parçayı tam bir kez kullanarak tahtanın bütün karelerini doldur.', 'Parçalar döndürülüp çevrilebilir; üst üste binemez ve tahtadan taşamaz.', 'Küçük tahtalar parçaların bir kısmını kullanır; dört büyük tahta on ikisini de.'],
    basics: ['Önce zor parçaları yerleştir: X, sonra F, W ve uzun I.', 'Köşeler ve kenarlar en kolay L, P, U, V ve I ile dolar.', 'Boş ceplere dikkat et: kapalı kalan boş kareler tam parçaları almalı, yani sayıları beşin katı olmalı.', 'Takılınca yerleşmiş bir parçaya dokunup onu geri al.'],
    advanced: ['X yalnızca dört yanında da yer olan yere sığar; 6×10’da yarıların birinin kenarına yakın durmalıdır. Her yeri sırayla dene.', '3×20’nin yalnızca iki çözümü var; X, I ve tahtanın uçları neredeyse her şeyi belirler.', 'Ortada boşluk bırakmak yerine tahtanın bir ucundan öbür ucuna doğru ilerle.'],
    mistakes: ['Hiçbir parçanın giremeyeceği bir ila dört karelik bir delik bırakmak.', 'Çevrilen parçanın başka bir şekilde oturduğunu unutmak: N, Y, L, P, F ve Z’nin iki yüzü vardır.'],
  },
};
