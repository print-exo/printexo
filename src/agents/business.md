# Business Core Logic

This document explains how the platform makes money, which rules govern designs, SKUs, orders and payments, and where each rule lives in code. It complements `content.md` (what we show), `design.md` (how it looks), `stack.md` (how it's built) and `assets.md` (what media we use).

> Code references point to `src/lib/domain/*` — pure TypeScript with no UI or framework dependencies, so the same rules can move to the NestJS backend unchanged.

---

## 1. Business Model

We are a **print-on-demand (POD) fulfillment layer** between our users' online shops and our supplier (MQC).

```
Marketplace order ──▶ User's shop (TikTok Shop / Shopee / Shopify) ──marketplace pays──▶ User
                              │
                         order sync
                              ▼
        Admin reviews ──▶ Platform (us) ──print files + order──▶ Supplier (MQC) ──ships──▶ order's ship-to address
                              ▲
              User prepays production cost from wallet
```

### Terminology

| Term | Meaning | Code |
|---|---|---|
| **User** | Someone who registers an account on the platform, sets up shops, funds a wallet, creates designs and maps SKUs. Our customer. | `User`, `userId` |
| **Shop** | One storefront on one marketplace, owned by a user. A user can have **any number of shops, including several on the same marketplace** (e.g. 2 TikTok Shops, 3 Shopee shops). | `Shop`, `shopId` |
| **Admin** | Us — the platform owner and our team. Oversees all users, designs, orders and money. | `/admin`, event actor `admin` |
| **Supplier** | The production partner we send orders to: **MQC**. Produces, packs and ships. | event actor `mqc` |

> **Deprecated: "buyer".** Don't use it in docs, UI copy or new code. The marketplace shopper is not a platform actor — they're just the order's ship-to details (name + address). Refer to them as the *recipient* or *ship-to* when needed. The existing field `Order.buyerName` is legacy naming (rename to `recipientName` when convenient).

Ownership: designs and the wallet are **per user** (shared by all their shops); SKUs and orders are **per shop**.

- **The marketplace pays the user (via their shop)** for each sale. We never touch retail revenue.
- **The user pays us** a production charge per order, from a **prepaid wallet** (one per user, shared by all their shops).
- **We pay the supplier (MQC)** the base cost. Our gross margin is the gap between what we charge (base cost + print fee + fulfillment fee) and what the supplier charges us.
- Nothing is produced before the marketplace order is paid, so neither the user nor we hold inventory.

### Actors

| Actor | Does | Platform area |
|---|---|---|
| User | Connects shops, designs products, maps SKUs per shop, funds wallet, monitors orders | `/app` |
| Admin (us) | Oversees everything: reviews designs and orders, hands off to the supplier, handles exceptions, reconciles money | `/admin` |
| Designer | Prepares templates and reusable artwork (later: team roles) | Studio |
| Supplier (MQC) | Receives orders from us; produces, packs and ships; reports status and tracking | Integration (mocked) |

---

## 2. Catalog

`types.ts → Product, ProductVariant, PrintArea`

- A **Product** is a blank item (e.g. *Skinny Tumbler 20oz*) with specs, production time, weight and shipping countries.
- A **Variant** is a purchasable color/finish with its own `baseCost` and stock flag. Out-of-stock variants can't be selected for new SKUs.
- A **Print Area** defines printable size in inches, a **safe margin**, and a per-area **print fee**. Wrap products (tumblers) have one wide area; the mockup shows the front-facing half.

All catalog data in `src/lib/mock/catalog.ts` is a **placeholder** and must be replaced with verified supplier (MQC) specs before launch.

---

## 3. Pricing & Margin

`pricing.ts`

All money is **integer IDR** (no minor units).

### What the user pays us per order

```
unit production cost = variant.baseCost + Σ printFee(print areas used)
fulfillment fee      = 6.000 for the first unit + 2.000 per additional unit in the same order
shipping estimate    = 18.000 base + 9.000 per extra kg (only when the shop pays shipping)

production charge    = Σ(unit cost × qty) + fulfillment fee + shipping estimate
```

### What the shop keeps per unit

```
marketplace fee = retailPrice × rate      (TikTok Shop 8%, Shopee 9%, Shopify 3% — estimates)
profit          = retailPrice − marketplace fee − unit cost − fulfillment − (shipping if shop-paid)
margin          = profit / retailPrice
```

### Suggested retail price

We suggest a price that leaves the shop a **30% margin after marketplace fees**:

```
price = totalCost / (1 − marketplaceFeeRate − targetMargin)      → rounded up to a price ending in …900
```

Example: Skinny 20oz White → unit 60.000 + fulfillment 6.000 = 66.000 → suggested **Rp106.900** on TikTok Shop → profit ≈ Rp32.300 (30%).

The user can set any price; the UI warns when the margin is negative.

---

## 4. Designs & Versions

`types.ts → Design, DesignVersion` · `design-validation.ts`

### Immutability rule (most important rule in the system)

> **Once a design version is submitted it is never edited.** Editing creates a new version. SKUs and orders reference a **version id**, so production always prints exactly what was approved — even if the user changes the design afterwards.

### Lifecycle

```
draft ──submit──▶ submitted ──admin approves──▶ approved
  ▲                   │
  │                   └──admin requests changes (note required)──▶ rejected
  └──────────── editing any non-draft version creates a new draft version
```

- **Drafts** are edited in place and can't be mapped to SKUs.
- **Submitting** locks the version and starts **print-file conversion**.
- Admins can only **approve** once conversion is `ready`.
- **Rejections** must include a note shown to the user.

### Print-file conversion

```
not_started ──submit──▶ processing ──▶ ready   (PNG + TIFF stored)
                             └────────▶ failed  (error shown; admin/user can retry)
```

In production this is a BullMQ job running `sharp` that renders the layers at 300 DPI and writes PNG and TIFF to private object storage. The prototype simulates it (`store/index.ts → runConversion`). Failed conversions appear as alerts in the admin queue.

### Artwork validation (Studio + admin automated checks)

| Check | Level | Rule |
|---|---|---|
| Empty design | error | at least one layer |
| Empty text | error | text layers need content |
| Resolution | error | effective DPI < **150** at printed size |
| Resolution | warning | effective DPI < **300** |
| Print area | error | any part of a layer (rotation included) outside the area — it would be cut |
| Safe zone | warning | layer crosses the safe margin — it may be trimmed at the seam |
| Upload | blocked | only PNG/JPG/WebP/SVG, max 50 MB |

`effective DPI = min(sourceWidthPx / printedWidthIn, sourceHeightPx / printedHeightIn)`

Errors block submission; warnings don't.

---

## 5. SKUs (Design ↔ Product Mapping)

`types.ts → Sku`

A **SKU** = one **shop** + one **variant** + one **design version** + retail price, identified by a **SKU code** the user puts on that shop's listing. The shop determines the marketplace (and therefore the fee used for margin).

Rules:
- The SKU code is **unique per shop** (uppercase letters, digits, dashes). The same code may be reused in another shop; selling one design in two shops means two SKUs.
- SKUs can be created for a shop that is still pending, so listings are ready when it goes live.
- Only **submitted or approved** versions can be mapped. Mapping a version that is still in review is allowed so users can list early, but its orders are **held** until approval.
- The variant must belong to the design's product.
- Deactivated SKUs stop matching new orders.
- Changing the artwork means **creating a new SKU or remapping**; existing orders keep their snapshot.

---

## 6. Orders

`orders.ts`

### Import & resolution

When an order arrives (webhook / sync; mocked by "Simulate incoming order"):
1. The order arrives for a specific **shop**. Each line's `skuCode` is matched to an **active** SKU **of that shop**.
2. The SKU's `designVersionId` and `variantId` are **snapshotted onto the order line**.
3. The **production charge** is computed (section 3).
4. **Automatic checks** run (below).

### Automatic checks → hold reasons

| Hold reason | Trigger |
|---|---|
| `unmapped_sku` | SKU code unknown or inactive |
| `design_not_approved` | snapshotted version isn't approved |
| `print_file_missing` | version approved but conversion not `ready` |
| `insufficient_balance` | production charge > wallet **available** balance |
| `address_issue` | reserved for address validation (later) |

No reasons → `pending_review`; any reason → `on_hold`. Held orders are **re-checked automatically** whenever something could unblock them: SKU created, design approved, conversion finished, or wallet topped up.

### State machine

```
received ─┬─▶ pending_review ──approve──▶ approved ──send to supplier──▶ sent_to_production ──▶ in_production ──▶ shipped ──▶ delivered
          └─▶ on_hold ◀──────────┴──────────────────┘                                                         │            │
                 │                                                                                             └──▶ returned ◀┘
received / on_hold / pending_review / approved ──▶ cancelled
```

Allowed transitions are listed in `ORDER_TRANSITIONS`; every other move is rejected.

Key rules:
- **Every order is reviewed by an admin before production** (MVP). Auto-approval for trusted users can come later.
- **Cancellation is only possible before `sent_to_production`.** After handoff the item is being made, so it can't be cancelled for a refund.
- Each transition appends an **event** (time, status, actor: system / user / admin / mqc (supplier), note) — this is the audit trail.
- Tracking numbers are recorded at `shipped` and synced back to the marketplace (later).

---

## 7. Wallet & Payments

`wallet.ts`

Users **prepay** via Midtrans/Xendit (Indonesia) or Stripe (international, later). Balances are **always derived from an append-only ledger**, never stored as a mutable number.

### Ledger entry types

| Type | When | Available | Reserved |
|---|---|---|---|
| `top_up` | user adds funds | + | |
| `reserve` | admin **approves** an order | − | + |
| `release` | approved order is **cancelled** or **put on hold** | + | − |
| `capture` | order **sent to production** — becomes our revenue | | − |
| `refund` | misprint/damage after production (reprint or refund) | + | |
| `adjustment` | manual correction by finance (audited) | ± | |

```
available = what the user can spend on new orders
reserved  = held for approved orders not yet in production
```

Rules:
- An order **can't be approved** if its charge exceeds the available balance.
- **Reserve at approval, capture at handoff.** That's why cancelling before production costs the user nothing.
- After capture, money only comes back through an explicit `refund` (for example a production defect reported within 7 days of delivery).

### Reconciliation

`/admin/reports` checks every order against its ledger:

| Order status | Expected |
|---|---|
| `approved` | reserved = charge, captured = 0 |
| `sent_to_production` … `delivered`, `returned` | reserved = 0, captured = charge |
| anything else | reserved = 0, captured = 0 |

Any mismatch is flagged. The same page exports the **supplier (MQC) handoff batch** (CSV with SKU, variant, quantity, design version, print-file URLs, address) for the file/SFTP fallback when no supplier API is available.

---

## 8. Returns, Refunds & Responsibility

- **Misprint / damage:** report within 7 days with a photo → reprint, or `refund` of the production cost to the wallet.
- **Change of mind:** handled by the shop under its own return policy, because every item is custom-made.
- **Copyright:** the user confirms at signup and upload that they own or license the artwork. Admins reject infringing designs, and repeated infringement leads to account suspension.

---

## 9. Security & Tenancy Rules (business-level)

- Every query is **scoped by `userId`** (and by `shopId` where relevant). A user can never see another user's shops, designs, SKUs, orders or ledger.
- Uploaded artwork and print files are **private** and served through signed URLs.
- Design approval, order transitions and money movements are **audited** (actor + time + note).
- Marketplace credentials and payment data are stored encrypted.

---

## 10. Prototype vs Production

| Concern | Prototype (now) | Production |
|---|---|---|
| Data | `src/lib/mock/*` seed + `localStorage` store | PostgreSQL via API |
| Business rules | `src/lib/domain/*` | same files, imported by NestJS |
| Store actions | `src/lib/store/index.ts` | REST/RPC endpoints (one per action) |
| Conversion | `setTimeout` mock, client PNG export | BullMQ + sharp worker → S3 |
| Marketplace sync | "Simulate incoming order" | TikTok Shop / Shopee webhooks |
| Supplier handoff | Button + CSV export | MQC API or SFTP |
| Payments | Instant mock top-up | Midtrans / Xendit callbacks |
| Auth | Fixed demo user | User auth + admin team roles |

---

## 11. Open Questions (to confirm with the business)

1. Real MQC base costs, print fees, print-area sizes and production SLAs.
2. Should trusted users' orders be **auto-approved** after N clean orders?
3. Who pays shipping by default per marketplace, and do we quote real courier rates?
4. Is there a minimum top-up, and are top-ups refundable as cash?
5. Defect claim window and evidence requirements (7 days assumed).
6. Plan tiers (`starter` / `growth`): do they change fees, limits or priority?
7. Multi-country: currency, tax (PPN) and invoicing requirements.
