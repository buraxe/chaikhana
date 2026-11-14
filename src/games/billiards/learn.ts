import type { Lesson } from '../../core/learn';
export const lesson: Lesson = {
  names: { en: 'Billiards', tr: 'Bilardo', zh: '台球', pinyin: 'táiqiú' },
  en: {
    summary: 'Pocket billiards: 8-ball and 9-ball on a 9-foot table, plus a practice table.',
    history: 'Billiards grew out of a European lawn game that moved indoors onto tables, which is why the cloth is green. Pocket billiards, or pool, took its modern form in the United States: eight-ball became established in the early twentieth century and nine-ball became popular in the 1920s.',
    rules: [
      'Strike the white cue ball with the cue. Balls that reach a pocket stay down.',
      '8-ball: one player takes the solids (1–7), the other the stripes (9–15), decided by the first ball pocketed after the break. Pocket all of your group, then the 8 to win.',
      'Pocketing the 8 early, or on a foul, loses the rack. If the 8 drops on the break it is put back on the foot spot.',
      '9-ball: always hit the lowest-numbered ball first. Any ball pocketed on a legal shot lets you continue; pocketing the 9 on a legal shot wins, even early.',
      'Fouls: the cue ball goes in, no ball is hit, the wrong ball is hit first, or no ball reaches a cushion after contact when nothing is pocketed. After a foul the opponent has ball in hand anywhere on the table.',
      'Simplified for now: no called pockets, no push-out, and no three-foul rule.',
    ],
    basics: [
      'Aim with the ghost ball: the dotted circle shows where the cue ball will touch the first ball. The object ball travels away from that point along the line through both centres.',
      'Use the softest speed that gets the job done. Gentle shots are more accurate and keep the cue ball under control.',
      'In 8-ball, clear balls that block pockets early, and keep one easy ball near the 8 for the end.',
    ],
    advanced: [
      'Follow (top spin) makes the cue ball keep rolling after contact; draw (back spin) brings it back. Use them to place the cue ball for the next shot.',
      'Side spin changes the angle off a cushion. Use it sparingly; it also makes the shot harder to aim.',
      'When there is no good pot, play safe: hit a legal ball softly so it reaches a cushion and leave the cue ball far from easy shots.',
    ],
    mistakes: ['Hitting every shot hard.', 'Potting a ball without thinking where the cue ball will stop.'],
  },
  zh: {
    summary: '落袋台球：在9英尺球台上玩八球、九球，还有练习模式。',
    history: '台球起源于欧洲的一种草地游戏，后来搬进室内、搬到桌上，所以台呢是绿色的。落袋台球在美国形成了现代形式：八球在二十世纪初定型，九球在1920年代流行起来。',
    rules: [
      '用球杆击打白色母球，打进袋的球留在袋里。',
      '八球：开球后第一颗进袋的球决定分组，一方打全色球（1–7），另一方打花色球（9–15）。打完本组的球后，再打进8号球获胜。',
      '过早打进8号球，或犯规时8号球落袋，判负。开球时8号球落袋，放回置球点。',
      '九球：每次都必须先击中台面上号码最小的球。合法击球时只要有球进袋就可以继续；合法打进9号球即获胜，哪怕提前打进。',
      '犯规：母球落袋、没有击中任何球、先击中错误的球，或没有球进袋时击球后没有球碰库。犯规后对方获得自由球，可以把母球放在台面任意位置。',
      '目前为简化规则：不需要指定袋口，没有推杆规则，也没有三次犯规判负。',
    ],
    basics: [
      '用“假想球”瞄准：虚线圆圈表示母球接触第一颗球的位置，目标球会沿两球中心的连线方向离开。',
      '用能完成任务的最小力度。轻打更准，也更容易控制母球。',
      '八球中，尽早清掉挡住袋口的球，并在8号球附近留一颗容易打的球作为收尾。',
    ],
    advanced: [
      '高杆（上旋）让母球撞球后继续前进；低杆（下旋）让它回缩。用它们为下一杆走位。',
      '左右塞会改变母球碰库后的角度。少用，因为它也会让瞄准变难。',
      '没有好的进球机会时打防守：轻轻击中合法球让它碰库，并把母球留在远离好球的位置。',
    ],
    mistakes: ['每一杆都大力击球。', '只顾进球，不考虑母球会停在哪里。'],
  },
  tr: {
    summary: 'Cepli bilardo: 9 fitlik masada 8 top ve 9 top, artı bir antrenman masası.',
    history: 'Bilardo, kapalı mekâna, masaların üstüne taşınan bir Avrupa çim oyunundan doğdu; çuhanın yeşil olmasının nedeni budur. Cepli bilardo, yani pool, bugünkü biçimini Amerika Birleşik Devletleri’nde aldı: 8 top yirminci yüzyılın başlarında yerleşti, 9 top 1920’lerde sevildi.',
    rules: [
      'Beyaz topa ıstakayla vur. Cebe giren toplar orada kalır.',
      '8 top: bir oyuncu düzleri (1–7), diğeri çizgilileri (9–15) alır; açılıştan sonra cebe giren ilk top belirler. Grubunun hepsini, sonra 8’i sokarak kazan.',
      '8’i erken ya da faulle sokmak üçgeni kaybettirir. 8 açılışta girerse ayak noktasına geri konur.',
      '9 top: her zaman önce en küçük numaralı topa vur. Geçerli bir vuruşta cebe giren her top devam etmeni sağlar; 9’u geçerli bir vuruşta sokmak erken de olsa kazandırır.',
      'Fauller: beyaz top cebe girer, hiçbir topa değilmez, önce yanlış topa vurulur ya da hiçbir top girmediğinde temastan sonra hiçbir top banda ulaşmaz. Fauldan sonra rakip topu masanın istediği yerine koyar.',
      'Şimdilik basitleştirildi: cep söyleme yok, push-out yok, üç faul kuralı yok.',
    ],
    basics: [
      'Hayalet topla nişan al: noktalı daire beyaz topun ilk topa nerede değeceğini gösterir. Hedef top o noktadan, iki merkezden geçen çizgi boyunca uzaklaşır.',
      'İşi gören en yumuşak hızı kullan. Yumuşak vuruşlar daha isabetlidir ve beyaz topu kontrolde tutar.',
      '8 topta cepleri kapatan topları erken temizle ve sona 8’in yakınında kolay bir top bırak.',
    ],
    advanced: [
      'İleri falso (üst falso) beyaz topun temastan sonra yuvarlanmaya devam etmesini, geri falso (alt falso) geri gelmesini sağlar. Beyaz topu sonraki vuruşa yerleştirmek için kullan.',
      'Yan falso banttan çıkış açısını değiştirir. Az kullan; nişan almayı da zorlaştırır.',
      'İyi bir sokuş yoksa savunma oyna: geçerli bir topa yumuşak vur ki banda ulaşsın ve beyaz topu kolay vuruşlardan uzak bırak.',
    ],
    mistakes: ['Her vuruşa sert vurmak.', 'Beyaz topun nerede duracağını düşünmeden top sokmak.'],
  },
};
