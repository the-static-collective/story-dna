#!/usr/bin/env node
import {writeFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {
  queryCharacters,suggestEchoes,echoBonds,threadFromBond
} from '../src/character-registry.mjs';
import {renderRegistryHtml} from '../src/registry-report.mjs';
import {createSpecimenRegistry} from '../fixtures/characters.candidate.mjs';
const r=createSpecimenRegistry();
const [operation='list',argument,...remaining]=process.argv.slice(2);
const output=(data)=>process.stdout.write(JSON.stringify(data,null,2)+'\n');
try {
  switch(operation){
    case 'list': output(r.characters.map(c=>({id:c.characterId,displayName:c.displayName,world:c.world,profileId:c.profileId,classification:c.classification})));break;
    case 'snapshot': output(r);break;
    case 'show': {
      if(!argument)throw Error('Usage: node cli/characters.mjs show <name | characterId>');
      const matches=r.characters.filter(c=>c.characterId===argument||c.displayName.toLowerCase()===argument.toLowerCase());
      if(!matches.length)throw Error('No exact character identity found');
      output(matches);break;
    }
    case 'search': output(queryCharacters(r,{q:argument??''}));break;
    case 'echoes':output(suggestEchoes(r));break;
    case 'threads':output(r.bonds.map(b=>threadFromBond(r,b.bondId)));break;
    case 'echo-bonds':{
      const [a,b]=r.bonds;
      output(echoBonds(r,a.bondId,b.bondId,{seed:argument?Number(argument):325}));break;
    }
    case 'report':{
      const html=renderRegistryHtml(r);
      if(argument){writeFileSync(resolve(argument),html,{flag:'wx'});process.stdout.write('Wrote read-only report '+resolve(argument)+'\n');}
      else process.stdout.write(html);
      break;
    }
    default:throw Error('Usage: node cli/characters.mjs [list | snapshot | show <name> | search <term> | echoes | threads | echo-bonds [seed] | report [output.html]]');
  }
}catch(e){process.stderr.write(e.message+'\n');process.exit(1);}
