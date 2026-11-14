import { useEffect, useRef, useState } from 'react';
import { sfx } from '../../core/sound';
import type { TrickState } from './trick';

/**
 * Shared timing for the four-seat games: shows a finished trick for a moment before it is
 * cleared, and runs a computer seat's move after a short pause.
 */
export function useTrickFlash(st: TrickState | null) {
  const [flash, setFlash] = useState(false);
  const n = st ? st.order.length : 0, prev = useRef(n);
  useEffect(() => {
    if (n > prev.current && st?.last) { setFlash(true); const id = setTimeout(() => setFlash(false), 1000); prev.current = n; return () => clearTimeout(id); }
    prev.current = n;
  }, [n]); // eslint-disable-line
  const shown = st ? (st.table.length ? st.table : flash && st.last ? st.last : []) : [];
  return { flash, shown };
}
export function useComputer(when: boolean, run: () => void, delay = 700, deps: unknown[] = []) {
  useEffect(() => {
    if (!when) return;
    const id = setTimeout(run, delay);
    return () => clearTimeout(id);
  }, [when, ...deps]); // eslint-disable-line
}
export const playSound = () => sfx('card');
