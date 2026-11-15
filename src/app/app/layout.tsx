"use client";

import { LayoutDashboard, Images, PenTool, Tags, ShoppingCart, Store, UserRound, Wallet } from "lucide-react";
import { AppShell, type NavItem } from "@/components/app/app-shell";
import { DemoControls } from "@/components/app/demo-controls";
import { CURRENT_USER_ID } from "@/lib/mock/seed";
import { useStore } from "@/lib/store";

const NAV: NavItem[] = [
  { href: "/app", label: "Dashboard", icon: LayoutDashboard, mobile: true },
  { href: "/app/designs", label: "Designs", icon: Images, mobile: true },
  { href: "/app/studio", label: "Design Studio", icon: PenTool, mobile: true },
  { href: "/app/products", label: "Products & SKUs", icon: Tags },
  { href: "/app/orders", label: "Orders", icon: ShoppingCart, mobile: true },
  { href: "/app/shops", label: "Shops", icon: Store },
  { href: "/app/billing", label: "Wallet & billing", icon: Wallet, mobile: true },
  { href: "/app/profile", label: "Profile", icon: UserRound },
];

export default function UserLayout({ children }: { children: React.ReactNode }) {
  const user = useStore((s) => s.users.find((u) => u.id === CURRENT_USER_ID))!;
  return (
    <AppShell nav={NAV} area="Workspace" user={{ name: user.name, detail: user.email, href: "/app/profile" }} footer={<DemoControls />}>
      {children}
    </AppShell>
  );
}
