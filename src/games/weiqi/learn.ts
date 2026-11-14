import type { Lesson } from '../../core/learn';
export const lesson: Lesson = {
  names: { en: 'Go (Weiqi)', tr: 'Go (Weiqi)', zh: '围棋', trad: '圍棋', pinyin: 'wéiqí' },
  en: {
    summary: 'The ancient game of surrounding: black and white stones take turns to claim territory.',
    history: 'Weiqi, “the surrounding game”, is over 2,500 years old and counted among the four arts of the Chinese scholar with music, calligraphy and painting. It travelled to Korea as baduk and to Japan as igo, from which the name Go comes. Its simple rules hide such depth that computers beat the best humans only in 2016.',
    rules: [
      'Black plays first. Players place one stone at a time on an empty intersection; stones never move.',
      'A group of connected stones is captured and removed when it has no empty point next to it (no liberties).',
      'You may not place a stone with no liberties unless it captures (no suicide).',
      'Ko: you may not immediately retake a single stone in a way that repeats the position.',
      'You may pass. Two passes in a row end the game.',
      'Area scoring: your stones on the board plus the empty points only you surround. White gets 6.5 points of komi for moving second. Stones that cannot avoid capture are removed before counting.',
    ],
    basics: ['Corners first, then sides, then the centre: territory is cheapest in the corners.', 'Keep your stones connected, and cut your opponent’s apart.', 'A group needs two separate eyes to live for ever.'],
    advanced: ['A stone with one liberty is in atari: escape, or make it cost your opponent something.', 'Ladders and nets: learn to see whether a chased stone can run.'],
    mistakes: ['Playing too close to strong enemy groups.', 'Saving every stone: sometimes giving up a few stones gains more elsewhere.'],
  },
  zh: {
    summary: '古老的围地游戏：黑白双方轮流落子，争夺地盘。',
    history: '围棋已有两千五百多年历史，与琴、书、画并称文人四艺。它传入朝鲜称“바둑”，传入日本称“囲碁”，西方的Go即由此而来。规则简单却深不可测，直到2016年电脑才战胜顶尖人类棋手。',
    rules: ['黑先。双方轮流在空交叉点上放一枚棋子，棋子落下后不再移动。', '相连的一块棋没有气（相邻空点）时被提走。', '不能下在没有气的地方，除非能提掉对方的子（禁止自杀）。', '劫：不能立即提回一子而使局面重复。', '可以停一手。连续两次停一手对局结束。', '数子法：盘上己方棋子加上只被己方围住的空点。白方后手贴6.5目。数子前提走无法逃脱的死子。'],
    basics: ['金角银边草肚皮：先占角，再占边，最后中腹。', '保持自己的棋子相连，分断对方的棋子。', '一块棋要有两个真眼才能永远活着。'],
    advanced: ['只剩一口气就是被打吃：要么逃，要么让对方付出代价。', '征子和枷：学会判断被追的子能否逃出。'],
    mistakes: ['离对方厚势太近。', '每个子都想救：有时弃掉几子能在别处得到更多。'],
  },
  tr: {
    summary: 'Eski kuşatma oyunu: siyah ve beyaz taşlar sırayla toprak kapar.',
    history: 'Weiqi, yani “kuşatma oyunu”, 2.500 yıldan eskidir ve müzik, hat ve resimle birlikte Çinli bilginin dört sanatından sayılır. Kore’ye baduk, Japonya’ya igo adıyla geçti; Batı’daki Go adı buradan gelir. Basit kurallarının ardındaki derinlik öyle büyüktür ki bilgisayarlar en iyi insanları ancak 2016’da yenebildi.',
    rules: ['Siyah başlar. Oyuncular sırayla boş bir kesişime bir taş koyar; taşlar bir daha yer değiştirmez.', 'Birbirine bağlı taşlardan oluşan bir grubun yanında hiç boş nokta (nefes) kalmazsa alınır ve tahtadan kaldırılır.', 'Rakip taşı almıyorsa nefessiz bir noktaya taş konamaz (intihar yasak).', 'Ko: tek bir taşı, pozisyonu tekrar edecek şekilde hemen geri alamazsın.', 'Pas geçebilirsin. Arka arkaya iki pas oyunu bitirir.', 'Alan sayımı: tahtadaki taşların artı yalnızca senin çevrelediğin boş noktalar. Beyaz ikinci oynadığı için 6,5 puan komi alır. Kurtulamayacak taşlar saymadan önce kaldırılır.'],
    basics: ['Önce köşeler, sonra kenarlar, en son merkez: toprak en ucuz köşelerdedir.', 'Taşlarını bağlı tut, rakibinkileri kes.', 'Bir grubun sonsuza dek yaşaması için iki ayrı gözü olmalı.'],
    advanced: ['Tek nefesi kalan taş ataridedir: kaç ya da rakibe pahalıya patlat.', 'Merdiven ve ağ: kovalanan taşın kaçıp kaçamayacağını görmeyi öğren.'],
    mistakes: ['Güçlü rakip gruplarına fazla yakın oynamak.', 'Her taşı kurtarmaya çalışmak: bazen birkaç taştan vazgeçmek başka yerde daha çok kazandırır.'],
  },
};
