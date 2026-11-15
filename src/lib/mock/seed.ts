import type {
  Design,
  DesignVersion,
  LedgerEntry,
  Order,
  Shop,
  Sku,
  User,
} from "@/lib/domain/types";
import { PRODUCTS } from "./catalog";
import { computeProductionCharge, evaluateHoldReasons, resolveLines } from "@/lib/domain/orders";

/** Demo data for the prototype. Everything here is fictional. */

export const CURRENT_USER_ID = "usr_demo";

export const USERS: User[] = [
  { id: "usr_demo", name: "Raka Pratama", email: "owner@kopisenja.example", phone: "+6281234567890", country: "ID", joinedAt: "2026-08-02T03:00:00Z", status: "active", plan: "growth" },
  { id: "usr_2", name: "Sinta Wulandari", email: "hello@bumigifts.example", phone: "+6285711112222", country: "ID", joinedAt: "2026-09-14T03:00:00Z", status: "active", plan: "starter" },
  { id: "usr_3", name: "Rina Hassan", email: "rina@custom.example", phone: "+60123456789", country: "MY", joinedAt: "2026-10-28T03:00:00Z", status: "pending_verification", plan: "starter" },
  { id: "usr_4", name: "Daniel Tan", email: "daniel@sipandgo.example", phone: "+6591234567", country: "SG", joinedAt: "2026-07-11T03:00:00Z", status: "active", plan: "growth" },
  { id: "usr_5", name: "Arif Nugroho", email: "arif@tumblerku.example", phone: "+6281298765432", country: "ID", joinedAt: "2026-06-20T03:00:00Z", status: "suspended", plan: "starter" },
];

