"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, Store } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { PageHeader } from "@/components/app/app-shell";
import { MARKETPLACE_LABEL } from "@/components/app/order-detail";
import { Badge } from "@/components/ui/badge";
import { Button, ButtonLink } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FieldError, Input, Label } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { User } from "@/lib/domain/types";
import { balances } from "@/lib/domain/wallet";
import { COUNTRY_NAME } from "@/lib/mock/catalog";
import { CURRENT_USER_ID } from "@/lib/mock/seed";
import { updateProfile, useStore } from "@/lib/store";
import { formatDate, formatIDR } from "@/lib/utils";

const schema = z.object({
  name: z.string().trim().min(2, "Enter your name"),
  email: z.email("Enter a valid email"),
  phone: z.string().regex(/^\+?\d{9,15}$/, "Use digits only, e.g. +628123456789"),
  country: z.enum(["ID", "MY", "SG"]),
});
type Values = z.infer<typeof schema>;

const STATUS_TONE = { active: "success", pending_verification: "warning", suspended: "danger" } as const;
const SHOP_TONE = { connected: "success", pending: "info", error: "danger", disconnected: "neutral" } as const;

export default function ProfilePage() {
  const state = useStore((s) => s);
  const user = state.users.find((u) => u.id === CURRENT_USER_ID);
  if (!user) return null;
  const shops = state.shops.filter((x) => x.userId === user.id);
  const wallet = balances(state.ledger.filter((e) => e.userId === user.id));

  return (
    <>
      <PageHeader title="Profile" description="Your account details. These apply to all of your shops." />
      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <ProfileForm key={user.id} user={user} />

        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Account</CardTitle></CardHeader>
            <CardContent>
              <dl className="space-y-3 text-sm">
                <Row label="Status"><Badge tone={STATUS_TONE[user.status]}>{user.status.replace("_", " ")}</Badge></Row>
                <Row label="Plan"><span className="capitalize">{user.plan}</span></Row>
                <Row label="Member since">{formatDate(user.joinedAt)}</Row>
                <Row label="Wallet available"><Link href="/app/billing" className="text-primary hover:underline">{formatIDR(wallet.available)}</Link></Row>
                <Row label="Account ID"><span className="font-mono text-xs">{user.id}</span></Row>
              </dl>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle>Shops <span className="font-normal text-muted-foreground">({shops.length})</span></CardTitle>
              <Link href="/app/shops" className="text-sm text-primary hover:underline">Manage</Link>
            </CardHeader>
            <CardContent>
              {shops.length === 0 ? (
                <div className="space-y-3 text-sm text-muted-foreground">
                  <p>No shops connected yet.</p>
                  <ButtonLink href="/app/shops" size="sm"><Store /> Add a shop</ButtonLink>
                </div>
              ) : (
                <ul className="space-y-2 text-sm">
                  {shops.map((x) => (
                    <li key={x.id} className="flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <div className="truncate font-medium">{x.name}</div>
                        <div className="text-xs text-muted-foreground">{MARKETPLACE_LABEL[x.marketplace]}</div>
                      </div>
                      <Badge tone={SHOP_TONE[x.status]}>{x.status}</Badge>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="text-right">{children}</dd>
    </div>
  );
}

function ProfileForm({ user }: { user: User }) {
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string>();
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { name: user.name, email: user.email, phone: user.phone ?? "", country: user.country as Values["country"] },
  });

  function onSubmit(values: Values) {
    try {
      updateProfile(user.id, values);
      reset(values); // saved values become the new baseline
      setError(undefined);
      setSaved(true);
    } catch (e) {
      setError((e as Error).message);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Personal details</CardTitle>
        <CardDescription>Our team uses your WhatsApp number to finish shop onboarding.</CardDescription>
      </CardHeader>
      <CardContent>
        <form noValidate onSubmit={handleSubmit(onSubmit)} onChange={() => setSaved(false)} className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="name">Full name</Label>
            <Input id="name" autoComplete="name" aria-invalid={!!errors.name} {...register("name")} />
            <FieldError>{errors.name?.message}</FieldError>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" autoComplete="email" aria-invalid={!!errors.email} {...register("email")} />
            <FieldError>{errors.email?.message}</FieldError>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="phone">WhatsApp number</Label>
            <Input id="phone" type="tel" autoComplete="tel" aria-invalid={!!errors.phone} {...register("phone")} />
            <FieldError>{errors.phone?.message}</FieldError>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="country">Country</Label>
            <Controller
              name="country"
              control={control}
              render={({ field }) => (
                <Select name={field.name} value={field.value} onValueChange={(v) => { field.onChange(v); setSaved(false); }}>
                  <SelectTrigger id="country" ref={field.ref} onBlur={field.onBlur}><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(COUNTRY_NAME).map(([code, name]) => <SelectItem key={code} value={code}>{name}</SelectItem>)}
                  </SelectContent>
                </Select>
              )}
            />
          </div>
          {error && <p role="alert" className="text-sm text-danger sm:col-span-2">{error}</p>}
          <div className="flex items-center justify-end gap-3 sm:col-span-2">
            {saved && <span role="status" className="flex items-center gap-1.5 text-sm text-success"><CheckCircle2 className="size-4" /> Saved</span>}
            <Button type="submit" disabled={!isDirty && !error}>Save changes</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
