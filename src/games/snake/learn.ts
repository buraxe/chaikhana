import type { Lesson } from '../../core/learn';
export const lesson: Lesson = {
  names: { en: 'Snake Cube', zh: '蛇形立方', tr: 'Yılan Küp', pinyin: 'Shéxíng lìfāng', trad: '蛇形立方' },
  en: {
    summary: 'Twenty-seven wooden cubes threaded on an elastic cord. At some cubes the chain bends; twist the joints until the whole snake folds into a 3×3×3 cube.',
    history: 'The snake cube is a traditional wooden toy with no known inventor, sold in Europe and Asia for generations under names like the Kibble cube and the Cubra. Mathematicians treat it as a path problem: the folded snake is a path that visits all 27 cells of the cube, and only some sequences of straight runs and turns can do it.',
    rules: ['The snake is a chain of straight runs. Light cubes are joints, where the chain turns.', 'Tap a joint (or use the numbered buttons) to swing the rest of the chain a quarter turn around the run before it.', 'Cubes may not pass through each other; a twist that would collide is skipped.', 'Fold the snake so that it fills a 3×3×3 cube exactly.'],
    basics: ['The ends are easiest to place at corners of the cube.', 'A run of three cubes is a whole edge or a whole middle line of the cube: decide where it goes early.', 'Work from one end: when the first part is right, the rest has fewer choices.'],
    advanced: ['Colour the cube’s cells like a 3D chessboard: corners and the centre are one colour, there are 14 of it and 13 of the other, so the snake must start and end on corner-coloured cells.', 'If the end of the chain cannot fit, the mistake is usually several joints earlier; the hint finds where.'],
    mistakes: ['Twisting joints near the fixed end last: they move everything after them.', 'Building a flat 3×3 layer first that leaves the rest of the snake no way to climb.'],
  },
  zh: {
    summary: '二十七个小木块穿在一根松紧绳上。链子在某些块处可以拐弯；扭动这些关节，直到整条蛇折成一个3×3×3的立方体。',
    history: '蛇形立方是一种传统木制玩具，没有已知的发明者，几代人以来在欧洲和亚洲以各种名字出售。数学家把它看作路径问题：折好的蛇是一条走遍立方体全部27格的路径，只有某些直段与拐弯的组合才能做到。',
    rules: ['蛇由若干直段组成。浅色的块是关节，链子在这里拐弯。', '点一个关节（或用编号按钮），后面的链子会绕着前一段转四分之一圈。', '方块不能互相穿过；会撞上的转法会被跳过。', '把蛇折成正好填满3×3×3的立方体。'],
    basics: ['两端最容易放在立方体的角上。', '三块长的一段正好是立方体的一整条棱或一整条中线：早点决定它的位置。', '从一端开始：前面一段对了，后面的选择就少了。'],
    advanced: ['把立方体的格子像三维棋盘一样涂色：角和中心是同一种颜色，共14格，另一种13格，所以蛇的两端必须落在“角色”格上。', '如果链尾放不进去，错误通常在前面好几个关节；提示会找出是哪一个。'],
    mistakes: ['最后才扭固定端附近的关节：它们会带动后面的所有部分。', '先拼出一层扁平的3×3，结果剩下的蛇没法往上爬。'],
  },
  tr: {
    summary: 'Yirmi yedi tahta küp esnek bir ipe dizilmiş. Zincir bazı küplerde kıvrılıyor; bütün yılan 3×3×3 bir küpe katlanana kadar eklemleri çevir.',
    history: 'Yılan küp, mucidi bilinmeyen geleneksel bir tahta oyuncaktır; kuşaklardır Avrupa’da ve Asya’da Kibble küpü, Cubra gibi adlarla satılır. Matematikçiler onu bir yol problemi olarak görür: katlanmış yılan, küpün 27 hücresinin hepsine uğrayan bir yoldur ve bunu yalnızca bazı düz parça ve dönüş dizileri yapabilir.',
    rules: ['Yılan düz parçalardan oluşan bir zincirdir. Açık renkli küpler, zincirin döndüğü eklemlerdir.', 'Bir ekleme dokun (ya da numaralı düğmeleri kullan); zincirin geri kalanı önceki parça etrafında çeyrek tur döner.', 'Küpler birbirinin içinden geçemez; çarpışacak bir çeviriş atlanır.', 'Yılanı 3×3×3 bir küpü tam dolduracak şekilde katla.'],
    basics: ['Uçları küpün köşelerine yerleştirmek en kolayıdır.', 'Üç küplük bir parça küpün tam bir kenarı ya da tam bir orta çizgisidir: yerine erken karar ver.', 'Bir uçtan çalış: ilk kısım doğru olunca geri kalanının seçeneği azalır.'],
    advanced: ['Küpün hücrelerini üç boyutlu bir satranç tahtası gibi boya: köşeler ve merkez aynı renk, ondan 14, diğerinden 13 tane var; yani yılan köşe rengindeki hücrelerde başlayıp bitmeli.', 'Zincirin sonu sığmıyorsa hata genelde birkaç eklem öncedir; ipucu nerede olduğunu bulur.'],
    mistakes: ['Sabit uca yakın eklemleri en sona bırakmak: arkalarındaki her şeyi oynatırlar.', 'Önce yassı bir 3×3 katman kurup yılanın geri kalanına tırmanacak yol bırakmamak.'],
  },
};
