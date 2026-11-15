"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Label } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup, SelectLabel } from "@/components/ui/select";
import { PRODUCTS } from "@/lib/mock/catalog";
import { marginFor, suggestedRetailPrice, fulfillmentFee, unitProductionCost } from "@/lib/domain/pricing";
import type { Marketplace } from "@/lib/domain/types";
import { cn, formatIDR, formatPercent } from "@/lib/utils";

export function MarginCalculator() {
  const [variantId, setVariantId] = useState(PRODUCTS[0].variants[0].id);
  const [marketplace, setMarketplace] = useState<Marketplace>("tiktok_shop");
  const [shopPaysShipping, setShopPaysShipping] = useState(false);

  const product = PRODUCTS.find((p) => p.variants.some((v) => v.id === variantId)) ?? PRODUCTS[0];
  const variant = product.variants.find((v) => v.id === variantId) ?? product.variants[0];

  const unit = unitProductionCost({ variant, printAreas: [product.printAreas[0]] });
  const suggested = suggestedRetailPrice(unit + fulfillmentFee(1), marketplace);
  const [priceInput, setPriceInput] = useState<string>("");
  const price = priceInput === "" ? suggested : Number(priceInput) || 0;
  const m = marginFor({ retailPrice: price, unitCost: unit, weightGrams: product.weightGrams, marketplace, shopPaysShipping });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Margin calculator</CardTitle>
        <CardDescription>Estimate your profit per unit before you list.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="calc-product">Product</Label>
            <Select value={variantId} onValueChange={(v) => { setVariantId(v); setPriceInput(""); }}>
              <SelectTrigger id="calc-product"><SelectValue /></SelectTrigger>
              <SelectContent>
                {PRODUCTS.map((p) => (
                  <SelectGroup key={p.id}>
                    <SelectLabel>{p.name}</SelectLabel>
                    {p.variants.map((v) => (
                      <SelectItem key={v.id} value={v.id}>{p.name} — {v.name}</SelectItem>
                    ))}
                  </SelectGroup>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="calc-mp">Sales channel</Label>
            <Select value={marketplace} onValueChange={(v) => { setMarketplace(v as Marketplace); setPriceInput(""); }}>
              <SelectTrigger id="calc-mp"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="tiktok_shop">TikTok Shop</SelectItem>
                <SelectItem value="shopee">Shopee</SelectItem>
                <SelectItem value="shopify">Shopify</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="calc-price">Your selling price (IDR)</Label>
            <Input id="calc-price" inputMode="numeric" value={priceInput === "" ? String(suggested) : priceInput} onChange={(e) => setPriceInput(e.target.value.replace(/\D/g, ""))} />
            <p className="text-xs text-muted-foreground">Suggested: {formatIDR(suggested)} (30% target margin)</p>
          </div>
          <label className="flex items-center gap-2 self-center text-sm">
            <input type="checkbox" checked={shopPaysShipping} onChange={(e) => setShopPaysShipping(e.target.checked)} className="size-4 accent-[var(--primary)]" />
            I offer free shipping (I pay shipping)
          </label>
        </div>

        <table className="w-full text-sm">
          <tbody className="[&_td]:py-1.5 [&_td:last-child]:text-right">
            <tr><td>Selling price</td><td>{formatIDR(m.retailPrice)}</td></tr>
            <tr className="text-muted-foreground"><td>Marketplace fee (est.)</td><td>− {formatIDR(m.marketplaceFee)}</td></tr>
            <tr className="text-muted-foreground"><td>Production (product + print)</td><td>− {formatIDR(m.productionCost)}</td></tr>
            <tr className="text-muted-foreground"><td>Fulfillment</td><td>− {formatIDR(m.fulfillment)}</td></tr>
            {shopPaysShipping && <tr className="text-muted-foreground"><td>Shipping (est.)</td><td>− {formatIDR(m.shipping)}</td></tr>}
            <tr className="border-t border-border text-base font-semibold">
              <td>Your profit</td>
              <td className={cn(m.profit < 0 ? "text-danger" : "text-success")}>
                {formatIDR(m.profit)} <span className="text-xs font-normal">({formatPercent(m.marginRate)})</span>
              </td>
            </tr>
          </tbody>
        </table>
        {m.profit < 0 && <p role="alert" className="text-sm text-danger">This price loses money on every sale. Raise the price or choose a lower-cost variant.</p>}
      </CardContent>
    </Card>
  );
}
