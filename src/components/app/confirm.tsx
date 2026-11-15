"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { Button } from "@/components/ui/button";

/** Accessible confirmation step (native <dialog>, never window.confirm). */
export function ConfirmDialog({
  open,
  title,
  children,
  confirmLabel = "Confirm",
  tone = "primary",
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  children?: ReactNode;
  confirmLabel?: string;
  tone?: "primary" | "danger";
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      onCancel={(e) => {
        e.preventDefault();
        onCancel();
      }}
      className="m-auto w-[min(28rem,calc(100%-2rem))] rounded-[var(--radius-card)] border border-border bg-surface p-0 text-foreground backdrop:bg-black/30"
    >
      <div className="space-y-3 p-6">
        <h2 className="text-lg font-bold">{title}</h2>
        {children && <div className="text-sm text-muted-foreground">{children}</div>}
      </div>
      <div className="flex justify-end gap-2 border-t border-border bg-surface-muted/50 px-6 py-4">
        <Button variant="secondary" onClick={onCancel}>Cancel</Button>
        <Button variant={tone === "danger" ? "danger" : "primary"} onClick={onConfirm} autoFocus>
          {confirmLabel}
        </Button>
      </div>
    </dialog>
  );
}
