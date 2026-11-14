import Poly from '../seven-cube/Poly';
import type { Figure } from '../seven-cube/rules';
import SETS from './sets.json';

export default function Packing() {
  return <Poly game="packing-3d" store="gp.packing" figures={SETS as Figure[]} label={['Box', '盒子', 'Kutu']}
    intro={['The first box is the Slothouber–Graatsma puzzle: six flat slabs and three single cubes; the singles must end up on one long diagonal.', '第一个盒子是Slothouber–Graatsma谜题：六块2×2板和三个单块；三个单块最后必定落在同一条长对角线上。', 'İlk kutu Slothouber–Graatsma bulmacası: altı levha ve üç tek küp; tek küpler sonunda aynı uzun köşegene düşer.']} />;
}
