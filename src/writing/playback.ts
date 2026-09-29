export interface Playback {step:number;elapsed:number;playing:boolean}
export type PlaybackAction={type:'play'}|{type:'pause'}|{type:'replay'}|{type:'step';step:number}|{type:'tick';ms:number};
export function guidePlayback(state:Playback,action:PlaybackAction,count:number):Playback{
 if(action.type==='pause')return {...state,playing:false};
 if(action.type==='replay')return {step:0,elapsed:0,playing:true};
 if(action.type==='step')return {step:Math.max(0,Math.min(count-1,action.step)),elapsed:1000,playing:false};
 if(action.type==='play')return state.step===count-1&&state.elapsed>=1400?{step:0,elapsed:0,playing:true}:{...state,playing:true};
 if(!state.playing)return state;
 const total=state.step*1400+state.elapsed+Math.max(0,action.ms);
 if(total>=count*1400)return {step:count-1,elapsed:1400,playing:false};
 return {step:Math.floor(total/1400),elapsed:total%1400,playing:true};
}
