export const CHORD_LEVELS = ['Major Triad', 'Minor Triad', 'Hear the Difference', 'Arpeggio Training', 'Chapter Challenge'];
export const TRIADS = { major: [0, 4, 7], minor: [0, 3, 7] };
export const CHORD_MODES = ['combined','combined','harmonic','arpeggiated','random'];
export const CHORD_LESSONS = [
'The major triad is built from a root (1), a major third (3) and a perfect fifth (5). In twelve-tone equal temperament these are 0, 4 and 7 semitones above the root. Example: C major = C–E–G; G major = G–B–D. Symbols: C, Cmaj or CΔ (the triangle is often used for major seventh chords, so plain C is clearest for a major triad). The third gives the triad its major quality. Listen to the notes separately, then together.',
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
