"use client";

import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { Container, Skeleton } from "@/components/ui/primitives";
import { useCurrentUser, useHydration } from "@/lib/store/session";
import type { Role } from "@/lib/types";

/**
 * Client-side gate for the draft. In production this check moves to the
 * server (proxy.ts + session cookie) so protected pages and videos are never
 * sent to signed-out users at all.
 */
export function RequireAuth({ children, role, fallback }: { children: ReactNode; role?: Role; fallback?: ReactNode }) {
  const hydrated = useHydration((s) => s.hydrated);
  const user = useCurrentUser();
  const router = useRouter();
  useEffect(() => {
    if (hydrated && !user) {
      const here = window.location.pathname + window.location.search;
      router.replace(`/login?next=${encodeURIComponent(here)}`);
    }
  }, [hydrated, user, router]);

  if (!hydrated || !user) {
    return (
      fallback ?? (
        <Container className="py-20">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="mt-6 h-64" />
        </Container>
      )
    );
  }
  if (role && user.role !== role) return <Forbidden />;
  return <>{children}</>;
}

function Forbidden() {
  return (
    <Container className="py-32 text-center">
      <p className="text-[14px] font-semibold text-doppler-red">Restricted</p>
      <h1 className="mt-4 font-display text-4xl text-bone">This area is for staff.</h1>
      <p className="mt-4 text-mute">Your account doesn&apos;t have access to this page.</p>
    </Container>
  );
}
