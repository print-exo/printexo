import type { Metadata } from "next";
import { SignupForm } from "./signup-form";

export const metadata: Metadata = { title: "Start selling" };

export default function StartPage() {
  return (
    <div className="mx-auto grid max-w-5xl gap-12 px-4 py-12 sm:px-6 md:grid-cols-2">
      <div className="space-y-4">
        <h1 className="text-3xl font-display">Create your account</h1>
        <p className="text-muted-foreground">Free to join. You only pay when you get an order.</p>
        <ol className="space-y-3 pt-4 text-sm">
          {["Create your account", "Connect your shops", "Design your first tumbler", "Map it to a SKU in your shop", "Top up your wallet and start receiving orders"].map((s, i) => (
            <li key={s} className="flex items-center gap-3">
              <span className="flex size-7 items-center justify-center rounded-full bg-primary-soft text-xs font-semibold text-primary">{i + 1}</span>
              {s}
            </li>
          ))}
        </ol>
      </div>
      <SignupForm />
    </div>
  );
}
