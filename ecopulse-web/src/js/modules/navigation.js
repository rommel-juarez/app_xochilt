/**
 * navigation.js
 * Controla el menú hamburguesa en móvil y resalta el enlace
 * de la sección visible mientras el usuario hace scroll.
 */

export function initNavigation() {
  const toggle = document.getElementById("nav-toggle");
  const nav = document.getElementById("main-nav");
  const links = Array.from(document.querySelectorAll("[data-nav-link]"));

  if (!toggle || !nav) return;

  const closeMenu = () => {
    nav.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
  };

  const toggleMenu = () => {
    const isOpen = nav.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", String(isOpen));
  };

  toggle.addEventListener("click", toggleMenu);

  // Cierra el menú al elegir un enlace (útil en móvil)
  links.forEach((link) => {
    link.addEventListener("click", closeMenu);
  });

  // Cierra el menú si se agranda la ventana (p. ej. rotación de tablet)
  window.addEventListener("resize", () => {
    if (window.innerWidth > 860) closeMenu();
  });

  initActiveSectionTracking(links);
}

/**
 * Usa IntersectionObserver para marcar el enlace de nav
 * correspondiente a la sección actualmente visible.
 */
function initActiveSectionTracking(links) {
  const sections = links
    .map((link) => document.querySelector(link.getAttribute("href")))
    .filter(Boolean);

  if (!("IntersectionObserver" in window) || sections.length === 0) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const id = `#${entry.target.id}`;
        links.forEach((link) => {
          link.classList.toggle("is-active", link.getAttribute("href") === id);
        });
      });
    },
    { rootMargin: "-40% 0px -55% 0px", threshold: 0 }
  );

  sections.forEach((section) => observer.observe(section));
}
