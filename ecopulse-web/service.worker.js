/**
 * service.worker.js
 * Service Worker de EcoPulse.
 *
 * Estrategias:
 *  - App shell (HTML, CSS, JS, iconos, manifest): precache + cache-first.
 *  - Navegación (páginas HTML): network-first, con respaldo al index en caché.
 *  - Google Fonts e imágenes de Unsplash: stale-while-revalidate.
 *  - Video: no se intercepta (usa peticiones Range, que no se pueden cachear bien).
 *
 * Para publicar cambios: sube el número de CACHE_VERSION.
 */

// Define la versión de la caché para forzar la actualización al cambiar activos
const CACHE_VERSION = "v1";

// Nombre clave para la caché previa (App Shell)
const PRECACHE = `ecopulse-precache-${CACHE_VERSION}`;

// Nombre clave para la caché dinámica o en tiempo de ejecución
const RUNTIME = `ecopulse-runtime-${CACHE_VERSION}`;

// Lista de archivos del "App Shell" necesarios para precachear al instalar
const PRECACHE_URLS = [
  "./",
  "./index.html",
  "./manifest.json",
  "./src/css/main.css",
  "./src/css/base.css",
  "./src/css/components/navbar.css",
  "./src/css/components/video-player.css",
  "./src/css/components/cards.css",
  "./src/js/main.js",
  "./src/js/modules/navigation.js",
  "./src/js/modules/mediaController.js",
  "./assets/images/hero-bg.jpg",
  "./assets/icons/favicon.svg",
  "./assets/icons/icon-192.png",
  "./assets/icons/icon-512.png",
  "./assets/icons/icon-maskable-512.png",
  "./assets/icons/apple-touch-icon.png",
];

// Dominios externos cuyos recursos serán gestionados dinámicamente en caché
const RUNTIME_HOSTS = [
  "fonts.googleapis.com",
  "fonts.gstatic.com",
  "images.unsplash.com",
];

// Límite máximo de elementos almacenados en la caché de tiempo de ejecución
const MAX_RUNTIME_ENTRIES = 60;

/* ---------- Instalación: precache del app shell ---------- */
// Escucha el evento 'install' cuando el Service Worker se instala en el navegador
self.addEventListener("install", (event) => {
  // Pospone la finalización de la instalación hasta que la promesa se resuelva
  event.waitUntil(
    caches
      // Abre (o crea) el almacén de caché de precarga
      .open(PRECACHE)
      // Agrega y descarga todos los recursos de la lista PRECACHE_URLS en caché
      .then((cache) => cache.addAll(PRECACHE_URLS))
      // Fuerza al Service Worker recién instalado a activarse de inmediato
      .then(() => self.skipWaiting())
  );
});

/* ---------- Activación: limpia cachés antiguas ---------- */
// Escucha el evento 'activate' cuando el Service Worker toma el control
self.addEventListener("activate", (event) => {
  // Pospone la activación hasta completar la limpieza de caché
  event.waitUntil(
    caches
      // Obtiene todas las claves/nombres de cachés existentes
      .keys()
      .then((keys) =>
        Promise.all(
          // Filtra versiones antiguas de la caché que pertenezcan a la app pero no a la versión actual
          keys
            .filter((key) => key.startsWith("ecopulse-") && key !== PRECACHE && key !== RUNTIME)
            // Elimina cada caché desactualizada
            .map((key) => caches.delete(key))
        )
      )
      // Asegura que los clientes/pestañas abiertos queden bajo el control del nuevo SW
      .then(() => self.clients.claim())
  );
});

