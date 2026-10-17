/* eslint-disable @next/next/no-img-element */
"use client";

import Link from "next/link";
import { Copy, Eye, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { useState } from "react";
import { ButtonLink } from "@/components/ui/button";
import { Tag } from "@/components/ui/primitives";
import { allLessons } from "@/lib/catalog";
import { formatDate, formatPrice } from "@/lib/format";
import { categories } from "@/lib/site";
import { useCatalog } from "@/lib/store/catalog";
import { useSession } from "@/lib/store/session";
import type { Course } from "@/lib/types";
import { StudioHeader } from "./studio-shell";

const statusTone = { published: "phosphor", draft: "default", "coming-soon": "caliper" } as const;
const statusLabel = { published: "Published", draft: "Draft", "coming-soon": "Coming soon" };

export function StudioCourseList() {
  const courses = useCatalog((s) => s.courses);
  const save = useCatalog((s) => s.saveCourse);
  const remove = useCatalog((s) => s.deleteCourse);
  const enrollments = useSession((s) => s.db.enrollments);
  const [q, setQ] = useState("");
  const [confirm, setConfirm] = useState<string | null>(null);

  const list = courses.filter((c) => !q || `${c.title} ${c.code}`.toLowerCase().includes(q.toLowerCase()));

  const duplicate = (c: Course) => {
    const id = `c-${crypto.randomUUID().slice(0, 8)}`;
    save({ ...structuredClone(c), id, slug: `${c.slug}-copy`, code: `${c.code}-COPY`, title: `${c.title} (copy)`, status: "draft", featured: false });
  };

  return (
    <>
      <StudioHeader
        title="Courses"
        description="Create, edit and publish courses. Changes go live on the site as soon as you save."
        actions={<ButtonLink href="/studio/courses/new" iconLeft={<Plus className="h-4 w-4" />}>New course</ButtonLink>}
      />
      <div className="relative mt-8 max-w-sm">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-faint" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search courses" aria-label="Search courses" className="h-10 w-full rounded-lg border border-line-strong bg-ink-900/70 pl-10 pr-3 text-[14px] text-bone placeholder:text-faint focus:border-caliper/60 focus:outline-none" />
      </div>
      <div className="panel mt-5 overflow-x-auto">
        <table className="w-full min-w-[820px] text-left text-[13.5px]">
          <thead className="border-b border-line text-faint">
            <tr>
              <th className="px-4 py-3 font-normal">Course</th>
              <th className="px-4 py-3 font-normal">Status</th>
              <th className="px-4 py-3 font-normal">Price</th>
              <th className="px-4 py-3 font-normal">Lessons</th>
              <th className="px-4 py-3 font-normal">Students</th>
              <th className="px-4 py-3 font-normal">Updated</th>
              <th className="px-4 py-3 text-right font-normal">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {list.map((c) => (
              <tr key={c.id} className="group">
                <td className="px-4 py-3">
                  <Link href={`/studio/courses/${c.id}`} className="flex items-center gap-3">
                    <img src={c.cover} alt="" className="h-10 w-14 shrink-0 rounded-md object-cover" />
                    <span>
                      <span className="block text-[14.5px] text-bone group-hover:text-caliper">{c.title}</span>
                      <span className="font-mono text-[11px] text-faint">{c.code} · {categories.find((x) => x.id === c.category)?.short}</span>
                    </span>
                  </Link>
                </td>
                <td className="px-4 py-3"><Tag tone={statusTone[c.status]}>{statusLabel[c.status]}</Tag></td>
                <td className="px-4 py-3 font-mono text-bone">{formatPrice(c.priceCents)}</td>
                <td className="px-4 py-3 font-mono text-bone-dim">{c.includes ? `${c.includes.length} courses` : allLessons(c).length}</td>
                <td className="px-4 py-3 font-mono text-bone-dim">{enrollments.filter((e) => e.courseId === c.id).length}</td>
                <td className="px-4 py-3 font-mono text-faint">{formatDate(c.updatedAt, "short")}</td>
                <td className="px-4 py-3">
                  {confirm === c.id ? (
                    <div className="flex items-center justify-end gap-2 text-[12.5px]">
                      <span className="text-doppler-red">Delete for good?</span>
                      <button onClick={() => { remove(c.id); setConfirm(null); }} className="rounded-md bg-doppler-red px-2 py-1 text-ink-950">Delete</button>
                      <button onClick={() => setConfirm(null)} className="px-2 py-1 text-mute hover:text-bone">Cancel</button>
                    </div>
                  ) : (
                    <div className="flex justify-end gap-1">
                      <Link href={`/studio/courses/${c.id}`} title="Edit" className="rounded-md p-2 text-mute hover:bg-white/[0.05] hover:text-bone"><Pencil className="h-4 w-4" /></Link>
                      <Link href={`/courses/${c.slug}`} target="_blank" title="View on site" className="rounded-md p-2 text-mute hover:bg-white/[0.05] hover:text-bone"><Eye className="h-4 w-4" /></Link>
                      <button onClick={() => duplicate(c)} title="Duplicate" className="rounded-md p-2 text-mute hover:bg-white/[0.05] hover:text-bone"><Copy className="h-4 w-4" /></button>
                      <button onClick={() => setConfirm(c.id)} title="Delete" className="rounded-md p-2 text-mute hover:bg-doppler-red/10 hover:text-doppler-red"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {list.length === 0 && <p className="p-6 text-mute">No courses match.</p>}
      </div>
    </>
  );
}
