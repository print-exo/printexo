"use client";

import { useSyncExternalStore } from "react";
import type {
  Design,
  DesignLayer,
  DesignVersion,
  LedgerEntry,
  Order,
  OrderStatus,
  Shop,
  Sku,
  User,
} from "@/lib/domain/types";
import { PRODUCTS } from "@/lib/mock/catalog";
import {
  DESIGNS,
  DESIGN_VERSIONS,
  LEDGER,
  ORDERS,
  SHOPS,
  SKUS,
  USERS,
} from "@/lib/mock/seed";
import {
  canTransition,
  computeProductionCharge,
  evaluateHoldReasons,
  resolveLines,
} from "@/lib/domain/orders";
import { balances, ledgerEffect } from "@/lib/domain/wallet";
import { uid } from "@/lib/utils";

/**
 * Prototype data store. Stands in for the backend API: every action here
 * maps to a future endpoint and enforces the same domain rules. State is
 * persisted to localStorage so the demo survives reloads.
 */

export interface State {
  users: User[];
  designs: Design[];
  versions: DesignVersion[];
  skus: Sku[];
  orders: Order[];
  ledger: LedgerEntry[];
  shops: Shop[];
}

// v2: seller → user, stores → shops (multiple per marketplace). Old v1 data is ignored.
const STORAGE_KEY = "pod-platform:v3"; // v3: catalog switched to the real supplier products

const seed: State = {
  users: USERS,
  designs: DESIGNS,
  versions: DESIGN_VERSIONS,
  skus: SKUS,
  orders: ORDERS,
  ledger: LEDGER,
  shops: SHOPS,
};

let state: State = seed;
let hydrated = false;
const listeners = new Set<() => void>();

function emit() {
  for (const l of listeners) l();
}

function persist() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (err) {
    console.warn("[store] could not persist (quota or private mode)", err);
  }
}

function hydrate() {
  if (hydrated || typeof window === "undefined") return;
  hydrated = true;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) state = { ...seed, ...JSON.parse(raw) };
  } catch {
    /* ignore corrupt storage */
  }
}

function set(updater: (s: State) => State) {
  state = updater(state);
  persist();
  emit();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  if (!hydrated) {
    hydrate();
    queueMicrotask(emit);
  }
  return () => listeners.delete(listener);
}

/** Subscribes to the whole (immutable) state; derive with the selector or useMemo. */
export function useStore<T>(selector: (s: State) => T): T {
  const snapshot = useSyncExternalStore(
    subscribe,
    () => state,
    () => seed,
  );
  return selector(snapshot);
}

export function getState() {
  hydrate();
  return state;
}

const now = () => new Date().toISOString();
const lookup = (s: State) => ({ skus: s.skus, versions: s.versions, products: PRODUCTS });

export function availableBalance(s: State, userId: string) {
  return balances(s.ledger.filter((e) => e.userId === userId)).available;
}

/* ================= Designs ================= */

export interface SaveDesignInput {
  userId: string;
  designId?: string;
  name: string;
  productId: string;
  printAreaId: string;
  layers: DesignLayer[];
  thumbnail?: string;
}

/**
 * Save artwork. Drafts are edited in place; once a version has been
 * submitted it is frozen, so saving creates a new draft version.
 */
export function saveDesign(input: SaveDesignInput): { designId: string; versionId: string } {
  let result = { designId: "", versionId: "" };
  set((s) => {
    const existing = input.designId ? s.designs.find((d) => d.id === input.designId) : undefined;
    const current = existing ? s.versions.find((v) => v.id === existing.currentVersionId) : undefined;

    if (existing && current && current.status === "draft") {
      result = { designId: existing.id, versionId: current.id };
      return {
        ...s,
        designs: s.designs.map((d) => (d.id === existing.id ? { ...d, name: input.name, updatedAt: now() } : d)),
        versions: s.versions.map((v) =>
          v.id === current.id
            ? { ...v, layers: input.layers, thumbnail: input.thumbnail, productId: input.productId, printAreaId: input.printAreaId }
            : v,
        ),
      };
    }

    const designId = existing?.id ?? uid("dsn");
    const version: DesignVersion = {
      id: uid("dv"),
      designId,
      number: (existing?.versionIds.length ?? 0) + 1,
      productId: input.productId,
      printAreaId: input.printAreaId,
      layers: input.layers,
      thumbnail: input.thumbnail,
      createdAt: now(),
      status: "draft",
      conversion: "not_started",
    };
    result = { designId, versionId: version.id };
    const design: Design = existing
      ? { ...existing, name: input.name, currentVersionId: version.id, versionIds: [...existing.versionIds, version.id], updatedAt: now() }
      : { id: designId, userId: input.userId, name: input.name, currentVersionId: version.id, versionIds: [version.id], updatedAt: now() };

    return {
      ...s,
      designs: existing ? s.designs.map((d) => (d.id === designId ? design : d)) : [design, ...s.designs],
      versions: [...s.versions, version],
    };
  });
  return result;
}