const day = (offset: number, hour = 9) => {
  const d = new Date("2026-11-06T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + offset);
  d.setUTCHours(hour);
  return d.toISOString();
};

const v = (
  id: string,
  designId: string,
  productId: string,
  printAreaId: string,
  layers: DesignVersion["layers"],
  extra: Partial<DesignVersion> = {},
): DesignVersion => ({
  id,
  designId,
  number: 1,
  productId,
  printAreaId,
  layers,
  createdAt: day(-20),
  status: "approved",
  conversion: "ready",
  printFiles: { png: `mock://print/${id}.png`, tiff: `mock://print/${id}.tiff` },
  ...extra,
});

export const SHOPS: Shop[] = [
  { id: "shp_tt_main", userId: "usr_demo", marketplace: "tiktok_shop", name: "kopisenja.id", status: "connected", createdAt: day(-90), lastSyncAt: day(0, 5) },
  { id: "shp_tt_gifts", userId: "usr_demo", marketplace: "tiktok_shop", name: "senja.gifts", status: "connected", createdAt: day(-40), lastSyncAt: day(0, 5) },
  { id: "shp_sp_main", userId: "usr_demo", marketplace: "shopee", name: "kopisenja_official", status: "connected", createdAt: day(-80), lastSyncAt: day(0, 5) },
  { id: "shp_sp_outlet", userId: "usr_demo", marketplace: "shopee", name: "kopisenja.outlet", status: "pending", createdAt: day(-1) },
  { id: "shp_bumi_sp", userId: "usr_2", marketplace: "shopee", name: "bumigifts", status: "connected", createdAt: day(-50), lastSyncAt: day(0, 5) },
  { id: "shp_rina_sp", userId: "usr_3", marketplace: "shopee", name: "rinacustom.my", status: "pending", createdAt: day(-2) },
  { id: "shp_sip_tt", userId: "usr_4", marketplace: "tiktok_shop", name: "sipandgo.sg", status: "connected", createdAt: day(-110), lastSyncAt: day(0, 5) },
  { id: "shp_sip_sf", userId: "usr_4", marketplace: "shopify", name: "sipandgo.com", status: "connected", createdAt: day(-100), lastSyncAt: day(0, 5) },
  { id: "shp_arif_tt", userId: "usr_5", marketplace: "tiktok_shop", name: "tumblerku", status: "disconnected", createdAt: day(-130) },
  { id: "shp_arif_sp", userId: "usr_5", marketplace: "shopee", name: "tumblerku.official", status: "error", createdAt: day(-125) },
];

export const DESIGN_VERSIONS: DesignVersion[] = [
  v("dv_senja_1", "dsn_senja", "prd_tssy", "pa_tssy_wrap", [
    { id: "l1", kind: "text", x: 0.6, y: 2.6, width: 8, height: 1.6, rotation: 0, text: "Kopi Senja", fontFamily: "Georgia", fontSize: 72, fill: "#7c2d12", fontStyle: "italic", align: "center" },
    { id: "l2", kind: "text", x: 0.6, y: 4.6, width: 8, height: 0.7, rotation: 0, text: "brewed at golden hour", fontFamily: "Arial", fontSize: 26, fill: "#a16207", align: "center" },
  ]),
  v("dv_name_1", "dsn_name", "prd_40bbb", "pa_40bbb_front", [
    { id: "l1", kind: "text", x: 0.3, y: 1.8, width: 2.9, height: 1, rotation: 0, text: "Alya", fontFamily: "Georgia", fontSize: 64, fill: "#14532d", align: "center" },
    { id: "l2", kind: "text", x: 0.3, y: 2.9, width: 2.9, height: 0.5, rotation: 0, text: "stay hydrated", fontFamily: "Arial", fontSize: 18, fill: "#365314", align: "center" },
  ]),
  v("dv_ramadan_1", "dsn_ramadan", "prd_tssy", "pa_tssy_wrap", [
    { id: "l1", kind: "text", x: 0.6, y: 3, width: 8, height: 1.4, rotation: 0, text: "Ramadan Kareem", fontFamily: "Georgia", fontSize: 60, fill: "#1e3a8a", align: "center" },
  ], { conversion: "failed", conversionError: "Color profile conversion to CMYK timed out", status: "submitted", printFiles: undefined }),
  v("dv_mama_1", "dsn_mama", "prd_tsdy", "pa_tsdy_wrap", [
    { id: "l1", kind: "text", x: 0.8, y: 2.6, width: 8.4, height: 1.4, rotation: 0, text: "Best Mama Ever", fontFamily: "Georgia", fontSize: 64, fill: "#9d174d", align: "center" },
  ], { status: "submitted", conversion: "ready", createdAt: day(-1) }),
  v("dv_kantor_1", "dsn_kantor", "prd_tssy", "pa_tssy_wrap", [
    { id: "l1", kind: "text", x: 0.6, y: 3.2, width: 8, height: 1, rotation: 0, text: "Monday Survivor", fontFamily: "Arial", fontSize: 54, fill: "#27272a", fontStyle: "bold", align: "center" },
  ], { status: "draft", conversion: "not_started", printFiles: undefined, createdAt: day(-2) }),
];

export const DESIGNS: Design[] = [
  { id: "dsn_senja", userId: "usr_demo", name: "Kopi Senja logo wrap", currentVersionId: "dv_senja_1", versionIds: ["dv_senja_1"], updatedAt: day(-20) },
  { id: "dsn_name", userId: "usr_demo", name: "Personalised name — Alya", currentVersionId: "dv_name_1", versionIds: ["dv_name_1"], updatedAt: day(-12) },
  { id: "dsn_ramadan", userId: "usr_demo", name: "Ramadan Kareem", currentVersionId: "dv_ramadan_1", versionIds: ["dv_ramadan_1"], updatedAt: day(-3) },
  { id: "dsn_mama", userId: "usr_2", name: "Best Mama Ever", currentVersionId: "dv_mama_1", versionIds: ["dv_mama_1"], updatedAt: day(-1) },
  { id: "dsn_kantor", userId: "usr_demo", name: "Monday Survivor", currentVersionId: "dv_kantor_1", versionIds: ["dv_kantor_1"], updatedAt: day(-2) },
];

export const SKUS: Sku[] = [
  { id: "sku_1", userId: "usr_demo", shopId: "shp_tt_main", code: "KS-T20-SENJA-WHT", title: "Kopi Senja Tumbler 20oz — White", variantId: "var_tssy_white", designVersionId: "dv_senja_1", retailPrice: 129_900, active: true },
  { id: "sku_2", userId: "usr_demo", shopId: "shp_sp_main", code: "KS-T40-ALYA-MTCH", title: "Name Tumbler 40oz — Matcha Ombre", variantId: "var_40bbb_matcha_white", designVersionId: "dv_name_1", retailPrice: 219_900, active: true },
  { id: "sku_3", userId: "usr_demo", shopId: "shp_tt_gifts", code: "KS-T20-RMDN-WHT", title: "Ramadan Tumbler 20oz", variantId: "var_tssy_white", designVersionId: "dv_ramadan_1", retailPrice: 139_900, active: true },
  { id: "sku_4", userId: "usr_2", shopId: "shp_bumi_sp", code: "BG-T30-MAMA", title: "Best Mama Tumbler 30oz", variantId: "var_tsdy_white", designVersionId: "dv_mama_1", retailPrice: 149_900, active: true },
];

export const LEDGER: LedgerEntry[] = [
  { id: "le_1", userId: "usr_demo", type: "top_up", amount: 1_500_000, at: day(-25), note: "Bank transfer via Xendit" },
  { id: "le_2", userId: "usr_demo", type: "reserve", amount: 84_000, orderId: "ord_1001", at: day(-6) },
  { id: "le_3", userId: "usr_demo", type: "capture", amount: 84_000, orderId: "ord_1001", at: day(-6, 12) },
  { id: "le_4", userId: "usr_demo", type: "reserve", amount: 132_000, orderId: "ord_1002", at: day(-3) },
  { id: "le_5", userId: "usr_demo", type: "capture", amount: 132_000, orderId: "ord_1002", at: day(-3, 13) },
  { id: "le_6", userId: "usr_2", type: "top_up", amount: 80_000, at: day(-10) },
];

/* ---------- Orders: built through the same domain functions the app uses ---------- */

const lookup = { skus: SKUS, versions: DESIGN_VERSIONS, products: PRODUCTS };

type RawOrder = Omit<Order, "productionCharge" | "holdReasons" | "events"> & {
  events?: Order["events"];
  holdReasons?: Order["holdReasons"];
};

function build(raw: RawOrder, availableBalance: number): Order {
  const lines = resolveLines(raw.lines, raw.shopId, lookup);
  const productionCharge = computeProductionCharge(lines, lookup);
  const holdReasons =
    raw.status === "on_hold" || raw.status === "received"
      ? evaluateHoldReasons({ lines, productionCharge }, lookup, availableBalance)
      : [];
  return {
    ...raw,
    lines,
    productionCharge,
    holdReasons: raw.holdReasons ?? holdReasons,
    events: raw.events ?? [{ at: raw.createdAt, status: "received", actor: "system", note: `Imported from ${raw.marketplace}` }],
  };
}

const line = (code: string, quantity: number, unitRetailPrice: number) => ({
  id: `ln_${code}_${quantity}`,
  skuCode: code,
  quantity,
  unitRetailPrice,
});

export const ORDERS: Order[] = [
  build({
    id: "ord_1001", userId: "usr_demo", shopId: "shp_tt_main", marketplace: "tiktok_shop", externalId: "TT-58210331",
    buyerName: "Dewi P.", shipToCity: "Bandung", shipToCountry: "ID",
    lines: [line("KS-T20-SENJA-WHT", 1, 129_900)], status: "shipped", createdAt: day(-6),
    trackingNumber: "JNE0091827364",
    events: [
      { at: day(-6), status: "received", actor: "system", note: "Imported from tiktok_shop" },
      { at: day(-6, 10), status: "pending_review", actor: "system", note: "Passed automatic checks" },
      { at: day(-6, 11), status: "approved", actor: "admin" },
      { at: day(-6, 12), status: "sent_to_production", actor: "admin", note: "Handed off to MQC" },
      { at: day(-5), status: "in_production", actor: "mqc" },
      { at: day(-3), status: "shipped", actor: "mqc", note: "JNE0091827364" },
    ],
  }, 0),
  build({
    id: "ord_1002", userId: "usr_demo", shopId: "shp_sp_main", marketplace: "shopee", externalId: "SP-2211-0098",
    buyerName: "Bagas R.", shipToCity: "Surabaya", shipToCountry: "ID",
    lines: [line("KS-T40-ALYA-MTCH", 1, 219_900)], status: "in_production", createdAt: day(-3),
    events: [
      { at: day(-3), status: "received", actor: "system", note: "Imported from shopee" },
      { at: day(-3, 10), status: "pending_review", actor: "system" },
      { at: day(-3, 12), status: "approved", actor: "admin" },
      { at: day(-3, 13), status: "sent_to_production", actor: "admin", note: "Handed off to MQC" },
      { at: day(-2), status: "in_production", actor: "mqc" },
    ],
  }, 0),
  build({
    id: "ord_1003", userId: "usr_demo", shopId: "shp_tt_main", marketplace: "tiktok_shop", externalId: "TT-58233190",
    buyerName: "Sari W.", shipToCity: "Jakarta Selatan", shipToCountry: "ID",
    lines: [line("KS-T20-SENJA-WHT", 2, 129_900)], status: "pending_review", createdAt: day(0, 2),
    events: [
      { at: day(0, 2), status: "received", actor: "system", note: "Imported from tiktok_shop" },
      { at: day(0, 2), status: "pending_review", actor: "system", note: "Passed automatic checks" },
    ],
  }, 0),
  build({
    id: "ord_1004", userId: "usr_demo", shopId: "shp_tt_gifts", marketplace: "tiktok_shop", externalId: "TT-58233411",
    buyerName: "Fajar N.", shipToCity: "Yogyakarta", shipToCountry: "ID",
    lines: [line("KS-T20-RMDN-WHT", 1, 139_900)], status: "on_hold", createdAt: day(0, 3),
  }, 1_284_000),
  build({
    id: "ord_1005", userId: "usr_demo", shopId: "shp_sp_main", marketplace: "shopee", externalId: "SP-2211-0131",
    buyerName: "Intan K.", shipToCity: "Medan", shipToCountry: "ID",
    lines: [line("KS-T30-UNKNOWN", 1, 159_900)], status: "on_hold", createdAt: day(0, 4),
  }, 1_284_000),
  build({
    id: "ord_1006", userId: "usr_2", shopId: "shp_bumi_sp", marketplace: "shopee", externalId: "SP-2211-0144",
    buyerName: "Rudi H.", shipToCity: "Semarang", shipToCountry: "ID",
    lines: [line("BG-T30-MAMA", 1, 149_900)], status: "on_hold", createdAt: day(0, 5),
  }, 80_000),
];
