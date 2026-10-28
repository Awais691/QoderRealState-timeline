/* ==========================================================================
   Haven Estates — Property details
   Builds the gallery, facts, description, agent sidebar, inquiry form and
   similar homes for the selected property. Includes an accessible lightbox.
   ========================================================================== */

(function () {
  "use strict";

  function initDetails() {
    const root = document.querySelector("[data-detail-root]");
    if (!root || !window.HavenUI) return;

    const ui = window.HavenUI;
    const id = ui.getParam("id");
    const properties = window.HAVEN_PROPERTIES || [];
    const fallback = properties.find((property) => property.featured) || properties[0];
    const property = id ? ui.getProperty(id) : fallback;

    if (!property) {
      const gallery = root.querySelector("[data-detail-gallery]");
      if (gallery) {
        gallery.innerHTML = `
          <div class="detail-missing">
            <p class="eyebrow">Property unavailable</p>
            <h1 class="h2">We couldn't find that home</h1>
            <p class="lede">The link may be out of date. Browse the current collection to continue your search.</p>
            <div class="detail-missing__actions">
              <a class="btn btn-primary" href="buy.html">Browse homes for sale ${ui.icon("arrowRight")}</a>
              <a class="btn btn-outline" href="rent.html">Browse rentals</a>
            </div>
          </div>`;
      }
      return;
    }

    const agent = ui.getAgent(property.agentId);
    const modeHref = property.status === "rent" ? "rent.html" : "buy.html";
    const modeLabel = property.status === "rent" ? "Rent" : "Buy";
    const saleLabel = property.status === "rent" ? "For rent" : "For sale";
    const saved = window.HavenFavorites ? window.HavenFavorites.has(property.id) : false;

    ui.setDocumentTitle(`${property.title}, ${property.location} — Haven Estates`);
    ui.updateMetaDescription(
      `${property.headline} ${property.beds} bedrooms, ${property.baths} bathrooms, ${ui.formatArea(property.area)} in ${property.location}, ${property.region}. Demo listing by Haven Estates.`
    );

    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.setAttribute("content", `${property.title} — Haven Estates`);
    const ogDescription = document.querySelector('meta[property="og:description"]');
    if (ogDescription) ogDescription.setAttribute("content", property.headline);
    const ogImage = document.querySelector('meta[property="og:image"]');
    if (ogImage) ogImage.setAttribute("content", new URL(property.images[0], window.location.href).href);

    const modeLink = root.querySelector("[data-detail-mode-link]");
    if (modeLink) {
      modeLink.href = modeHref;
      modeLink.textContent = modeLabel;
    }
    const crumbTitle = root.querySelector("[data-detail-crumb-title]");
    if (crumbTitle) crumbTitle.textContent = property.title;

    const galleryHost = root.querySelector("[data-detail-gallery]");
    if (galleryHost) {
      const images = property.images;
      galleryHost.innerHTML = `
        <div class="gallery">
          <button class="gallery__main" type="button" data-gallery-open="0" aria-label="Open photo gallery — ${images.length} photos">
            <img src="${images[0]}" alt="${ui.escapeHTML(property.imageAlts[0])}" width="1400" height="1050" loading="eager" fetchpriority="high" decoding="async">
            <span class="badge gallery__count">1 / ${images.length}</span>
          </button>
          <div class="gallery__side">
            ${images
              .slice(1, 3)
              .map(
                (image, index) => `
              <button class="gallery__thumb" type="button" data-gallery-open="${index + 1}" aria-label="Open photo ${index + 2} of ${images.length}">
                <img src="${image}" alt="${ui.escapeHTML(property.imageAlts[index + 1] || property.title)}" width="800" height="600" loading="lazy" decoding="async">
                ${
                  index === 1
                    ? `<span class="gallery__more">${ui.icon("expand")}<span>View all ${images.length} photos</span></span>`
                    : ""
                }
              </button>`
              )
              .join("")}
          </div>
        </div>`;
    }

    const headHost = root.querySelector("[data-detail-head]");
    if (headHost) {
      headHost.innerHTML = `
        <div class="details-head">
          <div>
            <p class="eyebrow">${saleLabel} · ${ui.escapeHTML(property.locationGroup)}</p>
            <h1 class="h2 details-title">${ui.escapeHTML(property.title)}</h1>
            <p class="property-location">${ui.icon("mapPin")} ${ui.escapeHTML(property.location)}, ${ui.escapeHTML(property.region)}</p>
            <p class="details-price">${ui.formatPrice(property)} ${ui.priceSuffix(property)}</p>
          </div>
          <div class="details-head__actions">
            <button class="btn btn-outline btn-sm details-save${saved ? " is-active" : ""}" type="button" data-favorite-id="${property.id}" aria-pressed="${saved}" aria-label="${saved ? "Remove" : "Save"} ${ui.escapeHTML(property.title)} ${saved ? "from" : "to"} your shortlist">
              ${ui.icon("heart")} <span>${saved ? "Saved" : "Save home"}</span>
            </button>
            <button class="btn btn-outline btn-sm" type="button" data-share-property>${ui.icon("copy")} Share</button>
          </div>
        </div>
        <div class="details-facts">
          <div class="fact">${ui.icon("bed")}<div><strong>${property.beds}</strong><span>Bedrooms</span></div></div>
          <div class="fact">${ui.icon("bath")}<div><strong>${property.baths}</strong><span>Bathrooms</span></div></div>
          <div class="fact">${ui.icon("area")}<div><strong>${new Intl.NumberFormat("en-US").format(property.area)}</strong><span>Square feet</span></div></div>
          <div class="fact">${ui.icon("car")}<div><strong>${property.parking}</strong><span>Parking spaces</span></div></div>
        </div>`;
    }

    const mainHost = root.querySelector("[data-detail-main]");
    if (mainHost) {
      mainHost.innerHTML = `
        <section class="details-section" aria-labelledby="about-home">
          <h2 id="about-home">About this home</h2>
          <div class="details-description">
            ${property.description.map((paragraph) => `<p>${ui.escapeHTML(paragraph)}</p>`).join("")}
          </div>
        </section>

        <section class="details-section" aria-labelledby="features-home">
          <h2 id="features-home">Features &amp; amenities</h2>
          <ul class="amenity-grid">
            ${property.features.map((feature) => `<li>${ui.icon("check")}<span>${ui.escapeHTML(feature)}</span></li>`).join("")}
          </ul>
        </section>

        <section class="details-section" aria-labelledby="facts-home">
          <h2 id="facts-home">Property facts</h2>
          <dl class="details-facts-grid">
            <div><dt>Property type</dt><dd>${ui.escapeHTML(property.type)}</dd></div>
            <div><dt>Status</dt><dd>${saleLabel}</dd></div>
            <div><dt>Bedrooms</dt><dd>${property.beds}</dd></div>
            <div><dt>Bathrooms</dt><dd>${property.baths}</dd></div>
            <div><dt>Interior</dt><dd>${ui.formatArea(property.area)}</dd></div>
            <div><dt>Lot</dt><dd>${ui.escapeHTML(property.lot)}</dd></div>
            ${property.facts.map((fact) => `<div><dt>${ui.escapeHTML(fact.label)}</dt><dd>${ui.escapeHTML(fact.value)}</dd></div>`).join("")}
            <div><dt>Listed</dt><dd>${ui.formatDate(property.listedAt)}</dd></div>
            <div><dt>Reference</dt><dd>${ui.escapeHTML(property.reference)}</dd></div>
          </dl>
        </section>

        <section class="details-section" aria-labelledby="location-home">
          <h2 id="location-home">The setting</h2>
          <p class="body-sm">${ui.escapeHTML(property.title)} sits in ${ui.escapeHTML(property.location)}, ${ui.escapeHTML(property.region)} — part of our ${ui.escapeHTML(property.locationGroup.toLowerCase())} collection. Distances, school catchments and local services should be independently verified before any purchase or tenancy.</p>
        </section>`;
    }

    const sidebarHost = root.querySelector("[data-detail-sidebar]");
    if (sidebarHost) {
      sidebarHost.innerHTML = `
        ${
          agent
            ? `<div class="agent-contact-card">
                <div class="agent-contact-card__head">
                  <img src="${agent.image}" alt="Portrait of ${ui.escapeHTML(agent.name)}" width="116" height="116" loading="lazy">
                  <div>
                    <span>Represented by</span>
                    <strong>${ui.escapeHTML(agent.name)}</strong>
                    <p class="body-xs">${ui.escapeHTML(agent.role)}</p>
                  </div>
                </div>
                <div class="agent-contact-card__actions">
                  <a href="tel:${agent.phone.replace(/[^+\d]/g, "")}">${ui.icon("phone")} Call</a>
                  <a href="mailto:${agent.email}?subject=${encodeURIComponent(`Enquiry about ${property.title} (${property.reference})`)}">${ui.icon("mail")} Email</a>
                </div>
              </div>`
            : ""
        }

        <div class="inquiry-card" id="inquire">
          <h2>Arrange a viewing</h2>
          <p>Tell us when suits and we will come back to you. Demo only — no enquiry is sent or stored.</p>
          <form data-validate novalidate data-success-title="Thank you —" data-success="your viewing request passed validation. This is a front-end demonstration, so nothing was sent or stored.">
            <input type="hidden" name="property" value="${property.reference}">
            <div class="field">
              <label class="field-label" for="inq-name">Full name <span>*</span></label>
              <input class="input" id="inq-name" name="name" type="text" autocomplete="name" required>
              <p class="field-error" id="inq-name-error" data-error-for="name"></p>
            </div>
            <div class="field">
              <label class="field-label" for="inq-email">Email <span>*</span></label>
              <input class="input" id="inq-email" name="email" type="email" autocomplete="email" required data-rule="email">
              <p class="field-error" id="inq-email-error" data-error-for="email"></p>
            </div>
            <div class="field">
              <label class="field-label" for="inq-phone">Phone</label>
              <input class="input" id="inq-phone" name="phone" type="tel" autocomplete="tel" data-rule="phone">
              <p class="field-error" id="inq-phone-error" data-error-for="phone"></p>
            </div>
            <div class="field">
              <label class="field-label" for="inq-message">Message <span>*</span></label>
              <textarea class="textarea" id="inq-message" name="message" rows="4" required minlength="10">I would like to arrange a viewing of ${ui.escapeHTML(property.title)} (${property.reference}).</textarea>
              <p class="field-error" id="inq-message-error" data-error-for="message"></p>
            </div>
            <div class="field">
              <label class="checkbox-field">
                <input type="checkbox" name="consent" required>
                <span>I agree to be contacted about this demo enquiry. <span aria-hidden="true">*</span></span>
              </label>
              <p class="field-error" id="inq-consent-error" data-error-for="consent"></p>
            </div>
            <div class="form-status" data-form-status tabindex="-1" role="status"></div>
            <button class="btn btn-primary btn-block" type="submit">Request a viewing ${ui.icon("arrowRight")}</button>
            <p class="form-note">${ui.icon("info")} This form is illustrative and does not send data.</p>
          </form>
        </div>`;
    }

    const similarHost = root.querySelector("[data-detail-similar]");
    if (similarHost) {
      const similar = properties
        .filter(
          (item) =>
            item.id !== property.id &&
            item.status === property.status &&
            (item.locationGroup === property.locationGroup || item.type === property.type)
        )
        .slice(0, 3);
      similarHost.innerHTML = `
        <div class="section-head">
          <div class="section-head__text">
            <p class="eyebrow">Keep looking</p>
            <h2 class="h2">Similar ${property.status === "rent" ? "rentals" : "homes"}</h2>
          </div>
          <a class="link-arrow" href="${modeHref}">View all ${property.status === "rent" ? "rentals" : "homes"} ${ui.icon("arrowRight")}</a>
        </div>
        <div class="property-grid">
          ${similar.map((item) => ui.propertyCard(item)).join("")}
        </div>`;
    }

    const saveButton = root.querySelector("[data-favorite-id]");
    if (saveButton) {
      document.addEventListener("haven:favorites-changed", () => {
        const isSaved = window.HavenFavorites && window.HavenFavorites.has(property.id);
        const label = saveButton.querySelector("span");
        if (label) label.textContent = isSaved ? "Saved" : "Save home";
      });
    }

    const shareButton = root.querySelector("[data-share-property]");
    if (shareButton) {
      shareButton.addEventListener("click", async () => {
        const shareData = {
          title: `${property.title} — Haven Estates`,
          text: `${property.title}, ${property.location} — ${ui.formatPrice(property)}`,
          url: window.location.href
        };
        if (navigator.share) {
          try {
            await navigator.share(shareData);
            return;
          } catch (error) {
            if (error.name === "AbortError") return;
          }
        }
        try {
          await navigator.clipboard.writeText(window.location.href);
          ui.showToast("Link copied to your clipboard");
        } catch (error) {
          ui.showToast("Copy the page address from your browser bar");
        }
      });
    }

    initLightbox(property);

    if (window.HavenAnimations) window.HavenAnimations.refresh();
  }

  function initLightbox(property) {
    const ui = window.HavenUI;
    const images = property.images;
    if (!images.length || typeof HTMLDialogElement === "undefined") return;

    const dialog = document.createElement("dialog");
    dialog.className = "lightbox";
    dialog.setAttribute("aria-label", `${property.title} photo gallery`);
    dialog.innerHTML = `
      <div class="lightbox__body">
        <button class="lightbox__close" type="button" data-lightbox-close aria-label="Close gallery">${ui.icon("close")}</button>
        <div class="lightbox__img-wrap">
          <button class="lightbox__nav lightbox__nav--prev" type="button" data-lightbox-prev aria-label="Previous photo">${ui.icon("chevronLeft")}</button>
          <img src="${images[0]}" alt="${ui.escapeHTML(property.imageAlts[0])}" width="1600" height="1200">
          <button class="lightbox__nav lightbox__nav--next" type="button" data-lightbox-next aria-label="Next photo">${ui.icon("chevronRight")}</button>
        </div>
        <div class="lightbox__foot">
          <p data-lightbox-caption>${ui.escapeHTML(property.imageAlts[0])}</p>
          <p data-lightbox-counter>1 / ${images.length}</p>
        </div>
      </div>`;
    document.body.appendChild(dialog);

    const image = dialog.querySelector("img");
    const caption = dialog.querySelector("[data-lightbox-caption]");
    const counter = dialog.querySelector("[data-lightbox-counter]");
    let index = 0;

    function show(nextIndex) {
      index = (nextIndex + images.length) % images.length;
      image.src = images[index];
      image.alt = property.imageAlts[index] || property.title;
      if (caption) caption.textContent = property.imageAlts[index] || property.title;
      if (counter) counter.textContent = `${index + 1} / ${images.length}`;
    }

    function open(nextIndex) {
      show(nextIndex);
      if (typeof dialog.showModal === "function") dialog.showModal();
      else dialog.setAttribute("open", "");
      document.body.classList.add("no-scroll");
      const close = dialog.querySelector("[data-lightbox-close]");
      if (close) close.focus();
    }

    function close() {
      if (dialog.open && typeof dialog.close === "function") dialog.close();
      else dialog.removeAttribute("open");
      document.body.classList.remove("no-scroll");
    }

    document.querySelectorAll("[data-gallery-open]").forEach((button) => {
      button.addEventListener("click", () =>
        open(Number.parseInt(button.getAttribute("data-gallery-open"), 10) || 0)
      );
    });

    dialog.addEventListener("click", (event) => {
      if (event.target.closest("[data-lightbox-close]")) {
        close();
        return;
      }
      if (event.target.closest("[data-lightbox-prev]")) {
        show(index - 1);
        return;
      }
      if (event.target.closest("[data-lightbox-next]")) {
        show(index + 1);
        return;
      }
      if (event.target === dialog) close();
    });

    dialog.addEventListener("keydown", (event) => {
      if (event.key === "ArrowLeft") show(index - 1);
      if (event.key === "ArrowRight") show(index + 1);
    });

    dialog.addEventListener("close", () => {
      document.body.classList.remove("no-scroll");
    });
  }

  if (window.HavenUI) window.HavenUI.onReady(initDetails);
})();
