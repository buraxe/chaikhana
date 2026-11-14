import type { Lang } from './store';

/**
 * The regulars of the coffeehouse. Five strengths, from the tea boy to the house legend; each
 * strength has a few people who play it, from Istanbul, Beijing and further afield. The first
 * five are the original regulars and stay the default for their strength.
 */
type T3 = [en: string, zh: string, tr: string];
export type Event = 'greet' | 'think' | 'theyWin' | 'youWin' | 'draw' | 'locked';
export type Style = 'boy' | 'auntie' | 'moustache' | 'glasses' | 'beard' | 'ponytail' | 'cap' | 'beret' | 'bun' | 'bald' | 'chef' | 'cowboy';
export interface Regular {
  name: T3; title: T3; bio: T3;
  /** strength 0–4, and where they are from (a flag) */
  lvl?: number; from: string;
  /** face colours: skin, hair, accent (clothes); mo adds a moustache, specs glasses */
  look: { skin: string; hair: string; cloth: string; style: Style; mo?: boolean; specs?: boolean };
  lines: Record<Exclude<Event, 'locked'>, T3[]>;
}

export const CAST: Regular[] = [
  {
    name: ['Ali the Tea Boy', '端茶小伙阿里', 'Çırak Ali'],
    title: ['Tea boy, learning the games', '端茶的学徒', 'Çay ocağının çırağı'],
    bio: ['Carries the tea tray between the tables and learned every game by watching. Keen, quick, careless.', '端着茶盘在桌子间穿梭，看着看着就学会了所有游戏。热情、手快，但常常粗心。', 'Masalar arasında çay tepsisi taşırken bütün oyunları seyrederek öğrendi. Hevesli, hızlı, biraz dikkatsiz.'],
    from: '🇹🇷',
    look: { skin: '#e8b98f', hair: '#2b1d14', cloth: '#a3262a', style: 'boy' },
    lines: {
      greet: [['Your tea is on the house if you beat me, abi!', '赢了我，这杯茶我请！', 'Beni yenersen çay benden abi!'], ['Usta says I’m getting better. Let’s see!', '师傅说我进步了，咱们试试！', 'Usta gelişiyorsun dedi, bakalım!']],
      think: [['Hmm, hmm… wait, wait…', '嗯……等等，等等……', 'Hmm… dur bir dakika…'], ['Is that allowed? Never mind!', '这样可以吗？算了！', 'Bu olur mu ki? Neyse!']],
      theyWin: [['I won! I won! Wait till Usta hears!', '我赢了！我赢了！等着师傅听说吧！', 'Kazandım! Kazandım! Usta duysun!'], ['Beginner’s luck… or talent?', '新手运气……还是天赋？', 'Acemi şansı mı… yoksa yetenek mi?']],
      youWin: [['Fair enough. One more, I’m just warming up!', '好吧。再来一盘，我才刚热身！', 'Tamam tamam. Bir daha, daha ısınıyorum!'], ['I’ll bring your tea… and a rematch.', '我给你端茶……顺便再战一盘。', 'Çayını getiriyorum… rövanşla birlikte.']],
      draw: [['Nobody wins? Then nobody pays for tea!', '没人赢？那谁也不用付茶钱！', 'Kimse kazanmadı mı? O zaman çayı kimse ödemez!']],
    },
  },
  {
    name: ['Auntie Nermin', '内尔明阿姨', 'Nermin Teyze'],
    title: ['The cheerful neighbour', '最开朗的邻居', 'Mahallenin neşesi'],
    bio: ['Comes for the gossip, stays for the games. Makes mistakes, laughs at them, and never gives up.', '为了聊天而来，为了游戏而留。会犯错，会自嘲，但从不认输。', 'Dedikodu için gelir, oyun için kalır. Hata yapar, güler geçer, asla pes etmez.'],
    from: '🇹🇷',
    look: { skin: '#f0c7a0', hair: '#8a8f99', cloth: '#5b3f8c', style: 'auntie' },
    lines: {
      greet: [['Come, sit, dear. Go easy on an old woman!', '来，坐吧孩子。对老太太手下留情啊！', 'Gel otur yavrum. Yaşlı kadına acı biraz!'], ['I’ve had my coffee, I’m ready.', '我咖啡喝过了，准备好了。', 'Kahvemi içtim, hazırım.']],
      think: [['Now where did my glasses go…', '我的眼镜放哪儿了……', 'Gözlüğüm nerede kaldı…'], ['Let me think, let me think.', '让我想想，让我想想。', 'Dur bakayım, dur bakayım.']],
      theyWin: [['Oh my! Did I win? Masha’allah!', '哎呀！我赢了吗？真没想到！', 'Aaa! Kazandım mı? Maşallah bana!'], ['Don’t be sad, dear, I had lucky dice today.', '别难过孩子，今天我运气好。', 'Üzülme yavrum, bugün şansım yaver gitti.']],
      youWin: [['Bravo, dear! Your mother raised you well.', '真棒，孩子！你妈妈把你教得真好。', 'Aferin yavrum! Annene selam söyle.'], ['You beat me fair and square. Here, have a sweet.', '你赢得光明正大。来，吃块糖。', 'Hakkınla yendin. Al bakalım, bir şeker.']],
      draw: [['A draw! Everybody’s happy, how nice.', '平局！大家都开心，真好。', 'Berabere! Herkes mutlu, ne güzel.']],
    },
  },
  {
    name: ['Rıza the Headman', '村长里扎', 'Muhtar Rıza'],
    title: ['Neighbourhood headman', '街区村长', 'Mahalle muhtarı'],
    bio: ['Signs papers in the morning and plays all afternoon. Solid, stubborn, and always asks for one more game.', '上午盖章签字，下午全在下棋。稳健、固执，总要求再来一局。', 'Sabah evrak imzalar, öğleden sonra hep oyundadır. Sağlam oynar, inatçıdır, hep “bir el daha” der.'],
    from: '🇹🇷',
    look: { skin: '#d9a77a', hair: '#3a3a3a', cloth: '#2f5d50', style: 'moustache' },
    lines: {
      greet: [['Sit down. The papers can wait, the game can’t.', '坐吧。文件可以等，棋局不能等。', 'Otur bakalım. Evrak bekler, oyun beklemez.'], ['Let’s play properly, no fooling around.', '咱们认真下，别开玩笑。', 'Adam gibi oynayalım, şaka yok.']],
      think: [['Hmm. That needs a stamp of approval.', '嗯，这一步得盖个章。', 'Hmm. Buna bir mühür lazım.'], ['Let me see the whole picture.', '让我看看全局。', 'Bir bütün resme bakayım.']],
      theyWin: [['That’s how the headman plays. Write it down!', '村长就是这么下的。记下来！', 'Muhtar böyle oynar. Yazın bunu!'], ['Experience, young one. Experience.', '经验，年轻人，是经验。', 'Tecrübe evlat, tecrübe.']],
      youWin: [['Well played. One more — I insist.', '下得好。再来一局——我坚持。', 'İyi oynadın. Bir el daha, ısrar ediyorum.'], ['Fine, you win. But this isn’t over.', '好吧你赢了，但这事没完。', 'Peki kazandın. Ama bu iş bitmedi.']],
      draw: [['A draw. A diplomatic result.', '平局。很外交的结果。', 'Beraberlik. Diplomatik bir sonuç.']],
    },
  },
  {
    name: ['Hüsnü the Teacher', '胡斯尼老师', 'Hüsnü Hoca'],
    title: ['Retired maths teacher', '退休数学老师', 'Emekli matematik öğretmeni'],
    bio: ['Thirty years of teaching maths. Counts every move twice, explains your mistakes whether you ask or not.', '教了三十年数学。每一步都算两遍，不管你问不问都会讲解你的失误。', 'Otuz yıl matematik öğretmenliği yaptı. Her hamleyi iki kere hesaplar, sorsan da sormasan da hatanı anlatır.'],
    from: '🇹🇷',
    look: { skin: '#e3b48c', hair: '#c9c9c9', cloth: '#1f3a5f', style: 'glasses' },
    lines: {
      greet: [['Let’s see if you did your homework.', '看看你有没有好好做功课。', 'Bakalım ödevini yapmış mısın.'], ['Every move is a little equation.', '每一步都是一道小方程。', 'Her hamle küçük bir denklemdir.']],
      think: [['Calculating…', '计算中……', 'Hesaplıyorum…'], ['Interesting. Very interesting.', '有意思，非常有意思。', 'İlginç. Çok ilginç.']],
      theyWin: [['Mathematics never lies, my child.', '数学从不撒谎，孩子。', 'Matematik yalan söylemez evladım.'], ['A good lesson. Study it and come back.', '一堂好课。回去研究一下再来。', 'Güzel bir ders oldu. Çalış, yine gel.']],
      youWin: [['Excellent! Full marks. I am proud.', '优秀！满分。我很骄傲。', 'Pekiyi! Tam not. Gurur duydum.'], ['The student surpasses the teacher. As it should be.', '青出于蓝。本该如此。', 'Öğrenci hocayı geçti. Olması gereken bu.']],
      draw: [['Equal. Like both sides of an equation.', '相等，就像方程两边。', 'Eşit. Bir denklemin iki tarafı gibi.']],
    },
  },
  {
    name: ['Master Şevket', '谢夫凯特大师', 'Şevket Usta'],
    title: ['The coffeehouse legend', '咖啡馆的传奇', 'Kahvehanenin efsanesi'],
    bio: ['They say he hasn’t lost a game in forty years. Speaks little, plays fast, and sips his tea while you think.', '传说他四十年没输过。话少，下得快，你思考时他慢慢喝茶。', 'Kırk yıldır yenilmediği söylenir. Az konuşur, hızlı oynar, sen düşünürken çayını yudumlar.'],
    from: '🇹🇷',
    look: { skin: '#c99670', hair: '#e6e6e6', cloth: '#1c140c', style: 'beard' },
    lines: {
      greet: [['…Sit.', '……坐。', '…Otur.'], ['So, you made it to my table.', '你终于坐到我这桌了。', 'Demek masama kadar geldin.']],
      think: [['…', '……', '…'], ['Hm.', '嗯。', 'Hm.']],
      theyWin: [['Forty years, my friend.', '四十年了，朋友。', 'Kırk yıl evlat, kırk yıl.'], ['Drink your tea. Come back next week.', '喝了你的茶，下周再来。', 'Çayını iç. Haftaya yine gel.']],
      youWin: [['…Well. The tea is on me today.', '……好。今天的茶我请。', '…Pekâlâ. Bugün çaylar benden.'], ['Forty years, and today it was you. Well done.', '四十年，今天输给了你。干得好。', 'Kırk yıl, ve bugün sen. Helal olsun.']],
      draw: [['Not bad. Not bad at all.', '不错，相当不错。', 'Fena değil. Hiç fena değil.']],
    },
  },
  // ---- Guests from abroad ----
  {
    lvl: 0, from: '🇨🇳', name: ['Xiao Mei', '小美', 'Xiao Mei'], title: ['Exchange student from Chengdu', '来自成都的交换生', 'Chengdu’dan değişim öğrencisi'],
    bio: ['Came to Istanbul to study Turkish and stayed for the tea. Films every move for her followers and cheers for both sides.', '来伊斯坦布尔学土耳其语，结果爱上了这里的茶。每一步都拍下来发给粉丝，双方她都加油。', 'Türkçe öğrenmeye İstanbul’a geldi, çay için kaldı. Her hamleyi takipçileri için çekiyor, iki tarafı da alkışlıyor.'],
    look: { skin: '#f3d2b3', hair: '#1a1a1a', cloth: '#e85a8a', style: 'ponytail' },
    lines: {
      greet: [['Hello! Merhaba! 你好! Can I film this game?', '你好！Merhaba！我可以拍这局吗？', 'Merhaba! 你好! Bu oyunu çekebilir miyim?'], ['My followers say I will win today, haha!', '我的粉丝说我今天会赢，哈哈！', 'Takipçilerim bugün kazanacağımı söylüyor, haha!']],
      think: [['Wait, let me check my notes…', '等一下，我看看笔记……', 'Dur, notlarıma bakayım…'], ['加油加油!', '加油加油！', 'Jiayou, jiayou!']],
      theyWin: [['I won?! Posting this right now!', '我赢了？！马上发朋友圈！', 'Kazandım mı?! Hemen paylaşıyorum!'], ['Çok teşekkürler! Was that luck or skill?', '太谢谢了！是运气还是实力？', 'Çok teşekkürler! Şans mıydı, yetenek mi?']],
      youWin: [['You are so good! Teach me, teacher!', '你太厉害了！教教我吧，老师！', 'Çok iyisin! Bana da öğret, hocam!'], ['I lost, but the video is great.', '输了，但视频拍得很棒。', 'Kaybettim ama video harika oldu.']],
      draw: [['A draw! Everybody wins! 双赢!', '平局！双赢！', 'Berabere! Herkes kazandı!']],
    },
  },
  {
    lvl: 0, from: '🇺🇸', name: ['Kevin from Ohio', '俄亥俄来的凯文', 'Ohiolu Kevin'], title: ['Backpacker, three days in town', '背包客，来了三天', 'Sırt çantalı gezgin, üç gündür burada'],
    bio: ['Thinks everything is awesome: the tea, the cats, the rules he does not quite understand. Has never once read the rules first.', '觉得什么都很棒：茶、猫，还有他没完全搞懂的规则。从来不先看规则。', 'Her şeyi süper buluyor: çayı, kedileri, tam anlamadığı kuralları. Kuralları hiç önceden okumadı.'],
    look: { skin: '#f1c6a4', hair: '#c8913a', cloth: '#3a6ea5', style: 'cap' },
    lines: {
      greet: [['Dude, this place is awesome. How do you play this again?', '哥们，这地方太棒了。这个怎么玩来着？', 'Dostum, burası süper. Bu nasıl oynanıyordu?'], ['Teşekkür… teşekkürler! Did I say it right?', 'Teşekkür……谢谢！我说对了吗？', 'Teşekkür… teşekkürler! Doğru dedim mi?']],
      think: [['Can I move this one? No? Okay, this one.', '这个能走吗？不行？那走这个。', 'Bunu oynayabilir miyim? Hayır mı? Tamam, şunu.'], ['Hold on, I’m Googling it.', '等等，我查一下。', 'Dur, internetten bakıyorum.']],
      theyWin: [['No way! I WON? USA! USA!', '不可能！我赢了？美国！美国！', 'Olamaz! Kazandım mı? USA! USA!'], ['Beginner’s luck is a real thing, man.', '新手运气是真的，伙计。', 'Acemi şansı gerçekmiş, dostum.']],
      youWin: [['Totally fair. You crushed it, bro.', '完全公平。你太强了，兄弟。', 'Tamamen hak ettin. Ezdin geçtin, kanka.'], ['Okay, one more. I think I get it now. Maybe.', '好，再来一局。我觉得我懂了。大概。', 'Tamam, bir daha. Sanırım şimdi anladım. Belki.']],
      draw: [['A tie? Like, nobody wins? Cool, cool.', '平局？就是没人赢？酷，酷。', 'Berabere mi? Yani kimse kazanmadı mı? Güzel, güzel.']],
    },
  },
  {
    lvl: 1, from: '🇫🇷', name: ['Madame Colette', '科莱特夫人', 'Madam Colette'], title: ['Retired ballet teacher from Lyon', '里昂退休芭蕾舞老师', 'Lyon’dan emekli bale öğretmeni'],
    bio: ['Plays with great elegance and very little patience. Sighs at every move, yours and hers, and calls a bad position “une catastrophe”.', '下棋优雅而缺乏耐心。不管谁走棋她都叹气，局面不好就说“une catastrophe”。', 'Büyük bir zarafet ve çok az sabırla oynar. Her hamlede iç çeker, seninkinde de kendininkinde de; kötü pozisyona “une catastrophe” der.'],
    look: { skin: '#f3d3bd', hair: '#b0a89e', cloth: '#2b2b4a', style: 'beret' },
    lines: {
      greet: [['Bonjour, chéri. Shall we dance across the board?', 'Bonjour，亲爱的。我们在棋盘上跳支舞吧？', 'Bonjour chéri. Tahtada biraz dans edelim mi?'], ['Sit up straight. Posture is half the game.', '坐直。姿势就是一半的胜负。', 'Dik otur. Duruş oyunun yarısıdır.']],
      think: [['Oh là là…', '哦啦啦……', 'Oh là là…'], ['Hmm. Une catastrophe… or not?', '嗯。灾难……还是不是？', 'Hmm. Une catastrophe… yoksa değil mi?']],
      theyWin: [['Voilà. Grace always wins in the end.', '瞧。优雅终将获胜。', 'Voilà. Zarafet sonunda hep kazanır.'], ['Merci, merci. You may applaud.', '谢谢，谢谢。你可以鼓掌了。', 'Merci, merci. Alkışlayabilirsin.']],
      youWin: [['Magnifique… for you. For me, une catastrophe.', '对你来说很精彩……对我来说是灾难。', 'Magnifique… senin için. Benim için une catastrophe.'], ['Bravo. You move like a dancer.', '好极了。你走棋像舞者一样。', 'Bravo. Bir dansçı gibi oynuyorsun.']],
      draw: [['A draw. How very… diplomatic.', '平局。真是……外交辞令。', 'Berabere. Ne kadar da… diplomatik.']],
    },
  },
  {
    lvl: 1, from: '🇨🇳', name: ['Auntie Wang', '王大妈', 'Wang Teyze'], title: ['Square-dance captain from Beijing', '北京广场舞队长', 'Pekin’den meydan dansı kaptanı'],
    bio: ['Visiting her son in Istanbul and already knows every neighbour. Cracks sunflower seeds, talks the whole game, and somehow still notices your mistakes.', '来伊斯坦布尔看儿子，已经认识所有邻居。嗑着瓜子聊一整局，却总能发现你的失误。', 'İstanbul’daki oğlunu ziyarete geldi ve şimdiden bütün komşuları tanıyor. Ay çekirdeği çitler, oyun boyunca konuşur, yine de hatalarını fark eder.'],
    look: { skin: '#eac39f', hair: '#2a2a2a', cloth: '#c8302e', style: 'bun' },
    lines: {
      greet: [['Come, come, have some sunflower seeds! 来来来!', '来来来，吃点瓜子！', 'Gel gel, biraz çekirdek al! 来来来!'], ['My son says you are good. We’ll see, hmm?', '我儿子说你很厉害。咱们瞧瞧？', 'Oğlum iyi olduğunu söyledi. Görelim bakalım?']],
      think: [['Aiya, where to go…', '哎呀，走哪儿呢……', 'Aiya, nereye oynasam…'], ['Did I tell you about my granddaughter?', '我跟你说过我孙女吗？', 'Sana torunumdan bahsettim mi?']],
      theyWin: [['Hehe, Auntie still has it!', '嘿嘿，大妈宝刀未老！', 'Hehe, teyzen hâlâ formda!'], ['Don’t be sad, eat more seeds.', '别难过，多吃点瓜子。', 'Üzülme, biraz daha çekirdek ye.']],
      youWin: [['Wah, so clever! Are you married?', '哇，真聪明！结婚了吗？', 'Vay, ne akıllısın! Evli misin?'], ['Good, good. Young people should win.', '好，好。年轻人就该赢。', 'Aferin aferin. Gençler kazanmalı.']],
      draw: [['A draw, harmony! 和气生财!', '平局，和气生财！', 'Berabere, uyum! 和气生财!']],
    },
  },
  {
    lvl: 2, from: '🇩🇪', name: ['Hans the Engineer', '工程师汉斯', 'Mühendis Hans'], title: ['Bridge engineer from Hamburg', '汉堡的桥梁工程师', 'Hamburg’dan köprü mühendisi'],
    bio: ['Works on a bridge across the Bosphorus and plays exactly one game every evening at 19:00. Keeps notes, follows systems, hates surprises.', '在博斯普鲁斯海峡修桥，每天晚上七点准时下一局。做笔记，按体系下棋，讨厌意外。', 'Boğaz’daki bir köprüde çalışıyor ve her akşam tam 19.00’da bir oyun oynuyor. Not tutar, sisteme uyar, sürprizden nefret eder.'],
    look: { skin: '#f1c9a8', hair: '#c9a46a', cloth: '#556b2f', style: 'bald', mo: true, specs: true },
    lines: {
      greet: [['Guten Abend. It is 19:00. We begin.', '晚上好。现在19点，我们开始。', 'Guten Abend. Saat 19.00. Başlıyoruz.'], ['I have prepared. I hope you have also prepared.', '我准备好了。希望你也准备好了。', 'Hazırlandım. Umarım sen de hazırlanmışsındır.']],
      think: [['Calculating load… one moment.', '计算负荷中……稍等。', 'Yük hesaplanıyor… bir dakika.'], ['This is not in my notes.', '这不在我的笔记里。', 'Bu notlarımda yok.']],
      theyWin: [['As calculated. Ordnung muss sein.', '一切如计算。秩序必须遵守。', 'Hesaplandığı gibi. Ordnung muss sein.'], ['Efficient. Very efficient.', '高效，非常高效。', 'Verimli. Çok verimli.']],
      youWin: [['Interesting. I will update my notes.', '有意思。我会更新笔记。', 'İlginç. Notlarımı güncelleyeceğim.'], ['Sehr gut. A very solid construction.', '非常好。结构非常扎实。', 'Sehr gut. Çok sağlam bir yapı.']],
      draw: [['A draw. The forces are in balance.', '平局。受力平衡。', 'Berabere. Kuvvetler dengede.']],
    },
  },
  {
    lvl: 2, from: '🇮🇹', name: ['Giuseppe', '朱塞佩', 'Giuseppe'], title: ['Pizzaiolo from Naples', '那不勒斯披萨师傅', 'Napolili pizzacı'],
    bio: ['Runs the pizza place across the street and plays between orders, flour still on his hands. Talks with both arms and takes every loss personally.', '在街对面开披萨店，在订单之间下棋，手上还沾着面粉。说话手舞足蹈，每次输棋都很当真。', 'Karşıdaki pizzacıyı işletiyor, siparişler arasında elleri hâlâ unlu oynuyor. İki koluyla konuşur, her yenilgiyi kişisel alır.'],
    look: { skin: '#e0ac82', hair: '#2a1a10', cloth: '#2f7a3d', style: 'chef', mo: true },
    lines: {
      greet: [['Ciao, amico! Quick game before the oven is hot?', '你好，朋友！烤炉热之前来一局？', 'Ciao amico! Fırın ısınmadan hızlı bir oyun?'], ['Mamma mia, look at this beautiful board!', '我的妈呀，看这漂亮的棋盘！', 'Mamma mia, şu güzel tahtaya bak!']],
      think: [['Eh, eh, eh… wait!', '诶，诶，诶……等等！', 'Eh, eh, eh… dur!'], ['Like a good dough: patience.', '像好面团一样：要耐心。', 'İyi bir hamur gibi: sabır.']],
      theyWin: [['Perfetto! Like a margherita from my oven!', '完美！就像我烤炉里的玛格丽特！', 'Perfetto! Fırınımdan çıkan margherita gibi!'], ['Bellissimo! Pizza on me tonight!', '太美了！今晚披萨我请！', 'Bellissimo! Bu akşam pizzalar benden!']],
      youWin: [['Mamma mia… you burned my pizza.', '我的妈呀……你把我的披萨烤焦了。', 'Mamma mia… pizzamı yaktın.'], ['Bravo, bravo. But next time, vendetta!', '好样的。不过下次我要报仇！', 'Bravo bravo. Ama gelecek sefer intikam!']],
      draw: [['A draw? Then we share the pizza.', '平局？那我们分享披萨。', 'Berabere mi? O zaman pizzayı paylaşırız.']],
    },
  },
  {
    lvl: 3, from: '🇨🇳', name: ['Professor Li', '李教授', 'Profesör Li'], title: ['Visiting professor of mathematics', '客座数学教授', 'Misafir matematik profesörü'],
    bio: ['On sabbatical from Peking University. Quotes an old proverb for every situation and plays slowly, as if the board were a proof.', '北大休假中。每种局面都能引一句成语，下棋很慢，仿佛在写证明。', 'Pekin Üniversitesi’nden izinli. Her duruma bir eski atasözü bulur ve sanki tahta bir ispatmış gibi yavaş oynar.'],
    look: { skin: '#e9c29b', hair: '#555555', cloth: '#2c3e50', style: 'glasses' },
    lines: {
      greet: [['A journey of a thousand miles begins with one move.', '千里之行，始于足下。', 'Bin millik yolculuk tek bir hamleyle başlar.'], ['Shall we have a quiet, thoughtful game?', '我们静静地下一盘？', 'Sakin, düşünceli bir oyun oynayalım mı?']],
      think: [['知己知彼……', '知己知彼……', 'Kendini ve rakibini bil…'], ['Let me prove this carefully.', '让我仔细证明一下。', 'Bunu dikkatle ispatlayayım.']],
      theyWin: [['Q.E.D.', '证毕。', 'Q.E.D. — ispat tamam.'], ['Haste makes waste, my young friend.', '欲速则不达，年轻的朋友。', 'Acele işe şeytan karışır, genç dostum.']],
      youWin: [['Blue comes from indigo, yet surpasses it.', '青出于蓝而胜于蓝。', 'Öğrenci ustasını geçti, tıpkı çivitten çıkan mavinin onu geçmesi gibi.'], ['Elegant. A very elegant proof.', '漂亮，非常漂亮的证明。', 'Zarif. Çok zarif bir ispat.']],
      draw: [['Balance, like yin and yang.', '平衡，如阴阳。', 'Denge, yin ve yang gibi.']],
    },
  },
  {
    lvl: 3, from: '🇷🇺', name: ['Coach Olga', '奥尔加教练', 'Antrenör Olga'], title: ['Chess coach from St Petersburg', '圣彼得堡的国际象棋教练', 'St. Petersburg’dan satranç antrenörü'],
    bio: ['Trained junior champions for thirty years. Strict, unsmiling, and secretly delighted whenever a student beats her.', '培养了三十年少年冠军。严厉、不苟言笑，但学生赢她时心里暗暗高兴。', 'Otuz yıl genç şampiyonlar yetiştirdi. Sert, gülümsemez ama bir öğrencisi onu yenince içten içe çok sevinir.'],
    look: { skin: '#f2d0b5', hair: '#e3c16f', cloth: '#7a1f2b', style: 'bun' },
    lines: {
      greet: [['Sit. No talking. Only playing.', '坐下。不许说话。只下棋。', 'Otur. Konuşmak yok. Sadece oyun.'], ['Show me what you have learned.', '让我看看你学到了什么。', 'Neler öğrendiğini göster bakalım.']],
      think: [['Nyet… no, no.', '不……不，不。', 'Nyet… hayır, hayır.'], ['Hm. Typical.', '哼。典型。', 'Hm. Tipik.']],
      theyWin: [['Again. From the beginning. Tomorrow 7 a.m.', '再来。从头开始。明天早上七点。', 'Bir daha. En baştan. Yarın sabah yedide.'], ['You lost the game on move twelve. Think about it.', '你在第十二步就输了。好好想想。', 'Oyunu on ikinci hamlede kaybettin. Düşün bunu.']],
      youWin: [['…Khorosho. Good. Very good.', '……好。很好。非常好。', '…Khorosho. İyi. Çok iyi.'], ['Finally. I knew you could do it.', '终于。我就知道你能做到。', 'Nihayet. Yapabileceğini biliyordum.']],
      draw: [['A draw is not a win. Remember this.', '和棋不是胜利。记住。', 'Beraberlik galibiyet değildir. Bunu unutma.']],
    },
  },
  {
    lvl: 4, from: '🇨🇳', name: ['Old Master Zhou', '周老', 'Usta Zhou'], title: ['Park legend from Shanghai', '上海公园里的传奇', 'Şanghay parklarının efsanesi'],
    bio: ['Played under the plane trees of Fuxing Park for sixty years. Sips green tea, says almost nothing, and ends games before you notice they have begun.', '在复兴公园的梧桐树下下了六十年棋。品着绿茶，几乎不说话，你还没察觉开局，棋就结束了。', 'Fuxing Parkı’nın çınarları altında altmış yıl oynadı. Yeşil çayını yudumlar, neredeyse hiç konuşmaz; oyunun başladığını fark etmeden bitirir.'],
    look: { skin: '#d9ab84', hair: '#f0f0f0', cloth: '#3b4a3a', style: 'beard' },
    lines: {
      greet: [['…请。', '……请。', '…Buyur.'], ['The tea is still hot. Good.', '茶还热着。好。', 'Çay hâlâ sıcak. İyi.']],
      think: [['…', '……', '…'], ['嗯。', '嗯。', 'Hmm.']],
      theyWin: [['Sixty years under the trees, young one.', '树下六十年了，年轻人。', 'Ağaçların altında altmış yıl, genç.'], ['Water drips, the stone wears away. Come again.', '水滴石穿。再来。', 'Damlaya damlaya göl olur. Yine gel.']],
      youWin: [['…Good. Very good. Have some tea.', '……好。很好。喝杯茶。', '…İyi. Çok iyi. Bir çay iç.'], ['The river’s back waves push the front ones on.', '长江后浪推前浪。', 'Arkadan gelen dalga öndekini iter. Sıra sizde.']],
      draw: [['A peaceful game. Rare.', '和局。难得。', 'Barışçıl bir oyun. Nadir görülür.']],
    },
  },
  {
    lvl: 4, from: '🇺🇸', name: ['Big Joe Jackson', '“大乔”杰克逊', 'Koca Joe Jackson'], title: ['Retired card shark from Las Vegas', '拉斯维加斯退休牌手', 'Las Vegas’tan emekli kumarbaz'],
    bio: ['Forty years at the tables on the Strip, now retired somewhere he can get good coffee. Grins, bluffs, tells long stories, and almost never loses.', '在赌城大道的牌桌上混了四十年，退休后找了个有好咖啡的地方。爱笑、爱诈唬、爱讲故事，几乎从不输。', 'Las Vegas masalarında kırk yıl geçirdi, şimdi iyi kahve bulabildiği bir yerde emekli. Sırıtır, blöf yapar, uzun hikâyeler anlatır ve neredeyse hiç kaybetmez.'],
    look: { skin: '#c88d65', hair: '#3a2a1a', cloth: '#1c1c1c', style: 'cowboy', mo: true },
    lines: {
      greet: [['Well howdy, partner. Feeling lucky?', '你好啊，伙计。觉得手气好吗？', 'Selam ortak. Şanslı hissediyor musun?'], ['Did I ever tell you about Reno, ’79?', '我给你讲过79年在里诺的事吗？', 'Sana hiç 79’da Reno’yu anlattım mı?']],
      think: [['Heh. Let’s see what you’re made of.', '嘿。看看你有几斤几两。', 'Heh. Bakalım neymişsin.'], ['Easy now, easy…', '别急，别急……', 'Yavaş, yavaş…']],
      theyWin: [['House always wins, kid.', '庄家永远赢，孩子。', 'Kasa her zaman kazanır, evlat.'], ['Don’t take it hard. I’ve beaten better. Not many, though.', '别难过。我赢过比你强的。不过不多。', 'Kafana takma. Senden iyilerini de yendim. Pek çok değil gerçi.']],
      youWin: [['Well I’ll be… You got me fair and square.', '哎呀我的天……你赢得光明正大。', 'Vay canına… Beni hakkıyla yendin.'], ['Ha! Haven’t lost like that since Atlantic City.', '哈！自从大西洋城以后就没这么输过。', 'Ha! Atlantic City’den beri böyle kaybetmemiştim.']],
      draw: [['Split pot. I can live with that.', '平分底池。我能接受。', 'Pot bölündü. Buna razıyım.']],
    },
  },
];

