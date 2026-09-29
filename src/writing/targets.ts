import guideData from './guides.json';
import type {Point} from './strokes';
const guides:Record<string,Point[][]>=guideData;
export function layoutTarget(ids:string[],width:number,height:number):Point[][]{
 const cell=width/ids.length,unit=Math.min(cell,height);
 return ids.flatMap((id,i)=>(guides[id]??[]).map(path=>path.map(p=>({x:((i+.5)*cell+(p.x-.5)*unit)/width,y:.5+(p.y-.5)*unit/height}))));
}
export function drawTarget(ctx:CanvasRenderingContext2D,glyphs:string[],width:number,height:number,color:string,opacity:number){
 const cell=width/glyphs.length,unit=Math.min(cell,height);ctx.save();ctx.globalAlpha=opacity;ctx.fillStyle=color;
 glyphs.forEach((glyph,i)=>{ctx.font=unit*.65+'px "LinearB"';let b=ctx.measureText(glyph);const scale=Math.min(1,unit*.76/(b.actualBoundingBoxLeft+b.actualBoundingBoxRight||1),unit*.76/(b.actualBoundingBoxAscent+b.actualBoundingBoxDescent||1));ctx.font=unit*.65*scale+'px "LinearB"';b=ctx.measureText(glyph);ctx.fillText(glyph,(i+.5)*cell+(b.actualBoundingBoxLeft-b.actualBoundingBoxRight)/2,height/2+(b.actualBoundingBoxAscent-b.actualBoundingBoxDescent)/2);});ctx.restore();
}
