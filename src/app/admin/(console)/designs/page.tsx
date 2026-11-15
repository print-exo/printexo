"use client";

import { Check, Images, RefreshCw, X } from "lucide-react";
import { useState } from "react";
import { PageHeader } from "@/components/app/app-shell";
import { ConversionBadge, DesignStatusBadge } from "@/components/app/status-badges";
import { DesignThumb } from "@/components/brand/design-render";
import { TumblerMockup, shapeFor } from "@/components/brand/tumbler-mockup";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Label, Textarea } from "@/components/ui/input";
import { validateDesign } from "@/lib/domain/design-validation";
import type { DesignStatus, DesignVersion } from "@/lib/domain/types";
import { getPrintArea, getProduct } from "@/lib/mock/catalog";
import { retryConversion, reviewDesignVersion, useStore } from "@/lib/store";
import { cn, formatDateTime } from "@/lib/utils";

export default function DesignReviewPage() {
  const state = useStore((s) => s);
  const [filter, setFilter] = useState<DesignStatus>("submitted");
  const versions = state.versions.filter((v) => v.status === filter).sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  return (
    <>
      <PageHeader title="Design & SKU verification" description="Check artwork quality, print placement and copyright before designs can be produced." />
      <div className="mb-4 flex gap-1">
        {(["submitted", "approved", "rejected"] as const).map((s) => (
          <button key={s} onClick={() => setFilter(s)} aria-pressed={filter === s} className={cn("rounded-full px-3 py-1.5 text-sm capitalize", filter === s ? "bg-foreground text-background" : "text-muted-foreground hover:bg-surface-muted")}>
            {s === "submitted" ? "Pending" : s}
          </button>
        ))}
      </div>
      {versions.length === 0 ? (
        <EmptyState icon={Images} title="Nothing here">No designs in this state.</EmptyState>
      ) : (
        <div className="space-y-4">{versions.map((v) => <ReviewCard key={v.id} version={v} />)}</div>
      )}
    </>
  );
}

function ReviewCard({ version: v }: { version: DesignVersion }) {
  const state = useStore((s) => s);
  const [note, setNote] = useState("");
  const design = state.designs.find((d) => d.id === v.designId);
  const owner = state.users.find((u) => u.id === design?.userId);
  const product = getProduct(v.productId);
  const area = getPrintArea(v.productId, v.printAreaId);
  const skus = state.skus.filter((k) => k.designVersionId === v.id);
  const issues = area ? validateDesign(v.layers, area) : [];
  if (!product || !area) return null;

  return (
    <article className="grid gap-5 rounded-[var(--radius-card)] border border-border bg-surface p-5 md:grid-cols-[1fr_140px_1.2fr]">
      <div className="space-y-2">
        <DesignThumb layers={v.layers} widthIn={area.widthIn} heightIn={area.heightIn} className="w-full rounded border border-border" />
        <p className="text-xs text-muted-foreground">Flat print file · {area.widthIn}″ × {area.heightIn}″</p>
      </div>
      <div className="flex items-center justify-center rounded-lg bg-surface-muted p-3">
        <TumblerMockup category={product.category} shape={shapeFor(product.id)} color={product.variants[0].colorHex} layers={v.layers} printArea={area} label="Mockup" />
      </div>
      <div className="space-y-3 text-sm">
        <div>
          <h3 className="font-semibold">{design?.name} <span className="font-normal text-muted-foreground">v{v.number}</span></h3>
          <p className="text-xs text-muted-foreground">{owner?.name} · {product.name} · submitted {formatDateTime(v.createdAt)}</p>
        </div>
        <div className="flex flex-wrap gap-1.5"><DesignStatusBadge status={v.status} /><ConversionBadge status={v.conversion} /></div>
        {v.conversionError && <p className="text-xs text-danger">{v.conversionError}</p>}
        <div>
          <div className="text-xs font-medium">Automated checks</div>
          {issues.length === 0 ? <p className="text-xs text-success">No issues found</p> : (
            <ul className="list-disc pl-5 text-xs">{issues.map((i, n) => <li key={n} className={i.level === "error" ? "text-danger" : "text-warning"}>{i.message}</li>)}</ul>
          )}
        </div>
        <div className="text-xs"><span className="font-medium">Mapped SKUs:</span> {skus.length ? skus.map((k) => k.code).join(", ") : "none yet"}</div>
        {v.status === "submitted" && (
          <>
            <div className="space-y-1">
              <Label htmlFor={`note-${v.id}`} className="text-xs">Note to user (required when requesting changes)</Label>
              <Textarea id={`note-${v.id}`} value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. Logo resembles a registered trademark" className="min-h-14" />
            </div>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" onClick={() => reviewDesignVersion(v.id, "approved", note || undefined)} disabled={v.conversion !== "ready"} title={v.conversion !== "ready" ? "Print files must be generated first" : undefined}><Check /> Approve</Button>
              <Button size="sm" variant="secondary" onClick={() => reviewDesignVersion(v.id, "rejected", note)} disabled={!note.trim()}><X /> Request changes</Button>
              {v.conversion === "failed" && <Button size="sm" variant="secondary" onClick={() => retryConversion(v.id)}><RefreshCw /> Retry conversion</Button>}
            </div>
          </>
        )}
        {v.reviewNote && v.status !== "submitted" && <p className="rounded bg-surface-muted p-2 text-xs">Note: {v.reviewNote}</p>}
      </div>
    </article>
  );
}
