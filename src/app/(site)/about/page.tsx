/* eslint-disable @next/next/no-img-element */
import type { Metadata } from "next";
import { ArrowRight, Award, BookOpenText, Globe2, GraduationCap, Presentation, ShieldCheck } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/primitives";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "About the course author",
  description: "Dr. Susanna Rudy, DNP: emergency nurse practitioner and Instructor of Nursing at Vanderbilt University School of Nursing.",
};

const credentials = ["DNP", "MFS", "AG-ACNP", "FNP", "ENP", "CCRN"];

const timeline = [
  {
    when: "Early career",
    title: "Emergency nursing at a Level I trauma center",
    body: "Started her career in the emergency department at Johns Hopkins Hospital.",
  },
  {
    when: "1998 – 2012",
    title: "UC San Diego Medical Center",
    body: "Cared for high-acuity patients across emergency, critical care, Life Flight and hyperbaric medicine.",
  },
  {
    when: "2014 – 2016",
    title: "Doctorate and critical care fellowship",
    body: "Earned her DNP at Vanderbilt and completed Emory University's critical care fellowship for advanced practice nurses.",
  },
  {
    when: "2016",
    title: "Vanderbilt University School of Nursing",
    body: "Joined the faculty of the Emergency Nurse Practitioner program and became the first emergency nurse practitioner in Vanderbilt University Medical Center's emergency department.",
  },
  {
    when: "2017",
    title: "Created Vanderbilt's ultrasound course",
    body: "Built Introduction to Point of Care Ultrasound for the Advanced Practice Provider: 14 weeks and 40 hours of hands-on and classroom training.",
  },
  {
    when: "2021",
    title: "International awards for VR training",
    body: "Her virtual reality ultrasound education project won Learn X Platinum and Brandon Hall Group Gold.",
  },
  {
    when: "Today",
    title: "Clinician, educator and course author",
    body: `Practices as an emergency nurse practitioner, teaches at Vanderbilt, and brings her courses online through ${site.name}.`,
  },
];

export default function AboutPage() {
  return (
    <>
      <section className="border-b border-line bg-ink-950">
        <Container className="grid items-center gap-10 py-12 sm:py-16 lg:grid-cols-[320px_1fr] lg:gap-14">
          <img src="/images/people/susanna-rudy-portrait.jpg" alt="Dr. Susanna Rudy" className="mx-auto aspect-square w-full max-w-[320px] rounded-xl object-cover shadow-sm" />
          <div>
            <div className="text-[13px] font-bold uppercase tracking-[0.1em] text-caliper">Course author</div>
            <h1 className="mt-2 text-[clamp(2rem,4.5vw,3rem)] font-bold leading-tight tracking-[-0.025em] text-bone">Dr. Susanna Rudy, DNP</h1>
            <p className="mt-2 text-[16px] text-mute">Emergency nurse practitioner · Instructor of Nursing, Vanderbilt University School of Nursing</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {credentials.map((c) => (
                <span key={c} className="rounded-md border border-line-strong bg-white px-2.5 py-1 text-[13px] font-semibold text-bone-dim">{c}</span>
              ))}
            </div>
            <p className="mt-3 flex items-center gap-2 text-[14px] font-medium text-bone-dim">
              <ShieldCheck className="h-4 w-4 shrink-0 text-phosphor" />
              Licensed in 48 states, with the remaining two in progress
            </p>
            <p className="mt-6 max-w-2xl text-[16.5px] leading-relaxed text-bone-dim">
              Board-certified as an emergency, family and adult-gerontology acute care nurse practitioner, with more than
              30 years in emergency departments, critical care, flight and disaster response, and she still practices
              clinically. She created the point-of-care ultrasound course taught to advanced practice students at
              Vanderbilt, and these courses are built from it.
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
                  <div className="text-[12.5px] font-bold uppercase tracking-[0.08em] text-caliper">{t.when}</div>
                  <h3 className="mt-1 text-[16px] font-semibold text-bone">{t.title}</h3>
                  <p className="mt-1 text-[15px] leading-relaxed text-mute">{t.body}</p>
                </li>
              ))}
            </ol>
          </div>
          <div className="space-y-4">
            <h2 className="text-[24px] font-bold tracking-[-0.02em] text-bone">Teaching &amp; recognition</h2>
            {[
              { icon: GraduationCap, t: "Vanderbilt University School of Nursing", d: "Instructor of Nursing; created and coordinates the 14-week, 40-hour POCUS course for advanced practice providers." },
              { icon: Presentation, t: "National workshop faculty", d: "Ultrasound lectures and workshops for AAENP and AANP; ultrasound education committees for AAENP and the Society of Critical Care Medicine, where she is junior faculty." },
              { icon: Award, t: "VR ultrasound education awards (2021)", d: "Learn X Awards Platinum; Brandon Hall Group Gold; Learning Technologies Awards shortlist." },
              { icon: BookOpenText, t: "Published", d: "Ultrasound Education for Nurse Practitioner Students, The Journal for Nurse Practitioners (2024)." },
              { icon: Globe2, t: "Humanitarian & disaster medicine", d: "Medical and teaching missions to Indonesia, Honduras, Lithuania and Latvia, two tours aboard the Mercy hospital ship, and service on a Disaster Medical Assistance Team." },
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
