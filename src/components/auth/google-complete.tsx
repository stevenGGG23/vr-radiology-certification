"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { fetchGoogleUser, useAuthProvider } from "@/lib/auth-client";
import { useHydration, useSession } from "@/lib/store/session";

function safeNext(next: string | null) {
  return next && next.startsWith("/") && !next.startsWith("//") ? next : "/dashboard";
}

/** Google sends visitors here after sign-in; this signs them into the site and forwards them on. */
export function GoogleComplete({ google = false }: { google?: boolean }) {
  const router = useRouter();
  const params = useSearchParams();
  const hydrated = useHydration((s) => s.hydrated);
  const [failed, setFailed] = useState(!google);

  useEffect(() => {
    if (!hydrated || !google) return;
    let cancelled = false;
    fetchGoogleUser().then((user) => {
      if (cancelled) return;
      if (!user) return setFailed(true);
      useAuthProvider.setState({ google: true });
      useSession.getState().signInWithProvider(user);
      const next = safeNext(params.get("next"));
      router.replace(user.role === "admin" && next === "/dashboard" ? "/studio" : next);
    });
    return () => {
      cancelled = true;
    };
  }, [hydrated, google, params, router]);

  if (failed) {
    return (
      <div>
        <h1 className="text-[28px] font-bold tracking-[-0.02em] text-bone">Google sign-in didn&apos;t finish</h1>
        <p className="mt-3 text-[15px] text-mute">We couldn&apos;t confirm your Google account. Please try again.</p>
        <Link href="/login" className="mt-6 inline-flex h-11 items-center rounded-md bg-[#1a5bd0] px-5 text-[14.5px] font-semibold text-white hover:bg-[#1447a8]">
          Back to sign in
        </Link>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-3 text-[16px] text-bone-dim">
      <Loader2 className="h-5 w-5 animate-spin text-caliper" /> Signing you in…
    </div>
  );
}
