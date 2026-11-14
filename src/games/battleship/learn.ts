import type { Lesson } from '../../core/learn';
export const lesson: Lesson = {
  names: { en: 'Battleship', tr: 'Amiral Battı', zh: '海战棋', pinyin: 'hǎizhàn qí' },
  en: {
    summary: 'Hide your fleet on a grid and hunt the enemy’s, one shot at a time.',
    history: 'Battleship began as a pencil-and-paper game around the First World War; similar games were played in Russia and France. Milton Bradley published it with plastic pegs in 1967, and an electronic version followed in 1977. In Turkey it is Amiral Battı, "the admiral has sunk", the call when the biggest ship goes down.',
    rules: ['Each side hides five ships on a 10×10 grid: 5, 4, 3, 3 and 2 squares long. Ships never touch, not even at the corners.', 'Players take turns calling one square. The answer is hit or miss; when every square of a ship is hit, it is sunk.', 'The first to sink the whole enemy fleet wins.'],
    basics: ['Shoot in a checkerboard pattern: every ship covers at least one square of each colour.', 'After a hit, try the four neighbours; after two hits in a line, follow the line.', 'Once a ship sinks, the squares around it are empty, because ships never touch.'],
    advanced: ['Count where the largest remaining ship could still fit; empty areas too small for it can be skipped.', 'Hunt densest first: the squares crossed by the most possible ship positions are the best shots.', 'Do not place your ships in a predictable pattern; edges and clusters are both common guesses.'],
    mistakes: ['Shooting next to a sunk ship.', 'Wandering off after a single hit instead of finishing the ship.'],
  },
  zh: {
    summary: '把自己的舰队藏在格子里，一炮一炮地搜寻敌方舰队。',
    history: '海战棋大约在第一次世界大战时期作为纸笔游戏出现，俄国和法国也有类似玩法。1967年，美国 Milton Bradley 公司推出了带塑料小钉的版本，1977年又出了电子版。在土耳其它叫 Amiral Battı，意思是“旗舰沉了”，是最大的船被击沉时喊的话。',
    rules: ['双方各在10×10的格子里藏五艘船，长度分别为5、4、3、3、2格。船与船互不相邻，连角也不挨着。', '双方轮流报一个格子，对方回答命中或落空；一艘船的所有格子都被命中即被击沉。', '先击沉对方全部舰队者获胜。'],
    basics: ['按棋盘格的方式开火：每艘船都至少占一个黑格和一个白格。', '命中后试它的四个邻格；一条线上命中两次后，沿着这条线打。', '一艘船沉了以后，它周围的格子都是空的，因为船不会相邻。'],
    advanced: ['算一算剩下最大的那艘船还能放在哪里；放不下它的小块空地可以跳过。', '先打密度最高的格子：被最多种可能的船位覆盖的格子最值得打。', '不要把船摆成容易猜到的样子；贴边和扎堆都是常见的猜测方向。'],
    mistakes: ['往已沉船只的旁边开火。', '命中一次后不追击，转去别处乱打。'],
  },
  tr: {
    summary: 'Filonu bir ızgaraya sakla ve düşmanınkini birer atışla avla.',
    history: 'Amiral Battı, Birinci Dünya Savaşı sıralarında kâğıt-kalem oyunu olarak doğdu; Rusya’da ve Fransa’da da benzerleri oynanıyordu. Milton Bradley oyunu 1967’de plastik çivilerle yayımladı, 1977’de elektronik versiyonu geldi. Türkçe adı, en büyük gemi batınca söylenen sözden gelir.',
    rules: ['Her taraf 10×10’luk ızgaraya beş gemi saklar: 5, 4, 3, 3 ve 2 kare uzunluğunda. Gemiler köşeden bile birbirine değmez.', 'Oyuncular sırayla bir kare söyler. Cevap isabet ya da karavanadır; bir geminin bütün kareleri vurulunca gemi batar.', 'Düşman filosunun tamamını ilk batıran kazanır.'],
    basics: ['Dama tahtası deseninde ateş et: her gemi her renkten en az bir kareyi kaplar.', 'İsabetten sonra dört komşuyu dene; bir çizgide iki isabetten sonra çizgiyi izle.', 'Bir gemi batınca çevresindeki kareler boştur, çünkü gemiler birbirine değmez.'],
    advanced: ['Kalan en büyük geminin nereye sığabileceğini say; ona yetmeyecek kadar küçük boş alanları atlayabilirsin.', 'En yoğun yerden başla: en çok olası gemi konumunun geçtiği kareler en iyi atışlardır.', 'Gemilerini tahmin edilebilir bir düzende dizme; kenarlar da kümeler de sık yapılan tahminlerdir.'],
    mistakes: ['Batmış bir geminin yanına ateş etmek.', 'Tek isabetten sonra gemiyi bitirmek yerine başka yere gitmek.'],
  },
};
