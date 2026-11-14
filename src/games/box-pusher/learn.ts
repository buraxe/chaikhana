import type { Lesson } from '../../core/learn';
export const lesson: Lesson = {
  names: { en: 'Box Pusher', zh: '推箱子', tr: 'Kutu İtme' },
  en: {
    summary: 'A warehouse keeper pushes boxes onto their places, one careful push at a time.',
    history: 'Sokoban (“warehouse keeper” in Japanese) was created by Hiroyuki Imabayashi and published by Thinking Rabbit in 1982. Its rules fit in one sentence, yet levels can be fiendishly hard, and it has become a standard test problem for computer planning programs.',
    rules: ['Move the keeper up, down, left or right through the warehouse.', 'Walk into a box to push it one square, if the square beyond is free.', 'You can never pull a box, and you cannot push two boxes at once.', 'The level is solved when every box stands on a target.'],
    basics: ['A box pushed into a corner that is not a target can never be moved again.', 'A box against a wall can only slide along that wall.', 'Plan which box goes to which target before you start pushing.'],
    advanced: ['Leave room to get behind a box: think about where you will stand for the next push.', 'Two boxes side by side against a wall are stuck for good.'],
    mistakes: ['Pushing a box into a corner.', 'Filling the targets nearest the door first and blocking the way to the others.'],
  },
  zh: {
    summary: '仓库管理员把箱子一个个推到指定位置，每一步都要小心。',
    history: '推箱子（日语“仓库番”）由今林宏行设计，1982年由Thinking Rabbit发行。规则一句话就能说完，关卡却可能难得要命，它还成了计算机规划算法的标准测试题。',
    rules: ['控制管理员在仓库里上下左右移动。', '走向箱子就能把它推动一格，前提是前方是空地。', '不能拉箱子，也不能同时推两个箱子。', '所有箱子都在目标点上时过关。'],
    basics: ['箱子推进不是目标点的墙角就再也动不了。', '贴墙的箱子只能沿着这面墙移动。', '开推之前先想好哪个箱子去哪个目标。'],
    advanced: ['给自己留出绕到箱子后面的空间：想好下一推站在哪里。', '贴着墙并排的两个箱子永远卡死。'],
    mistakes: ['把箱子推进墙角。', '先填门口附近的目标，结果挡住去别的目标的路。'],
  },
  tr: {
    summary: 'Bir depo bekçisi kutuları tek tek, dikkatle iterek yerlerine yerleştirir.',
    history: 'Sokoban (Japonca “depo bekçisi”) Hiroyuki Imabayashi tarafından tasarlandı ve 1982’de Thinking Rabbit tarafından yayımlandı. Kuralları tek cümleye sığar ama bölümleri çok zor olabilir; bilgisayar planlama programları için standart bir test problemi hâline geldi.',
    rules: ['Bekçiyi depoda yukarı, aşağı, sola ya da sağa yürüt.', 'Bir kutuya doğru yürürsen, ötesindeki kare boşsa kutuyu bir kare itersin.', 'Kutu asla çekilemez ve aynı anda iki kutu itilemez.', 'Bütün kutular hedeflerin üstündeyse bölüm biter.'],
    basics: ['Hedef olmayan bir köşeye itilen kutu bir daha hiç oynatılamaz.', 'Duvara dayanan kutu yalnızca o duvar boyunca kayabilir.', 'İtmeye başlamadan önce hangi kutunun hangi hedefe gideceğini planla.'],
    advanced: ['Kutunun arkasına geçebileceğin yer bırak: bir sonraki itiş için nerede duracağını düşün.', 'Duvar dibinde yan yana iki kutu sonsuza kadar sıkışır.'],
    mistakes: ['Bir kutuyu köşeye itmek.', 'Önce kapıya yakın hedefleri doldurup diğerlerinin yolunu kapatmak.'],
  },
};
