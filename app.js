import { NOTES, MIN_NOTE, MAX_NOTE, noteName, pitchClass, isCorrect, chooseNote, recordAnswer, summarize, accuracy, resetStats } from './core.js';
import { createStore } from './storage.js';
import { TonePlayer } from './audio.js';
import { sharedPiano } from './piano-audio.js';
const $ = id => document.getElementById(id);
const warning = message => { $('warning').textContent = message; $('warning').hidden = false; };
let local;
try { local = window.localStorage; } catch { local = { getItem() { throw new Error('Storage blocked'); } }; }
const store = createStore(local, warning);
let { settings, stats } = store.load();
const audio = new TonePlayer();
let question = null, previous = null, answers = [], session = null, completed = false;
let audioBusy = false, playbackId = 0, animationTimer, playingReference = null;
let pianoTrainingNote = null, pianoTrainingTimer = null;
const trainingKeys = ['min', 'max', 'duration', 'blind', 'length', 'details', 'reference', 'referenceNote', 'autoplay', 'avoidRepeat', 'sound', 'pitchClasses'];
const persist = () => store.save(settings, stats);
const systemTheme = matchMedia('(prefers-color-scheme: dark)');
function applyAppearance() {
  const theme = settings.theme === 'system' ? (systemTheme.matches ? 'dark' : 'light') : settings.theme;
  document.documentElement.dataset.theme = theme;
  document.documentElement.dataset.animations = String(settings.animations);
  document.querySelector('meta[name=theme-color]').content = theme === 'dark' ? '#111a18' : '#f5f4ef';
}
systemTheme.addEventListener('change', applyAppearance);
function stopAudio() {
  playbackId++; audioBusy = false; clearTimeout(animationTimer);
  playingReference = null;
  clearTimeout(pianoTrainingTimer);
  if (pianoTrainingNote !== null) { sharedPiano.noteOff(pianoTrainingNote, .04); pianoTrainingNote = null; }
  audio.stop(); $('training').classList.remove('playing'); $('play').disabled = completed;
}
function beginQuestion() {
  stopAudio();
  if (!session) session = { blind: settings.blind, length: settings.length, details: settings.details, started: new Date().toISOString() };
  const candidates=Array.from({length:settings.max-settings.min+1},(_,i)=>settings.min+i).filter(midi=>settings.pitchClasses.includes(pitchClass(midi)));
  const pool=settings.avoidRepeat&&candidates.length>1?candidates.filter(midi=>midi!==previous):candidates;
  const note=pool[Math.floor(crypto.getRandomValues(new Uint32Array(1))[0]/4294967296*pool.length)] ?? chooseNote(settings.min,settings.max,previous,settings.avoidRepeat);
  previous = note;
  question = { note, played: false, answered: false, answer: null };
  render();
}
function render() {
  const blind = session?.blind ?? settings.blind;
  $('mode-label').textContent = blind ? `BLIND SESSION · ${Math.min(answers.length + (completed ? 0 : 1), session?.length ?? settings.length)} OF ${session?.length ?? settings.length}` : 'LISTEN · RECOGNIZE · REPEAT';
  $('question-title').textContent = completed ? 'Session complete.' : 'Find the note.';
  $('question-subtitle').textContent = blind ? 'Trust your ear. Results stay hidden until the end.' : settings.sound === 'piano' ? 'One piano note. Twelve possibilities.' : 'One pure tone. Twelve possibilities.';
  $('play-label').textContent = question?.played ? 'Play Again' : 'Play Note';
  $('play').disabled = audioBusy || completed;
  $('play-help').textContent = completed ? 'Start a new session whenever you’re ready.' : question?.played ? 'Replay as often as you like.' : 'Listen, then choose a note below.';
  if (playingReference !== null) $('play-help').textContent = playingReference ? `Playing reference ${noteName(settings.referenceNote)}.` : 'Playing the training note…';
  $('reference').hidden = !settings.reference || completed;
  $('reference').textContent = `Reference · ${noteName(settings.referenceNote)}`;
  $('headphones').hidden = !(settings.min < 48 || (settings.reference && settings.referenceNote < 48));
  const feedback = $('feedback'); feedback.className = 'feedback';
  if (completed) feedback.textContent = 'Your session results are ready.';
  else if (!question?.played) feedback.textContent = 'Tap Play Note to begin.';
  else if (!question.answered) feedback.textContent = 'Which pitch class did you hear?';
  else if (blind) feedback.textContent = 'Answer saved. Continue when you’re ready.';
  else {
    const correct = isCorrect(question.note, question.answer);
    feedback.textContent = correct ? `Correct — ${noteName(question.note)}.` : `You chose ${NOTES[question.answer]}. The note was ${noteName(question.note)}.`;
    if (settings.feedback) feedback.classList.add(correct ? 'good' : 'bad');
  }
  for (const button of $('notes').children) {
    const value = Number(button.dataset.answer);
    button.disabled = !question?.played || question.answered || completed;
    button.className = `note-button${NOTES[value].includes('♯') ? ' sharp' : ''}`;
    button.setAttribute('aria-pressed', String(question?.answered && question.answer === value));
    if (question?.answered && !completed) {
      if (question.answer === value) button.classList.add('selected');
      if (!blind && settings.feedback) {
        if (pitchClass(question.note) === value) button.classList.add('correct');
        else if (question.answer === value) button.classList.add('incorrect');
      }
    }
  }
  $('next').hidden = !question?.answered && !completed;
  $('next').textContent = completed ? 'Start a new session →' : blind && answers.length === session?.length ? 'See results →' : 'Next Note →';
  $('end-session').hidden = completed || blind || !answers.length;
  // Never expose persistent accuracy or streaks during an active blind session.
  const metrics = [];
  if (!blind && !completed && settings.score && answers.length) {
    const summary = summarize(answers); metrics.push(`${summary.correct}/${summary.total} · ${summary.accuracy}% this session`);
  }
  if (!blind && !completed && settings.mainStreak && settings.collect) metrics.push(`Streak ${stats.streak.current}`);
  $('main-metrics').textContent = metrics.join('   ·   ');
  $('main-metrics').hidden = !metrics.length;
}
async function playTone(reference = false) {
  if (completed || document.hidden) return;
  if (!reference && !question) beginQuestion();
  const current = question;
  const id = ++playbackId;
  audioBusy = true; $('play').disabled = true;
  try {
    const midi = reference ? settings.referenceNote : current.note;
    let played;
    if (settings.sound === 'piano') {
      audio.stop();
      $('play-help').textContent = 'Preparing Grand Piano samples (first use may take a while)…';
      await sharedPiano.load((done,total)=>{
        if(id===playbackId) $('play-help').textContent = 'Preparing Grand Piano samples '+done+'/'+total+'…';
      });
      if (id !== playbackId || document.hidden) return;
      await sharedPiano.resume();
      if (id !== playbackId || document.hidden) return;
      if (pianoTrainingNote !== null) sharedPiano.noteOff(pianoTrainingNote, .04);
      sharedPiano.noteOn(midi);
      pianoTrainingNote = midi;
      pianoTrainingTimer = setTimeout(() => {
        if (id === playbackId && pianoTrainingNote === midi) {
          sharedPiano.noteOff(midi); pianoTrainingNote = null;
        }
      }, settings.duration * 1000);
      played = true;
    } else {
      played = await audio.play(midi, settings.duration);
    }
    if (!played || id !== playbackId || document.hidden) return;
    if (!reference && question === current) current.played = true;
    playingReference = reference;
    $('training').classList.add('playing');
    $('play-help').textContent = reference ? `Playing reference ${noteName(settings.referenceNote)}.` : 'Playing the training note…';
    render();
    $('play-help').textContent = reference ? `Playing reference ${noteName(settings.referenceNote)}.` : 'Playing the training note…';
    animationTimer = setTimeout(() => { if (id === playbackId) { playingReference = null; $('training').classList.remove('playing'); render(); } }, settings.duration * 1000 + 50);
  } catch (error) { if (id === playbackId) { warning(error.message || 'Audio could not start. Tap Play Note again.'); $('play-help').textContent = 'Piano samples unavailable. Check your connection and try again.'; } }
  finally { if (id === playbackId) { audioBusy = false; render(); } }
}
function submitAnswer(answer) {
  if (!question?.played || question.answered || completed) return;
  question.answered = true; question.answer = answer;
  stopAudio();
  answers.push({ note: question.note, answer, collected: settings.collect });
  if (settings.collect) { recordAnswer(stats, question.note, answer); persist(); }
  render();
  if (session.blind && answers.length === session.length) finishSession();
}
function finishSession() {
  if (completed || !answers.length) return;
  stopAudio(); completed = true;
  const summary = summarize(answers);
  if (settings.collect && settings.saveHistory && answers.every(row => row.collected)) {
    stats.history.push({ date: new Date().toISOString(), total: summary.total, correct: summary.correct, blind: session.blind });
    stats.history = stats.history.slice(-100); persist();
  }
  const content = $('results-content'); content.replaceChildren();
  const summaryDiv = document.createElement('div'); summaryDiv.className = 'result-summary';
  summaryDiv.innerHTML = `<div class="big-result">${summary.accuracy}%</div><p>${summary.correct} correct out of ${summary.total} questions</p><p class="micro">${settings.collect ? 'Collected answers are saved on this device.' : 'Persistent statistics collection is off.'}</p>`;
  content.append(summaryDiv);
  if (session.details) {
    const details = document.createElement('details'); details.open = true;
    const label = document.createElement('summary'); label.className = 'details-toggle'; label.textContent = 'Question-by-question results'; details.append(label);
    const table = document.createElement('table'); table.innerHTML = '<thead><tr><th scope="col">#</th><th scope="col">Actual</th><th scope="col">Your answer</th><th scope="col">Result</th></tr></thead>';
    const body = document.createElement('tbody');
    answers.forEach((row, i) => { const tr = document.createElement('tr'); [i + 1, noteName(row.note), NOTES[row.answer], isCorrect(row.note, row.answer) ? 'Correct' : 'Incorrect'].forEach(value => { const td = document.createElement('td'); td.textContent = value; tr.append(td); }); body.append(tr); });
    table.append(body); details.append(table); content.append(details);
  }
  render(); $('results-dialog').showModal();
}
function newSession() { stopAudio(); answers = []; session = null; question = null; completed = false; render(); }
NOTES.forEach((name, i) => {
  const button = document.createElement('button'); button.textContent = name; button.dataset.answer = i;
  button.setAttribute('aria-label', name.replace('♯', ' sharp'));
  button.addEventListener('click', () => submitAnswer(i)); $('notes').append(button);
});
$('play').addEventListener('click', () => playTone());
$('reference').addEventListener('click', () => playTone(true));
$('next').addEventListener('click', () => {
  if (completed) { newSession(); beginQuestion(); }
  else if (question?.answered) beginQuestion();
  else return;
  if (settings.autoplay) playTone();
});
$('end-session').addEventListener('click', finishSession);
$('results-close').addEventListener('click', () => $('results-dialog').close());
$('new-session').addEventListener('click', () => { $('results-dialog').close(); newSession(); });

