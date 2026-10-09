import {WORLDS,CHAPTERS,FIRST_LESSONS,grade,readProgress,saveResult,levelId} from './ear-curriculum.js';
import {getEarSound,setEarSound} from './ear-settings.js';
import {sharedPiano} from './piano-audio.js';
const stage=document.getElementById('ear-learning-stage');
const content=document.getElementById('ear-learning-content');
let world='Intervals',chapter=0,level=0,question=0,correct=0,answered=false,context=null;
const escapeHTML=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function title(text){return '<div class="eyebrow">GUIDED EAR TRAINING</div><h1>'+escapeHTML(text)+'</h1>';}
function open(){document.dispatchEvent(new CustomEvent('musiclab:ear-learning-open'));renderWorld();}
function renderWorld(){const chapters=CHAPTERS[world],progress=readProgress();content.innerHTML=title(world)+ '<p class="subtitle">Choose a chapter. New lessons will be added as the course grows.</p><div class="ear-course-progress">'+chapters.length+' chapters planned · '+FIRST_LESSONS[world].length+' introductory lessons available</div><div class="ear-chapter-list">'+chapters.map((c,i)=>{const available=i===0;const stars=available?FIRST_LESSONS[world].reduce((s,_,j)=>s+(progress[levelId(world,0,j)]||0),0):0;return '<button class="ear-chapter-card" data-chapter="'+i+'" '+(available?'':'disabled')+'><span class="ear-chapter-index">'+String(i+1).padStart(2,'0')+'</span><span><strong>'+escapeHTML(c[0])+'</strong><small>'+escapeHTML(c[1])+'</small></span><span class="ear-chapter-state">'+(available?'★ '+stars:'SOON')+'</span></button>'}).join('')+'</div>';
content.querySelectorAll('[data-chapter]').forEach(b=>b.onclick=()=>{chapter=Number(b.dataset.chapter);renderChapter()});}
function renderChapter(){const lessons=FIRST_LESSONS[world],progress=readProgress();content.innerHTML=title(CHAPTERS[world][chapter][0])+'<p class="subtitle">'+escapeHTML(CHAPTERS[world][chapter][1])+'</p><div class="ear-level-list">'+lessons.map((l,i)=>'<button class="ear-level-card" data-level="'+i+'"><span class="ear-level-number">'+(i+1)+'</span><span><strong>'+escapeHTML(l[0])+'</strong><small>Learn · Listen · Practice</small></span><span class="ear-level-stars">'+('★'.repeat(progress[levelId(world,chapter,i)]||0)||'☆')+'</span></button>').join('')+'</div>';
content.querySelectorAll('[data-level]').forEach(b=>b.onclick=()=>{level=Number(b.dataset.level);renderLesson()});}
function renderLesson(){const l=FIRST_LESSONS[world][level];content.innerHTML=title(l[0])+'<div class="ear-lesson-card"><span class="ear-lesson-label">LEARN · LEVEL '+(level+1)+'</span><p>'+escapeHTML(l[1])+'</p><p class="ear-lesson-tip">Listen carefully. You can replay the example as often as you like.</p><button id="ear-listen" class="secondary" type="button">▶ Listen to example</button><p id="ear-audio-status" role="status"></p></div><button id="ear-practice" class="primary" type="button">Start practice →</button>';
document.getElementById('ear-listen').onclick=()=>playExample();document.getElementById('ear-practice').onclick=()=>{question=0;correct=0;renderQuestion()};}
function audio(){if(!context)context=new (window.AudioContext||window.webkitAudioContext)({latencyHint:'interactive'});if(context.state!=='running')context.resume();return context;}
let playbackToken=0;
async function playNotes(offsets,simultaneous=false,root=60){
 const token=++playbackToken;
 if(getEarSound()==='piano'){
  const message=document.getElementById('ear-audio-status');
  try{
   if(message)message.textContent='Loading Grand Piano samples…';
   await sharedPiano.load();
   await sharedPiano.resume();
   if(token!==playbackToken||stage.hidden)return;
   if(message)message.textContent='';
   sharedPiano.allNotesOff();
   offsets.forEach((semi,i)=>{
    const midi=root+semi;
    const delay=simultaneous?0:i*480;
    setTimeout(()=>{
     if(token!==playbackToken||stage.hidden)return;
     sharedPiano.noteOn(midi,.7);
     setTimeout(()=>{if(token===playbackToken)sharedPiano.noteOff(midi,.1)},simultaneous?850:390);
    },delay);
   });
  }catch(err){if(message)message.textContent='Piano samples unavailable. Check your connection or select Sine Wave in Ear Trainer Settings.';}
  return;
 }
 const ctx=audio(),now=ctx.currentTime+.035;
 offsets.forEach((semi,i)=>{const osc=ctx.createOscillator(),gain=ctx.createGain(),start=now+(simultaneous?0:i*.48);osc.type='sine';osc.frequency.value=440*Math.pow(2,(root+semi-69)/12);gain.gain.setValueAtTime(.0001,start);gain.gain.exponentialRampToValueAtTime(.16/Math.sqrt(offsets.length),start+.018);gain.gain.exponentialRampToValueAtTime(.0001,start+.43);osc.connect(gain).connect(ctx.destination);osc.start(start);osc.stop(start+.46)});
}
function playExample(){const v=FIRST_LESSONS[world][level][2];playNotes(world==='Intervals'?[0,v]:v,world==='Chords',world==='Scales'&&level===1?57:60);}
function renderQuestion(){if(question>=10){renderResults();return;}answered=false;const target=FIRST_LESSONS[world][level];const other=FIRST_LESSONS[world][(level+1)%FIRST_LESSONS[world].length];const isTarget=(question%2===0);const played=isTarget?target:other;content.innerHTML=title('Listen & Identify')+'<p class="subtitle">Question '+(question+1)+' of 10</p><div class="ear-quiz-card"><button id="ear-replay" class="ear-play-button" type="button" aria-label="Replay sound">▶</button><p id="ear-audio-status" role="status"></p><p>Which sound did you hear?</p><div class="ear-answer-grid">'+[target,other].map((l,i)=>'<button class="ear-answer" data-answer="'+i+'">'+escapeHTML(l[0])+'</button>').join('')+'</div><div id="ear-feedback" aria-live="polite"></div><button id="ear-next" class="primary" type="button" hidden>Next question →</button></div>';
document.getElementById('ear-replay').onclick=()=>playNotes(world==='Intervals'?[0,played[2]]:played[2],world==='Chords',world==='Scales'&&played[0]==='Natural Minor'?57:60);
content.querySelectorAll('[data-answer]').forEach(b=>b.onclick=()=>{if(answered)return;answered=true;const chosen=Number(b.dataset.answer)===0?target:other;const good=chosen===played;if(good)correct++;content.querySelectorAll('[data-answer]').forEach(x=>x.disabled=true);document.getElementById('ear-feedback').textContent=good?'Correct! Listen for this sound again.':'Not quite. The correct answer was '+played[0]+'. Replay it to compare.';document.getElementById('ear-next').hidden=false;});
document.getElementById('ear-next').onclick=()=>{question++;renderQuestion()};}
function renderResults(){const stars=grade(correct,10);saveResult(levelId(world,chapter,level),stars);content.innerHTML=title('Level complete')+'<div class="ear-results-card"><div class="ear-big-stars">'+('★'.repeat(stars)+'☆'.repeat(3-stars))+'</div><strong>'+correct+' / 10 correct</strong><p>'+(stars?'Great work! Your best result is saved.':'Keep practicing! Try listening to the examples again.')+'</p></div><button id="ear-repeat" class="primary">Try again</button><button id="ear-levels" class="secondary">All levels</button>';document.getElementById('ear-repeat').onclick=renderLesson;document.getElementById('ear-levels').onclick=renderChapter;}
document.querySelectorAll('[data-ear-world]').forEach(b=>b.addEventListener('click',()=>{world=b.dataset.earWorld;open()}));
document.getElementById('ear-learning-back').addEventListener('click',()=>{if(content.querySelector('.ear-quiz-card,.ear-lesson-card,.ear-results-card'))renderChapter();else if(content.querySelector('.ear-level-list'))renderWorld();else document.dispatchEvent(new Event('musiclab:ear-learning-close'))});

const soundDialog=document.getElementById('ear-settings-dialog');
const soundForm=document.getElementById('ear-settings-form');
document.addEventListener('musiclab:ear-settings-open',()=>{
 soundForm.elements['ear-sound'].value=getEarSound();
 soundDialog.showModal();
});
document.getElementById('ear-settings-close').addEventListener('click',()=>soundDialog.close());
soundForm.addEventListener('submit',event=>{
 event.preventDefault();
 const selected=soundForm.elements['ear-sound'].value;
 setEarSound(selected);
 soundDialog.close();
});
document.addEventListener('musiclab:ear-learning-close',()=>{playbackToken++;sharedPiano.allNotesOff()});
