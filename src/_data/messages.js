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

module.exports = async function () {
  for (const url of [
    "https://www.youtube.com/feeds/videos.xml?playlist_id=" + PLAYLIST,
    "https://www.youtube.com/feeds/videos.xml?channel_id=" + CHANNEL
  ]) {
    try {
      const list = await read(url);
      if (list.length) {
        list.sort((a, b) => (b.published || "").localeCompare(a.published || ""));
        return list.slice(0, 4).map(v => ({
          ...v,
          date: v.published ? new Date(v.published).toLocaleDateString("en-AU", { day: "numeric", month: "long", year: "numeric", timeZone: "Australia/Brisbane" }) : ""
        }));
      }
    } catch (e) { console.warn("[messages] could not read", url, e.message); }
  }
  return [];
};
