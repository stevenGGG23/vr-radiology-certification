"use client";

import { AnimatePresence, motion } from "motion/react";
import { FlaskConical, RotateCcw, ShieldCheck, UserRound, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/cn";
import { site } from "@/lib/site";
import { useCatalog } from "@/lib/store/catalog";
import { useCurrentUser, useHydration, useSession } from "@/lib/store/session";

/**
 * Floating "Draft tools" panel for walking a client through the site.
 * Hidden automatically when NEXT_PUBLIC_DEMO_MODE=false.
 */
export function DemoToolbar({ inline = false }: { inline?: boolean }) {
  const [open, setOpen] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const hydrated = useHydration((s) => s.hydrated);
  const user = useCurrentUser();
  const router = useRouter();
  const signIn = useSession((s) => s.signIn);
  const signUp = useSession((s) => s.signUp);
  const resetDemo = useSession((s) => s.resetDemo);
  const resetCatalog = useCatalog((s) => s.resetCatalog);

  if (!site.demoMode || !hydrated) return null;

  const asStudent = () => {
    const email = "demo.student@example.com";
    const r = signIn(email);
    if (!r.ok) signUp({ name: "Demo Student", email, credential: "FNP-C", licenseNumber: "RN-000000" });
    router.push("/dashboard");
    setOpen(false);
  };
  const asAdmin = () => {
    signIn(site.demoAdminEmail);
    router.push("/studio");
    setOpen(false);
  };

  return (
    <div className={inline ? "no-print relative" : "no-print fixed bottom-4 left-4 z-[70] hidden sm:block"}>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.97 }}
            className={cn(
              "mb-3 w-72 rounded-xl border border-line bg-white p-4 shadow-2xl",
              inline && "absolute bottom-full left-0 z-50",
            )}
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="text-[13px] font-bold text-bone">Draft tools</div>
                <p className="mt-1.5 text-[12.5px] leading-relaxed text-mute">
                  Accounts, payments and progress are simulated in this browser. Nothing is charged or sent anywhere.
                </p>
              </div>
              <button onClick={() => setOpen(false)} aria-label="Close" className="text-faint hover:text-bone">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="mt-3 text-[12px] text-faint">
              Signed in as: <span className="text-bone-dim">{user ? `${user.name} (${user.role})` : "nobody"}</span>
            </div>
            <div className="mt-3 grid gap-2">
              <button onClick={asStudent} className="flex items-center gap-2 rounded-lg border border-line px-3 py-2 text-left text-[13px] text-bone-dim hover:border-line-strong hover:text-bone">
                <UserRound className="h-4 w-4 text-phosphor" /> View as a student
              </button>
              <button onClick={asAdmin} className="flex items-center gap-2 rounded-lg border border-line px-3 py-2 text-left text-[13px] text-bone-dim hover:border-line-strong hover:text-bone">
                <ShieldCheck className="h-4 w-4 text-caliper" /> Open Studio as Dr. Rudy
              </button>
              {confirmReset ? (
                <div className="rounded-lg border border-doppler-red/40 p-3 text-[12.5px] text-bone-dim">
                  Reset all demo data, catalog edits and accounts?
                  <div className="mt-2 flex gap-2">
                    <button
                      className="rounded-md bg-doppler-red px-2.5 py-1 text-ink-950"
                      onClick={() => {
                        resetDemo();
                        resetCatalog();
                        setConfirmReset(false);
                        setOpen(false);
                        router.push("/");
                      }}
                    >
                      Reset
                    </button>
                    <button className="rounded-md px-2.5 py-1 text-mute hover:text-bone" onClick={() => setConfirmReset(false)}>
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button onClick={() => setConfirmReset(true)} className="flex items-center gap-2 rounded-lg border border-line px-3 py-2 text-left text-[13px] text-bone-dim hover:border-line-strong hover:text-bone">
                  <RotateCcw className="h-4 w-4 text-doppler-red" /> Reset demo data
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <button
        onClick={() => setOpen((o) => !o)}
        title="Draft tools"
        className={cn(
          "flex items-center gap-2 rounded-full border border-[#ecdcb8] bg-[#fbf7ee] text-[#8a6a22] shadow-md transition-colors hover:bg-[#f6efdf]",
          inline ? "px-3 py-1.5 text-[12px] font-semibold" : "h-10 w-10 justify-center",
        )}
      >
        <FlaskConical className="h-4 w-4" />
        {inline && "Draft tools"}
      </button>
    </div>
  );
}
