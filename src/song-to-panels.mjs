// Keep a Place 001 — verified-local-media / unadmitted five-panel candidate.
// All derived writing is original, never a lyric transcription or a claim about real people.
import {createHash} from 'node:crypto';

const insist=(test,message)=>{if(!test)throw new TypeError(message);};
const sha=x=>createHash('sha256').update(x).digest('hex');
export function validateSongPointer(pointer){
 insist(pointer?.schema==='story-dna/local-song-source-pointer/v0','wrong pointer schema');
 insist(pointer.title==='Keep a Place for Me','wrong specimen title');
 insist(pointer.sourceFile?.mediaType==='audio/mpeg','wrong media type');
 insist(Number.isSafeInteger(pointer.sourceFile.sizeBytes)&&pointer.sourceFile.sizeBytes>0,'bad media size');
 insist(pointer.sourceFile.sizeBytes===4586389,'source size changed');
 insist(pointer.sourceFile.durationSeconds===213.12,'duration label changed; inspect before revision');
 insist(pointer.sourceFile.sha256==='7f16ead290a86a5997e714e1280befe282b4047c1d40de07e36849521cd304d1','source digest changed');
 insist(pointer.custody?.externalTrackId?.startsWith('unknown'),'unproven platform identity');
 insist(pointer.custody?.lyricsPubliclyAdmitted===false,'lyrics cannot silently become public source');
 insist(pointer.custody?.releasePermission==='not established','rights falsely escalated');
 return true;
}
export function verifyOwnerLocalFile(bytes,pointer){
 validateSongPointer(pointer);
 insist(Buffer.isBuffer(bytes)||bytes instanceof Uint8Array,'verified local file bytes required');
 insist(bytes.length===pointer.sourceFile.sizeBytes,'local file length does not match pointer');
 insist(sha(bytes)===pointer.sourceFile.sha256,'local file SHA-256 mismatch');
 return Object.freeze({digest:'sha256:'+sha(bytes),bytes:bytes.length,verifiedAgainstPointer:true});
}
const scenes=Object.freeze([
 {id:'KP01',label:'Window / the ordinary world',shape:'wide',
  approxAudioWindowSeconds:[0,28],
  sourceMotifs:['window','rain on metal','kettle'],
  fictionProposal:'At first light, the roof receives rain like a drum; a kettle warms in a small fictional house.',
  panel:'Outside-wide then inside detail: rain ticks on a metal sill; one kettle holds the brightest light.',
  lens:'static exterior establishing shot → intimate macro close-up',
  palette:'slate blue, storm silver, faint tea-gold',motion:'rain streaks and steam only',soundCue:'restrained plucked accompaniment',
  refusal:'Do not infer a real residence, partner, or photograph from the song.'},
 {id:'KP02',label:'Fourth beat / a house with memory',shape:'split',
  approxAudioWindowSeconds:[28,55],
  sourceMotifs:['old clock','loose hinge','worn cup'],
  fictionProposal:'One tick goes missing from an old clock; a small repair and the chipped cup become competing ways to measure care.',
  panel:'Three tiny frames: a hand steadying a hinge; a clock with a gap in its rhythm; a worn cup on a table.',
  lens:'tight insert triptych with one rhythmic absent cut',
  palette:'wood amber, tarnished brass, charcoal blue',motion:'a pause on the empty fourth beat',soundCue:'musical pulse becomes visually countable',
  refusal:'The clock anomaly is a fictional transformation, not a documented event or measured audio meter.'},
 {id:'KP03',label:'Bread can wait / chosen attention',shape:'wide',
  approxAudioWindowSeconds:[55,106],
  sourceMotifs:['bread','table','offered seat'],
  fictionProposal:'The unfinished repairs recede as one figure invites another into an unclaimed place at the table.',
  panel:'A wide view with one pulled-out chair and two anonymous silhouettes; warmth pools around the chair, not the faces.',
  lens:'steady eye-level two-shot without cutting to imagined identities',
  palette:'rising cream and worn sunflower gold',motion:'a hand pauses; the chair shifts by inches',soundCue:'fuller backbeat and chorus lift',
  refusal:'Do not invent names, likenesses, or a biographical reunion.'},
 {id:'KP04',label:'The quiet return / without interrogation',shape:'vertical',
  approxAudioWindowSeconds:[157,193],
  sourceMotifs:['hall light','spare key','threshold'],
  fictionProposal:'Later, someone returns in silence. The hall remains lit; no explanation is demanded or supplied.',
  panel:'Long vertical image: doorframe, low lamp, a key beside a shelf; empty negative space is the subject.',
  lens:'slow hold; no reaction close-up; silence remains permitted',
  palette:'midnight indigo, one amber light',motion:'almost none; let the room carry the pause',soundCue:'stripped-back passage',
  refusal:'A fictional return is not evidence of anyone returning in life.'},
 {id:'KP05',label:'The house makes room',shape:'splash',
  approxAudioWindowSeconds:[193,213.12],
  sourceMotifs:['cooling cup','easing rain','window','chair'],
  fictionProposal:'The room changes without magically fixing what was broken. The open place stays open.',
  panel:'One nearly wordless splash: cooling cup in foreground; rain softened at the window; the chair remains visible.',
  lens:'gentle pullback and dissolve to the house exterior',
  palette:'after-rain green and late morning gold',motion:'a small curtain breathes in the air',soundCue:'warm return and intimate fade',
  refusal:'The invitation is an image, not a promise of physical arrival.'}
]);
export function proposeFromSongPointer(pointer,{localMediaVerified=false}={}){
 validateSongPointer(pointer);
 insist(typeof localMediaVerified==='boolean','verification flag must be explicit');
 const base={
  schema:'story-dna/song-to-panel-crossing/v0',
  status:'HOLD',admission:'NONE',publication:'NONE',
  source:{
   title:pointer.title,
   mediaIdentity:'sha256:'+pointer.sourceFile.sha256,
   mediaBytes:pointer.sourceFile.sizeBytes,
   durationSeconds:pointer.sourceFile.durationSeconds,
   sourceClass:'owner-uploaded-local-media',
   localMediaVerifiedThisRun:localMediaVerified,
   sourceMediaCommitted:false,
   lyricsPublished:false,
   platformTrackId:null,
   rightsStatus:'unreviewed; permission to propose is not publication or licensing',
   attribution:'MP3 embedded artist tag: '+pointer.creditedArtistTag
  },
  observations:{
   mode:'human-listening + provided song text',
   sound:pointer.observedCreativeMaterial.sonicTexture,
   objectMotifs:pointer.observedCreativeMaterial.objectMotifs,
   relationalArc:pointer.observedCreativeMaterial.emotionalArc,
   noFactualAutobiographyAsserted:true
  },
  storyDNA:{
   mode:'FORK_PROPOSAL',
   title:'The Fourth Beat / A Place Kept Open',
   newFictionalWorld:'The House of Ordinary Weather — exploratory, not canon',
   fictionalCharacters:['the Returner (anonymous silhouette)','the Keeper (anonymous silhouette)'],
   invariant:'Care is expressed by making space rather than requiring explanations.',
   counterReading:'The house may be a metaphor for interior acceptance, not a literal residence or reunion.',
   unresolved:'Does keeping an empty place demand return, or does it honor someone’s freedom not to arrive?',
   noRealPersonMapping:true,
   noIdentityOrCanonTransfer:true
  },
  panels:scenes.map(({refusal,...scene})=>({...scene,sourceStatus:'object motif noted in supplied song, scene is an imaginative proposal',guardrail:refusal})),
  crossings:{
   sia:{phase:'NEEDS_TRACK_PLATFORM_ID',exactLocalMediaSha256:pointer.sourceFile.sha256,trackId:null,albumMembership:null,
    note:'SIA must not infer platform ID, generation ancestry or album placement from title.'},
   lemonPRESS:{schema:'panel-loom/v1',title:'The Fourth Beat / A Place Kept Open',status:'CANDIDATE',reading:'ltr',
    panels:scenes.map((s,i)=>({id:s.id,page:'01',shape:s.shape,staging:s.panel,caption:'',speech:'',sfx:'',
      editingNotes:'Editable draft only; proposed beat '+(i+1)+' of 5. Source motif: '+s.sourceMotifs.join(', ')+'. '+s.refusal}))},
   vidmage:{status:'SHOTLIST_ONLY_NOT_RENDERED',shots:scenes.map(s=>({panelRef:s.id,camera:s.lens,motion:s.motion,palette:s.palette,
    approximateSongWindowSeconds:s.approxAudioWindowSeconds,editorialTimingOnly:true}))},
   abundent:{status:'UNISSUED_SELECTION_ONLY',inputKind:'song',suggestedChambers:['FOSSIL-JUKEBOX','ORCHARD-CINEMA'],
    previewCanUseTitle:true,publicAudioLink:null,noAutomaticSubmission:true}
  },
  gates:[
   'Human confirms whether this private song may be used beyond the current proposal.',
   'Source owner supplies an actual public track ID or authorizes a source-safe SIA local record.',
   'Human reviews five editable panels; do not auto-publish lyrics, images, audio or character identities.',
   'lemonPRESS and VidMage separately accept or refuse any actual editorial/render requests.',
   'The Abundent proposal is not a live published audiovisual work.'
  ]
 };
 const id='sha256:'+sha(Buffer.from(JSON.stringify(base),'utf8'));
 return Object.freeze({...base,id});
}
