import type { Lesson } from '../../core/learn';
export const lesson: Lesson = {
  names: { en: 'Texas Hold’em Poker', tr: 'Poker (Texas Hold’em)', zh: '德州扑克' },
  en: {
    summary: 'No-limit Texas Hold’em around a coffeehouse table: two cards of your own, five shared, and the courage to bet.',
    history: 'Texas Hold’em began in Robstown, Texas, in the early 1900s and spread through Las Vegas card rooms in the 1960s. Televised tournaments and online play in the 2000s made it the best-known poker game in the world. This table plays it as a sit-and-go: same stacks, rising blinds, last player standing wins.',
    rules: [
      'Each player gets two private cards. The two players left of the dealer post the small and big blinds.',
      'Four betting rounds: before the flop, after the flop (three shared cards), after the turn (a fourth) and after the river (a fifth). In each round you may fold, check, call, bet or raise; no limit, so you can go all in.',
      'If everyone else folds, the last player takes the pot. Otherwise the best five-card hand from your two cards and the five on the board wins at the showdown.',
      'Hands from best to worst: straight flush, four of a kind, full house, flush, straight, three of a kind, two pair, one pair, high card.',
      'A player who is all in can only win the part of the pot they matched; the rest forms a side pot for the others.',
      'Everyone starts with 1000 chips, the blinds double every eight hands, and a player with no chips is out.',
    ],
    basics: ['Play fewer hands, but play them firmly: pairs, high cards of the same suit, connected high cards.', 'Compare the price of a call with the pot: calling 20 into a pot of 100 needs you to win about one time in six.', 'Position matters: acting last tells you more.'],
    advanced: ['Size your bets to the pot, and bet your strong hands for value rather than slow-playing them.', 'The regulars play differently: Ali calls too much, Şevket Usta rarely bluffs but punishes weakness.'],
    mistakes: ['Calling to the river with nothing in the hope of a miracle.', 'Forgetting the blinds rise: a short stack must take its chances before it is too late.'],
  },
  zh: {
    summary: '茶馆桌上的无限注德州扑克：两张底牌、五张公共牌，再加上下注的勇气。',
    history: '德州扑克20世纪初起源于美国得州罗布斯敦，60年代在拉斯维加斯流行。2000年代电视转播的锦标赛和网络扑克让它成为世界上最有名的扑克玩法。本桌采用单桌赛：筹码相同，盲注递增，最后留下的人获胜。',
    rules: ['每人两张底牌。庄家左边两位分别下小盲和大盲。', '四轮下注：翻牌前、翻牌后（三张公共牌）、转牌后（第四张）、河牌后（第五张）。每轮可以弃牌、过牌、跟注、下注或加注；无限注，可以全下。', '其他人都弃牌时，剩下的人赢得底池。否则摊牌时用两张底牌和五张公共牌组成的最好五张牌获胜。', '牌型从大到小：同花顺、四条、葫芦、同花、顺子、三条、两对、一对、高牌。', '全下的玩家只能赢得自己跟到的那部分底池，其余部分形成边池。', '每人起始1000筹码，每八手盲注翻倍，筹码输光即出局。'],
    basics: ['少玩手牌，但要玩得坚决：对子、同花大牌、相连的大牌。', '比较跟注的代价和底池：底池100跟20，大约每六次赢一次就值得。', '位置很重要：最后行动能得到更多信息。'],
    advanced: ['按底池大小下注；强牌要价值下注而不是慢打。', '常客风格不同：阿里跟注太多，谢夫凯特大师很少诈唬但会惩罚软弱。'],
    mistakes: ['手里什么都没有还一路跟到河牌，指望奇迹。', '忘了盲注会涨：短筹码要趁早搏一把。'],
  },
  tr: {
    summary: 'Kahvehane masasında limitsiz Texas Hold’em: iki kart senin, beş kart ortak, gerisi cesaret.',
    history: 'Texas Hold’em 1900’lerin başında Teksas’ın Robstown kasabasında doğdu, 1960’larda Las Vegas salonlarına yayıldı. 2000’lerde televizyon turnuvaları ve çevrimiçi oyunla dünyanın en bilinen poker türü oldu. Bu masa onu tek masa turnuvası olarak oynar: eşit fiş, artan körler, son kalan kazanır.',
    rules: ['Her oyuncuya iki kapalı kart verilir. Krupiyenin solundaki iki oyuncu küçük ve büyük körü koyar.', 'Dört bahis turu vardır: floptan önce, floptan sonra (üç ortak kart), turn’den sonra (dördüncü) ve river’dan sonra (beşinci). Her turda pas, kontrol, görme, bahis ya da yükseltme yapılır; limit yok, all-in olabilirsin.', 'Herkes pas geçerse kalan oyuncu potu alır. Yoksa iki kartın ve ortadaki beş kartla yapılan en iyi beşli kazanır.', 'Eller büyükten küçüğe: floş rağ, kare, ful, floş, kent, üçlü, döper, bir per, yüksek kart.', 'All-in olan oyuncu yalnızca karşıladığı kısmı kazanabilir; kalanı diğerleri için yan pot olur.', 'Herkes 1000 fişle başlar, körler her sekiz elde ikiye katlanır, fişi biten elenir.'],
    basics: ['Az el oyna ama kararlı oyna: perler, aynı renk büyük kartlar, ardışık büyük kartlar.', 'Görmenin fiyatını potla karşılaştır: 100’lük pota 20 görmek için altı elde bir kazanman yeter.', 'Pozisyon önemlidir: son konuşan daha çok şey bilir.'],
    advanced: ['Bahsini potun büyüklüğüne göre ayarla; güçlü elleri yavaş oynamak yerine değerine bahis yap.', 'Müdavimler farklı oynar: Ali çok görür, Şevket Usta az blöf yapar ama zayıflığı cezalandırır.'],
    mistakes: ['Elinde hiçbir şey yokken mucize umuduyla river’a kadar görmek.', 'Körlerin arttığını unutmak: az fişi kalan, iş işten geçmeden şansını denemeli.'],
  },
};
