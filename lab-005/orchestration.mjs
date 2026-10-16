/** Browser laboratory source projection. Not canonical registry or historical STORYSHIP. */
import fixture from "../fixtures/relationship-passenger.json" with {type:"json"};
import blueNight from "../fixtures/sia/blue-night-morning.observation.json" with {type:"json"};
import weekTogether from "../fixtures/sia/a-week-together.observation.json" with {type:"json"};
import {createSpecimenRegistry} from "../fixtures/characters.candidate.mjs";
import {threadFromBond,suggestEchoes} from "../src/character-registry.mjs";
import {validateThread,composeRelationship,navigationProjection,panelLoomDraft} from "../src/relationship-passenger.mjs";
import {registryToBankExport} from "../src/registry-bank-adapter.mjs";
import {bankExport} from "../adapters/sia/album-title-bridge.mjs";

const reg=createSpecimenRegistry(),fixtureThreads=fixture.threads.map(validateThread),sia=bankExport([blueNight,weekTogether]);
const people=new Map(reg.characters.map(c=>[c.characterId,c]));
const bonds=reg.bonds.map(b=>({record:b,thread:threadFromBond(reg,b.bondId)}));
const echoes=suggestEchoes(reg);
const clone=x=>JSON.parse(JSON.stringify(x));
function buildCatalog(){
 const elements=[],threads=new Map();
 function put(id,kind,name,world,summary,record,thread=null,extra={}){
  const o={id,kind,name,world,summary,locator:record?.source?.locator||null,revision:record?.source?.revision||null,rights:record?.source?.rights||"unverified",recordClassification:record?.classification||"CANDIDATE",resolvable:!!thread,resolveNote:thread?"Resolves via a recorded source relationship; no source character transfer.":"Observation only; no relationship is inferred.",...extra};
  elements.push(o);if(thread)threads.set(id,thread);
 }
 for(const t of fixtureThreads)put("thread:fixture:"+t.key,"thread",t.title,t.world,t.arc.remainder,t,t);
 for(const {record:b,thread:t} of bonds){
  const name=people.get(b.fromCharacterId).displayName+" × "+people.get(b.toCharacterId).displayName;
  put("thread:bond:"+b.bondId,"thread",name,b.world,t.arc.remainder,t,t);
  put("relation:"+b.bondId,"relation",name,b.world,b.arc.relationship,b,t);
 }
 for(const c of reg.characters){
  const owned=bonds.filter(x=>x.record.fromCharacterId===c.characterId||x.record.toCharacterId===c.characterId);
  put("character:"+c.characterId,"character",c.displayName,c.world,c.narrative.unresolved,c,owned.length===1?owned[0].thread:null,{dossier:{motifs:c.motifs,narrative:c.narrative,identity:c.identity,visual:c.visual}});
  for(const motif of c.motifs)put("motif:"+c.characterId+":"+encodeURIComponent(motif),"motif",motif,c.world,"Literal motif attributed to "+c.displayName,c);
 }
 for(const world of [...new Set(reg.characters.map(c=>c.world))]){
  const members=reg.characters.filter(c=>c.world===world),owned=bonds.filter(x=>x.record.world===world);
  put("setting:"+encodeURIComponent(world),"setting",world,world,members.length+" candidate profiles. Not an authenticated setting bible.",members[0],owned.length===1?owned[0].thread:null);
 }
 for(const card of sia.custom)put("motif:sia:"+card.id,"motif",card.name,card.world,card.detail,{source:{locator:card.source,revision:sia.exportedAt,rights:"unverified"}});
 for(const v of reg.variants)put("variant:"+v.variantId,"variant",people.get(v.characterId).displayName+" · "+v.variantKey,people.get(v.characterId).world,v.description,v);
 for(const a of reg.appearances)put("appearance:"+a.appearanceId,"appearance",people.get(a.characterId).displayName+" · "+a.sceneRef,people.get(a.characterId).world,a.narrativeRole,a);
 const order={character:0,relation:1,thread:2,setting:3,motif:4,variant:5,appearance:6};
 elements.sort((a,b)=>order[a.kind]-order[b.kind]||a.name.localeCompare(b.name)||a.id.localeCompare(b.id));
 return {elements,threads};
}
const built=buildCatalog();
export function createLaboratorySnapshot(){
 const worlds=[...new Set(reg.characters.map(c=>c.world))];
 return {schema:"story-dna/laboratory-snapshot/v0",experiment:"story-dna-laboratory-005",posture:"HOLD",canon:"NONE",admission:"NONE",registryId:reg.registryId,authority:reg.authority,note:"This is a source read projection; proposals are not canon.",
 counts:{characters:reg.characters.length,bonds:reg.bonds.length,variants:reg.variants.length,appearances:reg.appearances.length,fixtureThreads:fixtureThreads.length,echoes:echoes.length,siaTitleCards:sia.custom.length,elements:built.elements.length},
 elements:clone(built.elements),echoes:clone(echoes),
 graph:{rings:worlds.map(world=>({id:"setting:"+encodeURIComponent(world),label:world})),bodies:reg.characters.map(c=>({id:"character:"+c.characterId,label:c.displayName,ringId:"setting:"+encodeURIComponent(c.world)})),links:reg.bonds.map(b=>({id:b.bondId,kind:"bond",from:"character:"+b.fromCharacterId,to:"character:"+b.toCharacterId}))},
 defaults:{fixturePair:{leftId:"thread:fixture:"+fixtureThreads[0].key,rightId:"thread:fixture:"+fixtureThreads[1].key,mode:"echo",seed:325}},exports:{bank:registryToBankExport(reg),sia}};
}
function shell(mode,seed,left,right){return {schema:"story-dna/laboratory-reading/v0",posture:"HOLD",canon:"NONE",admission:"NONE",publication:"NONE",mode,seed,left,right}}
export function recombineElements({leftId,rightId,mode,seed}={}){
 const left=built.elements.find(e=>e.id===leftId)||null,right=built.elements.find(e=>e.id===rightId)||null,base=shell(mode,seed,left,right);
 if(!["echo","fork","encounter"].includes(mode)||!Number.isSafeInteger(seed)||seed<0)return {...base,engine:{status:"refused",message:"Invalid mode or seed"}};
 if(!left||!right)return {...base,engine:{status:"refused",message:"Unknown source element"}};
 if(left.id===right.id)return {...base,engine:{status:"unresolved",message:"Select two distinct narrative particulars."}};
 const a=built.threads.get(leftId),b=built.threads.get(rightId);
 if(!a||!b)return {...base,engine:{status:"unresolved",message:"This element is observation-only; no relationship thread is recorded."}};
 if(a.id===b.id)return {...base,engine:{status:"unresolved",message:"Both selections resolve to the same source thread."}};
 try{const candidate=composeRelationship(a,b,{mode,seed});
  return {...base,engine:{status:"candidate",candidate,navigation:navigationProjection(candidate),manga:panelLoomDraft(candidate),gates:[a,b].map(t=>({threadId:t.id,title:t.title,rights:t.source.rights,visibility:t.source.visibility,analogyAllowed:t.controls.analogyAllowed,characterCrossingAllowed:t.controls.characterCrossingAllowed}))}};
 }catch(e){return {...base,engine:{status:"refused",message:String(e.message),counterfactual:null}}}
}
export function probeEdit({leftId,rightId,mode,seed,beatIndex,text}={}){
 if(!Number.isInteger(beatIndex)||beatIndex<0||beatIndex>4||typeof text!=="string"||text.length>2000)return {schema:"story-dna/laboratory-tamper-probe/v0",applicable:false,message:"Invalid beat index or text"};
 const reading=recombineElements({leftId,rightId,mode,seed});
 if(reading.engine.status!=="candidate")return {schema:"story-dna/laboratory-tamper-probe/v0",applicable:false,message:"No sealed candidate"};
 const c=clone(reading.engine.candidate);c.beats[beatIndex]=text;
 try{navigationProjection(c);return {schema:"story-dna/laboratory-tamper-probe/v0",applicable:true,accepted:true,sealed:true,message:"Unmodified proposal still verifies"}}
 catch(e){return {schema:"story-dna/laboratory-tamper-probe/v0",applicable:true,accepted:false,sealed:false,message:String(e.message),packetId:c.id}}
}