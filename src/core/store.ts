import { raceResult } from './duel';
import { useSyncExternalStore } from 'react';
import { loadJSON, saveJSON } from './storage';
import { dayKey } from './rng';
import { charFor, LEVEL_OF } from './cast';
import { tasksDone, tasksFor, type TaskKind } from './daily';
import { DEFAULT_EQUIP, itemOf, type Slot } from './shop';
import { setSoundEnabled, sfx } from './sound';

export type Outcome = 'win' | 'loss' | 'draw';
export interface MatchRecord { t: number; result: Outcome; label: string; ms?: number }
export interface GameStats {
  started: number; played: number; wins: number; losses: number; draws: number;
  rating: number; best: Record<string, number>; history: MatchRecord[];
}
export interface Profile {
  id: string; name: string; glyph: string; color: string; country: string;
  favorites: string[]; guest: boolean; created: number;
  stats: Record<string, GameStats>;
  /** day → solve time in ms for the daily puzzle */
  daily: Record<string, number>;
  /** game → strongest regular beaten (0 Ali … 4 Şevket) */
  beaten?: Record<string, number>;
  /** tea glasses: earned by playing, spent on looks */
  tea?: number; teaEarned?: number;
  owned?: string[]; equip?: Partial<Record<Slot, string>>;
  /** newspaper clippings of notable results, newest first */
  clips?: Clip[];
  /** day → jobs of that day's issue done */
  issue?: Record<string, TaskKind[]>;
}
/** A clipping keeps facts, not text, so it reads in whatever language the paper is in. */
export interface Clip { t: number; k: 'beat' | 'first' | 'seven' | 'cup' | 'streak' | 'tour' | 'issue'; game?: string; lvl?: number; n?: number; s?: string }
export type Note =
  | { kind: 'tea'; n: number; why: [string, string, string] }
  | { kind: 'clip'; clip: Clip }
  | { kind: 'result'; game: string; result: Outcome; lvl: number | null; profileId: string };
const listeners = new Set<(n: Note) => void>();
export const onNote = (f: (n: Note) => void) => { listeners.add(f); return () => { listeners.delete(f); }; };
const notify = (n: Note) => listeners.forEach(f => { try { f(n); } catch { /* a listener failing must not stop play */ } });
export type Theme = 'auto' | 'light' | 'dark';
export type Lang = 'en' | 'zh' | 'tr';
interface Data { profiles: Profile[]; activeId: string; theme: Theme; lang: Lang; sound?: boolean }

export const GLYPHS = ['♟', '♞', '♜', '◆', '●', '▲', '★', '✦'];
export const AVATAR_COLORS = ['#a63a2e', '#1f3a5f', '#2f6b4f', '#8a6d1f', '#5b3f73', '#3d3d3d'];
export const START_RATING = 1000;

const KEY = 'gp.v1';
const uid = () => Math.random().toString(36).slice(2, 10);
const blankStats = (): GameStats => ({ started: 0, played: 0, wins: 0, losses: 0, draws: 0, rating: START_RATING, best: {}, history: [] });

function newProfile(name: string, guest: boolean): Profile {
  return { id: uid(), name, glyph: guest ? '●' : GLYPHS[0], color: guest ? AVATAR_COLORS[5] : AVATAR_COLORS[0],
    country: '', favorites: [], guest, created: Date.now(), stats: {}, daily: {} };
}

function load(): Data {
  const d = loadJSON<Data | null>(KEY, null);
  if (d && Array.isArray(d.profiles) && d.profiles.length) {
    // Earlier versions used Chinese characters as profile seals; swap them for neutral symbols.
    for (const p of d.profiles) if (/[\u4e00-\u9fff]/.test(p.glyph)) p.glyph = p.guest ? '●' : GLYPHS[0];
    d.lang = d.lang === 'zh' || d.lang === 'tr' ? d.lang : 'en';
    setSoundEnabled(d.sound !== false);
    return d;
  }
  const g = newProfile('Guest', true);
  return { profiles: [g], activeId: g.id, theme: 'auto', lang: 'en' };
}

let data = load();
const subs = new Set<() => void>();
function mutate(fn: (d: Data) => void) {
  const next = JSON.parse(JSON.stringify(data)) as Data;
  fn(next);
  data = next;
  saveJSON(KEY, next);
  subs.forEach(f => f());
}
const subscribe = (f: () => void) => { subs.add(f); return () => { subs.delete(f); }; };

export const useData = () => useSyncExternalStore(subscribe, () => data);
export const getData = () => data;
export const activeOf = (d: Data) => d.profiles.find(p => p.id === d.activeId) ?? d.profiles[0];
export const statsOf = (p: Profile, game: string): GameStats => p.stats[game] ?? blankStats();

