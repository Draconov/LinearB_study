import type {Point} from './strokes';
export interface SignFeedback {expected:string;kind:'close'|'practice'}
export interface ShapeFeedback {
 kind:'empty'|'close'|'practice';missing:Point[];stray:Point[];reference:Point[][];message:string;
 score:number;sequence?:'correct'|'order'|'uncertain';detected?:string[];signs?:SignFeedback[];
}
export interface SignModel {id:string;paths:Point[][]}
const distance=(a:Point,b:Point)=>Math.hypot(a.x-b.x,a.y-b.y);
const clean=(paths:Point[][])=>paths.map(s=>s.filter(p=>Number.isFinite(p.x)&&Number.isFinite(p.y))).filter(s=>s.length);
function bounds(paths:Point[][]){
 let left=Infinity,right=-Infinity,top=Infinity,bottom=-Infinity;
 for(const s of paths)for(const p of s){left=Math.min(left,p.x);right=Math.max(right,p.x);top=Math.min(top,p.y);bottom=Math.max(bottom,p.y);}
 return {x:(left+right)/2,y:(top+bottom)/2,size:Math.max(right-left,bottom-top)};
}
// Resample each line by length, not pointer event frequency. Bound work for long scribbles.
function sample(paths:Point[][]):Point[][]{
 let length=0;
 for(const path of paths)for(let i=1;i<path.length;i++)length+=distance(path[i-1],path[i]);
 const step=Math.max(.02,length/900);
 return paths.map(path=>{
  const points:Point[]=[path[0]];let remaining=step;
  for(let i=1;i<path.length;i++){
   const a=path[i-1],b=path[i],segment=distance(a,b);if(!segment)continue;
   let offset=remaining;
   while(offset<=segment){points.push({x:a.x+(b.x-a.x)*offset/segment,y:a.y+(b.y-a.y)*offset/segment});offset+=step;}
   remaining=offset-segment;
  }
  if(distance(points[points.length-1],path[path.length-1])>.001)points.push(path[path.length-1]);
  return points;
 });
}
const blank=(kind:ShapeFeedback['kind'],message:string):ShapeFeedback=>({kind,missing:[],stray:[],reference:[],message,score:1});
function judge(ink:Point[][],model:Point[][],tolerance:number,restore:(p:Point)=>Point):ShapeFeedback{
 const drawn=sample(ink).flat(),targetPaths=sample(model),target=targetPaths.flat();
 const far=(p:Point,points:Point[])=>!points.some(q=>distance(p,q)<tolerance);
 const missingPaths=targetPaths.map(s=>s.filter(p=>far(p,drawn)));
 const missing=missingPaths.flat(),stray=drawn.filter(p=>far(p,target));
 const missed=missing.length/Math.max(1,target.length),extra=stray.length/Math.max(1,drawn.length);
 // A short distinguishing bar must not disappear inside a good average for a large sign.
 const missingPart=targetPaths.some((s,i)=>s.length>=5&&missingPaths[i].length/s.length>.3);
 const close=missed<.12&&extra<.15&&!missingPart;
 return {kind:close?'close':'practice',missing:missing.map(restore),stray:stray.map(restore),reference:model.map(s=>s.map(restore)),score:missed+extra+(missingPart?.15:0),message:close?'The overall form matches. Position and size are allowed to vary.':'Check the highlighted parts and the sign’s proportions.'};
}
/** Compare form after translation and UNIFORM scaling. No mirroring or rotation is fitted.
 * aspect is canvas height / width; ink is in canvas coordinates, model in square coordinates.
 * Feedback is mapped back onto the learner's own drawing, never the old trace position.
 */
