// Deliberately caches nothing: a saved copy would keep opening after a member is removed.
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()));
