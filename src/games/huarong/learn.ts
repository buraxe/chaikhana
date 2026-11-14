import type { Lesson } from '../../core/learn';
export const lesson: Lesson = {
  names: { en: 'Huarong Dao', tr: 'Huarong Dao', zh: '华容道', trad: '華容道', pinyin: 'Huáróng Dào' },
  en: {
    summary: 'Slide the blocks until Cao Cao, the large square, escapes through the gap at the bottom of the board.',
    history: 'The puzzle takes its story from the Romance of the Three Kingdoms. After his defeat at the Battle of Red Cliffs in 208, the warlord Cao Cao fled along the Huarong road, where Guan Yu was waiting with troops. Remembering a past kindness, Guan Yu let him pass. Sliding-block puzzles of this kind became popular in China in the early twentieth century, and similar puzzles appeared in Europe and America around the same time, so where the 4×5 form began is still debated.',
    culture: 'The blocks are named after real figures: Cao Cao, the five generals Guan Yu, Zhang Fei, Zhao Yun, Ma Chao and Huang Zhong, and the foot soldiers. Freeing Cao Cao retells Guan Yu choosing loyalty and gratitude over orders, a scene every Chinese reader knows. Huarong Dao is still sold as a wooden toy and is widely used in schools to teach planning and patience. Together with the tangram and the Nine Linked Rings, it is often named among China\'s best-known traditional puzzles.',
    rules: [
      'The board is 4 cells wide and 5 tall. Cao Cao is a 2×2 block; generals are 1×2 or 2×1; soldiers are 1×1. Two cells are empty.',
      'Slide one block into empty space. Blocks cannot jump, rotate or leave the board.',
      'Moving one block any distance, even around a corner, counts as one move.',
      'You win when Cao Cao reaches the middle of the bottom row, where the exit is.',
    ],
    basics: [
      'Think about the two empty cells. Every move is really a move of the gaps, so plan where you need them to be.',
      'Soldiers are the most flexible pieces. Use them to bring the two gaps together into a 1×2 or 2×1 space.',
      'Cao Cao can only move when both gaps sit side by side next to him. Prepare that before trying to move him.',
    ],
    advanced: [
      'Work in stages: first get the lying general out of the way, then line up the upright generals, then bring Cao Cao down.',
      'The classic layout, Héng Dāo Lì Mǎ ("sword drawn, horse reined"), needs 81 moves at minimum. The counter above the board shows the minimum for every layout.',
      'If you get lost, the hint shows the next move of a shortest solution from where you are now.',
    ],
    mistakes: ['Pushing Cao Cao down early and boxing him in.', 'Leaving the two gaps far apart, so no general can move.'],
  },
  zh: {
    summary: '滑动木块，让最大的方块曹操从棋盘底部中间的出口逃出去。',
    history: '这个谜题的故事来自《三国演义》。公元208年赤壁之战后，曹操兵败，沿华容道逃走，关羽早已在那里埋伏。关羽念及曹操昔日的恩情，放他过去。这种滑块游戏在二十世纪初的中国流行起来，同时期欧美也出现了类似的谜题，所以4×5形式究竟起源于哪里至今仍有争论。',
    culture: '木块以真实人物命名：曹操、关羽、张飞、赵云、马超、黄忠五员大将，还有四个兵卒。让曹操逃出华容道，正是重演关羽重义报恩、义释曹操的故事，这一幕中国读者无人不知。华容道至今仍以木制玩具的形式出售，常在学校里用来培养规划能力和耐心。它和七巧板、九连环一起，常被列为中国最有名的传统益智游戏。',
    rules: [
      '棋盘宽4格、高5格。曹操是2×2的方块，大将是1×2或2×1，兵卒是1×1，另有两个空格。',
      '每次把一块木块滑进空位。木块不能跳过、旋转或离开棋盘。',
      '同一块木块连续移动任意距离，即使拐弯，也只算一步。',
      '曹操到达最下面一行的中间，也就是出口处，即获胜。',
    ],
    basics: [
      '关注两个空格。每一步其实都是在移动空格，所以要先想好它们应该到哪里。',
      '兵卒最灵活。用它们把两个空格合到一起，形成1×2或2×1的空间。',
      '只有当两个空格并排挨着曹操时，曹操才能移动。先把这一步准备好。',
    ],
    advanced: [
      '分阶段解：先把横放的大将挪开，再把竖放的大将排好，最后让曹操下行。',
      '经典布局“横刀立马”最少需要81步。棋盘上方的计数显示每个布局的最少步数。',
      '迷路时，提示会给出从当前局面出发的最短解法的下一步。',
    ],
    mistakes: ['过早把曹操往下推，结果把他堵死。', '两个空格离得太远，任何大将都动不了。'],
  },
  tr: {
    summary: 'Büyük kare olan Cao Cao tahtanın altındaki boşluktan kaçana kadar blokları kaydır.',
    history: 'Bulmaca hikâyesini Üç Krallık Hikâyesi’nden alır. 208’deki Kızıl Kayalıklar Savaşı’nda yenilen savaş beyi Cao Cao, Guan Yu’nun askerleriyle beklediği Huarong yolundan kaçtı. Geçmişteki bir iyiliği hatırlayan Guan Yu onun geçmesine izin verdi. Bu tür kaydırmalı blok bulmacaları Çin’de yirminci yüzyılın başlarında sevildi; benzerleri aynı dönemde Avrupa’da ve Amerika’da da ortaya çıktı, bu yüzden 4×5 biçiminin nerede doğduğu hâlâ tartışmalıdır.',
    culture: 'Bloklar gerçek kişilerin adını taşır: Cao Cao; beş general Guan Yu, Zhang Fei, Zhao Yun, Ma Chao ve Huang Zhong; ve piyade askerler. Cao Cao’yu kurtarmak, Guan Yu’nun emre karşı sadakati ve minneti seçtiği, her Çinli okurun bildiği sahneyi yeniden anlatır. Huarong Dao hâlâ tahta oyuncak olarak satılır ve okullarda planlama ve sabrı öğretmek için yaygın olarak kullanılır. Tangram ve Dokuz Halka ile birlikte Çin’in en bilinen geleneksel bulmacaları arasında sayılır.',
    rules: [
      'Tahta 4 kare genişliğinde ve 5 kare yüksekliğindedir. Cao Cao 2×2’lik bir bloktur; generaller 1×2 ya da 2×1; askerler 1×1’dir. İki kare boştur.',
      'Bir bloğu boşluğa kaydır. Bloklar atlayamaz, dönemez ve tahtadan çıkamaz.',
      'Bir bloğu köşe dönse bile istediğin kadar taşımak bir hamle sayılır.',
      'Cao Cao alt sıranın ortasına, çıkışın olduğu yere ulaşınca kazanırsın.',
    ],
    basics: [
      'İki boş kareyi düşün. Aslında her hamle boşlukların hamlesidir; onların nerede olması gerektiğini planla.',
      'Askerler en esnek parçalardır. İki boşluğu 1×2 ya da 2×1’lik bir alanda birleştirmek için onları kullan.',
      'Cao Cao yalnızca iki boşluk yan yana onun dibindeyken hareket edebilir. Onu oynatmaya çalışmadan önce bunu hazırla.',
    ],
    advanced: [
      'Aşama aşama çalış: önce yatan generali yoldan çek, sonra dik generalleri sıraya diz, sonra Cao Cao’yu aşağı indir.',
      'Klasik dizilim Héng Dāo Lì Mǎ (“kılıç çekili, at dizginli”) en az 81 hamle ister. Tahtanın üstündeki sayaç her dizilimin en az hamlesini gösterir.',
      'Kaybolursan ipucu, bulunduğun yerden en kısa çözümün sıradaki hamlesini gösterir.',
    ],
    mistakes: ['Cao Cao’yu erkenden aşağı itip sıkıştırmak.', 'İki boşluğu birbirinden uzak bırakıp hiçbir generalin oynayamamasına yol açmak.'],
  },
};
