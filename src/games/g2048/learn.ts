import type { Lesson } from '../../core/learn';
export const lesson: Lesson = {
  names: { en: '2048', tr: '2048', zh: '2048' },
  en: {
    summary: 'Slide numbered tiles on a 4×4 grid; equal tiles merge. Build a 2048 tile.',
    history: 'Gabriele Cirulli, a 19-year-old Italian developer, wrote 2048 in a weekend in March 2014 as an experiment, building on the earlier games Threes! and 1024. It became one of the most played browser games of the decade.',
    rules: ['Each move slides every tile as far as it can go up, down, left or right.', 'Two tiles of the same number that collide merge into one with their sum; a tile merges only once per move.', 'After every move a new 2 (or sometimes a 4) appears in an empty square.', 'Reach a 2048 tile to win; keep going for more. The game ends when no move changes the board.'],
    basics: ['Keep your biggest tile in a corner.', 'Choose two directions as your main ones and use a third only when you must.', 'Build a chain of decreasing tiles along one edge.'],
    advanced: ['Avoid the fourth direction: it pulls the big tile out of its corner.', 'Merge small tiles early so the board does not clog.'],
    mistakes: ['Swiping at random when the board is nearly full.', 'Leaving a small tile trapped behind big ones.'],
  },
  zh: {
    summary: '在4×4的格子里滑动数字方块，相同的会合并。拼出2048。',
    history: '2014年3月，19岁的意大利开发者加布里埃莱·奇鲁利用一个周末写出2048，灵感来自更早的Threes!和1024。它成了那十年最流行的网页游戏之一。',
    rules: ['每次移动，所有方块都会向上、下、左或右滑到底。', '两个相同数字的方块相撞会合并成它们的和；每次移动中一个方块只合并一次。', '每次移动后，空格中会出现一个2（有时是4）。', '拼出2048即获胜，可以继续挑战。没有任何移动能改变棋盘时游戏结束。'],
    basics: ['把最大的方块放在一个角落。', '选定两个主要方向，迫不得已才用第三个。', '沿一条边排出递减的方块链。'],
    advanced: ['尽量不用第四个方向：它会把大方块拉出角落。', '早点合并小方块，免得棋盘被堵死。'],
    mistakes: ['棋盘快满时乱滑。', '让小方块被困在大方块后面。'],
  },
  tr: {
    summary: '4×4 ızgarada numaralı kareleri kaydır; eşit olanlar birleşir. 2048 karesini yap.',
    history: '19 yaşındaki İtalyan geliştirici Gabriele Cirulli, Mart 2014’te bir hafta sonunda, Threes! ve 1024 oyunlarından esinlenerek 2048’i yazdı. On yılın en çok oynanan tarayıcı oyunlarından biri oldu.',
    rules: ['Her hamlede bütün kareler yukarı, aşağı, sola ya da sağa gidebildiği yere kadar kayar.', 'Çarpışan iki eşit kare toplamları olan tek bir kareye dönüşür; bir kare bir hamlede yalnızca bir kez birleşir.', 'Her hamleden sonra boş bir yere yeni bir 2 (bazen 4) gelir.', '2048 karesine ulaşınca kazanırsın, istersen devam edersin. Hiçbir hamle tahtayı değiştirmiyorsa oyun biter.'],
    basics: ['En büyük kareni bir köşede tut.', 'İki ana yön seç, üçüncüsünü yalnızca mecbur kalınca kullan.', 'Bir kenar boyunca küçülen bir zincir kur.'],
    advanced: ['Dördüncü yönden kaçın: büyük kareyi köşesinden çeker.', 'Tahta tıkanmasın diye küçük kareleri erken birleştir.'],
    mistakes: ['Tahta dolmak üzereyken rastgele kaydırmak.', 'Küçük bir kareyi büyüklerin arkasında sıkışık bırakmak.'],
  },
};
