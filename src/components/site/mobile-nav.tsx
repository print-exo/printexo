"use client";

import { Menu, X } from "lucide-react";
import { useState } from "react";
import { ButtonLink } from "@/components/ui/button";

export function MobileNav({ items }: { items: { href: string; label: string }[] }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="md:hidden">
      <button
        type="button"
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="rounded-lg p-2 hover:bg-surface-muted"
      >
        {open ? <X className="size-5" /> : <Menu className="size-5" />}
      </button>
      {open && (
        <div className="absolute inset-x-0 top-16 border-b border-border bg-background px-4 pb-6 pt-2 shadow-sm">
          <nav aria-label="Mobile" className="flex flex-col">
            {items.map((item) => (
              <a key={item.href} href={item.href} onClick={() => setOpen(false)} className="border-b border-border py-3 text-sm">
                {item.label}
              </a>
            ))}
          </nav>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <ButtonLink href="/app" variant="secondary">Log in</ButtonLink>
            <ButtonLink href="/start">Start selling</ButtonLink>
          </div>
        </div>
      )}
    </div>
  );
}
