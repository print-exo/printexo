/**
 * Core domain types. These mirror the future PostgreSQL schema so the mock
 * layer can be swapped for a real API without touching the UI.
 * Money is integer IDR. Dimensions are inches unless suffixed (Px, Mm).
 */

export type Role = "user" | "admin" | "designer" | "operator";

/* ---------- Catalog ---------- */

export interface PrintArea {
  id: string;
  name: string; // e.g. "Full wrap"
  widthIn: number;
  heightIn: number;
  /** Inset from each edge that artwork should stay inside. */
  safeMarginIn: number;
  /** Extra price charged when this area is printed. */
  printFee: number;
}

export interface ProductVariant {
  id: string;
  productId: string;
  name: string; // e.g. "Matte Black"
  /** Main body colour; drives the vector mockup and the default swatch. */
  colorHex: string;
  /** CSS background for the colour button when one hex isn't enough (e.g. an ombre). */
  swatch?: string;
  /** Product photo of this variant (path under /public). */
  image?: string;
  /** Extra photos of this variant, shown after `image` in the gallery. */
  gallery?: string[];
  /** One or two sentences: the finish, and which designs print well on it. */
  description?: string;
  baseCost: number;
  inStock: boolean;
}

export type ProductCategory = "tumbler" | "mug" | "bottle";

export interface Product {
  id: string;
  slug: string;
  /** Supplier model code, e.g. "40BBB". */
  code?: string;
  name: string;
  category: ProductCategory;
  description: string;
  capacityOz: number;
  material: string;
  printMethod: string;
  productionDays: [min: number, max: number];
  weightGrams: number;
  shipsTo: string[]; // ISO country codes
  printAreas: PrintArea[];
  variants: ProductVariant[];
  featured?: boolean;
}

/* ---------- Designs ---------- */

export type DesignStatus = "draft" | "submitted" | "approved" | "rejected";
export type ConversionStatus = "not_started" | "processing" | "ready" | "failed";

export interface DesignLayer {
  id: string;
  kind: "image" | "text";
  x: number; // inches from print-area top-left
  y: number;
  width: number; // inches
  height: number;
  rotation: number;
  // image
  src?: string;
  naturalWidthPx?: number;
  naturalHeightPx?: number;
  // text
  text?: string;
  fontFamily?: string;
  fontSize?: number; // points
  fill?: string;
  fontStyle?: string;
  align?: "left" | "center" | "right";
}

/**
 * An immutable snapshot of artwork. Once submitted it is never edited;
 * edits create a new version. Orders and SKUs reference a version id so
 * production always prints exactly what was approved.
 */
export interface DesignVersion {
  id: string;
  designId: string;
  number: number;
  productId: string;
  printAreaId: string;
  layers: DesignLayer[];
  thumbnail?: string; // data URL (mock) / signed URL (real)
  createdAt: string;
  status: DesignStatus;
  conversion: ConversionStatus;
  conversionError?: string;
  reviewNote?: string;
  printFiles?: { png?: string; tiff?: string };
}

export interface Design {
  id: string;
  /** Designs belong to the user, so one design can be sold through any of their shops. */
  userId: string;
  name: string;
  currentVersionId: string;
  versionIds: string[];
  updatedAt: string;
}

/* ---------- Shops & SKUs ---------- */

export type Marketplace = "tiktok_shop" | "shopee" | "shopify";

export type ShopStatus = "connected" | "pending" | "error" | "disconnected";

/**
 * One storefront on one marketplace. A user can own many shops, including
 * several on the same marketplace (e.g. two TikTok Shops).
 */
export interface Shop {
  id: string;
  userId: string;
  marketplace: Marketplace;
  /** Shop name / handle on the marketplace, e.g. "kopisenja.id". Unique per user + marketplace. */
  name: string;
  status: ShopStatus;
  createdAt: string;
  lastSyncAt?: string;
}

/** A sellable listing in one shop: variant + exact design version + price. */
export interface Sku {
  id: string;
  userId: string;
  shopId: string;
  /** Code used on the marketplace listing; orders are matched on this. Unique per shop. */
  code: string;
  title: string;
  variantId: string;
  designVersionId: string;
  retailPrice: number;
  active: boolean;
}

/* ---------- Orders ---------- */

export type OrderStatus =
  | "received" // imported from marketplace
  | "on_hold" // blocked: unmapped SKU, insufficient balance, design issue
  | "pending_review" // passed auto-checks, waiting for admin
  | "approved" // admin approved, balance reserved
  | "sent_to_production" // handed off to MQC / warehouse
  | "in_production"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "returned";

export type HoldReason =
  | "unmapped_sku"
  | "insufficient_balance"
  | "design_not_approved"
  | "print_file_missing"
  | "address_issue";

export interface OrderLine {
  id: string;
  skuCode: string;
  quantity: number;
  /** Resolved at import time; undefined when the SKU code is unknown in that shop. */
  skuId?: string;
  /** Snapshotted so later SKU edits never change what this order prints. */
  designVersionId?: string;
  variantId?: string;
  unitRetailPrice: number;
}

export interface OrderEvent {
  at: string;
  status: OrderStatus;
  actor: "system" | "user" | "admin" | "mqc";
  note?: string;
}

export interface Order {
  id: string;
  userId: string;
  shopId: string;
  /** Snapshot of the shop's marketplace at import. */
  marketplace: Marketplace;
  externalId: string;
  /** The marketplace buyer the parcel ships to. */
  buyerName: string;
  shipToCity: string;
  shipToCountry: string;
  lines: OrderLine[];
  status: OrderStatus;
  holdReasons: HoldReason[];
  /** What the user pays the platform (production + fulfillment + shipping). */
  productionCharge: number;
  createdAt: string;
  events: OrderEvent[];
  trackingNumber?: string;
}

/* ---------- Money ---------- */

export type LedgerEntryType =
  | "top_up"
  | "reserve" // hold funds when order approved
  | "release" // un-hold on cancel before production
  | "capture" // reserved funds become platform revenue at handoff
  | "refund" // returned to balance after capture (e.g. production defect)
  | "adjustment";

export interface LedgerEntry {
  id: string;
  /** The wallet is per user and shared by all of their shops. */
  userId: string;
  type: LedgerEntryType;
  amount: number; // positive = credit to available balance, negative = debit
  orderId?: string;
  at: string;
  note?: string;
}

/** An account on the platform. Owns the wallet, designs and shops. */
export interface User {
  id: string;
  name: string;
  email: string;
  /** WhatsApp number used by ops during shop onboarding. */
  phone?: string;
  country: string;
  joinedAt: string;
  status: "active" | "pending_verification" | "suspended";
  plan: "starter" | "growth";
}
