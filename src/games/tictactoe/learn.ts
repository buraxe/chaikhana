import type { Lesson } from '../../core/learn';
export const lesson: Lesson = {
  names: { en: 'Tic-Tac-Toe', tr: 'XOX', zh: '井字棋', pinyin: 'jǐngzìqí' },
  en: {
    summary: 'Two players mark a 3×3 grid in turn. Three in a row wins.',
    history: 'Three-in-a-row games on small grids are very old, and the pencil-and-paper version was well known in Britain by the nineteenth century as noughts and crosses. In 1952 A. S. Douglas wrote OXO, a noughts-and-crosses program for the EDSAC computer at Cambridge, one of the first video games.',
    rules: ['X moves first. Players take turns putting their mark in an empty square.', 'Three of your marks in a row, column or diagonal wins.', 'If all nine squares fill with no line, the game is a draw.'],
    basics: [
      'Take a winning square when you have one; otherwise block your opponent\'s.',
      'The centre touches four lines, more than any other square. Corners touch three, edges two.',
      'As O against a corner opening, take the centre. Against a centre opening, take a corner.',
    ],
    advanced: [
      'A fork makes two threats at once, and only one can be blocked. Most wins come from forks.',
      'If X holds two opposite corners and O the centre, O must play an edge. A corner lets X fork.',
      'With perfect play from both sides the game is always a draw. The Expert level plays perfectly.',
    ],
    mistakes: ['Answering a corner with an edge.', 'Blocking one threat while missing the second line through the same square.'],
  },
  zh: {
    summary: '两人轮流在3×3的格子里画记号，先连成一条线的一方获胜。',
    history: '在小方格上连成三子的游戏历史悠久，纸笔版本在十九世纪的英国已广为人知。1952年，A. S. 道格拉斯在剑桥大学的 EDSAC 计算机上编写了井字棋程序 OXO，这是最早的电子游戏之一。中文名“井字棋”来自“井”字，形状和棋盘相似。',
    rules: ['X 先行，双方轮流在空格里画上自己的记号。', '横、竖或斜向连成三个即获胜。', '九格填满仍无连线，则为和棋。'],
    basics: [
      '有能赢的格子就先赢，否则挡住对方。',
      '中心格参与四条线，比其他格子都多；角格参与三条，边格两条。',
      '作为 O：对方先下角，你就下中心；对方先下中心，你就下角。',
    ],
    advanced: [
      '“双杀”同时形成两个威胁，对方只能挡住一个。大多数胜利都来自双杀。',
      '如果 X 占了两个对角，O 在中心，O 必须下边格；下角格会让 X 形成双杀。',
      '双方都不犯错时，结果一定是和棋。专家难度的电脑从不犯错。',
    ],
    mistakes: ['对方下角时用边格应对。', '挡住了一个威胁，却漏看经过同一格的第二条线。'],
  },
  tr: {
    summary: 'İki oyuncu sırayla 3×3’lük bir ızgaraya işaret koyar. Üçünü bir sıraya dizen kazanır.',
    history: 'Küçük ızgaralarda üçlü dizme oyunları çok eskidir; kâğıt-kalem versiyonu on dokuzuncu yüzyılda İngiltere’de noughts and crosses adıyla iyi bilinirdi. 1952’de A. S. Douglas, Cambridge’deki EDSAC bilgisayarı için ilk video oyunlarından biri olan OXO’yu yazdı.',
    rules: ['İlk X oynar. Oyuncular sırayla boş bir kareye işaretlerini koyar.', 'Bir satırda, sütunda ya da çaprazda üç işaretin olursa kazanırsın.', 'Dokuz kare de dolar ve sıra oluşmazsa oyun berabere biter.'],
    basics: [
      'Kazandıran bir karen varsa al; yoksa rakibininkini kapat.',
      'Orta kare dört çizgiye değer, diğerlerinden fazla. Köşeler üç, kenarlar iki çizgiye değer.',
      'O olarak köşe açılışına karşı ortayı al. Orta açılışa karşı bir köşe al.',
    ],
    advanced: [
      'Çatal aynı anda iki tehdit yaratır ve yalnızca biri kapatılabilir. Kazançların çoğu çataldan gelir.',
      'X karşılıklı iki köşeyi, O ortayı tutuyorsa O kenar oynamalıdır. Köşe oynarsa X çatal kurar.',
      'İki taraf da kusursuz oynarsa oyun her zaman berabere biter. Uzman seviyesi kusursuz oynar.',
    ],
    mistakes: ['Köşeye kenarla cevap vermek.', 'Bir tehdidi kapatırken aynı kareden geçen ikinci çizgiyi kaçırmak.'],
  },
};
