import type { Lesson } from '../../core/learn';
export const lesson: Lesson = {
  names: { en: 'Pişti', tr: 'Pişti', zh: 'Pişti 抓牌' },
  en: {
    summary: 'A quick Turkish fishing game for two: match the top card or play a jack to sweep the pile, and catch a lone card for a pişti.',
    history: 'Pişti is one of the best-loved card games in Turkey, played in coffeehouses, on ferries and at family tables. It belongs to the fishing family of games, like Italian scopa and the Balkan "pishti", where you capture cards from the middle by matching them. Its name is the word players shout when they catch a single card with its twin.',
    rules: [
      'A 52-card deck. Four cards go to the middle, the top one face up, and four to each player.',
      'Take turns playing one card on the pile. If it has the same rank as the top card, or it is a jack, you take the whole pile.',
      'Taking a pile of exactly one card with the same rank is a pişti: 10 points. A jack on a lone jack is a double pişti: 20 points.',
      'When both hands are empty, deal four more each. When the deck runs out, the last player to take a pile also takes what is left in the middle.',
      'Points: every ace and jack 1, the two of clubs 2, the ten of diamonds 3, and 3 for taking more cards than the opponent.',
      'Deals continue until someone reaches the target (51, 101 or 151).',
    ],
    basics: ['Count the jacks: there are only four, and each one sweeps the table.', 'When the pile is empty, throw a card whose rank has already been played several times: your opponent is unlikely to hold its twin.', 'Save a jack for a rich pile, with the 10♦, the 2♣ or aces in it.'],
    advanced: ['Remember which ranks have fallen. With three of a rank gone, the fourth is safe to drop on a lone card.', 'Late in the deal, think about who takes the last pile: the leftovers can swing the 3 points for most cards.'],
    mistakes: ['Dropping a card onto a lone card your opponent can match: you hand them a pişti.', 'Spending a jack on a pile of one or two cheap cards.'],
  },
  zh: {
    summary: '两人快速“钓鱼”类纸牌：出与顶牌同点的牌或J就能收走牌堆，桌上只剩一张时收走就是pişti。',
    history: 'Pişti是土耳其最受欢迎的纸牌游戏之一，在咖啡馆、渡轮和家庭聚会上都能见到。它属于“钓鱼”类游戏，和意大利的scopa相近：通过配对从中间收牌。游戏名就是玩家用同点牌收走单张时喊出的那个词。',
    rules: ['使用52张牌。中间放四张，最上面一张翻开；每人发四张。', '轮流向牌堆出一张。若与顶牌同点，或出的是J，就收走整堆。', '牌堆只有一张时用同点牌收走即为pişti，得10分；用J收单张J为双pişti，得20分。', '双方手牌出完后各再发四张。牌发完后，最后一次收牌的人拿走中间剩下的牌。', '计分：每张A和J各1分，梅花2得2分，方块10得3分，收牌多者得3分。', '一局接一局，直到有人达到目标分（51、101或151）。'],
    basics: ['记住J：只有四张，每张都能收走全部。', '桌面为空时，出已经出现过多次的点数，对手很难有同点牌。', '把J留给有方块10、梅花2或A的大堆。'],
    advanced: ['记住已出的点数。某点数出过三张后，第四张放在单张上是安全的。', '牌局后段要考虑谁能最后收牌：剩下的牌会影响“牌多”那3分。'],
    mistakes: ['把牌出在对手能配对的单张上，白送一个pişti。', '用J去收只有一两张小牌的牌堆。'],
  },
  tr: {
    summary: 'İki kişilik hızlı bir Türk kart oyunu: üstteki kartla aynısını ya da vale atıp yerdekileri al, tek kartı aynısıyla yakalarsan pişti.',
    history: 'Pişti Türkiye’nin en sevilen kart oyunlarından biridir; kahvehanelerde, vapurlarda, aile masalarında oynanır. İtalyan scopa’sı gibi, ortadaki kartları eşleştirerek toplanan “balık tutma” oyunları ailesindendir. Adı, tek kartı aynısıyla yakalayan oyuncunun bağırdığı kelimeden gelir.',
    rules: ['52 kartlık deste. Ortaya dört kart konur, en üstteki açıktır; her oyuncuya dört kart dağıtılır.', 'Sırayla yere bir kart atılır. Üstteki kartla aynı değerdeyse ya da vale ise yerdeki bütün kartları alırsın.', 'Yerde tek kart varken onu aynı değerdeki kartla almak piştidir: 10 puan. Tek valeyi valeyle almak çift piştidir: 20 puan.', 'Eller bitince herkese dörder kart daha dağıtılır. Deste bitince yerde kalanları son kartları alan oyuncu alır.', 'Puanlar: her as ve vale 1, sinek ikili 2, karo onlu 3, fazla kart toplayan 3 puan.', 'Biri hedefe (51, 101 ya da 151) ulaşana kadar el el devam edilir.'],
    basics: ['Valeleri say: yalnızca dört tane var ve her biri yeri süpürür.', 'Yer boşken, daha önce birkaç kez çıkmış bir değeri at: rakibin elinde eşi olma ihtimali düşüktür.', 'Valeyi içinde karo onlu, sinek ikili ya da as olan zengin bir yer için sakla.'],
    advanced: ['Çıkan değerleri aklında tut. Bir değerden üçü gittiyse dördüncüsünü tek kartın üstüne atmak güvenlidir.', 'Elin sonlarında son kartları kimin alacağını düşün: kalanlar “çok kart” 3 puanını değiştirebilir.'],
    mistakes: ['Rakibin eşleyebileceği tek kartın üstüne kart atmak: piştiyi rakibe hediye edersin.', 'Valeyi bir iki ucuz karta harcamak.'],
  },
};
