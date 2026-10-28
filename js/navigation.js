/* ==========================================================================
   Haven Estates — Navigation
   Sticky header behaviour, active states, accessible mobile menu and focus
   management.
   ========================================================================== */

(function () {
  "use strict";

  const header = document.querySelector("[data-header]");
  const menu = document.getElementById("mobileMenu");
  const menuToggle = document.querySelector("[data-menu-toggle]");
  const menuClose = document.querySelector("[data-menu-close]");
  let menuOpener = null;

  function setHeaderState() {
    if (!header) return;
    header.classList.toggle("is-scrolled", window.scrollY > 18);
  }

  setHeaderState();
  window.addEventListener("scroll", setHeaderState, { passive: true });

  function markActiveNavigation() {
    const section = document.body.getAttribute("data-section");
    if (!section) return;

    document.querySelectorAll("[data-nav]").forEach((link) => {
      if (link.getAttribute("data-nav") === section) {
        link.classList.add("is-active");
        link.setAttribute("aria-current", "page");
      }
    });
  }

  function getFocusable(container) {
    return Array.from(
      container.querySelectorAll(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )
    ).filter((element) => element.getClientRects().length > 0 && !element.hasAttribute("hidden"));
  }

  function isMenuOpen() {
    return Boolean(menu && menu.classList.contains("is-open"));
  }

  function openMenu() {
    if (!menu || !menuToggle) return;
    if (document.querySelector("[data-favorites-panel].is-open")) {
      document.dispatchEvent(new CustomEvent("haven:close-favorites"));
    }

    menuOpener = document.activeElement;
    menu.classList.add("is-open");
    menu.setAttribute("aria-hidden", "false");
    menuToggle.setAttribute("aria-expanded", "true");
    document.body.classList.add("no-scroll");

    if (menuClose) window.setTimeout(() => menuClose.focus(), 80);
  }

  function closeMenu(restoreFocus = true) {
    if (!menu || !menuToggle) return;
    menu.classList.remove("is-open");
    menu.setAttribute("aria-hidden", "true");
    menuToggle.setAttribute("aria-expanded", "false");

    if (!document.querySelector("[data-favorites-panel].is-open")) {
      document.body.classList.remove("no-scroll");
    }

    if (restoreFocus) {
      if (menuOpener && typeof menuOpener.focus === "function") {
        menuOpener.focus();
      } else {
        menuToggle.focus();
      }
    }
    menuOpener = null;
  }

  if (menuToggle) {
    menuToggle.addEventListener("click", () => {
      if (isMenuOpen()) closeMenu();
      else openMenu();
    });
  }

  if (menuClose) {
    menuClose.addEventListener("click", () => closeMenu());
  }

  if (menu) {
    menu.querySelectorAll("a[href]").forEach((link) => {
      link.addEventListener("click", () => closeMenu(false));
    });
  }

  document.addEventListener("keydown", (event) => {
    if (!isMenuOpen()) return;

    if (event.key === "Escape") {
      closeMenu();
      return;
    }

    if (event.key === "Tab" && menu) {
      const focusable = getFocusable(menu);
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
  });

  document.addEventListener("haven:close-menu", () => closeMenu(false));

  window.addEventListener("resize", () => {
    if (window.innerWidth >= 1100 && isMenuOpen()) closeMenu(false);
  });

  if (window.matchMedia) {
    const desktop = window.matchMedia("(min-width: 1100px)");
    const handleChange = (event) => {
      if (event.matches && isMenuOpen()) closeMenu(false);
    };
    if (typeof desktop.addEventListener === "function") {
      desktop.addEventListener("change", handleChange);
    }
  }

  markActiveNavigation();
})();
