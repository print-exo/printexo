"use client";

import dynamic from "next/dynamic";
import { useQueryParam } from "@/lib/use-query-param";

// Konva needs the browser canvas, so the whole studio is client-only.
const Studio = dynamic(() => import("@/components/studio/studio").then((m) => m.Studio), {
  ssr: false,
  loading: () => <div className="h-[70dvh] animate-pulse rounded-[var(--radius-card)] bg-surface-muted" />,
});

export default function StudioPage() {
  const [product, productReady] = useQueryParam("product");
  const [design, designReady] = useQueryParam("design");
  if (!productReady || !designReady) return null;
  return <Studio key={design ?? product ?? "new"} initialProductId={product ?? undefined} designId={design ?? undefined} />;
}
