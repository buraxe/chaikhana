import type { Lesson } from '../../core/learn';
export const lesson: Lesson = {
  names: { en: 'Sliding Tiles', zh: '数字华容道', tr: 'Kaydırmalı Sayılar', pinyin: 'shùzì huáróngdào' },
  en: {
    summary: 'Fifteen numbered tiles, one gap: slide them back into order.',
    history: 'The fifteen puzzle swept America and Europe in 1880, sold in little wooden boxes. It was invented by Noyes Chapman, a postmaster in New York State, though the puzzle-maker Sam Loyd later claimed it and offered a prize for a position that, as mathematicians soon proved, cannot be solved: exactly half of all arrangements can never be put in order. The 3×3 version is a classic test for computer search, and in China the game is known as “number Huarong Road”.',
    rules: ['Tiles slide into the gap from the side, top or bottom; they never jump or lift out.', 'The goal is 1, 2, 3… in reading order with the gap in the bottom-right corner.', 'Tapping a tile in line with the gap slides every tile between them at once; each tile moved counts as a move.', 'Every shuffle here is one of the solvable half.'],
    basics: ['Solve the top row first, then the next row, never disturbing what is done.', 'The last tile of a row goes in with a small trick: park it under its spot, bring the second-to-last tile into the corner, then rotate both in together.', 'On 4×4 and 5×5, once only two rows remain, solve them column by column from the left.'],
    advanced: ['Think of the gap as the piece you move: plan where the gap must go, not where the tile goes.', 'A tile three cycles around a 2×2 block: use this to bring a tile alongside another without breaking finished rows.', 'Fewer moves come from planning two tiles at once.'],
    mistakes: ['Finishing a row, then breaking it to fix the next one.', 'Chasing the right tile while the gap wanders far away.'],
  },
  zh: {
    summary: '十五块数字方块，一个空格：把它们滑回顺序。',
    history: '1880年，“十五谜题”以小木盒的形式风靡美国和欧洲。它的发明者是纽约州的邮政局长诺伊斯·查普曼，后来谜题作家萨姆·劳埃德声称是自己发明的，还悬赏解开一个局面；数学家很快证明那个局面根本无解：所有排列中正好有一半永远排不回顺序。3×3版本是计算机搜索的经典考题，在中国这个游戏被称为“数字华容道”。',
    rules: ['方块只能从旁边、上面或下面滑进空格，不能跳过，也不能拿起来。', '目标是按阅读顺序排成1、2、3……，空格在右下角。', '点和空格在同一行或列的方块，中间的方块会一起滑动；每移动一块算一步。', '这里每次打乱都属于有解的那一半。'],
    basics: ['先解最上面一行，再解下一行，已完成的不要打乱。', '一行的最后一块需要小技巧：先把它停在目标位置下方，把倒数第二块移到角上，再把两块一起转进去。', '在4×4和5×5上，只剩两行时，从左到右一列一列地解。'],
    advanced: ['把空格当成你在移动的棋子：规划空格要去哪里，而不是方块要去哪里。', '方块可以绕着2×2的小块循环：用它把一块带到另一块旁边，而不破坏已完成的行。', '同时规划两块，步数会更少。'],
    mistakes: ['完成一行后，为了解下一行又把它打乱。', '只盯着要找的方块，让空格跑得太远。'],
  },
  tr: {
    summary: 'On beş numaralı taş, tek bir boşluk: onları kaydırıp yeniden sıraya diz.',
    history: 'On beş bulmacası 1880’de küçük tahta kutularda satılarak Amerika’yı ve Avrupa’yı kasıp kavurdu. New York eyaletinde bir postane müdürü olan Noyes Chapman tarafından icat edildi; ancak bulmaca yazarı Sam Loyd sonradan onu kendisinin bulduğunu söyledi ve bir dizilişin çözümüne ödül koydu. Matematikçiler kısa sürede o dizilişin çözülemeyeceğini kanıtladı: bütün dizilişlerin tam yarısı asla sıraya girmez. 3×3 sürümü bilgisayar aramasının klasik sınavıdır; Çin’de oyuna “sayılı Huarong yolu” denir.',
    rules: ['Taşlar boşluğa yandan, üstten ya da alttan kayar; atlamaz, yerinden kalkmaz.', 'Amaç, boşluk sağ alt köşede kalacak şekilde okuma sırasıyla 1, 2, 3… dizmektir.', 'Boşlukla aynı sıradaki bir taşa dokununca aradaki bütün taşlar birlikte kayar; kayan her taş bir hamle sayılır.', 'Buradaki her karışık diziliş çözülebilen yarıdandır.'],
    basics: ['Önce en üst satırı çöz, sonra bir sonrakini; biteni bozma.', 'Bir satırın son taşı küçük bir hileyle yerleşir: onu yerinin altına park et, sondan ikinci taşı köşeye getir, sonra ikisini birlikte döndürerek yerleştir.', '4×4 ve 5×5’te iki satır kalınca onları soldan sağa sütun sütun çöz.'],
    advanced: ['Boşluğu hareket ettirdiğin parça gibi düşün: taşın değil, boşluğun nereye gitmesi gerektiğini planla.', 'Bir taş 2×2’lik bir blok etrafında döndürülebilir: bitmiş satırları bozmadan bir taşı diğerinin yanına getirmek için bunu kullan.', 'İki taşı birlikte planlamak hamle sayısını düşürür.'],
    mistakes: ['Bir satırı bitirip sonrakini düzeltmek için onu bozmak.', 'Doğru taşın peşinde koşarken boşluğu çok uzaklara kaçırmak.'],
  },
};
