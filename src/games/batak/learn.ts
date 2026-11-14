import type { Lesson } from '../../core/learn';
export const lesson: Lesson = {
  names: { en: 'Batak', tr: 'Batak', zh: '巴塔克' },
  en: {
    summary: 'The Turkish bidding trick game for four: bid how many tricks you will take, name trump, then make your bid.',
    history: 'Batak is a Turkish relative of whist and spades, played everywhere from university canteens to coffeehouses. "İhaleli batak", with an auction for trump, is the most common form. The name means "the one who sinks": the bidder who falls short is said to have sunk (batmak).',
    rules: [
      'Four players, each for themselves, 13 cards each.',
      'Bidding goes round the table: name a number of tricks, at least 5 and higher than the last bid, or pass. When everyone else has passed, the highest bidder wins. If all four pass, the dealer must play at 4.',
      'The bidder names trump and leads the first trick.',
      'You must follow the suit led, and you must beat the best card on the table if you can. If you cannot follow, you must trump, and over-trump if you can.',
      'Trump may not be led until someone has played a trump, unless you hold nothing else.',
      'The bidder who makes the bid scores the tricks taken; one who falls short loses the bid. Everyone else scores their tricks.',
      'After the agreed number of hands, the highest total wins.',
    ],
    basics: ['Count your sure tricks before bidding: aces, guarded kings and long trump.', 'A short side suit with plenty of trump is worth tricks: you can trump in.', 'Pull trumps early when you hold most of them, so others cannot ruff your winners.'],
    advanced: ['Watch who is void in a suit: once they show out, their trumps will come.', 'The rule that you must beat the best card means high cards fall early; count them as they go.'],
    mistakes: ['Bidding on high cards alone without trump length.', 'Leading a suit an opponent is void in, letting them trump cheaply.'],
  },
  zh: {
    summary: '土耳其四人叫牌吃墩游戏：叫出自己能吃几墩，指定将牌，然后完成叫牌。',
    history: 'Batak是土耳其版本的惠斯特/黑桃类游戏，从大学食堂到咖啡馆都有人玩。最常见的是“叫牌Batak”，通过竞叫决定将牌。名字意为“沉下去的人”：没完成叫牌的人就“沉了”（batmak）。',
    rules: ['四人各自为战，每人13张牌。', '依次叫牌：报出墩数，至少5且高于前一叫，或者不叫。其他人都不叫后，最高叫者获胜。四人都不叫时，庄家必须以4墩进行。', '叫到者指定将牌并首先出牌。', '必须跟出首牌花色，能压过桌上最大牌就必须压。没有该花色必须出将牌，能盖过已出的将牌就必须盖。', '在有人出过将牌之前不能首出将牌，除非手里只剩将牌。', '叫到者完成叫牌按吃墩数得分，未完成则扣去叫牌数。其他人按吃墩数得分。', '打完约定局数后，总分最高者获胜。'],
    basics: ['叫牌前数一数稳赢的墩：A、有保护的K和长将牌。', '某门花色很短而将牌很多也能赢墩：可以将吃。', '将牌多时早点调将，免得别人将吃你的大牌。'],
    advanced: ['注意谁某门花色已经断了：一旦断门，他的将牌就会出现。', '“能压必须压”的规则让大牌很早就出完，要边打边记。'],
    mistakes: ['只靠大牌叫牌而没有足够的将牌长度。', '首出对手已断门的花色，让他便宜地将吃。'],
  },
  tr: {
    summary: 'Dört kişilik Türk ihale oyunu: kaç el alacağını söyle, kozu belirle, sonra sözünü tut.',
    history: 'Batak, briç ve spades akrabası bir Türk oyunudur; üniversite kantinlerinden kahvehanelere her yerde oynanır. En yaygın biçimi, kozun ihaleyle belirlendiği ihaleli bataktır. Adı “batan”dan gelir: ihalesini tutturamayan oyuncu batmış sayılır.',
    rules: ['Dört oyuncu, herkes kendi için, kişi başı 13 kart.', 'İhale masada döner: en az 5 ve bir öncekinden yüksek bir el sayısı söyle ya da pas de. Diğerlerinin hepsi pas deyince en yüksek ihale kazanır. Dördü de pas derse dağıtan 4 ile oynamak zorundadır.', 'İhaleyi alan kozu söyler ve ilk eli açar.', 'Açılan rengi takip etmek zorundasın; masadaki en büyük kartı geçebiliyorsan geçmek zorundasın. O renk yoksa koz çakmak, daha büyük kozun varsa üstüne çıkmak zorundasın.', 'Biri koz atmadan koz açılamaz; elinde yalnızca koz kalmadıysa.', 'İhalesini tutturan aldığı eller kadar puan alır; tutturamayan ihale kadar eksi yazar. Diğerleri aldıkları el kadar puan alır.', 'Kararlaştırılan el sayısından sonra toplamı en yüksek olan kazanır.'],
    basics: ['İhale vermeden önce kesin ellerini say: aslar, yanında küçük olan papazlar ve uzun koz.', 'Kozun çokken kısa bir renk de el getirir: koz çakarsın.', 'Kozların çoğu sendeyse erken koz çek; başkaları büyüklerini kozlamasın.'],
    advanced: ['Kimin hangi renkten bittiğini izle: renk bitince kozları gelir.', 'Büyük atma zorunluluğu yüzünden büyük kartlar erken düşer; giderken say.'],
    mistakes: ['Koz uzunluğu olmadan yalnızca büyük kartlara güvenip ihale vermek.', 'Rakibin bittiği rengi açıp ucuza kozlamasına izin vermek.'],
  },
};
