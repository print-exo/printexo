import { Logo } from "@/components/brand/logo";
import { ButtonLink } from "@/components/ui/button";
import { MobileNav } from "./mobile-nav";

export const SITE_NAV = [
  { href: "/#how-it-works", label: "How it works" },
  { href: "/catalog", label: "Products" },
  { href: "/pricing", label: "Pricing" },
  { href: "/integrations", label: "Integrations" },
  { href: "/faq", label: "FAQ" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Logo height={26} />
        <nav aria-label="Main" className="hidden items-center gap-7 text-sm text-muted-foreground md:flex">
          {SITE_NAV.map((item) => (
            <a key={item.href} href={item.href} className="hover:text-foreground">
              {item.label}
            </a>
          ))}
        </nav>
        <div className="hidden items-center gap-2 md:flex">
          <ButtonLink href="/app" variant="ghost" size="sm">
            Log in
          </ButtonLink>
          <ButtonLink href="/start" size="sm">
            Start selling
          </ButtonLink>
        </div>
        <MobileNav items={SITE_NAV} />
      </div>
    </header>
  );
}
