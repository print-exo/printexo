"use client";

import { CheckCircle2, Clock, Plus, Store, Trash2, Unplug, XCircle } from "lucide-react";
import { useState } from "react";
import { PageHeader } from "@/components/app/app-shell";
import { MARKETPLACE_LABEL } from "@/components/app/order-detail";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { FieldError, Input, Label } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Marketplace, Shop } from "@/lib/domain/types";
import { CURRENT_USER_ID } from "@/lib/mock/seed";
import { addShop, removeShop, useStore } from "@/lib/store";
import { formatDateTime } from "@/lib/utils";

const STATUS: Record<Shop["status"], React.ReactNode> = {
  connected: <Badge tone="success"><CheckCircle2 aria-hidden /> Connected</Badge>,
  pending: <Badge tone="info"><Clock aria-hidden /> Onboarding in progress</Badge>,
  error: <Badge tone="danger"><XCircle aria-hidden /> Connection error</Badge>,
  disconnected: <Badge><Unplug aria-hidden /> Disconnected</Badge>,
};

/** Shopify is listed so users see it's planned, but can't be added yet. */
const ADDABLE: Marketplace[] = ["tiktok_shop", "shopee"];
const ORDER: Marketplace[] = ["tiktok_shop", "shopee", "shopify"];

export default function ShopsPage() {
  const state = useStore((s) => s);
  const shops = state.shops.filter((x) => x.userId === CURRENT_USER_ID);
  const [showForm, setShowForm] = useState(false);

  return (
    <>
      <PageHeader
        title="Shops"
        description="Connect as many shops as you run — including several on the same marketplace. Our team finishes each connection during onboarding."
        actions={<Button onClick={() => setShowForm((v) => !v)}><Plus /> Add shop</Button>}
      />
      {showForm && <AddShopForm onDone={() => setShowForm(false)} />}

      {shops.length === 0 ? (
        <EmptyState icon={Store} title="No shops yet" action={<Button onClick={() => setShowForm(true)}><Plus /> Add your first shop</Button>}>
          Add your TikTok Shop or Shopee shop so we can import its orders.
        </EmptyState>
      ) : (
        <div className="space-y-8">
          {ORDER.map((mp) => {
            const group = shops.filter((x) => x.marketplace === mp);
            if (group.length === 0) return null;
            return (
              <section key={mp}>
                <h2 className="mb-3 text-sm font-medium text-muted-foreground">
                  {MARKETPLACE_LABEL[mp]} <span className="font-normal">({group.length})</span>
                </h2>
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {group.map((shop) => (
                    <ShopCard
                      key={shop.id}
                      shop={shop}
                      orders={state.orders.filter((o) => o.shopId === shop.id).length}
                      skus={state.skus.filter((k) => k.shopId === shop.id).length}
                    />
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </>
  );
}

function ShopCard({ shop, orders, skus }: { shop: Shop; orders: number; skus: number }) {
  const [error, setError] = useState<string>();
  return (
    <div className="flex flex-col gap-3 rounded-[var(--radius-card)] border border-border bg-surface p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate font-semibold">{shop.name}</h3>
          <p className="text-xs text-muted-foreground">{MARKETPLACE_LABEL[shop.marketplace]}</p>
        </div>
        {STATUS[shop.status]}
      </div>
      <dl className="grid grid-cols-2 gap-2 text-sm">
        <div><dt className="text-xs text-muted-foreground">SKUs</dt><dd>{skus}</dd></div>
        <div><dt className="text-xs text-muted-foreground">Orders</dt><dd>{orders}</dd></div>
      </dl>
      {shop.status === "pending" && (
        <p className="text-sm text-muted-foreground">Our team will contact you on WhatsApp to finish connecting this shop.</p>
      )}
      {shop.lastSyncAt && <p className="text-xs text-muted-foreground">Last sync {formatDateTime(shop.lastSyncAt)}</p>}
      {orders === 0 && shop.status !== "connected" && (
        <Button
          variant="ghost"
          size="sm"
          className="self-start"
          onClick={() => {
            try {
              removeShop(shop.id);
            } catch (e) {
              setError((e as Error).message);
            }
          }}
        >
          <Trash2 /> Remove
        </Button>
      )}
      {error && <p role="alert" className="text-sm text-danger">{error}</p>}
    </div>
  );
}

function AddShopForm({ onDone }: { onDone: () => void }) {
  const [marketplace, setMarketplace] = useState<Marketplace>("tiktok_shop");
  const [name, setName] = useState("");
  const [error, setError] = useState<string>();

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Add a shop</CardTitle>
        <CardDescription>Running more than one shop on the same marketplace? Add each one separately.</CardDescription>
      </CardHeader>
      <CardContent>
        <form
          noValidate
          className="grid gap-4 md:grid-cols-[200px_1fr_auto] md:items-end"
          onSubmit={(e) => {
            e.preventDefault();
            try {
              addShop(CURRENT_USER_ID, marketplace, name);
              onDone();
            } catch (err) {
              setError((err as Error).message);
            }
          }}
        >
          <div className="space-y-1.5">
            <Label htmlFor="shop-mp">Marketplace</Label>
            <Select value={marketplace} onValueChange={(v) => setMarketplace(v as Marketplace)}>
              <SelectTrigger id="shop-mp"><SelectValue /></SelectTrigger>
              <SelectContent>
                {ORDER.map((mp) => (
                  <SelectItem key={mp} value={mp} disabled={!ADDABLE.includes(mp)}>
                    {MARKETPLACE_LABEL[mp]}{ADDABLE.includes(mp) ? "" : " (coming later)"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="shop-name">Shop name or URL</Label>
            <Input id="shop-name" value={name} onChange={(e) => { setName(e.target.value); setError(undefined); }} placeholder="yourshop" aria-invalid={!!error} />
          </div>
          <div className="flex gap-2">
            <Button type="button" variant="secondary" onClick={onDone}>Cancel</Button>
            <Button type="submit" disabled={!name.trim()}>Request connection</Button>
          </div>
          {error && <div className="md:col-span-3"><FieldError>{error}</FieldError></div>}
        </form>
      </CardContent>
    </Card>
  );
}
