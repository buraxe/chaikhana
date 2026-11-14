import { useEffect, useState } from 'react';

/** True on narrow screens (a phone held upright), so boards can turn to use the height. */
export function useNarrow(maxWidth = 560): boolean {
  const q = `(max-width: ${maxWidth}px)`;
  const [narrow, setNarrow] = useState(() => typeof matchMedia !== 'undefined' && matchMedia(q).matches);
  useEffect(() => {
    const mq = matchMedia(q), on = () => setNarrow(mq.matches);
    mq.addEventListener('change', on); on();
    return () => mq.removeEventListener('change', on);
  }, [q]);
  return narrow;
}