export function compareShape(ink:Point[][],model:Point[][],aspect=1):ShapeFeedback{
 const drawn=clean(ink).map(s=>s.map(p=>({x:p.x,y:p.y*aspect}))),target=clean(model);
 if(!drawn.length)return blank('empty','Draw a sign, then compare its form.');
 if(!target.length)return blank('practice','Compare this sign with the specimen.');
 const a=bounds(drawn),b=bounds(target);
 if(a.size<.003||b.size<.003)return blank('practice','Add the sign’s main lines before comparing.');
 const normal=(paths:Point[][],box:ReturnType<typeof bounds>)=>paths.map(s=>s.map(p=>({x:(p.x-box.x)/box.size,y:(p.y-box.y)/box.size})));
 return judge(normal(drawn,a),normal(target,b),.065,p=>({x:p.x*a.size+a.x,y:(p.y*a.size+a.y)/aspect}));
}
/** Optional fixed-position tracing aid; its result is separate from form feedback. */
export function comparePlacement(ink:Point[][],model:Point[][]):ShapeFeedback{
 const drawn=clean(ink),target=clean(model);
 if(!drawn.length)return blank('empty','Draw a sign, then compare its placement.');
 if(!target.length)return blank('practice','No placement guide is available.');
 const result=judge(drawn,target,.045,p=>p);
 result.message=result.kind==='close'?'Your marks follow the tracing guide.':'These highlights show distance from the tracing guide, not whether the sign’s form is correct.';
 return result;
}
interface Cluster {left:number;right:number;paths:Point[][]}
function clusters(ink:Point[][]):Cluster[]{
 const intervals=clean(ink).map(path=>{let left=Infinity,right=-Infinity;for(const p of path){left=Math.min(left,p.x);right=Math.max(right,p.x);}return {left,right,paths:[path]};}).sort((a,b)=>a.left-b.left);
 const groups:Cluster[]=[];
 for(const item of intervals){const last=groups[groups.length-1];if(last&&item.left<=last.right+.002){last.right=Math.max(last.right,item.right);last.paths.push(...item.paths);}else groups.push(item);}
 return groups;
}
/** Segment by actual horizontal gaps. Detached marks may belong to one sign;
 * dynamic programming chooses whole contiguous groups rather than fixed-width cells.
 * We only claim wrong order when every group matches an expected sign in a different order.
 */
export function compareSequence(ink:Point[][],models:SignModel[],aspect=1):ShapeFeedback{
 const groups=clusters(ink),n=models.length,m=groups.length;
 if(!m)return blank('empty','Write the sequence, then compare it.');
 const uncertain=()=>({...blank('practice','Could not separate the signs confidently. Leave a small gap between signs and compare with the specimen.'),sequence:'uncertain' as const});
 if(!n||n>6||m<n||m>24)return uncertain();
 const cache=new Map<string,ShapeFeedback>();
 const match=(from:number,to:number,index:number)=>{
  const key=`${from}:${to}:${index}`;let r=cache.get(key);
  if(!r){r=compareShape(groups.slice(from,to).flatMap(g=>g.paths),models[index].paths,aspect);cache.set(key,r);}return r;
 };
 type Part={index:number;result:ShapeFeedback};type Route={cost:number;parts:Part[]};
 function search(reorder:boolean,requireClose=false):Route|null{
  const memo=new Map<string,Route|null>();
  function visit(from:number,used:number,depth:number):Route|null{
   if(depth===n)return from===m?{cost:0,parts:[]}:null;
   const key=`${from}:${used}`;if(memo.has(key))return memo.get(key)!;
   let best:Route|null=null;
   for(let to=from+1;to<=m-(n-depth-1);to++)for(let index=0;index<n;index++){
    if(used&(1<<index)||(!reorder&&index!==depth))continue;
    const result=match(from,to,index);
    // A reorder claim must be supported by good forms at every position.
    if((reorder||requireClose)&&result.kind!=='close')continue;
    const tail=visit(to,used|(1<<index),depth+1);if(!tail)continue;
    const cost=result.score+tail.cost;
    if(!best||cost<best.cost)best={cost,parts:[{index,result},...tail.parts]};
   }
   memo.set(key,best);return best;
  }
  return visit(0,0,0);
 }
 const ordered=search(false,true)??search(false);if(!ordered)return uncertain();
 const allClose=ordered.parts.every(p=>p.result.kind==='close');
 const rearranged=allClose?null:search(true);
 const route=rearranged??ordered,wrongOrder=!!rearranged;
 const signs=ordered.parts.map((p,i)=>({expected:models[i].id,kind:p.result.kind==='close'?'close' as const:'practice' as const}));
 return {kind:allClose?'close':'practice',sequence:allClose?'correct':wrongOrder?'order':'uncertain',
  detected:wrongOrder?route.parts.map(p=>models[p.index].id):undefined,signs,
  missing:wrongOrder?[]:route.parts.flatMap(p=>p.result.missing),stray:wrongOrder?[]:route.parts.flatMap(p=>p.result.stray),reference:route.parts.flatMap(p=>p.result.reference),score:route.cost/n,
  message:allClose?'The sign forms and left-to-right order match. Spacing and individual sizes are allowed to vary.':wrongOrder?`The forms match, but the order looks like ${route.parts.map(p=>models[p.index].id).join(' · ')}. Write ${models.map(p=>p.id).join(' · ')} from left to right.`:'Check the form of the marked signs. The left-to-right order could not yet be confirmed.'};
}
