"use client";

import Image from "next/image";
import { useState } from "react";
import { ColorSwatches } from "@/components/site/color-swatches";
import { VariantImage } from "@/components/site/product-card";
import type { Product } from "@/lib/domain/types";
import { useQueryParam } from "@/lib/use-query-param";
import { cn } from "@/lib/utils";

export function VariantGallery({ product }: { product: Product }) {
  // Opens on the colour picked on the catalog card (?variant=…), else the first one.
  const [fromUrl] = useQueryParam("variant");
  const [picked, setPicked] = useState<string | null>(null);
  const [shot, setShot] = useState(0);
  const activeId = picked ?? (product.variants.some((v) => v.id === fromUrl) ? fromUrl! : product.variants[0].id);
  const active = product.variants.find((v) => v.id === activeId)!;
  const shots = active.image ? [active.image, ...(active.gallery ?? [])] : [];
  const current = Math.min(shot, Math.max(shots.length - 1, 0));

  return (
    <div className="space-y-5">
      <div className="relative aspect-square overflow-hidden rounded-3xl bg-[#ecebe3]">
        {shots.length > 0 ? (
          <Image
            key={shots[current]}
            src={shots[current]}
            alt={`${product.name} in ${active.name}${current > 0 ? `, photo ${current + 1}` : ""}`}
            fill
            priority
            sizes="(min-width: 768px) 560px, 100vw"
            className="object-cover"
          />
        ) : (
          <VariantImage product={product} variant={active} sizes="(min-width: 768px) 560px, 100vw" />
        )}
      </div>

      {shots.length > 1 && (
        <div className="flex gap-2" role="group" aria-label="Photos">
          {shots.map((src, i) => (
            <button
              key={src}
              type="button"
              aria-label={`Photo ${i + 1} of ${shots.length}`}
              aria-pressed={i === current}
              onClick={() => setShot(i)}
              className={cn(
                "relative size-20 overflow-hidden rounded-xl bg-[#ecebe3] ring-offset-2 transition",
                i === current ? "ring-2 ring-primary" : "opacity-80 hover:opacity-100",
              )}
            >
              <Image src={src} alt="" fill sizes="80px" className="object-cover" />
            </button>
          ))}
        </div>
      )}

      <div className="space-y-3">
        <p className="text-sm font-medium">
          Colour: <span className="font-normal text-muted-foreground">{active.name}{!active.inStock && " (out of stock)"}</span>
        </p>
        <ColorSwatches
          variants={product.variants}
          activeId={active.id}
          onSelect={(v) => {
            setPicked(v.id);
            setShot(0);
          }}
        />
        {active.description && <p className="max-w-md text-sm text-muted-foreground">{active.description}</p>}
      </div>
    </div>
  );
}
