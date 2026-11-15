"use client";

import { Search, X } from "lucide-react";
import { useMemo, useState } from "react";
import { PageHeader } from "@/components/app/app-shell";
import { MARKETPLACE_LABEL } from "@/components/app/order-detail";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Marketplace, User } from "@/lib/domain/types";
import { COUNTRY_NAME } from "@/lib/mock/catalog";
import { useStore } from "@/lib/store";
import { balances } from "@/lib/domain/wallet";
import { cn, formatDate, formatIDR } from "@/lib/utils";

const STATUS_TONE = { active: "success", pending_verification: "warning", suspended: "danger" } as const;
const SHOP_TONE = { connected: "success", pending: "info", error: "danger", disconnected: "neutral" } as const;
const STATUS_LABEL: Record<User["status"], string> = { active: "Active", pending_verification: "Pending verification", suspended: "Suspended" };

export default function UsersPage() {
  const state = useStore((s) => s);
  const [q, setQ] = useState("");
  const [country, setCountry] = useState("all");
  const [platform, setPlatform] = useState<Marketplace | "all">("all");
  const [status, setStatus] = useState<User["status"] | "all">("all");
  const filtered = q !== "" || country !== "all" || platform !== "all" || status !== "all";

  const shown = useMemo(() => {
    const term = q.trim().toLowerCase();
    return state.users.filter((u) => {
      const shops = state.shops.filter((x) => x.userId === u.id);
      if (country !== "all" && u.country !== country) return false;
      if (status !== "all" && u.status !== status) return false;
      // Platform = the user has at least one shop on that marketplace.
      if (platform !== "all" && !shops.some((x) => x.marketplace === platform)) return false;
      if (term && ![u.name, u.email, ...shops.map((x) => x.name)].some((v) => v.toLowerCase().includes(term))) return false;
      return true;
    });
  }, [state.users, state.shops, q, country, platform, status]);

  function clear() {
    setQ("");
    setCountry("all");
    setPlatform("all");
    setStatus("all");
  }

  return (
    <>
      <PageHeader title="Users & shops" description="User accounts with their shops, balances and activity. One wallet per user, shared by all their shops." />

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="relative min-w-56 flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
          <Input aria-label="Search users" placeholder="Search name, email or shop" value={q} onChange={(e) => setQ(e.target.value)} className="pl-9" />
        </div>
        <Select value={country} onValueChange={setCountry}>
          <SelectTrigger aria-label="Filter by country" className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All countries</SelectItem>
            {Object.entries(COUNTRY_NAME).map(([code, name]) => <SelectItem key={code} value={code}>{name}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={platform} onValueChange={(v) => setPlatform(v as Marketplace | "all")}>
          <SelectTrigger aria-label="Filter by platform" className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All platforms</SelectItem>
            {(Object.keys(MARKETPLACE_LABEL) as Marketplace[]).map((mp) => <SelectItem key={mp} value={mp}>{MARKETPLACE_LABEL[mp]}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={status} onValueChange={(v) => setStatus(v as User["status"] | "all")}>
          <SelectTrigger aria-label="Filter by status" className="w-48"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {(Object.keys(STATUS_LABEL) as User["status"][]).map((s) => <SelectItem key={s} value={s}>{STATUS_LABEL[s]}</SelectItem>)}
          </SelectContent>
        </Select>
        {filtered && <Button variant="ghost" size="sm" onClick={clear}><X /> Clear</Button>}
      </div>
      <p className="mb-2 text-xs text-muted-foreground" role="status">
        Showing {shown.length} of {state.users.length} users
      </p>

      <div className="overflow-x-auto rounded-[var(--radius-card)] border border-border bg-surface">
        <table className="w-full min-w-[960px] text-sm">
          <thead className="border-b border-border text-left text-xs text-muted-foreground">
            <tr className="[&_th]:px-4 [&_th]:py-3 [&_th]:font-medium"><th>User</th><th>Shops</th><th>Country</th><th>Joined</th><th className="text-right">Designs</th><th className="text-right">Orders</th><th className="text-right">Available</th><th className="text-right">Reserved</th><th>Status</th></tr>
          </thead>
          <tbody className="divide-y divide-border">
            {shown.map((u) => {
              const w = balances(state.ledger.filter((e) => e.userId === u.id));
              const shops = state.shops.filter((x) => x.userId === u.id);
              const term = q.trim().toLowerCase();
              return (
                <tr key={u.id} className="align-top [&_td]:px-4 [&_td]:py-3">
                  <td><div className="font-medium">{u.name}</div><div className="text-xs text-muted-foreground">{u.email} · {u.plan}</div></td>
                  <td>
                    {shops.length === 0 ? (
                      <span className="text-xs text-muted-foreground">No shops yet</span>
                    ) : (
                      <ul className="space-y-1">
                        {shops.map((x) => {
                          // Dim shops that aren't the reason this row matched the platform / search filter.
                          const match = (platform === "all" || x.marketplace === platform) && (!term || x.name.toLowerCase().includes(term) || u.name.toLowerCase().includes(term) || u.email.toLowerCase().includes(term));
                          return (
                            <li key={x.id} className={cn("flex items-center gap-2", !match && "opacity-50")}>
                              <span>{x.name}</span>
                              <span className="text-xs text-muted-foreground">{MARKETPLACE_LABEL[x.marketplace]}</span>
                              <Badge tone={SHOP_TONE[x.status]}>{x.status}</Badge>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </td>
                  <td>{COUNTRY_NAME[u.country] ?? u.country}</td>
                  <td>{formatDate(u.joinedAt)}</td>
                  <td className="text-right">{state.designs.filter((d) => d.userId === u.id).length}</td>
                  <td className="text-right">{state.orders.filter((o) => o.userId === u.id).length}</td>
                  <td className="text-right">{formatIDR(w.available)}</td>
                  <td className="text-right">{formatIDR(w.reserved)}</td>
                  <td><Badge tone={STATUS_TONE[u.status]}>{STATUS_LABEL[u.status]}</Badge></td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {shown.length === 0 && (
          <div className="p-6 text-center text-sm text-muted-foreground">
            No users match these filters. <button onClick={clear} className="text-primary underline">Clear filters</button>
          </div>
        )}
      </div>
    </>
  );
}
