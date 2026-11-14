import type { Lesson } from '../../core/learn';
export const lesson: Lesson = {
  names: { en: '3D Tic-Tac-Toe', tr: '3B XOX', zh: '立体井字棋', pinyin: 'lìtǐ jǐngzì qí' },
  en: {
    summary: 'Four in a line on a 4×4×4 cube: rows, columns, pillars and diagonals through all three dimensions.',
    history: 'Three-dimensional noughts and crosses was sold by Parker Brothers in 1964 as Qubic, on four clear plastic layers stacked one above the other. It became a classic test for game-playing programs, and in 1980 Oren Patashnik proved with a computer search that the first player can always force a win, though the winning strategy is far too long to remember.',
    rules: ['Players take turns putting a stone in any empty point of the 4×4×4 cube. Red starts.', 'Four of your stones in a straight line wins. Lines run along rows and columns of a layer, straight up through the layers, and diagonally in any plane, including the four long diagonals through the centre of the cube.', 'There are 76 lines in all. If the cube fills with no line, the game is a draw.', 'Drag the cube to turn it; the four layer boards below show the same position flat.'],
    basics: ['The eight corners and the eight centre points each lie on seven lines; the other points lie on only four. Take them early.', 'Always check every line through the opponent’s last stone: three in a line with the fourth open must be blocked at once.', 'Use the flat layer boards to check pillars and diagonals that are hard to see in 3D.'],
    advanced: ['Win with a fork: a move that makes two different threes at once. Only one can be blocked.', 'Force the play: a three that must be blocked chooses where the opponent goes, and can set up a fork two moves later.', 'Diagonals between layers are the easiest lines to miss, for both players.'],
    mistakes: ['Playing in one layer as if it were a flat game; the danger is usually across layers.', 'Missing a long diagonal through the centre of the cube.'],
  },
  zh: {
    summary: '在4×4×4的立方体上连成四子：横、竖、贯穿各层的柱，以及跨越三维的斜线。',
    history: '1964年，美国 Parker Brothers 公司推出了立体井字棋 Qubic，由四层上下叠放的透明塑料棋盘组成。它成为检验下棋程序的经典题目；1980年，奥伦·帕塔什尼克用计算机搜索证明先手总能必胜，但必胜策略长到无法记住。',
    rules: ['双方轮流在4×4×4立方体的任意空点放一颗棋子，红方先行。', '自己的四颗棋子连成直线即胜。线可以沿某一层的行和列，可以垂直贯穿各层，也可以在任何平面上斜着走，包括穿过立方体中心的四条长对角线。', '一共有76条线。立方体下满仍无人连成四子则为和棋。', '拖动立方体可以旋转；下方的四个分层棋盘以平面方式显示同一局面。'],
    basics: ['八个角和中心的八个点各在七条线上，其他点只在四条线上。早点占据它们。', '每次都要检查经过对方最后一颗棋子的所有线：三子一线且第四点空着时必须马上堵住。', '用下方的分层棋盘检查在三维中不易看清的柱和斜线。'],
    advanced: ['用“双三”取胜：一步同时形成两个不同的三连，对方只能堵住一个。', '以攻代守：必须应对的三连可以决定对方下在哪里，两步之后就能形成双三。', '跨层的斜线是双方最容易漏看的线。'],
    mistakes: ['只在一层里下，好像是平面游戏；危险通常来自跨层的线。', '漏看穿过立方体中心的长对角线。'],
  },
  tr: {
    summary: '4×4×4’lük bir küpte dört taşı bir çizgiye diz: satırlar, sütunlar, katları delen sütunlar ve üç boyutlu çaprazlar.',
    history: 'Üç boyutlu XOX, 1964’te Parker Brothers tarafından üst üste dizilmiş dört şeffaf plastik katla Qubic adıyla satıldı. Oyun oynayan bilgisayar programları için klasik bir sınav oldu; 1980’de Oren Patashnik bilgisayar aramasıyla ilk oyuncunun her zaman kazanabileceğini kanıtladı, ama kazanma stratejisi akılda tutulamayacak kadar uzundur.',
    rules: ['Oyuncular sırayla küpün herhangi bir boş noktasına taş koyar. İlk Kırmızı oynar.', 'Dört taşını düz bir çizgiye dizen kazanır. Çizgiler bir katın satır ve sütunları boyunca, katların içinden dümdüz yukarı ve her düzlemde çapraz gider; küpün merkezinden geçen dört uzun köşegen de buna dahildir.', 'Toplam 76 çizgi vardır. Küp dolar ve çizgi oluşmazsa oyun berabere biter.', 'Küpü çevirmek için sürükle; aşağıdaki dört kat tahtası aynı konumu düz gösterir.'],
    basics: ['Sekiz köşe ve merkezdeki sekiz nokta yedişer çizginin üstündedir; diğer noktalar yalnızca dört çizgidedir. Onları erken al.', 'Rakibin son taşından geçen bütün çizgilere her seferinde bak: dördüncüsü boş bir üçlü hemen kapatılmalı.', '3B’de görmesi zor olan sütunları ve çaprazları kontrol etmek için düz kat tahtalarını kullan.'],
    advanced: ['Çatalla kazan: aynı anda iki farklı üçlü yapan bir hamle. Yalnızca biri kapatılabilir.', 'Oyunu zorla: kapatılması gereken bir üçlü rakibin nereye oynayacağını belirler ve iki hamle sonra bir çatal hazırlayabilir.', 'Katlar arasındaki çaprazlar iki oyuncunun da en kolay kaçırdığı çizgilerdir.'],
    mistakes: ['Tek bir katta düz bir oyunmuş gibi oynamak; tehlike genellikle katlar arasındadır.', 'Küpün merkezinden geçen uzun bir köşegeni kaçırmak.'],
  },
};
