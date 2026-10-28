/* ==========================================================================
   Haven Estates — Search filters
   URL-backed filter state, panel markup, matching, sorting and labels shared
   by the buy and rent listing pages.
   ========================================================================== */

(function () {
  "use strict";

  const TAGS = ["Pool", "Water view", "Garden", "Home office", "City view"];

  const PRICE_OPTIONS = {
    sale: {
      min: [
        ["", "No minimum"],
        ["2000000", "$2M"],
        ["4000000", "$4M"],
        ["7000000", "$7M"],
        ["10000000", "$10M"]
      ],
      max: [
        ["", "No maximum"],
        ["2000000", "Up to $2M"],
        ["4000000", "$4M"],
        ["7000000", "$7M"],
        ["10000000", "$10M"],
        ["13000000", "$13M"]
      ]
    },
    rent: {
      min: [
        ["", "No minimum"],
        ["12000", "$12k / mo"],
        ["18000", "$18k / mo"],
        ["25000", "$25k / mo"],
        ["30000", "$30k / mo"]
      ],
      max: [
        ["", "No maximum"],
        ["12000", "Up to $12k"],
        ["18000", "$18k / mo"],
        ["25000", "$25k / mo"],
        ["35000", "$35k / mo"]
      ]
    }
  };

  const SORT_OPTIONS = [
    ["featured", "Curated order"],
    ["price-asc", "Price: low to high"],
    ["price-desc", "Price: high to low"],
    ["newest", "Newest listings"],
    ["beds-desc", "Most bedrooms"],
    ["area-desc", "Largest homes"]
  ];

  const EMPTY_STATE = {
    q: "",
    location: "",
    type: "",
    beds: "",
    baths: "",
    min: "",
    max: "",
    tags: [],
    saved: false
  };

  const compactMoney = (value) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      notation: "compact",
      maximumFractionDigits: 1
    }).format(Number(value));

  const unique = (values) => Array.from(new Set(values)).sort((a, b) => a.localeCompare(b));

  const locationsFor = (mode) =>
    unique(
      (window.HAVEN_PROPERTIES || [])
        .filter((property) => property.status === mode)
        .map((property) => property.locationGroup)
    );

  const typesFor = (mode) =>
    unique(
      (window.HAVEN_PROPERTIES || [])
        .filter((property) => property.status === mode)
        .map((property) => property.type)
    );

  function readState() {
    const params = new URLSearchParams(window.location.search);
    const tags = (params.get("tags") || "")
      .split(",")
      .map((tag) => tag.trim())
      .filter((tag) => TAGS.includes(tag));

    return {
      q: (params.get("q") || "").trim(),
      location: params.get("location") || "",
      type: params.get("type") || "",
      beds: params.get("beds") || "",
      baths: params.get("baths") || "",
      min: params.get("min") || "",
      max: params.get("max") || "",
      tags: Array.from(new Set(tags)),
      saved: params.get("saved") === "1"
    };
  }

  function readSort() {
    const value = new URLSearchParams(window.location.search).get("sort");
    return SORT_OPTIONS.some(([key]) => key === value) ? value : "featured";
  }

  function readView() {
    const value = new URLSearchParams(window.location.search).get("view");
    if (value === "list" || value === "grid") return value;
    try {
      const stored = window.localStorage.getItem("haven:view");
      return stored === "list" || stored === "grid" ? stored : "grid";
    } catch (error) {
      return "grid";
    }
  }

  function writeUrl(state, options = {}) {
    const params = new URLSearchParams(window.location.search);

    ["q", "location", "type", "beds", "baths", "min", "max"].forEach((key) => {
      if (state[key]) params.set(key, state[key]);
      else params.delete(key);
    });

    if (state.tags.length) params.set("tags", state.tags.join(","));
    else params.delete("tags");

    if (state.saved) params.set("saved", "1");
    else params.delete("saved");

    if (options.sort && options.sort !== "featured") params.set("sort", options.sort);
    else if (options.sort) params.delete("sort");

    if (options.view && options.view !== "grid") params.set("view", options.view);
    else if (options.view) params.delete("view");

    const query = params.toString();
    const next = `${window.location.pathname}${query ? `?${query}` : ""}${window.location.hash}`;
    if (next !== `${window.location.pathname}${window.location.search}${window.location.hash}`) {
      window.history.replaceState(null, "", next);
    }
  }

  function resetState() {
    return { ...EMPTY_STATE, tags: [] };
  }

  const selectOptions = (options, current) =>
    options
      .map(
        ([value, label]) =>
          `<option value="${value}"${String(current) === String(value) ? " selected" : ""}>${label}</option>`
      )
      .join("");

  function buildPanel(host, state, mode) {
    const locations = locationsFor(mode);
    const types = typesFor(mode);
    const prices = PRICE_OPTIONS[mode] || PRICE_OPTIONS.sale;
    const prefix = `filter-${mode}`;

    host.innerHTML = `
      <form class="filters-form" data-filter-form novalidate>
        <div class="filters-panel__head">
          <h2>Refine search</h2>
          <button class="filter-reset" type="reset">Reset all</button>
        </div>

        <div class="filter-group">
          <label class="filter-group__label" for="${prefix}-q">Keyword</label>
          <input class="input" id="${prefix}-q" type="search" name="q" placeholder="Town, ZIP or feature" autocomplete="off" data-filter="q" value="${window.HavenUI.escapeHTML(state.q)}">
        </div>

        <div class="filter-group">
          <label class="filter-group__label" for="${prefix}-location">Location</label>
          <select class="select" id="${prefix}-location" name="location" data-filter="location">
            <option value="">All locations</option>
            ${locations.map((location) => `<option value="${location}"${state.location === location ? " selected" : ""}>${location}</option>`).join("")}
          </select>
        </div>

        <div class="filter-group">
          <label class="filter-group__label" for="${prefix}-type">Property type</label>
          <select class="select" id="${prefix}-type" name="type" data-filter="type">
            <option value="">All types</option>
            ${types.map((type) => `<option value="${type}"${state.type === type ? " selected" : ""}>${type}</option>`).join("")}
          </select>
        </div>

        <div class="filter-group">
          <span class="filter-group__label">Price ${mode === "rent" ? "(monthly)" : ""}</span>
          <div class="filter-split">
            <label class="sr-only" for="${prefix}-min">Minimum price</label>
            <select class="select" id="${prefix}-min" name="min" data-filter="min">
              ${selectOptions(prices.min, state.min)}
            </select>
            <label class="sr-only" for="${prefix}-max">Maximum price</label>
            <select class="select" id="${prefix}-max" name="max" data-filter="max">
              ${selectOptions(prices.max, state.max)}
            </select>
          </div>
        </div>

        <div class="filter-group">
          <label class="filter-group__label" for="${prefix}-beds">Bedrooms</label>
          <select class="select" id="${prefix}-beds" name="beds" data-filter="beds">
            <option value="">Any bedrooms</option>
            ${[2, 3, 4, 5].map((count) => `<option value="${count}"${state.beds === String(count) ? " selected" : ""}>${count}+ bedrooms</option>`).join("")}
          </select>
        </div>

        <div class="filter-group">
          <label class="filter-group__label" for="${prefix}-baths">Bathrooms</label>
          <select class="select" id="${prefix}-baths" name="baths" data-filter="baths">
            <option value="">Any bathrooms</option>
            ${[2, 3, 4].map((count) => `<option value="${count}"${state.baths === String(count) ? " selected" : ""}>${count}+ bathrooms</option>`).join("")}
          </select>
        </div>

        <div class="filter-group">
          <span class="filter-group__label">Features</span>
          <div class="filter-checkboxes">
            ${TAGS.map(
              (tag) => `
              <label class="checkbox-field">
                <input type="checkbox" value="${tag}" data-filter-tag${state.tags.includes(tag) ? " checked" : ""}>
                <span>${tag}</span>
              </label>`
            ).join("")}
          </div>
        </div>

        <div class="filter-group">
          <span class="filter-group__label">Your shortlist</span>
          <label class="checkbox-field">
            <input type="checkbox" data-filter-saved${state.saved ? " checked" : ""}>
            <span>Only show saved homes</span>
          </label>
        </div>

        <div class="filters-actions">
          <button class="btn btn-primary filters-toggle" type="button" data-filters-apply>Show results</button>
        </div>
      </form>`;

    return host.querySelector("[data-filter-form]");
  }

  function syncForm(form, state) {
    if (!form) return;
    form.querySelectorAll("[data-filter]").forEach((field) => {
      field.value = state[field.dataset.filter] || "";
    });
    form.querySelectorAll("[data-filter-tag]").forEach((input) => {
      input.checked = state.tags.includes(input.value);
    });
    const saved = form.querySelector("[data-filter-saved]");
    if (saved) saved.checked = Boolean(state.saved);
  }

  function stateFromForm(form, previous) {
    const state = { ...resetState(), tags: [] };
    form.querySelectorAll("[data-filter]").forEach((field) => {
      state[field.dataset.filter] = field.value.trim();
    });
    form.querySelectorAll("[data-filter-tag]:checked").forEach((input) => {
      state.tags.push(input.value);
    });
    const saved = form.querySelector("[data-filter-saved]");
    state.saved = saved ? saved.checked : Boolean(previous && previous.saved);
    return state;
  }

  function matches(property, state, options = {}) {
    if (state.q) {
      const haystack = [
        property.title,
        property.location,
        property.region,
        property.type,
        property.locationGroup,
        property.headline,
        (property.tags || []).join(" "),
        (property.features || []).join(" ")
      ]
        .join(" ")
        .toLowerCase();

      const tokens = state.q.toLowerCase().split(/\s+/).filter(Boolean);
      if (!tokens.every((token) => haystack.includes(token))) return false;
    }

    if (state.location && property.locationGroup !== state.location) return false;
    if (state.type && property.type !== state.type) return false;
    if (state.beds && property.beds < Number(state.beds)) return false;
    if (state.baths && property.baths < Number(state.baths)) return false;
    if (state.min && property.price < Number(state.min)) return false;
    if (state.max && property.price > Number(state.max)) return false;
    if (state.tags.length && !state.tags.every((tag) => (property.tags || []).includes(tag))) {
      return false;
    }
    if (state.saved && options.favoriteIds && !options.favoriteIds.has(property.id)) return false;

    return true;
  }

  function sortList(properties, sort) {
    const list = [...properties];
    switch (sort) {
      case "price-asc":
        return list.sort((a, b) => a.price - b.price);
      case "price-desc":
        return list.sort((a, b) => b.price - a.price);
      case "newest":
        return list.sort((a, b) => new Date(b.listedAt) - new Date(a.listedAt));
      case "beds-desc":
        return list.sort((a, b) => b.beds - a.beds || b.price - a.price);
      case "area-desc":
        return list.sort((a, b) => b.area - a.area);
      default:
        return list.sort(
          (a, b) => Number(b.featured) - Number(a.featured) || b.price - a.price
        );
    }
  }

  function descriptors(state, mode) {
    const items = [];

    if (state.q) items.push({ key: "q", label: `“${state.q}”` });
    if (state.location) items.push({ key: "location", label: state.location });
    if (state.type) items.push({ key: "type", label: state.type });
    if (state.beds) items.push({ key: "beds", label: `${state.beds}+ beds` });
    if (state.baths) items.push({ key: "baths", label: `${state.baths}+ baths` });
    if (state.min) items.push({ key: "min", label: `From ${compactMoney(state.min)}` });
    if (state.max) items.push({ key: "max", label: `To ${compactMoney(state.max)}` });
    state.tags.forEach((tag) => items.push({ key: `tag:${tag}`, label: tag }));
    if (state.saved) items.push({ key: "saved", label: mode === "rent" ? "Saved rentals" : "Saved homes" });

    return items;
  }

  function removeDescriptor(state, key) {
    const next = { ...state, tags: [...state.tags] };
    if (key.startsWith("tag:")) {
      const tag = key.slice(4);
      next.tags = next.tags.filter((value) => value !== tag);
      return next;
    }
    if (key === "saved") next.saved = false;
    else next[key] = "";
    return next;
  }

  function isDefault(state) {
    return (
      !state.q &&
      !state.location &&
      !state.type &&
      !state.beds &&
      !state.baths &&
      !state.min &&
      !state.max &&
      state.tags.length === 0 &&
      !state.saved
    );
  }

  window.HavenFilters = {
    TAGS,
    SORT_OPTIONS,
    readState,
    readSort,
    readView,
    writeUrl,
    resetState,
    buildPanel,
    syncForm,
    stateFromForm,
    matches,
    sortList,
    descriptors,
    removeDescriptor,
    isDefault,
    compactMoney,
    locationsFor,
    typesFor
  };
})();
