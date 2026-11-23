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
