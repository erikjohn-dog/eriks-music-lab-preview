// Read-only offline audio sample overview. No downloads or cache deletion.
const PIANO_CACHE='eriks-music-lab-piano-samples-v1';
const DRUM_CACHE='eriks-music-lab-preview-drum-samples-v1';
const PIANO_NAMES=['A0','C1','Ds1','Fs1','A1','C2','Ds2','Fs2','A2','C3','Ds3','Fs3','A3','C4','Ds4','Fs4','A4','C5','Ds5','Fs5','A5','C6','Ds6','Fs6','A6','C7','Ds7','Fs7','A7','C8'];
const ELECTRONIC=['Kick04.flac','Snare09.flac','Clap01.flac','Claves01.flac','ClosedHiHat01-01.flac','OpenHiHat02-01.flac','LowTom02-01.flac','HighTom02-01.flac','Kick06.flac','Shaker04.flac','Cymbal01-01.flac','MidTom02-01.flac','Snare14.flac','Cymbal02.flac'];
const ACOUSTIC=['KdrumL/21-KdrumL.flac','Snare1/48-Snare.flac','SnareRest1/10-SnareRest.flac','HihatClosed/24-HihatClosed.flac','HihatOpen/24-HihatOpen.flac','Tom4/16-Tom4.flac','Tom1/7-Tom1.flac','KdrumR/21-KdrumR.flac','RideLBell/2-RideLBell.flac','CrashL/5-CrashL.flac','Tom2/10-Tom2.flac','Tom3/10-Tom3.flac','China/9-China.flac','RideL/6-RideL.flac'];
const output=document.getElementById('sample-cache-status');
async function countCached(cacheName,urls){const cache=await caches.open(cacheName);const matches=await Promise.all(urls.map(url=>cache.match(url)));return matches.filter(Boolean).length;}
async function refresh(){
 output.textContent='Checking locally saved audio samples…';
 if(!('caches' in window)){output.textContent='Local audio cache is unavailable in this browser.';return;}
 try{
  const keys=await caches.keys();
  const pianoUrls=PIANO_NAMES.map(n=>'https://tonejs.github.io/audio/salamander/'+n+'.mp3');
  const electronicUrls=ELECTRONIC.map(n=>'https://raw.githubusercontent.com/freepats/synthesizer-percussion/main/samples/'+n);
  const acousticUrls=ACOUSTIC.map(n=>'https://raw.githubusercontent.com/freepats/muldjordkit/main/samples/'+n);
  const [p,e,a]=await Promise.all([
   keys.includes(PIANO_CACHE)?countCached(PIANO_CACHE,pianoUrls):0,
   keys.includes(DRUM_CACHE)?countCached(DRUM_CACHE,electronicUrls):0,
   keys.includes(DRUM_CACHE)?countCached(DRUM_CACHE,acousticUrls):0
  ]);
  const label=(name,n,total)=>name+': '+n+'/'+total+' samples cached'+(n===total?' ✓':'');
  output.textContent=[label('Grand Piano',p,pianoUrls.length),label('Electronic Drum Kit',e,electronicUrls.length),label('Acoustic Drum Kit',a,acousticUrls.length),'Synth Drum Kit: ready offline (no samples needed).','Cached samples still need to be decoded when you start an instrument. To download missing drum samples, open Drum Machine and tap Load samples for the chosen kit.'].join('\n');
 }catch{output.textContent='Could not inspect the audio sample cache. Samples may still be available.';}
}
document.getElementById('sample-cache-refresh').addEventListener('click',refresh);
document.getElementById('settings-open').addEventListener('click',()=>{if(!document.getElementById('home').hidden)refresh();});
