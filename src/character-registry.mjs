import { createHash } from 'node:crypto';
import { validateThread, composeRelationship } from './relationship-passenger.mjs';

export const REGISTRY_SCHEMA = 'story-dna/character-registry/v0';
export const CHARACTER_SCHEMA = 'story-dna/character-profile/v0';
export const VARIANT_SCHEMA = 'story-dna/character-variant/v0';
export const APPEARANCE_SCHEMA = 'story-dna/character-appearance/v0';
export const BOND_SCHEMA = 'story-dna/relationship-bond/v0';
const SHA = /^sha256:[a-f0-9]{64}$/;
const fail = message => { throw new TypeError(message); };
const demand = (test, message) => { if (!test) fail(message); };
const str = (value, label, max = 1000) => {
  demand(typeof value === 'string' && !!value.trim() && value.length <= max, label + ' requires nonblank bounded text');
  return value.trim();
};
const ary = (value, label, max = 32) => {
  demand(Array.isArray(value) && value.length <= max, label + ' must be bounded array');
  const elements = value.map((v, i) => str(v, label + '[' + i + ']', 400));
  demand(elements.length === new Set(elements).size, label + ' duplicates');
  return elements;
};
const plain = (o, label) => { demand(o && typeof o === 'object' && !Array.isArray(o), label + ' must be object'); return o; };
const canonical = v => JSON.stringify(v, (_, value) => value && typeof value === 'object' && !Array.isArray(value)
  ? Object.fromEntries(Object.entries(value).sort(([a],[b]) => a.localeCompare(b))) : value);
const hash = (domain, body) => 'sha256:' + createHash('sha256').update(domain+'\0'+canonical(body)).digest('hex');
const enforceId = (supplied, computed, label) => {
  if (supplied !== undefined) demand(supplied === computed, label + ' has mismatched content identity');
  return computed;
};
function basis(src) {
  plain(src, 'source');
  return {
    locator: str(src.locator, 'source.locator', 1500),
    revision: str(src.revision, 'source.revision', 200),
    basis: str(src.basis, 'source.basis', 1000),
    classification: one(src.classification, ['proposal','observed','derived'], 'source.classification'),
    visibility: one(src.visibility, ['public','private','restricted'], 'source.visibility'),
    rights: one(src.rights, ['unverified','owner-declared','licensed'], 'source.rights'),
  };
}
const one = (x, options, label) => { demand(options.includes(x), label + ' invalid'); return x; };
function entry(schema, body, existing, idKey) {
  return Object.freeze({...body, [idKey]:enforceId(existing?.[idKey], hash(schema,body), idKey)});
}
export function characterId({ namespace, localKey }) {
  const ns = str(namespace, 'namespace', 180), key = str(localKey,'localKey',180);
  demand(/^[a-z0-9][a-z0-9./_-]*$/.test(ns) && /^[a-z0-9][a-z0-9_-]*$/.test(key), 'identity anchors require stable lowercase slugs');
  return 'sdna:character:' + hash('story-dna/character-identity/v0',{namespace:ns,localKey:key}).slice(7);
}

export function makeCharacter(input) {
  plain(input, 'character');
  demand(input.schema === CHARACTER_SCHEMA, 'character schema mismatch');
  plain(input.identity, 'identity');
  const identity = {
    namespace:str(input.identity.namespace,'identity.namespace',180),
    localKey:str(input.identity.localKey,'identity.localKey',180),
  };
  const cid = characterId(identity);
  if (input.characterId !== undefined) demand(input.characterId === cid,'character identity reassigned');
  const visual = plain(input.visual, 'visual');
  const narrative = plain(input.narrative, 'narrative');
  const body = {
    schema:CHARACTER_SCHEMA,
    characterId:cid,
    identity,
    world:str(input.world,'world',200),
    displayName:str(input.displayName,'displayName',200),
    aliases:ary(input.aliases,'aliases',16),
    classification:one(input.classification,['CANDIDATE','HELD'],'classification'),
    source:basis(input.source),
    parentProfileId:input.parentProfileId === null ? null : (demand(SHA.test(input.parentProfileId), 'parentProfileId invalid'),input.parentProfileId),
    narrative:{
      desire:str(narrative.desire,'narrative.desire'),
      constraint:str(narrative.constraint,'narrative.constraint'),
      refusal:str(narrative.refusal,'narrative.refusal'),
      unresolved:str(narrative.unresolved,'narrative.unresolved'),
    },
    visual:{
      silhouette:str(visual.silhouette,'visual.silhouette'),
      anchors:ary(visual.anchors,'visual.anchors',16),
      palette:ary(visual.palette,'visual.palette',12),
      avoid:ary(visual.avoid,'visual.avoid',12),
    },
    invariants:ary(input.invariants,'invariants',20),
    motifs:ary(input.motifs,'motifs',20),
  };
  return entry(CHARACTER_SCHEMA,body,input,'profileId');
}

