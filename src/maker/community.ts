import { loadJSON, saveJSON } from '../core/storage';
import { validate, type GameDef } from './engine';

/**
 * "From you": games players publish from the Workshop.
 *
 * Everything goes through a CommunityBackend. The built-in one keeps published games on this
 * device only, so the page works before any server exists. A real server is plugged in with
 * setCommunityBackend(); see docs/workshop.md for the contract.
 */
export interface CommunityEntry {
  /** Chosen by the backend; used in links as #community-<id>. */
  id: string;
  def: GameDef;
  author: string;
  note?: string;
  /** Milliseconds since 1970. */
  publishedAt: number;
  plays?: number;
  /** Set by the local backend: the game is only on this device. */
  local?: boolean;
}
export interface PublishMeta { author: string; note?: string }
export interface CommunityBackend {
  /** True when published games reach other people. */
  readonly shared: boolean;
  list(): Promise<CommunityEntry[]>;
  get(id: string): Promise<CommunityEntry | null>;
  /** Publishes a game, or updates the player's earlier publication of the same game id. */
  publish(def: GameDef, meta: PublishMeta): Promise<CommunityEntry>;
  unpublish(id: string): Promise<void>;
  /** Optional: count a finished play. */
  recordPlay?(id: string): Promise<void>;
}

const KEY = 'gp.community';
export const localBackend: CommunityBackend = {
  shared: false,
  async list() { return loadJSON<CommunityEntry[]>(KEY, []).sort((a, b) => b.publishedAt - a.publishedAt); },
  async get(id) { return loadJSON<CommunityEntry[]>(KEY, []).find(e => e.id === id) ?? null; },
  async publish(def, meta) {
    const problems = validate(def);
    if (problems.length) throw new Error(problems[0]);
    const all = loadJSON<CommunityEntry[]>(KEY, []);
    const id = 'c-' + def.id.replace(/[^A-Za-z0-9-]/g, '').slice(0, 40);
    const before = all.find(e => e.id === id);
    const entry: CommunityEntry = { id, def, author: meta.author.trim() || '—', ...(meta.note?.trim() ? { note: meta.note.trim() } : {}), publishedAt: Date.now(), plays: before?.plays ?? 0, local: true };
    saveJSON(KEY, [...all.filter(e => e.id !== id), entry]);
    return entry;
  },
  async unpublish(id) { saveJSON(KEY, loadJSON<CommunityEntry[]>(KEY, []).filter(e => e.id !== id)); },
  async recordPlay(id) { saveJSON(KEY, loadJSON<CommunityEntry[]>(KEY, []).map(e => (e.id === id ? { ...e, plays: (e.plays ?? 0) + 1 } : e))); },
};

let backend: CommunityBackend = localBackend;
const listeners = new Set<() => void>();
export const community = () => backend;
export function setCommunityBackend(b: CommunityBackend) { backend = b; listeners.forEach(f => f()); }
export function onBackendChange(f: () => void) { listeners.add(f); return () => { listeners.delete(f); }; }
