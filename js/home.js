/* ==========================================================================
   Haven Estates — Homepage
   Curated property, advisor and journal rails, the hero search tabs and the
   testimonial carousel.
   ========================================================================== */

(function () {
  "use strict";

  function initHomeRails() {
    const ui = window.HavenUI;
    const featuredHost = document.querySelector("[data-home-featured]");
    const agentsHost = document.querySelector("[data-home-agents]");
    const postsHost = document.querySelector("[data-home-posts]");

    if (featuredHost) {
      const featured = (window.HAVEN_PROPERTIES || [])
        .filter((property) => property.featured && property.status === "sale")
        .slice(0, 3);
      featuredHost.innerHTML = featured.map((property) => ui.propertyCard(property)).join("");
    }

    if (agentsHost) {
      const agents = (window.HAVEN_AGENTS || []).filter((agent) => agent.featured).slice(0, 3);
      agentsHost.innerHTML = agents.map((agent) => ui.agentCard(agent)).join("");
    }

    if (postsHost) {
      const posts = [...(window.HAVEN_POSTS || [])]
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 3);
      postsHost.innerHTML = posts.map((post) => ui.postCard(post)).join("");
    }

    if (window.HavenAnimations) window.HavenAnimations.refresh();
  }

  function initSearchTabs() {
    const tabList = document.querySelector("[data-search-tabs]");
    if (!tabList || !window.HavenUI) return;

    const ui = window.HavenUI;
    const tabs = Array.from(tabList.querySelectorAll("[data-search-tab]"));
    const panels = Array.from(document.querySelectorAll("[data-search-form]"));
    const saleLocations = window.HavenFilters
      ? window.HavenFilters.locationsFor("sale")
      : [];
    const rentLocations = window.HavenFilters
      ? window.HavenFilters.locationsFor("rent")
      : [];
    const saleTypes = window.HavenFilters ? window.HavenFilters.typesFor("sale") : [];
    const rentTypes = window.HavenFilters ? window.HavenFilters.typesFor("rent") : [];
    const allLocations = Array.from(new Set([...saleLocations, ...rentLocations])).sort();
    const allTypes = Array.from(new Set([...saleTypes, ...rentTypes])).sort();

    const priceOptions = {
      buy: [
        ["", "Any budget"],
        ["5000000", "Up to $5M"],
        ["10000000", "Up to $10M"],
        ["20000000", "Up to $20M"]
      ],
      rent: [
        ["", "Any budget"],
        ["15000", "Up to $15k / month"],
        ["25000", "Up to $25k / month"],
        ["35000", "Up to $35k / month"]
      ]
    };

    panels.forEach((panel) => {
      const mode = panel.dataset.searchForm;
      const locationSelect = panel.querySelector("[data-search-location]");
      const typeSelect = panel.querySelector("[data-search-type]");
      const priceSelect = panel.querySelector("[data-search-price]");

      const locations = mode === "buy" ? saleLocations : mode === "rent" ? rentLocations : allLocations;
      const types = mode === "buy" ? saleTypes : mode === "rent" ? rentTypes : allTypes;

      if (locationSelect) {
        locationSelect.innerHTML = `<option value="">Any location</option>${locations
          .map((location) => `<option value="${ui.escapeHTML(location)}">${ui.escapeHTML(location)}</option>`)
          .join("")}`;
      }
      if (typeSelect) {
        typeSelect.innerHTML = `<option value="">Any type</option>${types
          .map((type) => `<option value="${ui.escapeHTML(type)}">${ui.escapeHTML(type)}</option>`)
          .join("")}`;
      }
      if (priceSelect && priceOptions[mode]) {
        priceSelect.innerHTML = priceOptions[mode]
          .map(([value, label]) => `<option value="${value}">${label}</option>`)
          .join("");
      }
    });

    function activate(mode, focusTab) {
      tabs.forEach((tab) => {
        const selected = tab.dataset.searchTab === mode;
        tab.setAttribute("aria-selected", String(selected));
        tab.tabIndex = selected ? 0 : -1;
        if (selected && focusTab) tab.focus();
      });
      panels.forEach((panel) => {
        panel.hidden = panel.dataset.searchForm !== mode;
      });
    }

    tabs.forEach((tab, index) => {
      tab.addEventListener("click", () => activate(tab.dataset.searchTab));
      tab.addEventListener("keydown", (event) => {
        if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
        event.preventDefault();
        let nextIndex = index;
        if (event.key === "ArrowRight") nextIndex = (index + 1) % tabs.length;
        if (event.key === "ArrowLeft") nextIndex = (index - 1 + tabs.length) % tabs.length;
        if (event.key === "Home") nextIndex = 0;
        if (event.key === "End") nextIndex = tabs.length - 1;
        activate(tabs[nextIndex].dataset.searchTab, true);
      });
    });

    activate(tabs.find((tab) => tab.getAttribute("aria-selected") === "true")?.dataset.searchTab || "buy");
  }

  function initTestimonials() {
    const section = document.querySelector("[data-testimonial]");
    const track = document.querySelector("[data-testimonial-track]");
    if (!section || !track || !window.HavenUI) return;

    const ui = window.HavenUI;
    const quotes = window.HAVEN_TESTIMONIALS || [];
    if (!quotes.length) return;

    track.innerHTML = quotes
      .map(
        (quote, index) => `
        <div class="testimonial-slide" role="group" aria-roledescription="slide" aria-label="${index + 1} of ${quotes.length}" aria-hidden="${index === 0 ? "false" : "true"}">
          <blockquote class="testimonial-quote">${ui.escapeHTML(quote.quote)}</blockquote>
          <p class="testimonial-author">${ui.escapeHTML(quote.name)}</p>
          <p class="testimonial-meta">${ui.escapeHTML(quote.meta)}</p>
        </div>`
      )
      .join("");

    const slides = Array.from(track.children);
    const dotsHost = document.querySelector("[data-testimonial-dots]");
    const prev = document.querySelector("[data-testimonial-prev]");
    const next = document.querySelector("[data-testimonial-next]");
    const reduceMotion = window.matchMedia
      ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
      : false;
    let index = 0;
    let timer = null;

    if (dotsHost) {
      dotsHost.innerHTML = quotes
        .map(
          (quote, dotIndex) =>
            `<button class="carousel-dot" type="button" data-testimonial-dot="${dotIndex}" aria-selected="${dotIndex === 0}" aria-label="Show testimonial ${dotIndex + 1}: ${ui.escapeHTML(quote.name)}"></button>`
        )
        .join("");
    }

    const dots = Array.from(document.querySelectorAll("[data-testimonial-dot]"));

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      track.style.transform = `translateX(-${index * 100}%)`;
      slides.forEach((slide, slideIndex) => {
        const active = slideIndex === index;
        slide.setAttribute("aria-hidden", String(!active));
        const focusables = slide.querySelectorAll("a, button");
        focusables.forEach((element) => {
          if (active) element.removeAttribute("tabindex");
          else element.setAttribute("tabindex", "-1");
        });
      });
      dots.forEach((dot, dotIndex) => {
        dot.setAttribute("aria-selected", String(dotIndex === index));
      });
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    function start() {
      stop();
      if (reduceMotion || slides.length < 2) return;
      timer = window.setInterval(() => show(index + 1), 7000);
    }

    if (prev) prev.addEventListener("click", () => { show(index - 1); start(); });
    if (next) next.addEventListener("click", () => { show(index + 1); start(); });

    dots.forEach((dot) => {
      dot.addEventListener("click", () => {
        show(Number(dot.dataset.testimonialDot));
        start();
      });
    });

    section.addEventListener("mouseenter", stop);
    section.addEventListener("mouseleave", start);
    section.addEventListener("focusin", stop);
    section.addEventListener("focusout", (event) => {
      if (!section.contains(event.relatedTarget)) start();
    });
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) stop();
      else start();
    });

    let startX = null;
    track.addEventListener("pointerdown", (event) => {
      startX = event.clientX;
    });
    track.addEventListener("pointerup", (event) => {
      if (startX === null) return;
      const delta = event.clientX - startX;
      startX = null;
      if (Math.abs(delta) < 45) return;
      show(delta < 0 ? index + 1 : index - 1);
      start();
    });

    show(0);
    start();
  }

  if (window.HavenUI) {
    window.HavenUI.onReady(() => {
      initHomeRails();
      initSearchTabs();
      initTestimonials();
    });
  }
})();
