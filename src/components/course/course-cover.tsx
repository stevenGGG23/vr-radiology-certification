/* eslint-disable @next/next/no-img-element -- covers may be any URL the admin pastes */
import { GraduationCap } from "lucide-react";
import { ceHoursFor } from "@/lib/catalog";
import { cn } from "@/lib/cn";
import type { Course } from "@/lib/types";

/** Circular credit badge laid over course artwork (sized relative to the image). */
export function CeBadge({ course, catalog, className }: { course: Course; catalog?: Course[]; className?: string }) {
  const hours = catalog ? ceHoursFor(course, catalog) : course.ceHours;
  const soon = course.status === "coming-soon";
  return (
    <div className={cn("aspect-square rounded-full bg-white p-[1.2cqw] shadow-[0_6px_24px_rgba(7,21,40,0.35)]", className)} aria-label={`${hours} contact hours`}>
      <div className="flex h-full flex-col overflow-hidden rounded-full border-[0.6cqw] border-[#0b1f3a]">
        <div className="flex flex-1 flex-col items-center justify-end bg-white pb-[0.6cqw]">
          <GraduationCap className="h-[6.5cqw] w-[6.5cqw] text-[#0b1f3a]" strokeWidth={1.6} />
          <span className="text-[6cqw] font-extrabold leading-none tracking-tight text-[#35a3de]">CE</span>
        </div>
        <div className="flex flex-1 flex-col items-center justify-start bg-[#35a3de] pt-[1.4cqw] text-center text-white">
          {soon ? (
            <span className="text-[3.6cqw] font-extrabold uppercase leading-tight">Coming<br />soon</span>
          ) : (
            <>
              <span className="text-[5.4cqw] font-extrabold leading-none">{hours % 1 ? hours.toFixed(1) : hours} HRS</span>
              <span className="mt-[0.6cqw] text-[2.5cqw] font-bold uppercase tracking-wide">Contact hours</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export function CourseCover({
  course,
  catalog,
  className,
  badge = true,
  priority = false,
}: {
  course: Course;
  catalog?: Course[];
  className?: string;
  badge?: boolean;
  priority?: boolean;
}) {
  return (
    <div className={cn("@container relative isolate aspect-[4/3] overflow-hidden rounded-lg bg-[#0b1f3a] transition-shadow duration-500 group-hover:shadow-[0_14px_40px_-12px_rgba(11,31,58,0.45)]", className)}>
      <img
        src={course.cover}
        alt=""
        loading={priority ? "eager" : "lazy"}
        className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
      />
      {badge && <CeBadge course={course} catalog={catalog} className="absolute left-1/2 top-1/2 w-[36%] -translate-x-1/2 -translate-y-1/2" />}
      {course.includes?.length ? (
        <span className="absolute left-3 top-3 rounded bg-[#b58b33] px-2 py-1 text-[11px] font-bold uppercase tracking-wide text-white">Bundle · Save</span>
      ) : null}
      {course.status === "draft" && (
        <span className="absolute left-3 top-3 rounded bg-white/90 px-2 py-1 text-[11px] font-bold uppercase tracking-wide text-[#33445a]">Draft</span>
      )}
    </div>
  );
}
