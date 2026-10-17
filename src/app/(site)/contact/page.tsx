import type { Metadata } from "next";
import { ContactPanel } from "@/components/marketing/contact-panel";
import { Container } from "@/components/ui/primitives";

export const metadata: Metadata = { title: "Contact" };

export default function ContactPage() {
  return (
    <Container className="grid gap-14 py-16 sm:py-24 lg:grid-cols-[0.9fr_1.1fr]">
      <div>
        <h1 className="mt-5 text-[clamp(1.9rem,4vw,2.6rem)] font-bold leading-tight tracking-[-0.02em] text-bone">Get in touch.</h1>
        <p className="mt-6 max-w-md text-[17px] leading-relaxed text-mute">
          Questions about a course, your exam attempts, a certificate or group pricing? Send a message and we&apos;ll
          get back to you within two business days.
        </p>
      </div>
      <ContactPanel />
    </Container>
  );
}
