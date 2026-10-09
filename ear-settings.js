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

export const EAR_PRACTICE_KEY='eriks-music-lab:ear-practice:v1';
export const DEFAULT_EAR_PRACTICE=Object.freeze({autoPlayNext:false,tapAnywhereNext:false,autoPlayLesson:false});
export function getEarPractice(){
 try{const raw=JSON.parse(localStorage.getItem(EAR_PRACTICE_KEY)||'{}');const out={...DEFAULT_EAR_PRACTICE};for(const k of Object.keys(out))if(typeof raw?.[k]==='boolean')out[k]=raw[k];return out}catch{return {...DEFAULT_EAR_PRACTICE}}
}
export function setEarPractice(input){
 const out={...DEFAULT_EAR_PRACTICE};
 for(const k of Object.keys(out))out[k]=input?.[k]===true;
 try{localStorage.setItem(EAR_PRACTICE_KEY,JSON.stringify(out))}catch{return false}
 return true;
}
