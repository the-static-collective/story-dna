import {createHash} from 'node:crypto';
import {buildRegistry} from './character-registry.mjs';

const hash = text => createHash('sha256').update(text).digest('hex');
export const BANK_SCHEMA = 'static-story-dna-bank/v1';

/**
 * Explicit, read-only projection into the pre-existing offline Story DNA Bank.
 * The Bank's free-form cards are NOT source truth or authority to cross worlds.
 */
export function registryToBankExport(raw) {
  const r=buildRegistry(raw);
  if([...r.characters,...r.variants,...r.appearances,...r.bonds].some(x=>x.source.visibility!=='public'))
    throw new TypeError('Bank export refused: nonpublic source objects must be separately cleared');
  const byId=new Map(r.characters.map(c=>[c.characterId,c]));
  const cards=[];
  const card=(id,kind,name,world,detail,drive,source,status)=>{
    const limits={id:140,name:120,world:100,detail:600,drive:450,source:500,status:300};
    const data={id,kind,name,world,detail,drive,source,status};
    for(const [field,max] of Object.entries(limits)){
      if(typeof data[field]!=='string'||!data[field].trim()||data[field].length>max)
        throw new TypeError('Bank card '+field+' exceeds safe import limits; refusing silent truncation');
    }
    if(!source.startsWith('https://') || [...source].some(c => c.charCodeAt(0) <= 32))throw new TypeError('Bank export requires an HTTPS public source locator');
    return {...data,custom:true};
  };
  for(const c of r.characters)cards.push(card(
    c.characterId,'person',c.displayName,c.world,
    `PROPOSAL PROFILE · ${c.visual.silhouette} · ${c.narrative.constraint}`,
    `DESIRE: ${c.narrative.desire}. REFUSES: ${c.narrative.refusal}. QUESTION: ${c.narrative.unresolved}`,
    c.source.locator,'CANDIDATE / NO CROSSWORLD CHARACTER RIGHTS / SOURCE-'+c.source.classification.toUpperCase()
  ));
  const worlds=[...new Set(r.characters.map(c=>c.world))].sort();
  for(const w of worlds){
    const c=r.characters.find(x=>x.world===w);
    cards.push(card(
      'sdna:world:'+hash(w),'place',w,w,
      'Provisional fictional world label from an originating story proposal, not an independently verified place.',
      'A different story can borrow a fictional *theme*, but setting traversal is only a candidate until approved by originating owners.',
      c.source.locator,'PROPOSED WORLD LABEL / NOT A VERIFIED SETTING BIBLE'
    ));
  }
  for(const b of r.bonds) {
    const names=[byId.get(b.fromCharacterId).displayName,byId.get(b.toCharacterId).displayName];
    const label=names.join(' × ');
    cards.push(card(
      'sdna:bond:'+b.bondId.slice(7),'relation',label,b.world,
      `CANDIDATE SAME-WORLD RELATIONSHIP · ${b.arc.relationship}`,
      `CONFLICT: ${b.arc.conflict}. CHOICE: ${b.arc.choice}. REMAINDER: ${b.arc.remainder}`,
      b.source.locator,'SOURCE-LABELED FICTIONAL BOND / NO CANON ADMISSION'
    ));
    cards.push(card(
      'sdna:thread:'+b.bondId.slice(7),'thread',`Unfinished: ${label}`,b.world,
      `PROPOSAL PLOT THREAD · ${b.arc.remainder}`,
      `A future story may explore "${b.arc.remainder}", preserving independent source continuity.`,
      b.source.locator,'UNADMITTED NARRATIVE QUESTION / ANALOGY ONLY'
    ));
  }
  for(const v of r.variants){
    const c=byId.get(v.characterId);
    cards.push(card(
      'sdna:variant:'+v.variantId.slice(7),'artifact',
      `Variant: ${c.displayName} · ${v.variantKey}`,c.world,
      `VISUAL PROPOSAL · ${v.description}`,
      `Changed: ${v.changedVisual.join('; ')}. Protected invariant: ${v.invariantPreservationNote}`,
      v.source.locator,'UNVERIFIED VARIANT / NOT A NEW CHARACTER / NOT REFERENCE ART'
    ));
  }
  if(new Set(cards.map(x=>x.id)).size!==cards.length)throw new TypeError('Duplicate Bank card identity');
  return {
    schema:BANK_SCHEMA,custom:cards,
    exportedAt:'DETERMINISTIC_NO_CLOCK',
    provenance:{registryId:r.registryId,status:'CANDIDATE-ONLY',sourceClassification:'PROPOSAL',intent:'OFFLINE_RECOMBINATION'},
  };
}
