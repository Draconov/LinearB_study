import {useEffect,useReducer,useState} from 'react';
import {guidePlayback} from './playback';
import type {Point} from './strokes';
const pathData=(points:Point[])=>points.map((p,i)=>(i?'L':'M')+(p.x*100).toFixed(2)+' '+(p.y*100).toFixed(2)).join(' ');
export default function GuidePlayer({paths,signId}:{paths:Point[][];signId:string}){
 const [playback,dispatch]=useReducer((state:import('./playback').Playback,action:import('./playback').PlaybackAction)=>guidePlayback(state,action,paths.length),{step:0,elapsed:0,playing:false});
 const {step,playing}=playback;const fraction=Math.min(1,playback.elapsed/1000);
 const [reduced,setReduced]=useState(()=>window.matchMedia('(prefers-reduced-motion: reduce)').matches);
 useEffect(()=>{const media=window.matchMedia('(prefers-reduced-motion: reduce)');const change=()=>{setReduced(media.matches);dispatch({type:'pause'});};media.addEventListener('change',change);return()=>media.removeEventListener('change',change);},[]);
 useEffect(()=>{
  if(!playing||reduced)return;
  let frame=0;let previous:number|undefined;
  const tick=(time:number)=>{if(previous!==undefined)dispatch({type:'tick',ms:Math.min(100,time-previous)});previous=time;frame=requestAnimationFrame(tick);};
  frame=requestAnimationFrame(tick);return()=>cancelAnimationFrame(frame);
 },[playing,reduced]);
 const move=(next:number)=>dispatch({type:'step',step:next});
 const first=paths[step][0];
 return <details className="guide-player" onToggle={e=>{if(!e.currentTarget.open)dispatch({type:'pause'});}}><summary>See how to draw {signId}</summary>
 <p className="small muted">A suggested sequence based on this font. Ancient scribes used varying forms; these are modern practice segments.</p>
 <svg viewBox="0 0 100 100" role="img" aria-label={'Construction guide for '+signId+', segment '+(step+1)+' of '+paths.length}>
 {paths.map((p,i)=><path key={'base'+i} d={pathData(p)} fill="none" stroke="#e1d6c6" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>)}
 {paths.slice(0,step+1).map((p,i)=><path key={i} d={pathData(p)} fill="none" stroke={i===step?'#9c462e':'#44786c'} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" pathLength="1" strokeDasharray="1" strokeDashoffset={i===step?1-fraction:0}/>)}
 <circle cx={first.x*100} cy={first.y*100} r="3.7" fill="#9c462e"/><text x={first.x*100} y={first.y*100+1.4} textAnchor="middle" fontSize="4.2" fill="white" fontFamily="Arial">{step+1}</text>
 </svg><p className="small guide-step" role="status">Segment {step+1} of {paths.length} · start at the numbered dot</p>
 <div className="actions guide-controls"><button disabled={step===0} onClick={()=>move(step-1)}>Previous</button><button disabled={step===paths.length-1} onClick={()=>move(step+1)}>Next</button>{!reduced&&<button onClick={()=>dispatch({type:playing?'pause':'play'})}>{playing?'Pause':'Play'}</button>}<button onClick={()=>dispatch(reduced?{type:'step',step:0}:{type:'replay'})}>Replay</button></div>
 {reduced&&<p className="small muted">Reduced motion is on. Use Next to see each segment.</p>}
 </details>;
}
