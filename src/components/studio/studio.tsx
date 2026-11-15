"use client";

import {
  AlertCircle,
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  Bold,
  CheckCircle2,
  Download,
  Eye,
  ImagePlus,
  Italic,
  LayoutTemplate,
  Layers as LayersIcon,
  Maximize,
  Pencil,
  Redo2,
  Save,
  Send,
  Trash2,
  Type,
  Undo2,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useEffect, useEffectEvent, useMemo, useRef, useState } from "react";
import { TumblerMockup, shapeFor } from "@/components/brand/tumbler-mockup";
import { ConfirmDialog } from "@/components/app/confirm";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  ACCEPTED_UPLOAD_TYPES,
  MAX_UPLOAD_BYTES,
  RECOMMENDED_DPI,
  canSubmit,
  effectiveDpi,
  validateDesign,
} from "@/lib/domain/design-validation";
import type { DesignLayer } from "@/lib/domain/types";
import { PRODUCTS, getProduct } from "@/lib/mock/catalog";
import { CURRENT_USER_ID } from "@/lib/mock/seed";
import { getState, saveDesign, submitDesignVersion } from "@/lib/store";
import { cn, uid } from "@/lib/utils";
import { FONTS, TEMPLATES } from "./templates";
import { loadImage, measureTextHeightIn, renderPrintPng } from "./konva-utils";

const StudioCanvas = dynamic(() => import("./studio-canvas"), {
  ssr: false,
  loading: () => <div className="absolute inset-0 animate-pulse bg-surface-muted" />,
});

type Tab = "add" | "templates" | "layers";

