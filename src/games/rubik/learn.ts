import type { Lesson } from '../../core/learn';
export const lesson: Lesson = {
  names: { en: "Rubik's Cube", tr: 'Rubik Küpü', zh: '魔方', pinyin: 'mófāng' },
  en: {
    summary: 'Turn the layers until every face shows a single colour again.',
    history: 'The Hungarian architecture professor Ernő Rubik built the first cube in 1974 while looking for a way to explain three-dimensional movement to his students. It went on sale in Hungary in 1977 as the Magic Cube and worldwide as Rubik\'s Cube from 1980. A standard cube has about 43 quintillion positions, and in 2010 a computer search proved that every one can be solved in 20 face turns or fewer.',
    rules: [
      'Each face can be turned a quarter turn at a time. Notation: U up, D down, L left, R right, F front, B back; a letter alone is a clockwise turn as you look at that face, a prime (′) is counter-clockwise, and 2 is a half turn.',
      'x, y and z turn the whole cube (like R, U and F) without changing the puzzle.',
      'Here: drag a sticker to turn its layer, drag the background to look around, and scroll or pinch to zoom. 4×4 and 5×5 also have inner layers you can drag.',
      'A full scramble starts the timer at your first turn; it stops when the cube is solved. Practice scrambles use only a few moves and are not timed.',
    ],
    basics: [
      'Beginner method, step 1 – white cross: bring the four white edges around the white centre so their side colours match the side centres.',
      'Step 2 – white corners: put a white corner under its place and repeat R′ D′ R D until it drops in correctly.',
      'Step 3 – middle layer: with white on the bottom, line an edge up with its centre. To send it right: U R U′ R′ U′ F′ U F. To send it left: U′ L′ U L U F U′ F′.',
      'Step 4 – yellow cross: F R U R′ U′ F′, repeated until the yellow edges form a cross (hold a line horizontally, or an L at the back left).',
    ],
    advanced: [
      'Step 5 – yellow face: R U R′ U R U2 R′ (the Sune) turns corners until the whole top is yellow.',
      'Step 6 – place the corners: U R U′ L′ U R′ U′ L cycles three corners; hold a correct corner at the front right.',
      'Step 7 – twist the last corners: with the cube held still, repeat R′ D′ R D on each unsolved corner at the front right, turning only U between corners. The cube looks broken mid-way; keep going.',
      'Speedcubers use CFOP (cross, first two layers together, then orientation and permutation of the last layer). The solution button uses the Kociemba two-phase method, which computers use to find short solutions.',
    ],
    mistakes: ['Turning the whole cube during step 7, which breaks the bottom layers.', 'Solving the white face without matching the side colours.'],
  },
  zh: {
    summary: '转动各层，直到每一面重新变成单一颜色。',
    history: '1974年，匈牙利建筑学教授鲁比克·艾尔诺为了向学生讲解三维运动，做出了第一个魔方。1977年它以“魔术方块”之名在匈牙利上市，1980年起以“鲁比克魔方”之名风靡全球。三阶魔方约有4.3×10¹⁹种状态，2010年计算机搜索证明，任何状态都能在20步面转以内复原。',
    rules: [
      '每个面一次可以转90°。记号：U上、D下、L左、R右、F前、B后；单个字母表示面对该面时顺时针转，带′表示逆时针，带2表示转180°。',
      'x、y、z 表示整体转动魔方（方向分别同 R、U、F），不会改变魔方的状态。',
      '在这里：拖动色块转动它所在的层，拖动空白处旋转视角，滚轮或双指缩放。4×4和5×5还可以拖动内层。',
      '完全打乱后，计时从第一次转动开始，复原时停止。练习打乱只转几步，不计时。',
    ],
    basics: [
      '层先法第1步——白色十字：把四个白色棱块转到白色中心周围，并让它们侧面的颜色与侧面中心一致。',
      '第2步——白色角块：把白色角块放到目标位置下方，重复 R′ D′ R D，直到它正确归位。',
      '第3步——中层：白色朝下，把棱块对准它的中心。要放到右边：U R U′ R′ U′ F′ U F；要放到左边：U′ L′ U L U F U′ F′。',
      '第4步——黄色十字：重复 F R U R′ U′ F′，直到黄色棱块组成十字（一字横放，或L形放在左后方）。',
    ],
    advanced: [
      '第5步——黄色顶面：用 R U R′ U R U2 R′（小鱼公式）转动角块，直到顶面全黄。',
      '第6步——角块归位：U R U′ L′ U R′ U′ L 循环交换三个角块；把一个位置正确的角块放在右前方。',
      '第7步——调整最后的角块：魔方整体不动，对右前方每个未完成的角块重复 R′ D′ R D，换角时只转 U 层。中途魔方看起来会被打乱，继续做下去即可。',
      '速拧玩家使用 CFOP 法（十字、前两层同时完成、顶层朝向、顶层排列）。“演示解法”按钮使用的是计算机常用来求短解的 Kociemba 两阶段算法。',
    ],
    mistakes: ['第7步中途整体转动了魔方，导致下面两层被打乱。', '只拼好白色面，却没有对齐侧面颜色。'],
  },
  tr: {
    summary: 'Her yüz yeniden tek renk olana kadar katmanları çevir.',
    history: 'Macar mimarlık profesörü Ernő Rubik ilk küpü 1974’te, öğrencilerine üç boyutlu hareketi anlatmanın bir yolunu ararken yaptı. Küp 1977’de Macaristan’da Sihirli Küp adıyla, 1980’den itibaren de bütün dünyada Rubik Küpü adıyla satışa çıktı. Standart küpün yaklaşık 43 kentilyon durumu vardır ve 2010’da bir bilgisayar araması her birinin 20 ya da daha az yüz dönüşüyle çözülebileceğini kanıtladı.',
    rules: [
      'Her yüz bir seferde çeyrek tur çevrilebilir. Gösterim: U üst, D alt, L sol, R sağ, F ön, B arka; tek başına harf o yüze bakarken saat yönünde dönüş, üs işareti (′) saat yönünün tersi, 2 ise yarım turdur.',
      'x, y ve z bütün küpü (R, U ve F gibi) bulmacayı değiştirmeden çevirir.',
      'Burada: katmanını çevirmek için bir çıkartmayı sürükle, etrafa bakmak için arka planı sürükle, yakınlaştırmak için kaydır ya da sıkıştır. 4×4 ve 5×5’te sürükleyebileceğin iç katmanlar da vardır.',
      'Tam karıştırmada süre ilk dönüşünde başlar ve küp çözülünce durur. Antrenman karıştırmaları yalnızca birkaç hamle kullanır ve süre tutulmaz.',
    ],
    basics: [
      'Başlangıç yöntemi, 1. adım – beyaz artı: dört beyaz kenarı beyaz merkezin etrafına, yan renkleri yan merkezlere uyacak şekilde getir.',
      '2. adım – beyaz köşeler: beyaz bir köşeyi yerinin altına getir ve doğru oturana kadar R′ D′ R D tekrarla.',
      '3. adım – orta katman: beyaz alttayken bir kenarı merkeziyle hizala. Sağa göndermek için: U R U′ R′ U′ F′ U F. Sola göndermek için: U′ L′ U L U F U′ F′.',
      '4. adım – sarı artı: sarı kenarlar artı oluşturana kadar F R U R′ U′ F′ (düz çizgiyi yatay, L’yi sol arkada tut).',
    ],
    advanced: [
      '5. adım – sarı yüz: R U R′ U R U2 R′ (Sune) bütün üst yüz sarı olana kadar köşeleri döndürür.',
      '6. adım – köşeleri yerleştir: U R U′ L′ U R′ U′ L üç köşeyi döngüye sokar; doğru bir köşeyi sağ önde tut.',
      '7. adım – son köşeleri döndür: küpü sabit tutarak sağ öndeki her çözülmemiş köşede R′ D′ R D tekrarla, köşeler arasında yalnızca U’yu çevir. Küp yarı yolda bozulmuş görünür; devam et.',
      'Hız küpçüleri CFOP kullanır (artı, ilk iki katman birlikte, sonra son katmanın yönlendirmesi ve yerleştirmesi). Çözüm düğmesi, bilgisayarların kısa çözümler bulmak için kullandığı Kociemba iki aşamalı yöntemini kullanır.',
    ],
    mistakes: ['7. adımda bütün küpü çevirip alt katmanları bozmak.', 'Yan renkleri eşleştirmeden beyaz yüzü çözmek.'],
  },
};
