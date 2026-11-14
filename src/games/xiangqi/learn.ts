import type { Lesson } from '../../core/learn';
export const lesson: Lesson = {
  names: { en: 'Xiangqi', tr: 'Xiangqi (Çin satrancı)', zh: '象棋', trad: '象棋', pinyin: 'xiàngqí' },
  en: {
    summary: 'Chinese chess: generals in palaces, a river across the board and cannons that jump to capture.',
    history: 'Xiangqi took its modern form in the Song dynasty (960–1279), and is one of the most played board games in the world, seen on every street corner in China and Vietnam. Pieces stand on the points where lines cross, and the board is split by the river, “Chu river, Han border”, after the war between the states of Chu and Han.',
    rules: [
      'Red moves first. Win by checkmating the enemy general, or by leaving the opponent with no legal move.',
      'The general and advisors stay inside the palace (the 3×3 box with diagonals): the general moves one point straight, advisors one point diagonally.',
      'Elephants move exactly two points diagonally, cannot jump over a piece in between, and may not cross the river.',
      'Horses move one point straight then one diagonally; a piece next to the horse in that direction blocks it.',
      'Chariots move like rooks. Cannons move like rooks but capture only by jumping over exactly one piece.',
      'Soldiers move one point forward; after crossing the river they may also move sideways. They never move back.',
      'The two generals may never face each other on an open file.',
    ],
    basics: ['The chariot is the strongest piece: get it into play early.', 'A cannon needs a screen to capture; at the start it attacks well from the middle file.', 'Keep your advisors and elephants beside the general for defence.'],
    advanced: ['The flying-general rule is a weapon: a piece pinned on the file between the generals cannot move.', 'Horses are strong in the middle game but easy to block; cannons get stronger with many pieces on the board, horses with few.'],
    mistakes: ['Pushing soldiers early without support.', 'Forgetting that a horse can be blocked by a piece next to it.'],
  },
  zh: {
    summary: '中国象棋：九宫中的将帅、横贯棋盘的河界、隔子吃子的炮。',
    history: '象棋在宋代（960–1279）定型，是世界上下得最多的棋类之一，中国和越南的街头巷尾随处可见。棋子摆在线的交叉点上，棋盘中间的“楚河汉界”源自楚汉相争。',
    rules: ['红方先走。将死对方的将（帅），或使对方无子可动即获胜。', '将（帅）和士只能在九宫内活动：将走一步直线，士走一步斜线。', '象（相）走“田”字，田心有子不能走（塞象眼），不能过河。', '马走“日”字，先直后斜；直行方向紧邻有子时被“蹩马腿”。', '车走直线，不限格数。炮走法同车，但吃子时必须隔一个子（炮架）。', '兵（卒）只能向前走一步；过河后可以横走，永不后退。', '双方将帅不能在同一直线上直接照面。'],
    basics: ['车是最强的子，要尽早出动。', '炮要有炮架才能吃子；开局时当头炮很有威力。', '士、象守在将旁边，防守稳固。'],
    advanced: ['“对脸”规则可以利用：将帅之间被牵制的子不能离开。', '马在中局有力但容易被蹩；子多时炮强，子少时马强。'],
    mistakes: ['过早冲兵而没有支援。', '忘记马会被紧邻的子蹩住。'],
  },
  tr: {
    summary: 'Çin satrancı: saraydaki generaller, tahtayı ikiye bölen nehir ve atlayarak alan toplar.',
    history: 'Xiangqi bugünkü biçimini Song hanedanlığında (960–1279) aldı; dünyada en çok oynanan tahta oyunlarından biridir, Çin’de ve Vietnam’da her sokak köşesinde görülür. Taşlar çizgilerin kesiştiği noktalara konur; tahtayı bölen “Chu nehri, Han sınırı” adını Chu ve Han devletleri arasındaki savaştan alır.',
    rules: ['Kırmızı başlar. Rakip generali mat eden ya da rakibi yasal hamlesiz bırakan kazanır.', 'General ve danışmanlar sarayın (çaprazlı 3×3 alan) dışına çıkamaz: general bir nokta düz, danışman bir nokta çapraz gider.', 'Filler tam iki nokta çapraz gider, aradaki noktada taş varsa gidemez ve nehri geçemez.', 'At bir nokta düz, sonra bir nokta çapraz gider; o yönde yanında taş varsa atın bacağı kapanır ve gidemez.', 'Savaş arabası kale gibi gider. Top da kale gibi gider ama yalnızca tam bir taşın üstünden atlayarak alır.', 'Er bir nokta ileri gider; nehri geçince yana da gidebilir. Asla geri gitmez.', 'İki general aralarında taş olmadan aynı hatta karşı karşıya gelemez.'],
    basics: ['Savaş arabası en güçlü taştır: erkenden oyuna sok.', 'Topun alması için arada bir taş gerekir; başta orta hattan güçlü saldırır.', 'Danışmanları ve filleri savunma için generalin yanında tut.'],
    advanced: ['Generallerin karşılaşma yasağı bir silahtır: aralarında kalan taş kıpırdayamaz.', 'Atlar oyun ortasında güçlüdür ama kolay engellenir; taş çokken top, azken at güçlenir.'],
    mistakes: ['Destek olmadan erleri erken ilerletmek.', 'Atın yanındaki taşla engellenebileceğini unutmak.'],
  },
};
