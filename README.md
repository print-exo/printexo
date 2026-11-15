# printexo — POD platform (prototype)

> Print it. Ship it. Own it.

Print-on-demand platform for TikTok Shop / Shopee / Shopify shops, starting with custom tumblers.
Specs live in `src/agents/` (`brand`, `content`, `design`, `stack`, `assets`, and `business.md` for core rules). Brand kit: `public/brand/`.

## Run

```bash
pnpm install
pnpm dev        # http://localhost:3000
```

| Area | URL |
|---|---|
| Public site | `/`, `/catalog`, `/pricing`, `/integrations`, `/faq`, `/start` |
| User workspace | `/app` (dashboard, designs, studio, SKUs, orders, shops, wallet) |
| Admin console | `/admin` (review queue, design review, orders, users & shops, reconciliation) |

Terminology: a **user** is an account (wallet, designs); a **shop** is one marketplace storefront. A user can have many shops, including several on the same marketplace. SKUs and orders belong to a shop. See `src/agents/business.md`.

All data is mocked and persisted to `localStorage`; use **Reset demo data** in the sidebar to start over.

## Demo flow

1. `/app/studio` → add text/image → **Submit** (conversion runs ~2s).
2. `/admin/designs` → approve it.
3. `/app/products` → **New SKU** mapped to that design.
4. `/app/orders` → **Simulate incoming order**.
5. `/admin` → **Approve** (reserves wallet) → **Send to MQC** (captures) → advance to shipped.
6. `/admin/reports` → check ledger reconciliation / export the MQC CSV.

## Structure

```
src/lib/domain/   pure business rules (pricing, validation, order state machine, wallet)
src/lib/mock/     placeholder catalog + seed data
src/lib/store/    client store standing in for the backend API
src/components/   ui primitives, brand (mockups), app shell, studio (Konva)
src/app/(site)    public website   ·   src/app/app  user workspace   ·   src/app/admin  admin
```
