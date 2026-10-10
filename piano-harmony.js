const names=['C','C♯','D','E♭','E','F','F♯','G','A♭','A','B♭','B'];
const shapes=[['maj7',[0,4,7,11]],['7',[0,4,7,10]],['m7',[0,3,7,10]],['m(maj7)',[0,3,7,11]],['dim7',[0,3,6,9]],['m7♭5',[0,3,6,10]],['6',[0,4,7,9]],['m6',[0,3,7,9]],['add9',[0,2,4,7]],['madd9',[0,2,3,7]],['sus2',[0,2,7]],['sus4',[0,5,7]],['dim',[0,3,6]],['aug',[0,4,8]],['m',[0,3,7]],['',[0,4,7]],['5',[0,7]]];
const pc=n=>(n%12+12)%12;
export function recognizeChord(midis){
 const pitches=[...new Set(midis.map(pc))].sort((a,b)=>a-b);
 if(pitches.length<2)return null;
 const bass=pc(Math.min(...midis)),matches=[];
 for(const root of pitches)for(const [suffix,steps] of shapes){
  const test=steps.map(x=>pc(root+x)).sort((a,b)=>a-b);
  if(test.length===pitches.length&&test.every((n,i)=>n===pitches[i]))matches.push({root,suffix});
 }
 if(!matches.length)return 'Unidentified chord';
 matches.sort((a,b)=>Number(b.root===bass)-Number(a.root===bass));
 const found=matches[0];
 return names[found.root]+found.suffix+(bass===found.root?'':' / '+names[bass]);
}
export function intervalName(a,b){
 const n=Math.abs(a-b),simple=['P1','m2','M2','m3','M3','P4','TT','P5','m6','M6','m7','M7'];
 if(n===0)return 'P1 (0 HT)';
 const octave=Math.floor(n/12),r=n%12;
 if(r===0)return 'P'+(octave*7+1)+' ('+n+' HT)';
 const compound=['','m9','M9','m10','M10','P11','TT','P12','m13','M13','m14','M14'];
 return (octave===1?compound[r]:octave>1?simple[r]+' + '+octave+' oct.':simple[r])+' ('+n+' HT)';
}
