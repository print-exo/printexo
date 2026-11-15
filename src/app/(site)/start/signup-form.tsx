"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FieldError, Input, Label } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { legalHref, type LegalSlug } from "@/lib/legal/documents";

const schema = z.object({
  name: z.string().min(2, "Enter your name"),
  email: z.email("Enter a valid email"),
  phone: z.string().regex(/^\+?\d{9,15}$/, "Use digits only, e.g. +628123456789"),
  country: z.enum(["ID", "MY", "SG"]),
  channel: z.enum(["tiktok_shop", "shopee", "shopify", "none"]),
  agree: z.literal(true, { error: "You must accept the Terms, Privacy Policy and IP Policy" }),
});

type FormValues = z.input<typeof schema>;

/** Opens in a new tab so the half-filled form isn't lost. */
function LegalLink({ slug, children }: { slug: LegalSlug; children: React.ReactNode }) {
  return (
    <a href={legalHref(slug)} target="_blank" rel="noopener" className="font-medium text-link underline underline-offset-2">
      {children}
    </a>
  );
}

export function SignupForm() {
  const router = useRouter();
  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { country: "ID", channel: "tiktok_shop" } });

  async function onSubmit() {
    // Prototype: no auth backend yet — go straight to the demo workspace.
    // Shops are added after signup on /app/shops (a user can have many).
    await new Promise((r) => setTimeout(r, 400));
    router.push("/app?welcome=1");
  }

  return (
    <Card>
      <CardContent className="pt-5">
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
          {(
            [
              ["name", "Your name", "text", "name"],
              ["email", "Email", "email", "email"],
              ["phone", "WhatsApp number", "tel", "tel"],
            ] as const
          ).map(([key, label, type, autoComplete]) => (
            <div key={key} className="space-y-1.5">
              <Label htmlFor={key}>{label}</Label>
              <Input id={key} type={type} autoComplete={autoComplete} aria-invalid={!!errors[key]} {...register(key)} />
              <FieldError>{errors[key]?.message}</FieldError>
            </div>
          ))}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="country">Country</Label>
              <Controller
                name="country"
                control={control}
                render={({ field }) => (
                  <Select name={field.name} value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="country" ref={field.ref} onBlur={field.onBlur}><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ID">Indonesia</SelectItem>
                      <SelectItem value="MY">Malaysia</SelectItem>
                      <SelectItem value="SG">Singapore</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="channel">Where do you sell most?</Label>
              <Controller
                name="channel"
                control={control}
                render={({ field }) => (
                  <Select name={field.name} value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="channel" ref={field.ref} onBlur={field.onBlur}><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="tiktok_shop">TikTok Shop</SelectItem>
                      <SelectItem value="shopee">Shopee</SelectItem>
                      <SelectItem value="shopify">Shopify</SelectItem>
                      <SelectItem value="none">Not selling yet</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>
          <p className="text-xs text-muted-foreground">You can connect all your shops — even several on the same marketplace — after you sign up.</p>
          <label className="flex items-start gap-2 text-sm">
            <input type="checkbox" className="mt-0.5 size-4 accent-[var(--primary)]" {...register("agree")} />
            <span>
              I agree to the{" "}
              <LegalLink slug="terms">Terms of Service</LegalLink>,{" "}
              <LegalLink slug="privacy">Privacy Policy</LegalLink> and{" "}
              <LegalLink slug="intellectual-property">Intellectual Property Policy</LegalLink>, and confirm I own or have
              rights to the artwork I upload.
            </span>
          </label>
          <FieldError>{errors.agree?.message}</FieldError>
          <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Creating account…" : "Create account"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
