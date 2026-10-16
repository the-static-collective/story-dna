import {
  CHARACTER_SCHEMA,VARIANT_SCHEMA,APPEARANCE_SCHEMA,BOND_SCHEMA,REGISTRY_SCHEMA,
  makeCharacter,makeVariant,makeAppearance,makeBond,buildRegistry
} from '../src/character-registry.mjs';

const caseSource={
  locator:'https://github.com/the-static-collective/lemonPRESS/blob/7465597674b0f1561ad4e354ef9817a1d0d187b4/proposals/unfinished-business-manga-001.md',
  revision:'7465597674b0f1561ad4e354ef9817a1d0d187b4',
  basis:'Developmental interpretation of an unadmitted six-page CASE ZERO manga proposal; not verified character canon or likeness.',
  classification:'proposal',visibility:'public',rights:'unverified'
};
const roomSource={
  locator:'https://the-static-collective.gitbook.io/the-static-collective-docs/',
  revision:'the-room-inside-the-room GitBook story seed; immutable page revision not verified',
  basis:'Working interpretation of the Renji/rat doorway setup, not authenticated franchise continuity or character appearance.',
  classification:'proposal',visibility:'public',rights:'unverified'
};
const caseWorld='UNFINISHED BUSINESS — CASE ZERO (draft)';
const roomWorld='THE ROOM INSIDE THE ROOM (draft)';
const caseIdentity='the-static-collective/unfinished-business-case-zero';
const roomIdentity='the-static-collective/the-room-inside-the-room';

