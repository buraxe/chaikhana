import type { Lesson } from '../../core/learn';
export const lesson: Lesson = {
  names: { en: 'Reversi', tr: 'Reversi', zh: '黑白棋', pinyin: 'hēibáiqí' },
  en: {
    summary: 'Trap your opponent\'s discs between yours to flip them. The most discs at the end wins.',
    history: 'Reversi was published in England in the 1880s, with rival claims by Lewis Waterman and John W. Mollett. In 1971 Goro Hasegawa in Japan popularised the version with the fixed four-disc start, under the name Othello, and that is the form played in tournaments today.',
    rules: ['The game starts with two black and two white discs in the centre. Black moves first.', 'Place a disc so that one or more straight lines of opposing discs (in any of eight directions) lie between it and another of your discs. All of those discs flip to your colour.', 'If you have no legal move you pass. When neither player can move, the game ends and the player with more discs wins.'],
    basics: ['Corners can never be flipped. Take them when you can.', 'Avoid the squares diagonally next to an empty corner; they often give the corner away.', 'Early on, fewer discs is often better: keep your opponent short of good moves.'],
    advanced: ['Mobility, the number of moves you have, matters more than disc count in the middle game.', 'Edges are strong only when they cannot be broken into. Count which side would be forced to move next on an edge.', 'Parity: try to make the last move in each empty region of the board.'],
    mistakes: ['Flipping as many discs as possible every move.', 'Playing next to an empty corner.'],
  },
  zh: {
    summary: '把对方的棋子夹在自己的两枚棋子之间来翻转它们，终局时棋子多的一方获胜。',
    history: '黑白棋于1880年代在英国出版，刘易斯·沃特曼和约翰·莫利特都声称是发明者。1971年，日本的长谷川五郎推广了固定四子开局的版本，取名“奥赛罗”，今天的比赛使用的就是这种形式。',
    rules: ['开局时中央有黑白各两枚棋子，黑方先行。', '落子时，要让一条或多条直线（八个方向均可）上的对方棋子夹在新棋子和你的另一枚棋子之间，这些棋子全部翻成你的颜色。', '没有合法落子时跳过。双方都无法落子时游戏结束，棋子多的一方获胜。'],
    basics: ['角上的棋子永远不会被翻转，有机会就占角。', '角还空着时，不要下在角的斜邻格，那样往往会把角送给对方。', '开局时棋子少反而常常更好：让对方没有好棋可下。'],
    advanced: ['中盘时，行动力（可下的位置数）比棋子数更重要。', '只有无法被攻破的边才是好边。算一算在一条边上谁会被迫先走。', '奇偶性：争取在棋盘上每一块空白区域里下最后一手。'],
    mistakes: ['每一步都翻最多的棋子。', '在空角旁边落子。'],
  },
  tr: {
    summary: 'Rakibinin pullarını kendi pulların arasında sıkıştırıp çevir. Sonunda en çok pulu olan kazanır.',
    history: 'Reversi 1880’lerde İngiltere’de yayımlandı; Lewis Waterman ve John W. Mollett buluşu sahiplendi. 1971’de Japonya’da Goro Hasegawa sabit dört pullu başlangıçlı versiyonu Othello adıyla yaygınlaştırdı; bugün turnuvalarda oynanan biçim budur.',
    rules: ['Oyun ortada iki siyah ve iki beyaz pulla başlar. İlk Siyah oynar.', 'Bir pulu, onunla kendi başka bir pulun arasında (sekiz yönden herhangi birinde) rakip pullardan oluşan bir ya da daha fazla düz sıra kalacak şekilde koy. O pulların hepsi senin rengine döner.', 'Geçerli hamlen yoksa pas geçersin. İki oyuncu da oynayamayınca oyun biter ve daha çok pulu olan kazanır.'],
    basics: ['Köşeler asla çevrilemez. Fırsat bulunca al.', 'Boş bir köşenin çaprazındaki karelerden kaçın; çoğu zaman köşeyi rakibe verir.', 'Başlarda az pul çoğu zaman daha iyidir: rakibini iyi hamlelerden yoksun bırak.'],
    advanced: ['Oyun ortasında hareket serbestliği, yani hamle sayın, pul sayısından daha önemlidir.', 'Kenarlar yalnızca kırılamadıklarında güçlüdür. Bir kenarda sıradaki hamleyi hangi tarafın yapmak zorunda kalacağını say.', 'Parite: tahtanın her boş bölgesinde son hamleyi yapmaya çalış.'],
    mistakes: ['Her hamlede olabildiğince çok pul çevirmek.', 'Boş bir köşenin yanına oynamak.'],
  },
};
