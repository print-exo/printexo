"use client";

import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { Logo } from "@/components/brand/logo";
import { cn } from "@/lib/utils";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  mobile?: boolean; // show in bottom nav
}

export function AppShell({
  nav,
  area,
  user,
  footer,
  children,
}: {
  nav: NavItem[];
  area: string;
  user: { name: string; detail: string; href?: string };
  footer?: ReactNode;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const root = nav[0].href;
  const isActive = (href: string) => (href === root ? pathname === href : pathname.startsWith(href));
  const fullBleed = pathname.startsWith("/app/studio");

  return (
    <div className="flex min-h-dvh">
      <aside className="sticky top-0 hidden h-dvh w-60 shrink-0 flex-col border-r border-border bg-tint lg:flex">
        <div className="flex h-16 items-center gap-2 px-5">
          <Logo href={root} height={25} />
          <span className="rounded-md bg-surface-muted px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">{area}</span>
        </div>
        <nav aria-label={`${area} navigation`} className="flex-1 space-y-0.5 px-3 py-2">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive(item.href) ? "page" : undefined}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-surface-muted hover:text-foreground",
                isActive(item.href) && "bg-primary-soft font-medium text-primary hover:bg-primary-soft hover:text-primary",
              )}
            >
              <item.icon className="size-4" aria-hidden />
              {item.label}
            </Link>
          ))}
        </nav>
        {footer && <div className="px-3 pb-2">{footer}</div>}
        {user.href ? (
          <Link href={user.href} className="block border-t border-border p-4 text-sm hover:bg-surface-muted">
            <div className="font-medium">{user.name}</div>
            <div className="truncate text-xs text-muted-foreground">{user.detail}</div>
          </Link>
        ) : (
          <div className="border-t border-border p-4 text-sm">
            <div className="font-medium">{user.name}</div>
            <div className="truncate text-xs text-muted-foreground">{user.detail}</div>
          </div>
        )}
      </aside>

      <div className="flex min-w-0 flex-1 flex-col pb-20 lg:pb-0">
        <header className="flex h-14 items-center justify-between border-b border-border bg-surface px-4 lg:hidden">
          <Logo href={root} height={25} />
          {user.href ? (
            <Link href={user.href} className="text-xs text-muted-foreground hover:text-foreground">{user.name}</Link>
          ) : (
            <span className="text-xs text-muted-foreground">{user.name}</span>
          )}
        </header>
        <main className={cn("w-full flex-1", !fullBleed && "mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:py-8")}>{children}</main>
      </div>

      <nav aria-label={`${area} navigation (mobile)`} className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t border-border bg-surface lg:hidden">
        {nav.filter((n) => n.mobile).slice(0, 5).map((item) => (
          <Link
            key={item.href}
            href={item.href}
            aria-current={isActive(item.href) ? "page" : undefined}
            className={cn("flex flex-col items-center gap-1 py-2 text-[11px] text-muted-foreground", isActive(item.href) && "text-primary")}
          >
            <item.icon className="size-5" aria-hidden />
            {item.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}

export function PageHeader({ title, description, actions }: { title: string; description?: string; actions?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-2xl font-display">{title}</h1>
        {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function StatCard({ label, value, hint, icon: Icon }: { label: string; value: ReactNode; hint?: ReactNode; icon: LucideIcon }) {
  return (
    <div className="rounded-[var(--radius-card)] border border-border bg-surface p-5">
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        {label}
        <Icon className="size-4" aria-hidden />
      </div>
      <div className="mt-2 text-2xl font-semibold tracking-tight">{value}</div>
      {hint && <div className="mt-1 text-xs text-muted-foreground">{hint}</div>}
    </div>
  );
}
