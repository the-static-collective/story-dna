import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,readFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {spawnSync} from 'node:child_process';
import {makeCharacter,buildRegistry} from '../src/character-registry.mjs';
import {createSpecimenRegistry} from '../fixtures/characters.candidate.mjs';
import {renderRegistryHtml} from '../src/registry-report.mjs';

test('registry report is deterministic, candidate-labeled, search-ready and offline',()=>{
  const r=createSpecimenRegistry();
  const one=renderRegistryHtml(r),two=renderRegistryHtml(r);
  assert.equal(one,two);
  assert.match(one,/<meta name="viewport"/);
  assert.match(one,/Character Registry/);
  assert.match(one,/Neri Vale/); assert.match(one,/Tallow/); assert.match(one,/Renji/);
  assert.match(one,/THE ROOM INSIDE THE ROOM/);
  assert.match(one,/Relationships held open/);
  assert.match(one,/Possible echoes between worlds/);
  assert.match(one,/search.addEventListener/);
  assert.match(one,/SOURCE-ATTRIBUTED FICTIONAL CANDIDATES/);
  assert.doesNotMatch(one,/\bfetch\s*\(/);
  assert.doesNotMatch(one,/XMLHttpRequest/);
  assert.doesNotMatch(one,/<script\s+src=/);
});

test('HTML emitter escapes proposed text, including script-shaped display names',()=>{
  const base=createSpecimenRegistry().characters[0];
  const hostile=makeCharacter({...base,displayName:'<script>alert(1)</script>',profileId:undefined});
  const r=buildRegistry({schema:'story-dna/character-registry/v0',
    characters:[hostile],variants:[],appearances:[],bonds:[]});
  const html=renderRegistryHtml(r);
  assert.match(html,/&lt;script&gt;alert\(1\)&lt;\/script&gt;/);
  assert.doesNotMatch(html,/<script>alert\(1\)<\/script>/);
});

test('HTML export refuses private or restricted originals',()=>{
  const base=createSpecimenRegistry().characters[0];
  const secret=makeCharacter({...base,source:{...base.source,visibility:'private'},profileId:undefined});
  const r=buildRegistry({schema:'story-dna/character-registry/v0',
    characters:[secret],variants:[],appearances:[],bonds:[]});
  assert.throws(()=>renderRegistryHtml(r),/nonpublic sources/);
});

test('CLI can produce stable JSON and a standalone offline HTML proof',()=>{
  const run=(...args)=>spawnSync(process.execPath,[new URL('../cli/characters.mjs',import.meta.url).pathname,...args],
    {encoding:'utf8'});
  const list=run('list');
  assert.equal(list.status,0,list.stderr);
  const names=JSON.parse(list.stdout);
  assert.equal(names.length,4);
  const echoes=run('echoes');
  assert.equal(echoes.status,0,echoes.stderr);
  assert.ok(JSON.parse(echoes.stdout).length>=1);
  const relations=run('echo-bonds','325');
  assert.equal(relations.status,0,relations.stderr);
  assert.equal(JSON.parse(relations.stdout).mode,'echo');
  assert.equal(JSON.parse(relations.stdout).characterTransfer,null);
  const dir=mkdtempSync(join(tmpdir(),'story-dna-report-'));
  try{
    const file=join(dir,'registry-proof.html');
    const render=run('report',file);
    assert.equal(render.status,0,render.stderr);
    const html=readFileSync(file,'utf8');
    assert.match(html,/Character Registry/);
    const second=run('report',file);
    assert.notEqual(second.status,0,'existing output must not be overwritten');
  }finally{rmSync(dir,{recursive:true,force:true})}
});
