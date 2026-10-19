/* eslint-disable @next/next/no-img-element */
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import {
  ArrowRight, BadgeCheck, CalendarClock, Check, ChevronLeft, ChevronRight, Clock3, FileQuestion, GraduationCap, Lock, MonitorPlay,
  PlayCircle, RotateCcw, ShieldCheck, Smartphone, Timer, Zap,
} from "lucide-react";
import { useState } from "react";
import { Certificate } from "@/components/certificate/certificate";
import { VanderbiltMark } from "@/components/marketing/hero";
import { AccordionItem } from "@/components/ui/accordion";
import { Button, ButtonLink } from "@/components/ui/button";
import { Container, Skeleton } from "@/components/ui/primitives";
import {
  allLessons, bundleCompareAt, ceHoursFor, includedCourses, isPurchasable, lessonCount, progressFor, totalMinutes,
} from "@/lib/catalog";
import { cn } from "@/lib/cn";
import { formatMinutes, formatPriceUSD } from "@/lib/format";
import { categories, site } from "@/lib/site";
import { useCart } from "@/lib/store/cart";
import { useCatalog } from "@/lib/store/catalog";
import { useHydration, useSession } from "@/lib/store/session";
import type { Course } from "@/lib/types";
import { CourseCard } from "./course-card";
import { CourseCover } from "./course-cover";

const insidePhoto: Record<string, string> = {
  ultrasound: "/images/photos/scanning-patient.webp",
  procedures: "/images/photos/procedure.webp",
  radiography: "/images/photos/chest-xray.webp",
  ct: "/images/photos/imaging-workstation.webp",
  simulation: "/images/photos/simulation-lab.webp",
  bundle: "/images/photos/clinic-ultrasound.webp",
};

export function CourseNotFound() {
  return (
    <Container className="py-28 text-center">
      <h1 className="text-[32px] font-bold text-bone">We couldn&apos;t find that course.</h1>
      <p className="mt-3 text-mute">It may have been renamed or unpublished.</p>
      <ButtonLink href="/courses" className="mt-8" iconRight={<ArrowRight className="h-4 w-4" />}>Back to all courses</ButtonLink>
    </Container>
  );
}

function Gallery({ course, catalog }: { course: Course; catalog: Course[] }) {
  const [i, setI] = useState(0);
  const inside = insidePhoto[course.category] ?? insidePhoto.ultrasound;
  const sampleCertificate = (
    <Certificate
      className="w-full"
      data={{ id: "SVR-SAMPLE-0001", recipientName: "Your Name, Credentials", courseTitle: course.title, courseCode: course.code, ceHours: ceHoursFor(course, catalog), issuedAt: "2026-10-12T00:00:00.000Z" }}
    />
  );
  const slides = [
    {
      key: "cover",
      thumb: <img src={course.cover} alt="" className="aspect-[4/3] w-full object-cover" />,
      node: <CourseCover course={course} catalog={catalog} priority className="rounded-none" />,
    },
    {
      key: "inside",
      thumb: <img src={inside} alt="" className="aspect-[4/3] w-full object-cover" />,
      node: <img src={inside} alt="" className="aspect-[4/3] w-full object-cover" />,
    },
    {
      key: "cert",
      thumb: <div className="grid aspect-[4/3] place-items-center p-[10%]">{sampleCertificate}</div>,
      node: <div className="grid aspect-[4/3] place-items-center bg-ink-950 p-[6%]">{sampleCertificate}</div>,
    },
  ];
  const go = (d: number) => setI((x) => (x + d + slides.length) % slides.length);
  return (
    <div>
      <div className="group relative overflow-hidden rounded-lg border border-line bg-ink-950">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div key={slides[i].key} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
            {slides[i].node}
          </motion.div>
        </AnimatePresence>
        <button onClick={() => go(-1)} aria-label="Previous image" className="absolute left-3 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-md bg-white/95 text-bone shadow-md hover:bg-white">
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button onClick={() => go(1)} aria-label="Next image" className="absolute right-3 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-md bg-white/95 text-bone shadow-md hover:bg-white">
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
      <div className="mt-3 grid grid-cols-3 gap-3">
        {slides.map((s, k) => (
          <button
            key={s.key}
            onClick={() => setI(k)}
            aria-label={`Show image ${k + 1}`}
            className={cn("overflow-hidden rounded-md border-2 bg-ink-950", k === i ? "border-[#1a5bd0]" : "border-transparent opacity-75 hover:opacity-100")}
          >
            {s.thumb}
          </button>
        ))}
      </div>
    </div>
  );
}

