import type { Metadata } from "next";
import { ChevronLeft } from "lucide-react";
import { Suspense } from "react";
import Link from "next/link";
import { ProductDetails } from "./product-details";
import { PRODUCTS, getProductBySlug } from "@/lib/mock/catalog";

export function generateStaticParams() {
  return PRODUCTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/catalog/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  return { title: getProductBySlug(slug)?.name ?? "Product" };
}

// The shell (back link + layout) is shared by every product, so navigation paints it
// instantly; the product itself depends on the URL and streams in inside <Suspense>.
export default function ProductPage({ params }: PageProps<"/catalog/[slug]">) {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <Link href="/catalog" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ChevronLeft className="size-4" /> Catalog
      </Link>
      <Suspense fallback={<ProductSkeleton />}>
        <ProductDetails params={params} />
      </Suspense>
    </div>
  );
}

function ProductSkeleton() {
  return (
    <div className="mt-6 grid gap-10 md:grid-cols-2" aria-busy="true" aria-label="Loading product">
      <div className="space-y-5">
        <div className="aspect-square animate-pulse rounded-3xl bg-surface-muted" />
        <div className="flex gap-1.5">
          {Array.from({ length: 4 }, (_, i) => <div key={i} className="size-10 animate-pulse rounded-full bg-surface-muted" />)}
        </div>
      </div>
      <div className="space-y-6">
        <div className="space-y-3">
          <div className="h-5 w-24 animate-pulse rounded-md bg-surface-muted" />
          <div className="h-9 w-3/4 animate-pulse rounded-lg bg-surface-muted" />
          <div className="h-4 w-full animate-pulse rounded bg-surface-muted" />
          <div className="h-4 w-2/3 animate-pulse rounded bg-surface-muted" />
        </div>
        <div className="h-32 animate-pulse rounded-[var(--radius-card)] bg-surface-muted" />
        <div className="h-64 animate-pulse rounded-[var(--radius-card)] bg-surface-muted" />
      </div>
    </div>
  );
}
