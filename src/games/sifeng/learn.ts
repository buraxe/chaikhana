import type { Lesson } from '../../core/learn';
export const lesson: Lesson = {
  names: { en: 'Sì Fēng', tr: 'Sì Fēng (四风)', zh: '四风', pinyin: 'sì fēng' },
  en: {
    summary: 'Saranta’s mahjong-style line game: lay tiles in rows and columns where colour, suit and number are each all the same or all different.',
    history: 'Sì Fēng, “Four Winds”, is a house game designed by Saranta: the line-building idea of games like Iota dressed in mahjong tiles, with four colours, four suits (dots, bamboo, characters and winds), the numbers one to four and two flower jokers. It is made for playing round one phone, with friends or against bots, and has optional dice for targets, risks, powers and bonus spots.',
    rules: [
      'A line is 2–4 tiles in a row or column. In a line, colour, suit (筒 条 万 风) and number must each be all the same or all different.',
      'On your turn place 1–4 tiles, in as many lines as you like; every tile must connect to the table directly or through your other new tiles. Or pass and swap any number of tiles.',
      'Score the numbers in every line you created or extended; a tile in two lines counts twice. Each completed line of four ×2, playing all four tiles ×2.',
      'Flower 花 tiles stand for any tile and score 0. Before playing you may swap a fitting tile from your hand for a flower on the table.',
      'When the deck is empty, whoever plays their last tile ends the game, and that turn scores double. The game also ends when everyone passes in a row.',
      'Optional dice, each once per game and one per turn: target (+5 per matching trait, ×2 for an exact match), risk (double or nothing), power (an extra swap, a peek, five tiles or double) and bonus (a +10 or ×2 spot on the table).',
    ],
    basics: ['Start lines of four: each finished one doubles the turn.', 'A tile at a crossing scores in both lines.', 'Keep a flower for the move that completes a four.'],
    advanced: ['Do not leave a line of three that the next player can finish into a doubling four.', 'Save the risk die for a turn you can afford to lose, or for when you are behind.'],
    mistakes: ['Lines where every trait differs are legal but hard to extend.', 'Forgetting that a gap makes the two halves one long line.'],
  },
  zh: {
    summary: 'Saranta设计的麻将风格连线游戏：把牌摆成行或列，颜色、花色、数字每一项要么全同要么全不同。',
    history: '四风是Saranta设计的家庭游戏：借用Iota等游戏的连线思路，换上麻将牌——四种颜色、四种花色（筒、条、万、风）、数字一到四，外加两张花牌。它适合大家围着一部手机玩，也可以和电脑对战，还有可选的目标、风险、能力和奖励骰子。',
    rules: ['线是同一行或同一列的2–4张牌。线里的颜色、花色（筒 条 万 风）和数字，每一项要么全相同，要么全不同。', '你的回合：放1–4张牌，可以放在不同的线上，每张都要直接或通过新放的牌连接桌上的牌；或者过，并可以换任意张牌。', '新形成或延长的每条线上的数字相加；一张牌在两条线上就算两次。每完成一条四连×2，四张牌全出×2。', '花牌可以代替任何牌，0分。出牌前可以用手里合适的牌把桌上的花牌换回来。', '牌堆用完后，打出最后一张牌的人结束游戏，本轮×2。所有人连续过牌游戏也结束。', '可选骰子，每种整局一次、每轮一个：目标（每符合一项+5，完全符合×2）、风险（翻倍或归零）、能力（多换一张、偷看、五张或双倍）、奖励（桌上出现+10或×2格）。'],
    basics: ['多凑四连：每完成一条本轮翻倍。', '交叉点上的牌两条线都算分。', '把花牌留给能完成四连的那一步。'],
    advanced: ['别留下让下家能补成四连的三连。', '风险骰留到输得起的回合，或者落后的时候。'],
    mistakes: ['每项都不同的线虽然合法，但很难延长。', '忘了空格被填上后两段会连成一条长线。'],
  },
  tr: {
    summary: 'Saranta’nın Mahjong tarzı çizgi oyunu: taşları sıra ve sütunlara diz; renk, takım ve sayı ya hep aynı ya hep farklı olsun.',
    history: 'Sì Fēng, yani “Dört Rüzgâr”, Saranta’nın tasarladığı bir ev oyunudur: Iota gibi oyunların çizgi kurma fikri Mahjong taşlarıyla buluşur; dört renk, dört takım (筒 daireler, 条 bambular, 万 karakterler, 风 rüzgârlar), birden dörde sayılar ve iki çiçek joker. Tek telefon etrafında arkadaşlarla ya da botlara karşı oynanmak için yapıldı; hedef, risk, güç ve bonus zarları isteğe bağlıdır.',
    rules: ['Çizgi, düz bir sıra ya da sütunda 2–4 taştır. Çizgide renk, takım (筒 条 万 风) ve sayı ayrı ayrı ya hepsinde aynı ya hepsinde farklı olmalı.', 'Turunda 1–4 taş koy; istediğin kadar farklı çizgiye koyabilirsin, her taş masaya doğrudan ya da yeni koyduğun taşlar üzerinden bağlı olmalı. Ya da pas geç ve istediğin kadar taş değiştir.', 'Oluşturduğun ya da uzattığın her çizgideki sayıları topla; iki çizgideki taş iki kez sayılır. Her tamamlanan 4’lü ×2, dört taşın hepsini oynamak ×2.', '花 çiçek taşı her taşın yerine geçer, 0 puandır. Hamle yapmadan önce elindeki uygun bir taşla masadaki çiçeği değiştirip alabilirsin.', 'Deste bitince son taşını oynayan oyunu bitirir ve o tur ×2 sayılır. Herkes art arda pas geçerse de oyun biter.', 'İsteğe bağlı zarlar, her biri oyunda bir kez ve turda bir tane: hedef (eşleşen her özellik +5, tam eşleşme ×2), risk (ya ikiye katla ya sıfır), güç (ekstra değişim, gözetleme, beş taş ya da ×2) ve bonus (masada +10 ya da ×2 kare).'],
    basics: ['4’lü çizgilere oyna: her biri turu ikiye katlar.', 'Kesişmedeki taş iki çizgide de puan alır.', 'Çiçeği 4’lüyü tamamlayacak hamleye sakla.'],
    advanced: ['Sıradaki oyuncunun ikiye katlayan bir 4’lüye çevirebileceği 3’lü bırakma.', 'Risk zarını kaybetmeyi göze alabileceğin bir tura ya da gerideyken sakla.'],
    mistakes: ['Her özelliği farklı çizgiler geçerlidir ama uzatması zordur.', 'Bir boşluk dolunca iki parçanın tek uzun çizgi olacağını unutmak.'],
  },
};
