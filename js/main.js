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
    const menuLinks = Array.from(mobileMenu.querySelectorAll("a"));

    const openMenu = () => {
      mobileMenu.classList.add("translate-x-0");
      mobileMenu.classList.remove("translate-x-full");
      menuBtn.classList.add("is-open");
      menuBtn.setAttribute("aria-expanded", "true");
      document.body.classList.add("menu-open");
      // Mueve el foco al primer enlace para lectores de pantalla y navegación por teclado
      if (menuLinks[0]) menuLinks[0].focus({ preventScroll: true });
    };

    const closeMenu = ({ restoreFocus = false } = {}) => {
      mobileMenu.classList.add("translate-x-full");
      mobileMenu.classList.remove("translate-x-0");
      menuBtn.classList.remove("is-open");
      menuBtn.setAttribute("aria-expanded", "false");
      document.body.classList.remove("menu-open");
      if (restoreFocus) menuBtn.focus({ preventScroll: true });
    };

    menuBtn.addEventListener("click", () => {
      const isOpen = menuBtn.getAttribute("aria-expanded") === "true";
      if (isOpen) {
        closeMenu();
      } else {
        openMenu();
      }
    });

    // Cerrar menú al presionar sobre un enlace
    menuLinks.forEach((link) => {
      link.addEventListener("click", () => closeMenu());
    });

    // Cerrar con la tecla Escape (accesibilidad de teclado)
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && menuBtn.getAttribute("aria-expanded") === "true") {
        closeMenu({ restoreFocus: true });
      }
    });

    // Cerrar al tocar el fondo del menú (fuera de los enlaces)
    mobileMenu.addEventListener("click", (e) => {
      if (e.target === mobileMenu) closeMenu();
    });

    // Si la ventana pasa a escritorio con el menú abierto, se cierra solo
    window.addEventListener("resize", () => {
      if (window.innerWidth >= 1024 && menuBtn.getAttribute("aria-expanded") === "true") {
        closeMenu();
      }
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

  // 7bis. Carrusel de Maquinaria Pesada: flechas, arrastre y barra de progreso
  (() => {
    const track = document.getElementById("mp-carousel-track");
    const prevBtn = document.getElementById("mp-carousel-prev");
    const nextBtn = document.getElementById("mp-carousel-next");
    const progressFill = document.getElementById("mp-carousel-progress");

    if (!track) return;

    // Cuánto avanza el carrusel por click: el ancho de una tarjeta + su gap
    const getStep = () => {
      const firstCard = track.querySelector(":scope > div");
      if (!firstCard) return track.clientWidth * 0.8;
      const styles = window.getComputedStyle(track);
      const gap = parseFloat(styles.columnGap || styles.gap || "0") || 0;
      return firstCard.getBoundingClientRect().width + gap;
    };

    const maxScroll = () => track.scrollWidth - track.clientWidth;

    const updateUI = () => {
      const max = maxScroll();
      const current = track.scrollLeft;

      if (prevBtn) prevBtn.disabled = current <= 2;
      if (nextBtn) nextBtn.disabled = current >= max - 2;

      if (progressFill) {
        const pct = max > 0 ? (current / max) * 100 : 0;
        progressFill.style.width = `${Math.min(100, Math.max(0, pct))}%`;
      }
    };

    prevBtn?.addEventListener("click", () => {
      track.scrollBy({ left: -getStep(), behavior: "smooth" });
    });

    nextBtn?.addEventListener("click", () => {
      track.scrollBy({ left: getStep(), behavior: "smooth" });
    });

    // Arrastre con mouse (escritorio) — el touch nativo ya funciona por overflow-x-auto
    let isDragging = false;
    let dragStartX = 0;
    let dragStartScroll = 0;
    let hasDragged = false;

    track.addEventListener("mousedown", (e) => {
      isDragging = true;
      hasDragged = false;
      track.classList.add("is-dragging");
      dragStartX = e.pageX;
      dragStartScroll = track.scrollLeft;
    });

    window.addEventListener("mousemove", (e) => {
      if (!isDragging) return;
      const delta = e.pageX - dragStartX;
      if (Math.abs(delta) > 5) hasDragged = true;
      track.scrollLeft = dragStartScroll - delta;
    });

    const stopDragging = () => {
      if (!isDragging) return;
      isDragging = false;
      track.classList.remove("is-dragging");
    };

    window.addEventListener("mouseup", stopDragging);
    track.addEventListener("mouseleave", stopDragging);

    // Evita que un arrastre termine disparando un click sobre una tarjeta
    track.addEventListener(
      "click",
      (e) => {
        if (hasDragged) {
          e.preventDefault();
          e.stopPropagation();
        }
      },
      { capture: true }
    );

    // Navegación con teclado cuando el carrusel tiene foco
    track.setAttribute("tabindex", "0");
    track.addEventListener("keydown", (e) => {
      if (e.key === "ArrowRight") {
        e.preventDefault();
        track.scrollBy({ left: getStep(), behavior: "smooth" });
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        track.scrollBy({ left: -getStep(), behavior: "smooth" });
      }
    });

    track.addEventListener("scroll", updateUI, { passive: true });
    window.addEventListener("resize", updateUI);
    updateUI();
  })();

  // 6bis. Ripple al hacer clic en botones (.btn-primary, .btn-outline, .btn-whatsapp-sm)
  const reduceMotionRipple = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!reduceMotionRipple) {
    document.querySelectorAll(".btn-primary, .btn-outline, .btn-whatsapp-sm").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const rect = btn.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height) * 2;
        const ripple = document.createElement("span");
        ripple.className = "ripple";
        ripple.style.width = ripple.style.height = `${size}px`;
        ripple.style.left = `${e.clientX - rect.left - size / 2}px`;
        ripple.style.top = `${e.clientY - rect.top - size / 2}px`;
        btn.appendChild(ripple);
        ripple.addEventListener("animationend", () => ripple.remove(), { once: true });
      });
    });
  }

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