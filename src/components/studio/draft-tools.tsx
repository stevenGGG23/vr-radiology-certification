"use client";

import { AnimatePresence, motion } from "motion/react";
import { FlaskConical, RotateCcw, UserRound, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { site } from "@/lib/site";
import { useCatalog } from "@/lib/store/catalog";
import { useCurrentUser, useSession } from "@/lib/store/session";

/**
 * Draft-only helpers in the Studio sidebar: preview the site as a student, or
 * wipe the simulated data. Hidden when NEXT_PUBLIC_DEMO_MODE=false.
 */
export function DraftTools() {
  const [open, setOpen] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const user = useCurrentUser();
  const router = useRouter();
  const signIn = useSession((s) => s.signIn);
  const signUp = useSession((s) => s.signUp);
  const resetDemo = useSession((s) => s.resetDemo);
  const resetCatalog = useCatalog((s) => s.resetCatalog);

  if (!site.demoMode) return null;

  const asStudent = () => {
    const email = "demo.student@example.com";
    const r = signIn(email);
    if (!r.ok) signUp({ name: "Demo Student", email, credential: "FNP-C", licenseNumber: "RN-000000" });
    router.push("/dashboard");
  };

  const item = "flex items-center gap-2 rounded-lg border border-line px-3 py-2 text-left text-[13px] text-bone-dim hover:border-line-strong hover:text-bone";

  return (
    <div className="no-print relative">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.97 }}
            className="absolute bottom-full left-0 z-50 mb-3 w-72 rounded-xl border border-line bg-white p-4 shadow-2xl"
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
              <button onClick={asStudent} className={item}>
                <UserRound className="h-4 w-4 text-phosphor" /> View as a student
              </button>
              {confirmReset ? (
                <div className="rounded-lg border border-doppler-red/40 p-3 text-[12.5px] text-bone-dim">
                  Reset all demo data, catalog edits and accounts?
                  <div className="mt-2 flex gap-2">
                    <button
                      className="rounded-md bg-doppler-red px-2.5 py-1 text-white"
                      onClick={() => {
                        resetDemo();
                        resetCatalog();
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
                <button onClick={() => setConfirmReset(true)} className={item}>
                  <RotateCcw className="h-4 w-4 text-doppler-red" /> Reset demo data
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 rounded-full border border-[#ecdcb8] bg-[#fbf7ee] px-3 py-1.5 text-[12px] font-semibold text-[#8a6a22] shadow-md transition-colors hover:bg-[#f6efdf]"
      >
        <FlaskConical className="h-4 w-4" />
        Draft tools
      </button>
    </div>
  );
}
