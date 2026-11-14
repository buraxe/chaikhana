import type { Lesson } from '../../core/learn';
export const lesson: Lesson = {
  names: { en: 'Gomoku', tr: 'Gomoku', zh: '五子棋', pinyin: 'wǔzǐqí' },
  en: {
    summary: 'Two players take turns placing stones. The first to line up five in a row wins.',
    history: 'Five-in-a-row is played across East Asia on a Go board with Go stones. The English name comes from the Japanese gomoku narabe. Because the first player has a large advantage, Japanese players developed restrictions on Black around the turn of the twentieth century. That rule set was named Renju in 1899 and is still the tournament standard, overseen since 1988 by the Renju International Federation.',
    rules: [
      'The board is 15×15. Black plays first, then the players alternate, one stone per turn. Stones never move and are never captured.',
      'A line of five can be horizontal, vertical or diagonal.',
      'Freestyle: five or more in a row wins.',
      'Standard: exactly five wins. Six or more in a row (an overline) does not count.',
      'Renju: Black wins only with exactly five and may not play an overline, a double-four or a double-three. White has no restrictions and may win with an overline. A move that makes exactly five is always allowed.',
      'If the board fills with no five, the game is a draw.',
    ],
    basics: [
      'An open three (three in a row with both ends free) threatens to become an open four, which cannot be stopped. Answer it at once unless you have a four of your own.',
      'A four must be blocked on the next move. Use your fours to gain tempo, not just to make your opponent block.',
      'Build in two directions at the same time. One stone that extends two lines is worth two moves.',
      'When blocking a three, choose the end that also helps your own shape.',
    ],
    advanced: [
      'Four-three: one move that makes a four and an open three. The opponent must block the four, and the three then becomes an open four. This is the standard winning pattern, and the only double threat Black may use in Renju.',
      'VCF, victory by continuous fours: a chain of fours where each one forces a single reply, ending in a double threat. Before every move, check whether you or your opponent has one.',
      'In Renju, White can win by forcing Black to block on a forbidden point. Look for squares where Black would make a double-three or double-four.',
      'Keep the initiative. A quiet move that prepares two future threes is often stronger than an immediate three that gets blocked.',
    ],
    mistakes: [
      'Playing a three that the opponent blocks with a move that builds their own line.',
      'Spending fours early. A four that has already been blocked cannot be part of a later four-three.',
      'Watching only your own attack and missing an opponent\'s three on a diagonal.',
    ],
  },
  zh: {
    summary: '双方轮流落子，先在一条线上连成五子的一方获胜。',
    history: '五子棋在东亚各地流行，用围棋的棋盘和棋子来下。由于先手优势很大，日本棋手在二十世纪初为黑方制定了禁手规则，这套规则在1899年定名为“连珠”，至今仍是比赛标准，1988年起由国际连珠联盟管理。',
    rules: [
      '棋盘为15×15。黑方先行，双方轮流每次下一子。棋子落下后不移动，也不会被提走。',
      '五子连线可以是横向、纵向或斜向。',
      '自由规则：连成五子或更多即获胜。',
      '标准规则：恰好五子获胜，六子或以上（长连）不算。',
      '连珠规则：黑方只有恰好五子才算赢，并且禁止长连、双四和双三；白方没有限制，长连也算赢。能直接成五的一手永远允许。',
      '棋盘下满仍无五连，则为和棋。',
    ],
    basics: [
      '活三（两端都空的三连）会变成无法阻挡的活四。除非自己有冲四，否则要立刻应对。',
      '冲四必须马上挡住。用冲四来抢先手，而不只是逼对方防守。',
      '同时向两个方向发展。一子连通两条线，相当于两步棋。',
      '挡三时，选择同时对自己棋形有利的那一端。',
    ],
    advanced: [
      '四三：一步同时形成冲四和活三。对方必须挡四，活三随即变成活四。这是最常见的取胜手段，也是连珠规则下黑方唯一允许的双重威胁。',
      'VCF（连续冲四取胜）：一连串冲四，每一步都只有一种应法，最后形成双重威胁。每走一步前，都检查双方是否有这样的机会。',
      '在连珠规则下，白方可以逼黑方在禁手点上防守而获胜。留意哪些点会让黑方形成双三或双四。',
      '保持主动。一步为将来两个活三做准备的“缓着”，往往比马上被挡住的活三更有力。',
    ],
    mistakes: [
      '下出的三被对方挡住，而对方挡的那一步正好加强了自己的连线。',
      '过早用掉冲四。已经被挡住的四不能再参与后面的四三。',
      '只顾自己进攻，没看到对方斜线上的三。',
    ],
  },
  tr: {
    summary: 'İki oyuncu sırayla taş koyar. Beşini bir sıraya ilk dizen kazanır.',
    history: 'Beşli dizme bütün Doğu Asya’da Go tahtasında, Go taşlarıyla oynanır. Adı Japonca gomoku narabe’den gelir. İlk oyuncunun avantajı büyük olduğu için Japon oyuncular yirminci yüzyılın başlarında Siyah’a kısıtlamalar getirdi. Bu kural takımına 1899’da Renju adı verildi; bugün hâlâ turnuva standardıdır ve 1988’den beri Uluslararası Renju Federasyonu tarafından yönetilir.',
    rules: [
      'Tahta 15×15’tir. İlk Siyah oynar, sonra oyuncular sırayla her seferinde bir taş koyar. Taşlar hiç hareket etmez ve alınmaz.',
      'Beşli yatay, dikey ya da çapraz olabilir.',
      'Serbest: beş ya da daha fazla taş dizen kazanır.',
      'Standart: tam beş kazandırır. Altı ya da daha uzun dizi (uzun sıra) sayılmaz.',
      'Renju: Siyah yalnızca tam beşle kazanır; uzun sıra, çift dörtlü ya da çift üçlü oynayamaz. Beyaz’a kısıtlama yoktur, uzun sırayla da kazanabilir. Tam beş yapan hamleye her zaman izin verilir.',
      'Tahta dolar ve beşli oluşmazsa oyun berabere biter.',
    ],
    basics: [
      'Açık üçlü (iki ucu boş üç taş) durdurulamaz bir açık dörtlüye dönüşmekle tehdit eder. Kendi dörtlün yoksa hemen cevap ver.',
      'Dörtlü bir sonraki hamlede kapatılmalıdır. Dörtlülerini rakibe yalnızca kapattırmak için değil, tempo kazanmak için kullan.',
      'Aynı anda iki yönde kur. İki çizgiyi uzatan bir taş iki hamle değerindedir.',
      'Bir üçlüyü kapatırken kendi şekline de yarayan ucu seç.',
    ],
    advanced: [
      'Dört-üç: hem dörtlü hem açık üçlü yapan tek bir hamle. Rakip dörtlüyü kapatmak zorundadır, üçlü de açık dörtlüye dönüşür. Standart kazanma kalıbıdır ve Renju’da Siyah’ın kullanabileceği tek çifte tehdittir.',
      'VCF, ardışık dörtlülerle zafer: her biri tek bir cevabı zorlayan ve çifte tehditle biten dörtlüler zinciri. Her hamleden önce sende ya da rakibinde böyle bir zincir olup olmadığına bak.',
      'Renju’da Beyaz, Siyah’ı yasak bir noktada kapatmaya zorlayarak kazanabilir. Siyah’ın çift üçlü ya da çift dörtlü yapacağı kareleri ara.',
      'İnisiyatifi elinde tut. İleride iki üçlü hazırlayan sessiz bir hamle, hemen kapatılan bir üçlüden çoğu zaman daha güçlüdür.',
    ],
    mistakes: [
      'Rakibin kendi çizgisini kuran bir hamleyle kapattığı bir üçlü oynamak.',
      'Dörtlüleri erken harcamak. Kapatılmış bir dörtlü sonraki bir dört-üçün parçası olamaz.',
      'Yalnızca kendi saldırını izleyip rakibin çaprazdaki üçlüsünü kaçırmak.',
    ],
  },
};