export function createSpecimenRegistry() {
  const neri=makeCharacter({
    schema:CHARACTER_SCHEMA,identity:{namespace:caseIdentity,localKey:'neri-courier'},
    world:caseWorld,displayName:'Neri Vale',aliases:['Neri'],classification:'CANDIDATE',source:caseSource,parentProfileId:null,
    narrative:{
      desire:'offer a passage while protecting the passenger’s choice',
      constraint:'the case must remain attributable; an ending cannot be imposed',
      refusal:'refuse to let another authority decide a passenger’s destination',
      unresolved:'who chooses a destination when passage opens?'
    },
    visual:{silhouette:'Illustrative proposal: young courier holding a cassette, not canonical reference art',
      anchors:['carried cassette as development motif'],palette:['undetermined'],avoid:['treating draft visuals as official likeness']},
    invariants:['release is not erasure','an unanswered ending may remain open'],
    motifs:['passage','choice','destination','cassette']
  });
  const tallow=makeCharacter({
    schema:CHARACTER_SCHEMA,identity:{namespace:caseIdentity,localKey:'tallow-clerk'},
    world:caseWorld,displayName:'Tallow',aliases:['Lantern-headed clerk'],classification:'CANDIDATE',source:caseSource,parentProfileId:null,
    narrative:{
      desire:'keep an honest record of the choices that remain',
      constraint:'a clerk can witness but must not assign a traveler’s future',
      refusal:'refuse to classify unresolved lives as errors',
      unresolved:'can a recorded ending leave the passenger free to continue?'
    },
    visual:{silhouette:'Draft source premise: a lantern-headed clerk; further detail not established',
      anchors:['lantern head in development proposal'],palette:['undetermined'],avoid:['inventing fixed uniform colors']},
    invariants:['the clerk records without granting destination authority'],
    motifs:['lantern','record','choice','passage']
  });
  const renji=makeCharacter({
    schema:CHARACTER_SCHEMA,identity:{namespace:roomIdentity,localKey:'renji-maker'},
    world:roomWorld,displayName:'Renji',aliases:['Workshop Renji'],classification:'CANDIDATE',source:roomSource,parentProfileId:null,
    narrative:{
      desire:'offer a passage without commanding another creature’s choice',
      constraint:'making a doorway cannot compel anyone to pass through it',
      refusal:'refuse to treat waiting as evidence of failure',
      unresolved:'who chooses the destination when passage is possible but not taken?'
    },
    visual:{silhouette:'No verified official character design; workshop setting only',
      anchors:['workshop context as source proposal'],palette:['undetermined'],avoid:['guessing a definitive Renji face or costume']},
    invariants:['the crossing remains voluntary','the door may exist without being used'],
    motifs:['passage','choice','doorway','waiting']
  });
  const rat=makeCharacter({
    schema:CHARACTER_SCHEMA,identity:{namespace:roomIdentity,localKey:'doorway-rat'},
    world:roomWorld,displayName:'The Waiting Rat (development placeholder)',
    aliases:['Rat at the doorway'],classification:'CANDIDATE',source:roomSource,parentProfileId:null,
    narrative:{
      desire:'choose when or whether to use an offered passage',
      constraint:'a doorway is available but may not be trusted or perceived',
      refusal:'refuse movement when the route is not personally chosen',
      unresolved:'is waiting itself a choice when passage is open?'
    },
    visual:{silhouette:'Rat in a bounded habitat; no verified unique markings',
      anchors:['small animal scale'],palette:['undetermined'],avoid:['assigning unverified coloration','anthropomorphizing observed animal agency']},
    invariants:['proposed animal behavior is fiction; no real animal is being monitored'],
    motifs:['passage','choice','waiting','doorway']
  });
  const bondCase=makeBond({
    schema:BOND_SCHEMA,fromCharacterId:neri.characterId,toCharacterId:tallow.characterId,
    world:caseWorld,key:'courier-clerk-release-choice',kind:'witness-without-ownership',
    arc:{
      desire:'offer travelers a future they can choose',
      relationship:'the courier seeks release while the clerk preserves attributable alternatives',
      conflict:'the system wants an ending that would erase passenger autonomy',
      choice:'make passage available without assigning destinations',
      consequence:'the record survives even if passengers leave',
      remainder:'what remains unfinished after a voluntary release?'
    },
    limits:['recording a possible departure never constitutes consent','release does not erase history'],
    source:caseSource,classification:'CANDIDATE'
  });
  const bondRoom=makeBond({
    schema:BOND_SCHEMA,fromCharacterId:renji.characterId,toCharacterId:rat.characterId,
    world:roomWorld,key:'maker-waiting-rat-voluntary-door',kind:'maker-without-command',
    arc:{
      desire:'offer another creature passage without coercion',
      relationship:'the maker enables a crossing while the rat retains the choice to remain',
      conflict:'availability is mistaken for obligation',
      choice:'leave the door present and do not force a crossing',
      consequence:'the act of waiting becomes part of the story rather than a failure',
      remainder:'does passage become real only when someone chooses it?'
    },
    limits:['availability is not assent','the animals remain agents in the fiction'],
    source:roomSource,classification:'CANDIDATE'
  });
  const variant=makeVariant({
    schema:VARIANT_SCHEMA,characterId:renji.characterId,variantKey:'relay-color-exploration',
    baseProfileId:renji.profileId,variantKind:'art-style',description:'An experimental color-relay treatment of the same proposed Renji persona; not a newly proven character.',
    changedVisual:['explore dramatic duotone ink highlights','preserve a distinct visual revision receipt'],
    changedNarrative:[],invariantPreservationNote:'no proposed change to the doorway consent invariant',
    source:roomSource,classification:'CANDIDATE'
  });
  const appearances=[
    makeAppearance({
      schema:APPEARANCE_SCHEMA,characterId:neri.characterId,profileId:neri.profileId,
      workId:'lemonPRESS/unadmitted-case-zero-proposal',sceneRef:'six-page storyboard — candidate appearances',
      variantId:null,narrativeRole:'courier seeking an outcome for the train passengers',
      source:caseSource,classification:'CANDIDATE'
    }),
    makeAppearance({
      schema:APPEARANCE_SCHEMA,characterId:renji.characterId,profileId:renji.profileId,
      workId:'GitBook/room-inside-room-story-seed',sceneRef:'manga workshop / voluntary animal doorway concept',
      variantId:variant.variantId,narrativeRole:'maker who can offer but cannot command passage',
      source:roomSource,classification:'CANDIDATE'
    })
  ];
  return buildRegistry({
    schema:REGISTRY_SCHEMA,
    characters:[neri,tallow,renji,rat],
    variants:[variant],appearances,
    bonds:[bondCase,bondRoom]
  });
}
