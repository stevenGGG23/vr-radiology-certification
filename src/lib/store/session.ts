"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { buildDemoDb } from "../seed/demo";
import { seedCourses } from "../seed/courses";
import { site } from "../site";
import type { Certificate, Course, Enrollment, ExamAttempt, Order, User } from "../types";

/*
  DEMO-ONLY "backend". Accounts, purchases, progress, exam attempts and
  certificates live in this browser's localStorage. None of this is secure,
  which is fine for a clickable draft. When the real backend lands:
    - signIn/signUp/signOut  -> auth provider (e.g. Supabase Auth, with MFA for admin)
    - purchase               -> Stripe Checkout + webhook creates the enrollment
    - recordAttempt          -> server action that grades on the server (answers never sent to the browser)
    - certificates           -> generated server-side with a public verification record
*/

interface Db {
  users: User[];
  enrollments: Enrollment[];
  attempts: ExamAttempt[];
  certificates: Certificate[];
  orders: Order[];
}

type Result = { ok: true } | { ok: false; error: string };

interface SignUpInput {
  name: string;
  email: string;
  credential: string;
  licenseNumber?: string;
}

interface SessionState {
  db: Db;
  currentUserId: string | null;
  signIn: (email: string) => Result;
  signUp: (input: SignUpInput) => Result;
  signOut: () => void;
  updateProfile: (patch: Partial<Pick<User, "name" | "credential" | "licenseNumber" | "organization">>) => void;
  purchase: (course: Course) => Order | null;
  completeLesson: (courseId: string, lessonId: string, done?: boolean) => void;
  setLastLesson: (courseId: string, lessonId: string) => void;
  recordAttempt: (course: Course, correct: number, total: number) => { attempt: ExamAttempt; certificate?: Certificate } | null;
  grantAccess: (userId: string, courseId: string) => void;
  revokeAccess: (userId: string, courseId: string) => void;
  resetAttempts: (userId: string, courseId: string) => void;
  demoCompleteCourse: (course: Course) => void;
  resetDemo: () => void;
}

const DAY = 86400000;

function newId(prefix: string) {
  return `${prefix}-${crypto.randomUUID().slice(0, 8)}`;
}

function certificateId() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = crypto.getRandomValues(new Uint8Array(8));
  const chars = Array.from(bytes, (b) => alphabet[b % alphabet.length]).join("");
  return `RIA-${chars.slice(0, 4)}-${chars.slice(4)}`;
}

function freshDb(): Db {
  const db = buildDemoDb();
  db.certificates = db.certificates.map((c) => {
    const course = seedCourses.find((x) => x.id === c.courseId);
    return course ? { ...c, courseTitle: course.title, courseCode: course.code, ceHours: course.ceHours } : c;
  });
  return db;
}

function enroll(db: Db, userId: string, courseId: string, accessDays: number): Enrollment[] {
  const existing = db.enrollments.find((e) => e.userId === userId && e.courseId === courseId);
  const now = Date.now();
  const expiresAt = new Date(now + accessDays * DAY).toISOString();
  if (existing) {
    return db.enrollments.map((e) => (e === existing ? { ...e, expiresAt } : e));
  }
  return [
    ...db.enrollments,
    { userId, courseId, purchasedAt: new Date(now).toISOString(), expiresAt, completedLessonIds: [] },
  ];
}

