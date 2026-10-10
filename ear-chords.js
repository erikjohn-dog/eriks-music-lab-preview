export const CHORD_LEVELS = ['Major Triad', 'Minor Triad', 'Hear the Difference', 'Arpeggio Training', 'Chapter Challenge'];
export const TRIADS = { major: [0, 4, 7], minor: [0, 3, 7] };
export const CHORD_MODES = ['combined','combined','harmonic','arpeggiated','random'];
export const CHORD_LESSONS = [
'The major triad is built from a root (1), a major third (3) and a perfect fifth (5). In twelve-tone equal temperament these are 0, 4 and 7 semitones above the root. Example: C major = C–E–G; G major = G–B–D. Common chord symbols: C or Cmaj. Do not confuse Cmaj with Cmaj7, which adds a major seventh. The third gives the triad its major quality. Listen to the notes separately, then together.',
'The minor triad contains a root (1), minor third (♭3) and perfect fifth (5): 0, 3 and 7 semitones above the root. Example: C minor = C–E♭–G; A minor = A–C–E. Symbols: Cm, Cmin or C−. Compared with major, only the third is lowered by one semitone. Listen to the notes separately, then together.',
'You have met both triads. Now identify whether the chord has a major third or a minor third. All three notes sound together, and the root changes between questions.',
'Listen to the three chord tones played one after another, from low to high. Major triads move 4 then 3 semitones; minor triads move 3 then 4. Identify the quality by ear.',
'Final challenge: identify major and minor triads across changing roots. Some questions play the notes together, some separately, and some in both ways.'
];
export function makeChordQuestions(level,count=10){
 const focus='both';
 const result=[];let last=-1;
 for(let i=0;i<count;i++){
  const quality=focus==='both'?(i%2?'minor':'major'):focus;
  const choices=Array.from({length:25},(_,j)=>48+j).filter(n=>n!==last);
  const root=choices[Math.floor(Math.random()*choices.length)];last=root;
  const mode=CHORD_MODES[level];
  const presentation=mode==='random'?['harmonic','arpeggiated','combined'][Math.floor(Math.random()*3)]:mode;
  result.push({quality,root,presentation,notes:TRIADS[quality].map(n=>root+n)});
 }
 for(let i=result.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[result[i],result[j]]=[result[j],result[i]];}
 return result;
}

export const CHORD_CHAPTER_2=[["Diminished Triads","Diminished triads contain root, minor third and diminished fifth (0, 3, 6). C–E♭–G♭ sounds tense.",1,"diminished"],["Augmented Triads","Augmented triads contain root, major third and augmented fifth (0, 4, 8). C–E–G♯ sounds unsettled.",1,"augmented"],["Suspended Chords","Sus2 (0, 2, 7) replaces the third with a second; sus4 (0, 5, 7) replaces it with a fourth. C–D–G versus C–F–G.",1,"sus2"],["Diminished vs. Augmented","Hear two stacked minor thirds versus two stacked major thirds.",0,["diminished","augmented"]],["Sus2 vs. Sus4","Identify which suspended tone replaces the third.",0,["sus2","sus4"]],["Recognize the Triad","Identify four chord qualities across changing roots.",0,["diminished","augmented","sus2","sus4"]],["Chapter Challenge","Identify all six qualities in mixed presentations.",0,["major","minor","diminished","augmented","sus2","sus4"]]];
export const CHORD_SHAPES={major:[0,4,7],minor:[0,3,7],diminished:[0,3,6],augmented:[0,4,8],sus2:[0,2,7],sus4:[0,5,7]};
export const CHORD_NAMES={major:'Major',minor:'Minor',diminished:'Diminished',augmented:'Augmented',sus2:'Sus2',sus4:'Sus4'};
export const chordLevels=c=>c===1?CHORD_CHAPTER_2.map(x=>x[0]):CHORD_LEVELS;
export const chordLesson=(c,l)=>c===1?CHORD_CHAPTER_2[l][1]:CHORD_LESSONS[l];
export const chordTheory=(c,l)=>c===1?!!CHORD_CHAPTER_2[l][2]:l<2;
export function makeChapterChordQuestions(c,l,n=10){
 if(c!==1)return makeChordQuestions(l,n);
 const entry=CHORD_CHAPTER_2[l];if(!entry||entry[2])return [];
 const options=entry[3],out=[];
 for(let i=0;i<n;i++){const quality=options[i%options.length],root=48+Math.floor(Math.random()*25),presentation=l===6?['harmonic','arpeggiated','combined'][Math.floor(Math.random()*3)]:l===4?'arpeggiated':'harmonic';out.push({quality,root,presentation,notes:CHORD_SHAPES[quality].map(x=>root+x),options});}
 for(let i=out.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[out[i],out[j]]=[out[j],out[i]];}return out;
}

