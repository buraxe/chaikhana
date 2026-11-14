import type { Lesson } from '../../core/learn';
export const lesson: Lesson = {
  names: { en: 'Crossword', zh: '填字游戏', tr: 'Bulmaca', pinyin: 'Tiánzì yóuxì', trad: '填字遊戲' },
  en: {
    summary: 'Fill the white squares with words from their clues; every word crosses others, so each answer helps with the next. A new crossword is built for every game.',
    history: 'The first crossword was published by Arthur Wynne in the New York World on 21 December 1913, a diamond-shaped "word-cross". Within ten years crosswords were a craze in America and Britain, and newspapers everywhere began printing one a day. In Turkey the bulmaca arrived in the 1920s and soon became a fixture of every daily paper, from the big square grids with black squares to the arrow puzzles with clues inside the grid.',
    rules: [
      'Each numbered clue belongs to a word that runs across (left to right) or down (top to bottom), starting at the square with that number.',
      'Tap a square to choose it; tap it again to switch between across and down. The current clue is shown above the grid.',
      'Type with your keyboard or the keys below the grid. Arrow keys move, Tab or Enter jumps to the next word, Backspace deletes.',
      'Check marks wrong letters in red. Reveal letter and Reveal word fill in squares for you; the game counts how many you revealed.',
      'The puzzle is solved when every square holds the right letter.',
    ],
    basics: ['Start with the clues you are sure of, then use the crossing letters.', 'Short words are usually the easiest way in.', 'Count the squares: the number after each clue is the word’s length.'],
    advanced: ['A letter shared by two words must fit both: if one answer will not fit, the other may be wrong.', 'Try without Check first, and only check a word once it is full.'],
    mistakes: ['Writing a guess in ink and refusing to let it go when the crossings disagree.', 'Revealing too soon: a crossing word often gives the letter away.'],
  },
  zh: {
    summary: '根据提示把单词填进白格；每个词都与别的词交叉，所以一个答案会帮你解出下一个。每局都会生成新的填字游戏。',
    history: '第一份填字游戏由亚瑟·温恩于1913年12月21日刊登在《纽约世界报》上，是一个菱形的“字十字”。不到十年，填字游戏在美国和英国风靡一时，各地报纸开始每天刊登一则。在土耳其，填字游戏（bulmaca）于二十世纪二十年代出现，很快成为每份日报的固定栏目，从带黑格的大方格到把提示写在格子里的箭头式谜题都有。',
    rules: ['每条带编号的提示对应一个横向（从左到右）或纵向（从上到下）的单词，从带该编号的格子开始。', '点一个格子选中它；再点一次在横向和纵向之间切换。当前提示显示在格子上方。', '用键盘或格子下方的按键输入。方向键移动，Tab或回车跳到下一个词，退格键删除。', '“检查”会把错误的字母标红。“揭开字母”和“揭开单词”会替你填上，游戏会记录揭开的数量。', '所有格子都填对时谜题完成。'],
    basics: ['先填有把握的提示，再利用交叉的字母。', '短词通常最容易入手。', '数一数格子：提示后面的数字就是单词长度。'],
    advanced: ['两个词共用的字母必须同时符合两者：一个答案填不进去，可能是另一个错了。', '先不用“检查”，等一个词填满再检查。'],
    mistakes: ['认定一个猜测，即使交叉字母不符也不肯改。', '太早揭开：交叉的单词往往就能告诉你这个字母。'],
  },
  tr: {
    summary: 'Beyaz karelere tanımlarından yola çıkarak kelimeleri yaz; her kelime başkalarıyla kesiştiği için her cevap bir sonrakine yardım eder. Her oyunda yeni bir bulmaca üretilir.',
    history: 'İlk çapraz bulmacayı Arthur Wynne 21 Aralık 1913’te New York World gazetesinde baklava biçimli bir “kelime haçı” olarak yayımladı. On yıl içinde bulmaca Amerika’da ve İngiltere’de çılgınlık hâline geldi, her yerde gazeteler her gün bir tane basmaya başladı. Türkiye’de bulmaca 1920’lerde ortaya çıktı ve kısa sürede her günlük gazetenin vazgeçilmezi oldu: siyah kareli büyük kare bulmacalardan, tanımları kutuların içinde yazan çengel bulmacalara kadar.',
    rules: ['Her numaralı tanım, o numaranın yazdığı kareden başlayan soldan sağa ya da yukarıdan aşağı bir kelimeye aittir.', 'Bir kareyi seçmek için dokun; yön değiştirmek için yeniden dokun. Geçerli tanım tablonun üstünde görünür.', 'Klavyeyle ya da tablonun altındaki tuşlarla yaz. Ok tuşları gezdirir, Tab ya da Enter sonraki kelimeye geçer, geri tuşu siler.', '“Kontrol et” yanlış harfleri kırmızıyla gösterir. “Harf aç” ve “Kelimeyi aç” kareleri senin yerine doldurur; kaç harf açtığın sayılır.', 'Bütün kareler doğru harfle dolunca bulmaca çözülür.'],
    basics: ['Emin olduğun tanımlarla başla, sonra kesişen harflerden yararlan.', 'Kısa kelimeler genelde en kolay giriş yeridir.', 'Kareleri say: her tanımın yanındaki sayı kelimenin uzunluğudur.'],
    advanced: ['İki kelimenin paylaştığı harf ikisine de uymalı: bir cevap sığmıyorsa öbürü yanlış olabilir.', 'Önce kontrolsüz dene; bir kelimeyi ancak dolunca kontrol et.'],
    mistakes: ['Kesişen harfler uymadığı hâlde bir tahminde ısrar etmek.', 'Erken açmak: çoğu zaman kesişen kelime o harfi zaten verir.'],
  },
};
