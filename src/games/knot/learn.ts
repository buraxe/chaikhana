import type { Lesson } from '../../core/learn';
export const lesson: Lesson = {
  names: { en: 'Chinese Knot', zh: '中国结', tr: 'Çin Düğümü', pinyin: 'Zhōngguó jié' },
  en: {
    summary: 'Turn the tiles until the red cord closes into loops with no loose ends.',
    history: 'Knotted cords are older than writing in China: the Book of Changes says that in high antiquity people kept records by tying knots. Decorative knotting grew into a craft in the Tang and Song dynasties and flourished under the Ming and Qing, when knots hung from fans, belts and lanterns. Red is the colour of luck, and the endless knot (pánzhǎng jié), one of the eight auspicious symbols of Buddhism, is its best-known pattern; the craft was revived across the Chinese-speaking world from the 1980s. This game is our own tile puzzle in the spirit of that craft: each one is made from rectangular loops of cord laid across each other.',
    rules: ['Every tile holds a bend, a straight piece, or two cords crossing.', 'Tap a tile to turn it a quarter turn clockwise.', 'The knot is tied when every cord end meets a cord end in the next tile, and no cord runs off the board.', 'Any arrangement with no loose ends counts.'],
    basics: ['Start at the edges: a straight piece on the border must lie along it, and a bend in a corner has only one way to sit.', 'Crossings never change when turned, so they fix the cords on all four sides.', 'Shaded tiles have a loose end; work towards a board with no shading.'],
    advanced: ['A bend next to an empty tile must turn away from it.', 'Follow a single cord from a fixed tile and lay it out, rather than turning tiles at random.'],
    mistakes: ['Turning a tile next to a solved edge and breaking it.', 'Forgetting that a cord running off the board is a loose end.'],
  },
  zh: {
    summary: '旋转格子，让红绳闭合成没有线头的绳圈。',
    history: '在中国，打结的绳子比文字还古老：《易经·系辞》说“上古结绳而治”。装饰性的结在唐宋时期发展成一门手艺，到明清时更为兴盛，扇子、腰带、灯笼上都挂着各式绳结。红色象征吉祥，佛教八吉祥之一的盘长结是其中最有名的图案；20世纪80年代起，这门手艺在华人世界重新兴起。这个游戏是我们自己按照这门手艺的意趣设计的格子谜题：每道题都由几圈相互交叉的长方形绳圈组成。',
    rules: ['每个格子里有一段弯绳、一段直绳，或两根交叉的绳。', '点击格子，使它顺时针转90°。', '每个绳头都和相邻格子的绳头相接、没有绳子伸出棋盘时，结就打好了。', '只要没有线头，任何摆法都算。'],
    basics: ['从边缘开始：边上的直绳必须沿着边，角上的弯绳只有一种放法。', '交叉的格子怎么转都一样，所以它们固定了四周的绳子。', '变暗的格子有线头；目标是让整个棋盘不再有暗格。'],
    advanced: ['紧挨空格的弯绳必须转向背离空格的方向。', '从一个已确定的格子出发顺着一根绳摆下去，而不是随意转动格子。'],
    mistakes: ['转动已解好的边旁边的格子，把它弄乱。', '忘了伸出棋盘的绳子也是线头。'],
  },
  tr: {
    summary: 'Kırmızı ip açık ucu kalmayan ilmiklere kapanana kadar kareleri döndür.',
    history: 'Çin’de düğümlü ipler yazıdan eskidir: Değişimler Kitabı, en eski çağlarda insanların kayıtlarını düğüm atarak tuttuğunu söyler. Süsleme amaçlı düğüm Tang ve Song hanedanlarında bir zanaata dönüştü, Ming ve Qing döneminde yelpazelerden, kemerlerden ve fenerlerden sarkan düğümlerle parladı. Kırmızı uğurun rengidir; Budizm’in sekiz uğurlu simgesinden biri olan sonsuz düğüm (pánzhǎng jié) en bilinen desenidir. Zanaat 1980’lerden itibaren Çince konuşulan dünyada yeniden canlandı. Bu oyun o zanaatin ruhuyla tasarladığımız kendi kare bulmacamızdır: her biri birbirinin üstünden geçen dikdörtgen ip ilmiklerinden yapılır.',
    rules: ['Her karede bir kıvrım, düz bir parça ya da kesişen iki ip vardır.', 'Bir kareye dokunarak onu saat yönünde çeyrek tur döndür.', 'Her ip ucu yandaki karenin bir ip ucuyla buluşunca ve hiçbir ip tahtanın dışına taşmayınca düğüm atılmış olur.', 'Açık ucu olmayan her diziliş sayılır.'],
    basics: ['Kenarlardan başla: kenardaki düz parça kenar boyunca uzanmalı, köşedeki kıvrımın oturabileceği tek bir yol vardır.', 'Kesişmeler döndürülse de değişmez; dört yanlarındaki ipleri sabitlerler.', 'Gölgeli karelerin açık ucu vardır; hiç gölge kalmayan bir tahtaya doğru çalış.'],
    advanced: ['Boş bir karenin yanındaki kıvrım ondan uzağa dönmelidir.', 'Kareleri rastgele çevirmek yerine sabitlenmiş bir kareden başlayıp tek bir ipi izle.'],
    mistakes: ['Çözülmüş bir kenarın yanındaki kareyi çevirip onu bozmak.', 'Tahtanın dışına taşan ipin de açık uç olduğunu unutmak.'],
  },
};
