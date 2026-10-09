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
  settingsButton.hidden = false;
  settingsButton.setAttribute('aria-label', inTraining ? 'Perfect Pitch settings' : 'General settings');
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
const generalDialog = document.getElementById('general-settings-dialog');
const generalForm = document.getElementById('general-settings-form');
settingsButton.addEventListener('click', () => {
  if (training.hidden) {
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
