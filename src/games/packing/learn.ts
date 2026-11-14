import type { Lesson } from '../../core/learn';
export const lesson: Lesson = {
  names: { en: '3D Packing Puzzles', zh: '3D装箱谜题', tr: '3B Yerleştirme Bulmacaları', pinyin: '3D zhuāngxiāng mítí', trad: '3D裝箱謎題' },
  en: {
    summary: 'Fit every piece into a box with no gaps. The first box is a famous puzzle by two Dutch mathematicians; the others were cut by computer so that only a few arrangements work.',
    history: 'Packing problems are as old as trade, but as puzzles they flourished in the twentieth century. In the 1970s Jan Slothouber and William Graatsma designed the cube of six 1×2×2 slabs and three single cubes; John Conway followed with a harder 5×5×5 version. Packing puzzles also have a serious side: the same questions decide how goods fit into containers and how computer memory is laid out.',
    rules: ['Choose a box. Pick a piece from the tray, move and turn it, and place it inside the box.', 'Pieces may not overlap or stick out.', 'Fill the whole box with all the pieces. Tap a placed piece to pick it up again.', 'Each box can be filled; the hint places a piece from a working arrangement.'],
    basics: ['Big and awkward pieces first; small ones fill the last holes.', 'Count: a gap of one cube in a corner can only take a piece with a lone cube at its end.', 'In the Slothouber–Graatsma cube, the three single cubes always end up on one long diagonal of the box.'],
    advanced: ['Colour the box like a 3D chessboard: some pieces always cover more of one colour, so the totals must balance.', 'If two pieces both need the same corner, one of them is in the wrong place already.'],
    mistakes: ['Leaving a tunnel one cube wide that no piece can reach.', 'Placing the flat pieces first in a box that needs them standing up.'],
  },
  zh: {
    summary: '把所有拼块无缝地装进一个盒子。第一个盒子是两位荷兰数学家设计的名题；其余的由电脑切分，只有少数几种摆法能成功。',
    history: '装箱问题和贸易一样古老，但作为益智游戏，它在20世纪才兴盛起来。70年代，扬·斯洛特豪伯和威廉·格拉茨马设计了由六块1×2×2板和三个单块组成的立方体；约翰·康威随后推出了更难的5×5×5版本。装箱谜题也有严肃的一面：同样的问题决定着货物如何装进集装箱、计算机内存如何排布。',
    rules: ['选一个盒子。从托盘里选一块，移动、旋转，然后放进盒子里。', '拼块不能重叠，也不能伸出盒子。', '用全部拼块填满盒子。点已放好的块可以重新拿起来。', '每个盒子都能装满；提示会按一种可行的摆法放下一块。'],
    basics: ['先放大的、难放的块；小块最后填洞。', '数一数：角落里只剩一格的空位，只能放一端伸出一个小块的拼块。', '在Slothouber–Graatsma立方中，三个单块最后总是落在盒子的同一条长对角线上。'],
    advanced: ['把盒子像三维棋盘一样涂色：有些拼块总是盖住更多某一种颜色，所以总数必须平衡。', '如果两块都需要同一个角，其中一块已经放错了。'],
    mistakes: ['留下一条一格宽、任何拼块都够不着的通道。', '在需要竖放扁块的盒子里先把扁块平放。'],
  },
  tr: {
    summary: 'Bütün parçaları bir kutuya boşluk bırakmadan sığdır. İlk kutu iki Hollandalı matematikçinin ünlü bulmacası; diğerlerini bilgisayar, yalnızca birkaç dizilişin işe yarayacağı şekilde kesti.',
    history: 'Yerleştirme problemleri ticaret kadar eskidir ama bulmaca olarak 20. yüzyılda gelişti. 1970’lerde Jan Slothouber ve William Graatsma altı 1×2×2 levha ve üç tek küpten oluşan küpü tasarladı; John Conway daha zor bir 5×5×5 sürümle devam etti. Yerleştirme bulmacalarının ciddi bir yanı da vardır: aynı sorular malların konteynerlere nasıl sığacağına ve bilgisayar belleğinin nasıl düzenleneceğine karar verir.',
    rules: ['Bir kutu seç. Tepsiden bir parça al, hareket ettir, döndür ve kutunun içine yerleştir.', 'Parçalar çakışamaz ve dışarı taşamaz.', 'Kutuyu bütün parçalarla tamamen doldur. Yerleşmiş parçaya dokununca geri alırsın.', 'Her kutu doldurulabilir; ipucu işe yarayan bir dizilişten bir parça yerleştirir.'],
    basics: ['Önce büyük ve zor parçalar; küçükler son boşlukları doldurur.', 'Say: köşede tek küplük bir boşluğa ancak ucunda tek bir küp çıkıntısı olan parça girer.', 'Slothouber–Graatsma küpünde üç tek küp her zaman kutunun aynı uzun köşegenine düşer.'],
    advanced: ['Kutuyu üç boyutlu satranç tahtası gibi boya: bazı parçalar hep bir renkten daha fazla kaplar, toplamlar denk gelmeli.', 'İki parça da aynı köşeye ihtiyaç duyuyorsa biri zaten yanlış yerde.'],
    mistakes: ['Hiçbir parçanın ulaşamayacağı bir küp genişliğinde tünel bırakmak.', 'Dik durması gereken yassı parçaları önce yatırarak yerleştirmek.'],
  },
};
