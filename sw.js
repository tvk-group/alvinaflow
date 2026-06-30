/* Alvina Flow — minimal service worker for PWA install */
const SW_VERSION = 'alvinaflow-pwa-v1';

self.addEventListener('install', function (event) {
  self.skipWaiting();
});

self.addEventListener('activate', function (event) {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', function (event) {
  var request = event.request;
  if (request.method !== 'GET') return;

  event.respondWith(
    fetch(request).catch(function () {
      if (request.mode === 'navigate') {
        return caches.match('/index.html').then(function (cached) {
          return cached || Response.error();
        });
      }
      return Response.error();
    })
  );
});
