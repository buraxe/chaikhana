import type { Lesson } from '../../core/learn';
export const lesson: Lesson = {
  names: { en: 'Mangala', tr: 'Mangala', zh: '曼卡拉播棋', pinyin: 'màn kǎ lā bō qí' },
  en: {
    summary: 'Sow stones around a board of pits, capture by making even numbers, and fill your treasure first.',
    history: 'Mangala belongs to the mancala family, sowing games played across Africa, the Middle East and Asia for well over a thousand years. In Anatolia it was played with stones in pits scooped in the ground or carved into a wooden board, and it is now taught in Turkish schools, with national championships for children. The name comes from the Arabic word for "to move".',
    rules: [
      'Each player has six pits with four stones each, and a treasure on their right.',
      'Take all the stones from one of your pits and sow them counter-clockwise, one per pit, starting with the pit you emptied. A pit with a single stone moves it to the next pit.',
      'Sowing includes your own treasure but skips your opponent’s.',
      'If your last stone lands in your treasure, you move again.',
      'If your last stone makes a pit on the opponent’s side even, you take all its stones.',
      'If your last stone lands in an empty pit of your own and the pit opposite has stones, you take both.',
      'When either side runs out of stones, the player whose side is empty takes all the stones left on the other side. The bigger treasure wins.',
    ],
    basics: ['Look for pits whose stones end exactly in your treasure: free moves add up.', 'Before each move, check which of your pits would become even if the opponent reached them.', 'Pits on the right reach your treasure with fewer stones; empty them early to set up extra turns.'],
    advanced: ['Chain extra turns: a move into the treasure can set up another one from a pit further left.', 'Keep a few stones back near your treasure for the endgame: they decide who empties their side first.', 'Hoarding many stones in one pit can be a weapon: a long sowing lands deep on the other side.'],
    mistakes: ['Leaving an odd pile that the opponent can make even with one stone.', 'Emptying your side early when the opponent still has many stones: they keep them all.'],
  },
  zh: {
    summary: '在一排排坑里播种石子，让对方的坑成双数就能吃子，先装满自己的宝库。',
    history: '曼卡拉播棋属于“播棋”家族，在非洲、中东和亚洲已流传一千多年。在安纳托利亚，人们在地上挖坑或在木板上刻坑，用石子来玩。如今土耳其的学校里也教这种游戏，还有全国少儿锦标赛。名字来自阿拉伯语中“移动”一词。',
    rules: ['每人有六个坑，每坑四颗石子，右手边是自己的宝库。', '拿起自己某个坑里的全部石子，从这个坑本身开始逆时针每坑放一颗。坑里只有一颗石子时，把它移到下一个坑。', '播种经过自己的宝库，但跳过对方的宝库。', '最后一颗落入自己的宝库，可以再走一次。', '最后一颗让对方的某个坑变成双数，就吃掉这个坑里的全部石子。', '最后一颗落在自己的空坑里，而对面的坑有石子，就把两边的石子都吃掉。', '任何一方的坑全部空了，空的一方拿走对方坑里剩下的全部石子。宝库石子多者获胜。'],
    basics: ['找出石子数正好能落进宝库的坑：多走的步数会积少成多。', '每走一步前，看看自己哪些坑会被对方变成双数。', '靠右的坑用较少石子就能到达宝库，早点清空它们，为再走一次做准备。'],
    advanced: ['连续再走：一次落入宝库后，可以从更左边的坑再来一次。', '在宝库附近留几颗石子用于残局：它们决定谁先清空自己一侧。', '把很多石子攒在一个坑里也可以是武器：长距离播种会落到对方深处。'],
    mistakes: ['留下单数堆，让对方一颗石子就能变成双数。', '对方还有很多石子时过早清空自己一侧：剩下的全归对方。'],
  },
  tr: {
    summary: 'Taşları kuyulara dağıt, çift yaparak al ve hazineni önce sen doldur.',
    history: 'Mangala, Afrika’da, Orta Doğu’da ve Asya’da bin yılı aşkın süredir oynanan dağıtma oyunları ailesindendir. Anadolu’da toprağa açılan ya da tahtaya oyulan kuyularda taşlarla oynanırdı; bugün Türk okullarında öğretilir ve çocuklar için ulusal şampiyonaları vardır. Adı Arapçada “hareket ettirmek” anlamına gelen kelimeden gelir.',
    rules: [
      'Her oyuncunun dörder taşlı altı kuyusu ve sağında bir hazinesi vardır.',
      'Kuyularından birindeki bütün taşları al ve boşalttığın kuyudan başlayarak saat yönünün tersine her kuyuya bir taş bırak. Kuyuda tek taş varsa o taş bir sonraki kuyuya geçer.',
      'Dağıtırken kendi hazinene taş bırakırsın, rakibin hazinesini atlarsın.',
      'Son taşın hazinene düşerse bir hamle daha yaparsın.',
      'Son taşın rakip taraftaki bir kuyuyu çift yaparsa o kuyudaki bütün taşları alırsın.',
      'Son taşın kendi boş kuyuna düşer ve karşısındaki kuyuda taş varsa ikisini birden alırsın.',
      'Bir tarafın taşları bitince, tarafı boşalan oyuncu karşı taraftaki bütün taşları alır. Hazinesi büyük olan kazanır.',
    ],
    basics: ['Taşları tam hazinene düşen kuyuları ara: bedava hamleler birikir.', 'Her hamleden önce, rakip ulaşırsa hangi kuyunun çift olacağına bak.', 'Sağdaki kuyular hazineye daha az taşla ulaşır; ek hamle hazırlamak için onları erken boşalt.'],
    advanced: ['Ek hamleleri zincirle: hazineye giden bir hamle, daha soldaki bir kuyudan bir yenisini hazırlayabilir.', 'Oyun sonu için hazinenin yakınında birkaç taş tut: tarafını kimin önce boşaltacağını onlar belirler.', 'Bir kuyuda çok taş biriktirmek silah olabilir: uzun bir dağıtım karşı tarafın derinlerine düşer.'],
    mistakes: ['Rakibin tek taşla çift yapabileceği tek sayılı bir yığın bırakmak.', 'Rakibin hâlâ çok taşı varken kendi tarafını erken boşaltmak: hepsi ona kalır.'],
  },
};
