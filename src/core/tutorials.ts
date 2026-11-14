import type { Lesson } from './learn';
import type { Lang } from './store';

/**
 * "Play the tutorial": short guided tours over the real game. Each step points at a part of
 * the screen; steps marked `act` wait for you to tap that part instead of pressing Next.
 * Games without a hand-written tour get one built from their lesson.
 */
type T3 = [en: string, zh: string, tr: string];
export interface Step { t: T3; at?: string; act?: boolean }

const BOARD = '.play-main', SIDE = '.play-side';
const TOURS: Record<string, Step[]> = {
  chess: [
    { t: ['Tap one of your pieces: the squares it can reach light up. Tap one to move.', '点你的一个棋子，可走的格子会亮起；再点一格走棋。', 'Taşlarından birine dokun: gidebileceği kareler parlar. Birine dokunup oyna.'], at: '.ch-board', act: true },
    { t: ['The moves are written below the board in standard notation.', '棋谱以标准记法显示在棋盘下方。', 'Hamleler tahtanın altında standart gösterimle yazılır.'], at: '.movelist' },
    { t: ['Choose your opponent and colour here. Each game has a daily mate puzzle too: open it from Today’s issue.', '在这里选择对手和执色。每种棋每天还有一道杀棋谜题：从今日报纸进入。', 'Rakibini ve rengini buradan seç. Her gün bir mat bulmacası da var: günün sayısından aç.'], at: '.play-side' },
  ],
  xiangqi: [
    { t: ['Pieces stand on the points. Tap one of yours, then a highlighted point.', '棋子在交叉点上。点你的一个棋子，再点高亮的点。', 'Taşlar noktalarda durur. Kendi taşına, sonra parlayan noktaya dokun.'], at: '.xq-board', act: true },
    { t: ['The general and advisors never leave the palace; elephants never cross the river.', '将和士不出九宫；象不过河。', 'General ve danışmanlar saraydan, filler nehirden çıkmaz.'], at: '.xq-board' },
  ],
  shogi: [
    { t: ['Your pieces point up the board. Tap one, then a highlighted square.', '你的棋子尖头朝上。点一枚，再点高亮格。', 'Senin taşların yukarıyı gösterir. Birine, sonra parlayan kareye dokun.'], at: '.sg-board', act: true },
    { t: ['Captured pieces wait in your hand below the board. Tap one, then any empty square, to drop it.', '吃掉的棋子在棋盘下方的持驹里。点一枚，再点空格即可打入。', 'Aldığın taşlar tahtanın altında elinde bekler. Birine, sonra boş bir kareye dokunup bırak.'], at: '.sg-wrap' },
  ],
  weiqi: [
    { t: ['Tap any empty intersection to place a stone.', '点任意空交叉点落子。', 'Taş koymak için boş bir kesişime dokun.'], at: '.go-board', act: true },
    { t: ['Surround enemy stones to capture them; surround empty points to make territory. When the board is settled, pass.', '围住对方的棋子就能提掉；围住空点就是地。棋局定型后停一手。', 'Rakip taşları çevreleyerek al; boş noktaları çevreleyerek toprak yap. Tahta oturunca pas geç.'], at: '#go-pass' },
  ],
  pisti: [
    { t: ['The middle pile: the top card is face up. Match it, or play a jack, to take the whole pile.', '中间的牌堆：最上面一张翻开。出同点数的牌或J就能收走整堆。', 'Ortadaki yer: en üstteki kart açık. Aynısını ya da vale atarsan hepsini alırsın.'], at: '.ps-mid' },
    { t: ['These are your four cards. Tap one to play it.', '这是你的四张牌。点一张出牌。', 'Bunlar senin dört kartın. Atmak için birine dokun.'], at: '.ps-me', act: true },
    { t: ['A lone card taken by its twin is a pişti: 10 points, 20 with jacks. Aces, jacks, 2♣ and 10♦ score too.', '单张被同点牌收走就是pişti：10分，J收J得20分。A、J、梅花2和方块10也计分。', 'Tek kartı eşiyle almak piştidir: 10 puan, vale ile 20. As, vale, sinek ikili ve karo onlu da puan getirir.'], at: '.ps-table' },
  ],
  batak: [
    { t: ['First the bidding: say how many tricks you will take (at least 5), or pass.', '先叫牌：报出你能吃几墩（至少5），或者不叫。', 'Önce ihale: kaç el alacağını söyle (en az 5) ya da pas de.'], at: '.tt-felt' },
    { t: ['The highest bidder names trump. In play, follow suit and beat the best card if you can; out of a suit you must trump.', '最高叫者指定将牌。出牌时必须跟花色，能压就压；没有该花色必须出将牌。', 'İhaleyi alan kozu seçer. Oyunda rengi takip et, büyüğün varsa büyük at; o renk yoksa koz çakmak zorunlu.'], at: '.tt-felt' },
    { t: ['Your hand. Only the cards you may play light up.', '你的手牌。只有能出的牌会亮起。', 'Elin. Yalnızca atabileceğin kartlar parlar.'], at: '.pc-hand' },
  ],
  king: [
    { t: ['Each hand one player chooses the game: a penalty to dodge or a trump hand to win.', '每局由一位玩家选择玩法：要躲避的罚分局，或要赢墩的将牌局。', 'Her elde bir oyuncu oyunu seçer: kaçılacak bir ceza ya da kazanılacak bir koz.'], at: '.tt-felt' },
    { t: ['The score sheet shows how many trump and penalty hands each player still owes.', '计分表显示每人还剩几次将牌局和罚分局。', 'Çetele, her oyuncunun kaç koz ve ceza borcu kaldığını gösterir.'], at: '.kg-sheet' },
    { t: ['Follow suit and beat the best card if you can. Your playable cards light up; tap one.', '必须跟花色，能压就压。能出的牌会亮起，点一张。', 'Rengi takip et, büyüğün varsa büyük at. Atabileceğin kartlar parlar; birine dokun.'], at: '.pc-hand' },
  ],
  poker: [
    { t: ['Your two cards are yours alone; the five in the middle are shared.', '两张底牌只属于你，中间五张是公共牌。', 'İki kart yalnızca senin; ortadaki beş kart herkesin.'], at: '.pk-table' },
    { t: ['On your turn: fold, check or call, or slide to raise. All in puts every chip on the line.', '轮到你：弃牌、过牌或跟注，或拖动滑块加注。全下就是押上所有筹码。', 'Sıra sende: pas, kontrol ya da gör; yükseltmek için kaydır. All-in bütün fişlerini ortaya koyar.'], at: '.pk-actions' },
    { t: ['The best five cards out of your two and the board win. The last player with chips wins the table.', '底牌加公共牌组成的最好五张获胜。最后还有筹码的人赢下整桌。', 'İki kartın ve ortadakilerle yapılan en iyi beşli kazanır. Fişi kalan son oyuncu masayı kazanır.'], at: '.pk-felt' },
  ],
  tavla: [
    { t: ['This is the tavla board. You move your 15 checkers round the board and bear them all off before your opponent.', '这是双陆棋盘。你要让15枚棋子绕行一圈，并比对手先全部移出。', 'Bu tavla tahtası. 15 pulunu tahtanın etrafında dolaştırıp rakibinden önce hepsini toplamaya çalışırsın.'], at: '.tv-board' },
    { t: ['Start by rolling the dice. Tap the roll button.', '先掷骰子。点一下掷骰按钮。', 'Önce zarı at. Zar atma düğmesine dokun.'], at: '#tv-roll', act: true },
    { t: ['Now tap one of your checkers, then the highlighted point it can go to. Each die is one move.', '现在点你的一枚棋子，再点它可以去的高亮位置。每颗骰子走一步。', 'Şimdi pullarından birine, sonra gidebileceği parlayan haneye dokun. Her zar bir hamledir.'], at: '.tv-board', act: true },
    { t: ['A single checker on a point is a blot: if the opponent lands on it, it goes to the bar. Two or more make a gate.', '一个位置上只有一枚棋子就是"孤子"，被对手落上就会被打到中间。两枚以上就成了"门"。', 'Bir hanede tek pul açıktır: rakip üstüne gelirse kırılır ve bara gider. İki ya da daha fazla pul kapı olur.'], at: '.tv-board' },
    { t: ['Undo, restart and the rules are always in the bar above the game.', '悔棋、重新开始和规则说明一直在游戏上方的工具栏里。', 'Geri al, yeniden başlat ve kurallar her zaman oyunun üstündeki çubukta.'], at: '.frame-bar' },
  ],
  okey: [
    { t: ['This is your rack. Make runs (5-6-7 of one colour) and groups (the same number in different colours).', '这是你的牌架。凑顺子（同色连号，如5-6-7）和组（同号不同色）。', 'Bu senin ıstakan. Seri (aynı renk 5-6-7) ve grup (farklı renklerde aynı sayı) yapmaya çalış.'], at: '.ok-table' },
    { t: ['Tap a tile to select it, tap another slot to move it. Arrange your rack your way.', '点一张牌选中它，再点另一个格子移动它。按你的方式整理牌架。', 'Bir taşa dokunup seç, başka bir yuvaya dokunup taşı. Istakanı istediğin gibi diz.'], at: '.ok-table', act: true },
    { t: ['On your turn, draw from the middle or take your neighbour’s discard, then throw one tile away.', '轮到你时，从中间摸牌或拿上家弃的牌，然后打出一张。', 'Sıra sendeyken ortadan ya da soldakinin attığı taştan çek, sonra bir taş at.'], at: BOARD },
    { t: ['These buttons sort your rack into runs or groups for you.', '这两个按钮可以帮你把牌按顺子或组排好。', 'Bu düğmeler ıstakanı seri ya da gruba göre senin için dizer.'], at: '#ok-runs' },
    { t: ['The tile under the indicator is the okey: a joker. When all 14 tiles fit into sets, finish!', '指示牌的下一张就是"okey"，即百搭。14张牌全部成组时就可以胡牌！', 'Göstergenin bir üstü okeydir, yani joker. 14 taşın hepsi per olunca bitir!'], at: '#ok-finish' },
  ],
  sudoku: [
    { t: ['Fill the grid so every row, column and box has each digit once.', '填满格子，让每行、每列、每宫的数字都不重复。', 'Izgarayı doldur: her satırda, sütunda ve kutuda her rakam bir kez olsun.'], at: BOARD },
    { t: ['Tap an empty cell to select it.', '点一个空格选中它。', 'Seçmek için boş bir kareye dokun.'], at: BOARD, act: true },
    { t: ['Then tap a digit, or type it. Notes mode lets you pencil in candidates.', '然后点一个数字或直接输入。笔记模式可以标记候选数。', 'Sonra bir rakama dokun ya da yaz. Not modu aday rakamları kurşun kalemle yazmanı sağlar.'], at: '#sdk-notes' },
    { t: ['Stuck? The hint button in the bar above shows the next logical step.', '卡住了？上方工具栏的提示按钮会告诉你下一步。', 'Takıldın mı? Üst çubuktaki ipucu düğmesi bir sonraki mantıklı adımı gösterir.'], at: '.frame-bar' },
  ],
  minesweeper: [
    { t: ['Some squares hide mines. Open all the others without hitting one.', '有些格子下埋着雷。把其他格子都打开，别踩雷。', 'Bazı karelerin altında mayın var. Mayına basmadan diğerlerinin hepsini aç.'], at: BOARD },
    { t: ['Tap any square to start. The first tap is always safe.', '点任意一格开始，第一下一定安全。', 'Başlamak için herhangi bir kareye dokun. İlk dokunuş her zaman güvenlidir.'], at: BOARD, act: true },
    { t: ['A number tells how many mines touch that square. Long-press (or right-click) to plant a flag on a mine.', '数字表示周围有几颗雷。长按（或右键）在雷上插旗。', 'Sayı, o kareye değen mayın sayısıdır. Mayına bayrak dikmek için uzun bas (ya da sağ tıkla).'], at: BOARD },
  ],
  mancala: [
    { t: ['Twelve pits and two stores. Your pits are the bottom row, your store is on the right.', '十二个坑和两个仓。下排是你的坑，右边是你的仓。', 'On iki kuyu ve iki hazine. Alt sıra senin kuyuların, sağdaki senin hazinen.'], at: BOARD },
    { t: ['Tap one of your pits: its stones are sown one by one to the right, starting in the same pit.', '点你的一个坑：里面的石子从这个坑开始，一颗颗向右播。', 'Kuyularından birine dokun: taşlar aynı kuyudan başlayarak sağa doğru birer birer dağıtılır.'], at: BOARD, act: true },
    { t: ['Last stone in your store: play again. Last stone makes an opponent’s pit even: you take them.', '最后一颗落进自己的仓：再走一次。落在对方坑里使其成偶数：全部吃掉。', 'Son taş hazinene düşerse bir daha oynarsın. Rakip kuyusunu çift yaparsa hepsini alırsın.'], at: BOARD },
  ],
  billiards: [
    { t: ['Drag anywhere on the table to swing the cue round the white ball and aim.', '在台面上拖动，让球杆绕白球转动来瞄准。', 'Nişan almak için masada herhangi bir yerde sürükle; ıstaka beyaz topun etrafında döner.'], at: 'canvas', act: true },
    { t: ['Pull the power bar beside the table and let go to strike.', '拉动球台旁的力度条，松手即击球。', 'Masanın yanındaki güç çubuğunu çek ve bırak: vuruş yapılır.'], at: '.pool-power' },
    { t: ['The fine-aim and spin controls sit under the table.', '微调和加塞控制在球台下方。', 'İnce nişan ve falso ayarları masanın altında.'], at: '.pool-dock' },
  ],
  'football-70': [
    { t: ['Pick a league and press Start the draft.', '选择联赛，然后点"开始选人"。', 'Bir lig seç ve Seçime başla’ya bas.'], at: '#fb-start', act: true },
    { t: ['Roll a club: you get one season of one club, today’s squad or a legendary one.', '抽一支球队：你会得到某支球队的某个赛季，可能是现役也可能是传奇阵容。', 'Kulüp çek: bir kulübün bir sezonu gelir; bugünkü kadro ya da efsane bir kadro.'], at: '#fb-roll', act: true },
    { t: ['Take one player. He drops into the best free slot; tap a slot first to choose it yourself.', '选一名球员，他会自动进入最合适的空位；也可以先点一个位置。', 'Bir oyuncu al. En uygun boş mevkiye geçer; istersen önce bir mevkiye dokun.'], at: BOARD },
    { t: ['Eleven picks, then play the cup run minute by minute. Seven wins is the 7-0.', '选满十一人，然后一分钟一分钟地踢完杯赛。七战全胜就是7比0。', 'On bir seçimden sonra kupa yolunu dakika dakika izle. Yedi galibiyet 7-0 demek.'], at: SIDE },
  ],
  battleship: [
    { t: ['First place your fleet: tap a ship, then tap the sea. Rotate turns it.', '先布置舰队：点一艘船，再点海面。旋转按钮可以转向。', 'Önce filonu yerleştir: bir gemiye, sonra denize dokun. Döndür düğmesi gemiyi çevirir.'], at: BOARD },
    { t: ['Or let fate decide with Shuffle.', '也可以用"随机"交给命运。', 'Ya da Karıştır ile kaderine bırak.'], at: '#bs-shuffle' },
    { t: ['Then fire at the enemy sea one shot at a time. Sink every ship to win.', '然后一次一炮轰击敌方海域。击沉所有船即获胜。', 'Sonra düşman denizine tek tek atış yap. Bütün gemileri batıran kazanır.'], at: BOARD },
  ],
};

