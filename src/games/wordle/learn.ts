import type { Lesson } from '../../core/learn';
export const lesson: Lesson = {
  names: { en: 'Word Guess', zh: '猜词', tr: 'Kelime Tahmini', pinyin: 'Cāi cí', trad: '猜詞' },
  en: {
    summary: 'Guess the secret five-letter word in six tries. After each guess the letters turn green, yellow or grey to show how close you are.',
    history: 'Guessing a hidden word letter by letter goes back to the pencil game Jotto (1955) and the TV show Lingo. In 2021 the engineer Josh Wardle made Wordle for his partner: one word a day, coloured squares you could share. It became a worldwide habit within months and was bought by The New York Times in 2022; versions now exist in dozens of languages, Turkish included.',
    rules: ['Type a five-letter word and press Enter.', 'Green: the letter is in the word and in that place. Yellow: it is in the word but somewhere else. Grey: it is not in the word.', 'A letter that appears twice in your guess but once in the word is marked only once.', 'In English every guess must be in the word list; in Turkish any five letters will do.', 'Find the word within six guesses to win.'],
    basics: ['Start with a word full of common letters, such as A, E, R, L, N.', 'Do not reuse grey letters.'],
    advanced: ['Sometimes a guess that cannot be the answer tells you more, by testing several new letters at once.', 'Remember that letters can repeat.'],
    mistakes: ['Putting a yellow letter back in the same place.', 'Spending guesses on words that ignore what you already know.'],
  },
  zh: {
    summary: '在六次之内猜出五个字母的秘密单词。每次猜完，字母会变成绿色、黄色或灰色，告诉你离答案有多近。',
    history: '逐个字母猜出隐藏单词的玩法，可以追溯到纸笔游戏Jotto（1955）和电视节目Lingo。2021年，工程师乔什·沃德尔为伴侣做了Wordle：每天一个词，彩色方块可以分享。几个月内它就风靡全球，2022年被《纽约时报》收购；如今已有几十种语言的版本，包括土耳其语。',
    rules: ['输入一个五个字母的单词并按回车。', '绿色：字母在单词里且位置正确。黄色：字母在单词里但位置不对。灰色：单词里没有这个字母。', '如果猜测里某个字母出现两次而答案里只有一次，只会标记一次。', '英语版的每次猜测都必须在词表里；土耳其语版任意五个字母都可以。', '六次之内猜中即获胜。'],
    basics: ['第一个词选常见字母多的，比如A、E、R、L、N。', '不要再用灰色的字母。'],
    advanced: ['有时一个不可能是答案的词反而更有用，因为它能一次测试好几个新字母。', '记住字母可以重复。'],
    mistakes: ['把黄色字母又放回同一个位置。', '猜的词不顾已经知道的信息。'],
  },
  tr: {
    summary: 'Gizli beş harfli kelimeyi altı tahminde bul. Her tahminden sonra harfler yeşil, sarı ya da gri olur ve ne kadar yaklaştığını gösterir.',
    history: 'Gizli bir kelimeyi harf harf tahmin etmek, kâğıt kalem oyunu Jotto’ya (1955) ve Lingo yarışmasına uzanır. 2021’de mühendis Josh Wardle eşi için Wordle’ı yaptı: günde bir kelime ve paylaşılabilen renkli kareler. Birkaç ay içinde dünya çapında bir alışkanlık oldu, 2022’de The New York Times tarafından satın alındı; bugün Türkçe de dahil onlarca dilde sürümü var.',
    rules: ['Beş harfli bir kelime yaz ve Enter’a bas.', 'Yeşil: harf kelimede ve doğru yerde. Sarı: harf kelimede ama başka yerde. Gri: harf kelimede yok.', 'Tahminde iki kez geçen bir harf kelimede bir kez varsa yalnızca bir kez işaretlenir.', 'İngilizcede her tahmin listede olmalı; Türkçede herhangi beş harf olur.', 'Kelimeyi altı tahminde bulursan kazanırsın.'],
    basics: ['A, E, R, L, N gibi sık harflerle dolu bir kelimeyle başla.', 'Gri harfleri yeniden kullanma.'],
    advanced: ['Bazen cevap olamayacak bir tahmin, birden çok yeni harfi sınadığı için daha çok şey söyler.', 'Harflerin tekrar edebileceğini unutma.'],
    mistakes: ['Sarı bir harfi yine aynı yere koymak.', 'Bildiklerini hesaba katmayan kelimelerle tahmin harcamak.'],
  },
};