export const CHORD_CHAPTER_3=[["Root Position","The root is the lowest note. C major: C–E–G. Compare its bass note and spacing with inversions.",1,"root"],["First Inversion","The third is the lowest note. C major/E: E–G–C. Listen for the 3–5–8 semitone pattern from the bass.",1,"first"],["Second Inversion","The fifth is the lowest note. C major/G: G–C–E. Listen for the 5–9 semitone pattern above the bass.",1,"second"],["Root vs. First Inversion","Identify whether the root or third is in the bass. The notes are played from lowest to highest.",0,["root","first"]],["First vs. Second Inversion","Distinguish third-in-bass and fifth-in-bass voicings.",0,["first","second"]],["Inversion Challenge","Identify all three positions of major and minor triads. The bass note is played first.",0,["root","first","second"]]];
export const CHORD_CHAPTER_4=[["Major Seventh","Major seventh: root, major third, perfect fifth and major seventh (0, 4, 7, 11). Cmaj7 = C–E–G–B.",1,"maj7"],["Dominant Seventh","Dominant seventh: major triad plus minor seventh (0, 4, 7, 10). C7 = C–E–G–B♭.",1,"dom7"],["Minor Seventh","Minor seventh: minor triad plus minor seventh (0, 3, 7, 10). Cm7 = C–E♭–G–B♭.",1,"min7"],["Half-Diminished Seventh","Half-diminished seventh: diminished triad plus minor seventh (0, 3, 6, 10). Cø7 = C–E♭–G♭–B♭.",1,"halfDim7"],["Major 7 vs. Dominant 7","Listen for the major seventh versus minor seventh above the same major triad.",0,["maj7","dom7"]],["Minor 7 vs. Half-Diminished","Listen for the perfect fifth versus diminished fifth.",0,["min7","halfDim7"]],["Seventh Chord Challenge","Identify four seventh-chord families with harmonic, arpeggiated and combined playback.",0,["maj7","dom7","min7","halfDim7"]]];
Object.assign(CHORD_SHAPES,{maj7:[0,4,7,11],dom7:[0,4,7,10],min7:[0,3,7,10],halfDim7:[0,3,6,10]});
Object.assign(CHORD_NAMES,{root:'Root position',first:'First inversion',second:'Second inversion',maj7:'Major seventh',dom7:'Dominant seventh',min7:'Minor seventh',halfDim7:'Half-diminished seventh'});
const CHORD_EXTRA={2:CHORD_CHAPTER_3,3:CHORD_CHAPTER_4};
const previousChordLevels=chordLevels,previousChordLesson=chordLesson,previousChordTheory=chordTheory,previousChordQuestions=makeChapterChordQuestions;
export const allChordLevels=c=>CHORD_EXTRA[c]?CHORD_EXTRA[c].map(x=>x[0]):previousChordLevels(c);
export const allChordLesson=(c,l)=>CHORD_EXTRA[c]?CHORD_EXTRA[c][l][1]:previousChordLesson(c,l);
export const allChordTheory=(c,l)=>CHORD_EXTRA[c]?!!CHORD_EXTRA[c][l][2]:previousChordTheory(c,l);
export function chordDemo(c,l){
 if(c===2)return {quality:'major',root:60,presentation:'arpeggiated',offsets:invertedTriad('major',CHORD_CHAPTER_3[l][3])};
 if(c===3)return {quality:CHORD_CHAPTER_4[l][3],root:60,presentation:'combined'};
 return null;
}
function invertedTriad(quality,position){
 const tones=CHORD_SHAPES[quality],p=position==='first'?1:position==='second'?2:0;
 return tones.map((_,i)=>tones[(i+p)%3]+(i+p>=3?12:0));
}
export function makeAllChordQuestions(c,l,n=10){
 if(!CHORD_EXTRA[c])return previousChordQuestions(c,l,n);
 const entry=CHORD_EXTRA[c][l];if(!entry||entry[2])return [];
 const options=entry[3],out=[];
 for(let i=0;i<n;i++){
  const quality=options[i%options.length],root=48+Math.floor(Math.random()*21);
  const triad=c===2,base=triad?(i%2?'minor':'major'):quality;
  const offsets=triad?invertedTriad(base,quality):CHORD_SHAPES[quality];
  const presentation=triad?'arpeggiated':l===6?['harmonic','arpeggiated','combined'][Math.floor(Math.random()*3)]:'harmonic';
  out.push({quality,root,presentation,notes:offsets.map(x=>root+x),offsets,options});
 }
 for(let i=out.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[out[i],out[j]]=[out[j],out[i]];}return out;
}

