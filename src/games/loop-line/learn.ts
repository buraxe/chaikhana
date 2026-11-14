import type { Lesson } from '../../core/learn';
export const lesson: Lesson = {
  names: { en: 'Loop Line', zh: '环线谜题', tr: 'Çizgi Döngüsü', pinyin: 'Shù huí', trad: '數回' },
  en: {
    summary: 'Join the dots into one closed loop. A number in a square says how many of its four sides the loop uses.',
    history: 'Slitherlink was created by the Japanese puzzle publisher Nikoli and first printed in its magazine in 1989. Like many Nikoli puzzles it spread abroad through newspapers in the 2000s. The Chinese name 数回 means “number loop”.',
    rules: ['Draw lines between neighbouring dots to make a single loop.', 'The loop never crosses itself or branches, and there is only one loop.', 'A number in a square tells how many of that square’s sides belong to the loop. Squares without numbers can have any count.', 'Every puzzle has one solution.'],
    basics: ['A 0 means none of its four sides: cross them all out.', 'A 3 in a corner of the grid uses both outer sides; two 3s next to each other share a side that is on the loop, and their outer sides too.', 'At every dot the loop either passes through (two lines) or not at all: a dot with one line and only one free side must continue that way.'],
    advanced: ['A 3 diagonally next to a 0 uses the two sides facing the 0’s corner.', 'Inside and outside: every square is either inside or outside the loop, and a line separates squares on opposite sides. Colouring regions can settle long stretches.'],
    mistakes: ['Closing a small loop early: there can be only one loop, using every line.', 'Leaving a dead end, a line that stops at a dot.'],
  },
  zh: {
    summary: '把点连成一条闭合回路。格子里的数字表示这一格的四条边中有几条在回路上。',
    history: '数回由日本谜题出版社Nikoli创作，1989年首次刊登在其杂志上。和许多Nikoli谜题一样，它在2000年代通过报纸传到海外。中文名“数回”就是“数字回路”的意思。',
    rules: ['在相邻的点之间连线，组成一条回路。', '回路不能交叉也不能分岔，并且只有一条。', '格子里的数字表示这一格有几条边属于回路；没有数字的格子不限。', '每道题只有唯一解。'],
    basics: ['0表示四条边都不在回路上：全部打叉。', '角上的3会用到两条外边；两个相邻的3共用的那条边一定在回路上，它们各自外侧的边也是。', '每个点要么被回路穿过（两条线），要么完全不用：一个点有一条线且只剩一个方向可走时，必须往那里延伸。'],
    advanced: ['3斜对着0时，3朝向0那一角的两条边都在回路上。', '内外法：每个格子不是在回路内就是在回路外，线把内外两侧的格子分开。给区域涂色可以一次推出很长一段。'],
    mistakes: ['过早闭合一个小圈：只能有一条回路，用上所有线。', '留下断头线：线停在某个点上。'],
  },
  tr: {
    summary: 'Noktaları tek bir kapalı döngüyle birleştir. Bir karedeki sayı, döngünün o karenin dört kenarından kaçını kullandığını söyler.',
    history: 'Slitherlink’i Japon bulmaca yayıncısı Nikoli yarattı; ilk kez 1989’da dergisinde basıldı. Birçok Nikoli bulmacası gibi 2000’lerde gazeteler yoluyla dünyaya yayıldı. Çince adı 数回 “sayı döngüsü” demektir.',
    rules: ['Komşu noktalar arasına çizgi çekerek tek bir döngü yap.', 'Döngü kendini kesmez, dallanmaz ve yalnızca bir döngü vardır.', 'Karedeki sayı, o karenin kaç kenarının döngüye ait olduğunu söyler. Sayısız karelerde sınır yoktur.', 'Her bulmacanın tek çözümü vardır.'],
    basics: ['0, dört kenarın hiçbiri demektir: hepsine çarpı koy.', 'Izgaranın köşesindeki 3 iki dış kenarı kullanır; yan yana iki 3’ün ortak kenarı döngüdedir, dış kenarları da.', 'Döngü her noktadan ya geçer (iki çizgi) ya hiç uğramaz: tek çizgisi ve tek boş yönü kalan bir nokta o yöne devam etmelidir.'],
    advanced: ['Bir 0’a çapraz komşu 3, 0’ın köşesine bakan iki kenarını kullanır.', 'İç ve dış: her kare ya döngünün içinde ya dışındadır; çizgi iki taraftaki kareleri ayırır. Bölgeleri boyamak uzun parçaları birden çözebilir.'],
    mistakes: ['Küçük bir döngüyü erkenden kapatmak: tek döngü olmalı ve bütün çizgileri kullanmalı.', 'Bir noktada biten kör uç bırakmak.'],
  },
};
