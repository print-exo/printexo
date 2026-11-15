"use client";

import { Inbox, Zap } from "lucide-react";
import { useState } from "react";
import { PageHeader } from "@/components/app/app-shell";
import { ConfirmDialog } from "@/components/app/confirm";
import { MARKETPLACE_LABEL, OrderDetailPanel, shopLabel } from "@/components/app/order-detail";
import { OrderStatusBadge } from "@/components/app/status-badges";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { HOLD_REASON_LABEL, isCancellable } from "@/lib/domain/orders";
import type { OrderStatus } from "@/lib/domain/types";
import { CURRENT_USER_ID } from "@/lib/mock/seed";
import { simulateIncomingOrder, transitionOrder, useStore } from "@/lib/store";
import { useQueryParam } from "@/lib/use-query-param";
import { cn, formatDateTime, formatIDR } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const FILTERS: { id: "all" | OrderStatus | "active"; label: string }[] = [
  { id: "all", label: "All" },
  { id: "on_hold", label: "On hold" },
  { id: "pending_review", label: "In review" },
  { id: "active", label: "In production" },
  { id: "shipped", label: "Shipped" },
  { id: "cancelled", label: "Cancelled" },
];

export default function OrdersPage() {
  const orders = useStore((s) => s.orders).filter((o) => o.userId === CURRENT_USER_ID);
  const shops = useStore((s) => s.shops).filter((x) => x.userId === CURRENT_USER_ID);
  const connected = shops.filter((x) => x.status === "connected");
  const [shopId, setShopId] = useState("all");
  const [initial] = useQueryParam("status");
  const [chosen, setFilter] = useState<(typeof FILTERS)[number]["id"]>();
  const filter = chosen ?? (FILTERS.find((f) => f.id === initial)?.id ?? "all");
  const [openId, setOpenId] = useState<string>();
  const [cancelId, setCancelId] = useState<string>();
  const open = orders.find((o) => o.id === openId);

  const shown = orders.filter(
    (o) =>
      (shopId === "all" || o.shopId === shopId) &&
      (filter === "all" ? true : filter === "active" ? ["approved", "sent_to_production", "in_production"].includes(o.status) : o.status === filter),
  );

  return (
    <>
      <PageHeader
        title="Orders"
        description="Orders imported from all your connected shops. Orders are reviewed by our team before production."
        actions={
          <Button
            variant="secondary"
            disabled={connected.length === 0}
            title={connected.length === 0 ? "Connect a shop first" : undefined}
            onClick={() => setOpenId(simulateIncomingOrder(CURRENT_USER_ID, shopId === "all" ? undefined : shopId))}
          >
            <Zap /> Simulate incoming order
          </Button>
        }
      />
      <div className="mb-4 flex flex-wrap items-center gap-2">
      <div role="tablist" aria-label="Filter orders" className="flex flex-1 gap-1 overflow-x-auto">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            role="tab"
            aria-selected={filter === f.id}
            onClick={() => setFilter(f.id)}
            className={cn("whitespace-nowrap rounded-full px-3 py-1.5 text-sm", filter === f.id ? "bg-foreground text-background" : "text-muted-foreground hover:bg-surface-muted")}
          >
            {f.label}
          </button>
        ))}
      </div>
      {shops.length > 1 && (
        <Select value={shopId} onValueChange={setShopId}>
          <SelectTrigger aria-label="Filter by shop" className="w-56"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All shops</SelectItem>
            {shops.map((x) => <SelectItem key={x.id} value={x.id}>{shopLabel(shops, x.id)}</SelectItem>)}
          </SelectContent>
        </Select>
      )}
      </div>

      {shown.length === 0 ? (
        <EmptyState icon={Inbox} title="No orders here">Orders appear automatically when buyers purchase a mapped SKU in one of your shops.</EmptyState>
      ) : (
        <div className="overflow-x-auto rounded-[var(--radius-card)] border border-border bg-surface">
          <table className="w-full min-w-[820px] text-sm">
            <thead className="border-b border-border text-left text-xs text-muted-foreground">
              <tr className="[&_th]:px-4 [&_th]:py-3 [&_th]:font-medium"><th>Order</th><th>Shop</th><th>Buyer</th><th>Items</th><th className="text-right">Production cost</th><th>Status</th></tr>
            </thead>
            <tbody className="divide-y divide-border">
              {shown.map((o) => (
                <tr key={o.id} className="cursor-pointer hover:bg-surface-muted/60 [&_td]:px-4 [&_td]:py-3" onClick={() => setOpenId(o.id)}>
                  <td>
                    <button className="text-left font-medium hover:underline" onClick={(e) => { e.stopPropagation(); setOpenId(o.id); }}>{o.externalId}</button>
                    <div className="text-xs text-muted-foreground">{formatDateTime(o.createdAt)}</div>
                  </td>
                  <td>{shops.find((x) => x.id === o.shopId)?.name}<div className="text-xs text-muted-foreground">{MARKETPLACE_LABEL[o.marketplace]}</div></td>
                  <td>{o.buyerName}<div className="text-xs text-muted-foreground">{o.shipToCity}</div></td>
                  <td>{o.lines.reduce((n, l) => n + l.quantity, 0)} × <span className="font-mono text-xs">{o.lines[0]?.skuCode}</span></td>
                  <td className="text-right">{o.productionCharge ? formatIDR(o.productionCharge) : "—"}</td>
                  <td>
                    <OrderStatusBadge status={o.status} />
                    {o.holdReasons.length > 0 && <div className="mt-1 text-xs text-warning">{HOLD_REASON_LABEL[o.holdReasons[0]]}</div>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <OrderDetailPanel
        order={open}
        onClose={() => setOpenId(undefined)}
        actions={open && isCancellable(open.status) ? <Button variant="danger" onClick={() => setCancelId(open.id)}>Cancel order</Button> : undefined}
      />
      <ConfirmDialog
        open={!!cancelId}
        title="Cancel this order?"
        tone="danger"
        confirmLabel="Cancel order"
        onCancel={() => setCancelId(undefined)}
        onConfirm={() => { transitionOrder(cancelId!, "cancelled", "user", "Cancelled by user"); setCancelId(undefined); }}
      >
        It hasn’t gone to production yet, so any reserved amount is released back to your wallet. Remember to cancel it on the marketplace too.
      </ConfirmDialog>
    </>
  );
}