export const CHORD_CHAPTER_5=[["Fully Diminished Seventh","A fully diminished seventh contains root, minor third, diminished fifth and diminished seventh: 0, 3, 6, 9 semitones. C°7 = C–E♭–G♭–B𝄫 (enharmonically A).",1,"dim7"],["Minor-Major Seventh","A minor-major seventh combines a minor triad with a major seventh: 0, 3, 7, 11. Cm(maj7) = C–E♭–G–B.",1,"minMaj7"],["Augmented Seventh","An augmented dominant seventh has a major third, augmented fifth and minor seventh: 0, 4, 8, 10. C7♯5 = C–E–G♯–B♭.",1,"aug7"],["Half vs. Fully Diminished","Compare Cø7 (0, 3, 6, 10) with C°7 (0, 3, 6, 9). The seventh differs by one semitone.",0,["halfDim7","dim7"]],["Minor 7 vs. Minor-Major 7","Listen for the minor seventh (10 semitones) versus major seventh (11) above a minor triad.",0,["min7","minMaj7"]],["Altered Seventh Colors","Identify dominant seventh, augmented dominant seventh and fully diminished seventh chords.",0,["dom7","aug7","dim7"]],["Advanced Seventh Challenge","Identify six seventh-chord qualities, including diminished, minor-major and augmented variants.",0,["halfDim7","dim7","min7","minMaj7","dom7","aug7"]]];
export const CHORD_CHAPTER_6=[["Major Sixth","A major sixth chord adds a major sixth to a major triad: 0, 4, 7, 9. C6 = C–E–G–A.",1,"maj6"],["Minor Sixth","A minor sixth chord adds a major sixth to a minor triad: 0, 3, 7, 9. Cm6 = C–E♭–G–A. The sixth is not lowered.",1,"min6"],["Add9 Chords","An add9 chord adds the ninth without a seventh: Cadd9 = C–E–G–D (0, 4, 7, 14). Compare with Cmaj9, which also includes B.",1,"add9"],["Minor Add9","A minor add9 chord adds a ninth to a minor triad without adding a seventh: Cm(add9) = C–E♭–G–D (0, 3, 7, 14).",1,"minAdd9"],["Major 6 vs. Minor 6","Listen for the major versus minor third; both sixth chords contain the same major sixth.",0,["maj6","min6"]],["Add9 vs. Minor Add9","Identify whether the added-ninth chord contains a major or minor third.",0,["add9","minAdd9"]],["Added Tones Challenge","Distinguish sixth and added-ninth chords, with changing roots and varied playback.",0,["maj6","min6","add9","minAdd9"]]];
Object.assign(CHORD_SHAPES,{dim7:[0,3,6,9],minMaj7:[0,3,7,11],aug7:[0,4,8,10],maj6:[0,4,7,9],min6:[0,3,7,9],add9:[0,4,7,14],minAdd9:[0,3,7,14]});
Object.assign(CHORD_NAMES,{dim7:'Fully diminished seventh',minMaj7:'Minor-major seventh',aug7:'Augmented seventh',maj6:'Major sixth',min6:'Minor sixth',add9:'Add9',minAdd9:'Minor add9'});
const NEXT_CHORD_CHAPTERS={4:CHORD_CHAPTER_5,5:CHORD_CHAPTER_6};
export const extendedChordLevels=c=>NEXT_CHORD_CHAPTERS[c]?NEXT_CHORD_CHAPTERS[c].map(x=>x[0]):allChordLevels(c);
export const extendedChordLesson=(c,l)=>NEXT_CHORD_CHAPTERS[c]?NEXT_CHORD_CHAPTERS[c][l][1]:allChordLesson(c,l);
export const extendedChordTheory=(c,l)=>NEXT_CHORD_CHAPTERS[c]?!!NEXT_CHORD_CHAPTERS[c][l][2]:allChordTheory(c,l);
export function extendedChordDemo(c,l){
 if(!NEXT_CHORD_CHAPTERS[c])return chordDemo(c,l);
 const quality=NEXT_CHORD_CHAPTERS[c][l][3];
 return typeof quality==='string'?{quality,root:60,presentation:'combined'}:null;
}
export function makeExtendedChordQuestions(c,l,n=10){
 if(!NEXT_CHORD_CHAPTERS[c])return makeAllChordQuestions(c,l,n);
 const entry=NEXT_CHORD_CHAPTERS[c][l];if(!entry||entry[2])return [];
 const options=entry[3],out=[];
 for(let i=0;i<n;i++){
  const quality=options[i%options.length],root=48+Math.floor(Math.random()*21);
  const offsets=CHORD_SHAPES[quality],presentation=l===6?['harmonic','arpeggiated','combined'][Math.floor(Math.random()*3)]:l===5?'arpeggiated':'harmonic';
  out.push({quality,root,notes:offsets.map(x=>root+x),presentation,options});
 }
 for(let i=out.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[out[i],out[j]]=[out[j],out[i]];}
 return out;
}

