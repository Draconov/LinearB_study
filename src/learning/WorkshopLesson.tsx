import {useState} from 'react';
import {workshops} from '../content/workshops';
import {studioExercises} from '../content/studio';
import {tabletPassages} from '../content/tablets';
import {signs} from '../content/signs';
import {TabletPassageView} from './TabletExplorer';
import DrawingPad from '../writing/DrawingPad';
export default function WorkshopLesson({id,step,onNext,onComplete}:{id:string;step:number;onNext:()=>void;onComplete:()=>void}){
 const w=workshops.find(x=>x.id===id)!;const [chosen,setChosen]=useState<string|null>(null);const [attempt,setAttempt]=useState(0);
 return <div className="workshop-lesson"><div className="exercise-meta"><span>FIELD NOTES / {['Observe','Read','Practise'][step]}</span><span>{step+1} / 3</span></div><progress className="lesson-progress" value={step+1} max={3} aria-label="Lesson progress"/>
 {step===0?<><div className="workshop-specimen sign">{w.specimen}</div>{w.brief.map(p=><p key={p}>{p}</p>)}<a className="source-link" href={w.sourceUrl} target="_blank" rel="noreferrer">{w.sourceTitle} ↗</a><button className="primary full reading-continue" onClick={onNext}>Read the specimen →</button></>:step===1?<><div className="workshop-specimen sign" aria-label="Specimen to read">{w.specimen}</div><h2>{w.question}</h2><div className="workshop-options">{w.options.map(o=><button key={o} disabled={chosen!==null} className={chosen!==null&&o===w.answer?'answer correct':chosen===o?'answer incorrect':''} onClick={()=>setChosen(o)}>{o}</button>)}</div>{chosen&&<div className="feedback" role="status"><p>{chosen===w.answer?'Correct. ':''}{w.explanation}</p>{chosen===w.answer?<button className="primary" onClick={onNext}>Practise on the tablet →</button>:<button onClick={()=>setChosen(null)}>Try again</button>}</div>}</>:<><p className="tablet-task">{w.task}</p>{w.writingId?<DrawingPad key={attempt} sign={signs[0]} target={studioExercises.find(e=>e.id===w.writingId)!} mode="copy" allowRepeat={false} onAssess={comfortable=>comfortable?onComplete():setAttempt(n=>n+1)}/>:<TabletPassageView passage={tabletPassages.find(p=>p.id===w.tabletId)!} onComplete={onComplete}/>}</>}
 </div>;
}
