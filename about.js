// Inspect only the 30 known piano sample URLs; never delete or modify caches.
const SAMPLE_CACHE='eriks-music-lab-piano-samples-v1';
const NAMES=['A0','C1','Ds1','Fs1','A1','C2','Ds2','Fs2','A2','C3','Ds3','Fs3','A3','C4','Ds4','Fs4','A4','C5','Ds5','Fs5','A5','C6','Ds6','Fs6','A6','C7','Ds7','Fs7','A7','C8'];
const output=document.getElementById('sample-cache-status');
async function refresh(){
  output.textContent='Checking local audio cache…';
  if(!('caches' in window)){output.textContent='Local audio cache is unavailable in this browser.';return;}
  try{
    const keys=await caches.keys();
    if(!keys.includes(SAMPLE_CACHE)){output.textContent='0/30 samples saved locally. Piano requires a first download.';return;}
    const cache=await caches.open(SAMPLE_CACHE);
    const matches=await Promise.all(NAMES.map(name=>cache.match('https://tonejs.github.io/audio/salamander/'+name+'.mp3')));
    const count=matches.filter(Boolean).length;
    output.textContent=count===30?'30/30 samples saved locally. All downloads cached; audio decoding is still needed after restart.':count+'/30 samples saved locally. '+(30-count)+' samples are not cached.';
  }catch{output.textContent='Could not inspect local audio cache. This does not mean the samples are missing.';}
}
document.getElementById('sample-cache-refresh').addEventListener('click',refresh);
document.getElementById('settings-open').addEventListener('click',()=>{if(!document.getElementById('home').hidden)refresh();});
