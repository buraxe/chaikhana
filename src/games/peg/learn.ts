import type { Lesson } from '../../core/learn';
export const lesson: Lesson = {
  names: { en: 'Peg Solitaire', zh: '孔明棋', tr: 'Tek Taş', pinyin: 'Kǒngmíng qí' },
  en: {
    summary: 'Jump pegs over each other and take them off until only one is left, ideally in the centre.',
    history: 'The earliest known picture of the game is a French engraving of 1697 showing a princess at the court of Louis XIV with a solitaire board, and the philosopher Leibniz wrote about it in 1710. The 33-hole cross became the standard board in Britain. In China the game is called Kongming chess, after the strategist Zhuge Liang, though there is no evidence he ever played it. On the 33-hole board, finishing with one peg in the centre from a centre start takes at least 18 moves if a run of jumps by the same peg counts as one.',
    rules: ['A move is a jump: a peg leaps over a neighbouring peg, along a line, into the empty hole just beyond.', 'The peg jumped over is taken off the board.', 'On the cross, pegs jump up, down, left and right; on the triangle, also along the two diagonals.', 'The game ends when no jump is possible. One peg left is a win; one peg in the centre is the classic perfect finish.'],
    basics: ['Clear the arms of the cross first and keep the centre crowded until late.', 'Pegs alone in a corner are lost causes: plan to take them early, while a neighbour can still jump them.', 'Think in groups of three in a row: one jump clears two holes and fills one.'],
    advanced: ['Holes come in three colour classes along each line; a jump changes every class count by one. This is why some finishes are impossible from some starts.', 'Long chains of jumps by one peg are the mark of a good solution: look for a peg that can keep going.'],
    mistakes: ['Leaving two pegs far apart at the end, with nothing between them to jump.', 'Emptying the centre too early, so the arms cannot reach each other.'],
  },
  zh: {
    summary: '让棋子互相跳过并把被跳的拿走，直到只剩一枚，最好留在正中心。',
    history: '已知最早的图像是1697年的一幅法国版画，画中路易十四宫廷里的一位公主正在玩这种棋，哲学家莱布尼茨在1710年也写过它。33孔的十字形棋盘后来成为英国的标准棋盘。在中国，这种游戏叫孔明棋，得名于诸葛亮，但没有证据表明他玩过。在33孔棋盘上，从中心空位开始、最后一枚留在中心，若把同一枚棋子的连续跳跃算作一步，至少需要18步。',
    rules: ['每一步都是跳：一枚棋子沿直线跳过相邻的棋子，落进紧挨着的空洞。', '被跳过的棋子从棋盘上拿走。', '十字棋盘上可以上下左右跳；三角棋盘上还可以沿两条斜线跳。', '无子可跳时游戏结束。只剩一枚即为胜利，最后一枚留在中心是经典的完美收官。'],
    basics: ['先清理十字的四条臂，中心尽量留到最后。', '孤零零留在角落的棋子没救了：趁旁边还有棋子能跳它时，早点处理。', '以三个一排来思考：一跳清空两个洞，填上一个洞。'],
    advanced: ['每条线上的孔可以分成三种颜色，每跳一步，每种颜色的棋子数都变化一。这就是为什么某些开局不可能得到某些结局。', '同一枚棋子的长串连跳是好解法的标志：找一枚能一直跳下去的棋子。'],
    mistakes: ['最后留下两枚相距很远的棋子，中间没有可跳的棋子。', '过早清空中心，四条臂之间无法互相到达。'],
  },
  tr: {
    summary: 'Taşları birbirinin üstünden atlatıp atlananları kaldır; tek taş kalana kadar devam et, tercihen ortada.',
    history: 'Oyunun bilinen en eski resmi, XIV. Louis’nin sarayında bir prensesi solitaire tahtasıyla gösteren 1697 tarihli bir Fransız gravürüdür; filozof Leibniz de 1710’da oyun hakkında yazdı. 33 delikli haç İngiltere’de standart tahta oldu. Çin’de oyuna stratejist Zhuge Liang’ın adından Kongming satrancı denir; ama onun bu oyunu oynadığına dair bir kanıt yoktur. 33 delikli tahtada ortadan başlayıp tek taşı ortada bırakmak, aynı taşın arka arkaya atlayışları tek hamle sayılırsa en az 18 hamle sürer.',
    rules: ['Her hamle bir atlayıştır: bir taş, bir doğru boyunca komşu taşın üstünden hemen ötedeki boş deliğe atlar.', 'Üstünden atlanan taş tahtadan kaldırılır.', 'Haçta taşlar yukarı, aşağı, sola ve sağa atlar; üçgende iki çapraz boyunca da atlar.', 'Atlayış kalmayınca oyun biter. Tek taş kalması kazanmaktır; tek taşın ortada kalması klasik kusursuz bitiştir.'],
    basics: ['Önce haçın kollarını temizle, ortayı sonlara kadar kalabalık tut.', 'Köşede yalnız kalan taşlar kurtarılamaz: bir komşusu onları hâlâ atlayabilirken erkenden al.', 'Üçlü sıralar hâlinde düşün: bir atlayış iki deliği boşaltır, birini doldurur.'],
    advanced: ['Her doğru üzerindeki delikler üç renk sınıfına ayrılır; her atlayış her sınıfın sayısını bir değiştirir. Bazı bitişlerin bazı başlangıçlardan imkânsız olmasının nedeni budur.', 'Tek bir taşın uzun atlayış zincirleri iyi bir çözümün işaretidir: devam edebilecek bir taş ara.'],
    mistakes: ['Sonda aralarında atlanacak taş olmayan, birbirinden uzak iki taş bırakmak.', 'Ortayı çok erken boşaltıp kolların birbirine ulaşamamasına yol açmak.'],
  },
};
