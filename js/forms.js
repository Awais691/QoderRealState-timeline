/* ==========================================================================
   Haven Estates — Forms
   Client-side validation and demo feedback. No data is transmitted anywhere.
   ========================================================================== */

(function () {
  "use strict";

  const REQUIRED_MESSAGES = {
    name: "Please enter your name.",
    firstName: "Please enter your first name.",
    lastName: "Please enter your last name.",
    email: "Please enter your email address.",
    phone: "Please enter your phone number.",
    subject: "Please choose a subject.",
    message: "Please tell us how we can help.",
    location: "Please choose a location.",
    propertyType: "Please select a property type.",
    timeline: "Please select a timeline.",
    contactMethod: "Please choose a preferred contact method.",
    consent: "Please confirm before continuing."
  };

  const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  const PHONE_PATTERN = /^\+?[\d\s().-]{7,20}$/;

  function errorElementFor(field) {
    const form = field.form;
    if (!form || !field.name) return null;
    return form.querySelector(`[data-error-for="${field.name}"]`);
  }

  function labelTextFor(field) {
    if (field.name && REQUIRED_MESSAGES[field.name]) return REQUIRED_MESSAGES[field.name];
    const wrapper = field.closest(".field");
    const label = wrapper ? wrapper.querySelector(".field-label") : null;
    const text = label ? label.textContent.replace(/\*/g, "").trim() : "This field";
    return `Please complete ${text.toLowerCase()}.`;
  }

  function validateField(field) {
    const rules = (field.getAttribute("data-rule") || "").split("|");
    const value = (field.value || "").trim();

    if (field.type === "checkbox") {
      if ((field.required || rules.includes("checked")) && !field.checked) {
        return REQUIRED_MESSAGES[field.name] || "Please confirm before continuing.";
      }
      return "";
    }

    if (field.required && value === "") return labelTextFor(field);
    if (value === "") return "";

    if (field.type === "email" || rules.includes("email")) {
      if (!EMAIL_PATTERN.test(value)) return "Enter a valid email address, for example name@example.com.";
    }

    if (field.type === "tel" || rules.includes("phone")) {
      if (!PHONE_PATTERN.test(value)) return "Enter a valid phone number, including the area code.";
    }

    if (field.minLength > 0 && value.length < field.minLength) {
      return `Please use at least ${field.minLength} characters.`;
    }

    return "";
  }

  function setFieldError(field, message) {
    const error = errorElementFor(field);
    const wrapper = field.closest(".field");
    if (wrapper) wrapper.classList.add("has-error");
    field.setAttribute("aria-invalid", "true");
    if (error) {
      error.textContent = message;
      if (error.id) field.setAttribute("aria-describedby", error.id);
    }
  }

  function clearFieldError(field) {
    const error = errorElementFor(field);
    const wrapper = field.closest(".field");
    if (wrapper) wrapper.classList.remove("has-error");
    field.removeAttribute("aria-invalid");
    if (error) error.textContent = "";
  }

  function validateForm(form) {
    const fields = Array.from(
      form.querySelectorAll("input, select, textarea")
    ).filter(
      (field) =>
        !field.disabled &&
        field.type !== "hidden" &&
        (field.required || field.hasAttribute("data-rule"))
    );

    let firstInvalid = null;

    fields.forEach((field) => {
      const message = validateField(field);
      if (message) {
        setFieldError(field, message);
        if (!firstInvalid) firstInvalid = field;
      } else {
        clearFieldError(field);
      }
    });

    if (firstInvalid) {
      firstInvalid.focus({ preventScroll: false });
      return false;
    }

    return true;
  }

  function showStatus(form, message, type) {
    let status = form.querySelector("[data-form-status]");
    if (!status) return;

    status.className = `form-status form-status--${type} is-visible`;
    status.innerHTML = `${
      type === "success"
        ? window.HavenUI.icon("checkCircle")
        : window.HavenUI.icon("alert")
    }<div>${window.HavenUI.escapeHTML(message)}</div>`;
    status.setAttribute("role", type === "error" ? "alert" : "status");

    window.requestAnimationFrame(() => {
      status.focus({ preventScroll: true });
      status.scrollIntoView({ behavior: "smooth", block: "nearest" });
    });
  }

  function clearStatus(form) {
    const status = form.querySelector("[data-form-status]");
    if (!status) return;
    status.className = "form-status";
    status.innerHTML = "";
  }

  function handleStandardForm(form) {
    clearStatus(form);
    const valid = validateForm(form);
    if (!valid) {
      const firstError = form.querySelector(".field.has-error");
      if (firstError) {
        window.requestAnimationFrame(() =>
          firstError.scrollIntoView({ behavior: "smooth", block: "center" })
        );
      }
      return;
    }

    const message =
      form.getAttribute("data-success") ||
      "Thank you — your details have been validated. This is a front-end demonstration: nothing was sent or stored.";
    const successTitle = form.getAttribute("data-success-title");

    showStatus(
      form,
      successTitle ? `${successTitle} ${message}` : message,
      "success"
    );

    if (window.HavenUI) {
      window.HavenUI.showToast("Thank you — your details have been validated.");
    }

    form.reset();

    form.querySelectorAll(".field.has-error").forEach((wrapper) => {
      wrapper.classList.remove("has-error");
    });
    form.querySelectorAll("[aria-invalid='true']").forEach((field) => {
      field.removeAttribute("aria-invalid");
    });
  }

  function handleNewsletter(form) {
    const input = form.querySelector('input[type="email"]');
    const status = form.parentElement
      ? form.parentElement.querySelector("[data-newsletter-status]")
      : null;
    if (!input) return;

    const value = input.value.trim();
    const valid = EMAIL_PATTERN.test(value);

    form.classList.toggle("has-error", !valid);
    input.setAttribute("aria-invalid", String(!valid));

    if (status) {
      status.className = `form-status form-status--${valid ? "success" : "error"} is-visible`;
      status.innerHTML = `${
        valid ? window.HavenUI.icon("checkCircle") : window.HavenUI.icon("alert")
      }<div>${
        valid
          ? "Thank you — you're on the list. This is a front-end demo, so no address was stored."
          : "Please enter a valid email address."
      }</div>`;
    }

    if (!valid) {
      input.focus();
      return;
    }

    if (window.HavenUI) window.HavenUI.showToast("You're on the list — demo only.");
    form.reset();
  }

  document.addEventListener("submit", (event) => {
    const form = event.target;
    if (!(form instanceof HTMLFormElement)) return;

    if (form.matches("[data-newsletter-form]")) {
      event.preventDefault();
      handleNewsletter(form);
      return;
    }

    if (form.matches("[data-validate]")) {
      event.preventDefault();
      handleStandardForm(form);
    }
  });

  document.addEventListener(
    "focusout",
    (event) => {
      const field = event.target;
      if (!(field instanceof HTMLInputElement || field instanceof HTMLSelectElement || field instanceof HTMLTextAreaElement)) {
        return;
      }
      const form = field.form;
      if (!form || !form.matches("[data-validate]")) return;
      if (field.type === "hidden") return;
      if (!(field.required || field.hasAttribute("data-rule"))) return;

      const message = validateField(field);
      if (message) setFieldError(field, message);
      else clearFieldError(field);
    },
    true
  );

  document.addEventListener(
    "input",
    (event) => {
      const field = event.target;
      if (!(field instanceof HTMLInputElement || field instanceof HTMLTextAreaElement || field instanceof HTMLSelectElement)) {
        return;
      }
      const wrapper = field.closest(".field");
      if (!wrapper || !wrapper.classList.contains("has-error")) return;
      const message = validateField(field);
      if (!message) clearFieldError(field);
    },
    true
  );

  document.addEventListener("change", (event) => {
    const field = event.target;
    if (!(field instanceof HTMLSelectElement || field instanceof HTMLInputElement)) return;
    const wrapper = field.closest(".field");
    if (!wrapper || !wrapper.classList.contains("has-error")) return;
    const message = validateField(field);
    if (!message) clearFieldError(field);
  });
})();
