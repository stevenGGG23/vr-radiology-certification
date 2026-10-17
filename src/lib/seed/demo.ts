import type { Certificate, Enrollment, ExamAttempt, Order, SiteSettings, User } from "../types";
import { site } from "../site";

/*
  Fictional demo records so the Studio has something to show. They aren't real
  people. All of this is replaced by the database once the backend exists.
*/

export const defaultSettings: SiteSettings = {
  announcement: "Now enrolling: Lung & Pleural Ultrasound. Every course includes 12 months of access.",
  announcementOn: true,
  supportEmail: "support@rudyimaging.academy",
  supportPhone: "(000) 000-0000",
  accreditationStatement:
    "Continuing education credit designation is pending. Final contact hours and the accrediting body will be listed here once approved.",
  defaultPassingScore: 80,
  defaultMaxAttempts: 2,
};

const adminUser: User = {
  id: "u-admin",
  name: "Susanna Rudy",
  email: site.demoAdminEmail,
  role: "admin",
  credential: "DNP, ENP",
  createdAt: "2026-01-05T15:00:00.000Z",
};

const names: [string, string, string][] = [
  ["Avery Collins", "FNP-C", "Mercy Urgent Care"],
  ["Jordan Patel", "PA-C", "Lakeside Emergency Group"],
  ["Morgan Reyes", "AG-ACNP", "St. Brigid Medical Center"],
  ["Riley Chen", "MD (PGY-2)", "County Emergency Residency"],
  ["Casey Okafor", "ENP-C", "Northfield ED"],
  ["Taylor Brooks", "RN, BSN", "Flight Program East"],
  ["Quinn Alvarez", "FNP-C", "Rural Health Partners"],
  ["Devon Wright", "PA-C", "Summit Orthopedics"],
  ["Skyler Nguyen", "DNP, FNP", "Valley Critical Care"],
  ["Emerson Hayes", "NP Student", "School of Nursing"],
  ["Rowan Fischer", "AG-ACNP", "University Hospital ICU"],
  ["Harper Diaz", "PA-C", "Coastal Urgent Care"],
];

const courseCycle = ["ria-101", "ria-110", "ria-120", "ria-130", "ria-140", "ria-200", "ria-150", "ria-210", "ria-220"];
const price: Record<string, number> = {
  "ria-101": 12900, "ria-110": 12900, "ria-120": 14900, "ria-130": 12900, "ria-140": 14900,
  "ria-150": 12900, "ria-200": 9900, "ria-210": 9900, "ria-220": 12900,
};

function day(n: number) {
  return new Date(Date.UTC(2026, 3, 1) + n * 86400000).toISOString();
}

export function buildDemoDb() {
  const users: User[] = [adminUser];
  const enrollments: Enrollment[] = [];
  const attempts: ExamAttempt[] = [];
  const certificates: Certificate[] = [];
  const orders: Order[] = [];

  names.forEach(([name, credential, organization], i) => {
    const id = `u-demo-${i + 1}`;
    users.push({
      id, name, credential, organization,
      email: `${name.split(" ")[0].toLowerCase()}@example.com`,
      role: "student",
      createdAt: day(i * 11),
    });
    const count = 1 + (i % 3);
    for (let k = 0; k < count; k++) {
      const courseId = courseCycle[(i + k * 4) % courseCycle.length];
      const at = day(i * 11 + k * 9 + 2);
      enrollments.push({
        userId: id, courseId, purchasedAt: at,
        expiresAt: new Date(new Date(at).getTime() + 365 * 86400000).toISOString(),
        completedLessonIds: [],
      });
      orders.push({ id: `o-${i}-${k}`, userId: id, courseId, amountCents: price[courseId], at, status: "paid" });
      if ((i + k) % 2 === 0) {
        const score = 72 + ((i * 7 + k * 5) % 27);
        const passed = score >= 80;
        attempts.push({
          id: `a-${i}-${k}`, userId: id, courseId, at: day(i * 11 + k * 9 + 20),
          score, passed, correct: Math.round(score / 12.5), total: 8,
        });
        if (passed) {
          certificates.push({
            id: `RIA-DEMO-${1000 + i * 37 + k}`,
            userId: id, courseId, recipientName: name, courseTitle: "", courseCode: courseId.toUpperCase(),
            ceHours: 0, score, issuedAt: day(i * 11 + k * 9 + 20),
          });
        }
      }
    }
  });

  return { users, enrollments, attempts, certificates, orders };
}
