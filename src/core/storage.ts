// Browser storage can be missing or throw; every access is guarded.
export function loadJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw == null ? fallback : (JSON.parse(raw) as T);
  } catch { return fallback; }
}
export function saveJSON(key: string, value: unknown): void {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* play on without saving */ }
}
export function removeKey(key: string): void {
  try { localStorage.removeItem(key); } catch { /* ignore */ }
}
