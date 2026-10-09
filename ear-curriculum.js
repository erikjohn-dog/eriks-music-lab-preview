export const WORLDS = ['Intervals', 'Chords', 'Scales'];
export const PROGRESS_KEY = 'eriks-music-lab:ear-curriculum:v1';
export function grade(correct, total) { const score = total ? 100 * correct / total : 0; return score >= 95 ? 3 : score >= 85 ? 2 : score >= 70 ? 1 : 0; }
export function readProgress() { try { const value = JSON.parse(localStorage.getItem(PROGRESS_KEY) || '{}'); return value && typeof value === 'object' && !Array.isArray(value) ? value : {}; } catch { return {}; } }
export function saveResult(id, stars) { if (!Number.isInteger(stars) || stars < 0 || stars > 3) return; const progress = readProgress(); progress[id] = Math.max(progress[id] || 0, stars); try { localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress)); } catch {} }
