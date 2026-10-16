import test from "node:test";
import assert from "node:assert/strict";
import { once } from "node:events";
import { server } from "./server.mjs";

async function fixture(t){
 server.listen(0,"127.0.0.1");
 await once(server,"listening");
 t.after(()=>server.close());
 return "http://127.0.0.1:"+server.address().port;
}
async function post(base,path,payload){
 const r=await fetch(base+path,{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify(payload)});
 return {status:r.status,data:await r.json()};
}
test("serves original source snapshot and deterministic ECHO / ENCOUNTER gates",async t=>{
 const base=await fixture(t);
 const r=await fetch(base+"/api/snapshot");assert.equal(r.status,200);
 const snapshot=await r.json();assert.equal(snapshot.counts.elements,42);
 assert.equal(snapshot.posture,"HOLD");
 const pair=snapshot.defaults.fixturePair;
 const echoed=await post(base,"/api/recombine",pair);
 assert.equal(echoed.data.engine.status,"candidate");
 assert.equal(echoed.data.engine.candidate.beats.length,5);
 assert.equal(echoed.data.engine.candidate.publication,"NONE");
 const denied=await post(base,"/api/recombine",{...pair,mode:"encounter"});
 assert.equal(denied.data.engine.status,"refused");
 const html=await (await fetch(base+"/")).text();
 assert.match(html,/LOCAL STORY BANK/);
});
test("local unverified private threads refuse, explicitly declared public analogy can proceed",async t=>{
 const base=await fixture(t);
 const a={schema:"story-dna/relationship-thread/v0",key:"local-a",title:"A",world:"One",participants:["A"],arc:{desire:"to stay",relationship:"an old promise",conflict:"a closed road",choice:"to pause",consequence:"arrival delayed",remainder:"who returns"},constraints:[],source:{locator:"local:a",revision:"draft",basis:"user-declared",classification:"proposal",visibility:"private",rights:"unverified"},controls:{fictional:true,analogyAllowed:false,characterCrossingAllowed:false}};
 const b=structuredClone(a);b.key="local-b";b.title="B";b.world="Two";
 const params={leftThread:a,rightThread:b,mode:"echo",seed:325};
 const denied=await post(base,"/api/local-combine",params);
 assert.equal(denied.data.engine.status,"refused");
 a.source.visibility=b.source.visibility="public";
 a.controls.analogyAllowed=b.controls.analogyAllowed=true;
 const echo=await post(base,"/api/local-combine",params);
 assert.equal(echo.data.engine.status,"candidate");
 assert.equal(echo.data.engine.candidate.admission,"NONE");
 const encounter=await post(base,"/api/local-combine",{...params,mode:"encounter"});
 assert.equal(encounter.data.engine.status,"refused");
});
test("unknown paths and invalid input are bounded",async t=>{
 const base=await fixture(t);
 assert.equal((await fetch(base+"/unknown")).status,404);
 const result=await post(base,"/api/recombine",{leftId:"",rightId:"",mode:"echo",seed:325});
 assert.equal(result.status,400);
});