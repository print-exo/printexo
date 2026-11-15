"use client";

import { Search } from "lucide-react";
import { useState } from "react";
import { PageHeader } from "@/components/app/app-shell";
import { AdminOrderActions } from "@/components/admin/order-actions";
import { OrderDetailPanel, shopLabel } from "@/components/app/order-detail";
import { OrderStatusBadge } from "@/components/app/status-badges";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ORDER_STATUS_LABEL } from "@/lib/domain/orders";
import type { OrderStatus } from "@/lib/domain/types";
import { useStore } from "@/lib/store";
import { formatDateTime, formatIDR } from "@/lib/utils";

export default function AdminOrdersPage() {
  const orders = useStore((s) => s.orders);
  const shops = useStore((s) => s.shops);
  const users = useStore((s) => s.users);
  const [status, setStatus] = useState<OrderStatus | "all">("all");
  const [user, setUser] = useState("all");
  const [shop, setShop] = useState("all");
  const [q, setQ] = useState("");
  const [openId, setOpenId] = useState<string>();
  const open = orders.find((o) => o.id === openId);

  const shown = orders.filter(
    (o) =>
      (status === "all" || o.status === status) &&
      (user === "all" || o.userId === user) &&
      (shop === "all" || o.shopId === shop) &&
      (!q || `${o.externalId} ${o.buyerName} ${shopLabel(shops, o.shopId)} ${o.lines.map((l) => l.skuCode).join(" ")}`.toLowerCase().includes(q.toLowerCase())),
  );

  return (
    <>
      <PageHeader title="All orders" description="Every order across users and shops, with full lifecycle controls." />
      <div className="mb-4 flex flex-wrap gap-2">
        <div className="relative min-w-56 flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
          <Input aria-label="Search orders" placeholder="Search order, buyer, shop, SKU" value={q} onChange={(e) => setQ(e.target.value)} className="pl-9" />
        </div>
        <Select value={status} onValueChange={(v) => setStatus(v as OrderStatus | "all")}>
          <SelectTrigger aria-label="Filter by status" className="w-48"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {Object.entries(ORDER_STATUS_LABEL).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={user} onValueChange={(v) => { setUser(v); setShop("all"); }}>
          <SelectTrigger aria-label="Filter by user" className="w-48"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All users</SelectItem>
            {users.map((u) => <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={shop} onValueChange={setShop}>
          <SelectTrigger aria-label="Filter by shop" className="w-56"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All shops</SelectItem>
            {shops.filter((x) => user === "all" || x.userId === user).map((x) => <SelectItem key={x.id} value={x.id}>{shopLabel(shops, x.id)}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <div className="overflow-x-auto rounded-[var(--radius-card)] border border-border bg-surface">
        <table className="w-full min-w-[820px] text-sm">
          <thead className="border-b border-border text-left text-xs text-muted-foreground">
            <tr className="[&_th]:px-4 [&_th]:py-3 [&_th]:font-medium"><th>Order</th><th>Shop</th><th>Buyer</th><th className="text-right">Charge</th><th>Status</th></tr>
          </thead>
          <tbody className="divide-y divide-border">
            {shown.map((o) => (
              <tr key={o.id} className="cursor-pointer hover:bg-surface-muted/60 [&_td]:px-4 [&_td]:py-3" onClick={() => setOpenId(o.id)}>
                <td><button className="font-medium hover:underline" onClick={(e) => { e.stopPropagation(); setOpenId(o.id); }}>{o.externalId}</button><div className="text-xs text-muted-foreground">{formatDateTime(o.createdAt)}</div></td>
                <td>{shopLabel(shops, o.shopId)}<div className="text-xs text-muted-foreground">{users.find((u) => u.id === o.userId)?.name}</div></td>
                <td>{o.buyerName}<div className="text-xs text-muted-foreground">{o.shipToCity}</div></td>
                <td className="text-right">{o.productionCharge ? formatIDR(o.productionCharge) : "—"}</td>
                <td><OrderStatusBadge status={o.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
        {shown.length === 0 && <p className="p-6 text-center text-sm text-muted-foreground">No orders match these filters.</p>}
      </div>
      <OrderDetailPanel order={open} onClose={() => setOpenId(undefined)} actions={open && <AdminOrderActions order={open} />} />
    </>
  );
}
