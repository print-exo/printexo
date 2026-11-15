import type { Metadata } from "next";
import { MIN_DPI, RECOMMENDED_DPI } from "@/lib/domain/design-validation";

export const metadata: Metadata = { title: "FAQ" };

const FAQ: { section: string; items: [string, string][] }[] = [
  {
    section: "Designs",
    items: [
      ["What file should I upload?", `PNG with a transparent background works best. JPG and WebP are accepted. Artwork should print at ${RECOMMENDED_DPI} DPI; we block anything below ${MIN_DPI} DPI at its printed size.`],
      ["Why was my design rejected?", "Common reasons are low resolution, artwork outside the print area, or copyrighted content. You'll see the reviewer's note on the design and can submit a new version."],
      ["Can I change a design after it's approved?", "Yes — editing creates a new version that goes through review again. Existing orders keep printing the version they were placed with."],
    ],
  },
  {
    section: "Production & shipping",
    items: [
      ["How long does production take?", "Most tumblers are produced in 2–5 business days after an order is approved, then handed to the courier."],
      ["Which countries do you ship to?", "Indonesia today, with Malaysia and Singapore available for selected products."],
      ["How do I track an order?", "Tracking numbers appear on the order in your dashboard and are synced back to connected marketplaces."],
    ],
  },
  {
    section: "Returns & refunds",
    items: [
      ["What if a product arrives damaged or misprinted?", "Report it within 7 days of delivery with a photo. We reprint or refund the production cost to your wallet."],
      ["What if my buyer changes their mind?", "Because each item is custom-made, change-of-mind returns are handled by your shop under its own return policy."],
      ["Can I cancel an order?", "Yes, until it is sent to production. The reserved amount is released back to your wallet immediately."],
    ],
  },
  {
    section: "Payments & copyright",
    items: [
      ["How do I pay?", "Top up your prepaid wallet by bank transfer, e-wallet or card. Order costs are reserved at approval and charged at production."],
      ["How do I get paid?", "Your buyers pay the marketplace, and the marketplace pays you. We only charge you the production cost."],
      ["Who is responsible for copyright?", "You are. Only upload artwork you own or are licensed to use. We remove designs that infringe trademarks or copyright."],
    ],
  },
];

export default function FaqPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-display">Frequently asked questions</h1>
      {FAQ.map((s) => (
        <section key={s.section} className="mt-10">
          <h2 className="mb-3 text-lg font-bold">{s.section}</h2>
          <div className="divide-y divide-border rounded-[var(--radius-card)] border border-border bg-surface">
            {s.items.map(([q, a]) => (
              <details key={q} className="group p-5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium">
                  {q}
                  <span className="text-muted-foreground transition-transform group-open:rotate-45" aria-hidden>+</span>
                </summary>
                <p className="mt-3 text-sm text-muted-foreground">{a}</p>
              </details>
            ))}
          </div>
        </section>
      ))}
      <p className="mt-10 text-sm text-muted-foreground">
        Still stuck? Email <a className="text-primary underline" href="mailto:support@example.com">support@example.com</a>.
      </p>
    </div>
  );
}
