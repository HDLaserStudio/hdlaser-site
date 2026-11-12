#!/usr/bin/env python3
"""Tell IndexNow which public pages of hdlaser.net changed, so Bing recrawls them soon.

Bing's index also feeds Yahoo, DuckDuckGo and Microsoft Copilot, and ChatGPT search leans on it;
IndexNow also reaches Yandex, Seznam, Naver and Yep. Google does not use IndexNow (it reads sitemap.xml).
Run by .github/workflows/indexnow.yml after a push to main, or by hand (Run workflow) to send every page.
"""
import glob, json, os, re, subprocess, sys, urllib.error, urllib.request

HOST = "hdlaser.net"
KEY_RE = r"[0-9a-f]{32}\.txt"

def git(*args):
    return subprocess.run(["git", *args], check=True, capture_output=True, text=True).stdout

def sitemap_urls(text):
    return re.findall(r"<loc>(https://hdlaser\.net/[^<]*)</loc>", text)

keys = [os.path.basename(p)[:-4] for p in glob.glob("*.txt")
        if re.fullmatch(KEY_RE, os.path.basename(p)) and open(p).read().strip() == os.path.basename(p)[:-4]]
if not keys:
    sys.exit("No IndexNow key file (32 hex characters, .txt, holding its own name) at the site root.")
key = keys[0]
current = sitemap_urls(open("sitemap.xml", encoding="utf-8").read())

before, after = os.environ.get("BEFORE", ""), os.environ.get("AFTER", "HEAD")
if os.environ.get("ALL") == "true" or not before or set(before) == {"0"}:
    urls = current
else:
    try:
        changed = git("diff", "--name-only", before, after).split()
    except subprocess.CalledProcessError:
        changed = None  # the old commit isn't known (force push): send everything
    if changed is None or any(re.fullmatch(KEY_RE, f) for f in changed):
        urls = current  # first run with a new key: send every page once
    else:
        pages, moved = set(), []
        for f in changed:
            if f == "index.html":
                pages.add(f"https://{HOST}/")
            elif f.endswith("/index.html"):
                pages.add(f"https://{HOST}/{f[:-len('index.html')]}")
            elif f.endswith(".html") and os.path.isfile(f) and 'http-equiv="refresh"' in open(f, encoding="utf-8").read():
                moved.append(f"https://{HOST}/{f[:-len('.html')]}")  # an old address that now forwards (wall-print.html serves /wall-print)
        if "sitemap.xml" in changed:
            try:
                old = sitemap_urls(git("show", f"{before}:sitemap.xml"))
            except subprocess.CalledProcessError:
                old = []
            pages |= set(current) - set(old)
        urls = [u for u in current if u in pages] + sorted(moved)  # sitemap pages only, plus forwarded old addresses; private pages never go out

if not urls:
    print("No public page changed, nothing to send.")
    sys.exit(0)
print(f"Sending {len(urls)} page(s):", *urls, sep="\n  ")
body = json.dumps({"host": HOST, "key": key, "keyLocation": f"https://{HOST}/{key}.txt", "urlList": urls}).encode()
req = urllib.request.Request("https://api.indexnow.org/indexnow", data=body, headers={"Content-Type": "application/json; charset=utf-8"})
try:
    with urllib.request.urlopen(req, timeout=30) as r:
        print("IndexNow answered", r.status, "(200 = received, 202 = received, key check still pending)")
except urllib.error.HTTPError as e:
    detail = e.read().decode("utf-8", "replace")[:300]
    print("IndexNow answered", e.code, detail)
    # 403: key file not found or wrong; 422: a URL isn't on hdlaser.net. Those need fixing, so the run turns red.
    # 429 (too many) and server errors are left green: Bing still reads the sitemap on its own.
    sys.exit(1 if e.code in (400, 403, 422) else 0)
except urllib.error.URLError as e:
    print("Could not reach IndexNow:", e.reason)
