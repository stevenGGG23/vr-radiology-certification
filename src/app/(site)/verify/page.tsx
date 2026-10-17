import type { Metadata } from "next";
import { Suspense } from "react";
import { VerifyForm } from "@/components/certificate/verify-form";
import { Container } from "@/components/ui/primitives";

export const metadata: Metadata = {
  title: "Verify a certificate",
  description: "Confirm that a Rudy Imaging Academy certificate is genuine.",
};

export default function VerifyPage() {
  return (
    <section className="relative overflow-hidden">
      
      <Container className="relative max-w-3xl py-20 sm:py-28">
        <h1 className="mt-5 text-[clamp(1.9rem,4vw,2.6rem)] font-bold leading-tight tracking-[-0.02em] text-bone">Verify a certificate</h1>
        <p className="mt-5 max-w-xl text-[17px] leading-relaxed text-mute">
          Enter the certificate ID printed at the bottom of the certificate. You&apos;ll see who it was issued to, the
          course, the date and the exam score.
        </p>
        <div className="mt-10">
          <Suspense>
            <VerifyForm />
          </Suspense>
        </div>
      </Container>
    </section>
  );
}
