"use client";

import { CheckCircle2, Download, XCircle } from "lucide-react";
import { useMemo } from "react";
import { PageHeader } from "@/components/app/app-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { findVariant } from "@/lib/mock/catalog";
import { useStore, type State } from "@/lib/store";
import { formatIDR } from "@/lib/utils";

const CAPTURED: State["orders"][number]["status"][] = ["sent_to_production", "in_production", "shipped", "delivered", "returned"];

/** Each order's ledger must match its status: reserved while approved, captured once in production. */
function reconcile(s: State) {
  return s.orders.map((o) => {
    const entries = s.ledger.filter((e) => e.orderId === o.id);
    const sum = (t: string) => entries.filter((e) => e.type === t).reduce((n, e) => n + e.amount, 0);
    const reserved = sum("reserve") - sum("release") - sum("capture");
    const captured = sum("capture");
    const expected = CAPTURED.includes(o.status)
      ? { reserved: 0, captured: o.productionCharge }
      : o.status === "approved"
        ? { reserved: o.productionCharge, captured: 0 }
        : { reserved: 0, captured: 0 };
    return { order: o, reserved, captured, expected, ok: reserved === expected.reserved && captured === expected.captured };
  });
}

function handoffCsv(s: State) {
  // File-based MQC handoff (fallback when no API): one row per unit line.
  const rows = [["order_id", "external_id", "user", "shop", "marketplace", "sku_code", "product", "variant", "qty", "design_version", "print_file_png", "print_file_tiff", "ship_to_name", "ship_to_city", "country"]];
  for (const o of s.orders.filter((o) => o.status === "approved")) {
    for (const l of o.lines) {
      const v = s.versions.find((x) => x.id === l.designVersionId);
      const f = l.variantId ? findVariant(l.variantId) : undefined;
      const shop = s.shops.find((x) => x.id === o.shopId);
      rows.push([o.id, o.externalId, s.users.find((x) => x.id === o.userId)?.name ?? "", shop?.name ?? "", o.marketplace, l.skuCode, f?.product.name ?? "", f?.variant.name ?? "", String(l.quantity), v?.id ?? "", v?.printFiles?.png ?? "", v?.printFiles?.tiff ?? "", o.buyerName, o.shipToCity, o.shipToCountry]);
    }
  }
  return rows.map((r) => r.map((c) => `"${c.replaceAll('"', '""')}"`).join(",")).join("\n");
}

export default function ReportsPage() {
  const state = useStore((s) => s);
  const rows = useMemo(() => reconcile(state), [state]);
  const mismatches = rows.filter((r) => !r.ok);
  const captured = state.ledger.filter((e) => e.type === "capture").reduce((n, e) => n + e.amount, 0);
  const reserved = rows.reduce((n, r) => n + r.reserved, 0);
  const topUps = state.ledger.filter((e) => e.type === "top_up").reduce((n, e) => n + e.amount, 0);
  const readyForHandoff = state.orders.filter((o) => o.status === "approved").length;

  function download() {
    const blob = new Blob([handoffCsv(state)], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `mqc-handoff-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  return (
    <>
      <PageHeader title="Reconciliation" description="Verify that wallet movements match order states, and export production batches." />
      <div className="grid gap-4 sm:grid-cols-3">
        <Card><CardHeader><CardDescription>User top-ups</CardDescription><CardTitle className="text-2xl">{formatIDR(topUps)}</CardTitle></CardHeader></Card>
        <Card><CardHeader><CardDescription>Captured (production revenue)</CardDescription><CardTitle className="text-2xl">{formatIDR(captured)}</CardTitle></CardHeader></Card>
        <Card><CardHeader><CardDescription>Currently reserved</CardDescription><CardTitle className="text-2xl">{formatIDR(reserved)}</CardTitle></CardHeader></Card>
      </div>

      <Card className="mt-6">
        <CardHeader className="flex-row flex-wrap items-center justify-between gap-3">
          <div>
            <CardTitle>MQC handoff batch</CardTitle>
            <CardDescription>{readyForHandoff} approved order(s) ready. Use when the MQC API is unavailable (file/SFTP workflow).</CardDescription>
          </div>
          <Button variant="secondary" onClick={download} disabled={!readyForHandoff}><Download /> Export CSV</Button>
        </CardHeader>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {mismatches.length === 0 ? <CheckCircle2 className="size-4 text-success" /> : <XCircle className="size-4 text-danger" />}
            Order ↔ ledger check
          </CardTitle>
          <CardDescription>{mismatches.length === 0 ? "All orders reconcile." : `${mismatches.length} order(s) don’t match their expected ledger state.`}</CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto px-0">
          <table className="w-full min-w-[640px] text-sm">
            <thead className="border-b border-border text-left text-xs text-muted-foreground">
              <tr className="[&_th]:px-5 [&_th]:py-2 [&_th]:font-medium"><th>Order</th><th>Status</th><th className="text-right">Reserved</th><th className="text-right">Captured</th><th className="text-right">Expected</th><th>Result</th></tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rows.map((r) => (
                <tr key={r.order.id} className="[&_td]:px-5 [&_td]:py-2">
                  <td className="font-mono text-xs">{r.order.externalId}</td>
                  <td>{r.order.status.replaceAll("_", " ")}</td>
                  <td className="text-right">{formatIDR(r.reserved)}</td>
                  <td className="text-right">{formatIDR(r.captured)}</td>
                  <td className="text-right text-xs text-muted-foreground">{formatIDR(r.expected.reserved)} / {formatIDR(r.expected.captured)}</td>
                  <td>{r.ok ? <span className="text-success">OK</span> : <span className="text-danger">Mismatch</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </>
  );
}
