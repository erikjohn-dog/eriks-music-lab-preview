export const SCALE_SHAPES={major:[0,2,4,5,7,9,11,12],naturalMinor:[0,2,3,5,7,8,10,12],harmonicMinor:[0,2,3,5,7,8,11,12],melodicMinor:[0,2,3,5,7,9,11,12]};
export const SCALE_NAMES={major:'Major scale',naturalMinor:'Natural minor',harmonicMinor:'Harmonic minor',melodicMinor:'Melodic minor (ascending)'};
export const SCALE_CHAPTERS=[
 [
 ['Major Scale','The major scale follows whole–whole–half–whole–whole–whole–half steps (2–2–1–2–2–2–1). C major: C–D–E–F–G–A–B–C.',true,'major'],
 ['Natural Minor','Natural minor follows 2–1–2–2–1–2–2. A natural minor: A–B–C–D–E–F–G–A. Compare its lowered third, sixth and seventh to major.',true,'naturalMinor'],
 ['Hear the Third','Major has a major third (4 semitones); natural minor has a minor third (3 semitones). Listen to the full ascending scale.',false,['major','naturalMinor']],
 ['Ascending & Descending','Recognize major versus natural minor in both ascending and descending playback.',false,['major','naturalMinor']],
 ['Major & Minor Challenge','Identify major and natural minor scales in changing keys and directions.',false,['major','naturalMinor']]
 ],
 [
 ['Harmonic Minor','Harmonic minor raises the seventh of natural minor. A harmonic minor: A–B–C–D–E–F–G♯–A. The sixth-to-seventh leap is three semitones.',true,'harmonicMinor'],
 ['Melodic Minor (Ascending)','Jazz/ascending melodic minor raises both the sixth and seventh: A–B–C–D–E–F♯–G♯–A. Classical melodic minor often descends as natural minor.',true,'melodicMinor'],
 ['Natural vs. Harmonic','Hear the difference between the flat seventh of natural minor and the raised leading tone of harmonic minor.',false,['naturalMinor','harmonicMinor']],
 ['Harmonic vs. Melodic','Both scales have a raised seventh; melodic minor also has a raised sixth.',false,['harmonicMinor','melodicMinor']],
 ['Three Minor Colors','Identify natural, harmonic and ascending melodic minor scales.',false,['naturalMinor','harmonicMinor','melodicMinor']],
 ['Minor Variations Challenge','Recognize all three minor variants, played up or down across changing tonic notes.',false,['naturalMinor','harmonicMinor','melodicMinor']]
 ]
];
export function makeScaleQuestions(chapter,level,count=10){
 const entry=SCALE_CHAPTERS[chapter]?.[level];if(!entry||entry[2])return [];
 const options=entry[3],questions=[];
 for(let i=0;i<count;i++){
  const quality=options[i%options.length],offsets=SCALE_SHAPES[quality],root=48+Math.floor(Math.random()*19);
  const descending=(chapter===0?level>=3:level===5)&&i%2===1;
  questions.push({quality,root,offsets:descending?[...offsets].reverse():offsets,options,descending});
 }
 for(let i=questions.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[questions[i],questions[j]]=[questions[j],questions[i]];}
 return questions;
}
