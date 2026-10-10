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
 ],
 [
 ['Tritone','The tritone spans 6 semitones, half an octave. Example: C4–F♯4 (augmented fourth) or C4–G♭4 (diminished fifth). The same piano keys can have different written interval names.','theory',6],
 ['Minor Sixth','A minor sixth spans 8 semitones. Example: C4–A♭4. Its inversion is a major third.','theory',8],
 ['Major Sixth','A major sixth spans 9 semitones. Example: C4–A4. Its inversion is a minor third.','theory',9],
 ['Minor Seventh','A minor seventh spans 10 semitones. Example: C4–B♭4. It is found between the root and seventh of a dominant seventh chord.','theory',10],
 ['Major Seventh','A major seventh spans 11 semitones. Example: C4–B4. It lies just one semitone below the octave.','theory',11],
 ['Sixths: Hear the Difference','Identify minor sixths (8 semitones) and major sixths (9 semitones).','practice',null],
 ['Sevenths: Hear the Difference','Identify minor sevenths (10 semitones) and major sevenths (11 semitones).','practice',null],
 ['Tension & Color Challenge','Identify the tritone, sixths and sevenths in varied keys and directions.','challenge',null]
 ],
 [
 ['Chromatic Interval Map','In one octave, intervals cover 0 to 12 semitones. You have learned the unison, minor and major seconds and thirds, perfect fourth, tritone, perfect fifth, minor and major sixths and sevenths, and octave.','theory',0],
 ['Small Steps','Review the four smallest intervals: minor second (1), major second (2), minor third (3), major third (4). Listen for the difference in distance.','practice',null],
 ['Middle Distances','Compare the perfect fourth (5), tritone (6), and perfect fifth (7).','practice',null],
 ['Wide Leaps','Compare the minor sixth (8), major sixth (9), minor seventh (10), major seventh (11) and octave (12).','practice',null],
 ['All Twelve Challenge','Identify all chromatic interval distances from unison (0) through octave (12), with changing roots and presentations.','challenge',null]
 ],
 [
 ['Ascending Motion','An ascending interval moves from a lower pitch to a higher pitch. Example: C4 followed by G4. Listen to which note comes second.','theory',7],
 ['Descending Motion','A descending interval moves from a higher pitch to a lower pitch. Example: G4 followed by C4. The distance is the same, but the melodic direction is reversed.','theory',-7],
 ['Direction: Hear the Difference','Listen to two successive notes and choose whether the melody rises or falls. Starting notes and distances vary.','practice',null],
 ['Close vs Wide Direction','Recognize ascending and descending motion with both small steps and larger leaps.','practice',null],
 ['Direction Challenge','Identify whether unfamiliar two-note melodies move up or down, across a range of intervals and keys.','challenge',null]
 ],
 [
 ['Melodic and Harmonic','Melodic intervals sound one note after the other; harmonic intervals sound both notes together. The interval size does not change. Listen to a perfect fifth played harmonically.','theory',7],
 ['Harmonic Seconds & Thirds','When notes sound together, minor and major seconds can sound tense, while thirds often sound more blended. Focus on distance, not just consonance.','theory',3],
 ['Harmonic Fourths & Fifths','Compare perfect fourths (5 semitones), tritones (6) and perfect fifths (7), with both notes sounding at once.','theory',5],
 ['Harmonic Small Intervals','Identify minor and major seconds and thirds played simultaneously.','practice',null],
 ['Harmonic Wide Intervals','Identify fourths, tritones, fifths and octaves played simultaneously.','practice',null],
 ['Harmonic Challenge','Identify all 13 chromatic distances from unison to octave when the notes sound together.','challenge',null]
 ],
 [
 ['What Is Inversion?','An interval and its inversion fill one octave. The two distances add to 12 semitones. For example, a perfect fourth (5) inverts to a perfect fifth (7).','theory',5],
 ['Seconds and Sevenths','A minor second (1) inverts to a major seventh (11). A major second (2) inverts to a minor seventh (10). The quality switches between major and minor.','theory',1],
 ['Thirds and Sixths','A minor third (3) inverts to a major sixth (9); a major third (4) inverts to a minor sixth (8). Listen for the narrow and wide versions.','theory',3],
 ['Fourth vs Fifth','Identify the perfect fourth (5) and perfect fifth (7), which invert into each other.','practice',null],
 ['Third vs Sixth','Identify minor and major thirds and their complementary sixths.','practice',null],
 ['Inversion Challenge','Recognize second/seventh, third/sixth and fourth/fifth interval pairs across the octave.','challenge',null]
 ],
 [
 ['Beyond the Octave','Compound intervals are larger than an octave. A minor ninth is 13 semitones and a major ninth is 14 semitones, each one octave above its corresponding second.','theory',14],
 ['Ninths','A minor ninth (13) is C4–D♭5; a major ninth (14) is C4–D5. Compare their color beyond the octave.','theory',13],
 ['Tenths','A minor tenth (15) is C4–E♭5; a major tenth (16) is C4–E5. Each is a third plus an octave.','theory',16],
 ['Elevenths and Twelfths','A perfect eleventh spans 17 semitones (C4–F5); a perfect twelfth spans 19 (C4–G5). Both are compound perfect intervals.','theory',19],
 ['Ninths: Hear the Difference','Identify minor and major ninths played melodically.','practice',null],
 ['Tenths: Hear the Difference','Identify minor and major tenths played melodically.','practice',null],
 ['Compound Interval Challenge','Distinguish ninths, tenths, perfect elevenths and perfect twelfths, including harmonic examples.','challenge',null]
 ]
];
export const INTERVAL_CHAPTER_OPTIONS=[
 INTERVAL_OPTIONS,
 [{name:'Minor Second',semitones:1},{name:'Major Second',semitones:2},{name:'Minor Third',semitones:3},{name:'Major Third',semitones:4}],
 [{name:'Perfect Fourth',semitones:5},{name:'Perfect Fifth',semitones:7},{name:'Perfect Octave',semitones:12}],
 [{name:'Tritone',semitones:6},{name:'Minor Sixth',semitones:8},{name:'Major Sixth',semitones:9},{name:'Minor Seventh',semitones:10},{name:'Major Seventh',semitones:11}],
 [{name:'Unison',semitones:0},{name:'Minor Second',semitones:1},{name:'Major Second',semitones:2},{name:'Minor Third',semitones:3},{name:'Major Third',semitones:4},{name:'Perfect Fourth',semitones:5},{name:'Tritone',semitones:6},{name:'Perfect Fifth',semitones:7},{name:'Minor Sixth',semitones:8},{name:'Major Sixth',semitones:9},{name:'Minor Seventh',semitones:10},{name:'Major Seventh',semitones:11},{name:'Octave',semitones:12}],
 [{name:'Ascending',semitones:1},{name:'Descending',semitones:-1}],
 [{name:'Unison',semitones:0},{name:'Minor Second',semitones:1},{name:'Major Second',semitones:2},{name:'Minor Third',semitones:3},{name:'Major Third',semitones:4},{name:'Perfect Fourth',semitones:5},{name:'Tritone',semitones:6},{name:'Perfect Fifth',semitones:7},{name:'Minor Sixth',semitones:8},{name:'Major Sixth',semitones:9},{name:'Minor Seventh',semitones:10},{name:'Major Seventh',semitones:11},{name:'Octave',semitones:12}],
 [{name:'Minor Second',semitones:1},{name:'Major Second',semitones:2},{name:'Minor Third',semitones:3},{name:'Major Third',semitones:4},{name:'Perfect Fourth',semitones:5},{name:'Perfect Fifth',semitones:7},{name:'Minor Sixth',semitones:8},{name:'Major Sixth',semitones:9},{name:'Minor Seventh',semitones:10},{name:'Major Seventh',semitones:11}],
 [{name:'Minor Ninth',semitones:13},{name:'Major Ninth',semitones:14},{name:'Minor Tenth',semitones:15},{name:'Major Tenth',semitones:16},{name:'Perfect Eleventh',semitones:17},{name:'Perfect Twelfth',semitones:19}]
];
function shuffled(items,random){
 for(let i=items.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[items[i],items[j]]=[items[j],items[i]];}
 return items;
}
export function makeDirectionQuestions(level,count=10,random=Math.random){
 if(level<2||level>4)throw Error('Direction theory has no quiz');
 const result=[];let previous=-1;
 const distances=level===2?[2,4,5,7,9]:level===3?[1,2,3,4,7,9,12]:[1,2,3,4,5,6,7,8,9,10,11,12];
 for(let i=0;i<count;i++){
  const rising=i%2===0;
  const distance=distances[Math.floor(random()*distances.length)];
  const roots=Array.from({length:25},(_,j)=>(rising?48:60)+j).filter(n=>n!==previous);
  const root=roots[Math.floor(random()*roots.length)];previous=root;
  result.push({answer:rising?'Ascending':'Descending',semitones:distance,notes:[root,root+(rising?distance:-distance)],direction:rising?'up':'down',options:INTERVAL_CHAPTER_OPTIONS[5]});
 }
 return shuffled(result,random);
}
export function makeChapterIntervalQuestions(chapter,level,count=10,random=Math.random){
 if(chapter===0)return makeIntervalQuestions(level,count,random);
 if(chapter===5)return makeDirectionQuestions(level,count,random);
 const lessons=INTERVAL_CHAPTERS[chapter],all=INTERVAL_CHAPTER_OPTIONS[chapter];
 if(!lessons||!lessons[level]||lessons[level][2]==='theory')throw new Error('Unknown practice level');
 const options=chapter===1&&level===4?all.slice(0,2):chapter===1&&level===5?all.slice(2):chapter===3&&level===5?all.slice(1,3):chapter===3&&level===6?all.slice(3,5):chapter===4&&level===1?all.slice(1,5):chapter===4&&level===2?all.slice(5,8):chapter===4&&level===3?all.slice(8,13):chapter===6&&level===3?all.slice(1,5):chapter===6&&level===4?all.filter(o=>[5,6,7,12].includes(o.semitones)):chapter===7&&level===3?all.filter(o=>[5,7].includes(o.semitones)):chapter===7&&level===4?all.filter(o=>[3,4,8,9].includes(o.semitones)):chapter===8&&level===4?all.slice(0,2):chapter===8&&level===5?all.slice(2,4):all;
 const result=[];let previous=-1;
 for(let i=0;i<count;i++){
  const kind=options[i%options.length];
  const direction=chapter===6?'together':lessons[level][2]==='challenge'?['up','down','together'][Math.floor(random()*3)]:'up';
  const roots=Array.from({length:chapter===8?13:25},(_,j)=>direction==='down'?(chapter===8?67:60)+j:48+j).filter(n=>n!==previous);
  const root=roots[Math.floor(random()*roots.length)];previous=root;
  const notes=[root,root+(direction==='down'?-kind.semitones:kind.semitones)];
  result.push({answer:kind.name,semitones:kind.semitones,notes,direction,options});
 }
 for(let i=result.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[result[i],result[j]]=[result[j],result[i]];}
 return result;
}
