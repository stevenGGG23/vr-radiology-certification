"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { buildDemoDb } from "../seed/demo";
import { seedCourses } from "../seed/courses";
import { site } from "../site";
import type { Certificate, Course, EmailEvent, EmailMessage, Enrollment, ExamAttempt, Order, PaymentMethod, Role, User } from "../types";

/*
  DEMO-ONLY "backend". Accounts, purchases, progress, exam attempts and
  certificates live in this browser's localStorage. None of this is secure,
  which is fine for a clickable draft. When the real backend lands:
    - signIn/signUp/signOut  -> auth provider (e.g. Supabase Auth, with MFA for admin)
    - placeOrder/refundOrder -> Stripe Checkout + webhooks create and remove enrollments
    - emails                 -> sent by the server from those same events (Resend or Postmark)
    - recordAttempt          -> server action that grades on the server (answers never sent to the browser)
    - certificates           -> generated server-side with a public verification record
*/

interface Db {
  users: User[];
  enrollments: Enrollment[];
  attempts: ExamAttempt[];
  certificates: Certificate[];
  orders: Order[];
  /** Draft outbox: what the site would have emailed. Shown in Studio → Emails. */
  emails: EmailMessage[];
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
  /** Sign in with an identity verified elsewhere (Google). Creates the account on first visit. */
  signInWithProvider: (identity: { name?: string | null; email: string; role?: Role }) => void;
  signOut: () => void;
  updateProfile: (patch: Partial<Pick<User, "name" | "credential" | "licenseNumber" | "organization">>) => void;
  /** One checkout: an order per course, one receipt email. */
  placeOrder: (courses: Course[], opts: { method: PaymentMethod; discountRate?: number }) => Order[];
  refundOrder: (orderId: string, courses: Course[]) => void;
  completeLesson: (courseId: string, lessonId: string, done?: boolean) => void;
  saveWatchProgress: (courseId: string, lessonId: string, seconds: number) => void;
  setLastLesson: (courseId: string, lessonId: string) => void;
  recordAttempt: (course: Course, correct: number, total: number) => { attempt: ExamAttempt; certificate?: Certificate } | null;
  grantAccess: (userId: string, course: Course) => void;
  revokeAccess: (userId: string, course: Course) => void;
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
  return `SVR-${chars.slice(0, 4)}-${chars.slice(4)}`;
}

