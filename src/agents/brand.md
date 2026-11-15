# Brand — printexo

The source of truth is the brand kit in `public/brand/` (v3, November 2026). Read the full guidelines in `public/brand/06-guidelines/printexo-brand-guidelines.html` (or `.pdf`). This document summarises them and explains how the product applies them. It complements `design.md` (interface patterns) and `content.md` (what we say).

---

## 1. Name & tagline

- **Name:** `printexo`, **always lowercase**, even at the start of a sentence or in a title. Never "Printexo" or "PRINTEXO".
- **Tagline:** *Print it. Ship it. Own it.*
- **In code:** `BRAND_NAME` and `BRAND_TAGLINE` in `src/components/brand/logo.tsx`. Never hard-code the name.
- **Exception:** the browser-tab title is capitalised ("Printexo" on the homepage, "Pricing · Printexo" elsewhere), set in `src/app/layout.tsx`.

## 2. Personality & voice

**Bold · fast · confident · crafted.** The brief: *print-on-demand for online shops. Upload a design, list it, and printexo prints and ships.*

| Do | Don't |
|---|---|
| Short, active sentences ("We print and ship every order.") | Corporate filler ("leveraging end-to-end fulfillment solutions") |
| Concrete numbers (2–5 days, 0 inventory, 30% margin) | Vague promises ("best quality", "lightning fast") |
| Sentence case for headings and buttons | Title Case Everywhere or ALL CAPS paragraphs |
| Talk to the shop owner as "you" | Jargon the user has to decode |

Terminology follows `business.md`: **user** (the account), **shop** (a storefront on a marketplace), **buyer** (the marketplace shopper).

## 3. Logo

**exo means connecting.** The symbol is a **dovetail**: two halves of a square locked by a tail that flares at the brand's one angle, **the blade**, a single **30° cut** like a cutter trimming a fresh print. The same blade cuts the wordmark's stem tops, the i-dot, the p descender and the slice through the x. In the two-tone **duo** colourway the tail half is Lime.

v3 (November 2026) replaced v2's trimmed-"p" icon with the dovetail and made symbol + wordmark the main logo. The wordmark lettering is unchanged.

| Asset | Use | Files |
|---|---|---|
| **Horizontal lockup** (symbol + wordmark) | Default wherever there is room: header, footer, sidebar, emails, signage | `01-main-logo/` |
| **Stacked lockup** (symbol above wordmark) | Square or tall spaces: stickers, labels, posters, packaging sides | `02-secondary-logo/` |
| **Symbol / app icon** (the dovetail) | Where the lockup is too small: app icon, avatar, hang tags, embroidery | `03-icon/` |
| **Small cut app icon** (wider joint gap) | **Below 32 px**: favicons, tiny UI | `04-web-icons/favicon.*` |
| **Wordmark alone** (horizontal or stacked print / exo) | Where the symbol already appears nearby | `08-wordmark/` |

**Colourways** (each logo comes in all of them):

| Colourway | Background |
|---|---|
| `deepgreen` (primary) | Paper or white |
| `white` (reversed) | Deep Green or photos |
| `on-lime` (highlight) | Lime: Deep Green logo |
| `signature-lime-on-deepgreen` / `lime` (**signature**, one colour) | Deep Green only |
| `duo` / `duo-on-deepgreen` (Lime tail + white) | Deep Green only |
| `black` | One-colour print only |

**Clear space:** at least the height of the letter "o" (the x-height) on every side. The `on-…` files already include it.

**Minimum size:**

| | Screen | Print |
|---|---|---|
| Horizontal lockup | 120 px wide | 28 mm |
| Stacked lockup | 56 px wide | 16 mm |
| Wordmark alone | 80 px wide | 20 mm |
| Symbol / app icon | 32 px | 8 mm |
| Small cut app icon | 16 px | 5 mm |

**Don'ts:** don't retype the logo in a font (the sliced x only exists in the artwork), don't capitalise it, stretch, squash or rotate it, don't rotate or flip the symbol, don't rebuild the lockup from separate pieces, don't change the blade angle, no shadows, glows or effects, no off-palette colours, no busy backgrounds, and **no Lime or duo logo on white or Paper**.

**File formats:** SVG for web and print (master), PNG for apps that reject SVG (Canva, Office, social), JPG for email and documents (always has a background).

## 4. Colour

| Name | HEX | RGB | CMYK | Role |
|---|---|---|---|---|
| **Deep Green** | `#0E2F2C` | 14 47 44 | 70 0 6 82 | Primary: text, logo, primary buttons, feature sections |
| **Lime** | `#C6F432` | 198 244 50 | 19 0 80 4 | Electric accent: highlights, CTAs on dark, stickers, signature logo |
| **Paper** | `#F3F8F1` | 243 248 241 | 2 0 3 3 | Backgrounds |
| **Moss** | `#2E6B5E` | 46 107 94 | 57 0 12 58 | Secondary: links, icons, focus ring |
| **Stone** | `#6E7F7A` | 110 127 122 | 13 0 4 50 | Captions, **large text only** |

**Ratio — 60:30:10** (the product's rule; it refines the kit's "60% Paper/white · 30% Deep Green · 10% Lime"):

| Share | Colour | Where |
|---|---|---|
| **60%** | White | page background, cards, tables, forms |
| **30%** | Light green: Paper `#F3F8F1` (`tint`) and `#E7EDE5` (`surface-muted`) | section bands, hero art panel, sidebar, footer, image wells, studio canvas |
| **10%** | Brand/accent: Deep Green + Lime | primary buttons, icons, step numbers, highlights, selected nav, **one** closing CTA band |

Body text is Deep Green but doesn't count toward the ratio.

