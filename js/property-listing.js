/* ==========================================================================
   Haven Estates — Buy & Rent listings
   Filter panel, live results, sorting, view toggle, shortlist-only mode and
   progressive load-more for the shared listing page.
   ========================================================================== */

(function () {
  "use strict";

  const PAGE_SIZE = 6;

  function initListing() {
    const root = document.querySelector("[data-listing]");
    if (!root || !window.HavenFilters || !window.HavenUI) return;

    const mode = root.dataset.mode === "rent" ? "rent" : "sale";
    const noun = mode === "rent" ? "rentals" : "homes";
    const panel = root.querySelector("[data-filter-host]");
    const results = root.querySelector("[data-property-results]");
    const countEl = root.querySelector("[data-results-count]");
    const empty = root.querySelector("[data-empty-state]");
    const emptyTitle = root.querySelector("[data-empty-title]");
    const emptyText = root.querySelector("[data-empty-text]");
    const activeRow = root.querySelector("[data-active-filters]");
    const loadWrap = root.querySelector("[data-load-more-wrap]");
    const loadButton = root.querySelector("[data-load-more]");
    const loadNote = root.querySelector("[data-load-more-note]");
    const sortSelect = root.querySelector("[data-sort]");
    const viewButtons = Array.from(root.querySelectorAll("[data-view]"));
    const filterToggle = root.querySelector("[data-filters-toggle]");
    const filterCount = root.querySelector("[data-filters-count]");

    const base = (window.HAVEN_PROPERTIES || []).filter((property) => property.status === mode);
    let state = window.HavenFilters.readState();
    let sort = window.HavenFilters.readSort();
    let view = window.HavenFilters.readView();
    let shown = PAGE_SIZE;

    const form = window.HavenFilters.buildPanel(panel, state, mode);

    if (sortSelect) {
      sortSelect.innerHTML = window.HavenFilters.SORT_OPTIONS.map(
        ([value, label]) => `<option value="${value}">${label}</option>`
      ).join("");
      sortSelect.value = sort;
    }

    viewButtons.forEach((button) => {
      button.setAttribute("aria-pressed", String(button.dataset.view === view));
    });
    results.classList.toggle("is-list", view === "list");

    function favoriteIds() {
      return new Set(window.HavenFavorites ? window.HavenFavorites.ids() : []);
    }

    function filteredProperties() {
      return window.HavenFilters.sortList(
        base.filter((property) =>
          window.HavenFilters.matches(property, state, { favoriteIds: favoriteIds() })
        ),
        sort
      );
    }

    function renderActiveFilters() {
      if (!activeRow) return;
      const items = window.HavenFilters.descriptors(state, mode);
      activeRow.hidden = items.length === 0;
      activeRow.innerHTML = items
        .map(
          (item) => `
          <span class="active-filter">
            ${window.HavenUI.escapeHTML(item.label)}
            <button type="button" data-remove-filter="${window.HavenUI.escapeHTML(item.key)}" aria-label="Remove filter: ${window.HavenUI.escapeHTML(item.label)}">
              ${window.HavenUI.icon("close")}
            </button>
          </span>`
        )
        .join("");
    }

    function renderEmpty(title, text) {
      if (!empty) return;
      if (emptyTitle) emptyTitle.textContent = title;
      if (emptyText) emptyText.textContent = text;
      empty.classList.add("is-visible");
    }

    function render() {
      const list = filteredProperties();
      const total = list.length;
      const visible = list.slice(0, shown);

      results.innerHTML = visible
        .map((property, index) =>
          window.HavenUI.propertyCard(property, { eager: index < 3 })
        )
        .join("");

      if (countEl) {
        countEl.innerHTML =
          total === 0
            ? `No ${noun} match your search`
            : `<strong>${total}</strong> ${total === 1 ? (mode === "rent" ? "rental" : "home") : noun} ${state.saved ? "on your shortlist" : "available"}`;
      }

      if (empty) empty.classList.remove("is-visible");

      if (total === 0) {
        if (state.saved) {
          renderEmpty(
            "Your shortlist is waiting",
            "Save a home with the heart icon and it will appear here. You can also relax a filter to see more of the collection."
          );
        } else {
          renderEmpty(
            "No properties match those filters",
            "Try widening the price range, removing a feature, or searching a broader location."
          );
        }
        if (loadWrap) loadWrap.hidden = true;
      } else if (loadWrap) {
        loadWrap.hidden = false;
        const hasMore = total > shown;
        if (loadButton) {
          loadButton.hidden = !hasMore;
          loadButton.innerHTML = `Load more ${noun} ${window.HavenUI.icon("arrowRight")}`;
        }
        if (loadNote) {
          loadNote.textContent = hasMore
            ? `Showing ${visible.length} of ${total}`
            : `All ${total} ${total === 1 ? noun.slice(0, -1) : noun} shown`;
        }
      }

      renderActiveFilters();

      if (filterCount) {
        const count = window.HavenFilters.descriptors(state, mode).length;
        filterCount.textContent = count ? String(count) : "";
      }

      window.HavenFilters.writeUrl(state, { sort, view });
      if (window.HavenAnimations) window.HavenAnimations.refresh();
    }

    function updateFromForm() {
      state = window.HavenFilters.stateFromForm(form, state);
      shown = PAGE_SIZE;
      render();
    }

    const updateKeyword = window.HavenUI.debounce(updateFromForm, 220);

    if (form) {
      form.addEventListener("input", (event) => {
        if (event.target.matches('[data-filter="q"]')) updateKeyword();
        else updateFromForm();
      });

      form.addEventListener("change", (event) => {
        if (event.target.matches('[data-filter="q"]')) return;
        updateFromForm();
      });

      form.addEventListener("reset", (event) => {
        event.preventDefault();
        state = window.HavenFilters.resetState();
        window.HavenFilters.syncForm(form, state);
        shown = PAGE_SIZE;
        render();
      });

      form.addEventListener("click", (event) => {
        const apply = event.target.closest("[data-filters-apply]");
        if (!apply) return;
        panel.classList.remove("is-open");
        if (filterToggle) filterToggle.setAttribute("aria-expanded", "false");
        results.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    }

    if (filterToggle) {
      filterToggle.addEventListener("click", () => {
        const open = panel.classList.toggle("is-open");
        filterToggle.setAttribute("aria-expanded", String(open));
        if (open) {
          const firstField = panel.querySelector("input, select");
          if (firstField) firstField.focus({ preventScroll: true });
        }
      });
    }

    if (sortSelect) {
      sortSelect.addEventListener("change", () => {
        sort = sortSelect.value;
        render();
      });
    }

    viewButtons.forEach((button) => {
      button.addEventListener("click", () => {
        view = button.dataset.view === "list" ? "list" : "grid";
        viewButtons.forEach((item) =>
          item.setAttribute("aria-pressed", String(item.dataset.view === view))
        );
        results.classList.toggle("is-list", view === "list");
        try {
          window.localStorage.setItem("haven:view", view);
        } catch (error) {
          /* Storage is optional */
        }
        window.HavenFilters.writeUrl(state, { sort, view });
      });
    });

    if (loadButton) {
      loadButton.addEventListener("click", () => {
        const before = results.children.length;
        shown += PAGE_SIZE;
        render();
        const cards = results.children;
        if (cards[before]) {
          const link = cards[before].querySelector("a");
          if (link) link.focus({ preventScroll: false });
        }
      });
    }

    if (activeRow) {
      activeRow.addEventListener("click", (event) => {
        const button = event.target.closest("[data-remove-filter]");
        if (!button) return;
        state = window.HavenFilters.removeDescriptor(state, button.dataset.removeFilter);
        window.HavenFilters.syncForm(form, state);
        shown = PAGE_SIZE;
        render();
      });
    }

    if (empty) {
      empty.addEventListener("click", (event) => {
        if (!event.target.closest("[data-empty-reset]")) return;
        state = window.HavenFilters.resetState();
        window.HavenFilters.syncForm(form, state);
        shown = PAGE_SIZE;
        render();
        if (filterToggle) filterToggle.focus();
      });
    }

    window.addEventListener("haven:favorites-changed", () => {
      if (state.saved) render();
    });

    render();
  }

  if (window.HavenUI) window.HavenUI.onReady(initListing);
})();
