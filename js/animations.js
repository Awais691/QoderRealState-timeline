/* ==========================================================================
   Haven Estates — Motion
   Viewport reveals and restrained statistic count-ups. All motion respects
   prefers-reduced-motion.
   ========================================================================== */

(function () {
  "use strict";

  const reduceMotion = window.matchMedia
    ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
    : false;

  let observer = null;

  function initReveals() {
    const elements = Array.from(document.querySelectorAll(".reveal"));
    if (elements.length === 0) return;

    if (reduceMotion || !("IntersectionObserver" in window)) {
      elements.forEach((element) => element.classList.add("is-visible"));
      return;
    }

    observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -8% 0px" }
    );

    elements.forEach((element) => {
      if (!element.classList.contains("is-visible")) observer.observe(element);
    });
  }

  function refreshReveals() {
    if (!observer) {
      document
        .querySelectorAll(".reveal:not(.is-visible)")
        .forEach((element) => element.classList.add("is-visible"));
      return;
    }

    document.querySelectorAll(".reveal:not(.is-visible)").forEach((element) => {
      if (!element.dataset.revealObserved) {
        element.dataset.revealObserved = "true";
        observer.observe(element);
      }
    });
  }

  function animateValue(element) {
    const target = Number.parseFloat(element.getAttribute("data-countup"));
    if (Number.isNaN(target)) return;
    const decimals = Number.parseInt(element.getAttribute("data-decimals") || "0", 10);
    const prefix = element.getAttribute("data-prefix") || "";
    const suffix = element.getAttribute("data-suffix") || "";
    const formatter = new Intl.NumberFormat("en-US", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    });

    const render = (value) => {
      element.textContent = `${prefix}${formatter.format(value)}${suffix}`;
    };

    if (reduceMotion) {
      render(target);
      return;
    }

    const duration = 1500;
    const start = performance.now();

    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      render(target * eased);
      if (progress < 1) window.requestAnimationFrame(tick);
    };

    render(0);
    window.requestAnimationFrame(tick);
  }

  function initCountUps() {
    const elements = Array.from(document.querySelectorAll("[data-countup]"));
    if (elements.length === 0) return;

    if (reduceMotion || !("IntersectionObserver" in window)) {
      elements.forEach((element) => {
        const target = Number.parseFloat(element.getAttribute("data-countup"));
        const decimals = Number.parseInt(element.getAttribute("data-decimals") || "0", 10);
        const prefix = element.getAttribute("data-prefix") || "";
        const suffix = element.getAttribute("data-suffix") || "";
        if (!Number.isNaN(target)) {
          element.textContent = `${prefix}${new Intl.NumberFormat("en-US", {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals
          }).format(target)}${suffix}`;
        }
      });
      return;
    }

    const counterObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animateValue(entry.target);
            counterObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.4 }
    );

    elements.forEach((element) => counterObserver.observe(element));
  }

  function initMutationWatch() {
    if (!("MutationObserver" in window)) return;
    let scheduled = false;
    const mutationObserver = new MutationObserver(() => {
      if (scheduled) return;
      scheduled = true;
      window.requestAnimationFrame(() => {
        scheduled = false;
        refreshReveals();
      });
    });
    mutationObserver.observe(document.body, { childList: true, subtree: true });
  }

  function init() {
    initReveals();
    initCountUps();
    initMutationWatch();
  }

  window.HavenAnimations = { refresh: refreshReveals };

  if (window.HavenUI) {
    window.HavenUI.onReady(init);
  } else {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  }
})();
