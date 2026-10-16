/** Local-only Story DNA 005 adapter. Source-owned schemas stay in ../src. */
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createLaboratorySnapshot, recombineElements, probeEdit } from "../src/laboratory.mjs";
import { validateThread, composeRelationship, navigationProjection, panelLoomDraft } from "../src/relationship-passenger.mjs";

const root=dirname(fileURLToPath(import.meta.url));
const host=process.env.HOST||"127.0.0.1",port=Number(process.env.PORT||8085);
const staticFiles=new Map([
 ["/",["index.html","text/html; charset=utf-8"]],
 ["/app.js",["app.js","text/javascript; charset=utf-8"]],
 ["/style.css",["style.css","text/css; charset=utf-8"]]
]);
function respond(res,status,data){
 res.writeHead(status,{"content-type":"application/json; charset=utf-8","cache-control":"no-store","x-content-type-options":"nosniff"});
 res.end(JSON.stringify(data));
}
async function getBody(req){
 const chunks=[];let size=0;
 for await(const chunk of req){size+=chunk.length;if(size>48000)throw new Error("Request exceeds 48 KB");chunks.push(chunk)}
 return JSON.parse(Buffer.concat(chunks).toString("utf8"));
}
function validateSelection(v){
 if(!v||typeof v.leftId!=="string"||!v.leftId||v.leftId.length>400||typeof v.rightId!=="string"||!v.rightId||v.rightId.length>400||!["echo","fork","encounter"].includes(v.mode)||!Number.isSafeInteger(v.seed)||v.seed<0)throw new Error("Invalid selection");
}
function localCombine(v){
 if(!v||!["echo","fork","encounter"].includes(v.mode)||!Number.isSafeInteger(v.seed)||v.seed<0)throw new Error("Invalid local request");
 const a=validateThread(v.leftThread),b=validateThread(v.rightThread);
 const shell={schema:"story-dna/laboratory-reading/v0",posture:"HOLD",canon:"NONE",admission:"NONE",publication:"NONE",mode:v.mode,seed:v.seed,left:{id:a.id,kind:"thread",name:a.title,world:a.world},right:{id:b.id,kind:"thread",name:b.title,world:b.world}};
 try{
  const candidate=composeRelationship(a,b,{mode:v.mode,seed:v.seed});
  return {...shell,engine:{status:"candidate",candidate,navigation:navigationProjection(candidate),manga:panelLoomDraft(candidate),note:"User-authored browser drafts. Rights declaration is not independent authentication."}};
 }catch(e){return {...shell,engine:{status:"refused",message:String(e.message),gates:[],counterfactual:null}}}
}
const server=createServer(async(req,res)=>{
 try{
  if(req.method==="GET"&&staticFiles.has(req.url)){
   const [name,type]=staticFiles.get(req.url);
   const bytes=await readFile(resolve(root,name));
   res.writeHead(200,{"content-type":type,"cache-control":"no-store","x-content-type-options":"nosniff","content-security-policy":"default-src 'self'; img-src 'self' data:; script-src 'self'; style-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'none'; frame-ancestors 'none'"});
   return res.end(bytes);
  }
  if(req.method==="GET"&&req.url==="/api/snapshot")return respond(res,200,createLaboratorySnapshot());
  if(req.method==="POST"&&["/api/recombine","/api/local-combine","/api/probe"].includes(req.url)){
   const data=await getBody(req);
   if(req.url==="/api/local-combine")return respond(res,200,localCombine(data));
   validateSelection(data);
   if(req.url==="/api/probe"){
    if(!Number.isInteger(data.beatIndex)||data.beatIndex<0||data.beatIndex>4||typeof data.text!=="string"||data.text.length>2000)throw new Error("Invalid tamper probe");
    return respond(res,200,probeEdit(data));
   }
   return respond(res,200,recombineElements(data));
  }
  return respond(res,404,{error:"Not found"});
 }catch(error){return respond(res,400,{error:error instanceof Error?error.message:String(error)})}
});
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 server.listen(port,host,()=>console.log("Story DNA Laboratory 005 — http://"+host+":"+port));
}
export {server};