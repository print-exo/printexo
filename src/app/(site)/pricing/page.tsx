import type { Metadata } from "next";
import { MarginCalculator } from "./margin-calculator";
import { FULFILLMENT_FEE_PER_ORDER, EXTRA_ITEM_FULFILLMENT_FEE, MARKETPLACE_FEE_RATE } from "@/lib/domain/pricing";
import { formatIDR, formatPercent } from "@/lib/utils";

export const metadata: Metadata = { title: "Pricing" };

export default function PricingPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-display">Simple, per-order pricing</h1>
      <p className="mt-2 max-w-2xl text-muted-foreground">
        No subscription and no minimum order. You pay for production only when a buyer purchases.
      </p>

      <div className="mt-10 grid gap-8 lg:grid-cols-[1.3fr_1fr]">
        <MarginCalculator />
        <div className="space-y-4 text-sm">
          <div className="rounded-[var(--radius-card)] border border-border bg-surface p-5">
            <h2 className="mb-3 font-bold">What you pay us</h2>
            <ul className="space-y-2 text-muted-foreground">
              <li><strong className="text-foreground">Base product</strong> — the blank tumbler, priced per color.</li>
              <li><strong className="text-foreground">Print fee</strong> — per print area used.</li>
              <li><strong className="text-foreground">Fulfillment</strong> — {formatIDR(FULFILLMENT_FEE_PER_ORDER)} per order + {formatIDR(EXTRA_ITEM_FULFILLMENT_FEE)} per extra item (pick, pack, QC).</li>
              <li><strong className="text-foreground">Shipping</strong> — courier rate, only when the order requires shop-paid shipping.</li>
            </ul>
          </div>
          <div className="rounded-[var(--radius-card)] border border-border bg-surface p-5">
            <h2 className="mb-3 font-bold">Fees we estimate for you</h2>
            <p className="mb-2 text-muted-foreground">Marketplaces charge their own commission. We include an estimate so your margin is realistic:</p>
            <ul className="space-y-1">
              <li>TikTok Shop ≈ {formatPercent(MARKETPLACE_FEE_RATE.tiktok_shop)}</li>
              <li>Shopee ≈ {formatPercent(MARKETPLACE_FEE_RATE.shopee)}</li>
              <li>Shopify payments ≈ {formatPercent(MARKETPLACE_FEE_RATE.shopify)}</li>
            </ul>
          </div>
          <div className="rounded-[var(--radius-card)] border border-border bg-surface p-5">
            <h2 className="mb-2 font-bold">How payment works</h2>
            <p className="text-muted-foreground">
              Top up a prepaid wallet via bank transfer, e-wallet or card. When we approve an order, its cost is reserved; it is
              charged when the order goes to production. Cancel before production and the reservation is released in full.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
