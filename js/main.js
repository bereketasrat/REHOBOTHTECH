/**
 * main.js  Shared JavaScript for all pages
 *
 * Responsibilities:
 *  1. Navigation  sticky shadow, mobile hamburger, active-link highlight
 *  2. Language switcher  English / Amharic (አማርኛ), persisted in localStorage
 *  3. Scroll-reveal animations (Intersection Observer)
 *  4. Contact form  client-side validation + async submission
 *  5. Smooth anchor scrolling
 *  6. Back-to-top button
 *  7. Current year injection in footer
 */

"use strict";

/* ═══════════════════════════════════════════════════════════
   HELPERS
═══════════════════════════════════════════════════════════ */
const $ = (sel, scope = document) => scope.querySelector(sel);
const $$ = (sel, scope = document) => [...scope.querySelectorAll(sel)];


/* ═══════════════════════════════════════════════════════════
   1. NAVIGATION
═══════════════════════════════════════════════════════════ */
function initNav() {
  const nav    = $(".site-nav");
  const toggle = $(".nav-toggle");
  const links  = $(".nav-links");

  if (!nav) return;

  // Sticky shadow on scroll + hide-on-scroll-down / show-on-scroll-up
  let lastY = window.scrollY;
  const onScroll = () => {
    const y = window.scrollY;
    nav.classList.toggle("scrolled", y > 20);
    if (y > lastY && y > 80) {
      nav.classList.add("nav-hidden");
    } else {
      nav.classList.remove("nav-hidden");
    }
    lastY = y;
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // Mobile hamburger
  if (toggle && links) {
    toggle.addEventListener("click", () => {
      const open = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", String(!open));
      links.classList.toggle("open", !open);
      document.body.style.overflow = !open ? "hidden" : "";
    });

    // Close on link click
    $$("a", links).forEach(a => {
      a.addEventListener("click", () => {
        toggle.setAttribute("aria-expanded", "false");
        links.classList.remove("open");
        document.body.style.overflow = "";
      });
    });

    // Close on outside click
    document.addEventListener("click", e => {
      if (!nav.contains(e.target)) {
        toggle.setAttribute("aria-expanded", "false");
        links.classList.remove("open");
        document.body.style.overflow = "";
      }
    });

    // Close on Escape
    document.addEventListener("keydown", e => {
      if (e.key === "Escape" && links.classList.contains("open")) {
        toggle.setAttribute("aria-expanded", "false");
        links.classList.remove("open");
        document.body.style.overflow = "";
        toggle.focus();
      }
    });
  }

  // Active-page highlight
  const currentPath = window.location.pathname.split("/").pop() || "index.html";
  $$(".nav-links a[href]").forEach(a => {
    const href = a.getAttribute("href");
    if (href === currentPath || (currentPath === "" && href === "index.html")) {
      a.classList.add("active");
      a.setAttribute("aria-current", "page");
    }
  });
}


/* ═══════════════════════════════════════════════════════════
   2. LANGUAGE SWITCHER  English / Amharic
   
   How it works:
   • Every translatable element in HTML carries a data-en and data-am attribute.
   • applyLanguage() reads those attributes and writes the correct one into
     textContent (for plain text nodes) or innerHTML (when the value contains HTML).
   • The <html lang="..."> attribute and a "lang-am" class on <body> are toggled
     so the CSS Amharic font rule activates automatically.
   • The user's choice is saved to localStorage under the key "lang".
═══════════════════════════════════════════════════════════ */

/** Translation dictionary  used for dynamic / JS-generated strings */
const T = {
  en: {
    // Form labels & messages
    formName:        "Full Name",
    formEmail:       "Email Address",
    formPhone:       "Phone Number",
    formSubject:     "Subject",
    formMessage:     "Message",
    formSubmit:      "Send Message",
    formOptional:    "Optional",
    formSelectTopic: "Select a topic…",
    formRepair:      "Device Repair",
    formSales:       "Product Enquiry",
    formAdvice:      "Technical Advice",
    formOther:       "Other",
    formRequired:    "is required.",
    formInvalidEmail:"Please enter a valid email address.",
    formMinLength:   "must be at least",
    formChars:       "characters.",
    formErrorServer: "Unable to connect to the email service. Please contact us directly by phone or email.",
    formSuccessMsg:  "Thank you! Your message has been sent successfully. We will get back to you shortly.",
    // Validation labels used in error messages
    labelName:    "Name",
    labelEmail:   "Email",
    labelPhone:   "Phone",
    labelSubject: "Subject",
    labelMessage: "Message",
  },
  am: {
    // Form labels & messages
    formName:        "ሙሉ ስም",
    formEmail:       "ኢሜይል አድራሻ",
    formPhone:       "ስልክ ቁጥር",
    formSubject:     "ርዕሰ ጉዳይ",
    formMessage:     "መልዕክት",
    formSubmit:      "መልዕክት ላክ",
    formOptional:    "አስፈላጊ አይደለም",
    formSelectTopic: "ርዕሰ ጉዳይ ይምረጡ…",
    formRepair:      "የመሣሪያ ጥገና",
    formSales:       "ምርት ጥያቄ",
    formAdvice:      "የቴክኒክ ምክር",
    formOther:       "ሌላ",
    formRequired:    "ያስፈልጋል።",
    formInvalidEmail:"እባክዎ ትክክለኛ ኢሜይል ያስገቡ።",
    formMinLength:   "ቢያንስ",
    formChars:       "ቁምፊዎች ሊኖሩት ይገባል።",
    formErrorServer: "ከኢሜይል አገልግሎቱ ጋር ማገናኘት አልተቻለም። እባክዎ በስልክ ወይም ኢሜይል ያግኙን።",
    formSuccessMsg:  "አመሰግናለሁ! መልዕክትዎ በተሳካ ሁኔታ ተልኳል። በቅርብ ጊዜ እንመልሳለን።",
    labelName:    "ስም",
    labelEmail:   "ኢሜይል",
    labelPhone:   "ስልክ",
    labelSubject: "ርዕሰ ጉዳይ",
    labelMessage: "መልዕክት",
  },
};

/** Currently active language code ("en" or "am") */
let currentLang = "en";

/**
 * Apply a language to the whole page.
 * @param {"en"|"am"} lang
 */
function applyLanguage(lang) {
  currentLang = lang;

  // Toggle HTML lang attribute and body class
  document.documentElement.lang = lang === "am" ? "am" : "en";
  document.body.classList.toggle("lang-am", lang === "am");

  // Swap every element that carries data-en / data-am
  $$("[data-en]").forEach(el => {
    const text = el.getAttribute(`data-${lang}`);
    if (text === null) return;
    // Decode HTML entities (&lt; → <, &gt; → >, &amp; → &)
    const decoded = text
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&amp;/g, "&")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'");
    // Use innerHTML only when value contains a tag, else textContent (XSS-safer)
    if (decoded.includes("<")) {
      el.innerHTML = decoded;
    } else {
      el.textContent = decoded;
    }
  });

  // Also swap placeholder attributes
  $$("[data-placeholder-en]").forEach(el => {
    const ph = el.getAttribute(`data-placeholder-${lang}`);
    if (ph !== null) el.placeholder = ph;
  });

  // Update the lang-toggle button label
  const btn = $(".lang-toggle");
  if (btn) {
    btn.setAttribute("aria-label", lang === "en" ? "Switch to Amharic" : "ወደ እንግሊዝኛ ቀይር");
    const labelEl = $(".lang-toggle-label", btn);
    if (labelEl) labelEl.textContent = lang === "en" ? "አማርኛ" : "English";
  }

  // Load Noto Sans Ethiopic font when switching to Amharic
  if (lang === "am" && !document.getElementById("font-amharic")) {
    const link = document.createElement("link");
    link.id   = "font-amharic";
    link.rel  = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=Noto+Sans+Ethiopic:wght@400;600;700&display=swap";
    document.head.appendChild(link);
  }

  // Update contact form dynamic strings if the form is on this page
  updateFormLanguage(lang);

  // Persist preference
  try { localStorage.setItem("lang", lang); } catch (_) {}
}