function patchVersion(id: string, patch: Partial<DesignVersion>) {
  set((s) => ({ ...s, versions: s.versions.map((v) => (v.id === id ? { ...v, ...patch } : v)) }));
}

/** Submit for review and kick off print-file conversion (PNG + TIFF). */
export function submitDesignVersion(versionId: string) {
  patchVersion(versionId, { status: "submitted", conversion: "processing", reviewNote: undefined });
  runConversion(versionId);
}

/**
 * Mock of the BullMQ + sharp conversion worker. The real worker renders the
 * layers at 300 DPI, writes PNG and TIFF to object storage and records URLs.
 */
function runConversion(versionId: string) {
  setTimeout(() => {
    patchVersion(versionId, {
      conversion: "ready",
      conversionError: undefined,
      printFiles: { png: `mock://print/${versionId}.png`, tiff: `mock://print/${versionId}.tiff` },
    });
    recheckHeldOrders();
  }, 1800);
}

export function retryConversion(versionId: string) {
  patchVersion(versionId, { conversion: "processing", conversionError: undefined });
  runConversion(versionId);
}

export function reviewDesignVersion(versionId: string, decision: "approved" | "rejected", note?: string) {
  patchVersion(versionId, { status: decision, reviewNote: note });
  recheckHeldOrders();
}

/* ================= SKUs ================= */

export function createSku(input: Omit<Sku, "id" | "active">) {
  const s = getState();
  const shop = s.shops.find((x) => x.id === input.shopId && x.userId === input.userId);
  if (!shop) throw new Error("Choose one of your shops");
  if (s.skus.some((k) => k.shopId === input.shopId && k.code === input.code)) {
    throw new Error(`SKU code ${input.code} already exists in ${shop.name}`);
  }
  set((st) => ({ ...st, skus: [{ ...input, id: uid("sku"), active: true }, ...st.skus] }));
  recheckHeldOrders();
}

export function toggleSku(id: string) {
  set((s) => ({ ...s, skus: s.skus.map((k) => (k.id === id ? { ...k, active: !k.active } : k)) }));
}

/* ================= Orders ================= */

function applyTransition(s: State, order: Order, to: OrderStatus, actor: Order["events"][number]["actor"], note?: string): State {
  if (!canTransition(order.status, to)) {
    throw new Error(`Cannot move order ${order.id} from ${order.status} to ${to}`);
  }
  const effect = ledgerEffect(order.status, to);
  let ledger = s.ledger;
  if (effect === "reserve" && order.productionCharge > availableBalance(s, order.userId)) {
    throw new Error("Insufficient wallet balance to approve this order");
  }
  if (effect) {
    ledger = [
      ...ledger,
      { id: uid("le"), userId: order.userId, type: effect, amount: order.productionCharge, orderId: order.id, at: now() },
    ];
  }
  const updated: Order = {
    ...order,
    status: to,
    holdReasons: to === "on_hold" ? order.holdReasons : [],
    events: [...order.events, { at: now(), status: to, actor, note }],
  };
  return { ...s, ledger, orders: s.orders.map((o) => (o.id === order.id ? updated : o)) };
}

export function transitionOrder(orderId: string, to: OrderStatus, actor: Order["events"][number]["actor"] = "admin", note?: string) {
  set((s) => {
    const order = s.orders.find((o) => o.id === orderId);
    if (!order) throw new Error("Order not found");
    let next = applyTransition(s, order, to, actor, note);
    if (to === "shipped") {
      next = {
        ...next,
        orders: next.orders.map((o) => (o.id === orderId ? { ...o, trackingNumber: `JNE${Math.floor(Math.random() * 1e10)}` } : o)),
      };
    }
    return next;
  });
}

/**
 * Re-run automatic checks for received / on-hold orders. Called whenever
 * something that could unblock them changes (SKU created, design approved,
 * conversion finished, wallet topped up).
 */
export function recheckHeldOrders() {
  set((s) => {
    let next = s;
    for (const order of s.orders) {
      if (order.status !== "on_hold" && order.status !== "received") continue;
      const lines = resolveLines(order.lines, order.shopId, lookup(next));
      const productionCharge = computeProductionCharge(lines, lookup(next));
      const holdReasons = evaluateHoldReasons({ lines, productionCharge }, lookup(next), availableBalance(next, order.userId));
      const refreshed = { ...order, lines, productionCharge, holdReasons };
      next = { ...next, orders: next.orders.map((o) => (o.id === order.id ? refreshed : o)) };
      if (holdReasons.length === 0) {
        next = applyTransition(next, refreshed, "pending_review", "system", "Passed automatic checks");
      } else if (order.status === "received") {
        next = applyTransition(next, refreshed, "on_hold", "system");
      }
    }
    return next;
  });
}

