import { DEFAULT_SETTINGS, freshStats, sanitizeSettings } from './core.js';
const KEY = 'perfect-pitch-trainer:v1';
const count = n => Number.isSafeInteger(n) && n >= 0 ? n : 0;
const pair = data => { const total = count(data?.total); return { total, correct: Math.min(total, count(data?.correct)) }; };
// Validate stored JSON rather than trusting stale, damaged, or edited storage.
export function sanitizeStats(input) {
  const stats = freshStats();
  if (!input || typeof input !== 'object') return stats;
  stats.overall = pair(input.overall);
  stats.byNote = stats.byNote.map((_, i) => pair(input.byNote?.[i]));
  stats.streak = { current: count(input.streak?.current), longest: count(input.streak?.longest) };
  stats.streak.longest = Math.max(stats.streak.current, stats.streak.longest);
  stats.matrix = stats.matrix.map((row, i) => row.map((_, j) => count(input.matrix?.[i]?.[j])));
  if (Array.isArray(input.history)) stats.history = input.history.filter(row =>
    row && typeof row.date === 'string' && Number.isFinite(Date.parse(row.date)) &&
    Number.isSafeInteger(row.total) && row.total > 0 && Number.isSafeInteger(row.correct) &&
    row.correct >= 0 && row.correct <= row.total && typeof row.blind === 'boolean'
  ).slice(-100).map(({ date, total, correct, blind }) => ({ date, total, correct, blind }));
  return stats;
}
export function createStore(storage, onWarning = () => {}) {
  let available = true;
  const warn = () => { available = false; onWarning('Local storage is unavailable. This visit still works, but changes may not survive closing the app.'); };
  return {
    load() {
      const fallback = { settings: { ...DEFAULT_SETTINGS }, stats: freshStats() };
      try {
        const raw = storage.getItem(KEY);
        if (!raw) return fallback;
        const data = JSON.parse(raw);
        // Leave unfamiliar future data untouched; never overwrite a newer schema.
        if (data.version !== 1) { warn(); return fallback; }
        return { settings: sanitizeSettings(data.settings), stats: sanitizeStats(data.stats) };
      } catch { warn(); return fallback; }
    },
    save(settings, stats) {
      if (!available) return false;
      try { storage.setItem(KEY, JSON.stringify({ version: 1, settings, stats })); return true; }
      catch { warn(); return false; }
    }
  };
}
