import {describe,it,expect} from 'vitest';
import {compareShape} from './feedback';
import {parseSettings,acceptsPointer} from './settings';
import guides from './guides.json';
import {signs} from '../content/signs';
const cross=[[{x:.2,y:.5},{x:.8,y:.5}],[{x:.5,y:.2},{x:.5,y:.8}]];
describe('gentle shape guidance',()=>{
 it('does not judge blank ink',()=>{expect(compareShape([],cross).kind).toBe('empty');});
 it('accepts an exact shape regardless of stroke order and direction',()=>{const r=compareShape([...cross].reverse().map(p=>[...p].reverse()),cross);expect(r.kind).toBe('close');expect(r.missing).toHaveLength(0);expect(r.stray).toHaveLength(0);});
 it('finds the missing upper and lower marks',()=>{const r=compareShape([cross[0]],cross);expect(r.missing.some(p=>p.y<.3)).toBe(true);expect(r.stray).toHaveLength(0);});
 it('highlights displaced ink',()=>{expect(compareShape([[{x:.1,y:.1},{x:.9,y:.1}]],cross).stray.length).toBeGreaterThan(10);});
 it('tolerates small placement variations',()=>{expect(compareShape(cross.map(s=>s.map(p=>({x:p.x+.02,y:p.y}))),cross).kind).toBe('close');});
});
describe('writing settings',()=>{
 it('falls back for corrupt and out-of-range settings',()=>{expect(parseSettings('broken')).toEqual(parseSettings(null));expect(parseSettings('{"width":99,"opacity":-1,"penOnly":"yes"}')).toEqual(parseSettings(null));});
 it('preserves valid settings and gates only the canvas input',()=>{expect(parseSettings('{"width":0.012,"opacity":0.2,"grid":false,"leftHanded":true,"penOnly":true}')).toEqual({width:.012,opacity:.2,grid:false,leftHanded:true,penOnly:true,surface:"clay"});expect(acceptsPointer('touch',true)).toBe(false);expect(acceptsPointer('pen',true)).toBe(true);expect(acceptsPointer('mouse',false)).toBe(true);});
});
it('has a finite, drawable guide for each of the 59 signs',()=>{expect(Object.keys(guides).sort()).toEqual(signs.map(s=>s.id).sort());for(const paths of Object.values(guides)){expect(paths.length).toBeGreaterThan(0);for(const path of paths){expect(path.length).toBeGreaterThan(1);for(const p of path){expect(p.x).toBeGreaterThanOrEqual(.05);expect(p.x).toBeLessThanOrEqual(.95);expect(p.y).toBeGreaterThanOrEqual(.05);expect(p.y).toBeLessThanOrEqual(.95);}}}});