export const CHORD_CHAPTER_7=[["Dominant Ninth","C9 contains C–E–G–B♭–D: 0, 4, 7, 10, 14 semitones. A ninth chord includes a seventh, unlike Cadd9.",1,"dom9"],["Major Ninth","Cmaj9 contains C–E–G–B–D: 0, 4, 7, 11, 14. Its major seventh differs from C9.",1,"maj9"],["Minor Ninth","Cm9 contains C–E♭–G–B♭–D: 0, 3, 7, 10, 14.",1,"min9"],["Add9 vs. Dominant Ninth","Cadd9 lacks the seventh, whereas C9 includes B♭. Hear the added tension.",0,["add9","dom9"]],["Major 9 vs. Dominant 9","Compare the major seventh with the minor seventh in ninth chords.",0,["maj9","dom9"]],["Minor 9 vs. Dominant 9","Listen for the minor versus major third in two ninth chords.",0,["min9","dom9"]],["Ninth Chord Challenge","Recognize add9, dominant ninth, major ninth and minor ninth across changing roots.",0,["add9","dom9","maj9","min9"]]];
export const CHORD_CHAPTER_8=[["Dominant Eleventh","C11 contains C–E–G–B♭–D–F: 0, 4, 7, 10, 14, 17. In practice the third or fifth is sometimes omitted to reduce clashes.",1,"dom11"],["Minor Eleventh","Cm11 contains C–E♭–G–B♭–D–F: 0, 3, 7, 10, 14, 17.",1,"min11"],["Dominant Thirteenth","C13 contains C–E–G–B♭–D–F–A: 0, 4, 7, 10, 14, 17, 21. Practical voicings often omit the fifth, ninth or eleventh.",1,"dom13"],["Major Thirteenth","Cmaj13 contains C–E–G–B–D–F–A: 0, 4, 7, 11, 14, 17, 21. The major seventh distinguishes it from C13.",1,"maj13"],["Dominant 11 vs. Minor 11","Identify the major versus minor third within the eleventh-chord family.",0,["dom11","min11"]],["Dominant 13 vs. Major 13","Listen for the minor versus major seventh in thirteenth chords.",0,["dom13","maj13"]],["Extended Harmony Challenge","Compare eleventh and thirteenth chord qualities, hearing the added upper extensions.",0,["dom11","min11","dom13","maj13"]]];
Object.assign(CHORD_SHAPES,{dom9:[0,4,7,10,14],maj9:[0,4,7,11,14],min9:[0,3,7,10,14],dom11:[0,4,7,10,14,17],min11:[0,3,7,10,14,17],dom13:[0,4,7,10,14,17,21],maj13:[0,4,7,11,14,17,21]});
Object.assign(CHORD_NAMES,{dom9:'Dominant ninth',maj9:'Major ninth',min9:'Minor ninth',dom11:'Dominant eleventh',min11:'Minor eleventh',dom13:'Dominant thirteenth',maj13:'Major thirteenth'});
const UPPER_CHORD_CHAPTERS={6:CHORD_CHAPTER_7,7:CHORD_CHAPTER_8};
export const upperChordLevels=c=>UPPER_CHORD_CHAPTERS[c]?UPPER_CHORD_CHAPTERS[c].map(x=>x[0]):extendedChordLevels(c);
export const upperChordLesson=(c,l)=>UPPER_CHORD_CHAPTERS[c]?UPPER_CHORD_CHAPTERS[c][l][1]:extendedChordLesson(c,l);
export const upperChordTheory=(c,l)=>UPPER_CHORD_CHAPTERS[c]?!!UPPER_CHORD_CHAPTERS[c][l][2]:extendedChordTheory(c,l);
export function upperChordDemo(c,l){
 if(!UPPER_CHORD_CHAPTERS[c])return extendedChordDemo(c,l);
 const quality=UPPER_CHORD_CHAPTERS[c][l][3];
 return typeof quality==='string'?{quality,root:60,presentation:'combined'}:null;
}
export function makeUpperChordQuestions(c,l,n=10){
 if(!UPPER_CHORD_CHAPTERS[c])return makeExtendedChordQuestions(c,l,n);
 const entry=UPPER_CHORD_CHAPTERS[c][l];if(!entry||entry[2])return [];
 const options=entry[3],out=[];
 for(let i=0;i<n;i++){
  const quality=options[i%options.length],root=48+Math.floor(Math.random()*16);
  const offsets=CHORD_SHAPES[quality],presentation=l===6?['harmonic','arpeggiated','combined'][Math.floor(Math.random()*3)]:l===5?'arpeggiated':'harmonic';
  out.push({quality,root,notes:offsets.map(x=>root+x),presentation,options});
 }
 for(let i=out.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[out[i],out[j]]=[out[j],out[i]];}
 return out;
}

