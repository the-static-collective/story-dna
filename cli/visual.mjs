#!/usr/bin/env node
import {readFileSync,writeFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {createSpecimenRegistry} from '../fixtures/characters.candidate.mjs';
import {createVisualWorkbench} from '../src/visual-workbench.mjs';
import {makeVisualSheet,makeVisualAttempt,makeVisualReview,makeRenderHandoff} from '../src/visual-continuity.mjs';

const STYLES=['RENJI_JP_RELAY_COLOR_001','RENJI_MONO_SOURCE_STACK_001'];
const style=stackId=>({
  stackId,ownerRepository:'the-static-collective/lemonPRESS',
  sourceHeadSha:'eba5b6f0b056330b63e82b95020b2656befc264a',
  referencePath:'works/style-stacks/'+stackId+'/stack.json',purpose:'style-only'
});
const find=name=>{
  const p=createSpecimenRegistry().characters.find(c=>c.displayName.toLowerCase()===name.toLowerCase());
  if(!p)throw Error('Unknown character: '+name);
  return p;
};
const output=text=>process.stdout.write(typeof text==='string'?text:JSON.stringify(text,null,2)+'\n');
const [op='workbench',arg1='Renji',arg2,...rest]=process.argv.slice(2);
try {
  if(op==='workbench') {
    const html=createVisualWorkbench({characterName:arg1});
    if(arg2) {const file=resolve(arg2);writeFileSync(file,html,{flag:'wx'});output('Created local Character Mirror: '+file+'\n');}
    else output(html);
  }
  else if(op==='sheet'){
    output(makeVisualSheet(find(arg1),{notes:['Source is a fictional development proposal, not approved visual art.']}));
  }
  else if(op==='handoff'){
    const p=find(arg1),selected=arg2||STYLES[0];
    if(!STYLES.includes(selected))throw Error('Unknown style stack: '+selected);
    const sheet=makeVisualSheet(p,{notes:['Source is a fictional development proposal, not approved visual art.']});
    output(makeRenderHandoff(sheet,{style:style(selected),variantName:'style-exploration',
      brief:'Explore line and color treatment without claiming source character likeness beyond recorded visual anchors.'}));
  }
  else if(op==='review-draft'){
    const draft=JSON.parse(readFileSync(resolve(arg1),'utf8'));
    if(draft?.schema!=='story-dna/visual-review-draft/v0'||draft.posture!=='HOLD'||
       draft.authenticated!==false||draft.canonicalAdmission!==false||draft.publication!==false)
      throw Error('Expected unsigned held review draft, without any authority claim');
    const p=createSpecimenRegistry().characters.find(c=>c.characterId===draft.characterId);
    if(!p||p.profileId!==draft.profileId)throw Error('Unknown or stale character profile');
    const baseSheet=makeVisualSheet(p,{notes:[
      'Source is a fictional proposal; actual source image likeness is not verified.',
      'A locally selected reference file is only operator-declared; the app cannot authenticate authorship or rights.'
    ]});
    if(draft.visualSheetTemplateId!==baseSheet.sheetId)throw Error('Browser draft bound to a different visual sheet template');
    if(draft.selectedReference!==null) {
      if(typeof draft.selectedReference!=='object')throw Error('Invalid optional reference');
    }
    const sheet=makeVisualSheet(p,{references:draft.selectedReference?[{
      label:draft.selectedReference.label,
      sha256:draft.selectedReference.sha256,bytes:draft.selectedReference.bytes,
      mediaType:draft.selectedReference.mediaType,
      sourceLocator:draft.selectedReference.sourceLocator,note:draft.selectedReference.note
    }]:[],notes:[
      'Source is a fictional proposal; actual source image likeness is not verified.',
      'A locally selected reference file is only operator-declared; the app cannot authenticate authorship or rights.'
    ]});
    const attempt=makeVisualAttempt(sheet,{
      media:draft.candidateMedia,style:draft.style,origin:draft.rendererOrigin,
      note:draft.renderNote
    });
    if(!STYLES.includes(attempt.style.stackId) || attempt.style.sourceHeadSha!==style(attempt.style.stackId).sourceHeadSha ||
       attempt.style.referencePath!==style(attempt.style.stackId).referencePath)
      throw Error('Style binding cannot be expanded beyond the declared lemonPRESS proposal');
    const review=makeVisualReview(sheet,attempt,{
      reviewer:draft.reviewer,checkedAnchors:draft.checkedAnchors,
      checkedInvariants:draft.checkedInvariants,uncertainties:draft.uncertainties,
      comments:draft.comments
    });
    output({schema:'story-dna/visual-comparison-packet/v0',posture:'HOLD',sheet,attempt,review,
      published:false,permissionVerified:false,
      noModelWasCalled:true,
      warning:'The filename, SHA-256 and reviewer statements were provided by an untrusted local browser draft. No actual media bytes, person credentials, artistic equivalence or rights have been independently verified.'});
  }
  else throw Error('Usage: node cli/visual.mjs [workbench [Renji|Neri Vale|Tallow] [output.html] | sheet <name> | handoff <name> [styleStackId] | review-draft file.json]');
}catch(e){process.stderr.write(e.message+'\n');process.exitCode=1}
