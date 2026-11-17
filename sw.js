// Gerenciamento de Campeonatos — permite abrir o sistema sem internet.
// A página é sempre buscada na rede primeiro (para receber atualizações); sem rede, usa a última cópia guardada.
const CACHE='gc-app-v1';
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(['./','index.html'])).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{const req=e.request,u=new URL(req.url);if(req.method!=='GET')return;
 const page=u.origin===location.origin,font=/fonts\.(googleapis|gstatic)\.com$/.test(u.hostname);if(!page&&!font)return;
 e.respondWith(fetch(req).then(res=>{if(res&&(res.ok||res.type==='opaque')){const cp=res.clone();caches.open(CACHE).then(c=>c.put(page?u.origin+u.pathname:req,cp))}return res})
  .catch(()=>caches.match(page?u.origin+u.pathname:req).then(r=>r||caches.match('index.html')).then(r=>r||Response.error())))});
