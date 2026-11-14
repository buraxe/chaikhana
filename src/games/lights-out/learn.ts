import type { Lesson } from '../../core/learn';
export const lesson: Lesson = {
  names: { en: 'Lights Out', tr: 'Işıkları Söndür', zh: '关灯游戏', pinyin: 'guāndēng yóuxì' },
  en: {
    summary: 'Switch every light off. Each press toggles a light and its four neighbours.',
    history: 'Tiger Electronics released Lights Out as a handheld game in 1995, with a 5×5 grid of lit buttons. The puzzle became a favourite example in linear algebra: each position is a system of equations in arithmetic mod 2.',
    rules: ['Pressing a light switches it, and the lights directly above, below, left and right of it.', 'The puzzle is solved when every light is off.', 'Every puzzle here is made by pressing random lights on a dark board, so it can always be solved.'],
    basics: [
      'The order of presses does not matter, and pressing the same light twice cancels out. A solution is a set of lights to press once each.',
      'Chase the lights: work row by row from the top, and for every lit light, press the one directly below it. Only the bottom row stays lit.',
    ],
    advanced: [
      'On 5×5, the pattern left on the bottom row after chasing tells you which top-row lights to press before chasing again.',
      'Only one random 5×5 pattern in four can be solved, and every solvable one has exactly four solutions. The counter shows the shortest.',
      'Gaussian elimination over GF(2) solves any size directly. That is what the hint button uses.',
    ],
    mistakes: ['Pressing at random. Every press changes up to five lights, so random play wanders.'],
  },
  zh: {
    summary: '把所有灯都关掉。每按一盏灯，它和上下左右四盏灯都会切换开关。',
    history: '1995年，老虎电子推出了掌上游戏 Lights Out，上面是5×5的发光按钮。这个谜题后来成为线性代数的经典例子：每个局面都对应一个模2运算的方程组。',
    rules: ['按下一盏灯，它本身以及正上、正下、左、右的灯都会切换。', '所有灯都熄灭即完成。', '这里的每道题都是在全黑的棋盘上随机按灯生成的，所以一定有解。'],
    basics: [
      '按灯的顺序不影响结果，同一盏灯按两次等于没按。所以解法就是一组各按一次的灯。',
      '逐行追灯：从最上面一行开始，每看到一盏亮灯，就按它正下方的那盏。最后只有底行可能还亮着。',
    ],
    advanced: [
      '在5×5上，追灯后底行剩下的图案，决定了重新追灯前顶行该按哪几盏。',
      '随机的5×5图案只有四分之一有解，而每个有解的图案恰好有四种解法。计数器显示的是最短的那种。',
      '在 GF(2) 上做高斯消元，可以直接解出任意尺寸。提示按钮用的就是这个方法。',
    ],
    mistakes: ['乱按。每一次按灯最多会改变五盏灯，乱按只会越来越乱。'],
  },
  tr: {
    summary: 'Bütün ışıkları söndür. Her basış bir ışığı ve dört komşusunu değiştirir.',
    history: 'Tiger Electronics, Lights Out’u 1995’te 5×5 ışıklı düğmeli bir el oyunu olarak çıkardı. Bulmaca doğrusal cebirin sevilen bir örneği oldu: her durum, mod 2 aritmetiğinde bir denklem sistemidir.',
    rules: ['Bir ışığa basmak onu ve hemen üstündeki, altındaki, solundaki ve sağındaki ışıkları değiştirir.', 'Bütün ışıklar sönünce bulmaca çözülür.', 'Buradaki her bulmaca karanlık bir tahtada rastgele ışıklara basılarak yapılır, yani her zaman çözülebilir.'],
    basics: [
      'Basışların sırası önemli değildir; aynı ışığa iki kez basmak birbirini götürür. Bir çözüm, her birine bir kez basılacak ışıklar kümesidir.',
      'Işıkları kovala: yukarıdan aşağı satır satır ilerle ve yanan her ışığın hemen altındakine bas. Yalnızca en alt satır yanık kalır.',
    ],
    advanced: [
      '5×5’te kovalamadan sonra alt satırda kalan desen, yeniden kovalamadan önce üst satırda hangi ışıklara basacağını söyler.',
      'Rastgele 5×5 desenlerinin yalnızca dörtte biri çözülebilir ve çözülebilen her desenin tam dört çözümü vardır. Sayaç en kısasını gösterir.',
      'GF(2) üzerinde Gauss eliminasyonu her boyutu doğrudan çözer. İpucu düğmesi bunu kullanır.',
    ],
    mistakes: ['Rastgele basmak. Her basış beş ışığa kadar değiştirdiği için rastgele oyun bir yere varmaz.'],
  },
};
