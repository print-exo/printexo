"""Builds the printexo v3 master SVGs: the wordmark (unchanged from v2), the dovetail symbol,
the horizontal and stacked lockups and the app icons. Dependency-free.

    python3 build_logo.py <out-dir>     # normally: python3 00-masters/build_logo.py 00-masters
"""
import math, sys, os
OUT = sys.argv[1]
T30 = math.tan(math.radians(30))
S = 36            # stem width
XH, BL = 80, 200  # x-height top, baseline
CUT = S*T30       # 20.78 vertical drop of a 30deg cut across a stem
G = 10            # blade gap (perpendicular)

def f(v): return f"{v:.2f}".rstrip('0').rstrip('.')
def poly(pts): return "M" + " L".join(f"{f(x)},{f(y)}" for x,y in pts) + " Z"

def clip(pts, n, c, keep_le):
    # keep points with n.p <= c (or >= c)
    out=[]
    def inside(p):
        v = n[0]*p[0]+n[1]*p[1]-c
        return v <= 1e-9 if keep_le else v >= -1e-9
    for i in range(len(pts)):
        a, b = pts[i], pts[(i+1)%len(pts)]
        ia, ib = inside(a), inside(b)
        if ia: out.append(a)
        if ia != ib:
            da = n[0]*a[0]+n[1]*a[1]-c; db = n[0]*b[0]+n[1]*b[1]-c
            t = da/(da-db); out.append((a[0]+t*(b[0]-a[0]), a[1]+t*(b[1]-a[1])))
    return out

N30 = (math.sin(math.radians(30)), math.cos(math.radians(30)))  # normal of a line rising right at 30deg
def slice_poly(pts, center, gap=G):
    c = N30[0]*center[0]+N30[1]*center[1]
    return [clip(pts, N30, c-gap/2, True), clip(pts, N30, c+gap/2, False)]

# ---- letters: return (list of path d strings, advance-right x) ----
def p_letter(x0, sliced=False):
    d=[]
    stem=[(x0,XH),(x0+S,XH),(x0+S,250-CUT),(x0,250)]
    if sliced:
        d += [poly(q) for q in slice_poly(stem,(x0+S/2,222)) if q]
    else:
        d.append(poly(stem))
    bx=x0+S-2
    d.append(f"M{f(bx)},{XH} H{f(x0+62)} A50,50 0 0 1 {f(x0+112)},{XH+50} V{BL-50} A50,50 0 0 1 {f(x0+62)},{BL} H{f(bx)} Z "
             f"M{f(x0+S)},{XH+31} H{f(x0+60)} A18,18 0 0 1 {f(x0+78)},{XH+49} V{BL-49} A18,18 0 0 1 {f(x0+60)},{BL-31} H{f(x0+S)} Z")
    return d, x0+112
def r_letter(x0):
    s=x0
    return [f"M{f(s)},{f(XH+CUT)} L{f(s+S)},{XH} H{f(s+82)} V{XH+33} H{f(s+64)} Q{f(s+S)},{XH+33} {f(s+S)},{XH+62} V{BL} H{f(s)} Z"], s+82
def i_letter(x0):
    stem=[(x0,XH+CUT),(x0+S,XH),(x0+S,BL),(x0,BL)]
    gap=16; h=34
    yb=XH+CUT-gap  # dot bottom-left
    dot=[(x0,yb),(x0+S,yb-CUT),(x0+S,yb-CUT-h),(x0,yb-h)]
    return [poly(stem),poly(dot)], x0+S
def n_letter(x0):
    s=x0
    return [f"M{f(s)},{f(XH+CUT)} L{f(s+S)},{XH} H{f(s+64)} A50,50 0 0 1 {f(s+114)},{XH+50} V{BL} H{f(s+78)} V{XH+50} "
            f"A18,18 0 0 0 {f(s+60)},{XH+32} H{f(s+S)} V{BL} H{f(s)} Z"], s+114
def t_letter(x0):
    a=x0+10  # stem left
    top=36
    return [f"M{f(a)},{f(top+CUT)} L{f(a+S)},{top} V{XH} H{f(a+S+22)} V{XH+30} H{f(a+S)} V{BL-42} A10,10 0 0 0 {f(a+S+10)},{BL-32} "
            f"H{f(a+S+22)} V{BL} H{f(a+38)} A38,38 0 0 1 {f(a)},{BL-38} V{XH+30} H{f(x0)} V{XH} H{f(a)} Z"], a+S+22
