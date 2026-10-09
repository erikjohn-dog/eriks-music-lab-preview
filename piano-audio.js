// Erik's Music Lab — independent sample-based piano engine.
// Salamander Grand Piano V3 by Alexander Holm, CC BY 3.0.
// https://archive.org/details/SalamanderGrandPianoV3
// Preview: 30 original-pitch MP3s hosted by Tone.js; audio requires a network connection.
// Three genuine velocity layers (3, 9, 16), loaded remotely on demand.
// Genuine Salamander V3 velocity recordings, hosted as MP3 packages.
const VELOCITY_LAYERS = [3,9,16];
const sampleUrl=(name,layer)=>`https://unpkg.com/@audio-samples/piano-mp3-velocity${layer}@1.0.5/audio/${encodeURIComponent(name)}v${layer}.mp3`;
// Every original pitch position published in the Tone.js Salamander set.
// The intervening semitones are generated from the nearest recording.
const SAMPLES = [
  [21,'A0'],[24,'C1'],[27,'Ds1'],[30,'Fs1'],[33,'A1'],
  [36,'C2'],[39,'Ds2'],[42,'Fs2'],[45,'A2'],
  [48,'C3'],[51,'Ds3'],[54,'Fs3'],[57,'A3'],
  [60,'C4'],[63,'Ds4'],[66,'Fs4'],[69,'A4'],
  [72,'C5'],[75,'Ds5'],[78,'Fs5'],[81,'A5'],
  [84,'C6'],[87,'Ds6'],[90,'Fs6'],[93,'A6'],
  [96,'C7'],[99,'Ds7'],[102,'Fs7'],[105,'A7'],[108,'C8']
];
export class PianoEngine {
  constructor() { this.context=null; this.buffers=new Map(); this.active=new Map(); this.loading=null; this.maxVoices=24; this.velocityLayer=9; }
  async load(onProgress=()=>{}) {
    if(this.loading) return this.loading;
    this.loading=(async()=>{
      const AudioContext=window.AudioContext||window.webkitAudioContext;
      if(!AudioContext) throw new Error('Web Audio is not supported on this device.');
      this.context ||= new AudioContext({latencyHint:'interactive'});
      await this.context.resume();
      const jobs=VELOCITY_LAYERS.flatMap(layer=>SAMPLES.map(([midi,name])=>({midi,name,layer})));
      let done=0, next=0;
      const errors=[];
      // Limit simultaneous downloads and decodes on iPhone.
      await Promise.all(Array.from({length:6},async()=>{
        while(next<jobs.length){
          const {midi,name,layer}=jobs[next++];
          try{
            const response=await fetch(sampleUrl(name,layer));
            if(!response.ok)throw new Error('HTTP '+response.status);
            const bytes=await response.arrayBuffer();
            this.buffers.set(layer+':'+midi,await this.context.decodeAudioData(bytes));
          }catch(e){errors.push(name+'v'+layer);}
          finally{onProgress(++done,jobs.length);}
        }
      }));
      if(errors.length)throw new Error('Could not load '+errors.length+' piano samples. Check your connection and try again.');

    })();
    try {await this.loading;} catch(e){this.loading=null;throw e;}
  }
  async resume(){if(this.context?.state==='suspended')await this.context.resume();}
  noteOn(midi,velocity=.75) {
    if(!this.context||!this.buffers.size) return;
    this.noteOff(midi);
    if(this.active.size>=this.maxVoices) this.noteOff(this.active.keys().next().value,.035);
    const layer=this.velocityLayer;
    const nearest=SAMPLES.reduce((best,[pitch])=>Math.abs(pitch-midi)<Math.abs(best-midi)?pitch:best,SAMPLES[0][0]);
    const source=this.context.createBufferSource();
    source.buffer=this.buffers.get(layer+':'+nearest);
    if(!source.buffer)return;
    source.playbackRate.value=2**((midi-nearest)/12);
    const gain=this.context.createGain();
    const now=this.context.currentTime;
    gain.gain.setValueAtTime(0,now);
    const layerVolume={3:.95,9:.78,16:.62}[layer];
    gain.gain.linearRampToValueAtTime(Math.max(.01,Math.min(1,velocity))*layerVolume,now+.008);
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
