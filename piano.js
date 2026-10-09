import {PianoEngine} from './piano-audio.js';
const engine=new PianoEngine();
const stage=document.getElementById('piano-stage');
const keyboard=document.getElementById('piano-keyboard');
const status=document.getElementById('piano-status');
const start=document.getElementById('piano-start');
let octave=4;
const fingers=new Map();
function render(){
  keyboard.replaceChildren();
  const blacks=new Set([1,3,6,8,10]);
  for(let i=0;i<24;i++){
    const midi=(octave*12)+i;
    const key=document.createElement('button');
    key.type='button';
    key.className='piano-key '+(blacks.has(i%12)?'black':'white');
    key.dataset.midi=midi;
    key.setAttribute('aria-label','MIDI note '+midi);
    keyboard.append(key);
  }
}
function press(event){
  const key=event.target.closest('.piano-key');
  if(!key||!engine.buffers.size)return;
  event.preventDefault();
  key.setPointerCapture(event.pointerId);
  const midi=Number(key.dataset.midi);
  fingers.set(event.pointerId,midi);
  key.classList.add('pressed');
  engine.noteOn(midi);
}
function release(event){
  const midi=fingers.get(event.pointerId);
  if(midi===undefined)return;
  fingers.delete(event.pointerId);
  engine.noteOff(midi);
  keyboard.querySelector('[data-midi="'+midi+'"]')?.classList.remove('pressed');
}
keyboard.addEventListener('pointerdown',press);
for(const event of ['pointerup','pointercancel','lostpointercapture'])keyboard.addEventListener(event,release);
document.getElementById('piano-lower').addEventListener('click',()=>{engine.allNotesOff();octave=Math.max(2,octave-1);render();});
document.getElementById('piano-higher').addEventListener('click',()=>{engine.allNotesOff();octave=Math.min(5,octave+1);render();});
start.addEventListener('click',async()=>{
  start.disabled=true;
  status.textContent='Loading piano samples…';
  try{
    await engine.load((done,total)=>{status.textContent='Loading piano samples '+done+'/'+total+'…';});
    status.textContent='Grand Piano · Ready to play';
    start.hidden=true;
  }catch(error){
    status.textContent=error.message;
    start.disabled=false;
    start.textContent='Try again';
  }
});
document.addEventListener('musiclab:piano-hidden',()=>{engine.allNotesOff();for(const key of keyboard.querySelectorAll('.pressed'))key.classList.remove('pressed');fingers.clear();});
render();
