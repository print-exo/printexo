"use client";

import { BarChart3, ClipboardCheck, Images, ShoppingCart, Users } from "lucide-react";
import { AppShell, type NavItem } from "@/components/app/app-shell";
import { DemoControls } from "@/components/app/demo-controls";

const NAV: NavItem[] = [
  { href: "/admin", label: "Review queue", icon: ClipboardCheck, mobile: true },
  { href: "/admin/designs", label: "Design review", icon: Images, mobile: true },
  { href: "/admin/orders", label: "All orders", icon: ShoppingCart, mobile: true },
  { href: "/admin/users", label: "Users & shops", icon: Users, mobile: true },
  { href: "/admin/reports", label: "Reconciliation", icon: BarChart3, mobile: true },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppShell nav={NAV} area="Admin" user={{ name: "Ops Admin", detail: "operations@example.com" }} footer={<DemoControls />}>
      {children}
    </AppShell>
  );
}
