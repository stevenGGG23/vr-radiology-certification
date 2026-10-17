"use client";

import Link from "next/link";
import { ArrowRight, Award, BadgeCheck, BookOpen, Clock3, FileQuestion, PlayCircle, Timer } from "lucide-react";
import { RequireAuth } from "@/components/auth/require-auth";
import { CourseCover } from "@/components/course/course-cover";
import { ButtonLink } from "@/components/ui/button";
import { Reveal } from "@/components/ui/motion";
import { Container, ProgressBar, Tag } from "@/components/ui/primitives";
import { allLessons, nextLesson, progressFor } from "@/lib/catalog";
import { formatDate } from "@/lib/format";
import { useCatalog } from "@/lib/store/catalog";
import { useCurrentUser, useSession } from "@/lib/store/session";
import type { Course, Enrollment, ExamAttempt } from "@/lib/types";

export function courseState(course: Course, enrollment: Enrollment, attempts: ExamAttempt[], certified: boolean) {
  const progress = progressFor(course, enrollment.completedLessonIds);
  const used = attempts.length;
  if (certified) return { key: "certified", label: "Certified", tone: "phosphor" as const, progress };
  if (used >= course.exam.maxAttempts) return { key: "locked", label: "No attempts left", tone: "red" as const, progress };
  if (progress >= 100) return { key: "exam", label: used ? `Retake available (${used}/${course.exam.maxAttempts})` : "Exam ready", tone: "caliper" as const, progress };
  if (progress > 0) return { key: "progress", label: "In progress", tone: "blue" as const, progress };
  return { key: "new", label: "Not started", tone: "default" as const, progress };
}

export function Dashboard() {
  return (
    <RequireAuth>
      <DashboardInner />
    </RequireAuth>
  );
}

