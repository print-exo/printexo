"use client";

import { AlertTriangle, ArrowRight, CheckCircle2, Circle, Factory, PartyPopper, ShoppingCart, TrendingUp, Wallet } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useQueryParam } from "@/lib/use-query-param";
import { PageHeader, StatCard } from "@/components/app/app-shell";
import { OrderStatusBadge } from "@/components/app/status-badges";
import { ButtonLink } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { shopLabel } from "@/components/app/order-detail";
import { HOLD_REASON_LABEL } from "@/lib/domain/orders";
import { CURRENT_USER_ID } from "@/lib/mock/seed";
import { useStore } from "@/lib/store";
import { userSummary } from "@/lib/store/selectors";
import { formatDateTime, formatIDR, formatPercent } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function Dashboard() {
  const state = useStore((s) => s);
  const shops = state.shops.filter((x) => x.userId === CURRENT_USER_ID);
  const [shopId, setShopId] = useState("all");
  const sum = useMemo(() => userSummary(state, CURRENT_USER_ID, shopId === "all" ? undefined : shopId), [state, shopId]);
  const designs = state.designs.filter((d) => d.userId === CURRENT_USER_ID);
  const versions = designs.map((d) => state.versions.find((v) => v.id === d.currentVersionId)!).filter(Boolean);
  const needsAttention = versions.filter((v) => v.status === "rejected" || v.conversion === "failed");

  const checklist = [
    { label: "Create your first design", done: designs.length > 0, href: "/app/studio" },
    { label: "Get a design approved", done: versions.some((v) => v.status === "approved"), href: "/app/designs" },
    { label: "Map a design to a SKU", done: state.skus.some((k) => k.userId === CURRENT_USER_ID), href: "/app/products" },
    { label: "Connect a shop", done: shops.some((x) => x.status === "connected"), href: "/app/shops" },
    { label: "Top up your wallet", done: sum.wallet.total > 0, href: "/app/billing" },
  ];

  return (
    <>
      <WelcomeBanner />
      <PageHeader
        title="Dashboard"
        description="Your orders, designs and balance at a glance."
        actions={
          <>
            {shops.length > 1 && (
              <Select value={shopId} onValueChange={setShopId}>
                <SelectTrigger aria-label="Filter by shop" className="w-56"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All shops ({shops.length})</SelectItem>
                  {shops.map((x) => <SelectItem key={x.id} value={x.id}>{shopLabel(shops, x.id)}</SelectItem>)}
                </SelectContent>
              </Select>
            )}
            <ButtonLink href="/app/studio">New design</ButtonLink>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total orders" value={sum.orders.length} hint={`${sum.awaitingReview.length} awaiting review`} icon={ShoppingCart} />
        <StatCard label="In production" value={sum.inProduction.length} hint="Being made at the warehouse" icon={Factory} />
        <StatCard label="Est. profit" value={formatIDR(sum.profit)} hint={`${formatPercent(sum.marginRate)} margin on ${formatIDR(sum.revenue)} sales`} icon={TrendingUp} />
        <StatCard label="Wallet available" value={formatIDR(sum.wallet.available)} hint={`${formatIDR(sum.wallet.reserved)} reserved · all shops`} icon={Wallet} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[2fr_1fr]">
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Recent orders</CardTitle>
            <Link href="/app/orders" className="text-sm text-primary hover:underline">View all</Link>
          </CardHeader>
          <CardContent className="px-0">
            <ul className="divide-y divide-border">
              {sum.orders.slice(0, 6).map((o) => (
                <li key={o.id} className="flex items-center justify-between gap-3 px-5 py-3 text-sm">
                  <div className="min-w-0">
                    <div className="font-medium">{o.buyerName} · {o.shipToCity}</div>
                    <div className="text-xs text-muted-foreground">{shopLabel(shops, o.shopId)} · {formatDateTime(o.createdAt)}</div>
                  </div>
                  <OrderStatusBadge status={o.status} />
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <div className="space-y-6">
          {(sum.onHold.length > 0 || needsAttention.length > 0) && (
            <Card className="border-warning/40">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><AlertTriangle className="size-4 text-warning" /> Needs your attention</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                {sum.onHold.map((o) => (
                  <Link key={o.id} href="/app/orders?status=on_hold" className="block rounded-lg bg-warning-soft p-3 hover:opacity-90">
                    <div className="font-medium">{o.externalId} is on hold</div>
                    <div className="text-xs">{o.holdReasons.map((r) => HOLD_REASON_LABEL[r]).join(" · ")}</div>
                  </Link>
                ))}
                {needsAttention.map((v) => (
                  <Link key={v.id} href="/app/designs" className="block rounded-lg bg-danger-soft p-3 text-danger hover:opacity-90">
                    <div className="font-medium">{designs.find((d) => d.id === v.designId)?.name}</div>
                    <div className="text-xs">{v.status === "rejected" ? `Changes requested${v.reviewNote ? `: ${v.reviewNote}` : ""}` : "Print-file conversion failed"}</div>
                  </Link>
                ))}
              </CardContent>
            </Card>
          )}
          <Card>
            <CardHeader><CardTitle>Getting started</CardTitle></CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                {checklist.map((c) => (
                  <li key={c.label}>
                    <Link href={c.href} className="flex items-center gap-2 rounded-lg p-1.5 hover:bg-surface-muted">
                      {c.done ? <CheckCircle2 className="size-4 text-success" aria-label="Done" /> : <Circle className="size-4 text-muted-foreground" aria-label="To do" />}
                      <span className={c.done ? "text-muted-foreground line-through" : ""}>{c.label}</span>
                      {!c.done && <ArrowRight className="ml-auto size-3.5 text-muted-foreground" />}
                    </Link>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}

function WelcomeBanner() {
  const [welcome] = useQueryParam("welcome");
  if (!welcome) return null;
  return (
    <div className="mb-6 flex items-center gap-3 rounded-[var(--radius-card)] bg-primary-soft p-4 text-sm text-primary">
      <PartyPopper className="size-5" /> Welcome! This is a demo workspace with sample data — start by creating a design.
    </div>
  );
}
