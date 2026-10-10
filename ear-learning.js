import {WORLDS,CHAPTERS,FIRST_LESSONS,grade,readProgress,saveResult,levelId} from './ear-curriculum.js';
import {getEarSound,setEarSound,getEarPractice,setEarPractice} from './ear-settings.js';
import {sharedPiano} from './piano-audio.js';
import {CHORD_LEVELS,CHORD_LESSONS,CHORD_MODES,makeChordQuestions} from './ear-chords.js';
import {INTERVAL_LEVELS,INTERVAL_OPTIONS,makeIntervalQuestions} from './ear-intervals.js';
const stage=document.getElementById('ear-learning-stage');
const content=document.getElementById('ear-learning-content');
let chordQuestions=[];
let intervalQuestions=[];
let world='Intervals',chapter=0,level=0,question=0,correct=0,answered=false,context=null,quizItems=[],lastRoot=null,lastChoice=null;
const escapeHTML=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function title(text){return '<div class="eyebrow">GUIDED EAR TRAINING</div><h1>'+escapeHTML(text)+'</h1>';}
function open(){document.dispatchEvent(new CustomEvent('musiclab:ear-learning-open'));renderWorld();}
function renderWorld(){const chapters=CHAPTERS[world],progress=readProgress();content.innerHTML=title(world)+ '<p class="subtitle">Choose a chapter. New lessons will be added as the course grows.</p><div class="ear-course-progress">'+chapters.length+' chapters planned · '+(world==='Chords'?CHORD_LEVELS.length:world==='Intervals'?INTERVAL_LEVELS.length:FIRST_LESSONS[world].length)+' introductory lessons available</div><div class="ear-chapter-list">'+chapters.map((c,i)=>{const available=i===0;const stars=available?(world==='Chords'?CHORD_LEVELS:world==='Intervals'?INTERVAL_LEVELS:FIRST_LESSONS[world]).reduce((s,_,j)=>s+(progress[levelId(world,0,j)]||0),0):0;return '<button class="ear-chapter-card" data-chapter="'+i+'" '+(available?'':'disabled')+'><span class="ear-chapter-index">'+String(i+1).padStart(2,'0')+'</span><span><strong>'+escapeHTML(c[0])+'</strong><small>'+escapeHTML(c[1])+'</small></span><span class="ear-chapter-state">'+(available?'★ '+stars:'SOON')+'</span></button>'}).join('')+'</div>';
content.querySelectorAll('[data-chapter]').forEach(b=>b.onclick=()=>{chapter=Number(b.dataset.chapter);renderChapter()});}
function renderChapter(){const lessons=world==='Chords'?CHORD_LEVELS.map((name,i)=>[name,CHORD_LESSONS[i]]):world==='Intervals'?INTERVAL_LEVELS:FIRST_LESSONS[world],progress=readProgress();content.innerHTML=title(CHAPTERS[world][chapter][0])+'<p class="subtitle">'+escapeHTML(CHAPTERS[world][chapter][1])+'</p><div class="ear-level-list">'+lessons.map((l,i)=>'<button class="ear-level-card" data-level="'+i+'"><span class="ear-level-number">'+(i+1)+'</span><span><strong>'+escapeHTML(l[0])+'</strong><small>'+(world==='Chords'?(i<2?'Learn · Listen':'Listen · Identify'):world==='Intervals'?(i<3?'Learn · Listen':'Listen · Identify'):'Learn · Listen · Practice')+'</small></span>'+((world==='Chords'&&i<2)||(world==='Intervals'&&i<3)?'':'<span class="ear-level-stars">'+('★'.repeat(progress[levelId(world,chapter,i)]||0)||'☆')+'</span>')+'</button>').join('')+'</div>';
content.querySelectorAll('[data-level]').forEach(b=>b.onclick=()=>{level=Number(b.dataset.level);renderLesson()});}
function renderLesson(){if(world==='Chords')return renderChordLevel();if(world==='Intervals')return renderIntervalLevel();const l=FIRST_LESSONS[world][level];content.innerHTML=title(l[0])+'<div class="ear-lesson-card"><span class="ear-lesson-label">LEARN · LEVEL '+(level+1)+'</span><p>'+escapeHTML(l[1])+'</p><p class="ear-lesson-tip">Listen carefully. You can replay the example as often as you like.</p><button id="ear-listen" class="secondary" type="button">▶ Listen to example</button><p id="ear-audio-status" role="status"></p></div><button id="ear-practice" class="primary" type="button">Start practice →</button>';
document.getElementById('ear-listen').onclick=()=>world==='Chords'?playChordDemo():playExample();if(getEarPractice().autoPlayLesson){if(world==='Chords')playChordDemo();else playExample();}document.getElementById('ear-practice').onclick=()=>{question=0;correct=0;chordQuestions=world==='Chords'?makeChordQuestions(level,getEarPractice().questionCount):[];quizItems=Array.from({length:getEarPractice().questionCount},()=>Math.floor(Math.random()*FIRST_LESSONS[world].length));renderQuestion()};}
function audio(){if(!context)context=new (window.AudioContext||window.webkitAudioContext)({latencyHint:'interactive'});if(context.state!=='running')context.resume();return context;}
let playbackToken=0;
const randomInt=max=>Math.floor(Math.random()*max);
function randomRoot(offsets){const lo=48,hi=84-Math.max(...offsets);const max=Math.max(lo,hi);let root=lo+randomInt(max-lo+1);if(root===lastRoot&&max>lo)root=lo+(root-lo+1+randomInt(max-lo))%(max-lo+1);lastRoot=root;return root;}
function noteOffsets(item){return world==='Intervals'?[0,item[2]]:item[2];}
function playItem(item,root){return playNotes(noteOffsets(item),world==='Chords',root);}

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
function playExample(){const item=FIRST_LESSONS[world][level];playItem(item,randomRoot(noteOffsets(item)));}
function renderQuestion(){if(world==='Chords')return renderChordQuestion();if(question>=quizItems.length){renderResults();return;}answered=false;const target=FIRST_LESSONS[world][level];const other=FIRST_LESSONS[world][(level+1)%FIRST_LESSONS[world].length];const isTarget=quizItems[question]===level;const played=isTarget?target:other;const root=randomRoot(noteOffsets(played));content.innerHTML=title('Listen & Identify')+'<p class="subtitle">Question '+(question+1)+' of '+quizItems.length+'</p><div class="ear-quiz-card"><button id="ear-replay" class="ear-play-button" type="button" aria-label="Replay sound">▶</button><p id="ear-audio-status" role="status"></p><p>Which sound did you hear?</p><div class="ear-answer-grid">'+[target,other].map((l,i)=>'<button class="ear-answer" data-answer="'+i+'">'+escapeHTML(l[0])+'</button>').join('')+'</div><div id="ear-feedback" aria-live="polite"></div><button id="ear-next" class="primary" type="button" hidden>Next question →</button></div>';
document.getElementById('ear-replay').onclick=()=>playItem(played,root);if(getEarPractice().autoPlayNext)playItem(played,root);
content.querySelectorAll('[data-answer]').forEach(b=>b.onclick=()=>{if(answered)return;answered=true;const chosen=Number(b.dataset.answer)===0?target:other;const good=chosen===played;if(good)correct++;content.querySelectorAll('[data-answer]').forEach(x=>x.disabled=true);document.getElementById('ear-feedback').textContent=good?'Correct! Listen for this sound again.':'Not quite. The correct answer was '+played[0]+'. Replay it to compare.';document.getElementById('ear-next').hidden=false; if(getEarPractice().tapAnywhereNext){document.getElementById('ear-feedback').textContent+=' Tap outside the controls to continue.';}});
document.getElementById('ear-next').onclick=()=>{question++;renderQuestion()};}
function renderResults(){const stars=grade(correct,world==='Chords'?chordQuestions.length:world==='Intervals'?intervalQuestions.length:quizItems.length);saveResult(levelId(world,chapter,level),stars);content.innerHTML=title('Level complete')+'<div class="ear-results-card"><div class="ear-big-stars">'+('★'.repeat(stars)+'☆'.repeat(3-stars))+'</div><strong>'+correct+' / '+(world==='Chords'?chordQuestions.length:quizItems.length)+' correct</strong><p>'+(stars?'Great work! Your best result is saved.':'Keep practicing! Try listening to the examples again.')+'</p></div><button id="ear-repeat" class="primary">Try again</button><button id="ear-levels" class="secondary">All levels</button>';document.getElementById('ear-repeat').onclick=renderLesson;document.getElementById('ear-levels').onclick=renderChapter;}
document.querySelectorAll('[data-ear-world]').forEach(b=>b.addEventListener('click',()=>{world=b.dataset.earWorld;open()}));
document.getElementById('ear-learning-back').addEventListener('click',()=>{if(content.querySelector('.ear-quiz-card,.ear-lesson-card,.ear-results-card'))renderChapter();else if(content.querySelector('.ear-level-list'))renderWorld();else document.dispatchEvent(new Event('musiclab:ear-learning-close'))});

