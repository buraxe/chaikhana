import type { Lesson } from '../../core/learn';
export const lesson: Lesson = {
  names: { en: 'Lu Ban Lock', zh: '鲁班锁', tr: 'Lu Ban Kilidi', pinyin: 'Lǔ Bān suǒ', trad: '魯班鎖' },
  en: {
    summary: 'Six notched wooden sticks hold each other in a tight cross. Slide them one step at a time until every stick has come out.',
    history: 'Interlocking wooden puzzles are named in China after Lu Ban, the master carpenter of the state of Lu in the fifth century BC, patron of builders, said to have invented the saw and the carpenter’s square. The six-stick lock, also called the Kongming lock after the strategist Zhuge Liang, uses the same joinery that holds Chinese timber buildings together without nails: mortise and tenon, 榫卯. In the West the family is known as burr puzzles, and since the 1970s collectors have used computers to design burrs that need dozens of moves before the first piece comes free.',
    culture: 'Grandparents in China still hand a Lu Ban lock to a curious child: it teaches patience and the idea that strength can come from fit rather than from glue. The same joints hold up the halls of the Forbidden City and the wooden pagoda of Yingxian, standing since 1056.',
    rules: ['The lock is six square sticks, two along each direction, notched so they fit through each other.', 'Tap a stick, then slide it one cube with the arrows. It moves only if nothing is in the way.', 'A stick that can slide all the way clear comes out of the lock.', 'Take every stick out. The level is how many moves you need before the first stick can leave.'],
    basics: ['Try every stick in every direction: often only one or two can move at all.', 'Level 1 locks have a key stick that slides straight out; after that the others loosen.', 'A move that frees nothing may still make room for a neighbour.'],
    advanced: ['Think of the notches inside: a stick can only slide as far as the hole it moves into is long.', 'If you get stuck, step back: sliding a stick back and forth costs moves but can open a different route.'],
    mistakes: ['Moving pieces far away from the centre; the lock only opens close to home.', 'Forgetting the third direction: sticks can move up and down as well as sideways.'],
  },
  zh: {
    summary: '六根带凹槽的木条紧紧地互相卡在一起。一次推动一格，直到所有木条都拆出来。',
    history: '中国把这类咬合的木制益智玩具以鲁班命名。鲁班是公元前五世纪鲁国的巧匠，被奉为工匠的祖师，相传发明了锯子和曲尺。六根木条的锁又叫孔明锁，得名于诸葛亮；它用的正是中国木构建筑不用一根钉子的榫卯结构。西方把这类玩具叫作“毛刺谜题”（burr），70年代以来，收藏家们用电脑设计出要走几十步才能拔出第一根的锁。',
    culture: '在中国，爷爷奶奶至今仍会把鲁班锁递给好奇的孩子：它教人耐心，也让人明白，牢固可以来自契合而不是胶水。同样的榫卯撑起了故宫的大殿，也撑起了自1056年屹立至今的应县木塔。',
    rules: ['锁由六根方木条组成，每个方向两根，开有凹槽，可以互相穿过。', '点选一根木条，用箭头推动一格。只有前面没有阻挡时才能动。', '能一直推到底、完全推出的木条就离开锁。', '把所有木条都拆出来。难度是第一根木条能拔出之前需要的步数。'],
    basics: ['每根木条每个方向都试试：往往只有一两根能动。', '难度1的锁有一根“钥匙”木条，可以直接抽出；之后其他木条就松了。', '一步即使没有放出任何木条，也可能给旁边的木条腾出空间。'],
    advanced: ['想象里面的凹槽：木条能推多远，取决于它推进去的那个空洞有多长。', '卡住了就退一步：来回推动会多花步数，但可能打开另一条路。'],
    mistakes: ['把木条推得离中心太远；锁只在原位附近打开。', '忘了第三个方向：木条除了左右，还能上下移动。'],
  },
  tr: {
    summary: 'Altı çentikli tahta çubuk sıkı bir haç şeklinde birbirini tutuyor. Her seferinde bir adım kaydırarak bütün çubukları çıkar.',
    history: 'Çin’de iç içe geçen tahta bulmacalar, MÖ 5. yüzyılda Lu devletinde yaşamış usta marangoz Lu Ban’ın adını taşır; inşaatçıların piri sayılır, testereyi ve gönyeyi icat ettiği söylenir. Altı çubuklu kilide stratejist Zhuge Liang’dan ötürü Kongming kilidi de denir; Çin ahşap yapılarını tek çivi kullanmadan ayakta tutan zıvana-geçme (榫卯) birleşimini kullanır. Batı’da bu aileye “burr” bulmacaları denir; 1970’lerden beri koleksiyoncular bilgisayarla, ilk parça çıkmadan önce onlarca hamle isteyen kilitler tasarlıyor.',
    culture: 'Çin’de büyükanne ve büyükbabalar meraklı çocuklara hâlâ bir Lu Ban kilidi verir: sabrı ve sağlamlığın tutkaldan değil uyumdan gelebileceğini öğretir. Aynı birleşimler Yasak Şehir’in salonlarını ve 1056’dan beri ayakta duran Yingxian ahşap pagodasını taşır.',
    rules: ['Kilit altı kare çubuktan oluşur, her yönde iki tane; birbirinin içinden geçebilsinler diye çentiklidir.', 'Bir çubuğa dokun, sonra oklarla bir küp kaydır. Önü boşsa kımıldar.', 'Sonuna kadar kayabilen çubuk kilitten çıkar.', 'Bütün çubukları çıkar. Seviye, ilk çubuk çıkabilene kadar gereken hamle sayısıdır.'],
    basics: ['Her çubuğu her yönde dene: çoğu zaman yalnızca bir iki tanesi kımıldar.', '1. seviye kilitlerde doğrudan çıkan bir anahtar çubuk vardır; ondan sonra diğerleri gevşer.', 'Hiçbir şeyi serbest bırakmayan bir hamle bile komşusuna yer açabilir.'],
    advanced: ['İçerideki çentikleri düşün: bir çubuk, kaydığı boşluk ne kadar uzunsa o kadar gidebilir.', 'Takılırsan bir adım geri çekil: çubuğu ileri geri oynatmak hamle harcar ama başka bir yol açabilir.'],
    mistakes: ['Parçaları merkezden çok uzağa götürmek; kilit yalnızca yerine yakın açılır.', 'Üçüncü yönü unutmak: çubuklar sağa sola olduğu kadar yukarı aşağı da gider.'],
  },
};
