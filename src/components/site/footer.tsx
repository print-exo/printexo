import Link from "next/link";
import { BRAND_NAME, BRAND_TAGLINE, Logo } from "@/components/brand/logo";

const COLUMNS = [
  { title: "Product", links: [["Catalog", "/catalog"], ["Pricing", "/pricing"], ["Design Studio", "/app/studio"], ["Integrations", "/integrations"]] },
  { title: "For shops", links: [["Start selling", "/start"], ["Dashboard", "/app"], ["FAQ", "/faq"]] },
  { title: "Company", links: [["Admin console", "/admin"], ["Contact", "mailto:support@example.com"]] },
];

export function SiteFooter() {
  return (
    <footer className="mt-24 bg-tint text-muted-foreground">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-[2fr_1fr_1fr_1fr]">
        <div className="space-y-3">
          <Logo height={30} />
          <p className="font-display text-lg text-foreground">{BRAND_TAGLINE}</p>
          <p className="max-w-xs text-sm">
            Custom tumblers produced and shipped on demand for TikTok Shop, Shopee, and Shopify shops.
          </p>
        </div>
        {COLUMNS.map((col) => (
          <div key={col.title}>
            <h4 className="mb-3 text-sm font-bold text-foreground">{col.title}</h4>
            <ul className="space-y-2 text-sm">
              {col.links.map(([label, href]) => (
                <li key={href}>
                  <Link href={href} className="hover:text-foreground hover:underline">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-border py-5 text-center text-xs">
        <nav aria-label="Legal" className="mb-2 flex flex-wrap justify-center gap-x-5 gap-y-1">
          <Link href="/legal/terms" className="hover:text-foreground hover:underline">Terms of Service</Link>
          <Link href="/legal/privacy" className="hover:text-foreground hover:underline">Privacy Policy</Link>
          <Link href="/legal/intellectual-property" className="hover:text-foreground hover:underline">Intellectual Property</Link>
        </nav>
        © 2026 {BRAND_NAME}. Prototype — product data and imagery are placeholders.
      </div>
    </footer>
  );
}
