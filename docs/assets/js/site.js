// Menu and help button toggles
(function () {
  function toggle(btn, panel, bodyClass) {
    btn.addEventListener("click", function () {
      var open = btn.getAttribute("aria-expanded") === "true";
      btn.setAttribute("aria-expanded", String(!open));
      panel.hidden = open;
      if (bodyClass) document.body.classList.toggle(bodyClass, !open);
    });
  }
  var burger = document.querySelector(".hdr__burger");
  var menu = document.getElementById("menu");
  if (burger && menu) toggle(burger, menu, "menu-open");
  var helpBtn = document.querySelector(".help__btn");
  var help = document.getElementById("help");
  if (helpBtn && help) toggle(helpBtn, help);
  document.addEventListener("keydown", function (e) {
    if (e.key !== "Escape") return;
    [[burger, menu, "menu-open"], [helpBtn, help]].forEach(function (p) {
      if (p[0] && p[0].getAttribute("aria-expanded") === "true") p[0].click();
    });
  });
})();

// Show the help button after the first screen
(function () {
  var help = document.querySelector(".help");
  if (!help) return;
  function check() { help.classList.toggle("is-visible", window.scrollY > window.innerHeight * 0.6); }
  window.addEventListener("scroll", check, { passive: true });
  check();
})();

// Gentle fade-up as sections scroll into view. Skipped for people who turn motion off.
(function () {
  if (!("IntersectionObserver" in window) || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  var sel = ".centre-head, .split-head, .plan, .gcard, .step, .faq__head, .faq__list, .livegallery__grid img, .stats > div, .welcome, .closing, .lhe-inner, .htile, .campus, .card";
  var els = [].slice.call(document.querySelectorAll("main " + sel)).filter(function (el) {
    return el.getBoundingClientRect().top > window.innerHeight * 0.9 && !el.closest(".hero, .hhero");
  });
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      var el = e.target, sibs = el.parentNode ? [].slice.call(el.parentNode.children).filter(function (c) { return c.classList.contains("rv"); }) : [];
      el.style.transitionDelay = Math.min(sibs.indexOf(el), 4) * 80 + "ms";
      el.classList.add("rv--in");
      io.unobserve(el);
    });
  }, { rootMargin: "0px 0px -8% 0px" });
  els.forEach(function (el) { el.classList.add("rv"); io.observe(el); });
})();
