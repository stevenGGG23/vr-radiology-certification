"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import {
  ArrowLeft, ArrowRight, BadgeCheck, Check, CheckCircle2, Circle, FileText, ListVideo, Lock, PlayCircle, Timer, X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { CourseNotFound } from "@/components/course/course-detail";
import { Logo } from "@/components/ui/brand";
import { Button, ButtonLink } from "@/components/ui/button";
import { Container, ProgressBar, Skeleton, Tag } from "@/components/ui/primitives";
import { allLessons, progressFor } from "@/lib/catalog";
import { cn } from "@/lib/cn";
import { site } from "@/lib/site";
import { useCatalog } from "@/lib/store/catalog";
import { useCurrentUser, useHydration, useSession } from "@/lib/store/session";
import type { Course, Enrollment } from "@/lib/types";
import { VideoPlayer } from "./video-player";

function Curriculum({
  course,
  activeId,
  enrollment,
  onPick,
}: {
  course: Course;
  activeId: string;
  enrollment?: Enrollment;
  onPick: (id: string) => void;
}) {
  return (
    <div className="space-y-6">
      {course.modules.map((m, mi) => (
        <div key={m.id}>
          <div className="flex items-baseline gap-3 px-2">
            <span className="font-mono text-[11px] text-faint">{String(mi + 1).padStart(2, "0")}</span>
            <span className="text-[13px] font-medium uppercase tracking-[0.08em] text-mute">{m.title}</span>
          </div>
          <ul className="mt-2 space-y-0.5">
            {m.lessons.map((l) => {
              const done = enrollment?.completedLessonIds.includes(l.id);
              const open = Boolean(enrollment) || l.preview;
              const active = l.id === activeId;
              return (
                <li key={l.id}>
                  <button
                    onClick={() => onPick(l.id)}
                    className={cn(
                      "flex w-full items-start gap-3 rounded-lg px-2.5 py-2.5 text-left text-[14px] transition-colors",
                      active ? "bg-white/[0.07] text-bone" : "text-bone-dim hover:bg-white/[0.04] hover:text-bone",
                    )}
                  >
                    <span className="mt-0.5 shrink-0">
                      {done ? (
                        <CheckCircle2 className="h-4 w-4 text-phosphor" />
                      ) : !open ? (
                        <Lock className="h-4 w-4 text-faint" />
                      ) : active ? (
                        <PlayCircle className="h-4 w-4 text-caliper" />
                      ) : (
                        <Circle className="h-4 w-4 text-faint" />
                      )}
                    </span>
                    <span className="flex-1 leading-snug">
                      {l.title}
                      {l.preview && !enrollment && <span className="ml-2 font-mono text-[10px] uppercase tracking-wider text-phosphor">Free</span>}
                    </span>
                    <span className="font-mono text-[11px] text-faint">{l.durationMin}m</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </div>
  );
}

function ExamCard({ course, enrollment }: { course: Course; enrollment?: Enrollment }) {
  const attempts = useSession((s) => s.db.attempts);
  const certs = useSession((s) => s.db.certificates);
  const userId = useSession((s) => s.currentUserId);
  if (!enrollment) return null;
  const progress = progressFor(course, enrollment.completedLessonIds);
  const mine = attempts.filter((a) => a.userId === userId && a.courseId === course.id);
  const cert = certs.find((c) => c.userId === userId && c.courseId === course.id);
  const left = course.exam.maxAttempts - mine.length;
  return (
    <div className="rounded-xl border border-line bg-ink-950/60 p-4">
      <div className="flex items-center gap-2 text-[14px] text-bone">
        {cert ? <BadgeCheck className="h-4 w-4 text-phosphor" /> : <Timer className="h-4 w-4 text-caliper" />}
        Final exam
      </div>
      {cert ? (
        <>
          <p className="mt-1.5 text-[13px] text-mute">You passed. Nice work.</p>
          <ButtonLink href={`/certificates/${cert.id}`} size="sm" className="mt-3 w-full">View certificate</ButtonLink>
        </>
      ) : progress < 100 ? (
        <p className="mt-1.5 text-[13px] text-mute">Unlocks when every lesson is complete ({progress}% done).</p>
      ) : left > 0 ? (
        <>
          <p className="mt-1.5 text-[13px] text-mute">{left} of {course.exam.maxAttempts} attempts remaining · {course.exam.passingScore}% to pass</p>
          <ButtonLink href={`/learn/${course.slug}/exam`} size="sm" variant="caliper" className="mt-3 w-full">Take the exam</ButtonLink>
        </>
      ) : (
        <p className="mt-1.5 text-[13px] text-doppler-red">No attempts left. Contact support for options.</p>
      )}
    </div>
  );
}

export function CoursePlayer({ slug }: { slug: string }) {
  const router = useRouter();
  const params = useSearchParams();
  const hydrated = useHydration((s) => s.hydrated);
  const courses = useCatalog((s) => s.courses);
  const course = courses.find((c) => c.slug === slug);
  const user = useCurrentUser();
  const enrollment = useSession((s) =>
    course ? s.db.enrollments.find((e) => e.userId === s.currentUserId && e.courseId === course.id) : undefined,
  );
  const completeLesson = useSession((s) => s.completeLesson);
  const setLastLesson = useSession((s) => s.setLastLesson);
  const demoComplete = useSession((s) => s.demoCompleteCourse);
  const [drawer, setDrawer] = useState(false);

  const lessons = useMemo(() => (course ? allLessons(course) : []), [course]);
  const requested = params.get("lesson");
  const activeId =
    (requested && lessons.some((l) => l.id === requested) && requested) ||
    (enrollment?.lastLessonId && lessons.some((l) => l.id === enrollment.lastLessonId) && enrollment.lastLessonId) ||
    (enrollment ? lessons.find((l) => !enrollment.completedLessonIds.includes(l.id))?.id : lessons.find((l) => l.preview)?.id) ||
    lessons[0]?.id;
  const index = lessons.findIndex((l) => l.id === activeId);
  const lesson = lessons[index];

  useEffect(() => {
    if (course && enrollment && activeId && enrollment.lastLessonId !== activeId) setLastLesson(course.id, activeId);
  }, [course, enrollment, activeId, setLastLesson]);

  if (!course) return hydrated ? <CourseNotFound /> : <Container className="py-24"><Skeleton className="h-[60vh]" /></Container>;
  if (course.includes?.length) {
    return (
      <Container className="py-32 text-center">
        <h1 className="font-display text-3xl text-bone">This is a bundle.</h1>
        <p className="mt-3 text-mute">Open any of its courses from My learning.</p>
        <ButtonLink href="/dashboard" className="mt-8">Go to My learning</ButtonLink>
      </Container>
    );
  }
  if (!lesson) {
    return (
      <Container className="py-32 text-center">
        <h1 className="font-display text-3xl text-bone">Lessons are on the way.</h1>
        <p className="mt-3 text-mute">This course doesn&apos;t have any lessons yet.</p>
      </Container>
    );
  }

  const locked = hydrated ? !enrollment && !lesson.preview : !lesson.preview;
  const done = Boolean(enrollment?.completedLessonIds.includes(lesson.id));
  const progress = enrollment ? progressFor(course, enrollment.completedLessonIds) : 0;
  const prev = lessons[index - 1];
  const next = lessons[index + 1];
  const moduleOf = course.modules.find((m) => m.lessons.some((l) => l.id === lesson.id));

  const go = (id: string) => {
    router.push(`/learn/${course.slug}?lesson=${id}`, { scroll: false });
    setDrawer(false);
  };

  const sidebar = (
    <>
      {enrollment ? (
        <div className="mb-6">
          <div className="flex justify-between text-[12.5px] text-mute">
            <span>Course progress</span>
            <span className="font-mono">{progress}%</span>
          </div>
          <ProgressBar value={progress} className="mt-2" />
        </div>
      ) : (
        <div className="mb-6 rounded-xl border border-caliper/30 bg-caliper/[0.05] p-4">
          <p className="text-[13.5px] text-bone-dim">You&apos;re watching a free preview.</p>
          <ButtonLink href={`/checkout/${course.slug}`} size="sm" className="mt-3 w-full">Enroll to unlock all lessons</ButtonLink>
        </div>
      )}
      <Curriculum course={course} activeId={lesson.id} enrollment={enrollment} onPick={go} />
      <div className="mt-6">
        <ExamCard course={course} enrollment={enrollment} />
      </div>
      {site.demoMode && enrollment && progress < 100 && (
        <button onClick={() => demoComplete(course)} className="mt-4 w-full rounded-lg border border-dashed border-caliper/30 px-3 py-2 text-[12px] text-caliper hover:bg-caliper/[0.05]">
          Draft tool: mark all lessons complete
        </button>
      )}
    </>
  );

  return (
    <div className="flex min-h-[100svh] flex-col">
      <header className="sticky top-0 z-30 border-b border-line bg-void/85 backdrop-blur-xl">
        <div className="flex h-14 items-center gap-4 px-4 sm:px-6">
          <Logo compact />
          <span className="h-5 w-px bg-line-strong" />
          <Link href={`/courses/${course.slug}`} className="min-w-0 truncate text-[14px] text-bone-dim hover:text-bone">
            <span className="mr-2 font-mono text-[11px] text-faint">{course.code}</span>
            {course.title}
          </Link>
          <div className="ml-auto flex items-center gap-2">
            {enrollment && <span className="hidden font-mono text-[12px] text-faint sm:inline">{progress}%</span>}
            <button onClick={() => setDrawer(true)} className="flex items-center gap-1.5 rounded-lg border border-line-strong px-2.5 py-1.5 text-[13px] text-bone-dim lg:hidden">
              <ListVideo className="h-4 w-4" /> Lessons
            </button>
            <ButtonLink href={user ? "/dashboard" : "/courses"} variant="ghost" size="sm" className="hidden sm:inline-flex">
              {user ? "My learning" : "Catalog"}
            </ButtonLink>
          </div>
        </div>
      </header>

      <div className="mx-auto grid w-full max-w-[1500px] flex-1 lg:grid-cols-[1fr_360px]">
        <main className="px-4 py-6 sm:px-8 sm:py-8">
          <VideoPlayer
            course={course}
            lesson={lesson}
            locked={locked}
            isAdmin={user?.role === "admin"}
            onEnded={() => enrollment && completeLesson(course.id, lesson.id)}
          />
          <div className="mt-7 flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="eyebrow">
                {moduleOf?.title} · Lesson {index + 1} of {lessons.length}
              </div>
              <h1 className="mt-2 font-display text-[clamp(1.5rem,2.6vw,2rem)] leading-tight text-bone">{lesson.title}</h1>
              <div className="mt-2 flex flex-wrap gap-2">
                <Tag>{lesson.durationMin} min</Tag>
                {lesson.preview && <Tag tone="phosphor">Free preview</Tag>}
                {done && <Tag tone="phosphor"><Check className="h-3 w-3" /> Completed</Tag>}
              </div>
            </div>
            {enrollment && (
              <Button
                variant={done ? "secondary" : "primary"}
                onClick={() => {
                  completeLesson(course.id, lesson.id, !done);
                  if (!done && next) go(next.id);
                }}
                iconLeft={done ? <Check className="h-4 w-4 text-phosphor" /> : undefined}
                iconRight={!done && next ? <ArrowRight className="h-4 w-4" /> : undefined}
              >
                {done ? "Completed" : next ? "Complete & next" : "Mark complete"}
              </Button>
            )}
          </div>

          <div className="mt-8 grid gap-6 border-t border-line pt-8 xl:grid-cols-[1.4fr_1fr]">
            <section>
              <h2 className="text-[15px] font-medium text-bone">Lesson notes</h2>
              <p className="mt-2 text-[15px] leading-relaxed text-mute">
                {lesson.summary || "Notes for this lesson will appear here: key images, measurements and clinical pearls from the video."}
              </p>
            </section>
            <section>
              <h2 className="text-[15px] font-medium text-bone">Resources</h2>
              {lesson.resources.length ? (
                <ul className="mt-2 space-y-2">
                  {lesson.resources.map((r) => (
                    <li key={r.url}>
                      <a href={r.url} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-[14.5px] text-bone-dim hover:text-caliper">
                        <FileText className="h-4 w-4" /> {r.label}
                      </a>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-2 text-[14px] text-faint">No downloads for this lesson.</p>
              )}
            </section>
          </div>

          <nav className="mt-10 flex items-center justify-between gap-3 border-t border-line pt-6">
            {prev ? (
              <Button variant="ghost" onClick={() => go(prev.id)} iconLeft={<ArrowLeft className="h-4 w-4" />}>
                <span className="hidden sm:inline">{prev.title}</span>
                <span className="sm:hidden">Previous</span>
              </Button>
            ) : <span />}
            {next && (
              <Button variant="ghost" onClick={() => go(next.id)} iconRight={<ArrowRight className="h-4 w-4" />}>
                <span className="hidden sm:inline">{next.title}</span>
                <span className="sm:hidden">Next</span>
              </Button>
            )}
          </nav>
        </main>

        <aside className="hidden border-l border-line lg:block">
          <div className="no-scrollbar sticky top-14 max-h-[calc(100svh-3.5rem)] overflow-y-auto p-6">{sidebar}</div>
        </aside>
      </div>

      <AnimatePresence>
        {drawer && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-40 bg-black/60 lg:hidden" onClick={() => setDrawer(false)} />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed inset-y-0 right-0 z-50 w-[min(92vw,380px)] overflow-y-auto border-l border-line bg-ink-950 p-5 lg:hidden"
            >
              <div className="mb-5 flex items-center justify-between">
                <span className="text-[15px] text-bone">Course contents</span>
                <button onClick={() => setDrawer(false)} aria-label="Close" className="text-faint hover:text-bone"><X className="h-5 w-5" /></button>
              </div>
              {sidebar}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
