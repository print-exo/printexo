import type { PrintArea, Product } from "@/lib/domain/types";

/**
 * Catalog. Products and colours match the supplier photos in public/products/
 * (one folder per model code; `*-main.png` is the display photo, variant photos
 * are cropped from the `*-variant.png` sheets into `variants/`).
 *
 * Still placeholders: base costs, capacities of LLB and TSSY, weights and print
 * areas. Replace with verified supplier (MQC) data before launch — see
 * src/agents/assets.md.
 */

const wrap = (id: string, widthIn: number, heightIn: number, printFee: number): PrintArea => ({
  id,
  name: "Full wrap",
  widthIn,
  heightIn,
  safeMarginIn: 0.25,
  printFee,
});

const IMG = "/products";
const ombre = (top: string) => `linear-gradient(180deg, ${top} 0 50%, #f4f4f2 50% 100%)`;

export const PRODUCTS: Product[] = [
  {
    id: "prd_40bbb",
    slug: "handle-tumbler-40oz",
    code: "40BBB",
    name: "Handle Tumbler 40oz",
    category: "tumbler",
    description:
      "Big travel tumbler with a comfort handle, a clear slide lid and a matching straw. The tapered base fits most car cup holders. UV print on the front panel.",
    capacityOz: 40,
    material: "18/8 stainless steel, double wall, powder-coated",
    printMethod: "UV print, front panel",
    productionDays: [3, 5],
    weightGrams: 620,
    shipsTo: ["ID", "MY", "SG"],
    printAreas: [
      { id: "pa_40bbb_front", name: "Front panel", widthIn: 3.5, heightIn: 5, safeMarginIn: 0.2, printFee: 10_000 },
    ],
    variants: [
      { id: "var_40bbb_black", productId: "prd_40bbb", name: "Black", colorHex: "#1c1c1c", image: `${IMG}/40BBB/40bbb-main.png`,
        description: "Textured matte black with a black handle and straw. White, gold and neon prints pop the most.", baseCost: 98_000, inStock: true },
      { id: "var_40bbb_pink", productId: "prd_40bbb", name: "Pink", colorHex: "#ec7a86", image: `${IMG}/40BBB/variants/40bbb-pink.png`,
        description: "Coral pink from lid to straw. A favourite for names, florals and gift designs.", baseCost: 98_000, inStock: true },
      { id: "var_40bbb_black_white", productId: "prd_40bbb", name: "Black–White Ombre", colorHex: "#1c1c1c", swatch: ombre("#1c1c1c"), image: `${IMG}/40BBB/variants/40bbb-black-white.png`,
        description: "Black fading into white toward the base, with a black handle and straw. Keep the artwork in the upper, darker half for best contrast.", baseCost: 98_000, inStock: true },
      { id: "var_40bbb_pink_white", productId: "prd_40bbb", name: "Pink–White Ombre", colorHex: "#ec7a86", swatch: ombre("#ec7a86"), image: `${IMG}/40BBB/variants/40bbb-pink-white.png`,
        description: "Coral pink fading into white, with a pink handle and straw. Soft and playful, made for cute and pastel designs.", baseCost: 98_000, inStock: true },
      { id: "var_40bbb_matcha_white", productId: "prd_40bbb", name: "Matcha–White Ombre", colorHex: "#7f9f2e", swatch: ombre("#7f9f2e"), image: `${IMG}/40BBB/variants/40bbb-matcha-white.png`,
        description: "Matcha green fading into white, with a green handle and straw. Fresh and earthy, great for cafés and wellness brands.", baseCost: 98_000, inStock: true },
    ],
    featured: true,
  },
  {
    id: "prd_llb",
    slug: "coffee-tumbler-strap",
    code: "LLB",
    name: "Coffee Tumbler with Strap",
    category: "tumbler",
    description:
      "Café-style coffee tumbler with a flip-up sip lid, a woven carry strap and a metal base ring. Sized for a daily latte.",
    capacityOz: 17,
    material: "304 stainless steel, double wall, matte coated",
    printMethod: "Sublimation, full wrap",
    productionDays: [2, 4],
    weightGrams: 360,
    shipsTo: ["ID", "MY", "SG"],
    printAreas: [wrap("pa_llb_wrap", 8.8, 5.6, 8_000)],
    variants: [
      { id: "var_llb_cream", productId: "prd_llb", name: "Cream", colorHex: "#efe9dc", image: `${IMG}/LLB/llb-main.png`, gallery: [`${IMG}/LLB/llb-variant-white-open.png`],
        description: "Warm cream with a gold base and a cream “COFFEE” strap. The most versatile canvas: dark and full-colour designs both read well.", baseCost: 55_000, inStock: true },
      { id: "var_llb_black", productId: "prd_llb", name: "Black", colorHex: "#1e1d1b", image: `${IMG}/LLB/variants/llb-black.png`,
        description: "Matte black with a gold base and a black strap. Sleek and premium; use white, gold or light artwork.", baseCost: 55_000, inStock: true },
      { id: "var_llb_pink", productId: "prd_llb", name: "Pink", colorHex: "#f4b6c8", image: `${IMG}/LLB/variants/llb-pink.png`, gallery: [`${IMG}/LLB/llb-variant-pink.png`],
        description: "Soft blush pink with a matching strap. Sweet and giftable, a natural fit for names and floral designs.", baseCost: 55_000, inStock: true },
    ],
    featured: true,
  },
  {
    id: "prd_tsdy",
    slug: "flip-straw-tumbler-30oz",
    code: "TSDY",
    name: "Flip-Straw Tumbler 30oz",
    category: "tumbler",
    description:
      "Everyday tumbler with a flip-up straw lid, a fold-down carry handle and a polished steel band. Leak-resistant when closed.",
    capacityOz: 30,
    material: "18/8 stainless steel, double wall, powder-coated",
    printMethod: "Sublimation, full wrap",
    productionDays: [2, 4],
    weightGrams: 450,
    shipsTo: ["ID"],
    printAreas: [wrap("pa_tsdy_wrap", 10, 7.5, 9_000)],
    variants: [
      { id: "var_tsdy_black", productId: "prd_tsdy", name: "Black", colorHex: "#1c1c1c", image: `${IMG}/TSDY/tsdy-main.png`,
        description: "Matte black with a black handle and lid. Bold and gender-neutral; white or metallic prints stand out.", baseCost: 64_000, inStock: true },
      { id: "var_tsdy_white", productId: "prd_tsdy", name: "White", colorHex: "#f6f6f4", image: `${IMG}/TSDY/variants/tsdy-white.png`,
        description: "Clean white with a white handle and lid. Shows full-colour artwork exactly as designed.", baseCost: 64_000, inStock: true },
      { id: "var_tsdy_pink", productId: "prd_tsdy", name: "Pink", colorHex: "#f27aa6", image: `${IMG}/TSDY/variants/tsdy-pink.png`,
        description: "Bright candy pink. Eye-catching in shop photos, perfect for names and cute designs.", baseCost: 64_000, inStock: true },
      { id: "var_tsdy_cobalt", productId: "prd_tsdy", name: "Cobalt Blue", colorHex: "#1f3fae", image: `${IMG}/TSDY/variants/tsdy-cobalt.png`,
        description: "Deep cobalt blue. Sporty and confident; pair with white or yellow artwork.", baseCost: 64_000, inStock: true },
      { id: "var_tsdy_sky", productId: "prd_tsdy", name: "Sky Blue", colorHex: "#b5d1f2", image: `${IMG}/TSDY/variants/tsdy-sky.png`,
        description: "Pastel sky blue. Calm and fresh, great with navy or dark-toned designs.", baseCost: 64_000, inStock: true },
    ],
    featured: true,
  },
  {
    id: "prd_tssy",
    slug: "flip-straw-tumbler-grip-handle",
    code: "TSSY",
    name: "Flip-Straw Tumbler, Grip Handle",
    category: "tumbler",
    description:
      "Flip-straw tumbler with a wide, ribbed grip handle and a vented lid. Tall white body that takes full-wrap prints edge to edge.",
    capacityOz: 20,
    material: "18/8 stainless steel, double wall, powder-coated",
    printMethod: "Sublimation, full wrap",
    productionDays: [2, 4],
    weightGrams: 380,
    shipsTo: ["ID", "MY", "SG"],
    printAreas: [wrap("pa_tssy_wrap", 9.2, 8.2, 8_000)],
    variants: [
      { id: "var_tssy_white", productId: "prd_tssy", name: "White", colorHex: "#f6f6f4", image: `${IMG}/TSSY/tssy-main.png`,
        description: "Bright white body, handle and lid. A blank canvas: full-colour wraps print true to the design.", baseCost: 52_000, inStock: true },
    ],
    featured: true,
  },
];

export function getProductBySlug(slug: string) {
  return PRODUCTS.find((p) => p.slug === slug);
}

export function getProduct(id: string) {
  return PRODUCTS.find((p) => p.id === id);
}

export function findVariant(variantId: string) {
  for (const product of PRODUCTS) {
    const variant = product.variants.find((v) => v.id === variantId);
    if (variant) return { product, variant };
  }
  return undefined;
}

export function getPrintArea(productId: string, printAreaId: string) {
  return getProduct(productId)?.printAreas.find((a) => a.id === printAreaId);
}

export const COUNTRY_NAME: Record<string, string> = {
  ID: "Indonesia",
  MY: "Malaysia",
  SG: "Singapore",
};