export function Studio({ initialProductId, designId: initialDesignId }: { initialProductId?: string; designId?: string }) {
  const router = useRouter();

  // ----- load existing design (if any) -----
  const initial = useMemo(() => {
    const s = getState();
    const design = initialDesignId ? s.designs.find((d) => d.id === initialDesignId && d.userId === CURRENT_USER_ID) : undefined;
    const version = design ? s.versions.find((v) => v.id === design.currentVersionId) : undefined;
    const product = getProduct(version?.productId ?? initialProductId ?? "") ?? PRODUCTS.find((p) => p.variants.some((v) => v.inStock))!;
    return { design, version, product };
  }, [initialDesignId, initialProductId]);

  const [designId, setDesignId] = useState(initial.design?.id);
  const [name, setName] = useState(initial.design?.name ?? "Untitled design");
  const [productId, setProductId] = useState(initial.product.id);
  const product = getProduct(productId)!;
  const [printAreaId, setPrintAreaId] = useState(initial.version?.printAreaId ?? product.printAreas[0].id);
  const area = product.printAreas.find((a) => a.id === printAreaId) ?? product.printAreas[0];
  const [variantId, setVariantId] = useState(product.variants[0].id);
  const variant = product.variants.find((v) => v.id === variantId) ?? product.variants[0];
  const lockedVersion = initial.version && initial.version.status !== "draft" ? initial.version : undefined;

  // ----- layers + history -----
  const [history, setHistory] = useState<{ stack: DesignLayer[][]; index: number }>({
    stack: [initial.version?.layers ?? []],
    index: 0,
  });
  const layers = history.stack[history.index];
  const [dirty, setDirty] = useState(false);
  function commit(next: DesignLayer[]) {
    setHistory((h) => {
      const stack = [...h.stack.slice(0, h.index + 1), next].slice(-100);
      return { stack, index: stack.length - 1 };
    });
    setDirty(true);
  }
  const undo = () => setHistory((h) => ({ ...h, index: Math.max(0, h.index - 1) }));
  const redo = () => setHistory((h) => ({ ...h, index: Math.min(h.stack.length - 1, h.index + 1) }));

  const [selectedId, setSelectedId] = useState<string>();
  const selected = layers.find((l) => l.id === selectedId);
  const [zoom, setZoom] = useState(1);
  const [tab, setTab] = useState<Tab>("add");
  const [preview, setPreview] = useState(false);
  const [notice, setNotice] = useState<{ tone: "ok" | "error"; text: string }>();
  const [confirmSubmit, setConfirmSubmit] = useState(false);
  const [busy, setBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const issues = validateDesign(layers, area);
  const errorLayerIds = new Set(issues.filter((i) => i.level === "error" && i.layerId).map((i) => i.layerId!));
  const submittable = canSubmit(issues);

  function update(id: string, patch: Partial<DesignLayer>) {
    commit(
      layers.map((l) => {
        if (l.id !== id) return l;
        const next = { ...l, ...patch };
        if (next.kind === "text" && ("text" in patch || "fontSize" in patch || "fontFamily" in patch || "fontStyle" in patch || "width" in patch)) {
          next.height = measureTextHeightIn(next);
        }
        return next;
      }),
    );
  }

  function remove(id: string) {
    commit(layers.filter((l) => l.id !== id));
    setSelectedId(undefined);
  }

  // ----- keyboard shortcuts -----
  const onKey = useEffectEvent((e: KeyboardEvent) => {
    {
      const t = e.target as HTMLElement;
      if (t.closest("input, textarea, select, [contenteditable]")) return;
      const mod = e.metaKey || e.ctrlKey;
      if (mod && e.key.toLowerCase() === "z") {
        e.preventDefault();
        if (e.shiftKey) redo();
        else undo();
      } else if (mod && e.key.toLowerCase() === "y") {
        e.preventDefault();
        redo();
      } else if (selected && (e.key === "Delete" || e.key === "Backspace")) {
        e.preventDefault();
        remove(selected.id);
      } else if (selected && e.key.startsWith("Arrow")) {
        e.preventDefault();
        const step = e.shiftKey ? 0.25 : 0.05;
        const dx = e.key === "ArrowLeft" ? -step : e.key === "ArrowRight" ? step : 0;
        const dy = e.key === "ArrowUp" ? -step : e.key === "ArrowDown" ? step : 0;
        update(selected.id, { x: selected.x + dx, y: selected.y + dy });
      } else if (e.key === "Escape") {
        setSelectedId(undefined);
      }
    }
  });
  useEffect(() => {
    const handler = (e: KeyboardEvent) => onKey(e);
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  // ----- warn before leaving with unsaved changes -----
  useEffect(() => {
    if (!dirty) return;
    const h = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", h);
    return () => window.removeEventListener("beforeunload", h);
  }, [dirty]);

  // ----- adding content -----
  function addText(text = "Your text") {
    const width = area.widthIn * 0.6;
    const base: DesignLayer = {
      id: uid("ly"),
      kind: "text",
      x: (area.widthIn - width) / 2,
      y: area.heightIn * 0.4,
      width,
      height: 0,
      rotation: 0,
      text,
      fontFamily: "Arial",
      fontSize: Math.round(area.heightIn * 5),
      fill: "#0e2f2c",
      align: "center",
    };
    base.height = measureTextHeightIn(base);
    commit([...layers, base]);
    setSelectedId(base.id);
  }

  async function onUpload(file: File) {
    if (!ACCEPTED_UPLOAD_TYPES.includes(file.type)) {
      setNotice({ tone: "error", text: "Unsupported file type. Use PNG, JPG, WebP or SVG." });
      return;
    }
    if (file.size > MAX_UPLOAD_BYTES) {
      setNotice({ tone: "error", text: "File is larger than 50 MB." });
      return;
    }
    const src = await new Promise<string>((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => resolve(r.result as string);
      r.onerror = reject;
      r.readAsDataURL(file);
    });
    const img = await loadImage(src);
    // Start at the largest size that still prints at the recommended DPI, capped to 80% of the area.
    const aspect = img.naturalHeight / img.naturalWidth;
    let width = Math.min(area.widthIn * 0.8, img.naturalWidth / RECOMMENDED_DPI);
    if (width * aspect > area.heightIn * 0.8) width = (area.heightIn * 0.8) / aspect;
    width = Math.max(width, Math.min(area.widthIn * 0.3, (area.heightIn * 0.3) / aspect));
    const layer: DesignLayer = {
      id: uid("ly"),
      kind: "image",
      x: (area.widthIn - width) / 2,
      y: (area.heightIn - width * aspect) / 2,
      width,
      height: width * aspect,
      rotation: 0,
      src,
      naturalWidthPx: img.naturalWidth,
      naturalHeightPx: img.naturalHeight,
    };
    commit([...layers, layer]);
    setSelectedId(layer.id);
    setNotice(undefined);
  }

  function applyTemplate(id: string) {
    const t = TEMPLATES.find((t) => t.id === id)!;
    const built = t.build(area).map((l) => {
      const layer = { ...l, id: uid("ly"), height: 0 } as DesignLayer;
      layer.height = measureTextHeightIn(layer);
      return layer;
    });
    commit([...layers, ...built]);
  }

  function move(id: string, dir: -1 | 1) {
    const i = layers.findIndex((l) => l.id === id);
    const j = i + dir;
    if (j < 0 || j >= layers.length) return;
    const next = [...layers];
    [next[i], next[j]] = [next[j], next[i]];
    commit(next);
  }

  function changeProduct(id: string) {
    const p = getProduct(id)!;
    setProductId(id);
    setPrintAreaId(p.printAreas[0].id);
    setVariantId(p.variants[0].id);
    setDirty(true);
  }

  // ----- persistence -----
  function save() {
    const res = saveDesign({ userId: CURRENT_USER_ID, designId, name: name.trim() || "Untitled design", productId, printAreaId: area.id, layers });
    setDesignId(res.designId);
    setDirty(false);
    setNotice({ tone: "ok", text: lockedVersion ? "Saved as a new draft version." : "Draft saved." });
    return res;
  }

  function submit() {
    const res = save();
    submitDesignVersion(res.versionId);
    setConfirmSubmit(false);
    router.push("/app/designs");
  }

  async function downloadPng() {
    setBusy(true);
    try {
      const url = await renderPrintPng(layers, area, 300);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${(name || "design").replace(/\W+/g, "-").toLowerCase()}-${area.id}-300dpi.png`;
      a.click();
    } finally {
      setBusy(false);
    }
  }

  const selectedDpi = selected?.kind === "image" ? effectiveDpi(selected) : undefined;

  return (
    <div className="flex min-h-[calc(100dvh-3.5rem)] flex-col lg:h-dvh lg:min-h-0">
      {/* Top bar */}
      <div className="flex flex-wrap items-center gap-2 border-b border-border bg-surface px-4 py-2.5">
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <Pencil className="size-4 shrink-0 text-muted-foreground" aria-hidden />
          <label htmlFor="design-name" className="sr-only">Design name</label>
          <input id="design-name" value={name} onChange={(e) => { setName(e.target.value); setDirty(true); }} className="min-w-0 flex-1 rounded bg-transparent px-1 py-1 font-medium hover:bg-surface-muted" />
          {dirty && <span className="hidden text-xs text-muted-foreground sm:inline">Unsaved</span>}
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" onClick={undo} disabled={history.index === 0} aria-label="Undo"><Undo2 /></Button>
          <Button variant="ghost" size="icon" onClick={redo} disabled={history.index >= history.stack.length - 1} aria-label="Redo"><Redo2 /></Button>
          <span className="mx-1 h-5 w-px bg-border" />
          <Button variant="ghost" size="icon" onClick={() => setZoom((z) => Math.max(0.5, +(z - 0.25).toFixed(2)))} aria-label="Zoom out"><ZoomOut /></Button>
          <span className="w-11 text-center text-xs tabular-nums text-muted-foreground" aria-live="polite">{Math.round(zoom * 100)}%</span>
          <Button variant="ghost" size="icon" onClick={() => setZoom((z) => Math.min(3, +(z + 0.25).toFixed(2)))} aria-label="Zoom in"><ZoomIn /></Button>
          <Button variant="ghost" size="icon" onClick={() => setZoom(1)} aria-label="Reset zoom"><Maximize /></Button>
        </div>
        <div className="flex items-center gap-2">
          <Button variant={preview ? "primary" : "secondary"} size="sm" onClick={() => setPreview((p) => !p)} aria-pressed={preview}><Eye /> Preview</Button>
          <Button variant="secondary" size="sm" onClick={save}><Save /> Save draft</Button>
          <Button size="sm" onClick={() => setConfirmSubmit(true)} disabled={!submittable} title={submittable ? undefined : "Fix the errors listed in Print check"}><Send /> Submit</Button>
        </div>
      </div>

      {lockedVersion && (
        <div className="border-b border-border bg-info-soft px-4 py-2 text-xs text-info">
          v{lockedVersion.number} is {lockedVersion.status === "approved" ? "approved" : "in review"} and locked. Saving creates v{(initial.design?.versionIds.length ?? 0) + 1} as a new draft — existing SKUs and orders keep using v{lockedVersion.number}.
        </div>
      )}
      {notice && (
        <div role="status" className={cn("border-b border-border px-4 py-2 text-xs", notice.tone === "ok" ? "bg-success-soft text-success" : "bg-danger-soft text-danger")}>
          {notice.text}
        </div>
      )}

      <div className="flex flex-1 flex-col lg:min-h-0 lg:flex-row">
        {/* Left panel */}
        <aside className="order-2 border-t border-border bg-surface lg:order-1 lg:w-64 lg:shrink-0 lg:overflow-y-auto lg:border-r lg:border-t-0">
          <div role="tablist" aria-label="Studio tools" className="grid grid-cols-3 border-b border-border">
            {([["add", "Add", ImagePlus], ["templates", "Templates", LayoutTemplate], ["layers", "Layers", LayersIcon]] as const).map(([id, label, Icon]) => (
              <button key={id} role="tab" aria-selected={tab === id} onClick={() => setTab(id)} className={cn("flex flex-col items-center gap-1 py-2.5 text-xs text-muted-foreground", tab === id && "border-b-2 border-primary text-primary")}>
                <Icon className="size-4" aria-hidden />
                {label}
              </button>
            ))}
          </div>
          <div className="space-y-4 p-4">
            {tab === "add" && (
              <>
                <div className="space-y-1.5">
                  <Label htmlFor="product">Product</Label>
                  <Select value={productId} onValueChange={changeProduct}>
                    <SelectTrigger id="product"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {PRODUCTS.map((p) => <SelectItem key={p.id} value={p.id} disabled={!p.variants.some((v) => v.inStock)}>{p.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                {product.printAreas.length > 1 && (
                  <div className="space-y-1.5">
                    <Label htmlFor="area">Print area</Label>
                    <Select value={area.id} onValueChange={setPrintAreaId}>
                      <SelectTrigger id="area"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {product.printAreas.map((a) => <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                <input ref={fileRef} type="file" accept={ACCEPTED_UPLOAD_TYPES.join(",")} className="sr-only" onChange={(e) => { const f = e.target.files?.[0]; if (f) onUpload(f); e.target.value = ""; }} />
                <Button variant="secondary" className="w-full" onClick={() => fileRef.current?.click()}><ImagePlus /> Upload image</Button>
                <Button variant="secondary" className="w-full" onClick={() => addText()}><Type /> Add text</Button>
                <p className="text-xs text-muted-foreground">PNG with transparency works best. Upload only artwork you own or are licensed to use.</p>
              </>
            )}
            {tab === "templates" && (
              <ul className="space-y-2">
                {TEMPLATES.map((t) => (
                  <li key={t.id}>
                    <button onClick={() => applyTemplate(t.id)} className="w-full rounded-lg border border-border p-3 text-left text-sm hover:border-primary hover:bg-primary-soft">
                      <div className="font-medium">{t.name}</div>
                      <div className="text-xs text-muted-foreground">Adds editable text layers</div>
                    </button>
                  </li>
                ))}
              </ul>
            )}
            {tab === "layers" && (
              layers.length === 0 ? (
                <p className="text-sm text-muted-foreground">No layers yet. Add an image or text.</p>
              ) : (
                <ul className="space-y-1">
                  {[...layers].reverse().map((l) => (
                    <li key={l.id} className={cn("flex items-center gap-1 rounded-lg border border-transparent p-1.5 text-sm", selectedId === l.id && "border-primary bg-primary-soft")}>
                      <button onClick={() => setSelectedId(l.id)} className="flex min-w-0 flex-1 items-center gap-2 text-left">
                        {l.kind === "image" ? <ImagePlus className="size-4 shrink-0" aria-hidden /> : <Type className="size-4 shrink-0" aria-hidden />}
                        <span className="truncate">{l.kind === "image" ? "Image" : l.text}</span>
                        {errorLayerIds.has(l.id) && <AlertCircle className="size-3.5 shrink-0 text-danger" aria-label="Has errors" />}
                      </button>
                      <button onClick={() => move(l.id, 1)} aria-label="Bring forward" className="rounded p-1 hover:bg-surface-muted"><ArrowUp className="size-3.5" /></button>
                      <button onClick={() => move(l.id, -1)} aria-label="Send backward" className="rounded p-1 hover:bg-surface-muted"><ArrowDown className="size-3.5" /></button>
                      <button onClick={() => remove(l.id)} aria-label="Delete layer" className="rounded p-1 text-danger hover:bg-danger-soft"><Trash2 className="size-3.5" /></button>
                    </li>
                  ))}
                </ul>
              )
            )}
          </div>
        </aside>

        {/* Canvas / preview */}
        <section aria-label="Canvas" className="relative order-1 h-[60dvh] flex-1 bg-surface-muted lg:order-2 lg:h-auto">
          {preview ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 overflow-auto p-6">
              <div className="w-full max-w-xs">
                <TumblerMockup category={product.category} shape={shapeFor(product.id)} color={variant.colorHex} layers={layers} printArea={area} label="Design preview on product" />
              </div>
              <div className="flex gap-2" role="radiogroup" aria-label="Preview color">
                {product.variants.map((v) => (
                  <button key={v.id} role="radio" aria-checked={v.id === variant.id} aria-label={v.name} onClick={() => setVariantId(v.id)} className={cn("size-8 rounded-full ring-1 ring-black/10", v.id === variant.id && "ring-2 ring-primary ring-offset-2")} style={{ background: v.colorHex }} />
                ))}
              </div>
              <p className="text-xs text-muted-foreground">Mockup preview — front-facing view. Final colors may vary slightly.</p>
            </div>
          ) : (
            <StudioCanvas area={area} layers={layers} selectedId={selectedId} zoom={zoom} errorLayerIds={errorLayerIds} onSelect={setSelectedId} onChange={update} />
          )}
        </section>

        {/* Right panel */}
        <aside className="order-3 space-y-5 border-t border-border bg-surface p-4 lg:w-72 lg:shrink-0 lg:overflow-y-auto lg:border-l lg:border-t-0">
          {selected ? (
            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold">{selected.kind === "text" ? "Text" : "Image"} properties</h2>
                <Button variant="ghost" size="sm" onClick={() => remove(selected.id)} className="text-danger"><Trash2 /> Delete</Button>
              </div>
              {selected.kind === "text" && (
                <>
                  <div className="space-y-1.5">
                    <Label htmlFor="p-text">Text</Label>
                    <Textarea id="p-text" value={selected.text} onChange={(e) => update(selected.id, { text: e.target.value })} />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="col-span-2 space-y-1.5">
                      <Label htmlFor="p-font">Font</Label>
                      <Select value={selected.fontFamily} onValueChange={(v) => update(selected.id, { fontFamily: v })}>
                        <SelectTrigger id="p-font" style={{ fontFamily: selected.fontFamily }}><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {FONTS.map((f) => <SelectItem key={f} value={f} style={{ fontFamily: f }}>{f}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="p-size">Size (pt)</Label>
                      <Input id="p-size" type="number" min={4} max={400} value={selected.fontSize} onChange={(e) => update(selected.id, { fontSize: Math.max(4, Number(e.target.value) || 4) })} />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="p-color">Color</Label>
                      <input id="p-color" type="color" value={selected.fill} onChange={(e) => update(selected.id, { fill: e.target.value })} className="h-10 w-full cursor-pointer rounded-lg border border-border bg-surface p-1" />
                    </div>
                  </div>
                  <div className="flex gap-1">
                    {(["bold", "italic"] as const).map((style) => {
                      const on = selected.fontStyle?.includes(style) ?? false;
                      const Icon = style === "bold" ? Bold : Italic;
                      return (
                        <Button key={style} variant={on ? "primary" : "secondary"} size="icon" aria-pressed={on} aria-label={style}
                          onClick={() => {
                            const set = new Set((selected.fontStyle ?? "").split(" ").filter((s) => s && s !== "normal"));
                            if (on) set.delete(style); else set.add(style);
                            update(selected.id, { fontStyle: set.size ? [...set].join(" ") : "normal" });
                          }}>
                          <Icon />
                        </Button>
                      );
                    })}
                    <Select value={selected.align} onValueChange={(v) => update(selected.id, { align: v as DesignLayer["align"] })}>
                      <SelectTrigger aria-label="Alignment" className="ml-auto w-28"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="left">Left</SelectItem>
                        <SelectItem value="center">Center</SelectItem>
                        <SelectItem value="right">Right</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}
              <div className="grid grid-cols-2 gap-2">
                {(["x", "y", "width", "rotation"] as const).map((k) => (
                  <div key={k} className="space-y-1">
                    <Label htmlFor={`p-${k}`} className="text-xs capitalize text-muted-foreground">{k === "rotation" ? "Rotation (°)" : `${k} (in)`}</Label>
                    <Input
                      id={`p-${k}`}
                      type="number"
                      step={k === "rotation" ? 1 : 0.05}
                      value={k === "rotation" ? Math.round(selected[k]) : +selected[k].toFixed(2)}
                      onChange={(e) => {
                        const n = Number(e.target.value);
                        if (Number.isNaN(n)) return;
                        if (k === "width" && selected.kind === "image") update(selected.id, { width: n, height: n * (selected.height / selected.width) });
                        else update(selected.id, { [k]: n });
                      }}
                      className="h-8"
                    />
                  </div>
                ))}
              </div>
              <Button variant="ghost" size="sm" className="w-full" onClick={() => update(selected.id, { x: (area.widthIn - selected.width) / 2 })}>Center horizontally</Button>
              {selectedDpi !== undefined && (
                <p className={cn("rounded-lg p-2 text-xs", selectedDpi >= RECOMMENDED_DPI ? "bg-success-soft text-success" : selectedDpi >= 150 ? "bg-warning-soft text-warning" : "bg-danger-soft text-danger")}>
                  Prints at {Math.round(selectedDpi)} DPI ({selected.naturalWidthPx}×{selected.naturalHeightPx}px source)
                </p>
              )}
            </section>
          ) : (
            <p className="text-sm text-muted-foreground">Select an element to edit its properties. Use arrow keys to nudge, Delete to remove.</p>
          )}

          <section className="space-y-2 border-t border-border pt-4">
            <h2 className="text-sm font-bold">Print requirements</h2>
            <dl className="grid grid-cols-2 gap-y-1 text-xs">
              <dt className="text-muted-foreground">Print area</dt><dd>{area.widthIn}″ × {area.heightIn}″</dd>
              <dt className="text-muted-foreground">At 300 DPI</dt><dd>{Math.round(area.widthIn * 300)} × {Math.round(area.heightIn * 300)} px</dd>
              <dt className="text-muted-foreground">Safe margin</dt><dd>{area.safeMarginIn}″</dd>
              <dt className="text-muted-foreground">Method</dt><dd>{product.printMethod}</dd>
            </dl>
          </section>

          <section className="space-y-2 border-t border-border pt-4" aria-live="polite">
            <h2 className="text-sm font-bold">Print check</h2>
            {issues.length === 0 ? (
              <p className="flex items-center gap-2 text-xs text-success"><CheckCircle2 className="size-4" /> Ready to print</p>
            ) : (
              <ul className="space-y-1.5">
                {issues.map((i, n) => (
                  <li key={n}>
                    <button onClick={() => i.layerId && setSelectedId(i.layerId)} className={cn("flex w-full gap-2 rounded-lg p-2 text-left text-xs", i.level === "error" ? "bg-danger-soft text-danger" : "bg-warning-soft text-warning")}>
                      {i.level === "error" ? <AlertCircle className="mt-px size-3.5 shrink-0" aria-label="Error" /> : <AlertTriangle className="mt-px size-3.5 shrink-0" aria-label="Warning" />}
                      {i.message}
                    </button>
                  </li>
                ))}
              </ul>
            )}
            <Button variant="secondary" size="sm" className="w-full" onClick={downloadPng} disabled={busy || layers.length === 0}>
              <Download /> {busy ? "Rendering…" : "Download print PNG (300 DPI)"}
            </Button>
            <p className="text-[11px] text-muted-foreground">TIFF and final PNG are generated by the conversion worker after submission.</p>
          </section>
        </aside>
      </div>

      <ConfirmDialog open={confirmSubmit} title="Submit design for review?" confirmLabel="Submit" onCancel={() => setConfirmSubmit(false)} onConfirm={submit}>
        This version will be locked and sent to our team for review. Print files (PNG + TIFF) are generated automatically.
        {issues.some((i) => i.level === "warning") && <span className="mt-2 block text-warning">There are {issues.filter((i) => i.level === "warning").length} warning(s) — you can still submit.</span>}
      </ConfirmDialog>
    </div>
  );
}
