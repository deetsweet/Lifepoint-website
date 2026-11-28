// Latest Sunday messages, read from the YouTube playlist feed each time the site builds.
const PLAYLIST = "PLOT8i6mKZu7fcfd9rZGs4fGvQOdApZztZ";
const CHANNEL = "UCMo91_MfXY6qdhvK3SArtGA";
const decode = s => s.replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">");

async function read(url) {
  const res = await fetch(url, { signal: AbortSignal.timeout(10000) });
  if (!res.ok) throw new Error(res.status);
  const xml = await res.text();
  return [...xml.matchAll(/<entry>([\s\S]*?)<\/entry>/g)].map(([, e]) => ({
    id: (e.match(/<yt:videoId>([^<]+)/) || [])[1],
    title: decode((e.match(/<title>([^<]+)/) || [])[1] || ""),
    published: (e.match(/<published>([^<]+)/) || [])[1]
  })).filter(v => v.id);
}

// Videos are often uploaded days or weeks after the Sunday, and not always in order,
// so sort by the Sunday date in the title ("... - Sunday November 8 2026") when there is one.
const MONTHS = ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"];
function sundayDate(title) {
  // Handles "November 8 2026", "August 9th 2026" and "16 August 2026"
  const month = "(january|february|march|april|may|june|july|august|september|october|november|december)";
  const a = title.match(new RegExp(month + "\\s+(\\d{1,2})(?:st|nd|rd|th)?,?\\s+(\\d{4})", "i"));
  const b = title.match(new RegExp("(\\d{1,2})(?:st|nd|rd|th)?\\s+" + month + ",?\\s+(\\d{4})", "i"));
  const [mon, day, year] = a ? [a[1], a[2], a[3]] : b ? [b[2], b[1], b[3]] : [];
  if (!mon) return "";
  const d = new Date(Date.UTC(+year, MONTHS.indexOf(mon.toLowerCase()), +day));
  return Number.isFinite(+d) ? d.toISOString() : "";
}

module.exports = async function () {
  for (const url of [
    "https://www.youtube.com/feeds/videos.xml?playlist_id=" + PLAYLIST,
    "https://www.youtube.com/feeds/videos.xml?channel_id=" + CHANNEL
  ]) {
    try {
      const list = await read(url);
      if (list.length) {
        list.forEach(v => { v.sunday = sundayDate(v.title); v.sortKey = v.sunday || v.published || ""; });
        list.sort((a, b) => b.sortKey.localeCompare(a.sortKey) || (b.published || "").localeCompare(a.published || ""));
        return list.slice(0, 4).map(v => ({
          ...v,
          date: (v.sunday || v.published) ? new Date(v.sunday || v.published).toLocaleDateString("en-AU", { day: "numeric", month: "long", year: "numeric", timeZone: v.sunday ? "UTC" : "Australia/Brisbane" }) : ""
        }));
      }
    } catch (e) { console.warn("[messages] could not read", url, e.message); }
  }
  return [];
};
