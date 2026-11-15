"use client";

import { RotateCcw, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { resetDemo } from "@/lib/store";

export function DemoControls() {
  return (
    <div className="space-y-1 rounded-lg border border-dashed border-border p-2 text-xs text-muted-foreground">
      <div className="px-1 font-medium uppercase tracking-wide">Prototype</div>
      <Link href="/admin" className="flex items-center gap-2 rounded px-1 py-1 hover:bg-surface-muted hover:text-foreground"><ShieldCheck className="size-3.5" /> Switch to admin</Link>
      <Link href="/app" className="flex items-center gap-2 rounded px-1 py-1 hover:bg-surface-muted hover:text-foreground">Switch to user workspace</Link>
      <button onClick={resetDemo} className="flex w-full items-center gap-2 rounded px-1 py-1 text-left hover:bg-surface-muted hover:text-foreground"><RotateCcw className="size-3.5" /> Reset demo data</button>
    </div>
  );
}
