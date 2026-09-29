import {expect,it} from 'vitest';
import {pointerPressure,grooveWidth} from './clay';
import {layoutTarget} from './targets';
import {parseSettings} from './settings';
it('uses stable mouse and unsupported pen pressure, clamps real pressure',()=>{expect(pointerPressure('mouse',.9)).toBe(.5);expect(pointerPressure('touch',0)).toBe(.5);expect(pointerPressure('pen',0)).toBe(.5);expect(pointerPressure('pen',.2)).toBe(.2);expect(pointerPressure('pen',4)).toBe(1);expect(pointerPressure('pen',NaN)).toBe(.5);expect(grooveWidth(4,.9)).toBeGreaterThan(grooveWidth(4,.1));});
it('keeps multi-sign guides in their own tablet cells',()=>{const paths=layoutTarget(['ko','no','so'],600,336);expect(paths.length).toBeGreaterThan(3);for(const path of paths)for(const p of path){expect(p.x).toBeGreaterThan(0);expect(p.x).toBeLessThan(1);expect(p.y).toBeGreaterThan(0);expect(p.y).toBeLessThan(1);}expect(layoutTarget(['a'],400,400)[0][0].x).toBeCloseTo(.3555,1);});
it('defaults older writing preferences to clay and retains plain choice',()=>{expect(parseSettings('{"width":0.004}').surface).toBe('clay');expect(parseSettings('{"surface":"plain"}').surface).toBe('plain');});
