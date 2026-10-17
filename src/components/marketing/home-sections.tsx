/* eslint-disable @next/next/no-img-element */
"use client";

import Link from "next/link";
import {
  ArrowRight, BadgeCheck, Bone, Brain, CalendarClock, Check, ClipboardCheck, CreditCard, Glasses, GraduationCap, Layers, MonitorPlay, Syringe, Timer, Waves,
} from "lucide-react";
import { useMemo } from "react";
import { Certificate } from "@/components/certificate/certificate";
import { CourseCard } from "@/components/course/course-card";
import { AccordionItem } from "@/components/ui/accordion";
import { ButtonLink } from "@/components/ui/button";
import { Counter, Reveal } from "@/components/ui/motion";
import { Container } from "@/components/ui/primitives";
import { VanderbiltMark } from "./hero";
import { SpaceCanvas } from "./space-canvas";
import { bundleCompareAt, ceHoursFor, includedCourses } from "@/lib/catalog";
import { faqs } from "@/lib/faq";
import { formatPriceUSD } from "@/lib/format";
import { site } from "@/lib/site";
import { useCart } from "@/lib/store/cart";
import { useCatalog } from "@/lib/store/catalog";

function SectionTitle({ title, sub, action }: { title: string; sub?: string; action?: { href: string; label: string } }) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h2 className="text-[clamp(1.6rem,3vw,2.2rem)] font-bold leading-tight tracking-[-0.02em] text-bone">{title}</h2>
        {sub && <p className="mt-2 max-w-2xl text-[16px] text-mute">{sub}</p>}
      </div>
      {action && (
        <Link href={action.href} className="flex shrink-0 items-center gap-1 text-[14.5px] font-semibold text-caliper hover:underline">
          {action.label} <ArrowRight className="h-4 w-4" />
        </Link>
      )}
    </div>
  );
}

export function TrustStrip() {
  const items = [
    { icon: GraduationCap, t: "Vanderbilt-developed", d: "Created by a School of Nursing professor" },
    { icon: CalendarClock, t: `${site.provenance.years} years in development`, d: "Recorded, taught and refined" },
    { icon: BadgeCheck, t: "Exam + certificate", d: "Verifiable by employers" },
    { icon: MonitorPlay, t: "Self-paced video", d: "Phone, tablet or laptop" },
  ];
  return (
    <section className="border-b border-line bg-white">
      <Container className="grid grid-cols-2 gap-x-6 gap-y-6 py-8 lg:grid-cols-4">
        {items.map((i) => (
          <div key={i.t} className="flex items-start gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#eaf1fc] text-caliper">
              {i.icon === GraduationCap ? <VanderbiltMark className="h-[18px] w-auto" /> : <i.icon className="h-5 w-5" />}
            </span>
            <div>
              <div className="text-[14.5px] font-semibold text-bone">{i.t}</div>
              <div className="text-[13px] text-mute">{i.d}</div>
            </div>
          </div>
        ))}
      </Container>
    </section>
  );
}

const tiles = [
  { id: "ultrasound", label: "Point-of-care ultrasound", short: "Ultrasound", icon: Waves, img: "/images/photos/clinician-probe.webp" },
  { id: "procedures", label: "Procedural guidance", short: "Procedures", icon: Syringe, img: "/images/photos/procedure.webp" },
  { id: "radiography", label: "Radiographs", short: "X-ray", icon: Bone, img: "/images/photos/chest-xray.webp" },
  { id: "ct", label: "CT interpretation", short: "CT", icon: Brain, img: "/images/photos/imaging-workstation.webp" },
  { id: "simulation", label: "VR simulation", short: "VR lab", icon: Glasses, img: "/images/courses/vr-lab.webp" },
  { id: "bundle", label: "Bundles", short: "Bundles", icon: Layers, img: "/images/courses/bundle-emergency.webp" },
];

/** Round badge in the same style as the course cards' CE badge. */
function SpecialtyBadge({ icon: Icon, short, count }: { icon: typeof Waves; short: string; count: number }) {
  return (
    <div className="aspect-square w-[60cqw] max-w-[150px] rounded-full bg-white p-[1.3cqw] shadow-[0_6px_24px_rgba(7,21,40,0.35)] transition-transform duration-500 group-hover:scale-105">
      <div className="flex h-full flex-col overflow-hidden rounded-full border-[0.8cqw] border-[#0b1f3a]">
        <div className="flex flex-1 flex-col items-center justify-end bg-white pb-[1cqw]">
          <Icon className="h-[11cqw] w-[11cqw] max-h-9 max-w-9 text-[#0b1f3a]" strokeWidth={1.7} />
          <span className="mt-[0.5cqw] text-[min(6.6cqw,17px)] font-extrabold leading-none text-[#35a3de]">{short}</span>
        </div>
        <div className="flex flex-1 flex-col items-center justify-start bg-[#35a3de] pt-[1.6cqw] text-white">
          <span className="text-[min(11cqw,28px)] font-extrabold leading-none">{count}</span>
          <span className="mt-[0.6cqw] text-[min(4.6cqw,12px)] font-bold uppercase tracking-wide">{count === 1 ? "Course" : "Courses"}</span>
        </div>
      </div>
    </div>
  );
}

