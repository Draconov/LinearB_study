import {signById} from "../content/signs";import type {SignId} from "../content/types";
export interface Prompt{id:string;signId:SignId;direction:"sign-to-reading"|"reading-to-sign";optionIds:SignId[]}
function shuffle<T>(items:T[]):T[]{const a=[...items];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
export function makePrompt(signId:SignId,pool:SignId[],direction:Prompt["direction"],id:string):Prompt{return {id,signId,direction,optionIds:shuffle([signId,...shuffle([...new Set(pool)].filter(x=>x!==signId&&Object.hasOwn(signById,x))).slice(0,3)])};}
export function claimAnswer(handled:Set<string>,id:string):boolean{if(handled.has(id))return false;handled.add(id);return true;}

