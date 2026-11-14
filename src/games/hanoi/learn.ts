import type { Lesson } from '../../core/learn';
export const lesson: Lesson = {
  names: { en: 'Tower of Hanoi', tr: 'Hanoi Kulesi', zh: '汉诺塔', pinyin: 'hànnuòtǎ' },
  en: {
    summary: 'Move a stack of disks to another peg, one disk at a time, never putting a larger disk on a smaller one.',
    history: 'The French mathematician Édouard Lucas invented the puzzle and published it in 1883 under the name N. Claus de Siam, an anagram of Lucas d\'Amiens. It came with a legend of priests moving 64 golden disks, and the world ending when they finish. At one move per second that would take about 585 billion years.',
    rules: ['All disks start on the left peg, largest at the bottom.', 'Move one disk at a time: the top disk of any peg to another peg.', 'A disk may never sit on a smaller disk.', 'Move the whole tower to the right-hand peg.'],
    basics: [
      'The smallest disk moves on every other turn, always around the pegs in the same direction.',
      'On the turns between, there is only one legal move that does not touch the smallest disk.',
      'With an odd number of disks, move the smallest disk to the target peg first; with an even number, to the middle peg.',
    ],
    advanced: [
      'Recursion: to move n disks, move n−1 to the spare peg, move the largest, then move the n−1 on top of it.',
      'That gives the minimum: 2ⁿ − 1 moves. Three disks take 7, eight take 255.',
      'Drawn as a graph, the positions of the puzzle form a Sierpiński triangle.',
    ],
    mistakes: ['Moving the smallest disk back and forth between the same two pegs.', 'Starting in the wrong direction for an even number of disks.'],
  },
  zh: {
    summary: '把一叠圆盘移到另一根柱子上，每次只能移动一个，大盘永远不能压在小盘上。',
    history: '这个谜题由法国数学家爱德华·卢卡斯发明，1883年以笔名 N. Claus de Siam 发表，这个名字是 Lucas d’Amiens 的字母重排。它附带一个传说：僧侣们在移动64个金盘，移完之时就是世界末日。按每秒一步计算，大约需要5850亿年。',
    rules: ['所有圆盘一开始都在左边的柱子上，最大的在最下面。', '每次移动一个圆盘：把某根柱子最上面的盘移到另一根柱子上。', '圆盘不能放在比它小的圆盘上面。', '把整座塔移到最右边的柱子上。'],
    basics: [
      '最小的盘每隔一步移动一次，并且总是朝同一个方向绕着柱子走。',
      '中间那一步，不动最小盘的合法走法只有一种。',
      '圆盘数为奇数时，最小盘先移到目标柱；为偶数时，先移到中间柱。',
    ],
    advanced: [
      '递归：要移动 n 个盘，先把上面 n−1 个移到空闲柱，再移最大的盘，最后把 n−1 个盘移到它上面。',
      '由此得到最少步数 2ⁿ − 1：三个盘7步，八个盘255步。',
      '把所有局面画成图，会得到谢尔宾斯基三角形。',
    ],
    mistakes: ['让最小的盘在两根柱子之间来回移动。', '圆盘数为偶数时，第一步方向走反。'],
  },
  tr: {
    summary: 'Bir disk yığınını, her seferinde bir disk taşıyarak ve büyük diski asla küçüğün üstüne koymadan başka bir çubuğa aktar.',
    history: 'Bulmacayı Fransız matematikçi Édouard Lucas icat etti ve 1883’te Lucas d’Amiens’in harf değiştirmesi olan N. Claus de Siam adıyla yayımladı. Yanında, 64 altın diski taşıyan rahiplerin efsanesi geliyordu: işleri bittiğinde dünya sona erecekti. Saniyede bir hamleyle bu yaklaşık 585 milyar yıl sürerdi.',
    rules: ['Bütün diskler sol çubukta başlar, en büyüğü altta.', 'Her seferinde bir disk taşı: herhangi bir çubuğun en üstteki diskini başka bir çubuğa.', 'Bir disk asla daha küçük bir diskin üstüne konamaz.', 'Kulenin tamamını sağdaki çubuğa taşı.'],
    basics: [
      'En küçük disk her iki hamlede bir, hep aynı yönde çubukların etrafında dolaşır.',
      'Aradaki hamlelerde en küçük diske dokunmayan tek bir geçerli hamle vardır.',
      'Disk sayısı tekse en küçük diski önce hedef çubuğa, çiftse ortadaki çubuğa taşı.',
    ],
    advanced: [
      'Özyineleme: n diski taşımak için n−1 diski boş çubuğa taşı, en büyüğü taşı, sonra n−1 diski onun üstüne taşı.',
      'Bu en az hamle sayısını verir: 2ⁿ − 1. Üç disk 7, sekiz disk 255 hamle alır.',
      'Bulmacanın durumları bir çizge olarak çizildiğinde Sierpiński üçgeni oluşur.',
    ],
    mistakes: ['En küçük diski aynı iki çubuk arasında gidip getirmek.', 'Çift sayıda diskte yanlış yönde başlamak.'],
  },
};
