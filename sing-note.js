import {getEarSound} from './ear-settings.js';
import {sharedPiano} from './piano-audio.js';
// Sing the Note: all microphone processing remains on the device.
const root=document.getElementById('sing-note-content');
const NAMES=['C','C♯','D','D♯','E','F','F♯','G','G♯','A','A♯','B'];
const note=m=>NAMES[m%12]+(Math.floor(m/12)-1);
const hz=m=>440*Math.pow(2,(m-69)/12);
let mode='single',ref=60,target=65,stream=null,ctx=null,analyser=null,source=null,raf=0,oscillators=[],audio=null,started=0,stable=0,detected=null,octaveFree=true,holdStart=0,nextTimeout=0,playToken=0,graceStart=0;
function render(){root.innerHTML='<div class="ps-panel"><h2>Reference type</h2><label>Exercise<select id="sing-mode"><option value="single">Single note</option><option value="chord">Major or minor chord</option><option value="scale">Major scale</option></select></label><p class="micro">The reference is named. Sing the target note shown below.</p><label class="sing-option"><input type="checkbox" id="sing-octave" checked> Accept any octave of the target note</label><p class="micro">Reference sound follows Ear Trainer General Settings (Piano or Sine wave). Hold the correct note for 1.5 seconds to advance automatically.</p><div class="sing-target"><small>REFERENCE</small><h2 id="sing-reference"></h2><button class="primary" id="sing-play" type="button">▶ Play reference</button><small>TARGET NOTE</small><h1 id="sing-target"></h1><p id="sing-readout" role="status">Tap Start microphone, then sing.</p><button class="primary" id="sing-mic" type="button">Start microphone</button><button id="sing-next" type="button">New challenge</button></div><p class="micro">Use headphones to prevent the reference sound from entering the microphone. Microphone audio is processed locally and is never recorded or uploaded. Pitch tracking works best with a steady solo voice in a quiet room.</p></div>';root.querySelector('#sing-mode').value=mode;root.querySelector('#sing-mode').onchange=e=>{mode=e.target.value;newChallenge();};root.querySelector('#sing-play').onclick=play;root.querySelector('#sing-mic').onclick=()=>stream?stop():start();root.querySelector('#sing-next').onclick=newChallenge;root.querySelector('#sing-octave').checked=octaveFree;root.querySelector('#sing-octave').onchange=e=>{octaveFree=e.target.checked;holdStart=0;graceStart=0;};newChallenge();}
function newChallenge(){clearTimeout(nextTimeout);nextTimeout=0;holdStart=0;graceStart=0;root.querySelector('#sing-target')?.classList.remove('sing-note-correct');ref=57+Math.floor(Math.random()*13);target=ref+[-7,-5,-4,-3,-2,0,2,3,4,5,7][Math.floor(Math.random()*11)];target=Math.max(48,Math.min(81,target));root.querySelector('#sing-reference').textContent=mode==='single'?note(ref):mode==='chord'?note(ref)+' '+(ref%2?'minor':'major'):' '+note(ref)+' major scale';root.querySelector('#sing-target').textContent=note(target);root.querySelector('#sing-readout').textContent='Listen, then sing '+note(target)+'.';}
async function play(){
 const token=++playToken;
 oscillators.forEach(o=>{try{o.stop();}catch{}});oscillators=[];
 const offsets=mode==='single'?[0]:mode==='chord'?(ref%2?[0,3,7]:[0,4,7]):[0,2,4,5,7,9,11,12];
 if(getEarSound()==='piano'){
  const status=root.querySelector('#sing-readout');status.textContent='Preparing piano samples…';
  try{await sharedPiano.load();await sharedPiano.resume();if(token!==playToken)return;
   const notes=offsets.map(n=>ref+n);
   notes.forEach((m,i)=>setTimeout(()=>{if(token!==playToken)return;sharedPiano.noteOn(m,.55);setTimeout(()=>sharedPiano.noteOff(m,.45),mode==='scale'?Math.max(350,3000-i*320):3000);},mode==='scale'?i*320:0));
   status.textContent='Listen, then sing '+note(target)+'.';
  }catch(e){status.textContent='Piano samples unavailable. Check your connection or select Sine wave in Ear Trainer settings.';}
  return;
 }
 if(!audio)audio=new (window.AudioContext||window.webkitAudioContext)();
 await audio.resume();if(token!==playToken)return;
 offsets.forEach((n,i)=>{const o=audio.createOscillator(),g=audio.createGain(),t=audio.currentTime+i*(mode==='scale'?.32:0),duration=mode==='scale'?Math.max(.7,3-i*.32):3;
 o.type='sine';o.frequency.value=hz(ref+n);g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.12/Math.sqrt(offsets.length),t+.04);g.gain.setValueAtTime(.12/Math.sqrt(offsets.length),t+duration-.24);g.gain.linearRampToValueAtTime(0,t+duration);o.connect(g).connect(audio.destination);o.start(t);o.stop(t+duration+.03);oscillators.push(o);});
}

