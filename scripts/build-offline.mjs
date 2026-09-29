import {readdir,readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {join} from 'node:path';
import {workerSource} from './worker-source.mjs';
const root=new URL('../dist/',import.meta.url);
async function walk(dir=''){const result=[];for(const entry of await readdir(new URL(dir,root),{withFileTypes:true})){const name=join(dir,entry.name).replaceAll('\\','/');if(entry.isDirectory())result.push(...await walk(name+'/'));else if(name!=='sw.js')result.push(name);}return result.sort();}
const files=await walk();const hash=createHash('sha256').update(workerSource.toString());
for(const file of files)hash.update(file).update(await readFile(new URL(file,root)));
await writeFile(new URL('sw.js',root),workerSource(files,hash.digest('hex').slice(0,16)));
console.log('Offline cache generated:',files.length,'local files.');
