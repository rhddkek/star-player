/* 스타 플레이어 오프라인 캐시
   - 게임 화면(index.html 등): 인터넷이 되면 항상 새 버전(바뀐 게 없으면 304로 가볍게), 안 되면 저장본
   - 그림·소리 묶음(assets/이름-해시.js): 이름에 내용 해시가 붙어 바뀌면 이름도 바뀜 → 한 번 받으면 저장본 그대로 씀, 안 쓰는 옛 묶음은 지움 */
const C='sp-v3';
const FILES=['./','./index.html','./manifest.webmanifest','./icon-192.png','./icon-512.png'];
self.addEventListener('install',e=>{ e.waitUntil(caches.open(C).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting())); });
self.addEventListener('activate',e=>{ e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==C).map(k=>caches.delete(k)))).then(()=>self.clients.claim())); });
async function prune(c,html){ const keep=new Set([...html.matchAll(/assets\/[\w.-]+\.js/g)].map(m=>m[0])); if(!keep.size) return;
  for(const req of await c.keys()){ const p=new URL(req.url).pathname; const m=p.match(/assets\/[\w.-]+\.js$/); if(m&&!keep.has(m[0])) await c.delete(req); } }
self.addEventListener('fetch',e=>{ const r=e.request; if(r.method!=='GET') return; const u=new URL(r.url); if(u.origin!==location.origin) return;
  const asset=/\/assets\/[\w.-]+\.js$/.test(u.pathname);
  e.respondWith(caches.open(C).then(async c=>{
    if(asset){ const hit=await c.match(r); if(hit) return hit; const res=await fetch(r); if(res&&res.ok) c.put(r,res.clone()); return res; }
    try{ const res=await fetch(r); if(res&&res.ok){ c.put(r,res.clone()); if(r.mode==='navigate'||/index\.html$|\/$/.test(u.pathname)) res.clone().text().then(t=>prune(c,t)).catch(()=>{}); } return res; }
    catch(err){ const hit=await c.match(r,{ignoreSearch:true}); return hit||new Response('오프라인',{status:503}); }
  })); });
