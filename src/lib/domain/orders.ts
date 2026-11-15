import type {
  DesignVersion,
  HoldReason,
  Order,
  OrderLine,
  OrderStatus,
  Product,
  Sku,
} from "./types";
import { estimateShipping, fulfillmentFee, unitProductionCost } from "./pricing";

/**
 * Order state machine. Any transition not listed here is rejected.
 * Money side effects for each transition are documented in business.md.
 */
export const ORDER_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  received: ["pending_review", "on_hold", "cancelled"],
  on_hold: ["pending_review", "cancelled"],
  pending_review: ["approved", "on_hold", "cancelled"],
  approved: ["sent_to_production", "on_hold", "cancelled"],
  sent_to_production: ["in_production"],
  in_production: ["shipped"],
  shipped: ["delivered", "returned"],
  delivered: ["returned"],
  cancelled: [],
  returned: [],
};

export function canTransition(from: OrderStatus, to: OrderStatus) {
  return ORDER_TRANSITIONS[from].includes(to);
}

/** After handoff to production an order can no longer be cancelled for a refund. */
export function isCancellable(status: OrderStatus) {
  return ORDER_TRANSITIONS[status].includes("cancelled");
}

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  received: "Received",
  on_hold: "On hold",
  pending_review: "Pending review",
  approved: "Approved",
  sent_to_production: "Sent to production",
  in_production: "In production",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
  returned: "Returned",
};

export const HOLD_REASON_LABEL: Record<HoldReason, string> = {
  unmapped_sku: "SKU not mapped to a design",
  insufficient_balance: "Insufficient wallet balance",
  design_not_approved: "Design not approved yet",
  print_file_missing: "Print file not generated",
  address_issue: "Shipping address needs attention",
};

export interface CatalogLookup {
  skus: Sku[];
  versions: DesignVersion[];
  products: Product[];
}

function findVariant(products: Product[], variantId: string) {
  for (const p of products) {
    const v = p.variants.find((v) => v.id === variantId);
    if (v) return { product: p, variant: v };
  }
  return undefined;
}

/**
 * Resolve marketplace SKU codes to the SKUs of the shop the order came from
 * and snapshot the design version and variant onto each line. Done once at import.
 */
export function resolveLines(lines: OrderLine[], shopId: string, lookup: CatalogLookup): OrderLine[] {
  return lines.map((line) => {
    const sku = lookup.skus.find((s) => s.shopId === shopId && s.code === line.skuCode && s.active);
    if (!sku) return { ...line, skuId: undefined, designVersionId: undefined, variantId: undefined };
    return { ...line, skuId: sku.id, designVersionId: sku.designVersionId, variantId: sku.variantId };
  });
}

/** What the platform charges the user's wallet for this order. */
export function computeProductionCharge(lines: OrderLine[], lookup: CatalogLookup) {
  let units = 0;
  let production = 0;
  let weight = 0;
  for (const line of lines) {
    if (!line.variantId || !line.designVersionId) continue;
    const found = findVariant(lookup.products, line.variantId);
    const version = lookup.versions.find((v) => v.id === line.designVersionId);
    if (!found || !version) continue;
    const areas = found.product.printAreas.filter((a) => a.id === version.printAreaId);
    production += unitProductionCost({ variant: found.variant, printAreas: areas }) * line.quantity;
    weight += found.product.weightGrams * line.quantity;
    units += line.quantity;
  }
  if (units === 0) return 0;
  return production + fulfillmentFee(units) + estimateShipping(weight);
}

/**
 * Automatic pre-review checks. Returns the hold reasons that block the
 * order. Balance is checked against *available* (unreserved) funds.
 */
export function evaluateHoldReasons(
  order: Pick<Order, "lines" | "productionCharge">,
  lookup: CatalogLookup,
  availableBalance: number,
): HoldReason[] {
  const reasons = new Set<HoldReason>();
  for (const line of order.lines) {
    if (!line.skuId || !line.designVersionId) {
      reasons.add("unmapped_sku");
      continue;
    }
    const version = lookup.versions.find((v) => v.id === line.designVersionId);
    if (!version || version.status !== "approved") reasons.add("design_not_approved");
    else if (version.conversion !== "ready") reasons.add("print_file_missing");
  }
  if (order.productionCharge > availableBalance) reasons.add("insufficient_balance");
  return [...reasons];
}