**Contrast (WCAG):** Deep Green on Paper 13.3:1 · Deep Green on Lime 11.2:1 · Moss on Paper 5.8:1 · Stone on Paper 3.9:1 (large text only) · **Lime on Paper/white 1.2:1, never use it for text**.

**Print:** the CMYK values are digital conversions. Lime is very bright, so always run a printed proof (or match a Pantone swatch with the printer) before production.

## 5. Typography

The logo is custom lettering, not a font. Everything else uses **Archivo** (SIL Open Font License, bundled as `public/brand/05-typography/Archivo-Variable.ttf`, with weight 100–900 and width 62–125%). One family, contrasting weights.

| Role | Style | In code |
|---|---|---|
| Headlines | Archivo Black (900), Expanded width (112–125%), tracking −2%, sentence case | `font-display` utility (900 / 118% / −0.02em) |
| Subheads | Archivo Bold (700), normal width | `font-bold` |
| Body | Archivo Regular (400), 16–18 px, line height 1.5–1.6 | default `font-sans` |
| Buttons & labels | Archivo SemiBold (600), uppercase allowed | `Button` default |
| Code / SKU codes | Geist Mono (UI only, not a brand face) | `font-mono` |

Use `font-display` for page-level `h1`s and big section headlines only (`text-2xl` and up). Card titles, panel labels and dialog titles are subheads (`font-bold`).

---

## 6. How the product applies the brand

### Tokens (`src/app/globals.css`)

The raw palette is exposed as `--brand-*` and mapped to semantic tokens. Components only use the semantic ones.

| Token | Value | Why |
|---|---|---|
| `--background` | `#FFFFFF` | page canvas (60%) |
| `--tint` | Paper | light-green bands, panels, sidebar, footer (30%) |
| `--surface` | `#FFFFFF` | cards, tables, panels |
| `--surface-muted` | `#E7EDE5` | deeper light green: hovers, image wells, studio canvas (30%) |
| `--foreground` | Deep Green | all body text |
| `--muted-foreground` | `#52625C` | Stone darkened to pass AA for small text (5.2:1 on `surface-muted`); Stone itself is large-text only |
| `--border` | `#D3DED6` | hairlines |
| `--primary` / `-hover` / `-foreground` | Deep Green / `#1B4A45` / white | primary buttons, dark sections |
| `--primary-soft` | `#E9F8B8` | Lime tint: selected nav, chips, empty-state icons (Deep Green text on it 12.7:1) |
| `--accent` / `-hover` / `-foreground` | Lime / `#B5E61F` / Deep Green | `Button variant="accent"` |
| `--link`, `--ring` | Moss | links and focus outlines |
| status (`success`, `warning`, `danger`, `info`) | functional colours | **not brand colours**: they exist only for state, all ≥ 5:1 on white, and are always paired with a label or icon |

Utilities: `font-display` (headline style), `highlight-lime` (Lime highlighter behind Deep Green words), and `text-lime`, `text-moss` and `text-stone` for the raw palette.

### Rules of thumb

- **Lime on dark, never as text on light.** Lime surfaces (buttons, numbers, tagline) go on Deep Green. On light backgrounds, Lime only appears *behind* Deep Green text (`highlight-lime`, `bg-primary-soft`).
- **One Lime moment per view.** It's the 10%: a CTA, a highlight, a stat. Not decoration.
- **Primary buttons on light backgrounds are Deep Green.** `accent` (Lime) buttons are only for Deep Green areas.
- **Big Deep Green areas are rare.** Only the homepage's closing CTA band is Deep Green (with a Lime button and Lime words). The hero art panel, "How it works" band, footer and app sidebar are light green (`bg-tint`), not Deep Green.
- Build a page as white first, add light-green bands to separate sections, then spend the 10% on the actions you want clicked.
- The Design Studio's guides use Moss (print area, safe zone) on a `surface-muted` canvas, so the user's artwork stays the hero.

### Logo in code (`src/components/brand/logo.tsx`)

- `<Logo variant="lockup" | "wordmark" tone="deepgreen" | "white" | "lime" | "duo" height={…} />` renders the kit's SVG. The default is the **lockup** (symbol + wordmark). Height is clamped so the logo never drops below its minimum width: ≥ 25 px for the lockup (ratio 4.9:1, 120 px), ≥ 22 px for the wordmark (3.67:1, 80 px). The wordmark has no duo file and falls back to white.
  - Site header: lockup, `deepgreen`, 26 px · app/admin sidebar: lockup, `deepgreen`, 25 px · footer: lockup, `deepgreen` on Paper, 30 px · admin sign-in: lockup, 30 px. Use `lime` and `duo` only on Deep Green.
- `<LogoMark size={…} />` renders the dovetail app icon (Lime tail + white on Deep Green), and switches automatically to the small cut below 32 px.

### Icons & metadata

- `src/app/favicon.ico`, `src/app/icon.svg` (small cut) and `src/app/apple-icon.png` are copied from `public/brand/04-web-icons/`. Next.js serves them automatically.
- `src/app/manifest.ts` is the PWA manifest (icons 192/512/maskable, theme and background `#0E2F2C`).
- `viewport.themeColor` is `#0E2F2C` (in `src/app/layout.tsx`).

If the kit changes, re-copy those three icon files (`favicon.ico`, `favicon.svg` → `icon.svg`, `apple-touch-icon.png` → `apple-icon.png`) and keep the hex values in `globals.css` in sync with section 4.

## 7. Open items (from the kit)

- Professional trademark search for the dovetail symbol (not done).
- Printify also uses green, so compare side by side before launch.
- Print-proof Lime and pick a Pantone match.
- `public/brand/` is deployed publicly, including `00-masters/*.py` and the guidelines PDF. Move the master scripts out of `public/` if they shouldn't be downloadable.