function DashboardInner() {
  const user = useCurrentUser()!;
  const courses = useCatalog((s) => s.courses);
  const db = useSession((s) => s.db);
  const mine = db.enrollments
    .filter((e) => e.userId === user.id)
    .map((e) => ({ e, c: courses.find((c) => c.id === e.courseId) }))
    .filter((x): x is { e: Enrollment; c: Course } => Boolean(x.c));
  const certs = db.certificates.filter((c) => c.userId === user.id);
  const attempts = db.attempts.filter((a) => a.userId === user.id);
  const resume = [...mine].filter((x) => x.e.lastLessonId).pop() ?? mine[0];
  const lessonsDone = mine.reduce((n, x) => n + x.e.completedLessonIds.length, 0);
  const ce = certs.reduce((n, c) => n + c.ceHours, 0);

  return (
    <Container className="py-12 sm:py-16">
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="eyebrow">My learning</div>
          <h1 className="mt-3 text-[clamp(1.9rem,4vw,2.6rem)] font-bold leading-tight tracking-[-0.02em] text-bone">
            Welcome back, {user.name.split(" ")[0]}.
          </h1>
        </div>
        <ButtonLink href="/courses" variant="secondary" iconRight={<ArrowRight className="h-4 w-4" />}>Browse courses</ButtonLink>
      </div>

      <dl className="mt-10 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-line bg-line md:grid-cols-4">
        {[
          { icon: BookOpen, v: mine.length, l: "Courses" },
          { icon: PlayCircle, v: lessonsDone, l: "Lessons completed" },
          { icon: BadgeCheck, v: certs.length, l: "Certificates" },
          { icon: Award, v: ce, l: "Contact hours earned*" },
        ].map((s) => (
          <div key={s.l} className="bg-void p-5">
            <s.icon className="h-4 w-4 text-phosphor" />
            <dd className="mt-3 font-mono text-[28px] text-bone">{s.v}</dd>
            <dt className="text-[13px] text-faint">{s.l}</dt>
          </div>
        ))}
      </dl>

      {mine.length === 0 ? (
        <div className="mt-12 rounded-3xl border border-dashed border-line-strong p-12 text-center">
          <p className="font-display text-[26px] text-bone">You haven&apos;t enrolled in a course yet.</p>
          <p className="mx-auto mt-3 max-w-md text-mute">
            Start with POCUS Foundations if you&apos;re new to ultrasound, or watch any course&apos;s free preview first.
          </p>
          <ButtonLink href="/courses" className="mt-8" size="lg" iconRight={<ArrowRight className="h-4 w-4" />}>Explore the catalog</ButtonLink>
        </div>
      ) : (
        <>
          {resume && (
            <Reveal className="mt-12">
              <Link href={`/learn/${resume.c.slug}`} className="group grid overflow-hidden rounded-3xl border border-line bg-ink-900/50 transition-colors hover:border-line-strong md:grid-cols-[1.1fr_1fr]">
                <CourseCover course={resume.c} className="rounded-none" />
                <div className="flex flex-col justify-center p-7">
                  <div className="eyebrow text-caliper">Pick up where you left off</div>
                  <div className="mt-3 font-display text-[26px] leading-tight text-bone">{resume.c.title}</div>
                  <div className="mt-2 text-[14.5px] text-mute">
                    Next: {nextLesson(resume.c, resume.e.completedLessonIds)?.title}
                  </div>
                  <ProgressBar value={progressFor(resume.c, resume.e.completedLessonIds)} className="mt-6" />
                  <div className="mt-2 font-mono text-[12px] text-faint">{progressFor(resume.c, resume.e.completedLessonIds)}% complete</div>
                  <span className="mt-6 inline-flex items-center gap-2 text-[15px] text-bone transition-colors group-hover:text-caliper">
                    Resume lesson <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </span>
                </div>
              </Link>
            </Reveal>
          )}

          <h2 className="mt-16 font-display text-[26px] text-bone">My courses</h2>
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {mine.map(({ e, c }) => {
              const cert = certs.find((x) => x.courseId === c.id);
              const att = attempts.filter((a) => a.courseId === c.id);
              const st = courseState(c, e, att, Boolean(cert));
              return (
                <div key={c.id} className="flex flex-col rounded-[14px] border border-line bg-ink-900/50 p-2.5">
                  <Link href={`/learn/${c.slug}`} className="group">
                    <CourseCover course={c} />
                  </Link>
                  <div className="flex flex-1 flex-col px-2.5 pb-2 pt-4">
                    <div className="flex items-center justify-between gap-2">
                      <Tag tone={st.tone}>{st.label}</Tag>
                      <span className="font-mono text-[11px] text-faint">{c.code}</span>
                    </div>
                    <h3 className="mt-3 font-display text-[24px] leading-tight text-bone">{c.title}</h3>
                    <div className="mt-4 flex items-center gap-4 text-[12.5px] text-faint">
                      <span className="flex items-center gap-1.5"><PlayCircle className="h-3.5 w-3.5" />{e.completedLessonIds.length}/{allLessons(c).length} lessons</span>
                      <span className="flex items-center gap-1.5"><Clock3 className="h-3.5 w-3.5" />Access until {formatDate(e.expiresAt, "short")}</span>
                    </div>
                    <ProgressBar value={st.progress} className="mt-4" />
                    <div className="mt-auto flex gap-2 pt-5">
                      {st.key === "certified" && cert ? (
                        <ButtonLink href={`/certificates/${cert.id}`} size="sm" iconLeft={<BadgeCheck className="h-3.5 w-3.5" />}>View certificate</ButtonLink>
                      ) : st.key === "exam" ? (
                        <ButtonLink href={`/learn/${c.slug}/exam`} size="sm" variant="caliper" iconLeft={<Timer className="h-3.5 w-3.5" />}>Take the exam</ButtonLink>
                      ) : (
                        <ButtonLink href={`/learn/${c.slug}`} size="sm" iconRight={<ArrowRight className="h-3.5 w-3.5" />}>{st.progress ? "Continue" : "Start"}</ButtonLink>
                      )}
                      <ButtonLink href={`/courses/${c.slug}`} size="sm" variant="ghost">Details</ButtonLink>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      <h2 className="mt-16 font-display text-[26px] text-bone">Certificates</h2>
      {certs.length === 0 ? (
        <p className="mt-4 flex items-center gap-2 text-[15px] text-mute"><FileQuestion className="h-4 w-4" /> Pass a course exam and your certificate will appear here.</p>
      ) : (
        <ul className="mt-6 divide-y divide-line rounded-2xl border border-line">
          {certs.map((c) => (
            <li key={c.id} className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="text-[16px] text-bone">{c.courseTitle}</div>
                <div className="mt-1 font-mono text-[12px] text-faint">{c.id} · Issued {formatDate(c.issuedAt, "short")} · Passed</div>
              </div>
              <ButtonLink href={`/certificates/${c.id}`} size="sm" variant="secondary" iconRight={<ArrowRight className="h-3.5 w-3.5" />}>Open</ButtonLink>
            </li>
          ))}
        </ul>
      )}
      <p className="mt-10 text-[12px] text-faint">*Contact hours are estimates pending accreditation.</p>
    </Container>
  );
}
