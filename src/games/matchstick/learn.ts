import type { Lesson } from '../../core/learn';
export const lesson: Lesson = {
  names: { en: 'Matchstick Puzzles', zh: '火柴棍谜题', tr: 'Kibrit Bulmacaları', pinyin: 'huǒcháigùn mítí' },
  en: {
    summary: 'A sum made of matches is wrong. Move one match, or two, and make it right.',
    history: 'Puzzles with matches became popular soon after safety matches spread in the late 19th century: a box in every pocket was a puzzle kit. Puzzle writers such as Sam Loyd and Henry Dudeney printed match puzzles in newspapers, and the equation kind, with digits drawn like a calculator display, is a favourite in Chinese and Russian puzzle books and on television quiz shows. Here every puzzle is new: the site walks back from a true sum and checks that no true sum is closer than the number of moves it asks for.',
    rules: ['Digits are drawn with up to seven matches, like a digital clock; the sign is a minus (one match) or a plus (two).', 'Move exactly the number of matches asked for. A match can go to any empty place, in any digit or the sign.', 'The equals sign stays where it is.', 'Every symbol must be a real digit or sign when you finish, and the sum must be true. Any true sum counts.'],
    basics: ['Know which digits are one match apart: 6, 9 and 0 differ by where one match sits; 5 becomes 6 or 9 by adding one; 3 becomes 2 or 5 by moving one.', 'The sign is a match store: a plus gives up its upright to become a minus, and a minus can take one to become a plus.', 'Count the matches on each side: moving a match across the equals sign changes both sides at once.'],
    advanced: ['With two moves, look for one match that fixes the left side and another that fixes the right, before trying anything fancy.', 'Try changing the operation first: switching between plus and minus changes the answer the most for one match.'],
    mistakes: ['Leaving a shape that is not quite a digit.', 'Making a two-digit number begin with 0.'],
  },
  zh: {
    summary: '一道用火柴摆的算式是错的。移动一根（或两根）火柴，让它成立。',
    history: '19世纪末安全火柴普及后，火柴谜题随之流行：人人口袋里一盒火柴，就是一套谜题道具。萨姆·劳埃德、亨利·杜德尼等谜题作家在报纸上刊登火柴谜题；像计算器显示那样摆数字的等式类谜题，在中国和俄罗斯的谜题书以及电视智力节目里尤其常见。这里每道题都是新的：网站从一个正确的算式倒推，并检查没有比所要求步数更近的正确算式。',
    rules: ['数字像数字钟那样最多用七根火柴摆成；运算符是减号（一根）或加号（两根）。', '正好移动要求的根数。火柴可以放到任何空位上，任何数字或符号里都行。', '等号不能动。', '完成时每个符号都必须是真正的数字或运算符，并且算式成立。任何成立的算式都算。'],
    basics: ['记住哪些数字只差一根火柴：6、9、0只差一根的位置；5加一根变6或9；3移一根变2或5。', '运算符是火柴的仓库：加号拿掉竖的一根就变减号，减号添一根就变加号。', '数一数等号两边的火柴：把火柴从一边移到另一边，会同时改变两边。'],
    advanced: ['移动两根时，先找一根修正左边、一根修正右边，再考虑别的花样。', '先试试改运算符：在加减之间切换，一根火柴就能让结果变化最大。'],
    mistakes: ['摆出的形状不完全是数字。', '让两位数以0开头。'],
  },
  tr: {
    summary: 'Kibritlerle yazılmış bir işlem yanlış. Bir ya da iki kibriti oynatıp doğru yap.',
    history: '19. yüzyılın sonunda güvenli kibrit yaygınlaşınca kibrit bulmacaları da sevildi: her cepteki bir kutu kibrit bir bulmaca takımıydı. Sam Loyd ve Henry Dudeney gibi bulmaca yazarları gazetelerde kibrit bulmacaları yayımladı; rakamların hesap makinesi ekranı gibi çizildiği eşitlik türü Çin ve Rus bulmaca kitaplarının ve televizyon yarışmalarının gözdesidir. Burada her bulmaca yenidir: site doğru bir işlemden geriye yürür ve istenen hamleden daha yakın bir doğru işlem olmadığını denetler.',
    rules: ['Rakamlar dijital saatteki gibi en fazla yedi kibritle çizilir; işaret eksi (bir kibrit) ya da artıdır (iki kibrit).', 'Tam istenen sayıda kibrit oynat. Bir kibrit herhangi bir rakamda ya da işarette herhangi bir boş yere gidebilir.', 'Eşittir işareti yerinde kalır.', 'Bitirdiğinde her şekil gerçek bir rakam ya da işaret olmalı ve işlem doğru olmalı. Doğru olan her işlem sayılır.'],
    basics: ['Hangi rakamların bir kibrit farkla birbirine dönüştüğünü bil: 6, 9 ve 0 tek bir kibritin yeriyle ayrılır; 5’e bir kibrit eklenince 6 ya da 9 olur; 3’ten biri oynatılınca 2 ya da 5 olur.', 'İşaret bir kibrit deposudur: artı dik çubuğunu verip eksi olur, eksi bir kibrit alıp artı olur.', 'Eşittirin iki yanındaki kibritleri say: bir kibriti karşıya taşımak iki tarafı birden değiştirir.'],
    advanced: ['İki hamlede önce solu düzelten bir kibrit ve sağı düzelten bir kibrit ara; süslü çözümleri sonra dene.', 'Önce işareti değiştirmeyi dene: artıyla eksi arasında geçmek, tek kibritle sonucu en çok değiştiren hamledir.'],
    mistakes: ['Tam olarak rakam olmayan bir şekil bırakmak.', 'İki basamaklı bir sayıyı 0 ile başlatmak.'],
  },
};
