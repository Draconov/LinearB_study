import {useState} from 'react';
import {defaults,parseSettings,settingsKey,type WritingSettings as Settings} from './settings';
export function useWritingSettings(){
 const [settings,setSettings]=useState<Settings>(()=>{try{return parseSettings(localStorage.getItem(settingsKey));}catch{return {...defaults};}});
 const [saved,setSaved]=useState(true);
 const update=(patch:Partial<Settings>)=>{const next={...settings,...patch};setSettings(next);try{localStorage.setItem(settingsKey,JSON.stringify(next));setSaved(true);}catch{setSaved(false);}};
 return {settings,update,saved};
}
export default function WritingSettings({settings,update,saved}:ReturnType<typeof useWritingSettings>){
 return <details className="writing-settings"><summary>Writing settings</summary><div className="settings-grid">
 <label>Pen width<select value={settings.width} onChange={e=>update({width:Number(e.target.value)})}><option value={.004}>Thin</option><option value={.008}>Medium</option><option value={.012}>Bold</option></select></label>
 <label>Tracing guide<select value={settings.opacity} onChange={e=>update({opacity:Number(e.target.value)})}><option value={.2}>Faint</option><option value={.55}>Medium</option><option value={.85}>Strong</option></select></label>
 <label className="check-setting"><input type="checkbox" checked={settings.grid} onChange={e=>update({grid:e.target.checked})}/> Centre guides</label>
 <label className="check-setting"><input type="checkbox" checked={settings.leftHanded} onChange={e=>update({leftHanded:e.target.checked})}/> Left-handed controls</label>
 <label className="check-setting"><input type="checkbox" checked={settings.penOnly} onChange={e=>update({penOnly:e.target.checked})}/> Pen-only drawing</label>
 </div><p className="small muted">Pen-only ignores fingers and mouse inside the pad. Turn it off here to use either again. Left-handed controls move the drawing tools to the right.</p>{!saved&&<p role="status" className="small">Settings work for this session; this browser could not save them.</p>}</details>;
}
