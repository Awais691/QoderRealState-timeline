/* ==========================================================================
   Haven Estates — Shared UI utilities
   Inline icon set, formatting helpers, reusable card templates, image
   fallbacks and toast feedback. No dependencies.
   ========================================================================== */

(function () {
  "use strict";

  const ICONS = {
    arrowRight: '<path d="M4 12h16"/><path d="m13 5 7 7-7 7"/>',
    arrowUpRight: '<path d="M7 17 17 7"/><path d="M8 7h9v9"/>',
    arrowLeft: '<path d="M20 12H4"/><path d="m11 5-7 7 7 7"/>',
    chevronDown: '<path d="m6 9 6 6 6-6"/>',
    chevronLeft: '<path d="m15 18-6-6 6-6"/>',
    chevronRight: '<path d="m9 18 6-6-6-6"/>',
    heart: '<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8Z"/>',
    mapPin: '<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/>',
    bed: '<path d="M3 19v-7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v7"/><path d="M5 10V7a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v3"/><path d="M3 17h18"/><path d="M7 13h4v4H7z"/>',
    bath: '<path d="M3 12h18v3a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4v-3Z"/><path d="M6 12V5.5A2.5 2.5 0 0 1 8.5 3c1.2 0 2.3.8 2.5 2"/><path d="M5 21v-2M19 21v-2"/>',
    area: '<path d="M8 3H5a2 2 0 0 0-2 2v3M16 3h3a2 2 0 0 1 2 2v3M21 16v3a2 2 0 0 1-2 2h-3M8 21H5a2 2 0 0 1-2-2v-3"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
    phone: '<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 2 .7 2.9a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.2-1.2a2 2 0 0 1 2.1-.5c.9.3 1.9.6 2.9.7a2 2 0 0 1 1.7 2Z"/>',
    mail: '<rect x="2.5" y="4.5" width="19" height="15" rx="2"/><path d="m3 7 9 6 9-6"/>',
    menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
    close: '<path d="M6 6l12 12M18 6 6 18"/>',
    check: '<path d="m4 12 5 5L20 6"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    grid: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
    list: '<path d="M8 6h13M8 12h13M8 18h13"/><circle cx="4" cy="6" r="1"/><circle cx="4" cy="12" r="1"/><circle cx="4" cy="18" r="1"/>',
    sliders: '<path d="M4 6h10M18 6h2M4 12h4M12 12h8M4 18h12M20 18h0"/><circle cx="16" cy="6" r="2"/><circle cx="10" cy="12" r="2"/><circle cx="18" cy="18" r="2"/>',
    home: '<path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V21h14V9.5"/><path d="M9 21v-6h6v6"/>',
    building: '<rect x="4" y="3" width="16" height="18" rx="1"/><path d="M9 7h2M13 7h2M9 11h2M13 11h2M9 15h2M13 15h2M10 21v-3h4v3"/>',
    key: '<circle cx="8" cy="8" r="4.5"/><path d="m11.5 11.5 8 8M16 16l2-2M18.5 18.5l2-2"/>',
    leaf: '<path d="M20 4c0 10-5.5 16-13 16H4c0-9 5-16 16-16Z"/><path d="M4 20c2-6 6-10 12-12"/>',
    waves: '<path d="M2 8c2.5 0 2.5 2 5 2s2.5-2 5-2 2.5 2 5 2 2.5-2 5-2M2 14c2.5 0 2.5 2 5 2s2.5-2 5-2 2.5 2 5 2 2.5-2 5-2M2 20c2.5 0 2.5 2 5 2s2.5-2 5-2 2.5 2 5 2 2.5-2 5-2"/>',
    mountain: '<path d="m3 20 7-13 4 7 2-3 5 9H3Z"/><path d="m8.5 10.5 1.5 1 1.5-1"/>',
    award: '<circle cx="12" cy="9" r="6"/><path d="m8.5 14-1.5 7 5-3 5 3-1.5-7"/>',
    shield: '<path d="M12 3 5 6v6c0 4.5 3 7.5 7 9 4-1.5 7-4.5 7-9V6l-7-3Z"/><path d="m9 12 2 2 4-4"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M8 3v4M16 3v4M3 10h18"/>',
    expand: '<path d="M8 3H3v5M16 3h5v5M21 16v5h-5M3 16v5h5"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>',
    star: '<path d="m12 3 2.7 5.6 6.3.9-4.5 4.4 1 6.1-5.5-2.9-5.5 2.9 1-6.1L3 9.5l6.3-.9L12 3Z"/>',
    copy: '<rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1"/>',
    alert: '<path d="M12 3 2.5 20h19L12 3Z"/><path d="M12 9v5M12 17h.01"/>',
    checkCircle: '<circle cx="12" cy="12" r="9"/><path d="m8 12 2.5 2.5L16 9"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
    tag: '<path d="M20 12.5 12.5 20a2 2 0 0 1-2.8 0L3 13.3V3h10.3l6.7 6.7a2 2 0 0 1 0 2.8Z"/><circle cx="8" cy="8" r="1.5"/>',
    car: '<path d="M5 17h14M4 17v-4l2-5h12l2 5v4"/><path d="M6 17v2M18 17v2"/><circle cx="7.5" cy="13" r="1"/><circle cx="16.5" cy="13" r="1"/>'
  };

  function icon(name, className) {
    const body = ICONS[name];
    if (!body) return "";
    return `<svg${className ? ` class="${className}"` : ""} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${body}</svg>`;
  }

  const escapeHTML = (value) =>
    String(value ?? "").replace(/[&<>"']/g, (character) => {
      switch (character) {
        case "&":
          return "&amp;";
        case "<":
          return "&lt;";
        case ">":
          return "&gt;";
        case '"':
          return "&quot;";
        default:
          return "&#39;";
      }
    });

  const formatPrice = (property) => {
    const formatter = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: property.currency || "USD",
      maximumFractionDigits: 0
    });
    return formatter.format(property.price);
  };

  const priceSuffix = (property) =>
    property.status === "rent" ? '<small>per month</small>' : "";

  const formatArea = (area) => `${new Intl.NumberFormat("en-US").format(area)} sq ft`;

  const formatDate = (dateString) =>
    new Intl.DateTimeFormat("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric"
    }).format(new Date(`${dateString}T12:00:00`));

  const formatDateShort = (dateString) =>
    new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric"
    }).format(new Date(`${dateString}T12:00:00`));

  const getProperty = (id) =>
    (window.HAVEN_PROPERTIES || []).find((property) => property.id === id) || null;

  const getAgent = (id) =>
    (window.HAVEN_AGENTS || []).find((agent) => agent.id === id) || null;

  const getPost = (id) =>
    (window.HAVEN_POSTS || []).find((post) => post.id === id) || null;

  const isFavorite = (id) =>
    Boolean(window.HavenFavorites && window.HavenFavorites.has(id));

  const propertyCard = (property, options = {}) => {
    const href = `property-details.html?id=${encodeURIComponent(property.id)}`;
    const agent = getAgent(property.agentId);
    const loading = options.eager ? "eager" : "lazy";
    const priority = options.eager ? ' fetchpriority="high"' : "";
    const tagBadge = property.tag
      ? `<span class="badge badge--dark">${escapeHTML(property.tag)}</span>`
      : "";
    const price = formatPrice(property);

    return `
      <article class="property-card reveal" data-property-card="${property.id}">
        <div class="property-media">
          <img src="${property.images[0]}" alt="${escapeHTML(property.imageAlts[0])}" loading="${loading}" decoding="async" width="1400" height="1050"${priority}>
          <div class="property-media__badges">
            <span class="badge">${property.status === "rent" ? "For rent" : "For sale"}</span>
            ${tagBadge}
          </div>
          <button class="fav-btn${isFavorite(property.id) ? " is-active" : ""}" type="button" data-favorite-id="${property.id}" aria-pressed="${isFavorite(property.id)}" aria-label="Save ${escapeHTML(property.title)} to your shortlist">
            ${icon("heart")}
          </button>
        </div>
        <div class="property-body">
          <p class="property-price">${price}${priceSuffix(property)}</p>
          <h3 class="property-title"><a href="${href}">${escapeHTML(property.title)}</a></h3>
          <p class="property-location">${icon("mapPin")} ${escapeHTML(property.location)}, ${escapeHTML(property.region)}</p>
          <div class="property-meta">
            <span class="meta-item">${icon("bed")} ${property.beds} bed${property.beds === 1 ? "" : "s"}</span>
            <span class="meta-item">${icon("bath")} ${property.baths} bath${property.baths === 1 ? "" : "s"}</span>
            <span class="meta-item">${icon("area")} ${formatArea(property.area)}</span>
            ${agent ? `<span class="meta-item" title="Represented by ${escapeHTML(agent.name)}">${icon("user")} ${escapeHTML(agent.name.split(" ")[0])}</span>` : ""}
          </div>
        </div>
      </article>`;
  };

  const agentCard = (agent) => `
    <article class="agent-card reveal" data-agent-card="${agent.id}">
      <div class="agent-media">
        <img src="${agent.image}" alt="Portrait of ${escapeHTML(agent.name)}, ${escapeHTML(agent.role)}" loading="lazy" decoding="async" width="800" height="1000">
        <span class="badge agent-media__tag">${agent.listings} active listings</span>
      </div>
      <div class="agent-body">
        <p class="agent-specialty">${escapeHTML(agent.focus)}</p>
        <h3 class="agent-name">${escapeHTML(agent.name)}</h3>
        <p class="agent-role">${escapeHTML(agent.role)} · ${escapeHTML(agent.languages)}</p>
        <p class="agent-languages">${agent.years} years with Haven Estates</p>
        <div class="agent-actions">
          <a class="btn btn-outline btn-sm" href="mailto:${agent.email}">${icon("mail")} Email</a>
          <a class="btn btn-outline btn-sm" href="tel:${agent.phone.replace(/[^+\d]/g, "")}">${icon("phone")} Call</a>
        </div>
      </div>
    </article>`;

  const postCard = (post) => {
    const author = getAgent(post.authorId);
    const href = `blog-details.html?id=${encodeURIComponent(post.id)}`;
    return `
      <article class="post-card reveal">
        <a class="post-card__media" href="${href}" tabindex="-1" aria-hidden="true">
          <img src="${post.image}" alt="${escapeHTML(post.imageAlt)}" loading="lazy" decoding="async" width="1200" height="800">
        </a>
        <div class="post-card__body">
          <p class="post-meta">
            <span class="post-meta__cat">${escapeHTML(post.category)}</span>
            <span class="post-meta__dot" aria-hidden="true"></span>
            <time datetime="${post.date}">${formatDateShort(post.date)}</time>
            <span class="post-meta__dot" aria-hidden="true"></span>
            <span>${escapeHTML(post.readTime)}</span>
          </p>
          <h3><a href="${href}">${escapeHTML(post.title)}</a></h3>
          <p>${escapeHTML(post.excerpt)}</p>
          <a class="link-arrow" href="${href}" aria-label="Read ${escapeHTML(post.title)}">Read article ${icon("arrowRight")}</a>
        </div>
      </article>`;
  };

  const FALLBACK_IMAGE = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="900" viewBox="0 0 1200 900"><rect width="1200" height="900" fill="#E7E2D8"/><g fill="none" stroke="#183D32" stroke-opacity=".32" stroke-width="6" stroke-linecap="round"><path d="M430 610V430c0-94 76-170 170-170s170 76 170 170v180"/><path d="M510 610V455c0-50 40-90 90-90s90 40 90 90v155"/><path d="M300 610h600"/></g><text x="600" y="700" text-anchor="middle" font-family="Georgia,serif" font-size="34" fill="#183D32" fill-opacity=".6">Haven Estates</text></svg>'
  )}`;

  function applyImageFallback(image) {
    if (!(image instanceof HTMLImageElement) || image.dataset.fallbackApplied) return;
    image.dataset.fallbackApplied = "true";
    image.src = FALLBACK_IMAGE;
    image.classList.add("img-fallback");
    image.style.objectFit = "cover";
  }

  function initImageFallback() {
    window.addEventListener(
      "error",
      (event) => {
        if (event.target instanceof HTMLImageElement) applyImageFallback(event.target);
      },
      true
    );

    window.addEventListener("load", () => {
      document.querySelectorAll("img").forEach((image) => {
        if (image.complete && image.naturalWidth === 0) applyImageFallback(image);
      });
    });
  }

  function hydrateIcons(root = document) {
    root.querySelectorAll("[data-icon]").forEach((element) => {
      const name = element.getAttribute("data-icon");
      const svg = icon(name, element.getAttribute("data-icon-class"));
      if (!svg) return;
      element.classList.add("icon-slot");
      element.removeAttribute("data-icon");
      element.removeAttribute("data-icon-class");
      element.setAttribute("aria-hidden", "true");
      element.innerHTML = svg;
    });
  }

  function initAccordions() {
    document.querySelectorAll("[data-accordion]").forEach((accordion) => {
      const single = accordion.getAttribute("data-accordion") === "single";
      const triggers = Array.from(accordion.querySelectorAll("[data-accordion-trigger]"));

      triggers.forEach((trigger) => {
        trigger.addEventListener("click", () => {
          const panel = document.getElementById(trigger.getAttribute("aria-controls"));
          const isOpen = trigger.getAttribute("aria-expanded") === "true";
          const item = trigger.closest(".accordion-item");

          if (single && !isOpen) {
            triggers.forEach((other) => {
              if (other === trigger) return;
              other.setAttribute("aria-expanded", "false");
              const otherPanel = document.getElementById(other.getAttribute("aria-controls"));
              if (otherPanel) otherPanel.setAttribute("aria-hidden", "true");
              const otherItem = other.closest(".accordion-item");
              if (otherItem) otherItem.classList.remove("is-open");
            });
          }

          trigger.setAttribute("aria-expanded", String(!isOpen));
          if (panel) panel.setAttribute("aria-hidden", String(isOpen));
          if (item) item.classList.toggle("is-open", !isOpen);
        });
      });
    });
  }

  let toastTimer = null;

  function showToast(message) {
    const toast = document.querySelector("[data-toast]");
    if (!toast) return;
    const messageEl = toast.querySelector("[data-toast-message]");
    if (messageEl) messageEl.textContent = message;
    toast.classList.add("is-visible");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => toast.classList.remove("is-visible"), 2800);
  }

  function onReady(callback) {
    if (document.readyState === "complete") {
      window.setTimeout(callback, 0);
    } else {
      document.addEventListener("DOMContentLoaded", () => callback(), { once: true });
    }
  }

  function debounce(callback, delay = 180) {
    let timer;
    return function debounced(...args) {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => callback.apply(this, args), delay);
    };
  }

  const storage = {
    get(key, fallback) {
      try {
        const value = window.localStorage.getItem(key);
        return value === null ? fallback : JSON.parse(value);
      } catch (error) {
        return fallback;
      }
    },
    set(key, value) {
      try {
        window.localStorage.setItem(key, JSON.stringify(value));
        return true;
      } catch (error) {
        return false;
      }
    }
  };

  function getParam(name) {
    return new URLSearchParams(window.location.search).get(name);
  }

  function setDocumentTitle(title) {
    document.title = title;
  }

  function updateMetaDescription(description) {
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", description);
  }

  window.HavenUI = {
    icon,
    escapeHTML,
    formatPrice,
    priceSuffix,
    formatArea,
    formatDate,
    formatDateShort,
    getProperty,
    getAgent,
    getPost,
    propertyCard,
    agentCard,
    postCard,
    showToast,
    onReady,
    debounce,
    storage,
    getParam,
    setDocumentTitle,
    updateMetaDescription,
    hydrateIcons,
    fallbackImage: FALLBACK_IMAGE
  };

  initImageFallback();
  onReady(hydrateIcons);
  onReady(initAccordions);
})();