export function Specialties() {
  const courses = useCatalog((s) => s.courses);
  return (
    <section className="py-16 sm:py-20">
      <Container>
        <SectionTitle title="Shop by specialty" action={{ href: "/courses", label: "All courses" }} />
        <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
          {tiles.map((t, i) => {
            const n = courses.filter((c) => c.category === t.id && c.status !== "draft").length;
            return (
              <Reveal key={t.id} delay={i * 0.04}>
                <Link
                  href={`/courses?c=${t.id}`}
                  className="@container group relative block aspect-[4/5] overflow-hidden rounded-lg bg-[#0b1f3a] shadow-sm ring-1 ring-black/5"
                >
                  <img src={t.img} alt="" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(7,21,40,0.15)_0%,rgba(7,21,40,0)_35%,rgba(7,21,40,0.9))]" />
                  <div className="absolute inset-x-0 top-[38%] flex -translate-y-1/2 justify-center">
                    <SpecialtyBadge icon={t.icon} short={t.short} count={n} />
                  </div>
                  <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 p-4">
                    <div className="text-[15px] font-semibold leading-tight text-white">{t.label}</div>
                    <ArrowRight className="h-4 w-4 shrink-0 text-white/80 transition-transform group-hover:translate-x-0.5" />
                  </div>
                </Link>
              </Reveal>
            );
          })}
        </div>
      </Container>
    </section>
  );
}

