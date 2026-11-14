import LockGame from '../luban/LockGame';
import LOCKS from '../luban/locks.json';
import type { Lock } from '../luban/rules';

/** The Kongming lock: the same sticks, built up from scattered pieces. The gentler locks only. */
const BUILD = (LOCKS as Lock[]).filter(l => l.level <= 4);
export default function Kongming() {
  return <LockGame game="kongming" store="gp.kongming" locks={BUILD} mode="together" wood={[0x9c4a2f, 0xb8653d, 0x7a3a24, 0xc98a5a, 0x8f5a3a, 0xa8573a]} bench="radial-gradient(circle at 50% 40%, #f1e4d4, #cfae8e)" />;
}
