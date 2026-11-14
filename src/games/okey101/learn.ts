import type { Lesson } from '../../core/learn';
export const lesson: Lesson = {
  names: { en: '101 Okey', tr: '101 Okey', zh: '101 Okey' },
  en: {
    summary: 'The Turkish game of laying sets: open with 101 points, empty your rack, and keep your penalty total low over several rounds.',
    history: '101 Okey uses the same tiles as Okey but plays like a rummy where sets go down on the table. It is the version most often played for points over an evening in Turkey, with its own vocabulary: opening is açmak, adding a tile to a set on the table is işlemek, and a set of pairs is çift.',
    rules: [
      'Same 106 tiles, indicator and okeys as Okey. The player to the dealer\'s right gets 22 tiles and opens by discarding; the others get 21.',
      'On your turn, draw from the centre or take the discard on your left. A tile taken from the left must be used in that turn; you may put it back before using it.',
      'To open, lay sets worth at least 101 points together (runs and groups, scored at face value; an okey counts as the tile it replaces, and a 1 after 13 counts 1), or at least five pairs.',
      'Once open, you may lay more sets and add tiles to any set on the table. A player who opened with pairs lays only pairs, but may still add tiles to sets.',
      'Penalties during play: 101 for discarding an okey, and 101 for discarding a tile that could have been added to a set on the table.',
      'Finish by laying everything except one tile and discarding it. The finisher scores −101; finishing by discarding an okey, finishing with pairs, or finishing in one go before anyone else opened doubles the round.',
      'Others: 202 if they never opened, otherwise the face value of their remaining tiles (doubled for pair openers), plus 101 for each okey still held. If the tiles run out, remaining tiles are counted the same way.',
      'Lowest total after the chosen number of rounds wins. Not included yet: taking an okey back from a set on the table, raising the opening threshold after each opening, and partnership play.',
    ],
    basics: [
      'Count your best sets early. Most hands need two or three rounds of drawing before they reach 101.',
      'High tiles open faster but cost more if they are left on your rack. Use them in sets or throw the useless ones early.',
      'Never hold an okey to the end of a round: it costs 101.',
    ],
    advanced: [
      'With five or more pairs early, a pairs opening is quick, but your leftovers count double. Use it only if you can empty your rack fast.',
      'Before discarding, check the table: any tile that fits a set there costs 101 to throw away.',
      'Watch what the player on your right needs and avoid feeding them tiles that complete their opening.',
    ],
    mistakes: ['Waiting for a huge opening while others empty their racks.', 'Discarding a tile that fits a set on the table.'],
  },
  zh: {
    summary: '土耳其的出牌组游戏：用101分开牌，把牌架出空，在几局下来尽量让罚分总数最低。',
    history: '101 Okey 用的牌和 Okey 一样，但玩法更像把牌组摆上桌的拉密。在土耳其，这是晚上按分数玩上几局时最常见的版本，也有自己的术语：开牌叫 açmak，往桌上的牌组加牌叫 işlemek，对子叫 çift。',
    rules: [
      '牌、指示牌和okey都与 Okey 相同。庄家右手边的玩家拿22张，先打出一张；其他人各21张。',
      '轮到你时，从中间摸牌，或拿左边的弃牌。从左边拿的牌必须在本回合用掉；用之前可以放回去。',
      '开牌时，一次摆出总分至少101分的牌组（顺子和同数，按牌面计分；okey按它代替的牌计分，13后面的1算1分），或至少五个对子。',
      '开牌后可以继续出牌组，也可以往桌上任何牌组里加牌。以对子开牌的玩家只能出对子，但仍可以往牌组里加牌。',
      '出牌时的罚分：打出okey罚101分；打出本可以加到桌上牌组的牌罚101分。',
      '把牌全部摆出只剩一张，再打出这张即和牌。和牌者得−101分；打出okey和牌、以对子和牌，或在别人都没开牌时一次和牌，本局分数翻倍。',
      '其他人：没开牌记202分；开了牌的按剩余牌的点数计分（对子开牌的翻倍），每留一张okey再加101分。牌摸完时也按同样方法计算剩余牌。',
      '打完设定的局数后总分最低者获胜。暂未加入：从桌上牌组里换回okey、每次开牌后提高开牌分数，以及搭档玩法。',
    ],
    basics: [
      '尽早算出自己最好的牌组。大多数牌要摸两三轮才能凑够101分。',
      '大牌开牌快，但留在手里罚得也多。要么用进牌组，要么尽早把没用的打掉。',
      '一局结束时千万别留着okey，要罚101分。',
    ],
    advanced: [
      '早早就有五个以上对子时，对子开牌很快，但剩牌要翻倍计分，只有能迅速出完时才用。',
      '打牌前先看桌面：能加到桌上牌组的牌，打出去要罚101分。',
      '留意右手边玩家缺什么，不要给他能凑够开牌的牌。',
    ],
    mistakes: ['一直等待大开牌，结果别人已经出完了。', '打出能加到桌上牌组的牌。'],
  },
  tr: {
    summary: 'Per indirmenin Türk oyunu: 101 puanla aç, ıstakanı boşalt ve birkaç el boyunca ceza toplamını düşük tut.',
    history: '101 Okey, Okey ile aynı taşları kullanır ama perlerin masaya indirildiği bir oyun gibi oynanır. Türkiye’de bir akşam boyunca puanına en çok oynanan versiyondur ve kendi dili vardır: açmak, masadaki bir pere taş eklemek demek olan işlemek ve çiftlerden oluşan açış olan çift.',
    rules: [
      'Okey’deki aynı 106 taş, gösterge ve okeyler. Dağıtanın sağındaki oyuncu 22 taş alır ve taş atarak açar; diğerleri 21 taş alır.',
      'Sıran gelince ortadan çek ya da solundaki atılan taşı al. Soldan alınan taş o sırada kullanılmalıdır; kullanmadan önce geri koyabilirsin.',
      'Açmak için toplam en az 101 puanlık per indir (seriler ve gruplar yüzey değeriyle sayılır; okey yerini tuttuğu taş sayılır, 13’ten sonraki 1 de 1 sayılır) ya da en az beş çift.',
      'Açtıktan sonra yeni perler indirebilir ve masadaki herhangi bir pere taş işleyebilirsin. Çiftten açan yalnızca çift indirir ama perlere taş işleyebilir.',
      'Oyun sırasındaki cezalar: okey atmak 101, masadaki bir pere işlenebilecek bir taşı atmak 101.',
      'Bir taş dışında her şeyi indirip onu atarak bitir. Biten −101 yazar; okey atarak bitirmek, çiftle bitirmek ya da kimse açmadan elden bitirmek eli ikiye katlar.',
      'Diğerleri: hiç açmadıysa 202, açtıysa elinde kalan taşların yüzey değeri (çiftten açanlar için iki katı), artı elde tutulan her okey için 101. Taşlar biterse kalan taşlar aynı şekilde sayılır.',
      'Seçilen el sayısı sonunda en düşük toplam kazanır. Henüz yok: masadaki bir perden okeyi geri almak, her açıştan sonra açış barajını yükseltmek ve eşli oyun.',
    ],
    basics: [
      'En iyi perlerini erkenden say. Çoğu el 101’e ulaşmadan önce iki üç tur çekiş ister.',
      'Yüksek taşlar daha hızlı açtırır ama ıstakanda kalırsa daha pahalıya patlar. Onları perlerde kullan ya da işe yaramayanları erken at.',
      'Okeyi asla elin sonuna kadar tutma: 101’e mal olur.',
    ],
    advanced: [
      'Erkenden beş ya da daha fazla çiftin varsa çiftten açmak hızlıdır ama kalanların iki kat sayılır. Yalnızca ıstakanı hızla boşaltabileceksen kullan.',
      'Atmadan önce masaya bak: oradaki bir pere uyan her taşı atmak 101’e mal olur.',
      'Sağındaki oyuncunun neye ihtiyacı olduğunu izle ve açışını tamamlayacak taşları ona yedirme.',
    ],
    mistakes: ['Diğerleri ıstakalarını boşaltırken dev bir açış beklemek.', 'Masadaki bir pere uyan bir taşı atmak.'],
  },
};
