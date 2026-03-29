(function () {
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  const nav = document.getElementById("site-nav");
  const toggle = document.getElementById("nav-toggle");
  const mqNav = window.matchMedia("(max-width: 767px)");

  function setNavOpen(open) {
    if (!nav || !toggle) return;
    document.body.classList.toggle("nav-open", open);
    nav.classList.toggle("is-open", open);
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
    toggle.setAttribute("aria-label", open ? "סגור את התפריט" : "פתח את התפריט");
  }

  function closeNav() {
    setNavOpen(false);
  }

  if (nav && toggle) {
    toggle.addEventListener("click", function () {
      const open = !nav.classList.contains("is-open");
      setNavOpen(open);
    });

    nav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        if (mqNav.matches) closeNav();
      });
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeNav();
    });

    function handleMqNavChange() {
      if (!mqNav.matches) closeNav();
    }
    if (typeof mqNav.addEventListener === "function") {
      mqNav.addEventListener("change", handleMqNavChange);
    } else if (mqNav.addListener) {
      mqNav.addListener(handleMqNavChange);
    }
  }

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduceMotion) return;

  const items = document.querySelectorAll("[data-reveal]");
  if (!items.length || !("IntersectionObserver" in window)) {
    items.forEach((el) => el.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    { root: null, rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
  );

  items.forEach((el, i) => {
    el.style.transitionDelay = `${Math.min(i * 0.05, 0.35)}s`;
    observer.observe(el);
  });
})();
