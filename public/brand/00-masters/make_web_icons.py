"""Builds 04-web-icons: favicons (small cut), app icons, Apple touch icon, PWA icons, manifest and <head> snippet.

    python3 00-masters/make_web_icons.py <path-to>/render_png.py
"""
import os, shutil, subprocess, sys, json
K = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
M = os.path.join(K, "00-masters"); W = os.path.join(K, "04-web-icons"); os.makedirs(W, exist_ok=True)
RENDER = sys.argv[1]
def png(src, out, size): subprocess.run([sys.executable, RENDER, os.path.join(M, src), "-o", os.path.join(W, out), "--size", str(size)], check=True, capture_output=True)
shutil.copy(os.path.join(M, "printexo-app-icon-small.svg"), os.path.join(W, "favicon.svg"))
for n in ("printexo-app-icon.svg", "printexo-app-icon-small.svg", "printexo-icon-fullbleed.svg"):
    shutil.copy(os.path.join(M, n), os.path.join(W, n))
square = open(os.path.join(M, "printexo-app-icon.svg")).read().replace(' rx="56"', "")   # iOS rounds the corners itself
open(os.path.join(W, "printexo-square.svg"), "w").write(square)
for s in (16, 32, 48): png("printexo-app-icon-small.svg", f"favicon-{s}.png", s)
subprocess.run([sys.executable, RENDER, os.path.join(M, "printexo-app-icon-small.svg"), "--ico", os.path.join(W, "favicon.ico"), "--ico-sizes", "16", "32", "48"], check=True, capture_output=True)
subprocess.run([sys.executable, RENDER, os.path.join(W, "printexo-square.svg"), "-o", os.path.join(W, "apple-touch-icon.png"), "--size", "180"], check=True, capture_output=True)
png("printexo-app-icon.svg", "icon-192.png", 192); png("printexo-app-icon.svg", "icon-512.png", 512)
png("printexo-icon-fullbleed.svg", "maskable-512.png", 512)
json.dump({"name": "printexo", "icons": [
    {"src": "/icon-192.png", "sizes": "192x192", "type": "image/png"},
    {"src": "/icon-512.png", "sizes": "512x512", "type": "image/png"},
    {"src": "/maskable-512.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable"}],
    "theme_color": "#0E2F2C", "background_color": "#0E2F2C", "display": "standalone"}, open(os.path.join(W, "site.webmanifest"), "w"), indent=2)
open(os.path.join(W, "head-snippet.html"), "w").write('<link rel="icon" href="/favicon.ico" sizes="48x48">\n<link rel="icon" href="/favicon.svg" type="image/svg+xml">\n<link rel="apple-touch-icon" href="/apple-touch-icon.png">\n<link rel="manifest" href="/site.webmanifest">\n<meta name="theme-color" content="#0E2F2C">\n')
print("web icons:", len(os.listdir(W)), "files")
