import { STANDARD } from './geometry';
import { SILHOUETTES } from './silhouettes';
import { Dissection, type DissectionSet } from './Dissection';

const SET: DissectionSet = {
  game: 'tangram', storeKey: 'gp.tangram', prefix: 'tg', standard: STANDARD, silhouettes: SILHOUETTES,
  view: {
    wide: { w: 23, h: 12, target: [6, 6], tray: [[14, 3], [19.2, 3], [13.6, 7.4], [17, 6.6], [20.6, 6.4], [15.2, 10.3], [19.6, 10.2]] },
    tall: { w: 12, h: 23, target: [6, 6.2], tray: [[3, 14], [8.4, 14], [2.4, 18.4], [6, 17.8], [9.6, 17.6], [3.6, 21.4], [8.6, 21.4]] },
  },
  scramble: [0, 2, 4, 6, 1, 3, 5].map((_, k) => [0, 2, 4, 6, 1, 3, 5][(k * 3) % 7]),
  pieceNames: [['Large triangle', '大三角形', 'Büyük üçgen'], ['Large triangle', '大三角形', 'Büyük üçgen'], ['Medium triangle', '中三角形', 'Orta üçgen'], ['Small triangle', '小三角形', 'Küçük üçgen'], ['Small triangle', '小三角形', 'Küçük üçgen'], ['Square', '正方形', 'Kare'], ['Parallelogram', '平行四边形', 'Paralelkenar']],
  tableLabel: ['Tangram table.', '七巧板桌面。', 'Tangram masası.'],
  help: ['Drag to move. Tap a piece to turn it 45°. Flip mirrors the selected piece, which matters for the parallelogram. Corners snap together when close.', '拖动来移动，点击板块旋转45°。“翻转”可以镜像选中的板块，平行四边形会用到。角靠近时会自动对齐。', 'Taşımak için sürükle. Bir parçayı 45° döndürmek için ona dokun. Çevir seçili parçanın aynasını alır; bu paralelkenar için önemlidir. Köşeler yaklaşınca birbirine oturur.'],
};

export default function Tangram() { return <Dissection set={SET} />; }
