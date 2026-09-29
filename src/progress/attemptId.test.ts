import {expect,test,vi} from 'vitest';
import {attemptId} from './attemptId';
test('attempt IDs work without the secure-context randomUUID API',()=>{
 vi.stubGlobal('crypto',{getRandomValues:crypto.getRandomValues.bind(crypto)});
 try{const ids=Array.from({length:100},attemptId);expect(new Set(ids).size).toBe(100);expect(ids.every(id=>id.length>20)).toBe(true);}finally{vi.unstubAllGlobals();}
});
