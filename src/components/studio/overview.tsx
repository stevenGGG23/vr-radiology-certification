"use client";

import Link from "next/link";
import { ArrowRight, Plus, Table2, BarChart3 } from "lucide-react";
import { useMemo, useState } from "react";
import { ButtonLink } from "@/components/ui/button";
import { formatDate, formatPrice } from "@/lib/format";
import { useCatalog } from "@/lib/store/catalog";
import { useSession } from "@/lib/store/session";
import { StudioHeader } from "./studio-shell";

const BAR = "#b88a2a"; // validated single-series amber (passes on light and dark surfaces)
const BAR_HOVER = "#d9a93f";

function compact(n: number) {
  return n >= 1000 ? `${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}K` : String(n);
}

function MonthlyChart({ data }: { data: { label: string; value: number; revenue: number }[] }) {
  const [hover, setHover] = useState<number | null>(null);
  const [table, setTable] = useState(false);
  const max = Math.max(4, ...data.map((d) => d.value));
  const step = Math.ceil(max / 4);
  const top = step * 4;
  const W = 640, H = 220, padL = 30, padB = 26, padT = 18;
  const band = (W - padL) / data.length;
  const bw = Math.min(24, band * 0.5);

  return (
    <div className="panel p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-[15px] font-medium text-bone">Enrollments per month</h2>
          <p className="text-[12.5px] text-faint">New course enrollments, all products</p>
        </div>
        <button
          onClick={() => setTable((t) => !t)}
          className="flex items-center gap-1.5 rounded-lg border border-line px-2.5 py-1.5 text-[12px] text-mute hover:text-bone"
          aria-pressed={table}
        >
          {table ? <BarChart3 className="h-3.5 w-3.5" /> : <Table2 className="h-3.5 w-3.5" />}
          {table ? "Chart" : "Table"}
        </button>
      </div>
      {table ? (
        <table className="mt-4 w-full text-left text-[13.5px]">
          <thead className="text-faint"><tr><th className="py-2 font-normal">Month</th><th className="py-2 font-normal">Enrollments</th><th className="py-2 font-normal">Revenue</th></tr></thead>
          <tbody className="divide-y divide-line">
            {data.map((d) => (
              <tr key={d.label}><td className="py-2 text-bone-dim">{d.label}</td><td className="py-2 font-mono text-bone">{d.value}</td><td className="py-2 font-mono text-bone">{formatPrice(d.revenue)}</td></tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div className="relative mt-4">
          <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="Column chart of enrollments per month">
            {[0, 1, 2, 3, 4].map((k) => {
              const y = H - padB - ((H - padB - padT) * k) / 4;
              return (
                <g key={k}>
                  <line x1={padL} x2={W} y1={y} y2={y} stroke="#e3e8ef" strokeWidth={1} />
                  <text x={padL - 8} y={y + 4} textAnchor="end" fontSize={11} fill="#5f6b82" fontFamily="var(--font-plex-mono)">{compact(step * k)}</text>
                </g>
              );
            })}
            {data.map((d, i) => {
              const h = ((H - padB - padT) * d.value) / top;
              const x = padL + band * i + (band - bw) / 2;
              const y = H - padB - h;
              const r = Math.min(4, h);
              const last = i === data.length - 1;
              return (
                <g key={d.label} onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)}>
                  <rect x={padL + band * i} y={padT} width={band} height={H - padB - padT} fill="transparent" />
                  {h > 0 && (
                    <path
                      d={`M${x},${H - padB} V${y + r} Q${x},${y} ${x + r},${y} H${x + bw - r} Q${x + bw},${y} ${x + bw},${y + r} V${H - padB} Z`}
                      fill={hover === i ? BAR_HOVER : BAR}
                    />
                  )}
                  <text x={padL + band * i + band / 2} y={H - 8} textAnchor="middle" fontSize={11} fill="#56667c">{d.label}</text>
                  {last && (
                    <text x={x + bw / 2} y={y - 6} textAnchor="middle" fontSize={11.5} fill="#0d1b2e" fontFamily="var(--font-plex-mono)">{d.value}</text>
                  )}
                </g>
              );
            })}
          </svg>
          {hover !== null && (
            <div
              className="pointer-events-none absolute -translate-x-1/2 rounded-lg border border-line bg-white px-3 py-2 text-[12.5px] shadow-xl"
              style={{ left: `${((padL + (W - padL) / data.length * (hover + 0.5)) / W) * 100}%`, top: 0 }}
            >
              <div className="text-faint">{data[hover].label}</div>
              <div className="flex items-center gap-2 text-bone"><span className="h-2 w-2 rounded-sm" style={{ background: BAR }} />{data[hover].value} enrollments</div>
              <div className="font-mono text-mute">{formatPrice(data[hover].revenue)}</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function StudioOverview() {
  const db = useSession((s) => s.db);
  const courses = useCatalog((s) => s.courses);

  const stats = useMemo(() => {
    const paid = db.orders.filter((o) => o.status === "paid");
    const revenue = paid.reduce((n, o) => n + o.amountCents, 0);
    const students = db.users.filter((u) => u.role === "student").length;
    const passRate = db.attempts.length ? Math.round((db.attempts.filter((a) => a.passed).length / db.attempts.length) * 100) : 0;

    const months: { key: string; label: string; value: number; revenue: number }[] = [];
    const latest = paid.reduce((m, o) => (o.at > m ? o.at : m), "2026-01-01T00:00:00.000Z");
    const end = new Date(latest);
    for (let k = 6; k >= 0; k--) {
      const d = new Date(Date.UTC(end.getUTCFullYear(), end.getUTCMonth() - k, 1));
      months.push({ key: d.toISOString().slice(0, 7), label: d.toLocaleString("en-US", { month: "short", timeZone: "UTC" }), value: 0, revenue: 0 });
    }
    for (const e of db.enrollments) {
      const m = months.find((x) => x.key === e.purchasedAt.slice(0, 7));
      if (m) m.value++;
    }
    for (const o of paid) {
      const m = months.find((x) => x.key === o.at.slice(0, 7));
      if (m) m.revenue += o.amountCents;
    }
    const byCourse = courses
      .filter((c) => !c.includes)
      .map((c) => ({ c, n: db.enrollments.filter((e) => e.courseId === c.id).length }))
      .sort((a, b) => b.n - a.n)
      .slice(0, 5);
    const recent = [...paid].sort((a, b) => (a.at < b.at ? 1 : -1)).slice(0, 6);
    return { revenue, students, passRate, months, byCourse, recent, enrollments: db.enrollments.length, certificates: db.certificates.length };
  }, [db, courses]);

  const topMax = Math.max(1, ...stats.byCourse.map((x) => x.n));

  return (
    <>
      <StudioHeader
        title="Overview"
        description="Sales, enrollments and exam results across the academy."
        actions={<ButtonLink href="/studio/courses/new" iconLeft={<Plus className="h-4 w-4" />}>New course</ButtonLink>}
      />
      <dl className="mt-8 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-line bg-line lg:grid-cols-5">
        {[
          ["Revenue (all time)", formatPrice(stats.revenue)],
          ["Enrollments", stats.enrollments.toLocaleString()],
          ["Students", stats.students.toLocaleString()],
          ["Exam pass rate", `${stats.passRate}%`],
          ["Certificates issued", stats.certificates.toLocaleString()],
        ].map(([l, v]) => (
          <div key={l} className="bg-void p-5">
            <dt className="text-[12.5px] text-faint">{l}</dt>
            <dd className="mt-2 text-[26px] font-bold tracking-tight text-bone">{v}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <MonthlyChart data={stats.months} />
        <div className="panel p-5">
          <h2 className="text-[15px] font-medium text-bone">Most enrolled courses</h2>
          <p className="text-[12.5px] text-faint">All-time enrollments</p>
          <ul className="mt-5 space-y-4">
            {stats.byCourse.map(({ c, n }) => (
              <li key={c.id}>
                <div className="flex justify-between gap-3 text-[13.5px]">
                  <Link href={`/studio/courses/${c.id}`} className="truncate text-bone-dim hover:text-bone">{c.title}</Link>
                  <span className="font-mono text-bone">{n}</span>
                </div>
                <div className="mt-1.5 h-1.5 rounded-full bg-ink-700">
                  <div className="h-full rounded-full" style={{ width: `${(n / topMax) * 100}%`, background: BAR }} />
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="panel mt-6 overflow-hidden">
        <div className="flex items-center justify-between p-5">
          <h2 className="text-[15px] font-medium text-bone">Recent orders</h2>
          <Link href="/studio/students" className="flex items-center gap-1 text-[13px] text-mute hover:text-bone">Students <ArrowRight className="h-3.5 w-3.5" /></Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-left text-[13.5px]">
            <thead className="border-y border-line text-faint">
              <tr><th className="px-5 py-2.5 font-normal">Student</th><th className="px-5 py-2.5 font-normal">Course</th><th className="px-5 py-2.5 font-normal">Date</th><th className="px-5 py-2.5 text-right font-normal">Amount</th></tr>
            </thead>
            <tbody className="divide-y divide-line">
              {stats.recent.map((o) => (
                <tr key={o.id}>
                  <td className="px-5 py-3 text-bone-dim">{db.users.find((u) => u.id === o.userId)?.name ?? "—"}</td>
                  <td className="px-5 py-3 text-bone-dim">{courses.find((c) => c.id === o.courseId)?.title ?? o.courseId}</td>
                  <td className="px-5 py-3 font-mono text-faint">{formatDate(o.at, "short")}</td>
                  <td className="px-5 py-3 text-right font-mono text-bone">{formatPrice(o.amountCents)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
