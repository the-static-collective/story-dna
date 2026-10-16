import test from 'node:test';
import assert from 'node:assert/strict';
import {
  VISUAL_SHEET, VISUAL_REVIEW, makeVisualSheet,verifyVisualSheet,makeVisualAttempt,
  verifyVisualAttempt,makeVisualReview,makeRenderHandoff,hexSha256
} from '../src/visual-continuity.mjs';
import {createSpecimenRegistry} from '../fixtures/characters.candidate.mjs';
const copy=x=>structuredClone(x);
const profile=()=>createSpecimenRegistry().characters.find(c=>c.displayName==='Renji');
const style=(name='RENJI_JP_RELAY_COLOR_001')=>({
  stackId:name,ownerRepository:'the-static-collective/lemonPRESS',
  sourceHeadSha:'eba5b6f0b056330b63e82b95020b2656befc264a',
  referencePath:'works/style-stacks/'+name+'/stack.json',purpose:'style-only'
});
const media=(s='synthetic-candidate')=>({filename:'fixture.png',mediaType:'image/png',bytes:s.length,sha256:hexSha256(Buffer.from(s))});
const sheet=()=>makeVisualSheet(profile(),{notes:['Prototype has no approved visual reference pixels.']});
function checks(list,finding='not-observable'){
  return Object.fromEntries(list.map(anchor=>[anchor,{finding,note:'Operator cannot independently verify this without appropriate reference evidence.'}]));
}
const reviewer={kind:'human',name:'Demo Operator (unverified)'};
test('identity sheets preserve exact profile and do not invent image identity',()=>{
  const s=sheet();
  assert.equal(s.schema,VISUAL_SHEET); assert.equal(s.referenceStatus,'TEXT-ONLY-NO-VERIFIED-IMAGE-REFERENCE');
  assert.equal(s.references.length,0);assert.equal(s.posture,'HOLD');
  assert.equal(s.profileId,profile().profileId);
  assert.deepEqual(s,makeVisualSheet(profile(),{notes:['Prototype has no approved visual reference pixels.']}));
  assert.deepEqual(verifyVisualSheet(s),s);
});
test('a new display profile yields a distinct sheet without rewriting character',()=>{
  const p=profile(),revised={...p,displayName:'Renji, labeled differently',profileId:undefined};
  const one=makeVisualSheet(p),two=makeVisualSheet(revised);
  assert.equal(one.characterId,two.characterId);
  assert.notEqual(one.profileId,two.profileId);
  assert.notEqual(one.sheetId,two.sheetId);
});
test('references require exact pixel digests but hashes do not claim artistic verification',()=>{
  const bytes=Buffer.from('synthetic image fixture only');
  const input={label:'unapproved illustrative candidate',mediaType:'image/png',
    sha256:hexSha256(bytes),bytes:bytes.length,sourceLocator:'operator-local:reference-photo',
    note:'not authenticated artwork'};
  const s=makeVisualSheet(profile(),{references:[input]});
  assert.equal(s.referenceStatus,'OPERATOR-DECLARED-IMAGE-REFERENCES');
  assert.equal(s.references[0].sha256,input.sha256);
  const modified=copy(s); modified.references[0].sha256='sha256:'+'f'.repeat(64);
  assert.throws(()=>verifyVisualSheet(modified),/digest mismatch/);
  assert.throws(()=>makeVisualSheet(profile(),{references:[input,input]}),/duplicate reference/);
});
test('different lemonPRESS styles create independently traceable art candidates, same source character',()=>{
  const s=sheet();
  const a=makeVisualAttempt(s,{media:media('synthetic mono'),style:style('RENJI_MONO_SOURCE_STACK_001'),origin:'model-render',note:'synthetic test byte declaration'});
  const b=makeVisualAttempt(s,{media:media('synthetic color'),style:style(),origin:'human-render',note:'synthetic test byte declaration'});
  assert.equal(a.characterId,b.characterId);assert.equal(a.profileId,b.profileId);
  assert.notEqual(a.attemptId,b.attemptId);
  assert.equal(a.status,'CANDIDATE');assert.equal(a.authority,'NONE');
  assert.deepEqual(verifyVisualAttempt(a),a);
  assert.throws(()=>makeVisualAttempt(s,{media:media(),style:{...style(),ownerRepository:'the-static-collective/story-dna'},origin:'model-render',note:'test'}),/style owner/);
  assert.throws(()=>verifyVisualAttempt({...a,publication:true}),/attempt authority invalid/);
});
test('human review of text-only identity cannot award verified visual match',()=>{
  const s=sheet(),a=makeVisualAttempt(s,{media:media(),style:style(),origin:'model-render',note:'synthetic candidate bytes'});
  const r=makeVisualReview(s,a,{reviewer,checkedAnchors:checks(s.mustKeep,'observed-consistent'),
    checkedInvariants:checks(s.invariants,'observed-consistent'),uncertainties:[],comments:'Operator impression only'});
  assert.equal(r.schema,VISUAL_REVIEW);
  assert.equal(r.assessment,'HOLD-INSUFFICIENT-EVIDENCE');assert.equal(r.noVerifiedReference,true);
  assert.equal(r.canon,'NONE');assert.equal(r.publication,false);
  assert.equal(r.reviewer.authentication,'NOT_VERIFIED');
});
test('human review cannot skip anchors or invent machine reviewer',()=>{
  const s=sheet(),a=makeVisualAttempt(s,{media:media(),style:style(),origin:'unknown',note:'unknown operator'});
  assert.throws(()=>makeVisualReview(s,a,{reviewer:{kind:'ai',name:'fake judge'},
    checkedAnchors:checks(s.mustKeep),checkedInvariants:checks(s.invariants),comments:'test'}),/human visual observation/);
  assert.throws(()=>makeVisualReview(s,a,{reviewer,checkedAnchors:{},
    checkedInvariants:checks(s.invariants),comments:'test'}),/every visual anchor/);
});
test('a discrepancy is a revision request, not source identity change',()=>{
  const s=sheet(),a=makeVisualAttempt(s,{media:media(),style:style(),origin:'model-render',note:'synthetic'});
  const ch=checks(s.mustKeep),key=s.mustKeep[0];ch[key]={finding:'observed-different',note:'Observed difference, not approved'};
  const r=makeVisualReview(s,a,{reviewer,checkedAnchors:ch,
    checkedInvariants:checks(s.invariants),uncertainties:[],comments:'Needs revision'});
  assert.equal(r.assessment,'REVISE-CANDIDATE');assert.deepEqual(r.discrepancies,[key]);
  assert.equal(r.characterId,s.characterId);
});
test('cross-character and stale-sheet review refuses even if art looks similar',()=>{
  const renji=sheet(),other=makeVisualSheet(createSpecimenRegistry().characters.find(c=>c.displayName==='Neri Vale'));
  const attempt=makeVisualAttempt(renji,{media:media(),style:style(),origin:'human-render',note:'synthetic'});
  assert.throws(()=>makeVisualReview(other,attempt,{reviewer,checkedAnchors:{},checkedInvariants:{},comments:'wrong'}),/cross-character or stale review/);
});
test('render handoff references exact source style and never requests execution',()=>{
  const s=sheet();
  const p=makeRenderHandoff(s,{style:style(),brief:'Explore a linework variation without inventing official physical traits',variantName:'color-study'});
  assert.equal(p.execution,'NONE');assert.equal(p.authority,'NONE');assert.equal(p.noVerifiedImageReference,true);
  assert.deepEqual(p.declaredReferenceHashes,[]);
  assert.equal(p.style.sourceHeadSha,style().sourceHeadSha);
  assert.deepEqual(p,makeRenderHandoff(s,{style:style(),brief:'Explore a linework variation without inventing official physical traits',variantName:'color-study'}));
});
test('attempt cannot claim authority or use unsupported formats',()=>{
  const s=sheet();const v={media:media(),style:style(),origin:'model-render',note:'test'};
  assert.throws(()=>makeVisualAttempt(s,{...v,media:{...v.media,mediaType:'text/html'}}),/candidate media type/);
  assert.throws(()=>makeVisualAttempt(s,{...v,media:{...v.media,sha256:'faked'}}),/media digest/);
  assert.throws(()=>makeVisualAttempt(s,{...v,style:{...v.style,sourceHeadSha:'unbound'}}),/exact commit/);
});
