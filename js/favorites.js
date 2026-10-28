/* ==========================================================================
   Haven Estates — Shortlist (favourites)
   Persists saved properties in localStorage and powers the slide-over panel.
   ========================================================================== */

(function () {
  "use strict";

  const STORAGE_KEY = "haven:favorites";

  const propertyMap = () =>
    new Map((window.HAVEN_PROPERTIES || []).map((property) => [property.id, property]));

  function readIds() {
    const stored = window.HavenUI ? window.HavenUI.storage.get(STORAGE_KEY, []) : [];
    const validIds = new Set((window.HAVEN_PROPERTIES || []).map((property) => property.id));
    return Array.isArray(stored) ? stored.filter((id) => validIds.has(id)) : [];
  }

  function writeIds(ids) {
    if (window.HavenUI) window.HavenUI.storage.set(STORAGE_KEY, ids);
    document.dispatchEvent(
      new CustomEvent("haven:favorites-changed", { detail: { ids: [...ids] } })
    );
  }

  function has(id) {
    return readIds().includes(id);
  }

  function count() {
    return readIds().length;
  }

  function toggle(id) {
    const ids = readIds();
    const property = propertyMap().get(id);
    const index = ids.indexOf(id);
    const wasSaved = index !== -1;

    if (wasSaved) {
      ids.splice(index, 1);
    } else {
      ids.push(id);
    }

    writeIds(ids);
    refresh();

    if (window.HavenUI && property) {
      window.HavenUI.showToast(
        wasSaved
          ? `${property.title} removed from your shortlist`
          : `${property.title} saved to your shortlist`
      );
    }

    return !wasSaved;
  }

  function remove(id) {
    const ids = readIds();
    const next = ids.filter((savedId) => savedId !== id);
    if (next.length === ids.length) return;
    writeIds(next);
    refresh();
  }

  function syncButtons() {
    const ids = readIds();
    document.querySelectorAll("[data-favorite-id]").forEach((button) => {
      const id = button.getAttribute("data-favorite-id");
      const property = propertyMap().get(id);
      const saved = ids.includes(id);
      button.classList.toggle("is-active", saved);
      button.setAttribute("aria-pressed", String(saved));
      if (property) {
        button.setAttribute(
          "aria-label",
          saved
            ? `Remove ${property.title} from your shortlist`
            : `Save ${property.title} to your shortlist`
        );
      }
    });

    document.querySelectorAll("[data-favorites-count]").forEach((element) => {
      element.textContent = String(ids.length);
      element.setAttribute("data-count", String(ids.length));
    });
  }

  function renderPanel() {
    const list = document.querySelector("[data-favorites-list]");
    const footer = document.querySelector("[data-favorites-footer]");
    const summary = document.querySelector("[data-favorites-summary]");
    if (!list) return;

    const ids = readIds();
    const properties = ids.map((id) => propertyMap().get(id)).filter(Boolean);

    if (summary) {
      summary.textContent =
        properties.length === 0
          ? "No saved properties yet"
          : `${properties.length} saved ${properties.length === 1 ? "property" : "properties"}`;
    }

    if (footer) {
      footer.hidden = properties.length === 0;
    }

    if (properties.length === 0) {
      list.innerHTML = `
        <li class="favorites-empty">
          ${window.HavenUI.icon("heart")}
          <p>Your shortlist is empty. Tap the heart on any property to keep it here for later.</p>
        </li>`;
      return;
    }

    list.innerHTML = properties
      .map((property) => {
        const agent = window.HavenUI.getAgent(property.agentId);
        return `
          <li class="favorite-row">
            <img src="${property.images[0]}" alt="${window.HavenUI.escapeHTML(property.imageAlts[0])}" loading="lazy" width="96" height="76">
            <div>
              <a class="favorite-row__title" href="property-details.html?id=${encodeURIComponent(property.id)}">${window.HavenUI.escapeHTML(property.title)}</a>
              <p class="favorite-row__meta">${window.HavenUI.escapeHTML(property.location)}${agent ? ` · ${window.HavenUI.escapeHTML(agent.name)}` : ""}</p>
              <p class="favorite-row__price">${window.HavenUI.formatPrice(property)}${property.status === "rent" ? " / month" : ""}</p>
            </div>
            <button class="favorite-remove" type="button" data-remove-favorite="${property.id}" aria-label="Remove ${window.HavenUI.escapeHTML(property.title)} from your shortlist">
              ${window.HavenUI.icon("close")}
            </button>
          </li>`;
      })
      .join("");
  }

  function refresh() {
    syncButtons();
    renderPanel();
  }

  let panelOpener = null;

  function isPanelOpen() {
    const panel = document.querySelector("[data-favorites-panel]");
    return Boolean(panel && panel.classList.contains("is-open"));
  }

  function openPanel() {
    const panel = document.querySelector("[data-favorites-panel]");
    const scrim = document.querySelector("[data-panel-scrim]");
    if (!panel) return;

    if (document.querySelector(".mobile-menu.is-open")) {
      document.dispatchEvent(new CustomEvent("haven:close-menu"));
    }

    panelOpener = document.activeElement;
    renderPanel();
    panel.classList.add("is-open");
    panel.setAttribute("aria-hidden", "false");
    if (scrim) scrim.classList.add("is-open");
    document.body.classList.add("no-scroll");

    const closeButton = panel.querySelector("[data-favorites-close]");
    if (closeButton) window.setTimeout(() => closeButton.focus(), 60);
  }

  function closePanel() {
    const panel = document.querySelector("[data-favorites-panel]");
    const scrim = document.querySelector("[data-panel-scrim]");
    if (!panel) return;

    panel.classList.remove("is-open");
    panel.setAttribute("aria-hidden", "true");
    if (scrim) scrim.classList.remove("is-open");
    if (!document.querySelector(".mobile-menu.is-open")) {
      document.body.classList.remove("no-scroll");
    }

    if (panelOpener && typeof panelOpener.focus === "function") {
      panelOpener.focus();
    }
    panelOpener = null;
  }

  document.addEventListener("click", (event) => {
    const favoriteButton = event.target.closest("[data-favorite-id]");
    if (favoriteButton) {
      event.preventDefault();
      toggle(favoriteButton.getAttribute("data-favorite-id"));
      return;
    }

    const removeButton = event.target.closest("[data-remove-favorite]");
    if (removeButton) {
      remove(removeButton.getAttribute("data-remove-favorite"));
      return;
    }

    if (event.target.closest("[data-favorites-open]")) {
      event.preventDefault();
      openPanel();
      return;
    }

    if (event.target.closest("[data-favorites-close]")) {
      event.preventDefault();
      closePanel();
      return;
    }

    if (event.target.matches("[data-panel-scrim]")) {
      closePanel();
      return;
    }

    const panelLink = event.target.closest(".favorites-panel a");
    if (panelLink) closePanel();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && isPanelOpen()) {
      closePanel();
    }
  });

  document.addEventListener("haven:close-favorites", closePanel);

  window.HavenFavorites = {
    has,
    count,
    toggle,
    remove,
    refresh,
    open: openPanel,
    close: closePanel,
    ids: readIds
  };

  if (window.HavenUI) {
    window.HavenUI.onReady(refresh);
  } else {
    document.addEventListener("DOMContentLoaded", refresh, { once: true });
  }
})();
