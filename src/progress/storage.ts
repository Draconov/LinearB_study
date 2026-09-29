import {lessons,lessonStepLimit} from "../content/lessons";import {signById} from "../content/signs";import {emptyProgress} from "./review";import type {Progress} from "./types";
export type StorageLike=Pick<Storage,"getItem"|"setItem">;
export type StorageStatus="ok"|"blocked"|"invalid"|"unsupported";
export const STORAGE_KEY="linear-b-progress-v1";
const obj=(v:unknown):v is Record<string,unknown>=>!!v&&typeof v==="object"&&!Array.isArray(v);
const number=(v:unknown)=>typeof v==="number"&&Number.isSafeInteger(v)&&v>=0;
const stringArray=(v:unknown):v is string[]=>Array.isArray(v)&&v.every(x=>typeof x==="string");
const validKey=(k:string)=>/^(recognition|writing):[a-z]+$/.test(k)&&Object.hasOwn(signById,k.split(":")[1]);
export function validProgress(v:unknown):v is Progress{
 if(!obj(v)||v.version!==1||!stringArray(v.completedLessonIds)||v.completedLessonIds.some(id=>!lessons.some(l=>l.id===id))||new Set(v.completedLessonIds).size!==v.completedLessonIds.length)return false;
 if(v.cursor!==null){
  if(!obj(v.cursor)||!number(v.cursor.step))return false;
  const cursor=v.cursor;const l=lessons.find(l=>l.id===cursor.lessonId);if(!l)return false;
  const limit=lessonStepLimit(l);if((v.cursor.step as number)>limit)return false;
 }
 if(!obj(v.cards)||!obj(v.stats)||!stringArray(v.recentAttemptIds)||v.recentAttemptIds.length>256||v.recentAttemptIds.some(x=>!x||x.length>200))return false;
 for(const [k,c]of Object.entries(v.cards)){
  if(!validKey(k)||!obj(c)||k!==c.skill+":"+c.signId||!number(c.dueAt)||!Number.isInteger(c.intervalIndex)||(c.intervalIndex as number)<-1||(c.intervalIndex as number)>4||typeof c.retry!=="boolean")return false;
  if(c.retry!==(c.intervalIndex===-1))return false;
 }
 for(const [k,c]of Object.entries(v.stats))if(!validKey(k)||!obj(c)||!number(c.successes)||!number(c.failures))return false;
 return true;
}
export function loadProgress(storage:StorageLike|null):{progress:Progress;status:StorageStatus;canWrite:boolean}{
 const fallback=(status:StorageStatus)=>({progress:emptyProgress(),status,canWrite:false});
 if(!storage)return fallback("blocked");
 let raw:string|null;try{raw=storage.getItem(STORAGE_KEY);}catch{return fallback("blocked");}
 if(raw===null)return {progress:emptyProgress(),status:"ok",canWrite:true};
 if(raw.length>1_048_576)return fallback("invalid");
 try{const v:unknown=JSON.parse(raw);if(obj(v)&&v.version!==1&&typeof v.version==="number")return fallback("unsupported");
 if(!validProgress(v))return fallback("invalid");return {progress:v,status:"ok",canWrite:true};}catch{return fallback("invalid");}
}
export function saveProgress(storage:StorageLike|null,p:Progress,canWrite:boolean):"saved"|"blocked"|"read-only"{
 if(!canWrite)return "read-only";if(!storage)return "blocked";
 try{storage.setItem(STORAGE_KEY,JSON.stringify(p));return "saved";}catch{return "blocked";}
}
