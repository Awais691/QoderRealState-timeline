/* ==========================================================================
   Haven Estates — Sell
   Applies location, property type and timeline passed from the home search
   panel to the valuation form.
   ========================================================================== */

(function () {
  "use strict";

  function init() {
    const form = document.querySelector("#valuation form[data-validate]");
    if (!form) return;

    const params = new URLSearchParams(window.location.search);
    ["location", "propertyType", "timeline"].forEach((name) => {
      const field = form.elements.namedItem(name);
      const value = params.get(name);
      if (!field || !value || field.tagName !== "SELECT") return;

      const match = Array.from(field.options).find((option) => option.value === value);
      if (match) field.value = value;
    });
  }

  if (window.HavenUI) {
    window.HavenUI.onReady(init);
  } else {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  }
})();
