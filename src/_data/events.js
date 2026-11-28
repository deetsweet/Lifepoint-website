// Upcoming events from ChurchSuite, fetched when the site builds.
// The home page "Coming up" list and the /events/ page are written into the HTML from this,
// with Event structured data for Google. The scripts in embeds/home-events.html and
// embeds/events.html still fetch ChurchSuite in the browser and swap in the latest list;
// if that fails, the built list stays. The markup here matches what those scripts produce.
const FEED = "https://lifepointchurchrothwell.churchsuite.com/-/calendar/9a5e6d75-319d-43a1-9782-0e325a0838c1/json";
const TZ = "Australia/Brisbane";
const ORIGIN = new URL(FEED).origin;
const HOST = new URL(FEED).hostname;

const esc = (s) => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const fmt = (opts) => new Intl.DateTimeFormat("en-AU", { ...opts, timeZone: TZ });
const homeDate = fmt({ weekday: "short", day: "numeric", month: "short" });
const homeTime = fmt({ hour: "numeric", minute: "2-digit", hour12: true });
const listDate = fmt({ weekday: "short", day: "numeric", month: "short", year: "numeric" });
const dayKey = new Intl.DateTimeFormat("en-CA", { year: "numeric", month: "2-digit", day: "2-digit", timeZone: TZ });
const dayParts = fmt({ year: "numeric", month: "numeric", day: "numeric" });

function safeUrl(value, check) {
  if (!value) return "";
  try { const u = new URL(value, ORIGIN); return check(u) ? u.href : ""; } catch { return ""; }
}
const feedUrl = (v) => safeUrl(v, (u) => u.protocol === "https:" && u.hostname === HOST);
const cdnUrl = (v) => safeUrl(v, (u) => u.protocol === "https:" && u.hostname === "cdn.churchsuite.com");

function calendarDay(value) {
  const p = Object.fromEntries(dayParts.formatToParts(value).map((x) => [x.type, x.value]));
  return Date.UTC(+p.year, +p.month - 1, +p.day);
}

function plainText(value) {
  return String(value || "")
    .replace(/<br\s*\/?\s*>|<\/(?:p|div|li|h[1-6])\s*>/gi, "\n")
    .replace(/<(script|style)[^>]*>[\s\S]*?<\/\1>/gi, "")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;|\u00a0/g, " ").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"').replace(/&#0?39;|&rsquo;/g, "'").replace(/&ndash;/g, "–")
    .replace(/[ \t]+\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
}

const upcoming = (e, now) => {
  if (!e.starts_at || !e.name?.trim() || /^(cancelled|canceled)$/i.test(e.status || "")) return false;
  const start = new Date(e.starts_at), end = new Date(e.ends_at);
  if (!Number.isFinite(+start)) return false;
  if (e.all_day) return e.ends_at && end > start ? end >= now : dayKey.format(start) >= dayKey.format(now);
  return (e.ends_at && end > start ? end : start) >= now;
};

// ---------- Home page "Coming up" (matches renderEvent in home-events.html) ----------
function homeItem(e, i, allEvents) {
  const featured = i === 0;
  const img = cdnUrl(featured ? e.image?.large || e.image?.medium || e.image?.small : e.image?.small || e.image?.medium || e.image?.large);
  const start = new Date(e.starts_at);
  const meta = [homeDate.format(start), e.all_day ? "All day" : homeTime.format(start), e.location?.name?.trim()].filter(Boolean).join(" · ");
  return `<li class="lhe-item${featured ? " lhe-feature" : ""}"><a class="lhe-link" href="${esc(feedUrl(e.url) || allEvents)}">` +
    `<span class="lhe-photo" aria-hidden="true">${img ? `<img src="${esc(img)}" alt="" loading="lazy" decoding="async">` : ""}</span>` +
    `<span><span class="lhe-meta">${esc(meta)}</span><span class="lhe-title">${esc(e.name)}</span></span>` +
    `<span class="lhe-arrow" aria-hidden="true">↗</span></a></li>`;
}

// ---------- /events/ cards (matches createCard in events.html) ----------
const THEMES = new Map([["young adults", "sage"], ["youth", "moss"], ["men", "blue"], ["women", "terracotta"], ["general", "charcoal"], ["fluro import", "charcoal"], ["kids", "mist"], ["sunday services", "stone"]]);
const ICONS = {
  info: "M12 11v5m0-8h.01 M22 12a10 10 0 1 1-20 0 10 10 0 1 1 20 0",
  map: "M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z M15 10a3 3 0 1 1-6 0 3 3 0 1 1 6 0",
  cal: "M4 5h16v16H4z M8 3v4m8-4v4M4 10h16m-8 3v5m-2.5-2.5h5"
};
const action = (href, label, icon, aria, extra = "") =>
  `<a class="lp-action" href="${esc(href)}" aria-label="${esc(aria)}"${extra}><span class="lp-action-pill"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${icon}"></path></svg><span>${label}</span></span></a>`;

