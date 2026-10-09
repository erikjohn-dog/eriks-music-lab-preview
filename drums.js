// Erik's Drum Machine — synthesized offline drum voices and 16-step sequencer.
const KEY='eriks-music-lab:drums:v1';
const names=['Kick','Snare','Clap','Rim','Closed HH','Open HH','Low Tom','High Tom','808 Kick','Shaker','Cowbell','Crash','Perc 1','Perc 2','FX Hit','Zap'];
const initial=()=>Array.from({length:16},(_,i)=>i===0?[0,4,8,12]:i===1?[4,12]:i===4?[0,2,4,6,8,10,12,14]:[]);
const samplePaths={electronic:["samples/Kick04.flac","samples/Snare09.flac","samples/Clap01.flac","samples/Claves01.flac","samples/ClosedHiHat01-01.flac","samples/OpenHiHat02-01.flac","samples/LowTom02-01.flac","samples/HighTom02-01.flac","samples/Kick06.flac","samples/Shaker04.flac","samples/Claves01.flac","samples/Cymbal01-01.flac","samples/MidTom02-01.flac","samples/Snare14.flac","samples/Cymbal02.flac","samples/Claves01.flac"],acoustic:["samples/KdrumL/21-KdrumL.flac","samples/Snare1/48-Snare.flac",null,"samples/SnareRest1/10-SnareRest.flac","samples/HihatClosed/24-HihatClosed.flac","samples/HihatOpen/24-HihatOpen.flac","samples/Tom4/16-Tom4.flac","samples/Tom1/7-Tom1.flac","samples/KdrumR/21-KdrumR.flac",null,"samples/RideLBell/2-RideLBell.flac","samples/CrashL/5-CrashL.flac","samples/Tom2/10-Tom2.flac","samples/Tom3/10-Tom3.flac","samples/China/9-China.flac","samples/RideL/6-RideL.flac"]};
const sampleSources={electronic:'https://raw.githubusercontent.com/freepats/synthesizer-percussion/master/',acoustic:'https://raw.githubusercontent.com/freepats/muldjordkit/master/'};
let currentKit='synth',sampleBuffers={electronic:new Map(),acoustic:new Map()},kitLoading=null;
let lengths=[16,16,16,16];
let patterns=Array.from({length:4},(_,i)=>i===0?initial():Array.from({length:16},()=>[])),settings=names.map(()=>({pitch:0,volume:80,decay:.4})),bpm=120,swing=0,selected=0,ctx=null,master=null,noise=null,playing=false,timer=null,nextTime=0,step=0,activeVoices=[],animationIds=new Set();
const pads=document.getElementById('drums-pads'),grid=document.getElementById('drums-seq-grid'),edit=document.getElementById('drums-edit-pad'),status=document.getElementById('drums-status');
try{const d=JSON.parse(localStorage.getItem(KEY)||'null');if(d){if(['synth','electronic','acoustic'].includes(d.kit))currentKit=d.kit;if(Array.isArray(d.lengths)&&d.lengths.length===4)lengths=d.lengths.map(n=>[16,32,64].includes(n)?n:16);if(Array.isArray(d.patterns)&&d.patterns.length===4)patterns=d.patterns.map((pattern,patternIndex)=>Array.from({length:16},(_,i)=>Array.isArray(pattern[i])?pattern[i].filter(n=>Number.isInteger(n)&&n>=0&&n<lengths[patternIndex]):[]));if(Array.isArray(d.settings)&&d.settings.length===16)settings=d.settings.map(s=>({pitch:Number(s.pitch)||0,volume:Number(s.volume)||80,decay:Number(s.decay)||.4}));if(Number.isFinite(d.bpm))bpm=Math.max(50,Math.min(220,d.bpm));if(Number.isFinite(d.swing))swing=Math.max(0,Math.min(65,d.swing));}}catch{}
function save(){try{localStorage.setItem(KEY,JSON.stringify({patterns,lengths,settings,bpm,swing,kit:currentKit}));}catch{}}
document.getElementById('drums-kit').value=currentKit;
document.getElementById('drums-bpm').value=bpm;document.getElementById('drums-swing').value=swing;document.getElementById('drums-swing-value').textContent=swing+'%';
function createNoise(c){const b=c.createBuffer(1,c.sampleRate,c.sampleRate);const a=b.getChannelData(0);for(let i=0;i<a.length;i++)a[i]=Math.random()*2-1;return b;}
async function audio(){if(!ctx){const AC=window.AudioContext||window.webkitAudioContext;if(!AC)throw Error('Web Audio unavailable');ctx=new AC({latencyHint:'interactive'});master=ctx.createGain();master.gain.value=.68;const compressor=ctx.createDynamicsCompressor();compressor.threshold.value=-15;compressor.knee.value=16;compressor.ratio.value=8;compressor.attack.value=.003;compressor.release.value=.12;master.connect(compressor).connect(ctx.destination);noise=createNoise(ctx);}if(ctx.state==='suspended')await ctx.resume();}
function synthDrum(index,when,velocity=1){if(!ctx)return;const buffer=sampleBuffers[currentKit]?.get(index);if(buffer){const cfg=settings[index],src=ctx.createBufferSource(),gain=ctx.createGain();src.buffer=buffer;src.playbackRate.value=Math.pow(2,cfg.pitch/12);gain.gain.value=cfg.volume/100*velocity*.8;src.connect(gain).connect(master);src.start(when);return;}const cfg=settings[index],t=when,pitch=Math.pow(2,cfg.pitch/12),vol=cfg.volume/100*velocity,decay=cfg.decay;const env=ctx.createGain();env.gain.setValueAtTime(Math.max(.0001,vol*.65),t);env.gain.exponentialRampToValueAtTime(.0001,t+Math.max(.04,decay));env.connect(master);
const osc=(type,f,start,end,duration,level=1)=>{const o=ctx.createOscillator(),g=ctx.createGain();o.type=type;o.frequency.setValueAtTime(Math.max(20,f*pitch),t);if(end)o.frequency.exponentialRampToValueAtTime(Math.max(20,end*pitch),t+duration);g.gain.value=level;o.connect(g).connect(env);o.start(t);o.stop(t+duration+.03);};
const hiss=(filterFreq,duration,level=1,kind='highpass')=>{const src=ctx.createBufferSource(),f=ctx.createBiquadFilter(),g=ctx.createGain();src.buffer=noise;f.type=kind;f.frequency.value=filterFreq*pitch;g.gain.value=level;src.connect(f).connect(g).connect(env);src.start(t);src.stop(t+duration);};
switch(index){
case 0:osc('sine',170,48,Math.min(.55,decay),1.2);break;
case 1:osc('triangle',180,105,.13,.4);hiss(1400,.19,.9);break;
case 2:hiss(950,.2,1.1,'bandpass');hiss(4200,.14,.5);break;
case 3:osc('triangle',520,350,.08,.55);hiss(2500,.06,.35);break;
case 4:hiss(6800,.07,.62);break;
case 5:hiss(6500,.42,.55);break;
case 6:osc('sine',160,75,.3,1);break;
case 7:osc('sine',310,150,.18,.8);break;
case 8:osc('sine',210,44,.12,1.25);break;
case 9:hiss(3600,.13,.5);break;
case 10:osc('square',540,450,.15,.24);osc('square',830,730,.15,.18);break;
case 11:hiss(5400,.8,.45);break;
case 12:osc('triangle',470,230,.15,.7);break;
case 13:hiss(2100,.2,.6,'bandpass');break;
case 14:osc('sawtooth',600,80,.38,.35);hiss(4000,.2,.35);break;
case 15:osc('square',1400,110,.24,.28);break;
}
}
function ripple(){const container=document.getElementById('drums-ripples');for(let i=0;i<3;i++){const el=document.createElement('div');el.className='drums-ripple';el.style.animationDelay=(i*.09)+'s';container.append(el);el.addEventListener('animationend',()=>el.remove(),{once:true});setTimeout(()=>el.remove(),1400);}}
function flash(i){const pad=pads.children[i];if(!pad)return;pad.classList.add('hit');setTimeout(()=>pad.classList.remove('hit'),130);ripple();}
async function hit(i){try{await audio();synthDrum(i,ctx.currentTime+.004);flash(i);status.textContent=names[i]+' · ready';}catch(e){status.textContent=e.message;}}
names.forEach((name,i)=>{const button=document.createElement('button');button.type='button';button.className='drums-pad';button.textContent=name;button.addEventListener('pointerdown',e=>{e.preventDefault();hit(i);});pads.append(button);const option=document.createElement('option');option.value=String(i);option.textContent=name;edit.append(option);});
function drawGrid(){grid.replaceChildren();for(let i=0;i<16;i++){const row=document.createElement('div');row.className='drums-seq-row';row.style.gridTemplateColumns='65px repeat('+lengths[selected]+',25px)';const label=document.createElement('span');label.className='drums-seq-name';label.textContent=names[i];row.append(label);for(let j=0;j<lengths[selected];j++){const b=document.createElement('button');b.type='button';b.className='drums-step'+(patterns[selected][i].includes(j)?' active':'');b.dataset.step=String(j);b.setAttribute('aria-label',names[i]+' step '+(j+1));b.setAttribute('aria-pressed',String(patterns[selected][i].includes(j)));b.addEventListener('click',()=>{const arr=patterns[selected][i];if(arr.includes(j))patterns[selected][i]=arr.filter(x=>x!==j);else arr.push(j);drawGrid();save();});row.append(b);}grid.append(row);}}
function playhead(n){grid.querySelectorAll('.drums-step.playhead').forEach(b=>b.classList.remove('playhead'));if(n<0)return;grid.querySelectorAll('.drums-step[data-step="'+n+'"]').forEach(b=>b.classList.add('playhead'));}
function schedule(){if(!playing||!ctx)return;while(nextTime<ctx.currentTime+.12){const current=step%lengths[selected];const t=nextTime;for(let i=0;i<16;i++)if(patterns[selected][i].includes(current)){synthDrum(i,t);const wait=Math.max(0,(t-ctx.currentTime)*1000);const id=setTimeout(()=>{animationIds.delete(id);if(playing)flash(i);},wait);animationIds.add(id);}const wait=Math.max(0,(t-ctx.currentTime)*1000);const id=setTimeout(()=>{animationIds.delete(id);if(playing)playhead(current);},wait);animationIds.add(id);step=(step+1)%lengths[selected];const sixteenth=60/bpm/4;nextTime+=sixteenth*(current%2===0?1+swing/100:1-swing/100);}}
async function start(){if(playing)return;try{await audio();playing=true;step=0;nextTime=ctx.currentTime+.05;timer=setInterval(schedule,25);schedule();document.getElementById('drums-play').textContent='▶ Playing';status.textContent='Sequencer running';}catch(e){status.textContent=e.message;}}
function stop(){playing=false;if(timer)clearInterval(timer);timer=null;for(const id of animationIds)clearTimeout(id);animationIds.clear();playhead(-1);document.getElementById('drums-play').textContent='▶ Play';}
document.getElementById('drums-play').addEventListener('click',start);document.getElementById('drums-stop').addEventListener('click',stop);
document.getElementById('drums-bpm').addEventListener('change',e=>{bpm=Math.max(50,Math.min(220,Number(e.target.value)||120));e.target.value=bpm;save();});
document.getElementById('drums-swing').addEventListener('input',e=>{swing=Number(e.target.value);document.getElementById('drums-swing-value').textContent=swing+'%';save();});
document.getElementById('drums-pattern').addEventListener('change',e=>{selected=Number(e.target.value);syncLength();drawGrid();});
function syncLength(){document.getElementById('drums-length').value=String(lengths[selected]);document.getElementById('drums-seq-hint').textContent=lengths[selected]+' steps · tap cells to toggle · generating replaces the selected pattern only.';}
document.getElementById('drums-length').addEventListener('change',e=>{lengths[selected]=Number(e.target.value);patterns[selected]=patterns[selected].map(row=>row.filter(n=>n<lengths[selected]));step=0;syncLength();drawGrid();save();});
document.getElementById('drums-clear').addEventListener('click',()=>{patterns[selected]=Array.from({length:16},()=>[]);drawGrid();save();});
function renderSound(){const cfg=settings[Number(edit.value)];for(const id of ['pitch','volume','decay']){document.getElementById('drums-'+id).value=cfg[id];document.getElementById('drums-'+id+'-value').textContent=cfg[id]+(id==='pitch'?' st':id==='volume'?'%':' s');}}
edit.addEventListener('change',renderSound);
for(const id of ['pitch','volume','decay'])document.getElementById('drums-'+id).addEventListener('input',e=>{settings[Number(edit.value)][id]=Number(e.target.value);renderSound();save();});