function Waitlist() {
  const [done, setDone] = useState(false);
  if (done) return <p className="flex items-center gap-2 text-[14.5px] font-semibold text-phosphor"><Check className="h-4 w-4" /> You&apos;re on the waitlist.</p>;
  return (
    <form onSubmit={(e) => { e.preventDefault(); setDone(true); }} className="flex flex-col gap-2 sm:flex-row">
      <input type="email" required placeholder="you@hospital.org" aria-label="Email" className="h-12 flex-1 rounded-md border border-line-strong bg-white px-3.5 text-[15px] text-bone placeholder:text-faint focus:border-caliper focus:outline-none" />
      <Button type="submit" size="lg">Join the waitlist</Button>
    </form>
  );
}

type Tab = "description" | "curriculum" | "features" | "exam" | "returns";

export function CourseDetail({ slug }: { slug: string }) {
  const router = useRouter();
  const courses = useCatalog((s) => s.courses);
  const hydrated = useHydration((s) => s.hydrated);
  const userId = useSession((s) => s.currentUserId);
  const enrollments = useSession((s) => s.db.enrollments);
  const add = useCart((s) => s.add);
  const inCart = useCart((s) => s.ids);
  const [tab, setTab] = useState<Tab>("description");
  const course = courses.find((c) => c.slug === slug);

  if (!course) return hydrated ? <CourseNotFound /> : <Container className="py-16"><Skeleton className="h-[480px]" /></Container>;

  const isBundle = Boolean(course.includes?.length);
  const included = includedCourses(course, courses);
  const compareAt = isBundle ? bundleCompareAt(course, courses) : course.compareAtCents;
  const cat = categories.find((c) => c.id === course.category);
  const ce = ceHoursFor(course, courses);
  const ids = isBundle ? course.includes! : [course.id];
  const mine = userId ? enrollments.filter((e) => e.userId === userId && ids.includes(e.courseId)) : [];
  const owned = hydrated && mine.length === ids.length;
  const enrollment = mine.find((e) => e.courseId === course.id);
  const progress = enrollment ? progressFor(course, enrollment.completedLessonIds) : 0;
  const hasPreviewVideo = allLessons(course).some((l) => l.preview && l.videoUrl);
  const related = courses
    .filter((c) => c.id !== course.id && c.status === "published" && (isBundle ? c.includes : c.category === course.category || c.includes?.includes(course.id)))
    .slice(0, 3);

  const facts = [
    { icon: PlayCircle, label: isBundle ? `${included.length} courses, ${lessonCount(course, courses)} lessons` : `${lessonCount(course)} video lessons` },
    { icon: Clock3, label: formatMinutes(totalMinutes(course, courses)) },
    { icon: FileQuestion, label: isBundle ? "An exam per course" : `${course.exam.questions.length || "—"}-question final exam` },
    { icon: BadgeCheck, label: isBundle ? `${included.length} certificates` : "Certificate on passing" },
    { icon: CalendarClock, label: `${Math.round(course.accessDays / 30)} months of access` },
    { icon: Smartphone, label: "Phone, tablet or computer" },
  ];

  const tabs: { id: Tab; label: string }[] = [
    { id: "description", label: "Description" },
    ...(isBundle ? [] : [{ id: "curriculum" as Tab, label: "Curriculum" }]),
    { id: "features", label: "Key features" },
    { id: "exam", label: "Exam & certificate" },
    { id: "returns", label: "Return policy" },
  ];

  return (
    <>
      <Container className="py-6 sm:py-8">
        <nav className="flex flex-wrap items-center gap-1.5 text-[13px] text-faint" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-bone">Home</Link><span>/</span>
          <Link href="/courses" className="hover:text-bone">Courses</Link><span>/</span>
          <Link href={`/courses?c=${course.category}`} className="hover:text-bone">{cat?.label}</Link>
        </nav>

        <div className="mt-6 grid gap-10 lg:grid-cols-[1.05fr_1fr] lg:gap-14">
          <Gallery course={course} catalog={courses} />

          <div>
            <h1 className="text-[clamp(1.7rem,3.2vw,2.3rem)] font-bold leading-tight tracking-[-0.02em] text-bone">{course.title}</h1>
            <p className="mt-2 text-[16px] leading-relaxed text-mute">{course.subtitle}</p>
            <div className="mt-5 flex flex-wrap items-baseline gap-3">
              <span className="text-[24px] font-bold text-bone">{formatPriceUSD(course.priceCents)}</span>
              {compareAt && compareAt > course.priceCents && (
                <>
                  <span className="text-[16px] text-faint line-through">{formatPriceUSD(compareAt)}</span>
                  <span className="rounded bg-[#e8f6f3] px-2 py-0.5 text-[12.5px] font-bold text-phosphor">Save {formatPriceUSD(compareAt - course.priceCents).replace(" USD", "")}</span>
                </>
              )}
            </div>
            <dl className="mt-3 space-y-1 text-[14px] text-bone-dim">
              <div><dt className="inline font-semibold text-bone">SKU:</dt> <dd className="inline">{course.code}</dd></div>
              <div><dt className="inline font-semibold text-bone">Contact hours:</dt> <dd className="inline">{ce} (accreditation pending)</dd></div>
              <div><dt className="inline font-semibold text-bone">Level:</dt> <dd className="inline">{course.level}</dd></div>
            </dl>

            <div className="mt-6 space-y-3">
              {!hydrated ? (
                <Skeleton className="h-12" />
              ) : course.status === "coming-soon" ? (
                <Waitlist />
              ) : owned ? (
                <>
                  <ButtonLink href={isBundle ? "/dashboard" : `/learn/${course.slug}`} size="lg" className="w-full" iconRight={<ArrowRight className="h-4 w-4" />}>
                    {isBundle ? "Go to my courses" : progress > 0 ? `Continue learning (${progress}%)` : "Start the course"}
                  </ButtonLink>
                  <p className="text-center text-[13px] font-semibold text-phosphor">You own this {isBundle ? "bundle" : "course"}.</p>
                </>
              ) : isPurchasable(course) ? (
                <>
                  <button
                    onClick={() => add(course.id)}
                    className="h-12 w-full rounded-md border-2 border-bone text-[14px] font-bold uppercase tracking-[0.14em] text-bone transition-colors hover:bg-bone hover:text-white"
                  >
                    {inCart.includes(course.id) ? "In cart: view cart" : "Add to cart"}
                  </button>
                  <Button
                    size="lg"
                    className="w-full"
                    onClick={() => {
                      add(course.id);
                      useCart.getState().setOpen(false);
                      router.push("/checkout");
                    }}
                  >
                    Buy it now
                  </Button>
                  {hasPreviewVideo && (
                    <Link href={`/learn/${course.slug}`} className="flex items-center justify-center gap-2 pt-1 text-[14px] font-semibold text-caliper hover:underline">
                      <PlayCircle className="h-4 w-4" /> Watch a free lesson preview
                    </Link>
                  )}
                </>
              ) : (
                <p className="text-[14px] text-mute">Not available for purchase yet.</p>
              )}
            </div>

            <div className="mt-6 flex gap-3 rounded-lg border border-[#ecdcb8] bg-[#fbf7ee] p-4">
              <VanderbiltMark className="mt-0.5 h-5 w-auto shrink-0" />
              <div className="text-[14px] leading-relaxed text-bone-dim">
                <span className="font-semibold text-bone">Developed at Vanderbilt University School of Nursing.</span>{" "}
                Built over {site.provenance.years} years by Dr. Susanna Rudy, DNP.
              </div>
            </div>

            <ul className="mt-6 grid grid-cols-2 gap-x-4 gap-y-3 border-t border-line pt-6">
              {facts.map((f) => (
                <li key={f.label} className="flex items-center gap-2.5 text-[14px] text-bone-dim">
                  <f.icon className="h-4 w-4 shrink-0 text-caliper" /> {f.label}
                </li>
              ))}
            </ul>
            <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-[12.5px] text-faint">
              <span className="flex items-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5" /> Secure checkout</span>
              <span className="flex items-center gap-1.5"><Zap className="h-3.5 w-3.5" /> Instant access</span>
              <span className="flex items-center gap-1.5"><RotateCcw className="h-3.5 w-3.5" /> 14-day refund policy</span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-14">
          <div className="no-scrollbar -mx-5 flex overflow-x-auto border-b border-line px-5 sm:mx-0 sm:px-0" role="tablist">
            {tabs.map((t) => (
              <button
                key={t.id}
                role="tab"
                aria-selected={tab === t.id}
                onClick={() => setTab(t.id)}
                className={cn("relative shrink-0 px-5 py-3.5 text-[15px] font-medium transition-colors", tab === t.id ? "text-bone" : "text-mute hover:text-bone")}
              >
                {t.label}
                {tab === t.id && <motion.span layoutId="course-tab" className="absolute inset-x-3 -bottom-px h-[2px] bg-[#1a5bd0]" />}
              </button>
            ))}
          </div>

          <div className="max-w-4xl py-8">
            {tab === "description" && (
              <div className="space-y-5 text-[15.5px] leading-relaxed text-bone-dim">
                <p><span className="font-semibold text-bone">Duration:</span> {formatMinutes(totalMinutes(course, courses))} of video</p>
                <p><span className="font-semibold text-bone">Contact hours:</span> {ce} (accreditation pending)</p>
                {isBundle && compareAt && <p className="font-semibold italic text-bone">Save {formatPriceUSD(compareAt - course.priceCents).replace(" USD", "")} compared with buying each course separately.</p>}
                <p>{course.description}</p>
                {course.outcomes.length > 0 && (
                  <div>
                    <h3 className="text-[17px] font-semibold text-bone">{isBundle ? "What's included" : "What you'll learn"}</h3>
                    <ul className="mt-3 space-y-2">
                      {course.outcomes.map((o) => (
                        <li key={o} className="flex gap-2.5"><Check className="mt-1 h-4 w-4 shrink-0 text-phosphor" /> {o}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {isBundle && (
                  <ul className="divide-y divide-line rounded-lg border border-line">
                    {included.map((c) => (
                      <li key={c.id}>
                        <Link href={`/courses/${c.slug}`} className="flex items-center gap-3 p-3 hover:bg-ink-950">
                          <img src={c.cover} alt="" className="h-12 w-16 rounded object-cover" />
                          <span className="flex-1 font-semibold text-bone">{c.title}</span>
                          <span className="text-[14px] text-faint line-through">{formatPriceUSD(c.priceCents)}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
                <div>
                  <h3 className="text-[17px] font-semibold text-bone">Who it&apos;s for</h3>
                  <p className="mt-2">{course.audience.join(", ")}.</p>
                </div>
              </div>
            )}

            {tab === "curriculum" && (
              <div>
                <p className="text-[14px] text-mute">{course.modules.length} modules · {lessonCount(course)} lessons · {formatMinutes(totalMinutes(course))}</p>
                <div className="mt-4 border-t border-line">
                  {course.modules.map((m, i) => (
                    <AccordionItem key={m.id} defaultOpen={i === 0} title={`${i + 1}. ${m.title}`} meta={<span className="hidden text-[13px] text-faint sm:inline">{m.lessons.length} lessons</span>}>
                      <ul className="space-y-0.5">
                        {m.lessons.map((l) => {
                          const open = owned || l.preview;
                          return (
                            <li key={l.id}>
                              <Link href={`/learn/${course.slug}?lesson=${l.id}`} className="flex items-center justify-between gap-4 rounded-md px-3 py-2.5 text-[14.5px] text-bone-dim hover:bg-ink-950 hover:text-bone">
                                <span className="flex items-center gap-3">
                                  {open ? <PlayCircle className="h-4 w-4 shrink-0 text-caliper" /> : <Lock className="h-4 w-4 shrink-0 text-faint" />}
                                  {l.title}
                                  {l.preview && !owned && <span className="rounded bg-[#e8f6f3] px-1.5 py-0.5 text-[11px] font-bold text-phosphor">Free</span>}
                                </span>
                                <span className="shrink-0 text-[13px] text-faint">{l.durationMin} min</span>
                              </Link>
                            </li>
                          );
                        })}
                      </ul>
                    </AccordionItem>
                  ))}
                </div>
              </div>
            )}

            {tab === "features" && (
              <ul className="grid gap-4 sm:grid-cols-2">
                {[
                  { icon: MonitorPlay, t: "HD video lessons", d: "Recorded bedside scans and narrated cases." },
                  { icon: Smartphone, t: "Any device", d: "Watch on your phone, tablet or computer." },
                  { icon: Clock3, t: "Self-paced", d: "Progress saves automatically. Pick up anytime." },
                  { icon: Timer, t: "Final exam", d: `${course.exam.passingScore}% to pass, ${course.exam.maxAttempts} attempts included.` },
                  { icon: BadgeCheck, t: "Verifiable certificate", d: "Unique ID with a public verification page." },
                  { icon: GraduationCap, t: "Vanderbilt-developed", d: "Curriculum built and taught at Vanderbilt School of Nursing." },
                ].map((f) => (
                  <li key={f.t} className="flex gap-3 rounded-lg border border-line p-4">
                    <f.icon className="mt-0.5 h-5 w-5 shrink-0 text-caliper" />
                    <div>
                      <div className="text-[15px] font-semibold text-bone">{f.t}</div>
                      <div className="text-[14px] text-mute">{f.d}</div>
                    </div>
                  </li>
                ))}
              </ul>
            )}

            {tab === "exam" && (
              <div className="space-y-5 text-[15.5px] leading-relaxed text-bone-dim">
                <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {[
                    ["Unlocks", "After all lessons"],
                    ["Passing score", `${course.exam.passingScore}%`],
                    ["Attempts", `${course.exam.maxAttempts} included`],
                    ["Time limit", `${course.exam.timeLimitMin} min`],
                  ].map(([k, v]) => (
                    <div key={k} className="rounded-lg border border-line p-4">
                      <dt className="text-[13px] text-mute">{k}</dt>
                      <dd className="mt-1 text-[16px] font-semibold text-bone">{v}</dd>
                    </div>
                  ))}
                </dl>
                <p>
                  Pass the exam and your certificate is issued immediately, with a unique ID anyone can check on the{" "}
                  <Link href="/verify" className="font-semibold text-caliper hover:underline">verification page</Link>.
                </p>
              </div>
            )}

            {tab === "returns" && (
              <div className="space-y-3 text-[15.5px] leading-relaxed text-bone-dim">
                <p>Refunds are available within 14 days of purchase if you&apos;ve completed less than 20% of the course and haven&apos;t started the exam.</p>
                <p>Email {site.domain.replace(/^/, "support@")} with your order email to request one. <Link href="/legal/refunds" className="font-semibold text-caliper hover:underline">Full refund policy</Link></p>
              </div>
            )}
          </div>
        </div>
      </Container>

      {related.length > 0 && (
        <section className="border-t border-line bg-ink-950 py-14">
          <Container>
            <h2 className="text-[24px] font-bold tracking-[-0.02em] text-bone">You may also like</h2>
            <div className="mt-6 grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((c) => <CourseCard key={c.id} course={c} catalog={courses} />)}
            </div>
          </Container>
        </section>
      )}
    </>
  );
}
