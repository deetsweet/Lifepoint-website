# Downloads each "dest<TAB>url" line in tools/urls.txt into src/assets/img/<dest>.
# Tries the original first, then Church Co's resized copies.
import os, re, urllib.request, urllib.parse
UA = {"User-Agent": "Mozilla/5.0 (Lifepoint site migration)"}
def get(u):
    u = urllib.parse.quote(u, safe=":/%?=&~")
    return urllib.request.urlopen(urllib.request.Request(u, headers=UA), timeout=60).read()
for line in open("tools/urls.txt"):
    if not line.strip(): continue
    dest, url = line.rstrip("\n").split("\t")
    base, ext = os.path.splitext(url)
    if not re.fullmatch(r"\.(jpe?g|png|webp|gif)", ext, re.I): base, ext = url, ""
    tries = [url] if ext else []
    tries += [base + "__largepreview__.webp", base + "__large__.webp", base + "__mediumsquare__.webp"]
    if not ext: tries += [url + e for e in (".png", ".jpg", ".jpeg", ".webp")]
    out = "src/assets/img/" + dest
    os.makedirs(os.path.dirname(out), exist_ok=True)
    for t in tries:
        try:
            data = get(t)
            if len(data) > 500:
                if not ext and t.endswith(".webp"): out = os.path.splitext(out)[0] + ".webp"
                open(out, "wb").write(data); print("ok", dest, t[-50:], len(data)); break
        except Exception as e:
            pass
    else:
        print("FAILED", dest, url)
