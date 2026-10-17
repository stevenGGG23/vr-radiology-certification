"use client";

import { CircleCheck, Mail, Phone } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/form";
import { useCatalog } from "@/lib/store/catalog";

export function ContactPanel() {
  const settings = useCatalog((s) => s.settings);
  const [sent, setSent] = useState(false);
  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="flex items-center gap-3 rounded-xl border border-line p-4 text-[14.5px] text-bone-dim">
          <Mail className="h-4 w-4 text-phosphor" /> {settings.supportEmail}
        </div>
        <div className="flex items-center gap-3 rounded-xl border border-line p-4 text-[14.5px] text-bone-dim">
          <Phone className="h-4 w-4 text-phosphor" /> {settings.supportPhone}
        </div>
      </div>
      <div className="panel p-6 sm:p-8">
        {sent ? (
          <div>
            <CircleCheck className="h-7 w-7 text-phosphor" />
            <p className="mt-3 font-display text-[22px] text-bone">Message received.</p>
            <p className="mt-1 text-[14px] text-mute">Draft preview: nothing was sent. This form will deliver to {settings.supportEmail} once connected.</p>
          </div>
        ) : (
          <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); setSent(true); }}>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Name" htmlFor="c-name"><Input id="c-name" required /></Field>
              <Field label="Email" htmlFor="c-email"><Input id="c-email" type="email" required /></Field>
            </div>
            <Field label="Topic" htmlFor="c-topic">
              <Select id="c-topic" defaultValue="Course question">
                {["Course question", "Exam attempts", "Certificate or CE", "Billing or refund", "Group pricing", "Something else"].map((o) => <option key={o}>{o}</option>)}
              </Select>
            </Field>
            <Field label="Message" htmlFor="c-msg"><Textarea id="c-msg" required className="min-h-36" /></Field>
            <Button type="submit" size="lg">Send message</Button>
          </form>
        )}
      </div>
    </div>
  );
}
