import type { Metadata } from "next";
import { Suspense } from "react";
import { SignupForm } from "@/components/auth/auth-forms";
import { googleSignInEnabled } from "@/lib/auth-config";

export const metadata: Metadata = { title: "Create an account" };

export default function SignupPage() {
  return (
    <Suspense>
      <SignupForm google={googleSignInEnabled} />
    </Suspense>
  );
}
