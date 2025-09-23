// Service Worker personalizado para funcionalidades avançadas
const CACHE_NAME = 'pulse-cache-v1';
const RUNTIME_CACHE = 'pulse-runtime-v1';

// Recursos para cache imediato
const STATIC_CACHE_URLS = [
  '/',
  '/dashboard',
  '/favorites',
  '/search',
  '/offline',
  '/manifest.json'
];

// Instalar Service Worker
self.addEventListener('install', (event) => {
  console.log('Service Worker: Instalando...');

  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Cache aberto');
        return cache.addAll(STATIC_CACHE_URLS);
      })
      .then(() => {
        console.log('Service Worker: Recursos em cache');
        return self.skipWaiting();
      })
  );
});

// Ativar Service Worker
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Ativando...');

  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE) {
            console.log('Service Worker: Removendo cache antigo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('Service Worker: Ativado');
      return self.clients.claim();
    })
  );
});

// Interceptar requisições
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignorar requisições de extensões do browser
  if (url.protocol === 'chrome-extension:' || url.protocol === 'moz-extension:') {
    return;
  }

  // Estratégia Cache First para recursos estáticos
  if (request.destination === 'style' ||
      request.destination === 'script' ||
      request.destination === 'image' ||
      url.pathname.includes('/_next/static/')) {

    event.respondWith(
      caches.open(CACHE_NAME).then((cache) => {
        return cache.match(request).then((response) => {
          if (response) {
            return response;
          }

          return fetch(request).then((fetchResponse) => {
            if (fetchResponse.status === 200) {
              cache.put(request, fetchResponse.clone());
            }
            return fetchResponse;
          });
        });
      })
    );
    return;
  }

  // Estratégia Network First para páginas e APIs
  if (request.destination === 'document' || url.pathname.startsWith('/api/')) {
    event.respondWith(
      caches.open(RUNTIME_CACHE).then((cache) => {
        return fetch(request).then((response) => {
          if (response.status === 200) {
            cache.put(request, response.clone());
          }
          return response;
        }).catch(() => {
          // Se offline, tentar cache
          return cache.match(request).then((cachedResponse) => {
            if (cachedResponse) {
              return cachedResponse;
            }

            // Página offline padrão
            if (request.destination === 'document') {
              return cache.match('/offline') ||
                     new Response(
                       '<h1>Você está offline</h1><p>Verifique sua conexão com a internet.</p>',
                       { headers: { 'Content-Type': 'text/html' } }
                     );
            }

            return new Response('Offline', { status: 503 });
          });
        });
      })
    );
    return;
  }

  // Para outros tipos de requisição, usar estratégia padrão
  event.respondWith(fetch(request));
});

// Sync em background para quando voltar online
self.addEventListener('sync', (event) => {
  console.log('Service Worker: Sincronização em background:', event.tag);

  if (event.tag === 'background-sync') {
    event.waitUntil(
      // Aqui você pode implementar sincronização de dados offline
      // Por exemplo, enviar favoritos salvos offline
      console.log('Sincronizando dados offline...')
    );
  }
});

// Push notifications
self.addEventListener('push', (event) => {
  console.log('Service Worker: Push recebido:', event);

  const options = {
    body: 'Novo episódio disponível!',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-96x96.png',
    tag: 'new-episode',
    data: {
      url: '/dashboard'
    }
  };

  if (event.data) {
    const data = event.data.json();
    options.body = data.message || options.body;
    options.data.url = data.url || options.data.url;
  }

  event.waitUntil(
    self.registration.showNotification('Pulse', options)
  );
});

// Clique em notificações
self.addEventListener('notificationclick', (event) => {
  console.log('Service Worker: Notificação clicada:', event);

  event.notification.close();

  const url = event.notification.data?.url || '/dashboard';

  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      // Se já há uma janela aberta, focar nela
      for (const client of clientList) {
        if (client.url.includes(url) && 'focus' in client) {
          return client.focus();
        }
      }

      // Caso contrário, abrir nova janela
      if (clients.openWindow) {
        return clients.openWindow(url);
      }
    })
  );
});