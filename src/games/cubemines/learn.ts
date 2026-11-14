import type { Lesson } from '../../core/learn';
export const lesson: Lesson = {
  names: { en: '3D Minesweeper', tr: '3B Mayın Tarlası', zh: '3D扫雷', pinyin: 'sān D sǎoléi' },
  en: {
    summary: 'Minesweeper on the six faces of a cube: turn it in your hands and clear every safe square.',
    history: 'Minesweeper variants on other surfaces appeared soon after the original became famous: hexagonal boards, tori where the edges wrap round, and cubes. On a cube the grid has no edge at all; only the eight corners of the cube are special, where three faces meet.',
    rules: ['Each face is a grid. Two squares are neighbours when they share a corner, including across the edges of the cube.', 'A number counts the mines in all the squares it touches, on any face.', 'Tap to open, long-press or right-click to flag, or switch on flag mode. The first tap is always safe.', 'Open every square without a mine to win. Drag to turn the cube; pinch or scroll to zoom.'],
    basics: ['Squares on an edge have neighbours on the next face: turn the cube before you decide.', 'A square at a cube corner touches only seven others, not eight.', 'All the usual Minesweeper patterns still work, they just bend round the edges.'],
    advanced: ['Open regions grow fastest from the middle of a face.', 'When you are stuck on one face, turn the cube: the clue you need is often on the other side of an edge.', 'Flags are notes for you; the game is won by opening squares.'],
    mistakes: ['Forgetting the neighbours across an edge.', 'Flagging in a hurry while the cube is turned to an angle where squares look alike.'],
  },
  zh: {
    summary: '在立方体的六个面上扫雷：把它拿在手里转，扫清所有安全的方格。',
    history: '经典扫雷走红后不久，就出现了各种表面上的变体：六边形棋盘、边缘相连的环面，以及立方体。在立方体上，格子没有边界，只有三个面交汇的八个角比较特殊。',
    rules: ['每个面都是一个网格。两个方格只要有一个公共角就是邻居，跨越立方体的棱也算。', '数字表示它接触到的所有方格（在任何面上）中的地雷数。', '点击打开，长按或右键插旗，也可以打开插旗模式。第一下总是安全的。', '打开所有没有地雷的方格即获胜。拖动旋转立方体，捏合或滚动缩放。'],
    basics: ['棱边上的方格在相邻的面上也有邻居：做决定前先转一转。', '立方体角上的方格只接触七个方格，而不是八个。', '常见的扫雷规律依然有效，只是会绕过棱边。'],
    advanced: ['从面的中间开始，空白区域扩展得最快。', '在一个面上卡住时，转动立方体：需要的线索常常在棱的另一侧。', '旗子只是给自己的记号，获胜靠的是打开方格。'],
    mistakes: ['忘记棱另一侧的邻居。', '在立方体转到方格看起来很像的角度时匆忙插旗。'],
  },
  tr: {
    summary: 'Bir küpün altı yüzünde Mayın Tarlası: küpü elinde çevir ve bütün güvenli kareleri aç.',
    history: 'Klasik Mayın Tarlası ünlendikten kısa süre sonra başka yüzeylerde çeşitleri çıktı: altıgen tahtalar, kenarları birbirine bağlanan simit biçimli tahtalar ve küpler. Küpte ızgaranın hiç kenarı yoktur; yalnızca üç yüzün buluştuğu sekiz köşe özeldir.',
    rules: ['Her yüz bir ızgaradır. Bir köşeyi paylaşan iki kare komşudur; küpün kenarlarının ötesindekiler de dahil.', 'Bir sayı, hangi yüzde olursa olsun değdiği bütün karelerdeki mayınları sayar.', 'Açmak için dokun, bayrak için uzun bas ya da sağ tıkla veya bayrak modunu aç. İlk dokunuş her zaman güvenlidir.', 'Mayınsız bütün kareleri açarsan kazanırsın. Küpü çevirmek için sürükle; yakınlaştırmak için sıkıştır ya da kaydır.'],
    basics: ['Kenardaki karelerin yandaki yüzde de komşuları vardır: karar vermeden önce küpü çevir.', 'Küp köşesindeki bir kare sekiz değil, yalnızca yedi kareye değer.', 'Bilinen Mayın Tarlası kalıplarının hepsi yine işler, yalnızca kenarlardan dönerler.'],
    advanced: ['Açık alanlar en hızlı bir yüzün ortasından büyür.', 'Bir yüzde takılınca küpü çevir: aradığın ipucu çoğu zaman kenarın öbür tarafındadır.', 'Bayraklar senin notlarındır; oyun kare açarak kazanılır.'],
    mistakes: ['Kenarın ötesindeki komşuları unutmak.', 'Küp, karelerin birbirine benzediği bir açıdayken aceleyle bayrak koymak.'],
  },
};
