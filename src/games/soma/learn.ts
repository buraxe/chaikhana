import type { Lesson } from '../../core/learn';
export const lesson: Lesson = {
  names: { en: 'Soma Cube', zh: '索玛立方体', tr: 'Soma Küpü', pinyin: 'Suǒmǎ lìfāngtǐ', trad: '索瑪立方體' },
  en: {
    summary: 'Seven pieces, every irregular shape you can make from three or four cubes, fit together into a 3×3×3 cube, and into hundreds of other figures.',
    history: 'The Danish poet and scientist Piet Hein thought of the Soma cube in 1933 while listening to Werner Heisenberg lecture on quantum mechanics, wondering which shapes small groups of cubes could make. Martin Gardner’s column in Scientific American made it famous in 1958; John Conway and Richard Guy later counted 240 different ways to build the cube, not counting turns and mirror images.',
    rules: ['Choose a figure. Pick a piece from the tray, move and turn it, and place it inside the glass figure.', 'Pieces may not overlap or stick out of the figure.', 'Use all seven pieces to fill the figure. Tap a placed piece to pick it up again.', 'Every figure here can be built; the hint places a piece that leads to a solution.'],
    basics: ['Place the awkward pieces first: the two screws and the branch fill corners well.', 'The V piece, the only one of three cubes, is easiest to fit last.', 'Count the corners of the figure: each piece can fill only so many.'],
    advanced: ['Parity: colour the cells like a 3D chessboard; the T piece always covers three of one colour and one of the other, which rules out many placements.', 'Build in layers for flat figures like the bathtub, but think in columns for the tower.'],
    mistakes: ['Leaving a single hole that no piece can reach.', 'Turning only around one axis: pieces need to tip and roll as well as spin.'],
  },
  zh: {
    summary: '七块拼块，包括所有能用三或四个小立方体拼成的不规则形状，可以组成一个3×3×3的立方体，以及几百种其他图形。',
    history: '丹麦诗人兼科学家皮特·海恩于1933年在听海森堡讲量子力学时想到了索玛立方体，他在琢磨几个小立方体能组成哪些形状。1958年马丁·加德纳在《科学美国人》专栏中介绍后，它一举成名；后来约翰·康威和理查德·盖伊算出，不计旋转和镜像，拼成立方体共有240种方法。',
    rules: ['选一个图形。从托盘里选一块，移动、旋转后放进玻璃图形里。', '拼块不能重叠，也不能伸出图形外。', '用全部七块填满图形。点已放好的块可以重新拿起来。', '这里的每个图形都能拼出；提示会放下一块通向解答的拼块。'],
    basics: ['先放难放的块：两个螺旋块和三叉块很适合填角落。', 'V块是唯一由三个小块组成的，最适合留到最后。', '数一数图形有几个角：每块能填的角有限。'],
    advanced: ['奇偶性：把格子像三维棋盘一样涂色；T块总是盖住三个一种颜色、一个另一种颜色，这能排除很多放法。', '浴缸这样扁平的图形按层拼，高塔则要按柱子来想。'],
    mistakes: ['留下一个任何块都够不着的孤洞。', '只绕一个轴转：拼块除了水平转，还要前后翻、左右翻。'],
  },
  tr: {
    summary: 'Üç ya da dört küpten yapılabilecek bütün düzensiz şekiller olan yedi parça, 3×3×3 bir küpte ve yüzlerce başka figürde birleşir.',
    history: 'Danimarkalı şair ve bilim insanı Piet Hein, Soma küpünü 1933’te Werner Heisenberg’in kuantum mekaniği dersini dinlerken, birkaç küpün hangi şekilleri yapabileceğini düşünürken buldu. Martin Gardner’ın Scientific American’daki köşesi onu 1958’de ünlü yaptı; John Conway ve Richard Guy daha sonra, döndürme ve aynalamayı saymadan, küpü kurmanın 240 farklı yolunu saydı.',
    rules: ['Bir figür seç. Tepsiden bir parça al, hareket ettir, döndür ve cam figürün içine yerleştir.', 'Parçalar çakışamaz ve figürün dışına taşamaz.', 'Figürü yedi parçanın hepsiyle doldur. Yerleşmiş bir parçaya dokununca geri alırsın.', 'Buradaki her figür kurulabilir; ipucu bir çözüme götüren bir parçayı yerleştirir.'],
    basics: ['Zor parçaları önce yerleştir: iki vida ve çatal köşeleri iyi doldurur.', 'Üç küplük tek parça olan V, en sona bırakmaya en uygunudur.', 'Figürün köşelerini say: her parça ancak birkaç köşe doldurabilir.'],
    advanced: ['Eşlik: kareleri üç boyutlu bir satranç tahtası gibi boya; T parçası her zaman bir renkten üç, diğerinden bir kare kaplar, bu da birçok yerleşimi eler.', 'Küvet gibi yassı figürleri katman katman, kuleyi ise sütun sütun düşün.'],
    mistakes: ['Hiçbir parçanın ulaşamayacağı tek bir boşluk bırakmak.', 'Yalnızca bir eksen etrafında döndürmek: parçaların çevrilmesi kadar devrilmesi ve yuvarlanması da gerekir.'],
  },
};