export const CHORD_CHAPTER_9=[["Dominant Flat Nine","C7♭9 = C–E–G–B♭–D♭ (0,4,7,10,13). The flat ninth creates strong tension.",1,"domFlat9"],["Dominant Sharp Nine","C7♯9 = C–E–G–B♭–D♯ (0,4,7,10,15). The sharp ninth is enharmonically E♭, but spelled D♯.",1,"domSharp9"],["Dominant Flat Five","C7♭5 = C–E–G♭–B♭ (0,4,6,10). The fifth is lowered by one semitone.",1,"domFlat5"],["Dominant Sharp Five","C7♯5 = C–E–G♯–B♭ (0,4,8,10). The fifth is raised by one semitone.",1,"aug7"],["Flat 9 vs. Sharp 9","Identify whether the altered ninth lies one semitone above the octave or three semitones above it.",0,["domFlat9","domSharp9"]],["Flat 5 vs. Sharp 5","Listen for the lowered or raised fifth in dominant seventh chords.",0,["domFlat5","aug7"]],["Altered Dominants Challenge","Identify four altered dominant qualities using changing roots and mixed playback.",0,["domFlat9","domSharp9","domFlat5","aug7"]]];
export const CHORD_CHAPTER_10=[["Close Position","A close-position Cmaj7 places C–E–G–B within one octave: 0,4,7,11. Listen to its compact texture.",1,"closeMaj7"],["Open Position","An open Cmaj7 voicing spreads the same notes across a wider range: C–G–B–E (0,7,11,16).",1,"openMaj7"],["Drop-2 Voicing","Starting with Cmaj7 in close position C–E–G–B, drop the second-highest note G by an octave: G–C–E–B. Relative to G, offsets are 0,5,9,16.",1,"drop2Maj7"],["Shell Voicing","A C7 shell uses the root, third and seventh: C–E–B♭ (0,4,10). The fifth is optional; the third and seventh define dominant function.",1,"shellDom7"],["Close vs. Open","Identify compact versus spread Cmaj7 structures across changing roots.",0,["closeMaj7","openMaj7"]],["Open vs. Drop-2","Hear two different wide Cmaj7 arrangements: open position and drop-2.",0,["openMaj7","drop2Maj7"]],["Voicing Challenge","Identify close, open, drop-2 and dominant shell voicings by their spacing and chord color.",0,["closeMaj7","openMaj7","drop2Maj7","shellDom7"]]];
Object.assign(CHORD_SHAPES,{domFlat9:[0,4,7,10,13],domSharp9:[0,4,7,10,15],domFlat5:[0,4,6,10],closeMaj7:[0,4,7,11],openMaj7:[0,7,11,16],drop2Maj7:[0,5,9,16],shellDom7:[0,4,10]});
Object.assign(CHORD_NAMES,{domFlat9:'Dominant flat nine',domSharp9:'Dominant sharp nine',domFlat5:'Dominant flat five',closeMaj7:'Close position',openMaj7:'Open position',drop2Maj7:'Drop-2 voicing',shellDom7:'Dominant shell'});
const VOICING_CHAPTERS={8:CHORD_CHAPTER_9,9:CHORD_CHAPTER_10};
export const finalChordLevels=c=>VOICING_CHAPTERS[c]?VOICING_CHAPTERS[c].map(x=>x[0]):upperChordLevels(c);
export const finalChordLesson=(c,l)=>VOICING_CHAPTERS[c]?VOICING_CHAPTERS[c][l][1]:upperChordLesson(c,l);
export const finalChordTheory=(c,l)=>VOICING_CHAPTERS[c]?!!VOICING_CHAPTERS[c][l][2]:upperChordTheory(c,l);
export function finalChordDemo(c,l){
 if(!VOICING_CHAPTERS[c])return upperChordDemo(c,l);
 const quality=VOICING_CHAPTERS[c][l][3];
 return typeof quality==='string'?{quality,root:60,presentation:'combined'}:null;
}
export function makeFinalChordQuestions(c,l,n=10){
 if(!VOICING_CHAPTERS[c])return makeUpperChordQuestions(c,l,n);
 const entry=VOICING_CHAPTERS[c][l];if(!entry||entry[2])return [];
 const options=entry[3],out=[];
 for(let i=0;i<n;i++){
  const quality=options[i%options.length],root=48+Math.floor(Math.random()*19),offsets=CHORD_SHAPES[quality];
  const presentation=c===9?'arpeggiated':l===6?['harmonic','arpeggiated','combined'][Math.floor(Math.random()*3)]:l===5?'arpeggiated':'harmonic';
  out.push({quality,root,notes:offsets.map(x=>root+x),presentation,options});
 }
 for(let i=out.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[out[i],out[j]]=[out[j],out[i]];}
 return out;
}

