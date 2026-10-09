// Standalone navigation: leave the Perfect Pitch training engine and storage untouched.
const home = document.getElementById('home');
const training = document.getElementById('training');
const navigation = document.getElementById('training-navigation');
const settingsButton = document.getElementById('settings-open');
const brand = document.querySelector('.brand');
function show(view) {
  const inTraining = view === 'perfect-pitch';
  home.hidden = inTraining;
  training.hidden = !inTraining;
  navigation.hidden = !inTraining;
  settingsButton.hidden = !inTraining;
  if (!inTraining) {
    // Close settings/stats/results sheets if navigating home.
    document.querySelectorAll('dialog[open]').forEach(dialog => dialog.close());
  }
  window.scrollTo(0, 0);
}
document.getElementById('open-perfect-pitch').addEventListener('click', () => show('perfect-pitch'));
document.getElementById('back-home').addEventListener('click', () => show('home'));
document.getElementById('open-piano').addEventListener('click', () => {
  // Piano will be implemented after the home design has been approved.
  document.getElementById('open-piano').blur();
});
brand.addEventListener('click', event => { event.preventDefault(); show('home'); });
show('home');
