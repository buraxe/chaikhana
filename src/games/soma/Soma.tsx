import { FIGURES } from './rules';
import Poly from './Poly';

export default function Soma() {
  return <Poly game="soma" store="gp.soma" figures={FIGURES} label={['Figure', '图形', 'Figür']} />;
}
