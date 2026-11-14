import LockGame from './LockGame';
import LOCKS from './locks.json';
import type { Lock } from './rules';

export default function Luban() {
  return <LockGame game="luban" store="gp.luban" locks={LOCKS as Lock[]} mode="apart" />;
}
