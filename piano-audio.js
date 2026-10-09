// Erik's Music Lab — independent sample-based piano engine.
// Salamander Grand Piano V3 by Alexander Holm, CC BY 3.0.
// https://archive.org/details/SalamanderGrandPianoV3
// Preview stage: remote Tone.js-hosted MP3s. Offline samples will follow.
const BASE = 'https://tonejs.github.io/audio/salamander/';
const SAMPLES = [
  [48,'C3'],[51,'Ds3'],[54,'Fs3'],[57,'A3'],
  [60,'C4'],[63,'Ds4'],[66,'Fs4'],[69,'A4'],
  [72,'C5'],[75,'Ds5'],[78,'Fs5'],[81,'A5'],
  [84,'C6']
];
export class PianoEngine {
  constructor() { this.context=null; this.buffers=new Map(); this.active=new Map(); this.loading=null; this.maxVoices=24; }
  async load(onProgress=()=>{}) {
    if(this.loading) return this.loading;
    this.loading=(async()=>{
      const AudioContext=window.AudioContext||window.webkitAudioContext;
      if(!AudioContext) throw new Error('Web Audio is not supported on this device.');
      this.context ||= new AudioContext({latencyHint:'interactive'});
      await this.context.resume();
      let done=0;
      const errors=[];
      await Promise.all(SAMPLES.map(async ([midi,name])=>{
        try {
          const response=await fetch(BASE+name+'.mp3');
          if(!response.ok) throw new Error('HTTP '+response.status);
          const bytes=await response.arrayBuffer();
          this.buffers.set(midi,await this.context.decodeAudioData(bytes));
        } catch(e) { errors.push(name); }
        finally {onProgress(++done,SAMPLES.length);}
      }));
      if(errors.length) throw new Error('Could not load piano samples: '+errors.join(', ')+'. Check your connection.');
    })();
    try {await this.loading;} catch(e){this.loading=null;throw e;}
  }
  async resume(){if(this.context?.state==='suspended')await this.context.resume();}
  noteOn(midi,velocity=.75) {
    if(!this.context||!this.buffers.size) return;
    this.noteOff(midi);
    if(this.active.size>=this.maxVoices) this.noteOff(this.active.keys().next().value,.035);
    const nearest=[...this.buffers.keys()].reduce((a,b)=>Math.abs(b-midi)<Math.abs(a-midi)?b:a);
    const source=this.context.createBufferSource();
    source.buffer=this.buffers.get(nearest);
    source.playbackRate.value=2**((midi-nearest)/12);
    const gain=this.context.createGain();
    const now=this.context.currentTime;
    gain.gain.setValueAtTime(0,now);
    gain.gain.linearRampToValueAtTime(Math.max(.01,Math.min(1,velocity))*.7,now+.008);
    source.connect(gain).connect(this.context.destination);
    const voice={source,gain};
    this.active.set(midi,voice);
    source.onended=()=>{if(this.active.get(midi)===voice)this.active.delete(midi);source.disconnect();gain.disconnect();};
    source.start(now);
  }
  noteOff(midi,release=.24) {
    const voice=this.active.get(midi);
    if(!voice||!this.context)return;
    this.active.delete(midi);
    const now=this.context.currentTime;
    voice.gain.gain.cancelScheduledValues(now);
    voice.gain.gain.setTargetAtTime(0,now,Math.max(.01,release/4));
    try{voice.source.stop(now+Math.max(.08,release*3));}catch{}
  }
  allNotesOff(){for(const midi of [...this.active.keys()])this.noteOff(midi,.08);}
}