export const CHORD_CHAPTER_11=[["Tonic Function","In a major key, I is the tonic: the tonal home. Hear C major followed by G7 and a return to C (I–V7–I).",1,"tonic"],["Dominant Function","V7 contains the leading tone and a tritone that tend to resolve to I. Hear C–G7–C in C major.",1,"dominant"],["Predominant Function","IV and ii commonly lead toward V. Hear C–F–G7–C (I–IV–V7–I).",1,"predominant"],["Tonic vs. Dominant","Listen to a C-major-key context and identify whether the final chord is I or V7. The key is transposed between questions.",0,["tonic","dominant"]],["Predominant vs. Dominant","Hear I followed by IV or V7. Identify the function of the final chord.",0,["predominant","dominant"]],["Functional Harmony Challenge","Recognize I, IV and V7 as the final chord after an establishing tonic, across different major keys.",0,["tonic","predominant","dominant"]]];
export const CHORD_CHAPTER_12=[["Authentic Cadence","V7–I moves from dominant tension to tonic resolution. Hear G7–C in C major.",1,"authentic"],["Plagal Cadence","IV–I moves from subdominant to tonic. Hear F–C in C major.",1,"plagal"],["Deceptive Cadence","V7–vi moves from dominant to relative minor instead of I. Hear G7–Am in C major.",1,"deceptive"],["Authentic vs. Plagal","Both cadences end on I. Identify whether V7 or IV leads to tonic.",0,["authentic","plagal"]],["Authentic vs. Deceptive","Hear whether V7 resolves to I or moves unexpectedly to vi.",0,["authentic","deceptive"]],["Three Cadences","Identify authentic, plagal and deceptive cadences in transposed major keys.",0,["authentic","plagal","deceptive"]],["Progressions Challenge","Recognize authentic, plagal and deceptive endings after a tonic key-establishing chord.",0,["authentic","plagal","deceptive"]]];
Object.assign(CHORD_NAMES,{tonic:'Tonic (I)',dominant:'Dominant (V7)',predominant:'Predominant (IV)',authentic:'Authentic (V7–I)',plagal:'Plagal (IV–I)',deceptive:'Deceptive (V7–vi)'});
const CONTEXT_CHAPTERS={10:CHORD_CHAPTER_11,11:CHORD_CHAPTER_12};
export const contextChordLevels=c=>CONTEXT_CHAPTERS[c]?CONTEXT_CHAPTERS[c].map(x=>x[0]):finalChordLevels(c);
export const contextChordLesson=(c,l)=>CONTEXT_CHAPTERS[c]?CONTEXT_CHAPTERS[c][l][1]:finalChordLesson(c,l);
export const contextChordTheory=(c,l)=>CONTEXT_CHAPTERS[c]?!!CONTEXT_CHAPTERS[c][l][2]:finalChordTheory(c,l);
function contextSequence(chapter,quality,root,level){
 const I=[0,4,7],IV=[5,9,12],V7=[7,11,14,17],vi=[9,12,16];
 if(chapter===10){
  if(level<3)return quality==='predominant'?[I,IV,V7,I]:[I,V7,I];
  return [I,quality==='tonic'?I:quality==='dominant'?V7:IV];
 }
 const ending=quality==='authentic'?[V7,I]:quality==='plagal'?[IV,I]:[V7,vi];
 return level===6?[I,...ending]:ending;
}
export function contextChordDemo(chapter,level){
 if(!CONTEXT_CHAPTERS[chapter])return finalChordDemo(chapter,level);
 const quality=CONTEXT_CHAPTERS[chapter][level][3];
 return {quality,root:60,sequence:contextSequence(chapter,quality,60,level)};
}
export function makeContextChordQuestions(chapter,level,count=10){
 if(!CONTEXT_CHAPTERS[chapter])return makeFinalChordQuestions(chapter,level,count);
 const entry=CONTEXT_CHAPTERS[chapter][level];if(!entry||entry[2])return [];
 const options=entry[3],out=[];
 for(let i=0;i<count;i++){
  const quality=options[i%options.length],root=48+Math.floor(Math.random()*13);
  out.push({quality,root,sequence:contextSequence(chapter,quality,root,level),options});
 }
 for(let i=out.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[out[i],out[j]]=[out[j],out[i]];}
 return out;
}

