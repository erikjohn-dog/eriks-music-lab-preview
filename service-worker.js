// Change this version for EVERY deployment that changes any app-shell file.
// Installation is atomic: a missing file prevents activation of a broken shell.
const VERSION = '1.0.5';
const PREFIX = 'eriks-music-lab-preview-';
const CACHE = PREFIX + VERSION;
const FILES = ['./', './index.html', './styles.css', './app.js', './navigation.js', './core.js', './audio.js', './storage.js', './manifest.webmanifest', './icons/icon-192.png', './icons/icon-512.png', './icons/icon-maskable-512.png', './icons/apple-touch-icon.png', './icons/icon.svg'];
const URLS = FILES.map(file => new URL(file, self.registration.scope).href);
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(URLS.map(url => new Request(url, { cache: 'reload' })))));
  // Updates wait for explicit approval; do not interrupt an active question.
});
self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(key => key.startsWith(PREFIX) && key !== CACHE).map(key => caches.delete(key)));
    await self.clients.claim();
  })());
});
self.addEventListener('fetch', event => {
  const { request } = event;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin || !url.href.startsWith(self.registration.scope)) return;
  // Only the declared app shell is served from this cache. No training records
  // are network resources, and no API or analytics requests are made.
  const clean = new URL(url.href); clean.search = ''; clean.hash = '';
  const isNavigation = request.mode === 'navigate' && (clean.href === self.registration.scope || clean.href === new URL('index.html', self.registration.scope).href);
  const key = isNavigation ? new URL('index.html', self.registration.scope).href : clean.href;
  if (!URLS.includes(key)) return;
  event.respondWith((async () => {
    const cache = await caches.open(CACHE);
    const cached = await cache.match(key);
    if (cached) return cached;
    const response = await fetch(request);
    if (response.ok) await cache.put(key, response.clone());
    return response;
  })());
});
self.addEventListener('message', event => {
  if (event.data?.type === 'SKIP_WAITING') { event.waitUntil(self.skipWaiting()); return; }
  if (event.data?.type === 'CHECK_CACHE') event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    const matches = await Promise.all(URLS.map(url => cache.match(url)));
    event.ports[0]?.postMessage({ ready: matches.every(Boolean), version: VERSION });
  })());
});
