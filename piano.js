import {sharedPiano as engine} from './piano-audio.js';
const viewport = document.getElementById('piano-viewport');
const keyboard = document.getElementById('piano-keyboard');
const status = document.getElementById('piano-status');
const start = document.getElementById('piano-start');
// Piano-only settings, stored separately from Perfect Pitch statistics.
const PIANO_SETTINGS_KEY='eriks-music-lab:piano-settings:v1';
let pianoSound='piano';
try { if(JSON.parse(localStorage.getItem(PIANO_SETTINGS_KEY))?.sound==='sine') pianoSound='sine'; } catch {}
const sineContext=window.AudioContext||window.webkitAudioContext;
let sineAudio=null;
const sineVoices=new Map();
function sineOff(midi){
  const voice=sineVoices.get(midi);
  if(!voice)return;
  sineVoices.delete(midi);
  const now=sineAudio.currentTime;
  voice.gain.gain.cancelScheduledValues(now);
  voice.gain.gain.setTargetAtTime(0,now,.018);
  try{voice.osc.stop(now+.12);}catch{}
}
function sineOn(midi){
  if(!sineContext)return;
  sineAudio ||= new sineContext({latencyHint:'interactive'});
  if(sineAudio.state==='suspended')sineAudio.resume().catch(()=>{});
  sineOff(midi);
  const now=sineAudio.currentTime;
  const osc=sineAudio.createOscillator(),gain=sineAudio.createGain();
  osc.type='sine';osc.frequency.value=440*2**((midi-69)/12);
  gain.gain.setValueAtTime(0,now);
  gain.gain.linearRampToValueAtTime(.18,now+.012);
  osc.connect(gain).connect(sineAudio.destination);
  osc.onended=()=>{osc.disconnect();gain.disconnect();};
  sineVoices.set(midi,{osc,gain});
  osc.start(now);
}
const toolbar=document.querySelector('.piano-toolbar');
const pianoSettingsButton=document.createElement('button');
pianoSettingsButton.type='button';
pianoSettingsButton.className='piano-settings-button icon-button';
pianoSettingsButton.innerHTML="<svg viewBox=\"0 0 24 24\" width=\"23\" height=\"23\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.7\" aria-hidden=\"true\"><path d=\"m9 3-.7 2.2-2 .9-2.1-.5-2 3.4 1.5 1.7v2.6L2.2 15l2 3.4 2.1-.5 2 .9L9 21h4l.7-2.2 2-.9 2.1.5 2-3.4-1.5-1.7v-2.6l1.5-1.7-2-3.4-2.1.5-2-.9L13 3Z\"/><circle cx=\"11\" cy=\"12\" r=\"3\"/></svg>";
pianoSettingsButton.setAttribute('aria-label','Piano settings');
toolbar.querySelector('.piano-toolbar-spacer')?.replaceWith(pianoSettingsButton);
const portraitSettingsButton=pianoSettingsButton.cloneNode(true);
document.querySelector('.piano-portrait-nav')?.append(portraitSettingsButton);
const pianoSettingsDialog=document.createElement('dialog');
pianoSettingsDialog.className='sheet piano-settings-dialog';
const pianoSettingsForm=document.createElement('form');
pianoSettingsForm.method='dialog';
const pianoSettingsHeading=document.createElement('h2');
pianoSettingsHeading.textContent='Piano Settings';
const pianoSoundLabel=document.createElement('label');
pianoSoundLabel.className='field';
const pianoSoundTitle=document.createElement('span');
pianoSoundTitle.textContent='Sound';
const pianoSoundSelect=document.createElement('select');
pianoSoundSelect.setAttribute('aria-label','Piano sound');
for(const [value,title] of [['piano','Grand Piano'],['sine','Sine wave']]){
  const option=document.createElement('option');
  option.value=value;option.textContent=title;pianoSoundSelect.append(option);
}
pianoSoundSelect.value=pianoSound;
pianoSoundLabel.append(pianoSoundTitle,pianoSoundSelect);
const pianoSettingsSave=document.createElement('button');
pianoSettingsSave.className='primary';
pianoSettingsSave.textContent='Save settings';
pianoSettingsForm.append(pianoSettingsHeading,pianoSoundLabel,pianoSettingsSave);
pianoSettingsDialog.append(pianoSettingsForm);
document.body.append(pianoSettingsDialog);
for(const button of [pianoSettingsButton,portraitSettingsButton]) button.addEventListener('click',()=>pianoSettingsDialog.showModal());
function refreshPianoSound(){
  start.hidden=pianoSound==='sine'||engine.buffers.size>0;
  status.textContent=pianoSound==='sine'?'Sine wave · Swipe to explore the keyboard':
    engine.buffers.size?'Grand Piano · Swipe to explore the keyboard':'Tap Load Piano to prepare the instrument.';
}
pianoSettingsForm.addEventListener('submit',()=>{
  for(const midi of [...sineVoices.keys()])sineOff(midi);
  engine.allNotesOff();
  pianoSound=pianoSoundSelect.value;
  try{localStorage.setItem(PIANO_SETTINGS_KEY,JSON.stringify({sound:pianoSound}));}catch{}
  refreshPianoSound();
});
refreshPianoSound();
const notes = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];
const blackNotes = new Set([1,3,6,8,10]);
const FIRST = 36; // C3
const LAST = 95; // B7
const WHITE_WIDTH = 46;
const BLACK_WIDTH = 29;
const pointers = new Map();
let harmonyModule=null;
import('./piano-harmony.js').then(m=>{harmonyModule=m;drawNotation();});
// Polyphonic notation displays every held MIDI note.