export function FeaturedCourses() {
  const courses = useCatalog((s) => s.courses);
  const list = useMemo(() => {
    const live = courses.filter((c) => c.status === "published" && !c.includes);
    return [...live.filter((c) => c.featured), ...live.filter((c) => !c.featured)].slice(0, 6);
  }, [courses]);
  return (
    <section className="bg-ink-950 py-16 sm:py-20">
      <Container>
        <SectionTitle title="Featured courses" sub="Each course includes video lessons, a final exam and a certificate." action={{ href: "/courses", label: "View all courses" }} />
        <div className="mt-8 grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((c, i) => (
            <Reveal key={c.id} delay={(i % 3) * 0.05}>
              <CourseCard course={c} catalog={courses} />
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}

export function BundleBand() {
  const courses = useCatalog((s) => s.courses);
  const add = useCart((s) => s.add);
  const bundle = courses.find((c) => c.id === "ria-b1");
  if (!bundle || bundle.status !== "published") return null;
  const included = includedCourses(bundle, courses);
  const compare = bundleCompareAt(bundle, courses);
  return (
    <section className="py-16 sm:py-20">
      <Container>
        <Reveal className="grid overflow-hidden rounded-2xl border border-line bg-white shadow-sm lg:grid-cols-2">
          <img src={bundle.cover} alt="" className="h-64 w-full object-cover sm:h-80 lg:h-full" />
          <div className="p-7 sm:p-10">
            <span className="rounded bg-[#f6efdf] px-2 py-1 text-[12px] font-bold uppercase tracking-wide text-[#8a6a22]">Best value</span>
            <h2 className="mt-4 text-[clamp(1.6rem,3vw,2.1rem)] font-bold leading-tight tracking-[-0.02em] text-bone">{bundle.title}</h2>
            <p className="mt-2 text-[15.5px] text-mute">{included.length} courses · {ceHoursFor(bundle, courses)} contact hours · one enrollment</p>
            <ul className="mt-6 grid gap-2 sm:grid-cols-2">
              {included.map((c) => (
                <li key={c.id} className="flex gap-2 text-[14.5px] text-bone-dim">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-phosphor" /> {c.title}
                </li>
              ))}
            </ul>
            <div className="mt-7 flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <span className="whitespace-nowrap text-[24px] font-bold text-bone sm:text-[28px]">{formatPriceUSD(bundle.priceCents)}</span>
              <span className="whitespace-nowrap text-[15px] text-faint line-through">{formatPriceUSD(compare)}</span>
            </div>
            <div className="mt-5 flex flex-wrap gap-3">
              <button onClick={() => add(bundle.id)} className="h-12 rounded-lg bg-[#1a5bd0] px-6 text-[15px] font-semibold text-white hover:bg-[#1447a8]">
                Add to cart
              </button>
              <ButtonLink href={`/courses/${bundle.slug}`} size="lg" variant="secondary">View details</ButtonLink>
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}

const coverage = [
  "Physics & knobology",
  "Trauma: eFAST",
  "Cardiac & shock: RUSH",
  "Lung & pleura",
  "Vascular access",
  "Aorta, biliary, renal & DVT",
  "Chest & extremity X-rays",
  "CT head",
];

export function VanderbiltSection() {
  return (
    <section className="bg-ink-950 py-14 sm:py-16">
      <Container className="grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
        <Reveal>
          <div className="flex items-center gap-2.5 text-[13px] font-bold uppercase tracking-[0.1em] text-[#8a6a22]">
            <VanderbiltMark className="h-4 w-auto" /> The curriculum
          </div>
          <h2 className="mt-3 text-[clamp(1.6rem,3vw,2.2rem)] font-bold leading-tight tracking-[-0.02em] text-bone">
            Developed and taught at Vanderbilt University
          </h2>
          <p className="mt-4 max-w-xl text-[16px] leading-relaxed text-bone-dim">{site.provenance.long}</p>

          <dl className="mt-7 grid grid-cols-3 divide-x divide-line overflow-hidden rounded-xl border border-line bg-white">
            {[
              { v: site.provenance.years, s: " yrs", l: "in development" },
              { v: 9, s: "", l: "courses" },
              { v: 49, s: "+", l: "contact hours*" },
            ].map((x) => (
              <div key={x.l} className="px-4 py-4 sm:px-5">
                <dt className="sr-only">{x.l}</dt>
                <dd className="text-[24px] font-bold text-bone sm:text-[28px]"><Counter to={x.v} suffix={x.s} /></dd>
                <dd className="text-[13px] text-mute">{x.l}</dd>
              </div>
            ))}
          </dl>

          <div className="mt-7">
            <div className="text-[14px] font-semibold text-bone">What the curriculum covers</div>
            <ul className="mt-3 grid gap-x-6 gap-y-2 sm:grid-cols-2">
              {coverage.map((c) => (
                <li key={c} className="flex items-center gap-2.5 text-[14.5px] text-bone-dim">
                  <Check className="h-4 w-4 shrink-0 text-phosphor" /> {c}
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <ButtonLink href="/courses/complete-pocus-curriculum" iconRight={<ArrowRight className="h-4 w-4" />}>See the full curriculum</ButtonLink>
            <ButtonLink href="/about" variant="secondary">Meet Dr. Rudy</ButtonLink>
          </div>
          <p className="mt-4 text-[12px] text-faint">*Contact hours pending accreditation.</p>
        </Reveal>
        <Reveal delay={0.08}>
          <div className="mx-auto max-w-[440px] pb-10">
            <SpaceCanvas scanner cutout className="relative aspect-[0.96/1] w-full [filter:drop-shadow(0_24px_30px_rgba(11,31,58,0.28))]" />
          </div>
        </Reveal>
      </Container>
    </section>
  );
}

export function HowItWorks() {
  const steps = [
    { icon: CreditCard, t: "Enroll", d: "Buy a course or bundle. Access starts right away." },
    { icon: MonitorPlay, t: "Watch the lessons", d: "Short videos on any device. Progress saves automatically." },
    { icon: Timer, t: "Pass the exam", d: "80% to pass, with two attempts included." },
    { icon: ClipboardCheck, t: "Get your certificate", d: "Download it instantly. Employers can verify it online." },
  ];
  return (
    <section id="how-it-works" className="scroll-mt-24 py-16 sm:py-20">
      <Container>
        <SectionTitle title="How it works" />
        <ol className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((s, i) => (
            <Reveal as="li" key={s.t} delay={i * 0.05} className="rounded-xl border border-line bg-white p-6">
              <div className="flex items-center justify-between">
                <span className="grid h-11 w-11 place-items-center rounded-full bg-[#eaf1fc] text-caliper"><s.icon className="h-5 w-5" /></span>
                <span className="text-[13px] font-bold text-faint">0{i + 1}</span>
              </div>
              <h3 className="mt-5 text-[17px] font-semibold text-bone">{s.t}</h3>
              <p className="mt-1.5 text-[14.5px] leading-relaxed text-mute">{s.d}</p>
            </Reveal>
          ))}
        </ol>
      </Container>
    </section>
  );
}

export function CertificateBand() {
  return (
    <section className="bg-ink-950 py-16 sm:py-20">
      <Container className="grid items-center gap-10 lg:grid-cols-[1fr_1.15fr] lg:gap-16">
        <Reveal>
          <h2 className="text-[clamp(1.6rem,3vw,2.2rem)] font-bold leading-tight tracking-[-0.02em] text-bone">A certificate for every course you pass</h2>
          <ul className="mt-6 space-y-3 text-[15.5px] text-bone-dim">
            {["Unique certificate ID", "Public verification page for employers", "Contact hours listed once accredited", "Download or print as a PDF"].map((t) => (
              <li key={t} className="flex gap-3"><Check className="mt-0.5 h-5 w-5 shrink-0 text-phosphor" />{t}</li>
            ))}
          </ul>
          <ButtonLink href="/verify" variant="secondary" className="mt-8" iconRight={<ArrowRight className="h-4 w-4" />}>Verify a certificate</ButtonLink>
        </Reveal>
        <Reveal delay={0.08}>
          <Certificate
            data={{ id: "SVR-7KQ2-M9XD", recipientName: "Jordan A. Example, FNP-C", courseTitle: "eFAST: Trauma Ultrasound", courseCode: "SVR-110", ceHours: 5.5, issuedAt: "2026-10-12T00:00:00.000Z" }}
            className="rotate-[-1deg]"
          />
        </Reveal>
      </Container>
    </section>
  );
}

export function TeamsBand() {
  return (
    <section className="py-16 sm:py-20">
      <Container>
        <Reveal className="on-dark relative overflow-hidden rounded-2xl bg-[#0b1f3a]">
          <div aria-hidden className="pointer-events-none absolute -left-24 -top-24 h-80 w-80 animate-[drift_14s_ease-in-out_infinite] rounded-full bg-[#1a5bd0]/40 blur-3xl" />
          <div aria-hidden className="pointer-events-none absolute -bottom-32 left-1/3 h-72 w-72 animate-[drift_18s_ease-in-out_infinite_reverse] rounded-full bg-[#35a3de]/25 blur-3xl" />
          <img src="/images/photos/simulation-lab.webp" alt="" className="absolute inset-y-0 right-0 hidden h-full w-1/2 object-cover lg:block" />
          <div className="absolute inset-y-0 right-0 hidden w-1/2 bg-[linear-gradient(90deg,#0b1f3a,rgba(11,31,58,0))] lg:block" />
          <div className="relative max-w-xl p-8 sm:p-12">
            <h2 className="text-[clamp(1.6rem,3vw,2.2rem)] font-bold leading-tight tracking-[-0.02em] text-white">Training a department or program?</h2>
            <p className="mt-3 text-[16px] leading-relaxed text-bone-dim">Seat-based pricing for 5+ learners, progress reporting and a single invoice.</p>
            <div className="mt-7 flex flex-wrap gap-3">
              <ButtonLink href="/teams" variant="light" iconRight={<ArrowRight className="h-4 w-4" />}>Get group pricing</ButtonLink>
              <ButtonLink href="/contact" variant="secondary">Contact us</ButtonLink>
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}

export function AuthorCard() {
  return (
    <section className="pb-16 sm:pb-20">
      <Container>
        <Reveal className="grid items-center gap-6 rounded-2xl border border-line bg-white p-6 sm:grid-cols-[140px_1fr_auto] sm:p-8">
          <img src="/images/people/susanna-rudy-headshot.jpg" alt="Dr. Susanna Rudy" className="mx-auto h-32 w-32 rounded-full object-cover ring-4 ring-[#eaf1fc] sm:mx-0 sm:h-36 sm:w-36" />
          <div>
            <div className="text-[13px] font-bold uppercase tracking-[0.1em] text-caliper">Course author</div>
            <h2 className="mt-1 text-[22px] font-bold text-bone">Dr. Susanna Rudy, DNP</h2>
            <p className="mt-1 text-[14px] text-mute">Emergency, family &amp; acute care nurse practitioner · Vanderbilt University School of Nursing</p>
            <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-bone-dim">
              30+ years in emergency and critical care. Built Vanderbilt&apos;s point-of-care ultrasound course for advanced practice providers and teaches national ultrasound workshops.
            </p>
          </div>
          <ButtonLink href="/about" variant="secondary" iconRight={<ArrowRight className="h-4 w-4" />}>Full bio</ButtonLink>
        </Reveal>
      </Container>
    </section>
  );
}

export function FaqShort() {
  return (
    <section className="border-t border-line py-16 sm:py-20">
      <Container className="grid gap-8 lg:grid-cols-[0.7fr_1.3fr]">
        <div>
          <h2 className="text-[clamp(1.6rem,3vw,2.2rem)] font-bold leading-tight tracking-[-0.02em] text-bone">Common questions</h2>
          <Link href="/faq" className="mt-3 inline-flex items-center gap-1 text-[14.5px] font-semibold text-caliper hover:underline">All FAQs <ArrowRight className="h-4 w-4" /></Link>
        </div>
        <div className="border-t border-line">
          {faqs.slice(0, 5).map((f) => (
            <AccordionItem key={f.q} title={f.q}>
              <p className="text-[15px] leading-relaxed text-mute">{f.a}</p>
            </AccordionItem>
          ))}
        </div>
      </Container>
    </section>
  );
}
