/* 스타 플레이어 오프라인 캐시 — 게임 파일은 인터넷이 되면 항상 새 버전(바뀐 게 없으면 304로 가볍게), 안 되면 저장본으로 */
const C='sp-v2';
const FILES=['./','./index.html','./manifest.webmanifest','./icon-192.png','./icon-512.png'];
self.addEventListener('install',e=>{ e.waitUntil(caches.open(C).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting())); });
self.addEventListener('activate',e=>{ e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==C).map(k=>caches.delete(k)))).then(()=>self.clients.claim())); });
self.addEventListener('fetch',e=>{ const r=e.request; if(r.method!=='GET') return; const u=new URL(r.url); if(u.origin!==location.origin) return;
  e.respondWith(caches.open(C).then(async c=>{
    try{ const res=await fetch(r); if(res&&res.ok) c.put(r,res.clone()); return res; }
    catch(err){ const hit=await c.match(r,{ignoreSearch:true}); return hit||new Response('오프라인',{status:503}); }
  })); });
