/* =========================
   Helpers
========================= */
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

/* =========================
   Year
========================= */
$("#year").textContent = new Date().getFullYear();

/* =========================
   Mobile Drawer
========================= */
const drawer = $("#drawer");
const openBtn = $("#openDrawer");
const closeBtn = $("#closeDrawer");
const backdrop = $("#drawerBackdrop");

function openDrawer() {
  drawer.classList.add("is-open");
  drawer.setAttribute("aria-hidden", "false");
  openBtn?.setAttribute("aria-expanded", "true");
  // Focus first link for accessibility
  const firstLink = $(".drawer__link", drawer);
  firstLink?.focus();
  document.body.style.overflow = "hidden";
}

function closeDrawer() {
  drawer.classList.remove("is-open");
  drawer.setAttribute("aria-hidden", "true");
  openBtn?.setAttribute("aria-expanded", "false");
  openBtn?.focus();
  document.body.style.overflow = "";
}

openBtn?.addEventListener("click", openDrawer);
closeBtn?.addEventListener("click", closeDrawer);
backdrop?.addEventListener("click", closeDrawer);

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && drawer.classList.contains("is-open")) closeDrawer();
});

// Close drawer when clicking a link
$$(".drawer__link").forEach((a) => a.addEventListener("click", closeDrawer));

/* =========================
   On-scroll reveal (IntersectionObserver)
========================= */
const reveals = $$(".reveal");
const io = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("is-visible");
      io.unobserve(entry.target);
    }
  });
}, { threshold: 0.16 });

reveals.forEach((el) => io.observe(el));

/* =========================
   Parallax on hero assets
   - Slight movement for "3D" feel
========================= */
const parallax = document.querySelector("[data-parallax]");
let rafId = null;

function onMove(e) {
  if (!parallax) return;
  const rect = parallax.getBoundingClientRect();
  const x = (e.clientX - rect.left) / rect.width - 0.5;
  const y = (e.clientY - rect.top) / rect.height - 0.5;

  if (rafId) cancelAnimationFrame(rafId);
  rafId = requestAnimationFrame(() => {
    // Move accents more than bottle (depth effect)
    parallax.style.setProperty("--px", (x * 12).toFixed(2));
    parallax.style.setProperty("--py", (y * 12).toFixed(2));
  });
}

function enableParallax() {
  // Only desktop-ish
  if (window.matchMedia("(max-width: 980px)").matches) return;

  parallax?.addEventListener("mousemove", (e) => onMove(e));
  parallax?.addEventListener("mouseleave", () => {
    parallax.style.setProperty("--px", "0");
    parallax.style.setProperty("--py", "0");
  });
}
enableParallax();

// Apply CSS transforms with CSS variables
// (kept in JS for clarity, but driven by CSS)
if (parallax) {
  // Set defaults
  parallax.style.setProperty("--px", "0");
  parallax.style.setProperty("--py", "0");

  // Update transforms with a small loop (cheap)
  const bottle = $(".bottle", parallax);
  const slice = $(".accent--slice", parallax);
  const leaf = $(".accent--leaf", parallax);

  const tick = () => {
    const px = parseFloat(getComputedStyle(parallax).getPropertyValue("--px")) || 0;
    const py = parseFloat(getComputedStyle(parallax).getPropertyValue("--py")) || 0;

    // Subtle transforms
    if (bottle) bottle.style.transform = `translate(${px * 0.35}px, ${py * 0.35}px)`;
    if (slice) slice.style.transform = `translate(${px * 0.6}px, ${py * 0.6}px)`;
    if (leaf)  leaf.style.transform  = `translate(${px * 0.8}px, ${py * 0.8}px) rotate(-18deg)`;

    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

/* =========================
   FAQ Accordion (animated height)
========================= */
const faqButtons = $$(".faq__q");
faqButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    const expanded = btn.getAttribute("aria-expanded") === "true";
    const panel = btn.nextElementSibling;

    // Close all others (optional: makes it cleaner)
    faqButtons.forEach((b) => {
      if (b !== btn) {
        b.setAttribute("aria-expanded", "false");
        const p = b.nextElementSibling;
        if (p) {
          p.hidden = true;
          p.style.height = "";
        }
        const icon = $(".faq__icon", b);
        if (icon) icon.textContent = "+";
      }
    });

    btn.setAttribute("aria-expanded", String(!expanded));
    const icon = $(".faq__icon", btn);
    if (icon) icon.textContent = expanded ? "+" : "–";

    if (!panel) return;
    if (expanded) {
      panel.hidden = true;
      panel.style.height = "";
    } else {
      panel.hidden = false;
      // Animate height
      panel.style.height = "0px";
      const h = panel.scrollHeight;
      requestAnimationFrame(() => {
        panel.style.height = h + "px";
      });
      panel.addEventListener("transitionend", () => {
        panel.style.height = "";
      }, { once: true });
    }
  });
});

/* =========================
   Newsletter fake submit
========================= */
const form = $("#newsletterForm");
const msg = $("#formMsg");

form?.addEventListener("submit", (e) => {
  e.preventDefault();
  const email = $("#email")?.value?.trim();
  if (!email) return;

  msg.textContent = "Thanks! You’re subscribed.";
  form.reset();
});
