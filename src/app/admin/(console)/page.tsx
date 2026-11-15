"use client";

import { AlertTriangle, ClipboardCheck, Factory, PauseCircle, RefreshCw } from "lucide-react";
import { useState } from "react";
import { PageHeader, StatCard } from "@/components/app/app-shell";
import { AdminOrderActions } from "@/components/admin/order-actions";
import { OrderDetailPanel, shopLabel } from "@/components/app/order-detail";
import { OrderStatusBadge } from "@/components/app/status-badges";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HOLD_REASON_LABEL } from "@/lib/domain/orders";
import type { Order } from "@/lib/domain/types";
import { retryConversion, useStore } from "@/lib/store";
import { formatDateTime, formatIDR } from "@/lib/utils";

export default function ReviewQueue() {
  const state = useStore((s) => s);
  const [openId, setOpenId] = useState<string>();
  const open = state.orders.find((o) => o.id === openId);

  const review = state.orders.filter((o) => o.status === "pending_review");
  const handoff = state.orders.filter((o) => o.status === "approved");
  const held = state.orders.filter((o) => o.status === "on_hold");
  const failed = state.versions.filter((v) => v.conversion === "failed");

  return (
    <>
      <PageHeader title="Review queue" description="Approve orders, hand them off to production, and clear exceptions." />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Awaiting review" value={review.length} icon={ClipboardCheck} />
        <StatCard label="Ready for MQC" value={handoff.length} icon={Factory} />
        <StatCard label="On hold" value={held.length} icon={PauseCircle} />
        <StatCard label="Failed conversions" value={failed.length} icon={AlertTriangle} />
      </div>

      {failed.length > 0 && (
        <div role="alert" className="mt-6 space-y-2 rounded-[var(--radius-card)] border border-danger/30 bg-danger-soft p-4 text-sm text-danger">
          <div className="flex items-center gap-2 font-medium"><AlertTriangle className="size-4" /> Print-file conversion failures</div>
          {failed.map((v) => (
            <div key={v.id} className="flex flex-wrap items-center justify-between gap-2">
              <span>{state.designs.find((d) => d.id === v.designId)?.name} v{v.number} — {v.conversionError}</span>
              <Button size="sm" variant="secondary" onClick={() => retryConversion(v.id)}><RefreshCw /> Retry</Button>
            </div>
          ))}
        </div>
      )}

      <div className="mt-6 space-y-6">
        <Queue title="New orders — review" orders={review} onOpen={setOpenId} empty="Nothing to review." />
        <Queue title="Approved — send to MQC" orders={handoff} onOpen={setOpenId} empty="No orders waiting for handoff." />
        <Queue title="Exceptions — on hold" orders={held} onOpen={setOpenId} empty="No held orders." showReasons />
      </div>

      <OrderDetailPanel order={open} onClose={() => setOpenId(undefined)} actions={open && <AdminOrderActions order={open} />} />
    </>
  );
}

function Queue({ title, orders, onOpen, empty, showReasons }: { title: string; orders: Order[]; onOpen: (id: string) => void; empty: string; showReasons?: boolean }) {
  const shops = useStore((s) => s.shops);
  const users = useStore((s) => s.users);
  return (
    <Card>
      <CardHeader><CardTitle>{title} <span className="font-normal text-muted-foreground">({orders.length})</span></CardTitle></CardHeader>
      <CardContent className="px-0">
        {orders.length === 0 ? (
          <p className="px-5 text-sm text-muted-foreground">{empty}</p>
        ) : (
          <ul className="divide-y divide-border">
            {orders.map((o) => (
              <li key={o.id} className="flex flex-wrap items-center gap-3 px-5 py-3 text-sm">
                <button onClick={() => onOpen(o.id)} className="min-w-0 flex-1 text-left">
                  <div className="font-medium hover:underline">{o.externalId} · {users.find((u) => u.id === o.userId)?.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {shopLabel(shops, o.shopId)} · {formatDateTime(o.createdAt)} · {o.lines.reduce((n, l) => n + l.quantity, 0)} item(s) · {o.productionCharge ? formatIDR(o.productionCharge) : "—"}
                  </div>
                  {showReasons && <div className="mt-1 text-xs text-warning">{o.holdReasons.map((r) => HOLD_REASON_LABEL[r]).join(" · ") || "Held manually"}</div>}
                </button>
                <OrderStatusBadge status={o.status} />
                <div className="flex gap-2"><AdminOrderActions order={o} compact /></div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