const tri = (x: T3, lang: Lang) => (lang === 'zh' ? x[1] : lang === 'tr' ? x[2] : x[0]);
export const castName = (who: number, lang: Lang) => tri((CAST[who] ?? CAST[0]).name, lang);
/** A regular's strength: the first five by position, the guests by their own level. */
export const levelOf = (who: number) => CAST[who]?.lvl ?? Math.min(4, who);
export const byLevel = (l: number) => CAST.map((_, i) => i).filter(i => levelOf(i) === l);
// Which regular sits at each strength, per game. Defaults to the original five.
const KEY = 'gp.rivals';
let picks: Record<string, number> = {};
try { picks = JSON.parse(localStorage.getItem(KEY) ?? '{}'); } catch { /* storage may be off */ }
export const charFor = (game: string, level: number) => { const w = picks[game + ':' + level]; return w != null && levelOf(w) === level ? w : level; };
export function setChar(game: string, who: number) { picks = { ...picks, [game + ':' + levelOf(who)]: who }; try { localStorage.setItem(KEY, JSON.stringify(picks)); } catch { /* ignore */ } }
/** The game on screen, so names without a game attached can find the right regular. */
let currentGame = '';
export const setCurrentGame = (g: string) => { currentGame = g; };
export const currentCharFor = (level: number) => (currentGame ? charFor(currentGame, level) : level);
export const castTitle = (level: number, lang: Lang) => tri(CAST[level].title, lang);
export const castBio = (level: number, lang: Lang) => tri(CAST[level].bio, lang);
export function castLine(level: number, ev: Exclude<Event, 'locked'>, lang: Lang, salt = Date.now()): string {
  const ls = CAST[level].lines[ev]; return tri(ls[Math.abs(Math.floor(salt)) % ls.length], lang);
}
/** Old saves name strengths in English; this maps them back to a regular. */
export const LEVEL_OF: Record<string, number> = { Beginner: 0, Easy: 1, Intermediate: 2, Advanced: 3, Expert: 4 };
/** The first three regulars are open from the start; each later one opens when you beat the one before. */
export const unlockedUpTo = (beaten: number | undefined) => Math.max(2, (beaten ?? -1) + 1);
