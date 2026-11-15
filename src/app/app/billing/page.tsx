"use client";

import { ArrowDownLeft, ArrowUpRight, Lock, TrendingUp, Wallet } from "lucide-react";
import { useMemo, useState } from "react";
import { PageHeader, StatCard } from "@/components/app/app-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Label } from "@/components/ui/input";
import { LEDGER_LABEL } from "@/lib/domain/wallet";
import { CURRENT_USER_ID } from "@/lib/mock/seed";
import { topUp, useStore } from "@/lib/store";
import { userSummary } from "@/lib/store/selectors";
import { cn, formatDateTime, formatIDR, formatPercent } from "@/lib/utils";

const PRESETS = [200_000, 500_000, 1_000_000];

export default function BillingPage() {
  const state = useStore((s) => s);
  const sum = useMemo(() => userSummary(state, CURRENT_USER_ID), [state]);
  const ledger = state.ledger.filter((e) => e.userId === CURRENT_USER_ID).slice().reverse();
  const [amount, setAmount] = useState("");

  return (
    <>
      <PageHeader title="Wallet & billing" description="One prepaid balance shared by all your shops. Funds are reserved at approval and charged at production." />
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Available" value={formatIDR(sum.wallet.available)} hint="Can be used for new orders" icon={Wallet} />
        <StatCard label="Reserved" value={formatIDR(sum.wallet.reserved)} hint="Held for approved orders" icon={Lock} />
        <StatCard label="Est. profit (all time)" value={formatIDR(sum.profit)} hint={`${formatPercent(sum.marginRate)} margin`} icon={TrendingUp} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_2fr]">
        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Top up</CardTitle></CardHeader>
            <CardContent>
              <form className="space-y-3" onSubmit={(e) => { e.preventDefault(); const n = Number(amount); if (n > 0) { topUp(CURRENT_USER_ID, n); setAmount(""); } }}>
                <div className="flex gap-2">
                  {PRESETS.map((p) => (
                    <button key={p} type="button" onClick={() => setAmount(String(p))} className={cn("flex-1 rounded-lg border border-border px-2 py-2 text-xs hover:bg-surface-muted", amount === String(p) && "border-primary bg-primary-soft text-primary")}>
                      {formatIDR(p)}
                    </button>
                  ))}
                </div>
                <Label htmlFor="amt">Amount (IDR)</Label>
                <Input id="amt" inputMode="numeric" value={amount} onChange={(e) => setAmount(e.target.value.replace(/\D/g, ""))} />
                <Button type="submit" className="w-full" disabled={!(Number(amount) > 0)}>Pay with Midtrans / Xendit (mock)</Button>
                <p className="text-xs text-muted-foreground">Prototype: the balance is credited instantly. Held orders are re-checked automatically.</p>
              </form>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Revenue & margin</CardTitle></CardHeader>
            <CardContent>
              <table className="w-full text-sm">
                <tbody className="[&_td]:py-1.5 [&_td:last-child]:text-right">
                  <tr><td>Sales (marketplace)</td><td>{formatIDR(sum.revenue)}</td></tr>
                  <tr className="text-muted-foreground"><td>Marketplace fees (est.)</td><td>− {formatIDR(sum.marketplaceFees)}</td></tr>
                  <tr className="text-muted-foreground"><td>Production & fulfillment</td><td>− {formatIDR(sum.productionCost)}</td></tr>
                  <tr className="border-t border-border font-semibold"><td>Profit</td><td>{formatIDR(sum.profit)}</td></tr>
                </tbody>
              </table>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader><CardTitle>Transactions</CardTitle></CardHeader>
          <CardContent className="overflow-x-auto px-0">
            <table className="w-full min-w-[520px] text-sm">
              <thead className="border-b border-border text-left text-xs text-muted-foreground">
                <tr className="[&_th]:px-5 [&_th]:py-2 [&_th]:font-medium"><th>Date</th><th>Type</th><th>Reference</th><th className="text-right">Amount</th></tr>
              </thead>
              <tbody className="divide-y divide-border">
                {ledger.map((e) => {
                  const credit = e.type === "top_up" || e.type === "release" || e.type === "refund";
                  return (
                    <tr key={e.id} className="[&_td]:px-5 [&_td]:py-2.5">
                      <td className="text-muted-foreground">{formatDateTime(e.at)}</td>
                      <td className="flex items-center gap-1.5">
                        {credit ? <ArrowDownLeft className="size-3.5 text-success" aria-hidden /> : <ArrowUpRight className="size-3.5 text-muted-foreground" aria-hidden />}
                        {LEDGER_LABEL[e.type]}
                      </td>
                      <td className="font-mono text-xs text-muted-foreground">{e.orderId ?? e.note ?? "—"}</td>
                      <td className={cn("text-right", credit && "text-success")}>{credit ? "+" : e.type === "capture" ? "" : "−"}{formatIDR(e.amount)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
