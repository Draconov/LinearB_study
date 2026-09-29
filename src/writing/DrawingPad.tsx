import {useEffect,useMemo,useRef,useState} from 'react';
import type {PointerEvent as ReactPointerEvent} from 'react';
import type {Sign} from '../content/types';
import {emptyPad,beginStroke,moveStroke,endStroke,normalisePoint,type PadState,type Point} from './strokes';
import guideData from './guides.json';
import {drawClay,clipClay,drawMarks,pointerPressure} from './clay';
import {drawTarget,layoutTarget} from './targets';
import {compareShape} from './feedback';
import {acceptsPointer} from './settings';
import WritingSettings,{useWritingSettings} from './WritingSettings';
import GuidePlayer from './GuidePlayer';
export type WriteMode='trace'|'copy'|'memory';
const guides:Record<string,Point[][]>=guideData;
export interface TabletTarget {id:string;glyphs:string[];signIds?:string[]}
export default function DrawingPad({sign,mode,onAssess,allowRepeat=true,target,assessmentLabel='Practice recorded.'}:{sign:Sign;mode:WriteMode;onAssess:(comfortable:boolean)=>void;allowRepeat?:boolean;target?:TabletTarget;assessmentLabel?:string}){
 const canvas=useRef<HTMLCanvasElement>(null),data=useRef<PadState>(emptyPad()),locked=useRef(false);
 const [revision,setRevision]=useState(0),[compared,setCompared]=useState(false),[assessed,setAssessed]=useState(false);
 const preferences=useWritingSettings(),{settings}=preferences;
 const label=target?.id??sign.id,ratio=target?.glyphs.length? .62:1;
 const glyphs=useMemo(()=>target?.glyphs??[sign.glyph],[target,sign.glyph]);
 const paths=useMemo(()=>layoutTarget(target?.signIds??(target?[]:[sign.id]),1000,1000*ratio),[target,sign.id,ratio]);
 const [smoothing,setSmoothing]=useState(false);const smoothTimer=useRef<ReturnType<typeof setTimeout>|null>(null);
 useEffect(()=>()=>{if(smoothTimer.current)clearTimeout(smoothTimer.current);},[]);
 const feedback=useMemo(()=>compared&&paths.length?compareShape(data.current.strokes,paths):null,[compared,revision,paths]);
 const refresh=()=>setRevision(x=>x+1);
 useEffect(()=>{
  const el=canvas.current;if(!el)return;
  const draw=()=>{
   const size=el.getBoundingClientRect().width;if(!size)return;const height=size*ratio,dpr=Math.min(window.devicePixelRatio||1,2);
   el.width=Math.round(size*dpr);el.height=Math.round(height*dpr);
   const ctx=el.getContext('2d');if(!ctx)return;ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,size,height);
   const clay=settings.surface==='clay';if(clay)drawClay(ctx,size,height);ctx.save();if(clay)clipClay(ctx,size,height);
   if(settings.grid){ctx.strokeStyle=clay?'rgba(73,49,29,.22)':'#d3d0c8';ctx.lineWidth=1;ctx.setLineDash([2,7]);ctx.beginPath();ctx.moveTo(size/2,height*.1);ctx.lineTo(size/2,height*.9);ctx.moveTo(size*.08,height/2);ctx.lineTo(size*.92,height/2);ctx.stroke();ctx.setLineDash([]);}
   if(mode==='trace'||compared)drawTarget(ctx,glyphs,size,height,clay?'#f7e4bd':'#8b8b80',compared?.3:settings.opacity);
   const strokes=[...data.current.strokes,...(data.current.active?[data.current.active.points]:[])];
   drawMarks(ctx,strokes,size,height,settings.width,clay);
   if(feedback){for(const [points,color] of [[feedback.missing,clay?'#fff0ba':'#a1660b'],[feedback.stray,clay?'#183f53':'#286caa']] as const){ctx.fillStyle=color;for(const p of points){ctx.beginPath();ctx.arc(p.x*size,p.y*height,Math.max(1.5,size*.004),0,Math.PI*2);ctx.fill();}}}ctx.restore();
  };
  draw();const observer=new ResizeObserver(draw);observer.observe(el);window.addEventListener('resize',draw);
  return()=>{observer.disconnect();window.removeEventListener('resize',draw);};
 },[revision,mode,glyphs,ratio,compared,settings,feedback]);
 const point=(e:ReactPointerEvent<HTMLCanvasElement>)=>({...normalisePoint(e.clientX,e.clientY,e.currentTarget.getBoundingClientRect()),pressure:pointerPressure(e.pointerType,e.pressure)});
 const start=(e:ReactPointerEvent<HTMLCanvasElement>)=>{if(assessed||compared||!acceptsPointer(e.pointerType,settings.penOnly)||e.button!==0||data.current.active||!e.currentTarget.getBoundingClientRect().width)return;e.preventDefault();data.current=beginStroke(data.current,e.pointerId,point(e));e.currentTarget.setPointerCapture(e.pointerId);refresh();};
 const end=(e:ReactPointerEvent<HTMLCanvasElement>,cancelled=false)=>{if(data.current.active?.pointerId!==e.pointerId)return;data.current=endStroke(data.current,e.pointerId,cancelled);refresh();};
 const reset=()=>{if(smoothTimer.current)clearTimeout(smoothTimer.current);setSmoothing(settings.surface==='clay');smoothTimer.current=setTimeout(()=>setSmoothing(false),420);data.current=emptyPad();setCompared(false);setAssessed(false);locked.current=false;refresh();};
 const assess=(value:boolean)=>{if(locked.current)return;locked.current=true;setAssessed(true);onAssess(value);};
 return <div className={'pad-component'+(settings.leftHanded?' left-handed':'')}>
 <WritingSettings {...preferences}/>
 <div className="pad-caption"><div><span className="eyebrow">{mode==='trace'?'FOLLOW THE MODEL':mode==='copy'?'COPY THE SHAPE':'FROM MEMORY'}</span><p>{mode==='trace'?'Follow the pale model.':mode==='copy'?'Copy the specimen.':'Write from memory:'} <strong>{mode==='memory'?label:''}</strong>{mode==='memory'?'.':''}</p></div>{mode==='copy'&&<span className="sign copy-model" aria-label={'Model for '+label}>{glyphs.join(' ')}</span>}</div>
 {settings.penOnly&&<p className="input-notice">Pen-only is on. Fingers and mouse won’t draw. <button className="quiet" onClick={()=>preferences.update({penOnly:false})}>Use any input</button></p>}
 <div className={"tablet-bed "+settings.surface+(smoothing?" smoothing":"")}><div className="tablet-bed-label"><span>{settings.surface==="clay"?"WET CLAY / PRACTICE SURFACE":"PAPER / HIGH CONTRAST"}</span><span>{target?"LONG TABLET":"SIGN STUDY"}</span></div><canvas style={{aspectRatio:String(1/ratio)}} ref={canvas} className="drawing-pad" aria-label={'Drawing area for '+label} onPointerDown={start} onPointerMove={e=>{if(data.current.active?.pointerId!==e.pointerId)return;data.current=moveStroke(data.current,e.pointerId,point(e));refresh();}} onPointerUp={e=>end(e)} onPointerCancel={e=>end(e,true)} onLostPointerCapture={e=>end(e,true)} /><span className="tablet-scale" aria-hidden="true"/></div>
 <div className="pad-tools"><div className="actions"><button className="quiet" disabled={!data.current.strokes.length||assessed||compared} onClick={()=>{data.current={strokes:data.current.strokes.slice(0,-1),active:null};refresh();}}>↶ Undo</button><button className="quiet" disabled={(assessed&&!allowRepeat)||(!data.current.strokes.length&&!data.current.active)} onClick={reset}>{settings.surface==='clay'?'Smooth clay':'Clear'}</button></div><span className="small muted">{data.current.strokes.length} {data.current.strokes.length===1?'stroke':'strokes'}</span></div>
 {feedback&&<div className="shape-feedback" role="status"><strong>Shape guidance</strong><p>{feedback.message}</p><div className="feedback-legend"><span>◆ {settings.surface==='clay'?'Light':'Amber'}: uncovered model</span><span>● Blue: distant marks</span></div><p className="small muted">Position and size affect this overlay. It compares with one font form, not every valid way to write the sign. Your assessment is still your choice.</p></div>}
 {compared&&!assessed&&<button className="quiet" onClick={()=>setCompared(false)}>Continue drawing</button>}
 {!compared?<button className="primary full" disabled={!data.current.strokes.length||!!data.current.active} onClick={()=>setCompared(true)}>Compare with the model <span aria-hidden="true">↗</span></button>:!assessed?<div className="assessment"><p>How did it feel? This is your own assessment.</p><div className="actions"><button onClick={()=>assess(false)}>Again</button><button className="primary" onClick={()=>assess(true)}>Comfortable <span aria-hidden="true">✓</span></button></div></div>:<div className="assessment"><p role="status">{assessmentLabel}</p>{allowRepeat&&<button className="primary full" onClick={reset}>New attempt</button>}</div>}
 {!target&&(mode!=='memory'||compared)&&<GuidePlayer key={sign.id} paths={guides[sign.id]} signId={sign.id}/>}
 <p className="pad-note">Modern practice forms. Marks stay on this device; changing the exercise clears them.</p></div>;
}
