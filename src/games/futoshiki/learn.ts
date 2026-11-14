import type { Lesson } from '../../core/learn';
export const lesson: Lesson = {
  names: { en: 'Futoshiki', zh: '不等式数独', tr: 'Futoshiki', pinyin: 'Bù děngshì shùdú', trad: '不等式數獨' },
  en: {
    summary: 'A Latin square with a twist: fill the grid so each row and column holds every number once, while obeying the “greater than” and “less than” signs between neighbours.',
    history: 'Futoshiki means “inequality” in Japanese. The puzzle appeared in Japan in the early 2000s and reached British newspapers in 2006, riding the wave that Sudoku had started a year before. Its grids are small, usually 4×4 to 7×7, because the signs carry most of the information.',
    rules: ['Fill an n×n grid with the numbers 1 to n.', 'Each row and each column holds every number exactly once.', 'A “<” or “>” between two squares must be true: the point of the sign faces the smaller number. ∧ and ∨ work up and down.', 'Some numbers may be given at the start. Every puzzle has one solution.'],
    basics: ['A square at the small end of a sign cannot hold n; one at the big end cannot hold 1.', 'Chains of signs are powerful: in a < b < c, a is at most n−2 and c at least 3.', 'When a row has only one place left for a number, write it.'],
    advanced: ['In a 5×5, a square with two arrows pointing into it (it is smaller than two others) can only be 1, 2 or 3; one bigger than three neighbours is at least 4.', 'Combine the Latin rule with the chains: if 1 must fall in one of two squares of a row and one of them sits at the big end of a sign, the 1 goes in the other.'],
    mistakes: ['Reading a sign backwards: the open side always faces the bigger number.', 'Forgetting that the signs work both ways in a chain.'],
  },
  zh: {
    summary: '带不等号的拉丁方：每行每列填入每个数字各一次，同时满足相邻格子之间的“大于”“小于”符号。',
    history: 'Futoshiki在日语中意为“不等”。这种谜题2000年代初出现在日本，2006年登上英国报纸，正好赶上前一年的数独热潮。棋盘通常不大，从4×4到7×7，因为大部分信息都藏在不等号里。',
    rules: ['在n×n的方格中填入1到n。', '每行、每列都恰好包含每个数字一次。', '两格之间的“<”或“>”必须成立：尖的一头朝向较小的数。∧和∨表示上下关系。', '开局可能给出部分数字。每道题只有唯一解。'],
    basics: ['在不等号小端的格子不能是n，大端的格子不能是1。', '连续的不等号很有用：a < b < c 时，a最多是n−2，c至少是3。', '某一行某个数字只剩一个位置时，就填上。'],
    advanced: ['在5×5中，比两个邻格都小的格子只能是1、2或3；比三个邻格都大的至少是4。', '把拉丁方规则和不等式链结合：如果某行的1只能在两格之一，而其中一格在不等号的大端，那1就在另一格。'],
    mistakes: ['把符号看反：开口一侧永远朝向较大的数。', '忘了不等式链两端都有约束。'],
  },
  tr: {
    summary: 'Farklı bir Latin karesi: her satır ve sütunda her sayı bir kez olacak şekilde ızgarayı doldur, komşu kareler arasındaki “büyüktür” ve “küçüktür” işaretlerine de uy.',
    history: 'Futoshiki Japoncada “eşitsizlik” demektir. Bulmaca 2000’lerin başında Japonya’da ortaya çıktı ve 2006’da, bir yıl önce Sudoku’nun başlattığı dalgayla İngiliz gazetelerine ulaştı. Izgaraları küçüktür, genelde 4×4 ile 7×7 arası, çünkü bilginin çoğunu işaretler taşır.',
    rules: ['n×n ızgarayı 1’den n’e kadar sayılarla doldur.', 'Her satır ve her sütunda her sayı tam bir kez bulunur.', 'İki kare arasındaki “<” ya da “>” doğru olmalı: işaretin sivri ucu küçük sayıya bakar. ∧ ve ∨ yukarı-aşağı aynı işi görür.', 'Başta bazı sayılar verilmiş olabilir. Her bulmacanın tek çözümü vardır.'],
    basics: ['İşaretin küçük ucundaki kare n olamaz; büyük ucundaki 1 olamaz.', 'İşaret zincirleri çok güçlüdür: a < b < c ise a en fazla n−2, c en az 3’tür.', 'Bir satırda bir sayının tek yeri kaldıysa yaz.'],
    advanced: ['5×5’te iki komşusundan küçük olan bir kare yalnızca 1, 2 ya da 3 olabilir; üç komşusundan büyük olan en az 4’tür.', 'Latin kuralını zincirlerle birleştir: bir satırda 1 iki kareden birine düşüyorsa ve biri işaretin büyük ucundaysa, 1 diğerine gider.'],
    mistakes: ['İşareti ters okumak: açık taraf her zaman büyük sayıya bakar.', 'Zincirde işaretlerin iki yönde de çalıştığını unutmak.'],
  },
};
