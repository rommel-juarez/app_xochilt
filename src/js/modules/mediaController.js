/**
 * mediaController.js
 * Maneja el video de fondo del hero, la interacción de la
 * galería y las cifras animadas (contadores) del hero.
 */

export function initMediaController() {
  initHeroVideo();
  initGalleryInteraction();
  initCounters();
}

/**
 * Si el navegador bloquea el autoplay o el usuario prefiere
 * poco movimiento, deja el póster estático en su lugar.
 */
function initHeroVideo() {
  const video = document.querySelector(".hero-video");
  if (!video) return;

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (prefersReducedMotion) {
    video.pause();
    video.removeAttribute("autoplay");
    return;
  }

  const playPromise = video.play();
  if (playPromise !== undefined) {
    playPromise.catch(() => {
      // Autoplay bloqueado: el póster (hero-bg.jpg) queda como respaldo visual.
      video.setAttribute("controls", "");
    });
  }
}

/**
 * Pausa la ampliación de una tarjeta de galería mientras
 * tiene el foco de teclado, para que el zoom no distraiga
 * a quien navega con teclado o lector de pantalla.
 */
function initGalleryInteraction() {
  const items = document.querySelectorAll("[data-gallery-item]");

  items.forEach((item) => {
    const img = item.querySelector("img");
    if (!img) return;

    item.addEventListener("focusin", () => item.classList.add("is-focused"));
    item.addEventListener("focusout", () => item.classList.remove("is-focused"));
  });
}

/**
 * Anima los contadores del hero (sensores activos, ciudades,
 * lecturas) de 0 a su valor final cuando entran en pantalla.
 */
function initCounters() {
  const counters = document.querySelectorAll("[data-counter]");
  if (counters.length === 0) return;

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const animate = (el) => {
    const target = Number(el.dataset.target || "0");

    if (prefersReducedMotion) {
      el.textContent = target.toLocaleString("es-MX");
      return;
    }

    const duration = 1400;
    const start = performance.now();

    const step = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = Math.round(target * eased);
      el.textContent = value.toLocaleString("es-MX");
      if (progress < 1) requestAnimationFrame(step);
    };

    requestAnimationFrame(step);
  };

  if (!("IntersectionObserver" in window)) {
    counters.forEach(animate);
    return;
  }

  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        animate(entry.target);
        obs.unobserve(entry.target);
      });
    },
    { threshold: 0.6 }
  );

  counters.forEach((counter) => observer.observe(counter));
}
