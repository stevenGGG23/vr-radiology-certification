import type { Metadata } from "next";
import { Suspense } from "react";
import { GoogleComplete } from "@/components/auth/google-complete";
import { googleSignInEnabled } from "@/lib/auth-config";

export const metadata: Metadata = { title: "Signing in", robots: { index: false } };

export default function GoogleCompletePage() {
  return (
    <Suspense>
      <GoogleComplete google={googleSignInEnabled} />
    </Suspense>
  );
}