function schedule(e) {
  const start = new Date(e.starts_at), end = new Date(e.ends_at);
  const hasEnd = Boolean(e.ends_at) && Number.isFinite(+end) && end > start;
  const multi = hasEnd && calendarDay(end) !== calendarDay(start);
  if (multi && !e.all_day) return [["lp-date", listDate.format(start)], ["lp-time", homeTime.format(start)], ["lp-time", "Ends " + listDate.format(end) + " at " + homeTime.format(end)]];
  const dateLabel = listDate.format(start) + (multi ? " to " + listDate.format(end) : "");
  const timeLabel = e.all_day ? "All day" : homeTime.format(start) + (hasEnd ? " to " + homeTime.format(end) : "");
  return [["lp-date", dateLabel], ["lp-time", timeLabel]];
}

function icsHref(e, details, link) {
  const start = new Date(e.starts_at), end = new Date(e.ends_at);
  const utc = (v) => v.toISOString().replace(/[-:]|\.\d{3}/g, "");
  const day = (v) => utc(new Date(v)).slice(0, 8);
  const text = (v) => String(v ?? "").replace(/\\/g, "\\\\").replace(/\r\n|\r|\n/g, "\\n").replace(/[,;]/g, "\\$&");
  const hasEnd = Boolean(e.ends_at) && Number.isFinite(+end) && end > start;
  const lines = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Lifepoint Church//Events//EN", "BEGIN:VEVENT",
    "UID:" + encodeURIComponent(e.identifier || e.id || e.starts_at) + "@" + HOST, "DTSTAMP:" + utc(new Date()), "SUMMARY:" + text(e.name)];
  if (e.all_day) {
    const s = calendarDay(start);
    let last = hasEnd ? calendarDay(end) : s;
    if (last > s && (+end + 10 * 3600000) % 86400000 === 0) last -= 86400000;
    lines.push("DTSTART;VALUE=DATE:" + day(s), "DTEND;VALUE=DATE:" + day(last + 86400000));
  } else {
    lines.push("DTSTART:" + utc(start));
    if (hasEnd) lines.push("DTEND:" + utc(end));
  }
  const venue = [...new Set([e.location?.name?.trim(), e.location?.address?.trim()].filter(Boolean))];
  if (venue.length) lines.push("LOCATION:" + text(venue.join(", ")));
  if (details) lines.push("DESCRIPTION:" + text(details));
  if (link) lines.push("URL:" + link);
  lines.push("END:VEVENT", "END:VCALENDAR");
  const folded = lines.map((line) => {
    let out = "", bytes = 0;
    for (const ch of line) { const n = Buffer.byteLength(ch); if (bytes + n > 75) { out += "\r\n "; bytes = 1; } out += ch; bytes += n; }
    return out;
  });
  return "data:text/calendar;charset=utf-8," + encodeURIComponent(folded.join("\r\n") + "\r\n");
}

function card(e, categoryName) {
  const key = categoryName?.trim().toLowerCase();
  const theme = key ? THEMES.get(key) || "lavender" : "charcoal";
  const text = plainText(e.description);
  const photo = cdnUrl(e.image?.medium || e.image?.large || e.image?.small);
  const link = feedUrl(e.url);
  const label = key === "general" ? "All welcome" : categoryName?.trim() || "";
  const frameTag = link && photo ? "a" : "div";
  const frameAttrs = link && photo ? ` href="${esc(link)}" aria-label="${esc("More info about " + e.name + (label ? ". " + label : ""))}"` : "";
  let html = `<article class="lp-card"><${frameTag} class="lp-image-frame${link && photo ? " lp-image-link" : ""}"${frameAttrs}>`;
  if (photo) html += `<img class="lp-photo" src="${esc(photo)}" alt="" loading="lazy">`;
  if (label) html += `<span class="lp-image-labels"><span class="lp-label" data-theme="${theme}">${esc(label)}</span></span>`;
  html += `</${frameTag}><div class="lp-body"><h3 class="lp-title">${esc(e.name)}</h3>`;
  for (const [cls, t] of schedule(e)) html += `<p class="${cls}">${esc(t)}</p>`;
  const venue = e.location, address = venue?.address?.trim(), place = venue?.name?.trim() || address;
  if (place) html += `<p class="lp-countdown">${esc(place)}</p>`;
  if (text) html += `<p class="lp-description">${esc(text)}</p>`;
  const hasPin = Number.isFinite(venue?.latitude) && Number.isFinite(venue?.longitude);
  const mapQuery = venue?.type === "physical" ? address || (hasPin ? venue.latitude + "," + venue.longitude : "") : "";
  const actions = [];
  if (link) actions.push(action(link, "MORE INFO", ICONS.info, "More info about " + e.name));
  if (mapQuery) {
    const u = new URL("https://www.google.com/maps/dir/"); u.searchParams.set("api", "1"); u.searchParams.set("destination", mapQuery);
    actions.push(action(u.href, "DIRECTIONS", ICONS.map, "Directions to " + (place || e.name)));
  }
  if (e.starts_at) {
    const file = "lifepoint-" + String(e.identifier || e.id || "event").replace(/[^a-z0-9_-]/gi, "") + ".ics";
    actions.push(action(icsHref(e, text, link), "ADD TO CAL", ICONS.cal, "Add to my calendar: " + e.name, ` download="${esc(file)}"`));
  }
  if (actions.length) html += `<div class="lp-actions">${actions.join("")}</div>`;
  return html + `</div></article>`;
}

