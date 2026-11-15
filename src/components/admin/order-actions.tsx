"use client";

import { useState } from "react";
import { ConfirmDialog } from "@/components/app/confirm";
import { Button } from "@/components/ui/button";
import { canTransition } from "@/lib/domain/orders";
import type { Order, OrderStatus } from "@/lib/domain/types";
import { recheckHeldOrders, transitionOrder } from "@/lib/store";
import { formatIDR } from "@/lib/utils";

type Action = { to: OrderStatus; label: string; variant?: "primary" | "secondary" | "danger"; actor?: Order["events"][number]["actor"]; confirm?: string };

const ACTIONS: Action[] = [
  { to: "approved", label: "Approve", confirm: "approve" },
  { to: "sent_to_production", label: "Send to MQC", confirm: "handoff" },
  { to: "in_production", label: "Mark in production", variant: "secondary", actor: "mqc" },
  { to: "shipped", label: "Mark shipped", variant: "secondary", actor: "mqc" },
  { to: "delivered", label: "Mark delivered", variant: "secondary", actor: "system" },
  { to: "on_hold", label: "Put on hold", variant: "secondary" },
  { to: "returned", label: "Record return", variant: "secondary" },
  { to: "cancelled", label: "Cancel", variant: "danger", confirm: "cancel" },
];

export function AdminOrderActions({ order, compact }: { order: Order; compact?: boolean }) {
  const [pending, setPending] = useState<Action>();
  const [error, setError] = useState<string>();
  const available = ACTIONS.filter((a) => canTransition(order.status, a.to) && !(a.to === "pending_review"));
  const shown = compact ? available.filter((a) => a.to === "approved" || a.to === "sent_to_production") : available;

  function run(a: Action) {
    try {
      transitionOrder(order.id, a.to, a.actor ?? "admin");
      setError(undefined);
    } catch (e) {
      setError((e as Error).message);
    }
    setPending(undefined);
  }

  return (
    <>
      {order.status === "on_hold" && !compact && (
        <Button size="sm" variant="secondary" onClick={recheckHeldOrders}>Re-run checks</Button>
      )}
      {shown.map((a) => (
        <Button key={a.to} size="sm" variant={a.variant ?? "primary"} onClick={() => (a.confirm ? setPending(a) : run(a))}>
          {a.label}
        </Button>
      ))}
      {error && <p role="alert" className="w-full text-right text-xs text-danger">{error}</p>}
      <ConfirmDialog
        open={!!pending}
        title={pending?.confirm === "approve" ? "Approve order?" : pending?.confirm === "handoff" ? "Send to production?" : "Cancel order?"}
        tone={pending?.confirm === "cancel" ? "danger" : "primary"}
        confirmLabel={pending?.label}
        onCancel={() => setPending(undefined)}
        onConfirm={() => pending && run(pending)}
      >
        {pending?.confirm === "approve" && <>{formatIDR(order.productionCharge)} will be reserved from the user’s wallet. Confirm the design and SKU mapping are correct.</>}
        {pending?.confirm === "handoff" && <>The order and its print files are sent to MQC. The reserved {formatIDR(order.productionCharge)} is charged and the order can no longer be cancelled.</>}
        {pending?.confirm === "cancel" && <>{order.status === "approved" ? `The reserved ${formatIDR(order.productionCharge)} is released back to the user’s wallet.` : "No charge has been made for this order."}</>}
      </ConfirmDialog>
    </>
  );
}
