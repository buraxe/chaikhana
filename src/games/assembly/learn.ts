import type { Lesson } from '../../core/learn';
export const lesson: Lesson = {
  names: { en: '3D Assembly Puzzles', zh: '3D拼装谜题', tr: '3B Montaj Bulmacaları', pinyin: '3D pīnzhuāng mítí', trad: '3D拼裝謎題' },
  en: {
    summary: 'Build a figure, a cross, a chair, a bridge, a castle or a stepped pyramid, from a set of oddly shaped pieces made for it.',
    history: 'Assembly puzzles grew from wooden building toys and from the polyomino puzzles that Solomon Golomb made famous in the 1950s. Designers cut a figure into pieces so that only a few ways of putting it back together exist; the same idea runs from Piet Hein’s Soma cube to the interlocking wooden animals sold in toy shops across Asia and Europe.',
    rules: ['Choose a figure. Pick a piece from the tray, move and turn it, and place it inside the glass figure.', 'Pieces may not overlap or stick out of the figure.', 'Use all the pieces to complete the figure. Tap a placed piece to pick it up again.', 'Each set was cut from its figure, so it can always be built; the hint places a piece from a working build.'],
    basics: ['Thin parts of the figure, legs, arms and towers, leave few choices: fill them first.', 'Look at each piece’s shape for a match: a long piece belongs in a long part.', 'Build from the bottom up when the figure has a wide base.'],
    advanced: ['When two pieces could fill the same spot, try the one that leaves a simpler hole behind.', 'Turn the view often: a gap hidden behind the figure is the most common reason a build gets stuck.'],
    mistakes: ['Filling the big open areas first and leaving the thin parts impossible.', 'Forgetting that pieces can be flipped, not only spun.'],
  },
  zh: {
    summary: '用一套专门切出来的奇形拼块，搭出十字、椅子、石桥、城堡或阶梯金字塔。',
    history: '拼装谜题源于木制积木，也源于所罗门·格伦布在50年代推广的多联骨牌谜题。设计者把一个图形切成若干块，使得只有少数几种拼回去的方法；从皮特·海恩的索玛立方体，到亚洲和欧洲玩具店里互相咬合的木头小动物，用的都是同一个思路。',
    rules: ['选一个图形。从托盘里选一块，移动、旋转，然后放进玻璃图形里。', '拼块不能重叠，也不能伸出图形外。', '用全部拼块完成图形。点已放好的块可以重新拿起来。', '每套拼块都是从它的图形切出来的，所以一定能拼好；提示会按一种可行的拼法放下一块。'],
    basics: ['图形中细的部分，比如腿、臂、塔，选择最少：先填它们。', '看拼块的形状来配对：长的块属于长的部分。', '图形底座宽时，从下往上搭。'],
    advanced: ['两块都能填同一处时，选留下的空洞更简单的那块。', '多转转视角：藏在图形背面的空隙，是拼不下去的最常见原因。'],
    mistakes: ['先填大的空旷部分，结果细的部分无法完成。', '忘了拼块可以翻转，不只是水平转动。'],
  },
  tr: {
    summary: 'Ona özel kesilmiş tuhaf şekilli parçalardan bir figür kur: haç, sandalye, köprü, kale ya da basamaklı piramit.',
    history: 'Montaj bulmacaları tahta yapı oyuncaklarından ve Solomon Golomb’un 1950’lerde ünlü yaptığı poliomino bulmacalarından doğdu. Tasarımcılar bir figürü, yeniden birleştirmenin yalnızca birkaç yolu kalacak şekilde parçalara keser; aynı fikir Piet Hein’ın Soma küpünden Asya ve Avrupa’daki oyuncakçılarda satılan geçmeli tahta hayvanlara kadar uzanır.',
    rules: ['Bir figür seç. Tepsiden bir parça al, hareket ettir, döndür ve cam figürün içine yerleştir.', 'Parçalar çakışamaz ve figürün dışına taşamaz.', 'Figürü bütün parçalarla tamamla. Yerleşmiş parçaya dokununca geri alırsın.', 'Her takım kendi figüründen kesildi, yani her zaman kurulabilir; ipucu işe yarayan bir kurulumdan bir parça yerleştirir.'],
    basics: ['Figürün ince kısımları (bacaklar, kollar, kuleler) az seçenek bırakır: önce onları doldur.', 'Parçanın şekline bak: uzun parça uzun bir kısma aittir.', 'Figürün tabanı genişse aşağıdan yukarı kur.'],
    advanced: ['İki parça aynı yeri doldurabiliyorsa, arkasında daha basit bir boşluk bırakanı dene.', 'Görünümü sık sık çevir: figürün arkasında saklı bir boşluk, kurulumun takılmasının en sık sebebidir.'],
    mistakes: ['Önce büyük açık alanları doldurup ince kısımları imkânsız bırakmak.', 'Parçaların yalnızca çevrilmekle kalmayıp ters de çevrilebildiğini unutmak.'],
  },
};