const tri = (x: T3, lang: Lang) => (lang === 'zh' ? x[1] : lang === 'tr' ? x[2] : x[0]);
export function tourFor(game: string, lesson: Lesson | undefined): Step[] {
  if (TOURS[game]) return TOURS[game];
  if (!lesson) return [];
  const L = (k: Lang) => (k === 'tr' ? lesson.tr ?? lesson.en : lesson[k]);
  const n = Math.min(4, lesson.en.rules.length);
  const steps: Step[] = [{ t: [lesson.en.summary, lesson.zh.summary, L('tr').summary], at: BOARD }];
  for (let i = 0; i < n; i++) steps.push({ t: [lesson.en.rules[i], lesson.zh.rules[i] ?? lesson.en.rules[i], L('tr').rules[i] ?? lesson.en.rules[i]], at: BOARD });
  steps.push({ t: ['Your turn: tap the board and play. Undo, hint and the full rules are in the bar above.', '轮到你了：点棋盘开始玩。悔棋、提示和完整规则都在上方工具栏。', 'Sıra sende: tahtaya dokun ve oyna. Geri al, ipucu ve kuralların tamamı üstteki çubukta.'], at: BOARD, act: true });
  return steps;
}
export const stepText = (s: Step, lang: Lang) => tri(s.t, lang);
