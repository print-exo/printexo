"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { TumblerMockup, shapeFor } from "@/components/brand/tumbler-mockup";
import { ColorSwatches } from "@/components/site/color-swatches";
import { Badge } from "@/components/ui/badge";
import type { Product } from "@/lib/domain/types";
import { unitProductionCost } from "@/lib/domain/pricing";
import { formatIDR } from "@/lib/utils";

export function fromPrice(product: Product) {
  return Math.min(...product.variants.map((v) => unitProductionCost({ variant: v, printAreas: product.printAreas.slice(0, 1) })));
}

/** Photo of a variant, or the vector mockup for products without photography yet. */
export function VariantImage({ product, variant, sizes, priority }: { product: Product; variant: Product["variants"][number]; sizes: string; priority?: boolean }) {
  if (variant.image) {
    return <Image src={variant.image} alt={`${product.name} in ${variant.name}`} fill sizes={sizes} priority={priority} className="object-cover" />;
  }
  return (
    <div className="flex size-full items-center justify-center bg-surface-muted p-8">
      <TumblerMockup category={product.category} shape={shapeFor(product.id)} color={variant.colorHex} className="max-h-full w-auto" label={`${product.name} in ${variant.name}`} />
    </div>
  );
}

export function ProductCard({ product }: { product: Product }) {
  const [active, setActive] = useState(product.variants[0]);
  const available = product.variants.some((v) => v.inStock);
  const href = `/catalog/${product.slug}?variant=${active.id}`;

  return (
    <article className="group flex flex-col overflow-hidden rounded-[var(--radius-card)] border border-border bg-surface transition-shadow hover:shadow-md">
      <Link href={href} className="relative block aspect-square overflow-hidden bg-[#ecebe3]" tabIndex={-1} aria-hidden>
        <div className="absolute inset-0 transition-transform duration-300 group-hover:scale-[1.03]">
          <VariantImage product={product} variant={active} sizes="(min-width: 1024px) 360px, (min-width: 640px) 50vw, 100vw" />
        </div>
        {!available && <Badge className="absolute left-3 top-3">Coming soon</Badge>}
        {product.code && (
          <span className="absolute right-3 top-3 rounded-md bg-surface/90 px-1.5 py-0.5 font-mono text-[11px] font-medium text-muted-foreground">{product.code}</span>
        )}
      </Link>
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div>
          <h3 className="font-medium">
            <Link href={href} className="hover:underline">{product.name}</Link>
          </h3>
          <p className="text-sm text-muted-foreground">{product.printMethod}</p>
        </div>
        {product.variants.length > 1 ? (
          <div className="space-y-1.5">
            <ColorSwatches variants={product.variants} activeId={active.id} onSelect={setActive} size="sm" />
            <p className="text-sm">
              <span className="font-medium">{active.name}</span>
              <span className="text-muted-foreground"> · {product.variants.length} colours</span>
            </p>
          </div>
        ) : (
          <p className="text-sm"><span className="font-medium">{active.name}</span><span className="text-muted-foreground"> · 1 colour</span></p>
        )}
        {active.description && <p className="line-clamp-2 text-sm text-muted-foreground">{active.description}</p>}
        <p className="mt-auto pt-1 text-sm">
          From <strong>{formatIDR(fromPrice(product))}</strong>
        </p>
      </div>
    </article>
  );
}
