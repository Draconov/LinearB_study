import {useMemo,useRef,useState} from 'react';
import type {RefObject} from 'react';
import {signs} from '../content/signs';
import {additional,objects,numerals,separators,type KeySign} from '../compose/repertoire';
import {convert,decode,editText,knownWords} from '../compose/conversion';
import '../compose/compose.css';
const LIMIT=4000,DRAFT_LIMIT=LIMIT*4;
type Mode='convert'|'keyboard'|'decode';
function CopyButton({value,field,label}:{value:string;field:RefObject<HTMLTextAreaElement|null>;label:string}){
 const [copied,setCopied]=useState<string|null>(null),[failed,setFailed]=useState(false);
 return <><button disabled={!value} onClick={async()=>{try{if(!navigator.clipboard?.writeText)throw new Error('Clipboard unavailable');await navigator.clipboard.writeText(value);setCopied(value);setFailed(false);}catch{setFailed(true);field.current?.focus();field.current?.select();}}}>{copied===value&&value?'Copied ✓':label}</button>{failed&&<span className="small" role="status">Text selected. Use your device’s Copy command.</span>}</>;
}
function Output({value,label,glyphs=false}:{value:string;label:string;glyphs?:boolean}){
 const field=useRef<HTMLTextAreaElement>(null);
 return <section className="compose-output"><div className="compose-section-heading"><label htmlFor={glyphs?'compose-result-signs':'compose-result-reading'}>{label}</label><CopyButton value={value} field={field} label={glyphs?'Copy signs':'Copy reading'}/></div><textarea id={glyphs?'compose-result-signs':'compose-result-reading'} ref={field} readOnly value={value} rows={glyphs?3:2} className={glyphs?'compose-glyphs':''} placeholder="Your result appears here" spellCheck={false}/></section>;
}
export default function ComposeView(){
 const [mode,setMode]=useState<Mode>('convert'),[method,setMethod]=useState<'approximate'|'exact'>('approximate');
 const [source,setSource]=useState(''),[draft,setDraft]=useState(''),[group,setGroup]=useState('core'),[search,setSearch]=useState(''),[notice,setNotice]=useState('');
 const editor=useRef<HTMLTextAreaElement>(null),selection=useRef({start:0,end:0});
 const conversion=useMemo(()=>convert(source,method),[source,method]);
 const result=useMemo(()=>decode(mode==='convert'?conversion.text:draft),[mode,conversion.text,draft]);
 const visibleKeys=useMemo(()=>{
  const keys:KeySign[]=group==='core'?signs:group==='additional'?additional:[...objects,...numerals,...separators];
  const query=search.trim().toLowerCase();return keys.filter(s=>!query||`${s.id} ${s.number}`.toLowerCase().includes(query));
 },[group,search]);
 const insert=(value:string|null)=>{
  const next=editText(draft,selection.current.start,selection.current.end,value);
  if(next.text.length>DRAFT_LIMIT&&next.text.length>=draft.length){setNotice('The draft is full. Copy it before starting another.');return;}
  setDraft(next.text);selection.current={start:next.cursor,end:next.cursor};setNotice('');
  requestAnimationFrame(()=>{editor.current?.focus({preventScroll:true});editor.current?.setSelectionRange(next.cursor,next.cursor);});
 };
 const loadDraft=(value:string,nextMode:Mode='keyboard')=>{setDraft(value);setMode(nextMode);selection.current={start:value.length,end:value.length};setNotice('');};
 const notes=mode==='convert'?conversion.notes:result.notes;
 return <div className="compose-page"><header className="page-header"><p className="eyebrow">THE SCRIBE’S DESK / COMPOSE</p><h1>Words into signs.</h1><p className="muted">Convert a word, compose with the keyboard, or read a sign sequence.</p></header>
 <div className="segmented compose-tabs" role="group" aria-label="Compose mode">{(['convert','keyboard','decode'] as Mode[]).map(item=><button key={item} aria-pressed={mode===item} onClick={()=>{setMode(item);setNotice('');}}>{item[0].toUpperCase()+item.slice(1)}</button>)}</div>
 <div className="compose-layout"><div className="compose-main">
 {mode==='convert'?<>
  <div className="compose-section-heading"><label htmlFor="compose-source">{method==='exact'?'Syllable labels':'Word or name in Latin letters'}</label><select aria-label="Conversion method" value={method} onChange={e=>setMethod(e.target.value as typeof method)}><option value="approximate">Approximate spelling</option><option value="exact">Exact syllables</option></select></div>
  <textarea id="compose-source" rows={3} value={source} maxLength={LIMIT} onChange={e=>setSource(e.target.value)} placeholder={method==='exact'?'ko-no-so a-mi-ni-so':'Try Knossos, Amnisos, or your name'} spellCheck={false} autoCapitalize="off" aria-describedby="conversion-help"/>
  <p id="conversion-help" className="small muted">{method==='exact'?'Join syllables with hyphens; separate words with spaces. Additional Unicode labels such as a2 and *018 also work.':'Uses the letters you enter, not automatic English pronunciation. Use exact syllables to control the spelling. This does not translate modern words into ancient Greek.'}</p>
  <div className="compose-examples"><span className="small muted">Try</span>{['Knossos','Amnisos','ti-ri-po-de'].map(word=><button className="quiet" key={word} onClick={()=>{setSource(method==='exact'?word==='Knossos'?'ko-no-so':word==='Amnisos'?'a-mi-ni-so':word:word);}}>{word}</button>)}</div>
  <Output label="Linear B" value={conversion.text} glyphs/>
  <button className="quiet" disabled={!conversion.text} onClick={()=>loadDraft(conversion.text)}>Edit with the sign keyboard →</button>
 </>:<>
  <div className="compose-section-heading"><label htmlFor="compose-draft">{mode==='decode'?'Paste Linear B to read':'Your Linear B text'}</label><CopyButton value={draft} field={editor} label="Copy signs"/></div>
  <textarea id="compose-draft" inputMode={mode==='keyboard'?'none':'text'} className="compose-glyphs" ref={editor} value={draft} maxLength={DRAFT_LIMIT} rows={3} onChange={e=>{setDraft(e.target.value);selection.current={start:e.target.selectionStart,end:e.target.selectionEnd};setNotice('');}} onSelect={e=>{selection.current={start:e.currentTarget.selectionStart,end:e.currentTarget.selectionEnd};}} placeholder="𐀒𐀜𐀰" spellCheck={false} autoCapitalize="off" aria-describedby="compose-draft-help"/>
  <div className="compose-editor-tools"><div className="actions"><button onClick={()=>insert(' ')}>Space</button><button onClick={()=>insert('\n')}>New line</button><button onClick={()=>insert(null)} disabled={!draft}>⌫ Backspace</button><button className="quiet" onClick={()=>{loadDraft('',mode);}}>Clear</button></div><span className="small muted">{[...draft].length} characters</span></div>
  <p id="compose-draft-help" className="small muted">{mode==='keyboard'?'Choose a sign to insert it at the cursor. Select text to replace it.':'Spaces or the Aegean divider separate words. Readings follow the written signs; meanings below are dictionary matches.'}</p>
  {notice&&<p role="status" className="input-notice">{notice}</p>}
 </>}
 <Output value={result.text} label="Transliteration"/>
 {notes.length>0&&<details className="compose-notes" open><summary>{mode==='convert'?'Spelling notes':'Reading notes'} · {notes.length}</summary><ul>{notes.map(note=><li key={note}>{note}</li>)}</ul></details>}
 {mode==='keyboard'&&<section className="compose-keyboard" aria-label="Linear B keyboard"><div className="compose-section-heading"><h2>The sign keyboard.</h2><label className="compose-search">Find a sign<input value={search} onChange={e=>setSearch(e.target.value)} placeholder="ka, B077…" type="search"/></label></div>
  <div className="segmented keyboard-tabs" role="group" aria-label="Keyboard group">{[['core','Core · 59'],['additional','Additional · 29'],['records','Objects & numbers']].map(([id,label])=><button key={id} aria-pressed={group===id} onClick={()=>{setGroup(id);setSearch('');}}>{label}</button>)}</div>
  <div className="compose-key-grid">{visibleKeys.map(s=><button key={s.glyph} className="compose-key" title={`${s.id}${s.number?' · '+s.number:''}`} aria-label={`Insert ${s.id}${s.number?' · '+s.number:''}`} onClick={()=>insert(s.glyph)}><span className="sign" aria-hidden="true">{s.glyph}</span><span>{s.id}</span></button>)}</div>
  {!visibleKeys.length&&<p>No signs match this search in this group.</p>}
  <p className="small muted">{group==='additional'?'Additional signs use Unicode labels. Numbered signs have no sound value supplied here. These are separate from the 59-sign beginner course.':group==='records'?'A selection of object signs, additive numerals and a word divider. Object signs identify things; they are not syllables.':'Each key inserts a Unicode character that can be copied into other apps.'}</p>
 </section>}
 {mode==='decode'&&!draft&&<div className="compose-examples"><span className="small muted">Try a known sequence</span>{knownWords.slice(0,3).map(w=><button key={w.reading} className="quiet" onClick={()=>loadDraft(w.glyphs,'decode')}>{w.reading}</button>)}</div>}
 {result.matches.length>0&&<section className="compose-meanings"><h2>Known-word matches.</h2>{result.matches.map(w=><article key={w.reading}><span className="eyebrow">{w.reading}</span><h3>{w.meaning}</h3><p>{w.context}</p><a href={w.sourceUrl} target="_blank" rel="noreferrer">Read the source ↗</a></article>)}</section>}
 {mode!=='convert'&&draft&&result.matches.length===0&&<p className="compose-no-match">No whole-word match in the small course glossary. The transliteration can still be useful; this is not evidence that the word is invalid.</p>}
 </div><aside className="compose-aside"><p className="eyebrow">READING THE RESULT</p><h2>A syllable at a time.</h2><p>Linear B writes syllables. One sequence can leave several spoken forms possible.</p><p><strong>Transliteration</strong> tells you which signs were written. <strong>Interpretation</strong> needs vocabulary and context.</p><div className="compose-aside-rule"/><p className="small">Copied signs are real Unicode text. If another app shows empty boxes, it needs a font that supports Linear B.</p><p className="small">Your text is processed here, on your device. Drafts survive menu changes. Reloading clears them, so copy anything you want to keep.</p><details><summary>Sources & spelling rules</summary><p className="small">Approximation uses simple letter substitutions, adds a following vowel to consonant clusters, and drops final consonants. These are teaching heuristics, not a full account of Mycenaean spelling.</p><a href="https://www.unicode.org/charts/PDF/U10000.pdf" target="_blank" rel="noreferrer">Unicode sign names ↗</a><a href="https://www.bsa.ac.uk/wp-content/uploads/2022/06/Worksheet_How_to_make_a_Linear_B_tablet.pdf" target="_blank" rel="noreferrer">Judson · spelling and tablets ↗</a></details></aside></div>
 </div>;
}
