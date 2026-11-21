const SW_CACHE_NAME = 'findashiq-static-v1';
const PUBLIC_CACHEABLE_API_PATHS = ['/api/ai/catalog', '/api/forex/rates'];

self.addEventListener('install', (event) => {
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) =>
            Promise.all(
                keys
                    .filter((k) => k.startsWith('findashiq-') && k !== SW_CACHE_NAME)
                    .map((k) => caches.delete(k))
            )
        ).then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', (event) => {
    const req = event.request;
    if (req.method !== 'GET') return;

    const url = new URL(req.url);
    if (url.origin !== self.location.origin) return;

    // Network-first for /api/ routes (never persist private user payloads into shared SW cache)
    if (url.pathname.startsWith('/api/')) {
        const allowCacheFallback = PUBLIC_CACHEABLE_API_PATHS.includes(url.pathname);
        event.respondWith(
            fetch(req)
                .then((res) => {
                    if (allowCacheFallback && res && res.ok) {
                        const copy = res.clone();
                        caches.open(SW_CACHE_NAME).then((cache) => cache.put(req, copy)).catch(() => {});
                    }
                    return res;
                })
                .catch(() => {
                    if (allowCacheFallback) {
                        return caches.match(req);
                    }
                    return new Response(
                        JSON.stringify({ success: false, offline: true, error: 'Offline: network unavailable.' }),
                        { status: 503, headers: { 'Content-Type': 'application/json' } }
                    );
                })
        );
        return;
    }

    // Stale-while-revalidate for /static/ assets
    if (url.pathname.startsWith('/static/')) {
        event.respondWith(
            caches.open(SW_CACHE_NAME).then((cache) =>
                cache.match(req).then((cached) => {
                    const networkFetch = fetch(req)
                        .then((res) => {
                            if (res && res.ok) {
                                cache.put(req, res.clone()).catch(() => {});
                            }
                            return res;
                        })
                        .catch(() => cached);
                    return cached || networkFetch;
                })
            )
        );
    }
});

self.addEventListener('push', (event) => {
    let data = {};
    if (event.data) {
        try {
            data = event.data.json();
        } catch (_err) {
            data = { body: event.data.text() };
        }
    }
    const title = data.title || 'FinDashIQ Alert';
    const options = {
        body: data.body || 'New market intelligence signal triggered.',
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        data: { url: data.url || '/' },
    };
    event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    const targetUrl = (event.notification.data && event.notification.data.url) || '/';
    event.waitUntil(
        self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
            for (const client of clientList) {
                if ('focus' in client) {
                    return client.focus();
                }
            }
            if (self.clients.openWindow) {
                return self.clients.openWindow(targetUrl);
            }
            return null;
        })
    );
});