export const useSession = create<SessionState>()(
  persist(
    (set, get) => ({
      db: freshDb(),
      currentUserId: null,

      signIn: (email) => {
        const user = get().db.users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
        if (!user) return { ok: false, error: "We couldn't find an account with that email." };
        set({ currentUserId: user.id });
        return { ok: true };
      },

      signUp: ({ name, email, credential, licenseNumber }) => {
        const { db } = get();
        const clean = email.trim().toLowerCase();
        if (db.users.some((u) => u.email.toLowerCase() === clean)) {
          return { ok: false, error: "An account with that email already exists. Try signing in." };
        }
        const user: User = {
          id: newId("u"),
          name: name.trim(),
          email: clean,
          credential,
          licenseNumber: licenseNumber?.trim() || undefined,
          role: clean === site.demoAdminEmail ? "admin" : "student",
          createdAt: new Date().toISOString(),
        };
        set({ db: { ...db, users: [...db.users, user] }, currentUserId: user.id });
        return { ok: true };
      },

      signOut: () => set({ currentUserId: null }),

      updateProfile: (patch) =>
        set((s) => ({
          db: {
            ...s.db,
            users: s.db.users.map((u) => (u.id === s.currentUserId ? { ...u, ...patch } : u)),
          },
        })),

      purchase: (course) => {
        const { db, currentUserId } = get();
        if (!currentUserId) return null;
        const ids = course.includes?.length ? course.includes : [course.id];
        let enrollments = db.enrollments;
        for (const id of ids) enrollments = enroll({ ...db, enrollments }, currentUserId, id, course.accessDays);
        const order: Order = {
          id: newId("o"),
          userId: currentUserId,
          courseId: course.id,
          amountCents: course.priceCents,
          at: new Date().toISOString(),
          status: "paid",
        };
        set({ db: { ...db, enrollments, orders: [...db.orders, order] } });
        return order;
      },

      completeLesson: (courseId, lessonId, done = true) =>
        set((s) => ({
          db: {
            ...s.db,
            enrollments: s.db.enrollments.map((e) => {
              if (e.userId !== s.currentUserId || e.courseId !== courseId) return e;
              const has = e.completedLessonIds.includes(lessonId);
              if (done === has) return e;
              return {
                ...e,
                completedLessonIds: done
                  ? [...e.completedLessonIds, lessonId]
                  : e.completedLessonIds.filter((x) => x !== lessonId),
              };
            }),
          },
        })),

      setLastLesson: (courseId, lessonId) =>
        set((s) => ({
          db: {
            ...s.db,
            enrollments: s.db.enrollments.map((e) =>
              e.userId === s.currentUserId && e.courseId === courseId ? { ...e, lastLessonId: lessonId } : e,
            ),
          },
        })),

      recordAttempt: (course, correct, total) => {
        const { db, currentUserId } = get();
        const user = db.users.find((u) => u.id === currentUserId);
        if (!user) return null;
        const score = total ? Math.round((correct / total) * 100) : 0;
        const passed = score >= course.exam.passingScore;
        const attempt: ExamAttempt = {
          id: newId("a"),
          userId: user.id,
          courseId: course.id,
          at: new Date().toISOString(),
          score,
          passed,
          correct,
          total,
        };
        let certificate: Certificate | undefined;
        const already = db.certificates.find((c) => c.userId === user.id && c.courseId === course.id);
        if (passed && !already) {
          certificate = {
            id: certificateId(),
            userId: user.id,
            courseId: course.id,
            recipientName: user.name,
            courseTitle: course.title,
            courseCode: course.code,
            ceHours: course.ceHours,
            score,
            issuedAt: attempt.at,
          };
        }
        set({
          db: {
            ...db,
            attempts: [...db.attempts, attempt],
            certificates: certificate ? [...db.certificates, certificate] : db.certificates,
          },
        });
        return { attempt, certificate: certificate ?? already };
      },

      grantAccess: (userId, courseId) =>
        set((s) => ({ db: { ...s.db, enrollments: enroll(s.db, userId, courseId, 365) } })),

      revokeAccess: (userId, courseId) =>
        set((s) => ({
          db: { ...s.db, enrollments: s.db.enrollments.filter((e) => !(e.userId === userId && e.courseId === courseId)) },
        })),

      resetAttempts: (userId, courseId) =>
        set((s) => ({
          db: { ...s.db, attempts: s.db.attempts.filter((a) => !(a.userId === userId && a.courseId === courseId)) },
        })),

      demoCompleteCourse: (course) =>
        set((s) => ({
          db: {
            ...s.db,
            enrollments: s.db.enrollments.map((e) =>
              e.userId === s.currentUserId && e.courseId === course.id
                ? { ...e, completedLessonIds: course.modules.flatMap((m) => m.lessons.map((l) => l.id)) }
                : e,
            ),
          },
        })),

      resetDemo: () => set({ db: freshDb(), currentUserId: null }),
    }),
    {
      name: "ria-session",
      version: 1,
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
      partialize: (s) => ({ db: s.db, currentUserId: s.currentUserId }),
    },
  ),
);

/* ------------------------------------------------------------------ hooks */

export const useHydration = create<{ hydrated: boolean }>(() => ({ hydrated: false }));

export function useCurrentUser() {
  const hydrated = useHydration((s) => s.hydrated);
  const user = useSession((s) => s.db.users.find((u) => u.id === s.currentUserId) ?? null);
  return hydrated ? user : null;
}

export function useEnrollment(courseId: string | undefined) {
  return useSession((s) =>
    courseId ? s.db.enrollments.find((e) => e.userId === s.currentUserId && e.courseId === courseId) : undefined,
  );
}

export function useAttempts(courseId: string | undefined) {
  const userId = useSession((s) => s.currentUserId);
  const attempts = useSession((s) => s.db.attempts);
  return attempts.filter((a) => a.userId === userId && a.courseId === courseId);
}

export function useCertificateFor(courseId: string | undefined) {
  return useSession((s) => s.db.certificates.find((c) => c.userId === s.currentUserId && c.courseId === courseId));
}
