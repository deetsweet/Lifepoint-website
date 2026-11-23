# Downloads every photo used on the current lifepoint.org.au pages into
# src/assets/img/live/<page>/, in the order they appear, plus a manifest.
import json, os, re, sys, urllib.request, html
PAGES = sys.argv[1:] or [""]
UA = {"User-Agent": "Mozilla/5.0 (Lifepoint site migration)"}
def get(url):
    return urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=60).read()
manifest = {}
for page in PAGES:
    src = get("https://www.lifepoint.org.au/" + page).decode("utf-8", "ignore")
    found = []
    for m in re.finditer(r'https?://[a-z0-9.-]*(?:thechurchcoassets\.com|thechurchco[a-z0-9.-]*\.amazonaws\.com|cloudinary\.com|imgix\.net|cloudfront\.net)/[^"\'\)\s]+?\.(?:jpe?g|png|webp|gif|mp4)', src, re.I):
        u = html.unescape(m.group(0))
        if "opengraph" in u or "Badge-Icon" in u or "Logo" in u: continue
        base = re.sub(r"__[a-z]+__(?=\.\w+$)", "", u)  # strip size suffix for the original
        if base in [f["url"] for f in found]: continue
        tries = [base, u] + [base.replace(".", "__" + s + "__.", 1) if False else re.sub(r"(\.\w+)$", "__" + s + r"__\1", base) for s in ("largepreview", "mediumsquare", "large")]
        before = re.sub(r"<[^>]+>", " ", src[max(0, m.start() - 1500):m.start()])
        after = re.sub(r"<[^>]+>", " ", src[m.end():m.end() + 1500])
        ctx = " ".join((before.split()[-12:] + ["[IMG]"] + after.split()[:12]))
        tag_start = src.rfind("<", 0, m.start()); tag_end = src.find(">", m.end())
        tag = src[tag_start:tag_end] if tag_start != -1 else ""
        alt = re.search(r'alt="([^"]*)"', tag)
        found.append({"url": base, "tries": tries, "alt": html.unescape(alt.group(1)) if alt else "", "context": ctx})
    slug = page or "home"
    outdir = f"src/assets/img/live/{slug}"
    os.makedirs(outdir, exist_ok=True)
    for i, f in enumerate(found, 1):
        ext = os.path.splitext(f["url"])[1].lower()
        name = f"{i:02d}{ext}"
        for u in f["tries"]:
            try:
                data = get(u)
                if not data: continue
                open(f"{outdir}/{name}", "wb").write(data); f["file"] = name; f["got"] = u; f.pop("error", None); break
            except Exception as e:
                f["error"] = str(e)
    manifest[slug] = found
    print(slug, len(found))
json.dump(manifest, open("src/assets/img/live/manifest.json", "w"), indent=1)