export function makeVariant(input) {
  plain(input,'variant'); demand(input.schema === VARIANT_SCHEMA,'variant schema mismatch');
  const characterId = str(input.characterId,'characterId',90);
  demand(/^sdna:character:[a-f0-9]{64}$/.test(characterId),'variant character ID malformed');
  const variantKey = str(input.variantKey,'variantKey',140);
  demand(/^[a-z0-9][a-z0-9_-]*$/.test(variantKey),'variantKey malformed');
  demand(SHA.test(input.baseProfileId),'variant baseProfileId missing');
  const body={
    schema:VARIANT_SCHEMA,characterId,variantKey,baseProfileId:input.baseProfileId,
    variantId:hash('story-dna/character-variant-identity/v0',{characterId,variantKey}),
    variantKind:one(input.variantKind,['costume','period','art-style','alternate-continuity','adaptation'],'variantKind'),
    description:str(input.description,'variant description'),
    changedVisual:ary(input.changedVisual,'changedVisual',16),
    changedNarrative:ary(input.changedNarrative,'changedNarrative',16),
    invariantPreservationNote:str(input.invariantPreservationNote,'invariantPreservationNote'),
    source:basis(input.source),
    classification:one(input.classification,['CANDIDATE','HELD'],'classification')
  };
  if(input.variantId !== undefined) demand(input.variantId === body.variantId,'variant identity mismatch');
  return entry(VARIANT_SCHEMA,body,input,'variantRevisionId');
}

export function makeAppearance(input) {
  plain(input,'appearance'); demand(input.schema === APPEARANCE_SCHEMA,'appearance schema mismatch');
  const body={
    schema:APPEARANCE_SCHEMA,
    characterId:str(input.characterId,'appearance characterId',90),
    profileId:str(input.profileId,'appearance profileId',90),
    workId:str(input.workId,'appearance workId',300),
    sceneRef:str(input.sceneRef,'appearance sceneRef',300),
    variantId:input.variantId === null ? null : str(input.variantId,'appearance variantId',90),
    narrativeRole:str(input.narrativeRole,'appearance narrativeRole',400),
    source:basis(input.source),
    classification:one(input.classification,['CANDIDATE','HELD'],'classification'),
  };
  return entry(APPEARANCE_SCHEMA,body,input,'appearanceId');
}

export function makeBond(input) {
  plain(input,'bond'); demand(input.schema === BOND_SCHEMA,'bond schema mismatch');
  const arc = plain(input.arc,'bond.arc');
  const a=str(input.fromCharacterId,'fromCharacterId',90),b=str(input.toCharacterId,'toCharacterId',90);
  demand(a !== b,'self-bond unsupported in v0');
  const body={
    schema:BOND_SCHEMA,
    fromCharacterId:a,toCharacterId:b,world:str(input.world,'bond world',200),
    key:str(input.key,'bond key',140),kind:str(input.kind,'bond kind',140),
    arc:{
      desire:str(arc.desire,'arc.desire'),
      relationship:str(arc.relationship,'arc.relationship'),
      conflict:str(arc.conflict,'arc.conflict'),
      choice:str(arc.choice,'arc.choice'),
      consequence:str(arc.consequence,'arc.consequence'),
      remainder:str(arc.remainder,'arc.remainder')
    },
    limits:ary(input.limits,'bond limits',12),
    source:basis(input.source),
    classification:one(input.classification,['CANDIDATE','HELD'],'classification')
  };
  return entry(BOND_SCHEMA,body,input,'bondId');
}
const sorted = (xs,field) => [...xs].sort((a,b)=>a[field].localeCompare(b[field]));
const unique = (xs, field) => demand(new Set(xs.map(x=>x[field])).size === xs.length,'duplicate '+field);
export function buildRegistry(raw) {
  plain(raw,'registry'); demand(raw.schema === REGISTRY_SCHEMA,'registry schema mismatch');
  const characters = sorted(raw.characters.map(makeCharacter),'characterId');
  const variants = sorted(raw.variants.map(makeVariant),'variantId');
  const appearances = sorted(raw.appearances.map(makeAppearance),'appearanceId');
  const bonds = sorted(raw.bonds.map(makeBond),'bondId');
  [ [characters,'characterId'], [variants,'variantId'], [variants,'variantRevisionId'], [appearances,'appearanceId'], [bonds,'bondId']].forEach(([xs,k])=>unique(xs,k));
  const people = new Map(characters.map(c=>[c.characterId,c]));
  const vari = new Map(variants.map(x=>[x.variantId,x]));
  for(const c of characters){
    if(c.parentProfileId !== null) fail('v0 registry does not permit unresolved prior profile revisions; use a future history-enabled registry');
  }
  for(const v of variants){
    const c=people.get(v.characterId);
    demand(c && c.profileId === v.baseProfileId,'variant references unknown or stale character profile');
    demand(v.source.visibility === c.source.visibility,'variant visibility must match originating character');
  }
  for(const appearance of appearances) {
    const c=people.get(appearance.characterId);
    demand(c && appearance.profileId === c.profileId, 'appearance references unknown or stale character profile');
    if(appearance.variantId!==null) demand(vari.get(appearance.variantId)?.characterId===c.characterId,'appearance variant not same character');
    demand(appearance.source.visibility === c.source.visibility,'appearance visibility cannot be widened');
  }
  for(const bond of bonds) {
    const a=people.get(bond.fromCharacterId),b=people.get(bond.toCharacterId);
    demand(a && b,'bond references absent character');
    demand(a.world===bond.world && b.world===bond.world,'cross-world character bond forbidden; use ECHO/FORK proposal engine');
    demand(a.source.visibility===bond.source.visibility && b.source.visibility===bond.source.visibility,'bond must not widen character visibility');
  }
  const body={schema:REGISTRY_SCHEMA,characters,variants,appearances,bonds,
    posture:'HOLD',authority:'CREATIVE-CANDIDATES-ONLY'};
  return Object.freeze({...body,registryId:enforceId(raw.registryId,hash(REGISTRY_SCHEMA,body),'registryId')});
}
export function queryCharacters(registry,{q=''}={}){
  const r=buildRegistry(registry);
  const term=q.trim().toLowerCase();
  return r.characters.filter(c=>!term || [
    c.displayName,c.world,c.narrative.desire,c.narrative.unresolved,
    ...c.aliases,...c.motifs
  ].some(x=>x.toLowerCase().includes(term)));
}

