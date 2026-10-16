import { createHash } from 'node:crypto';
import { makeCharacter } from './character-registry.mjs';

export const VISUAL_SHEET='story-dna/visual-identity-sheet/v0';
export const VISUAL_ATTEMPT='story-dna/visual-attempt/v0';
export const VISUAL_REVIEW='story-dna/visual-review/v0';

const fail = message => {throw new TypeError(message);};
const requireThat = (ok,message) => {if(!ok)fail(message);};
const str=(v,key,max=800)=>{
  requireThat(typeof v==='string'&&v.trim()&&v.length<=max,key+' must be nonempty bounded text');
  return v.trim();
};
const obj=(v,key)=>{requireThat(v&&typeof v==='object'&&!Array.isArray(v),key+' must be object');return v;};
const arr=(v,key,max=30)=>{
  requireThat(Array.isArray(v)&&v.length<=max,key+' must be bounded array');
  const out=v.map((s,i)=>str(s,key+'['+i+']',600));
  requireThat(new Set(out).size===out.length,key+' repeated');
  return out;
};
const one=(v,values,key)=>{requireThat(values.includes(v),key+' invalid');return v;};
const SHA256=/^sha256:[a-f0-9]{64}$/;
const GIT_SHA=/^[a-f0-9]{40}$/;
const canonical=value=>JSON.stringify(value,(_,v)=>v&&typeof v==='object'&&!Array.isArray(v)?
  Object.fromEntries(Object.entries(v).sort(([a],[b])=>a.localeCompare(b))):v);
const idFor=(schema,body)=>'sha256:'+createHash('sha256').update(schema+'\0'+canonical(body)).digest('hex');
const record=(schema,body,key,given)=> {
  const id=idFor(schema,body);
  if(given!==undefined)requireThat(id===given,key+' digest mismatch');
  return Object.freeze({...body,[key]:id});
};
const plain=(v,allow,key)=> {
  obj(v,key);
  const keys=Object.keys(v);
  requireThat(keys.every(k=>allow.includes(k)),key+' contains unsupported fields');
};
const source=(v)=>{
  plain(v,['locator','revision','basis','classification','visibility','rights'],'source');
  return {locator:str(v.locator,'source.locator',1500),revision:str(v.revision,'source.revision',200),
    basis:str(v.basis,'source.basis',1000),
    classification:one(v.classification,['proposal','observed','derived'],'source.classification'),
    visibility:one(v.visibility,['public','private','restricted'],'source.visibility'),
    rights:one(v.rights,['unverified','owner-declared','licensed'],'source.rights')};
};
const ref=(v)=>{
  plain(v,['label','mediaType','sha256','bytes','sourceLocator','note'],'reference');
  requireThat(SHA256.test(v.sha256),'reference sha256 invalid');
  requireThat(Number.isSafeInteger(v.bytes)&&v.bytes>0,'reference byte count invalid');
  return {label:str(v.label,'reference.label',160),
    mediaType:one(v.mediaType,['image/png','image/jpeg','image/webp'],'reference.mediaType'),
    sha256:v.sha256,bytes:v.bytes,sourceLocator:str(v.sourceLocator,'reference.sourceLocator',1500),
    note:str(v.note,'reference.note')};
};
const declaredStyle=(v)=>{
  plain(v,['stackId','ownerRepository','sourceHeadSha','referencePath','purpose'],'style');
  requireThat(GIT_SHA.test(v.sourceHeadSha),'style source head must be exact commit');
  return {stackId:str(v.stackId,'style.stackId',180),
    ownerRepository:str(v.ownerRepository,'style.ownerRepository',200),
    sourceHeadSha:v.sourceHeadSha,
    referencePath:str(v.referencePath,'style.referencePath',450),
    purpose:one(v.purpose,['style-only','layout-only','translation-only'],'style.purpose')};
};

