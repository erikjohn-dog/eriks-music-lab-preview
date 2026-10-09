import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { webcrypto } from 'node:crypto';
import vm from 'node:vm';
import { frequency, pitchClass, noteName, chooseNote, randomInt, isCorrect, DEFAULT_SETTINGS, sanitizeSettings, freshStats, recordAnswer, summarize, resetStats } from '../core.js';
import { createStore, sanitizeStats } from '../storage.js';
import { TonePlayer } from '../audio.js';
const sequence = (...values) => ({ getRandomValues(out) { out[0] = values.shift(); return out; } });

test('equal temperament: reference, full range boundaries, semitone and octave ratios', () => {
  assert.equal(frequency(69), 440);
  assert.ok(Math.abs(frequency(24) - 32.70319566257483) < 1e-10);
  assert.ok(Math.abs(frequency(96) - 2093.004522404789) < 1e-9);
  for (let midi = 24; midi <= 96; midi++) { assert.ok(frequency(midi) > 0); if (midi < 96) assert.ok(Math.abs(frequency(midi + 1) / frequency(midi) - 2 ** (1 / 12)) < 1e-12); }
  assert.equal(frequency(81), 880);
});
test('all pitch classes grade identically across all supported octaves', () => {
  assert.equal(noteName(24), 'C1'); assert.equal(noteName(96), 'C7'); assert.equal(noteName(83), 'B5');
  for (let midi = 24; midi <= 96; midi++) for (let answer = 0; answer < 12; answer++) assert.equal(isCorrect(midi, answer), midi % 12 === answer);
  assert.equal(pitchClass(54), 6);
});
test('inclusive random boundaries and single-note ranges', () => {
  assert.equal(chooseNote(24, 96, null, false, sequence(0)), 24);
  assert.equal(chooseNote(24, 96, null, false, sequence(72)), 96);
  for (let i = 24; i <= 96; i++) assert.equal(chooseNote(i, i, i, true, sequence(0)), i);
  assert.throws(() => chooseNote(96, 24), RangeError);
  assert.throws(() => chooseNote(23, 96), RangeError);
  for (let i = 0; i < 5000; i++) { const value = chooseNote(48, 83, null, false, webcrypto); assert.ok(value >= 48 && value <= 83); }
});
test('repeat avoidance maps uniformly over each remaining note, including boundaries', () => {
  for (let previous = 24; previous <= 96; previous++) {
    const output = new Set(); for (let i = 0; i < 72; i++) output.add(chooseNote(24, 96, previous, true, sequence(i)));
    assert.equal(output.size, 72); assert.equal(output.has(previous), false);
  }
  assert.equal(chooseNote(24, 25, 24, true, sequence(0)), 25);
  assert.equal(chooseNote(24, 25, 25, true, sequence(0)), 24);
});
test('modulo rejection sampling discards biased tail', () => {
  assert.equal(randomInt(12, sequence(4294967295, 11)), 11);
  assert.throws(() => randomInt(0), RangeError);
});
test('default preferences keep interface and collection optional', () => {
  assert.equal(DEFAULT_SETTINGS.min, 48); assert.equal(DEFAULT_SETTINGS.max, 83);
  for (const key of ['blind', 'reference', 'collect', 'overall', 'byNote', 'current', 'longest', 'matrix', 'history', 'saveHistory', 'score', 'mainStreak']) assert.equal(DEFAULT_SETTINGS[key], false);
  assert.equal(DEFAULT_SETTINGS.duration, 1); assert.equal(DEFAULT_SETTINGS.theme, 'system');
});
test('settings validate bad ranges, durations, types and enums', () => {
  const settings = sanitizeSettings({ min: 90, max: 30, duration: 3, theme: 'garbage', blind: 'true', length: 11, referenceNote: 0 });
  assert.deepEqual(settings, { ...DEFAULT_SETTINGS });
  assert.equal(sanitizeSettings({ min: 24, max: 96, duration: .5, length: 50, referenceNote: 96 }).max, 96);
});
test('accuracy, per-note data, streaks and matrix count each attempt once', () => {
  const stats = freshStats();
  recordAnswer(stats, 48, 0); recordAnswer(stats, 60, 0); recordAnswer(stats, 66, 7); recordAnswer(stats, 78, 6);
  assert.deepEqual(stats.overall, { total: 4, correct: 3 });
  assert.deepEqual(stats.byNote[0], { total: 2, correct: 2 });
  assert.deepEqual(stats.byNote[6], { total: 2, correct: 1 });
  assert.deepEqual(stats.streak, { current: 1, longest: 2 });
  assert.equal(stats.matrix[6][7], 1); assert.equal(stats.matrix[6][6], 1);
  assert.deepEqual(summarize([{ note: 48, answer: 0 }, { note: 66, answer: 7 }]), { total: 2, correct: 1, accuracy: 50 });
  assert.deepEqual(summarize([]), { total: 0, correct: 0, accuracy: 0 });
});
test('individual resets leave other categories unchanged; all reset clears them', () => {
  const stats = freshStats(); recordAnswer(stats, 48, 0);
  resetStats(stats, 'matrix'); assert.equal(stats.overall.total, 1); assert.equal(stats.matrix[0][0], 0);
  resetStats(stats, 'byNote'); assert.equal(stats.streak.longest, 1); assert.equal(stats.byNote[0].total, 0);
  assert.deepEqual(resetStats(stats, 'all'), freshStats());
});
test('versioned storage roundtrip preserves preferences and data', () => {
  const data = new Map(); const local = { getItem: key => data.get(key), setItem: (key, value) => data.set(key, value) };
  const store = createStore(local); const settings = sanitizeSettings({ theme: 'dark', min: 24, max: 96 }); const stats = freshStats(); recordAnswer(stats, 69, 9);
  store.save(settings, stats); assert.deepEqual(createStore(local).load(), { settings, stats });
});
test('unavailable, damaged, quota-limited and future storage fail gracefully', () => {
  let warnings = 0; const warn = () => warnings++;
  const broken = createStore({ getItem() { throw Error(); }, setItem() { throw Error(); } }, warn);
  assert.equal(broken.load().settings.theme, 'system'); assert.equal(broken.save(DEFAULT_SETTINGS, freshStats()), false);
  assert.equal(warnings, 1);
  const corrupt = createStore({ getItem: () => '{invalid' }, warn); assert.deepEqual(corrupt.load().stats, freshStats());
  let writes = 0; const future = createStore({ getItem: () => '{"version":2}', setItem: () => writes++ }, warn); future.load(); future.save(DEFAULT_SETTINGS, freshStats()); assert.equal(writes, 0);
  const quota = createStore({ getItem: () => null, setItem() { throw Error(); } }, warn); quota.load(); assert.equal(quota.save(DEFAULT_SETTINGS, freshStats()), false);
});
test('damaged statistics and history are normalized safely', () => {
  const stats = sanitizeStats({ overall: { total: 3, correct: 900 }, byNote: [{ total: -2, correct: 4 }], matrix: [[-1]], history: [{ date: 'bad' }], streak: { current: 5, longest: 2 } });
  assert.deepEqual(stats.overall, { total: 3, correct: 3 }); assert.equal(stats.byNote[0].total, 0); assert.equal(stats.matrix[0][0], 0); assert.equal(stats.history.length, 0); assert.equal(stats.streak.longest, 5);
});

