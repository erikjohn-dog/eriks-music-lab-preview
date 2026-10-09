// Chromatic tuner: microphone input stays on-device. No recordings are stored.
const stage=document.getElementById('tuner-stage');
const toggle=document.getElementById('tuner-toggle');
const status=document.getElementById('tuner-status');
const note=document.getElementById('tuner-note');
const frequency=document.getElementById('tuner-frequency');
const cents=document.getElementById('tuner-cents');
const needle=document.getElementById('tuner-needle');
const NAMES=['C','C♯','D','D♯','E','F','F♯','G','G♯','A','A♯','B'];
let stream=null,context=null,analyser=null,source=null,frame=0,running=false,session=0;
let smoothed=null,lastSeen=0;
function detectPitch(samples,rate){
  // Normalized difference / YIN-style period detection, with interpolation.
  const n=samples.length;
  let energy=0;
  for(let i=0;i<n;i++)energy+=samples[i]*samples[i];
  if(Math.sqrt(energy/n)<.008)return null;
  const minLag=Math.max(2,Math.floor(rate/1200));
  const maxLag=Math.min(Math.floor(rate/65),Math.floor(n/2));
  const diff=new Float64Array(maxLag+1);
  for(let lag=1;lag<=maxLag;lag++){
    let sum=0;
    for(let i=0;i<n-maxLag;i++){const d=samples[i]-samples[i+lag];sum+=d*d;}
    diff[lag]=sum;
  }
  let cumulative=0,chosen=0,best=1;
  for(let lag=1;lag<=maxLag;lag++){
    cumulative+=diff[lag];
    if(lag<minLag)continue;
    const normalized=diff[lag]*lag/(cumulative||1);
    if(normalized<.14){
      let j=lag;
      while(j<maxLag&&diff[j+1]*(j+1)/(cumulative+diff[j+1]||1)<normalized){j++;}
      chosen=lag;best=normalized;break;
    }
    if(normalized<best){best=normalized;chosen=lag;}
  }
  if(!chosen||best>.22)return null;
  const a=diff[chosen-1],b=diff[chosen],c=diff[chosen+1];
  const correction=(a-2*b+c)!==0?.5*(a-c)/(a-2*b+c):0;
  const hz=rate/(chosen+Math.max(-1,Math.min(1,correction)));
  return hz>=65&&hz<=1200?hz:null;
}
function draw(){
  if(!running||stage.hidden)return;
  const data=new Float32Array(analyser.fftSize);
  analyser.getFloatTimeDomainData(data);
  const hz=detectPitch(data,context.sampleRate);
  if(hz){
    lastSeen=performance.now();
    // Smooth small microphone fluctuations without hiding genuine note changes.
    if(smoothed===null||Math.abs(1200*Math.log2(hz/smoothed))>90)smoothed=hz;
    else smoothed=smoothed*.7+hz*.3;
    const midi=Math.round(69+12*Math.log2(smoothed/440));
    const target=440*2**((midi-69)/12);
    const deviation=1200*Math.log2(smoothed/target);
    note.textContent=NAMES[(midi%12+12)%12]+(Math.floor(midi/12)-1);
    frequency.textContent=smoothed.toFixed(1)+' Hz · Target '+target.toFixed(1)+' Hz';
    cents.textContent=Math.abs(deviation)<5?'In tune':(deviation>0?'+':'')+deviation.toFixed(0)+' cents · '+(deviation>0?'Sharp':'Flat');
    needle.style.left=(50+Math.max(-50,Math.min(50,deviation)))+'%';
    status.textContent='Listening to your instrument…';
  }else if(performance.now()-lastSeen>500){
    smoothed=null;note.textContent='—';frequency.textContent='A4 = 440 Hz';
    cents.textContent='Play or sing a steady note';needle.style.left='50%';
    status.textContent='Listening for a note…';
  }
  frame=requestAnimationFrame(draw);
}
async function stop(){
  running=false;session++;cancelAnimationFrame(frame);
  stream?.getTracks().forEach(track=>track.stop());stream=null;
  try{source?.disconnect();analyser?.disconnect();}catch{}
  source=null;analyser=null;
  if(context){try{await context.close();}catch{}context=null;}
  toggle.textContent='Start Tuning';status.textContent='Microphone off.';
}
toggle.addEventListener('click',async()=>{
  if(running){await stop();return;}
  const token=++session;
  toggle.disabled=true;status.textContent='Requesting microphone permission…';
  let acquired=null,ctx=null;
  try{
    if(!navigator.mediaDevices?.getUserMedia)throw new Error('Microphone access requires HTTPS and a supported browser.');
    acquired=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:false,noiseSuppression:false,autoGainControl:false},video:false});
    if(token!==session||stage.hidden){acquired.getTracks().forEach(t=>t.stop());return;}
    const AudioContext=window.AudioContext||window.webkitAudioContext;
    if(!AudioContext)throw new Error('Audio analysis is not supported.');
    ctx=new AudioContext();
    await ctx.resume();
    if(token!==session||stage.hidden){acquired.getTracks().forEach(t=>t.stop());await ctx.close();return;}
    stream=acquired;context=ctx;
    analyser=context.createAnalyser();analyser.fftSize=4096;
    source=context.createMediaStreamSource(stream);source.connect(analyser);
    stream.getAudioTracks()[0]?.addEventListener('ended',()=>{if(running)stop();});
    running=true;lastSeen=performance.now();toggle.textContent='Stop Tuning';draw();
  }catch(error){
    acquired?.getTracks().forEach(t=>t.stop());
    if(ctx&&ctx!==context)try{await ctx.close();}catch{}
    if(token===session)status.textContent='Microphone unavailable: '+(error.name==='NotAllowedError'?'permission denied':error.message);
  }finally{toggle.disabled=false;}
});
document.addEventListener('musiclab:tuner-hidden',()=>{if(running||stream)stop();else session++;});
