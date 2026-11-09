/* DELTA STRIKE — service worker */
'use strict';
var CACHE = 'delta-strike-v10';   // bump manually on every release: -v2, -v3…
var ASSETS = [
  './',
  './index.html',
  './classic.html',
  './selection/selection.css',
  './selection/classic.webp',
  './selection/flight.webp',
  './style.css',
  './manifest.webmanifest',
  './js/constants.js',
  './js/sprites.js',
  './js/audio.js',
  './js/river.js',
  './js/entities.js',
  './js/game.js',
  './icons/delta-strike-192.webp',
  './icons/delta-strike-512.webp',
  './icons/delta-strike-maskable-512.webp',
  './icons/apple-touch-icon.png',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

self.addEventListener('install', function (e) {
  e.waitUntil(
    caches.open(CACHE).then(function (c) {
      // cache:'reload' bypasses the HTTP cache so a new release never
      // precaches stale assets (GitHub Pages serves max-age=600).
      return c.addAll(ASSETS.map(function (u) {
        return new Request(u, { cache: 'reload' });
      }));
    }).then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.map(function (k) {
        if (k !== CACHE && k.indexOf('delta-strike-') === 0) return caches.delete(k);
      }));
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function (e) {
  // Never intercept 3D modules or unrelated same-origin applications.
  if (e.request.method !== 'GET') return;
  var url = new URL(e.request.url);
  var allowed = ASSETS.some(function (asset) {
    return new URL(asset, self.registration.scope).pathname === url.pathname;
  });
  if (url.origin !== self.location.origin || !allowed) return;
  // Online navigation must not remain pinned to an older edition's home page.
  if (e.request.mode === 'navigate') {
    e.respondWith(
      fetch(e.request, { cache: 'no-store' }).then(function (response) {
        if (!response.ok) throw new Error('Page temporarily unavailable');
        var copy = response.clone();
        e.waitUntil(caches.open(CACHE).then(function (cache) {
          return cache.put(url.origin + url.pathname, copy);
        }).catch(function () {}));
        return response;
      }).catch(function () {
        return caches.match(e.request, { ignoreSearch: true }).then(function (cached) {
          return cached || Response.error();
        });
      })
    );
    return;
  }
  e.respondWith(
    caches.match(e.request, { ignoreSearch: true }).then(function (r) {
      return r || fetch(e.request);
    })
  );
});
