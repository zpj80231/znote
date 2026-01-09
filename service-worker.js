// This SW exists only to clean up previously registered service workers and caches.
self.addEventListener('install', event => {
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    try {
      // Unregister this service worker registration
      await self.registration.unregister();
      // Clear all caches created by old versions
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map(name => caches.delete(name)));
    } catch (e) {}
    // Take control of clients immediately
    await self.clients.claim();
  })());
});

