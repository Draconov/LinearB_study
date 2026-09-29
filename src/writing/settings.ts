export interface WritingSettings {width:number;opacity:number;grid:boolean;leftHanded:boolean;penOnly:boolean;surface:"clay"|"plain"}
export const settingsKey='linear-b-writing-settings-v1';
export const defaults:WritingSettings={width:.008,opacity:.55,grid:true,leftHanded:false,penOnly:false,surface:"clay"};
export function parseSettings(raw:string|null):WritingSettings{
 try{const v=JSON.parse(raw??'null');if(!v||typeof v!=='object')return {...defaults};return {surface:v.surface==="plain"?"plain":"clay",width:[.004,.008,.012].includes(v.width)?v.width:defaults.width,opacity:[.2,.55,.85].includes(v.opacity)?v.opacity:defaults.opacity,grid:typeof v.grid==='boolean'?v.grid:defaults.grid,leftHanded:typeof v.leftHanded==='boolean'?v.leftHanded:defaults.leftHanded,penOnly:typeof v.penOnly==='boolean'?v.penOnly:defaults.penOnly};}catch{return {...defaults};}
}
export const acceptsPointer=(type:string,penOnly:boolean)=>!penOnly||type==='pen';
