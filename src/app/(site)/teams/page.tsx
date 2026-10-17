import type { Metadata } from "next";
import { BarChart3, Building2, CreditCard, GraduationCap, Hospital, Stethoscope, UsersRound } from "lucide-react";
import { TeamsQuoteForm } from "@/components/marketing/teams-quote-form";
import { Reveal } from "@/components/ui/motion";
import { Container } from "@/components/ui/primitives";

export const metadata: Metadata = {
  title: "Group & institutional pricing",
  description: "Seat-based pricing, progress reporting and central invoicing for departments, residencies and NP/PA programs.",
};

const who = [
  { icon: Hospital, t: "Emergency departments", d: "Bring new APPs up to speed on eFAST, RUSH and procedural ultrasound before their first solo shift." },
  { icon: Stethoscope, t: "Urgent care groups", d: "Standardize radiograph interpretation and bedside ultrasound across every clinic." },
  { icon: GraduationCap, t: "NP & PA programs", d: "Add a ready-made POCUS curriculum with built-in assessment to your graduate courses." },
  { icon: Building2, t: "Residencies & fellowships", d: "Assign foundational modules so in-person scanning time goes to hands-on skills." },
];

const features = [
  { icon: UsersRound, t: "Seat-based pricing", d: "Volume discounts that grow with your team. Reassign unused seats any time." },
  { icon: BarChart3, t: "Lead dashboard", d: "See each learner's lesson progress, exam attempts and certificates in one place." },
  { icon: CreditCard, t: "One invoice", d: "Pay by card, ACH or purchase order, with a single annual invoice." },
];

export default function TeamsPage() {
  return (
    <>
      <section className="relative overflow-hidden border-b border-line">
        
        <Container className="relative grid gap-14 py-16 sm:py-24 lg:grid-cols-[1fr_0.9fr]">
          <div>
            <h1 className="mt-5 text-[clamp(1.9rem,4vw,2.6rem)] font-bold leading-tight tracking-[-0.02em] text-bone">
              Group pricing for departments and programs
            </h1>
            <p className="mt-6 max-w-xl text-[17px] leading-relaxed text-mute">
              Every learner gets the same lessons, the same exam and the same verifiable certificate, and you get the
              reporting to show it.
            </p>
            <div className="mt-10 grid gap-4 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
              {features.map((f) => (
                <div key={f.t} className="rounded-xl border border-line p-4">
                  <f.icon className="h-4 w-4 text-phosphor" />
                  <div className="mt-3 text-[15px] text-bone">{f.t}</div>
                  <p className="mt-1 text-[13.5px] leading-relaxed text-mute">{f.d}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="panel p-6 sm:p-8">
            <h2 className="font-display text-[24px] text-bone">Request a quote</h2>
            <p className="mt-1 text-[14px] text-mute">We&apos;ll reply within two business days.</p>
            <TeamsQuoteForm />
          </div>
        </Container>
      </section>
      <section className="py-24">
        <Container>
          <h2 className="text-[clamp(1.6rem,3vw,2.2rem)] font-bold text-bone">Who it&apos;s for</h2>
          <div className="mt-10 grid gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
            {who.map((w, i) => (
              <Reveal key={w.t} delay={i * 0.05} className="bg-void p-7">
                <w.icon className="h-5 w-5 text-caliper" />
                <h3 className="mt-6 font-display text-[24px] leading-tight text-bone">{w.t}</h3>
                <p className="mt-2 text-[14.5px] leading-relaxed text-mute">{w.d}</p>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>
    </>
  );
}