/**
 * Update form labels and select options that are rendered dynamically.
 * @param {"en"|"am"} lang
 */
function updateFormLanguage(lang) {
  const t = T[lang];
  const form = $(".contact-form-el");
  if (!form) return;

  // Subject <select> options
  const sel = form.elements.subject;
  if (sel) {
    const opts = [
      ["", t.formSelectTopic, true],
      ["repair",   t.formRepair,   false],
      ["sales",    t.formSales,    false],
      ["advice",   t.formAdvice,   false],
      ["other",    t.formOther,    false],
    ];
    opts.forEach(([val, label, disabled]) => {
      const opt = sel.querySelector(`option[value="${val}"]`);
      if (opt) opt.textContent = label;
    });
  }
}

/** Initialise the language switcher button */
function initLangSwitcher() {
  const btn = $(".lang-toggle");
  if (!btn) return;

  btn.addEventListener("click", () => {
    applyLanguage(currentLang === "en" ? "am" : "en");
  });

  // Restore saved preference (default = "en")
  let saved = "en";
  try { saved = localStorage.getItem("lang") || "en"; } catch (_) {}
  applyLanguage(saved);
}


/* ═══════════════════════════════════════════════════════════
   3. SCROLL-REVEAL ANIMATIONS
═══════════════════════════════════════════════════════════ */
function initScrollReveal() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });

  $$(".reveal, .stagger-children").forEach(el => observer.observe(el));
}


