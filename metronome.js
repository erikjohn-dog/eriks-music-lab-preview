// Erik's Music Lab metronome. Independent settings and Web Audio clock.
const KEY='eriks-music-lab:metronome-settings:v1';
const stage=document.getElementById('metronome-stage');
const bpmOutput=document.getElementById('metronome-bpm');
const slider=document.getElementById('metronome-slider');
const signature=document.getElementById('metronome-signature');
const accent=document.getElementById('metronome-accent');
const beats=document.getElementById('metronome-beats');
const toggle=document.getElementById('metronome-toggle');
const status=document.getElementById('metronome-status');
let bpm=120,context=null,running=false,timer=null,nextTime=0,beat=0,scheduled=[],tapTimes=[],visualTimers=new Set();
try{
  const saved=JSON.parse(localStorage.getItem(KEY)||'null');
  if(saved){bpm=Math.max(30,Math.min(240,Number(saved.bpm)||120));if([2,3,4,6].includes(Number(saved.signature)))signature.value=String(saved.signature);accent.checked=saved.accent!==false;}
}catch{}
function persist(){try{localStorage.setItem(KEY,JSON.stringify({bpm,signature:Number(signature.value),accent:accent.checked}));}catch{}}
function setTempo(value){bpm=Math.max(30,Math.min(240,Math.round(Number(value)||120)));slider.value=String(bpm);bpmOutput.textContent=String(bpm);persist();}
function renderBeats(){beats.replaceChildren();for(let i=0;i<Number(signature.value);i++){const dot=document.createElement('span');dot.className='metronome-beat'+(i===0?' first':'');dot.setAttribute('aria-label','Beat '+(i+1));beats.append(dot);}}
function illuminate(index){for(const [i,dot] of [...beats.children].entries())dot.classList.toggle('active',i===index);}
function clearVisuals(){for(const t of visualTimers)clearTimeout(t);visualTimers.clear();illuminate(-1);}
function playClick(time,isAccent){
  const osc=context.createOscillator(),gain=context.createGain();
  osc.type='sine';osc.frequency.setValueAtTime(isAccent?1400:950,time);
  gain.gain.setValueAtTime(0,time);
  gain.gain.linearRampToValueAtTime(isAccent?.35:.22,time+.002);
  gain.gain.exponentialRampToValueAtTime(.001,time+.055);
  osc.connect(gain).connect(context.destination);
  osc.start(time);osc.stop(time+.065);
  osc.onended=()=>{osc.disconnect();gain.disconnect();};
  scheduled.push(osc);
}
function schedule(){
  if(!running||!context)return;
  while(nextTime<context.currentTime+.12){
    const index=beat;
    playClick(nextTime,index===0&&accent.checked);
    const delay=Math.max(0,(nextTime-context.currentTime)*1000);
    const id=setTimeout(()=>{visualTimers.delete(id);if(running&&!stage.hidden)illuminate(index);},delay);
    visualTimers.add(id);
    beat=(beat+1)%Number(signature.value);
    nextTime+=60/bpm;
  }
  // Do not accumulate ended oscillators indefinitely.
  if(scheduled.length>100)scheduled.splice(0,80);
}
async function stop(){
  running=false;
  if(timer!==null){clearInterval(timer);timer=null;}
  clearVisuals();
  for(const osc of scheduled){try{osc.stop();}catch{}}
  scheduled=[];
  if(context){const old=context;context=null;try{await old.close();}catch{}}
  toggle.textContent='Start Metronome';status.textContent='Stopped.';
}
async function start(){
  if(running)return;
  toggle.disabled=true;
  try{
    const AudioContext=window.AudioContext||window.webkitAudioContext;
    if(!AudioContext)throw new Error('Web Audio is not supported.');
    context=new AudioContext({latencyHint:'interactive'});
    await context.resume();
    if(stage.hidden){await stop();return;}
    running=true;beat=0;nextTime=context.currentTime+.04;
    schedule();timer=setInterval(schedule,25);
    toggle.textContent='Stop Metronome';status.textContent='Playing · '+bpm+' BPM';
  }catch(e){status.textContent=e.message;await stop();}
  finally{toggle.disabled=false;}
}
toggle.addEventListener('click',()=>running?stop():start());
document.getElementById('metronome-minus').addEventListener('click',()=>setTempo(bpm-1));
document.getElementById('metronome-plus').addEventListener('click',()=>setTempo(bpm+1));
slider.addEventListener('input',()=>setTempo(slider.value));
signature.addEventListener('change',()=>{renderBeats();beat=0;persist();});
accent.addEventListener('change',persist);
document.getElementById('metronome-tap').addEventListener('click',()=>{
  const now=performance.now();
  if(tapTimes.length&&now-tapTimes[tapTimes.length-1]>2000)tapTimes=[];
  tapTimes.push(now);if(tapTimes.length>6)tapTimes.shift();
  if(tapTimes.length>=2){
    const intervals=tapTimes.slice(1).map((time,i)=>time-tapTimes[i]);
    const average=intervals.reduce((a,b)=>a+b,0)/intervals.length;
    setTempo(60000/average);
    status.textContent='Tap tempo · '+bpm+' BPM';
  }else status.textContent='Tap again to set tempo.';
});
document.addEventListener('musiclab:metronome-hidden',()=>{if(running)stop();});
document.addEventListener('visibilitychange',()=>{if(document.hidden&&running)stop();});
setTempo(bpm);renderBeats();
