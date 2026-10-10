export const WORLDS = ['Intervals', 'Chords', 'Scales'];
export const PROGRESS_KEY = 'eriks-music-lab:ear-curriculum:v1';
export function grade(correct, total) { const score = total ? 100 * correct / total : 0; return score >= 95 ? 3 : score >= 85 ? 2 : score >= 70 ? 1 : 0; }
export function readProgress() { try { const value = JSON.parse(localStorage.getItem(PROGRESS_KEY) || '{}'); if (!value || typeof value !== 'object' || Array.isArray(value)) return {}; const obsolete=['Chords:0:0','Chords:0:1','Intervals:0:0','Intervals:0:1','Intervals:0:2']; if (obsolete.some(id=>Object.prototype.hasOwnProperty.call(value,id))) { for (const id of obsolete) delete value[id]; try { localStorage.setItem(PROGRESS_KEY, JSON.stringify(value)); } catch {} } return value; } catch { return {}; } }
export function saveResult(id, stars) { if (!Number.isInteger(stars) || stars < 0 || stars > 3) return; const progress = readProgress(); progress[id] = Math.max(progress[id] || 0, stars); try { localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress)); } catch {} }

export const CHAPTERS = {
 Intervals: [
 ['First Steps','Unison, octave and perfect fifth'],['Steps & Leaps','Seconds and thirds'],['Perfect Intervals','Fourths, fifths and octaves'],['Tension & Color','Tritones, sixths and sevenths'],['All Twelve','Chromatic intervals'],['Direction','Ascending and descending'],['Harmonic Intervals','Simultaneous notes'],['Inversions','Complementary intervals'],['Compound Intervals','Beyond the octave'],['Enharmonic Spelling','Notation and context'],['Context & Function','Intervals in music'],['Interval Mastery','Mixed listening']],
 Chords: [
 ['Major & Minor','Triad qualities'],['Triad Families','Diminished, augmented, suspended'],['Inversions','Chord positions'],['Seventh Chords','Four-note harmonies'],['Advanced Sevenths','Diminished and altered'],['Added Tones','Sixths and added tones'],['Ninth Chords','Ninth harmonies'],['Extended Harmony','Elevenths and thirteenths'],['Altered Dominants','Chromatic tensions'],['Voicings','Different note arrangements'],['Functional Harmony','Harmonic functions'],['Progressions','Cadences and patterns'],['Modal Harmony','Quartal and suspended'],['Advanced Structures','Polychords and clusters'],['Chord Mastery','Mixed harmony']],
 Scales: [
 ['Major & Minor','Foundational scales'],['Minor Variations','Harmonic and melodic minor'],['Major Modes','Seven diatonic modes'],['Pentatonic','Five-note scales'],['Blues','Blues scale families'],['Harmonic Minor Modes','Seven related modes'],['Melodic Minor Modes','Jazz melodic minor modes'],['Harmonic Major','Harmonic major modes'],['Symmetrical Scales','Whole-tone and octatonic'],['Bebop & Jazz','Bebop collections'],['World Scale Families','Traditions and context'],['Exotic & Rare','Uncommon collections'],['Scale Degrees','Characteristic tones'],['Scale Recognition','Identify scales'],['Melodic Context','Scales in melodies'],['Scale Mastery','Mixed recognition']]
};
export const FIRST_LESSONS = {
 Intervals:[
 ['Unison','A unison means two notes have the same pitch. It spans zero semitones. Listen for the absence of a pitch change.',0],
 ['Octave','An octave spans twelve semitones. The notes share a pitch class, but one sounds higher or lower.',12],
 ['Perfect Fifth','A perfect fifth spans seven semitones. C to G is a perfect fifth in twelve-tone equal temperament.',7]
 ],
 Chords:[
 ['Major Triad','A major triad has a root, a major third and a perfect fifth. C major contains C, E and G.',[0,4,7]],
 ['Minor Triad','A minor triad has a root, a minor third and a perfect fifth. C minor contains C, E-flat and G.',[0,3,7]]
 ],
 Scales:[
 ['Major Scale','The major scale follows the step pattern 2, 2, 1, 2, 2, 2, 1 semitones. C major is C D E F G A B C.',[0,2,4,5,7,9,11,12]],
 ['Natural Minor','Natural minor follows 2, 1, 2, 2, 1, 2, 2 semitones. A natural minor is A B C D E F G A.',[0,2,3,5,7,8,10,12]]
 ]
};
export function levelId(world,chapter,level){return world+':'+chapter+':'+level;}
