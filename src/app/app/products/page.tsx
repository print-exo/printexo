"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Tags } from "lucide-react";
import { useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { PageHeader } from "@/components/app/app-shell";
import { DesignStatusBadge } from "@/components/app/status-badges";
import { MARKETPLACE_LABEL, shopLabel } from "@/components/app/order-detail";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { FieldError, Input, Label } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { fulfillmentFee, marginFor, suggestedRetailPrice, unitProductionCost } from "@/lib/domain/pricing";
import { findVariant, getPrintArea, getProduct } from "@/lib/mock/catalog";
import { CURRENT_USER_ID } from "@/lib/mock/seed";
import { createSku, toggleSku, useStore } from "@/lib/store";
import { cn, formatIDR, formatPercent } from "@/lib/utils";

const schema = z.object({
  designVersionId: z.string().min(1, "Choose a design"),
  variantId: z.string().min(1, "Choose a color"),
  code: z
    .string()
    .min(3, "At least 3 characters")
    .max(40)
    .regex(/^[A-Z0-9-]+$/, "Use uppercase letters, numbers and dashes"),
  title: z.string().min(3, "Enter a listing title"),
  shopId: z.string().min(1, "Choose a shop"),
  retailPrice: z.coerce.number<string>().int().positive("Enter a price"),
});
type Values = z.input<typeof schema>;
type Output = z.output<typeof schema>;

export default function ProductsPage() {
  const state = useStore((s) => s);
  const [showForm, setShowForm] = useState(false);
  const skus = state.skus.filter((k) => k.userId === CURRENT_USER_ID);
  const designs = state.designs.filter((d) => d.userId === CURRENT_USER_ID);
  const shops = state.shops.filter((x) => x.userId === CURRENT_USER_ID);

  return (
    <>
      <PageHeader
        title="Products & SKUs"
        description="A SKU links a product color to an exact design version in one of your shops. Use the SKU code on that shop’s listing so orders match automatically."
        actions={<Button onClick={() => setShowForm((s) => !s)}><Plus /> New SKU</Button>}
      />
      {showForm && <SkuForm onDone={() => setShowForm(false)} />}

      {skus.length === 0 ? (
        <EmptyState icon={Tags} title="No SKUs yet">Map an approved design to a product color to create your first sellable SKU.</EmptyState>
      ) : (
        <div className="overflow-x-auto rounded-[var(--radius-card)] border border-border bg-surface">
          <table className="w-full min-w-[760px] text-sm">
            <thead className="border-b border-border text-left text-xs text-muted-foreground">
              <tr className="[&_th]:px-4 [&_th]:py-3 [&_th]:font-medium">
                <th>SKU</th><th>Product</th><th>Design</th><th>Shop</th><th className="text-right">Price</th><th className="text-right">Est. margin</th><th>Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {skus.map((k) => {
                const found = findVariant(k.variantId);
                const version = state.versions.find((v) => v.id === k.designVersionId);
                const design = designs.find((d) => d.id === version?.designId);
                const area = version ? getPrintArea(version.productId, version.printAreaId) : undefined;
                const unit = found && area ? unitProductionCost({ variant: found.variant, printAreas: [area] }) : 0;
                const shop = shops.find((x) => x.id === k.shopId);
                const m = found && shop ? marginFor({ retailPrice: k.retailPrice, unitCost: unit, weightGrams: found.product.weightGrams, marketplace: shop.marketplace }) : undefined;
                return (
                  <tr key={k.id} className={cn("[&_td]:px-4 [&_td]:py-3", !k.active && "opacity-60")}>
                    <td><div className="font-medium">{k.title}</div><div className="font-mono text-xs text-muted-foreground">{k.code}</div></td>
                    <td>{found?.product.name}<div className="text-xs text-muted-foreground">{found?.variant.name}</div></td>
                    <td>{design?.name}<div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">v{version?.number} {version && <DesignStatusBadge status={version.status} />}</div></td>
                    <td>{shop?.name ?? "—"}<div className="text-xs text-muted-foreground">{shop && MARKETPLACE_LABEL[shop.marketplace]}</div></td>
                    <td className="text-right">{formatIDR(k.retailPrice)}</td>
                    <td className={cn("text-right", m && m.profit < 0 ? "text-danger" : "text-success")}>{m ? `${formatIDR(m.profit)} (${formatPercent(m.marginRate)})` : "—"}</td>
                    <td>
                      <button onClick={() => toggleSku(k.id)} className="rounded focus-visible:outline-2" aria-label={k.active ? `Deactivate ${k.code}` : `Activate ${k.code}`}>
                        {k.active ? <Badge tone="success">Active</Badge> : <Badge>Inactive</Badge>}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}

function SkuForm({ onDone }: { onDone: () => void }) {
  const state = useStore((s) => s);
  const [error, setError] = useState<string>();
  // Drafts can't be sold; submitted designs can be mapped but orders hold until approved.
  // SKUs can be created for pending shops too, so listings are ready when the connection goes live.
  const shops = state.shops.filter((x) => x.userId === CURRENT_USER_ID && x.status !== "disconnected");
  const options = state.designs
    .filter((d) => d.userId === CURRENT_USER_ID)
    .flatMap((d) => d.versionIds.map((id) => ({ design: d, version: state.versions.find((v) => v.id === id)! })))
    .filter((o) => o.version && (o.version.status === "approved" || o.version.status === "submitted"));

  const { register, control, handleSubmit, watch, setValue, formState: { errors } } = useForm<Values, unknown, Output>({
    resolver: zodResolver(schema),
    defaultValues: { shopId: shops[0]?.id ?? "", designVersionId: options[0]?.version.id ?? "", variantId: "", code: "", title: "", retailPrice: "" },
  });

  const versionId = watch("designVersionId");
  const variantId = watch("variantId");
  const shopId = watch("shopId");
  const marketplace = shops.find((x) => x.id === shopId)?.marketplace ?? "tiktok_shop";
  const price = Number(watch("retailPrice")) || 0;
  const version = state.versions.find((v) => v.id === versionId);
  const product = version ? getProduct(version.productId) : undefined;
  const area = version ? getPrintArea(version.productId, version.printAreaId) : undefined;
  const variant = product?.variants.find((v) => v.id === variantId);

  const preview = useMemo(() => {
    if (!product || !variant || !area) return undefined;
    const unit = unitProductionCost({ variant, printAreas: [area] });
    return { suggested: suggestedRetailPrice(unit + fulfillmentFee(1), marketplace), m: marginFor({ retailPrice: price, unitCost: unit, weightGrams: product.weightGrams, marketplace }) };
  }, [product, variant, area, marketplace, price]);

  function onSubmit(values: Output) {
    try {
      createSku({ ...values, userId: CURRENT_USER_ID });
      onDone();
    } catch (e) {
      setError((e as Error).message);
    }
  }

  if (shops.length === 0) {
    return <Card className="mb-6"><CardContent className="pt-5 text-sm text-muted-foreground">Add a shop first — every SKU belongs to one of your shops.</CardContent></Card>;
  }
  if (options.length === 0) {
    return <Card className="mb-6"><CardContent className="pt-5 text-sm text-muted-foreground">Submit a design for review first — drafts can’t be mapped to SKUs.</CardContent></Card>;
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Create SKU</CardTitle>
        <CardDescription>The SKU locks this exact design version. Later edits to the design won’t change it.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="grid gap-4 md:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="dv">Design version</Label>
            <Controller
              name="designVersionId"
              control={control}
              render={({ field }) => (
                <Select name={field.name} value={field.value} onValueChange={(v) => { field.onChange(v); setValue("variantId", ""); }}>
                  <SelectTrigger id="dv" ref={field.ref} onBlur={field.onBlur}><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {options.map(({ design, version }) => (
                      <SelectItem key={version.id} value={version.id}>{design.name} — v{version.number} ({version.status})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {version?.status === "submitted" && <p className="text-xs text-warning">Still in review — orders will be held until it’s approved.</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="variant">Color ({product?.name})</Label>
            <Controller
              name="variantId"
              control={control}
              render={({ field }) => (
                <Select name={field.name} value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="variant" ref={field.ref} onBlur={field.onBlur} aria-invalid={!!errors.variantId}>
                    <SelectValue placeholder="Select…" />
                  </SelectTrigger>
                  <SelectContent>
                    {product?.variants.map((v) => <SelectItem key={v.id} value={v.id} disabled={!v.inStock}>{v.name}{v.inStock ? "" : " (out of stock)"}</SelectItem>)}
                  </SelectContent>
                </Select>
              )}
            />
            <FieldError>{errors.variantId?.message}</FieldError>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="code">SKU code</Label>
            <Input id="code" placeholder="KS-T20-NEW-WHT" className="font-mono uppercase" aria-invalid={!!errors.code} {...register("code", { setValueAs: (v: string) => v.toUpperCase().trim() })} />
            <FieldError>{errors.code?.message}</FieldError>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="title">Listing title</Label>
            <Input id="title" aria-invalid={!!errors.title} {...register("title")} />
            <FieldError>{errors.title?.message}</FieldError>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="shop">Shop</Label>
            <Controller
              name="shopId"
              control={control}
              render={({ field }) => (
                <Select name={field.name} value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="shop" ref={field.ref} onBlur={field.onBlur} aria-invalid={!!errors.shopId}><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {shops.map((x) => <SelectItem key={x.id} value={x.id}>{shopLabel(shops, x.id)}{x.status === "pending" ? " (pending)" : ""}</SelectItem>)}
                  </SelectContent>
                </Select>
              )}
            />
            <FieldError>{errors.shopId?.message}</FieldError>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="price">Retail price (IDR)</Label>
            <Input id="price" inputMode="numeric" aria-invalid={!!errors.retailPrice} {...register("retailPrice")} />
            <FieldError>{errors.retailPrice?.message}</FieldError>
            {preview && (
              <p className="text-xs text-muted-foreground">
                Suggested {formatIDR(preview.suggested)}{" "}
                <button type="button" className="text-primary underline" onClick={() => setValue("retailPrice", String(preview.suggested))}>use</button>
                {price > 0 && <> · profit <span className={preview.m.profit < 0 ? "text-danger" : "text-success"}>{formatIDR(preview.m.profit)} ({formatPercent(preview.m.marginRate)})</span></>}
              </p>
            )}
          </div>
          {error && <p role="alert" className="text-sm text-danger md:col-span-2">{error}</p>}
          <div className="flex justify-end gap-2 md:col-span-2">
            <Button type="button" variant="secondary" onClick={onDone}>Cancel</Button>
            <Button type="submit">Create SKU</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
