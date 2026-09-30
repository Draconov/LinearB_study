import {expect,it} from 'vitest';
import {compareShape,comparePlacement,compareSequence} from './feedback';
import guides from './guides.json';
import {signs} from '../content/signs';
import {studioExercises} from '../content/studio';
import {layoutTarget} from './targets';
import type {Point} from './strokes';
const models:Record<string,Point[][]>=guides;
const move=(paths:Point[][],scale:number,x:number,y:number)=>paths.map(s=>s.map(p=>({x:p.x*scale+x,y:p.y*scale+y})));
const word=(ids:string[])=>ids.flatMap((id,i)=>move(models[id],.17+i*.015,.02+i*.23,.12+i*.015).map(s=>s.map(p=>({...p,y:p.y/.62}))));
it('accepts each of the 59 signs at a different position and uniform size',()=>{
 for(const s of signs){const r=compareShape(move(models[s.id],.48,.32,.08),models[s.id]);expect(r.kind,s.id).toBe('close');expect(r.missing,s.id).toHaveLength(0);}
});
it('aligns the feedback reference with the learner drawing',()=>{
 const ink=move(models.a,.5,.3,.1),r=compareShape(ink,models.a);
 expect(r.reference[0][0].x).toBeCloseTo(ink[0][0].x);expect(r.reference[0][0].y).toBeCloseTo(ink[0][0].y);
 expect(comparePlacement(ink,models.a).kind).toBe('practice');
});
it('tolerates modest irregular handwriting without depending on pen direction or stroke order',()=>{
 for(const id of Object.keys(models)){
  const ink=models[id].map(s=>s.map(p=>({x:p.x+.01*Math.sin(p.y*30),y:p.y+.008*Math.cos(p.x*20)}))).reverse().map(s=>s.slice().reverse());
  expect(compareShape(ink,models[id]).kind,id).toBe('close');
 }
});
it('still rejects missing lines, wrong proportions, a mirrored asymmetric sign, and dots',()=>{
 const a=models.a;
 expect(compareShape([a[0]],a).kind).toBe('practice');
 expect(compareShape(a.map(s=>s.map(p=>({x:p.x*.15,y:p.y}))),a).kind).toBe('practice');
 expect(compareShape(models.o.map(s=>s.map(p=>({x:1-p.x,y:p.y}))),models.o).kind).toBe('practice');
 expect(compareShape([[{x:.2,y:.3}]],a).kind).toBe('practice');
});
it('compares signs independently with unequal sizes, spacing, and baselines on a wide tablet',()=>{
 const ids=['ko','no','so'];const r=compareSequence(word(ids),ids.map(id=>({id,paths:layoutTarget([id],1,1)})),.62);
 expect(r.kind).toBe('close');expect(r.signs?.map(s=>s.expected)).toEqual(ids);expect(r.sequence).toBe('correct');
});
it('checks left-to-right placement rather than the order the strokes were drawn',()=>{
 const ids=['a','e','ro'];const r=compareSequence(word(ids).reverse(),ids.map(id=>({id,paths:models[id]})),.62);
 expect(r.sequence).toBe('correct');expect(r.kind).toBe('close');
});
it('reports reversed sign order separately from malformed signs',()=>{
 const r=compareSequence(word(['ro','e','a']),['a','e','ro'].map(id=>({id,paths:models[id]})),.62);
 expect(r.sequence).toBe('order');expect(r.detected).toEqual(['ro','e','a']);expect(r.missing).toHaveLength(0);
});
it('does not award a sequence match to a missing, extra, or unseparated sign',()=>{
 const expected=['a','e','ro'].map(id=>({id,paths:models[id]}));
 expect(compareSequence(word(['a','ro']),expected,.62).sequence).not.toBe('correct');
 expect(compareSequence(word(['a','e','ro','i']),expected,.62).sequence).not.toBe('correct');
 expect(compareSequence(models.a,expected,.62).sequence).not.toBe('correct');
});
it('handles repeated signs without requiring unique identities',()=>{
 const ids=['a','e','a'];expect(compareSequence(word(ids),ids.map(id=>({id,paths:models[id]})),.62).sequence).toBe('correct');
});

it('supports every word exercise, including detached parts of a sign',()=>{
 for(const exercise of studioExercises.filter(e=>e.signIds)){
  const ids=exercise.signIds!;
  expect(compareSequence(word(ids),ids.map(id=>({id,paths:models[id]})),.62).sequence,exercise.id).toBe('correct');
 }
});
it('does not let dense pointer samples conceal an extra line',()=>{
 const sparse=[[{x:.2,y:.5},{x:.8,y:.5}],[{x:.5,y:.2},{x:.5,y:.8}]],extra=[{x:.2,y:.2},{x:.8,y:.8}];
 const dense=sparse.map(path=>Array.from({length:1001},(_,i)=>({x:path[0].x+(path[1].x-path[0].x)*i/1000,y:path[0].y+(path[1].y-path[0].y)*i/1000})));
 expect(compareShape(dense,sparse).kind).toBe('close');
 expect(compareShape([...dense,extra],sparse).kind).toBe('practice');
 expect(compareShape([...dense,extra],sparse).score).toBeCloseTo(compareShape([...sparse,extra],sparse).score,1);
});

it('requires meaningful short bars even when nearby intersections resemble coverage',()=>{
 for(const [id,index] of [['e',2],['so',0],['wa',1]] as const){
  expect(compareShape(models[id].filter((_,i)=>i!==index),models[id]).kind,id).toBe('practice');
 }
 const ids=['ko','no','so'];
 const ink=word(ids).filter((_,i)=>i!==models.ko.length+models.no.length);
 expect(compareSequence(ink,ids.map(id=>({id,paths:models[id]})),.62).sequence).not.toBe('correct');
});