function pitch(samples,rate){const n=samples.length;let energy=0;for(const v of samples)energy+=v*v;if(Math.sqrt(energy/n)<.012)return null;const min=Math.floor(rate/900),max=Math.min(Math.floor(rate/90),Math.floor(n/2));let best=0,score=0;for(let lag=min;lag<=max;lag++){let sum=0,a=0,b=0;for(let i=0;i<n-max;i+=2){const x=samples[i],y=samples[i+lag];sum+=x*y;a+=x*x;b+=y*y;}const correlation=sum/Math.sqrt(a*b||1);if(correlation>score){score=correlation;best=lag;}}return score>.72&&best?rate/best:null;}
async function start(){if(!navigator.mediaDevices?.getUserMedia){root.querySelector('#sing-readout').textContent='Microphone requires HTTPS and browser permission.';return;}try{stream=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:false,noiseSuppression:false,autoGainControl:false}});ctx=new (window.AudioContext||window.webkitAudioContext)();source=ctx.createMediaStreamSource(stream);analyser=ctx.createAnalyser();analyser.fftSize=4096;source.connect(analyser);root.querySelector('#sing-mic').textContent='Stop microphone';stable=0;started=performance.now();tick();}catch(e){root.querySelector('#sing-readout').textContent='Microphone unavailable: '+e.message;stop(false);}}
function tick(){
 if(!analyser)return;
 const buf=new Float32Array(analyser.fftSize);analyser.getFloatTimeDomainData(buf);
 const f=pitch(buf,ctx.sampleRate),el=root.querySelector('#sing-readout'),targetEl=root.querySelector('#sing-target'),now=performance.now();
 let cents=null,nearest=null;
 if(f){const midi=69+12*Math.log2(f/440);nearest=Math.round(midi);const diff=octaveFree?((midi-target+6)%12+12)%12-6:midi-target;cents=Math.round(diff*100);}
 const correct=cents!==null&&Math.abs(cents)<=50;
 targetEl?.classList.toggle('sing-note-correct',correct);
 if(correct){
  if(!holdStart)holdStart=now;
  graceStart=0;
  const held=now-holdStart;
  if(held>=1500){
   el.textContent='✓ '+note(nearest)+' · '+(cents>=0?'+':'')+cents+' cents · Correct! Next challenge…';
   holdStart=0;graceStart=0;
   nextTimeout=setTimeout(()=>{nextTimeout=0;newChallenge();if(analyser)tick();},650);return;
  }
  el.textContent='✓ '+note(nearest)+' · '+(cents>=0?'+':'')+cents+' cents · Hold '+Math.max(0,(1.5-held/1000)).toFixed(1)+'s';
 }else{
  if(holdStart){if(!graceStart)graceStart=now;if(now-graceStart>220){holdStart=0;graceStart=0;}}
  if(cents!==null)el.textContent='Detected '+note(nearest)+' · '+(cents>=0?'+':'')+cents+' cents from '+(octaveFree?NAMES[target%12]:note(target));
  else el.textContent='Listening… sing a steady note.';
 }
 raf=requestAnimationFrame(tick);
}

function stop(update=true){clearTimeout(nextTimeout);nextTimeout=0;holdStart=0;graceStart=0;root.querySelector('#sing-target')?.classList.remove('sing-note-correct');cancelAnimationFrame(raf);raf=0;analyser=null;source?.disconnect();source=null;stream?.getTracks().forEach(t=>t.stop());stream=null;ctx?.close();ctx=null;if(update&&root.querySelector('#sing-mic'))root.querySelector('#sing-mic').textContent='Start microphone';}
document.addEventListener('musiclab:sing-note-hidden',()=>{stop();playToken++;sharedPiano.allNotesOff();oscillators.forEach(o=>{try{o.stop();}catch{}});oscillators=[];});
render();
