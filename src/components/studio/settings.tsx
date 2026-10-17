"use client";

import { Check, KeyRound, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { Skeleton } from "@/components/ui/primitives";
import { useHydration } from "@/lib/store/session";
import { Button } from "@/components/ui/button";
import { Field, Input, Textarea, Toggle } from "@/components/ui/form";
import { useCatalog } from "@/lib/store/catalog";
import type { SiteSettings } from "@/lib/types";
import { StudioHeader } from "./studio-shell";

export function StudioSettings() {
  const hydrated = useHydration((s) => s.hydrated);
  const settings = useCatalog((s) => s.settings);
  if (!hydrated) return <Skeleton className="h-[60vh]" />;
  return <SettingsForm initial={settings} />;
}

function SettingsForm({ initial }: { initial: SiteSettings }) {
  const update = useCatalog((s) => s.updateSettings);
  const resetCatalog = useCatalog((s) => s.resetCatalog);
  const [form, setForm] = useState<SiteSettings>(initial);
  const [saved, setSaved] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const set = <K extends keyof SiteSettings>(k: K, v: SiteSettings[K]) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <>
      <StudioHeader title="Settings" description="Site-wide text and defaults." />
      <form
        className="mt-8 grid gap-6 xl:grid-cols-[1.3fr_1fr]"
        onSubmit={(e) => {
          e.preventDefault();
          update(form);
          setSaved(true);
          setTimeout(() => setSaved(false), 2200);
        }}
      >
        <div className="space-y-6">
          <section className="panel space-y-5 p-6">
            <h2 className="text-[16px] font-medium text-bone">Announcement bar</h2>
            <Toggle checked={form.announcementOn} onChange={(v) => set("announcementOn", v)} label="Show the announcement bar" description="The thin banner across the top of every page." />
            <Field label="Message" htmlFor="s-ann"><Input id="s-ann" value={form.announcement} onChange={(e) => set("announcement", e.target.value)} /></Field>
          </section>
          <section className="panel space-y-5 p-6">
            <h2 className="text-[16px] font-medium text-bone">Support contact</h2>
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Support email" htmlFor="s-email"><Input id="s-email" type="email" value={form.supportEmail} onChange={(e) => set("supportEmail", e.target.value)} /></Field>
              <Field label="Support phone" htmlFor="s-phone"><Input id="s-phone" value={form.supportPhone} onChange={(e) => set("supportPhone", e.target.value)} /></Field>
            </div>
          </section>
          <section className="panel space-y-5 p-6">
            <h2 className="text-[16px] font-medium text-bone">Certificates & exams</h2>
            <Field label="Accreditation statement" htmlFor="s-acc" hint="Printed on every certificate. Update once accreditation is approved.">
              <Textarea id="s-acc" value={form.accreditationStatement} onChange={(e) => set("accreditationStatement", e.target.value)} />
            </Field>
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Default passing score (%)" htmlFor="s-pass"><Input id="s-pass" type="number" value={form.defaultPassingScore} onChange={(e) => set("defaultPassingScore", Number(e.target.value))} /></Field>
              <Field label="Default exam attempts" htmlFor="s-att"><Input id="s-att" type="number" value={form.defaultMaxAttempts} onChange={(e) => set("defaultMaxAttempts", Number(e.target.value))} /></Field>
            </div>
          </section>
          <div className="flex items-center gap-4">
            <Button type="submit">Save settings</Button>
            {saved && <span className="flex items-center gap-1.5 text-[13.5px] text-phosphor"><Check className="h-4 w-4" />Saved</span>}
          </div>
        </div>

        <div className="space-y-6">
          <section className="panel p-6">
            <ShieldCheck className="h-5 w-5 text-phosphor" />
            <h2 className="mt-3 text-[16px] font-medium text-bone">How Studio access works</h2>
            <ul className="mt-3 space-y-2 text-[13.5px] leading-relaxed text-mute">
              <li>• Studio isn&apos;t linked anywhere on the public site and is hidden from search engines.</li>
              <li>• What actually protects it is your account&apos;s <span className="text-bone-dim">admin role</span>, which the server checks on every request. Students who find the address still can&apos;t get in.</li>
              <li>• Launch adds two-factor sign-in for admin accounts, and every change is logged.</li>
            </ul>
          </section>
          <section className="panel p-6">
            <KeyRound className="h-5 w-5 text-doppler-red" />
            <h2 className="mt-3 text-[16px] font-medium text-bone">Reset draft catalog</h2>
            <p className="mt-2 text-[13.5px] text-mute">Restore the original sample courses and settings. This only affects the draft preview in this browser.</p>
            {confirmReset ? (
              <div className="mt-4 flex gap-2">
                <Button type="button" variant="danger" onClick={() => { resetCatalog(); setForm(useCatalog.getState().settings); setConfirmReset(false); }}>Yes, reset</Button>
                <Button type="button" variant="ghost" onClick={() => setConfirmReset(false)}>Cancel</Button>
              </div>
            ) : (
              <Button type="button" variant="danger" className="mt-4" onClick={() => setConfirmReset(true)}>Reset catalog</Button>
            )}
          </section>
        </div>
      </form>
    </>
  );
}
