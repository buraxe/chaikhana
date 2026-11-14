import type { Lesson } from '../../core/learn';
export const lesson: Lesson = {
  names: { en: 'Bulls and Cows', tr: 'Sayı Bulmaca', zh: '猜数字', pinyin: 'cāi shùzì' },
  en: {
    summary: 'Find a hidden number with different digits; each guess tells you how many digits are right, and how many are in the right place.',
    history: 'Bulls and Cows is an old pencil-and-paper game, probably more than a century old, and the ancestor of Mastermind. Early computers ran it as Moo in the late 1960s. In Turkey it is known as Sayı Bulmaca, where the clues are given as plus and minus, and it is a classic of school notebooks and long bus rides.',
    rules: ['The number has 3, 4 or 5 different digits and never starts with 0.', 'After each guess you get +n for digits in the right place and −n for right digits in the wrong place.', 'The clues do not say which digits they mean.', 'Find the number in as few guesses as you can.'],
    basics: ['Start with guesses that share no digits, such as 1234 and 5678: together they show which digits are in play.', 'A +0 −0 rules out every digit of that guess at once.', 'Keep later guesses consistent with all the clues so far.'],
    advanced: ['Swap two digits to learn about positions: if + goes up by two, both moved into place.', 'Use a digit you know is absent as a placeholder to test one position at a time.', 'Watch the count of numbers still possible; a good guess cuts it sharply whatever the answer.'],
    mistakes: ['Reading +1 as "the first digit is right".', 'Guessing numbers that a previous clue already rules out.'],
  },
  zh: {
    summary: '猜出一个各位数字都不相同的隐藏数字；每次猜测会告诉你对了几个数字，其中几个位置也对。',
    history: '猜数字（又叫“公牛与母牛”）是一种古老的纸笔游戏，可能已有一百多年历史，也是珠玑妙算的前身。20世纪60年代末，早期计算机上有它的版本 Moo。在土耳其它叫 Sayı Bulmaca，提示用加号和减号表示，是学生笔记本和长途汽车上的经典游戏。',
    rules: ['这个数有3、4或5位，各位数字不同，首位不为0。', '每次猜测后，+n 表示有n个数字位置正确，−n 表示有n个数字对但位置不对。', '提示不会告诉你是哪几个数字。', '用尽量少的次数猜中。'],
    basics: ['先猜没有共同数字的数，比如1234和5678，两次合起来就能知道用了哪些数字。', '+0 −0 能一次排除这个猜测里的所有数字。', '之后的猜测要符合之前所有的提示。'],
    advanced: ['交换两个数字来判断位置：如果 + 增加了二，说明两个都换到了正确位置。', '用一个确定不在答案里的数字作占位，一次只测一个位置。', '留意“仍可能的数”的数量：好的猜测无论结果如何都能大幅减少它。'],
    mistakes: ['把 +1 理解为“第一位对了”。', '猜之前的提示已经排除的数。'],
  },
  tr: {
    summary: 'Rakamları farklı gizli bir sayıyı bul; her tahmin kaç rakamın doğru, kaçının doğru yerde olduğunu söyler.',
    history: 'Sayı Bulmaca, muhtemelen yüz yılı aşkın, eski bir kâğıt-kalem oyunudur ve Mastermind’ın atasıdır; İngilizcede Bulls and Cows diye bilinir. 1960’ların sonunda ilk bilgisayarlarda Moo adıyla oynandı. Türkiye’de ipuçları artı ve eksiyle verilir; okul defterlerinin ve uzun otobüs yolculuklarının klasiğidir.',
    rules: ['Sayının 3, 4 ya da 5 farklı rakamı vardır ve asla 0 ile başlamaz.', 'Her tahminden sonra doğru yerdeki rakamlar için +n, yanlış yerdeki doğru rakamlar için −n alırsın.', 'İpuçları hangi rakamlar olduğunu söylemez.', 'Sayıyı olabildiğince az tahminde bul.'],
    basics: ['1234 ve 5678 gibi ortak rakamı olmayan tahminlerle başla: ikisi birlikte hangi rakamların oyunda olduğunu gösterir.', '+0 −0 o tahmindeki bütün rakamları bir kerede eler.', 'Sonraki tahminlerin şimdiye kadarki bütün ipuçlarına uysun.'],
    advanced: ['Konumları öğrenmek için iki rakamın yerini değiştir: + iki artarsa ikisi de yerine oturmuştur.', 'Bir konumu tek başına sınamak için olmadığını bildiğin bir rakamı yer tutucu olarak kullan.', 'Hâlâ olası sayıların sayısını izle; iyi bir tahmin cevap ne olursa olsun onu çok azaltır.'],
    mistakes: ['+1’i “ilk rakam doğru” sanmak.', 'Önceki bir ipucunun zaten elediği sayıları tahmin etmek.'],
  },
};