class Param { constructor() { this.calls = []; } setValueAtTime(...args) { this.calls.push(['set', ...args]); } linearRampToValueAtTime(...args) { this.calls.push(['ramp', ...args]); } cancelAndHoldAtTime(...args) { this.calls.push(['hold', ...args]); } }
class Node { constructor() { this.frequency = new Param(); this.gain = new Param(); this.stops = []; } connect() {} disconnect() { this.disconnected = true; } start(time) { this.startTime = time; } stop(time) { this.stops.push(time); } }
class Context { constructor() { this.state = 'suspended'; this.currentTime = 100; this.oscillators = []; this.gains = []; } async resume() { this.state = 'running'; } async suspend() { this.state = 'suspended'; } createOscillator() { const node = new Node(); this.oscillators.push(node); return node; } createGain() { const node = new Node(); this.gains.push(node); return node; } }
test('Web Audio oscillator, frequency, duration, fades and cleanup', async () => {
  for (const duration of [.5, 1, 2, 4]) {
    const player = new TonePlayer(Context); await player.play(69, duration);
    const osc = player.context.oscillators[0], gain = player.context.gains[0];
    assert.equal(osc.type, 'sine'); assert.equal(osc.frequency.calls[0][1], 440);
    assert.ok(Math.abs(osc.stops[0] - osc.startTime - duration) < 1e-10);
    assert.equal(gain.gain.calls[0][1], 0); assert.equal(gain.gain.calls.at(-1)[1], 0);
    osc.onended(); assert.equal(osc.disconnected, true); assert.equal(gain.disconnected, true); assert.equal(player.active, null);
  }
});
test('rapid repeated playback stops prior voices before replacement starts', async () => {
  const player = new TonePlayer(Context);
  for (let i = 0; i < 50; i++) await player.play(48, 1);
  const voices = player.context.oscillators;
  assert.equal(voices.length, 50);
  for (const voice of voices.slice(0, -1)) assert.ok(voice.stops.at(-1) < voices.at(-1).startTime);
  player.deactivate(); assert.equal(player.active, null); assert.equal(player.context.state, 'suspended');
});
test('cancellation while audio resume is pending never starts a stale tone', async () => {
  let resume; class SlowContext extends Context { resume() { return new Promise(resolve => { resume = () => { this.state = 'running'; resolve(); }; }); } }
  const player = new TonePlayer(SlowContext); const promise = player.play(24, 4); player.stop(); resume(); assert.equal(await promise, false); assert.equal(player.context.oscillators.length, 0);
});
test('unsupported audio produces a helpful recoverable error', async () => { await assert.rejects(new TonePlayer(null).play(69, 1), /Web Audio/); });

