import type { Lesson } from '../../core/learn';
export const lesson: Lesson = {
  names: { en: 'Zebra Puzzle', zh: '斑马谜题', tr: 'Zebra Bilmecesi', pinyin: 'bānmǎ mítí' },
  en: {
    summary: 'Houses in a row, a list of clues, one answer: work out who lives where and what each one drinks, keeps and plays.',
    history: 'A puzzle of this kind appeared in Life International magazine in December 1962, ending with the question “who owns the zebra?”, which gave the whole family its name. It is often said that Albert Einstein wrote it as a boy, or that only a few people can solve it; there is no evidence for either. Logic-grid puzzles have filled puzzle magazines ever since. Here every puzzle is new: the site draws a hidden answer, writes clues true of it until exactly one answer fits, then removes every clue that is not needed.',
    rules: ['There are 3, 4 or 5 houses in a row, numbered from the left.', 'Each house has one value from every category (a name, a colour, a drink…), and every value is used exactly once.', 'The clues are all true. Together they allow exactly one arrangement.', '“Directly left of” means the next house towards house 1; “somewhere left of” means any house further left; “next to” means either side.'],
    basics: ['Start with clues that name a house, then with “same person” clues: they fix values together.', 'When a value is ruled out of every house but one, it must be there; when a cell has one value left, that is its value.', 'A value that is directly left of something cannot be in the last house; one that is right of something cannot be in the first.', 'Tick off a clue once you have taken everything from it, and come back to the others when something new is fixed.'],
    advanced: ['Pair clues: if A is next to B and B is in house 2, A is in 1 or 3, which may clash with another clue and settle it.', 'Try a value in a cell and follow its consequences; if it leads to a contradiction, cross it out. This is the last resort, not the first.', '“Not the same person” clues only matter late: use them to break the last ties.'],
    mistakes: ['Reading “left of” as “directly left of”.', 'Forgetting that a “same person” clue also rules the pair out of every other house together.', 'Writing a value in from a guess and forgetting it was a guess.'],
  },
  zh: {
    summary: '一排房子、一串线索、唯一的答案：推出谁住哪里，各自喝什么、养什么、玩什么。',
    history: '1962年12月，《生活》国际版杂志刊登了这类谜题，结尾问道“谁养斑马？”，这一类谜题因此得名。常有人说它是爱因斯坦小时候出的，或者说只有极少数人能解开，这两种说法都没有根据。此后，逻辑格谜题一直是谜题杂志的常客。这里每道题都是新的：网站先随机定下答案，再写出与之相符的线索，直到只剩一种答案成立，然后删去所有不必要的线索。',
    rules: ['一排有3、4或5座房子，从左往右编号。', '每座房子在每个类别（名字、颜色、饮品……）中各有一个值，每个值只用一次。', '所有线索都是真的，合起来只允许一种排列。', '“紧左边”指朝1号方向的相邻房子；“左边某处”指更靠左的任意房子；“邻居”指左右任一边。'],
    basics: ['先用指明房号的线索，再用“就是同一个人”的线索：它们把几个值绑在一起。', '一个值在别的房子都被排除时，只能在剩下那座；一个格子只剩一个值时，它就是答案。', '在某物紧左边的值不可能在最后一座房子；在某物右边的值不可能在第一座。', '一条线索用尽后就划掉；有新的值确定时，再回头看其他线索。'],
    advanced: ['组合线索：若A与B相邻且B在2号，A就在1号或3号，这可能与另一条线索冲突，从而定下来。', '在格子里试一个值并跟着推下去，如果出现矛盾就把它排除。这是最后的办法，不是第一步。', '“不是同一个人”的线索通常到后面才有用：用来打破最后的平局。'],
    mistakes: ['把“左边某处”读成“紧左边”。', '忘了“同一个人”的线索也意味着这两个值在其他房子里同样被排除。', '凭猜测填了一个值，后来忘了那是猜的。'],
  },
  tr: {
    summary: 'Yan yana evler, bir ipucu listesi ve tek bir cevap: kimin nerede oturduğunu, ne içtiğini, ne beslediğini ve ne oynadığını bul.',
    history: 'Bu türden bir bulmaca Aralık 1962’de Life International dergisinde yayımlandı ve “zebra kimin?” sorusuyla bitiyordu; bütün aile adını buradan aldı. Sık sık Albert Einstein’ın çocukken yazdığı ya da çok az kişinin çözebildiği söylenir; ikisinin de kanıtı yoktur. O günden beri mantık tablosu bulmacaları dergilerin vazgeçilmezidir. Burada her bulmaca yenidir: site gizli bir cevap seçer, tek bir cevap kalana kadar ona uyan ipuçları yazar, sonra gerekmeyen her ipucunu çıkarır.',
    rules: ['Yan yana 3, 4 ya da 5 ev vardır; soldan numaralanır.', 'Her evin her kategoriden (isim, renk, içecek…) bir değeri vardır ve her değer tam bir kez kullanılır.', 'İpuçlarının hepsi doğrudur. Birlikte tek bir dizilişe izin verirler.', '“Hemen ardından” bir sonraki ev demektir; “daha sağda” sağdaki herhangi bir ev; “komşu” iki yandan biri.'],
    basics: ['Ev numarası veren ipuçlarıyla başla, sonra “aynı kişi” ipuçlarına geç: değerleri birbirine bağlarlar.', 'Bir değer biri hariç bütün evlerden elenmişse oradadır; bir hücrede tek değer kalmışsa cevap odur.', 'Bir şeyin hemen solunda olan değer son evde olamaz; bir şeyin sağında olan ilk evde olamaz.', 'Bir ipucundan alacağını aldıysan üstünü çiz; yeni bir şey kesinleşince diğerlerine geri dön.'],
    advanced: ['İpuçlarını birleştir: A, B’nin komşusuysa ve B 2. evdeyse A 1. ya da 3. evdedir; bu başka bir ipucuyla çakışıp meseleyi çözebilir.', 'Bir hücreye bir değer koyup sonuçlarını takip et; çelişkiye varırsa onu ele. Bu ilk değil, son çaredir.', '“Farklı kişiler” ipuçları genellikle sonlara doğru işe yarar: son düğümleri onlarla çöz.'],
    mistakes: ['“Daha sağda”yı “hemen ardından” diye okumak.', '“Aynı kişi” ipucunun ikisini diğer evlerden birlikte elediğini unutmak.', 'Tahminle bir değer yazıp bunun tahmin olduğunu unutmak.'],
  },
};
