import type {Point} from './strokes';
export function pointerPressure(type:string,value:number):number{return type==='pen'&&Number.isFinite(value)&&value>0?Math.min(1,Math.max(.05,value)):.5;}
export const grooveWidth=(width:number,pressure=.5)=>width*(.6+Math.max(0,Math.min(1,pressure))*.8);
function tabletOutline(w:number,h:number){
 const p=new Path2D();p.moveTo(w*.096,h*.055);p.bezierCurveTo(w*.3,h*.029,w*.69,h*.057,w*.89,h*.046);p.bezierCurveTo(w*.967,h*.04,w*.974,h*.12,w*.958,h*.26);p.bezierCurveTo(w*.969,h*.5,w*.97,h*.74,w*.948,h*.89);p.bezierCurveTo(w*.944,h*.961,w*.84,h*.967,w*.74,h*.95);p.bezierCurveTo(w*.5,h*.966,w*.25,h*.958,w*.09,h*.943);p.bezierCurveTo(w*.028,h*.941,w*.035,h*.84,w*.041,h*.73);p.bezierCurveTo(w*.026,h*.47,w*.04,h*.23,w*.04,h*.15);p.bezierCurveTo(w*.04,h*.085,w*.052,h*.062,w*.096,h*.055);p.closePath();return p;
}
const hash=(x:number,y:number)=>{let n=Math.imul(x+19,374761393)^Math.imul(y+71,668265263);n=Math.imul(n^(n>>>13),1274126177);return ((n^(n>>>16))>>>0)/4294967295;};
function noise(x:number,y:number){const ix=Math.floor(x),iy=Math.floor(y);let fx=x-ix,fy=y-iy;fx=fx*fx*(3-2*fx);fy=fy*fy*(3-2*fy);const a=hash(ix,iy)*(1-fx)+hash(ix+1,iy)*fx,b=hash(ix,iy+1)*(1-fx)+hash(ix+1,iy+1)*fx;return a*(1-fy)+b*fy;}
const surfaces=new Map<string,HTMLCanvasElement>();
function surface(ratio:number){
 const key=ratio.toFixed(2);const cached=surfaces.get(key);if(cached)return cached;
 const w=800,h=Math.round(w*ratio),el=document.createElement('canvas');el.width=w;el.height=h;const ctx=el.getContext('2d')!;const pixels=ctx.createImageData(w,h);
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){
  const broad=noise(x/135,y/120),mottle=noise(x/33,y/29),grain=hash(x,y),fine=noise(x/3.3,y/3.3);
  const rub=Math.sin(y*.027+x*.006+noise(x/98,y/60)*4)*1.5;
  const light=12*(1-x/w)+9*(1-y/h)+14*(broad-.5)+8*(mottle-.5)+9*(grain-.5)+4*(fine-.5)+rub;
  const pit=grain<.008?-17:grain>.995?8:0;
  const i=(y*w+x)*4;pixels.data[i]=170+light+pit;pixels.data[i+1]=126+light+pit;pixels.data[i+2]=88+light+pit;pixels.data[i+3]=255;
 }
 ctx.putImageData(pixels,0,0);ctx.globalCompositeOperation='destination-in';ctx.fill(tabletOutline(w,h));ctx.globalCompositeOperation='source-over';
 // The same upper-left light defines the rounded lip and the cut marks.
 ctx.save();ctx.clip(tabletOutline(w,h));
 for(let n=18;n>0;n--){ctx.strokeStyle=`rgba(62,36,20,${.006+(18-n)*.0006})`;ctx.lineWidth=n*2;ctx.stroke(tabletOutline(w,h));}
 ctx.translate(-2,-2);ctx.strokeStyle='rgba(246,215,167,.46)';ctx.lineWidth=3;ctx.stroke(tabletOutline(w,h));ctx.restore();
 let seed=836;const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
 ctx.save();ctx.clip(tabletOutline(w,h));
 for(let i=0;i<420;i++){const x=random()*w,y=random()*h,r=random()*.75+.18;ctx.fillStyle=i%3?'rgba(72,44,24,.16)':'rgba(238,206,162,.24)';ctx.beginPath();ctx.ellipse(x,y,r*1.7,r,.5,0,Math.PI*2);ctx.fill();}ctx.restore();
 if(surfaces.size>3)surfaces.clear();surfaces.set(key,el);return el;
}
export function drawClay(ctx:CanvasRenderingContext2D,w:number,h:number){ctx.save();ctx.shadowColor='rgba(0,0,0,.43)';ctx.shadowBlur=w*.025;ctx.shadowOffsetX=w*.007;ctx.shadowOffsetY=w*.018;ctx.drawImage(surface(h/w),0,0,w,h);ctx.restore();}
export function clipClay(ctx:CanvasRenderingContext2D,w:number,h:number){ctx.clip(tabletOutline(w,h));}
export function drawMarks(ctx:CanvasRenderingContext2D,strokes:Point[][],w:number,h:number,width:number,clay:boolean){
 const base=Math.max(1.4,w*width);ctx.lineCap='round';ctx.lineJoin='round';
 const pass=(color:string,scale:number,offset:number)=>{
  ctx.strokeStyle=color;ctx.fillStyle=color;
  for(const points of strokes){for(let i=0;i<points.length;i++){const a=points[Math.max(0,i-1)],b=points[i];ctx.lineWidth=grooveWidth(base,((a.pressure??.5)+(b.pressure??.5))/2)*scale;ctx.beginPath();ctx.moveTo(a.x*w+offset,a.y*h+offset);ctx.lineTo(b.x*w+offset,b.y*h+offset);ctx.stroke();if(!i){ctx.beginPath();ctx.arc(b.x*w+offset,b.y*h+offset,ctx.lineWidth/2,0,Math.PI*2);ctx.fill();}}}
 };
 if(!clay){pass('#282923',1,0);return;}
 pass('rgba(246,213,161,.65)',1.45,base*.28); // raised, lit lower edge
 pass('rgba(98,62,36,.7)',1.34,-base*.13); // shaded upper wall
 pass('#775031',1,0);pass('#513521',.48,-base*.12); // recessed floor
 pass('rgba(189,141,92,.36)',.24,base*.22);
}
