import type { Lesson } from '../../core/learn';
export const lesson: Lesson = {
  names: { en: 'Burr Puzzles', zh: '插接谜题', tr: 'Geçme Bulmacalar (Burr)', pinyin: 'Chājiē mítí', trad: '插接謎題' },
  en: {
    summary: 'Harder six-piece burrs: every stick is locked until several others have shuffled aside. Five, six or seven moves pass before the first piece can come out.',
    history: 'In Europe and America interlocking puzzles are called burrs, perhaps because the finished shape looks like a seed burr. Wooden burrs were sold as toys and souvenirs from the eighteenth century. In the late twentieth century collectors such as Bill Cutler used computers to analyse every possible six-piece burr; the hardest need dozens of moves before the first piece is free, and the level of a burr — the number of moves to release the first piece — became the measure of its difficulty.',
    rules: ['Tap a stick, then slide it one cube with the arrows. It moves only if nothing is in the way.', 'A stick that can slide all the way clear comes out.', 'Take every stick out. The level is the number of moves before the first one can leave.', 'These locks were found by a computer search; each is checked to come apart in the number of moves shown.'],
    basics: ['At the start, usually only one or two sticks can move at all: find them first.', 'Each move opens a gap somewhere else; look at which sticks touch the one you just moved.', 'Count your moves against the best: going over means you took a detour.'],
    advanced: ['Higher-level burrs need a sequence where the same stick moves out and back again; do not be afraid to reverse.', 'Keep the pieces close to home: wandering far never helps a burr come apart.'],
    mistakes: ['Repeating the same two moves back and forth.', 'Looking for a stick that slides straight out: at these levels none does at first.'],
  },
  zh: {
    summary: '更难的六块插接锁：每根木条都被锁住，要等其他几根挪开之后才能动。拔出第一根之前要走五、六甚至七步。',
    history: '在欧美，这类互锁的谜题叫作burr，也许因为拼好的样子像带刺的种子。18世纪起，木制burr就作为玩具和纪念品出售。20世纪后期，比尔·卡特勒等收藏家用电脑分析了所有可能的六块burr；最难的要走几十步才能放出第一块，而“级数”——放出第一块所需的步数——成了衡量难度的标准。',
    rules: ['点一根木条，用箭头推动一格。只有前面没有阻挡时才能动。', '能一直推到底的木条就会被拔出。', '把所有木条都拆出来。级数是第一根能离开之前需要的步数。', '这些锁由电脑搜索得到，每一把都验证过能按显示的步数拆开。'],
    basics: ['开局时往往只有一两根能动：先找到它们。', '每一步都会在别处腾出空隙；看看哪些木条挨着你刚推动的那根。', '把你的步数和最少步数比一比：多了说明绕了远路。'],
    advanced: ['级数高的锁需要让同一根木条推出去再推回来；不要怕走回头路。', '让木条靠近原位：跑得太远对拆锁没有帮助。'],
    mistakes: ['来回重复同样的两步。', '找一根能直接抽出的木条：这些级数的锁一开始没有。'],
  },
  tr: {
    summary: 'Daha zor altı parçalı geçmeler: her çubuk, başka birkaçı kenara çekilene kadar kilitli. İlk parça çıkmadan önce beş, altı ya da yedi hamle geçer.',
    history: 'Avrupa’da ve Amerika’da iç içe geçen bulmacalara “burr” denir; belki bitmiş hâli dikenli bir tohum kozasına (burr) benzediği için. Tahta burr’lar 18. yüzyıldan beri oyuncak ve hatıra eşyası olarak satılır. 20. yüzyılın sonlarında Bill Cutler gibi koleksiyoncular olası bütün altı parçalı burr’ları bilgisayarla inceledi; en zorları ilk parça serbest kalmadan onlarca hamle ister. Bir burr’ın seviyesi, yani ilk parçayı çıkarmak için gereken hamle sayısı, zorluğunun ölçüsü oldu.',
    rules: ['Bir çubuğa dokun, sonra oklarla bir küp kaydır. Önü boşsa kımıldar.', 'Sonuna kadar kayabilen çubuk çıkar.', 'Bütün çubukları çıkar. Seviye, ilki çıkabilene kadar gereken hamle sayısıdır.', 'Bu kilitler bilgisayar aramasıyla bulundu; her birinin gösterilen hamle sayısında söküldüğü doğrulandı.'],
    basics: ['Başta çoğu zaman yalnızca bir iki çubuk kımıldar: önce onları bul.', 'Her hamle başka bir yerde boşluk açar; az önce oynattığın çubuğa hangilerinin değdiğine bak.', 'Hamlelerini en iyisiyle karşılaştır: fazlası dolambaçlı yoldan gittiğini gösterir.'],
    advanced: ['Yüksek seviyeli burr’lar aynı çubuğun çıkıp geri girmesini ister; geri gitmekten korkma.', 'Parçaları evlerine yakın tut: uzağa gitmek bir burr’ı sökmeye hiç yardım etmez.'],
    mistakes: ['Aynı iki hamleyi ileri geri tekrarlamak.', 'Doğrudan çıkan bir çubuk aramak: bu seviyelerde başta hiçbiri çıkmaz.'],
  },
};
