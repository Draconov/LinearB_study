import {expect,test,vi} from 'vitest';
import {registerLearningTools,type LearningTool} from './tools';
test('agent navigation validates sign IDs before changing visible state',async()=>{
 const registered:LearningTool[]=[];const open=vi.fn();
 const cleanup=registerLearningTools({registerTool:tool=>{registered.push(tool);}},()=>({completedLessons:2,dueCards:3}),open);
 expect(registered.map(t=>t.name)).toEqual(['get_learning_progress','open_sign_practice']);
 expect(await registered[0].execute({})).toEqual({completedLessons:2,dueCards:3});
 for(const input of [{signId:'invented'},{signId:'__proto__'},null,{signId:'a',extra:true}])expect(()=>registered[1].execute(input)).toThrow();
 expect(open).not.toHaveBeenCalled();
 expect(await registered[1].execute({signId:'ko'})).toEqual({view:'write',signId:'ko',mode:'trace'});
 expect(open).toHaveBeenCalledExactlyOnceWith('ko');cleanup();
});
