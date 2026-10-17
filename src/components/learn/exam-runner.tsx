"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { ArrowLeft, ArrowRight, BadgeCheck, Flag, RotateCcw, ShieldAlert, Timer, TriangleAlert, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { RequireAuth } from "@/components/auth/require-auth";
import { CourseNotFound } from "@/components/course/course-detail";
import { Logo } from "@/components/ui/brand";
import { Button, ButtonLink } from "@/components/ui/button";
import { Container, Skeleton } from "@/components/ui/primitives";
import { progressFor } from "@/lib/catalog";
import { cn } from "@/lib/cn";
import { useCatalog } from "@/lib/store/catalog";
import { useHydration, useSession } from "@/lib/store/session";
import type { Certificate, Course, ExamAttempt, Question } from "@/lib/types";

type Phase = "intro" | "running" | "result";

function shuffle<T>(arr: T[]) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function fmt(ms: number) {
  const s = Math.max(0, Math.ceil(ms / 1000));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

export function ExamRunner({ slug }: { slug: string }) {
  return (
    <RequireAuth>
      <ExamInner slug={slug} />
    </RequireAuth>
  );
}

function Shell({ course, children, right }: { course: Course; children: React.ReactNode; right?: React.ReactNode }) {
  return (
    <div className="flex min-h-[100svh] flex-col">
      <header className="sticky top-0 z-30 border-b border-line bg-void/85 backdrop-blur-xl">
        <div className="flex h-14 items-center gap-4 px-4 sm:px-6">
          <Logo compact />
          <span className="h-5 w-px bg-line-strong" />
          <span className="min-w-0 truncate text-[14px] text-bone-dim">
            <span className="mr-2 font-mono text-[11px] text-faint">{course.code}</span>Final exam
          </span>
          <div className="ml-auto flex items-center gap-3">{right}</div>
        </div>
      </header>
      <div className="flex-1">{children}</div>
    </div>
  );
}

function ExamInner({ slug }: { slug: string }) {
  const hydrated = useHydration((s) => s.hydrated);
  const course = useCatalog((s) => s.courses.find((c) => c.slug === slug));
  const userId = useSession((s) => s.currentUserId);
  const enrollment = useSession((s) =>
    course ? s.db.enrollments.find((e) => e.userId === s.currentUserId && e.courseId === course.id) : undefined,
  );
  const allAttempts = useSession((s) => s.db.attempts);
  const allCerts = useSession((s) => s.db.certificates);
  const recordAttempt = useSession((s) => s.recordAttempt);

  const [phase, setPhase] = useState<Phase>("intro");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [flags, setFlags] = useState<Set<string>>(new Set());
  const [i, setI] = useState(0);
  const [deadline, setDeadline] = useState(0);
  const [now, setNow] = useState(0);
  const [confirming, setConfirming] = useState(false);
  const [result, setResult] = useState<{ attempt: ExamAttempt; certificate?: Certificate; missed: string[] } | null>(null);
  const submittedRef = useRef(false);

  const attempts = useMemo(
    () => (course ? allAttempts.filter((a) => a.userId === userId && a.courseId === course.id) : []),
    [allAttempts, course, userId],
  );
  const cert = course ? allCerts.find((c) => c.userId === userId && c.courseId === course.id) : undefined;

  const submit = useCallback(() => {
    if (!course || submittedRef.current) return;
    submittedRef.current = true;
    const correct = questions.filter((q) => answers[q.id] === q.answerIndex).length;
    const missed = questions.filter((q) => answers[q.id] !== q.answerIndex).map((q) => q.prompt);
    const r = recordAttempt(course, correct, questions.length);
    if (r) setResult({ ...r, missed });
    setConfirming(false);
    setPhase("result");
  }, [answers, course, questions, recordAttempt]);

  const submitRef = useRef(submit);
  const deadlineRef = useRef(deadline);
  useEffect(() => {
    submitRef.current = submit;
    deadlineRef.current = deadline;
  });

  useEffect(() => {
    if (phase !== "running") return;
    const t = setInterval(() => {
      const n = Date.now();
      setNow(n);
      if (deadlineRef.current && n >= deadlineRef.current) submitRef.current();
    }, 500);
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => {
      clearInterval(t);
      window.removeEventListener("beforeunload", warn);
    };
  }, [phase]);

  if (!course) return hydrated ? <CourseNotFound /> : <Container className="py-24"><Skeleton className="h-96" /></Container>;

  const remaining = deadline - now;
  const left = course.exam.maxAttempts - attempts.length;
  const progress = enrollment ? progressFor(course, enrollment.completedLessonIds) : 0;

  /* ----------------------------------------------------------- result */
  if (phase === "result" && result) {
    const passed = result.attempt.passed;
    const leftNow = course.exam.maxAttempts - attempts.length;
    const circ = 2 * Math.PI * 70;
    return (
      <Shell course={course}>
        <Container className="max-w-3xl py-16 text-center">
          <div className="relative mx-auto h-48 w-48">
            {passed && <Burst />}
            <svg viewBox="0 0 160 160" className="h-full w-full -rotate-90">
              <circle cx="80" cy="80" r="70" stroke="rgba(150,175,215,.14)" strokeWidth="8" fill="none" />
              <motion.circle
                cx="80" cy="80" r="70" fill="none" strokeWidth="8" strokeLinecap="round"
                stroke={passed ? "#7fe3d4" : "#ff6a5c"}
                strokeDasharray={circ}
                initial={{ strokeDashoffset: circ }}
                animate={{ strokeDashoffset: circ * (1 - result.attempt.score / 100) }}
                transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
              />
            </svg>
            <div className="absolute inset-0 grid place-items-center">
              <div>
                <div className="font-mono text-[44px] leading-none text-bone">{result.attempt.score}%</div>
                <div className="mt-1 text-[12.5px] text-faint">{result.attempt.correct} of {result.attempt.total} correct</div>
              </div>
            </div>
          </div>
          <h1 className="mt-8 text-[clamp(1.9rem,4vw,2.6rem)] font-bold leading-tight tracking-[-0.02em] text-bone">
            {passed ? "You passed." : "Not quite this time."}
          </h1>
          <p className="mx-auto mt-4 max-w-lg text-[16px] leading-relaxed text-mute">
            {passed
              ? `Your certificate for ${course.title} has been issued and is ready to download.`
              : leftNow > 0
                ? `You need ${course.exam.passingScore}% to pass. You have ${leftNow} attempt${leftNow === 1 ? "" : "s"} left. Review the lessons below, then try again when you're ready.`
                : "You've used all of your attempts. Contact support to discuss additional attempts."}
          </p>
          <div className="mt-9 flex flex-wrap justify-center gap-3">
            {passed && result.certificate ? (
              <ButtonLink href={`/certificates/${result.certificate.id}`} size="lg" iconLeft={<BadgeCheck className="h-4 w-4" />}>View certificate</ButtonLink>
            ) : leftNow > 0 ? (
              <Button
                size="lg"
                iconLeft={<RotateCcw className="h-4 w-4" />}
                onClick={() => {
                  submittedRef.current = false;
                  setResult(null);
                  setPhase("intro");
                }}
              >
                Back to exam start
              </Button>
            ) : (
              <ButtonLink href="/contact" size="lg">Contact support</ButtonLink>
            )}
            <ButtonLink href={`/learn/${course.slug}`} size="lg" variant="secondary">Back to lessons</ButtonLink>
          </div>
          {!passed && result.missed.length > 0 && (
            <div className="mt-14 text-left">
              <h2 className="text-[15px] font-medium text-bone">Topics to review</h2>
              <p className="mt-1 text-[13.5px] text-faint">Correct answers aren&apos;t shown, to keep your next attempt fair.</p>
              <ul className="mt-4 space-y-2">
                {result.missed.map((m) => (
                  <li key={m} className="flex gap-3 rounded-xl border border-line p-4 text-[14.5px] text-bone-dim">
                    <X className="mt-0.5 h-4 w-4 shrink-0 text-doppler-red" />
                    {m}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </Container>
      </Shell>
    );
  }

  /* ----------------------------------------------------------- running */
  if (phase === "running") {
    const q = questions[i];
    const answered = Object.keys(answers).length;
    const unanswered = questions.length - answered;
    const urgent = remaining < 2 * 60 * 1000;
    return (
      <Shell
        course={course}
        right={
          <span className={cn("flex items-center gap-1.5 rounded-full border px-3 py-1 font-mono text-[13px]", urgent ? "border-doppler-red/50 text-doppler-red" : "border-line-strong text-bone")}>
            <Timer className="h-3.5 w-3.5" /> {fmt(remaining)}
          </span>
        }
      >
        <div className="h-0.5 bg-white/[0.06]">
          <div className="h-full bg-gradient-to-r from-phosphor to-caliper transition-[width] duration-500" style={{ width: `${(answered / questions.length) * 100}%` }} />
        </div>
        <Container className="max-w-3xl py-10 sm:py-14">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[12px] tracking-[0.12em] text-faint">QUESTION {i + 1} / {questions.length}</span>
            <button
              onClick={() => setFlags((f) => { const n = new Set(f); if (n.has(q.id)) n.delete(q.id); else n.add(q.id); return n; })}
              className={cn("flex items-center gap-1.5 rounded-full border px-3 py-1 text-[12.5px] transition-colors", flags.has(q.id) ? "border-caliper/50 text-caliper" : "border-line text-faint hover:text-bone")}
            >
              <Flag className="h-3.5 w-3.5" /> {flags.has(q.id) ? "Flagged" : "Flag for review"}
            </button>
          </div>
          <AnimatePresence mode="wait">
            <motion.div key={q.id} initial={{ opacity: 0, x: 18 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -18 }} transition={{ duration: 0.28 }}>
              <h1 className="mt-5 text-[clamp(1.9rem,4vw,2.6rem)] font-bold leading-tight tracking-[-0.02em] text-bone">{q.prompt}</h1>
              <div className="mt-8 space-y-3" role="radiogroup" aria-label="Answer choices">
                {q.choices.map((c, k) => {
                  const sel = answers[q.id] === k;
                  return (
                    <button
                      key={k}
                      role="radio"
                      aria-checked={sel}
                      onClick={() => setAnswers((a) => ({ ...a, [q.id]: k }))}
                      className={cn(
                        "flex w-full items-start gap-4 rounded-xl border p-4 text-left text-[15.5px] leading-relaxed transition-all",
                        sel ? "border-caliper/60 bg-caliper/[0.07] text-bone" : "border-line text-bone-dim hover:border-line-strong hover:bg-white/[0.02]",
                      )}
                    >
                      <span className={cn("grid h-7 w-7 shrink-0 place-items-center rounded-full border font-mono text-[12px]", sel ? "border-caliper bg-caliper text-ink-950" : "border-line-strong text-faint")}>
                        {String.fromCharCode(65 + k)}
                      </span>
                      {c}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </AnimatePresence>

          <div className="mt-10 flex items-center justify-between gap-3">
            <Button variant="ghost" disabled={i === 0} onClick={() => setI(i - 1)} iconLeft={<ArrowLeft className="h-4 w-4" />}>Previous</Button>
            {i < questions.length - 1 ? (
              <Button onClick={() => setI(i + 1)} iconRight={<ArrowRight className="h-4 w-4" />}>Next</Button>
            ) : (
              <Button variant="caliper" onClick={() => setConfirming(true)}>Review & submit</Button>
            )}
          </div>

          <div className="mt-12 border-t border-line pt-6">
            <div className="text-[12.5px] text-faint">Jump to a question</div>
            <div className="mt-3 flex flex-wrap gap-2">
              {questions.map((qq, k) => (
                <button
                  key={qq.id}
                  onClick={() => setI(k)}
                  className={cn(
                    "relative grid h-9 w-9 place-items-center rounded-lg border font-mono text-[12px] transition-colors",
                    k === i ? "border-bone text-bone" : answers[qq.id] !== undefined ? "border-phosphor/40 bg-phosphor/10 text-phosphor" : "border-line text-faint hover:text-bone",
                  )}
                >
                  {k + 1}
                  {flags.has(qq.id) && <span className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-caliper" />}
                </button>
              ))}
            </div>
            <button onClick={() => setConfirming(true)} className="mt-6 text-[13px] text-mute underline underline-offset-4 hover:text-bone">Submit exam now</button>
          </div>
        </Container>

        <AnimatePresence>
          {confirming && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-5 backdrop-blur-sm">
              <motion.div initial={{ scale: 0.96, y: 10 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.96 }} className="w-full max-w-md rounded-2xl border border-line-strong bg-ink-900 p-6">
                <h2 className="font-display text-[24px] text-bone">Submit your exam?</h2>
                <p className="mt-2 text-[14.5px] leading-relaxed text-mute">
                  {unanswered > 0 ? (
                    <span className="flex gap-2 text-caliper"><TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" />{unanswered} question{unanswered === 1 ? " is" : "s are"} unanswered and will be marked incorrect.</span>
                  ) : "All questions are answered."}
                  {flags.size > 0 && <span className="mt-2 block">{flags.size} flagged for review.</span>}
                  <span className="mt-2 block">This uses attempt {attempts.length + 1} of {course.exam.maxAttempts}.</span>
                </p>
                <div className="mt-6 flex gap-3">
                  <Button variant="caliper" onClick={submit}>Submit</Button>
                  <Button variant="ghost" onClick={() => setConfirming(false)}>Keep working</Button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </Shell>
    );
  }

  /* ----------------------------------------------------------- intro */
  const blocked =
    !enrollment ? { title: "Enroll to take this exam", body: "The final exam is included with course enrollment.", cta: { href: `/checkout/${course.slug}`, label: "Enroll now" } }
    : cert ? { title: "You've already passed", body: "Your certificate is ready.", cta: { href: `/certificates/${cert.id}`, label: "View certificate" } }
    : progress < 100 ? { title: "Finish the lessons first", body: `The exam unlocks when every lesson is complete. You're ${progress}% of the way there.`, cta: { href: `/learn/${course.slug}`, label: "Continue learning" } }
    : left <= 0 ? { title: "No attempts remaining", body: "You've used both attempts. Contact support about additional attempts.", cta: { href: "/contact", label: "Contact support" } }
    : course.exam.questions.length === 0 ? { title: "Exam coming soon", body: "Dr. Rudy is finalizing the questions for this course.", cta: { href: `/learn/${course.slug}`, label: "Back to lessons" } }
    : null;

  return (
    <Shell course={course}>
      <Container className="max-w-3xl py-16">
        <Link href={`/learn/${course.slug}`} className="text-[13px] text-faint hover:text-bone">← Back to lessons</Link>
        <div className="eyebrow mt-8">{course.code} · Final exam</div>
        <h1 className="mt-3 text-[clamp(1.9rem,4vw,2.6rem)] font-bold leading-tight tracking-[-0.02em] text-bone">{course.title}</h1>
        <dl className="mt-10 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-4">
          {[
            ["Questions", course.exam.questions.length || "TBD"],
            ["Time limit", `${course.exam.timeLimitMin} min`],
            ["Passing score", `${course.exam.passingScore}%`],
            ["Attempts left", `${Math.max(0, left)} of ${course.exam.maxAttempts}`],
          ].map(([k, v]) => (
            <div key={k} className="bg-void p-5">
              <dt className="text-[12.5px] text-faint">{k}</dt>
              <dd className="mt-1 font-mono text-[20px] text-bone">{v}</dd>
            </div>
          ))}
        </dl>

        {blocked ? (
          <div className="mt-10 rounded-2xl border border-line-strong bg-ink-900/60 p-7">
            <ShieldAlert className="h-5 w-5 text-caliper" />
            <h2 className="mt-4 font-display text-[24px] text-bone">{blocked.title}</h2>
            <p className="mt-2 text-[15px] text-mute">{blocked.body}</p>
            <ButtonLink href={blocked.cta.href} className="mt-6" iconRight={<ArrowRight className="h-4 w-4" />}>{blocked.cta.label}</ButtonLink>
          </div>
        ) : (
          <>
            <ul className="mt-10 space-y-3 text-[15px] leading-relaxed text-bone-dim">
              {[
                "Keep this page open until you submit. The timer can't be paused, and your answers are submitted automatically when it reaches zero.",
                "You can move between questions and flag any you want to revisit before submitting.",
                "Unanswered questions are marked incorrect.",
                "Results appear immediately. If you pass, your certificate is issued on the spot.",
              ].map((t) => (
                <li key={t} className="flex gap-3"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-caliper" />{t}</li>
              ))}
            </ul>
            <div className="mt-10 flex flex-wrap items-center gap-4">
              <Button
                size="lg"
                variant="caliper"
                iconRight={<ArrowRight className="h-4 w-4" />}
                onClick={() => {
                  const t = Date.now();
                  submittedRef.current = false;
                  setQuestions(shuffle(course.exam.questions));
                  setAnswers({});
                  setFlags(new Set());
                  setI(0);
                  setNow(t);
                  setDeadline(t + course.exam.timeLimitMin * 60 * 1000);
                  setPhase("running");
                }}
              >
                Begin attempt {attempts.length + 1}
              </Button>
              <span className="text-[13px] text-faint">Attempt {attempts.length + 1} of {course.exam.maxAttempts}</span>
            </div>
          </>
        )}
      </Container>
    </Shell>
  );
}

function Burst() {
  const pieces = Array.from({ length: 22 }, (_, k) => {
    const a = (k / 22) * Math.PI * 2;
    return { x: Math.cos(a) * (110 + (k % 3) * 22), y: Math.sin(a) * (110 + (k % 4) * 18), c: ["#7fe3d4", "#f3c969", "#5b8cff", "#ece8df"][k % 4], d: (k % 5) * 0.03 };
  });
  return (
    <div className="pointer-events-none absolute left-1/2 top-1/2">
      {pieces.map((p, k) => (
        <motion.span
          key={k}
          className="absolute h-1.5 w-1.5 rounded-full"
          style={{ background: p.c }}
          initial={{ x: 0, y: 0, opacity: 0, scale: 0.4 }}
          animate={{ x: p.x, y: p.y, opacity: [0, 1, 0], scale: [0.4, 1.2, 0.6] }}
          transition={{ duration: 1.5, delay: 0.5 + p.d, ease: [0.16, 1, 0.3, 1] }}
        />
      ))}
    </div>
  );
}
