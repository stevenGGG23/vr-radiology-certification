"use client";

import { AnimatePresence, motion } from "motion/react";
import { BadgeCheck, Receipt, RotateCcw, Search, UserPlus, X } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/form";
import { ProgressBar, Tag } from "@/components/ui/primitives";
import { progressFor } from "@/lib/catalog";
import { formatDate, formatPriceUSD, initials } from "@/lib/format";
import { useCatalog } from "@/lib/store/catalog";
import { useSession } from "@/lib/store/session";
import { StudioHeader } from "./studio-shell";

export function StudioStudents() {
  const db = useSession((s) => s.db);
  const grant = useSession((s) => s.grantAccess);
  const revoke = useSession((s) => s.revokeAccess);
  const resetAttempts = useSession((s) => s.resetAttempts);
  const refund = useSession((s) => s.refundOrder);
  const courses = useCatalog((s) => s.courses);
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState<string | null>(null);
  const [grantId, setGrantId] = useState("");

  const students = useMemo(
    () =>
      db.users
        .filter((u) => u.role === "student")
        .filter((u) => !q || `${u.name} ${u.email} ${u.organization ?? ""}`.toLowerCase().includes(q.toLowerCase())),
    [db.users, q],
  );
  const user = db.users.find((u) => u.id === selected);
  const singleCourses = courses.filter((c) => !c.includes);

  return (
    <>
      <StudioHeader title="Students" description="Look up a learner, grant or remove access, and reset exam attempts." />
      <div className="relative mt-8 max-w-sm">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-faint" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name, email or organization" aria-label="Search students" className="h-10 w-full rounded-lg border border-line-strong bg-ink-900/70 pl-10 pr-3 text-[14px] text-bone placeholder:text-faint focus:border-caliper/60 focus:outline-none" />
      </div>
      <div className="panel mt-5 overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-[13.5px]">
          <thead className="border-b border-line text-faint">
            <tr>
              <th className="px-4 py-3 font-normal">Student</th>
              <th className="px-4 py-3 font-normal">Profession</th>
              <th className="px-4 py-3 font-normal">Courses</th>
              <th className="px-4 py-3 font-normal">Certificates</th>
              <th className="px-4 py-3 font-normal">Joined</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {students.map((u) => (
              <tr key={u.id} onClick={() => setSelected(u.id)} className="cursor-pointer hover:bg-white/[0.03]">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <span className="grid h-8 w-8 place-items-center rounded-full bg-ink-700 font-mono text-[11px] text-bone-dim">{initials(u.name)}</span>
                    <span>
                      <span className="block text-bone">{u.name}</span>
                      <span className="text-[12px] text-faint">{u.email}</span>
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3 text-bone-dim">{u.credential}</td>
                <td className="px-4 py-3 font-mono text-bone-dim">{db.enrollments.filter((e) => e.userId === u.id).length}</td>
                <td className="px-4 py-3 font-mono text-bone-dim">{db.certificates.filter((c) => c.userId === u.id).length}</td>
                <td className="px-4 py-3 font-mono text-faint">{formatDate(u.createdAt, "short")}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {students.length === 0 && <p className="p-6 text-mute">No students match.</p>}
      </div>

      <AnimatePresence>
        {user && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-40 bg-black/60" onClick={() => setSelected(null)} />
            <motion.aside
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 32, stiffness: 300 }}
              className="fixed inset-y-0 right-0 z-50 w-[min(96vw,520px)] overflow-y-auto border-l border-line bg-ink-950 p-6"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="font-display text-[24px] leading-tight text-bone">{user.name}</h2>
                  <p className="text-[13.5px] text-mute">{user.email}</p>
                  <p className="mt-1 text-[13px] text-faint">{user.credential}{user.organization ? ` · ${user.organization}` : ""}{user.licenseNumber ? ` · Lic. ${user.licenseNumber}` : ""}</p>
                </div>
                <button onClick={() => setSelected(null)} aria-label="Close" className="text-faint hover:text-bone"><X className="h-5 w-5" /></button>
              </div>

              <div className="mt-6 rounded-xl border border-line p-4">
                <div className="text-[13.5px] text-bone">Grant access to a course</div>
                <p className="text-[12px] text-faint">For comps, group seats, or fixing a payment issue.</p>
                <div className="mt-3 flex gap-2">
                  <Select value={grantId} onChange={(e) => setGrantId(e.target.value)} className="h-10 text-[13.5px]">
                    <option value="">Choose a course…</option>
                    {singleCourses.filter((c) => !db.enrollments.some((e) => e.userId === user.id && e.courseId === c.id)).map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
                  </Select>
                  <Button
                    disabled={!grantId}
                    onClick={() => {
                      const course = courses.find((c) => c.id === grantId);
                      if (course) grant(user.id, course);
                      setGrantId("");
                    }} iconLeft={<UserPlus className="h-4 w-4" />}>Grant</Button>
                </div>
              </div>

              <h3 className="mt-8 text-[14px] font-medium text-bone">Enrollments</h3>
              <ul className="mt-3 space-y-3">
                {db.enrollments.filter((e) => e.userId === user.id).map((e) => {
                  const c = courses.find((x) => x.id === e.courseId);
                  if (!c) return null;
                  const atts = db.attempts.filter((a) => a.userId === user.id && a.courseId === c.id);
                  const cert = db.certificates.find((x) => x.userId === user.id && x.courseId === c.id);
                  return (
                    <li key={c.id} className="rounded-xl border border-line p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="text-[14.5px] text-bone">{c.title}</div>
                          <div className="font-mono text-[11.5px] text-faint">Enrolled {formatDate(e.purchasedAt, "short")} · expires {formatDate(e.expiresAt, "short")}</div>
                        </div>
                        {cert && <Tag tone="phosphor"><BadgeCheck className="h-3 w-3" /> Certified</Tag>}
                      </div>
                      <ProgressBar value={progressFor(c, e.completedLessonIds)} className="mt-3" />
                      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-[12.5px]">
                        <span className="text-mute">
                          Exam attempts: <span className="font-mono text-bone">{atts.length}/{c.exam.maxAttempts}</span>
                          {atts.length > 0 && <span className="text-faint"> · last {atts[atts.length - 1].score}%</span>}
                        </span>
                        <span className="flex gap-1">
                          {atts.length > 0 && !cert && (
                            <button onClick={() => resetAttempts(user.id, c.id)} className="flex items-center gap-1 rounded-md px-2 py-1 text-caliper hover:bg-caliper/10">
                              <RotateCcw className="h-3.5 w-3.5" /> Reset attempts
                            </button>
                          )}
                          <button onClick={() => revoke(user.id, c)} className="rounded-md px-2 py-1 text-faint hover:bg-doppler-red/10 hover:text-doppler-red">Remove access</button>
                        </span>
                      </div>
                    </li>
                  );
                })}
                {db.enrollments.every((e) => e.userId !== user.id) && <li className="text-[13.5px] text-mute">No enrollments.</li>}
              </ul>

              <h3 className="mt-8 text-[14px] font-medium text-bone">Orders</h3>
              <ul className="mt-3 divide-y divide-line rounded-xl border border-line">
                {[...db.orders.filter((o) => o.userId === user.id)].reverse().map((o) => {
                  const c = courses.find((x) => x.id === o.courseId);
                  return (
                    <li key={o.id} className="flex items-center gap-3 p-3.5 text-[13.5px]">
                      <Receipt className="h-4 w-4 shrink-0 text-faint" />
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-bone">{c?.title ?? o.courseId}</div>
                        <div className="font-mono text-[11.5px] text-faint">{o.id} · {formatDate(o.at, "short")}</div>
                      </div>
                      <span className="font-mono text-bone">{formatPriceUSD(o.amountCents).replace(" USD", "")}</span>
                      {o.status === "refunded" ? (
                        <Tag>Refunded</Tag>
                      ) : (
                        <button
                          onClick={() => {
                            if (window.confirm(`Refund ${formatPriceUSD(o.amountCents)} and remove access to ${c?.title ?? "this course"}?`)) refund(o.id, courses);
                          }}
                          className="rounded-md px-2 py-1 text-[12.5px] text-faint hover:bg-doppler-red/10 hover:text-doppler-red"
                        >
                          Refund
                        </button>
                      )}
                    </li>
                  );
                })}
                {db.orders.every((o) => o.userId !== user.id) && <li className="p-3.5 text-[13.5px] text-mute">No orders.</li>}
              </ul>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
