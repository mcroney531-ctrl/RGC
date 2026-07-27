// Keeper Tracker service worker - minimal shell cache, optional.
var CACHE_NAME = 'keeper-tracker-v1';
var SHELL = ['/', '/index.html', '/manifest.json'];

self.addEventListener('install', function(event){
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache){ return cache.addAll(SHELL); })
  );
  self.skipWaiting();
});

self.addEventListener('activate', function(event){
  event.waitUntil(
    caches.keys().then(function(keys){
      return Promise.all(keys.filter(function(k){ return k !== CACHE_NAME; }).map(function(k){ return caches.delete(k); }));
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', function(event){
  var url = event.request.url;
  // Never cache Sleeper API calls - always fetch fresh.
  if (url.indexOf('api.sleeper.app') !== -1 || url.indexOf('sleepercdn.com') !== -1) return;

  event.respondWith(
    caches.match(event.request).then(function(cached){
      return cached || fetch(event.request);
    })
  );
});
