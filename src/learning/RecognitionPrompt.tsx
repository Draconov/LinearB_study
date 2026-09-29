import {useRef,useState} from "react";import {signById} from "../content/signs";import {claimAnswer,type Prompt} from "./prompts";
export default function RecognitionPrompt({prompt,onAnswer,onContinue}:{prompt:Prompt;onAnswer:(correct:boolean)=>void;onContinue:()=>void}){
 const handled=useRef(new Set<string>()),[chosen,setChosen]=useState<string|null>(null),s=signById[prompt.signId],reverse=prompt.direction==="reading-to-sign";
 function answer(id:string){if(!claimAnswer(handled.current,prompt.id))return;setChosen(id);onAnswer(id===s.id);}
 return <div className="recognition"><p className="eyebrow">{reverse?"FIND THE SIGN":"READ THE SIGN"}</p><h2>{reverse?"Which sign is “"+s.id+"”?":"What is this sign’s reading?"}</h2>{!reverse&&<div className="quiz-glyph sign" aria-label="Sign to identify">{s.glyph}</div>}
 <div className={"answer-grid "+(reverse?"glyph-answers":"")}>{prompt.optionIds.map((id,i)=><button key={id} className={chosen!==null?(id===s.id?"answer correct":id===chosen?"answer incorrect":"answer"):"answer"} aria-label={reverse?"Option "+(i+1):undefined} disabled={chosen!==null} onClick={()=>answer(id)}>{reverse?<span className="sign">{signById[id].glyph}</span>:id}</button>)}</div>
 {chosen!==null&&<><div className={"feedback "+(chosen===s.id?"positive":"")} role="status"><strong>{chosen===s.id?"You’ve got it.":"One to revisit."}</strong> This sign is read <b>{s.id}</b>.</div><button className="primary full" onClick={onContinue}>Continue <span aria-hidden="true">→</span></button></>}
 </div>;
}
