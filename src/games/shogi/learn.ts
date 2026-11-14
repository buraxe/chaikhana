import type { Lesson } from '../../core/learn';
export const lesson: Lesson = {
  names: { en: 'Shogi', tr: 'Shogi (Japon satrancı)', zh: '将棋' },
  en: {
    summary: 'Japanese chess, where captured pieces change sides and come back into play.',
    history: 'Shogi descends from the same Indian ancestor as chess and reached its modern form in Japan around the sixteenth century. Its great invention is the drop: a captured piece joins your hand and can be placed back on the board as your own. Professional shogi is followed in Japan like a sport, with title matches on national television.',
    rules: [
      'Sente moves first. Win by checkmating the enemy king.',
      'King: one square any way. Rook: straight; bishop: diagonal; gold general: one square straight or diagonally forward; silver general: one square diagonally or straight forward; knight: two forward and one to the side, jumping; lance: straight forward any distance; pawn: one forward, capturing the same way.',
      'The last three ranks are the promotion zone. A piece moving into, within or out of it may promote: rook to dragon, bishop to horse (both gain one-step moves), and silver, knight, lance and pawn move like a gold. A piece that could never move again must promote.',
      'A captured piece goes to your hand. Instead of moving, you may drop it on any empty square, unpromoted.',
      'Drop limits: no second unpromoted pawn on a file, no piece where it could never move, and no pawn drop that gives immediate checkmate.',
      'The same position four times is a draw (sennichite).',
    ],
    basics: ['Keep your king in a castle of golds and silvers.', 'A piece in hand is often worth more than one on the board: you choose where it lands.', 'Pawns are cheap: trade them to open lines and get pawns in hand.'],
    advanced: ['Look for forks with dropped knights and silvers.', 'Promote your rook or bishop deep in the enemy camp: the dragon and horse are monsters.'],
    mistakes: ['Leaving pieces loose where a drop can fork them.', 'Forgetting that every capture gives your opponent a new piece.'],
  },
  zh: {
    summary: '日本将棋：吃掉的棋子会变成自己的，再打入棋盘。',
    history: '将棋与国际象棋同源于印度，约十六世纪在日本定型。最大特点是“打入”：吃掉的棋子进入持驹，可以作为己方棋子重新放到棋盘上。职业将棋在日本像体育比赛一样受关注，头衔战会在电视上直播。',
    rules: ['先手先走。将死对方的王即获胜。', '王：任意方向一格。飞车：直线；角行：斜线；金将：直线一格或斜前一格；银将：斜线一格或正前一格；桂马：向前二格再横一格，可以跳；香车：只能向前直走；步兵：向前一格，吃子方式相同。', '对方最后三行是升变区。进入、在内或离开升变区的棋子可以升变：飞车成龙、角行成马（都增加一格走法），银、桂、香、步升变后走法同金。以后无法再走的棋子必须升变。', '吃掉的棋子进入持驹。轮到你时可以不走棋，而是把持驹以未升变状态打到任意空格。', '打入限制：同一列不能有两个未升变的步（二步），不能打到以后无法移动的位置，不能用打步直接将死（打步诘）。', '同一局面出现四次为和棋（千日手）。'],
    basics: ['用金银为王筑起“围”。', '持驹往往比盘上的子更值钱：你可以选择它落在哪里。', '步很便宜：兑步打开线路，同时得到持驹。'],
    advanced: ['寻找用打入的桂马和银将双吃的机会。', '让飞车或角行深入敌阵升变：龙和马非常强大。'],
    mistakes: ['把棋子放在无保护的位置，被打入双吃。', '忘记每吃一子都会给对手增添一个新棋子。'],
  },
  tr: {
    summary: 'Japon satrancı: alınan taşlar taraf değiştirip oyuna geri döner.',
    history: 'Shogi satrançla aynı Hint atasından gelir ve on altıncı yüzyıl civarında Japonya’da bugünkü biçimini aldı. En büyük icadı “bırakma”dır: aldığın taş eline geçer ve kendi taşın olarak tahtaya geri konabilir. Japonya’da profesyonel shogi bir spor gibi izlenir, unvan maçları ulusal televizyonda yayınlanır.',
    rules: ['Sente başlar. Rakip şahı mat eden kazanır.', 'Şah: her yöne bir kare. Kale: düz; fil: çapraz; altın general: düz bir kare ya da ileri çapraz bir kare; gümüş general: çapraz bir kare ya da düz ileri bir kare; at: iki ileri bir yana, atlayarak; mızrak: düz ileri istediği kadar; piyon: bir ileri, aynı yönde alır.', 'Rakibin son üç sırası terfi bölgesidir. Bu bölgeye giren, içinde ya da dışına çıkan taş terfi edebilir: kale ejderhaya, fil ata dönüşür (ikisi de bir karelik hamle kazanır); gümüş, at, mızrak ve piyon altın gibi oynar. Bir daha hiç oynayamayacak taş terfi etmek zorundadır.', 'Aldığın taş eline geçer. Hamle yapmak yerine onu terfisiz olarak herhangi bir boş kareye bırakabilirsin.', 'Bırakma kuralları: aynı sütunda ikinci terfisiz piyon olmaz, bir daha oynayamayacağı yere taş bırakılmaz, piyon bırakarak doğrudan mat yapılmaz.', 'Aynı pozisyon dört kez oluşursa beraberlik (sennichite).'],
    basics: ['Şahını altın ve gümüşlerden bir kalede tut.', 'Eldeki taş çoğu zaman tahtadakinden değerlidir: nereye ineceğini sen seçersin.', 'Piyonlar ucuzdur: hatları açmak ve ele piyon almak için değiş.'],
    advanced: ['Bırakılan at ve gümüşlerle çatal ara.', 'Kaleni ya da filini rakip kampın derinliğinde terfi ettir: ejderha ve at canavardır.'],
    mistakes: ['Taşları bir bırakmanın çatallayabileceği korumasız yerlerde bırakmak.', 'Her almanın rakibe yeni bir taş verdiğini unutmak.'],
  },
};
