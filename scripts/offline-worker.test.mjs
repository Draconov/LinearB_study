import {describe,it,expect} from 'vitest';
import vm from 'node:vm';
import {workerSource} from './worker-source.mjs';
function harness(path='/linear-b-learn/',fail=false){
 const origin='https://example.test',scope=origin+path,handlers={},stores=new Map();
 const storesApi={open:async name=>{if(!stores.has(name))stores.set(name,new Map());const data=stores.get(name);return {addAll:async urls=>{if(fail)throw Error('offline');for(const url of urls)data.set(url,new Response(url));},match:async req=>data.get(typeof req==='string'?req:req.url)?.clone(),put:async(req,res)=>data.set(typeof req==='string'?req:req.url,res)};},keys:async()=>[...stores.keys()],delete:async key=>stores.delete(key)};
 let skip=0,claimed=0;
 const self={registration:{scope},location:{origin},clients:{claim:async()=>{claimed++;}},addEventListener:(name,fn)=>{handlers[name]=fn;},skipWaiting:async()=>{skip++;}};
 vm.runInNewContext(workerSource(['index.html','assets/app.js','fonts/font.otf'],'v2'),{self,caches:storesApi,URL,Response,fetch:async()=>{throw Error('offline');}});
 const life=async name=>{let pending;handlers[name]({waitUntil:p=>{pending=p;}});await pending;};
 const request=async url=>{let response;handlers.fetch({request:{url:origin+url,method:'GET',mode:/\.(js|otf)$/.test(url)?'cors':'navigate'},respondWith:p=>response=p});return response;};
 return {life,request,stores,handlers,get skip(){return skip;},get claimed(){return claimed;}};
}
describe('offline worker',()=>{
 for(const path of ['/','/linear-b-learn/'])it('reloads offline in '+path,async()=>{const h=harness(path);await h.life('install');await h.life('activate');expect(await (await h.request(path)).text()).toBe('https://example.test'+path+'index.html');expect(await (await h.request(path+'assets/app.js')).text()).toContain(path+'assets/app.js');expect(await (await h.request(path+'fonts/font.otf')).text()).toContain(path+'fonts/font.otf');expect(h.claimed).toBe(1);});
 it('fails installation if any required asset is unavailable',async()=>{const h=harness(undefined,true);await expect(h.life('install')).rejects.toThrow('offline');expect(h.skip).toBe(0);});
 it('leaves other application caches alone',async()=>{const h=harness();h.stores.set('linear-b:/another/:v1',new Map());h.stores.set('linear-b:/linear-b-learn/:v1',new Map());await h.life('install');await h.life('activate');expect(h.stores.has('linear-b:/another/:v1')).toBe(true);expect(h.stores.has('linear-b:/linear-b-learn/:v1')).toBe(false);});
 it('activates an update only after the user requests it',async()=>{const h=harness();await h.life('install');expect(h.skip).toBe(0);h.handlers.message({data:{type:'SKIP_WAITING'}});expect(h.skip).toBe(1);});
 it('ignores unrelated navigation and falls back for query strings',async()=>{const h=harness();await h.life('install');expect(await h.request('/another/')).toBeUndefined();expect(await (await h.request('/linear-b-learn/?source=home')).text()).toContain('index.html');});
});
