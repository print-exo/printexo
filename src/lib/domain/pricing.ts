import type { Marketplace, PrintArea, ProductVariant } from "./types";

/**
 * Pricing rules. All amounts integer IDR.
 *
 * User pays platform:     productionCost = variant.baseCost + Σ printFee(areas used)
 *                         + fulfillmentFee (per order) + shipping estimate
 * Shop earns:             retailPrice − marketplace commission − payment fee − productionCost
 */

export const FULFILLMENT_FEE_PER_ORDER = 6_000; // pick, pack, QC
export const EXTRA_ITEM_FULFILLMENT_FEE = 2_000; // each additional unit in the same order

/** Rough marketplace commission + payment processing estimates. Configurable later. */
export const MARKETPLACE_FEE_RATE: Record<Marketplace, number> = {
  tiktok_shop: 0.08,
  shopee: 0.09,
  shopify: 0.03,
};

export const DOMESTIC_SHIPPING_ESTIMATE = {
  /** Flat estimate for Indonesia (JNE/J&T REG average for ~0.5–1kg). */
  base: 18_000,
  perExtraKg: 9_000,
};

export const DEFAULT_TARGET_MARGIN = 0.3;

export interface CostInput {
  variant: Pick<ProductVariant, "baseCost">;
  printAreas: Pick<PrintArea, "printFee">[];
  quantity?: number;
}

export function unitProductionCost({ variant, printAreas }: CostInput) {
  return variant.baseCost + printAreas.reduce((sum, a) => sum + a.printFee, 0);
}

export function fulfillmentFee(totalUnits: number) {
  if (totalUnits <= 0) return 0;
  return FULFILLMENT_FEE_PER_ORDER + (totalUnits - 1) * EXTRA_ITEM_FULFILLMENT_FEE;
}

export function estimateShipping(totalWeightGrams: number) {
  const kg = Math.max(1, Math.ceil(totalWeightGrams / 1000));
  return DOMESTIC_SHIPPING_ESTIMATE.base + (kg - 1) * DOMESTIC_SHIPPING_ESTIMATE.perExtraKg;
}

/** Round up to a "nice" retail price ending in 900 (e.g. 149.900). */
export function roundRetail(amount: number) {
  return Math.ceil((amount + 100) / 1000) * 1000 - 100;
}

/**
 * Suggested price such that, after marketplace fees, the shop keeps
 * `targetMargin` of the retail price as profit.
 *   price × (1 − feeRate − targetMargin) = totalCost
 */
export function suggestedRetailPrice(
  totalCost: number,
  marketplace: Marketplace = "tiktok_shop",
  targetMargin = DEFAULT_TARGET_MARGIN,
) {
  const denominator = 1 - MARKETPLACE_FEE_RATE[marketplace] - targetMargin;
  if (denominator <= 0) throw new Error("Target margin too high for marketplace fees");
  return roundRetail(totalCost / denominator);
}

export interface MarginBreakdown {
  retailPrice: number;
  marketplaceFee: number;
  productionCost: number;
  fulfillment: number;
  shipping: number;
  totalCost: number;
  profit: number;
  marginRate: number;
}

/**
 * Single-unit margin. `shopPaysShipping` is false for marketplaces where
 * the buyer pays shipping (the common TikTok Shop / Shopee setup).
 */
export function marginFor(opts: {
  retailPrice: number;
  unitCost: number;
  weightGrams: number;
  marketplace: Marketplace;
  shopPaysShipping?: boolean;
}): MarginBreakdown {
  const marketplaceFee = Math.round(opts.retailPrice * MARKETPLACE_FEE_RATE[opts.marketplace]);
  const fulfillment = fulfillmentFee(1);
  const shipping = opts.shopPaysShipping ? estimateShipping(opts.weightGrams) : 0;
  const totalCost = opts.unitCost + fulfillment + shipping + marketplaceFee;
  const profit = opts.retailPrice - totalCost;
  return {
    retailPrice: opts.retailPrice,
    marketplaceFee,
    productionCost: opts.unitCost,
    fulfillment,
    shipping,
    totalCost,
    profit,
    marginRate: opts.retailPrice > 0 ? profit / opts.retailPrice : 0,
  };
}
