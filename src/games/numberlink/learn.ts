import type { Lesson } from '../../core/learn';
export const lesson: Lesson = {
  names: { en: 'Numberlink', zh: '数字连线', tr: 'Sayı Bağla (Numberlink)', pinyin: 'Shùzì liánxiàn', trad: '數字連線' },
  en: {
    summary: 'Join each pair of equal numbers with a line through neighbouring squares. Lines never cross or share a square, and together they fill the whole grid.',
    history: 'Puzzles of joining pairs without crossing go back at least to Sam Loyd and Henry Dudeney around 1900. The Japanese publisher Nikoli made the modern grid form popular as “Numberlink” in the 1980s, and in the 2010s the phone game Flow Free brought it to millions of players with coloured dots.',
    rules: ['Draw a line between the two squares of each number, moving up, down, left or right.', 'Lines may not cross, branch, or pass through another number.', 'Every square of the grid must be used by some line.'],
    basics: ['Numbers in corners and along edges have fewest ways out: start with them.', 'A pair that sits next to an edge often runs along it.', 'If a square has only one free neighbour, the line through it is forced.'],
    advanced: ['Avoid zig-zags: when a line could take a short way and leave squares unused, the long way round usually hugs the outside of another line.', 'Draw lines that block each other last; the ones with a single sensible route first.'],
    mistakes: ['Joining all pairs but leaving empty squares: every square must be filled.', 'Walling off an area that no line can reach.'],
  },
  zh: {
    summary: '把每对相同的数字用一条经过相邻格子的线连起来。线不能交叉或共用格子，所有的线合起来要铺满整个方格。',
    history: '不交叉地连接成对的点，这类谜题至少可以追溯到1900年前后的萨姆·劳埃德和亨利·杜德尼。日本Nikoli出版社在80年代以“Numberlink”之名推广了现代的方格形式；2010年代，手机游戏Flow Free用彩色圆点把它带给了数以百万计的玩家。',
    rules: ['在每对数字的两个格子之间画线，只能上下左右走。', '线不能交叉、分岔，也不能穿过别的数字。', '方格中的每一格都必须被某条线用到。'],
    basics: ['角落和边上的数字出路最少：从它们开始。', '靠着边的一对数字，连线常常沿着边走。', '如果一格只剩一个空邻格，经过它的线就被确定了。'],
    advanced: ['避免走捷径：如果一条线可以走近路但留下空格，绕远路的那条通常贴着另一条线的外侧。', '互相阻挡的线最后画；只有一种合理路线的先画。'],
    mistakes: ['所有数字都连上了却留下空格：每一格都必须填满。', '圈出一块任何线都到不了的区域。'],
  },
  tr: {
    summary: 'Her eşit sayı çiftini komşu karelerden geçen bir çizgiyle birleştir. Çizgiler kesişmez, aynı kareyi paylaşmaz ve hep birlikte bütün ızgarayı doldurur.',
    history: 'Çiftleri kesiştirmeden birleştirme bulmacaları en az 1900 civarına, Sam Loyd ve Henry Dudeney’e kadar uzanır. Japon yayıncı Nikoli bugünkü ızgara biçimini 1980’lerde “Numberlink” adıyla sevdirdi; 2010’larda telefon oyunu Flow Free onu renkli noktalarla milyonlarca oyuncuya ulaştırdı.',
    rules: ['Her sayının iki karesi arasına yukarı, aşağı, sağa ya da sola giderek çizgi çek.', 'Çizgiler kesişemez, dallanamaz, başka bir sayının üstünden geçemez.', 'Izgaranın her karesi bir çizgi tarafından kullanılmalıdır.'],
    basics: ['Köşelerdeki ve kenarlardaki sayıların en az çıkışı vardır: onlardan başla.', 'Kenara yakın bir çift çoğu zaman kenar boyunca gider.', 'Bir karenin tek boş komşusu kaldıysa oradan geçen çizgi bellidir.'],
    advanced: ['Kestirmeden kaçın: bir çizgi kısa yoldan gidip kareleri boş bırakabiliyorsa, uzun yol genelde başka bir çizginin dışına sarılır.', 'Birbirini engelleyen çizgileri en sona bırak; tek makul yolu olanları önce çiz.'],
    mistakes: ['Bütün çiftleri bağlayıp boş kare bırakmak: her kare dolmalı.', 'Hiçbir çizginin ulaşamayacağı bir alanı kapatmak.'],
  },
};
