import type { Lesson } from '../../core/learn';
export const lesson: Lesson = {
  names: { en: 'Dama', tr: 'Dama', zh: '土耳其跳棋', pinyin: 'Tǔ\'ěrqí tiàoqí' },
  en: {
    summary: 'Turkish draughts: pieces move and capture straight ahead or sideways, never diagonally.',
    history: 'Dama is the draughts of Turkey, and versions of it are played across the Middle East and the eastern Mediterranean. Unlike most draughts games it uses every square of the board, and pieces move orthogonally. With sixteen men each and compulsory maximum captures, games are fast and full of combinations.',
    rules: [
      'Each player starts with 16 men on the second and third rows. White moves first.',
      'A man moves one square forward or sideways. It never moves backward or diagonally.',
      'A man captures by jumping an adjacent enemy piece forward or sideways onto the empty square beyond. Captures continue as long as possible.',
      'Capturing is compulsory, and you must choose the sequence that takes the most pieces.',
      'Captured pieces are removed at once, so the squares they leave can be crossed later in the same move.',
      'A man that ends its move on the far row becomes a king. Kings move any distance in a straight line and capture a piece at any distance, landing on any empty square beyond it.',
      'A king may not reverse direction between two captures.',
      'You win when your opponent has no pieces or cannot move. A lone king against a lone man or a lone king is a draw, and so are 50 moves in a row with no capture and no man moved.',
    ],
    basics: [
      'Keep your men in solid groups. A piece with a friend beside or behind it is hard to capture.',
      'Before every move, check what your opponent is forced to capture next. Many combinations work by offering one piece to win several.',
      'Getting the first king is often decisive, because a king attacks along whole rows and columns.',
    ],
    advanced: [
      'Use the maximum-capture rule: a sacrifice can force your opponent to take a long sequence that ends where you want.',
      'Guard your back row for as long as you can; it stops enemy men from crowning.',
      'Kings are strongest on open lines. Clear a row before promoting so the new king is free at once.',
    ],
    mistakes: ['Advancing a single man far ahead of the others.', 'Forgetting that the longest capture is compulsory, for you and for your opponent.'],
  },
  zh: {
    summary: '土耳其跳棋：棋子只能直走和横走，不能斜走。',
    history: '土耳其跳棋是土耳其的跳棋，中东和东地中海一带也流行着它的各种版本。和大多数跳棋不同，它用上棋盘上的每一个格子，棋子横竖移动。每方16个兵，又必须吃最多的子，所以对局节奏快，组合战术很多。',
    rules: [
      '双方各有16个兵，摆在第二、三行。白方先走。',
      '兵每次向前或向左右走一格，不能后退，也不能斜走。',
      '兵吃子时向前或横向跳过相邻的敌子，落在后面的空格上。只要还能吃，就要继续吃下去。',
      '有吃必吃，并且必须选择吃子最多的路线。',
      '被吃的棋子立即拿走，空出来的格子在同一步里可以再经过。',
      '兵走到对方底线并停下时升为王。王可以沿直线走任意格，并能隔着任意距离吃子，落在被吃子后面的任意空格上。',
      '王在连吃时不能掉头180°。',
      '对方无子可走或没有棋子时你获胜。单王对单兵、单王对单王算和棋；连续50步没有吃子也没有兵移动，也算和棋。',
    ],
    basics: [
      '让兵保持成群。旁边或后面有同伴的棋子很难被吃掉。',
      '每走一步前，先看对方下一步被迫要吃哪里。很多组合都是送一个子，换回好几个子。',
      '先升王往往决定胜负，因为王能控制整行整列。',
    ],
    advanced: [
      '利用“必须吃最多”的规则：一次弃子可以逼对方走一条长长的吃子路线，最后停在你想要的位置。',
      '尽量守住底线，这样对方的兵就无法升王。',
      '王在开阔的线上最强。升王前先清出一条线，新王马上就能发挥作用。',
    ],
    mistakes: ['让一个兵孤军深入。', '忘了“必须吃最多”对双方都适用。'],
  },
  tr: {
    summary: 'Türk daması: taşlar düz ileri ya da yana gider ve alır, asla çapraz gitmez.',
    history: 'Dama Türkiye’nin dama oyunudur; çeşitleri Orta Doğu’da ve Doğu Akdeniz’de oynanır. Çoğu dama oyununun aksine tahtanın bütün karelerini kullanır ve taşlar düz hareket eder. Herkesin on altı taşı olduğu ve en çok taşı almanın zorunlu olduğu için oyunlar hızlı ve kombinasyon doludur.',
    rules: [
      'Her oyuncu ikinci ve üçüncü sıralarda 16 taşla başlar. İlk Beyaz oynar.',
      'Taş bir kare ileri ya da yana gider. Asla geri ya da çapraz gitmez.',
      'Taş, yanındaki rakip taşın üstünden ileri ya da yana atlayıp arkasındaki boş kareye konarak alır. Mümkün olduğu sürece almaya devam eder.',
      'Almak zorunludur ve en çok taşı alan sırayı seçmelisin.',
      'Alınan taşlar hemen kaldırılır; bıraktıkları kareler aynı hamlenin devamında geçilebilir.',
      'Hamlesini en uç sırada bitiren taş dama olur. Dama düz bir çizgide istediği kadar gider, istediği uzaklıktaki bir taşı alır ve arkasındaki herhangi bir boş kareye konar.',
      'Dama iki alış arasında geri dönemez.',
      'Rakibinin taşı kalmayınca ya da oynayamayınca kazanırsın. Tek damaya karşı tek taş ya da tek dama beraberedir; alış yapılmadan ve taş oynatılmadan geçen 50 hamle de beraberedir.',
    ],
    basics: [
      'Taşlarını sağlam gruplar hâlinde tut. Yanında ya da arkasında arkadaşı olan taşı almak zordur.',
      'Her hamleden önce rakibinin sırada neyi almak zorunda kalacağına bak. Kombinasyonların çoğu birkaç taş kazanmak için bir taş vermeye dayanır.',
      'İlk damayı çıkarmak çoğu zaman belirleyicidir, çünkü dama bütün satır ve sütunlar boyunca saldırır.',
    ],
    advanced: [
      'En çok alma kuralını kullan: bir fedakârlık rakibini istediğin yerde biten uzun bir alış sırasına zorlayabilir.',
      'Arka sıranı olabildiğince uzun koru; rakip taşların dama çıkmasını engeller.',
      'Damalar açık hatlarda en güçlüdür. Yeni dama hemen serbest kalsın diye dama çıkmadan önce bir sırayı aç.',
    ],
    mistakes: ['Tek bir taşı diğerlerinin çok önüne sürmek.', 'En uzun alışın senin için de rakibin için de zorunlu olduğunu unutmak.'],
  },
};