export const CHORD_CHAPTER_13=[["Dorian Color","A Dorian minor chord with an added natural sixth: C–E♭–G–A (0,3,7,9). The natural sixth distinguishes Dorian color from Aeolian ♭6.",1,"dorian"],["Phrygian Color","A Phrygian minor chord with a flat ninth: C–E♭–G–D♭ (0,3,7,13). The flat second is characteristic.",1,"phrygian"],["Lydian Color","A Lydian major chord with a raised fourth: C–E–G–F♯ (0,4,7,18). The ♯11 is characteristic.",1,"lydian"],["Mixolydian Color","A Mixolydian dominant seventh chord: C–E–G–B♭ (0,4,7,10). The flat seventh differentiates it from Ionian major seventh.",1,"mixolydian"],["Dorian vs. Phrygian","Identify the natural sixth or flat second over a minor tonic.",0,["dorian","phrygian"]],["Lydian vs. Mixolydian","Hear the raised fourth versus the minor seventh above a major tonic.",0,["lydian","mixolydian"]],["Modal Harmony Challenge","Recognize four modal chord colors over changing tonic roots.",0,["dorian","phrygian","lydian","mixolydian"]]];
export const CHORD_CHAPTER_14=[["Quartal Voicing","Quartal harmony stacks fourths rather than thirds. C–F–B♭ (0,5,10) creates an open sound.",1,"quartal"],["Tone Cluster","A tone cluster uses adjacent notes. C–D–E (0,2,4) produces a dense, close-spaced color.",1,"cluster"],["Slash Chord","A slash chord specifies a bass note. C/E is a C major triad over E in the bass: E–G–C (0,3,8 relative to E).",1,"slash"],["Polychord","A polychord combines two recognizable triads. C major plus D major: C–E–G–D–F♯–A (0,4,7,14,18,21).",1,"poly"],["Quartal vs. Cluster","Distinguish stacked fourths from adjacent-tone clusters.",0,["quartal","cluster"]],["Slash vs. Quartal","Compare an inverted major triad with a quartal voicing.",0,["slash","quartal"]],["Advanced Structures Challenge","Identify quartal, cluster, slash-chord and polychord textures.",0,["quartal","cluster","slash","poly"]]];
Object.assign(CHORD_SHAPES,{dorian:[0,3,7,9],phrygian:[0,3,7,13],lydian:[0,4,7,18],mixolydian:[0,4,7,10],quartal:[0,5,10],cluster:[0,2,4],slash:[0,3,8],poly:[0,4,7,14,18,21]});
Object.assign(CHORD_NAMES,{dorian:'Dorian color',phrygian:'Phrygian color',lydian:'Lydian color',mixolydian:'Mixolydian color',quartal:'Quartal voicing',cluster:'Tone cluster',slash:'Slash chord',poly:'Polychord'});
const MODERN_CHAPTERS={12:CHORD_CHAPTER_13,13:CHORD_CHAPTER_14};
export const modernChordLevels=c=>MODERN_CHAPTERS[c]?MODERN_CHAPTERS[c].map(x=>x[0]):contextChordLevels(c);
export const modernChordLesson=(c,l)=>MODERN_CHAPTERS[c]?MODERN_CHAPTERS[c][l][1]:contextChordLesson(c,l);
export const modernChordTheory=(c,l)=>MODERN_CHAPTERS[c]?!!MODERN_CHAPTERS[c][l][2]:contextChordTheory(c,l);
export function modernChordDemo(c,l){
 if(!MODERN_CHAPTERS[c])return contextChordDemo(c,l);
 const quality=MODERN_CHAPTERS[c][l][3];
 return typeof quality==='string'?{quality,root:60,presentation:'combined'}:null;
}
export function makeModernChordQuestions(c,l,n=10){
 if(!MODERN_CHAPTERS[c])return makeContextChordQuestions(c,l,n);
 const entry=MODERN_CHAPTERS[c][l];if(!entry||entry[2])return [];
 const options=entry[3],out=[];
 for(let i=0;i<n;i++){
  const quality=options[i%options.length],root=48+Math.floor(Math.random()*16),offsets=CHORD_SHAPES[quality];
  const presentation=l===6?['harmonic','arpeggiated','combined'][Math.floor(Math.random()*3)]:l===5?'arpeggiated':'harmonic';
  out.push({quality,root,notes:offsets.map(x=>root+x),presentation,options});
 }
 for(let i=out.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[out[i],out[j]]=[out[j],out[i]];}
 return out;
}

