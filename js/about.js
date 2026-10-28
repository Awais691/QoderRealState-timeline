/* ==========================================================================
   Haven Estates — About
   Renders the featured advisory team from the shared demo dataset.
   ========================================================================== */

(function () {
  "use strict";

  function init() {
    const host = document.querySelector("[data-about-team]");
    const ui = window.HavenUI;
    if (!host || !ui) return;

    const agents = (window.HAVEN_AGENTS || []).filter((agent) => agent.featured).slice(0, 3);
    host.innerHTML = agents.map((agent) => ui.agentCard(agent)).join("");

    if (window.HavenAnimations) window.HavenAnimations.refresh();
  }

  if (window.HavenUI) {
    window.HavenUI.onReady(init);
  } else {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  }
})();
