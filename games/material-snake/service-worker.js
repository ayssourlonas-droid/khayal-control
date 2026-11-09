// @ts-nocheck

const CACHE_NAME = 'material-snake-cache-' + new Date().getTime();
const urlsToCache = [
	'assets/apple-touch-icon-57x57.png',
	'assets/apple-touch-icon-114x114.png',
	'assets/apple-touch-icon-72x72.png',
	'assets/apple-touch-icon-144x144.png',
	'assets/apple-touch-icon-60x60.png',
	'assets/apple-touch-icon-120x120.png',
	'assets/apple-touch-icon-76x76.png',
	'assets/apple-touch-icon-152x152.png',
	'assets/favicon-196x196.png',
	'assets/favicon-96x96.png',
	'assets/favicon-32x32.png',
	'assets/favicon-16x16.png',
	'assets/favicon-128.png',
	'assets/mstile-144x144.webp',
	'assets/mstile-70x70.webp',
	'assets/mstile-150x150.webp',
	'assets/mstile-310x150.webp',
	'assets/mstile-310x310.webp',
	'icons/icon-72x72.png',
	'icons/icon-96x96.png',
	'icons/icon-128x128.png',
	'icons/icon-144x144.png',
	'icons/icon-152x152.png',
	'icons/icon-192x192.png',
	'icons/icon-384x384.png',
	'icons/icon-512x512.png',
	'launch-screens/launch-screen-2048x2732.webp',
	'launch-screens/launch-screen-2732x2048.webp',
	'launch-screens/launch-screen-1668x2388.webp',
	'launch-screens/launch-screen-2388x1668.webp',
	'launch-screens/launch-screen-1668x2224.webp',
	'launch-screens/launch-screen-2224x1668.webp',
	'launch-screens/launch-screen-1536x2048.webp',
	'launch-screens/launch-screen-2048x1536.webp',
	'launch-screens/launch-screen-1242x2688.webp',
	'launch-screens/launch-screen-2688x1242.webp',
	'launch-screens/launch-screen-1125x2436.webp',
	'launch-screens/launch-screen-2436x1125.webp',
	'launch-screens/launch-screen-828x1792.webp',
	'launch-screens/launch-screen-1792x828.webp',
	'launch-screens/launch-screen-1242x2208.webp',
	'launch-screens/launch-screen-2208x1242.webp',
	'launch-screens/launch-screen-750x1334.webp',
	'launch-screens/launch-screen-1334x750.webp',
	'launch-screens/launch-screen-640x1136.webp',
	'launch-screens/launch-screen-1136x640.webp'
];

self.addEventListener('install', event => {
	self.skipWaiting();

	event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache)));
});

self.addEventListener('fetch', event => {
	event.respondWith(
		caches.match(event.request).then(response => {
			if (response) {
				return response;
			}

			const fetchRequest = event.request.clone();

			return fetch(fetchRequest).then(response => {
				if (!response || response.status !== 200 || response.type !== 'basic') {
					return response;
				}

				const responseToCache = response.clone();

				event.waitUntil(
					caches.open(CACHE_NAME).then(cache => {
						cache.put(event.request, responseToCache);
					})
				);

				return response;
			});
		})
	);
});

self.addEventListener('activate', event => {
	event.waitUntil(
		caches
			.keys()
			.then(cacheNames =>
				Promise.all(
					cacheNames.filter(cacheName => cacheName !== CACHE_NAME).map(cacheName => caches.delete(cacheName))
				)
			)
	);
});
