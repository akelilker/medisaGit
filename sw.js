// Service Worker - Medisa Taşıt Yönetim Sistemi
// Version 1.0

const CACHE_VERSION = 'medisa-v1.0';

// Subpath desteği: /medisa/sw.js ise base = '/medisa', kök deploy'da base = ''
function getBase() {
  const p = self.location.pathname.replace(/\/sw\.js$/i, '').replace(/\/$/, '');
  return p || '';
}

const CACHE_FILES = [
  '/',
  '/index.html',
  
  // CSS
  '/style-core.css',
  '/kayit.css',
  '/tasitlar.css',
  '/raporlar.css',
  '/ayarlar.css',
  
  // JavaScript
  '/script-core.js',
  '/kayit.js',
  '/tasitlar.js',
  '/raporlar.js',
  '/ayarlar.js',
  '/data-manager.js',
  
  // Icons
  '/icon/favicon.svg',
  '/icon/apple-touch-icon.svg',
  '/icon/icon-192.svg',
  '/icon/icon-512.svg',
  '/icon/icon-192-maskable.svg',
  '/icon/icon-512-maskable.svg',
  '/icon/logo-header2.svg',
  '/icon/logo-footer.svg',
  '/icon/marker.png',
  '/icon/otomobil.svg',
  '/icon/kaporta.svg',
  
  // Manifest
  '/manifest.json'
];

// Install - Cache tüm dosyaları (hata toleranslı, subpath destekli)
self.addEventListener('install', (event) => {
  const base = getBase();
  const origin = self.location.origin;
  event.waitUntil(
    caches.open(CACHE_VERSION)
      .then((cache) => {
        const cachePromises = CACHE_FILES.map((path) => {
          const fullUrl = origin + base + path;
          return fetch(fullUrl)
            .then((response) => {
              if (response && response.status === 200) {
                return cache.put(fullUrl, response);
              }
              return Promise.resolve();
            })
            .catch(() => Promise.resolve());
        });
        return Promise.all(cachePromises);
      })
      .then(() => self.skipWaiting())
      .catch(() => self.skipWaiting())
  );
});

// Activate - Eski cache'leri temizle
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_VERSION) {
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => self.clients.claim())
  );
});

// Fetch - Cache-first stratejisi
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Sadece same-origin istekleri cache'le
  if (url.origin !== location.origin) {
    // ExcelJS gibi CDN istekleri - network-first
    event.respondWith(
      fetch(request)
        .catch(() => {
          return new Response('Network error', { status: 503 });
        })
    );
    return;
  }
  
  // API çağrıları - network-first
  if (url.pathname.includes('/api/') || url.pathname.includes('.php')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Başarılı response'u cache'le
          if (response && response.status === 200) {
            const responseClone = response.clone();
            caches.open(CACHE_VERSION).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          // Network başarısızsa cache'den dön
          return caches.match(request);
        })
    );
    return;
  }
  
  // Static dosyalar - cache-first
  event.respondWith(
    caches.match(request)
      .then((cachedResponse) => {
        if (cachedResponse) return cachedResponse;
        return fetch(request)
          .then((response) => {
            if (!response || response.status !== 200 || response.type === 'error') {
              return response;
            }
            const responseClone = response.clone();
            caches.open(CACHE_VERSION).then((cache) => {
              cache.put(request, responseClone);
            });
            return response;
          })
          .catch(() => {
            if (request.destination === 'document') {
              const base = getBase();
              const fallbackPath = base ? base + '/' : '/';
              return caches.match(fallbackPath);
            }
            return caches.match(request);
          });
      })
  );
});

// Background Sync (opsiyonel - offline form submission için)
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-vehicles') {
    event.waitUntil(syncVehicleData());
  }
});

async function syncVehicleData() {
  // Offline'da kaydedilen verileri sync et
  // Burada IndexedDB'den pending data çekip API'ye gönderebilirsin
}

// Push Notifications (opsiyonel, subpath destekli)
self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {};
  const title = data.title || 'Medisa Taşıt';
  const base = getBase();
  const defaultUrl = base ? base + '/' : '/';
  const options = {
    body: data.body || 'Yeni bildirim',
    icon: base + '/icon/icon-192.svg',
    badge: base + '/icon/icon-192.svg',
    data: data.url || defaultUrl
  };
  
  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// Notification click
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const base = getBase();
  const defaultUrl = base ? base + '/' : '/';
  event.waitUntil(
    clients.openWindow(event.notification.data || defaultUrl)
  );
});