/* ---------- Fetch ---------- */
// Escucha el evento 'fetch' para interceptar todas las peticiones de red salientes
self.addEventListener("fetch", (event) => {
  // Extrae la petición del evento
  const { request } = event;

  // Si no es un método GET (ej. POST/PUT), no la intercepta y deja continuar
  if (request.method !== "GET") return;
  // Si la petición contiene cabeceras de rango o es un video, no la intercepta (evita fallos de reproducción)
  if (request.headers.has("range") || request.destination === "video") return;

  // Convierte la URL del recurso solicitado a un objeto URL
  const url = new URL(request.url);

  // Si la petición es de navegación (ej. cargar o recargar una página HTML)
  if (request.mode === "navigate") {
    // Aplica la estrategia Network First con respaldo Offline
    event.respondWith(networkFirstNavigation(request));
    return;
  }

  // Si el dominio coincide con la lista de hosts autorizados (fuentes, imágenes de Unsplash)
  if (RUNTIME_HOSTS.includes(url.hostname)) {
    // Aplica la estrategia Stale-While-Revalidate
    event.respondWith(staleWhileRevalidate(request));
    return;
  }

  // Si el recurso proviene del mismo origen/servidor de la app
  if (url.origin === self.location.origin) {
    // Aplica la estrategia Cache First
    event.respondWith(cacheFirst(request));
  }
});

/* ---------- Estrategias ---------- */
// Función para navegación (Network First): intenta red primero, cae a caché si falla
async function networkFirstNavigation(request) {
  try {
    // Intenta realizar la petición a la red
    const response = await fetch(request);
    // Abre la caché PRECACHE
    const cache = await caches.open(PRECACHE);
    // Guarda una copia de la respuesta actualizada para index.html
    cache.put("./index.html", response.clone());
    // Retorna la respuesta obtenida de la red
    return response;
  } catch (error) {
    // Si la red falla, busca en la caché el recurso, 'index.html' o el directorio raíz
    const cached =
      (await caches.match(request)) ||
      (await caches.match("./index.html")) ||
      (await caches.match("./"));
    // Retorna el elemento almacenado o una respuesta de fallback con estado HTTP 503
    return (
      cached ||
      new Response("Sin conexión. Vuelve a intentarlo cuando tengas internet.", {
        status: 503,
        headers: { "Content-Type": "text/plain; charset=utf-8" },
      })
    );
  }
}

// Función para recursos locales (Cache First): busca en caché primero, va a red si no existe
async function cacheFirst(request) {
  // Intenta encontrar coincidencia previa en la caché
  const cached = await caches.match(request);
  // Si existe en caché, lo retorna directamente
  if (cached) return cached;

  // Si no está en caché, lo descarga de la red
  const response = await fetch(request);
  // Si la respuesta de red es válida
  if (response && response.ok) {
    // Abre la caché RUNTIME
    const cache = await caches.open(RUNTIME);
    // Almacena una copia de la respuesta descargada
    cache.put(request, response.clone());
  }
  // Retorna la respuesta obtenida de la red
  return response;
}

// Función para recursos externos (Stale-While-Revalidate): sirve de caché e investiga red en fondo
async function staleWhileRevalidate(request) {
  // Abre la caché RUNTIME
  const cache = await caches.open(RUNTIME);
  // Busca el recurso previamente guardado en caché
  const cached = await cache.match(request);

  // Inicia la petición en segundo plano para actualizar la caché
  const network = fetch(request)
    .then(async (response) => {
      // Si la respuesta de red es correcta o de tipo opaca (CDN de terceros)
      if (response && (response.ok || response.type === "opaque")) {
        // Actualiza el recurso en la caché RUNTIME
        await cache.put(request, response.clone());
        // Aplica el recorte de tamaño de la caché para no saturar memoria
        trimCache(cache, MAX_RUNTIME_ENTRIES);
      }
      return response;
    })
    .catch(() => cached); // Si la red falla, se apoya en lo almacenado

  // Retorna el recurso inmediato en caché (si existe), o espera la respuesta de red
  return cached || network;
}

// Función auxiliar para recortar y mantener la caché dentro del tamaño máximo permitido
async function trimCache(cache, maxEntries) {
  // Obtiene la lista de elementos en la caché
  const keys = await cache.keys();
  // Si supera el límite de entradas
  if (keys.length > maxEntries) {
    // Elimina la entrada más antigua (primer elemento)
    await cache.delete(keys[0]);
    // Ejecuta recursivamente hasta estar dentro del límite
    trimCache(cache, maxEntries);
  }
}