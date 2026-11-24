// Nossa Liga — permite abrir o sistema sem internet e recebe as notificações do master.
// A página é sempre buscada na rede primeiro (para receber atualizações); sem rede, usa a última cópia guardada.
const CACHE='gc-app-v1';
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(['./','index.html'])).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{const req=e.request,u=new URL(req.url);if(req.method!=='GET')return;
 const page=u.origin===location.origin,font=/fonts\.(googleapis|gstatic)\.com$/.test(u.hostname);if(!page&&!font)return;
 e.respondWith(fetch(req).then(res=>{if(res&&(res.ok||res.type==='opaque')){const cp=res.clone();caches.open(CACHE).then(c=>c.put(page?u.origin+u.pathname:req,cp))}return res})
  .catch(()=>caches.match(page?u.origin+u.pathname:req).then(r=>r||caches.match('index.html')).then(r=>r||Response.error())))});
// Notificação chegou (mesmo com o app fechado e o celular bloqueado)
self.addEventListener('push',e=>{let d={};try{d=e.data?e.data.json():{}}catch(x){d={body:e.data?e.data.text():''}}
 const url=/^#\//.test(d.url||'')?d.url:'#/campeonatos';
 e.waitUntil(self.registration.showNotification(d.title||'Nossa Liga',{body:d.body||'',icon:'icon-192.png',badge:'favicon.png',tag:d.tag||'nossaliga',renotify:true,data:{url}}))});
// Tocou na notificação: abre (ou traz para a frente) o app já no confronto
self.addEventListener('notificationclick',e=>{e.notification.close();const url=(e.notification.data&&e.notification.data.url)||'#/campeonatos',base=self.registration.scope;
 e.waitUntil(self.clients.matchAll({type:'window',includeUncontrolled:true}).then(cs=>{const c=cs.find(w=>w.url.startsWith(base));
  if(c){c.postMessage({type:'abrir',url});return c.focus()}return self.clients.openWindow(base+url)}))});
