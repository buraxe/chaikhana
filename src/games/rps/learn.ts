import type { Lesson } from '../../core/learn';
export const lesson: Lesson = {
  names: { en: 'Rock Paper Scissors', zh: '石头剪刀布', tr: 'Taş Kâğıt Makas', pinyin: 'shítou jiǎndāo bù' },
  en: {
    summary: 'Rock, paper or scissors at the same moment: first to three wins.',
    history: 'Hand games of this kind were played in China under the Han dynasty, two thousand years ago, and the three-sign game with a rock, paper and scissors took its modern form in Japan as jan-ken in the 19th century before spreading round the world in the 20th. It has settled real disputes, including an auction-house contract in 2005, and computer programs that read their opponent’s habits beat people far more often than chance allows.',
    rules: ['Both players choose a sign at the same time: rock (fist), paper (flat hand) or scissors (two fingers).', 'Rock blunts scissors, scissors cut paper, paper wraps rock.', 'The same sign on both sides is a tie, and the round is played again.', 'Here the first to win three rounds takes the match. On one device, the first player picks, passes the device, and the second picks without seeing it.'],
    basics: ['A perfectly random player cannot be beaten in the long run, and cannot win either.', 'People are not random: many open with rock, avoid repeating a sign three times, and after losing switch to what would have beaten them.', 'The computer here learns your habits as you play; vary your choices to stay ahead.'],
    advanced: ['Play against a habit, not a sign: if your opponent copies what just beat them, play what beats that.', 'Mix your own patterns on purpose, two or three rounds at a time, and abandon them as soon as they stop working.'],
    mistakes: ['Repeating a winning sign until the opponent notices.', 'Trying to be random by always changing: never repeating is itself a pattern.'],
  },
  zh: {
    summary: '同时出石头、剪刀或布：先赢三局者胜。',
    history: '早在两千年前的汉代，中国就有这类手势游戏；以石头、剪刀、布三种手势定胜负的现代玩法在19世纪的日本定型，称为“jan-ken”，20世纪传遍世界。它曾被用来解决真正的争端，包括2005年一份拍卖行的合同；而能读懂对手习惯的电脑程序，赢人的次数远高于碰运气。',
    rules: ['双方同时出一个手势：石头（拳头）、布（摊开的手）或剪刀（两根手指）。', '石头砸剪刀，剪刀剪布，布包石头。', '双方出一样的就是平局，这一局重来。', '这里先赢三局者赢得比赛。同机对战时，先出的人选好后把设备交给对方，后出的人看不到先出的选择。'],
    basics: ['完全随机的玩家长期来看不会输，也赢不了。', '人并不随机：很多人第一手出石头，避免连出三次同一手势，输了之后改出能赢刚才那一手的手势。', '这里的电脑会边玩边学你的习惯，多变才能领先。'],
    advanced: ['针对习惯而不是手势：如果对手会照着刚赢他的手势出，就出能克制它的。', '有意识地混合自己的套路，每次两三局，一旦不灵就立刻放弃。'],
    mistakes: ['一直出赢过的手势，直到被对手发现。', '为了随机而每次都换：从不重复本身就是一种规律。'],
  },
  tr: {
    summary: 'Aynı anda taş, kâğıt ya da makas: üç sayıya ilk ulaşan kazanır.',
    history: 'Bu türden el oyunları iki bin yıl önce Han hanedanı döneminde Çin’de oynanıyordu; taş, kâğıt ve makaslı üç işaretli oyun bugünkü biçimini 19. yüzyılda Japonya’da jan-ken adıyla aldı ve 20. yüzyılda bütün dünyaya yayıldı. Gerçek anlaşmazlıkları da çözdü; 2005’teki bir müzayede evi sözleşmesi bunlardan biridir. Rakibinin alışkanlıklarını okuyan bilgisayar programları insanları şansın izin verdiğinden çok daha sık yener.',
    rules: ['İki oyuncu da aynı anda bir işaret seçer: taş (yumruk), kâğıt (açık el) ya da makas (iki parmak).', 'Taş makası körletir, makas kâğıdı keser, kâğıt taşı sarar.', 'İki tarafta aynı işaret beraberliktir ve el tekrarlanır.', 'Burada üç eli ilk kazanan maçı alır. Tek cihazda ilk oyuncu seçer, cihazı uzatır, ikinci oyuncu onunkini görmeden seçer.'],
    basics: ['Tamamen rastgele oynayan biri uzun vadede yenilmez ama kazanamaz da.', 'İnsanlar rastgele değildir: çoğu taşla açar, aynı işareti üç kez tekrarlamaktan kaçınır ve kaybedince onu yenecek olana geçer.', 'Buradaki bilgisayar oynadıkça alışkanlıklarını öğrenir; önde kalmak için seçimlerini değiştir.'],
    advanced: ['İşarete değil alışkanlığa karşı oyna: rakibin onu yeneni taklit ediyorsa, onu yeneni oyna.', 'Kendi kalıplarını bilerek, ikişer üçer el karıştır ve işe yaramadığı anda bırak.'],
    mistakes: ['Kazandıran işareti rakip fark edene kadar tekrarlamak.', 'Rastgele olmak için hep değiştirmek: hiç tekrar etmemek de bir kalıptır.'],
  },
};
