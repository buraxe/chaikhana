import type { Lesson } from '../../core/learn';
export const lesson: Lesson = {
  names: { en: 'Nim', zh: '尼姆游戏', tr: 'Nim', pinyin: 'Nímǔ yóuxì', trad: '尼姆遊戲' },
  en: {
    summary: 'Four rows of matches. Take as many as you like from one row; whoever takes the last match wins.',
    history: 'Games of taking objects from piles are very old, and a Chinese version, 捡石子 "picking stones", is often linked to Nim. The name was given in 1901 by the Harvard mathematician Charles Bouton, who published the complete winning strategy using binary numbers. Nim then became the foundation of combinatorial game theory, and in 1951 the Nimrod computer played it at the Festival of Britain, one of the first computers built just to play a game.',
    rules: [
      'The game starts with four rows of 1, 3, 5 and 7 matches.',
      'On your turn take one or more matches from a single row. You may take a whole row.',
      'Players alternate. Whoever takes the last match wins.',
      'Here you tap a match to take it and every match to its right in that row.',
    ],
    basics: [
      'Two equal rows and nothing else is a won position for the player who must not move: copy every move your opponent makes in the other row.',
      'Leaving 1, 2, 3 is a win for you: whatever your opponent takes, you can answer into two equal rows.',
      'Try to see which positions are lost for the player to move, and hand those to your opponent.',
    ],
    advanced: [
      'Write each row in binary and add them without carrying (the "nim-sum", XOR). If the nim-sum is 0, the player to move loses against perfect play.',
      'To win, always move to a position with nim-sum 0. Find a row whose size goes down when XORed with the nim-sum, and reduce it to that value.',
      'The opening 1-3-5-7 has nim-sum 0, so the second player wins with perfect play. Taking the first move here is a real challenge.',
    ],
    mistakes: ['Taking a whole row out of habit when a smaller take would balance the board.', 'Playing for the last match in a row instead of the last match in the game.', 'Forgetting to recompute the nim-sum after each move.'],
  },
  zh: {
    summary: '四行火柴。每次从一行里拿任意根，谁拿走最后一根火柴谁赢。',
    history: '从几堆东西里轮流拿取的游戏由来已久，中国的“捡石子”常被认为与尼姆游戏有关。“Nim”这个名字由哈佛数学家查尔斯·布顿在1901年起的，他用二进制发表了完整的必胜策略。尼姆游戏随后成为组合博弈论的基础；1951年，Nimrod计算机在英国节上表演尼姆游戏，它是最早专为玩游戏而造的计算机之一。',
    rules: ['游戏开始时有四行火柴：1、3、5、7根。', '轮到你时，从同一行里拿走一根或多根，也可以拿走整行。', '双方轮流进行，拿走最后一根火柴的人获胜。', '这里点一根火柴，就会拿走它以及同一行它右边的所有火柴。'],
    basics: ['只剩两行且根数相同时，不该走的一方必胜：对方在一行拿多少，你就在另一行拿多少。', '留下1、2、3对你有利：无论对方怎么拿，你都能把局面变成两行相等。', '试着找出哪些局面对轮到走的人是输局，然后把它们留给对手。'],
    advanced: ['把每行根数写成二进制，按位相加不进位（即“尼姆和”，异或）。尼姆和为0时，轮到走的人在完美应对下必输。', '要赢，就每次都走到尼姆和为0的局面：找一行，它的根数与尼姆和异或后变小，把这一行减到这个值。', '开局1-3-5-7的尼姆和为0，所以完美对局时后手必胜。在这里选先手是真正的挑战。'],
    mistakes: ['习惯性地拿走整行，其实少拿一点就能让局面平衡。', '只想拿到某一行的最后一根，而不是整局的最后一根。', '每走一步后忘了重新计算尼姆和。'],
  },
  tr: {
    summary: 'Dört sıra kibrit. Tek bir sıradan istediğin kadar al; son kibriti alan kazanır.',
    history: 'Yığınlardan nesne alma oyunları çok eskidir; Çin’deki 捡石子 “taş toplama” oyunu sık sık Nim’le ilişkilendirilir. Adı 1901’de, ikili sayılarla tam kazanma stratejisini yayımlayan Harvard’lı matematikçi Charles Bouton tarafından konuldu. Nim sonra kombinatoryal oyun kuramının temeli oldu; 1951’de Nimrod bilgisayarı Britanya Festivali’nde Nim oynadı. Yalnızca oyun oynamak için yapılmış ilk bilgisayarlardan biriydi.',
    rules: ['Oyun 1, 3, 5 ve 7 kibritlik dört sırayla başlar.', 'Sırası gelen tek bir sıradan bir ya da daha fazla kibrit alır; bütün sırayı da alabilir.', 'Oyuncular sırayla oynar. Son kibriti alan kazanır.', 'Burada bir kibrite dokununca o kibrit ve sırada sağındaki bütün kibritler alınır.'],
    basics: ['Yalnızca iki eşit sıra kaldıysa, hamle sırası olmayan kazanır: rakip bir sıradan ne alırsa sen öbüründen aynısını al.', '1, 2, 3 bırakmak senin lehine: rakip ne alırsa alsın iki eşit sıraya dönebilirsin.', 'Hamle sırası gelen için hangi konumların kayıp olduğunu görmeye çalış ve onları rakibe bırak.'],
    advanced: ['Her sırayı ikili sayıyla yaz ve eldesiz topla (“nim toplamı”, XOR). Nim toplamı 0 ise, kusursuz oyunda hamle sırası gelen kaybeder.', 'Kazanmak için hep nim toplamı 0 olan bir konuma geç: nim toplamıyla XOR’landığında küçülen bir sıra bul ve onu o değere indir.', '1-3-5-7 açılışının nim toplamı 0’dır; kusursuz oyunda ikinci oyuncu kazanır. Burada ilk başlamak gerçek bir meydan okumadır.'],
    mistakes: ['Daha az alarak dengeleyebilecekken alışkanlıkla bütün sırayı almak.', 'Oyunun değil de bir sıranın son kibritini kovalamak.', 'Her hamleden sonra nim toplamını yeniden hesaplamayı unutmak.'],
  },
};
