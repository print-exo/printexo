import { ArrowRight, Boxes, Brush, PackageCheck, Paintbrush, Rocket, ShoppingBag, Store, Truck, Wallet } from "lucide-react";
import { BRAND_TAGLINE } from "@/components/brand/logo";
import { TumblerMockup } from "@/components/brand/tumbler-mockup";
import { ButtonLink } from "@/components/ui/button";
import { ProductCard } from "@/components/site/product-card";
import { PRODUCTS, getProduct } from "@/lib/mock/catalog";
import { DESIGN_VERSIONS } from "@/lib/mock/seed";

const STEPS = [
  { icon: ShoppingBag, title: "Choose a product", body: "Pick from tumblers with verified print specs and transparent base costs." },
  { icon: Paintbrush, title: "Customize the design", body: "Upload artwork or add text in the Design Studio with live print-area guides." },
  { icon: Store, title: "Publish to your store", body: "Map the design to a SKU and list it on TikTok Shop, Shopee, or Shopify." },
  { icon: ShoppingBag, title: "Receive orders", body: "Orders sync in automatically and are checked against your approved designs." },
  { icon: Truck, title: "We produce and ship", body: "Our partner warehouse prints, packs, and ships directly to your buyer." },
];

const BENEFITS = [
  { icon: Boxes, title: "No inventory", body: "Nothing is produced until a buyer pays. No stock, no dead inventory." },
  { icon: Brush, title: "Custom designs", body: "Every SKU can carry its own artwork — names, logos, seasonal drops." },
  { icon: PackageCheck, title: "Supplier fulfillment", body: "Quality-checked production and shipping, handled end-to-end." },
  { icon: Wallet, title: "Clear margins", body: "See cost, fees, and profit for every product before you list it." },
];

export default function Home() {
  const senja = DESIGN_VERSIONS.find((v) => v.id === "dv_senja_1")!;
  const alya = DESIGN_VERSIONS.find((v) => v.id === "dv_name_1")!;
  // Hero mockups: the products these demo designs were made for, in the colours their SKUs sell.
  const senjaProduct = getProduct(senja.productId)!;
  const alyaProduct = getProduct(alya.productId)!;
  const alyaColor = alyaProduct.variants.find((v) => v.id === "var_40bbb_matcha_white")?.colorHex ?? alyaProduct.variants[0].colorHex;

  return (
    <>
      {/* Hero */}
      <section className="mx-auto grid max-w-6xl items-center gap-12 px-4 pb-16 pt-12 sm:px-6 md:grid-cols-2 md:pt-20">
        <div className="space-y-6">
          <p className="inline-flex items-center gap-2 rounded-full bg-primary-soft px-3 py-1 text-xs font-semibold text-primary">
            <Rocket className="size-3.5" aria-hidden /> Now onboarding TikTok Shop & Shopee shops
          </p>
          <h1 className="text-4xl font-display leading-[1.05] sm:text-5xl">
            Sell custom tumblers. <span className="highlight-lime">We print and ship them.</span>
          </h1>
          <p className="max-w-lg text-lg text-muted-foreground">
            Create, sell, and fulfill custom products without managing inventory, production, or shipping.
          </p>
          <div className="flex flex-wrap gap-3">
            <ButtonLink href="/start" size="lg">
              Start selling <ArrowRight />
            </ButtonLink>
          </div>
          <p className="text-sm text-muted-foreground">Free to join · Pay per order · Ships across Indonesia</p>
        </div>
        <div className="relative flex items-end justify-center gap-4 overflow-hidden rounded-3xl bg-tint px-6 pt-14">
          <p aria-hidden className="absolute left-6 top-5 font-display text-sm text-primary"><span className="highlight-lime">{BRAND_TAGLINE}</span></p>
          <TumblerMockup shape="skinny" color={senjaProduct.variants[0].colorHex} layers={senja.layers} printArea={senjaProduct.printAreas[0]} className="w-40 sm:w-48" label="Tumbler with Kopi Senja design" />
          <TumblerMockup shape="handle" color={alyaColor} layers={alya.layers} printArea={alyaProduct.printAreas[0]} className="w-44 sm:w-56" label="Handle tumbler with personalised name" />
        </div>
      </section>

      {/* Featured */}
      <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-display sm:text-3xl">Featured products</h2>
            <p className="mt-2 text-muted-foreground">Starting with tumblers. More products coming soon.</p>
          </div>
          <ButtonLink href="/catalog" variant="link" className="shrink-0">
            View catalog <ArrowRight />
          </ButtonLink>
        </div>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {PRODUCTS.filter((p) => p.featured).map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="scroll-mt-20 bg-tint">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <h2 className="text-2xl font-display sm:text-3xl">How it works</h2>
          <p className="mt-2 text-muted-foreground">From idea to doorstep in five steps.</p>
          <ol className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
            {STEPS.map((step, i) => (
              <li key={step.title} className="space-y-3">
                <div className="flex items-center gap-3">
                  <span className="flex size-8 items-center justify-center rounded-full bg-primary font-display text-sm text-lime">{i + 1}</span>
                  <step.icon className="size-5 text-muted-foreground" aria-hidden />
                </div>
                <h3 className="font-bold">{step.title}</h3>
                <p className="text-sm text-muted-foreground">{step.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Benefits */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {BENEFITS.map((b) => (
            <div key={b.title} className="space-y-2">
              <b.icon className="size-6 text-moss" aria-hidden />
              <h3 className="font-bold">{b.title}</h3>
              <p className="text-sm text-muted-foreground">{b.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Workflow / shop story */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="grid gap-10 rounded-3xl bg-tint p-8 md:grid-cols-2 md:p-12">
          <div className="space-y-4">
            <h2 className="text-2xl font-display">Built for shops that move fast</h2>
            <p className="text-muted-foreground">
              Launch a seasonal design in the morning and have it listed by lunch. Every order is matched to the exact
              approved artwork, so what your buyer sees is what gets printed.
            </p>
            <ul className="space-y-2 text-sm">
              <li>✓ Locked design versions — no surprise reprints</li>
              <li>✓ Admin review before anything goes to production</li>
              <li>✓ Prepaid wallet with a clear per-order breakdown</li>
            </ul>
          </div>
          <div className="grid grid-cols-3 gap-4 text-center">
            {[
              ["2–5", "days production"],
              ["0", "inventory needed"],
              ["30%", "suggested margin"],
            ].map(([n, l]) => (
              <div key={l} className="flex flex-col justify-center rounded-2xl bg-surface p-4">
                <div className="font-display text-3xl text-primary">{n}</div>
                <div className="mt-1 text-xs text-muted-foreground">{l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex flex-col items-center gap-4 rounded-3xl bg-primary px-6 py-14 text-center text-primary-foreground">
          <h2 className="font-display text-2xl text-white sm:text-3xl">Your first custom tumbler is <span className="text-lime">a few clicks away</span></h2>
          <p className="max-w-md opacity-85">Create a free account, connect your shops, design your first product, and list it today.</p>
          <ButtonLink href="/start" size="lg" variant="accent">
            Start selling <ArrowRight />
          </ButtonLink>
        </div>
      </section>
    </>
  );
}
