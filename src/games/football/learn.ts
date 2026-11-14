import type { Lesson } from '../../core/learn';
export const lesson: Lesson = {
  names: { en: '7-0 Challenge', tr: '7-0 Meydan Okuması', zh: '7比0挑战', pinyin: 'qī bǐ líng tiǎozhàn' },
  en: {
    summary: 'Roll a club, take one player, fill your XI, then play a seven-match cup run. Seven wins out of seven is the 7-0.',
    history: 'Draft games like this grew out of fantasy football and late-night arguments about all-time XIs: what if you could only take one player from each team you are dealt? This version has three unlicensed leagues: European giants, the Turkish Super League and the Chinese Super League. Every club and player is fictional, with names that only sound familiar.',
    rules: [
      'Choose a league, a formation and a style. Classic mode shows player ratings; Almanac mode hides them.',
      'Roll to draw a club, then take one of its players for an open position. You have two rerolls per draft.',
      'A player keeps his full rating in his own position, loses a little in a nearby one, and much more out of position.',
      'With all eleven places filled, your team plays three group games (four points needed to go through) and then four knockout rounds. Knockout draws go to extra time and penalties.',
      'Win all seven and you have the 7-0. In a same-device game every player gets the same clubs and the same opponents.',
    ],
    basics: ['Goalkeepers and centre-backs are scarce. Take a good one as soon as you see one.', 'A great player in the wrong position is often worse than a good one in the right position.', 'Two or more players from the same club add chemistry to every line, even from different seasons; the same season adds a little more.'],
    advanced: ['Choose the formation for the players you expect to find: a league with many strikers suits two up front.', 'Attacking style scores more and concedes more; defensive style keeps knockout ties tight.', 'Save a reroll for the last picks, when only one or two positions are left open.'],
    mistakes: ['Filling the attack first and ending with a midfielder in goal.', 'Spending both rerolls in the first few picks.'],
  },
  zh: {
    summary: '抽一支球队，选一名球员，凑齐首发十一人，然后踢七场杯赛。七战全胜就是7比0。',
    history: '这类选人游戏源于梦幻足球，以及球迷关于“历史最佳阵容”的深夜争论：如果每抽到一支球队只能选一个人，会组成怎样的阵容？这个版本有三个非授权联赛：欧洲豪门、土耳其超级联赛和中国超级联赛。所有球队和球员都是虚构的，名字只是听起来耳熟。',
    rules: ['选择联赛、阵型和风格。经典模式显示球员评分，年鉴模式隐藏评分。', '抽一支球队，从中选一名球员放到空位上。每次选人有两次重抽机会。', '球员在本位发挥全部评分，在相近位置略有下降，打错位置会大幅下降。', '十一人到齐后，球队先踢三场小组赛（需要4分出线），再踢四轮淘汰赛。淘汰赛打平进入加时和点球。', '七战全胜就是7比0。同机游戏中，每位玩家抽到的球队和遇到的对手都一样。'],
    basics: ['门将和中后卫很稀缺，看到好的就先拿下。', '打错位置的球星，常常不如本位的好球员。', '来自同一支球队的两名或更多球员会提升各条线的默契。'],
    advanced: ['根据预计能抽到的球员选阵型：前锋多的联赛适合双前锋。', '进攻风格进球多、失球也多；防守风格能让淘汰赛更胶着。', '留一次重抽给最后几次选人，那时只剩一两个空位。'],
    mistakes: ['先把锋线填满，最后只能让中场去守门。', '在最初几次选人里就用掉两次重抽。'],
  },
  tr: {
    summary: 'Bir kulüp çek, bir oyuncu al, ilk on birini tamamla ve yedi maçlık kupa yoluna çık. Yedide yedi galibiyet 7-0’dır.',
    history: 'Bu tür kadro kurma oyunları fantezi futboldan ve “tüm zamanların en iyi on biri” tartışmalarından doğdu: Önüne gelen her takımdan yalnızca bir oyuncu alabilseydin nasıl bir kadro kurardın? Bu versiyonda üç lisanssız lig var: Avrupa devleri, Türkiye Süper Ligi ve Çin Süper Ligi. Bütün kulüpler ve oyuncular kurgusaldır; isimleri yalnızca tanıdık gelir.',
    rules: [
      'Bir lig, diziliş ve oyun tarzı seç. Klasik modda oyuncu güçleri görünür; Almanak modunda gizlidir.',
      'Bir kulüp çek ve kadrosundan bir oyuncuyu boş bir mevkiye al. Her kadroda iki yeniden çekme hakkın var.',
      'Oyuncu kendi mevkisinde tam gücündedir, yakın bir mevkide biraz, yabancı mevkide çok daha fazla güç kaybeder.',
      'On bir yer dolunca takımın üç grup maçı (çıkmak için 4 puan gerekir), sonra dört eleme turu oynar. Elemede beraberlik uzatmaya ve penaltılara gider.',
      'Yedisini de kazanırsan 7-0 senindir. Aynı cihazda oynarken herkese aynı kulüpler ve aynı rakipler gelir.',
    ],
    basics: ['Kaleci ve stoper az bulunur. İyisini görünce hemen al.', 'Yanlış mevkideki büyük bir oyuncu, doğru mevkideki iyi bir oyuncudan çoğu zaman daha kötüdür.', 'Aynı kulüpten iki ya da daha fazla oyuncu, farklı sezonlardan olsalar da, her hatta uyum katar; aynı sezondan olanlar biraz daha fazla.'],
    advanced: ['Dizilişi bulmayı beklediğin oyunculara göre seç: forveti bol bir ligde iki forvet iyi gider.', 'Hücum tarzı çok atar ama çok da yer; savunma tarzı eleme maçlarını sıkı tutar.', 'Bir yeniden çekme hakkını son seçimlere sakla; o zaman yalnızca bir iki mevki boş kalır.'],
    mistakes: ['Önce hücumu doldurup sonunda kaleye bir orta saha koymak.', 'İki yeniden çekme hakkını ilk birkaç seçimde harcamak.'],
  },
};
