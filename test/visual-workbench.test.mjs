import test from 'node:test';
import assert from 'node:assert/strict';
import {Script} from 'node:vm';
import {mkdtempSync,readFileSync,writeFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {spawnSync} from 'node:child_process';
import {createSpecimenRegistry} from '../fixtures/characters.candidate.mjs';
import {makeVisualSheet,hexSha256} from '../src/visual-continuity.mjs';
import {createVisualWorkbench} from '../src/visual-workbench.mjs';

const profile=()=>createSpecimenRegistry().characters.find(c=>c.displayName==='Renji');
const render=()=>createVisualWorkbench({characterName:'Renji'});
const cli=(...args)=>spawnSync(process.execPath,[new URL('../cli/visual.mjs',import.meta.url).pathname,...args],{encoding:'utf8'});
const notes=['Source is a fictional proposal; actual source image likeness is not verified.',
 'A locally selected reference file is only operator-declared; the app cannot authenticate authorship or rights.'];
const checks=labels=>Object.fromEntries(labels.map(anchor=>[anchor,{finding:'not-observable',note:'Not enough evidence to verify from current materials.'}]));

test('mobile offline Workbench contains parseable script, opt-in images, local hash, comparison, and disclaimer',()=>{
  const html=render(),again=render();assert.equal(html,again);
  assert.match(html,/<meta name="viewport"/);
  assert.match(html,/Character Mirror 004/);
  assert.match(html,/VISUAL IDENTITY UNVERIFIED/);
  assert.match(html,/crypto\.subtle\.digest\('SHA-256'/);
  assert.match(html,/URL\.createObjectURL/);
  assert.match(html,/URL\.revokeObjectURL/);
  assert.match(html,/story-dna\/visual-review-draft\/v0/);
  assert.match(html,/NO CANON ADMISSION/);
  assert.doesNotMatch(html,/\bfetch\s*\(/);
  assert.doesNotMatch(html,/XMLHttpRequest|sendBeacon|<script\s+src=/i);
  const match=html.match(/<script>([\s\S]*?)<\/script>/);
  assert.ok(match);assert.doesNotThrow(()=>new Script(match[1]));
});

test('Workbench refuses unknown name, preserves exact source character ID',()=>{
  assert.throws(()=>createVisualWorkbench({characterName:'Not a person'}),/Unknown character/);
  const html=createVisualWorkbench({characterName:'Neri Vale'});
  assert.match(html,/Neri Vale/);
  assert.match(html,/UNFINISHED BUSINESS/);
});

test('CLI generates safe offline proof, refuses clobber, and source-bound style handoff',()=>{
  const out=cli('sheet','Renji');assert.equal(out.status,0,out.stderr);
  const sheet=JSON.parse(out.stdout);assert.equal(sheet.references.length,0);
  const handoff=cli('handoff','Renji');
  assert.equal(handoff.status,0,handoff.stderr);const packet=JSON.parse(handoff.stdout);
  assert.equal(packet.noVerifiedImageReference,true);
  assert.equal(packet.style.ownerRepository,'the-static-collective/lemonPRESS');
  const dir=mkdtempSync(join(tmpdir(),'char-mirror-'));
  try{
    const file=join(dir,'mirror.html');
    const first=cli('workbench','Renji',file);assert.equal(first.status,0,first.stderr);
    assert.match(readFileSync(file,'utf8'),/Onion skin/);
    const second=cli('workbench','Renji',file);assert.notEqual(second.status,0);
  }finally{rmSync(dir,{recursive:true,force:true})}
});

test('unsigned browser-like draft becomes HOLD packet, no claim of verified image source',()=>{
  const c=profile(),sheet=makeVisualSheet(c,{notes});
  const data=Buffer.from('SYNTHETIC-PIXEL-DATA-NOT-AN-IMAGE');
  const draft={
    schema:'story-dna/visual-review-draft/v0',posture:'HOLD',authenticated:false,
    characterId:c.characterId,profileId:c.profileId,sourceProfile:c.source,
    selectedReference:null,
    candidateMedia:{sha256:hexSha256(data),bytes:data.length,mediaType:'image/png',filename:'synthetic.png'},
    style:{
      stackId:'RENJI_JP_RELAY_COLOR_001',ownerRepository:'the-static-collective/lemonPRESS',
      sourceHeadSha:'eba5b6f0b056330b63e82b95020b2656befc264a',
      referencePath:'works/style-stacks/RENJI_JP_RELAY_COLOR_001/stack.json',purpose:'style-only'
    },
    rendererOrigin:'model-render',variantName:'trial',renderNote:'synthetic test only',
    reviewer:{kind:'human',name:'Unverified Test Observer'},
    checkedAnchors:checks(sheet.mustKeep),checkedInvariants:checks(sheet.invariants),
    uncertainties:['No authenticated visual reference'],comments:'Source image identity cannot be assessed.',
    visualSheetTemplateId:sheet.sheetId,originalWorldChanged:false,canonicalAdmission:false,publication:false,
    instruction:'Unsigned exploratory draft'
  };
  const dir=mkdtempSync(join(tmpdir(),'mirror-review-'));
  try {
    const path=join(dir,'draft.json');
    writeFileSync(path,JSON.stringify(draft));
    const first=cli('review-draft',path);
    assert.equal(first.status,0,first.stderr);
    const packet=JSON.parse(first.stdout);
    assert.equal(packet.posture,'HOLD');assert.equal(packet.review.canon,'NONE');
    assert.equal(packet.review.assessment,'HOLD-INSUFFICIENT-EVIDENCE');
    assert.equal(packet.review.noVerifiedReference,true);assert.equal(packet.permissionVerified,false);
    const bad=structuredClone(draft);bad.canonicalAdmission=true;
    writeFileSync(path,JSON.stringify(bad));const fail=cli('review-draft',path);
    assert.notEqual(fail.status,0);assert.match(fail.stderr,/authority claim/);
    const tampered=structuredClone(draft);tampered.style.sourceHeadSha='1'.repeat(40);
    writeFileSync(path,JSON.stringify(tampered));const wrong=cli('review-draft',path);
    assert.notEqual(wrong.status,0);assert.match(wrong.stderr,/Style binding/);
  }finally{rmSync(dir,{recursive:true,force:true})}
});
