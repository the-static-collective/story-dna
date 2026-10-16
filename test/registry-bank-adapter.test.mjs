import test from 'node:test';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {makeCharacter,buildRegistry} from '../src/character-registry.mjs';
import {createSpecimenRegistry} from '../fixtures/characters.candidate.mjs';
import {registryToBankExport} from '../src/registry-bank-adapter.mjs';

test('registry bridge emits source-labelled 11-card import for original offline Bank UI',()=>{
  const bank=registryToBankExport(createSpecimenRegistry());
  assert.equal(bank.schema,'static-story-dna-bank/v1');
  assert.equal(bank.custom.length,11);
  const counts=Object.fromEntries(['person','place','relation','thread','artifact'].map(k=>[k,bank.custom.filter(c=>c.kind===k).length]));
  assert.deepEqual(counts,{person:4,place:2,relation:2,thread:2,artifact:1});
  assert.equal(bank.provenance.status,'CANDIDATE-ONLY');
  assert.deepEqual(bank,registryToBankExport(createSpecimenRegistry()));
  const seen=new Set();
  for(const c of bank.custom){
    assert.equal(typeof c.id,'string');assert.equal(typeof c.name,'string');
    assert.equal(typeof c.detail,'string');assert.equal(typeof c.world,'string');
    assert.equal(typeof c.drive,'string');assert.equal(typeof c.status,'string');
    assert.equal(typeof c.source,'string');assert.ok(c.custom);
    assert.match(c.source,/^https:\/\//);
    assert.ok(!seen.has(c.id));seen.add(c.id);
    assert.ok(!/ADMITTED/i.test(c.status)||/NO CANON ADMISSION|UNADMITTED|NOT A NEW CHARACTER|CANDIDATE/.test(c.status));
  }
});

test('Bank projection never silently shares private characters or truncates source',()=>{
  const r=createSpecimenRegistry();
  const changed=structuredClone(r.characters[0]);
  changed.source.visibility='private';delete changed.profileId;
  const secret=makeCharacter(changed);
  const isolated=buildRegistry({schema:'story-dna/character-registry/v0',
    characters:[secret],variants:[],appearances:[],bonds:[]});
  assert.throws(()=>registryToBankExport(isolated),/nonpublic source/);
  const fake=structuredClone(r.characters[0]);
  fake.source.locator='file:///home/user/private';delete fake.profileId;
  const personal=makeCharacter(fake);
  const only=buildRegistry({schema:'story-dna/character-registry/v0',characters:[personal],variants:[],appearances:[],bonds:[]});
  assert.throws(()=>registryToBankExport(only),/HTTPS public source/);
});

test('CLI emits JSON accepted by browser Bank import contract',()=>{
  const res=spawnSync(process.execPath,[new URL('../cli/characters.mjs',import.meta.url).pathname,'bank'],{encoding:'utf8'});
  assert.equal(res.status,0,res.stderr);
  const data=JSON.parse(res.stdout);
  assert.equal(data.schema,'static-story-dna-bank/v1');
  assert.equal(data.custom.length,11);
});