const stop = new Set(['the','and','with','that','this','from','what','into','another','their','without','when','could','where','whose','make','might','would','there','those','right','person','story','allow']);
const tokens = s => [...new Set((s.toLowerCase().match(/[a-z]{4,}/g)??[]).filter(x=>!stop.has(x)))].sort();
export function suggestEchoes(registry,{minShared=1}={}){
  const r=buildRegistry(registry);
  demand(Number.isSafeInteger(minShared) && minShared>=1 && minShared<=10,'invalid minShared');
  const publicChars = r.characters.filter(c=>c.source.visibility==='public');
  const results=[];
  for(let i=0;i<publicChars.length;i++) for(let j=i+1;j<publicChars.length;j++){
    const a=publicChars[i],b=publicChars[j];
    if(a.world===b.world) continue;
    const wA=new Set(tokens([...a.motifs,a.narrative.unresolved,a.narrative.desire].join(' ')));
    const shared=[...new Set(tokens([...b.motifs,b.narrative.unresolved,b.narrative.desire].join(' ')).filter(x=>wA.has(x)))];
    if(shared.length<minShared) continue;
    results.push({
      schema:'story-dna/echo-suggestion/v0',characterIds:[a.characterId,b.characterId],
      displayNames:[a.displayName,b.displayName],sourceProfileIds:[a.profileId,b.profileId],
      matchedLiteralTokens:shared,matchingBasis:'literal declared motif/desire/unresolved text only',
      proposal:'ECHO',canon:'NONE',sharedUniverse:false,characterTransfer:false
    });
  }
  return results.sort((a,b)=>b.matchedLiteralTokens.length-a.matchedLiteralTokens.length||a.characterIds.join(':').localeCompare(b.characterIds.join(':')));
}
export function threadFromBond(registry,bondId){
  const r=buildRegistry(registry);
  const bond=r.bonds.find(b=>b.bondId===bondId);
  demand(!!bond,'bond not found');
  const people=new Map(r.characters.map(c=>[c.characterId,c]));
  const names=[people.get(bond.fromCharacterId).displayName,people.get(bond.toCharacterId).displayName];
  return validateThread({
    schema:'story-dna/relationship-thread/v0',
    key:bond.key,title:names.join(' × '),world:bond.world,
    source:bond.source,participants:names,arc:bond.arc,
    constraints:bond.limits,
    controls:{fictional:true,analogyAllowed:bond.source.visibility==='public',characterCrossingAllowed:false}
  });
}
export function echoBonds(registry,firstBondId,secondBondId,{seed=325}={}){
  return composeRelationship(threadFromBond(registry,firstBondId),threadFromBond(registry,secondBondId),{mode:'echo',seed});
}
