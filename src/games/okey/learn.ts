import type { Lesson } from '../../core/learn';
export const lesson: Lesson = {
  names: { en: 'Okey', tr: 'Okey', zh: 'Okey' },
  en: {
    summary: 'A Turkish tile game for four: draw and discard until your fourteen tiles form complete sets.',
    history: 'Okey is a rummy game played with numbered tiles, close to Rummikub, and it is one of the most played games in Turkish coffeehouses and homes. Players keep their tiles on a wooden rack, the ıstaka, and the game\'s vocabulary is everyday Turkish: the indicator is the gösterge, the wild tile is the okey, and the two blank tiles are the false okeys, sahte okey.',
    rules: [
      '106 tiles: numbers 1–13 in red, yellow, blue and black, two of each, plus two false jokers.',
      'One tile is turned face up as the indicator. The okey is the same colour and one higher; after 13 comes 1. Both okey tiles are wild. The false jokers stand only for the okey\'s own value.',
      'The player to the dealer\'s right gets 15 tiles and opens by discarding. Everyone else has 14.',
      'On your turn, draw from the centre or take the tile the player on your left just discarded, then discard one tile to your right.',
      'Sets are runs of three or more consecutive tiles of one colour, and groups of three or four of one number in different colours. 1 may follow 13 (12-13-1), but a run cannot continue past it.',
      'You finish by throwing your fifteenth tile when the other fourteen are all in sets, or form seven identical pairs.',
      'Everyone starts with 20 points. A normal finish costs each other player 2. Finishing with seven pairs or by throwing an okey costs 4 (8 if both). Showing the indicator\'s twin before your first move costs the others 1.',
      'If the tiles run out, the deal ends with no score. The game ends when someone reaches zero; the highest score wins.',
    ],
    basics: [
      'Arrange your rack in runs and groups and leave gaps between them, so you can see what you need.',
      'Take the discard on your left only when it completes or clearly improves a set; otherwise you show your hand.',
      'Never throw an okey unless it finishes the game.',
    ],
    advanced: [
      'Watch what the player on your right picks up from you, and stop feeding them tiles of that colour and number range.',
      'Hold flexible tiles, such as a 7 that fits both a red run and a group of 7s, longer than tiles with one use.',
      'With five or more pairs early, consider going for seven pairs; it scores double.',
    ],
    mistakes: ['Holding three half-finished runs instead of completing one.', 'Throwing a tile the next player obviously collects.'],
  },
  zh: {
    summary: '一种四人玩的土耳其牌类游戏：不断摸牌、打牌，直到手里的14张牌全部组成牌组。',
    history: 'Okey 是一种用数字牌玩的拉密类游戏，和 Rummikub 很像，是土耳其咖啡馆和家庭里最常玩的游戏之一。玩家把牌放在木制牌架 ıstaka 上，游戏里的词都来自日常土耳其语：指示牌叫 gösterge，万能牌叫 okey，两张空白牌叫假okey（sahte okey）。',
    rules: [
      '共106张牌：红、黄、蓝、黑四种颜色的1–13，每张两份，另有两张假okey。',
      '翻开一张牌作为指示牌。okey 是同色、数字大一的牌；13之后是1。两张okey都是万能牌，假okey只能当okey本身的数值用。',
      '庄家右手边的玩家拿15张牌，先打出一张；其他人各14张。',
      '轮到你时，从中间摸一张，或拿左手边玩家刚打出的牌，然后向右边打出一张。',
      '牌组包括同色连续三张或以上的顺子，以及同数字不同颜色的三张或四张。1可以接在13后面（12-13-1），但顺子不能越过1继续。',
      '其余14张都组成牌组，或组成七个完全相同的对子时，打出第15张牌即和牌。',
      '每人起始20分。普通和牌，其他人各扣2分；七对或打出okey和牌扣4分（两者兼有扣8分）。第一次行动前亮出与指示牌相同的牌，其他人各扣1分。',
      '牌摸完时本局不计分。有人分数降到0时游戏结束，分数最高者获胜。',
    ],
    basics: [
      '在牌架上把顺子和同数分开摆，中间留空，一眼就能看出缺什么。',
      '只有能补齐或明显改善牌组时才拿左边的弃牌，否则会暴露你的牌。',
      '除非能和牌，否则不要打出okey。',
    ],
    advanced: [
      '留意右手边玩家从你这里拿了什么牌，不要再给他同色、相近数字的牌。',
      '用途多的牌（比如既能接红色顺子又能组成同数7的7）要比只有一种用途的牌留得更久。',
      '如果早早就有五个以上的对子，可以考虑做七对，得分加倍。',
    ],
    mistakes: ['同时留着三组都差一点的顺子，而不是先完成一组。', '打出下家明显在收的牌。'],
  },
  tr: {
    summary: 'Dört kişilik bir Türk taş oyunu: on dört taşın tamamı per olana kadar çek ve at.',
    history: 'Okey, Rummikub’a yakın, numaralı taşlarla oynanan bir oyundur ve Türk kahvehanelerinde ve evlerinde en çok oynanan oyunlardan biridir. Oyuncular taşlarını ıstaka denen tahta rafta tutar; oyunun dili gündelik Türkçedir: gösterge, okey ve iki boş taş olan sahte okeyler.',
    rules: [
      '106 taş: kırmızı, sarı, mavi ve siyah renklerde 1–13 arası sayılar, her birinden iki tane, artı iki sahte okey.',
      'Bir taş gösterge olarak açılır. Okey aynı renkte bir üst sayıdır; 13’ten sonra 1 gelir. İki okey taşı da jokerdir. Sahte okeyler yalnızca okeyin kendi değerini tutar.',
      'Dağıtanın sağındaki oyuncu 15 taş alır ve taş atarak açar. Diğer herkesin 14 taşı vardır.',
      'Sıran gelince ortadan çek ya da solundaki oyuncunun az önce attığı taşı al, sonra sağına bir taş at.',
      'Perler aynı renkte üç ya da daha fazla ardışık taştan oluşan seriler ve farklı renklerde aynı sayıdan üç ya da dört taştan oluşan gruplardır. 1, 13’ün ardından gelebilir (12-13-1) ama seri onu geçerek devam edemez.',
      'Diğer on dördü per olduğunda ya da yedi eş çift oluşturduğunda on beşinci taşını atarak bitirirsin.',
      'Herkes 20 puanla başlar. Normal bitiş diğer her oyuncuya 2’ye mal olur. Çifte gitmek ya da okey atarak bitirmek 4’e (ikisi birden 8’e) mal olur. İlk hamlenden önce göstergenin eşini göstermek diğerlerine 1 kaybettirir.',
      'Taşlar biterse el puansız biter. Biri sıfıra inince oyun biter; en yüksek puan kazanır.',
    ],
    basics: [
      'Istakanı seriler ve gruplar hâlinde diz ve aralarında boşluk bırak ki neye ihtiyacın olduğunu görebilesin.',
      'Solundaki atılan taşı yalnızca bir peri tamamlıyor ya da açıkça iyileştiriyorsa al; yoksa elini belli edersin.',
      'Oyunu bitirmiyorsa asla okey atma.',
    ],
    advanced: [
      'Sağındaki oyuncunun senden ne aldığını izle ve ona o renkten ve sayı aralığından taş yedirmeyi bırak.',
      'Hem kırmızı bir seriye hem bir 7 grubuna uyan bir 7 gibi esnek taşları tek işe yarayan taşlardan daha uzun tut.',
      'Erkenden beş ya da daha fazla çiftin varsa çifte gitmeyi düşün; iki kat puan getirir.',
    ],
    mistakes: ['Birini tamamlamak yerine üç yarım seri tutmak.', 'Sonraki oyuncunun açıkça topladığı bir taşı atmak.'],
  },
};
