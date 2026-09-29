import {signById} from './signs';
import type {TabletTarget} from '../writing/DrawingPad';
export interface StudioExercise extends TabletTarget {title:string;note:string;sourceUrl:string}
const word=(id:string,ids:string[],title:string,note:string):StudioExercise=>({id,signIds:ids,glyphs:ids.map(s=>signById[s].glyph),title,note,sourceUrl:'https://www.classics.cam.ac.uk/system/files/documents/process.pdf'});
export const studioExercises:StudioExercise[]=[
 word('ko-no-so',['ko','no','so'],'Knossos','Copy a place name, keeping the signs separate.'),
 word('a-mi-ni-so',['a','mi','ni','so'],'Amnisos','Start with the vowel, then continue across the tablet.'),
 word('ti-ri-po-de',['ti','ri','po','de'],'Tripods','Practise the written sequence from PY Ta 641.'),
 {id:'chariot-2',title:'Record: two chariots',glyphs:['𐃌','𐄈'],note:'Modern teaching record: the chariot sign followed by 2. Not an ancient quotation.',sourceUrl:'https://www.unicode.org/charts/PDF/U10080.pdf'},
 {id:'bronze-10',title:'Record: bronze, quantity 10',glyphs:['𐂚','𐄐'],note:'Modern symbol-and-number exercise. No historical weight unit is specified.',sourceUrl:'https://www.unicode.org/charts/PDF/U10080.pdf'}
];
