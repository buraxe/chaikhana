import type { Lesson } from '../../core/learn';
export const lesson: Lesson = {
  names: { en: 'Ultimate Tic-Tac-Toe', zh: '终极井字棋', tr: 'Süper XOX', pinyin: 'Zhōngjí jǐngzìqí', trad: '終極井字棋' },
  en: {
    summary: 'Nine games of tic-tac-toe inside one big one. Where you play decides where your opponent must play next.',
    history: 'Ultimate tic-tac-toe is a modern game: versions of it were played at maths camps and puzzle clubs in the 2000s, and it became widely known after a 2013 article by the mathematician Ben Orlin. Unlike ordinary tic-tac-toe, which any careful player can always draw, it is complex enough that no simple strategy is known, and it has become a favourite test for game-playing programs.',
    rules: [
      'The big board is a 3×3 grid of small tic-tac-toe boards. X moves first, anywhere.',
      'The square you choose inside a small board sends your opponent to the matching small board: play in the top-right square of any board, and your opponent must play in the top-right board.',
      'Get three in a row on a small board to win it. A won or full board is closed.',
      'If you are sent to a closed board, you may play in any open board instead.',
      'Win three small boards in a row on the big board to win the game. If no line is possible any more and all boards are closed, the game is a draw.',
    ],
    basics: [
      'Before each move, look at the board you are sending your opponent to: do not send them where they can win.',
      'The centre board and the centre squares are strongest, as in ordinary tic-tac-toe.',
      'Sending your opponent to a closed board gives them a free choice; avoid it unless it is safe.',
    ],
    advanced: [
      'Winning many small boards matters less than winning three in a line; plan on the big board.',
      'Sacrifice a small board if it sends your opponent somewhere useless for many moves.',
      'Force sequences: two threats on one board, where each reply sends the opponent back to you.',
    ],
    mistakes: ['Playing the best square on a small board while sending the opponent to the board they need.', 'Closing a board too early and handing out free moves.', 'Forgetting the big board and collecting boards that do not line up.'],
  },
  zh: {
    summary: '一个大井字棋里套着九个小井字棋。你下在哪里，决定对方下一步必须去哪里。',
    history: '终极井字棋是现代游戏：二十一世纪头十年，它的各种版本在数学营和谜题俱乐部中流行，2013年数学家本·奥林发表文章后广为人知。普通井字棋只要小心就一定能下和，而终极井字棋复杂得多，至今没有简单的必胜策略，因此成了检验博弈程序的热门题目。',
    rules: [
      '大棋盘由3×3个小井字棋盘组成。X先走，可以下在任何地方。',
      '你在小棋盘里选的位置，决定对方要去哪个小棋盘：你下在任意小棋盘的右上格，对方就必须在右上的小棋盘下。',
      '在小棋盘上连成三子就赢下这个小棋盘。赢下或下满的小棋盘就关闭了。',
      '如果你被送到已关闭的小棋盘，可以改在任意开放的小棋盘下。',
      '在大棋盘上把三个赢下的小棋盘连成一线即获胜。如果已经不可能连线且所有小棋盘都关闭，判和。',
    ],
    basics: ['每走一步前，先看看你把对方送到哪个小棋盘：别送到他能赢的地方。', '和普通井字棋一样，中央的小棋盘和中央格最强。', '把对方送到已关闭的棋盘等于给他自由选择，除非安全，否则避免。'],
    advanced: ['赢很多小棋盘不如赢三个连成一线的；要在大棋盘上规划。', '如果能让对方很多步都被送到没用的地方，可以牺牲一个小棋盘。', '制造强制序列：在一个小棋盘上做出两个威胁，而对方的每个应手都把你送回那里。'],
    mistakes: ['在小棋盘上下了最好的格子，却把对方送到他需要的棋盘。', '过早关闭棋盘，白送对方自由步。', '忘了大棋盘，赢下的小棋盘连不成线。'],
  },
  tr: {
    summary: 'Büyük bir XOX’un içinde dokuz XOX. Nereye oynadığın, rakibinin sonra nereye oynayacağını belirler.',
    history: 'Süper XOX modern bir oyundur: türlü biçimleri 2000’lerde matematik kamplarında ve bulmaca kulüplerinde oynandı, matematikçi Ben Orlin’in 2013’teki yazısından sonra geniş kitlelerce tanındı. Dikkatli her oyuncunun hep berabere bitirebildiği sıradan XOX’un aksine o kadar karmaşıktır ki bilinen basit bir stratejisi yoktur; oyun oynayan programlar için gözde bir sınav olmuştur.',
    rules: [
      'Büyük tahta, küçük XOX tahtalarından oluşan 3×3 bir ızgaradır. İlk hamleyi X yapar, istediği yere.',
      'Küçük tahtada seçtiğin kare, rakibini eşleşen küçük tahtaya gönderir: herhangi bir tahtanın sağ üst karesine oynarsan rakibin sağ üstteki tahtada oynamak zorundadır.',
      'Küçük tahtada üçü yan yana getiren o tahtayı kazanır. Kazanılmış ya da dolu tahta kapanır.',
      'Kapalı bir tahtaya gönderilirsen açık tahtalardan istediğine oynayabilirsin.',
      'Büyük tahtada üç küçük tahtayı yan yana kazanan oyunu kazanır. Artık sıra yapılamıyorsa ve bütün tahtalar kapalıysa oyun berabere biter.',
    ],
    basics: ['Her hamleden önce rakibini hangi tahtaya gönderdiğine bak: kazanabileceği yere gönderme.', 'Sıradan XOX’ta olduğu gibi orta tahta ve orta kareler en güçlüsüdür.', 'Rakibi kapalı tahtaya göndermek ona serbest seçim verir; güvenli değilse kaçın.'],
    advanced: ['Çok küçük tahta kazanmak, sıra oluşturan üçü kazanmaktan daha az önemlidir; büyük tahtada plan yap.', 'Rakibi uzun süre işe yaramaz yerlere gönderecekse bir küçük tahtayı feda et.', 'Zorlayıcı seriler kur: bir tahtada iki tehdit, rakibin her cevabı seni oraya geri gönderir.'],
    mistakes: ['Küçük tahtada en iyi kareyi oynayıp rakibi ihtiyacı olan tahtaya göndermek.', 'Bir tahtayı çok erken kapatıp bedava hamle dağıtmak.', 'Büyük tahtayı unutup sıra oluşturmayan tahtalar toplamak.'],
  },
};