/* ═══════════════════════════════════════════════════════════
   4. CONTACT FORM  (EmailJS  no backend required)
   ─────────────────────────────────────────────────────────
   EmailJS sends the form data directly from the browser to
   your inbox. Steps to activate:
     1. Sign up free at https://www.emailjs.com/
     2. Add an Email Service (Gmail, Outlook, etc.)
     3. Create an Email Template  use these variables:
          {{from_name}}  {{from_email}}  {{phone}}
          {{subject}}    {{message}}
     4. Replace the three placeholder strings below with
        your real Public Key, Service ID, and Template ID.
═══════════════════════════════════════════════════════════ */

// ── EmailJS configuration  replace with your own values ──
const EMAILJS_PUBLIC_KEY  = "YOUR_PUBLIC_KEY";   // e.g. "user_aBcDeFgHiJkLmNoP"
const EMAILJS_SERVICE_ID  = "YOUR_SERVICE_ID";   // e.g. "service_xxxxxxx"
const EMAILJS_TEMPLATE_ID = "YOUR_TEMPLATE_ID";  // e.g. "template_xxxxxxx"

function initContactForm() {
  const form = $(".contact-form-el");
  if (!form) return;

  const feedback = $(".form-feedback");

  // Initialise EmailJS with the public key
  if (typeof emailjs !== "undefined") {
    emailjs.init(EMAILJS_PUBLIC_KEY);
  }

  // Validation rules (labels updated via T[lang] at runtime)
  const rules = {
    name:    { required: true,  minLength: 0  },
    email:   { required: true,  pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
    phone:   { required: false },
    subject: { required: false },
    message: { required: true,  minLength: 10 },
  };

  function getLabel(name) {
    const map = { name: "labelName", email: "labelEmail", phone: "labelPhone", subject: "labelSubject", message: "labelMessage" };
    return T[currentLang][map[name]] || name;
  }

  function validateField(field, rule) {
    const val = field.value.trim();
    const t   = T[currentLang];
    if (rule.required && !val)                                return `${getLabel(field.name)} ${t.formRequired}`;
    if (val && rule.pattern && !rule.pattern.test(val))       return t.formInvalidEmail;
    if (val && rule.minLength && val.length < rule.minLength) return `${getLabel(field.name)} ${t.formMinLength} ${rule.minLength} ${t.formChars}`;
    return null;
  }

  function showFieldError(fieldName, message) {
    const field = form.elements[fieldName];
    const errEl = $(`#${fieldName}-error`);
    if (!field) return;
    field.classList.toggle("error", !!message);
    if (errEl) {
      errEl.textContent = message || "";
      errEl.classList.toggle("visible", !!message);
    }
    field[message ? "setAttribute" : "removeAttribute"]("aria-invalid", "true");
    if (message) field.setAttribute("aria-describedby", `${fieldName}-error`);
  }

  // Live blur validation
  Object.keys(rules).forEach(name => {
    const field = form.elements[name];
    if (!field) return;
    field.addEventListener("blur",  () => showFieldError(name, validateField(field, rules[name])));
    field.addEventListener("input", () => { if (field.classList.contains("error")) showFieldError(name, null); });
  });

  // Submit
  form.addEventListener("submit", async e => {
    e.preventDefault();

    // Run validation
    let hasErrors = false;
    Object.keys(rules).forEach(name => {
      const field = form.elements[name];
      if (!field) return;
      const msg = validateField(field, rules[name]);
      showFieldError(name, msg);
      if (msg) hasErrors = true;
    });

    if (hasErrors) { const first = $(".error", form); if (first) first.focus(); return; }

    const submitBtn = $("[type='submit']", form);
    submitBtn.classList.add("loading");
    submitBtn.disabled = true;
    if (feedback) { feedback.className = "form-feedback"; feedback.innerHTML = ""; }

    // Build the template parameters that match your EmailJS template variables
    const templateParams = {
      from_name:  form.elements.name?.value.trim(),
      from_email: form.elements.email?.value.trim(),
      phone:      form.elements.phone?.value.trim() || "Not provided",
      subject:    form.elements.subject?.value.trim() || "Not provided",
      message:    form.elements.message?.value.trim(),
    };

    // Guard: if EmailJS has not been configured yet, show a helpful warning
    if (
      EMAILJS_PUBLIC_KEY  === "YOUR_PUBLIC_KEY"  ||
      EMAILJS_SERVICE_ID  === "YOUR_SERVICE_ID"  ||
      EMAILJS_TEMPLATE_ID === "YOUR_TEMPLATE_ID"
    ) {
      submitBtn.classList.remove("loading");
      submitBtn.disabled = false;
      showFeedback("info",
        "Contact form is not yet connected to an email service. " +
        "Please reach us directly by phone or email."
      );
      return;
    }

    try {
      await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, templateParams);
      showFeedback("success", T[currentLang].formSuccessMsg);
      form.reset();
      if (feedback) feedback.scrollIntoView({ behavior: "smooth", block: "nearest" });
    } catch (err) {
      console.error("EmailJS error:", err);
      showFeedback("error", T[currentLang].formErrorServer);
    } finally {
      submitBtn.classList.remove("loading");
      submitBtn.disabled = false;
    }
  });

  function showFeedback(type, message) {
    if (!feedback) return;
    const okIcon   = `<svg viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>`;
    const errIcon  = `<svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>`;
    const infoIcon = `<svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>`;
    const icon = type === "success" ? okIcon : type === "error" ? errIcon : infoIcon;
    feedback.className = `form-feedback visible ${type === "info" ? "error" : type}`;
    feedback.innerHTML = `${icon}<span>${message}</span>`;
    feedback.setAttribute("role", "alert");
    feedback.setAttribute("aria-live", "polite");
  }
}


