// Shared Ear Trainer sound preference, independent of individual exercise settings.
export const EAR_SOUND_KEY='eriks-music-lab:ear-sound:v1';
export function getEarSound(){
 try {
  const saved=localStorage.getItem(EAR_SOUND_KEY);
  if(saved==='piano'||saved==='sine')return saved;
  const legacy=JSON.parse(localStorage.getItem('perfect-pitch-trainer:v1')||'null');
  return legacy?.settings?.sound==='piano'?'piano':'sine';
 }catch{return 'sine'}
}
export function setEarSound(sound){
 if(sound!=='piano'&&sound!=='sine')return false;
 try{localStorage.setItem(EAR_SOUND_KEY,sound)}catch{return false}
 document.dispatchEvent(new CustomEvent('musiclab:ear-sound-changed',{detail:{sound}}));
 return true;
}
