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
