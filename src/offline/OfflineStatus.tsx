import {useEffect,useRef,useState} from 'react';
interface InstallPrompt extends Event {prompt:()=>Promise<void>;userChoice:Promise<{outcome:'accepted'|'dismissed'}>}
type Status='loading'|'ready'|'error'|'unavailable';
export default function OfflineStatus(){
 const [status,setStatus]=useState<Status>('loading'),[online,setOnline]=useState(navigator.onLine);
 const [attempt,setAttempt]=useState(0),[waiting,setWaiting]=useState<ServiceWorker|null>(null);
 const [install,setInstall]=useState<InstallPrompt|null>(null),[installed,setInstalled]=useState(()=>window.matchMedia('(display-mode: standalone)').matches),[installError,setInstallError]=useState(false);
 const reloadRequested=useRef(false);
 useEffect(()=>{
  const connection=()=>setOnline(navigator.onLine);
  const prompt=(e:Event)=>{e.preventDefault();setInstall(e as InstallPrompt);};
  const done=()=>{setInstalled(true);setInstall(null);};
  window.addEventListener('online',connection);window.addEventListener('offline',connection);window.addEventListener('beforeinstallprompt',prompt);window.addEventListener('appinstalled',done);
  return()=>{window.removeEventListener('online',connection);window.removeEventListener('offline',connection);window.removeEventListener('beforeinstallprompt',prompt);window.removeEventListener('appinstalled',done);};
 },[]);
 useEffect(()=>{
  if(!import.meta.env.PROD||!('serviceWorker' in navigator)||!window.isSecureContext){setStatus('unavailable');return;}
  let cancelled=false;const cleanups:(()=>void)[]=[];setStatus('loading');
  const changed=()=>{if(reloadRequested.current)window.location.reload();};
  navigator.serviceWorker.addEventListener('controllerchange',changed);
  navigator.serviceWorker.register(new URL('./sw.js',document.baseURI),{updateViaCache:'none'}).then(reg=>{
   if(cancelled)return;
   if(reg.active)setStatus('ready');
   if(reg.waiting)setWaiting(reg.waiting);
   const watch=()=>{
    const worker=reg.installing;if(!worker)return;
    const state=()=>{if(cancelled)return;if(worker.state==='activated')setStatus('ready');if(worker.state==='installed'&&reg.active)setWaiting(worker);if(worker.state==='redundant'&&!reg.active)setStatus('error');};
    worker.addEventListener('statechange',state);cleanups.push(()=>worker.removeEventListener('statechange',state));state();
   };
   reg.addEventListener('updatefound',watch);cleanups.push(()=>reg.removeEventListener('updatefound',watch));watch();
  }).catch(()=>{if(!cancelled)setStatus('error');});
  return()=>{cancelled=true;cleanups.forEach(fn=>fn());navigator.serviceWorker.removeEventListener('controllerchange',changed);};
 },[attempt]);
 const installApp=async()=>{if(!install)return;try{setInstallError(false);await install.prompt();const choice=await install.userChoice;if(choice.outcome==='accepted')setInstalled(true);setInstall(null);}catch{setInstallError(true);setInstall(null);}};
 return <section className="offline-panel" aria-label="Offline practice and installation"><div className="offline-row"><span role="status"><span className={'status-dot '+(status==='ready'?'ready':'')} aria-hidden="true"/>{status==='ready'?(online?'Ready for offline practice':'Offline · practice is available'):status==='loading'?'Preparing offline practice…':status==='error'?'Offline download failed':'Offline installation unavailable here'}</span>{status==='error'&&<button className="quiet" onClick={()=>setAttempt(n=>n+1)}>Retry download</button>}{installed?<span className="small">App installed</span>:install&&<button onClick={installApp}>Install app</button>}</div>
 {waiting&&<div className="update-notice"><p>A new version is ready. Reload when you’ve finished drawing; temporary ink will be cleared.</p><button onClick={()=>{reloadRequested.current=true;waiting.postMessage({type:'SKIP_WAITING'});}}>Update and reload</button></div>}
 <details><summary>Install & offline help</summary><p>Open this site online once and wait for “Ready for offline practice.” Lessons, guides, handwriting and exercises will then work without a connection. Source links need the internet.</p><p>On Android, use your browser menu → Install app or Add to Home screen. On iPhone or iPad, use Safari → Share → Add to Home Screen. Desktop browsers may show an install icon in the address bar.</p><p>Use the HTTPS GitHub Pages address. Clearing browser site data also removes downloaded files and your saved progress.</p>{installError&&<p role="status">The install prompt could not open. Try the browser menu.</p>}</details></section>;
}
