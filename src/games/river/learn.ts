import type { Lesson } from '../../core/learn';
export const lesson: Lesson = {
  names: { en: 'River Crossing', zh: '过河问题', tr: 'Nehirden Geçiş', pinyin: 'Guò hé wèntí', trad: '過河問題' },
  en: {
    summary: 'Get everyone across in a boat that holds too few, without leaving the wrong pair alone on a bank. Four classics: the wolf, goat and cabbage, monks and demons, and two night-bridge puzzles against the clock.',
    history: 'River-crossing riddles are among the oldest logic puzzles in writing: the wolf, goat and cabbage and the jealous husbands appear in Propositiones ad acuendos iuvenes, a collection attributed to Alcuin of York around 800. Versions are told across Africa, Europe and Asia; in China the farmer crossing the river is a schoolbook favourite. The torch-and-bridge puzzle is modern, from the twentieth century, and became famous as an interview question.',
    culture: 'The monks-and-demons version echoes Journey to the West, where the monk Tang Sanzang and his companions keep meeting demons on the road; the Western telling has missionaries and cannibals.',
    rules: ['Pick who boards the boat (or carries the torch) on the side where it is, then cross.', 'The boat holds at most the number shown, and someone able to row must be aboard.', 'Wolf, goat and cabbage: the farmer rows. Without him, the wolf eats the goat, and the goat eats the cabbage.', 'Monks and demons: on either bank, demons may never outnumber monks while monks are there.', 'Bridges: two walk together at the slower one’s pace, and the torch must come back each time; finish within the time limit.'],
    basics: ['Coming back is a move too: sometimes the trick is to bring someone back.', 'In the farmer’s riddle, the goat is the trouble-maker: it goes first, and it comes back once.', 'On the bridge, let the two fastest do the running back and forth.'],
    advanced: ['Bridge: send the two slowest across together so their times count only once, with a fast walker waiting on the far side to bring the torch back.', 'Think in positions, not moves: list which banks are safe and look for a route between them, as the hint does.'],
    mistakes: ['Leaving the goat with the cabbage while the farmer takes the wolf.', 'Having the slowest walker carry the torch back.'],
  },
  zh: {
    summary: '船太小，人太多，还不能把不该放在一起的留在岸上。四个经典谜题：农夫过河、和尚与妖怪，以及两道和时间赛跑的夜过桥问题。',
    history: '过河谜题是最古老的书面逻辑谜题之一：狼、羊、白菜和“嫉妒的丈夫”都出现在约公元800年的《砥砺青年之题》中，相传出自约克的阿尔昆。非洲、欧洲和亚洲都流传着各种版本；在中国，农夫过河是课本里的常客。手电筒过桥是20世纪的新题，后来作为面试题而出名。',
    culture: '和尚与妖怪的版本让人想起《西游记》：唐僧师徒一路上不断遇到妖怪；西方的版本则是传教士与野人。',
    rules: ['在船（或手电筒）所在的一岸选人上去，然后过河。', '船上最多坐显示的人数，而且必须有会划船的人。', '农夫过河：只有农夫会划船。农夫不在时，狼吃羊，羊吃白菜。', '和尚与妖怪：任何一岸只要有和尚，妖怪就不能比和尚多。', '过桥：两人同行按慢的人计时，每次都得有人把手电筒送回；要在限时内完成。'],
    basics: ['回程也是一步：有时诀窍就是把谁带回来。', '农夫过河中，羊是麻烦制造者：它第一个过去，中途还要回来一次。', '过桥时，让最快的两个人负责来回跑。'],
    advanced: ['过桥：让最慢的两个人一起过，这样他们的时间只算一次，同时让一个快的人在对岸等着把手电筒送回。', '按局面而不是按步骤思考：列出哪些两岸状态是安全的，再找出它们之间的路线，提示就是这样做的。'],
    mistakes: ['农夫带狼过河，却把羊和白菜留在一起。', '让最慢的人把手电筒送回来。'],
  },
  tr: {
    summary: 'Herkesi az kişi alan bir kayıkla karşıya geçir, yanlış ikiliyi bir kıyıda yalnız bırakmadan. Dört klasik: kurt, keçi ve lahana; keşişler ve cinler; ve saate karşı iki gece köprüsü bilmecesi.',
    history: 'Nehirden geçiş bilmeceleri yazıya geçmiş en eski mantık bulmacalarındandır: kurt, keçi ve lahana ile kıskanç kocalar, 800 civarında York’lu Alcuin’e atfedilen Propositiones ad acuendos iuvenes derlemesinde geçer. Afrika’dan Avrupa’ya ve Asya’ya kadar farklı biçimleri anlatılır; Çin’de nehri geçen çiftçi ders kitaplarının gözdesidir. Fener ve köprü bilmecesi ise 20. yüzyıldan, yenidir ve iş görüşmesi sorusu olarak ünlendi.',
    culture: 'Keşişler ve cinler sürümü, keşiş Tang Sanzang ve yol arkadaşlarının yolda sürekli cinlerle karşılaştığı Batı’ya Yolculuk’u hatırlatır; Batı’daki anlatımda misyonerler ve yamyamlar vardır.',
    rules: ['Kayık (ya da fener) hangi kıyıdaysa oradan bineceklerini seç, sonra geç.', 'Kayık en fazla gösterilen sayıda kişi alır ve içinde kürek çekebilen biri olmalıdır.', 'Kurt, keçi ve lahana: kürek çeken çiftçidir. O yokken kurt keçiyi, keçi lahanayı yer.', 'Keşişler ve cinler: bir kıyıda keşiş varken cinler asla onlardan fazla olamaz.', 'Köprüler: iki kişi yavaş olanın hızında birlikte yürür ve fener her seferinde geri gelmelidir; süre içinde bitir.'],
    basics: ['Geri dönmek de bir hamledir: bazen işin sırrı birini geri getirmektir.', 'Çiftçinin bilmecesinde baş belası keçidir: ilk o gider ve bir kez geri gelir.', 'Köprüde gidip gelme işini en hızlı ikisine bırak.'],
    advanced: ['Köprü: en yavaş ikisini birlikte gönder ki süreleri bir kez sayılsın; karşıda feneri geri getirecek hızlı biri beklesin.', 'Hamlelerle değil durumlarla düşün: hangi kıyı durumlarının güvenli olduğunu listele ve aralarında bir yol ara; ipucu da böyle çalışır.'],
    mistakes: ['Çiftçi kurdu götürürken keçiyi lahanayla bırakmak.', 'Feneri en yavaş yürüyene geri getirtmek.'],
  },
};
