import {syllables,objects} from './repertoire';
import {readings} from '../content/readings';
import {tabletPassages} from '../content/tablets';
import {sources} from '../content/sources';
import {signById} from '../content/signs';
export interface KnownWord {reading:string;glyphs:string;meaning:string;context:string;sourceUrl:string}
export const knownWords:KnownWord[]=[
 ...readings.map(r=>({reading:r.transliteration,glyphs:r.signIds.map(id=>signById[id].glyph).join(''),meaning:r.interpretation,context:r.explanation,sourceUrl:sources[r.sourceId].url})),
 ...tabletPassages.flatMap(p=>p.tokens.filter(t=>t.signIds).map(t=>({reading:t.reading,glyphs:t.signIds!.map(id=>signById[id].glyph).join(''),meaning:t.meaning,context:`In ${p.location}. ${p.description}`,sourceUrl:p.sourceUrl})))
];
const byId=new Map(syllables.map(s=>[s.id,s]));
const byGlyph=new Map(syllables.map(s=>[s.glyph,s]));
const objectLabels=new Map(objects.map(s=>[s.glyph,s.id]));
const aliases:Record<string,string>={knossos:'ko-no-so',amnisos:'a-mi-ni-so',tripode:'ti-ri-po-de'};
export interface Conversion {text:string;notes:string[]}
export function convert(input:string,mode:'exact'|'approximate'):Conversion{
 const notes=new Set<string>();
 const issue=(message:string)=>notes.add(message);
 const exact=(word:string)=>word.split(/[-·]/u).map(token=>{
  const key=token.toLowerCase(),sign=byId.get(key);
  if(sign)return sign.glyph;
  issue(`“${token}” is not an available syllable; it is kept in brackets.`);return `[${token}]`;
 }).join('');
 const approximate=(original:string)=>{
  let word=original.toLowerCase().normalize('NFD').replace(/\p{M}/gu,'').replace(/æ/g,'ae').replace(/œ/g,'oe').replace(/ø/g,'o').replace(/ß/g,'ss');
  if(aliases[word]){issue(`“${original}” uses the documented spelling ${aliases[word]}.`);return exact(aliases[word]);}
  if(!/^[a-z]+$/.test(word)){issue('Unsupported letters are preserved. Use Latin letters or the sign keyboard.');return original;}
  if(word!==original.toLowerCase())issue('Accents and vowel-length marks are simplified.');
  const replacements:[RegExp,string,string][]=[[/ph/g,'p','ph → p'],[/th/g,'t','th → t'],[/kh|ch/g,'k','kh/ch → k'],[/sh/g,'s','sh → s'],[/qu/g,'q','qu → q'],[/l/g,'r','l → r'],[/g|c/g,'k','g/c → k'],[/b|f/g,'p','b/f → p'],[/v/g,'w','v → w'],[/x/g,'ks','x → ks'],[/y(?=[aeiou])/g,'j','y before a vowel → j'],[/y/g,'i','y → i'],[/h/g,'','h is omitted']];
  for(const [pattern,to,note] of replacements){if(pattern.test(word)){issue(note+'.');word=word.replace(pattern,to);}}
  if(/j/.test(word))issue('j uses the conventional y-like value, not the English sound in “jam”.');
  if(/([^aeiou])\1/.test(word)){issue('Repeated consonants are simplified.');word=word.replace(/([^aeiou])\1+/g,'$1');}
  if(!/[aeiou]/.test(word)){issue(`“${original}” has no usable vowel; choose syllables manually.`);return `[${original}]`;}
  const parts:string[]=[];
  for(let i=0;i<word.length;){
   const c=word[i];
   if(/[aeiou]/.test(c)){parts.push(c);i++;continue;}
   if(/[aeiou]/.test(word[i+1]??'')){parts.push(c+word[i+1]);i+=2;continue;}
   const nextVowel=word.slice(i+1).match(/[aeiou]/)?.[0];
   if(!nextVowel){issue(`“${original}”: final consonants “${word.slice(i)}” omitted.`);break;}
   parts.push(c+nextVowel);issue(`“${original}”: inserted ${nextVowel} to separate a consonant cluster.`);i++;
  }
  return parts.map(exact).join('');
 };
 // Match whole words, leaving punctuation, whitespace and line breaks intact.
 const text=input.replace(/\*?[\p{L}\p{M}\p{N}]+(?:[-·]\*?[\p{L}\p{M}\p{N}]+)*/gu,word=>{
  if(/^\d+$/.test(word))return word;
  if([...word].every(c=>byGlyph.has(c)))return word;
  return mode==='exact'||/[-·]/.test(word)?exact(word):approximate(word);
 });
 return {text,notes:[...notes]};
}
export function decode(input:string):Conversion&{matches:KnownWord[]}{
 const chars=[...input],notes=new Set<string>(),matches:KnownWord[]=[];let text='';
 for(let i=0;i<chars.length;){
  const char=chars[i],sign=byGlyph.get(char),cp=char.codePointAt(0)!;
  if(sign){
   let glyphs='',labels:string[]=[];
   while(i<chars.length&&byGlyph.has(chars[i])){const s=byGlyph.get(chars[i])!;glyphs+=chars[i++];labels.push(s.id);if(s.family==='additional')notes.add('Additional signs use Unicode labels; numbered signs do not imply a secure sound value.');}
   text+=labels.join('-');const match=knownWords.find(w=>w.glyphs===glyphs);if(match&&!matches.includes(match))matches.push(match);continue;
  }
  if(cp>=0x10107&&cp<=0x10133){let value=0;
   while(i<chars.length){const n=chars[i].codePointAt(0)!-0x10107;if(n<0||n>=45)break;value+=(n%9+1)*10**Math.floor(n/9);i++;}
   text+=String(value);continue;
  }
  if(objectLabels.has(char))text+=`[${objectLabels.get(char)}]`;
  else if(cp===0x10100||cp===0x10101)text+=' ';
  else {text+=char;if(!/\s|[.,!?;:()[\]—-]/u.test(char))notes.add('Unmapped characters are preserved; they have not been decoded.');}
  i++;
 }
 return {text,notes:[...notes],matches};
}
/** DOM selection offsets are UTF-16. Keep insertion/deletion on code-point boundaries. */
export function editText(text:string,start:number,end:number,insert:string|null){
 const isLow=(i:number)=>i>0&&i<text.length&&/[\uDC00-\uDFFF]/.test(text[i]);
 start=Math.max(0,Math.min(start,text.length));end=Math.max(start,Math.min(end,text.length));
 if(isLow(start))start--;if(isLow(end))end++;
 if(insert===null&&start===end&&start>0){start-=text.codePointAt(start-2)!>0xffff?2:1;}
 const value=insert??'';
 return {text:text.slice(0,start)+value+text.slice(end),cursor:start+value.length};
}
