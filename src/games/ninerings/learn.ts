import type { Lesson } from '../../core/learn';
export const lesson: Lesson = {
  names: { en: 'Nine Linked Rings', zh: '九连环', tr: 'Dokuz Halka (九连环)', pinyin: 'Jiǔ lián huán', trad: '九連環' },
  en: {
    summary: 'Nine rings sit on a looped bar, each tied to its neighbour. Take them all off. Each ring can move only when the rings beside it are just right, so the solution is long but follows a beautiful pattern.',
    history: 'The Nine Linked Rings is one of China’s oldest mechanical puzzles. Song-dynasty writers already mention it, and by the Ming and Qing it was a toy of scholars’ studios and women’s chambers; the novel Dream of the Red Chamber shows Lin Daiyu playing with one. In Europe the Italian mathematician Cardano described it in 1550, and in 1872 the Frenchman Louis Gros showed that its moves follow what we now call the Gray code, the same code used today in rotary encoders and error correction.',
    culture: 'In China the rings were a gift for clever children and a symbol of patience: solving nine rings takes 341 moves. Folk tales tell of a wife who gave her husband the puzzle so he would stay home, and of scholars who used it to show that a long road is walked one step at a time.',
    rules: ['Ring 1 is the one at the tip of the bar. It can always go on or off.', 'Any other ring can go on or off only if the ring just outside it is on the bar and every ring further out is off.', 'Take every ring off the bar. Undo is allowed; the move counter keeps counting.', 'With n rings, the fewest moves are about 2^(n+1)/3: 21 for five rings, 85 for seven, 341 for nine.'],
    basics: ['To take off ring 2, ring 1 must be on; to take off ring 3, ring 2 must be on and ring 1 off.', 'Work from the inside: to remove the innermost ring, first clear everything outside it except its neighbour.', 'Ring 1 and ring 2 alternate with whichever other ring can move: watch the glow.'],
    advanced: ['The position is a Gray code: read the rings from the inside as binary digits with each one flipped by the ones before it, and you get the number of moves still needed.', 'Clearing n rings takes the moves for n−2 rings, one move for the innermost, the moves to put n−2 rings back, then the moves for n−1 rings.'],
    mistakes: ['Moving ring 1 twice in a row: it just undoes itself.', 'Putting back rings you will need off a few moves later; the hint shows the shortest way.'],
  },
  zh: {
    summary: '九个环套在一根环形剑上，彼此相连。把它们全部取下来。每个环只有在旁边的环处于恰当状态时才能动，所以解法很长，却遵循着美妙的规律。',
    history: '九连环是中国最古老的机械益智玩具之一。宋代文人已有记载，明清时期它是书房和闺阁中的玩物；《红楼梦》里就写到林黛玉解九连环。在欧洲，意大利数学家卡尔达诺于1550年描述过它；1872年法国人格罗斯发现它的步骤遵循今天所说的格雷码，这种编码至今仍用于旋转编码器和纠错。',
    culture: '在中国，九连环是送给聪明孩子的礼物，也是耐心的象征：解开九个环需要341步。民间传说有妻子送丈夫九连环让他安心在家，也有读书人用它说明再长的路也要一步一步走。',
    rules: ['第1环是剑尖处的那个，随时可以上下。', '其他任何环，只有在它外侧紧邻的环在剑上、且更外侧的环都已取下时，才能上或下。', '把所有环都从剑上取下。可以撤销，但步数照样计算。', 'n个环的最少步数约为2^(n+1)/3：五环21步，七环85步，九环341步。'],
    basics: ['要取下第2环，第1环必须在剑上；要取下第3环，第2环必须在剑上、第1环已取下。', '从里往外想：要取下最里面的环，先把它外侧除了紧邻那一个以外的环都取下。', '第1、第2环与其他可动的环交替移动：留意发亮的环。'],
    advanced: ['局面就是一个格雷码：从里往外把环读成二进制，每一位再与前面的位异或，得到的数就是还需要的步数。', '取下n个环 = 取下n−2个环的步数 + 最里面一环1步 + 把n−2个环放回 + 取下n−1个环的步数。'],
    mistakes: ['连续两次移动第1环：等于没动。', '把几步之后又要取下的环放回去；提示会显示最短的走法。'],
  },
  tr: {
    summary: 'Dokuz halka, ilmekli bir çubuğa takılı ve her biri komşusuna bağlı. Hepsini çıkar. Her halka ancak yanındakiler tam uygun durumdayken oynar; bu yüzden çözüm uzundur ama çok güzel bir düzeni izler.',
    history: 'Dokuz Halka Çin’in en eski mekanik bulmacalarından biridir. Song hanedanı yazarları ondan söz eder; Ming ve Qing dönemlerinde âlimlerin çalışma odalarının ve kadın odalarının oyuncağıydı. Kızıl Köşkün Rüyası romanında Lin Daiyu bir tanesiyle oynar. Avrupa’da İtalyan matematikçi Cardano onu 1550’de anlattı; 1872’de Fransız Louis Gros hamlelerinin bugün Gray kodu dediğimiz düzeni izlediğini gösterdi. Bu kod bugün döner kodlayıcılarda ve hata düzeltmede kullanılıyor.',
    culture: 'Çin’de halkalar zeki çocuklara verilen bir hediye ve sabrın simgesiydi: dokuz halkayı çözmek 341 hamle sürer. Halk hikâyeleri, kocası evde otursun diye ona bu bulmacayı veren bir kadından ve uzun yolun adım adım yürüneceğini göstermek için onu kullanan âlimlerden söz eder.',
    rules: ['1. halka çubuğun ucundakidir. Her zaman takılıp çıkarılabilir.', 'Diğer bir halka ancak hemen dışındaki halka çubuktayken ve ondan daha dıştakilerin hepsi çıkmışken takılıp çıkarılabilir.', 'Bütün halkaları çubuktan çıkar. Geri almak serbest, hamle sayacı saymaya devam eder.', 'n halka için en az hamle yaklaşık 2^(n+1)/3’tür: beş halkada 21, yedide 85, dokuzda 341.'],
    basics: ['2. halkayı çıkarmak için 1. halka takılı olmalı; 3. halkayı çıkarmak için 2. takılı, 1. çıkmış olmalı.', 'İçeriden düşün: en içteki halkayı çıkarmak için önce komşusu dışında, dışındaki her şeyi temizle.', '1. ve 2. halka, oynayabilen diğer halkayla sırayla oynar: parlayana bak.'],
    advanced: ['Durum bir Gray kodudur: halkaları içten dışa ikili rakamlar olarak oku, her biri öncekilerle ters çevrilsin; çıkan sayı kalan hamle sayısıdır.', 'n halkayı çıkarmak = n−2 halkanın hamleleri + en içteki için 1 hamle + n−2 halkayı geri takmak + n−1 halkanın hamleleri.'],
    mistakes: ['1. halkayı üst üste iki kez oynatmak: kendini geri alır.', 'Birkaç hamle sonra yine çıkarman gereken halkaları geri takmak; ipucu en kısa yolu gösterir.'],
  },
};
