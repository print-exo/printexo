"use client";

import { Images, Pencil, RefreshCw, Send } from "lucide-react";
import Link from "next/link";
import { PageHeader } from "@/components/app/app-shell";
import { ConversionBadge, DesignStatusBadge } from "@/components/app/status-badges";
import { DesignThumb } from "@/components/brand/design-render";
import { Button, ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { canSubmit, validateDesign } from "@/lib/domain/design-validation";
import { getPrintArea, getProduct } from "@/lib/mock/catalog";
import { CURRENT_USER_ID } from "@/lib/mock/seed";
import { retryConversion, submitDesignVersion, useStore } from "@/lib/store";
import { formatDate } from "@/lib/utils";

export default function DesignsPage() {
  const designs = useStore((s) => s.designs).filter((d) => d.userId === CURRENT_USER_ID);
  const versions = useStore((s) => s.versions);
  const skus = useStore((s) => s.skus);

  return (
    <>
      <PageHeader
        title="Design library"
        description="Every submitted version is locked. Editing an approved design creates a new version for review."
        actions={<ButtonLink href="/app/studio">New design</ButtonLink>}
      />
      {designs.length === 0 ? (
        <EmptyState icon={Images} title="No designs yet" action={<ButtonLink href="/app/studio">Open Design Studio</ButtonLink>}>
          Create your first design in the studio. Once approved, you can map it to a SKU and start selling.
        </EmptyState>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {designs.map((d) => {
            const v = versions.find((x) => x.id === d.currentVersionId);
            if (!v) return null;
            const area = getPrintArea(v.productId, v.printAreaId);
            const product = getProduct(v.productId);
            const usedBy = skus.filter((k) => d.versionIds.includes(k.designVersionId)).length;
            const issues = area ? validateDesign(v.layers, area) : [];
            return (
              <article key={d.id} className="flex flex-col overflow-hidden rounded-[var(--radius-card)] border border-border bg-surface">
                <div className="flex aspect-[4/3] items-center justify-center bg-surface-muted p-4">
                  {v.thumbnail ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={v.thumbnail} alt="" className="max-h-full rounded border border-border bg-white" />
                  ) : area ? (
                    <DesignThumb layers={v.layers} widthIn={area.widthIn} heightIn={area.heightIn} className="max-h-full w-full rounded border border-border" />
                  ) : null}
                </div>
                <div className="flex flex-1 flex-col gap-2 p-4">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-medium">{d.name}</h3>
                    <span className="text-xs text-muted-foreground">v{v.number}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{product?.name} · {area?.name} · updated {formatDate(d.updatedAt)}</p>
                  <div className="flex flex-wrap gap-1.5">
                    <DesignStatusBadge status={v.status} />
                    {v.status !== "draft" && <ConversionBadge status={v.conversion} />}
                  </div>
                  {v.reviewNote && v.status === "rejected" && <p className="rounded bg-danger-soft p-2 text-xs text-danger">Reviewer: {v.reviewNote}</p>}
                  {v.conversionError && <p className="rounded bg-danger-soft p-2 text-xs text-danger">{v.conversionError}</p>}
                  <p className="text-xs text-muted-foreground">Used by {usedBy} SKU{usedBy === 1 ? "" : "s"}</p>
                  <div className="mt-auto flex flex-wrap gap-2 pt-2">
                    <ButtonLink href={`/app/studio?design=${d.id}`} variant="secondary" size="sm"><Pencil /> {v.status === "draft" ? "Edit" : "Edit as new version"}</ButtonLink>
                    {v.status === "draft" && (
                      <Button size="sm" disabled={!canSubmit(issues)} title={canSubmit(issues) ? undefined : "Fix validation errors in the studio first"} onClick={() => submitDesignVersion(v.id)}>
                        <Send /> Submit for review
                      </Button>
                    )}
                    {v.conversion === "failed" && (
                      <Button size="sm" variant="secondary" onClick={() => retryConversion(v.id)}><RefreshCw /> Retry conversion</Button>
                    )}
                    {v.status === "approved" && <Link href="/app/products" className="self-center text-xs text-primary hover:underline">Map to SKU →</Link>}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </>
  );
}
