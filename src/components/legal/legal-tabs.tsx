import Link from "next/link";
import { LEGAL_DOCS, LEGAL_SLUGS, legalHref, type LegalSlug } from "@/lib/legal/documents";
import { cn } from "@/lib/utils";

/** Switches between the legal documents. `active` comes from the page, so no URL hooks are needed. */
export function LegalTabs({ active }: { active: LegalSlug }) {
  return (
    <nav aria-label="Legal documents" className="-mx-4 overflow-x-auto border-b border-border px-4 sm:mx-0 sm:px-0">
      <ul className="flex min-w-max gap-1">
        {LEGAL_SLUGS.map((slug) => {
          const isActive = slug === active;
          return (
            <li key={slug}>
              <Link
                href={legalHref(slug)}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "-mb-px inline-block border-b-2 px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "border-primary text-foreground"
                    : "border-transparent text-muted-foreground hover:border-border hover:text-foreground",
                )}
              >
                {LEGAL_DOCS[slug].navLabel}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
