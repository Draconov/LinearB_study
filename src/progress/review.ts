import {signById} from "../content/signs"; import type {Progress,Outcome,ReviewCard} from "./types";
export const DAY=86_400_000;const intervals=[1,3,7,14,30];
export const emptyProgress=():Progress=>({version:1,completedLessonIds:[],cursor:null,cards:{},stats:{},recentAttemptIds:[]});
export function recordOutcome(p:Progress,e:Outcome):Progress {
 if(!Object.hasOwn(signById,e.signId)||!e.attemptId||!Number.isFinite(e.now)||e.now<0||!["recognition","writing"].includes(e.skill)||p.recentAttemptIds.includes(e.attemptId))return p;
 const key=e.skill+":"+e.signId, old=p.cards[key], stat=p.stats[key]??{successes:0,failures:0};
 let card:ReviewCard|undefined=old;
 if(!old||(!e.extra&&old.dueAt<=e.now)){
  const index=e.correct?(old?.retry?0:Math.min(4,(old?.intervalIndex??-1)+1)):-1;
  card={signId:e.signId,skill:e.skill,intervalIndex:index,dueAt:e.correct?e.now+intervals[index]*DAY:e.now,retry:!e.correct};
 }
 return {...p,cards:{...p.cards,[key]:card!},stats:{...p.stats,[key]:{successes:stat.successes+Number(e.correct),failures:stat.failures+Number(!e.correct)}},recentAttemptIds:[...p.recentAttemptIds,e.attemptId].slice(-256)};
}
export function dueCards(p:Progress,now:number):ReviewCard[]{return Object.values(p.cards).filter(c=>c.dueAt<=now).sort((a,b)=>a.dueAt-b.dueAt||(a.skill+":"+a.signId).localeCompare(b.skill+":"+b.signId));}

