import type { Lesson } from '../../core/learn';
export const lesson: Lesson = {
  names: { en: "Nine Men's Morris", tr: 'Dokuz Taş', zh: '九子棋', pinyin: 'jiǔ zǐ qí' },
  en: {
    summary: 'Place nine stones each, then move them along the lines; three in a row takes an opponent stone.',
    history: 'Boards for the game have been found cut into the roof slabs of a temple at Kurna in Egypt from about 1400 BC, on Roman buildings and in the Gokstad Viking ship. It was hugely popular in medieval Europe, and in Turkey it is still played as Dokuz Taş on boards scratched into stone benches and coffeehouse tables.',
    rules: [
      'The board has 24 points on three squares joined at the middle of each side. White starts.',
      'First the players take turns placing their nine stones on empty points.',
      'Then they take turns moving a stone along a line to a neighbouring empty point.',
      'Three stones of your own in a line (a mill) lets you remove one opponent stone. Stones in a mill cannot be taken unless every opponent stone is in one.',
      'When you have only three stones left, they may jump to any empty point.',
      'You lose with fewer than three stones, or when you cannot move. Fifty moves without a mill is a draw.',
    ],
    basics: ['During placement, spread out and keep options for two mills rather than racing for one.', 'Middle points of the sides, especially on the middle square, join four lines and are the strongest.', 'Block a line as soon as the opponent has two stones on it with the third point open.'],
    advanced: ['A "running mill": a mill whose stone can step out and back in, taking a stone every second move.', 'Mobility wins the movement phase: a player who cannot move loses with all nine stones still on the board.', 'In the endgame against a flying opponent, keep two possible mills open at once.'],
    mistakes: ['Placing all stones on the outer square, where they get blocked.', 'Opening a mill when the opponent can step into the gap.'],
  },
  zh: {
    summary: '每人先放下九颗棋子，再沿线移动；连成三子就能吃掉对方一颗棋子。',
    history: '在埃及古尔纳一座约公元前1400年的神庙屋顶石板上发现过刻出的棋盘，罗马建筑上和维京时代的科克斯塔德船上也有。它在中世纪欧洲极为流行；在土耳其至今仍叫“九石”，人们在石凳和咖啡馆的桌面上刻出棋盘来下。',
    rules: ['棋盘有24个点，分布在三个正方形上，各边中点相连。白方先行。', '双方先轮流把九颗棋子放到空点上。', '然后轮流沿线把一颗棋子移到相邻的空点。', '自己的三颗棋子连成一线（成三）时，可以吃掉对方一颗棋子。成三中的棋子不能被吃，除非对方所有棋子都在成三中。', '只剩三颗棋子时，可以飞到任意空点。', '棋子少于三颗或无路可走即输。五十步没有成三为和棋。'],
    basics: ['放子阶段要分散，保留形成两个三连的机会，而不是急着凑一个。', '各边中点，尤其是中间那个正方形上的中点，连着四条线，最为有力。', '对方在一条线上有两颗子而第三个点空着时，立刻堵住。'],
    advanced: ['“活三”：一颗棋子可以移出再移回的三连，每两步就能吃一子。', '行棋阶段机动性决定胜负：无路可走的一方即使九子俱在也算输。', '残局面对可以飞子的对手时，要同时保留两个可能的三连。'],
    mistakes: ['把棋子都放在外圈，结果被堵死。', '对方能插入空档时打开自己的三连。'],
  },
  tr: {
    summary: 'Herkes dokuz taşını koyar, sonra çizgiler boyunca oynatır; üçünü bir sıraya dizen rakibin bir taşını alır.',
    history: 'Oyunun tahtaları Mısır’da Kurna’daki yaklaşık MÖ 1400 tarihli bir tapınağın çatı taşlarında, Roma yapılarında ve Gokstad Viking gemisinde kazınmış olarak bulundu. Orta Çağ Avrupası’nda çok sevildi; Türkiye’de hâlâ Dokuz Taş adıyla taş banklara ve kahvehane masalarına çizilen tahtalarda oynanır.',
    rules: [
      'Tahtada, kenar ortalarından birbirine bağlı üç karenin üstünde 24 nokta vardır. İlk Beyaz oynar.',
      'Önce oyuncular sırayla dokuz taşlarını boş noktalara koyar.',
      'Sonra sırayla bir taşı çizgi boyunca komşu boş noktaya oynatırlar.',
      'Kendi üç taşını bir çizgiye dizersen (kare) rakibin bir taşını alırsın. Karedeki taşlar, rakibin bütün taşları karede değilse alınamaz.',
      'Üç taşın kalınca taşların istediği boş noktaya uçabilir.',
      'Üçten az taşı kalan ya da oynayamayan kaybeder. Kare yapılmadan geçen elli hamle beraberedir.',
    ],
    basics: ['Taş koyarken tek bir kareye koşmak yerine dağıl ve iki kare ihtimalini açık tut.', 'Kenar ortaları, özellikle ortadaki karede olanlar, dört çizgiyi birleştirir ve en güçlü noktalardır.', 'Rakibin bir çizgide iki taşı varsa ve üçüncü nokta boşsa hemen kapat.'],
    advanced: ['“Açılıp kapanan kare”: taşı çıkıp geri girebilen bir kare iki hamlede bir taş alır.', 'Oynatma aşamasını hareket serbestliği kazandırır: oynayamayan oyuncu dokuz taşı tahtadayken bile kaybeder.', 'Uçabilen bir rakibe karşı oyun sonunda aynı anda iki olası kare açık tut.'],
    mistakes: ['Bütün taşları dış kareye koyup sıkışmak.', 'Rakip boşluğa girebilecekken kendi kareni açmak.'],
  },
};
