import { notFound } from "next/navigation";
import { Clock, Globe2, Layers, Ruler } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { VariantGallery } from "./variant-gallery";
import { COUNTRY_NAME, getProductBySlug } from "@/lib/mock/catalog";
import { estimateShipping, fulfillmentFee, suggestedRetailPrice, unitProductionCost } from "@/lib/domain/pricing";
import { formatIDR } from "@/lib/utils";

/** The URL-specific part of the product page. Awaits `params`, so it renders inside the page's <Suspense>. */
export async function ProductDetails({ params }: Pick<PageProps<"/catalog/[slug]">, "params">) {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) notFound();

  const area = product.printAreas[0];
  const variant = product.variants[0];
  const unit = unitProductionCost({ variant, printAreas: [area] });
  const fulfill = fulfillmentFee(1);
  const ship = estimateShipping(product.weightGrams);
  const suggested = suggestedRetailPrice(unit + fulfill);
  const available = product.variants.some((v) => v.inStock);

  return (
    <div className="mt-6 grid gap-10 md:grid-cols-2">
      <VariantGallery product={product} />
      <div className="space-y-6">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            {!available && <Badge>Coming soon</Badge>}
            {product.code && <span className="rounded-md bg-surface-muted px-1.5 py-0.5 font-mono text-xs font-medium text-muted-foreground">Model {product.code}</span>}
          </div>
          <h1 className="text-3xl font-display">{product.name}</h1>
          <p className="text-muted-foreground">{product.description}</p>
        </div>

        <dl className="grid grid-cols-2 gap-4 rounded-[var(--radius-card)] border border-border bg-surface p-5 text-sm">
          <div className="flex gap-2"><Ruler className="mt-0.5 size-4 text-muted-foreground" /><div><dt className="text-muted-foreground">Capacity</dt><dd>{product.capacityOz} oz</dd></div></div>
          <div className="flex gap-2"><Layers className="mt-0.5 size-4 text-muted-foreground" /><div><dt className="text-muted-foreground">Print</dt><dd>{product.printMethod}</dd></div></div>
          <div className="flex gap-2"><Clock className="mt-0.5 size-4 text-muted-foreground" /><div><dt className="text-muted-foreground">Production</dt><dd>{product.productionDays[0]}–{product.productionDays[1]} business days</dd></div></div>
          <div className="flex gap-2"><Globe2 className="mt-0.5 size-4 text-muted-foreground" /><div><dt className="text-muted-foreground">Ships to</dt><dd>{product.shipsTo.map((c) => COUNTRY_NAME[c] ?? c).join(", ")}</dd></div></div>
        </dl>

        <div className="rounded-[var(--radius-card)] border border-border bg-surface p-5">
          <h2 className="mb-3 font-bold">Cost per unit</h2>
          <table className="w-full text-sm">
            <tbody className="[&_td]:py-1.5 [&_td:last-child]:text-right">
              <tr><td className="text-muted-foreground">Base product</td><td>{formatIDR(variant.baseCost)}</td></tr>
              <tr><td className="text-muted-foreground">Print — {area.name}</td><td>{formatIDR(area.printFee)}</td></tr>
              <tr><td className="text-muted-foreground">Fulfillment (first item)</td><td>{formatIDR(fulfill)}</td></tr>
              <tr className="border-t border-border font-medium"><td>Your cost</td><td>{formatIDR(unit + fulfill)}</td></tr>
              <tr><td className="text-muted-foreground">Estimated shipping (if you pay)</td><td>{formatIDR(ship)}</td></tr>
              <tr><td className="text-muted-foreground">Suggested retail price</td><td className="font-medium text-primary">{formatIDR(suggested)}</td></tr>
            </tbody>
          </table>
        </div>

        <div className="rounded-[var(--radius-card)] border border-border bg-surface p-5 text-sm">
          <h2 className="mb-2 font-bold">Print area</h2>
          <p className="text-muted-foreground">
            {area.name}: {area.widthIn}″ × {area.heightIn}″ ({Math.round(area.widthIn * 300)} × {Math.round(area.heightIn * 300)} px at 300 DPI).
            Keep important elements {area.safeMarginIn}″ inside the edge.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <ButtonLink href={`/app/studio?product=${product.id}`} size="lg" aria-disabled={!available}>
            Design this product
          </ButtonLink>
          <ButtonLink href="/pricing" size="lg" variant="secondary">
            Calculate margin
          </ButtonLink>
        </div>
      </div>
    </div>
  );
}
