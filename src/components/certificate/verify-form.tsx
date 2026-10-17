"use client";

import { useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { BadgeCheck, Search, ShieldX } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/format";
import { site } from "@/lib/site";
import { useHydration, useSession } from "@/lib/store/session";
import type { Certificate } from "@/lib/types";

export function VerifyForm() {
  const params = useSearchParams();
  const hydrated = useHydration((s) => s.hydrated);
  const certificates = useSession((s) => s.db.certificates);
  const [value, setValue] = useState(params.get("id") ?? "");
  const [query, setQuery] = useState<string | null>(params.get("id")?.trim().toUpperCase() || null);
  const result: { q: string; cert?: Certificate } | null =
    query && hydrated ? { q: query, cert: certificates.find((c) => c.id.toUpperCase() === query) } : null;

  const check = (raw: string) => {
    const q = raw.trim().toUpperCase();
    if (q) setQuery(q);
  };

  return (
    <div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          check(value);
        }}
        className="flex flex-col gap-3 sm:flex-row"
      >
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-faint" />
          <input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="SVR-XXXX-XXXX"
            aria-label="Certificate ID"
            className="h-12 w-full rounded-xl border border-line-strong bg-ink-900/70 pl-11 pr-4 font-mono text-[16px] uppercase tracking-[0.08em] text-bone placeholder:text-faint focus:border-caliper/60 focus:outline-none"
          />
        </div>
        <Button type="submit" size="lg">Verify</Button>
      </form>

      <AnimatePresence mode="wait">
        {result && (
          <motion.div
            key={result.q}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-8"
          >
            {result.cert ? (
              <div className="overflow-hidden rounded-2xl border border-phosphor/35 bg-phosphor/[0.04]">
                <div className="flex items-center gap-3 border-b border-phosphor/20 px-6 py-4 text-phosphor">
                  <BadgeCheck className="h-5 w-5" />
                  <span className="font-mono text-[12px] uppercase tracking-[0.14em]">Valid certificate</span>
                </div>
                <dl className="grid gap-5 p-6 sm:grid-cols-2">
                  {[
                    ["Issued to", result.cert.recipientName],
                    ["Course", `${result.cert.courseTitle} (${result.cert.courseCode})`],
                    ["Date issued", formatDate(result.cert.issuedAt)],
                    ["Final exam", "Passed"],
                    ["Contact hours", `${result.cert.ceHours.toFixed(1)} (pending accreditation)`],
                    ["Certificate ID", result.cert.id],
                  ].map(([k, v]) => (
                    <div key={k}>
                      <dt className="text-[12.5px] text-faint">{k}</dt>
                      <dd className="mt-1 text-[16px] text-bone">{v}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            ) : (
              <div className="flex gap-4 rounded-2xl border border-doppler-red/35 bg-doppler-red/[0.04] p-6">
                <ShieldX className="h-5 w-5 shrink-0 text-doppler-red" />
                <div>
                  <div className="text-[16px] text-bone">No certificate found for {result.q}</div>
                  <p className="mt-1 text-[14px] text-mute">
                    Check the ID for typos. IDs look like SVR-7KQ2-M9XD. If it still doesn&apos;t match, contact {" "}
                    <span className="text-bone-dim">support@{site.domain}</span>.
                  </p>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
      {site.demoMode && (
        <p className="mt-8 text-[12.5px] text-faint">
          Draft preview: verification checks certificates stored in this browser. Try demo IDs SVR-DEMO-1038 or SVR-DEMO-1074.
        </p>
      )}
    </div>
  );
}
