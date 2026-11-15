"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

type Item = { id: string; title: string };

/**
 * Section navigation for a legal document: sticky sidebar on desktop,
 * horizontally scrolling chip bar on mobile. Highlights the section in view.
 */
export function LegalToc({ sections }: { sections: Item[] }) {
  const [active, setActive] = useState(sections[0]?.id);

  useEffect(() => {
    const els = sections.map((s) => document.getElementById(s.id)).filter((el): el is HTMLElement => !!el);
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-140px 0px -60% 0px" },
    );
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [sections]);

  return (
    <nav
      aria-label="Sections"
      className="sticky top-16 z-30 -mx-4 border-b border-border bg-background/95 px-4 py-2 backdrop-blur sm:-mx-6 sm:px-6 lg:top-24 lg:mx-0 lg:self-start lg:border-0 lg:bg-transparent lg:p-0 lg:backdrop-blur-none"
    >
      <p className="mb-2 hidden text-xs font-bold uppercase tracking-wide text-muted-foreground lg:block">On this page</p>
      <ul className="flex gap-2 overflow-x-auto lg:flex-col lg:gap-0.5 lg:overflow-visible lg:border-l lg:border-border">
        {sections.map((s) => {
          const isActive = s.id === active;
          return (
            <li key={s.id} className="shrink-0">
              <a
                href={`#${s.id}`}
                onClick={() => setActive(s.id)}
                aria-current={isActive ? "true" : undefined}
                className={cn(
                  "block whitespace-nowrap rounded-full px-3 py-1 text-sm transition-colors lg:-ml-px lg:whitespace-normal lg:rounded-none lg:border-l-2 lg:py-1.5",
                  isActive
                    ? "bg-primary-soft text-foreground lg:border-primary lg:bg-transparent lg:font-medium"
                    : "text-muted-foreground hover:text-foreground lg:border-transparent",
                )}
              >
                {s.title.replace(/^\d+\.\s*/, "")}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
