import {expect,it} from 'vitest';
import {convert,decode,editText,knownWords} from './conversion';
import {signs} from '../content/signs';
it('converts exact syllables while keeping word and line boundaries',()=>{
 expect(convert('KO-NO-SO a-mi-ni-so\nti-ri-po-de','exact').text).toBe('𐀒𐀜𐀰 𐀀𐀖𐀛𐀰\n𐀴𐀪𐀡𐀆');
});
it('round trips every course syllable without guessing',()=>{
 for(const s of signs){expect(convert(s.id,'exact').text).toBe(s.glyph);expect(decode(s.glyph).text).toBe(s.id);}
});
it('keeps unknown exact tokens visibly marked instead of dropping them',()=>{
 const r=convert('ka-xyz-so','exact');expect(r.text).toBe('𐀏[xyz]𐀰');expect(r.notes.length).toBeGreaterThan(0);
});
it('uses attested spellings for known names and explains adaptations for other words',()=>{
 expect(convert('Knossos Amnisos','approximate').text).toBe('𐀒𐀜𐀰 𐀀𐀖𐀛𐀰');
 const r=convert('Léon','approximate');expect(decode(r.text).text).toBe('re-o');expect(r.notes.join(' ')).toMatch(/final/i);expect(r.notes.join(' ')).toMatch(/l.*r/i);
});
it('approximates consonant clusters and preserves unsupported scripts',()=>{
 expect(decode(convert('drako','approximate').text).text).toBe('da-ra-ko');
 const r=convert('Привіт 😀','approximate');expect(r.text).toBe('Привіт 😀');expect(r.notes.length).toBeGreaterThan(0);
 expect(convert('sss','approximate').text).toBe('[sss]');
});
it('handles missing syllables honestly instead of inventing characters',()=>{
 const r=convert('wu','approximate');expect(r.text).toContain('[wu]');expect(r.notes.length).toBeGreaterThan(0);
});
it('decodes supplemental and unknown-value Unicode signs by their labels',()=>{
 expect(decode('𐀎𐁀𐁐').text).toBe('ju-a2-*018');
 expect(convert('ju-a2-*018','exact').text).toBe('𐀎𐁀𐁐');
});
it('reads known objects and adds consecutive Aegean numerals',()=>{
 expect(decode('𐂚 𐄐𐄈').text).toBe('[Bronze] 12');
});
it('only supplies sourced meanings for whole recognized words',()=>{
 expect(decode('𐀒𐀜𐀰').matches[0]?.meaning).toBe('Knossos');
 expect(decode('𐀒𐀜𐀰𐀀').matches).toHaveLength(0);
 expect(knownWords.every(w=>w.sourceUrl.startsWith('https://'))).toBe(true);
});
it('treats Aegean word separators as word boundaries and preserves other input',()=>{
 expect(decode('𐀒𐀜𐀰𐄀𐀀𐀖𐀛𐀰!').text).toBe('ko-no-so a-mi-ni-so!');
 expect(decode('abc 😀').text).toBe('abc 😀');
});
it('edits at the selection and deletes entire supplementary-plane characters',()=>{
 expect(editText('𐀀𐀁',2,2,'𐀂')).toEqual({text:'𐀀𐀂𐀁',cursor:4});
 expect(editText('𐀀𐀁',0,2,'𐀂')).toEqual({text:'𐀂𐀁',cursor:2});
 expect(editText('𐀀𐀁',2,2,null)).toEqual({text:'𐀁',cursor:0});
 expect(editText('𐀀',0,0,null)).toEqual({text:'𐀀',cursor:0});
});
