import type { Metadata } from "next";
import { Check, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";

export const metadata: Metadata = { title: "Integrations" };

// Marketplace marks are not used without permission (assets.md) — text tiles instead.
const CHANNELS = [
  { name: "TikTok Shop", initials: "TT", status: "onboarding", body: "Connect your shop. Orders for mapped SKUs are imported automatically and routed to production." },
  { name: "Shopee", initials: "SP", status: "onboarding", body: "Link your Shopee shop — or several. We match orders to your SKU codes and sync tracking numbers back." },
  { name: "Shopify", initials: "SH", status: "later", body: "A Shopify app that publishes products and receives orders is on the roadmap." },
] as const;

export default function IntegrationsPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-display">Sell where your buyers are</h1>
      <p className="mt-2 max-w-2xl text-muted-foreground">
        We are onboarding TikTok Shop and Shopee shops now — connect as many as you run, even several on one marketplace. During onboarding our team sets up the connection with you and
        imports orders on your behalf.
      </p>
      <div className="mt-10 grid gap-6 md:grid-cols-3">
        {CHANNELS.map((c) => (
          <div key={c.name} className="flex flex-col gap-4 rounded-[var(--radius-card)] border border-border bg-surface p-6">
            <div className="flex items-center justify-between">
              <span className="flex size-11 items-center justify-center rounded-xl bg-surface-muted font-semibold">{c.initials}</span>
              {c.status === "onboarding" ? (
                <Badge tone="primary"><Check aria-hidden /> Onboarding</Badge>
              ) : (
                <Badge><Clock aria-hidden /> Coming later</Badge>
              )}
            </div>
            <h2 className="text-lg font-bold">{c.name}</h2>
            <p className="flex-1 text-sm text-muted-foreground">{c.body}</p>
            {c.status === "onboarding" ? (
              <ButtonLink href="/start" variant="secondary">Request access</ButtonLink>
            ) : (
              <ButtonLink href="/start" variant="ghost">Join the waitlist</ButtonLink>
            )}
          </div>
        ))}
      </div>
      <div className="mt-12 rounded-[var(--radius-card)] border border-border bg-surface p-6 text-sm text-muted-foreground">
        <h2 className="mb-2 text-base font-bold text-foreground">How order sync works</h2>
        Every listing carries a SKU code you create in your dashboard. When an order arrives, we look up that code, attach
        the exact approved design version, check your wallet balance, and queue the order for review. Orders with unknown SKU
        codes are held so nothing prints by mistake.
      </div>
    </div>
  );
}
