// Keeper Tracker had a cache-first service worker in an earlier version
// that permanently served a stale index.html and hid every later deploy.
// This version does the opposite: it wipes any cache it left behind and
// unregisters itself so the browser goes back to fetching fresh from the
// network like a normal site. No fetch handler - nothing is intercepted.
self.addEventListener('install', function(){
  self.skipWaiting();
});

self.addEventListener('activate', function(event){
  event.waitUntil(
    caches.keys()
      .then(function(keys){ return Promise.all(keys.map(function(k){ return caches.delete(k); })); })
      .then(function(){ return self.registration.unregister(); })
      .then(function(){ return self.clients.matchAll({ type: 'window' }); })
      .then(function(clientList){
        clientList.forEach(function(client){ client.navigate(client.url); });
      })
  );
});
