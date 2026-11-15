import type { LedgerEntry, OrderStatus } from "./types";

/**
 * Prepaid wallet, one per user (shared by all their shops). Users top up; approving an order reserves funds;
 * handoff to production captures them; cancellation before handoff
 * releases them. Balances are always derived from the ledger, never stored.
 *
 *   available = Σ top_up + release + refund + adjustment − reserve (as signed amounts)
 *   reserved  = Σ reserve − Σ release − Σ capture   (for still-open reservations)
 */
export function balances(entries: LedgerEntry[]) {
  let available = 0;
  let reserved = 0;
  for (const e of entries) {
    switch (e.type) {
      case "top_up":
      case "refund":
      case "adjustment":
        available += e.amount;
        break;
      case "reserve":
        available -= e.amount; // amount stored positive
        reserved += e.amount;
        break;
      case "release":
        available += e.amount;
        reserved -= e.amount;
        break;
      case "capture":
        reserved -= e.amount;
        break;
    }
  }
  return { available, reserved, total: available + reserved };
}

/** Ledger side effect required when an order moves between statuses. */
export function ledgerEffect(
  from: OrderStatus,
  to: OrderStatus,
): LedgerEntry["type"] | null {
  if (to === "approved") return "reserve";
  if (to === "sent_to_production") return "capture";
  if (to === "cancelled" && (from === "approved")) return "release";
  if (to === "on_hold" && from === "approved") return "release";
  return null;
}

export const LEDGER_LABEL: Record<LedgerEntry["type"], string> = {
  top_up: "Top-up",
  reserve: "Reserved for order",
  release: "Reservation released",
  capture: "Charged for production",
  refund: "Refund",
  adjustment: "Adjustment",
};
