// printexo — site behaviour (no dependencies)

// Where sample requests go. Change this to your real inbox before launch.
const LEAD_EMAIL = "hello@printexo.com";

document.documentElement.classList.remove("no-js");

// Sticky header border
const header = document.querySelector(".header");
const onScroll = () => header.classList.toggle("is-scrolled", window.scrollY > 8);
onScroll();
window.addEventListener("scroll", onScroll, { passive: true });

// Mobile menu
const burger = document.querySelector(".burger");
const nav = document.getElementById("nav");
const setMenu = (open) => {
  nav.classList.toggle("open", open);
  burger.setAttribute("aria-expanded", String(open));
  burger.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  document.body.style.overflow = open ? "hidden" : "";
};
burger.addEventListener("click", () => setMenu(!nav.classList.contains("open")));
nav.addEventListener("click", (e) => { if (e.target.closest("a")) setMenu(false); });
document.addEventListener("keydown", (e) => { if (e.key === "Escape") setMenu(false); });

// Reveal on scroll
const items = document.querySelectorAll(".reveal");
if ("IntersectionObserver" in window) {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const siblings = [...entry.target.parentElement.children];
      entry.target.style.transitionDelay = `${siblings.indexOf(entry.target) * 70}ms`;
      entry.target.classList.add("in");
      io.unobserve(entry.target);
    });
  }, { threshold: 0.15 });
  items.forEach((el) => io.observe(el));
} else {
  items.forEach((el) => el.classList.add("in"));
}

// Lead form: validate, then open the visitor's email app with the details filled in.
// Swap this for a form service (Formspree, Basin, etc.) or your CRM when you have one.
const form = document.getElementById("lead-form");
const msg = form.querySelector(".form__msg");
form.addEventListener("submit", (e) => {
  e.preventDefault();
  let firstBad = null;
  form.querySelectorAll("[required]").forEach((field) => {
    const bad = !field.checkValidity();
    field.setAttribute("aria-invalid", String(bad));
    if (bad && !firstBad) firstBad = field;
  });
  if (firstBad) {
    msg.className = "form__msg err";
    msg.textContent = "Please fill in your name, a valid email and your platform.";
    firstBad.focus();
    return;
  }
  const d = Object.fromEntries(new FormData(form));
  const body = `Hi printexo,\n\nI'd like to claim my free samples.\n\nName: ${d.name}\nEmail: ${d.email}\nPlatform: ${d.platform}\nOrders per month: ${d.volume}\n`;
  window.location.href = `mailto:${LEAD_EMAIL}?subject=${encodeURIComponent("Free samples request — " + d.name)}&body=${encodeURIComponent(body)}`;
  msg.className = "form__msg ok";
  msg.textContent = "Thanks! Your email app should open with your request ready to send.";
  form.reset();
});

document.getElementById("year").textContent = new Date().getFullYear();
