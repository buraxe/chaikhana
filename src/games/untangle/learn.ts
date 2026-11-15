import type { Lesson } from '../../core/learn';
export const lesson: Lesson = {
  names: { en: 'Untangle', zh: '解线团', tr: 'Çizgi Çöz', pinyin: 'jiě xiàntuán' },
  en: {
    summary: 'Dots joined by threads, all in a tangle: drag the dots until no two threads cross.',
    history: 'Mathematicians call a network that can be drawn without crossings planar, and in 1948 István Fáry proved that any such network can be drawn with straight lines alone. The untangling game was popularised by John Tantalo’s web game of 2005, which also gave the clever way of making puzzles used here: draw some straight lines, put a dot wherever two of them cross, and join neighbouring dots along each line. That drawing has no crossings, so every puzzle can be solved; the dots are then shuffled round a circle.',
    rules: ['Drag any dot anywhere on the board. Threads stretch and follow it.', 'Threads that cross another are shown in red.', 'The puzzle is solved when no two threads cross.', 'Fewer moves is better: a move is one drag.'],
    basics: ['Find the dots with the most threads; they usually go in the middle.', 'Untangle a small corner completely, then grow it a dot at a time.', 'Triangles of threads are good anchors: three dots whose threads form a closed triangle should end up with nothing crossing inside.'],
    advanced: ['Each line of the hidden drawing becomes a chain of dots: follow a chain and lay it out straight.', 'Dots with only two threads are the easiest to place last: they slot between their two neighbours.'],
    mistakes: ['Moving dots back and forth in a crowded middle instead of making room at the edge.', 'Leaving a long thread across the board that crosses everything later.'],
  },
  zh: {
    summary: '圆点之间用线相连，乱成一团：拖动圆点，直到没有任何两条线交叉。',
    history: '数学家把能画成没有交叉的网络称为平面图。1948年，法里·伊什特万证明了任何平面图都能只用直线画出来。解线团游戏因约翰·坦塔洛2005年的网页游戏而流行，这里所用的出题巧法也来自他：画几条直线，在两条线相交处放一个圆点，再沿每条直线把相邻的圆点连起来。这样的图没有交叉，所以每道题都有解；然后把圆点打乱排在一个圆上。',
    rules: ['可以把任何圆点拖到棋盘上的任何位置，线会跟着伸缩。', '与其他线交叉的线显示为红色。', '没有任何两条线交叉时，谜题就解开了。', '步数越少越好：拖动一次算一步。'],
    basics: ['找出连线最多的圆点，它们通常应该放在中间。', '先把一个小角落完全理清，再一个一个点往外扩展。', '线组成的三角形是好的支点：围成封闭三角形的三个点，里面最后不应有交叉。'],
    advanced: ['隐藏图里的每条直线都变成一串圆点：沿着一串点把它们排成直线。', '只有两条线的圆点最适合最后放：把它放在两个邻居之间就行。'],
    mistakes: ['在拥挤的中间来回挪动圆点，而不是在边缘腾出空间。', '留下一条横贯棋盘的长线，后来和所有线都交叉。'],
  },
  tr: {
    summary: 'Çizgilerle birbirine bağlı noktalar, hepsi birbirine dolanmış: hiçbir iki çizgi kesişmeyene kadar noktaları sürükle.',
    history: 'Matematikçiler kesişmeden çizilebilen bir ağa düzlemsel der; 1948’de Fáry István böyle her ağın yalnızca düz çizgilerle çizilebileceğini kanıtladı. Çözme oyunu John Tantalo’nun 2005 tarihli web oyunuyla yaygınlaştı; burada kullanılan akıllıca bulmaca üretme yolu da ondan geliyor: birkaç düz doğru çiz, ikisinin kesiştiği her yere bir nokta koy ve her doğru üzerindeki komşu noktaları birleştir. Bu çizimde kesişme yoktur, yani her bulmaca çözülebilir; sonra noktalar bir çemberin etrafına karıştırılarak dağıtılır.',
    rules: ['Herhangi bir noktayı tahtada istediğin yere sürükle. Çizgiler uzayıp onu izler.', 'Başka bir çizgiyle kesişen çizgiler kırmızı görünür.', 'Hiçbir iki çizgi kesişmediğinde bulmaca çözülür.', 'Ne kadar az hamle o kadar iyi: her sürükleme bir hamledir.'],
    basics: ['En çok çizgisi olan noktaları bul; genellikle ortaya giderler.', 'Küçük bir köşeyi tamamen çöz, sonra her seferinde bir nokta ekleyerek büyüt.', 'Çizgilerden oluşan üçgenler iyi dayanak noktalarıdır: kapalı üçgen yapan üç noktanın içinde sonunda kesişme kalmamalıdır.'],
    advanced: ['Gizli çizimdeki her doğru bir nokta zincirine dönüşür: bir zinciri izle ve düz bir sıraya diz.', 'Yalnızca iki çizgisi olan noktalar en son yerleştirilecek en kolay noktalardır: iki komşusunun arasına otururlar.'],
    mistakes: ['Kenarda yer açmak yerine kalabalık ortada noktaları ileri geri oynatmak.', 'Tahtayı boydan boya geçen ve sonradan her şeyle kesişen uzun bir çizgi bırakmak.'],
  },
};
