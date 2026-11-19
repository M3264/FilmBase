import assert from 'node:assert/strict'
import { createServer } from 'node:http'
import { spawn } from 'node:child_process'

const requests=[]
let busy=false
let busyOnce=false
const media=Buffer.from('test-controlled-converted-response')
const upstream=createServer((req,res)=>{
 const url=new URL(req.url,'http://127.0.0.1')
 requests.push({path:url.pathname,query:Object.fromEntries(url.searchParams),range:req.headers.range})
 if(url.pathname.startsWith('/api/movie/')){
  res.setHeader('Content-Type','application/json')
  res.end(JSON.stringify({title:'Compatible Film (2026)',download_links:[{url:'https://loadedfiles.net/fixture/Compatible.Film.2026.mkv',label:'Download'}]}))
 }else if(url.pathname==='/api/compatible-file'){
  if(busy||busyOnce){busyOnce=false;res.writeHead(503,{'Content-Type':'application/json','Retry-After':'3'});res.end('{"error":"busy"}');return}
  res.writeHead(200,{'Content-Type':'video/mp4','Accept-Ranges':'none'})
  res.write(media);res.end()
 }else{res.writeHead(404);res.end()}
})
await new Promise(resolve=>upstream.listen(0,'127.0.0.1',resolve))
const api=`http://127.0.0.1:${upstream.address().port}`
const base='http://127.0.0.1:3345'
const child=spawn('node',['.next/standalone/server.js'],{env:{...process.env,HOSTNAME:'127.0.0.1',PORT:'3345',FILMBASE_API_URL:api,TMDB_API_READ_TOKEN:'',TMDB_API_KEY:''},stdio:'ignore'})
const session='4b6afdf5-2756-4707-a202-574d216acc63'
const query=new URLSearchParams({path:'fb-999999',offer:'0',mode:'compatible',session,start:'120.5'})
try{
 let ready=false
 for(let i=0;i<100;i++){
  try{if((await fetch(`${base}/api/healthz`)).ok){ready=true;break}}catch{}
  await new Promise(r=>setTimeout(r,100))
 }
 assert.ok(ready,'standalone server started')
 const response=await fetch(`${base}/api/watch?${query}`,{headers:{Range:'bytes=0-'}})
 const bytes=Buffer.from(await response.arrayBuffer())
 assert.equal(response.status,200)
 assert.equal(response.headers.get('content-type'),'video/mp4')
 assert.equal(response.headers.get('accept-ranges'),'none')
 assert.equal(response.headers.get('content-range'),null)
 assert.deepEqual(bytes,media)
 const converted=requests.find(r=>r.path==='/api/compatible-file')
 assert.ok(converted,'selected compatible backend, not the download endpoint')
 assert.equal(converted.query.session,session)
 assert.equal(converted.query.start,'120.5')
 assert.equal(converted.query.url,'https://loadedfiles.net/fixture/Compatible.Film.2026.mkv')
 assert.equal(converted.range,undefined,'byte ranges cannot seek a freshly encoded stream')
 const callsBeforeHead=requests.length
 const head=await fetch(`${base}/api/watch?${query}`,{method:'HEAD'})
 assert.equal(head.status,405,'HEAD must not invoke a conversion')
 assert.equal(requests.length,callsBeforeHead)
 for(const [name,value] of [['mode','unknown'],['session','bad'],['start','-1'],['start','86401'],['start','1e2']]){
  const invalid=new URLSearchParams(query);invalid.set(name,value)
  const rejected=await fetch(`${base}/api/watch?${invalid}`);await rejected.body?.cancel()
  assert.equal(rejected.status,400,`${name}=${value}`)
 }
 busyOnce=true
 const recovered=await fetch(`${base}/api/watch?${query}`)
 assert.equal(recovered.status,200,'same-session replacement busy response is retried briefly')
 await recovered.arrayBuffer()
 busy=true
 const unavailable=await fetch(`${base}/api/watch?${query}`);await unavailable.body?.cancel()
 assert.equal(unavailable.status,503)
 assert.equal(unavailable.headers.get('retry-after'),'3')
 console.log('compatible proxy: source, session, seek, streaming headers, input rejection, HEAD safety and busy response passed')
}finally{
 child.kill('SIGTERM');await new Promise(resolve=>child.once('exit',resolve))
 await new Promise(resolve=>upstream.close(resolve))
}