test('service worker installs full shell at GitHub Pages subpath and serves it offline', async () => {
  const code = await readFile(new URL('../service-worker.js', import.meta.url), 'utf8');
  const scope = 'https://erikjohn-dog.github.io/perfect-pitch-trainer/';
  const handlers = {}, cached = new Map(), deleted = [];
  const cache = { async addAll(requests) { for (const req of requests) { const path = new URL(req.url).pathname.replace('/perfect-pitch-trainer/', '') || 'index.html'; const bytes = await readFile(new URL('../' + path, import.meta.url)); cached.set(req.url, new Response(bytes)); } }, async match(key) { return cached.get(key)?.clone(); }, async put(key, response) { cached.set(key, response); } };
  const self = { registration: { scope }, location: { origin: new URL(scope).origin }, addEventListener: (name, fn) => handlers[name] = fn, clients: { claim: async () => {} }, skipWaiting: async () => {} };
  vm.runInNewContext(code, { self, caches: { open: async () => cache, keys: async () => ['unrelated-cache', 'perfect-pitch-trainer-0.9.0', 'perfect-pitch-trainer-1.0.0'], delete: async key => deleted.push(key) }, URL, Request, fetch: () => { throw Error('Offline network request'); } });
  let task; handlers.install({ waitUntil: promise => task = promise }); await task;
  assert.equal(cached.size, 12);
  handlers.activate({ waitUntil: promise => task = promise }); await task; assert.deepEqual(deleted, ['perfect-pitch-trainer-0.9.0']);
  for (const url of cached.keys()) { let result; handlers.fetch({ request: { method: 'GET', url, mode: url === scope ? 'navigate' : 'cors' }, respondWith: promise => result = promise }); assert.ok((await result).ok); }
  let queryResult; handlers.fetch({ request: { method: 'GET', url: scope + '?installed=1', mode: 'navigate' }, respondWith: promise => queryResult = promise }); assert.ok((await queryResult).ok);
  let status; handlers.message({ data: { type: 'CHECK_CACHE' }, ports: [{ postMessage: data => status = data }], waitUntil: promise => task = promise }); await task; assert.equal(status.ready, true);
  cached.delete(scope + 'audio.js'); handlers.message({ data: { type: 'CHECK_CACHE' }, ports: [{ postMessage: data => status = data }], waitUntil: promise => task = promise }); await task; assert.equal(status.ready, false);
});
