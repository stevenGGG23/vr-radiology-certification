/* eslint-disable @next/next/no-img-element */
import type { Metadata } from "next";
import { ArrowRight, Award, BookOpenText, GraduationCap, Presentation } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/primitives";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "About the course author",
  description: "Dr. Susanna Rudy, DNP: emergency nurse practitioner and Vanderbilt University School of Nursing professor.",
};

const credentials = ["DNP", "MFS", "ENP-C", "FNP-C", "AG-ACNP-BC"];

const timeline = [
  { when: "Early career", body: "Emergency department nurse at a Level I trauma center, then ICU, trauma and flight nursing." },
  { when: "Education", body: "MSN and DNP from Vanderbilt University; Master of Forensic Science; acute care NP/PA critical care fellowship at Emory University." },
  { when: "2016", body: "First emergency nurse practitioner in Vanderbilt University Medical Center's emergency department; joined the School of Nursing faculty." },
  { when: "POCUS", body: "Developed and coordinated Vanderbilt's graduate course, Introduction to Point of Care Ultrasound for the Advanced Practice Provider." },
  { when: "2021", body: "Part of the team behind an award-winning virtual reality ultrasound training program (Learn X Platinum, Brandon Hall Gold)." },
  { when: "Today", body: `Three years of recorded teaching, organized into the courses on ${site.name}.` },
];

export default function AboutPage() {
  return (
    <>
      <section className="border-b border-line bg-ink-950">
        <Container className="grid items-center gap-10 py-12 sm:py-16 lg:grid-cols-[320px_1fr] lg:gap-14">
          <img src="/images/people/susanna-rudy-placeholder.jpg" alt="Dr. Susanna Rudy" className="mx-auto aspect-[4/5] w-full max-w-[320px] rounded-xl object-cover object-top shadow-sm" />
          <div>
            <div className="text-[13px] font-bold uppercase tracking-[0.1em] text-caliper">Course author</div>
            <h1 className="mt-2 text-[clamp(2rem,4.5vw,3rem)] font-bold leading-tight tracking-[-0.025em] text-bone">Dr. Susanna Rudy, DNP</h1>
            <p className="mt-2 text-[16px] text-mute">Emergency nurse practitioner · Vanderbilt University School of Nursing</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {credentials.map((c) => (
                <span key={c} className="rounded-md border border-line-strong bg-white px-2.5 py-1 text-[13px] font-semibold text-bone-dim">{c}</span>
              ))}
            </div>
            <p className="mt-6 max-w-2xl text-[16.5px] leading-relaxed text-bone-dim">
              Board-certified as an emergency, family and adult-gerontology acute care nurse practitioner, with more than
              30 years in emergency departments, ICUs, trauma bays and flight crews. She built the point-of-care ultrasound
              curriculum taught to advanced practice students at Vanderbilt, and these courses are that curriculum.
            </p>
            <ButtonLink href="/courses" size="lg" className="mt-7" iconRight={<ArrowRight className="h-4 w-4" />}>Browse her courses</ButtonLink>
          </div>
        </Container>
      </section>

      <section className="py-14 sm:py-16">
        <Container className="grid gap-10 lg:grid-cols-[1.2fr_1fr] lg:gap-16">
          <div>
            <h2 className="text-[24px] font-bold tracking-[-0.02em] text-bone">Career highlights</h2>
            <ol className="mt-6 space-y-5 border-l-2 border-line pl-6">
              {timeline.map((t) => (
                <li key={t.when} className="relative">
                  <span className="absolute -left-[31px] top-1.5 h-3 w-3 rounded-full border-2 border-[#1a5bd0] bg-white" />
                  <div className="text-[13px] font-bold uppercase tracking-[0.08em] text-caliper">{t.when}</div>
                  <p className="mt-1 text-[15.5px] leading-relaxed text-bone-dim">{t.body}</p>
                </li>
              ))}
            </ol>
          </div>
          <div className="space-y-4">
            <h2 className="text-[24px] font-bold tracking-[-0.02em] text-bone">Teaching &amp; recognition</h2>
            {[
              { icon: GraduationCap, t: "Vanderbilt University School of Nursing", d: "Faculty; developed the graduate POCUS course for advanced practice providers." },
              { icon: Presentation, t: "National workshop faculty", d: "Ultrasound workshops for AAENP and AANP; ultrasound education committees for AAENP and SCCM." },
              { icon: Award, t: "VR ultrasound education awards (2021)", d: "Learn X Awards Platinum; Brandon Hall Group Gold; Learning Technologies Awards shortlist." },
              { icon: BookOpenText, t: "Published", d: "Ultrasound Education for Nurse Practitioner Students, The Journal for Nurse Practitioners (2024)." },
            ].map((i) => (
              <div key={i.t} className="flex gap-3 rounded-lg border border-line bg-white p-4">
                <i.icon className="mt-0.5 h-5 w-5 shrink-0 text-caliper" />
                <div>
                  <div className="text-[15px] font-semibold text-bone">{i.t}</div>
                  <div className="text-[14px] text-mute">{i.d}</div>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>

    </>
  );
}