const notationPanel=document.createElement('section');
notationPanel.className='piano-notation';
notationPanel.setAttribute('aria-label','Live piano sheet music');
notationPanel.innerHTML='<div class="piano-notation-heading"><strong>LIVE NOTATION</strong><span id="piano-current-note" aria-live="off">Play a key</span></div><svg id="piano-staff" viewBox="0 0 360 188" role="img" aria-label="Treble and bass staves"><g id="piano-staff-lines"></g><g id="piano-staff-notes"></g></svg>';
document.querySelector('.piano-landscape .piano-toolbar')?.after(notationPanel);
const staffLines=notationPanel.querySelector('#piano-staff-lines');
const staffNotes=notationPanel.querySelector('#piano-staff-notes');
const NS='http://www.w3.org/2000/svg';
function svgEl(tag,attrs,parent){const el=document.createElementNS(NS,tag);for(const [k,v] of Object.entries(attrs))el.setAttribute(k,String(v));parent.append(el);return el;}
for(const [label,top,glyph] of [['TREBLE',24,'𝄞'],['BASS',110,'𝄢']]){
  for(let i=0;i<5;i++)svgEl('line',{x1:65,x2:341,y1:top+i*11,y2:top+i*11,stroke:'#52657d','stroke-width':1.3},staffLines);
  svgEl('text',{x:9,y:top+33,fill:'#a4b5d0','font-size':label==='TREBLE'?49:37,'font-family':'serif'},staffLines).textContent=glyph;
}
const diatonic=['C','D','E','F','G','A','B'];
function staffPosition(midi){
  const letter=notes[midi%12][0],octave=Math.floor(midi/12)-1;
  const index=octave*7+diatonic.indexOf(letter);
  // Treble E4 bottom line, bass G2 bottom line.
  const treble=midi>=60,base=treble?4*7+2:2*7+4;
  return {y:(treble?68:154)-(index-base)*5.5,top:treble?24:110,sharp:notes[midi%12].includes('#')};
}
function drawNotation(){
  staffNotes.replaceChildren();
  const active=[...new Set([...pointers.values()].filter(p=>p.playing).map(p=>p.midi))].sort((a,b)=>a-b);
  const midi=active.at(-1);
  const summary=notationPanel.querySelector('#piano-current-note');
  summary.textContent=midi===undefined?'Play a key':label(midi)+' · '+germanLabel(midi);
  if(active.length===2){summary.textContent=active.map(n=>label(n)+' · '+germanLabel(n)).join(' | ')+' | '+(harmonyModule?.intervalName(active[0],active[1])||'');}
  if(active.length>=3)summary.textContent=harmonyModule?.recognizeChord(active)||'Unidentified chord';
  if(midi===undefined)return;
  const {y,top,sharp}=staffPosition(midi);
  const x=214;
  for(let line=top-11;line>=y-2;line-=11)svgEl('line',{x1:x-18,x2:x+18,y1:line,y2:line,stroke:'#a3b7d0','stroke-width':1.5},staffNotes);
  for(let line=top+55;line<=y+2;line+=11)svgEl('line',{x1:x-18,x2:x+18,y1:line,y2:line,stroke:'#a3b7d0','stroke-width':1.5},staffNotes);
  if(sharp)svgEl('text',{x:x-29,y:y+7,fill:'#8faaff','font-size':25,'font-family':'serif'},staffNotes).textContent='♯';
  svgEl('ellipse',{cx:x,cy:y,rx:9,ry:6,fill:'#8faaff',transform:`rotate(-19 ${x} ${y})`},staffNotes);
  svgEl('line',{x1:x+8,x2:x+8,y1:y,y2:y-34,stroke:'#8faaff','stroke-width':2},staffNotes);
}

