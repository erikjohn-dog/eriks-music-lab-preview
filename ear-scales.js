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
 ],
 [["Ionian Mode","Ionian is the major scale: C–D–E–F–G–A–B–C. Its third, sixth and seventh are major.",true,"ionian"],["Dorian Mode","Dorian is minor with a natural sixth: D–E–F–G–A–B–C–D. Relative to the tonic: 0,2,3,5,7,9,10,12.",true,"dorian"],["Phrygian Mode","Phrygian is minor with a flat second: E–F–G–A–B–C–D–E. Listen for the half step immediately above the tonic.",true,"phrygian"],["Lydian Mode","Lydian is major with a sharp fourth: F–G–A–B–C–D–E–F. The raised fourth adds brightness and tension.",true,"lydian"],["Mixolydian Mode","Mixolydian is major with a flat seventh: G–A–B–C–D–E–F–G. Compare it with Ionian.",true,"mixolydian"],["Aeolian & Locrian","Aeolian is natural minor; Locrian adds a flat second and flat fifth. Locrian: B–C–D–E–F–G–A–B.",true,"locrian"],["Major-Mode Colors","Identify Ionian, Lydian and Mixolydian by the fourth or seventh degree.",false,["ionian","lydian","mixolydian"]],["Minor-Mode Colors","Compare Dorian, Phrygian and Aeolian. Listen for the second and sixth.",false,["dorian","phrygian","aeolian"]],["Seven Modes Challenge","Recognize all seven diatonic modes from the same tonic in changing keys.",false,["ionian","dorian","phrygian","lydian","mixolydian","aeolian","locrian"]]],
 [["Major Pentatonic","Major pentatonic uses scale degrees 1–2–3–5–6: C–D–E–G–A–C (0,2,4,7,9,12). It omits the fourth and seventh.",true,"majorPent"],["Minor Pentatonic","Minor pentatonic uses 1–♭3–4–5–♭7: A–C–D–E–G–A (0,3,5,7,10,12).",true,"minorPent"],["Major vs. Minor Pentatonic","Hear the difference between the major and minor third in five-note scales.",false,["majorPent","minorPent"]],["Pentatonic vs. Diatonic Major","Distinguish the five-note major pentatonic from the seven-note major scale.",false,["majorPent","major"]],["Pentatonic vs. Natural Minor","Distinguish minor pentatonic from the seven-note natural minor scale.",false,["minorPent","naturalMinor"]],["Pentatonic Challenge","Recognize major pentatonic, minor pentatonic, major and natural minor across changing keys.",false,["majorPent","minorPent","major","naturalMinor"]]]
];
Object.assign(SCALE_SHAPES,{ionian:[0,2,4,5,7,9,11,12],dorian:[0,2,3,5,7,9,10,12],phrygian:[0,1,3,5,7,8,10,12],lydian:[0,2,4,6,7,9,11,12],mixolydian:[0,2,4,5,7,9,10,12],aeolian:[0,2,3,5,7,8,10,12],locrian:[0,1,3,5,6,8,10,12],majorPent:[0,2,4,7,9,12],minorPent:[0,3,5,7,10,12]});
Object.assign(SCALE_NAMES,{ionian:'Ionian',dorian:'Dorian',phrygian:'Phrygian',lydian:'Lydian',mixolydian:'Mixolydian',aeolian:'Aeolian',locrian:'Locrian',majorPent:'Major pentatonic',minorPent:'Minor pentatonic'});
export function makeScaleQuestions(chapter,level,count=10){
 const entry=SCALE_CHAPTERS[chapter]?.[level];if(!entry||entry[2])return [];
 const options=entry[3],questions=[];
 for(let i=0;i<count;i++){
  const quality=options[i%options.length],offsets=SCALE_SHAPES[quality],root=48+Math.floor(Math.random()*19);
  const descending=(chapter===0?level>=3:chapter===1?level===5:chapter===2?level===8:level===5)&&i%2===1;
  questions.push({quality,root,offsets:descending?[...offsets].reverse():offsets,options,descending});
 }
 for(let i=questions.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[questions[i],questions[j]]=[questions[j],questions[i]];}
 return questions;
}
