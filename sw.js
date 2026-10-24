/* Offline shell cache for the Metro Shoes PWA */
const CACHE = 'metro-v2', FILES = ['./', 'index.html', 'styles.css', 'config.js', 'logic.js', 'data.js', 'db.js', 'app.js', 'dash.js', 'logo.svg', 'manifest.webmanifest'];
self.addEventListener('install', e => e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting())));
self.addEventListener('activate', e => e.waitUntil(caches.keys().then(k => Promise.all(k.filter(x => x !== CACHE).map(x => caches.delete(x)))).then(() => self.clients.claim())));
self.addEventListener('fetch', e => { if (e.request.method !== 'GET' || !e.request.url.startsWith(self.location.origin)) return; e.respondWith(fetch(e.request).then(r => { const c = r.clone(); caches.open(CACHE).then(x => x.put(e.request, c)); return r; }).catch(() => caches.match(e.request))); });