export function createProfile(name: string) {
  mutate(d => { const p = newProfile(name.trim() || 'Player', false); d.profiles.push(p); d.activeId = p.id; });
}
export function setActive(id: string) { mutate(d => { if (d.profiles.some(p => p.id === id)) d.activeId = id; }); applyLooks(); }
export function editProfile(id: string, patch: Partial<Pick<Profile, 'name' | 'glyph' | 'color' | 'country'>>) {
  mutate(d => { const p = d.profiles.find(x => x.id === id); if (p) Object.assign(p, patch); });
}
export function deleteProfile(id: string) {
  mutate(d => {
    if (d.profiles.length < 2) return;
    d.profiles = d.profiles.filter(p => p.id !== id);
    if (d.activeId === id) d.activeId = d.profiles[0].id;
  });
}
export function toggleFavorite(game: string) {
  mutate(d => { const p = activeOf(d); const i = p.favorites.indexOf(game); i < 0 ? p.favorites.push(game) : p.favorites.splice(i, 1); });
}
export function noteStarted(game: string) {
  mutate(d => { const p = activeOf(d); (p.stats[game] ??= blankStats()).started++; });
}

/** Elo with K = 24. Each game keeps its own rating; nothing is shared across games. */
export function eloNext(rating: number, opponent: number, score: number): number {
  const expected = 1 / (1 + Math.pow(10, (opponent - rating) / 400));
  return Math.round(rating + 24 * (score - expected));
}

