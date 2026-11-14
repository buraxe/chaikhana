import type { Lesson } from '../../core/learn';
export const lesson: Lesson = {
  names: { en: 'Tavla', tr: 'Tavla', zh: '双陆棋', pinyin: 'shuānglùqí' },
  en: {
    summary: 'Turkish backgammon: race your fifteen checkers around the board and bear them all off first.',
    history: 'Tavla belongs to the "tables" family of race games, whose ancestors include the Roman tabula and the Persian nard. In Turkey it is the coffeehouse game, played fast and loudly. Players call the dice by names that came through Persian: yek, dü, se, cihar, penç and şeş for one to six. A roll of six and five is şeş beş, and double six is düşeş.',
    rules: [
      'Each player has 15 checkers and moves them in opposite directions around 24 points toward their home quarter.',
      'Roll two dice and move one checker by each number, or one checker by both. Doubles are played four times.',
      'You may land on an empty point, your own point, or a point with a single opposing checker (a blot), which is hit and placed on the bar.',
      'A checker on the bar must re-enter in the opponent\'s home quarter before any other move.',
      'Once all 15 checkers are home, you may bear them off. A larger number can bear off from your highest point if no checker sits higher.',
      'You must use both dice if you can. If only one can be played, play the larger one when possible.',
      'The higher opening roll starts, and that player rolls again for the first move.',
      'A win scores 1 point; mars (the loser has borne off nothing) scores 2. Matches go to 1, 3, 5 or 7 points. The doubling cube is optional and not part of traditional Tavla.',
    ],
    basics: [
      'Make points, two or more checkers together, especially in your home quarter and on your 7-point. They block your opponent and cannot be hit.',
      'Avoid leaving blots where your opponent has many shots at them. Count the rolls that hit.',
      'Early on, bring builders down from the midpoint so you can make new points next turn.',
    ],
    advanced: [
      'A prime, six points in a row, cannot be passed. Even four or five in a row trap checkers behind them.',
      'Count the race: the pip count above the board shows the total distance each side still has to travel.',
      'When you are well behind in the race, keep an anchor in your opponent\'s home and wait for a shot.',
    ],
    mistakes: ['Breaking a good point just to run one checker.', 'Hitting loosely in your own home when your opponent has a strong board.'],
  },
  zh: {
    summary: '土耳其双陆棋：让自己的15枚棋子绕棋盘跑一圈，最先全部移出棋盘的一方获胜。',
    history: '双陆棋属于“盘棋”类竞速游戏，祖先包括古罗马的 tabula 和波斯的 nard。在土耳其，它是咖啡馆里最常见的游戏，节奏快、气氛热闹。土耳其人用源自波斯语的词来叫骰子点数：yek、dü、se、cihar、penç、şeş 分别是一到六；掷出六和五叫 şeş beş，双六叫 düşeş。',
    rules: [
      '每人15枚棋子，沿24个点朝相反方向移向自己的内盘。',
      '掷两颗骰子，按两个点数分别移动棋子，或让一枚棋子连走两个点数。掷出对子时走四次。',
      '可以落在空点、自己的点，或只有一枚对方棋子的点（单子）。落在单子上会把它打到中间的横栏上。',
      '横栏上的棋子必须先从对方内盘重新进场，才能走其他棋子。',
      '15枚棋子全部进入内盘后才能收子。如果更高的点上没有棋子，较大的点数可以把最高点上的棋子收走。',
      '能用两颗骰子时必须都用；只能用一颗时，尽量用大的点数。',
      '开局双方各掷一颗骰子，点数大的先行，并重新掷两颗骰子走第一步。',
      '普通胜利得1分；如果输方一枚子都没收，称为“马尔斯”（mars），得2分。比赛可设为1、3、5或7分。加倍骰是可选玩法，传统双陆棋不用。',
    ],
    basics: [
      '多做“点”（两枚或以上棋子在一起），尤其是内盘和7点。它们能挡住对方，也不会被打。',
      '不要在对方容易打到的地方留单子，算一算有几种骰子能打中。',
      '开局时把中间的棋子带下来做准备，下一回合就能做新的点。',
    ],
    advanced: [
      '连续六个点叫“封锁”，对方无法通过；连续四五个点也能困住后面的棋子。',
      '计算赛跑：棋盘上方的点数显示双方还需要走的总距离。',
      '赛跑大幅落后时，在对方内盘保留一个锚点，等待打子的机会。',
    ],
    mistakes: ['为了跑一枚棋子而拆掉好点。', '对方内盘很强时，在自己内盘随意打子。'],
  },
  tr: {
    summary: 'On beş pulunu tahtanın etrafında koştur ve hepsini ilk sen topla.',
    history: 'Tavla, ataları arasında Roma’nın tabula’sı ve İran’ın nerd’i bulunan “masa” yarış oyunları ailesindendir. Türkiye’de kahvehanenin oyunudur; hızlı ve gürültülü oynanır. Oyuncular zarları Farsçadan gelen adlarla söyler: birden altıya yek, dü, se, cihar, penç ve şeş. Altı-beş şeş beş, çift altı düşeştir.',
    rules: [
      'Her oyuncunun 15 pulu vardır ve bunları 24 hanenin etrafında ters yönlerde kendi evine doğru yürütür.',
      'İki zar at ve her sayı için bir pul oynat ya da iki sayıyı tek pulla oyna. Çift gelirse dört kez oynanır.',
      'Boş bir haneye, kendi hanene ya da tek rakip pulu (açık pul) olan bir haneye gelebilirsin; o pul kırılır ve bara konur.',
      'Bardaki pul, başka hiçbir hamleden önce rakibin evinden içeri girmelidir.',
      '15 pulun hepsi eve gelince toplamaya başlayabilirsin. Daha yüksekte pul yoksa büyük bir sayı en yüksek haneden toplayabilir.',
      'Mümkünse iki zarı da kullanmak zorundasın. Yalnızca biri oynanabiliyorsa mümkünse büyüğünü oyna.',
      'Açılışta yüksek atan başlar ve ilk hamle için yeniden zar atar.',
      'Kazanmak 1 sayı, mars (kaybeden hiç pul toplamamışsa) 2 sayıdır. Maçlar 1, 3, 5 ya da 7 sayılıktır. Katlama küpü isteğe bağlıdır ve geleneksel tavlada yoktur.',
    ],
    basics: [
      'Kapı yap, yani iki ya da daha fazla pulu bir araya getir; özellikle evinde ve 7 numaralı hanede. Kapılar rakibini engeller ve kırılamaz.',
      'Rakibinin çok atışla vurabileceği yerlerde açık pul bırakma. Kıran zarları say.',
      'Başlarda pulları ortadan aşağı indir ki sonraki sırada yeni kapılar yapabilesin.',
    ],
    advanced: [
      'Art arda altı kapı (prime) geçilemez. Dört ya da beş kapı bile arkasındaki pulları hapseder.',
      'Yarışı say: tahtanın üstündeki sayı her tarafın daha ne kadar yol alacağını gösterir.',
      'Yarışta çok gerideysen rakibin evinde bir kapı tut ve vuruş fırsatı bekle.',
    ],
    mistakes: ['Tek bir pulu kaçırmak için iyi bir kapıyı bozmak.', 'Rakibinin evi güçlüyken kendi evinde açık açık kırmak.'],
  },
};