content.addEventListener('click',event=>{if(!answered||!getEarPractice().tapAnywhereNext||!content.querySelector('.ear-quiz-card'))return;if(event.target.closest('button,a,input,select,label'))return;answered=false;question++;if(world==='Chords')renderChordQuestion();else if(world==='Intervals')renderIntervalQuestion();else renderQuestion();});
const soundDialog=document.getElementById('ear-settings-dialog');
const soundForm=document.getElementById('ear-settings-form');
document.addEventListener('musiclab:ear-settings-open',()=>{
 soundForm.elements['ear-sound'].value=getEarSound();const flow=getEarPractice();for(const key of Object.keys(flow)){const input=soundForm.elements[key];if(input){if(key==='questionCount')input.value=flow[key];else input.checked=flow[key];}}
 soundDialog.showModal();
});
document.getElementById('ear-settings-close').addEventListener('click',()=>soundDialog.close());
soundForm.addEventListener('submit',event=>{
 event.preventDefault();
 const selected=soundForm.elements['ear-sound'].value;
 setEarSound(selected);
 const flow={};for(const key of Object.keys(getEarPractice()))flow[key]=key==='questionCount'?Number(soundForm.elements[key]?.value):soundForm.elements[key]?.checked===true;
 setEarPractice(flow);
 soundDialog.close();
});
document.addEventListener('musiclab:ear-learning-close',()=>{playbackToken++;sharedPiano.allNotesOff()});

