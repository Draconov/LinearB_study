import {expect,it} from 'vitest';
import {encodeNumber,commodities,tabletPassages} from './tablets';
import {signById} from './signs';
it('encodes additive numbers and rejects unsupported input',()=>{expect(encodeNumber(1)).toBe('𐄇');expect(encodeNumber(10)).toBe('𐄐');expect(encodeNumber(57)).toBe('𐄔𐄍');expect(encodeNumber(1358)).toBe('𐄢𐄛𐄔𐄎');for(const v of [0,-1,10000,NaN,1.5])expect(()=>encodeNumber(v)).toThrow();});
it('uses distinct commodity identities and sourced tablet tokens',()=>{expect(commodities).toHaveLength(6);expect(new Set(commodities.map(c=>c.id)).size).toBe(6);expect(tabletPassages).toHaveLength(3);for(const p of tabletPassages){expect(p.sourceUrl).toMatch(/^https:\/\//);expect(p.tokens.length).toBeGreaterThan(1);for(const token of p.tokens){if(token.signIds)token.signIds.forEach(id=>expect(signById[id]).toBeDefined());if(token.quantity)expect(token.glyph).toBe(encodeNumber(token.quantity));}expect(p.options).toContain(p.answer);}});
