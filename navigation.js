// Standalone navigation: leave the Perfect Pitch training engine and storage untouched.
const home = document.getElementById('home');
const training = document.getElementById('training');
const piano = document.getElementById('piano-stage');
const tuner = document.getElementById('tuner-stage');
const metronome = document.getElementById('metronome-stage');
const synth = document.getElementById('synth-stage');
const drums = document.getElementById('drums-stage');
const navigation = document.getElementById('training-navigation');
const settingsButton = document.getElementById('settings-open');
const brand = document.querySelector('.brand');
function show(view) {
  const inTraining = view === 'perfect-pitch';
  const inPiano = view === 'piano';
  const inTuner = view === 'tuner';
  const inMetronome = view === 'metronome';
  const inSynth = view === 'synth';
  const inDrums = view === 'drums';
  home.hidden = inTraining || inPiano || inTuner || inMetronome || inSynth || inDrums;
  training.hidden = !inTraining;
  piano.hidden = !inPiano;
  tuner.hidden = !inTuner;
  metronome.hidden = !inMetronome;
  synth.hidden = !inSynth;
  drums.hidden = !inDrums;
  navigation.hidden = !inTraining;
  settingsButton.hidden = inPiano || inTuner || inMetronome || inSynth || inDrums;
  if (!inMetronome) document.dispatchEvent(new Event('musiclab:metronome-hidden'));
  if (!inSynth) document.dispatchEvent(new Event('musiclab:synth-hidden'));
  if (!inDrums) document.dispatchEvent(new Event('musiclab:drums-hidden'));
  if (!inTuner) document.dispatchEvent(new Event('musiclab:tuner-hidden'));
  if (!inPiano) document.dispatchEvent(new Event('musiclab:piano-hidden'));
  settingsButton.setAttribute('aria-label', inTraining ? 'Perfect Pitch settings' : 'General settings');
  if (!inTraining) {
    // Close settings/stats/results sheets if navigating home.
    document.querySelectorAll('dialog[open]').forEach(dialog => dialog.close());
  }
  window.scrollTo(0, 0);
}
document.getElementById('open-perfect-pitch').addEventListener('click', () => show('perfect-pitch'));
document.getElementById('back-home').addEventListener('click', () => show('home'));
document.getElementById('open-piano').addEventListener('click', () => show('piano'));
document.getElementById('open-tuner').addEventListener('click', () => show('tuner'));
document.getElementById('tuner-back').addEventListener('click', () => show('home'));
document.getElementById('open-metronome').addEventListener('click', () => show('metronome'));
document.getElementById('open-synth').addEventListener('click', () => show('synth'));
document.getElementById('open-drums').addEventListener('click', () => show('drums'));
document.getElementById('drums-back').addEventListener('click', () => show('home'));
document.getElementById('synth-back').addEventListener('click', () => show('home'));
document.getElementById('metronome-back').addEventListener('click', () => show('home'));
document.querySelectorAll('.piano-return').forEach(button => button.addEventListener('click', () => show('home')));
brand.addEventListener('click', event => { event.preventDefault(); show('home'); });
const generalDialog = document.getElementById('general-settings-dialog');
const generalForm = document.getElementById('general-settings-form');
settingsButton.addEventListener('click', () => {
  if (!training.hidden || !piano.hidden) return;
  {
    document.dispatchEvent(new Event('musiclab:request-general-settings'));
    generalDialog.showModal();
  }
});
document.addEventListener('musiclab:general-settings', event => {
  generalForm.elements.theme.value = event.detail.theme;
  generalForm.elements.animations.checked = event.detail.animations;
});
generalForm.addEventListener('submit', event => {
  event.preventDefault();
  document.dispatchEvent(new CustomEvent('musiclab:save-general-settings', { detail: {
    theme: generalForm.elements.theme.value,
    animations: generalForm.elements.animations.checked
  } }));
  generalDialog.close();
});
document.getElementById('general-settings-close').addEventListener('click', () => generalDialog.close());
show('home');
