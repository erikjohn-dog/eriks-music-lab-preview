// MIDI numbers: C1 = 24, A4 = 69, C7 = 96. Octaves affect sound, not grading.
export const NOTES = ['C', 'C♯', 'D', 'D♯', 'E', 'F', 'F♯', 'G', 'G♯', 'A', 'A♯', 'B'];
export const MIN_NOTE = 24, MAX_NOTE = 96;
export const frequency = midi => 440 * 2 ** ((midi - 69) / 12);
export const pitchClass = midi => ((midi % 12) + 12) % 12;
export const noteName = midi => `${NOTES[pitchClass(midi)]}${Math.floor(midi / 12) - 1}`;
export const isCorrect = (midi, answer) => pitchClass(midi) === answer;
export const accuracy = (correct, total) => total ? Math.round(correct / total * 100) : 0;

// Rejection sampling avoids modulo bias. Excluding the previous note preserves
// equal probability among all remaining notes, including at either boundary.
export function randomInt(size, random = crypto) {
  if (!Number.isInteger(size) || size < 1 || size > 2 ** 32) throw new RangeError('Invalid random range');
  const limit = Math.floor(2 ** 32 / size) * size;
  const value = new Uint32Array(1);
  do { random.getRandomValues(value); } while (value[0] >= limit);
  return value[0] % size;
}
export function chooseNote(min, max, previous = null, avoidRepeat = false, random = crypto) {
  if (!Number.isInteger(min) || !Number.isInteger(max) || min < MIN_NOTE || max > MAX_NOTE || min > max) throw new RangeError('Invalid note range');
  const exclude = avoidRepeat && max > min && previous >= min && previous <= max;
  const value = min + randomInt(max - min + 1 - Number(exclude), random);
  return exclude && value >= previous ? value + 1 : value;
}
export const DEFAULT_SETTINGS = Object.freeze({
  sound: 'sine', min: 48, max: 83, duration: 1, blind: false, length: 20, details: true,
  reference: false, referenceNote: 69, autoplay: false, avoidRepeat: false,
  collect: false, overall: false, byNote: false, current: false, longest: false,
  matrix: false, history: false, saveHistory: false,
  pitchClasses: [0,1,2,3,4,5,6,7,8,9,10,11],
  theme: 'system', score: false, mainStreak: false, animations: true, feedback: true
});
export function sanitizeSettings(input = {}) {
  const output = { ...DEFAULT_SETTINGS };
  for (const key of Object.keys(output)) {
    if (typeof output[key] === 'boolean' && typeof input[key] === 'boolean') output[key] = input[key];
  }
  for (const key of ['min', 'max', 'referenceNote']) {
    if (Number.isInteger(input[key]) && input[key] >= MIN_NOTE && input[key] <= MAX_NOTE) output[key] = input[key];
  }
  if (output.min > output.max) { output.min = DEFAULT_SETTINGS.min; output.max = DEFAULT_SETTINGS.max; }
  if ([0.5, 1, 2, 4].includes(input.duration)) output.duration = input.duration;
  if ([10, 20, 50].includes(input.length)) output.length = input.length;
  if (Array.isArray(input.pitchClasses) && input.pitchClasses.length && input.pitchClasses.every(n => Number.isInteger(n) && n >= 0 && n < 12)) output.pitchClasses = [...new Set(input.pitchClasses)].sort((a,b)=>a-b);
  if (['sine', 'piano'].includes(input.sound)) output.sound = input.sound;
  if (['light', 'dark', 'system'].includes(input.theme)) output.theme = input.theme;
  return output;
}
export function freshStats() {
  return { overall: { total: 0, correct: 0 }, byNote: NOTES.map(() => ({ total: 0, correct: 0 })),
    streak: { current: 0, longest: 0 }, matrix: NOTES.map(() => NOTES.map(() => 0)), history: [] };
}
export function recordAnswer(stats, midi, answer) {
  const actual = pitchClass(midi), correct = isCorrect(midi, answer);
  stats.overall.total++; stats.overall.correct += Number(correct);
  stats.byNote[actual].total++; stats.byNote[actual].correct += Number(correct);
  stats.streak.current = correct ? stats.streak.current + 1 : 0;
  stats.streak.longest = Math.max(stats.streak.current, stats.streak.longest);
  stats.matrix[actual][answer]++;
}
export function summarize(answers) {
  const correct = answers.filter(row => isCorrect(row.note, row.answer)).length;
  return { total: answers.length, correct, accuracy: accuracy(correct, answers.length) };
}
export function resetStats(stats, category) {
  const fresh = freshStats();
  if (category === 'all') return fresh;
  if (!(category in fresh)) throw new Error('Unknown statistic');
  stats[category] = fresh[category];
  return stats;
}