export const CHORD_CHAPTER_15=[["Mastery Warm-Up","Review major, minor, diminished, augmented and suspended triads. Listen for the third, fifth and suspended tones.",1,"major"],["Harmony Across Chapters","Practice listening for triad inversions, seventh chords, extensions, voicings and harmonic function. Replay each example before deciding.",1,"maj7"],["Triads & Inversions","Identify major, minor, diminished, augmented and suspended chords, plus root, first and second inversions.",0,"triads"],["Sevenths & Extensions","Identify seventh, ninth, eleventh and thirteenth chords from earlier chapters.",0,"extensions"],["Alterations & Modal Colors","Recognize altered dominants, Dorian, Phrygian, Lydian and Mixolydian colors.",0,"colors"],["Voicings & Structures","Recognize close, open, drop-2, shell, quartal, cluster, slash and polychord sounds.",0,"structures"],["Functions & Cadences","Hear tonic, predominant and dominant functions as well as authentic, plagal and deceptive cadences.",0,"cadences"],["Chord Master Challenge","A comprehensive mixed challenge covering triads, inversions, extended chords, modal colors, structures and harmonic progressions.",0,"master"]];
export const masteryChordLevels=c=>c===14?CHORD_CHAPTER_15.map(x=>x[0]):modernChordLevels(c);
export const masteryChordLesson=(c,l)=>c===14?CHORD_CHAPTER_15[l][1]:modernChordLesson(c,l);
export const masteryChordTheory=(c,l)=>c===14?!!CHORD_CHAPTER_15[l][2]:modernChordTheory(c,l);
export const masteryChordDemo=(c,l)=>c===14?{quality:l===0?'major':'maj7',root:60,presentation:'combined'}:modernChordDemo(c,l);
const MASTER_POOLS={
 triads:[['major','minor','diminished','augmented','sus2','sus4'],['root','first','second']],
 extensions:[['maj7','dom7','min7','halfDim7','dim7','minMaj7','aug7'],['dom9','maj9','min9','dom11','min11','dom13','maj13']],
 colors:[['domFlat9','domSharp9','domFlat5','aug7'],['dorian','phrygian','lydian','mixolydian']],
 structures:[['closeMaj7','openMaj7','drop2Maj7','shellDom7'],['quartal','cluster','slash','poly']],
 cadences:[['tonic','predominant','dominant'],['authentic','plagal','deceptive']]
};
const MASTER_GROUPS=[...Object.values(MASTER_POOLS).flat()];
export function makeMasteryChordQuestions(chapter,level,count=10){
 if(chapter!==14)return makeModernChordQuestions(chapter,level,count);
 if(level<2)return [];
 const groups=level===7?MASTER_GROUPS:MASTER_POOLS[CHORD_CHAPTER_15[level][3]];
 const result=[];
 for(let i=0;i<count;i++){
  const group=groups[i%groups.length],quality=group[Math.floor(i/groups.length)%group.length];
  const root=48+Math.floor(Math.random()*13);
  let item;
  if(['root','first','second'].includes(quality)){
   const triad=i%2?'minor':'major',tones=CHORD_SHAPES[triad],p=quality==='first'?1:quality==='second'?2:0;
   const offsets=tones.map((_,j)=>tones[(j+p)%3]+(j+p>=3?12:0));
   item={quality,root,offsets,presentation:'arpeggiated',options:group};
  }else if(['tonic','predominant','dominant','authentic','plagal','deceptive'].includes(quality)){
   const source=['tonic','predominant','dominant'].includes(quality)?10:11;
   const seq=makeContextChordQuestions(source,source===10?5:6,group.length*2).find(x=>x.quality===quality);
   item={quality,root:seq.root,sequence:seq.sequence,options:group};
  }else{
   item={quality,root,presentation:i%3===0?'harmonic':i%3===1?'arpeggiated':'combined',options:group};
  }
  result.push(item);
 }
 for(let i=result.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[result[i],result[j]]=[result[j],result[i]];}
 return result;
}
