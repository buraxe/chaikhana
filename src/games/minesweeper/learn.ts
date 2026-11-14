import type { Lesson } from '../../core/learn';
export const lesson: Lesson = {
  names: { en: 'Minesweeper', tr: 'Mayın Tarlası', zh: '扫雷', pinyin: 'sǎoléi' },
  en: {
    summary: 'Open every safe square without touching a mine. Numbers tell you how many mines touch each square.',
    history: 'Grid games about hidden mines appeared on home computers in the early 1980s, such as Mined-Out in 1983. Microsoft\'s Minesweeper, by Robert Donner and Curt Johnson, came out in a Windows Entertainment Pack in 1990 and shipped with Windows 3.1 in 1992, which made it one of the most played computer games ever. Its standard levels are the ones used here.',
    rules: [
      'Click a square to open it. A number shows how many of its eight neighbours hide mines. A blank square opens its neighbours automatically.',
      'Flag a square you know is a mine. Flags are notes for you; they do not count toward winning.',
      'Opening a mine ends the game. Opening every safe square wins.',
      'The first click is always safe here, and opens an area.',
      'Levels: Beginner 9×9 with 10 mines, Intermediate 16×16 with 40, Expert 30×16 with 99.',
    ],
    basics: [
      'A 1 touching exactly one hidden square: that square is a mine.',
      'A number whose mines are all flagged: every other neighbour is safe. Click the number to open them all at once.',
      'Work along the edge of the opened area. That is where the information is.',
    ],
    advanced: [
      'The 1-2-1 pattern along a straight edge: the mines are under the two 1s, the square under the 2 is safe.',
      'The 1-2-2-1 pattern: the mines are under the two 2s.',
      'Subtract: if one number\'s hidden neighbours are a subset of another\'s, the difference in their counts belongs to the extra squares.',
      'Some positions are true 50/50 guesses. Make them early so a loss costs less time.',
    ],
    mistakes: ['Flagging from a hunch and then trusting the flag.', 'Clicking a number that has a wrong flag next to it.'],
  },
  zh: {
    summary: '打开所有安全的格子，不要碰到地雷。数字表示周围有几颗雷。',
    history: '以隐藏地雷为主题的方格游戏在1980年代初就出现在家用电脑上，例如1983年的 Mined-Out。微软的扫雷由罗伯特·唐纳和柯特·约翰逊编写，1990年收录于 Windows 娱乐包，1992年随 Windows 3.1 发行，成为玩的人最多的电脑游戏之一。这里使用的就是它的标准难度。',
    rules: [
      '点击格子将其打开。数字表示周围八格中有几颗雷。空白格会自动打开周围的格子。',
      '确定是雷的格子可以插旗。旗子只是给自己的标记，不影响胜负判定。',
      '打开地雷游戏结束；打开所有安全格子即获胜。',
      '这里第一次点击一定安全，并且会打开一片区域。',
      '难度：入门 9×9 共10颗雷，中级 16×16 共40颗，专家 30×16 共99颗。',
    ],
    basics: [
      '数字1只挨着一个未打开的格子：那个格子就是雷。',
      '一个数字周围的雷都已插旗：其余相邻格子都安全。点击这个数字可以一次全部打开。',
      '沿着已打开区域的边缘推理，信息都在那里。',
    ],
    advanced: [
      '直边上的1-2-1：雷在两个1的下面，2下面的格子是安全的。',
      '1-2-2-1：雷在两个2的下面。',
      '做减法：如果一个数字的未开邻格包含在另一个数字的未开邻格之中，两者的雷数之差就属于多出来的那些格子。',
      '有些局面只能五五开猜。尽早去猜，输了也不浪费太多时间。',
    ],
    mistakes: ['凭感觉插旗，之后又相信这面旗。', '在旁边有错旗的情况下点击数字快开。'],
  },
  tr: {
    summary: 'Bir mayına dokunmadan bütün güvenli kareleri aç. Sayılar her kareye kaç mayının değdiğini söyler.',
    history: 'Gizli mayınlı ızgara oyunları ev bilgisayarlarında 1980’lerin başında görüldü; 1983 tarihli Mined-Out bunlardan biridir. Robert Donner ve Curt Johnson’ın yaptığı Microsoft Mayın Tarlası 1990’da bir Windows Eğlence Paketi’nde çıktı ve 1992’de Windows 3.1 ile birlikte gelerek tarihin en çok oynanan bilgisayar oyunlarından biri oldu. Buradaki standart seviyeler onunkilerdir.',
    rules: [
      'Bir kareyi açmak için tıkla. Sayı, sekiz komşusundan kaçının mayın sakladığını gösterir. Boş kare komşularını kendiliğinden açar.',
      'Mayın olduğunu bildiğin kareye bayrak koy. Bayraklar senin notlarındır; kazanmaya sayılmaz.',
      'Mayın açmak oyunu bitirir. Bütün güvenli kareleri açmak kazandırır.',
      'Burada ilk tıklama her zaman güvenlidir ve bir alan açar.',
      'Seviyeler: Acemi 9×9 ve 10 mayın, Orta 16×16 ve 40 mayın, Uzman 30×16 ve 99 mayın.',
    ],
    basics: [
      'Tam bir kapalı kareye değen 1: o kare mayındır.',
      'Mayınlarının hepsi bayraklı bir sayı: diğer bütün komşuları güvenlidir. Hepsini birden açmak için sayıya tıkla.',
      'Açılmış alanın kenarı boyunca çalış. Bilgi oradadır.',
    ],
    advanced: [
      'Düz bir kenar boyunca 1-2-1 deseni: mayınlar iki 1’in altındadır, 2’nin altındaki kare güvenlidir.',
      '1-2-2-1 deseni: mayınlar iki 2’nin altındadır.',
      'Çıkarma: bir sayının kapalı komşuları diğerininkilerin alt kümesiyse, sayılarının farkı fazla karelere aittir.',
      'Bazı durumlar gerçek yazı-tura tahminleridir. Bunları erken yap ki kayıp daha az zamana mal olsun.',
    ],
    mistakes: ['Önseziyle bayrak koyup sonra o bayrağa güvenmek.', 'Yanında yanlış bayrak olan bir sayıya tıklamak.'],
  },
};
