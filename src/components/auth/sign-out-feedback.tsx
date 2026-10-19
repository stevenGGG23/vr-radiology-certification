"use client";

import { AnimatePresence, motion } from "motion/react";
import { CheckCircle2, Loader2, X } from "lucide-react";
import { useEffect, useState } from "react";
import { SIGNED_OUT_PARAM, useAuthProvider } from "@/lib/auth-client";

/** The "Signing you out" screen, and the "You're signed out" note shown after the reload. */
export function SignOutFeedback() {
  const signingOut = useAuthProvider((s) => s.signingOut);
  const [notice, setNotice] = useState(false);

  useEffect(() => {
    const url = new URL(window.location.href);
    if (!url.searchParams.has(SIGNED_OUT_PARAM)) return;
    url.searchParams.delete(SIGNED_OUT_PARAM);
    window.history.replaceState(null, "", url.pathname + url.search + url.hash);
    requestAnimationFrame(() => setNotice(true));
    setTimeout(() => setNotice(false), 5000);
  }, []);

  return (
    <AnimatePresence>
      {signingOut && (
        <motion.div
          key="signing-out"
          role="status"
          aria-live="polite"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[200] grid place-items-center bg-[#f5f7fa]/80 backdrop-blur-sm"
        >
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.25, delay: 0.05 }}
            className="flex items-center gap-3 rounded-xl border border-[#e3e8ef] bg-white px-5 py-4 text-[15px] font-semibold text-[#0d1b2e] shadow-xl"
          >
            <Loader2 className="h-5 w-5 animate-spin text-[#1a5bd0]" /> Signing you out…
          </motion.div>
        </motion.div>
      )}
      {notice && (
        <motion.div
          key="signed-out"
          role="status"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 12 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-x-0 bottom-6 z-[200] mx-auto flex w-[calc(100%-2rem)] max-w-sm items-start gap-3 rounded-xl border border-[#e3e8ef] bg-white px-4 py-3.5 text-[#0d1b2e] shadow-xl"
        >
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[#0d8a78]" />
          <div className="flex-1">
            <div className="text-[14.5px] font-semibold">You&apos;re signed out</div>
            <div className="mt-0.5 text-[13px] text-[#5b6b80]">It&apos;s safe to close this window.</div>
          </div>
          <button onClick={() => setNotice(false)} aria-label="Dismiss" className="-mr-1 rounded-md p-1 text-[#7d8ba0] hover:bg-[#f5f7fa] hover:text-[#0d1b2e]">
            <X className="h-4 w-4" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
