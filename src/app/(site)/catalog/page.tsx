import type { Metadata } from "next";
import { ProductCard } from "@/components/site/product-card";
import { PRODUCTS } from "@/lib/mock/catalog";

export const metadata: Metadata = { title: "Product catalog" };

const CATEGORIES = [
  { id: "tumbler", label: "Tumblers" },
] as const;

export default function CatalogPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-display">Product catalog</h1>
      <p className="mt-2 max-w-2xl text-muted-foreground">
        Base cost includes the blank product and one print area. Fulfillment and shipping are shown on each product page.
      </p>
      {CATEGORIES.map((cat) => {
        const items = PRODUCTS.filter((p) => p.category === cat.id);
        if (!items.length) return null;
        return (
          <section key={cat.id} className="mt-10">
            <h2 className="mb-4 text-lg font-bold">{cat.label}</h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