function playChordDemo(){
 const root=60,quality=level===1?'minor':'major';
 playChord({root,quality,presentation:CHORD_MODES[level]==='random'?'combined':CHORD_MODES[level]});
}
function playChord(item){
 const offsets=item.quality==='major'?[0,4,7]:[0,3,7];
 if(item.presentation==='combined'){
  playNotes(offsets,false,item.root);
  const sequenceToken=playbackToken;
  setTimeout(()=>{if(sequenceToken===playbackToken&&world==='Chords'&&!stage.hidden)playNotes(offsets,true,item.root)},1700);
 }else playNotes(offsets,item.presentation==='harmonic',item.root);
}

function renderChordQuestion(){
 if(question>=chordQuestions.length){renderResults();return;}
 answered=false;
 const item=chordQuestions[question];
 content.innerHTML=title('Major or Minor?')+'<p class="subtitle">Question '+(question+1)+' of '+chordQuestions.length+'</p><div class="ear-quiz-card"><button id="ear-replay" class="ear-play-button">▶</button><p id="ear-audio-status"></p><p>Which chord did you hear?</p><div class="ear-answer-grid"><button class="ear-answer" data-quality="major">Major</button><button class="ear-answer" data-quality="minor">Minor</button></div><div id="ear-feedback"></div><button id="ear-next" class="primary" hidden>Next question →</button></div>';
 document.getElementById('ear-replay').onclick=()=>playChord(item);
 if(getEarPractice().autoPlayNext)playChord(item);
 content.querySelectorAll('[data-quality]').forEach(b=>b.onclick=()=>answerChord(b.dataset.quality,item));
 document.getElementById('ear-next').onclick=()=>{question++;renderChordQuestion()};
}

function answerChord(choice,item){
 if(answered)return;
 answered=true;
 const good=choice===item.quality;
 if(good)correct++;
 content.querySelectorAll('[data-quality]').forEach(b=>b.disabled=true);
 document.getElementById('ear-feedback').textContent=good?'Correct! Listen for the third.':'Not quite. This was a '+item.quality+' triad.';
 document.getElementById('ear-next').hidden=false;
}