const noteOptions = Array.from({ length: MAX_NOTE - MIN_NOTE + 1 }, (_, i) => [MIN_NOTE + i, noteName(MIN_NOTE + i)]);
function section(title, help) {
  const node = document.createElement('section'); node.className = 'settings-section';
  const heading = document.createElement('h3'); heading.textContent = title; node.append(heading);
  if (help) { const p = document.createElement('p'); p.className = 'section-help'; p.textContent = help; node.append(p); }
  $('settings-fields').append(node); return node;
}
function field(parent, key, label, options) {
  const row = document.createElement('label'); row.className = 'field';
  const text = document.createElement('span'); text.textContent = label; row.append(text);
  const input = document.createElement(options ? 'select' : 'input'); input.name = key; input.id = `setting-${key}`;
  if (options) { options.forEach(([value, title]) => { const option = document.createElement('option'); option.value = value; option.textContent = title; input.append(option); }); input.value = settings[key]; }
  else { input.type = 'checkbox'; input.checked = settings[key]; }
  row.append(input); parent.append(row);
}
function buildSettings() {
  $('settings-fields').replaceChildren();
  let parent = section('Training');
  field(parent, 'sound', 'Sound', [['sine', 'Sine wave'], ['piano', 'Grand Piano']]);
  field(parent, 'min', 'Minimum note', noteOptions); field(parent, 'max', 'Maximum note', noteOptions);
  const pitchBox=document.createElement('div'); pitchBox.className='pitch-picker';
  const pitchTitle=document.createElement('strong'); pitchTitle.textContent='Notes to test';
  const pitchHelp=document.createElement('p'); pitchHelp.className='section-help'; pitchHelp.textContent='Choose which notes can be played. At least one must stay selected.';
  const pitchGrid=document.createElement('div'); pitchGrid.className='pitch-picker-grid';
  NOTES.forEach((name,i)=>{const b=document.createElement('button');b.type='button';b.className='pitch-picker-button';b.textContent=name;b.dataset.pitch=String(i);b.setAttribute('aria-pressed',String(settings.pitchClasses.includes(i)));b.addEventListener('click',()=>{const selected=[...pitchGrid.children].filter(x=>x.getAttribute('aria-pressed')==='true');if(b.getAttribute('aria-pressed')==='true'&&selected.length===1)return;b.setAttribute('aria-pressed',String(b.getAttribute('aria-pressed')!=='true'));});pitchGrid.append(b);});
  pitchBox.append(pitchTitle,pitchHelp,pitchGrid);parent.append(pitchBox);
  field(parent, 'duration', 'Tone duration', [[0.5, '0.5 seconds'], [1, '1 second'], [2, '2 seconds'], [4, '4 seconds']]);
  field(parent, 'blind', 'Blind training mode'); field(parent, 'length', 'Blind session length', [[10, '10 questions'], [20, '20 questions'], [50, '50 questions']]);
  field(parent, 'details', 'Detailed session results'); field(parent, 'reference', 'Enable reference note'); field(parent, 'referenceNote', 'Reference note', noteOptions);
  field(parent, 'autoplay', 'Play note when tapping Next'); field(parent, 'avoidRepeat', 'Avoid consecutive exact repeats');
  parent = section('Statistics', 'Collection is off by default. Turning it on records only future answers; earlier answers are never added. Existing records remain when collection is turned off. Blind-session scores always work.');
  [['collect', 'Collect statistics'], ['overall', 'Show overall accuracy'], ['byNote', 'Show accuracy by note'], ['current', 'Show current streak'], ['longest', 'Show longest streak'], ['matrix', 'Show confusion matrix'], ['history', 'Show session history'], ['saveHistory', 'Save completed session history']].forEach(([key, title]) => field(parent, key, title));
  const resetRow = document.createElement('div'); resetRow.className = 'reset-row';
  [['all', 'Reset all statistics'], ['overall', 'Overall'], ['byNote', 'By note'], ['streak', 'Streaks'], ['matrix', 'Matrix'], ['history', 'History']].forEach(([key, label]) => {
    const button = document.createElement('button'); button.type = 'button'; button.className = 'danger'; button.textContent = label; button.dataset.reset = key;
    button.addEventListener('click', () => {
      if (session?.blind && !completed && answers.length) { alert('Finish your blind session before resetting statistics.'); return; }
      if (confirm(`Reset ${key === 'all' ? 'all saved statistics' : label.toLowerCase() + ' statistics'}? This cannot be undone. Settings and current session results will stay unchanged.`)) {
        stats = resetStats(stats, key); persist(); render(); button.textContent = `${label} reset`;
      }
    }); resetRow.append(button);
  }); parent.append(resetRow);
  parent = section('Training display');
  [['score', 'Score on main screen'], ['mainStreak', 'Streak on main screen'], ['feedback', 'Visual feedback colors']].forEach(([key, label]) => field(parent, key, label));
  parent = section('About'); parent.classList.add('about');
  parent.innerHTML += `<p><strong>Perfect Pitch Trainer · Version 1.0.0</strong></p><p>Identify one of twelve pitch classes. Every octave of C counts as C. Choose sine waves or sampled Grand Piano tones, tuned to A4 = 440 Hz. Piano samples require an internet connection for their first load. This is a practice tool, not a guarantee of acquiring perfect pitch.</p><p>Offline: once “Ready for offline use” appears, the app’s essential files are cached. Install it from Safari’s Share menu → Add to Home Screen. Check this status again inside the installed app.</p><p>Privacy: settings and statistics stay in your browser on this device. No accounts, advertising, analytics, external APIs, or uploaded training data. The host receives ordinary requests for app files when online. Clearing website data, removing the app, or browser cache eviction can remove local progress and offline access. Devices do not sync.</p><p>Updates: a new version downloads in the background while online. Tap “Update available” when you are ready to restart. Settings and statistics are preserved.</p><p>History stores up to 100 completed sessions when collection stayed on for every answer and saving history is on at completion. Partially uncollected sessions are never saved. Turning collection off resets the current persistent streak. Statistics resets are independent; resetting one does not rewrite others.</p>`;
  validateRange();
}
function validateRange() {
  const min = $('setting-min'), max = $('setting-max');
  const invalid = Number(min.value) > Number(max.value);
  min.setCustomValidity(invalid ? 'The minimum note must not be higher than the maximum note.' : '');
  max.setCustomValidity(invalid ? 'The maximum note must not be lower than the minimum note.' : '');
}
$('settings-open').addEventListener('click', () => {
  // This handler belongs exclusively to the Perfect Pitch module.
  if ($('training').hidden) return;
  stopAudio(); buildSettings(); $('settings-dialog').showModal();
});
$('settings-close').addEventListener('click', () => $('settings-dialog').close());
$('settings-fields').addEventListener('change', validateRange);
$('settings-form').addEventListener('submit', event => {
  event.preventDefault(); validateRange(); if (!event.target.reportValidity()) return;
  const next = { ...settings };
  for (const input of event.target.elements) {
    if (!(input.name in settings)) continue;
    next[input.name] = input.type === 'checkbox' ? input.checked : typeof settings[input.name] === 'number' ? Number(input.value) : input.value;
  }
  next.pitchClasses=[...document.querySelectorAll('.pitch-picker-button[aria-pressed="true"]')].map(b=>Number(b.dataset.pitch));
  if(!next.pitchClasses.length)return;
  if(!Array.from({length:next.max-next.min+1},(_,i)=>next.min+i).some(m=>next.pitchClasses.includes(pitchClass(m)))){alert('No selected notes fall within your minimum and maximum note range.');return;}
  const draftTraining = trainingKeys.some(key => key==='pitchClasses' ? next.pitchClasses.join(',')!==settings.pitchClasses.join(',') : next[key] !== settings[key]);
  if (draftTraining && (question?.played || answers.length) && !completed) {
    if (!confirm('Changing training settings starts a fresh session. Current session results will be cleared; already collected statistics remain. Apply these settings?')) return;
  }
  if (settings.collect && !next.collect) stats.streak.current = 0;
  settings = next;
  if (draftTraining) newSession();
  persist(); applyAppearance(); render(); $('settings-dialog').close();
});
$('statistics-open').addEventListener('click', () => {
  if (session?.blind && !completed) { alert('Statistics are hidden until your blind session finishes.'); return; }
  renderStats(); $('stats-dialog').showModal();
});
$('stats-close').addEventListener('click', () => $('stats-dialog').close());
function statSection(title) {
  const node = document.createElement('section'); node.className = 'stat-section';
  const h = document.createElement('h3'); h.textContent = title; node.append(h); $('stats-content').append(node); return node;
}
function values(parent, items) {
  const div = document.createElement('div'); div.className = 'stat-values';
  items.forEach(([value, label]) => { const item = document.createElement('div'); const strong = document.createElement('strong'); strong.textContent = value; const span = document.createElement('span'); span.textContent = label; item.append(strong, span); div.append(item); }); parent.append(div);
}
function renderStats() {
  $('stats-content').replaceChildren();
  const enabled = ['overall', 'byNote', 'current', 'longest', 'matrix', 'history'].some(key => settings[key]);
  const info = document.createElement('p'); info.className = 'empty'; info.textContent = enabled ? `Collection ${settings.collect ? 'on' : 'off'}. These are saved statistics from this device.` : 'Statistics are hidden by default. Enable the views you want in Settings, and turn on collection to record future answers.'; $('stats-content').append(info);
  if (settings.overall) values(statSection('Overall accuracy'), [[`${accuracy(stats.overall.correct, stats.overall.total)}%`, 'accuracy'], [stats.overall.correct, 'correct'], [stats.overall.total, 'answered']]);
  if (settings.current || settings.longest) {
    const items = []; if (settings.current) items.push([stats.streak.current, 'current streak']); if (settings.longest) items.push([stats.streak.longest, 'longest streak']); values(statSection('Streaks'), items);
  }
  if (settings.byNote) {
    const parent = statSection('Accuracy by pitch class'); const bars = document.createElement('div'); bars.className = 'note-bars';
    stats.byNote.forEach((row, i) => { const div = document.createElement('div'); div.className = 'note-bar'; const pct = accuracy(row.correct, row.total); div.innerHTML = `<strong>${NOTES[i]}</strong><div class="bar-track"><div class="bar-fill" style="width:${pct}%"></div></div><small>${row.total ? pct + '%' : '—'} · ${row.correct}/${row.total}</small>`; div.setAttribute('aria-label', `${NOTES[i]}: ${row.correct} correct out of ${row.total}, ${pct} percent`); bars.append(div); }); parent.append(bars);
  }
  if (settings.matrix) {
    const parent = statSection('Note confusions');
    // A compact per-note view makes the full matrix useful without requiring
    // horizontal scrolling. The full accessible table is also available.
    const actual = document.createElement('select'); actual.setAttribute('aria-label', 'Actual pitch class to inspect'); actual.style.minHeight = '44px';
    NOTES.forEach((name, i) => { const option = document.createElement('option'); option.value = i; option.textContent = `Actual: ${name}`; actual.append(option); });
    const list = document.createElement('p'); list.className = 'section-help';
    const inspect = () => { const row = stats.matrix[Number(actual.value)]; list.textContent = row.some(Boolean) ? row.map((count, i) => `${NOTES[i]}: ${count}`).join(' · ') : 'No recorded answers for this note.'; };
    actual.addEventListener('change', inspect); parent.append(actual, list); inspect();
    const confusions = []; stats.matrix.forEach((row, i) => row.forEach((count, j) => { if (i !== j && count) confusions.push({ count, i, j }); })); confusions.sort((a, b) => b.count - a.count);
    const most = document.createElement('p'); most.className = 'section-help'; most.textContent = confusions.length ? 'Most frequent: ' + confusions.slice(0, 3).map(row => `${NOTES[row.i]} → ${NOTES[row.j]} (${row.count})`).join('; ') : 'No confusions recorded yet.'; parent.append(most);
    const details = document.createElement('details'); details.innerHTML = '<summary class="details-toggle">Full 12 × 12 matrix</summary><p class="micro">Rows = actual note. Columns = your answer. Swipe the table sideways.</p>';
    const scroll = document.createElement('div'); scroll.className = 'table-scroll'; scroll.tabIndex = 0; scroll.setAttribute('aria-label', 'Scrollable confusion matrix'); const table = document.createElement('table'); table.className = 'matrix-table';
    table.innerHTML = '<thead><tr><th scope="col">Actual ↓</th>' + NOTES.map(name => `<th scope="col">${name}</th>`).join('') + '</tr></thead>';
    const body = document.createElement('tbody'); stats.matrix.forEach((row, i) => { const tr = document.createElement('tr'); tr.innerHTML = `<th scope="row">${NOTES[i]}</th>`; row.forEach((count, j) => { const td = document.createElement('td'); td.textContent = count; if (count) td.className = i === j ? 'filled' : 'confused'; tr.append(td); }); body.append(tr); }); table.append(body); scroll.append(table); details.append(scroll); parent.append(details);
  }
  if (settings.history) {
    const parent = statSection('Session history');
    if (!stats.history.length) { const p = document.createElement('p'); p.className = 'empty'; p.textContent = 'No saved sessions. Enable collection and “Save completed session history”, then finish a session.'; parent.append(p); }
    [...stats.history].reverse().forEach(row => { const div = document.createElement('div'); div.className = 'history-row'; const date = document.createElement('strong'); date.textContent = new Date(row.date).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' }); const meta = document.createElement('small'); meta.textContent = `${row.blind ? 'Blind' : 'Practice'} · ${row.total} questions · ${accuracy(row.correct, row.total)}% accuracy`; div.append(date, meta); parent.append(div); });
  }
}
// Dialogs have focus trapping and Escape support supplied by the browser.
for (const dialog of document.querySelectorAll('dialog')) dialog.addEventListener('close', stopAudio);
document.addEventListener('visibilitychange', () => {
  if (document.hidden) { stopAudio(); audio.deactivate(); }
  else { checkUpdates(); }
});
window.addEventListener('pagehide', () => { stopAudio(); audio.deactivate(); });
window.addEventListener('blur', stopAudio);

let registration, waitingWorker, reloading = false;
function offerUpdate() {
  if (!registration?.waiting) return;
  waitingWorker = registration.waiting; $('update').hidden = false;
}
async function checkUpdates() {
  if (registration && navigator.onLine) { try { await registration.update(); offerUpdate(); } catch { /* Keep cached app usable. */ } }
}
async function checkOffline() {
  const active = registration?.active;
  if (!active) return;
  const channel = new MessageChannel();
  channel.port1.onmessage = event => {
    const ready = event.data?.ready === true;
    $('offline-status').textContent = ready ? 'Ready for offline use' : 'Offline cache incomplete. Reopen online.';
    $('offline-dot').classList.toggle('ready', ready); channel.port1.close();
  };
  active.postMessage({ type: 'CHECK_CACHE' }, [channel.port2]);
}
$('update').addEventListener('click', () => {
  if (!waitingWorker) return;
  if (!confirm('Update and restart the app now? The current question and unfinished session will be cleared. Saved settings and statistics remain.')) return;
  reloading = true; stopAudio(); waitingWorker.postMessage({ type: 'SKIP_WAITING' });
});
async function setupOffline() {
  if (!('serviceWorker' in navigator)) { $('offline-status').textContent = 'Offline mode unavailable in this browser'; return; }
  try {
    registration = await navigator.serviceWorker.register('./service-worker.js', { scope: './', updateViaCache: 'none' });
    offerUpdate();
    registration.addEventListener('updatefound', () => {
      const worker = registration.installing;
      worker?.addEventListener('statechange', () => { if (worker.state === 'installed') { offerUpdate(); checkOffline(); } });
    });
    navigator.serviceWorker.addEventListener('controllerchange', () => { if (reloading) location.reload(); else checkOffline(); });
    await navigator.serviceWorker.ready; checkOffline();
  } catch { $('offline-status').textContent = 'Offline setup failed. Reopen online using HTTPS.'; }
}
window.addEventListener('online', () => { checkUpdates(); checkOffline(); });
document.addEventListener('musiclab:request-general-settings', () => {
  document.dispatchEvent(new CustomEvent('musiclab:general-settings', { detail: { theme: settings.theme, animations: settings.animations } }));
});
document.addEventListener('musiclab:save-general-settings', event => {
  const { theme, animations } = event.detail || {};
  if (!['system', 'light', 'dark'].includes(theme) || typeof animations !== 'boolean') return;
  settings = { ...settings, theme, animations };
  persist();
  applyAppearance();
});
applyAppearance(); render(); setupOffline();
