import test from 'node:test';
import assert from 'node:assert/strict';
import { fixture } from './dom-harness.mjs';
import { DEFAULT_SETTINGS, freshStats } from '../core.js';
const tapAnswer = async (f, value) => f.$('notes').children[value].click();

test('simulated UI: initial locks, replay, one-answer guard, feedback, next and collection-off', async () => {
  const f = await fixture();
  try {
    assert.equal(f.$('notes').children.length, 12);
    assert.ok(f.$('notes').children.every(button => button.disabled));
    assert.equal(f.$('main-metrics').hidden, true);
    await f.$('play').click(); const first = f.calls.at(-1);
    for (let i = 0; i < 8; i++) await f.$('play').click();
    assert.equal(f.calls.length, 9); assert.ok(f.calls.every(value => value === first));
    assert.equal(f.data.size, 0);
    await tapAnswer(f, 0); assert.match(f.$('feedback').textContent, /Correct — C3/);
    assert.ok(f.$('notes').children.every(button => button.disabled));
    await tapAnswer(f, 1); assert.match(f.$('feedback').textContent, /Correct — C3/);
    await f.$('play').click(); assert.equal(f.calls.at(-1), first);
    await f.$('next').click(); assert.equal(f.calls.length, 10); assert.ok(f.$('notes').children.every(button => button.disabled));
    await f.$('play').click(); await tapAnswer(f, 1); assert.match(f.$('feedback').textContent, /The note was C3/);
    await f.$('end-session').click(); assert.equal(f.$('results-dialog').open, true); assert.match(f.$('results-content').textContent, /50%/); assert.equal(f.data.size, 0);
  } finally { f.restore(); }
});
test('simulated UI: training settings, range validation, autoplay and reference distinction', async () => {
  const f = await fixture();
  try {
    await f.configure({ min: 96, max: 24 }); assert.equal(f.$('settings-dialog').open, true); assert.ok(f.$('setting-min').validity);
    await f.configure({ min: 96, max: 96, reference: true, referenceNote: 69, duration: .5, autoplay: true, avoidRepeat: true });
    assert.equal(f.$('settings-dialog').open, false);
    await f.$('reference').click(); assert.equal(f.calls.at(-1), 440); assert.match(f.$('play-help').textContent, /reference A4/); assert.ok(f.$('notes').children.every(button => button.disabled));
    await f.$('play').click(); assert.ok(Math.abs(f.calls.at(-1) - 2093.004522404789) < 1e-9);
    await tapAnswer(f, 0); await f.$('next').click(); assert.equal(f.$('notes').children[0].disabled, false); assert.ok(Math.abs(f.calls.at(-1) - 2093.004522404789) < 1e-9);
    await f.configure({ min: 24, max: 24, autoplay: false }); assert.equal(f.$('headphones').hidden, false);
    await f.$('play').click(); assert.ok(Math.abs(f.calls.at(-1) - 32.70319566257483) < 1e-9);
  } finally { f.restore(); }
});
test('simulated UI: blind answers conceal correctness until question 10; no collection required', async () => {
  const f = await fixture();
  try {
    await f.configure({ blind: true, length: 10, min: 48, max: 48, score: true, mainStreak: true, details: true });
    for (let i = 0; i < 10; i++) {
      await f.$('play').click(); await tapAnswer(f, i % 2 ? 1 : 0);
      if (i < 9) {
        assert.equal(f.$('feedback').textContent, 'Answer saved. Continue when you’re ready.');
        assert.equal(f.$('main-metrics').hidden, true);
        assert.ok(f.$('notes').children.every(button => !/correct|incorrect/.test(button.className)));
        assert.equal(f.$('results-dialog').open, false);
        if (i === 1) { await f.$('settings-open').click(); await f.$('statistics-open').click(); assert.equal(f.$('stats-dialog').open, false); assert.match(f.alerts.at(-1), /hidden/); await f.$('settings-close').click(); }
        await f.$('next').click();
      }
    }
    assert.equal(f.$('results-dialog').open, true); assert.match(f.$('results-content').textContent, /50%/); assert.match(f.$('results-content').textContent, /5 correct out of 10/);
    assert.deepEqual(f.saved().stats, freshStats());
  } finally { f.restore(); }
});
test('simulated UI: collect once, persist, history, statistics views, reset confirmation and reload', async () => {
  let f = await fixture(); let snapshot;
  try {
    await f.configure({ min: 48, max: 48, collect: true, saveHistory: true, overall: true, byNote: true, current: true, longest: true, matrix: true, history: true, score: true, mainStreak: true, theme: 'dark' });
    for (let i = 0; i < 4; i++) { await f.$('play').click(); await f.$('play').click(); await tapAnswer(f, i === 2 ? 1 : 0); await tapAnswer(f, 0); if (i < 3) await f.$('next').click(); }
    assert.deepEqual(f.saved().stats.overall, { total: 4, correct: 3 }); assert.deepEqual(f.saved().stats.streak, { current: 1, longest: 2 });
    await f.$('end-session').click(); snapshot = f.saved(); assert.equal(snapshot.stats.history.length, 1); assert.equal(snapshot.stats.history[0].total, 4);
    await f.$('results-close').click(); await f.$('settings-open').click(); await f.$('statistics-open').click();
    assert.match(f.$('stats-content').textContent, /75%/); assert.match(f.$('stats-content').textContent, /C → C♯/); assert.match(f.$('stats-content').textContent, /12 × 12/);
    await f.$('stats-close').click();
    const findReset = (el, key) => { if (el.dataset.reset === key) return el; for (const child of el.children) { const found = findReset(child, key); if (found) return found; } };
    globalThis.confirm = () => false; await findReset(f.$('settings-fields'), 'all').click(); assert.equal(f.saved().stats.overall.total, 4);
    globalThis.confirm = () => true; await findReset(f.$('settings-fields'), 'matrix').click(); assert.equal(f.saved().stats.matrix[0][1], 0); assert.equal(f.saved().stats.overall.total, 4);
    await findReset(f.$('settings-fields'), 'all').click(); assert.deepEqual(f.saved().stats, freshStats());
  } finally { f.restore(); }
  f = await fixture(snapshot);
  try { assert.equal(f.document.documentElement.dataset.theme, 'dark'); assert.equal(f.saved().stats.overall.total, 4); await f.configure({ collect: false }); assert.equal(f.saved().stats.streak.current, 0); assert.equal(f.saved().stats.overall.total, 4); } finally { f.restore(); }
});
test('simulated UI: enabling collection later never backfills answers or partial session history', async () => {
  const f = await fixture();
  try {
    await f.configure({ min: 48, max: 48, saveHistory: true });
    await f.$('play').click(); await tapAnswer(f, 0);
    await f.configure({ collect: true });
    await f.$('next').click(); await f.$('play').click(); await tapAnswer(f, 0); await f.$('end-session').click();
    assert.equal(f.saved().stats.overall.total, 1); assert.equal(f.saved().stats.history.length, 0); assert.match(f.$('results-content').textContent, /2 correct out of 2/);
  } finally { f.restore(); }
});
test('simulated UI: appearance follows system, feedback can be disabled, settings preserve active question', async () => {
  const f = await fixture();
  try {
    assert.equal(f.document.documentElement.dataset.theme, 'light'); f.media.matches = true; f.media.callback(); assert.equal(f.document.documentElement.dataset.theme, 'dark');
    await f.$('play').click(); const initial = f.calls.at(-1);
    await f.configure({ theme: 'light', animations: false, feedback: false });
    assert.equal(f.document.documentElement.dataset.theme, 'light'); assert.equal(f.document.documentElement.dataset.animations, 'false');
    await f.$('play').click(); assert.equal(f.calls.at(-1), initial);
    await tapAnswer(f, 1); assert.match(f.$('feedback').textContent, /The note was C3/); assert.equal(f.$('feedback').className, 'feedback'); assert.ok(f.$('notes').children.every(button => !/correct|incorrect/.test(button.className)));
  } finally { f.restore(); }
});
for (const length of [20, 50]) test(`simulated UI: ${length}-question blind session and detailed-results disabled`, async () => {
  const f = await fixture({ version: 1, settings: { ...DEFAULT_SETTINGS, blind: true, length, details: false, collect: true, score: true, mainStreak: true, min: 48, max: 48 }, stats: freshStats() });
  try {
    for (let i = 0; i < length; i++) {
      await f.$('play').click(); await tapAnswer(f, 0);
      if (i < length - 1) { assert.equal(f.$('main-metrics').hidden, true); assert.ok(f.$('notes').children.every(button => !/correct|incorrect/.test(button.className))); await f.$('next').click(); }
    }
    assert.match(f.$('results-content').textContent, /100%/); assert.doesNotMatch(f.$('results-content').textContent, /Question-by-question/); assert.equal(f.saved().stats.overall.total, length);
  } finally { f.restore(); }
});
test('simulated UI: cancelling a training change preserves the unknown note', async () => {
  const f = await fixture();
  try {
    await f.$('play').click(); const original = f.calls.at(-1);
    globalThis.confirm = () => false; await f.configure({ min: 96, max: 96 });
    assert.equal(f.$('settings-dialog').open, true); assert.equal(f.data.size, 0);
    await f.$('settings-close').click(); await f.$('play').click(); assert.equal(f.calls.at(-1), original);
  } finally { f.restore(); }
});
test('simulated UI: inactive app cannot initiate playback or reveal the unknown note', async () => {
  const f = await fixture();
  try {
    f.document.hidden = true; await f.$('play').click(); assert.equal(f.calls.length, 0);
    f.document.hidden = false; await f.$('play').click();
    assert.doesNotMatch(f.$('feedback').textContent, /C3|Hz|130/); assert.doesNotMatch(f.$('play-help').textContent, /C3|Hz|130/);
    f.document.hidden = true; for (const fn of f.document.listeners.visibilitychange) fn();
    await f.$('play').click(); assert.equal(f.calls.length, 1);
  } finally { f.restore(); }
});
