// Chapter 1: theory-first interval listening, followed by graded identification.
export const INTERVAL_LEVELS=[
 ['Unison','A unison (P1) is the same pitch played twice. It spans 0 semitones. Example: C4 to C4. Both notes have the same frequency; listening in sequence, there is no pitch change.','theory',0],
 ['Octave','A perfect octave (P8) spans 12 semitones. Example: C4 to C5. The two notes have the same letter name and pitch class, but the higher note vibrates twice as fast.','theory',12],
 ['Perfect Fifth','A perfect fifth (P5) spans 7 semitones. Example: C4 to G4. Count C–D–E–F–G: five letter names. The perfect fifth is smaller than an octave, but larger than a major third.','theory',7],
 ['Hear the Difference','You now know the unison (0 semitones), perfect fifth (7) and octave (12). Listen to the two notes in sequence, then identify their distance. The starting pitch changes each time.','practice',null],
 ['Chapter Challenge','Recognize the unison, perfect fifth and octave in mixed ascending, descending and simultaneous examples. Identify the interval rather than memorizing the starting note.','challenge',null]
];
export const INTERVAL_OPTIONS=[{name:'Unison',semitones:0},{name:'Perfect Fifth',semitones:7},{name:'Octave',semitones:12}];
export function makeIntervalQuestions(level,count=10,random=Math.random){
 if(level<3||level>4)throw new Error('Only practice levels have questions');
 const result=[];let lastRoot=-1;
 for(let i=0;i<count;i++){
  const kind=INTERVAL_OPTIONS[i%3],direction=level===4?['up','down','together'][Math.floor(random()*3)]:'up';
  const min=direction==='down'?60:48,max=direction==='down'?84:72;
  const roots=Array.from({length:max-min+1},(_,j)=>min+j).filter(n=>n!==lastRoot);
  const root=roots[Math.floor(random()*roots.length)];lastRoot=root;
  const notes=direction==='down'?[root,root-kind.semitones]:[root,root+kind.semitones];
  result.push({answer:kind.name,semitones:kind.semitones,notes,direction});
 }
 for(let i=result.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[result[i],result[j]]=[result[j],result[i]];}
 return result;
}
