"""Renders PNG (transparent / on background) and JPG (on background) files from every SVG in the kit.

    python3 00-masters/make_rasters.py <path-to>/render_png.py      # needs Chrome (or cairosvg / rsvg-convert)
"""
import os, re, subprocess, sys
K = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RENDER = sys.argv[1]
JOBS = {"01-main-logo": [600, 1200, 2400], "02-secondary-logo": [600, 1200, 2400], "03-icon": [64, 256, 1024], "08-wordmark": [600, 1200, 2400]}
for folder, widths in JOBS.items():
    sd, pd, jd = (os.path.join(K, folder, x) for x in ("svg", "png", "jpg"))
    os.makedirs(pd, exist_ok=True); os.makedirs(jd, exist_ok=True)
    for n in sorted(os.listdir(sd)):
        s = open(os.path.join(sd, n)).read()
        _, _, vw, vh = [float(v) for v in re.search(r'viewBox="([^"]+)"', s).group(1).split()]
        for w in widths:
            h = round(w*vh/vw); base = n[:-4] + f"-{w}"
            png = os.path.join(pd, base + ".png")
            subprocess.run([sys.executable, RENDER, os.path.join(sd, n), "-o", png, "--width", str(w), "--height", str(h)], check=True, capture_output=True)
            if "-on-" in n or "signature" in n:
                subprocess.run(["sips", "-s", "format", "jpeg", "-s", "formatOptions", "92", png, "--out", os.path.join(jd, base + ".jpg")], check=True, capture_output=True)
    print(folder, len(os.listdir(pd)), "png", len(os.listdir(jd)), "jpg")
