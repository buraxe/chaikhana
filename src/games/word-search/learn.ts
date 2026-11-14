import type { Lesson } from '../../core/learn';
export const lesson: Lesson = {
  names: { en: 'Word Search', zh: '找词游戏', tr: 'Kelime Avı', pinyin: 'Zhǎo cí yóuxì', trad: '找詞遊戲' },
  en: {
    summary: 'Words on a theme are hidden in a square of letters, across, down, diagonally and even backwards. Find them all. Every game hides new words; the Chinese version hides words made of characters.',
    history: 'Word searches were first published in the United States in 1968 by Norman E. Gibat in a small Oklahoma paper, and within a few years they filled puzzle magazines and children’s activity books around the world. They are often the first word puzzle children meet, and a favourite in language classes, where hunting for a word fixes its spelling in memory.',
    rules: ['The theme and the list of words are shown with the grid.', 'Drag across a word in a straight line, or tap its first letter and then its last.', 'Words run across, down or diagonally, and in this game also backwards (not in the Chinese grid).', 'A found word is coloured and crossed off the list. Find them all to win.'],
    basics: ['Look for an unusual letter of the word first, such as Ğ, J or Z.', 'Scan one row at a time, then one column at a time.'],
    advanced: ['For backwards words, look for the last letter followed by the one before it.', 'Words can share letters where they cross.'],
    mistakes: ['Only looking left to right.', 'Forgetting the diagonals.'],
  },
  zh: {
    summary: '一个主题的词语藏在字母方格里，横、竖、斜，甚至倒着。把它们全部找出来。每局都会重新藏词；中文版藏的是由汉字组成的词语。',
    history: '找词游戏最早于1968年由诺曼·吉巴特在美国俄克拉荷马州的一份小报上发表，几年之内就遍布全世界的谜题杂志和儿童读物。它常常是孩子们接触的第一种文字游戏，也是语言课的常客：找词的过程能把词的写法记牢。',
    rules: ['主题和词语列表显示在方格旁边。', '沿直线拖过一个词，或者先点第一个字再点最后一个字。', '词语可以横、竖、斜排列，本游戏中还可以倒着（中文方格除外）。', '找到的词会上色并在列表中划掉。全部找到即获胜。'],
    basics: ['先找词里不常见的字。', '一行一行看，再一列一列看。'],
    advanced: ['找倒着的词，就先找最后一个字，再看它后面是不是倒数第二个字。', '词语交叉处可以共用一个字。'],
    mistakes: ['只从左往右看。', '忘了斜线方向。'],
  },
  tr: {
    summary: 'Bir temaya ait kelimeler bir harf karesine yatay, dikey, çapraz, hatta ters gizlenmiş. Hepsini bul. Her oyun kelimeleri yeniden gizler; Çince sürümde kelimeler karakterlerden oluşur.',
    history: 'Kelime avı ilk kez 1968’de ABD’de, Norman E. Gibat tarafından Oklahoma’da küçük bir gazetede yayımlandı; birkaç yıl içinde dünyanın her yerinde bulmaca dergilerini ve çocuk kitaplarını doldurdu. Çocukların karşılaştığı ilk kelime oyunu çoğu zaman budur; dil derslerinin de gözdesidir, çünkü bir kelimeyi aramak yazılışını akla kazır.',
    rules: ['Tema ve kelime listesi tablonun yanında görünür.', 'Bir kelimenin üstünden düz bir çizgide sürükle ya da önce ilk, sonra son harfine dokun.', 'Kelimeler yatay, dikey ya da çapraz, bu oyunda ters de olabilir (Çince tabloda olmaz).', 'Bulunan kelime renklenir ve listeden çizilir. Hepsini bulunca kazanırsın.'],
    basics: ['Önce kelimenin az rastlanan bir harfini ara: Ğ, J ya da Z gibi.', 'Önce satır satır, sonra sütun sütun tara.'],
    advanced: ['Ters kelimeler için son harfi ve hemen ardından sondan bir önceki harfi ara.', 'Kesiştikleri yerde kelimeler harf paylaşabilir.'],
    mistakes: ['Yalnızca soldan sağa bakmak.', 'Çaprazları unutmak.'],
  },
};
