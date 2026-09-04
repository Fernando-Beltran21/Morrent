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

  // 4.1 Stagger automático: los elementos .reveal que comparten el mismo
  //     contenedor aparecen con un pequeño retraso incremental entre sí,
  //     dando una entrada más orgánica sin tocar el HTML de cada página.
  const staggerCounters = new Map();
  revealEls.forEach((el) => {
    const parent = el.parentElement;
    const index = staggerCounters.get(parent) || 0;
    el.style.setProperty("--stagger", `${Math.min(index, 5) * 90}ms`);
    staggerCounters.set(parent, index + 1);
  });

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

  // 5. Barra de progreso de scroll (minimalista, en la parte superior)
  const progressBar = document.createElement("div");
  progressBar.className = "scroll-progress";
  progressBar.setAttribute("aria-hidden", "true");
  document.body.appendChild(progressBar);

  const updateProgress = () => {
    const docEl = document.documentElement;
    const scrollable = docEl.scrollHeight - docEl.clientHeight;
    const pct = scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0;
    progressBar.style.width = `${Math.min(100, Math.max(0, pct))}%`;
  };

  updateProgress();
  window.addEventListener("scroll", updateProgress, { passive: true });
  window.addEventListener("resize", updateProgress);

  // 6. Blur-up: las imágenes marcadas con .reveal-img se destapan al cargar
  document.querySelectorAll("img.reveal-img").forEach((img) => {
    if (img.complete) {
      img.classList.add("is-loaded");
    } else {
      img.addEventListener("load", () => img.classList.add("is-loaded"), { once: true });
    }
  });

  // 7. Conteo animado para cifras destacadas (data-count-to="123")
  const countEls = document.querySelectorAll("[data-count-to]");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const animateCount = (el) => {
    const target = parseFloat(el.dataset.countTo);
    if (Number.isNaN(target)) return;

    if (reduceMotion) {
      el.textContent = el.dataset.countTo;
      return;
    }

    const suffix = el.dataset.countSuffix || "";
    const duration = 1400;
    const start = performance.now();

    const step = (now) => {
      const progress = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      const value = Math.round(target * eased);
      el.textContent = `${value}${suffix}`;
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  if ("IntersectionObserver" in window && countEls.length) {
    const countObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animateCount(entry.target);
            countObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.4 }
    );
    countEls.forEach((el) => countObserver.observe(el));
  } else {
    countEls.forEach(animateCount);
  }
});