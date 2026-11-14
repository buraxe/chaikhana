import { validate, type GameDef } from './engine';

/**
 * Games travel as a short code: the definition's JSON, compressed and written in URL-safe
 * letters. The code works on its own (paste it in) or at the end of a link.
 */
export const SHARE_PREFIX = 'workshop-g-';
/** Where shared links point when the page itself cannot carry a long link (the hosted site). */
export const PUBLIC_SITE = 'https://buraxe.github.io/chaikhana/';

const toB64 = (bytes: Uint8Array) => {
  let s = '';
  for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
};
const fromB64 = (s: string) => {
  const b = atob(s.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((s.length + 3) % 4));
  return Uint8Array.from(b, ch => ch.charCodeAt(0));
};
async function pipe(data: Uint8Array, stream: CompressionStream | DecompressionStream): Promise<Uint8Array> {
  const out = new Response(new Blob([data as BlobPart]).stream().pipeThrough(stream));
  return new Uint8Array(await out.arrayBuffer());
}

export async function encodeGame(def: GameDef): Promise<string> {
  const bytes = new TextEncoder().encode(JSON.stringify(def));
  return toB64(await pipe(bytes, new CompressionStream('deflate-raw')));
}

/** Reads a code, or a whole link containing one. Throws with a readable message if it is not a game. */
export async function decodeGame(text: string): Promise<GameDef> {
  const m = text.trim().match(new RegExp(`${SHARE_PREFIX}([A-Za-z0-9_-]+)`)), code = m ? m[1] : text.trim();
  if (!/^[A-Za-z0-9_-]{8,}$/.test(code)) throw new Error('not a game code');
  let parsed: unknown;
  try { parsed = JSON.parse(new TextDecoder().decode(await pipe(fromB64(code), new DecompressionStream('deflate-raw')))); }
  catch { throw new Error('the code is damaged or incomplete'); }
  const problems = validate(parsed);
  if (problems.length) throw new Error(problems[0]);
  return parsed as GameDef;
}

export function shareLink(code: string): string {
  const here = typeof location !== 'undefined' && /github\.io$|localhost$/.test(location.hostname) ? location.origin + location.pathname : PUBLIC_SITE;
  return `${here}#${SHARE_PREFIX}${code}`;
}
