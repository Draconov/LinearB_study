import {workshops} from "./workshops";
import type { Lesson } from "./types";
import { signs } from "./signs";
const family = (id: string, title: string, paragraphs: string[]): Lesson => ({id,kind:"signs",title,paragraphs,signIds:signs.filter(s=>s.family===id).map(s=>s.id)});
export const lessons: Lesson[] = [
 {id:"intro",kind:"intro",title:"Your first marks",paragraphs:["Linear B was used to write Mycenaean Greek on clay tablets. Most surviving texts are practical records: people, goods, and quantities.","A sign usually represents a vowel or a consonant plus a vowel. You will learn the conventional readings, practise the shapes, and then recognise them in real words.","Start with five vowels. Each lesson lets you trace, copy, and write from memory. A model is a guide: ancient scribes also had different handwriting."]},
 family("vowels","The five vowels",["Begin with a, e, i, o, and u. Each is a complete sign on its own. Look carefully at the lines before you try writing.","Practise the shape, then connect it with its written reading. You can skip a drawing step whenever you prefer."]),
 family("k","The k family",["These signs are conventionally read ka, ke, ki, ko, and ku. A family groups readings that share a consonant; the shapes do not have to look alike."]),
 family("n","The n family",["Meet na, ne, ni, no, and nu. Look for the features that distinguish each sign. Soon you will use no in your first place name."]),
 family("s","The s family",["Learn sa, se, si, so, and su. Once you know so, you can read all three signs in ko-no-so."]),
 {id:"knossos",kind:"reading",title:"Read: Knossos",readingId:"knossos"},
 family("m","The m family",["Practise ma, me, mi, mo, and mu. The sign mi will help you read a second place name."]),
 {id:"amnisos",kind:"reading",title:"Read: Amnisos",readingId:"amnisos"},
 family("t","The t family",["Learn ta, te, ti, to, and tu. Keep the conventional reading and the sign's shape together as you practise."]),
 family("r","The r family",["Learn ra, re, ri, ro, and ru. These are scholarly transliterations, not a promise that each word sounded exactly as the labels look in English."]),
 family("p","The p family",["Learn pa, pe, pi, po, and pu. Compare po with the other signs you have learned; it appears in our tripod example."]),
 family("d","The d family",["Learn da, de, di, do, and du. With de, you now have the four signs needed for ti-ri-po-de."]),
 {id:"tripods-word",kind:"reading",title:"Read: two tripods",readingId:"tripods"},
 family("w","The w family",["This course includes wa, we, wi, and wo. Gaps in a syllable chart are normal: do not invent a wu sign to complete the row."]),
 family("j","The j family",["Practise ja, je, and jo as conventional scholarly labels. The label j is not the English letter-name ‘jay’; pronunciation needs a separate explanation of Mycenaean Greek."]),
 family("q","The q family",["The labels qa, qe, qi, and qo use a scholarly q convention. Do not read these as the English letter-name ‘cue’. Our goal here is recognising and writing the signs."]),
 family("z","The z family",["Finish the course selection with za, ze, and zo. Conventional transliteration and exact historical pronunciation are different things."]),
 {id:"tablet",kind:"reading",title:"A glimpse of a tablet",readingId:"tripods"}
 ,...workshops.map(w=>({id:w.id,kind:"workshop" as const,title:w.title,workshopId:w.id}))
];

export const lessonStepLimit=(lesson:Lesson)=>lesson.kind==="signs"?lesson.signIds.length*6+1:lesson.kind==="workshop"?2:0;
