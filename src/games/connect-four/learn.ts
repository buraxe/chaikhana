import type { Lesson } from '../../core/learn';
export const lesson: Lesson = {
  names: { en: 'Connect Four', tr: 'Dört Bağla', zh: '四子棋', pinyin: 'sìzǐqí' },
  en: {
    summary: 'Drop discs into a 7-column, 6-row frame. Four in a row in any direction wins.',
    history: 'Connect Four was published by Milton Bradley in 1974, designed by Howard Wexler and Ned Strongin. In 1988 James Dow Allen and Victor Allis solved it independently: the first player can always win by starting in the centre column and playing perfectly.',
    rules: [
      'Red moves first. On your turn, drop one disc into any column that is not full. It falls to the lowest empty space.',
      'Four of your discs in a line, horizontally, vertically or diagonally, wins.',
      'If all 42 spaces fill with no line, the game is a draw.',
    ],
    basics: [
      'The centre column is part of more possible lines than any other. Start there.',
      'Before every move, check whether your opponent can win next turn, and whether your move gives them a space on top of it.',
      'Two discs with open ends on the bottom row become an unstoppable three. Block early.',
    ],
    advanced: [
      'A threat is an empty space that would complete your four. A threat directly above another threat cannot be stopped.',
      'Odd-even rule: count rows from the bottom. Late in the game, the first player\'s threats on odd rows and the second player\'s on even rows tend to be the ones that get played, because the board fills column by column.',
      'Zugzwang decides many endgames: when every safe column is full, someone must play under the other side\'s threat.',
    ],
    mistakes: ['Playing directly below an opponent\'s threat.', 'Spreading discs on the edges, where they make few lines.'],
  },
  zh: {
    summary: '把棋子投入7列6行的竖直棋盘，任意方向连成四子即获胜。',
    history: '四子棋由米尔顿·布拉德利公司于1974年出版，设计者是霍华德·韦克斯勒和内德·斯特朗金。1988年，詹姆斯·道·艾伦和维克多·阿利斯分别独立破解了这个游戏：先手只要从中间一列开始并走出完美的每一步，就一定能赢。',
    rules: [
      '红方先行。轮到你时，把一枚棋子投入任意未满的一列，棋子落到该列最下面的空位。',
      '横、竖或斜向连成四子即获胜。',
      '42个位置全部填满仍无人连成四子，则为和棋。',
    ],
    basics: [
      '中间一列参与的连线最多，从这里开始。',
      '每走一步前，先看对方下一步能不能赢，以及你的这一步会不会把它上面的位置让给对方。',
      '底行两端都空的两子会变成挡不住的三子，要尽早拦截。',
    ],
    advanced: [
      '威胁是指能让你连成四子的空位。两个上下相邻的威胁无法同时阻挡。',
      '奇偶规律：从下往上数行。到了后期，先手在奇数行的威胁、后手在偶数行的威胁往往会兑现，因为棋盘是一列一列填满的。',
      '很多残局由“逼走”决定：安全的列都满了之后，总有一方只能在对方威胁的正下方落子。',
    ],
    mistakes: ['在对方威胁的正下方落子。', '把棋子分散在边上，那里能组成的连线很少。'],
  },
  tr: {
    summary: '7 sütun, 6 satırlık bir çerçeveye pul bırak. Herhangi bir yönde dördünü dizen kazanır.',
    history: 'Dört Bağla’yı (Connect Four) Howard Wexler ve Ned Strongin tasarladı, Milton Bradley 1974’te yayımladı. 1988’de James Dow Allen ve Victor Allis oyunu birbirinden bağımsız olarak çözdü: ilk oyuncu orta sütundan başlayıp kusursuz oynarsa her zaman kazanır.',
    rules: [
      'İlk Kırmızı oynar. Sıran gelince dolu olmayan herhangi bir sütuna bir pul bırak. Pul en alttaki boş yere düşer.',
      'Yatay, dikey ya da çapraz bir çizgide dört pulun olursa kazanırsın.',
      '42 yerin hepsi dolar ve dörtlü oluşmazsa oyun berabere biter.',
    ],
    basics: [
      'Orta sütun diğerlerinden daha çok olası çizginin parçasıdır. Oradan başla.',
      'Her hamleden önce rakibinin bir sonraki sırada kazanıp kazanamayacağına ve hamlenin ona üstünde bir yer açıp açmadığına bak.',
      'Alt satırda iki ucu açık iki pul durdurulamaz bir üçlüye dönüşür. Erken kapat.',
    ],
    advanced: [
      'Tehdit, dörtlünü tamamlayacak boş bir yerdir. Başka bir tehdidin hemen üstündeki tehdit durdurulamaz.',
      'Tek-çift kuralı: satırları alttan say. Oyunun sonlarında, tahta sütun sütun dolduğu için ilk oyuncunun tek satırlardaki, ikinci oyuncunun çift satırlardaki tehditleri gerçekleşme eğilimindedir.',
      'Birçok oyun sonunu zugzwang belirler: güvenli bütün sütunlar dolunca biri karşı tarafın tehdidinin altına oynamak zorunda kalır.',
    ],
    mistakes: ['Rakibin tehdidinin hemen altına oynamak.', 'Pulları az çizgi kurdukları kenarlara dağıtmak.'],
  },
};
