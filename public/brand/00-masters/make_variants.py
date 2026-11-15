"""Builds every colourway of the printexo v3 logos from the masters in this folder.

Masters have two layers: 'accent' (the dovetail's tail half) and 'ink' (the other half + wordmark).
One-colour colourways fill both layers alike; the 'duo' colourways make the tail Lime and the rest white,
for Deep Green backgrounds only.
"""
import re, os, shutil
K = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
M = os.path.join(K, "00-masters")
INK, LIME, PAPER, WHITE, BLACK = "#0E2F2C", "#C6F432", "#F3F8F1", "#FFFFFF", "#000000"
MONO = {"deepgreen": INK, "black": BLACK, "white": WHITE, "lime": LIME}
ON_BG = {"on-paper": (PAPER, INK), "on-deepgreen": (INK, WHITE), "on-lime": (LIME, INK), "signature-lime-on-deepgreen": (INK, LIME)}

def load(n):
    s = open(os.path.join(M, n)).read()
    vb = [float(v) for v in re.search(r'viewBox="([^"]+)"', s).group(1).split()]
    acc = re.search(r'<g id="accent" fill="[^"]+">(.*?)</g>', s).group(1)
    ink = re.search(r'<g id="ink" fill="[^"]+">(.*?)</g>', s).group(1)
    return vb, acc, ink

def write(path, vb, acc, ink, fa, fi, bg=None, pad=0, square=False, title=""):
    x, y, w, h = vb; x -= pad; y -= pad; w += 2*pad; h += 2*pad
    if square and w != h:
        m = max(w, h); x -= (m-w)/2; y -= (m-h)/2; w = h = m
    r = f'<rect x="{x:g}" y="{y:g}" width="{w:g}" height="{h:g}" fill="{bg}"/>' if bg else ""
    layers = (f'<g fill="{fa}">{acc}</g>' if acc else "") + f'<g fill="{fi}">{ink}</g>'
    open(path, "w").write(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{x:g} {y:g} {w:g} {h:g}" width="{w:g}" height="{h:g}"><title>{title}</title>{r}{layers}</svg>')

SETS = [  # master, folder, base name, clear space (master units), square canvas
    ("printexo-logo.svg",             "01-main-logo",      "printexo-logo",             120, False),
    ("printexo-logo-stacked.svg",     "02-secondary-logo", "printexo-logo-stacked",     120, False),
    ("printexo-symbol.svg",           "03-icon",           "printexo-icon",              50, True),
    ("printexo-wordmark.svg",         "08-wordmark",       "printexo-wordmark",         120, False),
    ("printexo-wordmark-stacked.svg", "08-wordmark",       "printexo-wordmark-stacked", 120, False),
]
for src, folder, base, pad, sq in SETS:
    vb, acc, ink = load(src)
    out = os.path.join(K, folder, "svg"); os.makedirs(out, exist_ok=True)
    tight = 12 if sq else 0
    for k, c in MONO.items():
        write(os.path.join(out, f"{base}-{k}.svg"), vb, acc, ink, c, c, pad=tight, square=sq, title=f"{base} {k}")
    for k, (bg, fg) in ON_BG.items():
        write(os.path.join(out, f"{base}-{k}.svg"), vb, acc, ink, fg, fg, bg, pad, square=sq, title=f"{base} {k}")
    if acc:  # two-tone signature: Lime tail, white rest, Deep Green only
        write(os.path.join(out, f"{base}-duo.svg"), vb, acc, ink, LIME, WHITE, pad=tight, square=sq, title=f"{base} duo")
        write(os.path.join(out, f"{base}-duo-on-deepgreen.svg"), vb, acc, ink, LIME, WHITE, INK, pad, square=sq, title=f"{base} duo on deepgreen")
for n in ("printexo-app-icon.svg", "printexo-app-icon-small.svg"):
    shutil.copy(os.path.join(M, n), os.path.join(K, "03-icon", "svg", n))
print("ok")
