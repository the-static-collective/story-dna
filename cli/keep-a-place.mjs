#!/usr/bin/env node
// Local-only source check and handoff. The MP3 is never uploaded, copied, or serialized.
import {readFileSync,writeFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {verifyOwnerLocalFile,proposeFromSongPointer} from '../src/song-to-panels.mjs';

const [path,out]=process.argv.slice(2);
if(!path||process.argv.length>4){
 process.stderr.write('Usage: node cli/keep-a-place.mjs "/owner/path/Keep a Place for Me.mp3" [output.json]\n');
 process.exit(2);
}
try{
 const pointer=JSON.parse(readFileSync(new URL('../fixtures/keep-a-place.source-pointer.json',import.meta.url),'utf8'));
 const bytes=readFileSync(resolve(path));
 const witness=verifyOwnerLocalFile(bytes,pointer);
 const proposal=proposeFromSongPointer(pointer,{localMediaVerified:witness.verifiedAgainstPointer});
 const serialized=JSON.stringify(proposal,null,2)+'\n';
 if(out){writeFileSync(resolve(out),serialized,{flag:'wx',mode:0o600});process.stdout.write('Wrote held candidate: '+resolve(out)+'\n');}
 else process.stdout.write(serialized);
}catch(e){process.stderr.write('HOLD: '+e.message+'\n');process.exit(1);}
