(function () {
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

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
