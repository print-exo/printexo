"use client";

import type { ProductVariant } from "@/lib/domain/types";
import { cn } from "@/lib/utils";

/** Colour buttons for a product's variants. Each button selects that variant. */
export function ColorSwatches({
  variants,
  activeId,
  onSelect,
  size = "md",
  className,
}: {
  variants: ProductVariant[];
  activeId: string;
  onSelect: (variant: ProductVariant) => void;
  size?: "sm" | "md";
  className?: string;
}) {
  return (
    <div role="group" aria-label="Colour" className={cn("flex flex-wrap gap-1.5", className)}>
      {variants.map((v) => {
        const active = v.id === activeId;
        return (
          <button
            key={v.id}
            type="button"
            title={v.name}
            aria-label={`${v.name}${v.inStock ? "" : " (out of stock)"}`}
            aria-pressed={active}
            onClick={() => onSelect(v)}
            className={cn(
              "grid place-items-center rounded-full p-0.5 ring-offset-2 ring-offset-surface transition",
              size === "sm" ? "size-8" : "size-10",
              active ? "ring-2 ring-primary" : "hover:ring-2 hover:ring-border",
              !v.inStock && "opacity-50",
            )}
          >
            <span
              aria-hidden
              className="size-full rounded-full border border-black/15"
              style={{ background: v.swatch ?? v.colorHex }}
            />
          </button>
        );
      })}
    </div>
  );
}
