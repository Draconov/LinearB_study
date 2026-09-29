import {signById} from '../content/signs';
export interface LearningTool {
 name:string;title:string;description:string;inputSchema:object;
 annotations:{readOnlyHint:boolean;untrustedContentHint:boolean};
 execute:(input:unknown)=>unknown;
}
export interface ModelContext {registerTool:(tool:LearningTool,options?:{signal:AbortSignal})=>void|Promise<void>}
function object(input:unknown):Record<string,unknown>{
 if(!input||typeof input!=='object'||Array.isArray(input))throw new Error('Expected an object');
 return input as Record<string,unknown>;
}
export function registerLearningTools(context:ModelContext|undefined,getProgress:()=>unknown,openPractice:(id:string)=>void){
 const lifecycle=new AbortController();
 if(!context?.registerTool)return()=>lifecycle.abort();
 const list:LearningTool[]=[{
  name:'get_learning_progress',title:'Read learning progress',description:'Read the number of completed lessons and due review cards in this browser. Does not change progress.',
  inputSchema:{type:'object',properties:{},additionalProperties:false},annotations:{readOnlyHint:true,untrustedContentHint:false},
  execute(input){if(Object.keys(object(input)).length)throw new Error('No parameters are accepted');return getProgress();}
 },{
  name:'open_sign_practice',title:'Open handwriting practice',description:'Navigate to the writing studio for one course sign in Trace mode. Replaces any unfinished studio drawing. Does not assess handwriting or record progress.',
  inputSchema:{type:'object',properties:{signId:{type:'string',enum:Object.keys(signById)}},required:['signId'],additionalProperties:false},annotations:{readOnlyHint:false,untrustedContentHint:false},
  execute(input){const value=object(input);if(Object.keys(value).length!==1||typeof value.signId!=='string'||!Object.hasOwn(signById,value.signId))throw new Error('Choose a valid course signId');openPractice(value.signId);return {view:'write',signId:value.signId,mode:'trace'};}
 }];
 for(const tool of list){try{void Promise.resolve(context.registerTool(tool,{signal:lifecycle.signal})).catch(()=>console.warn('Agent tool registration was unavailable.'));}catch{console.warn('Agent tool registration was unavailable.');}}
 return()=>lifecycle.abort();
}
