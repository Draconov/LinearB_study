import {useEffect,useMemo,useRef,useState} from 'react';
import type {PointerEvent as ReactPointerEvent} from 'react';
import type {Sign} from '../content/types';
import {emptyPad,beginStroke,moveStroke,endStroke,normalisePoint,type PadState,type Point} from './strokes';
import guideData from './guides.json';
import {compareShape} from './feedback';
import {acceptsPointer} from './settings';
import WritingSettings,{useWritingSettings} from './WritingSettings';
import GuidePlayer from './GuidePlayer';
export type WriteMode='trace'|'copy'|'memory';
const guides:Record<string,Point[][]>=guideData;
export default function DrawingPad({sign,mode,onAssess,allowRepeat=true}:{sign:Sign;mode:WriteMode;onAssess:(comfortable:boolean)=>void;allowRepeat?:boolean}){
 const canvas=useRef<HTMLCanvasElement>(null),data=useRef<PadState>(emptyPad()),locked=useRef(false);
 const [revision,setRevision]=useState(0),[compared,setCompared]=useState(false),[assessed,setAssessed]=useState(false);
 const preferences=useWritingSettings(),{settings}=preferences;
 const paths=guides[sign.id];
 const feedback=useMemo(()=>compared?compareShape(data.current.strokes,paths):null,[compared,revision,paths]);
 const refresh=()=>setRevision(x=>x+1);
 useEffect(()=>{
  const el=canvas.current;if(!el)return;
  const draw=()=>{
   const size=el.getBoundingClientRect().width;if(!size)return;const dpr=window.devicePixelRatio||1;
   el.width=Math.round(size*dpr);el.height=Math.round(size*dpr);
   const ctx=el.getContext('2d');if(!ctx)return;ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,size,size);
   if(settings.grid){ctx.strokeStyle='#e6dfd2';ctx.lineWidth=1;ctx.setLineDash([4,5]);ctx.beginPath();ctx.moveTo(size/2,16);ctx.lineTo(size/2,size-16);ctx.moveTo(16,size/2);ctx.lineTo(size-16,size/2);ctx.stroke();ctx.setLineDash([]);}
   if(mode==='trace'||compared){
    ctx.font=(size*.65)+'px "LinearB"';const m=ctx.measureText(sign.glyph);
    const scale=Math.min(1,size*.76/(m.actualBoundingBoxLeft+m.actualBoundingBoxRight||1),size*.76/(m.actualBoundingBoxAscent+m.actualBoundingBoxDescent||1));
    ctx.font=(size*.65*scale)+'px "LinearB"';const b=ctx.measureText(sign.glyph);
    ctx.globalAlpha=compared?.35:settings.opacity;ctx.fillStyle='#ad8e6c';ctx.fillText(sign.glyph,size/2+(b.actualBoundingBoxLeft-b.actualBoundingBoxRight)/2,size/2+(b.actualBoundingBoxAscent-b.actualBoundingBoxDescent)/2);ctx.globalAlpha=1;
   }
   ctx.strokeStyle='#302920';ctx.fillStyle='#302920';ctx.lineWidth=Math.max(1.2,size*settings.width);ctx.lineCap='round';ctx.lineJoin='round';
   const strokes=[...data.current.strokes,...(data.current.active?[data.current.active.points]:[])];
   for(const points of strokes){if(!points.length)continue;ctx.beginPath();ctx.moveTo(points[0].x*size,points[0].y*size);for(const p of points.slice(1))ctx.lineTo(p.x*size,p.y*size);ctx.stroke();if(points.length===1){ctx.beginPath();ctx.arc(points[0].x*size,points[0].y*size,ctx.lineWidth/2,0,Math.PI*2);ctx.fill();}}
   if(feedback){for(const [points,color] of [[feedback.missing,'#b5770b'],[feedback.stray,'#286caa']] as const){ctx.fillStyle=color;for(const p of points){ctx.beginPath();ctx.arc(p.x*size,p.y*size,Math.max(1.5,size*.006),0,Math.PI*2);ctx.fill();}}}
  };
  draw();const observer=new ResizeObserver(draw);observer.observe(el);window.addEventListener('resize',draw);
  return()=>{observer.disconnect();window.removeEventListener('resize',draw);};
 },[revision,mode,sign.glyph,compared,settings,feedback]);
 const point=(e:ReactPointerEvent<HTMLCanvasElement>)=>normalisePoint(e.clientX,e.clientY,e.currentTarget.getBoundingClientRect());
 const start=(e:ReactPointerEvent<HTMLCanvasElement>)=>{if(assessed||compared||!acceptsPointer(e.pointerType,settings.penOnly)||e.button!==0||data.current.active||!e.currentTarget.getBoundingClientRect().width)return;e.preventDefault();data.current=beginStroke(data.current,e.pointerId,point(e));e.currentTarget.setPointerCapture(e.pointerId);refresh();};
 const end=(e:ReactPointerEvent<HTMLCanvasElement>,cancelled=false)=>{if(data.current.active?.pointerId!==e.pointerId)return;data.current=endStroke(data.current,e.pointerId,cancelled);refresh();};
 const reset=()=>{data.current=emptyPad();setCompared(false);setAssessed(false);locked.current=false;refresh();};
 const assess=(value:boolean)=>{if(locked.current)return;locked.current=true;setAssessed(true);onAssess(value);};
 return <div className={'pad-component'+(settings.leftHanded?' left-handed':'')}>
 <WritingSettings {...preferences}/>
 <div className="pad-caption"><div><span className="eyebrow">{mode==='trace'?'FOLLOW THE MODEL':mode==='copy'?'COPY THE SHAPE':'FROM MEMORY'}</span><p>{mode==='trace'?'Trace the pale sign.':mode==='copy'?'Use the small model as your guide.':'Write the sign for'} <strong>{mode==='memory'?sign.id:''}</strong>{mode==='memory'?'.':''}</p></div>{mode==='copy'&&<span className="sign copy-model" aria-label={'Model for '+sign.id}>{sign.glyph}</span>}</div>
 {settings.penOnly&&<p className="input-notice">Pen-only is on. Fingers and mouse won’t draw. <button className="quiet" onClick={()=>preferences.update({penOnly:false})}>Use any input</button></p>}
 <canvas ref={canvas} className="drawing-pad" aria-label={'Drawing area for '+sign.id} onPointerDown={start} onPointerMove={e=>{if(data.current.active?.pointerId!==e.pointerId)return;data.current=moveStroke(data.current,e.pointerId,point(e));refresh();}} onPointerUp={e=>end(e)} onPointerCancel={e=>end(e,true)} onLostPointerCapture={e=>end(e,true)} />
 <div className="pad-tools"><div className="actions"><button className="quiet" disabled={!data.current.strokes.length||assessed||compared} onClick={()=>{data.current={strokes:data.current.strokes.slice(0,-1),active:null};refresh();}}>↶ Undo</button><button className="quiet" disabled={(assessed&&!allowRepeat)||(!data.current.strokes.length&&!data.current.active)} onClick={reset}>Clear</button></div><span className="small muted">{data.current.strokes.length} {data.current.strokes.length===1?'stroke':'strokes'}</span></div>
 {feedback&&<div className="shape-feedback" role="status"><strong>Shape guidance</strong><p>{feedback.message}</p><div className="feedback-legend"><span>◆ Amber: uncovered model</span><span>● Blue: distant ink</span></div><p className="small muted">Position and size affect this overlay. It compares with one font form, not every valid way to write the sign. Your assessment is still your choice.</p>{!assessed&&<button className="quiet" onClick={()=>setCompared(false)}>Continue drawing</button>}</div>}
 {!compared?<button className="primary full" disabled={!data.current.strokes.length||!!data.current.active} onClick={()=>setCompared(true)}>Compare with the model <span aria-hidden="true">↗</span></button>:!assessed?<div className="assessment"><p>How did it feel? This is your own assessment.</p><div className="actions"><button onClick={()=>assess(false)}>Again</button><button className="primary" onClick={()=>assess(true)}>Comfortable <span aria-hidden="true">✓</span></button></div></div>:<div className="assessment"><p role="status">Practice recorded.</p>{allowRepeat&&<button className="primary full" onClick={reset}>New attempt</button>}</div>}
 {(mode!=='memory'||compared)&&<GuidePlayer key={sign.id} paths={paths} signId={sign.id}/>}
 <p className="pad-note">One practice form, not the only way an ancient scribe wrote it. Handwriting feedback stays on your device.</p></div>;
}