/**
 * Simulates a marketplace webhook delivering a new order to one of the
 * user's connected shops (optionally a specific one).
 */
export function simulateIncomingOrder(userId: string, shopId?: string): string | undefined {
  const s = getState();
  const shops = s.shops.filter((x) => x.userId === userId && x.status === "connected" && (!shopId || x.id === shopId));
  if (shops.length === 0) return undefined;
  const rand = <T,>(xs: T[]) => xs[Math.floor(Math.random() * xs.length)];
  // Prefer a shop with active SKUs so the demo order usually matches.
  const withSkus = shops.filter((x) => s.skus.some((k) => k.shopId === x.id && k.active));
  const shop = rand(withSkus.length ? withSkus : shops);
  const pick = rand(s.skus.filter((k) => k.shopId === shop.id && k.active)) as Sku | undefined;
  const names = ["Ayu L.", "Budi S.", "Citra M.", "Dimas A.", "Eka T.", "Gita P."];
  const cities = ["Jakarta Barat", "Depok", "Malang", "Denpasar", "Makassar", "Bekasi"];
  const i = Math.floor(Math.random() * names.length);
  const prefix = { tiktok_shop: "TT", shopee: "SP", shopify: "SH" }[shop.marketplace];
  const order: Order = {
    id: uid("ord"),
    userId,
    shopId: shop.id,
    marketplace: shop.marketplace,
    externalId: `${prefix}-${Math.floor(Math.random() * 1e8)}`,
    buyerName: names[i],
    shipToCity: cities[i],
    shipToCountry: "ID",
    lines: [{ id: uid("ln"), skuCode: pick?.code ?? "UNKNOWN-SKU", quantity: 1 + Math.floor(Math.random() * 2), unitRetailPrice: pick?.retailPrice ?? 129_900 }],
    status: "received",
    holdReasons: [],
    productionCharge: 0,
    createdAt: now(),
    events: [{ at: now(), status: "received", actor: "system", note: `Imported from ${shop.name}` }],
  };
  set((st) => ({ ...st, orders: [order, ...st.orders] }));
  recheckHeldOrders();
  return order.id;
}

/* ================= Wallet & shops ================= */

export function topUp(userId: string, amount: number) {
  if (amount <= 0) throw new Error("Amount must be positive");
  set((s) => ({
    ...s,
    ledger: [...s.ledger, { id: uid("le"), userId, type: "top_up", amount, at: now(), note: "Mock payment (Midtrans/Xendit)" }],
  }));
  recheckHeldOrders();
}

/**
 * Request a new shop connection. Users can add any number of shops, including
 * several on the same marketplace; the name must be unique per marketplace.
 * Ops finishes the connection during onboarding (status → connected).
 */
export function addShop(userId: string, marketplace: Shop["marketplace"], name: string) {
  const clean = name.trim();
  if (!clean) throw new Error("Enter the shop name");
  const s = getState();
  if (s.shops.some((x) => x.userId === userId && x.marketplace === marketplace && x.name.toLowerCase() === clean.toLowerCase())) {
    throw new Error(`You already added ${clean} on this marketplace`);
  }
  const shop: Shop = { id: uid("shp"), userId, marketplace, name: clean, status: "pending", createdAt: now() };
  set((st) => ({ ...st, shops: [...st.shops, shop] }));
  return shop.id;
}

/** Withdraw a shop request that never received orders. */
export function removeShop(id: string) {
  const s = getState();
  if (s.orders.some((o) => o.shopId === id)) throw new Error("This shop has orders and can’t be removed");
  set((st) => ({ ...st, shops: st.shops.filter((x) => x.id !== id), skus: st.skus.filter((k) => k.shopId !== id) }));
}

/* ================= Users ================= */

export type ProfileInput = Pick<User, "name" | "email" | "phone" | "country">;

/** Update the editable profile fields. Email must stay unique across users. */
export function updateProfile(userId: string, input: ProfileInput) {
  const s = getState();
  const email = input.email.trim().toLowerCase();
  if (s.users.some((u) => u.id !== userId && u.email.toLowerCase() === email)) {
    throw new Error("That email is already used by another account");
  }
  set((st) => ({
    ...st,
    users: st.users.map((u) => (u.id === userId ? { ...u, ...input, name: input.name.trim(), email } : u)),
  }));
}

export function resetDemo() {
  state = seed;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
  emit();
}
