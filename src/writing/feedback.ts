import type {Point} from './strokes';
export interface ShapeFeedback {kind:'empty'|'close'|'practice';missing:Point[];stray:Point[];message:string}
const distance=(a:Point,b:Point)=>Math.hypot(a.x-b.x,a.y-b.y);
// Uniform samples keep fast pen input and slow pen input comparable.
function sample(paths:Point[][]):Point[]{
 const result:Point[]=[];
 for(const path of paths){if(path.length)result.push(path[0]);for(let i=1;i<path.length;i++){const a=path[i-1],b=path[i];const count=Math.max(1,Math.ceil(distance(a,b)/.012));for(let j=1;j<=count;j++)result.push({x:a.x+(b.x-a.x)*j/count,y:a.y+(b.y-a.y)*j/count});}}
 // Bound work even for a long scribble, without changing stored ink.
 return result.filter((_,i)=>i%Math.max(1,Math.ceil(result.length/1800))===0);
}
export function compareShape(ink:Point[][],model:Point[][]):ShapeFeedback{
 const drawn=sample(ink),target=sample(model);
 if(!drawn.length)return {kind:'empty',missing:[],stray:[],message:'Draw a sign, then compare its shape.'};
 const far=(p:Point,points:Point[])=>!points.some(q=>distance(p,q)<.045);
 const missing=target.filter(p=>far(p,drawn)),stray=drawn.filter(p=>far(p,target));
 const close=missing.length/Math.max(1,target.length)<.12&&stray.length/drawn.length<.15;
 const message=close?'Your main lines are close to this practice model. Look at their joins and proportions.':missing.length&&stray.length?'Follow the highlighted model marks and check the blue marks for position or length.':missing.length?'Some model marks are still uncovered. Look at the highlighted areas before trying again.':'Check the blue marks: they extend away from this practice model.';
 return {kind:close?'close':'practice',missing,stray,message};
}
