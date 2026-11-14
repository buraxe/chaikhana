import type { Lesson } from '../../core/learn';
export const lesson: Lesson = {
  names: { en: 'Anagrams', zh: '字母重组', tr: 'Anagram', pinyin: 'Zìmǔ chóngzǔ', trad: '字母重組' },
  en: {
    summary: 'Ten words with their letters shuffled, each with a clue. Put the letters back in order. Every game draws new words.',
    history: 'Anagrams are as old as writing with letters: the Greek poet Lycophron made them in the third century BC, and in the seventeenth century scientists such as Galileo hid their discoveries in anagrams to claim them before publishing. Newspapers have printed jumbled-word puzzles since the 1950s, and in Turkey the “harf karıştırma” is a classic of puzzle pages and TV quiz shows.',
    rules: ['A clue and the shuffled letters are shown. Tap the letters (or type) to spell the word, then press Enter.', 'Every letter must be used once. Shuffle rearranges the tiles if you are stuck.', 'A right answer scores a point; Skip moves on but costs a point.', 'After ten words the game ends with your score.'],
    basics: ['Read the clue first: it narrows the word down a lot.', 'Look for common endings and beginnings.'],
    advanced: ['Pair letters that often go together, then fit the rest around them.', 'Shuffling often makes the word jump out.'],
    mistakes: ['Skipping too fast: each skip costs a point.', 'Ignoring the clue.'],
  },
  zh: {
    summary: '十个字母被打乱的单词，每个都有提示。把字母排回正确顺序。每局都会抽取新词。',
    history: '字母重组和字母文字一样古老：古希腊诗人吕哥弗隆在公元前三世纪就写过；十七世纪，伽利略等科学家把发现藏在字母重组里，以便在发表之前宣示优先权。报纸从二十世纪五十年代起刊登乱序字谜；在土耳其，“harf karıştırma”是谜题版和电视问答节目的经典。',
    rules: ['显示提示和打乱的字母。点字母（或用键盘输入）拼出单词，然后按回车。', '每个字母都要用且只用一次。卡住时可以点“打乱”重新排列。', '答对得一分；“跳过”会进入下一个词，但扣一分。', '十个词之后游戏结束，显示你的得分。'],
    basics: ['先看提示，它能大大缩小范围。', '注意常见的词头和词尾。'],
    advanced: ['先把常在一起的字母配对，再把其余字母放进去。', '打乱一下，答案常常会自己跳出来。'],
    mistakes: ['跳过太快：每次跳过都扣一分。', '不看提示。'],
  },
  tr: {
    summary: 'Harfleri karıştırılmış on kelime, her birinin bir tanımı var. Harfleri doğru sıraya diz. Her oyun yeni kelimeler çeker.',
    history: 'Anagram, harfli yazı kadar eskidir: Yunan şair Lykophron MÖ üçüncü yüzyılda anagram yapmıştı; on yedinci yüzyılda Galileo gibi bilim insanları buluşlarını yayımlamadan önce sahiplenmek için anagramlara gizlerdi. Gazeteler 1950’lerden beri karışık kelime bulmacaları basar; Türkiye’de “harf karıştırma” bulmaca sayfalarının ve yarışma programlarının klasiğidir.',
    rules: ['Bir tanım ve karışık harfler gösterilir. Kelimeyi yazmak için harflere dokun (ya da klavyeyle yaz), sonra Enter’a bas.', 'Her harf bir kez kullanılmalı. Takılırsan “Karıştır” taşların yerini değiştirir.', 'Doğru cevap bir puan kazandırır; “Pas” sonraki kelimeye geçer ama bir puan götürür.', 'On kelimeden sonra oyun puanınla biter.'],
    basics: ['Önce tanımı oku: kelimeyi çok daraltır.', 'Sık rastlanan ekleri ve başlangıçları ara.'],
    advanced: ['Sık yan yana gelen harfleri eşleştir, kalanları etrafına yerleştir.', 'Karıştırmak çoğu zaman kelimeyi ortaya çıkarır.'],
    mistakes: ['Çok çabuk pas geçmek: her pas bir puan götürür.', 'Tanımı görmezden gelmek.'],
  },
};
