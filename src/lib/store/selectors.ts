import type { State } from "./index";
import { balances } from "@/lib/domain/wallet";
import { MARKETPLACE_FEE_RATE } from "@/lib/domain/pricing";

/** Totals for a user, optionally narrowed to one shop. The wallet is always user-wide. */
export function userSummary(s: State, userId: string, shopId?: string) {
  const orders = s.orders.filter((o) => o.userId === userId && (!shopId || o.shopId === shopId));
  const live = orders.filter((o) => o.status !== "cancelled" && o.status !== "returned");
  let revenue = 0;
  let marketplaceFees = 0;
  for (const o of live) {
    const r = o.lines.reduce((sum, l) => sum + l.unitRetailPrice * l.quantity, 0);
    revenue += r;
    marketplaceFees += Math.round(r * MARKETPLACE_FEE_RATE[o.marketplace]);
  }
  const productionCost = live.reduce((sum, o) => sum + o.productionCharge, 0);
  const profit = revenue - marketplaceFees - productionCost;
  return {
    orders,
    revenue,
    marketplaceFees,
    productionCost,
    profit,
    marginRate: revenue ? profit / revenue : 0,
    wallet: balances(s.ledger.filter((e) => e.userId === userId)),
    onHold: orders.filter((o) => o.status === "on_hold"),
    inProduction: orders.filter((o) => o.status === "sent_to_production" || o.status === "in_production"),
    awaitingReview: orders.filter((o) => o.status === "pending_review" || o.status === "approved"),
  };
}
