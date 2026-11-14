import Poly from '../seven-cube/Poly';
import type { Figure } from '../seven-cube/rules';
import SETS from './sets.json';

export default function Assembly() {
  return <Poly game="assembly-3d" store="gp.assembly" figures={SETS as Figure[]} label={['Figure', '图形', 'Figür']} />;
}
