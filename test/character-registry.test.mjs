import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildRegistry, characterId, makeCharacter, makeVariant, makeAppearance,
  makeBond, suggestEchoes, queryCharacters, threadFromBond, echoBonds
} from '../src/character-registry.mjs';
import { createSpecimenRegistry } from '../fixtures/characters.candidate.mjs';

const copy = x => structuredClone(x);
const specimen = () => createSpecimenRegistry();

test('character identities stable across rename and display fields; profiles remain independent',()=>{
  const r=specimen(); assert.equal(r.characters.length,4);
  assert.equal(r.variants.length,1); assert.equal(r.appearances.length,2);
  assert.equal(r.bonds.length,2); assert.equal(r.authority,'CREATIVE-CANDIDATES-ONLY');
  for(const c of r.characters){
    assert.match(c.characterId,/^sdna:character:[a-f0-9]{64}$/);
    assert.match(c.profileId,/^sha256:[a-f0-9]{64}$/);
    assert.equal(c.characterId,characterId(c.identity));
    assert.equal(c.classification,'CANDIDATE');
  }
  const neri=r.characters.find(c=>c.displayName==='Neri Vale');
  const renamed=makeCharacter({...neri,displayName:'Neri — an alternate display name',profileId:undefined});
  assert.equal(neri.characterId,renamed.characterId);
  assert.notEqual(neri.profileId,renamed.profileId);
});
test('exact registry replay is deterministic and array order insensitive',()=>{
  const r=specimen();
  const shuffled=buildRegistry({
    ...r,characters:[...r.characters].reverse(),
    variants:[...r.variants].reverse(),appearances:[...r.appearances].reverse(),
    bonds:[...r.bonds].reverse()
  });
  assert.deepEqual(r,shuffled);
  assert.deepEqual(r,specimen());
});
test('source tampering and character reassignment fail closed',()=>{
  const r=specimen(),c=r.characters[0];
  assert.throws(()=>makeCharacter({...c,displayName:'tampered without new profile ID'}),/content identity/);
  assert.throws(()=>makeCharacter({...c,characterId:r.characters[1].characterId}),/identity reassigned/);
  const changed=copy(r);changed.characters[0].source.revision='made-up';
  assert.throws(()=>buildRegistry(changed),/content identity/);
});
test('variants inherit identity, not mutation of origin profile',()=>{
  const r=specimen(),v=r.variants[0],origin=r.characters.find(c=>c.characterId===v.characterId);
  assert.equal(v.baseProfileId,origin.profileId);
  assert.equal(v.variantKind,'art-style');
  assert.equal(v.classification,'CANDIDATE');
  assert.equal(r.appearances.find(a=>a.variantId===v.variantId).characterId,origin.characterId);
  const changing=makeVariant({...v,changedVisual:[...v.changedVisual,'additional proposed motif'],variantRevisionId:undefined});
  assert.equal(changing.variantId,v.variantId);
  assert.notEqual(changing.variantRevisionId,v.variantRevisionId);
});
test('dangling appearance, wrong variant, stale profile cannot attach',()=>{
  const r=specimen();
  const o=copy(r);o.appearances[0].characterId='sdna:character:'+'0'.repeat(64);delete o.appearances[0].appearanceId;
  assert.throws(()=>buildRegistry(o),/unknown or stale/);
  const v=copy(r);const unrelated=v.appearances.find(a=>a.characterId!==v.variants[0].characterId);unrelated.variantId=v.variants[0].variantId;delete unrelated.appearanceId;
  assert.throws(()=>buildRegistry(v),/not same character/);
  const stale=copy(r);stale.variants[0].baseProfileId='sha256:'+'a'.repeat(64);delete stale.variants[0].variantRevisionId;
  assert.throws(()=>buildRegistry(stale),/unknown or stale/);
});
test('crossworld relationship can never masquerade as a declared canonical bond',()=>{
  const r=specimen();
  const c=copy(r);
  const orig=c.bonds[0];const other=r.characters.find(ch=>ch.world!==orig.world);orig.toCharacterId=other.characterId;
  delete c.bonds[0].bondId;
  assert.throws(()=>buildRegistry(c),/cross-world character bond forbidden/);
});
test('privacy rights cannot be widened through variants, appearances or bonds',()=>{
  const r=specimen();
  const v=copy(r);v.variants[0].source.visibility='private';delete v.variants[0].variantRevisionId;
  assert.throws(()=>buildRegistry(v),/variant visibility must match/);
  const a=copy(r);a.appearances[0].source.visibility='restricted';delete a.appearances[0].appearanceId;
  assert.throws(()=>buildRegistry(a),/appearance visibility cannot be widened/);
  const b=copy(r);b.bonds[0].source.visibility='private';delete b.bonds[0].bondId;
  assert.throws(()=>buildRegistry(b),/bond must not widen/);
});
test('proposals cannot silently claim admitted status in registry v0',()=>{
  const r=specimen(),c=copy(r);
  c.characters[0].classification='ADMITTED';delete c.characters[0].profileId;
  assert.throws(()=>buildRegistry(c),/classification invalid/);
});
test('character search and literal crossworld echo suggestion never imply a character crossing',()=>{
  const r=specimen();
  assert.equal(queryCharacters(r,{q:'Neri'}).length,1);
  assert.ok(queryCharacters(r,{q:'doorway'}).length>=1);
  const suggestions=suggestEchoes(r);
  assert.ok(suggestions.length>=1);
  for(const s of suggestions){
    assert.equal(s.proposal,'ECHO');
    assert.equal(s.canon,'NONE');assert.equal(s.sharedUniverse,false);
    assert.equal(s.characterTransfer,false);
    assert.ok(s.matchedLiteralTokens.length>=1);
    assert.equal(s.sourceProfileIds.length,2);
  }
});
test('bonds can become source-traceable relationship threads, but only ECHO not encounter',()=>{
  const r=specimen();
  const [a,b]=r.bonds;
  const first=threadFromBond(r,a.bondId);
  const second=threadFromBond(r,b.bondId);
  assert.equal(first.world,a.world);
  assert.equal(first.controls.characterCrossingAllowed,false);
  assert.equal(first.source.rights,'unverified');
  assert.equal(second.controls.characterCrossingAllowed,false);
  const proposed=echoBonds(r,a.bondId,b.bondId,{seed:325});
  assert.equal(proposed.mode,'echo');
  assert.equal(proposed.posture,'HOLD');
  assert.equal(proposed.characterTransfer,null);
  assert.equal(proposed.parentThreads.length,2);
  assert.equal(proposed.admission,'NONE');
});
