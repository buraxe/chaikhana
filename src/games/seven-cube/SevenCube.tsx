import { FIGURES } from './rules';
import Poly from './Poly';

export default function Soma() {
  return <Poly game="seven-cube" store="gp.soma" figures={FIGURES} label={['Figure', '图形', 'Figür']} />;
}
