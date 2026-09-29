export const numberSource='https://www.unicode.org/charts/PDF/U10100.pdf';
export const objectSource='https://www.unicode.org/charts/PDF/U10080.pdf';
export const judsonSource='https://www.bsa.ac.uk/wp-content/uploads/2022/06/Worksheet_How_to_make_a_Linear_B_tablet.pdf';
/** Standard Unicode grouped numerals, largest decimal place first. No zero glyph. */
export function encodeNumber(value:number):string{
 if(!Number.isInteger(value)||value<1||value>9999)throw new RangeError('Use a whole number from 1 to 9999.');
 return [[1000,0x10122],[100,0x10119],[10,0x10110],[1,0x10107]].map(([place,base])=>{const digit=Math.floor(value/place)%10;return digit?String.fromCodePoint(base+digit-1):'';}).join('');
}
export const commodities=[
 {id:'wheat',glyph:'𐂎',number:'B120',name:'Wheat',note:'A cereal sign; the label follows the conventional identification.'},
 {id:'oil',glyph:'𐂕',number:'B130',name:'Oil',note:'Used for oil in administrative records.'},
 {id:'wine',glyph:'𐂖',number:'B131',name:'Wine',note:'A sign for wine, rather than a syllable spelling its name.'},
 {id:'wool',glyph:'𐂝',number:'B145',name:'Wool',note:'An example of a material recorded with an object sign.'},
 {id:'bronze',glyph:'𐂚',number:'B140',name:'Bronze',note:'A metal sign. Read its quantity separately.'},
 {id:'chariot',glyph:'𐃌',number:'B240',name:'Wheeled chariot',note:'The wheels help make this object sign memorable.'}
];
export interface TabletToken {glyph?:string;signIds?:string[];reading:string;meaning:string;quantity?:number}
export interface TabletPassage {id:string;title:string;location:string;description:string;tokens:TabletToken[];interpretation:string;context:string;question:string;options:string[];answer:string;explanation:string;sourceUrl:string;sourceTitle:string}
const quantity=(n:number):TabletToken=>({glyph:encodeNumber(n),quantity:n,reading:String(n),meaning:String(n)});
export const tabletPassages:TabletPassage[]=[
 {id:'pylos-workers',title:'A work-group at Pylos',location:'PY Aa 62',description:'A typeset teaching excerpt. Syllabic words, a person sign and numbers share one record.',tokens:[{signIds:['me','re','ti','ri','ja'],reading:'me-re-ti-ri-ja',meaning:'flour-grinders'},{glyph:'𐂁',reading:'WOMAN',meaning:'women'},quantity(7),{signIds:['ko','wa'],reading:'ko-wa',meaning:'girls'},quantity(10),{signIds:['ko','wo'],reading:'ko-wo',meaning:'boys'},quantity(6)],interpretation:'The group includes 7 women, 10 girls and 6 boys.',context:'Such work-groups were enslaved or heavily dependent on the palace. The record reflects that unequal system.',question:'How many girls are listed?',options:['6','7','10'],answer:'10',explanation:'The number after ko-wa is 10.',sourceUrl:judsonSource,sourceTitle:'Anna P. Judson · British School at Athens, tablet worksheet'},
 {id:'knossos-sheep',title:'Counting a flock',location:'KN De 1112 · line A',description:'A typeset excerpt of line A only; the following line is omitted.',tokens:[{glyph:'𐂇',reading:'SHEEPm',meaning:'male sheep'},quantity(57),{glyph:'𐂆',reading:'SHEEPf',meaning:'female sheep'},quantity(23)],interpretation:'Line A records 57 male and 23 female sheep.',context:'The animal signs distinguish the two groups; add their quantities for the line’s total.',question:'How many sheep are recorded in line A altogether?',options:['57','80','23'],answer:'80',explanation:'57 + 23 = 80. This is a calculation from the two entries.',sourceUrl:judsonSource,sourceTitle:'Anna P. Judson · British School at Athens, tablet worksheet'},
 {id:'pylos-vessels',title:'Three vessels',location:'PY Ta 641 · opening of line 2',description:'The contiguous opening of line 2, typeset in a modern font. The rest of the line is omitted.',tokens:[{signIds:['qe','to'],reading:'qe-to',meaning:'a vessel term'},{glyph:'𐃢',reading:'*203VAS',meaning:'vessel sign *203'},quantity(3)],interpretation:'The entry pairs qe-to with vessel sign *203 and a quantity of 3.',context:'Transliteration records written signs. The vessel sign and number give additional information without spelling another word.',question:'Which part supplies the quantity?',options:['qe-to','The vessel sign','The final number'],answer:'The final number',explanation:'The final numeral is 3. The preceding sign identifies the vessel type.',sourceUrl:'https://liber.cnr.it/tablet/view/5344',sourceTitle:'LiBER · CNR, PY Ta 641 transcription'}
];
