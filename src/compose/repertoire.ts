import {signs} from '../content/signs';
import {commodities} from '../content/tablets';
export interface KeySign {id:string;glyph:string;number:string;family:string}
// Unicode character labels, not claims of reconstructed pronunciation.
// Source: https://www.unicode.org/charts/PDF/U10000.pdf
export const additional:KeySign[]=[
 {
  "id": "ju",
  "glyph": "𐀎",
  "number": "B065",
  "family": "additional"
 },
 {
  "id": "a2",
  "glyph": "𐁀",
  "number": "B025",
  "family": "additional"
 },
 {
  "id": "a3",
  "glyph": "𐁁",
  "number": "B043",
  "family": "additional"
 },
 {
  "id": "au",
  "glyph": "𐁂",
  "number": "B085",
  "family": "additional"
 },
 {
  "id": "dwe",
  "glyph": "𐁃",
  "number": "B071",
  "family": "additional"
 },
 {
  "id": "dwo",
  "glyph": "𐁄",
  "number": "B090",
  "family": "additional"
 },
 {
  "id": "nwa",
  "glyph": "𐁅",
  "number": "B048",
  "family": "additional"
 },
 {
  "id": "pu2",
  "glyph": "𐁆",
  "number": "B029",
  "family": "additional"
 },
 {
  "id": "pte",
  "glyph": "𐁇",
  "number": "B062",
  "family": "additional"
 },
 {
  "id": "ra2",
  "glyph": "𐁈",
  "number": "B076",
  "family": "additional"
 },
 {
  "id": "ra3",
  "glyph": "𐁉",
  "number": "B033",
  "family": "additional"
 },
 {
  "id": "ro2",
  "glyph": "𐁊",
  "number": "B068",
  "family": "additional"
 },
 {
  "id": "ta2",
  "glyph": "𐁋",
  "number": "B066",
  "family": "additional"
 },
 {
  "id": "twe",
  "glyph": "𐁌",
  "number": "B087",
  "family": "additional"
 },
 {
  "id": "two",
  "glyph": "𐁍",
  "number": "B091",
  "family": "additional"
 },
 {
  "id": "*018",
  "glyph": "𐁐",
  "number": "B018",
  "family": "additional"
 },
 {
  "id": "*019",
  "glyph": "𐁑",
  "number": "B019",
  "family": "additional"
 },
 {
  "id": "*022",
  "glyph": "𐁒",
  "number": "B022",
  "family": "additional"
 },
 {
  "id": "*034",
  "glyph": "𐁓",
  "number": "B034",
  "family": "additional"
 },
 {
  "id": "*047",
  "glyph": "𐁔",
  "number": "B047",
  "family": "additional"
 },
 {
  "id": "*049",
  "glyph": "𐁕",
  "number": "B049",
  "family": "additional"
 },
 {
  "id": "*056",
  "glyph": "𐁖",
  "number": "B056",
  "family": "additional"
 },
 {
  "id": "*063",
  "glyph": "𐁗",
  "number": "B063",
  "family": "additional"
 },
 {
  "id": "*064",
  "glyph": "𐁘",
  "number": "B064",
  "family": "additional"
 },
 {
  "id": "*079",
  "glyph": "𐁙",
  "number": "B079",
  "family": "additional"
 },
 {
  "id": "*082",
  "glyph": "𐁚",
  "number": "B082",
  "family": "additional"
 },
 {
  "id": "*083",
  "glyph": "𐁛",
  "number": "B083",
  "family": "additional"
 },
 {
  "id": "*086",
  "glyph": "𐁜",
  "number": "B086",
  "family": "additional"
 },
 {
  "id": "*089",
  "glyph": "𐁝",
  "number": "B089",
  "family": "additional"
 }
];
export const syllables:KeySign[]=[...signs,...additional];
export const objects:KeySign[]=commodities.map(s=>({id:s.name,glyph:s.glyph,number:s.number,family:'objects'}));
export const numerals:KeySign[]=Array.from({length:45},(_,i)=>({id:String((i%9+1)*10**Math.floor(i/9)),glyph:String.fromCodePoint(0x10107+i),number:'',family:'numbers'}));
export const separators:KeySign[]=[{id:'Word divider',glyph:'𐄀',number:'U+10100',family:'separators'}];
