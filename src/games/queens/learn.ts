import type { Lesson } from '../../core/learn';
export const lesson: Lesson = {
  names: { en: 'Queens', zh: '皇后谜题', tr: 'Vezirler', pinyin: 'Huánghòu mítí', trad: '皇后謎題' },
  en: {
    summary: 'Two puzzles with chess queens. In the colour version, put one queen in every row, column and coloured region with no two touching. In the classic, place n queens so that none attacks another, and hunt for every arrangement.',
    history: 'The eight queens problem was posed by the chess composer Max Bezzel in 1848. Gauss took an interest, and Franz Nauck published all 92 solutions in 1850; it later became a standard first exercise in backtracking for programmers. The colour-region version descends from the pencil puzzle Star Battle and became an everyday habit for millions when a daily “Queens” game appeared online in 2024.',
    rules: ['Colour regions: exactly one queen in each row, each column and each coloured region.', 'Colour regions: no two queens may touch, not even diagonally. Every puzzle has one solution.', 'Classic: place n queens on an n×n board so that no two share a row, column or diagonal.', 'Classic: the 8×8 board has 92 solutions; each new one you find is kept.'],
    basics: ['A region that fits in a single row or column claims it: no other queen goes there.', 'Cross out the eight squares around every queen you place, and its whole row and column.', 'Two regions confined to the same two rows take both rows between them.'],
    advanced: ['Look for the smallest region: try each of its squares and see which one leaves every other region a place.', 'Classic: solutions come in families of up to eight by turning and mirroring the board; find one and you can draw its relatives.'],
    mistakes: ['Forgetting the corners: diagonal neighbours count as touching.', 'Placing a queen without crossing out its row and column, then finding a second one there later.'],
  },
  zh: {
    summary: '两种用国际象棋皇后玩的谜题。颜色区域版：每行、每列、每种颜色各放一个皇后，皇后之间不能相邻。经典版：放n个互不攻击的皇后，并找出所有摆法。',
    history: '八皇后问题由国际象棋排局家马克斯·贝策尔于1848年提出。高斯也研究过它，弗朗茨·瑙克在1850年发表了全部92个解；后来它成了程序员学习回溯算法的第一道经典题。颜色区域版源自纸笔谜题“星战”，2024年网上出现每日“Queens”游戏后，成了数百万人的日常习惯。',
    rules: ['颜色区域：每行、每列、每个颜色区域恰好一个皇后。', '颜色区域：任意两个皇后不能相邻，斜对角也不行。每道题只有唯一解。', '经典：在n×n的棋盘上放n个皇后，任意两个不在同一行、列或斜线上。', '经典：8×8棋盘共有92个解；你找到的每个新解都会被记下来。'],
    basics: ['一个区域如果只占一行或一列，这一行（列）就归它：别的皇后不能放在那里。', '每放一个皇后，就把它周围八格以及整行整列打叉。', '两个区域都局限在同样的两行里，这两行就被它们占满了。'],
    advanced: ['找最小的区域：逐一尝试它的每个格子，看哪个能让其他所有区域都还有位置。', '经典版：把棋盘旋转、翻转，一个解最多能变出八个；找到一个，就能画出它的“亲戚”。'],
    mistakes: ['忘了斜角：斜对角也算相邻。', '放了皇后却没把它的行列打叉，后来又在那里放了第二个。'],
  },
  tr: {
    summary: 'Satranç vezirleriyle iki bulmaca. Renkli sürümde her satıra, sütuna ve renk bölgesine birer vezir koy, ikisi birbirine değmesin. Klasikte n veziri hiçbiri diğerini tehdit etmeyecek şekilde yerleştir ve bütün dizilişleri bul.',
    history: 'Sekiz vezir problemini 1848’de satranç problemcisi Max Bezzel sordu. Gauss da ilgilendi; Franz Nauck 1850’de 92 çözümün hepsini yayımladı. Sonra programcıların geri izleme (backtracking) öğrenirken çözdüğü ilk alıştırma oldu. Renk bölgeli sürüm, Star Battle kalem bulmacasından gelir; 2024’te internette günlük bir “Queens” oyunu çıkınca milyonlarca kişinin her gün oynadığı bir alışkanlık hâline geldi.',
    rules: ['Renk bölgeleri: her satırda, her sütunda ve her renk bölgesinde tam bir vezir.', 'Renk bölgeleri: iki vezir birbirine değemez, köşeden bile. Her bulmacanın tek çözümü vardır.', 'Klasik: n×n tahtaya n vezir koy; hiçbir ikisi aynı satırda, sütunda ya da çaprazda olmasın.', 'Klasik: 8×8 tahtanın 92 çözümü var; bulduğun her yenisi saklanır.'],
    basics: ['Tek bir satıra ya da sütuna sığan bölge orayı sahiplenir: oraya başka vezir girmez.', 'Koyduğun her vezirin çevresindeki sekiz kareye, bütün satırına ve sütununa çarpı koy.', 'Aynı iki satıra sıkışmış iki bölge o iki satırı aralarında paylaşır.'],
    advanced: ['En küçük bölgeyi bul: her karesini dene ve hangisinin diğer bütün bölgelere yer bıraktığına bak.', 'Klasik: tahtayı döndürüp aynalayınca bir çözümden sekize kadar akrabası çıkar; birini bul, gerisini çizebilirsin.'],
    mistakes: ['Köşeleri unutmak: çapraz komşular da değiyor sayılır.', 'Vezir koyup satırını ve sütununu çarpılamamak, sonra oraya ikinci bir vezir koymak.'],
  },
};
