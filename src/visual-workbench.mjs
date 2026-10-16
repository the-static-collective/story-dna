import {makeVisualSheet,makeRenderHandoff} from './visual-continuity.mjs';
import {createSpecimenRegistry} from '../fixtures/characters.candidate.mjs';

const escapeHtml=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const asJS=x=>JSON.stringify(x).replace(/</g,'\\u003c').replace(/>/g,'\\u003e').replace(/\u2028/g,'\\u2028').replace(/\u2029/g,'\\u2029');
const styleHead='eba5b6f0b056330b63e82b95020b2656befc264a';
const STYLES=[
 'RENJI_JP_RELAY_COLOR_001','RENJI_MONO_SOURCE_STACK_001'
].map(stackId=>({
 stackId, ownerRepository:'the-static-collective/lemonPRESS',
 sourceHeadSha:styleHead,
 referencePath:'works/style-stacks/'+stackId+'/stack.json',purpose:'style-only'
}));

/** Render a self-contained, local-file-only image comparison tool; no remote model call. */
export function createVisualWorkbench({characterName='Renji'}={}){
  const registry=createSpecimenRegistry();
  const character=registry.characters.find(c=>c.displayName.toLowerCase()===characterName.toLowerCase());
  if(!character)throw new TypeError('Unknown character name');
  if(character.source.visibility!=='public')throw new TypeError('Nonpublic character cannot enter public proof');
  const sheet=makeVisualSheet(character,{notes:[
    'Source is a fictional proposal; actual source image likeness is not verified.',
    'A locally selected reference file is only operator-declared; the app cannot authenticate authorship or rights.'
  ]});
  const handoff=makeRenderHandoff(sheet,{
    style:STYLES[0],variantName:'experimental-style-relay',
    brief:'Explore an alternate manga style without inventing the identity features not established by source materials.'
  });
  const payload={sheet,characterName:character.displayName,styles:STYLES,handoff};
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="theme-color" content="#171a16"><title>Character Mirror 004 · ${escapeHtml(character.displayName)}</title>
<style>
:root{color-scheme:dark;--bg:#121610;--panel:#21281e;--line:#637155;--bright:#d1e698;--warm:#f6bc8d;--soft:#e7e5d9;--dim:#b5c1aa}*{box-sizing:border-box}
body{margin:0;background:var(--bg);color:var(--soft);font:16px/1.4 system-ui,-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif}
header{padding:2.5rem max(1rem,calc((100vw - 1050px)/2));border-bottom:1px solid #728d5c;background:radial-gradient(circle at 80% 0%,#53613b,transparent 40%),#181f16}
.eyebrow,.smallcap{font:700 .7rem/1.4 ui-monospace,monospace;letter-spacing:.13em;color:var(--bright)}
h1{font:clamp(2.7rem,8vw,5.6rem)/.95 Georgia,serif;letter-spacing:-.06em;margin:.5rem 0}
.subtitle{max-width:750px;color:#cdd9c3;font-size:1.1rem}.badge{display:inline-flex;padding:.32rem .6rem;border:1px solid #bd985e;background:#4a381d;color:#fde0a2;font:700 .68rem ui-monospace,monospace}
main{max-width:1100px;margin:0 auto;padding:1rem 1rem 3rem}.bar{display:flex;gap:1rem;align-items:center;flex-wrap:wrap;padding:.6rem 0 1rem}
.panel{padding:1rem;background:var(--panel);border:1px solid var(--line);margin:.8rem 0}.panel h2{font:1.8rem Georgia,serif;margin:.3rem 0 .9rem}
.grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:1rem}
label{display:block;font:700 .75rem ui-monospace,monospace;color:var(--bright);margin:.4rem 0}
input,select,textarea,button{font:inherit}input[type=file],input[type=text],select,textarea{width:100%;background:#141a12;color:var(--soft);border:1px solid #74876b;padding:.65rem;max-width:100%}
textarea{resize:vertical;min-height:72px}button{cursor:pointer;padding:.8rem 1.1rem;color:#10150d;background:var(--bright);border:0;font-weight:700}
button.secondary{color:var(--bright);background:#263225;border:1px solid var(--line)}button:focus-visible,input:focus-visible,select:focus-visible,textarea:focus-visible{outline:2px solid #ffcf76;outline-offset:2px}
.preview{display:block;background:#0b0e0b;position:relative;height:clamp(220px,39vw,385px);border:1px solid #788473;overflow:hidden}
.preview img{position:absolute;width:100%;height:100%;object-fit:contain;top:0;left:0;display:none}
.preview img.visible{display:block}.placeholder{position:absolute;inset:0;display:grid;place-content:center;text-align:center;color:#89957e;padding:1rem}
.legend{font: .72rem ui-monospace,monospace;color:#c6d0b9;margin:.4rem 0}
small{color:var(--dim)}.info{word-break:break-word;min-height:3rem;font:.69rem/1.35 ui-monospace,monospace;color:#d0d2c4;margin:.5rem 0}
.compare{position:relative;height:clamp(240px,44vw,440px);max-width:820px;background:#0b0e0b;border:1px solid var(--line);margin:auto}
.compare img{position:absolute;inset:0;width:100%;height:100%;object-fit:contain}
.row{display:grid;grid-template-columns:minmax(170px,1.5fr) minmax(160px,1fr) minmax(150px,1.2fr);gap:.6rem;align-items:center;border-top:1px solid #46513f;padding:.65rem 0}
.row .anchor{font-size:.86rem}.row input{padding:.45rem;font-size:.8rem}.row select{padding:.5rem;font-size:.8rem}.tag{padding:.22rem .45rem;border:1px solid #60784e;color:#e0eeb7;font:.68rem ui-monospace,monospace}
.tags{display:flex;flex-wrap:wrap;gap:.3rem}.notes{color:var(--dim);font-size:.8rem}
.status{color:var(--warm);font:.78rem ui-monospace,monospace;white-space:pre-wrap}.subsection{color:#f4cead;font:bold .7rem ui-monospace,monospace;letter-spacing:.1em;margin-top:1.2rem}
footer{border-top:1px solid var(--line);color:var(--dim);padding:1.5rem 0;font-size:.85rem}a{color:var(--bright)}
@media(max-width:700px){.grid{grid-template-columns:1fr}.row{grid-template-columns:1fr}.panel{padding:.85rem}.bar{align-items:stretch}.bar>*{flex:1}}
</style></head>
<body><header>
<div class="eyebrow">THE STATIC COLLECTIVE · STORY DNA · CHARACTER MIRROR 004</div>
<h1>${escapeHtml(character.displayName)}<span style="color:#cbdf7b">.</span></h1>
<p class="subtitle">Keep the character. Change the drawing. Compare what survived without confusing a style experiment with an official likeness.</p>
<span class="badge">VISUAL IDENTITY UNVERIFIED · SOURCE IS A FICTIONAL PROPOSAL</span>
</header><main>
<div class="bar"><span class="tag">LOCAL ONLY — NO UPLOAD</span><span class="tag">SOURCE STYLE: lemonPRESS #45</span><span class="tag">NO CANON ADMISSION</span></div>
<section class="panel"><div class="smallcap">01 / Portrait DNA</div><h2>What stays true?</h2>
<p>${escapeHtml(sheet.silhouette)}</p>
<p class="notes"><strong>Originating world:</strong> ${escapeHtml(sheet.world)}. Identity is anchored to a source profile, not the output image.</p>
<div class="subsection">Declared visual anchors</div><div class="tags">${sheet.mustKeep.map(x=>`<span class="tag">${escapeHtml(x)}</span>`).join('')||'<span class="notes">No visual anchors declared.</span>'}</div>
<div class="subsection">Do not invent</div><div class="tags">${sheet.mustAvoid.map(x=>`<span class="tag">${escapeHtml(x)}</span>`).join('')||'<span class="notes">No extra constraints recorded.</span>'}</div>
<p class="notes"><strong>Source status:</strong> ${escapeHtml(sheet.referenceStatus)}. No actual official reference image is supplied with this proof.</p>
</section>
<section class="panel"><div class="smallcap">02 / Local images</div><h2>Place the two images beside each other</h2>
<div class="grid">
<div><label for="sourceInput">Source / reference image — optional</label><input id="sourceInput" type="file" accept="image/png,image/jpeg,image/webp"><p class="notes">Only use art you are entitled to review. Selecting a file does not authenticate its source or rights.</p>
<div class="preview"><img id="sourceImg" alt="Locally selected source reference" /><div class="placeholder" id="sourceBlank">No verified reference supplied</div></div><div class="info" id="sourceInfo">Source art: unknown</div></div>
<div><label for="candidateInput">Candidate rendition — required</label><input id="candidateInput" type="file" accept="image/png,image/jpeg,image/webp">
<p class="notes">A new image is always a separate candidate, regardless of apparent similarity.</p>
<div class="preview"><img id="candidateImg" alt="Locally selected proposed depiction" /><div class="placeholder" id="candidateBlank">Choose your rendered candidate</div></div><div class="info" id="candidateInfo">Candidate: none</div></div>
</div>
</section>
<section class="panel"><div class="smallcap">03 / The comparison table</div><h2>Onion skin</h2>
<div class="compare" aria-label="Visual overlay of locally selected images">
<img id="under" alt="Underlying reference image"><img id="over" alt="Candidate image transparency overlay">
<div class="placeholder" id="compareBlank">Select two images to preview the overlay.<br>Nothing is uploaded.</div>
</div><label for="blend">Candidate opacity</label><input id="blend" type="range" min="0" max="100" value="50" style="width:100%"><p class="notes">Opacity is an observation aid, not an identity score or an automated match.</p>
</section>
<section class="panel"><div class="smallcap">04 / Style passage</div><h2>Keep style separate from identity</h2>
<div class="grid">
<div><label for="style">lemonPRESS declared style stack</label><select id="style">${STYLES.map((s,i)=>`<option value="${i}">${escapeHtml(s.stackId)}</option>`).join('')}</select>
<p class="notes">References the unmerged lemonPRESS Manga Style Profile proposal, bound to its exact GitHub commit. No renderer is connected.</p></div>
<div><label for="artist">Origin of candidate image</label><select id="artist"><option value="unknown">Unknown or unstated</option><option value="human-render">Human rendered</option><option value="model-render">Model rendered</option></select></div>
</div>
<label for="variantName">Variant name</label><input id="variantName" type="text" maxlength="120" value="color-relay study">
<label for="renderNote">What changed? What was intentionally preserved?</label><textarea id="renderNote" maxlength="1000" placeholder="Working notes; a style choice never certifies the character."></textarea>
</section>
<section class="panel"><div class="smallcap">05 / The human witness</div><h2>What do you actually see?</h2>
<p class="notes">For each declared anchor and narrative invariant, explicitly choose whether it looks consistent, different, or cannot be observed. These are human observations—not computer vision judgments.</p>
<div id="anchors"></div>
<label for="reviewer">Reviewer name / label (not authenticated)</label><input id="reviewer" type="text" maxlength="180" placeholder="Human reviewer" />
<label for="reviewNote">Other uncertainty / limitations</label><textarea id="reviewNote" maxlength="1000" placeholder="Anything you cannot verify; missing rights, source image, context, etc."></textarea>
<div class="bar"><button id="download" type="button">Export comparison draft JSON</button><button id="clear" class="secondary" type="button">Clear images</button></div>
<div id="result" class="status" role="status" aria-live="polite">Nothing has been reviewed or exported.</div>
<p class="notes">The exported packet contains names, digests and your stated observations, not the image files. It has <strong>no authenticated signature or publication power</strong>; run the repository CLI to generate a validated held receipt.</p>
</section>
<footer>Source profile ${escapeHtml(sheet.profileId)} · Visual sheet ${escapeHtml(sheet.sheetId)} · This local comparator performs no external requests, model calls, render operations, canonical admissions or remote writes. <a href="https://github.com/the-static-collective/story-dna">story-dna</a>.</footer>
</main>
<script>
'use strict';
const DATA=${asJS(payload)};
const $=id=>document.getElementById(id);
const state={source:null,candidate:null,urls:{source:null,candidate:null}};
const mediaAllowed=new Set(['image/png','image/jpeg','image/webp']);
const readFile=async(file,kind)=>{
 if(!file){clearOne(kind);return}
 if(!mediaAllowed.has(file.type))throw Error('Only PNG/JPEG/WebP image files are supported (correct MIME required).');
 const bytes=await file.arrayBuffer();
 if(!crypto?.subtle?.digest)throw Error('SHA-256 is unavailable in this browser context; this comparator refuses unverifiable bytes.');
 const digest=await crypto.subtle.digest('SHA-256',bytes);
 const hex=[...new Uint8Array(digest)].map(b=>b.toString(16).padStart(2,'0')).join('');
 const image={filename:file.name,sha256:'sha256:'+hex,bytes:file.size,mediaType:file.type};
 clearOne(kind);
 state[kind]=image;
 const url=URL.createObjectURL(file);
 state.urls[kind]=url;
 const el=$(kind+'Img');el.src=url;el.classList.add('visible');$(kind+'Blank').hidden=true;
 $(kind+'Info').textContent=file.name+' · '+file.size+' bytes · '+image.sha256;
 updateOverlay();
};
function clearOne(kind){
 if(state.urls[kind])URL.revokeObjectURL(state.urls[kind]);
 state.urls[kind]=null;state[kind]=null;
 const img=$(kind+'Img');img.removeAttribute('src');img.classList.remove('visible');
 $(kind+'Blank').hidden=false;$(kind+'Info').textContent=kind==='source'?'Source art: unknown':'Candidate: none';
 updateOverlay();
}
function updateOverlay(){
 const ok=state.source&&state.candidate;
 $('compareBlank').hidden=!!ok;
 for(const [id,kind] of [['under','source'],['over','candidate']]){
  const node=$(id);node.style.display=ok?'block':'none';
  if(ok)node.src=state.urls[kind];else node.removeAttribute('src');
 }
 $('over').style.opacity=String(Number($('blend').value)/100);
}
for(const kind of ['source','candidate']){
 $(kind+'Input').addEventListener('change',async event=>{
  try{await readFile(event.target.files?.[0],kind);$('result').textContent='Local image read; no data transferred.'}
  catch(error){clearOne(kind);$('result').textContent=error.message;}
 });
}
$('blend').addEventListener('input',updateOverlay);
$('clear').addEventListener('click',()=>{
 $('sourceInput').value='';$('candidateInput').value='';clearOne('source');clearOne('candidate');
 $('result').textContent='Local image previews cleared; source profile unchanged.';
});
const escapeText=x=>String(x).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const group=(heading,labels,key)=>{
 const h=document.createElement('h3');h.textContent=heading;$('anchors').append(h);
 labels.forEach((label,index)=>{
  const row=document.createElement('div');row.className='row';
  const a=document.createElement('div');a.className='anchor';a.textContent=label;
  const sel=document.createElement('select');sel.dataset.category=key;sel.dataset.index=String(index);
  [['','Choose what you can observe'],['observed-consistent','Looks consistent'],['observed-different','Looks different'],['not-observable','Cannot determine']].forEach(([v,t])=>{const opt=document.createElement('option');opt.value=v;opt.textContent=t;sel.append(opt)});
  const note=document.createElement('input');note.type='text';note.maxLength=500;note.placeholder='Specific observation / uncertainty';note.dataset.category=key;note.dataset.index=String(index);
  row.append(a,sel,note);$('anchors').append(row);
 });
};
group('Visual anchors',DATA.sheet.mustKeep,'visual');
group('Narrative and behavioral invariants',DATA.sheet.invariants,'narrative');
function observations(category,labels){
 const result={};
 for(let i=0;i<labels.length;i++){
  const sel=document.querySelector('select[data-category="'+category+'"][data-index="'+i+'"]');
  const note=document.querySelector('input[data-category="'+category+'"][data-index="'+i+'"]');
  if(!sel.value)throw Error('Review all '+category+' anchors before exporting a human assessment.');
  if(!note.value.trim())throw Error('Give an observation or reason for every '+category+' finding.');
  result[labels[i]]={finding:sel.value,note:note.value.trim()};
 }
 return result;
}
function downloadJson(fileName,data){
 const blob=new Blob([JSON.stringify(data,null,2)+'\n'],{type:'application/json'});
 const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=fileName;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
$('download').addEventListener('click',()=>{
 try{
  if(!state.candidate)throw Error('Choose a candidate image first.');
  const reviewer=$('reviewer').value.trim(),comments=$('reviewNote').value.trim();
  if(!reviewer)throw Error('Enter a human reviewer label.');
  if(!comments)throw Error('Record a limitation, uncertainty or review comment.');
  const anchors=observations('visual',DATA.sheet.mustKeep), invariants=observations('narrative',DATA.sheet.invariants);
  const source=state.source?{...state.source,label:'Operator-selected local reference, not authenticated',sourceLocator:'operator-local:comparison-input',note:'User selected a local file; no provenance or license independently verified.'}:null;
  const draft={
   schema:'story-dna/visual-review-draft/v0',posture:'HOLD',authenticated:false,
   characterId:DATA.sheet.characterId,profileId:DATA.sheet.profileId,
   sourceProfile:DATA.sheet.source,
   selectedReference:source,
   candidateMedia:state.candidate,
   style:DATA.styles[Number($('style').value)],
   rendererOrigin:$('artist').value,variantName:$('variantName').value.trim()||'unnamed-variant',
   renderNote:$('renderNote').value.trim()||'No generation information supplied',
   reviewer:{kind:'human',name:reviewer},checkedAnchors:anchors,checkedInvariants:invariants,
   uncertainties:['Reference, authorship and rights are operator-declared; this file does not authenticate them.'],
   comments:comments,visualSheetTemplateId:DATA.sheet.sheetId,
   originalWorldChanged:false,canonicalAdmission:false,publication:false,
   instruction:'Validate with Story DNA CLI; this browser output is an unsigned proposed review, not an event or publication.'
  };
  downloadJson('story-dna-'+DATA.characterName.toLowerCase().replace(/[^a-z0-9-]/g,'-')+'-visual-review-draft.json',draft);
  $('result').textContent='Downloaded unsigned HOLD draft; artwork files remain on this device.';
 }catch(e){$('result').textContent='EXPORT REFUSED: '+e.message;}
});
</script></body></html>`;
}