// Show only the next two Sunday services, as the events page script does.
function limitSundayServices(entries, now) {
  const isSunday = (x) => x.categoryName?.trim().toLowerCase() === "sunday services";
  const next = new Set(entries.filter((x) => {
    if (!isSunday(x)) return false;
    const s = Date.parse(x.item.starts_at), en = Date.parse(x.item.ends_at);
    return !/^cancell?ed$/i.test(x.item.status || "") && Number.isFinite(s) && (en > s ? en : s) >= now;
  }).sort((a, b) => Date.parse(a.item.starts_at) - Date.parse(b.item.starts_at)).slice(0, 2));
  return entries.filter((x) => !isSunday(x) || next.has(x));
}

// ---------- Event structured data for Google ----------
function schema(items) {
  const data = items.filter((e) => e.starts_at && e.name).slice(0, 20).map((e) => {
    const out = { "@type": "Event", name: e.name.trim(), startDate: e.starts_at,
      eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode", eventStatus: "https://schema.org/EventScheduled",
      organizer: { "@type": "Organization", name: "Lifepoint Church", url: "https://www.lifepoint.org.au/" } };
    if (e.ends_at) out.endDate = e.ends_at;
    if (e.url) out.url = e.url;
    const img = e.image && (e.image.large || e.image.medium || e.image.small);
    if (img) out.image = img;
    const desc = plainText(e.description);
    if (desc) out.description = desc.slice(0, 300);
    const loc = e.location && e.location.name;
    out.location = { "@type": "Place", name: loc || "Lifepoint Church", address: (e.location && e.location.address) || loc || "Rothwell QLD" };
    return out;
  });
  return data.length ? JSON.stringify({ "@context": "https://schema.org", "@graph": data }).replace(/</g, "\\u003c") : "";
}

module.exports = async function () {
  const empty = { ok: false, homeHtml: "", homeSchema: "", listHtml: "", listSchema: "", count: 0 };
  try {
    const events = [], categories = new Map();
    let page = 1;
    while (page) {
      const url = new URL(FEED); url.searchParams.set("page", page);
      const res = await fetch(url, { signal: AbortSignal.timeout(15000) });
      if (!res.ok) throw new Error("HTTP " + res.status);
      const data = await res.json();
      if (!Array.isArray(data.events)) throw new Error("unexpected feed");
      for (const c of data.categories || []) categories.set(String(c.id), c.name);
      events.push(...data.events);
      const next = Number(data.pagination?.next_page);
      page = Number.isSafeInteger(next) && next > page ? next : 0;
    }
    const now = new Date();
    const home = events.filter((e) => upcoming(e, now)).sort((a, b) => new Date(a.starts_at) - new Date(b.starts_at)).slice(0, 5);
    const listed = limitSundayServices(events.map((item) => ({ item, categoryName: categories.get(String(item.category_id)) })), now);
    return {
      ok: true,
      homeHtml: home.map((e, i) => homeItem(e, i, "/events/")).join(""),
      homeSchema: schema(home),
      listHtml: listed.map(({ item, categoryName }) => card(item, categoryName)).join(""),
      listSchema: schema(listed.map((x) => x.item)),
      count: listed.length
    };
  } catch (err) {
    console.warn("[events] could not read ChurchSuite:", err.message);
    return empty;
  }
};
