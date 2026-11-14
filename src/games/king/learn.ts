import type { Lesson } from '../../core/learn';
export const lesson: Lesson = {
  names: { en: 'King', tr: 'King', zh: 'King 国王' },
  en: {
    summary: 'The long Turkish trick game for four: take turns choosing penalty hands to dodge and trump hands to win.',
    history: 'King is the Turkish form of the old French game Barbu and Hungarian Kinggel: a "compendium" where each hand is a different small game. It is a favourite of long evenings, played on a paper score sheet that tracks who still owes which hands. The name comes from the king of hearts, the rıfkı, the most expensive card in the game.',
    rules: [
      'Four players, each for themselves, 13 cards each. Each hand, one player chooses which game is played, in turn round the table, after seeing their cards. The chooser leads.',
      'In a full game of 20 hands each player names two trump hands (koz) and three penalty hands (ceza). Each penalty can be played at most twice in all. The short game has 8 hands: one of each per player.',
      'You must follow suit and beat the best card on the table if you can. In a trump hand, a player who cannot follow must trump; trump may not be led until it has been played.',
      'Penalties: el almaz −50 for each trick; kupa almaz −30 for each heart; erkek almaz −60 for each king or jack; kız almaz −100 for each queen; rıfkı −320 for the king of hearts; son iki −180 for each of the last two tricks.',
      'In kupa almaz and rıfkı, hearts may not be led until a heart has been discarded. In rıfkı the king of hearts must be played at the first chance: when you cannot follow suit, or when hearts are led and the ace has fallen.',
      'A penalty hand ends as soon as every penalty card has been taken. A trump hand scores +50 for each trick.',
      'After the last hand, the highest total wins.',
    ],
    basics: ['Choose penalties your hand can dodge: low hearts for kupa almaz, no queens for kız almaz.', 'Keep a strong long suit for a trump hand; naming trump on a weak hand gives points away.', 'In penalty hands, get rid of high cards when you cannot follow suit.'],
    advanced: ['The must-beat rule makes ducking hard: plan which suit you can lose the lead in.', 'Watch the score sheet: late in the game, leftover contracts are forced on players, so plan which ones you leave for last.'],
    mistakes: ['Holding the king of hearts too long in rıfkı: the rule will force it out at the worst time.', 'Leading high in el almaz.'],
  },
  zh: {
    summary: '土耳其四人长局吃墩游戏：轮流选择要躲避的罚分局和要赢墩的将牌局。',
    history: 'King是法国Barbu、匈牙利Kinggel的土耳其版本：每一局都是一个不同的小游戏。它是漫长夜晚的最爱，用纸质计分表记录每人还欠哪些局。名字来自红心K，即rıfkı，游戏里最“贵”的牌。',
    rules: ['四人各自为战，每人13张。每局轮到的人看过手牌后选择本局玩法，并首先出牌。', '完整20局中，每人选两次将牌局（koz）和三次罚分局（ceza）；每种罚分局总共最多两次。短局为8局：每人各选一次。', '必须跟花色，能压过桌上最大牌就必须压。将牌局中没有该花色必须出将牌；将牌未出现前不能首出将牌。', '罚分：不吃墩每墩−50；不吃红心每张−30；不吃K/J每张−60；不吃Q每张−100；rıfkı红心K −320；最后两墩每墩−180。', '“不吃红心”和rıfkı中，有人垫过红心之前不能首出红心。rıfkı中红心K必须尽早出：没有跟出的花色时，或红心被首出且A已出现时。', '罚分牌全部被吃后该局立即结束。将牌局每墩+50。', '最后一局结束后总分最高者获胜。'],
    basics: ['选择你能躲开的罚分：红心小就选不吃红心，没Q就选不吃Q。', '把强长套留给将牌局；牌弱时选将牌等于送分。', '罚分局里不能跟花色时，先垫掉大牌。'],
    advanced: ['“能压必须压”让躲牌变难：提前想好在哪门花色交出出牌权。', '注意计分表：后期剩下的玩法会被强制，提前安排最后留哪些。'],
    mistakes: ['rıfkı局里拿着红心K太久：规则会在最糟的时候逼你出。', '不吃墩局里首出大牌。'],
  },
  tr: {
    summary: 'Dört kişilik uzun Türk oyunu: sırayla kaçılacak cezaları ve kazanılacak kozları seçersiniz.',
    history: 'King, eski Fransız Barbu ve Macar Kinggel oyununun Türk biçimidir: her el ayrı küçük bir oyundur. Uzun akşamların gözdesidir; kimin hangi oyunları borçlu olduğu kâğıt bir çetelede tutulur. Adını oyunun en pahalı kartı olan kupa papazından, yani rıfkıdan alır.',
    rules: ['Dört oyuncu, herkes kendi için, kişi başı 13 kart. Her elde sırası gelen oyuncu kartlarına bakıp o elin oyununu seçer ve ilk eli açar.', '20 ellik tam oyunda her oyuncu iki koz ve üç ceza seçer. Her ceza oyunda en fazla iki kez oynanır. Kısa oyun 8 eldir: herkes birer tane seçer.', 'Rengi takip etmek, masadaki en büyük kartı geçebiliyorsan geçmek zorundasın. Koz oyununda rengi olmayan koz çakmak zorundadır; koz atılmadan koz açılamaz.', 'Cezalar: el almaz her el −50; kupa almaz her kupa −30; erkek almaz her papaz ve vale −60; kız almaz her kız −100; rıfkı kupa papazı −320; son iki son iki elin her biri −180.', 'Kupa almaz ve rıfkıda biri kupa atmadan kupa açılamaz. Rıfkıda kupa papazı ilk fırsatta atılmak zorundadır: rengi takip edemediğinde ya da kupa açılıp as düştüğünde.', 'Bütün ceza kartları alınınca ceza eli hemen biter. Koz elinde her el +50.', 'Son elden sonra toplamı en yüksek olan kazanır.'],
    basics: ['Elinin kaçabileceği cezayı seç: küçük kupalarla kupa almaz, kızsız elle kız almaz.', 'Güçlü uzun rengini koz için sakla; zayıf elle koz seçmek puan dağıtmaktır.', 'Ceza ellerinde rengi takip edemediğinde büyük kartlardan kurtul.'],
    advanced: ['Büyük atma zorunluluğu kaçmayı zorlaştırır: eli hangi renkte devredebileceğini önceden planla.', 'Çeteleyi izle: oyun sonunda kalan oyunlar zorunlu kalır; hangisini sona bırakacağını planla.'],
    mistakes: ['Rıfkıda kupa papazını fazla tutmak: kural onu en kötü anda attırır.', 'El almazda büyük kartla açmak.'],
  },
};
