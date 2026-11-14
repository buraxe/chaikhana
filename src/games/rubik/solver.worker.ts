/// <reference lib="webworker" />
// Kociemba two-phase solver (cubejs, MIT licence). Building its tables takes a few seconds,
// so it runs off the main thread and is built once per page.
import Cube from 'cubejs';

let ready = false;
const init = () => { if (!ready) { (Cube as unknown as { initSolver: () => void }).initSolver(); ready = true; } };
self.onmessage = (e: MessageEvent<{ id: number; type: 'init' | 'solve'; facelets?: string }>) => {
  const { id, type, facelets } = e.data;
  try {
    init();
    if (type === 'init') { (self as unknown as Worker).postMessage({ id, type: 'ready' }); return; }
    const cube = (Cube as unknown as { fromString: (s: string) => { solve: () => string } }).fromString(facelets!);
    (self as unknown as Worker).postMessage({ id, type: 'solution', moves: cube.solve() });
  } catch (err) {
    (self as unknown as Worker).postMessage({ id, type: 'error', message: String(err) });
  }
};
