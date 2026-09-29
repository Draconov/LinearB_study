import {useState} from 'react';
import {signById} from '../content/signs';
import {commodities,encodeNumber,numberSource,objectSource,tabletPassages,type TabletPassage} from '../content/tablets';
function Question({prompt,options,answer,explanation}:{prompt:string;options:string[];answer:string;explanation:string}){
 const [chosen,setChosen]=useState<string|null>(null);
 return <div className="tablet-question"><h3>{prompt}</h3><div className="actions">{options.map(o=><button key={o} disabled={chosen!==null} className={chosen!==null&&o===answer?'answer correct':chosen===o?'answer incorrect':''} onClick={()=>setChosen(o)}>{o}</button>)}</div>{chosen!==null&&<div role="status" className={'feedback'+(chosen===answer?' positive':'')}><strong>{chosen===answer?'That’s right.':'Take another look.'}</strong> {explanation}{chosen!==answer&&<button className="quiet" onClick={()=>setChosen(null)}>Try again</button>}</div>}</div>;
}
function Numbers(){
 const [value,setValue]=useState('1358'),[round,setRound]=useState(0);
 const n=Number(value),valid=/^\d+$/.test(value)&&Number.isInteger(n)&&n>=1&&n<=9999;
 const examples=[{n:23,options:['23','32','203']},{n:57,options:['75','57','507']},{n:106,options:['16','160','106']},{n:1210,options:['1210','1201','210']}];const q=examples[round%examples.length];
 return <><h2>Numbers that add up.</h2><p>Read each group, then add the values. This explorer uses grouped Aegean numerals for ones, tens, hundreds and thousands.</p><div className="number-reference">{[1,10,100,1000].map(v=><div key={v}><span className="sign">{encodeNumber(v)}</span><strong>{v}</strong></div>)}</div>
 <label className="number-input">Explore a number (1–9999)<input type="number" min="1" max="9999" step="1" value={value} onChange={e=>setValue(e.target.value)}/></label>
 {valid?<div className="number-example"><span className="sign" aria-label={'Aegean numeral for '+n}>{encodeNumber(n)}</span><p>{[1000,100,10,1].map(place=>Math.floor(n/place)%10*place).filter(Boolean).join(' + ')} = {n}</p></div>:<p role="status">Enter a whole number from 1 to 9999.</p>}
 <p className="small muted">Original teaching examples, not tablet transcriptions. This tool has no zero or fractions.</p><div className="number-challenge"><p className="eyebrow">TRY READING THIS</p><span className="sign" aria-label="Number to read">{encodeNumber(q.n)}</span><Question key={round} prompt="What is the total?" options={q.options} answer={String(q.n)} explanation={'This numeral represents '+q.n+'.'}/><button className="quiet" onClick={()=>setRound(r=>r+1)}>Next number →</button></div><a className="source-link" href={numberSource} target="_blank" rel="noreferrer">Unicode · Aegean Numbers ↗</a></>;
}
function Objects(){
 const [round,setRound]=useState(0);const target=commodities[round%commodities.length];
 return <><h2>Signs for things.</h2><p>These signs identify goods or objects. Their labels describe what they represent; they aren’t syllable-by-syllable readings.</p><div className="object-grid">{commodities.map(c=><article key={c.id}><span className="sign">{c.glyph}</span><h3>{c.name}</h3><span className="eyebrow">{c.number}</span><p className="small muted">{c.note}</p></article>)}</div>
 <details className="object-quiz"><summary>Practise object signs</summary><span className="sign object-prompt" aria-label="Object sign to identify">{target.glyph}</span><Question key={round} prompt="What does this sign represent?" options={commodities.map(c=>c.name)} answer={target.name} explanation={target.number+' is conventionally labelled '+target.name.toLowerCase()+'.'}/><button className="quiet" onClick={()=>setRound(r=>r+1)}>Next sign →</button></details><a className="source-link" href={objectSource} target="_blank" rel="noreferrer">Unicode · Linear B Ideograms ↗</a></>;
}
export function TabletPassageView({passage:p,onComplete}:{passage:TabletPassage;onComplete?:()=>void}){
 const [stage,setStage]=useState(0);
 return <><p className="eyebrow">{p.location}</p><h2>{p.title}</h2><p className="muted">{p.description}</p><p className="small">{stage===0?'Look for words, object signs and numbers.':stage===1?'Now connect the written readings with their meanings.':'Use the excerpt to answer the question below.'}</p><div className="tablet-strip">{p.tokens.map((token,i)=><div key={i}><span className="sign" aria-label={stage?token.reading:'Group '+(i+1)}>{token.glyph??token.signIds?.map(id=>signById[id].glyph).join('')}</span>{stage>=1&&<span className="token-reading">{token.reading}</span>}{stage>=2&&<span className="token-meaning">{token.meaning}</span>}</div>)}</div>
 {stage<2?<button className="primary" onClick={()=>setStage(n=>n+1)}>{stage===0?'1 · Reveal readings':'2 · Reveal meanings'}</button>:<div className="reading-reveal"><p className="meaning">{p.interpretation}</p><p>{p.context}</p><Question prompt={p.question} options={p.options} answer={p.answer} explanation={p.explanation}/><button className="quiet" onClick={()=>setStage(0)}>Hide readings and start again</button>{onComplete&&<button className="primary" onClick={onComplete}>Complete lesson →</button>}</div>}
 <p className="small muted excerpt-note">Typeset excerpt, not a photograph or a facsimile of the original handwriting. Spacing is adapted for learning.</p><a className="source-link" href={p.sourceUrl} target="_blank" rel="noreferrer">{p.sourceTitle} ↗</a></>;
}
export default function TabletExplorer(){
 const [section,setSection]=useState('numbers');
 return <><div className="reading-tabs explorer-tabs" aria-label="Tablet explorer selection">{[{id:'numbers',title:'Numbers'},{id:'objects',title:'Object signs'},...tabletPassages.map(p=>({id:p.id,title:p.location.split(' ·')[0]}))].map(item=><button key={item.id} aria-pressed={section===item.id} onClick={()=>setSection(item.id)}>{item.title}</button>)}</div><section className="panel reading-panel">{section==='numbers'?<Numbers/>:section==='objects'?<Objects/>:<TabletPassageView key={section} passage={tabletPassages.find(p=>p.id===section)!}/>}</section></>;
}
