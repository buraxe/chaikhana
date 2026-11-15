import type { Lesson } from '../../core/learn';
export const lesson: Lesson = {
  names: { en: 'T-Puzzle', zh: 'T字谜', tr: 'T Bulmacası', pinyin: 'T zì mí' },
  en: {
    summary: 'Four flat pieces cut from a letter T: put the T back together, then make a teapot, a boat and more.',
    history: 'Dissection puzzles, where a few flat pieces make many shapes, go back to the Chinese tangram and earlier. The T-puzzle, a T cut into four, was given away as an advertising novelty around 1900 and has stumped people ever since, because the answer asks you to turn one piece at an angle that feels wrong. Ours is the same idea with its own cut: a trapezoid, a square, a notched piece and a slanted bar, and twelve shapes found by trying every way the four pieces meet.',
    rules: ['Use all four pieces for every shape, without overlapping.', 'Pieces may be turned in steps of 45° and flipped over.', 'The silhouette is solved when it is covered exactly: nothing left uncovered, nothing sticking out.', 'Any arrangement that fills the shape counts, not only the one the site knows.'],
    basics: ['Start with the notched piece: wherever it goes, its notch must be filled by another piece or face outward as part of the outline.', 'Look for the slanted edges of the silhouette; each one is an edge of a piece.', 'The square fits almost anywhere, so place it last.'],
    advanced: ['Count the 45° corners in the outline and match them to the pieces that have them.', 'If the obvious upright T does not work, try the notched piece lying on its side or upside down.', 'A shape may have more than one answer: after solving, try to find another.'],
    mistakes: ['Keeping every piece upright: most shapes need at least one turned piece.', 'Forgetting to flip: the trapezoid and the notched piece each have a mirror image.'],
  },
  zh: {
    summary: '从字母T上切下的四块平板：先把T拼回去，再拼茶壶、帆船等形状。',
    history: '用几块平板拼出许多形状的分割谜题，可以追溯到中国的七巧板乃至更早。T字谜把一个T切成四块，大约1900年作为广告赠品流行开来，从此难倒了无数人，因为答案要求把一块斜着放，而这种放法看起来很不对劲。我们的版本沿用同样的玩法，但切法是自己的：一个梯形、一个正方形、一块缺角块和一根斜边长条，十二个剪影是通过尝试四块拼接的所有方式找出来的。',
    rules: ['每个形状都要用上全部四块，且不能重叠。', '板块可以按45°旋转，也可以翻转。', '剪影被正好盖满就算完成：没有空缺，也没有多出来的部分。', '只要能填满形状，任何拼法都算，不只是网站知道的那一种。'],
    basics: ['从缺角块开始：不管它放在哪里，缺口要么被别的块填上，要么朝外成为轮廓的一部分。', '找剪影里的斜边，每条斜边都是某块板的边。', '正方形几乎哪里都能放，留到最后。'],
    advanced: ['数一数轮廓上的45°角，对应到有这种角的板块。', '如果直立的T拼不出来，试着把缺角块横放或倒放。', '一个形状可能有不止一种解：解开后再找找另一种。'],
    mistakes: ['所有板块都直立摆放：大多数形状至少需要一块转过的板。', '忘了翻转：梯形和缺角块都有镜像。'],
  },
  tr: {
    summary: 'Bir T harfinden kesilmiş dört düz parça: önce T’yi yeniden kur, sonra bir çaydanlık, bir yelkenli ve dahasını yap.',
    history: 'Birkaç düz parçanın pek çok şekil oluşturduğu kesme bulmacaları Çin tangramına ve daha eskisine uzanır. Dörde bölünmüş bir T olan T bulmacası 1900’ler civarında reklam hediyesi olarak dağıtıldı ve o günden beri insanları şaşırtıyor; çünkü cevap bir parçayı yanlış gibi görünen bir açıyla çevirmeyi gerektirir. Bizimki aynı fikrin kendi kesimimizle yapılmış hâli: bir yamuk, bir kare, çentikli bir parça ve eğik bir çubuk; on iki siluet de dört parçanın birleşebileceği her yol denenerek bulundu.',
    rules: ['Her şekil için dört parçanın hepsini üst üste bindirmeden kullan.', 'Parçalar 45°’lik adımlarla döndürülebilir ve çevrilebilir.', 'Siluet tam olarak örtülünce çözülmüş olur: açıkta yer kalmaz, dışarı taşan olmaz.', 'Şekli dolduran her diziliş sayılır, yalnızca sitenin bildiği değil.'],
    basics: ['Çentikli parçayla başla: nereye giderse gitsin, çentiği ya başka bir parçayla dolmalı ya da dışa bakıp kenarın parçası olmalı.', 'Siluetteki eğik kenarlara bak; her biri bir parçanın kenarıdır.', 'Kare neredeyse her yere sığar; onu sona bırak.'],
    advanced: ['Kenardaki 45°’lik köşeleri say ve onlara sahip parçalarla eşleştir.', 'Dik duran T işe yaramazsa çentikli parçayı yan ya da baş aşağı yatır.', 'Bir şeklin birden fazla çözümü olabilir: çözdükten sonra başka birini ara.'],
    mistakes: ['Her parçayı dik tutmak: çoğu şekil en az bir döndürülmüş parça ister.', 'Çevirmeyi unutmak: yamuk da çentikli parça da aynada başka görünür.'],
  },
};
