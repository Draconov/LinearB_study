import {useEffect,useRef,useState} from "react";import {lessons} from "../content/lessons";import {loadProgress,saveProgress,type StorageLike,type StorageStatus} from "./storage";import {recordOutcome} from "./review";import type {Progress,Outcome} from "./types";
function browserStorage():StorageLike|null{try{return window.localStorage;}catch{return null;}}
export function useProgress(){
 const [storage]=useState(browserStorage);const [loaded]=useState(()=>loadProgress(storage));const [progress,setProgress]=useState(loaded.progress);const latest=useRef(progress);const dirty=useRef(false);const [storageStatus,setStatus]=useState<StorageStatus>(loaded.status);
 const commit=(fn:(p:Progress)=>Progress)=>{const next=fn(latest.current);if(next===latest.current)return;latest.current=next;dirty.current=true;setProgress(next);};
 useEffect(()=>{if(!dirty.current)return;if(saveProgress(storage,progress,loaded.canWrite)==="blocked")setStatus("blocked");},[progress,storage,loaded.canWrite]);
 return {progress,storageStatus,
 submitOutcome:(event:Outcome)=>commit(p=>recordOutcome(p,event)),
 setCursor:(cursor:Progress["cursor"])=>commit(p=>({...p,cursor})),
 completeLesson:(id:string)=>commit(p=>!lessons.some(l=>l.id===id)||p.completedLessonIds.includes(id)?p:{...p,completedLessonIds:[...p.completedLessonIds,id]})
 };
}
export type ProgressApi=ReturnType<typeof useProgress>;
