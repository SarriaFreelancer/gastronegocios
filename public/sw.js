/**
 * GastroPOS - Service Worker (Offline-First Real)
 * Garantiza que la aplicación funcione en restaurantes sin conexión a internet.
 */

const CACHE_NAME = 'gastropos-core-v1';
const RUNTIME_CACHE = 'gastropos-runtime-v1';

// Recursos críticos para arranque inmediato sin internet (App Shell)
const PRECACHE_URLS = [
  '/',
  '/manifest.json',
  '/favicon.ico',
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_URLS).catch((err) => {
        console.warn('Pre-cache parcial durante instalación de SW:', err);
      });
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME && name !== RUNTIME_CACHE)
          .map((name) => caches.delete(name))
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Solo gestionar solicitudes HTTP/HTTPS del mismo origen
  if (!url.protocol.startsWith('http') || url.origin !== self.location.origin) {
    return;
  }

  // 1. Solicitudes de API: Estrategia Network-First
  if (url.pathname.startsWith('/api/')) {
    // Las mutaciones (POST, PUT, DELETE) van a la red directo. Si falla, el código cliente usa IndexedDB
    if (request.method !== 'GET') {
      return;
    }

    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response && response.status === 200) {
            const clone = response.clone();
            caches.open(RUNTIME_CACHE).then((cache) => cache.put(request, clone));
          }
          return response;
        })
        .catch(async () => {
          const cached = await caches.match(request);
          if (cached) return cached;
          return new Response(JSON.stringify({ offline: true, error: 'Sin conexión a internet' }), {
            headers: { 'Content-Type': 'application/json' },
            status: 503,
          });
        })
    );
    return;
  }

  // 2. Páginas de Navegación (HTML): Network-First con fallback a Caché
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response && response.status === 200) {
            const clone = response.clone();
            caches.open(RUNTIME_CACHE).then((cache) => cache.put(request, clone));
          }
          return response;
        })
        .catch(async () => {
          // Si no hay red, buscar la página en caché
          const cachedPage = await caches.match(request);
          if (cachedPage) return cachedPage;

          // Si la página específica no está, retornar la raíz o el fallback
          const rootCached = await caches.match('/');
          if (rootCached) return rootCached;

          return new Response(
            `<!DOCTYPE html>
            <html lang="es">
              <head>
                <meta charset="utf-8"/>
                <meta name="viewport" content="width=device-width, initial-scale=1"/>
                <title>GastroPOS - Modo Sin Conexión</title>
                <style>
                  body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #080808; color: #fff; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; text-align: center; padding: 20px; }
                  .card { background: #141414; border: 1px solid #282828; border-radius: 16px; padding: 32px 24px; max-width: 420px; }
                  h1 { font-size: 20px; margin-bottom: 8px; color: #ffc928; }
                  p { font-size: 14px; color: #9ca3af; line-height: 1.5; }
                  button { margin-top: 20px; background: #ffc928; color: #000; border: none; padding: 12px 24px; border-radius: 9999px; font-weight: bold; cursor: pointer; }
                </style>
              </head>
              <body>
                <div class="card">
                  <h1>Modo Fuera de Línea</h1>
                  <p>La conexión a internet no está disponible en este momento. GastroPOS sigue activo localmente.</p>
                  <button onclick="window.location.reload()">Reintentar Conexión</button>
                </div>
              </body>
            </html>`,
            { headers: { 'Content-Type': 'text/html' } }
          );
        })
    );
    return;
  }

  // 3. Recursos estáticos (JS, CSS, Imágenes, Fuentes, Sonidos): Stale-While-Revalidate
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      const fetchPromise = fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const clone = networkResponse.clone();
            caches.open(RUNTIME_CACHE).then((cache) => cache.put(request, clone));
          }
          return networkResponse;
        })
        .catch(() => cachedResponse);

      return cachedResponse || fetchPromise;
    })
  );
});
