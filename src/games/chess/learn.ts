import type { Lesson } from '../../core/learn';
export const lesson: Lesson = {
  names: { en: 'Chess', tr: 'Satranç', zh: '国际象棋' },
  en: {
    summary: 'The world’s game of war on 64 squares: checkmate the enemy king.',
    history: 'Chess grew out of the Indian game chaturanga around the sixth century, passed through Persia as shatranj and reached Europe through the Islamic world. The modern rules, with the powerful queen and bishop, settled in Spain and Italy around 1475. Today it is played by hundreds of millions, from park benches to world championships.',
    rules: [
      'White moves first. The king moves one square any way; the queen any distance in a straight line or diagonal; the rook straight; the bishop diagonally; the knight in an L and may jump.',
      'Pawns move one square forward (two from their first square) and capture diagonally. A pawn reaching the last rank promotes, usually to a queen.',
      'Castling: king two squares towards a rook that has not moved, the rook jumps over, if neither has moved, the squares between are empty, and the king is not in check or passing through check.',
      'En passant: a pawn that has just moved two squares can be taken by an enemy pawn beside it as if it had moved one.',
      'You may not leave your king in check. Checkmate (in check with no escape) wins. No legal move but not in check is stalemate, a draw.',
      'Draws also come by threefold repetition, fifty moves without a capture or pawn move, or too little material to mate.',
    ],
    basics: ['Develop knights and bishops early, castle, and fight for the centre.', 'Count before you capture: what attacks the square, and what defends it?', 'Before each move, ask what your opponent’s last move threatens.'],
    advanced: ['Rooks love open files and the seventh rank.', 'In the endgame the king becomes a fighting piece: bring it to the centre.'],
    mistakes: ['Moving the queen out early, only to lose time as it is chased.', 'Grabbing pawns while the king is still in the centre.'],
  },
  zh: {
    summary: '64格上的世界性战棋：将死对方的王。',
    history: '国际象棋源自约六世纪印度的恰图兰卡，经波斯（称shatranj）传入伊斯兰世界，再传到欧洲。约1475年在西班牙和意大利形成以强大皇后和象为特点的现代规则。如今从公园长椅到世界冠军赛，数以亿计的人在下棋。',
    rules: ['白方先走。王向任意方向走一格；后沿直线或斜线走任意格；车走直线；象走斜线；马走“日”字，可以跳过棋子。', '兵向前走一格（第一步可走两格），斜吃。兵走到底线升变，通常变后。', '王车易位：王向未动过的车方向走两格，车越过王；要求两者都未动过、中间无子、王不在被将军状态也不经过被攻击的格。', '吃过路兵：刚走两格的兵可被旁边的敌兵当作只走一格那样吃掉。', '不能让自己的王处于被将军状态。将死获胜；无子可动但未被将军为逼和。', '三次重复局面、五十步无吃子无兵动、或子力不足以将死都判和。'],
    basics: ['尽早出马和象，王车易位，争夺中心。', '吃子前先数：有几个子攻击这一格，几个子保护？', '每走一步前，先想想对方上一步威胁什么。'],
    advanced: ['车喜欢开放线和第七横线。', '残局里王也是战斗力：把它带到中心。'],
    mistakes: ['过早出后，被追赶浪费步数。', '王还在中心就去贪吃兵。'],
  },
  tr: {
    summary: '64 karede dünyanın savaş oyunu: rakip şahı mat et.',
    history: 'Satranç, altıncı yüzyıl civarında Hindistan’daki çaturanga oyunundan doğdu, İran’da şatranç adıyla gelişti ve İslam dünyası üzerinden Avrupa’ya ulaştı. Güçlü vezir ve filiyle bugünkü kurallar 1475 civarında İspanya ve İtalya’da oturdu. Bugün park banklarından dünya şampiyonalarına yüz milyonlarca kişi oynar.',
    rules: ['Beyaz başlar. Şah her yöne bir kare gider; vezir düz ya da çapraz istediği kadar; kale düz; fil çapraz; at L çizerek gider ve taşların üstünden atlar.', 'Piyon bir kare ileri gider (ilk karesinden iki), çapraz alır. Son sıraya ulaşan piyon terfi eder, genellikle vezir olur.', 'Rok: şah, hiç oynamamış bir kaleye doğru iki kare gider, kale üstünden atlar; ikisi de oynamamış, aradaki kareler boş olmalı ve şah tehdit altında olmamalı ya da tehdit altındaki kareden geçmemeli.', 'Geçerken alma: iki kare ilerleyen piyonu yanındaki rakip piyon bir kare ilerlemiş gibi alabilir.', 'Şahını tehdit altında bırakamazsın. Mat (kaçışı olmayan şah) kazandırır. Şah çekilmiyorken yasal hamle kalmaması pattır, beraberliktir.', 'Üç kez aynı pozisyon, elli hamle boyunca taş alınmaması ya da piyon oynanmaması, mat için yetersiz taş da beraberliktir.'],
    basics: ['Atları ve filleri erken çıkar, rok yap, merkez için savaş.', 'Almadan önce say: o kareye kaç taş saldırıyor, kaç taş koruyor?', 'Her hamleden önce rakibin son hamlesinin neyi tehdit ettiğini sor.'],
    advanced: ['Kaleler açık hatları ve yedinci yatayı sever.', 'Oyun sonunda şah da savaşan bir taştır: onu merkeze getir.'],
    mistakes: ['Veziri erken çıkarıp kovalanırken zaman kaybetmek.', 'Şah hâlâ merkezdeyken piyon toplamaya çalışmak.'],
  },
};