/* ═══════════════════════════════════════════════════════════
   5. SMOOTH ANCHOR SCROLLING
═══════════════════════════════════════════════════════════ */
function initSmoothScroll() {
  $$('a[href^="#"]').forEach(a => {
    a.addEventListener("click", e => {
      const target = $(a.getAttribute("href"));
      if (!target) return;
      e.preventDefault();
      const offset = parseInt(
        getComputedStyle(document.documentElement).getPropertyValue("--nav-height") || "72", 10
      ) + 16;
      window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - offset, behavior: "smooth" });
    });
  });
}


/* ═══════════════════════════════════════════════════════════
   6. BACK-TO-TOP
═══════════════════════════════════════════════════════════ */
function initBackToTop() {
  const btn = $(".back-to-top");
  if (!btn) return;
  window.addEventListener("scroll", () => btn.classList.toggle("visible", window.scrollY > 400), { passive: true });
  btn.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
}


/* ═══════════════════════════════════════════════════════════
   7. CURRENT YEAR
═══════════════════════════════════════════════════════════ */
function injectYear() {
  $$(".current-year").forEach(el => { el.textContent = new Date().getFullYear(); });
}


/* ═══════════════════════════════════════════════════════════
   INIT
═══════════════════════════════════════════════════════════ */
document.addEventListener("DOMContentLoaded", () => {
  initNav();
  initLangSwitcher();   // must run before initContactForm so T[currentLang] is set
  initScrollReveal();
  initContactForm();
  initSmoothScroll();
  initBackToTop();
  injectYear();
});
