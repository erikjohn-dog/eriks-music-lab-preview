export const CHORD_LEVELS = ['Major Triad', 'Minor Triad', 'Hear the Difference', 'Arpeggio Training', 'Mixed Recognition', 'Chapter Challenge'];
export const TRIADS = { major: [0, 4, 7], minor: [0, 3, 7] };
export const CHORD_MODES = ['combined','combined','harmonic','arpeggiated','random','random'];
export const CHORD_LESSONS = ['Major: root, major third (4 semitones), fifth (7).','Minor: root, minor third (3 semitones), fifth (7).','The third changes by one semitone.','Arpeggios play notes in sequence.','Identify triads in different keys.','Identify triads in mixed presentations.'];
export function makeChordQuestions(level,count=10){
 const focus=level<2?(level===0?'major':'minor'):'both';
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
