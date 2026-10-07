# EcoPulse

Plataforma interactiva de monitoreo ambiental urbano y mapas comunitarios en
tiempo real. Muestra calidad del aire, niveles de ruido, cobertura verde y
calidad del agua en un panel vivo, con un enfoque visual oscuro tipo
*glassmorphism*.

## Empezar

Este proyecto es HTML/CSS/JS puro — no requiere build step para funcionar.

```bash
# Opción 1: abrir index.html directamente en el navegador

# Opción 2: servidor de desarrollo con recarga automática
npm install
npm run dev
```

El sitio se sirve por defecto en `http://localhost:5173`.

## Estructura del proyecto

```
ecopulse-web/
├── index.html                  # Punto de entrada (HTML5 semántico)
├── manifest.json               # Manifest PWA
├── service.worker.js           # Service Worker (caché y modo sin conexión)
├── package.json
├── README.md
├── assets/
│   ├── images/
│   │   ├── hero-bg.jpg         # Póster del video del hero (reemplazar)
│   │   └── gallery/            # Espacio para imágenes propias de la galería
│   ├── videos/
│   │   └── intro-preview.mp4   # Video de fondo del hero (reemplazar)
│   └── icons/
│       └── favicon.svg
├── src/
│   ├── css/
│   │   ├── base.css            # Tokens (:root), reset, utilidades
│   │   ├── components/
│   │   │   ├── navbar.css
│   │   │   ├── cards.css
│   │   │   └── video-player.css
│   │   └── main.css            # Importa todo lo anterior + secciones + @media
│   └── js/
│       ├── main.js             # Punto de entrada del JS
│       └── modules/
│           ├── navigation.js       # Menú hamburguesa + sección activa
│           └── mediaController.js  # Video del hero, galería, contadores
└── docs/
    └── design-tokens.md        # Referencia rápida de la paleta y tipografía
```

## Service Worker (modo sin conexión)

`service.worker.js` precachea el app shell y sirve el sitio sin conexión.
Se registra en `src/js/main.js` y solo funciona en `https` o `localhost`
(no al abrir `index.html` con `file://`). Al cambiar archivos, sube
`CACHE_VERSION` dentro de `service.worker.js` para que los usuarios
reciban la versión nueva.

## Notas sobre los medios

- **Imágenes de la galería**: se usan imágenes de Unsplash cargadas por URL
  (con `alt` descriptivo). Para producción, descarga y sirve tus propias
  copias optimizadas desde `assets/images/gallery/`.
- **Video del hero**: `assets/videos/intro-preview.mp4` es un marcador de
  posición. Sustitúyelo por un clip real (10–20s, sin audio, comprimido a
  H.264) o cambia la etiqueta `<video>` en `index.html` por un `<iframe>`
  de YouTube/Vimeo si prefieres alojar el video externamente.
- **Póster del hero**: `assets/images/hero-bg.jpg` se muestra mientras el
  video carga o si el autoplay es bloqueado por el navegador.

## Decisiones de diseño

Ver [`docs/design-tokens.md`](docs/design-tokens.md) para la paleta de
color, tipografía y principios de layout.

## Accesibilidad

- Enlace "Saltar al contenido" para usuarios de teclado y lectores de pantalla.
- Foco visible en todos los elementos interactivos.
- `prefers-reduced-motion` respetado en el video del hero y en los contadores animados.
- Contraste de texto verificado sobre el fondo oscuro.

## Próximos pasos sugeridos

- Conectar `src/js/modules/mediaController.js` a un endpoint real de
  métricas (websocket o polling) en lugar de los valores estáticos de ejemplo.
- Conectar el formulario de contacto (`data-contact-form`) a un backend o
  servicio de formularios (Formspree, un endpoint propio, etc.).
- Añadir un mapa interactivo (Leaflet/Mapbox) en la sección `#metricas` si
  se requiere visualización geoespacial.
