import type { Metadata } from "next";
import { Logo } from "@/components/brand/logo";
import { AdminLoginForm } from "./login-form";

// Not linked from anywhere on purpose; keep it out of search engines too.
export const metadata: Metadata = { title: "Admin sign in", robots: { index: false, follow: false } };

export default function AdminLoginPage() {
  return (
    <main className="flex flex-1 items-center justify-center bg-tint px-4 py-16">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <Logo height={30} href={null} />
          <span className="rounded-md bg-surface-muted px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
            Admin
          </span>
          <h1 className="text-2xl font-display">Sign in to the admin console</h1>
        </div>
        <AdminLoginForm />
      </div>
    </main>
  );
}
