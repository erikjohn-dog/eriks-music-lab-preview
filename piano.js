import {PianoEngine} from './piano-audio.js';
const engine = new PianoEngine();
const viewport = document.getElementById('piano-viewport');
const keyboard = document.getElementById('piano-keyboard');
const status = document.getElementById('piano-status');
const start = document.getElementById('piano-start');
const touch = document.getElementById('piano-touch');
if(touch) touch.addEventListener('change',()=>{engine.velocityLayer=Number(touch.value);});
const notes = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];
const blackNotes = new Set([1,3,6,8,10]);
const FIRST = 36; // C3
const LAST = 95; // B7
const WHITE_WIDTH = 46;
const BLACK_WIDTH = 29;
const pointers = new Map();
let initializedPosition = false;
function label(midi) { return notes[midi%12]+(Math.floor(midi/12)-1); }
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
    engine.noteOff(state.midi);
    state.key.classList.remove('pressed');
  }
}
viewport.addEventListener('pointerdown',event=>{
  if(event.pointerType==='mouse'&&event.button!==0)return;
  const key=event.target.closest('.piano-key');
  if(!key||!engine.buffers.size)return;
  const midi=Number(key.dataset.midi);
  pointers.set(event.pointerId,{midi,key,x:event.clientX,y:event.clientY,playing:true});
  key.classList.add('pressed');
  engine.noteOn(midi);
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
    start.hidden=true;
  }catch(error){
    status.textContent=error.message;
    start.disabled=false;
    start.textContent='Try again';
  }
});
document.addEventListener('musiclab:piano-hidden',()=>{
  for(const id of [...pointers.keys()])stopPointer(id);
  engine.allNotesOff();
  keyboard.querySelectorAll('.pressed').forEach(key=>key.classList.remove('pressed'));
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
