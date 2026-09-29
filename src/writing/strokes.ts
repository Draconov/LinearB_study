export interface Point{x:number;y:number}
export interface PadState{strokes:Point[][];active:{pointerId:number;points:Point[]}|null}
export const emptyPad=():PadState=>({strokes:[],active:null});
export function normalisePoint(x:number,y:number,r:{left:number;top:number;width:number;height:number}):Point{return {x:Math.max(0,Math.min(1,(x-r.left)/(r.width||1))),y:Math.max(0,Math.min(1,(y-r.top)/(r.height||1)))};}
export function beginStroke(s:PadState,pointerId:number,p:Point):PadState{return s.active?s:{...s,active:{pointerId,points:[p]}};}
export function moveStroke(s:PadState,pointerId:number,p:Point):PadState{return s.active?.pointerId!==pointerId?s:{...s,active:{pointerId,points:[...s.active.points,p]}};}
export function endStroke(s:PadState,pointerId:number,cancelled:boolean):PadState{return s.active?.pointerId!==pointerId?s:{strokes:cancelled?s.strokes:[...s.strokes,s.active.points],active:null};}

