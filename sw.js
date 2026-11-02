// ランログ Service Worker：アプリ本体をキャッシュしてオフラインでも起動できるようにする
const CACHE = 'runlog-v1.1.0';
const SHELL = [
  './', './index.html', './manifest.webmanifest',
  './vendor/leaflet.js', './vendor/leaflet.css', './vendor/chart.umd.js',
  './icons/apple-touch-icon.png', './icons/icon-192.png', './icons/icon-512.png'
];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== location.origin) return; // 地図タイルなど外部はそのまま通信
  e.respondWith(
    fetch(e.request).then(r => {               // ネット優先（更新を反映）→ 失敗時はキャッシュ
      const copy = r.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); return r;
    }).catch(() => caches.match(e.request).then(r => r || caches.match('./index.html')))
  );
});