let initializedPosition = false;
function label(midi) { return notes[midi%12]+(Math.floor(midi/12)-1); }
function germanLabel(midi){
 const german=['c','cis','d','dis','e','f','fis','g','gis','a','ais','h'];
 const octave=Math.floor(midi/12)-1;
 const name=german[midi%12];
 if(octave>=4)return name+"'".repeat(octave-3);
 if(octave===3)return name;
 return name.toUpperCase()+','.repeat(Math.max(0,2-octave));
}
function buildKeyboard() {
  keyboard.replaceChildren();
  let whiteIndex = 0;
  for (let midi=FIRST;midi<=LAST;midi++) {
    const black=blackNotes.has(midi%12);
    const key=document.createElement('button');
    key.type='button';
    key.className='piano-key '+(black?'black':'white');
    key.dataset.midi=String(midi);
    key.setAttribute('aria-label',label(midi));
    const text=document.createElement('span');
    text.className='piano-note-label';
    text.textContent=label(midi);
    key.append(text);
    if (black) {
      key.style.left=(whiteIndex*WHITE_WIDTH-BLACK_WIDTH/2)+'px';
      key.style.width=BLACK_WIDTH+'px';
    } else {
      key.style.left=(whiteIndex*WHITE_WIDTH)+'px';
      key.style.width=WHITE_WIDTH+'px';
      whiteIndex++;
    }
    keyboard.append(key);
  }
  keyboard.style.width=(whiteIndex*WHITE_WIDTH)+'px';
}
function centerOn(midi) {
  const key=keyboard.querySelector('[data-midi="'+midi+'"]');
  if (!key) return;
  viewport.scrollLeft=Math.max(0,key.offsetLeft+key.offsetWidth/2-viewport.clientWidth/2);
}
function stopPointer(pointerId) {
  const state=pointers.get(pointerId);
  if(!state)return;
  pointers.delete(pointerId);
  if(state.playing) {
    if(pianoSound==='sine')sineOff(state.midi);
    else engine.noteOff(state.midi);
    state.key.classList.remove('pressed');
    drawNotation();
  }
}
viewport.addEventListener('pointerdown',event=>{
  if(event.pointerType==='mouse'&&event.button!==0)return;
  const key=event.target.closest('.piano-key');
  if(!key||(pianoSound==='piano'&&!engine.buffers.size))return;
  const midi=Number(key.dataset.midi);
  pointers.set(event.pointerId,{midi,key,x:event.clientX,y:event.clientY,playing:true});
  key.classList.add('pressed');
  drawNotation();
  if(pianoSound==='sine')sineOn(midi);
  else engine.noteOn(midi);
});
viewport.addEventListener('pointermove',event=>{
  const state=pointers.get(event.pointerId);
  if(!state)return;
  // Native horizontal touch scrolling remains enabled. Release any note
  // when the finger turns into a swipe; pointercancel also handles scrolling.
  if(Math.abs(event.clientX-state.x)>12||Math.abs(event.clientY-state.y)>18)stopPointer(event.pointerId);
});
for(const type of ['pointerup','pointercancel','lostpointercapture'])
  viewport.addEventListener(type,event=>stopPointer(event.pointerId));
window.addEventListener('pointerup',event=>stopPointer(event.pointerId));
window.addEventListener('pointercancel',event=>stopPointer(event.pointerId));
viewport.addEventListener('scroll',()=>{
  for(const id of [...pointers.keys()])stopPointer(id);
},{passive:true});
start.addEventListener('click',async()=>{
  start.disabled=true;
  status.textContent='Loading piano samples…';
  try{
    await engine.load((done,total)=>{status.textContent='Loading piano samples '+done+'/'+total+'…';});
    status.textContent='Grand Piano · Swipe to explore the keyboard';
    refreshPianoSound();
  }catch(error){
    status.textContent=error.message;
    start.disabled=false;
    start.textContent='Try again';
  }
});
document.addEventListener('musiclab:piano-hidden',()=>{
  for(const id of [...pointers.keys()])stopPointer(id);
  engine.allNotesOff();
  for(const midi of [...sineVoices.keys()])sineOff(midi);
  if(pianoSettingsDialog.open)pianoSettingsDialog.close();
  keyboard.querySelectorAll('.pressed').forEach(key=>key.classList.remove('pressed'));
  drawNotation();
});
buildKeyboard();
function setInitialPosition(){
  if(initializedPosition||viewport.clientWidth===0)return;
  centerOn(60);
  initializedPosition=true;
}
window.addEventListener('resize',setInitialPosition);
window.addEventListener('orientationchange',()=>setTimeout(setInitialPosition,100));
document.getElementById('open-piano').addEventListener('click',()=>requestAnimationFrame(setInitialPosition));