const genreProfiles={
hiphop:{bpm:92,k:[0,7,10],sn:[4,12],hat:2,swing:14,perc:[3,9]},
trap:{bpm:140,k:[0,7,11],sn:[8],hat:2,swing:5,perc:[2,5,13]},
rap:{bpm:88,k:[0,6,10],sn:[4,12],hat:2,swing:18,perc:[3,11]},
pop:{bpm:112,k:[0,8],sn:[4,12],hat:2,swing:2,perc:[2,10]},
house:{bpm:124,k:[0,4,8,12],sn:[4,12],hat:2,swing:3,perc:[2,6,10,14]},
techno:{bpm:132,k:[0,4,8,12],sn:[4,12],hat:2,swing:1,perc:[3,11]},
latin:{bpm:106,k:[0,3,8,11],sn:[4,12],hat:2,swing:9,perc:[3,6,10,14]},
salsa:{bpm:100,k:[0,6,10],sn:[4,12],hat:2,swing:5,perc:[0,3,6,10,12]},
jazz:{bpm:112,k:[0,10],sn:[4,12],hat:2,swing:35,perc:[3,7,11,15]},
funk:{bpm:108,k:[0,3,7,10],sn:[4,12],hat:2,swing:14,perc:[3,7,11,15]},
reggaeton:{bpm:96,k:[0,6,8,14],sn:[3,7,11,15],hat:2,swing:6,perc:[3,11]},
rock:{bpm:116,k:[0,8],sn:[4,12],hat:2,swing:0,perc:[6,14]}
};
function generateBeat(){const genre=document.getElementById('drums-genre').value,profile=genreProfiles[genre],complexity=document.getElementById('drums-complexity').value,n=lengths[selected],result=Array.from({length:16},()=>[]),density=complexity==='simple'?.12:complexity==='busy'?.64:.32,add=(track,pos)=>{if(pos>=0&&pos<n&&!result[track].includes(pos))result[track].push(pos);};
for(let bar=0;bar<n/16;bar++){const offset=bar*16;for(const k of profile.k)add(genre==='trap'&&bar%2===1?8:0,offset+k);for(const sn of profile.sn)add(1,offset+sn);for(let j=0;j<16;j+=profile.hat)add(4,offset+j);for(const pc of profile.perc)if(Math.random()<.45+density*.35)add(genre==='salsa'||genre==='latin'?9:3,offset+pc);
if(Math.random()<density)add(0,offset+14);if(Math.random()<density*.7)add(0,offset+3);if(Math.random()<density)add(2,offset+12);if(Math.random()<density)add(5,offset+6);if(Math.random()<density*.6)add(7,offset+15);
if(genre==='trap'){for(const pos of [13,14,15])if(Math.random()<density)add(4,offset+pos);if(Math.random()<.65)add(8,offset+0);}
if(genre==='jazz'){for(const pos of [0,4,8,12])if(Math.random()<.6)add(5,offset+pos);if(Math.random()<.65)add(3,offset+11);}
if(genre==='salsa'||genre==='latin'){for(const pos of [2,5,10,13])if(Math.random()<.7)add(12,offset+pos);for(const pos of [0,4,8,12])if(Math.random()<.6)add(10,offset+pos);}
if(genre==='house'||genre==='techno')for(const pos of [2,6,10,14])add(5,offset+pos);
if(bar===n/16-1&&complexity!=='simple'){for(const pos of [12,14,15])if(Math.random()<density)add(1,offset+pos);if(Math.random()<.5)add(11,offset+15);}
}
patterns[selected]=result;bpm=profile.bpm;swing=profile.swing;document.getElementById('drums-bpm').value=bpm;document.getElementById('drums-swing').value=swing;document.getElementById('drums-swing-value').textContent=swing+'%';step=0;drawGrid();save();status.textContent=genre.toUpperCase()+' beat generated · '+n+' steps · '+bpm+' BPM';}
document.getElementById('drums-generate').addEventListener('click',()=>{const hasNotes=patterns[selected].some(row=>row.length);if(hasNotes&&!confirm('Replace the notes in Pattern '+String.fromCharCode(65+selected)+' with a generated beat?'))return;generateBeat();});


