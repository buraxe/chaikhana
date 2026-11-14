import type { Lesson } from '../../core/learn';
export const lesson: Lesson = {
  names: { en: 'Kongming Lock', zh: '孔明锁', tr: 'Kongming Kilidi', pinyin: 'Kǒngmíng suǒ', trad: '孔明鎖' },
  en: {
    summary: 'The six notched sticks lie scattered on the table. Push them in one by one, in the right order and from the right side, until they lock into a solid cross.',
    history: 'In much of China the six-stick lock is called the Kongming lock, after Zhuge Liang (courtesy name Kongming), the strategist of the Three Kingdoms period famed for his inventions, from the wooden ox that carried grain to the repeating crossbow. Legend says he made the lock to train his soldiers’ patience. Taking such a lock apart is the first challenge; putting it back together, without seeing how it came apart, is the harder one.',
    culture: 'Kongming has become a byword for cleverness in Chinese: 赛诸葛 (“a match for Zhuge”) praises a sharp mind. The lock, the Kongming lantern (sky lantern) and the Kongming fan are all named after him.',
    rules: ['Tap a stick lying outside, then push it in from one side with an arrow. It goes in as deep as it can, lined up where it fits best.', 'Sticks inside can be slid one cube at a time, or taken out again if the way is clear.', 'Build the lock: every stick back in its home place.', 'The hint follows a known way in and can also lead you back onto it.'],
    basics: ['The key stick goes in last: it is the one that slid straight out first when taking the lock apart.', 'Start with sticks that have the most wood; heavily notched sticks fit around them.', 'A stick that stops short is blocked by a neighbour: move that neighbour aside, then push again.'],
    advanced: ['Work backwards: imagine the finished lock and ask which stick could come out first; that stick goes in last.', 'Sticks often need to go in a cube off-centre and then slide home once a neighbour arrives.'],
    mistakes: ['Pushing every stick to the centre at once: most locks need some sticks to wait off-centre.', 'Forgetting that sticks can come back out: undoing a step is often the fastest way forward.'],
  },
  zh: {
    summary: '六根带凹槽的木条散放在桌上。按正确的顺序、从正确的方向把它们一根根推进去，直到锁成一个结实的十字。',
    history: '在中国很多地方，六根木条的锁被叫作孔明锁，得名于三国时期以发明著称的谋士诸葛亮（字孔明），从运粮的木牛流马到连弩都归功于他。传说他做这把锁是为了磨练士兵的耐心。把锁拆开是第一个挑战；没看过拆法就把它重新装回去，才是更难的那个。',
    culture: '在汉语里，孔明成了聪明的代名词：“赛诸葛”就是夸人头脑灵活。孔明锁、孔明灯和孔明扇都以他命名。',
    rules: ['点一根放在外面的木条，用箭头从某一侧把它推进去。它会对准最合适的位置，推到最深处。', '已经在里面的木条可以一格一格地推动；如果路是通的，也可以再抽出来。', '装好整把锁：每根木条都回到原位。', '提示会沿着一条已知的装法走，偏离了也能把你带回去。'],
    basics: ['“钥匙”木条最后放：拆锁时它是第一根直接抽出来的。', '先放木头多的木条；凹槽多的木条围着它们装。', '推到一半停住的木条是被旁边的挡住了：先把旁边的挪开，再推。'],
    advanced: ['倒过来想：想象装好的锁，问哪一根能最先拔出；那一根就最后装。', '木条常常要先偏一格放进去，等邻居到位后再推回原位。'],
    mistakes: ['一下子把每根都推到中心：大多数锁需要有些木条先在偏处等着。', '忘了木条还能再抽出来：退一步往往是最快的前进。'],
  },
  tr: {
    summary: 'Altı çentikli çubuk masada dağınık duruyor. Onları doğru sırayla ve doğru taraftan teker teker içeri it, ta ki sağlam bir haç olarak kilitlenene kadar.',
    history: 'Çin’in birçok yerinde altı çubuklu kilide Kongming kilidi denir. Adını, Üç Krallık döneminin icatlarıyla ünlü stratejisti Zhuge Liang’dan (lakabı Kongming) alır; tahıl taşıyan tahta öküzden seri atan arbaleta kadar pek çok icat ona atfedilir. Efsaneye göre kilidi askerlerinin sabrını eğitmek için yapmıştır. Böyle bir kilidi sökmek ilk sınavdır; nasıl söküldüğünü görmeden yeniden birleştirmek ise daha zor olanıdır.',
    culture: 'Çincede Kongming zekânın simgesi olmuştur: 赛诸葛 (“Zhuge’ye denk”) keskin bir aklı över. Kilit, Kongming feneri (gökyüzü feneri) ve Kongming yelpazesi hep onun adını taşır.',
    rules: ['Dışarıdaki bir çubuğa dokun, sonra bir okla bir taraftan içeri it. En iyi oturduğu hizada, girebildiği kadar derine girer.', 'İçerideki çubuklar birer küp kaydırılabilir; yol açıksa yeniden dışarı da alınabilir.', 'Kilidi kur: her çubuk kendi yerine.', 'İpucu bilinen bir giriş yolunu izler ve saparsan seni yeniden ona götürür.'],
    basics: ['Anahtar çubuk en son girer: kilit sökülürken doğrudan ilk çıkan odur.', 'En çok tahtası olan çubuklarla başla; çok çentikli çubuklar onların etrafına oturur.', 'Yarıda duran çubuğu bir komşusu engelliyordur: önce komşuyu kenara al, sonra yeniden it.'],
    advanced: ['Tersinden düşün: bitmiş kilidi hayal et ve hangi çubuğun ilk çıkabileceğini sor; o çubuk en son girer.', 'Çubukların çoğu zaman önce bir küp kaydık girip, komşusu yerine oturunca evine kayması gerekir.'],
    mistakes: ['Her çubuğu bir anda merkeze itmek: çoğu kilit bazı çubukların kenarda beklemesini ister.', 'Çubukların geri çıkabildiğini unutmak: bir adım geri gitmek çoğu zaman en hızlı ilerlemedir.'],
  },
};
