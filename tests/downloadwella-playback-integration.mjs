import assert from 'node:assert/strict'
import {createServer} from 'node:http'
import {spawn} from 'node:child_process'
const wrappers=[0,1,2].map(i=>`https://downloadwella.com/fixture${i}/The.Body.S01E0${i+1}.mkv.html`)
const target='https://dwbe02.downloadwella.com/d/fixture/The.Body.S01E01.mkv'
let resolutions=0
const delivered=[]
const upstream=createServer(async(req,res)=>{
 const u=new URL(req.url,'http://127.0.0.1')
 if(u.pathname.startsWith('/api/movie/')){
  res.setHeader('Content-Type','application/json')
  res.end(JSON.stringify({data:{title:'The Body',path:'the-body-s01-tv-series/',downloadItems:wrappers.map((intermediateUrl,i)=>({type:'episode',text:`Episode ${i+1}`,intermediateUrl})),tags:[]}}));return
 }
 if(u.pathname==='/api/resolve-link'){
  let raw='';for await(const chunk of req)raw+=chunk
  const body=JSON.parse(raw);resolutions++
  res.setHeader('Content-Type','application/json')
  const directLink=body.intermediateUrl===wrappers[0]?target:'https://127.0.0.1/private.mkv'
  res.end(JSON.stringify(body.intermediateUrl===wrappers[2]?{success:false}:{success:true,directLink}));return
 }
 if(u.pathname==='/api/download-file'||u.pathname==='/api/compatible-file'){
  delivered.push({endpoint:u.pathname,url:u.searchParams.get('url')})
  if(u.pathname==='/api/download-file'){
   res.writeHead(206,{'Content-Type':'application/octet-stream','Content-Length':'4','Content-Range':'bytes 0-3/100','Accept-Ranges':'bytes'})
   res.end(Buffer.from([0x1a,0x45,0xdf,0xa3]))
  }else{res.writeHead(200,{'Content-Type':'video/mp4'});res.write('controlled compatible stream');res.end()}
  return
 }
 res.writeHead(404);res.end()
})
await new Promise(r=>upstream.listen(0,'127.0.0.1',r))
const child=spawn('node',['.next/standalone/server.js'],{env:{...process.env,HOSTNAME:'127.0.0.1',PORT:'3346',FILMBASE_API_URL:`http://127.0.0.1:${upstream.address().port}`,TMDB_API_READ_TOKEN:'',TMDB_API_KEY:''},stdio:'ignore'})
const base='http://127.0.0.1:3346'
const query=new URLSearchParams({path:'the-body-s01-tv-series/',offer:'0'})
try{
 let ready=false;for(let i=0;i<100;i++){try{if((await fetch(`${base}/api/healthz`)).ok){ready=true;break}}catch{};await new Promise(r=>setTimeout(r,100))}
 assert.ok(ready)
 const direct=await fetch(`${base}/api/watch?${query}`,{headers:{Range:'bytes=0-3'}})
 assert.equal(direct.status,206)
 assert.equal(direct.headers.get('content-type'),'video/x-matroska')
 assert.deepEqual([...new Uint8Array(await direct.arrayBuffer())],[0x1a,0x45,0xdf,0xa3])
 assert.equal(delivered[0].url,target,'landing page must be resolved, not streamed as HTML')
 query.set('mode','compatible');query.set('session','4b6afdf5-2756-4707-a202-574d216acc63');query.set('start','0')
 const compatible=await fetch(`${base}/api/watch?${query}`)
 assert.equal(compatible.status,200);await compatible.arrayBuffer()
 assert.equal(delivered.at(-1).endpoint,'/api/compatible-file')
 assert.equal(delivered.at(-1).url,target)
 assert.equal(resolutions,1,'nearby range/compatible requests reuse a short-lived resolved link')
 for(const offer of ['1','2']){
  query.set('offer',offer)
  const rejected=await fetch(`${base}/api/watch?${query}`);await rejected.body?.cancel()
  assert.equal(rejected.status,502,'unsafe or failed resolution must not become a proxy destination')
 }
 assert.equal(delivered.length,2,'no unsafe resolved destination reached either media backend')
 console.log('Downloadwella playback: landing-page resolution, native ranges, conversion, bounded token reuse and unsafe-source rejection passed')
}finally{child.kill('SIGTERM');await new Promise(r=>child.once('exit',r));await new Promise(r=>upstream.close(r))}
