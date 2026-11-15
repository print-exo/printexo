# printexo logo kit, v3 (November 2026)

**exo means connecting.** The symbol is a **dovetail**: two halves of a square locked by a tail that flares at the brand's one angle, the **30° blade**. The same blade cuts the wordmark's stem tops, i-dot, p descender and the slice through the x. In the two-tone **duo** colourway the tail half is Lime.

v3 replaces v2's trimmed-"p" icon with the dovetail and makes **symbol + wordmark** the main logo. The wordmark lettering is unchanged.

| Folder | Contents |
|---|---|
| `00-masters/` | Master SVGs and the scripts that generate every file: `build_logo.py` (geometry), `make_variants.py` (colourways), `make_web_icons.py` (favicons, app/PWA icons), `make_rasters.py` (PNG/JPG) |
| `01-main-logo/` | **Horizontal lockup** (symbol + wordmark): `svg/`, `png/` (600/1200/2400 px), `jpg/` |
| `02-secondary-logo/` | **Stacked lockup** (symbol above wordmark): same formats |
| `03-icon/` | **Dovetail symbol**: `svg/`, `png/` and `jpg/` (64/256/1024 px), plus `printexo-app-icon.svg` and `printexo-app-icon-small.svg` |
| `04-web-icons/` | `favicon.ico`, `favicon.svg`, favicon 16/32/48, `apple-touch-icon.png`, PWA icons 192/512/maskable, `site.webmanifest`, `head-snippet.html` |
| `05-typography/` | Archivo variable font + SIL OFL licence |
| `06-guidelines/` | Brand guidelines (HTML + PDF) |
| `07-mockups/` | Mockup presentation (HTML) + PNG slides |
| `08-wordmark/` | The wordmark alone, horizontal and stacked (print / exo) |

## Colourways (every logo)
- **Transparent:** `deepgreen`, `black`, `white`, `lime`, and `duo` (Lime tail + white, Deep Green backgrounds only; not in `08-wordmark`). PNG and SVG only, because JPG can't be transparent.
- **On background** (clear space included): `on-paper`, `on-deepgreen`, `on-lime`, `signature-lime-on-deepgreen`, `duo-on-deepgreen`. SVG, PNG and JPG.

## Which file do I use?
- Website / print shop / designer: **SVG**
- Canva, Office, social media: **PNG**
- Email signature, documents, anything that rejects transparency: **JPG**
- Below 32 px: use the **small cut** app icon (wider joint gap), as in `04-web-icons/favicon.*`

## Colours
Deep Green `#0E2F2C` · Lime `#C6F432` · Paper `#F3F8F1` · Moss `#2E6B5E` · Stone `#6E7F7A`.
Proof Lime in print before production (match a Pantone swatch with your printer).

## Regenerating
```bash
python3 00-masters/build_logo.py 00-masters                         # geometry → master SVGs
python3 00-masters/make_variants.py                                 # colourways
python3 00-masters/make_web_icons.py <path-to>/render_png.py        # favicons, app + PWA icons
python3 00-masters/make_rasters.py <path-to>/render_png.py          # PNG + JPG (needs Chrome)
```
`render_png.py` is the logo-design skill's renderer.

## Open items
- Professional trademark search for the dovetail symbol (not done).
- Printify also uses green; compare side by side before launch.
