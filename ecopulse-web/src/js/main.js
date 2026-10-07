/**
 * main.js
 * Punto de entrada. Inicializa los módulos de navegación y
 * medios, y maneja el envío simple del formulario de contacto.
 */

import { initNavigation } from "./modules/navigation.js";
import { initMediaController } from "./modules/mediaController.js";
document.addEventListener("DOMContentLoaded", () => {
  initNavigation();
  initMediaController();
  initContactForm();
});
// Registra el Service Worker (requiere https o localhost).
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("./service.worker.js", { scope: "./" })
      .catch((error) => console.warn("No se pudo registrar el Service Worker:", error));
  });
}
function initContactForm() {
  const form = document.querySelector("[data-contact-form]");
  const status = document.querySelector("[data-form-status]");
  if (!form || !status) return;

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    if (!form.checkValidity()) {
      status.textContent = "Revisa los campos marcados antes de continuar.";
      status.style.color = "var(--color-accent-rose)";
      return;
    }
    // Aquí se conectaría un endpoint real (fetch a tu API/CRM).
    // Se deja simulado para que el frontend funcione de forma aislada.
    status.style.color = "var(--color-accent-teal)";
    status.textContent = "¡Gracias! Tu solicitud fue enviada, te contactaremos pronto.";
    form.reset();
  });
}
