import LockGame from '../luban/LockGame';
import type { Lock } from '../luban/rules';
import LOCKS from './locks.json';

/** Burrs: harder six-piece locks in pale maple and cherry. */
export default function Burr() {
  return <LockGame game="burr" store="gp.burr" locks={LOCKS as Lock[]} mode="apart" wood={[0xe8cfa0, 0xb5623e, 0xd8b98a, 0x8c3f2a, 0xf0dcb4, 0x6e3424]} bench="radial-gradient(circle at 50% 40%, #eef0ea, #c9cfc4)" />;
}
