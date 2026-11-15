import { Dissection, type DissectionSet } from '../tangram/Dissection';
import { STANDARD_T, T_SILHOUETTES } from './pieces';

const SET: DissectionSet = {
  game: 't-puzzle', storeKey: 'gp.tpuzzle', prefix: 'tp', standard: STANDARD_T, silhouettes: T_SILHOUETTES,
  view: {
    wide: { w: 23, h: 12, target: [6, 6], tray: [[14.5, 3], [20, 3], [15, 8.6], [20, 8.4]] },
    tall: { w: 12, h: 23, target: [6, 6.2], tray: [[3, 14.5], [8.6, 14.5], [3.4, 19.8], [8.6, 19.6]] },
  },
  scramble: [2, 5, 3, 6],
  pieceNames: [['Trapezoid', '梯形', 'Yamuk'], ['Square', '正方形', 'Kare'], ['Notched piece', '缺角块', 'Çentikli parça'], ['Slanted bar', '斜边长条', 'Eğik çubuk']],
  tableLabel: ['T-puzzle table.', 'T字谜桌面。', 'T bulmacası masası.'],
  help: ['Four pieces, many shapes. Drag to move, tap a piece to turn it 45°, Flip mirrors it. The notched piece is the troublemaker: its notch is rarely where you first think. Corners snap together when close.', '四块板，拼出许多形状。拖动来移动，点击板块旋转45°，“翻转”可镜像。缺角块最难放：缺口很少在你第一眼以为的地方。角靠近时会自动对齐。', 'Dört parça, pek çok şekil. Taşımak için sürükle, 45° döndürmek için parçaya dokun, Çevir aynasını alır. Asıl baş belası çentikli parçadır: çentiği nadiren ilk düşündüğün yere gelir. Köşeler yaklaşınca birbirine oturur.'],
};

export default function TPuzzle() { return <Dissection set={SET} />; }
