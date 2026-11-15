"use client";

import { AlertTriangle, X } from "lucide-react";
import { useEffect, useRef, type ReactNode } from "react";
import { OrderStatusBadge } from "./status-badges";
import { DesignThumb } from "@/components/brand/design-render";
import { HOLD_REASON_LABEL, ORDER_STATUS_LABEL } from "@/lib/domain/orders";
import type { Order, Shop } from "@/lib/domain/types";
import { findVariant, getPrintArea } from "@/lib/mock/catalog";
import { useStore } from "@/lib/store";
import { formatDateTime, formatIDR } from "@/lib/utils";

const MARKETPLACE_LABEL = { tiktok_shop: "TikTok Shop", shopee: "Shopee", shopify: "Shopify" } as const;
export { MARKETPLACE_LABEL };

/** "kopisenja.id · TikTok Shop" — shop names alone are ambiguous across marketplaces. */
export function shopLabel(shops: Shop[], shopId: string) {
  const shop = shops.find((s) => s.id === shopId);
  return shop ? `${shop.name} · ${MARKETPLACE_LABEL[shop.marketplace]}` : "Unknown shop";
}

export function OrderDetailPanel({ order, onClose, actions }: { order: Order | undefined; onClose: () => void; actions?: ReactNode }) {
  const versions = useStore((s) => s.versions);
  const skus = useStore((s) => s.skus);
  const shops = useStore((s) => s.shops);
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (order && !d.open) d.showModal();
    if (!order && d.open) d.close();
  }, [order]);

  return (
    <dialog
      ref={ref}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      aria-label="Order details"
      className="ml-auto mr-0 h-dvh max-h-dvh w-full max-w-lg border-l border-border bg-surface p-0 text-foreground backdrop:bg-black/20"
    >
      {order && (
        <div className="flex h-full flex-col">
          <div className="flex items-start justify-between border-b border-border p-5">
            <div>
              <div className="text-xs text-muted-foreground">{shopLabel(shops, order.shopId)} · {order.externalId}</div>
              <h2 className="text-lg font-bold">Order {order.id.replace("ord_", "#")}</h2>
              <div className="mt-2"><OrderStatusBadge status={order.status} /></div>
            </div>
            <button onClick={onClose} aria-label="Close" className="rounded-lg p-1.5 hover:bg-surface-muted"><X className="size-5" /></button>
          </div>

          <div className="flex-1 space-y-6 overflow-y-auto p-5 text-sm">
            {order.holdReasons.length > 0 && (
              <div role="alert" className="rounded-lg bg-warning-soft p-3 text-warning">
                <div className="flex items-center gap-2 font-medium"><AlertTriangle className="size-4" /> On hold</div>
                <ul className="mt-1 list-disc pl-6">
                  {order.holdReasons.map((r) => <li key={r}>{HOLD_REASON_LABEL[r]}</li>)}
                </ul>
              </div>
            )}

            <section>
              <h3 className="mb-2 font-medium">Items</h3>
              <ul className="space-y-3">
                {order.lines.map((line) => {
                  const version = versions.find((v) => v.id === line.designVersionId);
                  const found = line.variantId ? findVariant(line.variantId) : undefined;
                  const area = version ? getPrintArea(version.productId, version.printAreaId) : undefined;
                  const sku = skus.find((k) => k.id === line.skuId);
                  return (
                    <li key={line.id} className="flex gap-3 rounded-lg border border-border p-3">
                      <div className="w-20 shrink-0 overflow-hidden rounded border border-border bg-surface-muted">
                        {version && area ? (
                          <DesignThumb layers={version.layers} widthIn={area.widthIn} heightIn={area.heightIn} className="w-full" />
                        ) : (
                          <div className="flex aspect-square items-center justify-center text-xs text-muted-foreground">No design</div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="font-medium">{sku?.title ?? "Unmapped SKU"}</div>
                        <div className="font-mono text-xs text-muted-foreground">{line.skuCode}</div>
                        {found && <div className="text-xs text-muted-foreground">{found.product.name} · {found.variant.name}</div>}
                        {version && <div className="text-xs text-muted-foreground">Design version v{version.number} ({version.id})</div>}
                      </div>
                      <div className="text-right">
                        <div>× {line.quantity}</div>
                        <div className="text-xs text-muted-foreground">{formatIDR(line.unitRetailPrice)}</div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </section>

            <section className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="mb-1 font-medium">Ship to</h3>
                <p className="text-muted-foreground">{order.buyerName}<br />{order.shipToCity}, {order.shipToCountry}</p>
              </div>
              <div>
                <h3 className="mb-1 font-medium">Production charge</h3>
                <p className="text-muted-foreground">{order.productionCharge ? formatIDR(order.productionCharge) : "—"}</p>
                {order.trackingNumber && <p className="mt-1 font-mono text-xs">{order.trackingNumber}</p>}
              </div>
            </section>

            <section>
              <h3 className="mb-2 font-medium">Timeline</h3>
              <ol className="space-y-3 border-l border-border pl-4">
                {[...order.events].reverse().map((e, i) => (
                  <li key={i} className="relative">
                    <span className="absolute -left-[21px] top-1 size-2.5 rounded-full border-2 border-surface bg-primary" />
                    <div className="font-medium">{ORDER_STATUS_LABEL[e.status]}</div>
                    <div className="text-xs text-muted-foreground">
                      {formatDateTime(e.at)} · {e.actor}{e.note ? ` · ${e.note}` : ""}
                    </div>
                  </li>
                ))}
              </ol>
            </section>
          </div>

          {actions && <div className="flex flex-wrap justify-end gap-2 border-t border-border p-4">{actions}</div>}
        </div>
      )}
    </dialog>
  );
}