function freshDb(): Db {
  const db: Db = { ...buildDemoDb(), emails: [] };
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

/** Records an automatic email for a user. In production the server sends it instead. */
function withEmail(db: Db, user: User | undefined, event: EmailEvent): Db {
  if (!user) return db;
  const message = { ...event, id: newId("e"), userId: user.id, to: user.email, at: new Date().toISOString() } as EmailMessage;
  return { ...db, emails: [...db.emails, message] };
}

/** The courses an order unlocks (a bundle unlocks each course it includes). */
function unlockedIds(course: Course) {
  return course.includes?.length ? course.includes : [course.id];
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
        const next = { ...db, users: [...db.users, user] };
        set({ db: withEmail(next, user, { template: "welcome", data: { name: user.name } }), currentUserId: user.id });
        return { ok: true };
      },

      signInWithProvider: ({ name, email, role }) => {
        const { db } = get();
        const clean = email.trim().toLowerCase();
        const existing = db.users.find((u) => u.email.toLowerCase() === clean);
        if (existing) {
          const updated: User = { ...existing, role: role ?? existing.role };
          set({ db: { ...db, users: db.users.map((u) => (u.id === existing.id ? updated : u)) }, currentUserId: existing.id });
          return;
        }
        const user: User = {
          id: newId("u"),
          name: name?.trim() || clean.split("@")[0],
          email: clean,
          credential: "",
          role: role ?? "student",
          createdAt: new Date().toISOString(),
        };
        const next = { ...db, users: [...db.users, user] };
        set({ db: withEmail(next, user, { template: "welcome", data: { name: user.name } }), currentUserId: user.id });
      },

      signOut: () => set({ currentUserId: null }),

      updateProfile: (patch) =>
        set((s) => ({
          db: {
            ...s.db,
            users: s.db.users.map((u) => (u.id === s.currentUserId ? { ...u, ...patch } : u)),
          },
        })),

      placeOrder: (courses, { method, discountRate = 0 }) => {
        const { db, currentUserId } = get();
        const user = db.users.find((u) => u.id === currentUserId);
        if (!user || courses.length === 0) return [];
        const at = new Date().toISOString();
        let enrollments = db.enrollments;
        const orders: Order[] = courses.map((course) => {
          for (const id of unlockedIds(course)) enrollments = enroll({ ...db, enrollments }, user.id, id, course.accessDays);
          const amountCents = Math.round(course.priceCents * (1 - discountRate));
          return { id: newId("o"), userId: user.id, courseId: course.id, amountCents, at, status: "paid", method };
        });
        const subtotal = courses.reduce((n, c) => n + c.priceCents, 0);
        const totalCents = orders.reduce((n, o) => n + o.amountCents, 0);
        const next = { ...db, enrollments, orders: [...db.orders, ...orders] };
        set({
          db: withEmail(next, user, {
            template: "receipt",
            data: {
              name: user.name,
              orderIds: orders.map((o) => o.id),
              items: courses.map((c) => ({ title: c.title, code: c.code, slug: c.slug, priceCents: c.priceCents, accessDays: c.accessDays })),
              discountCents: subtotal - totalCents,
              totalCents,
              method,
            },
          }),
        });
        return orders;
      },

      refundOrder: (orderId, courses) => {
        const { db } = get();
        const order = db.orders.find((o) => o.id === orderId);
        if (!order || order.status === "refunded") return;
        const course = courses.find((c) => c.id === order.courseId);
        const user = db.users.find((u) => u.id === order.userId);
        // Keep access that another paid order still covers (e.g. a course also bought on its own).
        const stillPaid = new Set(
          db.orders
            .filter((o) => o.userId === order.userId && o.id !== orderId && o.status === "paid")
            .flatMap((o) => {
              const c = courses.find((x) => x.id === o.courseId);
              return c ? unlockedIds(c) : [o.courseId];
            }),
        );
        const remove = (course ? unlockedIds(course) : [order.courseId]).filter((id) => !stillPaid.has(id));
        const next: Db = {
          ...db,
          orders: db.orders.map((o) => (o.id === orderId ? { ...o, status: "refunded", refundedAt: new Date().toISOString() } : o)),
          enrollments: db.enrollments.filter((e) => !(e.userId === order.userId && remove.includes(e.courseId))),
        };
        set({
          db: withEmail(next, user, {
            template: "refund",
            data: { name: user?.name ?? "", orderId, courseTitle: course?.title ?? order.courseId, amountCents: order.amountCents, method: order.method ?? "card" },
          }),
        });
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

      saveWatchProgress: (courseId, lessonId, seconds) =>
        set((s) => ({
          db: {
            ...s.db,
            enrollments: s.db.enrollments.map((e) => {
              if (e.userId !== s.currentUserId || e.courseId !== courseId) return e;
              const before = e.watchedSeconds?.[lessonId] ?? 0;
              if (seconds <= before) return e;
              return { ...e, watchedSeconds: { ...e.watchedSeconds, [lessonId]: Math.round(seconds * 10) / 10 } };
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
        const next = {
          ...db,
          attempts: [...db.attempts, attempt],
          certificates: certificate ? [...db.certificates, certificate] : db.certificates,
        };
        set({
          db: certificate
            ? withEmail(next, user, {
                template: "certificate",
                data: { name: user.name, courseTitle: course.title, courseCode: course.code, certificateId: certificate.id, ceHours: course.ceHours },
              })
            : next,
        });
        return { attempt, certificate: certificate ?? already };
      },

      grantAccess: (userId, course) =>
        set((s) => {
          const user = s.db.users.find((u) => u.id === userId);
          let enrollments = s.db.enrollments;
          for (const id of unlockedIds(course)) enrollments = enroll({ ...s.db, enrollments }, userId, id, course.accessDays);
          return {
            db: withEmail({ ...s.db, enrollments }, user, {
              template: "access_granted",
              data: { name: user?.name ?? "", courseTitle: course.title, slug: course.slug, accessDays: course.accessDays },
            }),
          };
        }),

      revokeAccess: (userId, course) =>
        set((s) => {
          const user = s.db.users.find((u) => u.id === userId);
          const enrollments = s.db.enrollments.filter((e) => !(e.userId === userId && e.courseId === course.id));
          return {
            db: withEmail({ ...s.db, enrollments }, user, { template: "access_revoked", data: { name: user?.name ?? "", courseTitle: course.title } }),
          };
        }),

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
      // Bump to reset everyone's demo data when the seed changes.
      version: 3,
      migrate: (persisted, version) => {
        // v3 only added the email outbox, so keep existing accounts and progress.
        const old = persisted as { db?: Omit<Db, "emails">; currentUserId?: string | null } | undefined;
        if (version === 2 && old?.db) return { db: { ...old.db, emails: [] }, currentUserId: old.currentUserId ?? null };
        return { db: freshDb(), currentUserId: null };
      },
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
