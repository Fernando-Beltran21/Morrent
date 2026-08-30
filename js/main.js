// Morrent — main.js

document.addEventListener("DOMContentLoaded", () => {
  // 1. Lógica del Header (Transición al hacer scroll)
  const header = document.getElementById("site-header");

  if (header) {
    // Si el header no tiene hero de fondo (data-hero="false"), queda
    // siempre en su estado sólido, como en las páginas internas.
    const hasHero = header.dataset.hero !== "false";
    const scrollThreshold = 40;

    const toggleHeader = () => {
      const isScrolled = !hasHero || window.scrollY > scrollThreshold;
      header.classList.toggle("header-solid", isScrolled);
      header.classList.toggle("header-transparent", !isScrolled);
    };

    toggleHeader();
    window.addEventListener("scroll", toggleHeader, { passive: true });
  }

  // 2. Acordeón horizontal de materiales (Agregados)
  //    En escritorio se expande con :hover (CSS). En touch, se expande
  //    al tocar y se activa uno a la vez.
  document.querySelectorAll("[data-agg-accordion]").forEach((accordion) => {
    const items = Array.from(accordion.querySelectorAll(".agg-item"));
    const isTouch = window.matchMedia("(hover: none)").matches;

    if (isTouch) {
      items.forEach((item) => {
        item.addEventListener("click", (e) => {
          e.preventDefault();
          const alreadyActive = item.classList.contains("is-active");
          items.forEach((i) => i.classList.remove("is-active"));
          if (!alreadyActive) item.classList.add("is-active");
        });
      });
    }
  });

  // 3. Lógica del Menú Móvil
  const menuBtn = document.getElementById("menu-toggle");
  const mobileMenu = document.getElementById("mobile-menu");

  if (menuBtn && mobileMenu) {
    menuBtn.addEventListener("click", () => {
      const isOpen = mobileMenu.classList.toggle("translate-x-0");
      mobileMenu.classList.toggle("translate-x-full", !isOpen);
      menuBtn.setAttribute("aria-expanded", String(isOpen));
    });

    // Cerrar menú al presionar sobre un enlace
    mobileMenu.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        mobileMenu.classList.add("translate-x-full");
        mobileMenu.classList.remove("translate-x-0");
        menuBtn.setAttribute("aria-expanded", "false");
      });
    });
  }

  // 4. Animaciones al hacer scroll (IntersectionObserver)
  const revealEls = document.querySelectorAll(".reveal");

  if ("IntersectionObserver" in window && revealEls.length) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.15,
        rootMargin: "0px 0px -60px 0px"
      }
    );

    revealEls.forEach((el) => observer.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add("is-visible"));
  }
});