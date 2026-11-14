import Poly from '../soma/Poly';
import type { Figure } from '../soma/rules';
import SETS from './sets.json';

export default function Assembly() {
  return <Poly game="assembly-3d" store="gp.assembly" figures={SETS as Figure[]} label={['Figure', '图形', 'Figür']} />;
}