function renderChordLevel(){
 const explanation=level<2;
 content.innerHTML=title(CHORD_LEVELS[level])+'<div class="ear-lesson-card"><span class="ear-lesson-label">'+(explanation?'LEARN · THEORY & SOUND':'PRACTICE · LISTEN & IDENTIFY')+'</span><p>'+escapeHTML(CHORD_LESSONS[level])+'</p>'+(explanation?'<button id="ear-listen" class="secondary" type="button">▶ Listen to example</button><p id="ear-audio-status" role="status"></p>':'')+'</div>'+(explanation?'<button id="ear-levels" class="primary" type="button">Back to chapter →</button>':'<button id="ear-practice" class="primary" type="button">Start practice →</button>');
 if(explanation){
  document.getElementById('ear-listen').onclick=playChordDemo;
  document.getElementById('ear-levels').onclick=renderChapter;
 }else document.getElementById('ear-practice').onclick=()=>{
  question=0;correct=0;chordQuestions=makeChordQuestions(level,getEarPractice().questionCount);renderChordQuestion();
 };
}

function renderIntervalLevel(){
 const info=INTERVAL_LEVELS[level],theory=level<3;
 content.innerHTML=title(info[0])+'<div class="ear-lesson-card"><span class="ear-lesson-label">'+(theory?'LEARN · THEORY & SOUND':'PRACTICE · LISTEN & IDENTIFY')+'</span><p>'+escapeHTML(info[1])+'</p>'+(theory?'<button id="ear-listen" class="secondary" type="button">▶ Listen to example</button><p id="ear-audio-status" role="status"></p>':'')+'</div>'+(theory?'<button id="ear-levels" class="primary" type="button">Back to chapter →</button>':'<button id="ear-practice" class="primary" type="button">Start practice →</button>');
 if(theory){
  document.getElementById('ear-listen').onclick=()=>playNotes([0,info[3]],false,60);
  document.getElementById('ear-levels').onclick=renderChapter;
  if(getEarPractice().autoPlayLesson)playNotes([0,info[3]],false,60);
 }else document.getElementById('ear-practice').onclick=()=>{
  question=0;correct=0;intervalQuestions=makeIntervalQuestions(level,getEarPractice().questionCount);renderIntervalQuestion();
 };
}
function playInterval(item){
 playNotes(item.notes.map(n=>n-item.notes[0]),item.direction==='together',item.notes[0]);
}
function renderIntervalQuestion(){
 if(question>=intervalQuestions.length){renderResults();return;}
 answered=false;
 const item=intervalQuestions[question];
 content.innerHTML=title('Which Interval?')+'<p class="subtitle">Question '+(question+1)+' of '+intervalQuestions.length+'</p><div class="ear-quiz-card"><button id="ear-replay" class="ear-play-button" type="button">▶</button><p id="ear-audio-status" role="status"></p><p>Identify the distance between the two notes.</p><div class="ear-answer-grid">'+INTERVAL_OPTIONS.map(option=>'<button class="ear-answer" data-interval="'+escapeHTML(option.name)+'">'+escapeHTML(option.name)+'</button>').join('')+'</div><div id="ear-feedback" aria-live="polite"></div><button id="ear-next" class="primary" type="button" hidden>Next question →</button></div>';
 document.getElementById('ear-replay').onclick=()=>playInterval(item);
 if(getEarPractice().autoPlayNext)playInterval(item);
 content.querySelectorAll('[data-interval]').forEach(b=>b.onclick=()=>{
  if(answered)return;
  answered=true;
  const good=b.dataset.interval===item.answer;
  if(good)correct++;
  content.querySelectorAll('[data-interval]').forEach(x=>x.disabled=true);
  document.getElementById('ear-feedback').textContent=good?'Correct! '+item.answer+' spans '+item.semitones+' semitones.':'Not quite. That was '+item.answer+' ('+item.semitones+' semitones). Replay to compare.';
  document.getElementById('ear-next').hidden=false;
 });
 document.getElementById('ear-next').onclick=()=>{question++;renderIntervalQuestion();};
}
