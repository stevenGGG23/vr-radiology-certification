/* eslint-disable @next/next/no-img-element */
import type { Metadata } from "next";
import { ArrowRight, Clock3, Stethoscope } from "lucide-react";
import { NewsletterForm } from "@/components/layout/newsletter-form";
import { SpaceCanvas } from "@/components/marketing/space-canvas";
import { LogoMark } from "@/components/ui/brand";
import { Container } from "@/components/ui/primitives";
import { site } from "@/lib/site";

/*
  Landing page for sonosusvr.com (Sonosus VR: Virtual Response On Call).
  next.config.ts rewrites "/" on the .com host to this page, so the .com
  shows it while sonosusvr.org keeps the education site.
  Placeholder copy until Dr. Rudy defines the service.
*/

export const metadata: Metadata = {
  title: { absolute: "Sonosus VR: Virtual Response On Call" },
  description: "A new on-call clinical service from Dr. Susanna Rudy, DNP. Coming soon.",
  alternates: { canonical: "https://sonosusvr.com" },
};

export default function OnCallPage() {
  return (
    <div className="flex min-h-[100svh] flex-col">
      <section className="on-dark relative flex flex-1 flex-col overflow-hidden bg-[#0b1f3a]">
        <SpaceCanvas className="absolute inset-0" />
        <header className="relative">
          <Container className="flex h-[68px] items-center justify-between">
            <span className="flex items-center gap-2.5 text-white">
              <LogoMark />
              <span className="flex flex-col leading-none">
                <span className="text-[18px] font-bold tracking-[-0.02em]">Sonosus VR</span>
                <span className="mt-[3px] text-[9.5px] font-semibold uppercase tracking-[0.3em] text-mute">Virtual Response On Call</span>
              </span>
            </span>
            <a href={site.url} className="hidden items-center gap-1.5 text-[14px] font-medium text-bone-dim hover:text-white sm:flex">
              Sonosus VR Education <ArrowRight className="h-4 w-4" />
            </a>
          </Container>
        </header>

        <Container className="relative flex flex-1 items-center py-16 sm:py-24">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-[#5fd6c3]/40 bg-[#5fd6c3]/10 px-3 py-1.5 text-[13px] font-semibold text-[#9be8da]">
              <Clock3 className="h-4 w-4" /> Coming soon
            </span>
            <h1 className="mt-6 text-[clamp(2.2rem,5vw,3.6rem)] font-bold leading-[1.06] tracking-[-0.025em] text-white">
              Virtual Response On Call
            </h1>
            <p className="mt-5 max-w-xl text-[17px] leading-relaxed text-bone-dim">
              A new on-call clinical service from Dr. Susanna Rudy, DNP, an emergency nurse practitioner with more than
              30 years in emergency and critical care. Details are on the way.
            </p>
            <div className="mt-8 max-w-md">
              <div className="mb-2 text-[14px] font-semibold text-white">Be the first to hear when we launch</div>
              <NewsletterForm />
            </div>
          </div>
        </Container>
      </section>

      <section className="bg-white py-14">
        <Container>
          <a href={site.url} className="group grid items-center gap-6 overflow-hidden rounded-2xl border border-line bg-ink-950 sm:grid-cols-[240px_1fr_auto] sm:pr-8">
            <img src="/images/photos/clinic-ultrasound.webp" alt="" className="h-44 w-full object-cover sm:h-full" />
            <div className="px-6 pb-2 sm:px-0 sm:py-6">
              <div className="flex items-center gap-2 text-[13px] font-bold uppercase tracking-[0.1em] text-caliper">
                <Stethoscope className="h-4 w-4" /> Sonosus VR Education
              </div>
              <div className="mt-2 text-[22px] font-bold tracking-[-0.02em] text-bone">Looking for ultrasound and imaging courses?</div>
              <p className="mt-1.5 text-[15px] text-mute">Self-paced point-of-care ultrasound and emergency imaging training with a final exam and certificate.</p>
            </div>
            <span className="mx-6 mb-6 inline-flex items-center gap-1.5 text-[15px] font-semibold text-caliper sm:m-0">
              Visit {site.domain} <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </span>
          </a>
        </Container>
      </section>

      <footer className="border-t border-line bg-white py-6">
        <Container className="text-[12.5px] text-faint">© {site.copyrightYear} Sonosus VR. All rights reserved.</Container>
      </footer>
    </div>
  );
}