const kitStatus=document.getElementById('drums-kit-status'),kitSelect=document.getElementById('drums-kit'),kitLoad=document.getElementById('drums-kit-load');
function kitCount(kit){return new Set(samplePaths[kit].filter(Boolean)).size;}
function updateKitStatus(){if(currentKit==='synth'){kitStatus.textContent='Synthesized kit is ready offline.';return;}const loaded=sampleBuffers[currentKit].size,total=samplePaths[currentKit].filter(Boolean).length;kitStatus.textContent=loaded+'/'+total+' pad samples ready · '+(loaded===total?'Kit ready':'Tap Load samples (online first time)');}
async function loadKit(){if(currentKit==='synth'){updateKitStatus();return;}if(kitLoading)return kitLoading;const kit=currentKit;kitLoad.disabled=true;kitStatus.textContent='Loading '+kit+' samples…';kitLoading=(async()=>{await audio();const paths=samplePaths[kit];let failures=0;const unique=[...new Set(paths.filter(Boolean))];for(let i=0;i<unique.length;i++){const path=unique[i];if([...sampleBuffers[kit].values()].length&&paths.every((p,index)=>p!==path||sampleBuffers[kit].has(index)))continue;try{const url=sampleSources[kit]+path;let response;const cache=await caches.open('eriks-music-lab-preview-drum-samples-v1');response=await cache.match(url);if(!response){response=await fetch(url,{mode:'cors'});if(!response.ok)throw Error('HTTP '+response.status);await cache.put(url,response.clone());}const decoded=await ctx.decodeAudioData(await response.arrayBuffer());paths.forEach((p,index)=>{if(p===path)sampleBuffers[kit].set(index,decoded);});}catch(e){failures++;}kitStatus.textContent='Loading '+kit+': '+(i+1)+'/'+unique.length+' files';}updateKitStatus();if(failures)kitStatus.textContent+=' · '+failures+' failed; synthesized fallback used';})().catch(e=>{kitStatus.textContent='Sample loading failed: '+e.message;}).finally(()=>{kitLoading=null;kitLoad.disabled=false;});return kitLoading;}
kitSelect.addEventListener('change',()=>{currentKit=kitSelect.value;save();updateKitStatus();});
kitLoad.addEventListener('click',loadKit);
updateKitStatus();

const tabs=[['pads','drums-pads-view'],['seq','drums-seq-view'],['sound','drums-sound-view']];
for(const [id] of tabs)document.getElementById('drums-tab-'+id).addEventListener('click',()=>{for(const [other,view] of tabs){document.getElementById(view).hidden=other!==id;document.getElementById('drums-tab-'+other).setAttribute('aria-selected',String(other===id));}});
document.addEventListener('musiclab:drums-hidden',()=>{stop();if(ctx){const old=ctx;ctx=null;master=null;sampleBuffers={electronic:new Map(),acoustic:new Map()};old.close().catch(()=>{});}});
document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();});
window.addEventListener('pagehide',stop);
syncLength();drawGrid();renderSound();
