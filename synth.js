// Independent polyphonic Web Audio synthesizer; no sample downloads or microphone.
const STORAGE='eriks-music-lab:synth:v1';
const presets={
warm:{wave1:'sawtooth',wave2:'triangle',detune:7,cutoff:2200,resonance:2,attack:.25,decay:.5,sustain:.72,release:1.1,lfo:3},
lead:{wave1:'sawtooth',wave2:'square',detune:9,cutoff:4500,resonance:3,attack:.01,decay:.16,sustain:.75,release:.2,lfo:2},
bass:{wave1:'square',wave2:'sawtooth',detune:-5,cutoff:650,resonance:4,attack:.01,decay:.3,sustain:.45,release:.17,lfo:0},
pluck:{wave1:'triangle',wave2:'sine',detune:0,cutoff:3600,resonance:1,attack:.005,decay:.28,sustain:0,release:.22,lfo:0},
keys:{wave1:'sine',wave2:'triangle',detune:4,cutoff:6000,resonance:.6,attack:.008,decay:.5,sustain:.3,release:.55,lfo:0},
strings:{wave1:'sawtooth',wave2:'sawtooth',detune:13,cutoff:3000,resonance:1,attack:.6,decay:.4,sustain:.85,release:1.5,lfo:5}
};
const ids=['wave1','wave2','detune','cutoff','resonance','attack','decay','sustain','release','lfo'];
const stage=document.getElementById('synth-stage'),preset=document.getElementById('synth-preset'),keyboard=document.getElementById('synth-keyboard'),status=document.getElementById('synth-status');
let params={...presets.warm},ctx=null,master=null,voices=new Map(),order=[],pointers=new Map(),generation=0;
function persist(){try{localStorage.setItem(STORAGE,JSON.stringify({preset:preset.value,params,octave:document.getElementById('synth-octave').value}));}catch{}}
function render(){for(const id of ids){const el=document.getElementById('synth-'+id);el.value=String(params[id]);const out=document.getElementById('synth-'+id+'-value');if(out)out.textContent=String(params[id])+(id==='cutoff'?' Hz':id==='detune'?' cents':id==='lfo'?' cents':'');}}
function setPreset(key){if(!presets[key])return;params={...presets[key]};preset.value=key;render();persist();}
try{const saved=JSON.parse(localStorage.getItem(STORAGE)||'null');if(saved){if(saved.preset&&presets[saved.preset])setPreset(saved.preset);else if(saved.params){for(const id of ids)if(saved.params[id]!==undefined)params[id]=saved.params[id];preset.value='custom';}if(['3','4','5'].includes(saved.octave))document.getElementById('synth-octave').value=saved.octave;}}catch{}
render();
preset.addEventListener('change',()=>{if(preset.value==='custom'){render();return;}setPreset(preset.value);});
for(const id of ids)document.getElementById('synth-'+id).addEventListener('input',event=>{params[id]=id.startsWith('wave')?event.target.value:Number(event.target.value);preset.value='custom';render();persist();});
function midiFreq(note){return 440*Math.pow(2,(note-69)/12);}
async function audio(){if(!ctx){const AC=window.AudioContext||window.webkitAudioContext;if(!AC)throw Error('Web Audio unavailable');ctx=new AC({latencyHint:'interactive'});master=ctx.createGain();master.gain.value=.22;master.connect(ctx.destination);}if(ctx.state==='suspended')await ctx.resume();}
function release(note){const v=voices.get(note);if(!v)return;voices.delete(note);order=order.filter(x=>x!==note);const t=ctx.currentTime,rel=Math.max(.02,Number(v.release)||.2);v.gain.gain.cancelScheduledValues(t);v.gain.gain.setTargetAtTime(0,t,rel/4);for(const o of v.osc){try{o.stop(t+rel+0.1);}catch{}}if(v.lfo){try{v.lfo.stop(t+rel+.1);}catch{}}}
async function press(note){if(voices.has(note))return;const token=generation;try{await audio();if(token!==generation||stage.hidden)return;if(voices.size>=8)release(order[0]);const t=ctx.currentTime,p={...params},gain=ctx.createGain(),filter=ctx.createBiquadFilter();filter.type='lowpass';filter.frequency.value=Number(p.cutoff);filter.Q.value=Number(p.resonance);gain.gain.setValueAtTime(0,t);gain.gain.linearRampToValueAtTime(.7,t+Math.max(.005,Number(p.attack)));gain.gain.setTargetAtTime(Math.max(.001,Number(p.sustain)*.7),t+Number(p.attack),Math.max(.01,Number(p.decay)/3));filter.connect(gain).connect(master);const osc=[];for(let i=0;i<2;i++){const o=ctx.createOscillator(),g=ctx.createGain();o.type=p['wave'+(i+1)];o.frequency.value=midiFreq(note);o.detune.value=i?Number(p.detune):0;g.gain.value=.45;o.connect(g).connect(filter);o.start(t);osc.push(o);}let lfo=null;if(Number(p.lfo)>0){lfo=ctx.createOscillator();lfo.frequency.value=5;const depth=ctx.createGain();depth.gain.value=Number(p.lfo);lfo.connect(depth);for(const o of osc)depth.connect(o.detune);lfo.start(t);}voices.set(note,{gain,osc,lfo,release:p.release});order.push(note);status.textContent='Playing · '+(note-12);for(const key of keyboard.querySelectorAll('[data-midi="'+note+'"]'))key.classList.add('pressed');}catch(e){status.textContent=e.message;}}
function lift(note){release(note);for(const key of keyboard.querySelectorAll('[data-midi="'+note+'"]'))key.classList.remove('pressed');}
function allOff(){generation++;for(const note of [...voices.keys()])lift(note);pointers.clear();keyboard.querySelectorAll('.pressed').forEach(k=>k.classList.remove('pressed'));}
function buildKeyboard(){allOff();keyboard.replaceChildren();const octave=Number(document.getElementById('synth-octave').value),base=12*(octave+1);const blackOffsets=new Set([1,3,6,8,10]);let white=0;for(let n=0;n<24;n++){const semitone=n%12,midi=base+n,black=blackOffsets.has(semitone),key=document.createElement('button');key.type='button';key.dataset.midi=String(midi);key.className='synth-key '+(black?'black':'white');key.style.left=(black?(white*48-15):white*48)+'px';if(!black){white++;if(semitone===0)key.textContent='C'+(octave+Math.floor(n/12));}key.setAttribute('aria-label','Play MIDI note '+midi);keyboard.append(key);}}
keyboard.addEventListener('pointerdown',event=>{const key=event.target.closest('.synth-key');if(!key)return;event.preventDefault();const note=Number(key.dataset.midi);pointers.set(event.pointerId,note);try{key.setPointerCapture(event.pointerId);}catch{}press(note);});
function endPointer(event){if(!pointers.has(event.pointerId))return;const note=pointers.get(event.pointerId);pointers.delete(event.pointerId);lift(note);}
keyboard.addEventListener('pointerup',endPointer);keyboard.addEventListener('pointercancel',endPointer);keyboard.addEventListener('lostpointercapture',endPointer);
document.getElementById('synth-octave').addEventListener('change',()=>{buildKeyboard();persist();});
document.getElementById('synth-panic').addEventListener('click',allOff);
const play=document.getElementById('synth-play'),design=document.getElementById('synth-design'),tabPlay=document.getElementById('synth-tab-play'),tabDesign=document.getElementById('synth-tab-design');
function view(isPlay){play.hidden=!isPlay;design.hidden=isPlay;tabPlay.setAttribute('aria-selected',String(isPlay));tabDesign.setAttribute('aria-selected',String(!isPlay));allOff();}
tabPlay.addEventListener('click',()=>view(true));tabDesign.addEventListener('click',()=>view(false));
document.addEventListener('musiclab:synth-hidden',()=>{allOff();if(ctx){const old=ctx;ctx=null;master=null;old.close().catch(()=>{});}status.textContent='Tap a key to start audio.';});
document.addEventListener('visibilitychange',()=>{if(document.hidden)allOff();});
window.addEventListener('pagehide',allOff);
buildKeyboard();