/** A visual identity sheet is editorial comparison material, NOT verified source art or canon. */
export function makeVisualSheet(rawProfile,input={}) {
  const c=makeCharacter(rawProfile);
  plain(input,['references','notes','sheetId'],'sheet input');
  const refs=input.references??[];
  requireThat(Array.isArray(refs)&&refs.length<=12,'sheet references exceed bound');
  const normalized=refs.map(ref);
  requireThat(new Set(normalized.map(x=>x.sha256)).size===normalized.length,'duplicate reference pixels');
  const status=refs.length?'OPERATOR-DECLARED-IMAGE-REFERENCES':'TEXT-ONLY-NO-VERIFIED-IMAGE-REFERENCE';
  const body={
    schema:VISUAL_SHEET,characterId:c.characterId,profileId:c.profileId,
    name:c.displayName,world:c.world,
    silhouette:c.visual.silhouette,
    mustKeep:c.visual.anchors,
    mustAvoid:c.visual.avoid,
    openPalette:c.visual.palette,
    invariants:c.invariants,
    source:c.source,referenceStatus:status,
    references:normalized,notes:arr(input.notes??[],'notes',20),
    posture:'HOLD',renderPermission:false,publication:false,
  };
  return record(VISUAL_SHEET,body,'sheetId',input.sheetId);
}
export function verifyVisualSheet(raw) {
  obj(raw,'sheet');
  requireThat(raw.schema===VISUAL_SHEET,'sheet schema invalid');
  const {sheetId,...body}=raw;
  const expected=record(VISUAL_SHEET,body,'sheetId',sheetId);
  requireThat(body.posture==='HOLD'&&body.renderPermission===false&&body.publication===false,'sheet authority invalid');
  requireThat(Array.isArray(body.references)&&body.references.length<=12,'sheet references invalid');
  body.references.forEach(ref);
  requireThat(body.referenceStatus===(body.references.length?'OPERATOR-DECLARED-IMAGE-REFERENCES':'TEXT-ONLY-NO-VERIFIED-IMAGE-REFERENCE'),'reference status inconsistent');
  requireThat(SHA256.test(body.profileId),'profile identity malformed');
  return expected;
}
/** Candidate art is a new exact-byte particular, never an approved depiction. */
export function makeVisualAttempt(sheetRaw,input) {
  const sheet=verifyVisualSheet(sheetRaw);
  plain(input,['media','style','origin','note','attemptId'],'attempt');
  const media=obj(input.media,'media');
  requireThat(SHA256.test(media.sha256),'candidate media digest invalid');
  requireThat(Number.isSafeInteger(media.bytes)&&media.bytes>0,'candidate media byte count invalid');
  const mediaType=one(media.mediaType,['image/png','image/jpeg','image/webp'],'candidate media type');
  const style=declaredStyle(input.style);
  requireThat(style.ownerRepository==='the-static-collective/lemonPRESS','style owner must remain lemonPRESS');
  const origin=one(input.origin,['human-render','model-render','unknown'],'attempt.origin');
  const body={
    schema:VISUAL_ATTEMPT,
    characterId:sheet.characterId,profileId:sheet.profileId,sheetId:sheet.sheetId,
    candidateMedia:{sha256:media.sha256,bytes:media.bytes,mediaType,filename:str(media.filename,'media.filename',200)},
    style,origin,note:str(input.note,'attempt.note'),
    referenceMedia:sheet.references.map(x=>x.sha256).sort(),
    status:'CANDIDATE',authority:'NONE',publication:false,
  };
  return record(VISUAL_ATTEMPT,body,'attemptId',input.attemptId);
}
export function verifyVisualAttempt(raw){
  obj(raw,'attempt');requireThat(raw.schema===VISUAL_ATTEMPT,'attempt schema invalid');
  const {attemptId,...body}=raw;
  requireThat(body.status==='CANDIDATE'&&body.authority==='NONE'&&body.publication===false,'attempt authority invalid');
  declaredStyle(body.style);requireThat(SHA256.test(body.sheetId),'attempt sheet ID invalid');
  return record(VISUAL_ATTEMPT,body,'attemptId',attemptId);
}
/** This verifies the review packet's *declarations*, not image contents or artwork quality. */
export function makeVisualReview(sheetRaw,attemptRaw,input){
  const sheet=verifyVisualSheet(sheetRaw);
  const attempt=verifyVisualAttempt(attemptRaw);
  requireThat(sheet.sheetId===attempt.sheetId&&sheet.characterId===attempt.characterId&&sheet.profileId===attempt.profileId,'cross-character or stale review refused');
  plain(input,['reviewer','checkedAnchors','checkedInvariants','uncertainties','comments','reviewId'],'review input');
  const reviewer=obj(input.reviewer,'reviewer');
  requireThat(reviewer.kind==='human','human visual observation required; machine cannot invent an image assessment');
  const reviewerName=str(reviewer.name,'reviewer.name',180);
  const anchors=obj(input.checkedAnchors,'checkedAnchors');
  const invariants=obj(input.checkedInvariants,'checkedInvariants');
  const permitted=['observed-consistent','observed-different','not-observable'];
  const reviewList=(requirements,values,key)=>{
    requireThat(Object.keys(values).length===requirements.length,'review must address every '+key+' anchor exactly');
    return requirements.map(label=>{
      const entry=values[label];plain(entry,['finding','note'],key+' finding');
      return {anchor:label,finding:one(entry.finding,permitted,key+' finding'),note:str(entry.note,key+' note',600)};
    });
  };
  const checkedAnchors=reviewList(sheet.mustKeep,anchors,'visual');
  const checkedInvariants=reviewList(sheet.invariants,invariants,'narrative');
  const uncertainties=arr(input.uncertainties??[],'uncertainties',20);
  const differences=[...checkedAnchors,...checkedInvariants].filter(x=>x.finding==='observed-different');
  const missing=[...checkedAnchors,...checkedInvariants].filter(x=>x.finding==='not-observable');
  const originalReferenceAbsent=sheet.references.length===0;
  const body={
    schema:VISUAL_REVIEW,sheetId:sheet.sheetId,attemptId:attempt.attemptId,characterId:sheet.characterId,
    reviewer:{kind:'human',name:reviewerName,authentication:'NOT_VERIFIED'},
    checkedAnchors,checkedInvariants,uncertainties,comments:str(input.comments,'comments'),
    discrepancies:differences.map(x=>x.anchor),notObservable:missing.map(x=>x.anchor),
    noVerifiedReference:originalReferenceAbsent,
    assessment: differences.length?'REVISE-CANDIDATE':(originalReferenceAbsent||missing.length||uncertainties.length)?
      'HOLD-INSUFFICIENT-EVIDENCE':'HUMAN-REPORTED-CONSISTENCY',
    authority:'NONE',canon:'NONE',publication:false,
    caveat:'Review records subjective human declarations; no visual equivalence, rights clearance or canonical acceptance is independently verified.'
  };
  return record(VISUAL_REVIEW,body,'reviewId',input.reviewId);
}
export function makeRenderHandoff(sheetRaw,{style,brief,variantName}){
  const sheet=verifyVisualSheet(sheetRaw);
  const binding=declaredStyle(style);
  requireThat(binding.ownerRepository==='the-static-collective/lemonPRESS','wrong style owner');
  const text=str(brief,'render brief',2000);
  const name=str(variantName,'variant name',120);
  const packet={
    schema:'story-dna/render-handoff/v0',
    characterId:sheet.characterId,profileId:sheet.profileId,sheetId:sheet.sheetId,
    variantName:name,style:binding,brief:text,
    mustKeep:sheet.mustKeep,mustAvoid:sheet.mustAvoid,
    declaredReferenceHashes:sheet.references.map(r=>r.sha256),
    noVerifiedImageReference:sheet.references.length===0,
    posture:'PROPOSAL',execution:'NONE',authority:'NONE',
    operatorInstruction:'Require an actual permitted, supplied reference image before claiming visual resemblance; never infer an authentic face from style labels. Renderer output must be registered as a new candidate image with exact byte digest.'
  };
  return record(packet.schema,packet,'handoffId');
}
export function hexSha256(bytes) {
  return 'sha256:'+createHash('sha256').update(bytes).digest('hex');
}