def ell_x(rx,ry,dy): return rx*math.sqrt(max(0,1-(dy/ry)**2))
RX,RY,rx,ry=58,61,22,31
def e_letter(x0):
    cx=x0+RX; cy=140
    cb_top, cb_bot = 134, 158
    A=(cx+ell_x(RX,RY,cb_bot-cy), cb_bot)
    To=(cx+40, cy+ell_x(RY,RX,40))  # outer point with dx=28
    # 30deg cut rising to the left from To until inner ellipse
    t=0
    for k in range(4000):
        t=k*0.05; px=To[0]-t*math.cos(math.radians(30)); py=To[1]-t*math.sin(math.radians(30))
        if ((px-cx)/rx)**2+((py-cy)/ry)**2<=1: break
    Ti=(px,py)
    L=(cx-ell_x(rx,ry,cb_bot-cy), cb_bot)
    ar=lambda R1,R2,p,sw: f" A{R1},{R2} 0 0 {sw} {f(p[0])},{f(p[1])}"
    outer=(f"M{f(A[0])},{f(A[1])}"+ar(RX,RY,(cx,cy-RY),0)+ar(RX,RY,(cx-RX,cy),0)+ar(RX,RY,(cx,cy+RY),0)+ar(RX,RY,To,0)
           +f" L{f(Ti[0])},{f(Ti[1])}"+(ar(rx,ry,(cx,cy+ry),1) if Ti[0]>cx else "")+ar(rx,ry,L,1)+" Z")
    print("Ti",Ti[0]-cx,Ti[1]-cy, file=sys.stderr)
    x1=ell_x(rx,ry,cb_top-cy)
    hole=f" M{f(cx-x1)},{cb_top} A{rx},{ry} 0 0 1 {f(cx+x1)},{cb_top} Z"
    return [outer+hole], x0+2*RX
def o_letter(x0):
    cx=x0+RX; cy=140
    return [f"M{f(cx-RX)},{cy} A{RX},{RY} 0 1 0 {f(cx+RX)},{cy} A{RX},{RY} 0 1 0 {f(cx-RX)},{cy} Z "
            f"M{f(cx-rx)},{cy} A{rx},{ry} 0 1 0 {f(cx+rx)},{cy} A{rx},{ry} 0 1 0 {f(cx-rx)},{cy} Z"], x0+2*RX
def x_letter(x0, sliced=True):
    sw=42; W=sw+120/math.tan(math.radians(60)); xr=x0+W
    a=[(x0,XH),(x0+sw,XH),(xr,BL),(xr-sw,BL)]
    b=[(xr-sw,XH),(xr,XH),(x0+sw,BL),(x0,BL)]
    if not sliced: return [poly(a),poly(b)], xr
    c=(x0+W/2,140)
    return [poly(q) for s in (a,b) for q in slice_poly(s,c) if q], xr

def wordmark(sliced_x=True):
    seq=[(p_letter,14),(r_letter,12),(i_letter,12),(n_letter,12),(t_letter,6),(e_letter,10),(x_letter,8),(o_letter,0)]
    x=0; paths=[]
    for i,(fn,gap) in enumerate(seq):
        d,right = fn(x,sliced_x) if fn is x_letter else fn(x)
        paths+=d; x=right+gap
    return paths, x
def svg(paths, vb, fill="#0E2F2C", bg=None, title="printexo"):
    body="".join(f'<path d="{d}" fill-rule="evenodd"/>' for d in paths)
    bgr = f'<rect x="{vb[0]}" y="{vb[1]}" width="{vb[2]}" height="{vb[3]}" fill="{bg}"/>' if bg else ""
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{" ".join(f(v) for v in vb)}" width="{f(vb[2])}" height="{f(vb[3])}">'
            f'<title>{title}</title>{bgr}<g fill="{fill}">{body}</g></svg>')


INK, LIME, PAPER = "#0E2F2C", "#C6F432", "#F3F8F1"
def save(name, s): open(os.path.join(OUT, name), "w").write(s)
def word(fns_gaps, sliced_x=True):
    x=0; ps=[]
    for fn,gap in fns_gaps:
        d,right = fn(x,sliced_x) if fn is x_letter else fn(x)
        ps+=d; x=right+gap
    return ps,x
def paths(ds, extra=""): return "".join(f'<path d="{d}" fill-rule="evenodd"{extra}/>' for d in ds)
def doc(vb, inner, title, bg=None, rx=0):
    r = f'<rect x="{f(vb[0])}" y="{f(vb[1])}" width="{f(vb[2])}" height="{f(vb[3])}"{f" rx=" + chr(34) + f(rx) + chr(34) if rx else ""} fill="{bg}"/>' if bg else ""
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{" ".join(f(v) for v in vb)}" width="{f(vb[2])}" height="{f(vb[3])}">'
            f'<title>{title}</title>{r}{inner}</svg>')
def groups(accent, ink, accent_fill=INK, ink_fill=INK):
    """Two named layers: 'accent' (the dovetail's tail piece, Lime in duo colourways) and 'ink' (everything else)."""
    return f'<g id="accent" fill="{accent_fill}">{paths(accent)}</g><g id="ink" fill="{ink_fill}">{paths(ink)}</g>'

