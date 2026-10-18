import type { Metadata } from "next";
import { Suspense } from "react";
import { LoginForm } from "@/components/auth/auth-forms";
import { googleSignInEnabled } from "@/lib/auth-config";

export const metadata: Metadata = { title: "Sign in" };

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm google={googleSignInEnabled} />
    </Suspense>
  );
}
