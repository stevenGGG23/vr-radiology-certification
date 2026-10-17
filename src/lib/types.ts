/*
  Domain model. These shapes are written to map 1:1 onto database tables later
  (courses, modules, lessons, questions, users, enrollments, exam_attempts,
  certificates, orders) so the draft's local store can be swapped for a real
  backend without touching the UI.
*/

export type CategoryId =
  | "ultrasound"
  | "radiography"
  | "ct"
  | "procedures"
  | "simulation"
  | "bundle";

export type Level = "Foundational" | "Intermediate" | "Advanced";

export type CourseStatus = "published" | "draft" | "coming-soon";

export interface Lesson {
  id: string;
  title: string;
  durationMin: number;
  /** MP4/HLS URL or provider playback ID. Empty = video not uploaded yet. */
  videoUrl: string;
  /** Free preview lessons are watchable without purchase. */
  preview: boolean;
  summary: string;
  resources: { label: string; url: string }[];
}

export interface Module {
  id: string;
  title: string;
  lessons: Lesson[];
}

export interface Question {
  id: string;
  prompt: string;
  choices: string[];
  answerIndex: number;
  explanation: string;
}

export interface ExamConfig {
  passingScore: number; // percent
  maxAttempts: number;
  timeLimitMin: number;
  questions: Question[];
}

export interface Course {
  id: string;
  slug: string;
  code: string;
  title: string;
  subtitle: string;
  category: CategoryId;
  level: Level;
  status: CourseStatus;
  featured: boolean;
  priceCents: number;
  compareAtCents?: number;
  ceHours: number;
  accessDays: number;
  cover: string;
  /** Short line shown in the cover overlay, e.g. "C5-2 · ABD". */
  coverLabel: string;
  description: string;
  outcomes: string[];
  audience: string[];
  modules: Module[];
  exam: ExamConfig;
  /** For bundles: the course ids this purchase unlocks. */
  includes?: string[];
  updatedAt: string;
}

export type Role = "student" | "admin";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  credential: string;
  licenseNumber?: string;
  organization?: string;
  createdAt: string;
}

export interface Enrollment {
  userId: string;
  courseId: string;
  purchasedAt: string;
  expiresAt: string;
  completedLessonIds: string[];
  lastLessonId?: string;
}

export interface ExamAttempt {
  id: string;
  userId: string;
  courseId: string;
  at: string;
  score: number;
  passed: boolean;
  correct: number;
  total: number;
}

export interface Certificate {
  id: string;
  userId: string;
  courseId: string;
  recipientName: string;
  courseTitle: string;
  courseCode: string;
  ceHours: number;
  score: number;
  issuedAt: string;
}

export interface Order {
  id: string;
  userId: string;
  courseId: string;
  amountCents: number;
  at: string;
  status: "paid" | "refunded";
}

export interface SiteSettings {
  announcement: string;
  announcementOn: boolean;
  supportEmail: string;
  supportPhone: string;
  accreditationStatement: string;
  defaultPassingScore: number;
  defaultMaxAttempts: number;
}