export function recordResult(profileId: string, game: string, r: {
  result: Outcome; label: string; ms?: number; oppRating?: number; bestKey?: string;
}) {
  if (raceResult(game, { ok: r.result === 'win', ms: r.ms, label: r.label })) return;
  const m = /^vs (Beginner|Easy|Intermediate|Advanced|Expert) AI/.exec(r.label);
  const lvl = m ? LEVEL_OF[m[1]] : null, who = lvl != null ? charFor(game, lvl) : null;
  if (who != null && who !== lvl) r = { ...r, label: r.label + ' · @' + who };
  const unrated = r.label.includes('unrated'), local = r.label.includes('same device');
  const won = r.result === 'win', day = dayKey();
  const notes: Note[] = [];
  mutate(d => {
    const p = d.profiles.find(x => x.id === profileId); if (!p) return;
    const s = (p.stats[game] ??= blankStats());
    const firstWin = won && s.wins === 0;
    s.played++;
    if (r.result === 'win') s.wins++; else if (r.result === 'loss') s.losses++; else s.draws++;
    if (r.oppRating != null) s.rating = eloNext(s.rating, r.oppRating, r.result === 'win' ? 1 : r.result === 'draw' ? 0.5 : 0);
    if (r.bestKey && r.ms != null && (s.best[r.bestKey] == null || r.ms < s.best[r.bestKey])) s.best[r.bestKey] = r.ms;
    s.history.unshift({ t: Date.now(), result: r.result, label: r.label, ms: r.ms });
    s.history.length = Math.min(s.history.length, 40);
    // Tea glasses and clippings.
    let tea = 0; const why: [string, string, string] = ['Well played', '下得好', 'Güzel oyun'];
    if (lvl != null) {
      if (won) tea = unrated ? 1 : 2 + lvl * 2; else if (r.result === 'draw') tea = 1;
      const b = p.beaten ??= {};
      if (won && !unrated && (b[game] ?? -1) < lvl) {
        b[game] = lvl; tea += 5;
        notes.push({ kind: 'clip', clip: addClip(p, { k: 'beat', game, lvl, n: who ?? lvl }) });
      }
    } else if (local) { if (won) tea = 2; }
    else if (game === 'football-70') {
      if (won) { tea = 8; notes.push({ kind: 'clip', clip: addClip(p, { k: r.label.includes('7-0') ? 'seven' : 'cup', game, s: r.label.split(' · ')[0] }) }); }
      if (r.label.includes('7-0')) tea += 17;
    } else if (won) tea = 3;
    if (firstWin && lvl == null && !local && game !== 'football-70') notes.push({ kind: 'clip', clip: addClip(p, { k: 'first', game }) });
    if (p.id === d.activeId) {
      for (const job of tasksDone(day, game, won, lvl, r.label)) tea += completeJob(p, day, job, notes);
    }
    if (tea > 0) { p.tea = (p.tea ?? 0) + tea; p.teaEarned = (p.teaEarned ?? 0) + tea; notes.push({ kind: 'tea', n: tea, why }); }
    // Only the person holding the device sees the notices.
    if (p.id !== d.activeId) notes.length = 0;
  });
  if (profileId === data.activeId) notify({ kind: 'result', game, result: r.result, lvl, profileId });
  notes.forEach(notify);
}
function addClip(p: Profile, c: Omit<Clip, 't'>): Clip {
  const clip = { t: Date.now(), ...c }; (p.clips ??= []).unshift(clip); p.clips.length = Math.min(p.clips.length, 80); return clip;
}
/** Marks one job of the day's issue done; returns the tea it earns. */
function completeJob(p: Profile, day: string, job: TaskKind, notes: Note[]): number {
  const done = (p.issue ??= {})[day] ??= [];
  if (done.includes(job)) return 0;
  const before = dailyStreak(p);
  done.push(job);
  let tea = 5;
  if (done.length === tasksFor(day).length) { tea += 10; notes.push({ kind: 'clip', clip: addClip(p, { k: 'issue', n: dailyStreak(p) }) }); }
  const after = dailyStreak(p);
  if (after > before && [3, 7, 14, 30, 50, 100].includes(after)) notes.push({ kind: 'clip', clip: addClip(p, { k: 'streak', n: after }) });
  return tea;
}
/** Tea for things that are not a single game result, such as a tournament. */
export function earnTea(n: number, why: [string, string, string], clip?: Omit<Clip, 't'>) {
  const notes: Note[] = [];
  mutate(d => { const p = activeOf(d); p.tea = (p.tea ?? 0) + n; p.teaEarned = (p.teaEarned ?? 0) + n; if (clip) notes.push({ kind: 'clip', clip: addClip(p, clip) }); });
  notify({ kind: 'tea', n, why }); notes.forEach(notify);
}
export function buyItem(id: string): boolean {
  const it = itemOf(id); let ok = false;
  mutate(d => { const p = activeOf(d); if (!it || (p.owned ?? []).includes(id) || (p.tea ?? 0) < it.price) return; p.tea = (p.tea ?? 0) - it.price; (p.owned ??= []).push(id); (p.equip ??= {})[it.slot] = id; ok = true; });
  applyLooks(); return ok;
}
export function equipItem(id: string) {
  const it = itemOf(id); if (!it) return;
  mutate(d => { const p = activeOf(d); if (it.price && !(p.owned ?? []).includes(id)) return; (p.equip ??= {})[it.slot] = id; });
  applyLooks();
}
export const owns = (p: Profile, id: string) => (itemOf(id)?.price ?? 1) === 0 || (p.owned ?? []).includes(id);
/** Puts the active profile's looks on the page as data attributes the stylesheet reads. */
export function applyLooks() {
  if (typeof document === 'undefined') return;
  const p = activeOf(data), el = document.documentElement;
  for (const slot of ['wall', 'tavla', 'tiles'] as const) {
    const id = p.equip?.[slot] ?? DEFAULT_EQUIP[slot];
    el.setAttribute('data-' + slot, id.split('-')[1]);
  }
}
export function setSound(on: boolean) { mutate(d => { d.sound = on; }); setSoundEnabled(on); if (on) sfx('click'); }
export function issueDone(p: Profile, day = dayKey()): TaskKind[] { return p.issue?.[day] ?? []; }
export function markDaily(day: string, ms: number) {
  mutate(d => { const p = activeOf(d); if (p.daily[day] == null) p.daily[day] = ms; });
}
/** Marks a job of today's issue done from outside a game result (the daily 7-0 run). */
export function markJob(job: TaskKind) {
  const notes: Note[] = []; let tea = 0; const day = dayKey();
  mutate(d => { const p = activeOf(d); tea = completeJob(p, day, job, notes); if (tea) { p.tea = (p.tea ?? 0) + tea; p.teaEarned = (p.teaEarned ?? 0) + tea; } });
  if (tea) notify({ kind: 'tea', n: tea, why: ['Today’s issue', '今日报纸', 'Günün sayısı'] });
  notes.forEach(notify);
}
/** Consecutive days solved, counting back from today (or yesterday if today is still open). */
export function dailyStreak(p: Profile): number {
  const d = new Date(); let n = 0;
  const hit = (k: string) => p.daily[k] != null || (p.issue?.[k]?.length ?? 0) > 0;
  if (!hit(dayKey(d))) d.setDate(d.getDate() - 1);
  while (hit(dayKey(d))) { n++; d.setDate(d.getDate() - 1); }
  return n;
}

// Theme: "auto" leaves whatever the host or OS chose; an explicit choice sets data-theme.
const hostTheme = typeof document !== 'undefined' ? document.documentElement.getAttribute('data-theme') : null;
export function applyTheme(t: Theme) {
  if (typeof document === 'undefined') return;
  const el = document.documentElement;
  if (t === 'auto') { hostTheme ? el.setAttribute('data-theme', hostTheme) : el.removeAttribute('data-theme'); }
  else el.setAttribute('data-theme', t);
}
export function setTheme(t: Theme) { mutate(d => { d.theme = t; }); applyTheme(t); }
export function applyLang(l: Lang) { if (typeof document !== 'undefined') document.documentElement.lang = l === 'zh' ? 'zh-Hans' : l; }
export function setLang(l: Lang) { mutate(d => { d.lang = l; }); applyLang(l); }
