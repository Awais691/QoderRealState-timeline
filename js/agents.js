/* ==========================================================================
   Haven Estates — Agent directory
   Search and specialty filtering for the advisor grid.
   ========================================================================== */

(function () {
  "use strict";

  function initAgents() {
    const grid = document.querySelector("[data-agents-grid]");
    if (!grid || !window.HavenUI) return;

    const ui = window.HavenUI;
    const input = document.querySelector("[data-agent-search]");
    const chipsHost = document.querySelector("[data-agent-filters]");
    const countEl = document.querySelector("[data-agents-count]");
    const empty = document.querySelector("[data-agents-empty]");
    const agents = window.HAVEN_AGENTS || [];
    const specialties = Array.from(
      new Set(agents.flatMap((agent) => agent.specialties))
    ).sort((a, b) => a.localeCompare(b));

    const params = new URLSearchParams(window.location.search);
    let query = params.get("q") || "";
    let active = specialties.includes(params.get("specialty")) ? params.get("specialty") : "";

    if (input) input.value = query;

    function renderChips() {
      if (!chipsHost) return;
      chipsHost.innerHTML = [
        `<button class="chip" type="button" data-agent-filter="" aria-pressed="${active === ""}">All advisors</button>`,
        ...specialties.map(
          (specialty) =>
            `<button class="chip" type="button" data-agent-filter="${ui.escapeHTML(specialty)}" aria-pressed="${active === specialty}">${ui.escapeHTML(specialty)}</button>`
        )
      ].join("");
    }

    function updateUrl() {
      const next = new URLSearchParams(window.location.search);
      if (query) next.set("q", query);
      else next.delete("q");
      if (active) next.set("specialty", active);
      else next.delete("specialty");
      const url = `${window.location.pathname}${next.toString() ? `?${next}` : ""}`;
      window.history.replaceState(null, "", url);
    }

    function render() {
      const normalized = query.trim().toLowerCase();
      const visible = agents.filter((agent) => {
        const matchesSpecialty = !active || agent.specialties.includes(active);
        if (!matchesSpecialty) return false;
        if (!normalized) return true;
        const haystack = [
          agent.name,
          agent.role,
          agent.focus,
          agent.languages,
          (agent.specialties || []).join(" "),
          agent.bio
        ]
          .join(" ")
          .toLowerCase();
        return normalized
          .split(/\s+/)
          .filter(Boolean)
          .every((token) => haystack.includes(token));
      });

      grid.innerHTML = visible.map((agent) => ui.agentCard(agent)).join("");

      if (countEl) {
        countEl.innerHTML = `<strong>${visible.length}</strong> ${visible.length === 1 ? "advisor" : "advisors"}${active ? ` in ${ui.escapeHTML(active)}` : ""}`;
      }
      if (empty) {
        empty.classList.toggle("is-visible", visible.length === 0);
      }

      renderChips();
      updateUrl();
      if (window.HavenAnimations) window.HavenAnimations.refresh();
    }

    if (input) {
      input.addEventListener(
        "input",
        ui.debounce(() => {
          query = input.value;
          render();
        }, 180)
      );
    }

    if (chipsHost) {
      chipsHost.addEventListener("click", (event) => {
        const button = event.target.closest("[data-agent-filter]");
        if (!button) return;
        active = button.dataset.agentFilter;
        render();
      });
    }

    if (empty) {
      empty.addEventListener("click", (event) => {
        if (!event.target.closest("[data-agents-reset]")) return;
        query = "";
        active = "";
        if (input) input.value = "";
        render();
        if (input) input.focus();
      });
    }

    render();
  }

  if (window.HavenUI) window.HavenUI.onReady(initAgents);
})();
