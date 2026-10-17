"use client";

import { Check } from "lucide-react";
import { useState } from "react";
import { credentialOptions } from "@/components/auth/auth-forms";
import { RequireAuth } from "@/components/auth/require-auth";
import { Button } from "@/components/ui/button";
import { Field, Input, Select } from "@/components/ui/form";
import { Container } from "@/components/ui/primitives";
import { formatDate } from "@/lib/format";
import { useCurrentUser, useSession } from "@/lib/store/session";

export function Account() {
  return (
    <RequireAuth>
      <AccountInner />
    </RequireAuth>
  );
}

function AccountInner() {
  const user = useCurrentUser()!;
  const update = useSession((s) => s.updateProfile);
  const allOrders = useSession((s) => s.db.orders);
  const orders = allOrders.filter((o) => o.userId === user.id);
  const [form, setForm] = useState({
    name: user.name,
    credential: user.credential,
    licenseNumber: user.licenseNumber ?? "",
    organization: user.organization ?? "",
  });
  const [saved, setSaved] = useState(false);

  return (
    <Container className="max-w-3xl py-12 sm:py-16">
      <div className="eyebrow">Account</div>
      <h1 className="mt-3 text-[clamp(1.9rem,4vw,2.6rem)] font-bold leading-tight tracking-[-0.02em] text-bone">Your profile</h1>
      <form
        className="panel mt-10 space-y-5 p-6"
        onSubmit={(e) => {
          e.preventDefault();
          update(form);
          setSaved(true);
          setTimeout(() => setSaved(false), 2200);
        }}
      >
        <Field label="Name on certificates" htmlFor="a-name">
          <Input id="a-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        </Field>
        <Field label="Email" htmlFor="a-email" hint="Contact support to change your sign-in email.">
          <Input id="a-email" value={user.email} disabled />
        </Field>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Profession" htmlFor="a-cred">
            <Select id="a-cred" value={form.credential} onChange={(e) => setForm({ ...form, credential: e.target.value })}>
              {[form.credential, ...credentialOptions.filter((c) => c !== form.credential)].map((c) => <option key={c}>{c}</option>)}
            </Select>
          </Field>
          <Field label="License number" htmlFor="a-lic">
            <Input id="a-lic" value={form.licenseNumber} onChange={(e) => setForm({ ...form, licenseNumber: e.target.value })} />
          </Field>
        </div>
        <Field label="Organization (optional)" htmlFor="a-org">
          <Input id="a-org" value={form.organization} onChange={(e) => setForm({ ...form, organization: e.target.value })} />
        </Field>
        <div className="flex items-center gap-4">
          <Button type="submit">Save changes</Button>
          {saved && <span className="flex items-center gap-1.5 text-[13.5px] text-phosphor"><Check className="h-4 w-4" />Saved</span>}
        </div>
      </form>

      <h2 className="mt-14 font-display text-[22px] text-bone">Purchase history</h2>
      {orders.length === 0 ? (
        <p className="mt-3 text-mute">No purchases yet.</p>
      ) : (
        <ul className="mt-5 divide-y divide-line rounded-2xl border border-line text-[14.5px]">
          {orders.map((o) => (
            <li key={o.id} className="flex items-center justify-between p-4">
              <span className="text-bone-dim">{o.courseId.toUpperCase()} · {formatDate(o.at, "short")}</span>
              <span className="font-mono text-bone">${(o.amountCents / 100).toFixed(2)}</span>
            </li>
          ))}
        </ul>
      )}
      <p className="mt-10 text-[13px] text-faint">Member since {formatDate(user.createdAt)}</p>
    </Container>
  );
}
