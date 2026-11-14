import type { Lesson } from '../../core/learn';
export const lesson: Lesson = {
  names: { en: 'Dots and Boxes', tr: 'Noktalar ve Kutular', zh: '点格棋', pinyin: 'diǎngéqí' },
  en: {
    summary: 'Take turns joining dots. Close a box to claim it and move again; the most boxes wins.',
    history: 'The French mathematician Édouard Lucas, also the inventor of the Tower of Hanoi, described the game in 1889 as la pipopipette. It is a favourite of combinatorial game theory: Elwyn Berlekamp wrote a whole book on its strategy.',
    rules: ['Players take turns drawing one line between two neighbouring dots.', 'Drawing the fourth side of a box claims it, and you must draw another line.', 'When every box is claimed, the player with more boxes wins.'],
    basics: ['Never draw the third side of a box unless you must; your opponent will take it.', 'Take every box offered to you, except in the endgame trick below.', 'Late in the game, every line gives boxes away. Count the chains (rows of boxes that can be taken one after another).'],
    advanced: ['Double-dealing: when taking a chain, leave the last two boxes by drawing the line that closes neither. Your opponent takes those two but must then open the next chain for you.', 'The long-chain rule: on a board with an even number of dots in total, the first player wants an odd number of long chains (three or more boxes), and vice versa.', 'When forced to open something, give away the shortest chain first.'],
    mistakes: ['Grabbing every box in the endgame and losing control of the long chains.', 'Opening a long chain while a short one is still available.'],
  },
  zh: {
    summary: '轮流连接两个点。围成一个格子就占领它并再走一次，占格多者获胜。',
    history: '法国数学家爱德华·卢卡斯（汉诺塔的发明者）在1889年以 la pipopipette 之名描述了这个游戏。它是组合博弈论里很受欢迎的例子，埃尔温·伯利坎普专门写了一本书讲它的策略。',
    rules: ['双方轮流在两个相邻的点之间画一条线。', '画上一个格子的第四条边就占领它，并且必须再画一条线。', '所有格子都被占领后，占格多的一方获胜。'],
    basics: ['除非迫不得已，不要画一个格子的第三条边，对方会拿走它。', '送上门的格子都要拿，除了下面说的残局技巧。', '到后期每条线都会送出格子。数一数有几条“链”（可以接连拿走的一串格子）。'],
    advanced: ['让两格：拿一条链时，最后两格不拿，而是画一条不封闭任何格子的线。对方拿走这两格后，必须为你打开下一条链。', '长链规则：点的总数为偶数的棋盘上，先手希望长链（三格以上）的数目为奇数，后手相反。', '被迫打开时，先送出最短的链。'],
    mistakes: ['残局里每个格子都抢，结果失去了对长链的控制。', '还有短链可送时却打开了长链。'],
  },
  tr: {
    summary: 'Sırayla noktaları birleştir. Bir kutuyu kapatan onu alır ve yeniden oynar; en çok kutusu olan kazanır.',
    history: 'Hanoi Kulesi’nin de mucidi olan Fransız matematikçi Édouard Lucas, oyunu 1889’da la pipopipette adıyla anlattı. Kombinatoryal oyun kuramının gözdesidir: Elwyn Berlekamp stratejisi üzerine koca bir kitap yazdı.',
    rules: ['Oyuncular sırayla komşu iki nokta arasına bir çizgi çizer.', 'Bir kutunun dördüncü kenarını çizen kutuyu alır ve bir çizgi daha çizmek zorundadır.', 'Bütün kutular alınınca daha çok kutusu olan kazanır.'],
    basics: ['Zorunda değilsen bir kutunun üçüncü kenarını asla çizme; rakibin alır.', 'Aşağıdaki oyun sonu hilesi dışında sana verilen her kutuyu al.', 'Oyunun sonlarında her çizgi kutu verdirir. Zincirleri (art arda alınabilen kutu dizilerini) say.'],
    advanced: ['Çifte bırakma: bir zinciri alırken son iki kutuyu, ikisini de kapatmayan çizgiyi çizerek bırak. Rakibin o ikisini alır ama sonra sıradaki zinciri sana açmak zorunda kalır.', 'Uzun zincir kuralı: toplam nokta sayısı çift olan bir tahtada ilk oyuncu tek sayıda uzun zincir (üç ya da daha fazla kutu) ister; ikinci oyuncu tersini.', 'Bir şey açmak zorunda kalınca önce en kısa zinciri ver.'],
    mistakes: ['Oyun sonunda her kutuyu kapıp uzun zincirlerin kontrolünü kaybetmek.', 'Kısa bir zincir dururken uzun bir zincir açmak.'],
  },
};
