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

export const INTERVAL_CHAPTERS=[
 INTERVAL_LEVELS,
 [
 ['Minor Second','A minor second (m2) spans 1 semitone: C4–D♭4. It is the smallest step in twelve-tone equal temperament.','theory',1],
 ['Major Second','A major second (M2) spans 2 semitones: C4–D4. Compare it with the tighter minor second.','theory',2],
 ['Minor Third','A minor third (m3) spans 3 semitones: C4–E♭4. It is the distance from the root to the third of a minor triad.','theory',3],
 ['Major Third','A major third (M3) spans 4 semitones: C4–E4. It is the distance from the root to the third of a major triad.','theory',4],
 ['Seconds: Hear the Difference','Identify the one-semitone minor second and two-semitone major second by ear.','practice',null],
 ['Thirds: Hear the Difference','Identify the three-semitone minor third and four-semitone major third by ear.','practice',null],
 ['Chapter Challenge','Distinguish all four seconds and thirds with ascending, descending and simultaneous examples.','challenge',null]
 ],
 [
 ['Perfect Fourth','A perfect fourth (P4) spans 5 semitones: C4–F4. It is an inversion of the perfect fifth within an octave.','theory',5],
 ['Perfect Fifth','A perfect fifth (P5) spans 7 semitones: C4–G4. It is often heard between a chord root and its fifth.','theory',7],
 ['Perfect Octave','A perfect octave (P8) spans 12 semitones: C4–C5. The upper note has twice the frequency of the lower note.','theory',12],
 ['Fourths & Fifths','Tell the perfect fourth (5 semitones) from the perfect fifth (7 semitones).','practice',null],
 ['Perfect Intervals Challenge','Recognize perfect fourths, fifths and octaves in different directions and together.','challenge',null]
 ]
];
export const INTERVAL_CHAPTER_OPTIONS=[
 INTERVAL_OPTIONS,
 [{name:'Minor Second',semitones:1},{name:'Major Second',semitones:2},{name:'Minor Third',semitones:3},{name:'Major Third',semitones:4}],
 [{name:'Perfect Fourth',semitones:5},{name:'Perfect Fifth',semitones:7},{name:'Perfect Octave',semitones:12}]
];
export function makeChapterIntervalQuestions(chapter,level,count=10,random=Math.random){
 if(chapter===0)return makeIntervalQuestions(level,count,random);
 const lessons=INTERVAL_CHAPTERS[chapter],all=INTERVAL_CHAPTER_OPTIONS[chapter];
 if(!lessons||!lessons[level]||lessons[level][2]==='theory')throw new Error('Unknown practice level');
 const options=chapter===1&&level===4?all.slice(0,2):chapter===1&&level===5?all.slice(2):all;
 const result=[];let previous=-1;
 for(let i=0;i<count;i++){
  const kind=options[i%options.length];
  const direction=lessons[level][2]==='challenge'?['up','down','together'][Math.floor(random()*3)]:'up';
  const roots=Array.from({length:25},(_,j)=>direction==='down'?60+j:48+j).filter(n=>n!==previous);
  const root=roots[Math.floor(random()*roots.length)];previous=root;
  const notes=[root,root+(direction==='down'?-kind.semitones:kind.semitones)];
  result.push({answer:kind.name,semitones:kind.semitones,notes,direction,options});
 }
 for(let i=result.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[result[i],result[j]]=[result[j],result[i]];}
 return result;
}
