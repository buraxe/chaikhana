import type { Lesson } from '../../core/learn';
export const lesson: Lesson = {
  names: { en: 'Code Breaker', zh: '猜颜色密码', tr: 'Renk Şifresi', pinyin: 'zhūjī miàosuàn' },
  en: {
    summary: 'Crack a hidden code of coloured pegs using the clues each guess earns.',
    history: 'Mordecai Meirowitz, an Israeli postmaster and telecommunications expert, invented Mastermind in 1970, and Invicta Plastics in England published it. It descends from an older pencil-and-paper game, Bulls and Cows. In 1977 Donald Knuth showed that the classic code (4 pegs, 6 colours) can always be found in five guesses.',
    rules: ['The code maker hides a code of coloured pegs.', 'After each guess, a black peg means a peg of the right colour in the right place, and a white peg means the right colour in the wrong place.', 'The feedback pegs are not in any particular order.', 'Crack the code within the allowed number of guesses. In the computer mode, you set the code and watch the computer crack it.'],
    basics: ['Start with guesses that test several colours at once, such as two pairs.', 'Every later guess should fit all the clues so far; otherwise it wastes information.', 'Zero pegs is a great result: those colours are gone everywhere.'],
    advanced: ["Knuth's minimax method: choose the guess whose worst possible answer leaves the fewest codes. It sometimes plays a code that cannot be right, because it splits the remaining codes best.", 'Write down the codes still possible when only a handful remain, and pick one that tells them apart.'],
    mistakes: ['Reading a white peg as information about a particular position.', 'Repeating a colour that a zero result has already ruled out.'],
  },
  zh: {
    summary: '根据每次猜测得到的提示，破解一组由彩色钉子组成的隐藏密码。',
    history: '1970年，以色列邮政局长、通信专家莫迪凯·梅罗维茨发明了珠玑妙算，由英国的 Invicta Plastics 公司出版。它源自更早的纸笔游戏“猜数字”（公牛与母牛）。1977年，高德纳证明经典玩法（4位、6色）总能在五次之内猜中。',
    rules: ['出题者藏起一组彩色钉子作为密码。', '每次猜测后，黑钉表示有一个钉子颜色和位置都对，白钉表示颜色对但位置不对。', '提示钉的排列顺序没有意义。', '在规定次数内猜出密码。电脑模式下，由你设置密码，看电脑如何破解。'],
    basics: ['一开始用能同时测试多种颜色的猜测，比如两对颜色。', '之后的每次猜测都应符合前面所有提示，否则就浪费了信息。', '一个提示都没有其实很好：这些颜色可以全部排除。'],
    advanced: ['Knuth 极小极大法：选择“最坏回答下剩余可能最少”的猜测。它有时会猜一个不可能正确的密码，因为这样能最好地划分剩下的可能。', '只剩几种可能时把它们写下来，挑一个能区分它们的猜测。'],
    mistakes: ['把白钉理解为某个具体位置的信息。', '重复使用已经被“零提示”排除的颜色。'],
  },
  tr: {
    summary: 'Her tahminin kazandırdığı ipuçlarıyla renkli çivilerden oluşan gizli bir şifreyi kır.',
    history: 'İsrailli posta müdürü ve telekomünikasyon uzmanı Mordecai Meirowitz, Mastermind’ı 1970’te icat etti; İngiltere’de Invicta Plastics yayımladı. Daha eski bir kâğıt-kalem oyunu olan Bulls and Cows’tan (bizdeki Sayı Bulmaca) gelir. 1977’de Donald Knuth klasik şifrenin (4 çivi, 6 renk) her zaman beş tahminde bulunabileceğini gösterdi.',
    rules: ['Şifreci renkli çivilerden bir şifre saklar.', 'Her tahminden sonra siyah çivi doğru yerde doğru renk, beyaz çivi yanlış yerde doğru renk demektir.', 'Geri bildirim çivileri belirli bir sırada değildir.', 'Şifreyi izin verilen tahmin sayısı içinde kır. Bilgisayar modunda şifreyi sen belirlersin ve bilgisayarın kırışını izlersin.'],
    basics: ['İki çift gibi aynı anda birkaç rengi sınayan tahminlerle başla.', 'Sonraki her tahmin şimdiye kadarki bütün ipuçlarına uymalı; yoksa bilgi boşa gider.', 'Sıfır çivi harika bir sonuçtur: o renkler her yerden elenmiştir.'],
    advanced: ['Knuth’un minimaks yöntemi: en kötü olası cevabı en az şifre bırakan tahmini seç. Kalan şifreleri en iyi böldüğü için bazen doğru olamayacak bir şifre oynar.', 'Yalnızca birkaç şifre kaldığında olası olanları yaz ve onları birbirinden ayıracak birini seç.'],
    mistakes: ['Beyaz çiviyi belirli bir konum hakkında bilgi sanmak.', 'Sıfır sonucun elediği bir rengi tekrarlamak.'],
  },
};