# ---- the dovetail symbol, on a 200-unit square ----
# Two halves of a square locked by a tail that flares at the 30° blade angle.
# Tail: 64 units wide where it leaves its half, 56 long, flaring 30° each side. Gap: 10 (same as the wordmark's blade gap).
SQ, JOIN, BASE, TAIL = 200, 92, 64, 56
def dovetail(gap=10):
    fl = TAIL * T30
    y0, y1 = SQ/2 - BASE/2, SQ/2 + BASE/2
    xt = JOIN + TAIL
    tail_half = [(0,0),(JOIN,0),(JOIN,y0),(xt,y0-fl),(xt,y1+fl),(JOIN,y1),(JOIN,SQ),(0,SQ)]
    dy = gap / math.cos(math.radians(30))           # vertical shift that moves a 30° edge by `gap`
    xr, xg = JOIN + gap, xt + gap
    yt = lambda x: y0 - (x-JOIN)*T30 - dy           # offset top flank
    yb = lambda x: y1 + (x-JOIN)*T30 + dy           # offset bottom flank
    other_half = [(xr,0),(SQ,0),(SQ,SQ),(xr,SQ),(xr,yb(xr)),(xg,yb(xg)),(xg,yt(xg)),(xr,yt(xr))]
    return [poly(tail_half)], [poly(other_half)]
def place(ds, dx, dy, s):
    """Scale + move simple M/L/Z polygon paths."""
    import re
    out = []
    for d in ds:
        nums = [float(v) for v in re.findall(r"-?\d+(?:\.\d+)?", d)]
        pts = [(nums[i]*s+dx, nums[i+1]*s+dy) for i in range(0, len(nums), 2)]
        out.append(poly(pts))
    return out

def shift(d,dx,dy):
    import re
    # shift absolute coords; arcs: rx ry rot large sweep x y -> only last two
    toks=re.findall(r'[MLHVAQZ]|-?\d+(?:\.\d+)?', d); out=[]; i=0; cmd=None; buf=[]
    res=[]
    while i<len(toks):
        t=toks[i]
        if t.isalpha():
            cmd=t; res.append(t); i+=1; continue
        if cmd in 'ML' or cmd=='Q':
            n=4 if cmd=='Q' else 2
            vals=[float(v) for v in toks[i:i+n]]
            vals=[v+(dx if k%2==0 else dy) for k,v in enumerate(vals)]
            res.append(" ".join(f(v) for v in vals)); i+=n
        elif cmd=='H': res.append(f(float(t)+dx)); i+=1
        elif cmd=='V': res.append(f(float(t)+dy)); i+=1
        elif cmd=='A':
            v=toks[i:i+7]; v[5]=f(float(v[5])+dx); v[6]=f(float(v[6])+dy); res.append(" ".join(v)); i+=7
    s=""
    for r_ in res: s+= r_ if r_.isalpha() else (r_+" ")
    return s.replace(" Z","Z").strip()

acc, ink = dovetail()
acc_s, ink_s = dovetail(gap=18)                          # small cut: wider gap so the joint survives at 16-24 px
save("printexo-symbol.svg", doc((0,0,SQ,SQ), groups(acc, ink), "printexo symbol"))
save("printexo-symbol-small.svg", doc((0,0,SQ,SQ), groups(acc_s, ink_s), "printexo symbol, small cut"))

# ---- wordmark (unchanged v2 lettering) ----
wm, w = wordmark()
WVB = (-4, 26, w+8, 228)
save("printexo-wordmark.svg", doc(WVB, groups([], wm), "printexo wordmark"))
p1,w1 = word([(p_letter,14),(r_letter,12),(i_letter,12),(n_letter,12),(t_letter,0)])
p2,w2 = word([(e_letter,10),(x_letter,8),(o_letter,0)])
stack = p1 + [shift(d,0,200) for d in p2]
save("printexo-wordmark-stacked.svg", doc((-4,26,max(w1,w2)+8,428), groups([], stack), "printexo wordmark, stacked"))

# ---- horizontal lockup: symbol spans ascender top (30) to descender bottom (250); gap = half the x-height ----
SYM_H, LGAP = 220, 60
sa = place(acc, 0, 30, SYM_H/SQ); si = place(ink, 0, 30, SYM_H/SQ)
wm_shift = [shift(d, SYM_H+LGAP, 0) for d in wm]
save("printexo-logo.svg", doc((-4, 26, SYM_H+LGAP+w+8, 228), groups(sa, si + wm_shift), "printexo logo"))

# ---- stacked lockup: symbol centred above the wordmark ----
ST_H, SGAP = 300, 80
ox = (w - ST_H)/2; oy = 30 - SGAP - ST_H
ta = place(acc, ox, oy, ST_H/SQ); ti = place(ink, ox, oy, ST_H/SQ)
save("printexo-logo-stacked.svg", doc((-4, oy-4, w+8, 254-(oy-4)), groups(ta, ti + wm), "printexo logo, stacked"))

# ---- app icons: duo symbol (Lime tail, white half) on a Deep Green tile ----
def app_icon(small=False, full=False):
    a, i = (acc_s, ink_s) if small else (acc, ink)
    size = 120 if full else (176 if small else 150)  # full-bleed keeps the mark inside the 80% maskable safe zone
    o = (256 - size)/2
    inner = groups(place(a, o, o, size/SQ), place(i, o, o, size/SQ), LIME, "#FFFFFF")
    return doc((0,0,256,256), inner, "printexo app icon", bg=INK, rx=0 if full else 56)
save("printexo-app-icon.svg", app_icon())
save("printexo-app-icon-small.svg", app_icon(small=True))
save("printexo-icon-fullbleed.svg", app_icon(full=True))
print("wordmark width", round(w,2))
