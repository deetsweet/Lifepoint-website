// Live ChurchSuite feeds for groups and events. Falls back to a link if the feed can't load.
(function () {
  var CS = "https://lifepointchurchrothwell.churchsuite.com";
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function strip(html) { var d = document.createElement("div"); d.innerHTML = html || ""; return (d.textContent || "").trim(); }
  function clip(s, n) { s = strip(s); return s.length > n ? s.slice(0, n).replace(/\s+\S*$/, "") + "…" : s; }
  function pick(o, paths) { for (var i = 0; i < paths.length; i++) { var v = paths[i].split(".").reduce(function (a, k) { return a == null ? a : a[k]; }, o); if (v) return v; } return ""; }
  function fail(box) { box.querySelector(".cs-status").innerHTML = "We couldn't load the live list just now. <a href='" + box.dataset.fallback + "'>Browse on ChurchSuite</a>."; }

  document.querySelectorAll("[data-cs-groups]").forEach(function (box) {
    fetch(CS + "/embed/smallgroups/json").then(function (r) { return r.json(); }).then(function (data) {
      var groups = (Array.isArray(data) ? data : (data.groups || data.data || [])).filter(function (g) { return g.embed_visible !== false && (!g.date_end || new Date(g.date_end) >= new Date()); });
      if (!groups.length) return fail(box);
      var days = {};
      var html = groups.map(function (g) {
        var DAYS = ["", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
        var day = DAYS[+g.day] || ""; if (day) days[day] = 1;
        var time = g.time ? new Date("2000-01-01T" + g.time).toLocaleTimeString("en-AU", { hour: "numeric", minute: "2-digit" }) : "";
        var freq = g.frequency && g.frequency !== "weekly" ? g.frequency : "";
        var loc = [g.location && g.location.name, g.location && g.location.address && g.location.address.split(",")[0]].filter(Boolean).join(", ");
        var img = pick(g, ["images.md.url", "images.lg.url", "image.url", "image"]);
        var link = CS + "/embed/smallgroups/" + g.identifier;
        return "<article class='gcard cs-item' data-day='" + esc(day) + "' data-text='" + esc((g.name + " " + strip(g.description) + " " + loc).toLowerCase()) + "'>" +
          (img ? "<div class='gcard__media'><img class='gcard__img' src='" + esc(img) + "' alt='' loading='lazy'></div>" : "") +
          "<div class='gcard__body'><h3>" + esc(g.name) + "</h3>" +
          "<p class='gcard__meta'>" + esc([day, time, freq].filter(Boolean).join(" · ")) + "</p>" +
          (loc ? "<p>" + esc(loc) + "</p>" : "") +
          (g.description ? "<p>" + esc(clip(g.description, 160)) + "</p>" : "") +
          "<a class='arrow-link' href='" + esc(link) + "'>Find out more <span aria-hidden='true'>→</span></a></div></article>";
      }).join("");
      box.querySelector(".cs-list").innerHTML = html;
      box.querySelector(".cs-status").textContent = groups.length + " groups";
      var sel = box.querySelector(".cs-day");
      Object.keys(days).forEach(function (d) { var o = document.createElement("option"); o.value = d; o.textContent = d; sel.appendChild(o); });
      function filter() {
        var q = box.querySelector(".cs-search").value.toLowerCase(), d = sel.value, n = 0;
        box.querySelectorAll(".cs-item").forEach(function (el) { var ok = (!d || el.dataset.day === d) && (!q || el.dataset.text.indexOf(q) > -1); el.hidden = !ok; if (ok) n++; });
        box.querySelector(".cs-status").textContent = n + " groups";
      }
      box.querySelector(".cs-search").addEventListener("input", filter); sel.addEventListener("change", filter);
    }).catch(function () { fail(box); });
  });

  document.querySelectorAll("[data-cs-events]").forEach(function (box) {
    fetch(CS + "/embed/calendar/json").then(function (r) { return r.json(); }).then(function (data) {
      var evs = Array.isArray(data) ? data : (data.events || data.data || []);
      if (!evs.length) return fail(box);
      var seen = {};
      evs = evs.filter(function (e) { if (box.dataset.hideSundays !== undefined && e.category && /sunday/i.test(e.category.name)) return false; var k = e.name; if (seen[k]) return false; seen[k] = 1; return true; }).slice(0, 30);
      box.querySelector(".cs-list").innerHTML = evs.map(function (e) {
        var start = pick(e, ["datetime_start", "date_start", "start"]);
        var d = start ? new Date(start.replace(" ", "T")) : null;
        var allDay = /00:00:00$/.test(start);
        var when = d && !isNaN(d) ? d.toLocaleDateString("en-AU", { weekday: "short", day: "numeric", month: "short" }) + (allDay ? "" : " · " + d.toLocaleTimeString("en-AU", { hour: "numeric", minute: "2-digit" })) : "";
        var img = pick(e, ["images.md.url", "images.lg.url", "image.url"]);
        var loc = pick(e, ["location.name"]);
        var link = (e.signup_options && e.signup_options.tickets && e.signup_options.tickets.url) || (CS + "/events/" + e.identifier);
        return "<article class='gcard'>" + (img ? "<div class='gcard__media'><img class='gcard__img' src='" + esc(img) + "' alt='' loading='lazy'></div>" : "") +
          "<div class='gcard__body'><p class='gcard__eyebrow'>" + esc(when) + "</p><h3>" + esc(e.name) + "</h3>" +
          (loc ? "<p class='gcard__meta'>" + esc(loc) + "</p>" : "") +
          (e.description ? "<p>" + esc(clip(e.description, 150)) + "</p>" : "") +
          "<a class='arrow-link' href='" + esc(link) + "'>Details <span aria-hidden='true'>→</span></a></div></article>";
      }).join("");
      box.querySelector(".cs-status").textContent = "";
    }).catch(function () { fail(box); });
  });
})();
