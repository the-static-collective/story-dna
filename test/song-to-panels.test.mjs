import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {validateSongPointer,verifyOwnerLocalFile,proposeFromSongPointer} from '../src/song-to-panels.mjs';
const pointer=JSON.parse(readFileSync(new URL('../fixtures/keep-a-place.source-pointer.json',import.meta.url),'utf8'));
const copy=()=>structuredClone(pointer);

test('local song identity is pinned to exact source, not title matching',()=>{
 assert.equal(validateSongPointer(pointer),true);
 assert.equal(pointer.sourceFile.sha256.length,64);
 assert.equal(pointer.sourceFile.sizeBytes,4586389);
 assert.equal(pointer.sourceFile.durationSeconds,213.12);
 assert.match(pointer.custody.externalTrackId,/^unknown/);
});
test('wrong bytes and forged source digests refuse instead of producing witnessed claims',()=>{
 assert.throws(()=>verifyOwnerLocalFile(Buffer.from('a'),pointer),/length/);
 const altered=copy();altered.sourceFile.sha256='a'.repeat(64);
 assert.throws(()=>validateSongPointer(altered),/digest changed/);
 const rights=copy();rights.custody.releasePermission='licensed';
 assert.throws(()=>validateSongPointer(rights),/rights falsely escalated/);
});
test('five editable candidate panels, film notes, separate SIA and destination gates',()=>{
 const p=proposeFromSongPointer(pointer);
 assert.equal(p.status,'HOLD');assert.equal(p.publication,'NONE');
 assert.equal(p.panels.length,5);
 assert.equal(p.crossings.lemonPRESS.panels.length,5);
 assert.equal(p.crossings.vidmage.shots.length,5);
 assert.equal(p.crossings.vidmage.status,'SHOTLIST_ONLY_NOT_RENDERED');
 assert.equal(p.crossings.sia.trackId,null);
 assert.equal(p.crossings.sia.albumMembership,null);
 assert.equal(p.source.sourceMediaCommitted,false);
 assert.equal(p.source.localMediaVerifiedThisRun,false);
 assert.equal(p.source.lyricsPublished,false);
 assert.ok(p.panels.every(x=>x.guardrail&&x.sourceStatus.includes('imaginative proposal')));
 assert.ok(p.crossings.lemonPRESS.panels.every(x=>x.caption===''&&x.speech===''&&x.sfx===''));
 assert.ok(p.gates.length>=4);
});
test('draft is deterministic and does not mutate source pointer',()=>{
 const prior=JSON.stringify(pointer);
 const a=proposeFromSongPointer(pointer);
 const b=proposeFromSongPointer(pointer);
 assert.deepEqual(a,b);
 assert.match(a.id,/^sha256:[a-f0-9]{64}$/);
 assert.equal(JSON.stringify(pointer),prior);
});
test('verification marking only follows explicit argument; never claims external owner permission',()=>{
 assert.throws(()=>proposeFromSongPointer(pointer,{localMediaVerified:'yes'}),/verification flag/);
 const p=proposeFromSongPointer(pointer,{localMediaVerified:true});
 assert.equal(p.source.localMediaVerifiedThisRun,true);
 assert.match(p.source.rightsStatus,/unreviewed/);
 assert.equal(p.crossings.abundent.publicAudioLink,null);
 assert.equal(p.storyDNA.noRealPersonMapping,true);
});
